/* Shop unit tests are currently disabled.

var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var ShopModule = require('../../../server/lib/data_access/shop.coffee');
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
var stripe = require('stripe')(config.get('stripeSecretKey'));
var ShopData = require('../../../app/data/shop.json')
Promise.promisifyAll(stripe);
Promise.promisifyAll(stripe.customers);
Promise.promisifyAll(stripe.charges);
Promise.promisifyAll(stripe.tokens);

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("shop module", function() {

	var userId = null;
	this.timeout(25000);

	// before cleanup to check if user already exists and delete
	before(function(){

		return DuelystFirebase.connect().getRootRef()
		.bind({})
		.then(function(fbRootRef){
			this.fbRootRef = fbRootRef;
			return UsersModule.userIdForEmail('unit-test@counterplay.co')
		}).then(function(userIdRetrieved){
			if (!userIdRetrieved) {
				Logger.module("UNITTEST").log("userid not found, continuing...")
				return Promise.reject(new Error("user not fund :("));
			}
			else {
				userId = userIdRetrieved;
				return knex('users').first('stripe_customer_id').where('id',userId);
			}
		}).then(function(userRow){
			if (userRow.stripe_customer_id && userRow.card_last_four_digits) {
				return stripe.customers.retrieveAsync(userRow.stripe_customer_id);
			}
		}).then(function(customer){
			if (customer)
				return stripe.customers.delAsync(customer.id);
		}).finally(function() {
			Logger.module("UNITTEST").log("removing stripe customer id");
			return SyncModule.wipeUserData(userId);
		});
	});

	// // after cleanup
	// after(function(){
	// 	this.timeout(25000);
	// 	return DuelystFirebase.connect().getRootRef()
	// 	.bind({})
	// 	.then(function(fbRootRef){
	// 		this.fbRootRef = fbRootRef;
	// 		if (userId)
	// 			return clearUserData(userId,this.fbRootRef);
	// 	});
	// });

	describe("Shop.json", function () {
		it('expect no duplicate steam ids or skus', function () {
			var allSkus = [];
			var allSteamIds = [];


			for (var categoryId in ShopData) {
				var shopCategoryData = ShopData[categoryId];
				for (var productKey in shopCategoryData) {
					var productData = shopCategoryData[productKey];
					expect(productData.sku).to.exist
					allSkus.push(productData.sku);

					if (productData.gold != null) {
						expect(productData.gold).to.exist
					} else {
						expect(productData.steam_id).to.exist
						allSteamIds.push(productData.steam_id);
					}
				}
			}

			expect(_.unique(allSkus).length).to.equal(allSkus.length);
			expect(_.unique(allSteamIds).length).to.equal(allSteamIds.length);
		})
	})

	describe("ShopModule - stripe tokens and charges", function() {

		describe("productDataForSKU()", function() {

			it('expect to pull up correct data for an SKU', function() {
				var data = ShopModule.productDataForSKU("BOOSTER3")
				expect(data).to.exist
				expect(data.name).to.equal("2 Spirit Orbs")
			})

		})

	})

	describe("ShopModule - stripe tokens and charges", function() {

		describe("chargeUserCardToken()", function() {

			it('expect not to be able to charge an invalid token', function() {
				return ShopModule.chargeUserCardToken(userId,"sku","fake-token-id",100,"bad charge attempt")
				.then(function(chargeData){
					expect(chargeData).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Error);
				});
			});

			it('expect to be able to charge a valid token', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.chargeUserCardToken(userId,"test_sku",token.id,100,"this charge should succeed")
				}).then(function(chargeData){
					expect(chargeData).to.exist;
					this.chargeData = chargeData;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						FirebasePromises.once(rootRef.child("user-charges").child(userId).child(this.chargeData.id),"value"),
						knex("user_charges").select().where('user_id',userId),
						knex("users").first().where('id',userId),
						FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					])
				}).spread(function(chargeSnapshot,chargeRows,userRow,userSnapshot){

					expect(chargeSnapshot).to.exist;
					expect(chargeSnapshot.val().description).to.equal("this charge should succeed");

					expect(userRow.last_purchase_at).to.exist;
					expect(userRow.first_purchased_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf());
					expect(userRow.purchase_count).to.equal(1);
					expect(userRow.ltv).to.equal(100);

					expect(chargeRows).to.exist;
					expect(chargeRows.length).to.equal(1);
					expect(chargeRows[0].charge_id).to.exist;
					expect(chargeRows[0].amount).to.equal(userRow.ltv);
					expect(chargeRows[0].payment_type).to.equal("stripe");
					expect(chargeRows[0].charge_json).to.exist;
					expect(chargeRows[0].sku).to.equal("test_sku");
					expect(chargeRows[0].created_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf());

					expect(userSnapshot.val().ltv).to.equal(userRow.ltv)
				})
			})
		})

		describe("updateUserCreditCardToken()", function() {

			it('expect not to be able to update user data with an invalid token', function() {
				return ShopModule.updateUserCreditCardToken(userId,"bad-token",'0000')
				.then(function(response){
					expect(response).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Error);
				});
			});

			it('expect to be able to set a user\'s stored credit card', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4012888888881881,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					this.token = token;
					return ShopModule.updateUserCreditCardToken(userId,token.id,'5556');
				}).then(function(customerData){
					expect(customerData).to.exist;
					return stripe.customers.retrieveAsync(customerData.id)
				}).then(function(customerData){
					expect(customerData.default_source).to.equal(this.token.card.id);
				});
			});

			it('expect to be able to modify a user\'s stored credit card', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4000056655665556,
						"exp_month": 12,
						"exp_year": 2022,
						"cvc": '123'
					}
				}).then(function(token){
					this.token = token;
					return ShopModule.updateUserCreditCardToken(userId,token.id,'5556');
				}).then(function(customerData){
					expect(customerData).to.exist;
					return stripe.customers.retrieveAsync(customerData.id)
				}).then(function(customerData){
					expect(customerData.default_source).to.equal(this.token.card.id);
				});
			});
		});

		describe("deleteUserCreditCardToken()", function() {

			it('expect to be able to delete a stored Stripe customer', function() {

				return stripe.tokens.createAsync({
					card: {
						"number": 4000056655665556,
						"exp_month": 12,
						"exp_year": 2022,
						"cvc": '123'
					}
				}).then(function(token){
					this.token = token;
					return ShopModule.updateUserCreditCardToken(userId,token.id,'5556');
				}).then(function(customerData){
					this.customerData = customerData
					expect(customerData).to.exist;
					return stripe.customers.retrieveAsync(customerData.id)
				}).then(function(customerData){
					expect(customerData.default_source).to.equal(this.token.card.id);
					return ShopModule.deleteUserCreditCardToken(userId)
				}).then(function(){
					return Promise.all([
						stripe.customers.retrieveAsync(this.customerData.id),
						knex("users").first('card_last_four_digits').where('id',userId),
					])
				}).spread(function(customerData,userRow){
					expect(userRow.card_last_four_digits).to.not.exist
					expect(customerData.deleted).to.equal(true)
				})
			})

			it('expect to be able to set a NEW stored credit card', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4012888888881881,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					this.token = token
					return ShopModule.updateUserCreditCardToken(userId,token.id,'5556')
				}).then(function(customerData){
					expect(customerData).to.exist
					return stripe.customers.retrieveAsync(customerData.id)
				}).then(function(customerData){
					expect(customerData.default_source).to.equal(this.token.card.id)
				})
			})

		})

		describe("chargeUserStoredCard()", function() {

			before(function(){
				this.timeout(15000);
				// remove existing stripe customer data
				return DuelystFirebase.connect().getRootRef()
				.bind({})
				.then(function(fbRootRef){
					this.fbRootRef = fbRootRef;
					return knex('users').first('stripe_customer_id').where('id',userId)
				}).then(function(userRow){
					if (userRow.stripe_customer_id && userRow.card_last_four_digits) {
						return stripe.customers.retrieveAsync(userRow.stripe_customer_id);
					}
				}).then(function(customer){
					if (customer)
						return stripe.customers.delAsync(customer.id);
				}).finally(function() {
					Logger.module("UNITTEST").log("removing stripe customer id");
					return SyncModule.wipeUserData(userId)
				})
			});

			it('expect not to be able to charge stored user credit card if no data is present', function() {
				return ShopModule.chargeUserStoredCard(userId,"sku",199,"this should not succeed")
				.then(function(response){
					expect(response).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Error);
				});
			});

			it('expect to be able to charge stored user credit card if there is a card on file', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": '4012888888881881',
						"exp_month": 12,
						"exp_year": 2022,
						"cvc": '123'
					}
				}).then(function(token){
					this.token = token.id;
					return ShopModule.updateUserCreditCardToken(userId,token.id,'1881');
				}).then(function(customerData){
					return ShopModule.chargeUserStoredCard(userId,"test_sku",199,"this stored charge should succeed");
				}).then(function(chargeData){
					expect(chargeData).to.exist;
					this.chargeData = chargeData;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						FirebasePromises.once(rootRef.child("user-charges").child(userId).child(this.chargeData.id),"value"),
						knex("user_charges").select().where('user_id',userId),
						knex("users").first().where('id',userId),
						FirebasePromises.once(rootRef.child("users").child(userId),"value"),
					])
				}).spread(function(chargeSnapshot,chargeRows,userRow,userSnapshot){

					expect(chargeSnapshot).to.exist;
					expect(chargeSnapshot.val().description).to.equal("this stored charge should succeed");

					expect(userRow.stripe_customer_id).to.exist;
					expect(userRow.last_purchase_at).to.exist;
					expect(userRow.purchase_count).to.equal(1);
					expect(userRow.ltv).to.equal(199);

					expect(chargeRows).to.exist;
					expect(chargeRows.length).to.equal(1);
					expect(chargeRows[0].charge_id).to.exist;
					expect(chargeRows[0].amount).to.equal(userRow.ltv);
					expect(chargeRows[0].payment_type).to.equal("stripe");
					expect(chargeRows[0].charge_json).to.exist;
					expect(chargeRows[0].sku).to.equal("test_sku");
					expect(chargeRows[0].created_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf());

					expect(userSnapshot.val().ltv).to.equal(userRow.ltv)
				});
			});

		});

	})

	describe("ShopModule - purchase sku", function() {

		before(function(){
			this.timeout(15000);
			// remove existing stripe customer data
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(fbRootRef){
				this.fbRootRef = fbRootRef;
				return knex('users').first('stripe_customer_id').where('id',userId)
			}).then(function(userRow){
				if (userRow.stripe_customer_id) {
					return stripe.customers.retrieveAsync(userRow.stripe_customer_id)
				}
			}).then(function(customer){
				if (customer)
					return stripe.customers.delAsync(customer.id)
			}).finally(function() {
				Logger.module("UNITTEST").log("removing stripe customer id")
				return SyncModule.wipeUserData(userId)
			})
		})

		describe("purchaseProduct()", function() {

			it('expect to be able to buy booster packs', function() {

				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'BOOSTER3',token.id)
				}).then(function(result){
					expect(result).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_spirit_orbs").where('user_id',userId),
						knex.select().from("user_charges").where('user_id',userId).andWhere('sku','BOOSTER3'),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs"),"value"),
						FirebasePromises.once(rootRef.child("user-purchase-counts").child(userId),"value")
					])
				}).spread(function(userRow,spiritOrbRows,chargeRows,firebaseBoostersSnapshot,purchaseCountsSnapshot){
					expect(userRow.purchase_count).to.equal(1)
					expect(userRow.last_purchase_at).to.exist
					expect(userRow.last_purchase_at.valueOf()).to.equal(userRow.first_purchased_at.valueOf())
					expect(spiritOrbRows.length).to.equal(2)
					expect(chargeRows.length).to.equal(1)
					var fbBoosters = firebaseBoostersSnapshot.val()
					expect(fbBoosters).to.exist;
					expect(purchaseCountsSnapshot.val()["BOOSTER3"].count).to.equal(1)
				})
			})

			it('expect user purchase counter columns to work correctly', function() {

				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'BOOSTER3',token.id)
				}).then(function(result){
					expect(result).to.exist
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						FirebasePromises.once(rootRef.child("user-purchase-counts").child(userId),"value")
					])
				}).spread(function(userRow,purchaseCountsSnapshot){
					expect(userRow.purchase_count).to.equal(2)
					expect(userRow.ltv).to.equal(299*2)
					expect(userRow.last_purchase_at).to.exist
					expect(userRow.last_purchase_at.valueOf()).to.not.equal(userRow.first_purchased_at.valueOf())
					expect(purchaseCountsSnapshot.val()["BOOSTER3"].count).to.equal(2)
				})
			})

			it('expect NOT to be able to buy SKU that does not exist', function() {
				return ShopModule.purchaseProduct(userId,'BOOSTER_2_fake',token.id)
				.then(function(response){
					expect(response).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.NotFoundError);
				});
			});

			it('expect NOT to be able to buy booster packs with an invalid credit card TOKEN', function() {
				return ShopModule.purchaseProduct(userId,'BOOSTER3','fake-token')
				.then(function(response){
					expect(response).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Error);
				});
			});

			it('expect to be able to purchase a starter bundle ONLY once',function(){

				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'STARTERBUNDLE_201604',token.id)
				}).then(function(result){
					expect(result).to.exist;
					return ShopModule.purchaseProduct(userId,'STARTERBUNDLE_201604',token.id)
				}).catch(function(error){
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
				})

			})

			it('expect buying an EMOTE Cosmetic to update inventory', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					var productData = SDK.CosmeticsFactory.cosmeticProductAttrsForIdentifier(SDK.CosmeticsLookup.Emote.HealingMysticHappy)
					return ShopModule.purchaseProduct(userId,productData.sku,token.id)
				}).then(function(result){
					expect(result).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_cosmetic_inventory").where('user_id',userId),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("cosmetic-inventory").child(SDK.CosmeticsLookup.Emote.HealingMysticHappy),"value")
					])
				}).spread(function(userRow,cosmeticsRows,cosmeticsSnapshot){
					expect(cosmeticsRows.length).to.equal(1)
					expect(parseInt(cosmeticsRows[0].cosmetic_id)).to.equal(SDK.CosmeticsLookup.Emote.HealingMysticHappy)
					expect(cosmeticsSnapshot.val()).to.exist;
				})
			})

			it('expect trying to buy the same EMOTE Cosmetic twice to fail', function() {
				return SyncModule.wipeUserData(userId)
				.then(function(token){
					return stripe.tokens.createAsync({
						card: {
							"number": 4242424242424242,
							"exp_month": 12,
							"exp_year": 2020,
							"cvc": '123'
						}
					})
				}).then(function(token){
					this.token = token
					var productData = SDK.CosmeticsFactory.cosmeticProductAttrsForIdentifier(SDK.CosmeticsLookup.Emote.HealingMysticHappy)
					return ShopModule.purchaseProduct(userId,productData.sku,this.token.id)
				}).then(function(token){
					var productData = SDK.CosmeticsFactory.cosmeticProductAttrsForIdentifier(SDK.CosmeticsLookup.Emote.HealingMysticHappy)
					return ShopModule.purchaseProduct(userId,productData.sku,this.token.id)
				}).then(function(result){
					expect(result).to.not.exist;
				}).catch(function(error){
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_charges").where('user_id',userId),
						knex.select().from("user_cosmetic_inventory").where('user_id',userId)
					])
				}).spread(function(userRow,chargesRows,cosmeticsRows,cosmeticsSnapshot){
					expect(userRow.purchase_count).to.equal(1)
					expect(chargesRows.length).to.equal(1)
					expect(chargesRows[0].sku).to.equal(SDK.CosmeticsFactory.cosmeticProductAttrsForIdentifier(SDK.CosmeticsLookup.Emote.HealingMysticHappy).sku)
					expect(cosmeticsRows.length).to.equal(1)
				})
			})

			it('expect buying a Cosmetics Bundle to unlock all cosmetics in the bundle', function() {
				return SyncModule.wipeUserData(userId)
				.then(function(token){
					return stripe.tokens.createAsync({
						card: {
							"number": 4242424242424242,
							"exp_month": 12,
							"exp_year": 2020,
							"cvc": '123'
						}
					})
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,"Bundle_Argeon_Emotes",token.id)
				}).then(function(result){
					expect(result).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_cosmetic_inventory").where('user_id',userId),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("cosmetic-inventory").child(SDK.CosmeticsLookup.Emote.Faction1Taunt),"value")
					])
				}).spread(function(userRow,cosmeticsRows,cosmeticsSnapshot){
						expect(cosmeticsRows.length).to.be.at.least(10)
						var cosmeticIdStrings = _.pluck(cosmeticsRows,"cosmetic_id");
						var bundleCosmeticIds = ShopData["bundles"]["Bundle_Argeon_Emotes"]["bundle_cosmetic_ids"];
						var numMatching = 0;
						for (var i = 0, il = cosmeticIdStrings.length; i < il; i++) {
							var cosmeticId = parseInt(cosmeticIdStrings[i]);
							for (var j = 0, jl = bundleCosmeticIds.length; j < jl; j++) {
								if (bundleCosmeticIds[j] === cosmeticId) {
									numMatching++;
									break;
								}
							}
						}
						expect(numMatching).to.equal(cosmeticIdStrings.length);
						expect(cosmeticsSnapshot.val()).to.exist
				})
			})

		});

	})

	describe("ShopModule - STEAM", function() {

		before(function(){
			this.timeout(15000);
			return SyncModule.wipeUserData(userId)
		})

		describe("purchaseProductOnSteam()", function() {

			it('expect to record all data correctly for a steam purchase', function() {

				var orderId = "steam-tx-id"

				return ShopModule.purchaseProductOnSteam({
					userId: userId,
					sku: "BOOSTER3",
					orderId: orderId
				})
				.then(function(result){
					expect(result).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex("users").first().where('id',userId),
						FirebasePromises.once(rootRef.child("users").child(userId),"value"),
						knex("user_charges").select().where('user_id',userId),
						FirebasePromises.once(rootRef.child("user-charges").child(userId).child(orderId),"value"),
						knex.select().from("user_spirit_orbs").where('user_id',userId),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs"),"value")
					])
				}).spread(function(userRow,userSnapshot,chargeRows,userChargeSnapshot,spiritOrbRows,firebaseBoostersSnapshot){

					expect(spiritOrbRows.length).to.equal(2)
					expect(firebaseBoostersSnapshot.val()).to.exist

					expect(userRow.last_purchase_at).to.exist
					expect(userRow.first_purchased_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf())
					expect(userRow.purchase_count).to.equal(1)
					expect(userRow.ltv).to.equal(299)

					expect(chargeRows).to.exist
					expect(chargeRows.length).to.equal(1)
					expect(chargeRows[0].charge_id).to.equal(orderId)
					expect(chargeRows[0].amount).to.equal(userRow.ltv)
					expect(chargeRows[0].payment_type).to.equal("steam")
					expect(chargeRows[0].charge_json).to.exist
					expect(chargeRows[0].sku).to.equal('BOOSTER3')
					expect(chargeRows[0].created_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf())

					expect(userSnapshot.val().ltv).to.equal(userRow.ltv)
				})
			})

		})

	})

	describe("ShopModule - division starter bundles", function() {

		before(function(){
			this.timeout(15000);
			// remove existing stripe customer data
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(fbRootRef){
				this.fbRootRef = fbRootRef;
				return knex('users').first('stripe_customer_id').where('id',userId)
			}).then(function(userRow){
				if (userRow.stripe_customer_id) {
					return stripe.customers.retrieveAsync(userRow.stripe_customer_id)
				}
			}).then(function(customer){
				if (customer)
					return stripe.customers.delAsync(customer.id)
			})
		})

		describe("bronze division starter bundle", function() {

			before(function(){
				return SyncModule.wipeUserData(userId)
			})

			it('expect to receive 5 orbs + that bronze starter bundle acheivement is complete and awarded 3x neutral legendary cards', function() {

				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'BRONZE_DIVISION_STARTER_SPECIAL',token.id)
				}).then(function(result){
					expect(result).to.exist
					return Promise.delay(3000)
				}).then(function(){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_spirit_orbs").where('user_id',userId),
						knex.select().from("user_charges").where('user_id',userId).andWhere('sku','BRONZE_DIVISION_STARTER_SPECIAL'),
						knex.select().from("user_cards").where('user_id',userId),
						knex.select().from("user_achievements").where('user_id',userId),
						FirebasePromises.once(rootRef.child("user-purchase-counts").child(userId),"value")
					])
				}).spread(function(userRow,spiritOrbRows,chargeRows,cardRows,achievementRows,purchaseCountsSnapshot){
					expect(userRow.purchase_count).to.equal(1)
					expect(userRow.last_purchase_at).to.exist
					expect(userRow.last_purchase_at.valueOf()).to.equal(userRow.first_purchased_at.valueOf())
					expect(spiritOrbRows.length).to.equal(5)
					expect(chargeRows.length).to.equal(1)
					expect(cardRows.length).to.equal(1)
					expect(cardRows[0].count).to.equal(3)
					expect(SDK.GameSession.getCardCaches().getCardById(cardRows[0].card_id).rarityId).to.equal(SDK.Rarity.Legendary)
					expect(achievementRows.length).to.equal(1)
					expect(purchaseCountsSnapshot.val()["BRONZE_DIVISION_STARTER_SPECIAL"].count).to.equal(1)
				})
			})

			it('expect NOT to be able to purchase the bronze division bundle twice', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'BRONZE_DIVISION_STARTER_SPECIAL',token.id)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError)
				})
			})

		})

		describe("silver division starter bundle", function() {

			before(function(){
				return SyncModule.wipeUserData(userId)
			})

			it('expect to receive 10 orbs + that silver starter bundle acheivement is complete and awarded 3x neutral epic cards', function() {

				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'SILVER_DIVISION_STARTER_SPECIAL',token.id)
				}).then(function(result){
					expect(result).to.exist
					return Promise.delay(3000)
				}).then(function(){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_spirit_orbs").where('user_id',userId),
						knex.select().from("user_charges").where('user_id',userId).andWhere('sku','SILVER_DIVISION_STARTER_SPECIAL'),
						knex.select().from("user_cards").where('user_id',userId),
						knex.select().from("user_achievements").where('user_id',userId),
						FirebasePromises.once(rootRef.child("user-purchase-counts").child(userId),"value")
					])
				}).spread(function(userRow,spiritOrbRows,chargeRows,cardRows,achievementRows,purchaseCountsSnapshot){
					expect(userRow.purchase_count).to.equal(1)
					expect(userRow.last_purchase_at).to.exist
					expect(userRow.last_purchase_at.valueOf()).to.equal(userRow.first_purchased_at.valueOf())
					expect(spiritOrbRows.length).to.equal(10)
					expect(chargeRows.length).to.equal(1)
					expect(cardRows.length).to.equal(1)
					expect(cardRows[0].count).to.equal(3)
					expect(SDK.GameSession.getCardCaches().getCardById(cardRows[0].card_id).rarityId).to.equal(SDK.Rarity.Epic)
					expect(achievementRows.length).to.equal(1)
					expect(purchaseCountsSnapshot.val()["SILVER_DIVISION_STARTER_SPECIAL"].count).to.equal(1)
				})
			})

			it('expect NOT to be able to purchase the silver division bundle twice', function() {
				return stripe.tokens.createAsync({
					card: {
						"number": 4242424242424242,
						"exp_month": 12,
						"exp_year": 2020,
						"cvc": '123'
					}
				}).then(function(token){
					return ShopModule.purchaseProduct(userId,'SILVER_DIVISION_STARTER_SPECIAL',token.id)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError)
				})
			})

		})

	})

});
*/