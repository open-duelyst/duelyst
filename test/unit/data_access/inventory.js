var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('server/lib/duelyst_firebase_module.coffee');
var Errors = require('server/lib/custom_errors.coffee');
var UsersModule = require('server/lib/data_access/users.coffee');
var InventoryModule = require('server/lib/data_access/inventory.coffee');
var SyncModule = require('server/lib/data_access/sync.coffee');
var FirebasePromises = require('server/lib/firebase_promises.coffee');
var config = require('config/config.js');
var Promise = require('bluebird');
var Logger = require('app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('app/sdk');
var moment = require('moment');
var knex = require('server/lib/data_access/knex');
var generatePushId = require('app/common/generate_push_id');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("inventory module", function() {
	this.timeout(25000);

	var userId = null;
	var fbRootRef = null;

	var unlockableCardSets = [SDK.CardSet.Bloodborn,SDK.CardSet.Unity];

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

				return DuelystFirebase.connect().getRootRef();
			}).then(function(rootRef) {
				fbRootRef = rootRef;
			})
		})
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

	describe("getAllCollectibleSdkCards()", function() {
		it('expect to contain an ACHIEVEMENT card', function() {
			var anyAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(c) {
				return c.getIsUnlockableWithAchievement();
			});
			expect(anyAchievementCard).to.exist
		});
		it('expect to contain a prismatic ACHIEVEMENT card', function() {
			var anyPrismaticAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(c) {
				return c.getIsUnlockablePrismaticWithAchievement();
			});
			expect(anyPrismaticAchievementCard).to.exist
		});
		it('expect to contain a Seven Sisters cards in Legendary group', function() {
			var sunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCardIds(),function(c) { return c == SDK.Cards.Faction1.SunSister })
			sunSister = sunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCards(),function(c) { return c.getId() == SDK.Cards.Faction1.SunSister })
			expect(sunSister).to.exist
		});
		it('expect to contain a prismatic Seven Sisters cards in Legendary group', function() {
			var prismaticSunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCardIds(),function(c) { return c == SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic })
			prismaticSunSister = prismaticSunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getCards(),function(c) { return c.getId() == SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic })
			expect(prismaticSunSister).to.exist
		});
	});

	describe("getAllNonUnlockableCollectibleSdkCards()", function() {
		it('expect NOT to contain any ACHIEVEMENT cards', function() {
			var anyAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getIsUnlockable(false).getCards(),function(c) {
				return c.getIsUnlockableWithAchievement();
			});
			expect(anyAchievementCard).to.not.exist
		});
		it('expect NOT to contain prismatic ACHIEVEMENT cards', function() {
			var anyPrismaticAchievementCard = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getIsUnlockable(false).getCards(),function(c) {
				return c.getIsUnlockableWithAchievement() && c.getIsUnlockablePrismaticWithAchievement();
			});
			expect(anyPrismaticAchievementCard).to.not.exist
		});
		it('expect NOT to contain a Seven Sisters cards in Legendary group', function() {
			var sunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getCardIds(),function(c) { return c == SDK.Cards.Faction1.SunSister })
			sunSister = sunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getCards(),function(c) { return c.getId() == SDK.Cards.Faction1.SunSister })
			expect(sunSister).to.not.exist
		});
		it('expect NOT to contain a prismatic Seven Sisters cards in Legendary group', function() {
			var prismaticSunSister = _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getCardIds(),function(c) { return c == SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic })
			prismaticSunSister = prismaticSunSister || _.find(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getIsCollectible(true).getIsUnlockable(false).getCards(),function(c) { return c.getId() == SDK.Cards.Faction1.SunSister + SDK.Cards.Prismatic })
			expect(prismaticSunSister).to.not.exist
		});
	});

	describe("buyBoosterPacksWithGold()", function() {
		it('expect NOT to be able to buy booster packs with NO gold', function() {

			return InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core)
			.then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
				expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
			});

		});

		it('expect to be able to buy a booster pack for 100 GOLD', function() {

			return knex("users").where('id',userId).update({wallet_gold:100})
			.bind({})
			.then(function(){
				return InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core);
			}).then(function(boosterIds){
				expect(boosterIds).to.exist;
				expect(boosterIds.length).to.equal(1);
				this.spiritOrbId = boosterIds[0];
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where('id',userId),
					knex.select().from("user_spirit_orbs").where('user_id',userId),
					knex.first().from("user_currency_log").where({'user_id':userId,'memo':'spirit orb '+this.spiritOrbId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs"),"value")
				])
			}).spread(function(userRow,spiritOrbRows,currencyLogRow,firebaseWalletSnapshot,firebaseBoostersSnapshot){
				expect(userRow.wallet_gold).to.equal(0);
				expect(currencyLogRow).to.exist;
				expect(currencyLogRow.gold).to.equal(-100);

				var numOrbsFound = 0;
				for (var j = 0, jl = spiritOrbRows.length; j < jl; j++) {
					var spiritOrbRow = spiritOrbRows[j];
					if (spiritOrbRow.id === this.spiritOrbId) {
						numOrbsFound++;
						break;
					}
				}
				expect(numOrbsFound).to.equal(1);

				var fbWallet = firebaseWalletSnapshot.val();
				expect(fbWallet).to.exist;
				expect(fbWallet.gold_amount).to.equal(0);
				expect(fbWallet.updated_at).to.equal(userRow.wallet_updated_at.valueOf());

				var fbBoosters = firebaseBoostersSnapshot.val();
				expect(fbBoosters).to.exist;
			});

		});

		it('expect to be able to buy 3 booster packs for 300 GOLD', function() {

			return knex("users").where('id',userId).update({wallet_gold:300})
			.bind({})
			.then(function(){
				return InventoryModule.buyBoosterPacksWithGold(userId, 3, SDK.CardSet.Core);
			}).then(function(boosterIds){
				this.boosterIds = boosterIds;
				expect(boosterIds).to.exist;
				expect(boosterIds.length).to.equal(3);
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where('id',userId),
					knex.select().from("user_spirit_orbs").where('user_id',userId),
					knex.first().from("user_currency_log").where({'user_id':userId,'memo':'spirit orb '+this.boosterIds[this.boosterIds.length - 1]}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs"),"value")
				])
			}).spread(function(userRow,spiritOrbRows,currencyLogRow,firebaseWalletSnapshot,firebaseBoostersSnapshot){
				expect(userRow.wallet_gold).to.equal(0);
				expect(currencyLogRow).to.exist;
				expect(currencyLogRow.gold).to.equal(-100);

				var numOrbsFound = 0;
				for (var i = 0, il = this.boosterIds.length; i < il; i++) {
					var boosterId = this.boosterIds[i];
					for (var j = 0, jl = spiritOrbRows.length; j < jl; j++) {
						var spiritOrbRow = spiritOrbRows[j];
						if (spiritOrbRow.id === boosterId) {
							numOrbsFound++;
							break;
						}
					}
				}
				expect(numOrbsFound).to.equal(3);

				var fbWallet = firebaseWalletSnapshot.val();
				expect(fbWallet).to.exist;
				expect(fbWallet.gold_amount).to.equal(0);
				expect(fbWallet.updated_at).to.equal(userRow.wallet_updated_at.valueOf());

				var fbBoosters = firebaseBoostersSnapshot.val();
				expect(fbBoosters).to.exist;
			});

		});

		it('expect NOT to be able to buy booster packs with INSUFFICIENT gold', function() {

			return knex("users").where('id',userId).update({wallet_gold:20})
			.then(function(result){
				return InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core);
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
				expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
			});

		});

		it('expect to be able to buy a shimzar booster pack for 100 GOLD', function() {

			return knex("users").where('id',userId).update({wallet_gold:100})
				.bind({})
				.then(function(){
					return InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Shimzar);
				}).then(function(boosterIds){
					expect(boosterIds).to.exist;
					expect(boosterIds.length).to.equal(1);
					this.spiritOrbId = boosterIds[0];
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.first().from("users").where('id',userId),
						knex.select().from("user_spirit_orbs").where('user_id',userId),
						knex.first().from("user_currency_log").where({'user_id':userId,'memo':'spirit orb '+this.spiritOrbId}),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs"),"value")
					])
				}).spread(function(userRow,spiritOrbRows,currencyLogRow,firebaseWalletSnapshot,firebaseBoostersSnapshot){
					expect(userRow.wallet_gold).to.equal(0);
					expect(currencyLogRow).to.exist;
					expect(currencyLogRow.gold).to.equal(-100);

					var numOrbsFound = 0;
					for (var j = 0, jl = spiritOrbRows.length; j < jl; j++) {
						var spiritOrbRow = spiritOrbRows[j];
						if (spiritOrbRow.id === this.spiritOrbId) {
							numOrbsFound++;
							break;
						}
					}
					expect(numOrbsFound).to.equal(1);

					var fbWallet = firebaseWalletSnapshot.val();
					expect(fbWallet).to.exist;
					expect(fbWallet.gold_amount).to.equal(0);
					expect(fbWallet.updated_at).to.equal(userRow.wallet_updated_at.valueOf());

					var fbBoosters = firebaseBoostersSnapshot.val();
					expect(fbBoosters).to.exist;
				});

		});

	});

	for (var i=0;i<unlockableCardSets.length;i++) {
		var cardSetId = unlockableCardSets[i];
		var cardSetSDKData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
		describe("addBoosterPackToUser() - " + cardSetSDKData.name, function () {
			it('expect to be able to add 5 ' + cardSetSDKData.name + ' packs to a user', function () {
				this.timeout(100000);

				return SyncModule.wipeUserData(userId)
					.then(function () {
						var txPromise = knex.transaction(function (tx) {
							return knex("users").where('id', userId)
								.bind({})
								.then(function () {
									var promises = [];
									for (var i = 0, il = 5; i < il; i++) {
										promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, "soft", i));
									}
									return Promise.all(promises);
								});
						});

						return txPromise;
					});
			});

			it('expect to be able to add 13 ' + cardSetSDKData.name + ' packs to a user', function () {
				this.timeout(100000);

				return SyncModule.wipeUserData(userId)
					.then(function () {
						var txPromise = knex.transaction(function (tx) {
							return knex("users").where('id', userId)
								.bind({})
								.then(function () {
									var promises = [];
									for (var i = 0, il = 13; i < il; i++) {
										promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, "soft", i));
									}
									return Promise.all(promises);
								});
						});

						return txPromise;
					});
			});

			it('expect to be able to add 5 ' + cardSetSDKData.name + ' packs to a user, but then fail to add 10 more', function () {
				this.timeout(100000);

				return SyncModule.wipeUserData(userId)
					.then(function () {
						var txPromise = knex.transaction(function (tx) {
							return knex("users").where('id', userId)
								.bind({})
								.then(function () {
									var promises = [];
									for (var i = 0, il = 5; i < il; i++) {
										promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, "soft", i));
									}
									return Promise.all(promises);
								});
						});

						return txPromise
							.then(function () {
								var txFailPromise = knex.transaction(function (tx) {
									return knex("users").where('id', userId)
										.bind({})
										.then(function () {
											var promises = [];
											for (var i = 0, il = 10; i < il; i++) {
												promises.push(InventoryModule.addBoosterPackToUser(txFailPromise, tx, userId, cardSetId, "soft", i));
											}
											return Promise.all(promises);
										});
								});
								return txFailPromise;
							}).then(function (results) {
								// Should never reach here
								expect(results).to.not.exist;
								expect(results).to.exist;
							}).catch(function (error) {
								expect(error).to.exist;
								expect(error).to.not.be.an.instanceof(chai.AssertionError);
								expect(error).to.be.an.instanceof(Errors.MaxOrbsForSetReachedError);
							});
					});
			});
		});
	}

	describe("addRemainingOrbsForCardSetToUser", function () {
		it('expect to be able to add a full set of orbs to user with no orbs for that set, expect no gold to be awarded', function () {
			return SyncModule.wipeUserData(userId)
			.then(function () {
				var txPromise = knex.transaction(function (tx) {
					return InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, "qa unit test", generatePushId())
				});
				return txPromise;
			}).then(function() {
				return Promise.all([
					knex("users").where("id",userId).first(),
					knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn)
				])
			}).spread(function(userRow,userOrbRows){
				expect(userRow.wallet_gold).to.equal(0);
				expect(userRow.total_orb_count_set_3).to.equal(13);
				expect(userOrbRows.length).to.equal(13);
			});

		});

		it('expect to be able to add a full set of orbs to user with 3 orbs for that set, expect 900 gold to be awarded', function () {
			this.timeout(100000);
			return SyncModule.wipeUserData(userId)
			.then(function () {
				var txPromise = knex.transaction(function (tx) {
					return Promise.all([
						InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
						InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
						InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId())
					])
				});
				return txPromise;
			}).then(function () {
				var txPromise = knex.transaction(function (tx) {
					return InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, "qa unit test", generatePushId())
				});
				return txPromise;
			}).then(function() {
				return Promise.all([
					knex("users").where("id",userId).first(),
					knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn)
				])
			}).spread(function(userRow,userOrbRows){
				expect(userRow.wallet_gold).to.equal(3*300);
				expect(userRow.total_orb_count_set_3).to.equal(13);
				expect(userOrbRows.length).to.equal(13);
			});
		});

		it('expect to be able to add a full set of orbs to user with 3 orbs for that set, expect 900 gold to be awarded', function () {
			this.timeout(100000);
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return Promise.all([
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId())
						])
					});
					return txPromise;
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, "qa unit test", generatePushId())
					});
					return txPromise;
				}).then(function() {
					return Promise.all([
						knex("users").where("id",userId).first(),
						knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn)
					])
				}).spread(function(userRow,userOrbRows){
					expect(userRow.wallet_gold).to.equal(3*300);
					expect(userRow.total_orb_count_set_3).to.equal(13);
					expect(userOrbRows.length).to.equal(13);
				});
		});

		it('expect to be able to add a full set of orbs to user with 3 orbs for that set, expect 900 spirit to be awarded', function () {
			this.timeout(100000);
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return Promise.all([
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId())
						])
					});
					return txPromise;
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, true, "qa unit test", generatePushId())
					});
					return txPromise;
				}).then(function() {
					return Promise.all([
						knex("users").where("id",userId).first(),
						knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn)
					])
				}).spread(function(userRow,userOrbRows){
					expect(userRow.wallet_spirit).to.equal(3*300);
					expect(userRow.total_orb_count_set_3).to.equal(13);
					expect(userOrbRows.length).to.equal(13);
				});

		});

		it('expect to be not fail when trying to add remaining set of orbs to user with max orbs for that set, expect no gold to be awarded', function () {
			this.timeout(100000);
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return Promise.all([
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),//5
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),//10
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId()),
							InventoryModule.addBoosterPackToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, "qa unit test", generatePushId())
						])
					});
					return txPromise;
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.addRemainingOrbsForCardSetToUser(txPromise, tx, userId, SDK.CardSet.Bloodborn, false, "qa unit test", generatePushId())
					});
					return txPromise;
				}).then(function(result) {
					// Never reach
					expect(result).to.exist
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.not.be.an.instanceof(chai.AssertionError);
					expect(error).to.be.an.instanceof(Errors.MaxOrbsForSetReachedError);

					return Promise.all([
						knex("users").where("id",userId).first(),
						knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn)
					])
				}).spread(function(userRow,userOrbRows){
					expect(userRow.wallet_gold).to.equal(0);
					expect(userRow.total_orb_count_set_3).to.equal(13);
					expect(userOrbRows.length).to.equal(13);
				});

		});
	})

	describe("buyRemainingSpiritOrbsWithSpirit", function () {
		it('expect to fail to buy remaining orbs with spirit with insufficient spirit', function () {
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						console.log("user id: " + userId)
						return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Bloodborn)
					});
					return txPromise;
				}).then(function(result) {
					// Should not reach
					expect(result).to.exist;
					expect(result).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.not.be.an.instanceof(chai.AssertionError);
					expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
				});
		});

		it('expect to fail to buy remaining orbs for set with no spirit cost', function () {
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.giveUserSpirit(txPromise,tx,userId,4000,"qa gift");
					});
					return txPromise;
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						console.log("user id: " + userId)
						return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Core)
					});
					return txPromise;
				}).then(function(result) {
					// Should not reach
					expect(result).to.exist;
					expect(result).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.not.be.an.instanceof(chai.AssertionError);
					expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
				});
		});

		it('expect to be able to buy entire set of spirit orbs with sufficient spirit', function () {
			var fullSetSpiritCost = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Bloodborn).fullSetSpiritCost
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.giveUserSpirit(txPromise,tx,userId,fullSetSpiritCost,"qa gift");
					});
					return txPromise;
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Bloodborn)
					});
					return txPromise;
				}).then(function(result) {
					// Should not reach
					expect(result).to.exist;
					expect(result).to.equal(13);

					return Promise.all([
						knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn),
						knex("users").first("wallet_spirit").where("id",userId)
					])
				}).spread(function(spiritOrbs,userRow) {
					expect(spiritOrbs).to.exist;
					expect(spiritOrbs.length).to.equal(13);
					for(var i=0;i<spiritOrbs.length;i++) {
						expect(spiritOrbs[i].card_set).to.equal(SDK.CardSet.Bloodborn);
					}
					expect(userRow.wallet_spirit).to.equal(0);
				});
		});

		it('expect to be able to buy remaining set of spirit orbs with sufficient spirit and get correct spirit refund (and no gold)', function () {
			var fullSetSpiritCost = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Bloodborn).fullSetSpiritCost
			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return Promise.all([
							InventoryModule.giveUserSpirit(txPromise,tx,userId,fullSetSpiritCost,"qa gift"),
							InventoryModule.addBoosterPackToUser(txPromise,tx,userId,SDK.CardSet.Bloodborn,"qa gift"),
							InventoryModule.addBoosterPackToUser(txPromise,tx,userId,SDK.CardSet.Bloodborn,"qa gift"),
							InventoryModule.addBoosterPackToUser(txPromise,tx,userId,SDK.CardSet.Bloodborn,"qa gift")
						])
					});
					return txPromise;
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.buyRemainingSpiritOrbsWithSpirit(userId, SDK.CardSet.Bloodborn)
					});
					return txPromise;
				}).then(function(result) {
					// Should not reach
					expect(result).to.exist;
					expect(result).to.equal(10);

					return Promise.all([
						knex("user_spirit_orbs").where("user_id",userId).andWhere("card_set",SDK.CardSet.Bloodborn),
						knex("users").first("wallet_spirit","wallet_gold").where("id",userId)
					])
				}).spread(function(spiritOrbs,userRow) {
					expect(spiritOrbs).to.exist;
					expect(spiritOrbs.length).to.equal(13);
					for(var i=0;i<spiritOrbs.length;i++) {
						expect(spiritOrbs[i].card_set).to.equal(SDK.CardSet.Bloodborn);
					}
					expect(userRow.wallet_spirit).to.equal(3*300);
					expect(userRow.wallet_gold).to.equal(0);
				});
		});
	});

	for (var i=0;i<unlockableCardSets.length;i++) {
		var cardSetId = unlockableCardSets[i];
		var cardSetSDKData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
		describe("unlockBoosterPack() - " + cardSetSDKData.name + " set", function () {
			it('expect to open 13 bloodborn orbs 3 times and always end up with exactly the same cards', function () {
				this.timeout(50000);
				var allBBCardIds = SDK.GameSession.getCardCaches().getCardSet(cardSetId).getIsUnlockable(true).getIsPrismatic(false).getCardIds()
				expect(allBBCardIds.length).to.equal(39)

				var iterations = 3;
				var count = 0;

				var stepIt = function () {
					count += 1;
					if (count > iterations) {
						return Promise.resolve()
					}

					return SyncModule.wipeUserData(userId)
						.then(function () {

							var txPromise = knex.transaction(function (tx) {
								return knex("users").where('id', userId)
									.bind({})
									.then(function () {
										var promises = [];
										for (var i = 0; i < 13; i++) {
											promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, cardSetId, "soft", i));
										}
										return Promise.all(promises);
									});
							});

							return txPromise
						}).then(function () {
							var txPromise = knex.transaction(function (tx) {
								return tx("user_spirit_orbs").where('user_id', userId)
									.bind({})
									.then(function (spiritOrbRows) {
										var promises = [];
										expect(spiritOrbRows.length).to.equal(13);
										for (var i = 0; i < spiritOrbRows.length; i++) {
											promises.push(InventoryModule.unlockBoosterPack(userId, spiritOrbRows[i].id));
										}
										return Promise.all(promises);
									});
							});
							return txPromise
						}).then(function () {
							return knex("user_cards").where("user_id", userId)
						}).then(function (userCardRows) {
							expect(userCardRows.length).to.equal(39);
							for (var i = 0; i < userCardRows.length; i++) {
								row = userCardRows[i];
								expect(row.count).to.equal(3);
								expect(_.contains(allBBCardIds, row.card_id)).to.equal(true);
								sdkCard = SDK.GameSession.getCardCaches().getCardById(row.card_id);
								expect(sdkCard.getCardSetId()).to.equal(cardSetId);
							}

							return stepIt()
						})
				}

				return stepIt()
			});
		});
	}

	describe("unlockBoosterPack()", function() {

		var openedBoosterId = null;

		it('expect NOT to be able to unlock and INVALID booster pack ID', function() {

			return InventoryModule.unlockBoosterPack(userId,"invalid-pack-id")
			.then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});

		});

		it('expect NOT to be able to unlock a booster that does not belong to you', function() {

			return knex("user_spirit_orbs").insert({
				id:"valid-pack-id",
				user_id:"some-other-test-user"
			}).then(function(){
				return InventoryModule.unlockBoosterPack(userId,"valid-pack-id");
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});

		});

		it('expect to get 5 core set cards for unlocking one of your core set boosters', function() {

			return knex("users").where('id',userId).update({wallet_gold:100})
			.bind({})
			.then(function(){
				return InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Core);
			}).then(function(boosterIds){
				expect(boosterIds).to.exist;
				expect(boosterIds.length).to.equal(1);
				this.boosterId = openedBoosterId = boosterIds[0];
				return InventoryModule.unlockBoosterPack(userId,openedBoosterId);
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("user_spirit_orbs").where({'id':this.boosterId}),
					knex.first().from("user_spirit_orbs_opened").where({'id':this.boosterId}),
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.select().from("user_card_log").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs").child(this.boosterId),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs-opened").child(this.boosterId),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(spiritOrb,spiritOrbUsed,cardCountRows,cardLogRows,cardCollection,fbPack,fbPackUsed,fbCardCollection){

				expect(spiritOrb).to.not.exist;

				expect(spiritOrbUsed).to.exist;
				expect(spiritOrbUsed.cards).to.exist;
				expect(spiritOrbUsed.cards.length).to.equal(5);

				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.be.above(0);

				expect(cardLogRows).to.exist;
				expect(cardLogRows.length).to.be.above(0);

				expect(cardCollection).to.exist;

				expect(fbPack.val()).to.not.exist;
				// expect(fbPackUsed.val()).to.exist;

				expect(fbCardCollection.val()).to.exist;
				expect(fbCardCollection.val()).to.exist;

				var allCards = SDK.GameSession.getCardCaches().getCards();
				_.each(spiritOrbUsed.cards,function(cardId){

					var card = _.find(allCards, function (c) { return c.getId() === cardId; });
					var cardCountRow = _.find(cardCountRows,function(row){ return row.card_id === cardId; });
					var cardLogCardRows = _.filter(cardLogRows,function(row){ return row.card_id === cardId; });
					var cardCollectionItem = cardCollection.cards[cardId];
					var fbCardCollectionItem = fbCardCollection.val()[cardId];

					expect(card).to.exist;
					expect(card.getCardSetId()).to.equal(SDK.CardSet.Core);
					expect(cardCountRow).to.exist;
					expect(cardLogCardRows.length).to.be.above(0);
					expect(cardCollectionItem).to.exist;
					expect(fbCardCollectionItem).to.exist;

					expect(cardCountRow.count).to.equal(cardLogCardRows.length);
					expect(cardCollectionItem.count).to.equal(cardLogCardRows.length);
					expect(fbCardCollectionItem.count).to.equal(cardLogCardRows.length);
				});
			});

		});

		it('expect to get 5 shimzar set cards for unlocking one of your shimzar set boosters', function() {

			return knex("users").where('id',userId).update({wallet_gold:100})
			.bind({})
			.then(function(){
				return InventoryModule.buyBoosterPacksWithGold(userId, 1, SDK.CardSet.Shimzar);
			}).then(function(boosterIds){
				expect(boosterIds).to.exist;
				expect(boosterIds.length).to.equal(1);
				this.boosterId = openedBoosterId = boosterIds[0];
				return InventoryModule.unlockBoosterPack(userId,openedBoosterId);
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("user_spirit_orbs").where({'id':this.boosterId}),
					knex.first().from("user_spirit_orbs_opened").where({'id':this.boosterId}),
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.select().from("user_card_log").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs").child(this.boosterId),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs-opened").child(this.boosterId),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(spiritOrb,spiritOrbUsed,cardCountRows,cardLogRows,cardCollection,fbPack,fbPackUsed,fbCardCollection){

				expect(spiritOrb).to.not.exist;

				expect(spiritOrbUsed).to.exist;
				expect(spiritOrbUsed.cards).to.exist;
				expect(spiritOrbUsed.cards.length).to.equal(5);

				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.be.above(0);

				expect(cardLogRows).to.exist;
				expect(cardLogRows.length).to.be.above(0);

				expect(cardCollection).to.exist;

				expect(fbPack.val()).to.not.exist;
				// expect(fbPackUsed.val()).to.exist;

				expect(fbCardCollection.val()).to.exist;
				expect(fbCardCollection.val()).to.exist;

				var allCards = SDK.GameSession.getCardCaches().getCards();
				_.each(spiritOrbUsed.cards,function(cardId){

					var card = _.find(allCards, function (c) { return c.getId() === cardId; });
					var cardCountRow = _.find(cardCountRows,function(row){ return row.card_id == cardId; });
					var cardLogCardRows = _.filter(cardLogRows,function(row){ return row.card_id == cardId; });
					var cardCollectionItem = cardCollection.cards[cardId];
					var fbCardCollectionItem = fbCardCollection.val()[cardId];

					expect(card).to.exist;
					expect(card.getCardSetId()).to.equal(SDK.CardSet.Shimzar);
					expect(cardCountRow).to.exist;
					expect(cardLogCardRows.length).to.be.above(0);
					expect(cardCollectionItem).to.exist;
					expect(fbCardCollectionItem).to.exist;

					expect(cardCountRow.count).to.equal(cardLogCardRows.length);
					expect(cardCollectionItem.count).to.equal(cardLogCardRows.length);
					expect(fbCardCollectionItem.count).to.equal(cardLogCardRows.length);

				});

			});

		});

		it('expect cards you received from the booster to be marked as NEW and UNREAD', function() {

			return DuelystFirebase.connect().getRootRef()
			.then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.select().from("user_card_log").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardLogRows,cardCollection,fbCardCollection){
				_.each(cardCountRows,function(row) {
					expect(row.is_new).to.equal(true);
					expect(row.is_unread).to.equal(true);
					expect(cardCollection.cards[row.card_id].is_new).to.equal(true);
					expect(cardCollection.cards[row.card_id].is_unread).to.equal(true);
					expect(fbCardCollection.val()[row.card_id].is_new).to.equal(true);
					expect(fbCardCollection.val()[row.card_id].is_unread).to.equal(true);
				})
			});
		});

		it('expect unlocking a booster to mark it as used', function() {
			return DuelystFirebase.connect().getRootRef()
			.then(function(rootRef){
				return Promise.all([
					knex.first().from("user_spirit_orbs").where({'id':openedBoosterId}),
					knex.first().from("user_spirit_orbs_opened").where({'id':openedBoosterId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs").child(openedBoosterId),"value")
				])
			}).spread(function(spiritOrb,spiritOrbUsed,fbPack){
				expect(spiritOrb).to.not.exist;
				expect(spiritOrbUsed).to.exist;
				expect(fbPack.val()).to.not.exist;
			});
		});

		it('expect that unlocking 5 packs concurrently works', function() {

			return knex("users").where('id',userId).update({wallet_gold:500})
			.bind({})
			.then(function(){
				return InventoryModule.buyBoosterPacksWithGold(userId, 5, SDK.CardSet.Core);
			}).then(function(boosterIds){
				var all = [];
				_.each(boosterIds,function(boosterId){
					all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
				})
				return Promise.all(all);
			}).then(function(results){
					expect(results).to.exist
					expect(results.length).to.equal(5);
			});
		});

		it('expect that no unlockable cards are rewarded by unlocking ~100 boosters', function() {
			this.timeout(100000);

			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return knex("users").where('id',userId)
							.bind({})
							.then(function(){
								var promises = [];
								for (var i = 0, il = 100; i < il; i++) {
									promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i));
								}
								return Promise.all(promises);
							});
					});

				return txPromise
				.then(function(boosterIds){
					return Promise.map(boosterIds,function(boosterId){
						return InventoryModule.unlockBoosterPack(userId,boosterId);
					});
				}).then(function(results) {
						var allCards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();
						for (var i = 0, il = results.length; i < il; i++) {
							var cardIds = results[i].cards;
							for (var j = 0, jl = cardIds.length; j < jl; j++) {
								var cardId = cardIds[j];
								var card = _.find(allCards, function (c) { return c.id === cardId});
								expect(card).to.exist;
								expect(card.getIsUnlockable()).to.equal(false);
							}
						}
				});
			});
		});

		it('expect that no skinned cards are rewarded by unlocking ~100 boosters', function() {
			this.timeout(100000);

			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return knex("users").where('id',userId)
							.bind({})
							.then(function(){
								var promises = [];
								for (var i = 0, il = 100; i < il; i++) {
									promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i));
								}
								return Promise.all(promises);
							});
					});

					return txPromise
						.then(function(boosterIds){
							return Promise.map(boosterIds,function(boosterId){
								return InventoryModule.unlockBoosterPack(userId,boosterId);
							});
						}).then(function(results) {
							var cardCaches = SDK.GameSession.getCardCaches();
							for (var i = 0, il = results.length; i < il; i++) {
								var cardIds = results[i].cards;
								for (var j = 0, jl = cardIds.length; j < jl; j++) {
									var cardId = cardIds[j];
									var card = cardCaches.getCardById(cardId);
									expect(card).to.exist;
									expect(SDK.Cards.getIsSkinnedCardId(card.getId())).to.equal(false);
								}
							}
						});
				});
		});

		//
		it('expect that no legacy cards are rewarded by unlocking ~500 boosters', function() {
			this.timeout(200000);

			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return knex("users").where('id',userId)
							.bind({})
							.then(function(){
								var promises = [];
								var arrayToMap = []
								for (var i = 0, il = 500; i < il; i++) {
									//promises.push(InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i));
									arrayToMap.push(1);
								}
								//return Promise.all(promises);
								return Promise.map(arrayToMap, function (i) {
									return InventoryModule.addBoosterPackToUser(txPromise, tx, userId, 1, "soft", i)
								}, {concurrency:2})
							});
					});

					return txPromise
						.then(function(boosterIds){
							return Promise.map(boosterIds,function(boosterId){
								return InventoryModule.unlockBoosterPack(userId,boosterId);
							});
						}).then(function(results) {
							var cardCaches = SDK.GameSession.getCardCaches();
							for (var i = 0, il = results.length; i < il; i++) {
								var cardIds = results[i].cards;
								for (var j = 0, jl = cardIds.length; j < jl; j++) {
									var cardId = cardIds[j];
									var card = cardCaches.getCardById(cardId);
									expect(card).to.exist;
									expect(card.getIsLegacy()).to.equal(false);
								}
							}
						});
				});
		});

	});

	describe("giveUserCosmeticId()", function() {

		var openedBoosterId = null;

		it('expect a user to be able to receive a cosmetic by id', function() {

			return knex("user_cosmetic_inventory").where("user_id", userId).delete()
			.then(function() {
				trxPromise = knex.transaction(function(tx) {
					return InventoryModule.giveUserCosmeticId(trxPromise, tx, userId, SDK.CosmeticsLookup.Emote.HealingMysticHappy, "QA GIFT", "QA GIFT 1")
				});
				return trxPromise;
			}).then(function(result) {
				expect(result).to.exist;
				expect(result.cosmetic_id).to.exist;
				// Spirit is only present if they already have this cosmetic id
				expect(result.spirit).to.not.exist;
				expect(result.cosmetic_id).to.equal(SDK.CosmeticsLookup.Emote.HealingMysticHappy)

				return knex("user_cosmetic_inventory").first().where("user_id", userId)
			}).then(function(cosmeticRow) {
				expect(cosmeticRow).to.exist;
				expect(cosmeticRow.user_id).to.equal(userId);
				expect(cosmeticRow.transaction_type).to.equal("QA GIFT");
				expect(cosmeticRow.transaction_id).to.equal("QA GIFT 1");
			});
		});

		it('expect a user to receive spirit the second time they receive the same cosmetic by id', function() {
			return knex("user_cosmetic_inventory").where("user_id", userId).delete()
			.bind({})
			.then(function() {
				return knex("users").where("id", userId).first("wallet_spirit")
			}).then(function(userRow) {
				this.userSpiritBefore = userRow.wallet_spirit;

				trxPromise = knex.transaction(function(tx) {
					return InventoryModule.giveUserCosmeticId(trxPromise, tx, userId, SDK.CosmeticsLookup.Emote.HealingMysticHappy, "QA GIFT", "QA GIFT 1")
				});
				return trxPromise;
			}).then(function() {
				trxPromise = knex.transaction(function(tx) {
					return InventoryModule.giveUserCosmeticId(trxPromise, tx, userId, SDK.CosmeticsLookup.Emote.HealingMysticHappy, "QA GIFT", "QA GIFT 1")
				});
				return trxPromise;
			}).then(function(result) {
				expect(result).to.exist;
				expect(result.cosmetic_id).to.exist;
				expect(result.spirit).to.exist;

				return knex("users").where("id", userId).first("wallet_spirit")
			}).then(function(userRow) {
				expect(userRow.wallet_spirit > this.userSpiritBefore).to.equal(true);
			})
		});

	});

	describe("craftCard()", function() {

		before(function(){
			return SyncModule.wipeUserData(userId)
		})

		// save current state of allCardsAvailable as the next few tests will change it
		var allCardsAvailableBefore = config.get("allCardsAvailable")

		describe("when ALL_CARDS_AVAILABLE is FALSE",function(){
			// before cleanup to check if user already exists and delete
			before(function(){
				this.timeout(25000);
				process.env.ALL_CARDS_AVAILABLE = false
				config.set("allCardsAvailable",false)
				InventoryModule._allCollectibleCards = null
				return DuelystFirebase.connect().getRootRef()
				.bind({})
				.then(function(fbRootRef){
					return Promise.all([
						FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("card-collection")),
						knex("user_cards").where('user_id',userId).delete(),
						knex("user_card_log").where('user_id',userId).delete(),
						knex("user_card_collection").where('user_id',userId).delete(),
					])
				})
			})

			it('expect NOT to be able to craft a COMMON card with 0 spirit', function() {

				return InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
				.then(function(result){
					expect(result).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.not.be.an.instanceof(chai.AssertionError);
					expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
				});

			});

			it('expect to be able to craft a COMMON card with 40 spirit in wallet', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:40
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
				}).then(function(result){
					expect(result).to.exist;
				});

			});

			it('expect the crafted card to appear in your inventory as new/unread', function() {

				return DuelystFirebase.connect().getRootRef()
				.then(function(rootRef){
					return Promise.all([
						knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}),
						knex.select().from("user_card_log").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}),
						knex.first().from("user_card_collection").where({'user_id':userId}),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
					])
				}).spread(function(cardCountRows,cardLogRows,cardCollection,fbCardCollection){
					expect(cardCountRows).to.exist;
					expect(cardCountRows.length).to.equal(1);
					expect(cardCountRows[0].count).to.equal(1);
					expect(cardCountRows[0].is_unread).to.equal(true);
					expect(cardCountRows[0].is_new).to.equal(true);

					expect(cardLogRows).to.exist;
					expect(cardLogRows.length).to.equal(1);
					expect(cardLogRows[0].source_type).to.equal("craft");

					expect(cardCollection).to.exist;
					expect(cardCollection.cards).to.exist;
					expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser].count).to.equal(1);
					expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser].is_unread).to.equal(true);
					expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser].is_new).to.equal(true);

					expect(fbCardCollection.val()).to.exist;
					expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].count).to.equal(1);
					expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].is_unread).to.equal(true);
					expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].is_new).to.equal(true);
				});

			});

			it('expect to be left with 0 spirit in wallet', function() {

				return knex("users").first().where('id',userId).then(function(userRow){
					expect(userRow.wallet_spirit).to.equal(0);
				});

			});

			it('expect NOT to be able to craft a RARE card with 40 spirit in wallet', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:40
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.IroncliffeGuardian)
				}).then(function(result){
					expect(result).to.not.exist;
				}).catch(function(error){
					expect(error).to.exist;
					expect(error).to.not.be.an.instanceof(chai.AssertionError);
					expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
				});

			});

			it('expect to be able to craft a RARE card with 100 spirit in wallet', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:100
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.IroncliffeGuardian)
				}).then(function(result){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.IroncliffeGuardian}),
						knex.select().from("user_card_log").where({'user_id':userId,'card_id':SDK.Cards.Faction1.IroncliffeGuardian}),
						knex.first().from("user_card_collection").where({'user_id':userId}),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
					])
				}).spread(function(cardCountRows,cardLogRows,cardCollection,fbCardCollection){
					expect(cardCountRows).to.exist;
					expect(cardCountRows.length).to.equal(1);
					expect(cardCountRows[0].count).to.equal(1);
					expect(cardCountRows[0].is_unread).to.equal(true);
					expect(cardCountRows[0].is_new).to.equal(true);

					expect(cardLogRows).to.exist;
					expect(cardLogRows.length).to.equal(1);
					expect(cardLogRows[0].source_type).to.equal("craft");

					expect(cardCollection).to.exist;
					expect(cardCollection.cards).to.exist;
					expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
					expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].is_unread).to.equal(true);
					expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].is_new).to.equal(true);

					expect(fbCardCollection.val()).to.exist;
					expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
					expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].is_unread).to.equal(true);
					expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].is_new).to.equal(true);
				});

			});

			it('expect NOT to be able to craft a BASIC card', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:100
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.SilverguardKnight)
				}).then(function(result){
					expect(result).to.not.exist;
				}).catch(function(error){
					expect(error).to.not.be.an.instanceof(chai.AssertionError);
					expect(error).to.be.an.instanceof(Errors.BadRequestError);
				});

			});

			it('expect NOT to be able to craft a normal ACHIEVEMENT card', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:900
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Neutral.SwornSister)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})

			})

			it('expect NOT to be able to craft a card unlocked only through spirit orbs', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:900
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction5.Drogon)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})

			})

			it('expect NOT to be able to craft a card that becomes available in the future', function() {

				var sunstoneTemplar = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === SDK.Cards.Faction1.SunstoneTemplar});
				sunstoneTemplar.setAvailableAt(moment().utc().add(1,'days'))

				return knex("users").where('id',userId).update({
					wallet_spirit:1000
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.SunstoneTemplar)
				}).then(function(result){
					expect(result).to.not.exist
				}).catch(function(error){
					expect(error).to.not.be.an.instanceof(chai.AssertionError)
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
					expect(error.message).to.equal("Could not craft card "+SDK.Cards.Faction1.SunstoneTemplar+". It's not yet available.")
				})

			})

			it('expect to be able to craft a card that is NOW available', function() {

				var sunstoneTemplar = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === SDK.Cards.Faction1.SunstoneTemplar});
				sunstoneTemplar.setAvailableAt(moment().utc().subtract(1,'days'))

				return knex("users").where('id',userId).update({
					wallet_spirit:1000
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.SunstoneTemplar)
				}).then(function(result){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.SunstoneTemplar}),
						knex.select().from("user_card_log").where({'user_id':userId,'card_id':SDK.Cards.Faction1.SunstoneTemplar}),
						knex.first().from("user_card_collection").where({'user_id':userId}),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
					])
				}).spread(function(cardCountRows,cardLogRows,cardCollection,fbCardCollection){
					expect(cardCountRows).to.exist;
					expect(cardCountRows.length).to.equal(1);
					expect(cardCountRows[0].count).to.equal(1);
					expect(cardCountRows[0].is_unread).to.equal(true);
					expect(cardCountRows[0].is_new).to.equal(true);

					expect(cardLogRows).to.exist;
					expect(cardLogRows.length).to.equal(1);
					expect(cardLogRows[0].source_type).to.equal("craft");

					expect(cardCollection).to.exist;
					expect(cardCollection.cards).to.exist;
					expect(cardCollection.cards[SDK.Cards.Faction1.SunstoneTemplar].count).to.equal(1);
					expect(cardCollection.cards[SDK.Cards.Faction1.SunstoneTemplar].is_unread).to.equal(true);
					expect(cardCollection.cards[SDK.Cards.Faction1.SunstoneTemplar].is_new).to.equal(true);

					expect(fbCardCollection.val()).to.exist;
					expect(fbCardCollection.val()[SDK.Cards.Faction1.SunstoneTemplar].count).to.equal(1);
					expect(fbCardCollection.val()[SDK.Cards.Faction1.SunstoneTemplar].is_unread).to.equal(true);
					expect(fbCardCollection.val()[SDK.Cards.Faction1.SunstoneTemplar].is_new).to.equal(true);
				});

			});

			it('expect to not be able to craft a card with a skin applied', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:10000
				})
					.then(function(){
						return InventoryModule.craftCard(userId, SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1))
					})
					.then(function(result){
						expect(result).to.not.exist;
					})
					.catch(function(error){
						expect(error).to.exist;
						expect(error).to.not.be.an.instanceof(chai.AssertionError);
					})

			});

			it('expect to not be able to craft a prismatic card with a skin applied', function() {

				return knex("users").where('id',userId).update({
					wallet_spirit:10000
				})
					.then(function(){
						return InventoryModule.craftCard(userId, SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1))
					})
					.then(function(result){
						expect(result).to.not.exist;
					})
					.catch(function(error){
						expect(error).to.exist;
						expect(error).to.not.be.an.instanceof(chai.AssertionError);
					})

			});

		})

		describe("when ALL_CARDS_AVAILABLE is TRUE",function(){
			// before cleanup to check if user already exists and delete
			before(function(){
				this.timeout(25000);
				process.env.ALL_CARDS_AVAILABLE = true
				config.set("allCardsAvailable",true)
				InventoryModule._allCollectibleCards = null
				return DuelystFirebase.connect().getRootRef()
				.bind({})
				.then(function(fbRootRef){
					return Promise.all([
						FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("card-collection")),
						knex("user_cards").where('user_id',userId).delete(),
						knex("user_card_log").where('user_id',userId).delete(),
						knex("user_card_collection").where('user_id',userId).delete(),
					])
				})
			})

			// before cleanup to check if user already exists and delete
			after(function(){
				this.timeout(25000);
				process.env.ALL_CARDS_AVAILABLE = allCardsAvailableBefore
				config.set("allCardsAvailable",allCardsAvailableBefore)
				InventoryModule._allCollectibleCards = null
			})

			it('expect to be able to craft a card that becomes available in the future', function() {

				var sunstoneTemplar = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === SDK.Cards.Faction1.SunstoneTemplar});
				sunstoneTemplar.setAvailableAt(moment().utc().add(5,'days'))

				return knex("users").where('id',userId).update({
					wallet_spirit:1000
				}).then(function(){
					return InventoryModule.craftCard(userId,SDK.Cards.Faction1.SunstoneTemplar)
				}).then(function(result){
					expect(result).to.exist;
				})

			})

		})

	});

	describe("disenchantCard()", function() {
		// before cleanup to check if user already exists and delete
		before(function(){
			this.timeout(25000);
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(fbRootRef){
				return Promise.all([
					FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("card-collection")),
					knex("user_cards").where('user_id',userId).delete(),
					knex("user_card_log").where('user_id',userId).delete(),
					knex("user_card_collection").where('user_id',userId).delete(),
				])
			})
		});

		it('expect NOT to be able to disenchant a COMMON card you do not own', function() {

			return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.Lightchaser])
			.then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});

		});

		it('expect to be able to disenchant a COMMON card and receive 10 spirit', function() {

			return knex("users").where('id',userId).update({
				wallet_spirit:40
			}).then(function(){
				return InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.Lightchaser])
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}),
					knex.select().from("user_card_log").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}).orderBy('created_at','desc'),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,cardCountRows,cardLogRows,cardCollection,fbCardCollection,fbWallet){

				// expect 10 spirit in wallet
				expect(userRow.wallet_spirit).to.equal(10);
				expect(fbWallet.val().spirit_amount).to.equal(10);

				// expect no card counts
				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.equal(0);

				// expect 2 log statements, one for craft, and one for the disenchant
				expect(cardLogRows).to.exist;
				expect(cardLogRows.length).to.equal(2);
				expect(cardLogRows[0].source_type).to.equal("disenchant");
				expect(cardLogRows[1].source_type).to.equal("craft");

				expect(cardCollection).to.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser]).to.not.exist;

				expect(fbCardCollection.val()).to.not.exist;
			});

		});

		it('expect to be able to disenchant a set of COMMON,RARE,EPIC, and LEGENDARY cards for 480 spirit', function() {

			return knex("users").where('id',userId).update({
				wallet_spirit:1390
			}).then(function(){
				return Promise.all([
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.IroncliffeGuardian),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Sunriser),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.GrandmasterZir)
				]);
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[
					SDK.Cards.Faction1.Lightchaser,
					SDK.Cards.Faction1.IroncliffeGuardian,
					SDK.Cards.Faction1.Sunriser,
					SDK.Cards.Faction1.GrandmasterZir
				])
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}),
					knex.select().from("user_card_log").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(userRow,cardCountRows,cardLogRows,cardCollection,fbCardCollection){

				// expect 480 spirit in wallet
				expect(userRow.wallet_spirit).to.equal(480);

				// expect no card counts
				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.equal(0);

				// expect 8 log statements so far
				expect(cardLogRows).to.exist;
				expect(cardLogRows.length).to.equal(10);

				expect(cardCollection).to.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser]).to.not.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian]).to.not.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.Sunriser]).to.not.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.GrandmasterZir]).to.not.exist;

				expect(fbCardCollection.val()).to.not.exist;
			});

		});

		it('expect NOT to be able to disenchant a RARE card you do not own with a COMMON in your inventory', function() {

			return knex("users").where('id',userId).update({
				wallet_spirit:40
			}).then(function(){
				return Promise.all([
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
				]);
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.IroncliffeGuardian])
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});

		});

		it('expect inventory to look right after 1/3 copies of a card are disenchanted', function() {

			return knex("users").where('id',userId).update({
				wallet_spirit:200
			}).then(function(){
				return Promise.all([
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.IroncliffeGuardian),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.IroncliffeGuardian)
				]);
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.IroncliffeGuardian])
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.IroncliffeGuardian}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRow,cardCollection,fbCardCollection){

				// expect no card counts
				expect(cardCountRow).to.exist;
				expect(cardCountRow.count).to.equal(1);

				expect(cardCollection).to.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian]).to.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);

				expect(fbCardCollection.val()).to.exist;
				expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
			});

		});

		it('expect inventory to look right after a single card from a larger collection is disechanted', function() {

			return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.Lightchaser])
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardCollection,fbCardCollection){

				// expect no card counts
				expect(cardCountRows).to.exist;

				expect(cardCollection).to.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.Lightchaser]).to.not.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian]).to.exist;
				expect(cardCollection.cards[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);

				expect(fbCardCollection.val()).to.exist;
				expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser]).to.not.exist;
				expect(fbCardCollection.val()[SDK.Cards.Faction1.IroncliffeGuardian].count).to.equal(1);
			});

		});

		it('expect to be able to disenchant DUPLICATE cards', function() {

			return knex("users").where('id',userId).update({
				wallet_spirit:160
			}).then(function(){
				return Promise.all([
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser),
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser),
				]);
			}).then(function(){
				return InventoryModule.disenchantDuplicateCards(userId)
			}).then(function(result){
				expect(result).to.exist;
				expect(result.wallet.spirit_amount).to.equal(10);
				expect(result.rewards.length).to.equal(1);
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}),
					knex.select().from("user_card_log").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(userRow,cardCountRows,cardLogRows,cardCollection,fbCardCollection){

				// expect 480 spirit in wallet
				expect(userRow.wallet_spirit).to.equal(10);

				// expect no card counts
				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.equal(1);
				expect(cardCountRows[0].count).to.equal(3);

				expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].count).to.equal(3);
			});

		});

		it('expect disenchanting duplicates again right after to have no effect', function() {

			return InventoryModule.disenchantDuplicateCards(userId)
			.then(function(result){
				expect(result).to.exist;
				expect(result.wallet.spirit_amount).to.equal(10);
				expect(result.rewards.length).to.equal(0);
			});

		});

		it('expect LOCKING when disenchant DUPLICATES to work to avoid race conditions', function() {

			return knex("users").where('id',userId).update({
				wallet_spirit:40
			}).then(function(){
				return Promise.all([
					InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
				]);
			}).then(function(){
				return Promise.all([
					InventoryModule.disenchantDuplicateCards(userId),
					InventoryModule.disenchantDuplicateCards(userId),
					InventoryModule.disenchantDuplicateCards(userId)
				])
			}).spread(function(result,result,result){
				// expect(result).to.exist;
				// expect(result.wallet.spirit_amount).to.equal(10);
				// expect(result.rewards.length).to.equal(1);
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					knex.select().from("user_cards").where({'user_id':userId,'card_id':SDK.Cards.Faction1.Lightchaser}),
					knex.select().from("user_card_log").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(userRow,cardCountRows,cardLogRows,cardCollection,fbCardCollection){

				// expect 480 spirit in wallet
				expect(userRow.wallet_spirit).to.equal(10);

				// expect no card counts
				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.equal(1);
				expect(cardCountRows[0].count).to.equal(3);

				expect(fbCardCollection.val()[SDK.Cards.Faction1.Lightchaser].count).to.equal(3);
			});

		});

		it('expect NOT to be able to disenchant an BASIC card', function() {

			trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[ SDK.Cards.Spell.Tempest ])
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[SDK.Cards.Spell.Tempest])
			}).then(function(result){
				expect(result).to.not.exist
			}).catch(function(error){
				expect(error).to.not.be.an.instanceof(chai.AssertionError)
				expect(error).to.be.an.instanceof(Errors.NotFoundError)
			})

			return trxPromise

		})

		it('expect NOT to be able to disenchant an ACHIEVEMENT card', function() {

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[ SDK.Cards.Neutral.SwornSister ])
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[SDK.Cards.Neutral.SwornSister])
			}).then(function(result){
				expect(result).to.not.exist
			}).catch(function(error){
				expect(error).to.not.be.an.instanceof(chai.AssertionError)
				expect(error).to.be.an.instanceof(Errors.BadRequestError)
			})

			return trxPromise

		})

		it('expect to NOT be able to disenchant a card with a skin applied', function() {

			var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1);
			var skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCosmeticId(trxPromise,tx,userId,skinId)
			})
			.then(function(){
				return InventoryModule.disenchantCards(userId,[skinnedCardId])
			})
			.then(function(result){
				expect(result).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

		});

		it('expect to NOT be able to disenchant a prismatic card with a skin applied', function() {

			var skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1);
			var skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCosmeticId(trxPromise,tx,userId,skinId)
			})
			.then(function(){
				return InventoryModule.disenchantCards(userId,[skinnedCardId])
			})
			.then(function(result){
				expect(result).to.not.exist;
			})
			.catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

		});

	});

	describe("giveUserNewPurchasableCosmetic()", function () {
		it('to be able to give each permutation of rarity and/or cosmetic type', function () {
			var permutations = [];
			var cosmeticTypeVals = _.values(SDK.CosmeticsTypeLookup);
			cosmeticTypeVals.push(null)
			var rarityIdVals = [SDK.Rarity.Common,SDK.Rarity.Rare,SDK.Rarity.Epic,SDK.Rarity.Legendary,null];

			for (var i=0; i < cosmeticTypeVals.length; i++) {
				for (var j=0; j < rarityIdVals.length; j++) {
					permutations.push([rarityIdVals[j],cosmeticTypeVals[i]]);
				}
			}

			var emptyPermutations = [
				[SDK.Rarity.Common,		SDK.CosmeticsTypeLookup.CardBack],
				[SDK.Rarity.Rare,			SDK.CosmeticsTypeLookup.CardBack],
				[SDK.Rarity.Legendary,SDK.CosmeticsTypeLookup.CardBack],
				[SDK.Rarity.Epic,			SDK.CosmeticsTypeLookup.ProfileIcon],
				[SDK.Rarity.Legendary,SDK.CosmeticsTypeLookup.ProfileIcon],
				[SDK.Rarity.Common,		SDK.CosmeticsTypeLookup.MainMenuPlate],
				[SDK.Rarity.Rare,			SDK.CosmeticsTypeLookup.MainMenuPlate],
				[SDK.Rarity.Epic,			SDK.CosmeticsTypeLookup.MainMenuPlate],
				[SDK.Rarity.Legendary,SDK.CosmeticsTypeLookup.MainMenuPlate],
				[null,								SDK.CosmeticsTypeLookup.MainMenuPlate],
				[SDK.Rarity.Common,		SDK.CosmeticsTypeLookup.CardSkin],
				[SDK.Rarity.Rare,			SDK.CosmeticsTypeLookup.CardSkin],
				[SDK.Rarity.Epic,			SDK.CosmeticsTypeLookup.CardSkin],
				[SDK.Rarity.Legendary,SDK.CosmeticsTypeLookup.Emote]
			];

			permutations = _.filter(permutations,function (permutation) {
				return _.find(emptyPermutations, function (emptyPermutation) {
					return emptyPermutation[0] == permutation[0] && emptyPermutation[1] == permutation[1];
				}) == null;
			});

			return Promise.each(permutations,function (params) {
				var cosmeticsMatchingParams = _.filter(SDK.CosmeticsFactory.getAllCosmetics(),function(cosmeticData) {
					if (!cosmeticData.purchasable) {
						return false;
					} else if (params[0] != null && params[0] != cosmeticData.rarityId) {
						return false;
					} else if (params[1] != null && params[1] != cosmeticData.typeId) {
						return false;
					} else {
						return true;
					}
				});

				var purchasableCosmeticExistsForParams = (cosmeticsMatchingParams.length != 0);

				if (!purchasableCosmeticExistsForParams) {
					return Promise.resolve();
				} else {
					return SyncModule.wipeUserData(userId).then(function () {
						var txPromise = knex.transaction(function (tx) {
							return InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, "qa gift", generatePushId(), params[0], params[1], null)
						});
						return txPromise;
					}).then(function () {
						return knex("user_cosmetic_inventory").where('user_id', userId);
					}).then(function (userCosmeticsRows) {
						expect(userCosmeticsRows).to.exist;
						expect(userCosmeticsRows.length).to.equal(1);

						var cosmeticRow = userCosmeticsRows[0];
						var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticRow.cosmetic_id);
						expect(cosmeticData).to.exist;
						if (params[0] != null) {
							expect(cosmeticData.rarityId).to.equal(params[0]);
						}
						if (params[1] != null) {
							expect(cosmeticData.typeId).to.equal(params[1]);
						}
					});
				}
			}.bind(this),{concurrency: 1})

		});

		it('to give a user the last cosmetic id they dont have for a rarity, and then give them spirit the next time', function () {

			var rareCosmetics = _.clone(SDK.CosmeticsFactory.cosmeticsForRarity(SDK.Rarity.Rare));
			rareCosmetics = _.filter(rareCosmetics, function (rareCosmetic){return rareCosmetic.purchasable == true})
			var lastCosmeticToGive = rareCosmetics.pop();

			return SyncModule.wipeUserData(userId)
			.then(function () {
				return Promise.map(rareCosmetics, function (cosmeticData) {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.giveUserCosmeticId(txPromise, tx, userId, cosmeticData.id, "qa gift", generatePushId())
					});
					return txPromise
				}.bind(this), {concurrency: 1})
			}).then(function () {
				var txPromise = knex.transaction(function (tx) {
					return InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, "qa gift", generatePushId(),SDK.Rarity.Rare,null,null)
				});
				return txPromise
			}).then(function (res) {
				expect(res).to.exist;
				expect(res.spirit).to.not.exist;
				expect(Object.keys(res).length).to.equal(1);
				expect(res.cosmetic_id).to.equal(lastCosmeticToGive.id);

				return FirebasePromises.once(fbRootRef.child('user-inventory').child(userId).child("cosmetic-inventory").child(res.cosmetic_id),"value")
			}).then(function (fbCosmeticSnapshot) {

				expect(fbCosmeticSnapshot).to.exist;
				expect(fbCosmeticSnapshot.val()).to.exist;

				var txPromise = knex.transaction(function (tx) {
					return InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, "qa gift", generatePushId(),SDK.Rarity.Rare,null,null)
				});
				return txPromise
			}).then(function (res) {
				expect(res).to.exist;
				expect(res.cosmetic_id).to.exist;
				expect(res.spirit).to.exist;
				expect(Object.keys(res).length).to.equal(2);
			});
		});

		it('to give a user the last cosmetic id they dont have for a rarity when using optimization', function () {

			var rareCosmetics = _.clone(SDK.CosmeticsFactory.cosmeticsForRarity(SDK.Rarity.Rare));
			rareCosmetics = _.filter(rareCosmetics, function (rareCosmetic){return rareCosmetic.purchasable == true});
			var lastCosmeticToGive = rareCosmetics.pop();
			var cosmeticsOwnedId = _.map(rareCosmetics, function(cosmeticData) { return cosmeticData.id});


			return SyncModule.wipeUserData(userId)
				.then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, "qa gift", generatePushId(),SDK.Rarity.Rare,null,cosmeticsOwnedId)
					});
					return txPromise
				}).then(function (res) {
					expect(res).to.exist;
					expect(res.spirit).to.not.exist;
					expect(Object.keys(res).length).to.equal(1);
					expect(res.cosmetic_id).to.equal(lastCosmeticToGive.id);

					return FirebasePromises.once(fbRootRef.child('user-inventory').child(userId).child("cosmetic-inventory").child(res.cosmetic_id),"value")
				}).then(function (fbCosmeticSnapshot) {

					expect(fbCosmeticSnapshot).to.exist;
					expect(fbCosmeticSnapshot.val()).to.exist;
				});
		});

		it('to give a user cosmetics in order of reward order', function () {

			var rareCosmetics = _.clone(SDK.CosmeticsFactory.cosmeticsForRarity(SDK.Rarity.Rare));
			var lastRewardOrder = null;

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return Promise.each(rareCosmetics, function (cosmeticData) {
						var txPromise = knex.transaction(function (tx) {
							return InventoryModule.giveUserNewPurchasableCosmetic(txPromise, tx, userId, "qa gift", generatePushId(),SDK.Rarity.Rare,null,null)
						});
						var retPromise = txPromise.then(function (rewardData) {
							var cosmeticsData = SDK.CosmeticsFactory.cosmeticForIdentifier(rewardData.cosmetic_id)
							if (lastRewardOrder == null) {
								lastRewardOrder = cosmeticsData.rewardOrder;
							}
							expect(cosmeticsData.rewardOrder).to.be.at.least(lastRewardOrder);
							lastRewardOrder = cosmeticsData.rewardOrder;
						});
						return retPromise;
					}.bind(this), {concurrency: 1})
				})
		});
	});

	describe("giveUserCards()", function() {
		// before cleanup to check if user already exists and delete
		before(function(){
			this.timeout(25000);
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(fbRootRef){
				return Promise.all([
					FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("card-collection")),
					knex("user_cards").where('user_id',userId).delete(),
					knex("user_card_log").where('user_id',userId).delete(),
					knex("user_card_collection").where('user_id',userId).delete()
				])
			})
		});

		it('to work with giving some cards', function() {

			trxPromise = knex.transaction(function(tx){
				InventoryModule.giveUserCards(trxPromise,tx,userId,[ 20157, 10974, 20052, 10014, 10965 ])
				.then(function(){
					tx.commit()
				})
				.catch(function(e){
					Logger.module("UNITTEST").log(e)
					tx.rollback()
				})
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardCollection,fbCardCollection){
				expect(cardCountRows.length).to.equal(5);
				expect(_.keys(fbCardCollection.val()).length).to.equal(5);
			});

			return trxPromise;

		});

		it('expect duplicates to add up in the collection', function() {

			trxPromise = knex.transaction(function(tx){
				InventoryModule.giveUserCards(trxPromise,tx,userId,[ 20157, 10974, 20052, 10014, 10965 ])
				.then(function(){
					tx.commit()
				})
				.catch(function(e){
					Logger.module("UNITTEST").log(e)
					tx.rollback()
				})
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardCollection,fbCardCollection){
				expect(cardCountRows.length).to.equal(5);
				expect(_.keys(fbCardCollection.val()).length).to.equal(5);
				expect(fbCardCollection.val()[20157].count).to.equal(2);
				expect(fbCardCollection.val()[10974].count).to.equal(2);
				expect(fbCardCollection.val()[20052].count).to.equal(2);
				expect(fbCardCollection.val()[10014].count).to.equal(2);
				expect(fbCardCollection.val()[10965].count).to.equal(2);
			});

			return trxPromise;

		});

		it('expect giving [] empty array of cards to do nothing', function() {

			trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[])
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardCollection,fbCardCollection){
				expect(cardCountRows.length).to.equal(5)
				expect(_.reduce(cardCountRows,function(memo,row){ return memo + row.count },0)).to.equal(10)
			});

			return trxPromise;

		});

	});

	describe("giveUserCodexChapter()", function() {

		before(function(){
			this.timeout(25000);
			return DuelystFirebase.connect().getRootRef()
				.bind({})
				.then(function(fbRootRef){
					return Promise.all([
						FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("codex")),
						knex("user_codex_inventory").where('user_id',userId).delete()
					])
				})
		});


		it('to correctly give a user a codex chapter', function() {
			trxPromise = knex.transaction(function(tx){
				InventoryModule.giveUserCodexChapter(trxPromise,tx,userId,SDK.CodexChapters.Chapter3)
					.then(function(chapterIdAwarded){
						expect(chapterIdAwarded).to.equal(SDK.CodexChapters.Chapter3)
						tx.commit()
					})
					.catch(function(e){
						Logger.module("UNITTEST").log(e)
						tx.rollback()
					})
				return null;
			})

			return trxPromise
			.then(function(){
				// Delay for the firebase write to complete
				return Promise.delay(2000)
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex('user_codex_inventory').where('user_id',userId).select('chapter_id'),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("codex"),"value")
				])
			}).spread(function(codexChapterRows,fbCodexCollection){
				expect(codexChapterRows.length).to.equal(1);
				expect(_.keys(fbCodexCollection.val()).length).to.equal(1);
			});
		});

		it('to correctly handle giving a user a codex chapter they already own', function() {

			trxPromise = knex.transaction(function(tx){
				InventoryModule.giveUserCodexChapter(trxPromise,tx,userId,SDK.CodexChapters.Chapter3)
					.then(function(chapterIdAwarded){
						expect(chapterIdAwarded).to.equal(null)
						tx.commit()
					})
					.catch(function(e){
						Logger.module("UNITTEST").log(e)
						tx.rollback()
					})
				return null;
			})

			return trxPromise
				.then(function(){
					// Delay for the firebase write to complete
					return Promise.delay(2000)
				}).then(function(){
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef){
					return Promise.all([
						knex('user_codex_inventory').where('user_id',userId).select('chapter_id'),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("codex"),"value")
					])
				}).spread(function(codexChapterRows,fbCodexCollection){
					expect(codexChapterRows.length).to.equal(1);
					expect(_.keys(fbCodexCollection.val()).length).to.equal(1);
				});
		});
	});

	describe("giveUserMissingCodexChapters()", function() {

		before(function(){
			this.timeout(25000);
			return DuelystFirebase.connect().getRootRef()
				.bind({})
				.then(function(fbRootRef){
					return Promise.all([
						FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("codex")),
						knex("user_codex_inventory").where('user_id',userId).delete(),
						knex('user_progression').where('user_id',userId).delete()
					])
					.then(function() {
						var progressionRowData = {
							user_id: userId,
							game_count: 5,
							win_streak: 0,
							loss_count: 0,
							draw_count: 0,
							unscored_count: 0
						};
						return knex('user_progression').insert(progressionRowData)
					})
				})
		});


		it('to correctly give a user their missing codex chapters', function() {

			var numCodexChapters = 0;

			return knex('user_progression').where('user_id',userId).first("game_count")
			.then(function (progressionRow) {
				var gameCount = (progressionRow && progressionRow.game_count) || 0;
				numCodexChapters = SDK.Codex.chapterIdsOwnedByGameCount(gameCount).length;
				return InventoryModule.giveUserMissingCodexChapters(userId);
			})
			.then(function(chapterIdsAwarded){
				expect(chapterIdsAwarded.length).to.equal(numCodexChapters);

				// Delay for the firebase write to complete
				return Promise.delay(2000)
			})
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			})
			.then(function(rootRef){
				return Promise.all([
					knex('user_codex_inventory').where('user_id',userId).select('chapter_id'),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("codex"),"value")
				])
			})
			.spread(function(codexChapterRows,fbCodexCollection){
				expect(codexChapterRows.length).to.equal(numCodexChapters);
				expect(_.keys(fbCodexCollection.val()).length).to.equal(numCodexChapters);
			})
			.catch(function(e){
				expect(e).to.not.exist;
			});
		});

	});

	describe("markCardAsReadInUserCollection()", function() {

		// before cleanup to check if user already exists and delete
		before(function(){
			this.timeout(25000);
			return DuelystFirebase.connect().getRootRef()
			.bind({})
			.then(function(fbRootRef){
				return Promise.all([
					FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("card-collection")),
					FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("card-lore")),
					knex("user_cards").where('user_id',userId).delete(),
					knex("user_card_log").where('user_id',userId).delete(),
					knex("user_card_collection").where('user_id',userId).delete(),
					knex("user_card_lore_inventory").where('user_id',userId).delete()
				])
			}).then(function(){
				trxPromise = knex.transaction(function(tx){
					return InventoryModule.giveUserCards(trxPromise,tx,userId,[ 20157, 10974 ])
				})
				return trxPromise
			})
		});

		it('to mark a card as read', function() {

			return InventoryModule.markCardAsReadInUserCollection(userId, 20157)
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId,'card_id':20157}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardCollection,fbCardCollection){
				expect(cardCountRows[0].is_unread).to.equal(false)
				// NOTE: because the card collection and firebase data update is dererred to the next time inventory is updated, for now they should be TRUE and thus out of sync
				expect(cardCollection["cards"][20157].is_unread).to.equal(true)
				expect(fbCardCollection.val()[20157]["is_unread"]).to.equal(true)
			})

		})

		it("to mark a card's lore as read", function() {

			return InventoryModule.markCardLoreAsReadInUserCollection(userId, 20157)
			.then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_card_lore_inventory").where({'user_id':userId,'card_id':20157}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-lore"),"value")
				])
			}).spread(function(cardCountRows,fbCardCollection){
				expect(cardCountRows[0].is_unread).to.equal(false);
				expect(fbCardCollection.val()[20157]["is_unread"]).to.equal(false);
			})

		})

	})

	describe("debitGoldFromUser()", function() {

		it('to debit gold correctly', function() {

			trxPromise = knex.transaction(function(tx){
				InventoryModule.giveUserGold(trxPromise,tx,userId,100)
				.then(function(){
					return InventoryModule.debitGoldFromUser(trxPromise,tx,userId,-50)
				})
				.then(tx.commit)
				.catch(tx.rollback)
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,walletRef){
				expect(userRow.wallet_gold).to.equal(50);
				expect(walletRef.val().gold_amount).to.equal(50);
			});

			return trxPromise;

		});


		it('to NOT be able debit gold if insufficient funds', function() {

			trxPromise = knex.transaction(function(tx){
				InventoryModule.debitGoldFromUser(trxPromise,tx,userId,-100)
				.then(tx.commit)
				.catch(tx.rollback)
			}).then(function(r){
				expect(r).to.not.exist;
			}).catch(function(e){
				expect(e).to.not.be.an.instanceof(chai.AssertionError);
				expect(e).to.be.an.instanceof(Errors.InsufficientFundsError);
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,walletRef){
				expect(userRow.wallet_gold).to.equal(50);
				expect(walletRef.val().gold_amount).to.equal(50);
			});

			return trxPromise;

		});

	});

	describe("debitSpiritFromUser()", function() {
		before(function(){
			// Give user an initial amount of spirit to test with
			trxPromise = knex.transaction(function(tx) {
				InventoryModule.giveUserSpirit(trxPromise, tx, userId, 11)
				.then(tx.commit)
				.catch(tx.rollback);
			});
			return trxPromise;
		});

		it('to debit spirit correctly', function() {
			var spiritBefore = null;
			var spiritToCredit = 100;
			var spiritToDebit = 25;
			return knex.first().from("users").where({'id':userId})
			.then(function(userRow) {
				spiritBefore = userRow.wallet_spirit;

				trxPromise = knex.transaction(function(tx) {
					InventoryModule.giveUserSpirit(trxPromise, tx, userId, spiritToCredit)
					.then(function () {
						return InventoryModule.debitSpiritFromUser(trxPromise, tx, userId, -1 * spiritToDebit)
					})
					.then(tx.commit)
					.catch(tx.rollback);
				});
				return trxPromise;
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,walletRef){
				expect(userRow.wallet_spirit).to.equal(spiritBefore+spiritToCredit-spiritToDebit);
				expect(walletRef.val().spirit_amount).to.equal(spiritBefore+spiritToCredit-spiritToDebit);// expected 85 to equal 95//95 is correct
			});

		});

		it('to NOT be able debit spirit if insufficient funds', function() {
			var spiritBefore = null;

			return knex.first().from("users").where({'id':userId})
			.then(function(userRow) {
				spiritBefore = userRow.wallet_spirit;

				trxPromise = knex.transaction(function(tx){
					InventoryModule.debitSpiritFromUser(trxPromise,tx,userId,-1*spiritBefore-100)
					.then(tx.commit)
					.catch(tx.rollback)
				})
				return trxPromise
			}).then(function(r){
				expect(r).to.not.exist;
			}).catch(function(e){
				expect(e).to.not.be.an.instanceof(chai.AssertionError);
				expect(e).to.be.an.instanceof(Errors.InsufficientFundsError);
			}).then(function(){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,walletRef){
				expect(userRow.wallet_spirit).to.equal(spiritBefore);
				expect(walletRef.val().spirit_amount).to.equal(spiritBefore);
			});

			return trxPromise;

		});

	});

	describe("softWipeUserCardInventory()", function() {

		this.timeout(100000);

		before(function(){
			InventoryModule.SOFTWIPE_AVAILABLE_UNTIL = moment().utc().add(4,'days')
		})

		describe('if a user attempts to soft wipe after a wipe period has expired', function(){
			it('should throw a BadRequestError', function(){
				return InventoryModule.softWipeUserCardInventory(userId, moment(InventoryModule.SOFTWIPE_AVAILABLE_UNTIL).add(1,'day'))
				.then(function(r){
					expect(r).to.not.exist
				}).catch(function(e){
					expect(e).to.not.be.an.instanceof(chai.AssertionError)
					expect(e).to.be.an.instanceof(Errors.BadRequestError)
				})
			})
		})

		describe('if a user has not opened any orbs and has no cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
			})
			it('should not make any changes to the account and throw a BadRequestError', function() {
				return InventoryModule.softWipeUserCardInventory(userId)
				.then(function(r){
					expect(r).to.not.exist
				}).catch(function(e){
					expect(e).to.not.be.an.instanceof(chai.AssertionError)
					expect(e).to.be.an.instanceof(Errors.BadRequestError)
				})
			})
		})

		describe('if a user has only opened spirit orbs and has no other cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:200})
				}).then(function(){
					return InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core)
				}).then(function(boosterIds){
						var all = [];
						_.each(boosterIds,function(boosterId){
							all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
						});
						return Promise.all(all);
				}).then(function(){
					return InventoryModule.softWipeUserCardInventory(userId)
				}).catch(function(error){
					console.error(error)
					throw error
				})
			})
			it('should wipe the collection entirely',function(){
				return Promise.all([
					knex("user_cards").where('user_id',userId),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(0)
					expect(_.keys(cardCollectionRow.cards).length).to.equal(0)
				})
			})
			it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', function() {
				return Promise.all([
					knex("user_spirit_orbs").where('user_id',userId),
					knex("user_spirit_orbs_opened").where('user_id',userId)
				]).spread(function(orbs,orbsOpened){
					expect(orbs.count).to.equal(orbsOpened.count)
					_.each(orbsOpened,function(openedOrb){
						expect(openedOrb["wiped_at"]).to.exist
					})
				})
			})
			it('should have created card log ledger items for the wipe', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(debits)
				})
			})
		})

		describe('if a user attempts to soft wipe past maximum allowed soft-wipe count', function(){
			InventoryModule.MAX_SOFTWIPE_COUNT = 1
			it('should throw a BadRequestError', function(){
				return InventoryModule.softWipeUserCardInventory(userId)
				.then(function(r){
					expect(r).to.not.exist
				}).catch(function(e){
					expect(e).to.not.be.an.instanceof(chai.AssertionError)
					expect(e).to.be.an.instanceof(Errors.BadRequestError)
				})
			})
		})

		describe('if a user has not opened any orbs and has some BASIC cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:200})
				}).then(function(){
					return knex.transaction(function(tx){
						return InventoryModule.giveUserCards(null,tx,userId,[ 11, 11, 11 ],'faction xp')
					})
				})
			})
			it('should not make any changes to the account and throw a BadRequestError', function() {
				return InventoryModule.softWipeUserCardInventory(userId)
				.then(function(r){
					expect(r).to.not.exist
				}).catch(function(e){
					expect(e).to.not.be.an.instanceof(chai.AssertionError)
					expect(e).to.be.an.instanceof(Errors.BadRequestError)
				})
			})
			it('should still have BASIC cards in the inventory', function() {
				return Promise.all([
					knex("user_cards").where('user_id',userId).andWhere('card_id',11),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(1)
					expect(cardCountRows[0].count).to.equal(3)
					expect(cardCollectionRow.cards[11].count).to.equal(3)
				})
			})
			it('should leave card log ledger items unchanged', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(3)
					expect(debits).to.equal(0)
				})
			})
		})

		describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:300})
				}).then(function(){
					return InventoryModule.buyBoosterPacksWithGold(userId, 3, SDK.CardSet.Core);
				}).then(function(boosterIds){
					var all = [];
					_.each(boosterIds,function(boosterId){
						all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
					})
					return Promise.all(all);
				}).then(function(){
					return knex.transaction(function(tx){
						return Promise.all([
							InventoryModule.giveUserCards(null,tx,userId,[ 11, 11, 11 ],'faction xp'),
							InventoryModule.giveUserCards(null,tx,userId,[ 19005, 19005 ],'bogus achievement'),
							InventoryModule.giveUserCards(null,tx,userId,[ 10307, 10307 ],'gauntlet')
						])
					})
				}).then(function(){
					return InventoryModule.softWipeUserCardInventory(userId)
				}).catch(function(error){
					console.error(error)
					throw error
				})
			})

			it('should still have BASIC cards in the inventory and card ledger count should be accurate', function() {
				return Promise.all([
					knex("user_cards").where('user_id',userId),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 11}).count).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 19005}).count).to.equal(2)
					expect(_.find(cardCountRows,function(c){return c.card_id == 10307}).count).to.equal(2)
					expect(_.keys(cardCollectionRow.cards).length).to.equal(3)
					expect(cardCollectionRow.cards[11].count).to.equal(3)
					expect(cardCollectionRow.cards[19005].count).to.equal(2)
					expect(cardCollectionRow.cards[10307].count).to.equal(2)
				})
			})
			it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', function() {
				return Promise.all([
					knex("user_spirit_orbs").where('user_id',userId),
					knex("user_spirit_orbs_opened").where('user_id',userId)
				]).spread(function(orbs,orbsOpened){
					expect(orbs.count).to.equal(orbsOpened.count)
					_.each(orbsOpened,function(openedOrb){
						expect(openedOrb["wiped_at"]).to.exist
					})
				})
			})
			it('should have created card log ledger items for the wipe', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(22)
					expect(debits).to.equal(15)
				})
			})

		})

		describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted some orb cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:300})
				}).then(function(){
					return InventoryModule.buyBoosterPacksWithGold(userId, 3, SDK.CardSet.Core);
				}).then(function(boosterIds){
						var all = [];
						_.each(boosterIds,function(boosterId){
							all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
						})
						return Promise.all(all);
				}).then(function(orbResults){
					return InventoryModule.disenchantCards(userId,orbResults[0].cards)
				}).then(function(){
					return knex.transaction(function(tx){
						return Promise.all([
							InventoryModule.giveUserCards(null,tx,userId,[ 11, 11, 11 ],'faction xp'),
							InventoryModule.giveUserCards(null,tx,userId,[ 19005, 19005 ],'bogus achievement'),
							InventoryModule.giveUserCards(null,tx,userId,[ 10307, 10307 ],'gauntlet')
						])
					})
				}).then(function(){
					return InventoryModule.softWipeUserCardInventory(userId)
				})
			})

			it('should still have BASIC and ACHIEVEMENT cards in the inventory and card ledger count should be accurate', function() {
				return Promise.all([
					knex("user_cards").where('user_id',userId),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 11}).count).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 19005}).count).to.equal(2)
					expect(_.find(cardCountRows,function(c){return c.card_id == 10307}).count).to.equal(2)
					expect(_.keys(cardCollectionRow.cards).length).to.equal(3)
					expect(cardCollectionRow.cards[11].count).to.equal(3)
					expect(cardCollectionRow.cards[19005].count).to.equal(2)
					expect(cardCollectionRow.cards[10307].count).to.equal(2)
				})
			})
			it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', function() {
				return Promise.all([
					knex("user_spirit_orbs").where('user_id',userId),
					knex("user_spirit_orbs_opened").where('user_id',userId)
				]).spread(function(orbs,orbsOpened){
					expect(orbs.count).to.equal(orbsOpened.count)
					_.each(orbsOpened,function(openedOrb){
						expect(openedOrb["wiped_at"]).to.exist
					})
				})
			})
			it('should have created card log ledger items for the wipe', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(27)
					expect(debits).to.equal(20)
				})
			})
			it('should set users wallet spirit to 0 and create a currency ledger item for it', function() {
				return Promise.all([
					knex("users").where('id',userId).first(),
					knex("user_currency_log").whereNotNull('spirit').andWhere('user_id',userId).select(),
				]).spread(function(userRow,currencyLogRows){
					expect(userRow.wallet_spirit).to.equal(0)
					expect(currencyLogRows.length).to.equal(2)
					expect(_.find(currencyLogRows,function(c){return c.memo == 'soft wipe'})).to.exist
				})
			})
		})

		describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted their ACHIEVEMENT cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:300})
				}).then(function(){
						return InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core);
					}).then(function(boosterIds){
						var all = [];
						_.each(boosterIds,function(boosterId){
							all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
						})
						return Promise.all(all);
				}).then(function(){
					return knex.transaction(function(tx){
						return Promise.all([
							InventoryModule.giveUserCards(null,tx,userId,[ 11, 11, 11 ],'faction xp'),
							InventoryModule.giveUserCards(null,tx,userId,[ 19005, 19005 ],'bogus achievement'),
							InventoryModule.giveUserCards(null,tx,userId,[ 10307, 10307 ],'gauntlet')
						])
					})
				}).then(function(orbResults){
					return InventoryModule.disenchantCards(userId,[ 19005, 19005 ])
				}).then(function(){
					return InventoryModule.softWipeUserCardInventory(userId)
				})
			})

			it('should restore BASIC and ACHIEVEMENT cards in the inventory', function() {
				return Promise.all([
					knex("user_cards").where('user_id',userId),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 11}).count).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 19005}).count).to.equal(2)
					expect(_.find(cardCountRows,function(c){return c.card_id == 10307}).count).to.equal(2)
					expect(_.keys(cardCollectionRow.cards).length).to.equal(3)
					expect(cardCollectionRow.cards[11].count).to.equal(3)
					expect(cardCollectionRow.cards[19005].count).to.equal(2)
					expect(cardCollectionRow.cards[10307].count).to.equal(2)
				})
			})
			it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', function() {
				return Promise.all([
					knex("user_spirit_orbs").where('user_id',userId),
					knex("user_spirit_orbs_opened").where('user_id',userId)
				]).spread(function(orbs,orbsOpened){
					expect(orbs.count).to.equal(orbsOpened.count)
					_.each(orbsOpened,function(openedOrb){
						expect(openedOrb["wiped_at"]).to.exist
					})
				})
			})
			it('should have created card log ledger items for the wipe', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(17+2)
					expect(debits).to.equal(10+2)
				})
			})
			it('should set users wallet spirit to 0 and create a currency ledger item for it', function() {
				return Promise.all([
					knex("users").where('id',userId).first(),
					knex("user_currency_log").whereNotNull('spirit').andWhere('user_id',userId).select(),
				]).spread(function(userRow,currencyLogRows){
					expect(userRow.wallet_spirit).to.equal(0)
					expect(currencyLogRows.length).to.equal(2)
					expect(_.find(currencyLogRows,function(c){return c.memo == 'soft wipe'})).to.exist
				})
			})

		})

		describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted their entire collection',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:300})
				}).then(function(){
						return InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core);
					}).then(function(boosterIds){
						var all = [];
						_.each(boosterIds,function(boosterId){
							all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
						})
						return Promise.all(all);
				}).then(function(orbs){
					this.orbs = orbs
					return knex.transaction(function(tx){
						return Promise.all([
							InventoryModule.giveUserCards(null,tx,userId,[ 11, 11, 11 ],'faction xp'),
							InventoryModule.giveUserCards(null,tx,userId,[ 19005, 19005 ],'bogus achievement'),
							InventoryModule.giveUserCards(null,tx,userId,[ 10307, 10307 ],'gauntlet')
						])
					})
				}).then(function(orbResults){
					return Promise.all([
						InventoryModule.disenchantCards(userId,this.orbs[0].cards),
						InventoryModule.disenchantCards(userId,this.orbs[1].cards),
						InventoryModule.disenchantCards(userId,[ 19005, 19005, 10307, 10307 ])
					])
				}).then(function(){
					return InventoryModule.softWipeUserCardInventory(userId)
				})
			})

			it('should restore BASIC and ACHIEVEMENT cards in the inventory', function() {
				return Promise.all([
					knex("user_cards").where('user_id',userId),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 11}).count).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 19005}).count).to.equal(2)
					expect(_.find(cardCountRows,function(c){return c.card_id == 10307}).count).to.equal(2)
					expect(_.keys(cardCollectionRow.cards).length).to.equal(3)
					expect(cardCollectionRow.cards[11].count).to.equal(3)
					expect(cardCollectionRow.cards[19005].count).to.equal(2)
					expect(cardCollectionRow.cards[10307].count).to.equal(2)
				})
			})
			it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', function() {
				return Promise.all([
					knex("user_spirit_orbs").where('user_id',userId),
					knex("user_spirit_orbs_opened").where('user_id',userId)
				]).spread(function(orbs,orbsOpened){
					expect(orbs.count).to.equal(orbsOpened.count)
					_.each(orbsOpened,function(openedOrb){
						expect(openedOrb["wiped_at"]).to.exist
					})
				})
			})
			it('should have created card log ledger items for the wipe', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(17+10+4)
					expect(debits).to.equal(10+10+4)
				})
			})
			it('should set users wallet spirit to 0 and create a currency ledger item for it', function() {
				return Promise.all([
					knex("users").where('id',userId).first(),
					knex("user_currency_log").whereNotNull('spirit').andWhere('user_id',userId).select(),
				]).spread(function(userRow,currencyLogRows){
					expect(userRow.wallet_spirit).to.equal(0)
					expect(_.find(currencyLogRows,function(c){return c.memo == 'soft wipe'})).to.exist
				})
			})

		})

		describe('if a user has opened some orbs and has some BASIC cards and ACHIEVEMENT cards and disenchanted all non-basic cards and crafted other cards',function(){
			before(function(){
				return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:300})
				}).then(function(){
						return InventoryModule.buyBoosterPacksWithGold(userId, 2, SDK.CardSet.Core);
					}).then(function(boosterIds){
						var all = [];
						_.each(boosterIds,function(boosterId){
							all.push(InventoryModule.unlockBoosterPack(userId,boosterId));
						})
						return Promise.all(all);
				}).then(function(orbs){
					this.orbs = orbs
					return knex.transaction(function(tx){
						return Promise.all([
							InventoryModule.giveUserCards(null,tx,userId,[ 11, 11, 11 ],'faction xp'),
							InventoryModule.giveUserCards(null,tx,userId,[ 19005, 19005 ],'bogus achievement'),
							InventoryModule.giveUserCards(null,tx,userId,[ 10307, 10307 ],'gauntlet')
						])
					})
				}).then(function(orbResults){
					return Promise.all([
						InventoryModule.disenchantCards(userId,this.orbs[0].cards),
						InventoryModule.disenchantCards(userId,this.orbs[1].cards),
						InventoryModule.disenchantCards(userId,[ 19005, 19005, 10307, 10307 ])
					])
				}).then(function(orbResults){
					return Promise.all([
						InventoryModule.craftCard(userId,10985)
					])
				}).then(function(){
					return InventoryModule.softWipeUserCardInventory(userId)
				})
			})

			it('should restore BASIC and ACHIEVEMENT cards in the inventory', function() {
				return Promise.all([
					knex("user_cards").where('user_id',userId),
					knex("user_card_collection").first().where('user_id',userId)
				]).spread(function(cardCountRows,cardCollectionRow){
					expect(cardCountRows.length).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 11}).count).to.equal(3)
					expect(_.find(cardCountRows,function(c){return c.card_id == 19005}).count).to.equal(2)
					expect(_.find(cardCountRows,function(c){return c.card_id == 10307}).count).to.equal(2)
					expect(_.keys(cardCollectionRow.cards).length).to.equal(3)
					expect(cardCollectionRow.cards[11].count).to.equal(3)
					expect(cardCollectionRow.cards[19005].count).to.equal(2)
					expect(cardCollectionRow.cards[10307].count).to.equal(2)
				})
			})
			it('should give user # of orbs equal to number opened and mark old orbs with "wiped_at" time', function() {
				return Promise.all([
					knex("user_spirit_orbs").where('user_id',userId),
					knex("user_spirit_orbs_opened").where('user_id',userId)
				]).spread(function(orbs,orbsOpened){
					expect(orbs.count).to.equal(orbsOpened.count)
					_.each(orbsOpened,function(openedOrb){
						expect(openedOrb["wiped_at"]).to.exist
					})
				})
			})
			it('should have created card log ledger items for the wipe', function() {
				return knex("user_card_log").where('user_id',userId)
				.then(function(cardLogRows){
					// count all debits
					var debits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (!cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					// count all credits
					var credits = _.reduce(cardLogRows,function(memo,cardLogItem){
						if (cardLogItem["is_credit"]) {
							memo += 1
						}
						return memo
					},0)
					expect(credits).to.equal(17+10+4+1)
					expect(debits).to.equal(10+10+4+1)
				})
			})
			it('should set users wallet spirit to 0 and create a currency ledger item for it', function() {
				return Promise.all([
					knex("users").where('id',userId).first(),
					knex("user_currency_log").whereNotNull('spirit').andWhere('user_id',userId).select(),
				]).spread(function(userRow,currencyLogRows){
					expect(userRow.wallet_spirit).to.equal(0)
					expect(_.find(currencyLogRows,function(c){return c.memo == 'soft wipe'})).to.exist
				})
			})

		})

	})

	describe("prismatics",function(){
		beforeEach(function(){
			return SyncModule.wipeUserData(userId)
				/*.bind({})
				.then(function(){
					return knex("users").where('id',userId).update({wallet_gold:300})
				})*/
			});

		it('expect to be able to craft a prismatic non-basic', function () {

			var cardIdToCraft = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
			var cardToCraft = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === cardIdToCraft});
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit: rarityData.spiritCostPrismatic
			}).then(function(){
				return InventoryModule.craftCard(userId,cardIdToCraft)
			}).then(function(result){
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId,'card_id':cardIdToCraft}),
					knex.select().from("user_card_log").where({'user_id':userId,'card_id':cardIdToCraft}),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardLogRows,cardCollection,fbCardCollection){
				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.equal(1);
				expect(cardCountRows[0].count).to.equal(1);
				expect(cardCountRows[0].is_unread).to.equal(true);
				expect(cardCountRows[0].is_new).to.equal(true);

				expect(cardLogRows).to.exist;
				expect(cardLogRows.length).to.equal(1);
				expect(cardLogRows[0].source_type).to.equal("craft");

				expect(cardCollection).to.exist;
				expect(cardCollection.cards).to.exist;
				expect(cardCollection.cards[cardIdToCraft].count).to.equal(1);
				expect(cardCollection.cards[cardIdToCraft].is_unread).to.equal(true);
				expect(cardCollection.cards[cardIdToCraft].is_new).to.equal(true);

				expect(fbCardCollection.val()).to.exist;
				expect(fbCardCollection.val()[cardIdToCraft].count).to.equal(1);
				expect(fbCardCollection.val()[cardIdToCraft].is_unread).to.equal(true);
				expect(fbCardCollection.val()[cardIdToCraft].is_new).to.equal(true);
			});
		});

		it('expect to be able to disenchant a prismatic non-basic', function () {

			var cardIdToDisenchant = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
			var cardToDisenchant = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === cardIdToDisenchant});
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToDisenchant.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function(){
				return InventoryModule.craftCard(userId,cardIdToDisenchant)
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[cardIdToDisenchant])
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.select().from("user_cards").where({'user_id':userId,'card_id':cardIdToDisenchant}),
					knex.select().from("user_card_log").where({'user_id':userId,'card_id':cardIdToDisenchant}).orderBy('created_at','desc'),
					knex.first().from("user_card_collection").where({'user_id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("card-collection"),"value"),
				])
			}).spread(function(cardCountRows,cardLogRows,cardCollection,fbCardCollection){

				// expect no card counts
				expect(cardCountRows).to.exist;
				expect(cardCountRows.length).to.equal(0);

				// expect 2 log statements, one for craft, and one for the disenchant
				expect(cardLogRows).to.exist;
				expect(cardLogRows.length).to.equal(2);
				expect(cardLogRows[0].source_type).to.equal("disenchant");
				expect(cardLogRows[1].source_type).to.equal("craft");

				expect(cardCollection).to.exist;
				expect(cardCollection.cards[cardIdToDisenchant]).to.not.exist;

				expect(fbCardCollection.val()).to.not.exist;
			});
		});

		it('expect crafting a prismatic non-basic to cost more spirit than the normal version', function () {

			var cardIdToCraft = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
			var cardToCraft = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === cardIdToCraft});
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit: rarityData.spiritCost
			}).then(function(){
				return InventoryModule.craftCard(userId,cardIdToCraft)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function (error) {
				expect(error).to.exist;
				expect(error instanceof Errors.InsufficientFundsError).to.equal(true);
			})
		});

		it('expect disenchanting a prismatic non-basic to reward more spirit than the normal version', function () {

			var cardIdToDisenchant = SDK.Cards.Faction1.SunstoneTemplar + SDK.Cards.Prismatic;
			var cardToDisenchant = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(),function(card){ return card.id === cardIdToDisenchant});
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToDisenchant.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function(){
				return InventoryModule.craftCard(userId,cardIdToDisenchant)
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[cardIdToDisenchant])
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,fbWallet){
				// expect prismatic disenchant spirit in wallet
				expect(userRow.wallet_spirit).to.equal(rarityData.spiritRewardPrismatic);
				expect(fbWallet.val().spirit_amount).to.equal(rarityData.spiritRewardPrismatic);
			}).then(function () {
				return  knex("users").where('id',userId).update({
					wallet_spirit:rarityData.spiritCost
				});
			}).then(function(){
				return InventoryModule.craftCard(userId,SDK.Cards.getBaseCardId(cardIdToDisenchant))
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[SDK.Cards.getBaseCardId(cardIdToDisenchant)])
			}).then(function(result){
				expect(result).to.exist;
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex.first().from("users").where({'id':userId}),
					FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("wallet"),"value"),
				])
			}).spread(function(userRow,fbWallet){
				// expect normal disenchant spirit in wallet
				expect(userRow.wallet_spirit).to.equal(rarityData.spiritReward);
				expect(fbWallet.val().spirit_amount).to.equal(rarityData.spiritReward);
			})
		});

		it('expect to not be able to craft a prismatic basic card', function () {

			var cardIdToCraft = SDK.Cards.Faction1.WindbladeAdept + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function() {
				return InventoryModule.craftCard(userId, cardIdToCraft)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to not be able to disenchant a prismatic basic card', function () {

			var cardIdToDisenchant = SDK.Cards.Faction1.WindbladeAdept + SDK.Cards.Prismatic;

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[ cardIdToDisenchant ])
			}).then(function(){
				return InventoryModule.disenchantCards(userId, [cardIdToDisenchant])
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

			return trxPromise;
		});

		it('expect to not be able to craft a prismatic bloodborn card without base card', function () {

			var cardIdToCraft = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function() {
				return InventoryModule.craftCard(userId, cardIdToCraft)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to not be able to craft a prismatic unity card without base card', function () {

			var cardIdToCraft = SDK.Cards.Faction3.Sirocco + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function() {
				return InventoryModule.craftCard(userId, cardIdToCraft)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to not be able to disenchant a prismatic basic card', function () {

			var cardIdToDisenchant = SDK.Cards.Faction1.WindbladeAdept + SDK.Cards.Prismatic;

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[ cardIdToDisenchant ])
			}).then(function(){
				return InventoryModule.disenchantCards(userId, [cardIdToDisenchant])
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});

			return trxPromise;
		});

		it('expect to not be able to craft an unlockable achievement prismatic card if the normal version is locked', function () {

			var cardIdToCraft = SDK.Cards.Neutral.SwornSister + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function() {
				return InventoryModule.craftCard(userId, cardIdToCraft)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to be able to craft an unlockable achievement prismatic card if the normal version is unlocked', function () {

			var cardIdToCraft = SDK.Cards.Neutral.SwornSister + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var baseCardId = SDK.Cards.getBaseCardId(cardIdToCraft);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[
					baseCardId,
					baseCardId,
					baseCardId
				])
			}).then(function(){
				return Promise.all([
					knex('user_cards').first().where({'user_id':userId, 'card_id':baseCardId}),
					knex("users").where('id',userId).update({ wallet_spirit:rarityData.spiritCostPrismatic })
				])
			}).spread(function(cardRow){
				expect(cardRow).to.exist;
				expect(cardRow.count).to.be.above(0);
				return InventoryModule.craftCard(userId,cardIdToCraft)
			}).then(function(result){
				expect(result).to.exist;
				return knex('user_cards').first().where({'user_id':userId, 'card_id':cardIdToCraft});
			}).then(function(cardRow){
				expect(cardRow).to.exist;
				expect(cardRow.count).to.be.above(0);
			});

			return trxPromise;
		});

		it('expect to be able to disenchant an unlockable achievement prismatic card if the normal version is unlocked', function () {

			var cardIdToDisenchant = SDK.Cards.Neutral.SwornSister + SDK.Cards.Prismatic;
			var baseCardId = SDK.Cards.getBaseCardId(cardIdToDisenchant);

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[
					cardIdToDisenchant
				])
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[cardIdToDisenchant])
			}).then(function(result){
				expect(result).to.exist;
				return knex('user_cards').first().where({'user_id':userId, 'card_id':cardIdToDisenchant});
			}).then(function(cardRow){
				expect(cardRow).to.not.exist;
			})

			return trxPromise;
		});

		////

		it('expect to not be able to craft a spirit orb unlockable prismatic card if the normal version is locked', function () {

			var cardIdToCraft = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			return knex("users").where('id',userId).update({
				wallet_spirit:rarityData.spiritCostPrismatic
			}).then(function() {
				return InventoryModule.craftCard(userId, cardIdToCraft)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(error){
				expect(error).to.exist;
				expect(error).to.not.be.an.instanceof(chai.AssertionError);
			});
		});

		it('expect to be able to craft a spirit orb unlockable prismatic card if the normal version is unlocked', function () {

			var cardIdToCraft = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
			var gameSession = SDK.GameSession.create();
			var cardToCraft = SDK.CardFactory.cardForIdentifier(cardIdToCraft, gameSession);
			var baseCardId = SDK.Cards.getBaseCardId(cardIdToCraft);
			var rarityData = SDK.RarityFactory.rarityForIdentifier(cardToCraft.getRarityId());

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[
					baseCardId,
					baseCardId,
					baseCardId
				])
			}).then(function(){
				return Promise.all([
					knex('user_cards').first().where({'user_id':userId, 'card_id':baseCardId}),
					knex("users").where('id',userId).update({ wallet_spirit:rarityData.spiritCostPrismatic })
				])
			}).spread(function(cardRow){
				expect(cardRow).to.exist;
				expect(cardRow.count).to.be.above(0);
				return InventoryModule.craftCard(userId,cardIdToCraft)
			}).then(function(result){
				expect(result).to.exist;
				return knex('user_cards').first().where({'user_id':userId, 'card_id':cardIdToCraft});
			}).then(function(cardRow){
				expect(cardRow).to.exist;
				expect(cardRow.count).to.be.above(0);
			});

			return trxPromise;
		});

		it('expect to be able to disenchant a spirit orb unlockable prismatic card if the normal version is unlocked', function () {

			var cardIdToDisenchant = SDK.Cards.Faction5.Drogon + SDK.Cards.Prismatic;
			var baseCardId = SDK.Cards.getBaseCardId(cardIdToDisenchant);

			var trxPromise = knex.transaction(function(tx){
				return InventoryModule.giveUserCards(trxPromise,tx,userId,[
					cardIdToDisenchant
				])
			}).then(function(){
				return InventoryModule.disenchantCards(userId,[cardIdToDisenchant])
			}).then(function(result){
				expect(result).to.exist;
				return knex('user_cards').first().where({'user_id':userId, 'card_id':cardIdToDisenchant});
			}).then(function(cardRow){
				expect(cardRow).to.not.exist;
			})

			return trxPromise;
		});

	});

	describe("Test cached card methods",function(){

		after(function(){
			// after we're all done make sure to rebuild cache one more time
			var cards = SDK.GameSession.getCardCaches().getCards();
		});

		it('expect cache to contain cards in each major category', function () {
			expect(SDK.GameSession.getCardCaches().getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getCardIds().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getCardsData().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction1).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction2).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction3).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction4).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction5).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction6).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Neutral).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Common).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Rare).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Epic).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Legendary).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Unit).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Spell).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Artifact).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getType(SDK.CardType.Tile).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Neutral).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Golem).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Arcanyst).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Dervish).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Mech).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Vespyr).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Structure).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.BattlePet).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getRace(SDK.Races.Warmaster).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getIsCollectible(false).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getIsUnlockable(true).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getIsUnlockable(false).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getIsPrismatic(true).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getIsPrismatic(false).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getIsSkinned(true).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getIsSkinned(false).getCards().length > 0).to.equal(true);

			expect(SDK.GameSession.getCardCaches().getIsHiddenInCollection(true).getCards().length > 0).to.equal(true);
			expect(SDK.GameSession.getCardCaches().getIsHiddenInCollection(false).getCards().length > 0).to.equal(true);
		});

		it('expect only prismatic cards in all cards filtered by prismatic', function () {
			var cards = SDK.GameSession.getCardCaches().getIsPrismatic(true).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(SDK.Cards.getIsPrismaticCardId(cards[i].getId())).to.equal(true);
			}
		});

		it('expect only non-prismatic cards in all cards filtered by non-prismatic', function () {
			var cards = SDK.GameSession.getCardCaches().getIsPrismatic(false).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(SDK.Cards.getIsPrismaticCardId(cards[i].getId())).to.equal(false);
			}
		});

		it('expect only collectible cards in all cards filtered by collectible', function () {
			var cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getIsCollectible()).to.equal(true);
			}
		});

		it('expect only non-collectible cards in all cards filtered by non-collectible', function () {
			var cards = SDK.GameSession.getCardCaches().getIsCollectible(false).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getIsCollectible()).to.equal(false);
			}
		});

		it('expect only unlockable cards in all cards filtered by unlockable', function () {
			var cards = SDK.GameSession.getCardCaches().getIsUnlockable(true).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getIsUnlockable()).to.equal(true);
			}
		});

		it('expect only non-unlockable cards in all cards filtered by non-unlockable', function () {
			var cards = SDK.GameSession.getCardCaches().getIsUnlockable(false).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getIsUnlockable()).to.equal(false);
			}
		});

		it('expect only general cards in all cards filtered by general', function () {
			var cards = SDK.GameSession.getCardCaches().getIsGeneral(true).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i] instanceof SDK.Entity && cards[i].getIsGeneral()).to.equal(true);
			}
		});

		it('expect only non-general cards in all cards filtered by non-general', function () {
			var cards = SDK.GameSession.getCardCaches().getIsGeneral(false).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(!(cards[i] instanceof SDK.Entity) || !cards[i].getIsGeneral()).to.equal(true);
			}
		});

		it('expect only rare cards in all cards filtered by rare', function () {
			var cards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Rare).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Rare);
			}
		});

		it('expect only faction 1 cards in all cards filtered by faction 1', function () {
			var cards = SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction1).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getFactionId()).to.equal(SDK.Factions.Faction1);
			}
		});

		it('expect only common faction 2 cards in all cards filtered by faction 2 commons', function () {
			var cards = SDK.GameSession.getCardCaches().getFaction(SDK.Factions.Faction2).getRarity(SDK.Rarity.Common).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getFactionId()).to.equal(SDK.Factions.Faction2);
				expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Common);
			}
		});

		it('expect only core set epic faction 3 cards in all cards filtered by core set faction 3 epics', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction3).getRarity(SDK.Rarity.Epic).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getCardSetId()).to.equal(SDK.CardSet.Core);
				expect(cards[i].getFactionId()).to.equal(SDK.Factions.Faction3);
				expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Epic);
			}
		});

		it('expect only shimzar set neutral cards in all cards filtered by shimzar set neutrals', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getFaction(SDK.Factions.Neutral).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getCardSetId()).to.equal(SDK.CardSet.Shimzar);
				expect(cards[i].getFactionId()).to.equal(SDK.Factions.Neutral);
			}
		});

		it('expect only shimzar set rare cards in all cards filtered by shimzar set rares', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getRarity(SDK.Rarity.Rare).getCards();
			expect(cards.length > 0).to.equal(true);
			for (var i = 0, il = cards.length; i < il; i++) {
				expect(cards[i].getCardSetId()).to.equal(SDK.CardSet.Shimzar);
				expect(cards[i].getRarityId()).to.equal(SDK.Rarity.Rare);
			}
		});

		it('expect to be able to get card data for Silverguard Knight', function () {
			var cards = SDK.GameSession.getCardCaches().getCards();

			var siverguardKnight = _.find(cards,function(c){ return c.id == SDK.Cards.Faction1.SilverguardKnight });
			expect(siverguardKnight).to.exist;
		});

		it('expect to be able to get card data for Argeon Highmayne', function () {
			var cards = SDK.GameSession.getCardCaches().getCards();

			var argeonHighmayne = _.find(cards,function(c){ return c.id == SDK.Cards.Faction1.General });
			expect(argeonHighmayne).to.exist;
		});

		it('expect to be able to get card data for Sarlac', function () {
			var cards = SDK.GameSession.getCardCaches().getCards();

			var sarlac = _.find(cards,function(c){ return c.id == SDK.Cards.Neutral.SarlacTheEternal });
			expect(sarlac).to.exist;
		});

		it('expect not to be able collect a Silverguard Knight', function () {
			var cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();

			var siverguardKnight = _.find(cards,function(c){ return c.id == SDK.Cards.Faction1.SilverguardKnight });
			expect(siverguardKnight).to.not.exist;
		});

		it('expect not to be able collect an Argeon Highmayne', function () {
			var cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();

			var argeonHighmayne = _.find(cards,function(c){ return c.id == SDK.Cards.Faction1.General });
			expect(argeonHighmayne).to.not.exist;
		});

		it('expect to be able to collect Sarlac', function () {
			var cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();

			var sarlac = _.find(cards,function(c){ return c.id == SDK.Cards.Neutral.SarlacTheEternal });
			expect(sarlac).to.exist;
		});

		it('expect to be able to get collectible card data for Sarlac when filtering by legendary rarity', function () {
			var cards = SDK.GameSession.getCardCaches().getIsCollectible(true).getRarity(SDK.Rarity.Legendary).getCards();

			var sarlac = _.find(cards,function(c){ return c.id == SDK.Cards.Neutral.SarlacTheEternal });
			expect(sarlac).to.exist;
		});

		it('expect Sarlac card id to exist in collectible card ids', function () {
			var cardIds = SDK.GameSession.getCardCaches().getIsCollectible(true).getCardIds();

			var sarlac = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.SarlacTheEternal });
			expect(sarlac).to.exist;
		});

		it('expect Sarlac card id to exist in collectible card ids filtered by legendary', function () {
			var cardIds = SDK.GameSession.getCardCaches().getIsCollectible(true).getRarity(SDK.Rarity.Legendary).getCardIds();

			var sarlac = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.SarlacTheEternal });
			expect(sarlac).to.exist;
		});

		it('expect Sarlac card id to not exist in collectible card ids filtered by epic', function () {
			var cardIds = SDK.GameSession.getCardCaches().getIsCollectible(true).getRarity(SDK.Rarity.Epic).getCardIds();

			var sarlac = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.SarlacTheEternal });
			expect(sarlac).to.not.exist;
		});

		it('expect Kron card to not exist in collectible cards filtered by core set', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getIsCollectible(true).getCards();

			var kron = _.find(cards,function(card){ return card.getId() == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.not.exist;
		});

		it('expect Kron card to exist in collectible cards filtered by shimzar set', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getCards();

			var kron = _.find(cards,function(card){ return card.getId() == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card to exist in collectible cards filtered by shimzar set legendaries', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getRarity(SDK.Rarity.Legendary).getCards();

			var kron = _.find(cards,function(card){ return card.getId() == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card to exist in collectible cards filtered by shimzar set neutrals', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral).getCards();

			var kron = _.find(cards,function(card){ return card.getId() == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card to exist in collectible cards filtered by shimzar set neutral legendaries', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral).getRarity(SDK.Rarity.Legendary).getCards();

			var kron = _.find(cards,function(card){ return card.getId() == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card id to not exist in collectible card ids filtered by core set', function () {
			var cards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getIsCollectible(true).getCards();

			var kron = _.find(cards,function(id){ return id == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.not.exist;
		});

		it('expect Kron card id to exist in collectible card ids filtered by shimzar set', function () {
			var cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getCardIds();

			var kron = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card id to exist in collectible card ids filtered by shimzar set legendaries', function () {
			var cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getRarity(SDK.Rarity.Legendary).getCardIds();

			var kron = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card id to exist in collectible card ids filtered by shimzar set neutrals', function () {
			var cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral).getCardIds();

			var kron = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect Kron card id to exist in collectible card ids filtered by shimzar set neutral legendaries', function () {
			var cardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getIsCollectible(true).getFaction(SDK.Factions.Neutral).getRarity(SDK.Rarity.Legendary).getCardIds();

			var kron = _.find(cardIds,function(id){ return id == SDK.Cards.Neutral.InquisitorKron });
			expect(kron).to.exist;
		});

		it('expect November season cards (Mogwai) to NOT be available before 1st November', function() {

			var allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
			process.env.ALL_CARDS_AVAILABLE = false;
			var novemberMoment =  moment("2015-10-15+0000", "YYYY-MM Z").utc();
			var cards = SDK.GameSession.getCardCaches(novemberMoment).getIsCollectible(true).getCards();

			var mogwai = _.find(cards,function(c){ return c.getId() == SDK.Cards.Neutral.Mogwai });
			expect(mogwai).to.not.exist;

			process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;

		});

		it('expect November season cards (Mogwai) to be available after 1st November', function() {

			var allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
			process.env.ALL_CARDS_AVAILABLE = false;

			var novemberMoment =  moment("2015-11-30+0000", "YYYY-MM Z").utc();
			var cards = SDK.GameSession.getCardCaches(novemberMoment).getIsCollectible(true).getCards();

			var mogwai = _.find(cards,function(c){ return c.getId() == SDK.Cards.Neutral.Mogwai });
			expect(mogwai).to.exist;

			process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;

		});

		it('expect December season cards (Jaxi) to NOT be available before 1st December', function() {

			var allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
			process.env.ALL_CARDS_AVAILABLE = false;

			var novemberMoment =  moment("2015-11-30+0000", "YYYY-MM Z").utc();
			var cards = SDK.GameSession.getCardCaches(novemberMoment).getIsCollectible(true).getCards();

			var jaxi = _.find(cards,function(c){ return c.getId() == SDK.Cards.Neutral.Jaxi });
			expect(jaxi).to.not.exist;

			process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;

		});

		it('expect December season cards (Jaxi) to become available after 1st December', function() {

			var allCardsAvailable = process.env.ALL_CARDS_AVAILABLE;
			process.env.ALL_CARDS_AVAILABLE = false;

			var decemberMoment =  moment("2015-12-01+0000", "YYYY-MM Z").utc();
			var cards = SDK.GameSession.getCardCaches(decemberMoment).getIsCollectible(true).getCards();

			var jaxi = _.find(cards,function(c){ return c.getId() == SDK.Cards.Neutral.Jaxi });
			expect(jaxi).to.exist;

			process.env.ALL_CARDS_AVAILABLE = allCardsAvailable;

		});

		it('expect cache not to update on each call', function() {
			var cardCache1 = SDK.GameSession.getCardCaches();
			var cardCache2 = SDK.GameSession.getCardCaches();

			expect(cardCache1).to.equal(cardCache2);
		});

		it('expect cache to rebuild when requested in a difference month', function() {

			var novemberMoment =  moment("2020-11-01+0000", "YYYY-MM Z").utc();
			var decemberMoment =  moment("2020-12-01+0000", "YYYY-MM Z").utc();

			// Build for novemeber (the cache timestamp should be november now (even if for some reason it already was)
			var novemberCardCache = SDK.GameSession.getCardCaches(novemberMoment);
			var decemberCardCache = SDK.GameSession.getCardCaches(decemberMoment);

			expect(novemberCardCache).to.not.equal(decemberCardCache);

		});

	})

	describe("craftCosmetic()", function() {

		it('expect to be able to craft a COMMON cosmetic with 500 spirit in wallet', function() {

			return Promise.all([
				knex("users").where('id',userId).update({
					wallet_spirit: 500
				}),
				knex("user_cosmetic_inventory").where('user_id',userId).delete()
			]).then(function(){
				return InventoryModule.craftCosmetic(userId,SDK.CosmeticsLookup.Emote.Faction1Angry)
			}).then(function(result){
				expect(result).to.exist;
				return Promise.all([
					knex("user_cosmetic_inventory").first().where('user_id',userId),
					knex("users").first().where("id",userId)
				])
			}).spread(function(cosmeticRow,userRow) {
				expect(cosmeticRow).to.exist;
				expect(cosmeticRow.user_id).to.equal(userId);
				expect(parseInt(cosmeticRow.cosmetic_id)).to.equal(SDK.CosmeticsLookup.Emote.Faction1Angry);

				expect(userRow).to.exist;
				expect(userRow.wallet_spirit).to.equal(0);
			})

		});

		it('expect to NOT be able to craft a COMMON cosmetic with 499 spirit in wallet', function() {

			return Promise.all([
				knex("users").where('id',userId).update({
					wallet_spirit: 499
				}),
				knex("user_cosmetic_inventory").where('user_id',userId).delete()
			]).then(function(){
				return InventoryModule.craftCosmetic(userId,SDK.CosmeticsLookup.Emote.Faction1Angry)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(err) {
				expect(err).to.exist;
				expect(err).to.not.be.an.instanceof(chai.AssertionError);
				expect(err).to.be.an.instanceof(Errors.InsufficientFundsError);
			})
		});

		it('expect to NOT be able to craft a COMMON cosmetic they already own', function() {

			return Promise.all([
				knex("users").where('id',userId).update({
					wallet_spirit: 200
				}),
				knex("user_cosmetic_inventory").where('user_id',userId).delete()
			]).then(function() {
				var txPromise = knex.transaction(function (tx) {
					return InventoryModule.giveUserCosmeticId(txPromise, tx, userId, SDK.CosmeticsLookup.Emote.Faction1Angry, "QA GIFT", "QA GIFT ID");
				});
				return txPromise
			}).then(function () {
				return InventoryModule.craftCosmetic(userId,SDK.CosmeticsLookup.Emote.Faction1Angry)
			}).then(function(result){
				expect(result).to.not.exist;
			}).catch(function(err) {
				expect(err).to.exist;
				expect(err).to.not.be.an.instanceof(chai.AssertionError);
				expect(err).to.be.an.instanceof(Errors.AlreadyExistsError);
			})
		});

	});

	describe("claimFreeCardOfTheDay", function(){

		before(function(){
			return SyncModule.wipeUserData(userId)
		})

		it('expect to be able to claim a free card of the day', function() {
			return InventoryModule.claimFreeCardOfTheDay(userId)
			.bind({})
			.then(function(cardId){
				expect(cardId).to.exist
				this.cardId = cardId
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("users").first().where("id",userId),
					knex("user_cards").select().where("user_id",userId),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
				])
			}).spread(function(userRow,cardCountRows,userSnapshot){
				expect(userRow.free_card_of_the_day_claimed_at).to.exist
				expect(userRow.free_card_of_the_day_claimed_count).to.equal(1)
				expect(cardCountRows.length).to.equal(1)
				expect(cardCountRows[0].card_id).to.equal(this.cardId)
				expect(userSnapshot.val().free_card_of_the_day_claimed_at).to.equal(userRow.free_card_of_the_day_claimed_at.valueOf())
			})
		})

		it('expect NOT to be able to claim a free card of the day twice on the same day', function() {
			return InventoryModule.claimFreeCardOfTheDay(userId)
			.then(function(result){
				expect(result).to.not.exist
			}).catch(function(error){
				expect(error).to.exist
				expect(error).to.not.be.an.instanceof(chai.AssertionError)
				expect(error).to.be.an.instanceof(Errors.BadRequestError)
			})
		})

		it('expect to be able to claim a free card of the day on the next day (midnight rollover)', function() {
			var systemTime = moment.utc().add(1,'day')
			return InventoryModule.claimFreeCardOfTheDay(userId,systemTime)
			.bind({})
			.then(function(cardId){
				expect(cardId).to.exist
				this.cardId = cardId
				return DuelystFirebase.connect().getRootRef()
			}).then(function(rootRef){
				return Promise.all([
					knex("users").first().where("id",userId),
					knex("user_cards").select().where("user_id",userId),
					FirebasePromises.once(rootRef.child("users").child(userId),"value"),
				])
			}).spread(function(userRow,cardCountRows,userSnapshot){
				expect(userRow.free_card_of_the_day_claimed_at.valueOf()).to.equal(systemTime.valueOf())
				expect(userRow.free_card_of_the_day_claimed_count).to.equal(2)
				expect(cardCountRows.length).to.equal(2)
				expect(cardCountRows[1].card_id).to.equal(this.cardId)
				expect(userSnapshot.val().free_card_of_the_day_claimed_at).to.equal(userRow.free_card_of_the_day_claimed_at.valueOf())
			})
		})

	})

})
