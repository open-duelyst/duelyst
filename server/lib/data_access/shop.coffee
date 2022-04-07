Promise = require 'bluebird'
validator = require 'validator'
util = require 'util'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
_ = require 'underscore'
Errors = require '../custom_errors'
mail = require '../../mailer'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
{Redis, Jobs, GameManager} = require '../../redis/'
Promise.promisifyAll(mail)

ShopData = require 'app/data/shop.json'
CosmeticsFactory = require 'app/sdk/cosmetics/cosmeticsFactory'
CosmeticsTypeLookup = require 'app/sdk/cosmetics/cosmeticsTypeLookup'

InventoryModule = require './inventory'
UsersModule = require './users'
CosmeticChestsModule = require './cosmetic_chests'
SyncModule = require './sync'
RiftModule = require './rift'
GiftCrateModule = require './gift_crate'

# redis
{Redis, Jobs, GameManager} = require '../../redis/'

# TODO: actually remove this
stripe = {}

class ShopModule

	@SHOP_SALE_BUFFER_MINUTES: 5 # Number of minutes passed a shop sale's expiration we will allow the purchase to work

	@_addChargeToUser: (txPromise,tx,userRow,userId,sku,price,currencyCode,chargeId,chargeJson,paymentType,createdAt) ->

		allPromises = []

		updateParams =
			ltv:					userRow.ltv + price
			purchase_count:			userRow.purchase_count + 1
			last_purchase_at:		createdAt.toDate()

		if not userRow.first_purchased_at
			updateParams.first_purchased_at = createdAt.toDate()

		allPromises.push tx("users").where('id',userId).update(updateParams)

		allPromises.push tx("user_charges").insert(
			charge_id:		chargeId
			user_id:			userId
			payment_type:	paymentType
			created_at:		createdAt.toDate()
			amount:				price
			currency:			currencyCode
			charge_json:	chargeJson
			sku: 					sku
		)

		totalPlatinumAmount = chargeJson?.total_platinum_amount
		if totalPlatinumAmount?
			allPromises.push tx("user_currency_log").insert(
				id:								generatePushId()
				user_id:					userId
				premium_currency:	totalPlatinumAmount
				sku: 							sku
				memo:							"premium currency purchase"
				created_at:				createdAt.toDate()
			)

		# This is specifically for trimmed data we deem acceptable for a player to see
		fbReceiptData = {
			created_at:				createdAt.valueOf()
			sku:							sku
			price:						price
		}
		if chargeJson?
			if chargeJson.total_platinum_amount?
				fbReceiptData.total_platinum_amount = chargeJson.total_platinum_amount
			if chargeJson.transaction_id?
				fbReceiptData.transaction_id = chargeJson.transaction_id
			if chargeJson.type?
				fbReceiptData.type = chargeJson.type

		txPromise
		.then ()-> return DuelystFirebase.connect().getRootRef()
		.then (rootRef)->
			FirebasePromises.setWithPriority(rootRef.child("user-charges").child(userId).child(chargeId),chargeJson,createdAt.valueOf())
			FirebasePromises.setWithPriority(rootRef.child("user-premium-receipts").child(userId).child(chargeId),fbReceiptData,createdAt.valueOf())
			FirebasePromises.safeTransaction(rootRef.child("user-purchase-counts").child(userId).child(sku),(purchaseCountRecord)->
				purchaseCountRecord ?= {}
				purchaseCountRecord.count ?= 0
				purchaseCountRecord.count += 1
				return purchaseCountRecord
			)

		return Promise.all(allPromises)
			.then ()-> return DuelystFirebase.connect().getRootRef()
			.then (rootRef)->
				allPromises = []
				updateUserLtv = (userData)->
					if userData
						userData.ltv ?= 0
						userData.ltv += price
					return userData
				# save a reference of the charge to auth firebase
				allPromises.push FirebasePromises.safeTransaction(rootRef.child("users").child(userId),updateUserLtv)
				return Promise.all(allPromises)

	###*
	# Updates a user's currency log and related fields with having made a purchase with premium currency
	# @public
	# @param	{String}	userId		User ID.
  # @param	{Object}	userRow		User db data
	# @param	{String}	sku				sku of product purchased
	# @param	{int}	price					A positive integer in the smallest currency unit
	# @param	{String}	shopSaleId		id of shop sale used or none
	# @return	{Promise}
	###
	@_addPremiumChargeToUser: (txPromise,tx,userId,userRow,sku,price,shopSaleId,systemTime) ->

		allPromises = []

		NOW_UTC_MOMENT = systemTime || moment.utc()

		if sku == "STARTERBUNDLE_201604"
			updateParams = {}
			updateParams.has_purchased_starter_bundle = true
			allPromises.push tx("users").where('id',userId).update(updateParams)

		allPromises.push tx("user_currency_log").insert(
			id:								generatePushId()
			user_id:						userId
			premium_currency:	(price * -1)
			sku: 							sku
			memo:							"premium shop purchase"
			sale_id:						shopSaleId
			created_at:						NOW_UTC_MOMENT.toDate()
		)

		if userRow.referred_by_user_id? and userRow.purchase_count == 0
			# kick off a job to process this referral event
			Jobs.create("process-user-referral-event",
				name: "Process User Referral Event"
				title: util.format("User %s :: Generated Referral Event %s", userRow.id, "purchase")
				userId: userRow.id
				eventType: "purchase"
				referrerId: userRow.referred_by_user_id
			).removeOnComplete(true).ttl(15000).save()

		txPromise
		.then ()-> return DuelystFirebase.connect().getRootRef()
		.then (rootRef)->
			FirebasePromises.safeTransaction(rootRef.child("user-purchase-counts").child(userId).child(sku),(purchaseCountRecord)->
				purchaseCountRecord ?= {}
				purchaseCountRecord.count ?= 0
				purchaseCountRecord.count += 1
				return purchaseCountRecord
			)
			if sku == "STARTERBUNDLE_201604"
				FirebasePromises.set(rootRef.child("users").child(userId).child("has_purchased_starter_bundle"),true)

		return Promise.all(allPromises)
		.then ()->
			# Send update to achievements job for armory purchase
			Jobs.create("update-user-achievements",
				name: "Update User Armory Achievements"
				title: util.format("User %s :: Update Armory Achievements", userId)
				userId: userId
				armoryPurchaseSku: sku
			).removeOnComplete(true).save()

	###*
	# Updates a user's stripe customer data in the auth database.
	# @public
	# @param	{String}	userId					User ID.
	# @param	{String}	cardToken				Stripe credit card token to store.
	# @param	{String}	cardLastFourDigits		Last 4 digits of the user's card on file.
	# @return	{Promise}							Promise that will return Stripe Customer Data on completion.
	###
	@updateUserCreditCardToken: (userId,cardToken,cardLastFourDigits)->

		# userId must be defined
		unless userId
			return Promise.reject(new Error("Can update user credit card token: invalid user ID - #{userId}"))

		# cardLastFourDigits must be defined
		unless validator.isNumeric(cardLastFourDigits)
			return Promise.reject(new Error("Must provide last 4 digits"))

		NOW_UTC_MOMENT = moment.utc()
		thisObj = {}

		return knex.transaction (tx)->

			knex("users").where("id",userId).first().forUpdate().transacting(tx)
			.bind thisObj
			.then (userRow)->

				if not userRow
					return Promise.reject(new Errors.NotFoundError("user not found"));

				if userRow.stripe_customer_id and userRow.card_last_four_digits
					# UPDATE CARD
					@.newCustomer = false
					# Use promisified stripe.update method
					return stripe.customers.updateAsync(userRow.stripe_customer_id,{
						source: cardToken
					})
				else
					# NEW CARD
					@.newCustomer = true
					# Use promisified stripe.create method
					# https://stripe.com/docs/api/node#create_customer
					return stripe.customers.createAsync({
						description: userId,
						# providing email is optional, we may not have one for our user
						email: userRow.email || null
						card: cardToken # via Stripe.JS
					})

			.then (customer)->

				if @.newCustomer
					Logger.module("ShopModule").debug "updateUserCreditCardToken() -> NEW CUSTOMER"
				else
					Logger.module("ShopModule").debug "updateUserCreditCardToken() -> Updating Existing Customer"

				@.customer = customer

				return knex("users").where("id",userId).update(
					stripe_customer_id: 	customer.id
					card_last_four_digits:	cardLastFourDigits
					card_updated_at:		NOW_UTC_MOMENT.toDate()
				).transacting(tx)

			.then ()-> return DuelystFirebase.connect().getRootRef()
			.then (rootRef)->
				return FirebasePromises.set(rootRef.child("user-inventory").child(userId).child("wallet").child('card_last_four_digits'),cardLastFourDigits)
			.then tx.commit
			.catch tx.rollback
			return

		.bind thisObj
		.then ()->
			return @.customer

	###*
	# Delet's a user's stripe customer data in the auth database.
	# @public
	# @param	{String}	userId					User ID.
	# @return	{Promise}							Promise that will return on completion.
	###
	@deleteUserCreditCardToken: (userId)->

		# userId must be defined
		unless userId
			return Promise.reject(new Error("Can update user credit card token: invalid user ID - #{userId}"))

		NOW_UTC_MOMENT = moment.utc()
		thisObj = {}

		return knex.transaction (tx)->

			knex("users").where("id",userId).first().forUpdate().transacting(tx)
			.bind thisObj
			.then (userRow)->

				if not userRow
					return Promise.reject(new Errors.NotFoundError("user not found"))

				if not userRow.stripe_customer_id
					return Promise.reject(new Errors.NotFoundError("user does not have credit card data associated"))

				if userRow.stripe_customer_id
					# UPDATE CARD
					@.newCustomer = false
					# Use promisified stripe.update method
					return stripe.customers.delAsync(userRow.stripe_customer_id)

			.then ()->

				return knex("users").where("id",userId).update(
					card_last_four_digits:	null
					card_updated_at:		NOW_UTC_MOMENT.toDate()
				).transacting(tx)

			.then ()-> return DuelystFirebase.connect().getRootRef()
			.then (rootRef)->
				return FirebasePromises.remove(rootRef.child("user-inventory").child(userId).child("wallet").child('card_last_four_digits'))
			.then tx.commit
			.catch tx.rollback
			return

		.bind thisObj
		.then ()->
			return true

