/* PayPal unit tests are currently disabled.

var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var PaypalModule = require('../../../server/lib/data_access/paypal.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && true;

describe("shop module", function() {

	var userId = null;
	this.timeout(25000);

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);
		Logger.module("UNITTEST").log("creating user");
		return UsersModule.createNewUser('unit-test@counterplay.co','unittest','hash','kumite14')
		.then(function(userIdCreated){
			Logger.module("UNITTEST").log("created user ",userIdCreated);
			userId = userIdCreated;
		}).catch(Errors.AlreadyExistsError,function(error){
			Logger.module("UNITTEST").log("existing user");
			return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting){
				Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
				userId = userIdExisting;
				return SyncModule.wipeUserData(userIdExisting);
			}).then(function(){
				Logger.module("UNITTEST").log("existing user data wiped",userId);
			})
		}).catch(function(error){
			Logger.module("UNITTEST").log("unexpected error: ",error)
			throw error
		})
	})

	describe("PaypalModule", function() {

		describe("processVerifiedPaypalInstantPaymentNotificationData()", function() {

			it('expect to be able to process a verified IPN notification', function() {
				return PaypalModule.processVerifiedPaypalInstantPaymentNotificationData({
					custom: userId,
					txn_id: "1",
					payment_date: moment().utc().toDate(),
					payment_status: "Completed",
					item_number: "BOOSTER3",
					payment_gross: 2.99,
					mc_gross: 2.99,
					mc_currency: "usd"
				}).then(function(result){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_spirit_orbs").where('user_id',userId),
						knex("user_charges").where('user_id',userId),
						knex("users").where('id',userId).first(),
						FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					])
				}).spread(function(spiritOrbRows,chargeRows,userRow,userSnapshot){
					expect(spiritOrbRows.length).to.equal(2)
					expect(userRow.ltv).to.equal(299)
					expect(userRow.first_purchased_at).to.exist
					expect(userRow.last_purchase_at).to.exist
					expect(userRow.last_purchase_at.valueOf()).to.equal(userRow.first_purchased_at.valueOf())
					expect(userRow.purchase_count).to.equal(1)

					expect(chargeRows.length).to.equal(1)
					expect(chargeRows[0].charge_id).to.exist;
					expect(chargeRows[0].amount).to.equal(userRow.ltv)
					expect(chargeRows[0].payment_type).to.equal("paypal")
					expect(chargeRows[0].sku).to.equal("BOOSTER3")
					expect(chargeRows[0].charge_json).to.exist
					expect(chargeRows[0].created_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf())

					expect(userSnapshot.val().ltv).to.equal(userRow.ltv)
				})
			})

			it('expect counter columns to work correctly for IPN notifications', function() {
				return PaypalModule.processVerifiedPaypalInstantPaymentNotificationData({
					custom: userId,
					txn_id: "2",
					payment_date: moment().utc().toDate(),
					payment_status: "Completed",
					item_number: "BOOSTER3",
					payment_gross: 2.99,
					mc_gross: 2.99,
					mc_currency: "usd"
				}).then(function(result){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_spirit_orbs").where('user_id',userId),
						knex("user_charges").where('user_id',userId),
						knex("users").where('id',userId).first(),
						FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					])
				}).spread(function(spiritOrbRows,chargeRows,userRow,userSnapshot){
					expect(spiritOrbRows.length).to.equal(4)
					expect(userRow.ltv).to.equal(299*2)
					expect(userRow.purchase_count).to.equal(2)
					expect(userRow.last_purchase_at.valueOf()).to.not.equal(userRow.first_purchased_at.valueOf())
					expect(chargeRows.length).to.equal(2)
					expect(userSnapshot.val().ltv).to.equal(userRow.ltv)
				})
			})

			it('expect to get ERROR trying to process the same IPN notification twice', function() {

				return PaypalModule.processVerifiedPaypalInstantPaymentNotificationData({
					custom: userId,
					txn_id: "1",
					payment_date: moment().utc().toDate(),
					payment_status: "Completed",
					item_number: "BOOSTER3",
					payment_gross: 2.99,
					mc_gross: 2.99,
					mc_currency: "usd"
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError)
				})

			})

			it('expect NOT to be able to process a starter bundle IPN twice', function() {
				return PaypalModule.processVerifiedPaypalInstantPaymentNotificationData({
					custom: userId,
					txn_id: "3",
					payment_date: moment().utc().toDate(),
					payment_status: "Completed",
					item_number: "STARTERBUNDLE_201604",
					payment_gross: 9.99,
					mc_gross: 9.99,
					mc_currency: "usd"
				}).then(function(result){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("user_spirit_orbs").where('user_id',userId),
						knex("user_charges").where('user_id',userId),
						knex("users").where('id',userId).first(),
						FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					])
				}).spread(function(spiritOrbRows,chargeRows,userRow,userSnapshot){
					expect(spiritOrbRows.length).to.equal(14)
					expect(chargeRows.length).to.equal(3)
					expect(userRow.ltv).to.equal(299+299+999)
					expect(userRow.first_purchased_at.valueOf()).to.not.equal(userRow.last_purchase_at.valueOf())
					expect(userRow.has_purchased_starter_bundle).to.equal(true)
					expect(userSnapshot.val().has_purchased_starter_bundle).to.equal(true)
					expect(userRow.purchase_count).to.equal(3)
					return PaypalModule.processVerifiedPaypalInstantPaymentNotificationData({
						custom: userId,
						txn_id: "3",
						payment_date: moment().utc().toDate(),
						payment_status: "Completed",
						item_number: "STARTERBUNDLE_201604",
						payment_gross: 9.99,
						mc_gross: 9.99,
						mc_currency: "usd"
					})
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error.message).to.equal("Player has already purchased starter bundle.")
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError)
				})
			})

		})

	})

})
*/