var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var GamesModule = require('../../../server/lib/data_access/games.coffee');
var QuestsModule = require('../../../server/lib/data_access/quests.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var MigrationsModule = require('../../../server/lib/data_access/migrations.coffee');
var GauntletModule = require('../../../server/lib/data_access/gauntlet.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex')
var NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum')

var CardSetLookup = require('app/sdk/cards/cardSetLookup')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("migrations module", function() {

	var userId = null;
	this.timeout(25000);

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
		})
	})

	describe("checkIfUserNeedsMigrateEmotes20160708()", function() {

		it('expect a player to need emote migration if their last session was last year and they have no cosmetics', function() {

			return SyncModule.wipeUserData(user2Id)
				.then(function () {
					return knex("users").where("id",user2Id).update("last_session_at",moment.utc("2015-02-02").toDate())
				}).then(function () {
					return knex("users").first().where("id", user2Id)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(userRow)
				}).then(function (userNeedsMigrateEmotes) {
					expect(userNeedsMigrateEmotes).to.equal(true);
				})

		});

		it('expect a player to not need emote migration if their last session is after the deadline and they have no cosmetics', function() {

			return SyncModule.wipeUserData(user2Id)
				.then(function () {
					return knex("users").where("id",user2Id).update("last_session_at",moment.utc("2017-02-02").toDate())
				}).then(function () {
					return knex("users").first().where("id", user2Id)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(userRow)
				}).then(function (userNeedsMigrateEmotes) {
					expect(userNeedsMigrateEmotes).to.equal(false);
				})

		});

		it('expect a player to not need emote migration if their last session was last year and they have cosmetics', function() {

			return SyncModule.wipeUserData(user2Id)
				.then(function () {
					return knex("users").where("id",user2Id).update("last_session_at",moment.utc("2015-02-02").toDate())
				}).then(function () {
					var txPromise = knex.transaction(function(tx) {
						return InventoryModule.giveUserCosmeticId(txPromise,tx,user2Id,SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015,"QA Gift","migration 20160708")
					});
					return txPromise;
				}).then(function () {
					return knex("users").first().where("id", user2Id)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsMigrateEmotes20160708(userRow)
				}).then(function (userNeedsMigrateEmotes) {
					expect(userNeedsMigrateEmotes).to.equal(false);
				})
		});

	})

	describe("userMigrateEmotes20160708()", function() {

		it('expect a user to have all original general emotes after migration', function() {

			return SyncModule.wipeUserData(user2Id)
				.then(function () {
					return MigrationsModule.userMigrateEmotes20160708(user2Id) // TODO: this should be passing in a time
				}).then(function () {
					return knex("user_cosmetic_inventory").select().where("user_id", user2Id)
				}).then(function (userCosmeticRows) {
					var expectedEmoteIds = [];
					for (var key in SDK.CosmeticsLookup.Emote) {
						if (key.includes("Faction") && !key.includes("Alt")) {
							expectedEmoteIds.push(SDK.CosmeticsLookup.Emote[key]);
						}
					}
					// Remove the basic emotes
					expectedEmoteIds = _.difference(expectedEmoteIds,[
						SDK.CosmeticsLookup.Emote.Faction1Happy,
						SDK.CosmeticsLookup.Emote.Faction2Angry,
						SDK.CosmeticsLookup.Emote.Faction3Confused,
						SDK.CosmeticsLookup.Emote.Faction4Frustrated,
						SDK.CosmeticsLookup.Emote.Faction5Sad,
						SDK.CosmeticsLookup.Emote.Faction6Kiss
					]);

					expect(userCosmeticRows).to.exist;
					expect(userCosmeticRows.length).to.equal(expectedEmoteIds.length);
					for (var i=0;i<userCosmeticRows.length;i++) {
						var cosmeticRow = userCosmeticRows[i];
						expect(_.contains(expectedEmoteIds,cosmeticRow.cosmetic_id)).to.equal(true);
					}
				})

		});

		it('expect a user to have all original general emotes after migration and any others they already had', function() {

			return SyncModule.wipeUserData(user2Id)
				.then(function () {
					return MigrationsModule.userMigrateEmotes20160708(user2Id)
				}).then(function () {
					var txPromise = knex.transaction(function (tx) {
						return InventoryModule.giveUserCosmeticId(txPromise,tx,user2Id,SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015,"QA GIFT","QA Gift 1")
					});
					return txPromise;
				}).then(function () {
					return knex("user_cosmetic_inventory").select().where("user_id", user2Id)
				}).then(function (userCosmeticRows) {
					var expectedEmoteIds = [
						SDK.CosmeticsLookup.Emote.OtherSnowChaserHoliday2015
					];
					for (var key in SDK.CosmeticsLookup.Emote) {
						if (key.includes("Faction") && !key.includes("Alt")) {
							expectedEmoteIds.push(SDK.CosmeticsLookup.Emote[key]);
						}
					}
					// Remove the basic emotes
					expectedEmoteIds = _.difference(expectedEmoteIds,[
						SDK.CosmeticsLookup.Emote.Faction1Happy,
						SDK.CosmeticsLookup.Emote.Faction2Angry,
						SDK.CosmeticsLookup.Emote.Faction3Confused,
						SDK.CosmeticsLookup.Emote.Faction4Frustrated,
						SDK.CosmeticsLookup.Emote.Faction5Sad,
						SDK.CosmeticsLookup.Emote.Faction6Kiss
					]);

					expect(userCosmeticRows).to.exist;
					expect(userCosmeticRows.length).to.equal(expectedEmoteIds.length);
					for (var i=0;i<userCosmeticRows.length;i++) {
						var cosmeticRow = userCosmeticRows[i];
						expect(_.contains(expectedEmoteIds,cosmeticRow.cosmetic_id)).to.equal(true);
					}
				})

		});

	});

	describe("checkIfUserNeedsPrismaticBackfillReward()", function() {

		it('expect a player to need prismatic backfill they have no last_session_version', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version",null)
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow)
				}).then(function (userNeedsPrismaticBackfill) {
					expect(userNeedsPrismaticBackfill).to.equal(true);
				})

		});

		it('expect a player to need prismatic backfill if their last session is before the version deadline', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version","1.65.12")
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow)
				}).then(function (userNeedsPrismaticBackfill) {
					expect(userNeedsPrismaticBackfill).to.equal(true);
				})

		});

		it('expect a player to not need prismatic backfill if their last session hotfix version is after 1.73.0', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version","1.73.1")
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow)
				}).then(function (userNeedsPrismaticBackfill) {
					expect(userNeedsPrismaticBackfill).to.equal(false);
				})
		});

		it('expect a player to not need prismatic backfill if their last session minor version is after 1.73.0', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version","1.74.0")
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow)
				}).then(function (userNeedsPrismaticBackfill) {
					expect(userNeedsPrismaticBackfill).to.equal(false);
				})
		});

		it('expect a player to not need prismatic backfill if their last session version is before 1.73.0 but they already got backfill reward', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version","1.69.0")
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow)
				}).then(function (userNeedsPrismaticBackfill) {
					expect(userNeedsPrismaticBackfill).to.equal(true);

					var dateToOpenSpiritOrbs = moment.utc("2016-07-12 03:30");

					var unlockSpiritOrbPromises = [];
					for (var i=0; i < 20; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateToOpenSpiritOrbs)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateToOpenSpiritOrbs);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					return Promise.all(unlockSpiritOrbPromises)
				}).then(function () {
					return MigrationsModule.userBackfillPrismaticRewards(userId)
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsPrismaticBackfillReward(userRow)
				}).then(function (userNeedsPrismaticBackfill) {
					expect(userNeedsPrismaticBackfill).to.equal(false);
				})
		});

	})

	describe("userBackfillPrismaticRewards()", function() {

		this.timeout(100000);

		it('expect a player to receive no prismatic backfill rewards if they have opened 10 spirit orbs before cutoff', function() {

			var dateToOpenSpiritOrbs = moment.utc("2016-07-12 03:30");

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version",null)
				}).then(function () {
					var unlockSpiritOrbPromises = [];
					for (var i=0; i < 10; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateToOpenSpiritOrbs)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateToOpenSpiritOrbs);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					return Promise.all(unlockSpiritOrbPromises)
				}).then(function () {
					// Get user's inventory to compare later
					return Promise.all([
						knex("user_spirit_orbs_opened").where("user_id",userId),
						knex("user_cards").where("user_id",userId)
					])
				}).spread(function (spiritOrbsOpenedRow,cardRows) {
					expect(spiritOrbsOpenedRow).to.exist;
					expect(spiritOrbsOpenedRow.length).to.equal(10);

					expect(cardRows).to.exist;
					this.previousCardRows = cardRows;

					return MigrationsModule.userBackfillPrismaticRewards(userId)
				}).then(function () {
					return knex("user_cards").where("user_id",userId)
				}).then(function (newCardRows) {
					expect(newCardRows).to.exist;

					var newCardIds = [];

					for (var i=0; i < newCardRows.length; i++) {
						var newCardRow = newCardRows[i];
						var oldCardRow = _.find(this.previousCardRows, function(val) {
							return val.card_id == newCardRow.card_id;
						});
						var numCopiesAdded = 0;
						if (oldCardRow == null) {
							numCopiesAdded = newCardRow.count;
						} else {
							numCopiesAdded = newCardRow.count - oldCardRow.count;
						}
						for (var j=0; j < numCopiesAdded; j++) {
							newCardIds.push(newCardRow.id)
						}
					}

					expect(newCardIds.length).to.equal(0)
				})

		});

		it('expect a player to receive no prismatic backfill rewards if they have opened 10 spirit orbs before cutoff and 20 after (long)', function() {

			var dateToOpenSpiritOrbs = moment.utc("2016-07-12 03:30");
			var dateAfterCutoff = moment.utc("2016-09-12 03:30");

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version",null)
				}).then(function () {
					var unlockSpiritOrbPromises = [];
					for (var i=0; i < 10; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateToOpenSpiritOrbs)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateToOpenSpiritOrbs);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					for (var i=0; i < 20; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateAfterCutoff)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateAfterCutoff);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					return Promise.all(unlockSpiritOrbPromises)
				}).then(function () {
					// Get user's inventory to compare later
					return Promise.all([
						knex("user_spirit_orbs_opened").where("user_id",userId),
						knex("user_cards").where("user_id",userId)
					])
				}).spread(function (spiritOrbsOpenedRow,cardRows) {
					expect(spiritOrbsOpenedRow).to.exist;
					expect(spiritOrbsOpenedRow.length).to.equal(10+20);

					expect(cardRows).to.exist;
					this.previousCardRows = cardRows;

					return MigrationsModule.userBackfillPrismaticRewards(userId)
				}).then(function () {
					return knex("user_cards").where("user_id",userId)
				}).then(function (newCardRows) {
					expect(newCardRows).to.exist;

					var newCardIds = [];

					for (var i=0; i < newCardRows.length; i++) {
						var newCardRow = newCardRows[i];
						var oldCardRow = _.find(this.previousCardRows, function(val) {
							return val.card_id == newCardRow.card_id;
						});
						var numCopiesAdded = 0;
						if (oldCardRow == null) {
							numCopiesAdded = newCardRow.count;
						} else {
							numCopiesAdded = newCardRow.count - oldCardRow.count;
						}
						for (var j=0; j < numCopiesAdded; j++) {
							newCardIds.push(newCardRow.id)
						}
					}

					expect(newCardIds.length).to.equal(0)
				})

		});

		it('expect a player to receive small prismatic backfill reward if they have opened 28 spirit orbs before cutoff (long)', function() {

			var dateToOpenSpiritOrbs = moment.utc("2016-07-12 03:30");

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version",null)
				}).then(function () {
					var unlockSpiritOrbPromises = [];
					for (var i=0; i < 28; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateToOpenSpiritOrbs)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateToOpenSpiritOrbs);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					return Promise.all(unlockSpiritOrbPromises)
				}).then(function () {
					// Get user's inventory to compare later
					return Promise.all([
						knex("user_spirit_orbs_opened").where("user_id",userId),
						knex("user_cards").where("user_id",userId)
					])
				}).spread(function (spiritOrbsOpenedRow,cardRows) {
					expect(spiritOrbsOpenedRow).to.exist;
					expect(spiritOrbsOpenedRow.length).to.equal(28);

					expect(cardRows).to.exist;
					this.previousCardRows = cardRows;

					return MigrationsModule.userBackfillPrismaticRewards(userId)
				}).then(function () {
					return knex("user_cards").where("user_id",userId)
				}).then(function (newCardRows) {
					expect(newCardRows).to.exist;

					var newCardIds = [];

					for (var i=0; i < newCardRows.length; i++) {
						var newCardRow = newCardRows[i];
						var oldCardRow = _.find(this.previousCardRows, function(val) {
							return val.card_id == newCardRow.card_id;
						});
						var numCopiesAdded = 0;
						if (oldCardRow == null) {
							numCopiesAdded = newCardRow.count;
						} else {
							numCopiesAdded = newCardRow.count - oldCardRow.count;
						}
						for (var j=0; j < numCopiesAdded; j++) {
							newCardIds.push(newCardRow.card_id)
						}
					}

					expect(newCardIds.length).to.equal(6)

					var gameSession = SDK.GameSession.current();
					var commonPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Common) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(commonPrismaticCardCount).to.equal(2);

					var rarePrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Rare) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(rarePrismaticCardCount).to.equal(2);

					var epicPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Epic) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(epicPrismaticCardCount).to.equal(2);
				})
		});

		it('expect a player to receive small prismatic backfill reward if they have opened 28 spirit orbs before cutoff and 25 after (long)', function() {

			var dateToOpenSpiritOrbs = moment.utc("2016-07-12 03:30");
			var dateAfterCutoff = moment.utc("2016-09-12 03:30");

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version",null)
				}).then(function () {
					var unlockSpiritOrbPromises = [];
					for (var i=0; i < 28; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateToOpenSpiritOrbs)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateToOpenSpiritOrbs);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}
					for (var i=0; i < 25; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateAfterCutoff)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateAfterCutoff);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					return Promise.all(unlockSpiritOrbPromises)
				}).then(function () {
					// Get user's inventory to compare later
					return Promise.all([
						knex("user_spirit_orbs_opened").where("user_id",userId),
						knex("user_cards").where("user_id",userId)
					])
				}).spread(function (spiritOrbsOpenedRow,cardRows) {
					expect(spiritOrbsOpenedRow).to.exist;
					expect(spiritOrbsOpenedRow.length).to.equal(28+25);

					expect(cardRows).to.exist;
					this.previousCardRows = cardRows;

					return MigrationsModule.userBackfillPrismaticRewards(userId)
				}).then(function () {
					return knex("user_cards").where("user_id",userId)
				}).then(function (newCardRows) {
					expect(newCardRows).to.exist;

					var newCardIds = [];

					for (var i=0; i < newCardRows.length; i++) {
						var newCardRow = newCardRows[i];
						var oldCardRow = _.find(this.previousCardRows, function(val) {
							return val.card_id == newCardRow.card_id;
						});
						var numCopiesAdded = 0;
						if (oldCardRow == null) {
							numCopiesAdded = newCardRow.count;
						} else {
							numCopiesAdded = newCardRow.count - oldCardRow.count;
						}
						for (var j=0; j < numCopiesAdded; j++) {
							newCardIds.push(newCardRow.card_id)
						}
					}

					expect(newCardIds.length).to.equal(6)

					var gameSession = SDK.GameSession.current();
					var commonPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Common) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(commonPrismaticCardCount).to.equal(2);

					var rarePrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Rare) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(rarePrismaticCardCount).to.equal(2);

					var epicPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Epic) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(epicPrismaticCardCount).to.equal(2);
				})
		});


		it('expect a player to receive 2 prismatic backfill reward chunks if they have opened 119 spirit orbs before cutoff (very long)', function() {
			this.timeout(200000);

			var dateToOpenSpiritOrbs = moment.utc("2016-07-12 03:30");

			return SyncModule.wipeUserData(userId)
				.bind({})
				.then(function () {
					return knex("users").where("id",userId).update("last_session_version",null)
				}).then(function () {
					var unlockSpiritOrbPromises = [];
					for (var i=0; i < 119; i++) {
						var txPromise = knex.transaction(function(tx) {
							return InventoryModule.addBoosterPackToUser(txPromise,tx,userId,CardSetLookup.Core,"QA gift","QA gift id",null,dateToOpenSpiritOrbs)
						}).then(function(boosterId) {
							return InventoryModule.unlockBoosterPack(userId,boosterId,dateToOpenSpiritOrbs);
						});
						unlockSpiritOrbPromises.push(txPromise)
					}

					return Promise.all(unlockSpiritOrbPromises)
				}).then(function () {
					// Get user's inventory to compare later
					return Promise.all([
						knex("user_spirit_orbs_opened").where("user_id",userId),
						knex("user_cards").where("user_id",userId)
					])
				}).spread(function (spiritOrbsOpenedRow,cardRows) {
					expect(spiritOrbsOpenedRow).to.exist;
					expect(spiritOrbsOpenedRow.length).to.equal(119);

					expect(cardRows).to.exist;
					this.previousCardRows = cardRows;

					return MigrationsModule.userBackfillPrismaticRewards(userId)
				}).then(function () {
					return knex("user_cards").where("user_id",userId)
				}).then(function (newCardRows) {
					expect(newCardRows).to.exist;

					var newCardIds = [];

					for (var i=0; i < newCardRows.length; i++) {
						var newCardRow = newCardRows[i];
						var oldCardRow = _.find(this.previousCardRows, function(val) {
							return val.card_id == newCardRow.card_id;
						});
						var numCopiesAdded = 0;
						if (oldCardRow == null) {
							numCopiesAdded = newCardRow.count;
						} else {
							numCopiesAdded = newCardRow.count - oldCardRow.count;
						}
						for (var j=0; j < numCopiesAdded; j++) {
							newCardIds.push(newCardRow.card_id)
						}
					}

					expect(newCardIds.length).to.equal(20)

					var gameSession = SDK.GameSession.current();
					var commonPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Common) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(commonPrismaticCardCount).to.equal(8);

					var rarePrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Rare) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(rarePrismaticCardCount).to.equal(6);

					var epicPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Epic) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(epicPrismaticCardCount).to.equal(4);

					var legendaryPrismaticCardCount = _.reduce(newCardIds,function(memo,cardId) {
						var sdkCard = gameSession.createCardForIdentifier(cardId);
						if (SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) && !SDK.Cards.getIsSkinnedCardId(sdkCard.getId()) && sdkCard.getRarityId() == SDK.Rarity.Legendary) {
							return memo + 1;
						} else {
							return memo;
						}
					},0)
					expect(legendaryPrismaticCardCount).to.equal(2);
				})
		});


	})

	describe("checkIfUserNeedsChargeCountsMigration()", function() {

		it('expect a player to need charge counts migrated if they have no last_session_version', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null,
						purchase_count:1
					})
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow)
				}).then(function (needsMigration) {
					expect(needsMigration).to.equal(true);
				})

		});

		it('expect a player to need charge counts migrated if their last session is far before the version deadline', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:"1.70.11",
						purchase_count:1
					})
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow)
				}).then(function (needsMigration) {
					expect(needsMigration).to.equal(true);
				})

		});

		it('expect a player to not need charge counts migrated if their last session hotfix version is before 1.74.11', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:"1.74.10",
						purchase_count:1
					})
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow)
				}).then(function (needsMigration) {
					expect(needsMigration).to.equal(true);
				})
		});

		it('expect a player to not need charge counts migrated if their last session hotfix version is after 1.74.11', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:"1.74.12",
						purchase_count:1
					})
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow)
				}).then(function (needsMigration) {
					expect(needsMigration).to.equal(false);
				})
		});

		it('expect a player to not need prismatic backfill if their last session version is at least 1.75.0', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:"1.75.0",
						purchase_count:1
					})
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow)
				}).then(function (needsMigration) {
					expect(needsMigration).to.equal(false);
				})
		});

		it('expect a player to not need prismatic backfill if their last session version is before 1.74.0 but they have no purchases', function() {

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:"1.69.0",
						purchase_count:0
					})
				}).then(function () {
					return knex("users").first().where("id", userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsChargeCountsMigration(userRow)
				}).then(function (needsMigration) {
					expect(needsMigration).to.equal(false)
				})
		});

	})

	describe("userCreateChargeCountsMigration()",function() {

		it('expect a player that did not purchase a starter bundle to have nothing in their firebase purchase count tree',function(){

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null,
						purchase_count:0,
						has_purchased_starter_bundle:false
					})
				}).then(function () {
					return MigrationsModule.userCreateChargeCountsMigration(userId)
				}).then(function () {
					return DuelystFirebase.connect().getRootRef()
				}).then(function (rootRef) {
					return FirebasePromises.once(rootRef.child('user-purchase-counts').child(userId),'value')
				}).then(function (purchaseCountsSnapshot) {
					expect(purchaseCountsSnapshot.val()).to.not.exist
				})
		})

		it('expect a player that purchased a starter bundle to correctly mark it into purchase count tree',function(){

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null,
						purchase_count:1,
						has_purchased_starter_bundle:true
					})
				}).then(function () {
					return MigrationsModule.userCreateChargeCountsMigration(userId)
				}).then(function () {
					return DuelystFirebase.connect().getRootRef()
				}).then(function (rootRef) {
					return FirebasePromises.once(rootRef.child('user-purchase-counts').child(userId),'value')
				}).then(function (purchaseCountsSnapshot) {
					expect(purchaseCountsSnapshot.val()["STARTERBUNDLE_201604"]).to.exist
					expect(purchaseCountsSnapshot.val()["STARTERBUNDLE_201604"].count).to.equal(1)
				})
		})

	})

	describe("checkIfUserNeedsIncompleteGauntletRefund()",function() {

		it('expect a player with an old gauntlet run that is complete to not need a refund',function(){

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null
					})
				}).then(function () {
					return knex("users").where('id',userId).update({'wallet_gold':150})
				}).then(function () {
					return GauntletModule.buyArenaTicketWithGold(userId);
				}).then(function (ticketId) {
					return GauntletModule.startRun(userId,ticketId,moment.utc("2017-04-02 13:00"));
				}).then(function () {
					return knex("user_gauntlet_run").where("user_id",userId).update({is_complete:true})
				}).then(function () {
					return knex("users").first().where("id",userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(userRow)
				}).then(function (needsRefund) {
					expect(needsRefund).to.equal(false)
				})
		})

		it('expect a player with a gauntlet run that is not complete and has no faction choices to not need a refund',function(){

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null
					})
				}).then(function () {
					return knex("users").where('id',userId).update({'wallet_gold':150})
				}).then(function () {
					return GauntletModule.buyArenaTicketWithGold(userId);
				}).then(function (ticketId) {
					return GauntletModule.startRun(userId,ticketId,moment.utc("2017-04-02 13:00"));
				}).then(function () {
					return knex("users").first().where("id",userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(userRow)
				}).then(function (needsRefund) {
					expect(needsRefund).to.equal(false)
				})
		})

		it('expect a player with an old gauntlet run that is not complete and has faction choices to need a refund',function(){

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null
					})
				}).then(function () {
					return knex("users").where('id',userId).update({'wallet_gold':150})
				}).then(function () {
					return GauntletModule.buyArenaTicketWithGold(userId);
				}).then(function (ticketId) {
					return GauntletModule.startRun(userId,ticketId,moment.utc("2017-04-02 13:00"));
				}).then(function () {
					return knex("user_gauntlet_run").where("user_id",userId).update({faction_choices:[1,2,3]})
				}).then(function () {
					return knex("users").first().where("id",userId)
				}).then(function (userRow) {
					return MigrationsModule.checkIfUserNeedsIncompleteGauntletRefund(userRow)
				}).then(function (needsRefund) {
					expect(needsRefund).to.equal(true)
				})
		})

	})

	describe("userIncompleteGauntletRefund()",function() {

		it('expect a player with an old gauntlet run that is not complete to no longer have a run and to now have an arena ticket',function(){

			return SyncModule.wipeUserData(userId)
				.then(function () {
					return knex("users").where("id",userId).update({
						last_session_version:null
					})
				}).then(function () {
					return knex("users").where('id',userId).update({'wallet_gold':150})
				}).then(function () {
					return GauntletModule.buyArenaTicketWithGold(userId);
				}).then(function (ticketId) {
					return GauntletModule.startRun(userId,ticketId,moment.utc("2017-04-02 13:00"));
				}).then(function () {
				}).then(function () {
					return MigrationsModule.userIncompleteGauntletRefund(userId)
				}).then(function () {
					return knex("user_gauntlet_run").where("user_id",userId).first()
				}).then(function (currentGauntletRun) {
					expect(currentGauntletRun).to.not.exist
					return knex("user_gauntlet_tickets").where("user_id",userId).select()
				}).then(function (userGauntletTickets) {
					expect(userGauntletTickets).to.exist
					expect(userGauntletTickets.length).to.equal(1)
				})
		})
	})


})