#	###*
#	# Charge a user's stored stripe card for the specified amount.
#	# @public
#	# @param	{String}	userId					User ID.
#	# @param	{String}	chargeDescription		Description to appear on customer statement.
#	# @param	{int}		amount					A positive integer in the smallest currency unit (e.g 100 cents to charge $1.00, or 1 to charge ¥1, a 0-decimal currency) representing how much to charge the card. The minimum amount is $0.50 (or equivalent in charge currency).
#	# @param	{String}	currencyCode			3-letter ISO code for currency.
#	# @return	{Promise}							Promise that will return the stripe charge object on completion.
#	###
#	@chargeUserStoredCard: (userId,sku,amount,chargeDescription,currencyCode='usd') ->
#
#		# userId must be defined
#		unless userId
#			return Promise.reject(new Error("Can not charge user's card: invalid user ID - #{userId}"))
#
#		NOW_UTC_MOMENT = moment.utc()
#		thisObj = {}
#
#
#		txPromise = knex.transaction (tx)->
#
#			tx("users").where("id",userId).first().forUpdate()
#			.bind thisObj
#			.then (userRow)->
#
#				if not userRow
#					return Promise.reject(new Errors.NotFoundError("user not found"));
#
#				@.userRow = userRow
#
#				if userRow.stripe_customer_id
#					# Use promisified stripe.charges.createAsync function
#					return stripe.charges.createAsync({
#						amount: amount,
#						currency: currencyCode,
#						customer: userRow.stripe_customer_id
#						description: chargeDescription
#					})
#				else
#					return Promise.reject(new Error("The user #{userId} has no card on file"))
#
#			.then (charge) -> # charge object returned from Stripe
#
#				@.charge = charge
#				Logger.module("ShopModule").debug "chargeUserCard() -> CHARGED user #{userId.blue} stored card for #{amount}. Charge ID:#{charge.id}".green
#				return ShopModule._addChargeToUser(txPromise, tx, @.userRow, userId, sku, amount, currencyCode, charge.id, charge, "stripe", NOW_UTC_MOMENT)
#
#			.then tx.commit
#			.catch tx.rollback
#
#		.bind thisObj
#		.then ()->
#			return @.charge
#		.catch (error) -> # If above chain fails for any reason
#			Logger.module("ShopModule").debug "chargeUserCard() -> FAILED to charge user's card: #{userId.blue}".red, error.message
#			throw error
#
#		return txPromise

