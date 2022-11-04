const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const chai = require('chai');

const { expect } = chai;
const Promise = require('bluebird');
const sinon = require('sinon');
const _ = require('underscore');
const moment = require('moment');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const ChallengesModule = require('../../../server/lib/data_access/challenges.coffee');
const GamesModule = require('../../../server/lib/data_access/games.coffee');
const QuestsModule = require('../../../server/lib/data_access/quests.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const generatePushId = require('../../../app/common/generate_push_id');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum.coffee');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && true;

describe('challenges module', function () {
  let userId = null;
  this.timeout(25000);

  // before cleanup to check if user already exists and delete
  before(function () {
    this.timeout(25000);
    Logger.module('UNITTEST').log('creating user');
    return UsersModule.createNewUser('unit-test@duelyst.local', 'unittest', 'hash', 'kumite14')
      .then((userIdCreated) => {
        Logger.module('UNITTEST').log('created user ', userIdCreated);
        userId = userIdCreated;
      }).catch(Errors.AlreadyExistsError, (error) => {
        Logger.module('UNITTEST').log('existing user');
        return UsersModule.userIdForEmail('unit-test@duelyst.local').then((userIdExisting) => {
          Logger.module('UNITTEST').log('existing user retrieved', userIdExisting);
          userId = userIdExisting;
          return SyncModule.wipeUserData(userIdExisting);
        }).then(() => {
          Logger.module('UNITTEST').log('existing user data wiped', userId);
        });
      }).catch((error) => {
        Logger.module('UNITTEST').log('unexpected error: ', error);
        throw error;
      });
  });

  describe('markChallengeAsAttempted()', () => {
    let challengeType = null;
    const attemptedAt = null;

    before(function () {
      this.timeout(5000);

      // Create a test challenge
      challengeType = 'UnitTestChallenge';

      // clear any existing data
      return DuelystFirebase.connect().getRootRef()
        .then((rootRef) => SyncModule.wipeUserData(userId));
    });

    it('expect marking challenge as attempted to work', () => ChallengesModule.markChallengeAsAttempted(userId, challengeType)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_challenges').where({
          user_id: userId,
          challenge_id: challengeType,
        }).first(),
        FirebasePromises.once(rootRef.child('user-challenge-progression').child(userId).child(challengeType), 'value'),
      ]))
      .spread((challengeRow, challengeDataSnapshot) => {
        // Check that the challenge was marked as attempted
        expect(challengeRow.last_attempted_at).to.exist;
        expect(challengeDataSnapshot.val()).to.exist;
        expect(challengeDataSnapshot.val().last_attempted_at).to.exist;
      }));
  });

  describe('completeChallengeWithType()', () => {
    let challengeType = null;
    let completedAt = null;

    before(function () {
      this.timeout(5000);

      // Create a test challenge
      challengeType = 'UnitTestChallenge';

      SDK.ChallengeFactory._buildChallengeRewards();
      SDK.ChallengeFactory._challengeCardRewards[challengeType] = [SDK.Cards.Spell.TrueStrike, SDK.Cards.Neutral.PlanarScout];
      SDK.ChallengeFactory._challengeGoldRewards[challengeType] = 127;
      SDK.ChallengeFactory._challengeSpiritRewards[challengeType] = 229;
      SDK.ChallengeFactory._challengeBoosterPackRewards[challengeType] = [{}, {}];

      // clear any existing data
      return DuelystFirebase.connect().getRootRef()
        .then((rootRef) => SyncModule.wipeUserData(userId));
    });

    it('expect to receive rewards for first time completion of challenge and challenge to be marked as completed', () => ChallengesModule.completeChallengeWithType(userId, challengeType)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_card_collection').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId), 'value'),
        FirebasePromises.once(rootRef.child('user-challenge-progression').child(userId).child(challengeType), 'value'),
      ]))
      .spread((userRow, userCardCollectionRow, inventoryDataSnapshot, challengeDataSnapshot) => {
        expect(userRow.wallet_gold).to.equal(SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType));
        expect(userRow.wallet_spirit).to.equal(SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType));

        const challengeData = challengeDataSnapshot.val();
        const inventoryData = inventoryDataSnapshot.val();

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

        expect(inventoryData['spirit-orbs']).to.exist;
        // Check number of booster packs
        expect(Object.keys(inventoryData['spirit-orbs']).length).to.equal(SDK.ChallengeFactory.getBoosterPacksRewardedForChallengeType(challengeType).length);

        // Check cards were given in correct quantity
        expect(inventoryData['card-collection']).to.exist;
        const cardIdsRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challengeType);
        _.each(cardIdsRewards, (cardId) => {
          expect(inventoryData['card-collection'][cardId]).to.exist;
          expect(inventoryData['card-collection'][cardId].count).to.equal(1);
        });
      }));

    it('expect to not receive rewards for second completion of challenge', () => ChallengesModule.completeChallengeWithType(userId, challengeType)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_card_collection').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId), 'value'),
        FirebasePromises.once(rootRef.child('user-challenge-progression').child(userId).child(challengeType), 'value'),
      ]))
      .spread((userRow, userCardCollectionRow, inventoryDataSnapshot, challengeDataSnapshot) => {
        expect(userRow.wallet_gold).to.equal(SDK.ChallengeFactory.getGoldRewardedForChallengeType(challengeType));
        expect(userRow.wallet_spirit).to.equal(SDK.ChallengeFactory.getSpiritRewardedForChallengeType(challengeType));

        const challengeData = challengeDataSnapshot.val();
        const inventoryData = inventoryDataSnapshot.val();

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

        expect(inventoryData['spirit-orbs']).to.exist;
        // Check number of booster packs
        expect(Object.keys(inventoryData['spirit-orbs']).length).to.equal(SDK.ChallengeFactory.getBoosterPacksRewardedForChallengeType(challengeType).length);

        // Check cards were given in correct quantity
        expect(inventoryData['card-collection']).to.exist;
        const cardIdsRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challengeType);
        _.each(cardIdsRewards, (cardId) => {
          expect(inventoryData['card-collection'][cardId]).to.exist;
          expect(inventoryData['card-collection'][cardId].count).to.equal(1);
        });
      }));

    describe('beginner challenge quests', () => {
      before(function () {
        this.timeout(5000);
        return SyncModule.wipeUserData(userId)
          .then(() => UsersModule.setNewPlayerFeatureProgression(userId, SDK.NewPlayerProgressionModuleLookup.Core, SDK.NewPlayerProgressionStageEnum.FirstGameDone.key)).then(() => QuestsModule.generateBeginnerQuests(userId));
      });

      it('expect beginner challenge quests to progress with challenge completion', () => {
        const questChallenge1Type = 'UnitTestQuestChallenge1';
        return ChallengesModule.completeChallengeWithType(userId, questChallenge1Type, true)
          .bind({})
          .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
            knex('users').where('id', userId).first(),
            knex('user_challenges').where('user_id', userId).andWhere('challenge_id', questChallenge1Type).first(),
            knex('user_quests').where('user_id', userId),
            FirebasePromises.once(rootRef.child('user-challenge-progression').child(userId).child(questChallenge1Type), 'value'),
          ]))
          .spread((userRow, challengeRow, questRows, challengeDataSnapshot) => {
            expect(challengeRow.completed_at).to.exist;

            const challengeQuestRow = _.find(questRows, (questRow) => questRow.quest_type_id === 9904);
            expect(challengeQuestRow).to.exist;
            expect(challengeQuestRow.progress).to.equal(1);
          });
      });

      it('expect that completing a challenge quest to give quest rewards as part of challenge completion', () => {
        const questChallenge1Type = 'UnitTestQuestChallenge1';
        const questChallenge2Type = 'UnitTestQuestChallenge2';
        const questChallenge3Type = 'UnitTestQuestChallenge3';

        return ChallengesModule.completeChallengeWithType(userId, questChallenge1Type, true)
          .bind({})
          .then(() => ChallengesModule.completeChallengeWithType(userId, questChallenge2Type, true)).then(() => ChallengesModule.completeChallengeWithType(userId, questChallenge3Type, true))
          .then(() => DuelystFirebase.connect().getRootRef())
          .then((rootRef) => Promise.all([
            knex('users').where('id', userId).first(),
            knex('user_challenges').where('user_id', userId).select(),
            knex('user_quests_complete').where('user_id', userId).select(),
          ]))
          .spread((userRow, challengeRows, completeQuestRows) => {
            expect(challengeRows.length).to.equal(3);
            expect(challengeRows[2].reward_ids.length).to.equal(1);
            expect(completeQuestRows.length).to.equal(1);
            expect(completeQuestRows[0].progress).to.equal(3);
            expect(completeQuestRows[0].completed_at).to.exist;
          });
      });
    });
  });

  describe('markDailyChallengeAsCompleted()', () => {
    const challengeId = 'unit-test-daily-challenge';
    const challengeDate = moment.utc('2016-05-01');

    before(function () {
      this.timeout(5000);

      // clear any existing data
      return DuelystFirebase.connect().getRootRef()
        .then((rootRef) => FirebasePromises.set(rootRef.child('daily-challenges').child(challengeDate.format('YYYY-MM-DD')), {
          challenge_id: challengeId,
          gold: 5,
        })).then((rootRef) => SyncModule.wipeUserData(userId));
    });

    it('expect marking invalid challenge ID as completed to ERROR out', () => ChallengesModule.markDailyChallengeAsCompleted(userId, 'invalid-challenge', null, challengeDate, challengeDate)
      .bind({})
      .then((result) => {
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.BadRequestError);
      }));

    it('expect marking challenge that can\'t be found to ERROR out', () => ChallengesModule.markDailyChallengeAsCompleted(userId, challengeId, null, moment.utc('2016-05-03'), challengeDate)
      .bind({})
      .then((result) => {
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect marking challenge valid as completed to SUCCEED and give REWARDS', () => ChallengesModule.markDailyChallengeAsCompleted(userId, challengeId, null, challengeDate, challengeDate)
      .bind({})
      .then((result) => {
        expect(result).to.exist;
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        knex('user_daily_challenges_completed').where('user_id', userId).andWhere('challenge_id', challengeId).first(),
        knex('user_rewards').where('user_id', userId).orderBy('created_at', 'desc').first(),
      ]))
      .spread((userRow, challengeRow, rewardRow) => {
        expect(userRow.daily_challenge_last_completed_at.valueOf()).to.equal(challengeDate.valueOf());
        expect(challengeRow).to.exist;
        expect(rewardRow.reward_type).to.equal(challengeId);
        expect(challengeRow.reward_ids).to.contain(rewardRow.id);
        expect(rewardRow.gold).to.equal(5);
        expect(userRow.wallet_gold).to.equal(5);
      }));

    it('expect marking same challenge as completed twice to ERROR out', () => ChallengesModule.markDailyChallengeAsCompleted(userId, challengeId, null, challengeDate, challengeDate)
      .bind({})
      .then((result) => {
        expect(result).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
      }));
  });
});
