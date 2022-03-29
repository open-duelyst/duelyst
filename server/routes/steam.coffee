os = require 'os'
express = require 'express'
Promise = require 'bluebird'
config = require 'config/config'
UsersModule = require 'server/lib/data_access/users'
FirebasePromises = require '../lib/firebase_promises.coffee'
DuelystFirebase = require '../lib/duelyst_firebase_module'
InventoryModule = require 'server/lib/data_access/inventory'
ShopModule = require 'server/lib/data_access/shop'
knex = require 'server/lib/data_access/knex'
DataAccessHelpers = require 'server/lib/data_access/helpers'
Steam = require 'server/lib/steam'
Logger = require 'app/common/logger'
Errors = require 'server/lib/custom_errors'
t = require 'tcomb-validation'
validators = require 'server/validators'
config = require 'config/config'
isSignedIn = require 'server/middleware/signed_in'
mail = require '../mailer'
Promise.promisifyAll(mail)

router = express.Router()

router.post "/steam/init_txn", isSignedIn, (req, res, next) ->
	result = t.validate(req.body, validators.steamInitTxn)
	if not result.isValid()
		return res.status(400).json(result.errors)

	user_id = req.user.d.id
	steam_ticket = result.value.steam_ticket
	product_sku = result.value.product_sku
	sandbox = config.get('steam.sandbox')

	return Steam.authenticateUserTicket(steam_ticket)
	.then (steamId) ->
		steamProduct = ShopModule.steamProductDataForSKU(product_sku)
		return Steam.initTxn({
			sandbox: sandbox
			steamId: steamId
			language: 'EN'
			currency: 'USD'
			items: [steamProduct]
		})
	.then (txn) ->
		# append callback url to steamurl
		if config.isDevelopment()
			apiUrl = 'http://localhost:5000'
		else
			apiUrl = config.get('api')
		if !txn.steamUrl?
			txn.steamUrl = "https://store.steampowered.com/checkout/approvetxn/#{txn.transid}/"
			txn.steamUrl += "?returnurl=#{apiUrl}/steam/finalize_txn?txn=#{txn.orderid}"
		else
			txn.steamurl += "?returnurl=#{apiUrl}/steam/finalize_txn?txn=#{txn.orderid}"
		return res.json(txn)
	.catch (e) ->
		Logger.module("STEAM").error "#{e.message}".red
		if e.steamerror
			Logger.module("STEAM").error "steam error: #{e.steamerror}".red
		
		# Send email alert
		txnInfo = {
			userId: user_id,
			productSku: product_sku
		}
		serverInfo = {
			hostname: os.hostname()
			environment: config.get('env')
		}
		mail.sendSteamAlertAsync(txnInfo, serverInfo, e)

		# Scrub the error message to prevent leaking information from Steam API
		res.status(500)
		return res.json({error: 'Internal Server Error.'})


router.get "/steam/finalize_txn", (req, res, next) ->
	if !req.query.txn?
		return next(Errors.NotFoundError())

	orderId = req.query.txn
	txn = null
	userId = null
	sandbox = config.get('steam.sandbox')

	return Steam.queryTxn({sandbox: sandbox, orderId: orderId})
	.then (res) ->
		txn = res
		UsersModule.userIdForSteamId(txn.steamid)
	.then (id) ->
		userId = id
		# check if status is approved then call finalizeTxn
		# make call to ShopModule.purchaseProductOnSteam with order id and amount
		# render the transaction template with final status (success or error)
		if txn.status != 'Approved'
			return res.format({
				'text/html': () ->
					res.render(__dirname + '/../templates/steam-error.hbs',{
						title: 'Steam Transaction Cancelled'
						orderId: orderId
						transId: txn.transid
					})
				'application/json': () ->
					res.status(200).json({
						status: txn.status
						orderId: orderId
						transId: txn.transid
					})
			})
		else
			return Steam.finalizeTxn({sandbox: sandbox, orderId: orderId})
			.then () ->
				Logger.module("STEAM").debug "purchaseProductOnSteam sku #{ShopModule.skuForSteamProductID(txn.items[0].itemid)}".yellow
				return ShopModule.purchaseProductOnSteam({
					userId: userId
					orderId: orderId
					sku: ShopModule.skuForSteamProductID(txn.items[0].itemid)
					amount: txn.items[0].amount
				})
			.then () ->
				return res.format({
					'text/html': () ->
						res.render(__dirname + '/../templates/steam-complete.hbs', {
							title: 'Steam Transaction Complete'
							orderId: orderId
							transId: txn.transid
						})
					'application/json': () ->
						res.status(200).json({
							status: txn.status
							orderId: orderId
							transId: txn.transid
						})
					})
	.catch (e) ->
		Logger.module("STEAM").error "#{e.message}".red
		if e.steamerror
			Logger.module("STEAM").error "steam error: #{e.steamerror}".red
		
		# Send email alert
		txnInfo = {
			userId: userId
			txn: txn
		}
		serverInfo = {
			hostname: os.hostname()
			environment: config.get('env')
		}
		mail.sendSteamAlertAsync(txnInfo, serverInfo, e)
	
		res.status(500)
		return res.format({
			'text/html': () ->
				res.render(__dirname + '/../templates/steam-error.hbs', {
					title: 'Steam Transaction Cancelled'
					orderId: orderId
				})
			'application/json': () ->
				res.json({error: 'Steam Transaction Cancelled.'})
		})


router.get "/steam/bnea_finalize_txn", (req, res, next) ->
	if !req.query.order_id?
		return next(Errors.NotFoundError())

	orderId = req.query.order_id
	txn = null
	userId = null
	sandbox = config.get('steam.sandbox')

	return Steam.queryTxn({sandbox: sandbox, orderId: orderId})
	.then (data) ->
		txn = data
		UsersModule.userIdForSteamId(txn.steamid)
	.then (data) ->
		userId = data
		if txn.status != 'Approved'
			return res.format({
				'text/html': () ->
					res.render(__dirname + '/../templates/steam-error.hbs',{
						title: 'Steam Transaction Cancelled'
						orderId: orderId
						transId: txn.transid
					})
				'application/json': () ->
					res.status(200).json({
						status: txn.status
						orderId: orderId
						transId: txn.transid
					})
			})
		else
			return DuelystFirebase.connect().getRootRef()
			.then (fbRootRef) ->
				# fire firebase signal to trigger finalize txn on client
				return Promise.all([
					FirebasePromises.set(fbRootRef.child('users').child(userId).child('finalizeSteamBneaTxn'),orderId),
					UsersModule.inGameNotify(userId,"Your Steam transaction is processing...","wallet_update")
				])
			.then () ->
				return res.format({
					'text/html': () ->
						res.render(__dirname + '/../templates/steam-pending.hbs', {
							title: 'Steam Transaction Pending',
							orderId: orderId
						})
					'application/json': () ->
						res.status(200).json({})
				})
	.catch (e) ->
		Logger.module("STEAM").error "#{e.message}".red
		if e.steamerror
			Logger.module("STEAM").error "steam error: #{e.steamerror}".red

		res.status(500)
		return res.format({
			'text/html': () ->
				res.render(__dirname + '/../templates/steam-error.hbs', {
					title: 'Steam Transaction Cancelled'
					orderId: orderId
				})
			'application/json': () ->
				res.json({error: 'Steam Transaction Cancelled.'})
		})


module.exports = router
