var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffee-script/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var ChallengesModule = require('../../../server/lib/data_access/challenges.coffee');
var GamesModule = require('../../../server/lib/data_access/games.coffee');
var QuestsModule = require('../../../server/lib/data_access/quests.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config.js');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex')
var NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && true;

describe("challenges module", function() {

	var userId = null;
	this.timeout(25000);

	// before cleanup to check if user already exists and delete
	before(function() {
		this.timeout(25000);
		Logger.module("UNITTEST").log("creating user");
		return UsersModule.createNewUser('unit-test@counterplay.co', 'unittest', 'hash', 'kumite14')
			.then(function(userIdCreated) {
				Logger.module("UNITTEST").log("created user ", userIdCreated);
				userId = userIdCreated;
			}).catch(Errors.AlreadyExistsError, function(error) {
				Logger.module("UNITTEST").log("existing user");
				return UsersModule.userIdForEmail('unit-test@counterplay.co').then(function(userIdExisting) {
					Logger.module("UNITTEST").log("existing user retrieved", userIdExisting);
					userId = userIdExisting;
					return SyncModule.wipeUserData(userIdExisting);
				}).then(function() {
					Logger.module("UNITTEST").log("existing user data wiped", userId);
				})
			}).catch(function(error) {
				Logger.module("UNITTEST").log("unexpected error: ", error)
				throw error
			})
	})


	describe("markChallengeAsAttempted()", function() {

		var challengeType = null;
		var attemptedAt = null;

		before(function() {
			this.timeout(5000);

			// Create a test challenge
			challengeType = "UnitTestChallenge";

			// clear any existing data
			return DuelystFirebase.connect().getRootRef()
				.then(function(rootRef) {
					return SyncModule.wipeUserData(userId)
				});
		});

		it('expect marking challenge as attempted to work', function() {

			return ChallengesModule.markChallengeAsAttempted(userId, challengeType)
				.bind({})
				.then(function() {
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef) {
					return Promise.all([
						knex("user_challenges").where({
							'user_id': userId,
							"challenge_id": challengeType
						}).first(),
						FirebasePromises.once(rootRef.child("user-challenge-progression").child(userId).child(challengeType), "value")
					])
				}).spread(function(challengeRow, challengeDataSnapshot) {
					// Check that the challenge was marked as attempted
					expect(challengeRow.last_attempted_at).to.exist;
					expect(challengeDataSnapshot.val()).to.exist;
					expect(challengeDataSnapshot.val().last_attempted_at).to.exist;
				})
		})
	})

	describe("completeChallengeWithType()", function() {

		var challengeType = null;
		var completedAt = null;

		before(function() {
			this.timeout(5000);

			// Create a test challenge
			challengeType = "UnitTestChallenge";

			SDK.ChallengeFactory._buildChallengeRewards();
			SDK.ChallengeFactory._challengeCardRewards[challengeType] = [SDK.Cards.Spell.TrueStrike, SDK.Cards.Neutral.PlanarScout];
			SDK.ChallengeFactory._challengeGoldRewards[challengeType] = 127;
			SDK.ChallengeFactory._challengeSpiritRewards[challengeType] = 229;
			SDK.ChallengeFactory._challengeBoosterPackRewards[challengeType] = [{}, {}];

			// clear any existing data
			return DuelystFirebase.connect().getRootRef()
				.then(function(rootRef) {
					return SyncModule.wipeUserData(userId)
				});
		});

		it('expect to receive rewards for first time completion of challenge and challenge to be marked as completed', function() {

			return ChallengesModule.completeChallengeWithType(userId, challengeType)
				.bind({})
				.then(function() {
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef) {
					return Promise.all([
						knex("users").where('id', userId).first(),
						knex("user_card_collection").where('user_id', userId).first(),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId), "value"),
						FirebasePromises.once(rootRef.child("user-challenge-progression").child(userId).child(challengeType), "value")
					])
				}).spread(function(userRow, userCardCollectionRow, inventoryDataSnapshot, challengeDataSnapshot) {

					expect(userRow.wallet_gold).to.equal(SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType));
					expect(userRow.wallet_spirit).to.equal(SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType));

					challengeData = challengeDataSnapshot.val()
					inventoryData = inventoryDataSnapshot.val()

					// Check that the challenge was marked as complete
					expect(challengeData).to.exist;
					expect(challengeData.completed_at).to.exist;
					expect(inventoryData).to.exist;
					expect(inventoryData.wallet).to.exist;

					completedAt = challengeData.completed_at;

					// Check gold amount
					expect(inventoryData.wallet.gold_amount).to.equal(SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType));
					// Check spirit amount
					expect(inventoryData.wallet.spirit_amount).to.equal(SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType));

					expect(inventoryData["spirit-orbs"]).to.exist;
					// Check number of booster packs
					expect(Object.keys(inventoryData["spirit-orbs"]).length).to.equal(SDK.ChallengeFactory.getBoosterPacksRewardedForChallengeType(challengeType).length);

					// Check cards were given in correct quantity
					expect(inventoryData["card-collection"]).to.exist;
					var cardIdsRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challengeType);
					_.each(cardIdsRewards, function(cardId) {
						expect(inventoryData["card-collection"][cardId]).to.exist;
						expect(inventoryData["card-collection"][cardId].count).to.equal(1);
					}.bind(this))

				});
		});

		it('expect to not receive rewards for second completion of challenge', function() {

			return ChallengesModule.completeChallengeWithType(userId, challengeType)
				.bind({})
				.then(function() {
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef) {
					return Promise.all([
						knex("users").where('id', userId).first(),
						knex("user_card_collection").where('user_id', userId).first(),
						FirebasePromises.once(rootRef.child("user-inventory").child(userId), "value"),
						FirebasePromises.once(rootRef.child("user-challenge-progression").child(userId).child(challengeType), "value")
					])
				}).spread(function(userRow, userCardCollectionRow, inventoryDataSnapshot, challengeDataSnapshot) {

					expect(userRow.wallet_gold).to.equal(SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType));
					expect(userRow.wallet_spirit).to.equal(SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType));

					challengeData = challengeDataSnapshot.val()
					inventoryData = inventoryDataSnapshot.val()

					// Check that the challenge was marked as complete
					expect(challengeData).to.exist;
					expect(challengeData.completed_at).to.exist;
					expect(challengeData.completed_at).to.equal(completedAt);
					expect(inventoryData).to.exist;
					expect(inventoryData.wallet).to.exist;

					// Check gold amount
					expect(inventoryData.wallet.gold_amount).to.equal(SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType));
					// Check spirit amount
					expect(inventoryData.wallet.spirit_amount).to.equal(SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType));

					expect(inventoryData["spirit-orbs"]).to.exist;
					// Check number of booster packs
					expect(Object.keys(inventoryData["spirit-orbs"]).length).to.equal(SDK.ChallengeFactory.getBoosterPacksRewardedForChallengeType(challengeType).length);

					// Check cards were given in correct quantity
					expect(inventoryData["card-collection"]).to.exist;
					var cardIdsRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challengeType);
					_.each(cardIdsRewards, function(cardId) {
						expect(inventoryData["card-collection"][cardId]).to.exist;
						expect(inventoryData["card-collection"][cardId].count).to.equal(1);
					}.bind(this))

				});
		});

		describe("beginner challenge quests", function() {

			before(function() {
				this.timeout(5000)
				return SyncModule.wipeUserData(userId)
					.then(function() {
						return UsersModule.setNewPlayerFeatureProgression(userId, SDK.NewPlayerProgressionModuleLookup.Core, SDK.NewPlayerProgressionStageEnum.FirstGameDone.key)
					}).then(function() {
						return QuestsModule.generateBeginnerQuests(userId)
					})
			})

			it('expect beginner challenge quests to progress with challenge completion', function() {

				questChallenge1Type = "UnitTestQuestChallenge1"

				return ChallengesModule.completeChallengeWithType(userId, questChallenge1Type, true)
					.bind({})
					.then(function() {
						return DuelystFirebase.connect().getRootRef()
					}).then(function(rootRef) {
						return Promise.all([
							knex("users").where('id', userId).first(),
							knex("user_challenges").where('user_id', userId).andWhere('challenge_id', questChallenge1Type).first(),
							knex("user_quests").where('user_id', userId),
							FirebasePromises.once(rootRef.child("user-challenge-progression").child(userId).child(questChallenge1Type), "value")
						])
					}).spread(function(userRow, challengeRow, questRows, challengeDataSnapshot) {
						expect(challengeRow.completed_at).to.exist

						var challengeQuestRow = _.find(questRows, function(questRow) {
							return questRow.quest_type_id == 9904
						})
						expect(challengeQuestRow).to.exist;
						expect(challengeQuestRow.progress).to.equal(1)
					})

			})

			it('expect that completing a challenge quest to give quest rewards as part of challenge completion', function() {

				var questChallenge1Type = "UnitTestQuestChallenge1";
				var questChallenge2Type = "UnitTestQuestChallenge2";
				var questChallenge3Type = "UnitTestQuestChallenge3";

				return ChallengesModule.completeChallengeWithType(userId, questChallenge1Type, true)
					.bind({})
					.then(function() {
						return ChallengesModule.completeChallengeWithType(userId, questChallenge2Type, true);
					}).then(function() {
						return ChallengesModule.completeChallengeWithType(userId, questChallenge3Type, true);
					}).then(function() {
						return DuelystFirebase.connect().getRootRef()
					}).then(function(rootRef) {
						return Promise.all([
							knex("users").where('id', userId).first(),
							knex("user_challenges").where('user_id', userId).select(),
							knex("user_quests_complete").where('user_id', userId).select()
						])
					}).spread(function(userRow, challengeRows, completeQuestRows) {
						expect(challengeRows.length).to.equal(3);
						expect(challengeRows[2].reward_ids.length).to.equal(1);
						expect(completeQuestRows.length).to.equal(1);
						expect(completeQuestRows[0].progress).to.equal(3);
						expect(completeQuestRows[0].completed_at).to.exist;
					})
			})

		})

	});

	describe("markDailyChallengeAsCompleted()", function() {

		var challengeId = "unit-test-daily-challenge"
		var challengeDate = moment.utc("2016-05-01")

		before(function() {
			this.timeout(5000);

			// clear any existing data
			return DuelystFirebase.connect().getRootRef()
				.then(function(rootRef) {
					return FirebasePromises.set(rootRef.child("daily-challenges").child(challengeDate.format("YYYY-MM-DD")),{
						challenge_id: challengeId,
						gold: 5
					})
				}).then(function(rootRef) {
					return SyncModule.wipeUserData(userId)
				})
		});

		it('expect marking invalid challenge ID as completed to ERROR out', function() {

			return ChallengesModule.markDailyChallengeAsCompleted(userId, "invalid-challenge", null, challengeDate, challengeDate)
				.bind({})
				.then(function(result){
					expect(result).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.BadRequestError)
				})

		})

		it('expect marking challenge that can\'t be found to ERROR out', function() {

			return ChallengesModule.markDailyChallengeAsCompleted(userId, challengeId, null, moment.utc("2016-05-03"), challengeDate)
				.bind({})
				.then(function(result){
					expect(result).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.NotFoundError)
				})

		})

		it('expect marking challenge valid as completed to SUCCEED and give REWARDS', function() {

			return ChallengesModule.markDailyChallengeAsCompleted(userId, challengeId, null, challengeDate,challengeDate)
				.bind({})
				.then(function(result){
					expect(result).to.exist;
					return DuelystFirebase.connect().getRootRef()
				}).then(function(rootRef) {
					return Promise.all([
						knex("users").where('id', userId).first(),
						knex("user_daily_challenges_completed").where('user_id', userId).andWhere('challenge_id', challengeId).first(),
						knex("user_rewards").where('user_id', userId).orderBy('created_at','desc').first(),
					])
				}).spread(function(userRow, challengeRow, rewardRow) {
					expect(userRow.daily_challenge_last_completed_at.valueOf()).to.equal(challengeDate.valueOf())
					expect(challengeRow).to.exist
					expect(rewardRow["reward_type"]).to.equal(challengeId)
					expect(challengeRow["reward_ids"]).to.contain(rewardRow.id)
					expect(rewardRow["gold"]).to.equal(5)
					expect(userRow.wallet_gold).to.equal(5)
				})
		})

		it('expect marking same challenge as completed twice to ERROR out', function() {

			return ChallengesModule.markDailyChallengeAsCompleted(userId, challengeId, null, challengeDate,challengeDate)
				.bind({})
				.then(function(result){
					expect(result).to.not.exist
				})
				.catch(function(error){
					expect(error).to.exist
					expect(error).to.be.an.instanceof(Errors.AlreadyExistsError)
				})
		})

	})

})