#	###*
#	# Charge a user's stripe card for the specified amount.
#	# @public
#	# @param	{String}	userId					User ID.
#	# @param	{String}	cardToken				Stripe Credit Card token.
#	# @param	{String}	chargeDescription		Description to appear on customer statement.
#	# @param	{int}		amount					A positive integer in the smallest currency unit (e.g 100 cents to charge $1.00, or 1 to charge ¥1, a 0-decimal currency) representing how much to charge the card. The minimum amount is $0.50 (or equivalent in charge currency).
#	# @param	{String}	currencyCode			3-letter ISO code for currency.
#	# @return	{Promise}							Promise that will return the stripe charge object on completion.
#	###
#	@chargeUserCardToken: (userId,sku,cardToken,amount,chargeDescription,currencyCode='usd') ->
#
#		# userId must be defined
#		unless userId
#			return Promise.reject(new Error("Can not charge user's card: invalid user ID - #{userId}"))
#
#		NOW_UTC_MOMENT = moment.utc()
#		thisObj = {}
#
#		txPromise = knex.transaction (tx)->
#
#			tx("users").where("id",userId).first().forUpdate()
#			.bind thisObj
#			.then (userRow)->
#
#				if not userRow
#					return Promise.reject(new Errors.NotFoundError("user not found"));
#
#				@.userRow = userRow
#
#				# https://stripe.com/docs/api/node#create_charge
#				return stripe.charges.createAsync({
#					amount: amount,
#					currency: currencyCode,
#					source: cardToken
#					description: chargeDescription
#					# providing receipt_email is optional, we may not have one for our user
#					receipt_email: userRow.email || null
#				})
#
#			.then (charge) -> # charge object returned from Stripe
#
#				@.charge = charge
#				Logger.module("ShopModule").debug "chargeUserCardToken() -> CHARGED user #{userId.blue} stored card for #{amount}. Charge ID:#{charge.id}".green
#				return ShopModule._addChargeToUser(txPromise, tx, @.userRow, userId, sku, amount, currencyCode, charge.id, charge, "stripe", NOW_UTC_MOMENT)
#
#			.then tx.commit
#			.catch tx.rollback
#			return
#
#		.bind thisObj
#		.then ()->
#			return @.charge
#		.catch (error) -> # If above chain fails for any reason
#			Logger.module("ShopModule").debug "chargeUserCardToken() -> FAILED to charge user's card: #{userId.blue}".red, error.message
#			throw error
#
#		return txPromise

