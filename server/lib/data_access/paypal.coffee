Promise = require 'bluebird'
validator = require 'validator'
util = require 'util'
FirebasePromises = require '../firebase_promises'
DuelystFirebase = require '../duelyst_firebase_module'
Logger = require '../../../app/common/logger.coffee'
colors = require 'colors'
moment = require 'moment'
_ = require 'underscore'
SyncModule = require './sync'
InventoryModule = require './inventory'
CosmeticChestsModule = require './cosmetic_chests'
GauntletModule = require './gauntlet'
ShopModule = require './shop'
Errors = require '../custom_errors'
mail = require '../../mailer'
knex = require("../data_access/knex")
config = require '../../../config/config.js'
generatePushId = require '../../../app/common/generate_push_id'
{Redis, Jobs, GameManager} = require '../../redis/'
Promise.promisifyAll(mail)

class PaypalModule

	###*
	# Process a verified paypal IPN transaction body
	# @public
	# @param	{Object}	paypalDataIn			Request body for the verified paypal transaction via IPN.
	# @return	{Promise}							Promise that will resolve on completion.
	###
	@processVerifiedPaypalInstantPaymentNotificationData: (paypalDataIn)->

		userId = paypalDataIn.custom
		chargeId = paypalDataIn.txn_id
		paymentMoment = moment(paypalDataIn.payment_date).utc()
		itemNumber = paypalDataIn.item_number || paypalDataIn.item_number1

		if paypalDataIn.payment_status == 'Completed'

			productData = ShopModule.productDataForSKU(itemNumber)
			if not productData?
				return Promise.reject(new Errors.NotFoundError("No product found for SKU: #{itemNumber}"))

			Logger.module("PAYPAL").debug "processing completed paypal transaction #{chargeId} for #{userId.blue}"

			trxPromise = knex.transaction (tx)->

				Promise.all([
					knex('users').where('id',userId).first().forUpdate().transacting(tx)
					knex('user_charges').where({'user_id':userId,'charge_id':chargeId}).first().forUpdate().transacting(tx)
				])
				.spread (user,recepit)->

					if itemNumber == "STARTERBUNDLE_201604" and user.has_purchased_starter_bundle
						throw new Errors.AlreadyExistsError("Player has already purchased starter bundle.")

					if (recepit?.charge_json?.payment_status == 'Completed')
						Logger.module("PAYPAL").debug "ISSUE: #{userId.blue} already received products for #{chargeId} but it has since changed to status #{paypalDataIn.payment_status}".red
						throw new Errors.AlreadyExistsError()

					gross = paypalDataIn.payment_gross || paypalDataIn.mc_gross
					amount = Math.round(parseFloat(gross)*100)

					username = user.username
					email = user.email || null
					message = "Your PAYPAL purchase of #{productData.name} has been processed. Your receipt number is #{chargeId}"
					# email maybe null if never provided on registration
					if email
						mail.sendReceiptAsync(username,email,chargeId,productData.qty)
						mail.sendTeamPurchaseNotificationAsync(username,userId,email,"paypal_"+chargeId,paypalDataIn.payment_gross)

					allPromises = []

					if recepit?
						allPromises.push knex('user_charges').where({'user_id':userId,'charge_id':chargeId}).update(
							charge_json:paypalDataIn
							updated_at:moment().utc().toDate()
						).transacting(tx)
					else
						ShopModule._addChargeToUser(trxPromise,tx,user,userId,itemNumber,amount,paypalDataIn.mc_currency.toLowerCase(),chargeId,paypalDataIn,"paypal",moment().utc())

					allPromises.push(ShopModule._awardProductDataContents(trxPromise,tx,userId,chargeId,productData))

					return Promise.all(allPromises)
				.then ()-> SyncModule._bumpUserTransactionCounter(tx,userId)
				.then ()-> DuelystFirebase.connect().getRootRef()
				.then (rootRef)->
					@.fbRootRef = rootRef
					allPromises = []
					allPromises.push FirebasePromises.push(@.fbRootRef.child("user-notifications").child(userId),{message:"Your paypal purchase has been processed!",created_at:moment().utc().valueOf()})
					return Promise.all(allPromises)
				.then tx.commit
				.catch tx.rollback
				return

			return trxPromise

		else

			Logger.module("PAYPAL").debug "received paypal transaction #{chargeId} status #{paypalDataIn.payment_status} for #{userId.blue}"

			trxPromise = knex.transaction (tx)->
				return tx('user_charges').where({'user_id':userId,'charge_id':chargeId}).first().forUpdate()
				.bind {}
				.then (charge)->

					if (charge?.charge_json?.payment_status == 'Completed')
						throw new Errors.AlreadyExistsError()

					if charge?
						return tx('user_charges').where({'user_id':userId,'charge_id':chargeId}).update(
							charge_json:paypalDataIn
							updated_at:moment().utc().toDate()
						)
					else
						return tx("users").first().where("id",user).then (user)->
							return ShopModule._addChargeToUser(trxPromise,tx,user,userId,itemNumber,Math.round(parseFloat(paypalDataIn.mc_gross)*100),paypalDataIn.mc_currency.toLowerCase(),chargeId,paypalDataIn,"paypal",moment().utc())

			return trxPromise

module.exports = PaypalModule
