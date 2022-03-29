var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var CosmeticChestsModule = require('../../../server/lib/data_access/cosmetic_chests.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex');
var generatePushId = require('../../../app/common/generate_push_id');
var colors = require('colors')
var Stats = require('fast-stats').Stats

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("cosmetic chests module", function() {
	this.timeout(25000);

	var userId = null;
	var user2Id = null;
	var fbRootRef = null

	// before cleanup to check if user already exists and delete
	before(function(){
		this.timeout(25000);
		Logger.module("UNITTEST").log("creating user");
		var createOrInsertUser = function (userEmail,userName) {
			return UsersModule.createNewUser(userEmail, userName, 'hash', 'kumite14')
				.bind({})
				.then(function (userIdCreated) {
					this.userId = userIdCreated;
					Logger.module("UNITTEST").log("created user ", userIdCreated);
				}).catch(Errors.AlreadyExistsError, function (error) {
					Logger.module("UNITTEST").log("existing user",userName);
					return UsersModule.userIdForEmail(userEmail)
						.bind(this)
						.then(function (userIdExisting) {
							this.userId = userIdExisting;
							Logger.module("UNITTEST").log("existing user retrieved", userIdExisting);
							return SyncModule.wipeUserData(userIdExisting);
						}).then(function () {
							Logger.module("UNITTEST").log("existing user data wiped", this.userId);
						})
				}).then(function () {
					return Promise.resolve(this.userId)
				});
		};

		return Promise.all([
			createOrInsertUser('unit-test-1@counterplay.co',"player 1",0),
			createOrInsertUser('unit-test-2@counterplay.co',"player 2",0)
		]).spread(function(player1CreatedId,player2CreatedId) {
			userId = player1CreatedId;
			user2Id = player2CreatedId;

			return DuelystFirebase.connect().getRootRef();
		}).then(function(rootRef) {
			fbRootRef = rootRef;
		})
	});

	describe("giveUserChest()", function() {

		it('expect to be able to give a user 1 COMMON chest', function() {
			var currentChestCount = 0;
			var chestId = null;

			return knex("user_cosmetic_chests").where('user_id',userId).select()
				.then(function (chestRows) {
					currentChestCount = chestRows.length;

					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,null,null,1,"Unit test",generatePushId())
					}).then(function (chestDatas) {
						expect(chestDatas).to.exist;
						expect(chestDatas.length).to.equal(1);
						expect(chestDatas[0].chest_type).to.equal(SDK.CosmeticsChestTypeLookup.Common);

						chestId = chestDatas[0].chest_id;

						return knex("user_cosmetic_chests").where('user_id',userId).select();
					}).then(function (chestRows) {
						expect(chestRows).to.exist;
						expect(chestRows.length).to.equal(currentChestCount+1);
					});

					return txPromise.then(function(){
						return FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId).child("cosmetic-chests"));
					}).then(function(fbChestsSnapshot) {
						//expect(fbChestsSnapshot).to.exist;
						//expect(fbChestsSnapshot.val()).to.exist;
						//fbChestDatas = fbChestsSnapshot.val();
                        //
						//expect(fbChestsSnapshot[chestId]).to.exist
					});
				})
		});

		it('expect giving a user 7 more COMMON chests to max out at 5 COMMON chests', function() {
			var currentChestCount = 0;

			return knex("user_cosmetic_chests").where('user_id',userId).select()
				.then(function (chestRows) {
					currentChestCount = chestRows.length;

					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,null,null,7,"Unit test",generatePushId())
					}).then(function (chestDatas) {
						expect(chestDatas).to.exist;
						expect(chestDatas.length).to.equal(4);
						expect(chestDatas[0].chest_type).to.equal(SDK.CosmeticsChestTypeLookup.Common);
						return knex("user_cosmetic_chests").where('user_id',userId).andWhere('chest_type',SDK.CosmeticsChestTypeLookup.Common).select();
					}).then(function (chestRows) {
						expect(chestRows).to.exist;
						expect(chestRows.length).to.equal(5);
					})
					return txPromise;
				})
		});

		it('expect to be able to give a user 5 RARE chests', function() {
			return knex("user_cosmetic_chests").where('user_id',userId).select()
				.then(function (chestRows) {
					currentChestCount = chestRows.length;
					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Rare,null,null,5,"Unit test",generatePushId())
					}).then(function (chestDatas) {
						expect(chestDatas).to.exist;
						expect(chestDatas.length).to.equal(5);
						expect(chestDatas[0].chest_type).to.equal(SDK.CosmeticsChestTypeLookup.Rare);
						return knex("user_cosmetic_chests").where('user_id',userId).andWhere('chest_type',SDK.CosmeticsChestTypeLookup.Rare).select();
					}).then(function (chestRows) {
						expect(chestRows).to.exist;
						expect(chestRows.length).to.equal(5);
					})
					return txPromise;
				})
		});

		it('expect to max out at 5 RARE chests', function() {
			var currentChestCount = 0;

			return knex("user_cosmetic_chests").where('user_id',userId).select()
				.then(function (chestRows) {
					currentChestCount = chestRows.length;
					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Rare,null,null,1,"Unit test",generatePushId())
					}).then(function (chestDatas) {
						expect(chestDatas).to.exist
						expect(chestDatas.length).to.equal(0)
						return knex("user_cosmetic_chests").where('user_id',userId).andWhere('chest_type',SDK.CosmeticsChestTypeLookup.Rare).select();
					}).then(function (chestRows) {
						expect(chestRows).to.exist;
						expect(chestRows.length).to.equal(5);
					})
					return txPromise;
				})
		});

		it('expect giving 6 EPIC chests to award only 5 EPIC chests', function() {
			var currentChestCount = 0;

			return knex("user_cosmetic_chests").where('user_id',userId).select()
				.then(function (chestRows) {
					currentChestCount = chestRows.length;
					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Epic,null,null,6,"Unit test",generatePushId())
					}).then(function (chestDatas) {
						expect(chestDatas).to.exist
						expect(chestDatas.length).to.equal(5)
						return knex("user_cosmetic_chests").where('user_id',userId).andWhere('chest_type',SDK.CosmeticsChestTypeLookup.Epic).select();
					}).then(function (chestRows) {
						expect(chestRows).to.exist;
						expect(chestRows.length).to.equal(5);
					})
					return txPromise;
				})
		});

		it('expect to be able to give a user 1 BOSS chest and it have all required data', function() {
			var MOMENT_NOW_UTC = moment.utc()
			return knex("user_cosmetic_chests").where('user_id',userId).select()
				.then(function (chestRows) {
					currentChestCount = chestRows.length;
					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Boss,SDK.Cards.Boss.Boss3,"QA-Test-Event",1,"Unit test",generatePushId(),MOMENT_NOW_UTC)
					}).then(function (chestDatas) {
						expect(chestDatas).to.exist;
						expect(chestDatas.length).to.equal(1);
						var chestData = chestDatas[0]
						expect(chestData.chest_type).to.equal(SDK.CosmeticsChestTypeLookup.Boss);
						expect(moment.utc(chestData.expires_at).valueOf()).to.equal(MOMENT_NOW_UTC.clone().add(48,"hours").valueOf());
					})
					return txPromise;
				})
		});

	});

	describe("giveUserChestKeys()", function() {

		it('expect to be able to give a user 1 chest key', function() {
			var currentChestKeyCount = 0;

			return knex("user_cosmetic_chest_keys").where('user_id',userId).select()
				.then(function (chestKeyRows) {
					currentChestKeyCount = chestKeyRows.length;

					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,1,"Unit test",generatePushId())
					}).then(function (chestKeyDatas) {
						expect(chestKeyDatas).to.exist;
						expect(chestKeyDatas.length).to.equal(1);
						expect(chestKeyDatas[0].key_type).to.equal(SDK.CosmeticsChestTypeLookup.Common);

						return knex("user_cosmetic_chest_keys").where('user_id',userId).select();
					}).then(function (chestKeyRows) {
						expect(chestKeyRows).to.exist;
						expect(chestKeyRows.length).to.equal(currentChestKeyCount+1);
					})
					return txPromise;
				})
		});

		it('expect to be able to give a user 5 chest keys', function() {
			var currentChestKeyCount = 0;

			return knex("user_cosmetic_chest_keys").where('user_id',userId).select()
				.then(function (chestKeyRows) {
					currentChestKeyCount = chestKeyRows.length;

					txPromise = knex.transaction(function(tx){
						return CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Rare,5,"Unit test",generatePushId())
					}).then(function (chestKeyDatas) {
						expect(chestKeyDatas).to.exist;
						expect(chestKeyDatas.length).to.equal(5);
						expect(chestKeyDatas[0].key_type).to.equal(SDK.CosmeticsChestTypeLookup.Rare);

						return knex("user_cosmetic_chest_keys").where('user_id',userId).select();
					}).then(function (chestKeyRows) {
						expect(chestKeyRows).to.exist;
						expect(chestKeyRows.length).to.equal(currentChestKeyCount+5);
					})
					return txPromise;
				})
		});
	});

	describe("openChest()", function() {

		before(function(){
			return SyncModule.wipeUserData(userId)
		})

		it('expect to be able to open a chest with a key of the same type', function() {
			var keyId = null
			var chestId = null
			txPromise = knex.transaction(function(tx){
				return Promise.all([
					CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,null,null,1,"Unit test",generatePushId()),
					CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,1,"Unit test",generatePushId())
				]).spread(function (chestDatas,chestKeyDatas) {
					chestId = chestDatas[0].chest_id
					keyId = chestKeyDatas[0].key_id
				})
			}).then(function(){
				return CosmeticChestsModule.openChest(userId, chestId, keyId)
			}).then(function (chestRewardDatas) {
				expect(chestRewardDatas).to.exist;
			})
			return txPromise;
		});

		it('expect to be able to open a boss chest before it\'s expiration', function() {
			var keyId = null
			var chestId = null
			return SyncModule.wipeUserData(userId)
			.then(function () {
				txPromise = knex.transaction(function(tx){
					return Promise.all([
						CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Boss,SDK.Cards.Boss.Boss3,"QA-Event-Test-1",1,"Unit test",generatePushId()),
						CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Boss,1,"Unit test",generatePushId())
					]).spread(function (chestDatas,chestKeyDatas) {
						chestId = chestDatas[0].chest_id
						keyId = chestKeyDatas[0].key_id
					})
				}).then(function(){
					return CosmeticChestsModule.openChest(userId, chestId, keyId)
				}).then(function (chestRewardDatas) {
					expect(chestRewardDatas).to.exist;
				})
				return txPromise;
			})
		});

		it('expect to be able to not be able to open a boss chest after it\'s expiration', function() {
			var keyId = null;
			var chestId = null;
			return SyncModule.wipeUserData(userId)
			.then(function () {
				txPromise = knex.transaction(function (tx) {
					return Promise.all([
						CosmeticChestsModule.giveUserChest(txPromise, tx, userId, SDK.CosmeticsChestTypeLookup.Boss, SDK.Cards.Boss.Boss3, "QA-Event-Test-1", 1, "Unit test", generatePushId()),
						CosmeticChestsModule.giveUserChestKey(txPromise, tx, userId, SDK.CosmeticsChestTypeLookup.Boss, 1, "Unit test", generatePushId())
					]).spread(function (chestDatas, chestKeyDatas) {
						chestId = chestDatas[0].chest_id
						keyId = chestKeyDatas[0].key_id
					})
				}).then(function () {
					return CosmeticChestsModule.openChest(userId, chestId, keyId, moment.utc().add(50, "hour"))
				}).then(function (chestRewardDatas) {
					// Should not reach here
					expect(chestRewardDatas).to.exist;
					expect(chestRewardDatas).to.not.exist;
				}).catch(function (error) {
					expect(error).to.exist;
					expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
				})
				return txPromise
				.then(function () {
					// Confirm the chest is still in users unopened chests
					return Promise.all([
						knex("user_cosmetic_chests").where("chest_id",chestId).first(),
						knex("user_cosmetic_chests_opened").where("chest_id",chestId).first()
					])
				}).spread(function(chestRow,chestRowOpened) {
					expect(chestRow).to.exist;
					expect(chestRowOpened).to.not.exist;
				});
			})
		});

		//it('expect to default to a not expired boss crate (if one exists) when trying to open a crate after it\'s expiration', function() {
		//	var keyId = null;
		//	var chestId = null;
		//	var expiredChestId = null;
		//	return SyncModule.wipeUserData(userId)
		//		.then(function () {
		//			txPromise = knex.transaction(function (tx) {
		//				return Promise.all([
		//					CosmeticChestsModule.giveUserChest(txPromise, tx, userId, SDK.CosmeticsChestTypeLookup.Boss, SDK.Cards.Boss.Boss3, "QA-Event-Test-1", 1, "Unit test", generatePushId(),moment.utc().subtract(1,"week")),
		//					CosmeticChestsModule.giveUserChest(txPromise, tx, userId, SDK.CosmeticsChestTypeLookup.Boss, SDK.Cards.Boss.Boss3, "QA-Event-Test-1", 1, "Unit test", generatePushId()),
		//					CosmeticChestsModule.giveUserChestKey(txPromise, tx, userId, SDK.CosmeticsChestTypeLookup.Boss, 1, "Unit test", generatePushId())
		//				]).spread(function (expiredChestDatas, chestDatas, chestKeyDatas) {
		//					expiredChestId = expiredChestDatas[0].chest_id
		//					chestId = chestDatas[0].chest_id
		//					keyId = chestKeyDatas[0].key_id
		//				})
		//			}).then(function () {
		//				return CosmeticChestsModule.openChest(userId, expiredChestId, keyId, moment.utc())
		//			}).then(function (chestRewardDatas) {
		//				// Should reach here
		//				expect(chestRewardDatas).to.exist;
		//			}).catch(function (error) {
		//				// Should not reach here
		//				console.log("here: " + error.toString())
		//				expect(error).to.not.exist;
		//			})
		//			return txPromise
		//				.then(function () {
		//					// Confirm the expired chest is still in users unopened chests, but the not expired one is in opened chests
		//					return Promise.all([
		//						knex("user_cosmetic_chests").where("chest_id",chestId).first(),
		//						knex("user_cosmetic_chests_opened").where("chest_id",chestId).first(),
		//						knex("user_cosmetic_chests").where("chest_id",expiredChestId).first(),
		//						knex("user_cosmetic_chests_opened").where("chest_id",expiredChestId).first()
		//					])
		//				}).spread(function(chestRow,chestRowOpened,expiredChestRow,expiredChestRowOpened) {
		//					expect(chestRow).to.not.exist;
		//					expect(chestRowOpened).to.exist;
        //
		//					expect(expiredChestRow).to.exist;
		//					expect(expiredChestRowOpened).to.not.exist;
		//				});
		//		})
		//});

		it('expect to be not able to open a chest with a key of a different type', function() {
			var keyId = null;
			var chestId = null;
			txPromise = knex.transaction(function(tx){
				return Promise.all([
					CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,null,null,1,"Unit test",generatePushId()),
					CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Rare,1,"Unit test",generatePushId())
				]).spread(function (chestDatas,chestKeyDatas) {
					chestId = chestDatas[0].chest_id
					keyId = chestKeyDatas[0].key_id
				})
			}).then(function(){
				return CosmeticChestsModule.openChest(userId, chestId, keyId)
			}).then(function (openedChestData) {
				expect(openedChestData).to.not.exist;
			}).catch(function(error) {
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.ChestAndKeyTypeDoNotMatchError);
			})
			return txPromise;
		});

		it('expect not to be able to open a chest with a key that does not belong to you', function() {
			var keyId = null;
			var chestId = null;
			var txPromise = knex.transaction(function(tx){
				return Promise.all([
					CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Common,null,null,1,"Unit test",generatePushId()),
					CosmeticChestsModule.giveUserChestKey(txPromise,tx,user2Id,SDK.CosmeticsChestTypeLookup.Common,1,"Unit test",generatePushId())
				]).spread(function (chestDatas,chestKeyDatas) {
					chestId = chestDatas[0].chest_id;
					keyId = chestKeyDatas[0].key_id
				})
			}).then(function(){
				return CosmeticChestsModule.openChest(userId, chestId, keyId);
			}).then(function (openedChestData) {
				expect(openedChestData).to.not.exist;
			}).catch(function(error) {
				expect(error).to.exist;
				expect(error).to.be.an.instanceof(Errors.NotFoundError);
			});
			return txPromise;
		})

		it('expect that no unlockable cards are rewarded by unlocking ~50 chests', function() {
			this.timeout(300000);

			var txPromise = knex.transaction(function (tx) {
				return knex("users").where('id',userId)
					.bind({})
					.then(function(){
						var chestPromises = [];
						var keyPromises = [];
						for (var i = 0, il = 50; i < il; i++) {
							chestPromises.push(CosmeticChestsModule.giveUserChest(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Epic,null,null,1,"Unit test",generatePushId()));
							keyPromises.push(CosmeticChestsModule.giveUserChestKey(txPromise,tx,userId,SDK.CosmeticsChestTypeLookup.Epic,1,"Unit test",generatePushId()));
						}
						return Promise.all([
							Promise.all(chestPromises),
							Promise.all(keyPromises)
						]);
					});
			});

			return txPromise
			.spread(function(chestDatas, keyDatas){
				chestDatas = _.flatten(chestDatas);
				keyDatas = _.flatten(keyDatas);
				return Promise.map(chestDatas,function(chestData, i){
					var chestId = chestData.chest_id;
					var keyId = keyDatas[i].key_id;
					return CosmeticChestsModule.openChest(userId, chestId, keyId);
				});
			})
			.then(function(results) {
				var allCards = SDK.GameSession.getCardCaches().getIsCollectible(true).getCards();
				for (var i = 0, il = results.length; i < il; i++) {
					var cosmeticsRewarded = results[i];
					for (var j = 0, jl = cosmeticsRewarded.length; j < jl; j++) {
						var cosmeticReward = cosmeticsRewarded[j];
						var cardId = cosmeticReward.card_id;
						if (cardId != null) {
							var card = _.find(allCards, function (c) {return c.id === cardId});
							expect(card).to.exist;
							expect(card.getIsUnlockable()).to.equal(false);
						}
					}
				}
			});
		});

	});

	describe("updateUserChestRewardWithGameOutcome()", function() {

		var gameId = "game-id";
		var game2Id = "game-id-2";

		before(function(){
			return SyncModule.wipeUserData(userId).then(function(){
				return knex("user_progression").insert({
					user_id: userId,
					win_count: 8,
					game_count: 5,
					last_game_id: gameId
				})
			})
		})

		it('expect to do nothing for a friendly game', function() {
			return CosmeticChestsModule.updateUserChestRewardWithGameOutcome(userId,true,gameId,SDK.GameType.Friendly,false,false,moment.utc())
				.then(function(result){
					expect(result).to.equal(false)
				})
		})

		it('expect 5 win requirement before receiving any chests (with a 100% rng roll)', function() {
			var NOW_UTC_MOMENT = moment.utc()
			return knex("user_progression").where('user_id',userId).update({
					win_count: 4,
					last_game_id: gameId
				}).then(function(){
					return CosmeticChestsModule.updateUserChestRewardWithGameOutcome(userId,true,gameId,SDK.GameType.Ranked,false,false,NOW_UTC_MOMENT,1.0)
				}).then(function(response){
					expect(response).to.not.exist
				})
		})

		it('expect guarantee to receive a crate at 5+'+CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW+' wins (with a 10% rng roll)', function() {
			var NOW_UTC_MOMENT = moment.utc()
			return knex("user_progression").where('user_id',userId).update({
					win_count: 5+CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
					last_game_id: gameId
				}).then(function(){
					return CosmeticChestsModule.updateUserChestRewardWithGameOutcome(userId,true,gameId,SDK.GameType.Ranked,false,false,NOW_UTC_MOMENT,0.1)
				}).then(function(response){
					expect(response).to.exist
					expect(response.cosmetic_chests.length).to.be.above(0);
					return Promise.all([
						knex("user_rewards").where('user_id',userId).andWhere('reward_category','loot crate').andWhere("game_id",gameId),
						knex("user_cosmetic_chests").where('user_id',userId).andWhere("transaction_id",gameId),
						knex("user_progression").where('user_id',userId).first()
					])
				}).spread(function(rewardRows,chestRows,userProgressionRow){
					expect(rewardRows.length).to.be.above(0)
					expect(rewardRows[0].cosmetic_chests).to.contain(SDK.CosmeticsChestTypeLookup.Common)
					expect(chestRows.length).to.be.above(0)
					expect(chestRows[0].transaction_id).to.equal(rewardRows[0].game_id)
					expect(userProgressionRow.game_count).to.equal(userProgressionRow.last_crate_awarded_game_count)
					expect(userProgressionRow.win_count).to.equal(userProgressionRow.last_crate_awarded_win_count)
					expect(userProgressionRow.last_crate_awarded_at.valueOf()).to.equal(NOW_UTC_MOMENT.valueOf())
				})
		})

		it('expect to receive NO crate at '+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW*2)+' wins if the last crate was at '+CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW+' wins BUT time of last crate is now (with a 90% rng roll)', function() {
			return knex("user_progression").where('user_id',userId).update({
					win_count: 2*CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
					last_game_id: gameId,
					last_crate_awarded_game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
					last_crate_awarded_at: moment.utc().toDate()
				}).then(function(){
					return CosmeticChestsModule.updateUserChestRewardWithGameOutcome(userId,true,gameId,SDK.GameType.Ranked,false,false,moment.utc(),0.9)
				}).then(function(response){
					expect(response).to.not.exist
				})
		})

	})

	describe("updateUserChestRewardWithBossGameOutcome()", function() {

		var gameId = "game-id";
		var game2Id = "game-id-2";

		// Doing this in the past in case test is ever run on production, this event wont be seen
		var eventStartMoment = moment.utc().subtract(30,"days");
		var momentNowUtc = moment.utc().subtract(29,"days");

		var bossId = SDK.Cards.Boss.QABoss3;
		var bossEventId = "Unit-Test-Boss-Event";
		var bossEventData = {
			event_id: bossEventId,
			boss_id: bossId,
			event_start: eventStartMoment.valueOf(),
			event_end: eventStartMoment.clone().add(1,"week").valueOf(),
			valid_end: eventStartMoment.clone().add(1,"week").add(1,"hour").valueOf()
		}

		gameSessionData = {
			players: [
				{
					playerId: generatePushId(),
					generalId: SDK.Cards.Boss.QABoss3
				}
			]
		}

		before(function(){
			return SyncModule.wipeUserData(userId)
			.then(function () {
				//Write event to firebase
				return FirebasePromises.set(fbRootRef.child('boss-events').child(bossEventId),bossEventData)
			})

		});

		after(function () {
			return SyncModule.wipeUserData(userId)
			.then(function () {
				//Write event to firebase
				return FirebasePromises.remove(fbRootRef.child('boss-events').child(bossEventId))
			})
		});

		it('expect to get no boss chest for a friendly game', function() {
			gameSessionData = {
				players: [
					{
						playerId: generatePushId(),
						generalId: SDK.Cards.Boss.QABoss3
					}
				]
			}
			return CosmeticChestsModule.updateUserChestRewardWithBossGameOutcome(userId,true,gameId,SDK.GameType.Friend,false,false,gameSessionData,momentNowUtc)
			.then(function(result){
				expect(result).to.equal(false);

				return knex("user_cosmetic_chests").where("user_id",userId)
			}).then(function (rows) {
				expect(rows).to.exist;
				expect(rows.length).to.equal(0);
			})
		});

		it('expect to get no boss chest for a ranked game', function() {
			gameSessionData = {
				players: [
					{
						playerId: generatePushId(),
						generalId: SDK.Cards.Boss.QABoss3
					}
				]
			}
			return CosmeticChestsModule.updateUserChestRewardWithBossGameOutcome(userId,true,gameId,SDK.GameType.Ranked,false,false,gameSessionData,momentNowUtc)
			.then(function(result){
				expect(result).to.equal(false);

				return knex("user_cosmetic_chests").where("user_id",userId)
			}).then(function (rows) {
				expect(rows).to.exist;
				expect(rows.length).to.equal(0);
			})
		});

		it('expect to not get boss chest for losing to a boss', function() {
			gameSessionData = {
				players: [
					{
						playerId: generatePushId(),
						generalId: SDK.Cards.Boss.QABoss3
					}
				]
			}
			return CosmeticChestsModule.updateUserChestRewardWithBossGameOutcome(userId,false,gameId,SDK.GameType.Boss,false,false,gameSessionData,momentNowUtc)
			.then(function(result){
				return knex("user_cosmetic_chests").where("user_id",userId)
			}).then(function (rows) {
				expect(rows).to.exist;
				expect(rows.length).to.equal(0);
			})
		});

		it('expect to get boss chest for beating a boss for first time, if there is an event for that boss', function() {
			gameSessionData = {
				players: [
					{
						playerId: generatePushId(),
						generalId: SDK.Cards.Boss.QABoss3
					}
				],
				gameSetupData: {
					players: [
						{
							playerId: generatePushId(),
							generalId: SDK.Cards.Boss.QABoss3
						}
					]
				}
			}
			return CosmeticChestsModule.updateUserChestRewardWithBossGameOutcome(userId,true,gameId,SDK.GameType.BossBattle,false,false,gameSessionData,momentNowUtc)
			.then(function(result){
				return knex("user_cosmetic_chests").where("user_id",userId)
			}).then(function (rows) {
				expect(rows).to.exist;
				expect(rows.length).to.equal(1);
				var bossChestRow = rows[0];
				expect(bossChestRow.chest_type).to.equal(SDK.CosmeticsChestTypeLookup.Boss);
				expect(bossChestRow.boss_id).to.equal(bossId);
				expect(bossChestRow.boss_event_id).to.equal(bossEventId);

			})
		});

	})
	//

	describe("_chestProbabilityForProgressionData",function() {

		// for (var i=0; i<30; i+=1) {
		// 	Logger.module("UNITTEST").log("=================================")
		// 	for (var j=1; j<=12; j++) {
		// 		var value = CosmeticChestsModule._chestProbabilityForProgressionData({
		// 			game_count: j,
		// 			last_crate_awarded_at: moment.utc().subtract(i,'days')
		// 		})
		// 		Logger.module("UNITTEST").log("D	"+i+"	wins	"+j+":	"+ (100*value).toFixed(2))
		// 	}
		// }

		it("expects probability of 0.0 if game_count == 0 and last_crate_awarded_at == NULL and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count:0
			})
			expect(value).to.equal(0.0)
		})
		it("expects probability of 0.5 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW/2)+" and last_crate_awarded_at == NULL and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: (CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW/2)
			})
			expect(value).to.equal(0.5)
		})
		it("expects probability of 1.0 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == NULL and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW
			})
			expect(value).to.equal(1.0)
		})
		it("expects probability of 0.0156 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == (today-1) and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
				last_crate_awarded_at: moment.utc().subtract(1,'day')
			})
			expect(value.toFixed(4)).to.equal('0.0156')
		})
		it("expects probability of 0.0625 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == (today-2) and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
				last_crate_awarded_at: moment.utc().subtract(2,'day')
			})
			expect(value.toFixed(4)).to.equal('0.0625')
		})
		it("expects probability of 1.0 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == (today-3) and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
				last_crate_awarded_at: moment.utc().subtract(3,'day')
			})
			expect(value.toFixed(4)).to.equal('0.2500')
		})
		it("expects probability of 1.0 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == (today-4) and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
				last_crate_awarded_at: moment.utc().subtract(4,'day')
			})
			expect(value).to.equal(1.0)
		})
		it("expects probability of 0.33 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW/3)+" and last_crate_awarded_at == (today-4) and last_crate_awarded_game_count == NULL",function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW/3,
				last_crate_awarded_at: moment.utc().subtract(4,'day')
			})
			expect(value.toFixed(2)).to.equal('0.33')
		})
		it("expects probability of 0.33 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == (today-4) and last_crate_awarded_game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW-1),function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
				last_crate_awarded_at: moment.utc().subtract(4,'day'),
				last_crate_awarded_game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW - 1,
			})
			expect(value.toFixed(2)).to.equal('0.33')
		})
		it("expects probability of 0.0417 if game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW)+" and last_crate_awarded_at == (today-2) and last_crate_awarded_game_count == "+(CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW-2),function(){
			var value = CosmeticChestsModule._chestProbabilityForProgressionData({
				game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW,
				last_crate_awarded_at: moment.utc().subtract(2,'day'),
				last_crate_awarded_game_count: CosmeticChestsModule.CHEST_GAME_COUNT_WINDOW - 2,
			})
			expect(value.toFixed(4)).to.equal('0.0417')
		})
	})

	describe("_chestTypeForProgressionData",function() {

		var simulateChestsRandomDays = function(days,playProbability,gameCount,gameCountVariance) {
			var chestTypes = []
			var progressionData = {
				win_count:5,
				game_count:5,
				last_crate_awarded_game_count:null,
				last_crate_awarded_at:null
			}
			var c = 0;
			for (var i=0; i<days; i+=1) {
				if (Math.random() > playProbability)
					continue;
				var day = moment.utc().add(i,'days')
				var dayChests = []
				var variance = Math.floor(gameCount * gameCountVariance * Math.random())
				for (var j=0; j<gameCount + variance; j++) {
					progressionData.game_count++
					var type = null
					if (Math.random() > 0.5) {
						progressionData.win_count++
						var type = CosmeticChestsModule._chestTypeForProgressionData(progressionData,day)
						if (type) {
							progressionData.last_crate_awarded_at = day.valueOf()
							progressionData.last_crate_awarded_game_count = progressionData.game_count
						}
						dayChests.push(type)
						chestTypes.push(type)
					} else {
						dayChests.push(false)
						chestTypes.push(false)
					}
				}

				var output = _.reduce(dayChests,function(memo,type){
					var t = "."
					if (type === null)
						t = ".".green
					else if (type)
						t = type.substring(0,1).toUpperCase()
					if (t == "G") t = t.yellow
					if (t == "P") t = t.cyan
					return memo + t
				},"D"+i+":	")
				//Logger.module("UNITTEST").log(output)
			}
			return chestTypes
		}

		var simulateChestsModuloDays = function(days,modulo,gameCount,gameCountVariance) {

			var chestTypes = []
			var progressionData = {
				win_count:5,
				game_count:5,
				last_crate_awarded_game_count:null,
				last_crate_awarded_at:null
			}
			var c = 0;
			for (var i=0; i<days; i+=1) {
				if (i % modulo != 0)
					continue;
				var day = moment.utc().add(i,'days')
				var dayChests = []
				var variance = Math.floor(gameCount * gameCountVariance * Math.random())
				for (var j=0; j<gameCount + variance; j++) {
					progressionData.game_count++
					var type = null
					if (Math.random() > 0.5) {
						progressionData.win_count++
						var type = CosmeticChestsModule._chestTypeForProgressionData(progressionData,day)
						if (type) {
							progressionData.last_crate_awarded_at = day.valueOf()
							progressionData.last_crate_awarded_game_count = progressionData.game_count
						}
						dayChests.push(type)
						chestTypes.push(type)
					} else {
						dayChests.push(false)
						chestTypes.push(false)
					}
				}

				var output = _.reduce(dayChests,function(memo,type){
					var t = "."
					if (type === null)
						t = ".".green
					else if (type)
						t = type.substring(0,1).toUpperCase()
					if (t == "G") t = t.yellow
					if (t == "P") t = t.cyan
					return memo + t
				},"D"+i+":	")
				//Logger.module("UNITTEST").log(output)
			}
			return chestTypes

		}

		it("expects a player that plays 4 games exactly every 4 days over a 30 day period to receive 6 average crates and gets no more than 10 crates",function(){
			var average = 0
			var n = 200
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsModuloDays(30,5,4,0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 6)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("6")
			expect(stats.percentile(99)).to.be.below(11)

			// Logger.module("UNITTEST").log("mean:",stats.amean())
			// Logger.module("UNITTEST").log("mean:",stats.median())
			// Logger.module("UNITTEST").log("95:",stats.percentile(95))
			// Logger.module("UNITTEST").log("99:",stats.percentile(99))
		})

		it("expects a player that plays 4 games exactly every 10 days over a 30 day period to receive 3 average crates and gets no more than 5 crates",function(){
			var average = 0
			var n = 200
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsModuloDays(30,10,4,0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 3)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("3")
			expect(stats.percentile(99)).to.be.below(6)
		})

		it("expects a player that plays 1-4 games about every ~5 days over a 30 day period to receive 3 average crates and gets no more than 10 crates",function(){
			var average = 0
			var n = 200
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsRandomDays(30,0.20,1,4.0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 3)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("3")
			expect(stats.percentile(99)).to.be.below(11)
		})

		it("expects a player that plays 4-8 games about every ~2 days over a 30 day period to receive 8 average crates and gets no more than 15 crates",function(){
			var average = 0
			var n = 300
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsRandomDays(30,0.5,4,2.0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 8)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("8")
			expect(stats.percentile(99)).to.be.below(16)
		})

		it("expects a player that plays 10-20 games every day over a 30 day period to receive 12 average crates and no fewer than 10 and no more than 20 crates.",function(){
			var average = 0
			var n = 200
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsRandomDays(30,1.0,10,1.0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 12)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("12")
			expect(stats.percentile(1)).to.be.above(9)
			expect(stats.percentile(99)).to.be.below(21)
		})

		it("expects a player that plays 20-40 games every day over a 30 day period to receive 15 average crates and no fewer than 12 and no more than 25 crates.",function(){
			var average = 0
			var n = 200
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsRandomDays(30,1.0,20,1.0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 15)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("15")
			expect(stats.percentile(1)).to.be.above(11)
			expect(stats.percentile(99)).to.be.below(26)
		})

		it("expects a player that plays 20-40 games about every ~3 days over a 30 day period to receive 7-8 average crates and no fewer than 3 and no more than 15 crates.",function(){
			var average = 0;
			var n = 200;
			var stats = new Stats({bucket_precision: 1})
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsRandomDays(30,0.33,20,1.0);
				chestTypes = _.compact(chestTypes);
				stats.push(chestTypes.length)
			})
			// Logger.module("UNITTEST").log(stats.distribution())
			// for (var i=1; i<=100; i++) {
			// 	Logger.module("UNITTEST").log(i+" percentile: "+stats.percentile(i))
			// }
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 7)).to.be.below(1.0)
			expect(stats.percentile(40)).to.be.above(6)
			expect(stats.percentile(60)).to.be.below(9)
			expect(stats.percentile(1)).to.be.above(2)
			expect(stats.percentile(99)).to.be.below(16)

		})

		it("expects a player that plays 20-40 games exactly every 4 days over a 30 day period to receive 8 average crates and no fewer than 3 and no more than 12 crates.",function(){
			var average = 0;
			var n = 200;
			var stats = new Stats()
			_.times(n,function(i){
				// Logger.module("UNITTEST").log("### PLAYER "+i)
				var chestTypes = simulateChestsModuloDays(30,4,20,1.0)
				chestTypes = _.compact(chestTypes)
				stats.push(chestTypes.length)
			})
			expect(stats.moe()).to.be.below(1.00)
			expect(Math.abs(stats.amean() - 8)).to.be.below(0.75)
			expect(stats.median().toFixed(0)).to.equal("8")
			expect(stats.percentile(1)).to.be.above(2)
			expect(stats.percentile(99)).to.be.below(13)
		})
	})

	describe("_generateChestOpeningRewards", function() {
		var iterations = 10000;
		var defaultAllowableVariance = .10;

		var commonChestRewardCountsByType = {};
		var rareChestRewardCountsByType = {};
		var epicChestRewardCountsByType = {};

		var comparePercentageWithVariance = function(expectedPercentage, actualPercentage, allowableVariance) {
			if (allowableVariance == null) {
				allowableVariance = defaultAllowableVariance
			}

			// Don't change
			var lowerVariance = 1.0 - allowableVariance;
			var upperVariance = 1.0 + allowableVariance;

			expect(actualPercentage).to.be.at.least(expectedPercentage*lowerVariance);
			expect(actualPercentage).to.be.at.most(expectedPercentage*upperVariance);
		};

			before('expect chest opening rewards to match current design',function(){
				var gameSession = SDK.GameSession.current();
				var processReward = function(rewardTypeObject,rewardObject) {
					for (var key in rewardObject) {
						var rewardKey = key;
						if (rewardKey == "chest_key") {
							rewardKey += "_" + rewardObject[key]
						}

						if (rewardTypeObject[rewardKey] == null) {
							rewardTypeObject[rewardKey] = 0;
						}
						rewardTypeObject[rewardKey] += 1;
					}
				};

				_.times(iterations,function() {
					var commonRewards = CosmeticChestsModule._generateChestOpeningRewards({chest_type:SDK.CosmeticsChestTypeLookup.Common});
					var rareRewards = CosmeticChestsModule._generateChestOpeningRewards({chest_type:SDK.CosmeticsChestTypeLookup.Rare});
					var epicRewards = CosmeticChestsModule._generateChestOpeningRewards({chest_type:SDK.CosmeticsChestTypeLookup.Epic});

					for (var i=0; i < commonRewards.length; i++) {
						processReward(commonChestRewardCountsByType,commonRewards[i]);
					}
					for (var i=0; i < rareRewards.length; i++) {
						processReward(rareChestRewardCountsByType,rareRewards[i]);
					}
					for (var i=0; i < epicRewards.length; i++) {
						processReward(epicChestRewardCountsByType,epicRewards[i]);
					}
			});

			//Logger.module("UNITTEST").log("Chest opening percentages:");
			//Logger.module("UNITTEST").log("-Common-");
			//var commonKeys = _.keys(commonChestRewardCountsByType).sort();
			//for (var i=0; i < commonKeys.length; i++) {
			//	var key = commonKeys[i];
			//	var percentageResult = commonChestRewardCountsByType[key] / iterations;
			//	Logger.module("UNITTEST").log("  " + key + ": " + percentageResult);
			//}
			//Logger.module("UNITTEST").log("-Rare-");
			//var rareKeys = _.keys(rareChestRewardCountsByType).sort();
			//for (var i=0; i < rareKeys.length; i++) {
			//	var key = rareKeys[i];
			//	var percentageResult = rareChestRewardCountsByType[key] / iterations;
			//	Logger.module("UNITTEST").log("  " + key + ": " + percentageResult);
			//}
			//Logger.module("UNITTEST").log("-Epic-");
			//var epicKeys = 	_.keys(epicChestRewardCountsByType).sort();
			//for (var i=0; i < epicKeys.length; i++) {
			//	var key = epicKeys[i];
			//	var percentageResult = epicChestRewardCountsByType[key] / iterations;
			//	Logger.module("UNITTEST").log("  " + key + ": " + percentageResult);
			//}
		});

		describe("common chest results:", function () {
			it("expect about an average of 0.75 prismatic commons per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['prismatic_common']).to.exist;
				var percentage = commonChestRewardCountsByType['prismatic_common'] / iterations;
				comparePercentageWithVariance(0.75,percentage);
			});

			it("expect about an average of 0.20 prismatic rares per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['prismatic_rare']).to.exist;
				var percentage = commonChestRewardCountsByType['prismatic_rare'] / iterations;
				comparePercentageWithVariance(0.20,percentage);
			});

			it("expect about an average of 0.04 prismatic epics per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['prismatic_epic']).to.exist;
				var percentage = commonChestRewardCountsByType['prismatic_epic'] / iterations;
				comparePercentageWithVariance(0.04,percentage,defaultAllowableVariance*2);
			});

			it("expect about an average of 0.01 prismatic legendaries per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['prismatic_legendary']).to.exist;
				var percentage = commonChestRewardCountsByType['prismatic_legendary'] / iterations;
				comparePercentageWithVariance(0.01,percentage,defaultAllowableVariance*2);
			});

			it("expect exactly 1.0 cosmetic commons per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['cosmetic_common']).to.exist;
				var percentage = commonChestRewardCountsByType['cosmetic_common'] / iterations;
				expect(percentage).to.equal(1.0);
			});

			it("expect exactly 0.85 cosmetic rares per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['cosmetic_rare']).to.exist;
				var percentage = commonChestRewardCountsByType['cosmetic_rare'] / iterations;
				comparePercentageWithVariance(0.85,percentage);
			});

			it("expect about an average of 0.13 cosmetic epics per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['cosmetic_epic']).to.exist;
				var percentage = commonChestRewardCountsByType['cosmetic_epic'] / iterations;
				comparePercentageWithVariance(0.13,percentage);
			});

			it("expect about an average of 0.02 cosmetic legendaries per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['cosmetic_legendary']).to.exist;
				var percentage = commonChestRewardCountsByType['cosmetic_legendary'] / iterations;
				comparePercentageWithVariance(0.02,percentage,defaultAllowableVariance*2);
			});

			it("expect no unknown rewards per common cosmetic chest",function(){
				expect(commonChestRewardCountsByType['unknownReward']).to.not.exist;
			});
		});

		describe("rare chest results:", function () {
			it("expect about an average of 0 prismatic commons per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['prismatic_common']).to.not.exist;
			});

			it("expect about an average of 0.85 prismatic rares per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['prismatic_rare']).to.exist;
				var percentage = rareChestRewardCountsByType['prismatic_rare'] / iterations;
				comparePercentageWithVariance(0.85,percentage);
			});

			it("expect about an average of 0.10 prismatic epics per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['prismatic_epic']).to.exist;
				var percentage = rareChestRewardCountsByType['prismatic_epic'] / iterations;
				comparePercentageWithVariance(0.10,percentage);
			});

			it("expect about an average of 0.05 prismatic legendaries per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['prismatic_legendary']).to.exist;
				var percentage = rareChestRewardCountsByType['prismatic_legendary'] / iterations;
				comparePercentageWithVariance(0.05,percentage,defaultAllowableVariance*2);
			});

			it("expect about an average of 1.6 cosmetic commons per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['cosmetic_common']).to.exist;
				var percentage = rareChestRewardCountsByType['cosmetic_common'] / iterations;
				comparePercentageWithVariance(1.6,percentage);
			});

			it("expect about an average of 1.15 cosmetic rares per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['cosmetic_rare']).to.exist;
				var percentage = rareChestRewardCountsByType['cosmetic_rare'] / iterations;
				comparePercentageWithVariance(1.15,percentage);
			});

			it("expect about an average of 1.15 cosmetic epics per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['cosmetic_epic']).to.exist;
				var percentage = rareChestRewardCountsByType['cosmetic_epic'] / iterations;
				comparePercentageWithVariance(1.15,percentage);
			});

			it("expect about an average of 0.10 cosmetic legendaries per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['cosmetic_legendary']).to.exist;
				var percentage = rareChestRewardCountsByType['cosmetic_legendary'] / iterations;
				comparePercentageWithVariance(0.10,percentage,defaultAllowableVariance*2);
			});

			it("expect no unknown rewards per rare cosmetic chest",function(){
				expect(rareChestRewardCountsByType['unknownReward']).to.not.exist;
			});
		});

		describe("epic chest results:", function () {
			it("expect exactly 0 prismatic commons per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['prismatic_common']).to.not.exist;
			});

			it("expect about an average of 1.30 prismatic rares per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['prismatic_rare']).to.exist;
				var percentage = epicChestRewardCountsByType['prismatic_rare'] / iterations;
				comparePercentageWithVariance(1.30,percentage);
			});

			it("expect about an average of 0.55 prismatic epics per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['prismatic_epic']).to.exist;
				var percentage = epicChestRewardCountsByType['prismatic_epic'] / iterations;
				comparePercentageWithVariance(0.55,percentage);
			});

			it("expect about an average of 0.15 prismatic legendaries per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['prismatic_legendary']).to.exist;
				var percentage = epicChestRewardCountsByType['prismatic_legendary'] / iterations;
				comparePercentageWithVariance(0.15,percentage);
			});

			it("expect about an average of 1.6 cosmetic commons per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['cosmetic_common']).to.exist;
				var percentage = epicChestRewardCountsByType['cosmetic_common'] / iterations;
				comparePercentageWithVariance(1.6,percentage);
			});

			it("expect about an average of 1.15 cosmetic rares per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['cosmetic_rare']).to.exist;
				var percentage = epicChestRewardCountsByType['cosmetic_rare'] / iterations;
				comparePercentageWithVariance(1.15,percentage);
			});

			it("expect about an average of 1.15 cosmetic epics per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['cosmetic_epic']).to.exist;
				var percentage = epicChestRewardCountsByType['cosmetic_epic'] / iterations;
				comparePercentageWithVariance(1.15,percentage);
			});

			it("expect about an average of 1.10 cosmetic legendaries per epic cosmetic chest",function(){
				expect(epicChestRewardCountsByType['cosmetic_legendary']).to.exist;
				var percentage = epicChestRewardCountsByType['cosmetic_legendary'] / iterations;
				comparePercentageWithVariance(1.10,percentage);
			});

			it("expect no unknown rewards per rare cosmetic chest",function(){
				expect(epicChestRewardCountsByType['unknownReward']).to.not.exist;
			});
		});
	});

})