#	###*
#	# Execute a purchase based on a product SKU.
#	# @public
#	# @param	{String}	userId					User ID.
#	# @param	{String}	sku						Product SKU.
#	# @param	{String}	cardToken				Stripe Credit Card token.
#	# @return	{Promise}							Promise that will resolve when done.
#	###
#	@purchaseProduct: (userId,sku,cardToken)->
#
#		Logger.module("ShopModule").debug "purchaseProduct() -> user #{userId} buying #{sku}"
#
#		# userId must be defined
#		unless userId
#			Logger.module("ShopModule").debug "purchaseProduct() -> invalid user ID - #{userId?.blue}.".red
#			return Promise.reject(new Error("Can not process purchase : invalid user ID - #{userId}"))
#
#		# sku must be defined
#		unless sku
#			Logger.module("ShopModule").debug "purchaseProduct() -> invalid SKU - #{sku?.blue}.".red
#			return Promise.reject(new Error("Can not process purchase : invalid SKU - #{sku}"))
#
#		NOW_UTC_MOMENT = moment.utc()
#		this_obj = {}
#
#		productData = ShopModule.productDataForSKU(sku)
#
#		if not productData?
#			Logger.module("ShopModule").debug "purchaseProduct() -> no product found for SKU - #{sku?.blue}.".red
#			return Promise.reject(new Errors.NotFoundError("Could not find product for SKU - #{sku}"))
#
#		price = productData.price
#
#		if price == 0
#			return Promise.reject(new Errors.NotFoundError("Could not find price for product: #{sku}"))
#
#		trxPromise = knex.transaction (tx)->
#
#			tx("users").where('id',userId).first('ltv','username','email','has_purchased_starter_bundle')
#			.bind this_obj
#			.then (userRow)->
#				@.userRow = userRow
#
#				if sku == "STARTERBUNDLE_201604" and userRow.has_purchased_starter_bundle
#					throw new Errors.AlreadyExistsError("Player already purchased the starter bundle.")
#
#				if productData.purchase_limit?
#					return tx("user_currency_log").count().where("user_id",userId).andWhere('sku',sku)
#					.then (count)->
#						count = parseInt(count[0].count)
#						Logger.module("InventoryModule").debug "purchaseProduct() -> product #{sku} has a purchase limit of #{productData.purchase_limit} and user #{userId.blue} has purchased #{count} so far."
#						if count >= productData.purchase_limit
#							throw new Errors.AlreadyExistsError("This product has already been purchased.")
#
#				if productData.type == "cosmetic"
#					return tx("user_cosmetic_inventory").where("user_id",userId).andWhere("cosmetic_id",productData.id).first()
#					.then (row)->
#						if row?
#							throw new Errors.AlreadyExistsError("This cosmetic item is already in the user inventory.")
#			.then ()->
#				if cardToken
#					# charge user card for the amount
#					Logger.module("InventoryModule").debug "purchaseProduct() -> Charging #{userId.blue} one-time card token"
#					return ShopModule.chargeUserCardToken(userId,sku,cardToken,price,"DUELYST Armory Purchase")
#				else
#					# charge user card for the amount
#					Logger.module("InventoryModule").debug "purchaseProduct() -> Charging #{userId.blue} stored card"
#					return ShopModule.chargeUserStoredCard(userId,sku,price,"DUELYST Armory Purchase")
#			.then (charge)->
#				@.charge = charge
#				return ShopModule._awardProductDataContents(trxPromise, tx, userId, charge.id, productData, NOW_UTC_MOMENT)
#			.then (value)->
#				@.to_return = value
#			.then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
#			.then tx.commit
#			.catch tx.rollback
#			return
#
#		.bind this_obj
#		.then () ->
#
#			username = @.userRow.username
#			# we may not have an email provided for the user
#			email = @.userRow.email || null
#			if email then mail.sendReceiptAsync(username,email,@.charge.id,productData.qty)
#
#			# NOTE: don't send purchase notifications at large volume, and also since they contain PID
#			# mail.sendTeamPurchaseNotificationAsync(@.userData.username,userId,@.userData.email,@.charge.id,price)
#
#			# no need to wait for response for any email
#			return @.to_return
#
#		return trxPromise

	###*
	# @public
	# @param	{String}		userId					User ID.
	# @param	{String}		sku						Product SKU.
	# @param	{String|null}	shopSaleId				Sale Id to use for transaction or null if none used
	# @return	{Promise}							Promise that will resolve when done.
	###
	@purchaseProductWithPremiumCurrency: (userId,sku,shopSaleId)->

		Logger.module("ShopModule").debug "purchaseProductWithPremiumCurrency() -> user #{userId} buying #{sku}"

		# userId must be defined
		unless userId
			Logger.module("ShopModule").debug "purchaseProductWithPremiumCurrency() -> invalid user ID - #{userId?.blue}.".red
			return Promise.reject(new Error("Can not process purchase : invalid user ID - #{userId}"))

		# sku must be defined
		unless sku
			Logger.module("ShopModule").debug "purchaseProductWithPremiumCurrency() -> invalid SKU - #{sku?.blue}.".red
			return Promise.reject(new Error("Can not process purchase : invalid SKU - #{sku}"))

		NOW_UTC_MOMENT = moment.utc()
		this_obj = {}

		productData = ShopModule.productDataForSKU(sku)

		if not productData?
			Logger.module("ShopModule").debug "purchaseProductWithPremiumCurrency() -> no product found for SKU - #{sku?.blue}.".red
			return Promise.reject(new Errors.NotFoundError("Could not find product for SKU - #{sku}"))

		this_obj.premCurrencyPrice = productData.price

		if this_obj.premCurrencyPrice == 0
			return Promise.reject(new Errors.NotFoundError("Could not find price for product: #{sku}"))

		txPromise = knex.transaction (tx)->

			return tx("users").where('id',userId).first('ltv','username','email','has_purchased_starter_bundle')
			.bind this_obj
			.then (userRow)->
				@.userRow = userRow

				if sku == "STARTERBUNDLE_201604" and userRow.has_purchased_starter_bundle
					throw new Errors.AlreadyExistsError("Player already purchased the starter bundle.")

				if productData.purchase_limit?
					return tx("user_currency_log").count().where("user_id",userId).andWhere('sku',sku)
					.then (count)->
						count = parseInt(count[0].count)
						Logger.module("InventoryModule").debug "purchaseProductWithPremiumCurrency() -> product #{sku} has a purchase limit of #{productData.purchase_limit} and user #{userId.blue} has purchased #{count} so far."
						if count >= productData.purchase_limit
							throw new Errors.AlreadyExistsError("This product has already been purchased.")

				if productData.type == "cosmetic"
					return tx("user_cosmetic_inventory").where("user_id",userId).andWhere("cosmetic_id",productData.id).first()
					.then (row)->
						if row?
							throw new Errors.AlreadyExistsError("This cosmetic item is already in the user inventory.")
			.then ()->

				if not shopSaleId?
					# Checks to make sure that a user isn't paying full price for an item that's on sale
					bufferedTimeToExpireSales = NOW_UTC_MOMENT.clone().subtract(ShopModule.SHOP_SALE_BUFFER_MINUTES,"minutes")
					return tx("shop_sales").first().where('sku',sku).andWhere("sale_starts_at","<",NOW_UTC_MOMENT.toDate()).andWhere("sale_ends_at",'>',bufferedTimeToExpireSales.toDate()).andWhere("disabled",'=',false)
					.bind @
					.then (shopSaleRow) ->
						if (shopSaleRow?)
							throw new Error("Attempting to purchase an item #{sku} that is on sale #{shopSaleRow.sale_id} without sale price.")
						else
							return Promise.resolve()
				else
					# Check if there is a matching active sale if provided with a sale id
					return tx("shop_sales").first().where('sale_id',shopSaleId)
					.bind @
					.then (shopSaleRow) ->
						if (not shopSaleRow?)
							throw new Errors.ShopSaleDoesNotExistError("There is no matching sale with id (#{shopSaleId}) for product sku #{sku}.")
						else if (not shopSaleRow.sale_starts_at? or moment.utc(shopSaleRow.sale_starts_at).isAfter(NOW_UTC_MOMENT))
							throw new Errors.ShopSaleDoesNotExistError("Matching sale with id (#{shopSaleId}) for product sku #{sku} has not started.")
						else if (not shopSaleRow.sale_ends_at? or moment.utc(shopSaleRow.sale_ends_at).add(ShopModule.SHOP_SALE_BUFFER_MINUTES,"minutes").isBefore(NOW_UTC_MOMENT))
							throw new Errors.ShopSaleDoesNotExistError("Matching sale with id (#{shopSaleId}) for product sku #{sku} has expired.")
						else if (shopSaleRow.disabled)
							throw new Error("Matching sale with id (#{shopSaleId}) for product sku #{sku} is disabled.")
						else if (shopSaleRow.sku != sku)
							throw new Errors.ShopSaleDoesNotExistError("No matching sale with id (#{shopSaleId}) for product sku #{sku}.")
						else
							# Matching sale success
							@.premCurrencyPrice = shopSaleRow.sale_price
							return Promise.resolve()

			.then ()->
				# txPromise,trx,userId,amount,memo
				return InventoryModule.debitPremiumFromUser(txPromise, tx, userId, @.premCurrencyPrice)
			.then ()->
				# txPromise, tx, userId, userRow, sku, price, shopSaleId, systemTime
				return ShopModule._addPremiumChargeToUser(txPromise, tx, userId, @.userRow, sku, @.premCurrencyPrice, shopSaleId, NOW_UTC_MOMENT)
			.then ()->
				return ShopModule._awardProductDataContents(txPromise, tx, userId, generatePushId(), productData, NOW_UTC_MOMENT)
			.then (value)->
				@.to_return = value
			.then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)

		.bind this_obj
		.then () ->

			username = @.userRow.username
			# we may not have an email provided for the user
#			email = @.userRow.email || null
#			if email then mail.sendReceiptAsync(username,email,@.charge.id,productData.qty)

			# NOTE: don't send purchase notifications at large volume, and also since they contain PID
			# mail.sendTeamPurchaseNotificationAsync(@.userData.username,userId,@.userData.email,@.charge.id,premCurrencyPrice)

			# no need to wait for response for any email
			return @.to_return

		return txPromise
		.then ()->
			return DuelystFirebase.connect().getRootRef()

	###*
	# Execute a Steam purchase
	# @public
	# @return	{Promise}							Promise that will resolve when done.
	###
	@purchaseProductOnSteam: (opts)->
		NOW_UTC_MOMENT = moment.utc()
		this_obj = {}

		orderId = opts.orderId
		userId = opts.userId
		sku = opts.sku

		productData = ShopModule.productDataForSKU(sku)

		unless productData
			Logger.module("InventoryModule").debug "purchaseProduct() -> no product found for SKU - #{sku?.blue}.".red
			return Promise.reject(new Errors.NotFoundError("Could not find product for SKU - #{sku}"))

		amount = opts.amount || productData.price

		trxPromise = knex.transaction (tx)->

			tx("users").where('id',userId).first().forUpdate()
			.bind this_obj
			.then (userRow)->
				@.userRow = userRow

				if sku == "STARTERBUNDLE_201604"
					if userRow.has_purchased_starter_bundle
						throw new Errors.AlreadyExistsError("Player already purchased the starter bundle.")

				if productData.purchase_limit?
					return tx("user_currency_log").count().where("user_id",userId).andWhere('sku',sku)
					.then (count)->
						if count >= productData.purchase_limit
							throw new Errors.AlreadyExistsError("This product has already been purchased.")

				if productData.type == "cosmetic"
					return tx("user_cosmetic_inventory").where("user_id",userId).andWhere("cosmetic_id",productData.id).first()
					.then (row)->
						if row?
							throw new Errors.AlreadyExistsError("This cosmetic item is already in the user inventory.")
			.then ()->
				return ShopModule._addChargeToUser(trxPromise, tx, @.userRow, userId, sku, amount, 'usd', opts.orderId, opts, "steam", NOW_UTC_MOMENT)
			.then ()->
				return ShopModule._awardProductDataContents(trxPromise, tx, userId, opts.orderId, productData, NOW_UTC_MOMENT)
			.then (value)->
				@.to_return = value
			.then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
			.then tx.commit
			.catch tx.rollback
			return

		.bind this_obj
		.then () ->

			return @.to_return

		return trxPromise

	@_awardProductDataContents: (txPromise,tx,userId,chargeId,productData,systemTime)->

		NOW_UTC_MOMENT = systemTime || moment.utc()
		allPromises = []

		# Create an array of promises of booster pack push calls
		if productData.type == "card_pack"
			for i in [1..productData.qty]
				allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,productData.card_set,'hard',chargeId))

		# Create an array of promises of booster pack push calls
		if productData.type == "gauntlet_tickets"
			for i in [1..productData.qty]
				allPromises.push(InventoryModule.addArenaTicketToUser(txPromise,tx,userId,'hard',chargeId))

		# Create an array of promises
		if productData.type == "cosmetic"
			allPromises.push(InventoryModule.giveUserCosmeticId(txPromise,tx,userId,productData.id,'hard',chargeId))

		# if this product is supposed to bundle cosmetics
		# NOTE: "cosmetics_bundle" is a product type that ONLY bundles cosmetics, but any product can bundle cosmetics
		# Create an array of promises
		if productData.bundle_cosmetic_ids?.length > 0
			for cosmeticId in productData.bundle_cosmetic_ids
				allPromises.push(InventoryModule.giveUserCosmeticId(txPromise,tx,userId,cosmeticId,'hard',chargeId))

		if productData.type == "loot_chest_key"
			allPromises.push(CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,productData["chest_type"],productData.qty,'hard',chargeId))

		if productData.type == "starter_bundle"
			for orbsData in productData.spirit_orbs
				for i in [1..orbsData.count]
					allPromises.push(InventoryModule.addBoosterPackToUser(txPromise,tx,userId,orbsData.card_set,'hard',chargeId))

		if productData.type == "newbie_bundle"
			allPromises.push(InventoryModule.giveUserCards(txPromise,tx,userId,productData.cards,"hard",chargeId))
			for cosmeticId in productData.cosmeticIds
				allPromises.push(InventoryModule.giveUserCosmeticId(txPromise,tx,userId,cosmeticId,'hard',chargeId))

		if productData.type == "complete_card_set"
			allPromises.push(InventoryModule.addRemainingOrbsForCardSetToUser(txPromise,tx,userId,productData.card_set, false,'hard',chargeId))

		if productData.type == "rift_tickets"
			for i in [1..productData.qty]
				allPromises.push(RiftModule.addRiftTicketToUser(txPromise, tx, userId, 'hard', chargeId))

		if productData.type == "gift_crate"
			for i in [1..productData.qty]
				allPromises.push(GiftCrateModule.addGiftCrateToUser(txPromise, tx, userId, productData["crate_type"], chargeId))

		# when we're all done with the entire promise chain, set the battlemap if one was purchased
		txPromise.then ()->
			if productData.type == "cosmetic" and CosmeticsFactory.cosmeticForIdentifier(productData.id)?.typeId == CosmeticsTypeLookup.BattleMap
				return UsersModule.setBattleMapId(userId,productData.id)

		return Promise.all(allPromises)

	@_allProducts: ()->
		categories = _.keys(ShopData)
		# Logger.module("ShopModule").debug "all categories:", categories
		categoryProducts = _.map categories, (category)->
			return _.values ShopData[category]
		allProducts = _.flatten categoryProducts
		# Logger.module("ShopModule").debug "all products:", allProducts
		return allProducts

	###*
	# Grab product JSON definition from product catalog
	# @public
	# @param	{String}	sku						Product SKU to grab data for.
	# @return	{Object}							JSON product definition.
	###
	@productDataForSKU: (sku)->
		productData = _.find ShopModule._allProducts(), (p)-> return p.sku == sku
		productData ?= CosmeticsFactory.cosmeticProductAttrsForSKU(sku)

	@steamProductDataForSKU: (sku)->
		productData = ShopModule.productDataForSKU(sku)
		if not productData?
			throw new Error.NotFoundError("Product not found for SKU: #{sku}")
		steamData =
			id: productData.steam_id
			amount: productData.price
			description: "DUELYST - #{productData.unit_name || productData.name}"
			qty: productData.qty || 1
		return steamData

	@skuForSteamProductID: (id)->
		sku = null
		productData = _.find ShopModule._allProducts(), (p)-> return p.steam_id == id
		if not productData?
			productData = CosmeticsFactory.cosmeticForIdentifier(id)
		if not productData?
			throw new Error.NotFoundError("Product not found for Steam ID: #{id}")

		sku = productData.sku

		return sku

	@creditUserPremiumCurrency: (txPromise, tx, userId, amount) ->
		# userId must be defined
		if not userId?
			return Promise.reject(new Error("giveUserPremiumCurrency: invalid user ID - #{userId}"))

		amount = parseInt(amount)
		if not amount? or amount <= 0 or _.isNaN(amount)
			return Promise.reject(new Error("giveUserPremiumCurrency: invalid amount - #{amount}"))

		this_obj = {}

		trxPromise = knex.transaction (tx)->

			return tx("users").where('id',userId).first('id').forUpdate()
			.bind this_obj
			.then (userRow)->
				@.userRow = userRow

				return tx("user_premium_currency").where("user_id",userId).first('amount')
			.then (userPremCurrencyRow) ->
				allPromises = []

				needsInsert = false
				if (not userPremCurrencyRow?)
					needsInsert = true
					userPremCurrencyRow =
						user_id: userId
				@.userPremCurrencyRow = userPremCurrencyRow
				@.userPremCurrencyRow.amount ?= 0
				@.userPremCurrencyRow.amount += amount

				if needsInsert
					allPromises.push tx("user_premium_currency").where("user_id",userId).first('amount').insert(@.userPremCurrencyRow)
				else
					allPromises.push tx("user_premium_currency").where("user_id",userId).first('amount').update(
						amount: @.userPremCurrencyRow.amount
					)



				return Promise.all(allPromises)

		.bind this_obj
		.then () ->
			return @.userPremCurrencyRow

		return trxPromise

	# Amount is negative value
	@debitUserPremiumCurrency: (txPromise, tx, userId, amount) ->
		# userId must be defined
		if not userId?
			return Promise.reject(new Error("debitUserPremiumCurrency: invalid user ID - #{userId}"))

		amount = parseInt(amount)
		if not amount? or amount >= 0 or _.isNaN(amount)
			return Promise.reject(new Error("debitUserPremiumCurrency: invalid amount - #{amount}"))

		this_obj = {}

		trxPromise = knex.transaction (tx)->

			return tx("users").where('id',userId).first('id').forUpdate()
			.bind this_obj
			.then (userRow)->
				@.userRow = userRow

				return tx("user_premium_currency").where("user_id",userId).first('amount')
			.then (userPremCurrencyRow) ->
				allPromises = []

				if (not userPremCurrencyRow?)
					throw new Errors.InsufficientFundsError("Insufficient currency to debit")

				@.userPremCurrencyRow = userPremCurrencyRow
				@.userPremCurrencyRow.amount ?= 0

				if (@.userPremCurrencyRow.amount < amount)
					throw new Errors.InsufficientFundsError("Insufficient currency to debit")

				@.userPremCurrencyRow.amount += amount

				allPromises.push tx("user_premium_currency").where("user_id",userId).first('amount').update(
					amount: @.userPremCurrencyRow.amount
				)

				# txPromise,tx,userRow,userId,sku,price,currencyCode,chargeId,chargeJson,paymentType,createdAt

				return Promise.all(allPromises)

		.bind this_obj
		.then () ->
			return @.purchaseId

		return trxPromise



module.exports = ShopModule
