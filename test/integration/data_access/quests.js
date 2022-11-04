const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../../../'));
require('coffeescript/register');
const chai = require('chai');

chai.config.includeStack = true;
const { expect } = chai;
const Promise = require('bluebird');
const sinon = require('sinon');
const _ = require('underscore');
const moment = require('moment');
const DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
const Errors = require('../../../server/lib/custom_errors.coffee');
const UsersModule = require('../../../server/lib/data_access/users.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const QuestsModule = require('../../../server/lib/data_access/quests.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const QuestType = require('../../../app/sdk/quests/questTypeLookup.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum.coffee');
const NewPlayerProgressionModuleLookup = require('../../../app/sdk/progression/newPlayerProgressionModuleLookup.coffee');
const NewPlayerProgressionHelper = require('../../../app/sdk/progression/newPlayerProgressionHelper.coffee');
const GiftCrateLookup = require('../../../app/sdk/giftCrates/giftCrateLookup.coffee');
const generatePushId = require('../../../app/common/generate_push_id');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('quests module', function () {
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
      });
  });

  // // after cleanup
  // after(function(){
  //   this.timeout(25000);
  //   return DuelystFirebase.connect().getRootRef()
  //   .bind({})
  //   .then(function(fbRootRef){
  //     this.fbRootRef = fbRootRef;
  //     if (userId)
  //       return clearUserData(userId,this.fbRootRef);
  //   });
  // });

  describe('FTUE', () => {
    describe('needsDailyQuests()', () => {
      it('expect to return FALSE for new users that are before the stage where quests are supposed to start generating', () => QuestsModule.needsDailyQuests(userId)
        .then((needsQuest) => {
          expect(needsQuest).to.exist;
          expect(needsQuest).to.be.a('boolean');
          expect(needsQuest).to.equal(false);
        }));

      it('expect to return FALSE for new users that have 2 beginner quests in their slots', () => UsersModule.setNewPlayerFeatureProgression(userId, NewPlayerProgressionModuleLookup.Core, NewPlayerProgressionStageEnum.FirstGameDone.key)
        .then(() => QuestsModule.generateBeginnerQuests(userId)).then(() => QuestsModule.needsDailyQuests(userId)).then((needsQuest) => {
          expect(needsQuest).to.exist;
          expect(needsQuest).to.be.a('boolean');
          expect(needsQuest).to.equal(false);
        }));

      it('expect to return TRUE for users with completed FTUE progression and at least one open quest slot', () => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', 1)
        .then(() => QuestsModule.needsDailyQuests(userId))
        .then((needsQuest) => {
          expect(needsQuest).to.exist;
          expect(needsQuest).to.be.a('boolean');
          expect(needsQuest).to.equal(true);
        }));
    });

    describe('canMulliganDailyQuest()', () => {
      it('expect to NOT be able to mulligan a begginer quest', () => QuestsModule.canMulliganDailyQuest(userId, 0)
        .then((canMulligan) => {
          expect(canMulligan).to.equal(false);
        }));
    });

    describe('mulliganDailyQuest()', () => {
      it('expect to NOT be able to mulligan a begginer quest', () => QuestsModule.mulliganDailyQuest(userId, 0)
        .then((questData) => {
          expect(questData).to.not.exist;
        }).catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));
    });

    describe('updateQuestProgressWithProgressedFactionData()', () => {
      const fakeFactionData = {
        faction_id: 1,
        level: 9,
      };

      before(() => SyncModule.wipeUserData(userId)
        .then(() => UsersModule.setNewPlayerFeatureProgression(userId, NewPlayerProgressionModuleLookup.Core, NewPlayerProgressionStageEnum.FirstGameDone.key)).then(() => QuestsModule.generateBeginnerQuests(userId)));

      it('expect to progress/complete faction quest with leveling up a faction', () => knex.transaction((tx) => QuestsModule.updateQuestProgressWithProgressedFactionData(Promise.resolve(), tx, userId, fakeFactionData)).then((result) => {
        expect(result).to.exist;
        expect(result.quests[0].progress).to.equal(1);
        expect(result.quests[0].completed_at).to.exist;
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex.select().from('user_quests_complete').where('user_id', userId).orderBy('quest_slot_index', 'asc'),
      ])).spread((questRows) => {
        expect(questRows).to.exist;
        expect(questRows[0].progress).to.equal(1);
      }));
    });
  });

  describe('After FTUE', () => {
    before(() => {
      QuestsModule.SEASONAL_QUESTS_ACTIVE = false;

      return SyncModule.wipeUserData(userId)
        .then(() => knex('user_new_player_progression').insert({
          user_id: userId,
          module_name: NewPlayerProgressionModuleLookup.Core,
          stage: NewPlayerProgressionStageEnum.Skipped.key,
        }));
    });

    describe('needsDailyQuests()', () => {
      it('expect to return true for users empty quest slots', () => QuestsModule.needsDailyQuests(userId)
        .then((needsQuest) => {
          expect(needsQuest).to.exist;
          expect(needsQuest).to.be.a('boolean');
          expect(needsQuest).to.equal(true);
        }));
    });

    describe('generateDailyQuests()', () => {
      let updatedAt = null;
      let generatedAt = null;

      before(function () {
        this.timeout(5000);
      });

      after(() => {
      });

      it('expect to save and return quest data', () => QuestsModule.generateDailyQuests(userId)
        .then((questData) => {
          expect(questData).to.exist;
          updatedAt = questData.updated_at;
          generatedAt = questData.generated_at;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('users').first().where('id', userId),
          knex.select().from('user_quests').where('user_id', userId),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
        ])).spread((userRow, questRows, firebaseQuestsSnapshot) => {
          expect(userRow.daily_quests_generated_at.valueOf()).to.equal(generatedAt.valueOf());
          expect(userRow.daily_quests_updated_at.valueOf()).to.equal(updatedAt.valueOf());
          // expect(questRows.length).to.equal(2);
          const q1 = _.find(questRows, (row) => row.quest_slot_index === 0);
          const q2 = _.find(questRows, (row) => row.quest_slot_index === 1);
          expect(q1).to.exist;
          expect(q2).to.exist;

          const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
          expect(currentQuestsData).to.exist;
          expect(currentQuestsData.quests[0]).to.exist;
          expect(currentQuestsData.quests[1]).to.exist;
        }));

      it('expect needsDailyQuests() to return FALSE after quests are generated', () => QuestsModule.needsDailyQuests(userId)
        .then((needsQuest) => {
          expect(needsQuest).to.exist;
          expect(needsQuest).to.be.a('boolean');
          expect(needsQuest).to.equal(false);
        }));

      it('expect to make no change if we try to generate again', () => QuestsModule.generateDailyQuests(userId)
        .then((questData) => {
          expect(questData).to.exist;
          expect(moment.utc(questData.updated_at).valueOf()).to.equal(moment.utc(updatedAt).valueOf());
          return Promise.all([
            knex('users').first().where('id', userId),
          ]);
        }).spread((userRow) => {
          expect(userRow.daily_quests_generated_at.valueOf()).to.equal(generatedAt.valueOf());
          expect(userRow.daily_quests_updated_at.valueOf()).to.equal(updatedAt.valueOf());
        }));

      it('expect needsDailyQuests() to return TRUE at +25 hours', () => {
        const systemTime = moment().add(25, 'hours');
        return QuestsModule.needsDailyQuests(userId, systemTime)
          .then((needsQuest) => {
            expect(needsQuest).to.exist;
            expect(needsQuest).to.equal(true);
          });
      });

      it('expect to make no change if we have full quests 25 hours later', () => {
        const systemTime = moment().add(25, 'hours');
        return QuestsModule.generateDailyQuests(userId, systemTime)
          .then((questData) => {
            expect(moment.utc(questData.updated_at).valueOf()).to.equal(moment.utc(updatedAt).valueOf());
            expect(moment.utc(questData.generated_at).valueOf()).to.be.above(moment.utc(generatedAt).valueOf());
            generatedAt = questData.generated_at;
            return Promise.all([
              knex('users').first().where('id', userId),
            ]);
          }).spread((userRow) => {
            expect(userRow.daily_quests_generated_at.valueOf()).to.equal(generatedAt.valueOf());
            expect(userRow.daily_quests_updated_at.valueOf()).to.equal(updatedAt.valueOf());
          });
      });

      it('expect needsDailyQuests() to return FALSE if you complete a quest at +25 hours (since you had full today quest log)', () => {
        const systemTime = moment().add(25, 'hours');
        return DuelystFirebase.connect().getRootRef()
          .then((rootRef) => Promise.all([
            FirebasePromises.remove(rootRef.child('user-quests').child(userId).child('daily').child('current')
              .child('quests')
              .child('0')),
            knex('user_quests').where({ user_id: userId, quest_slot_index: 0 }).delete(),
          ])).then(() => QuestsModule.needsDailyQuests(userId, systemTime))
          .then((needsQuest) => {
            expect(needsQuest).to.exist;
            expect(needsQuest).to.equal(false);
          });
      });

      it('expect needsDailyQuests() to return TRUE at +50 hours (since now we are one day since last completion)', () => {
        const systemTime = moment().add(50, 'hours');
        return QuestsModule.needsDailyQuests(userId, systemTime)
          .then((needsQuest) => {
            expect(needsQuest).to.exist;
            expect(needsQuest).to.equal(true);
          });
      });

      it('expect to generate new quests at +50 hours later', () => {
        const systemTime = moment().add(50, 'hours');
        return QuestsModule.generateDailyQuests(userId, systemTime)
          .then((questData) => {
            expect(questData).to.exist;
            expect(moment.utc(questData.generated_at).valueOf()).to.not.equal(moment.utc(generatedAt).valueOf());
            expect(moment.utc(questData.updated_at).valueOf()).to.not.equal(moment.utc(updatedAt).valueOf());
            return DuelystFirebase.connect().getRootRef();
          }).then((rootRef) => Promise.all([
            knex('users').first().where('id', userId),
            knex.select().from('user_quests').where('user_id', userId),
            FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
          ])).spread((userRow, questRows, firebaseQuestsSnapshot) => {
            expect(userRow.daily_quests_generated_at.valueOf()).to.be.above(generatedAt.valueOf());
            expect(userRow.daily_quests_updated_at.valueOf()).to.be.above(updatedAt.valueOf());

            const dailyQuestRows = _.filter(questRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
            expect(dailyQuestRows.length).to.equal(2);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
          });
      });
    });

    describe('mulliganDailyQuest()', () => {
      let mulliganedAt = null;

      before(function () {
        this.timeout(5000);
      });

      after(() => {
      });

      it('expect to be able to mulligan quest at index [0]', () => QuestsModule.mulliganDailyQuest(userId, 0)
        .then((questData) => {
          expect(questData).to.exist;
          expect(questData[0].mulliganed_at).to.exist;
          mulliganedAt = questData[0].mulliganed_at;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex.select().from('user_quests').where('user_id', userId),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
        ])).spread((questRows, firebaseQuestsSnapshot) => {
          const dailyQuestRows = _.filter(questRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
          expect(dailyQuestRows.length).to.equal(2);

          const questAt0 = _.find(questRows, (row) => row.quest_slot_index === 0);
          expect(questAt0.mulliganed_at.valueOf()).to.equal(mulliganedAt.valueOf());

          const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
          expect(currentQuestsData).to.exist;
          expect(currentQuestsData.quests[0].mulliganed_at).to.equal(mulliganedAt.valueOf());
        }));

      it('expect to NOT be able to mulligan quest at index [0] again', () => QuestsModule.mulliganDailyQuest(userId, 0)
        .then((questData) => {
          expect(questData).to.not.exist;
        }).catch((error) => {
          expect(error).to.exist;
        }));

      it('expect to NOT be able to mulligan quest at index [0] again later in the same day', () => {
        const systemTime = moment().utc().endOf('day').subtract(2, 'hours');
        return QuestsModule.mulliganDailyQuest(userId, 0, systemTime)
          .then((questData) => {
            expect(questData).to.not.exist;
          }).catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.QuestCantBeMulliganedError);
          });
      });

      it('expect to be able to mulligan quest at index [0] again 23 hours after begging of last day it was mulliganed', () => {
        const systemTime = moment().utc().startOf('day').add(23, 'hours');
        return QuestsModule.mulliganDailyQuest(userId, 0, systemTime)
          .then((questData) => {
            expect(questData).to.exist;
            //   expect(questData[0].mulliganed_at).to.exist;
            //   expect(moment.utc(questData[0].mulliganed_at).valueOf()).to.not.equal(moment.utc(mulliganedAt).valueOf());
            //   mulliganedAt = questData[0].mulliganed_at;
            //   return DuelystFirebase.connect().getRootRef()
            //
            // }).then(function(rootRef){
            //   return Promise.all([
            //     knex.select().from("user_quests").where('user_id',userId),
            //     FirebasePromises.once(rootRef.child("user-quests").child(userId),"value")
            //   ])
            // }).spread(function(questRows,firebaseQuestsSnapshot){
            //
            //   expect(questRows.length).to.equal(2);
            //
            //   const questAt0 = _.find(questRows,function(row){ return row.quest_slot_index === 0; });
            //   expect(questAt0.mulliganed_at.valueOf()).to.equal(mulliganedAt.valueOf());
            //
            //   const currentQuestsData = firebaseQuestsSnapshot.val()["daily"]["current"];
            //   expect(currentQuestsData).to.exist;
            //   expect(currentQuestsData["quests"][0]["mulliganed_at"]).to.equal(mulliganedAt.valueOf());
          });
      });

      it('expect to be able to mulligan quest at index [1]', () => QuestsModule.mulliganDailyQuest(userId, 1)
        .then((questData) => {
          expect(questData).to.exist;
          expect(questData[1].mulliganed_at).to.exist;
          mulliganedAt = questData[1].mulliganed_at;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex.select().from('user_quests').where('user_id', userId),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
        ])).spread((questRows, firebaseQuestsSnapshot) => {
          const dailyQuestRows = _.filter(questRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
          expect(dailyQuestRows.length).to.equal(2);

          const questAt0 = _.find(questRows, (row) => row.quest_slot_index === 1);
          expect(questAt0.mulliganed_at.valueOf()).to.equal(mulliganedAt.valueOf());

          const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
          expect(currentQuestsData).to.exist;
          expect(currentQuestsData.quests[1].mulliganed_at).to.equal(mulliganedAt.valueOf());
        }));

      it('expect to be able to mulligan quest at index [1] again after 24 hours', () => {
        const systemTime = moment().add(24, 'hours');
        return QuestsModule.mulliganDailyQuest(userId, 1, systemTime)
          .then((questData) => {
            expect(questData).to.exist;
            expect(questData[1].mulliganed_at).to.exist;
            expect(moment.utc(questData[1].mulliganed_at).valueOf()).to.not.equal(moment.utc(mulliganedAt).valueOf());
            mulliganedAt = questData[1].mulliganed_at;
            return DuelystFirebase.connect().getRootRef();
          }).then((rootRef) => Promise.all([
            knex.select().from('user_quests').where('user_id', userId),
            FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
          ])).spread((questRows, firebaseQuestsSnapshot) => {
            const dailyQuestRows = _.filter(questRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
            expect(dailyQuestRows.length).to.equal(2);

            const questAt0 = _.find(questRows, (row) => row.quest_slot_index === 1);
            expect(questAt0.mulliganed_at.valueOf()).to.equal(mulliganedAt.valueOf());

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[1].mulliganed_at).to.equal(mulliganedAt.valueOf());
          });
      });
    });

    describe('updateQuestProgressWithGame()', () => {
      let fakeGameSessionData;

      before(function () {
        this.timeout(5000);
        const systemTime = moment().add(50, 'hours');

        fakeGameSessionData = {};
        fakeGameSessionData.status = SDK.GameStatus.over;
        fakeGameSessionData.gameType = SDK.GameType.Ranked;
        fakeGameSessionData.players = [];
        fakeGameSessionData.players.push({ playerId: userId, deck: {} });
        fakeGameSessionData.gameSetupData = {};
        fakeGameSessionData.gameSetupData.players = [];
        fakeGameSessionData.gameSetupData.players[0] = {};
        fakeGameSessionData.gameSetupData.players[0].playerId = userId;
        fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;

        // set up user quests as Lyonar and Songhai participation quests
        return Promise.all([
          QuestsModule.mulliganDailyQuest(userId, 0, systemTime, 101),
          QuestsModule.mulliganDailyQuest(userId, 1, systemTime, 102),
        ]);
      });

      after(() => {
      });

      it('expect to progress a Lyonar Participation Quest (101) with a game', () => {
        const systemTime = moment().add(51, 'hours');
        return QuestsModule.updateQuestProgressWithGame(userId, 'game1', fakeGameSessionData, systemTime)
          .then((result) => {
            expect(result).to.exist;
            expect(result.quests[0].progress).to.equal(1);
            expect(result.quests[0].updated_at.valueOf()).to.equal(systemTime.valueOf());

            return DuelystFirebase.connect().getRootRef();
          }).then((rootRef) => Promise.all([
            knex.select().from('user_quests').where('user_id', userId).orderBy('quest_slot_index', 'asc'),
            FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
            FirebasePromises.once(rootRef.child('user-games').child(userId).child('game1').child('job_status'), 'value'),
          ])).spread((questRows, firebaseQuestsSnapshot, firebaseGameJobStatusSnapshot) => {
            expect(questRows).to.exist;
            expect(questRows[0].progress).to.equal(1);
            expect(questRows[0].updated_at.valueOf()).to.equal(systemTime.valueOf());

            const firebaseData = firebaseQuestsSnapshot.val().daily.current;

            expect(firebaseData).to.exist;
            expect(firebaseData.quests[0].progress).to.equal(1);
            expect(firebaseData.quests[0].updated_at).to.equal(systemTime.valueOf());

            const jobStatus = firebaseGameJobStatusSnapshot.val();
            expect(jobStatus.quests).to.equal(true);
          });
      });

      it('expect to complete a Lyonar Participation Quest (101) after 4 games', () => {
        const systemTime = moment().add(52, 'hours');
        const gameId = generatePushId();
        return Promise.all([
          QuestsModule.updateQuestProgressWithGame(userId, 'game2', fakeGameSessionData, systemTime),
          QuestsModule.updateQuestProgressWithGame(userId, 'game3', fakeGameSessionData, systemTime),
        ]).spread((result1, result2) =>
          // this should finish it
          QuestsModule.updateQuestProgressWithGame(userId, gameId, fakeGameSessionData, systemTime)).then((result3) => {
          expect(result3).to.exist;
          expect(result3.quests[0].progress).to.equal(4);
          expect(result3.quests[0].completed_at.valueOf()).to.equal(systemTime.valueOf());

          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex.first().from('users').where('id', userId),
          knex.select().from('user_quests').where('user_id', userId).orderBy('quest_slot_index', 'asc'),
          knex.select().from('user_quests_complete').where('user_id', userId),
          knex.select().from('user_rewards').where('user_id', userId),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
          FirebasePromises.once(rootRef.child('user-games').child(userId).child(gameId).child('job_status'), 'value'),
        ]))
          .spread((userRow, questRows, completeQuestRows, rewardRows, firebaseQuestsSnapshot, firebaseGameJobStatusSnapshot) => {
            expect(questRows).to.exist;
            const dailyQuestRows = _.filter(questRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
            expect(dailyQuestRows.length).to.equal(1);
            expect(dailyQuestRows[0].quest_type_id).to.not.equal(101);

            expect(completeQuestRows).to.exist;
            const completedDailyQuestRows = _.filter(completeQuestRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
            expect(completedDailyQuestRows.length).to.equal(1);
            expect(completedDailyQuestRows[0].quest_type_id).to.equal(101);
            expect(completedDailyQuestRows[0].completed_at.valueOf()).to.equal(systemTime.valueOf());
            expect(completedDailyQuestRows[0].progressed_by_game_ids.length).to.equal(4);
            expect(_.intersection(completedDailyQuestRows[0].progressed_by_game_ids, ['game1', 'game2', 'game3', gameId]).length).to.equal(4);

            expect(rewardRows).to.exist;
            const dailyQuestRewardRows = _.filter(rewardRows, (rewardRows) => {
              if (rewardRows.quest_type_id == null) {
                return false;
              }
              const sdkQuest = SDK.QuestFactory.questForIdentifier(rewardRows.quest_type_id);
              return sdkQuest != null && !sdkQuest.isBeginner && !sdkQuest.isCatchUp;
            });
            expect(dailyQuestRewardRows.length).to.equal(1);
            expect(dailyQuestRewardRows[0].source_id).to.equal(completedDailyQuestRows[0].id);
            expect(dailyQuestRewardRows[0].quest_type_id).to.equal(101);
            expect(dailyQuestRewardRows[0].created_at.valueOf()).to.equal(systemTime.valueOf());
            expect(dailyQuestRewardRows[0].gold).to.equal(completedDailyQuestRows[0].gold);

            expect(userRow).to.exist;
            const questRewardRowsGold = _.reduce(rewardRows, (memo, rewardRow) => {
              if (rewardRow.quest_type_id == null) {
                return memo;
              }
              return memo + rewardRow.gold;
            }, 0);
            // expect(userRow.wallet_gold).to.equal(rewardRows[0].gold);
            expect(userRow.wallet_gold).to.equal(questRewardRowsGold);

            const firebaseData = firebaseQuestsSnapshot.val().daily.current;

            expect(firebaseData).to.exist;
            expect(firebaseData.quests[0]).to.not.exist;

            expect(firebaseGameJobStatusSnapshot.val().quests).to.equal(true);
          });
      });
    });

    describe('updateQuestProgressWithGame() - rift', () => {
      let fakeGameSessionData;

      before(function () {
        this.timeout(5000);
        const systemTime = moment().add(100, 'hours');

        fakeGameSessionData = {};
        fakeGameSessionData.status = SDK.GameStatus.over;
        fakeGameSessionData.gameType = SDK.GameType.Rift;
        fakeGameSessionData.players = [];
        fakeGameSessionData.players.push({ playerId: userId, deck: {}, isWinner: true });
        fakeGameSessionData.gameSetupData = {};
        fakeGameSessionData.gameSetupData.players = [];
        fakeGameSessionData.gameSetupData.players[0] = {};
        fakeGameSessionData.gameSetupData.players[0].playerId = userId;
        fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;

        // set up user quests as Lyonar and Songhai participation quests
        return QuestsModule.generateDailyQuests(userId, systemTime)
          .then(() => Promise.all([
            QuestsModule.mulliganDailyQuest(userId, 0, systemTime, 101),
            QuestsModule.mulliganDailyQuest(userId, 1, systemTime, 102),
          ]));
      });

      after(() => {
      });

      it('expect to progress a Lyonar Win Quest (101) with a rift game', () => {
        const systemTime = moment().add(101, 'hours');
        return QuestsModule.updateQuestProgressWithGame(userId, 'game1', fakeGameSessionData, systemTime)
          .then((result) => {
            expect(result).to.exist;
            expect(result.quests[0].progress).to.equal(1);
            expect(result.quests[0].updated_at.valueOf()).to.equal(systemTime.valueOf());

            return DuelystFirebase.connect().getRootRef();
          }).then((rootRef) => Promise.all([
            knex.select().from('user_quests').where('user_id', userId).orderBy('quest_slot_index', 'asc'),
            FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
            FirebasePromises.once(rootRef.child('user-games').child(userId).child('game1').child('job_status'), 'value'),
          ])).spread((questRows, firebaseQuestsSnapshot, firebaseGameJobStatusSnapshot) => {
            expect(questRows).to.exist;
            expect(questRows[0].progress).to.equal(1);
            expect(questRows[0].updated_at.valueOf()).to.equal(systemTime.valueOf());

            const firebaseData = firebaseQuestsSnapshot.val().daily.current;

            expect(firebaseData).to.exist;
            expect(firebaseData.quests[0].progress).to.equal(1);
            expect(firebaseData.quests[0].updated_at).to.equal(systemTime.valueOf());

            const jobStatus = firebaseGameJobStatusSnapshot.val();
            expect(jobStatus.quests).to.equal(true);
          });
      });

      it('expect to complete a Lyonar Win Quest (101) after 4 rift games', () => {
        const systemTime = moment().add(102, 'hours');
        const gameId = generatePushId();
        return Promise.all([
          QuestsModule.updateQuestProgressWithGame(userId, 'game2', fakeGameSessionData, systemTime),
          QuestsModule.updateQuestProgressWithGame(userId, 'game3', fakeGameSessionData, systemTime),
        ]).spread((result1, result2) =>
          // this should finish it
          QuestsModule.updateQuestProgressWithGame(userId, gameId, fakeGameSessionData, systemTime)).then((result3) => {
          expect(result3).to.exist;
          expect(result3.quests[0].progress).to.equal(4);
          expect(result3.quests[0].completed_at.valueOf()).to.equal(systemTime.valueOf());

          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex.first().from('users').where('id', userId),
          knex.select().from('user_quests').where('user_id', userId).orderBy('quest_slot_index', 'asc'),
          knex.select().from('user_quests_complete').where('user_id', userId),
          knex.select().from('user_rewards').where('user_id', userId),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
          FirebasePromises.once(rootRef.child('user-games').child(userId).child(gameId).child('job_status'), 'value'),
        ]))
          .spread((userRow, questRows, completeQuestRows, rewardRows, firebaseQuestsSnapshot, firebaseGameJobStatusSnapshot) => {
            expect(questRows).to.exist;
            const dailyQuestRows = _.filter(questRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
            expect(dailyQuestRows.length).to.equal(1);
            expect(dailyQuestRows[0].quest_type_id).to.not.equal(101);

            expect(completeQuestRows).to.exist;
            const completedDailyQuestRows = _.filter(completeQuestRows, (questRow) => _.contains(QuestsModule.DAILY_QUEST_SLOTS, questRow.quest_slot_index));
            expect(completedDailyQuestRows.length).to.equal(2);
            expect(completedDailyQuestRows[1].quest_type_id).to.equal(101);
            expect(completedDailyQuestRows[1].completed_at.valueOf()).to.equal(systemTime.valueOf());
            expect(completedDailyQuestRows[1].progressed_by_game_ids.length).to.equal(4);
            expect(_.intersection(completedDailyQuestRows[1].progressed_by_game_ids, ['game1', 'game2', 'game3', gameId]).length).to.equal(4);

            const firebaseData = firebaseQuestsSnapshot.val().daily.current;

            expect(firebaseData).to.exist;
            expect(firebaseData.quests[0]).to.not.exist;

            expect(firebaseGameJobStatusSnapshot.val().quests).to.equal(true);
          });
      });
    });

    describe('updateQuestProgressWithGame() - receive spirit orb', () => {
      let fakeGameSessionData;

      before(function () {
        this.timeout(5000);
        const systemTime = moment().utc();

        fakeGameSessionData = {};
        fakeGameSessionData.status = SDK.GameStatus.over;
        fakeGameSessionData.gameType = SDK.GameType.SinglePlayer;
        fakeGameSessionData.players = [];
        fakeGameSessionData.players.push({ playerId: userId, deck: {}, isWinner: true });
        fakeGameSessionData.gameSetupData = {};
        fakeGameSessionData.gameSetupData.players = [];
        fakeGameSessionData.gameSetupData.players[0] = {};
        fakeGameSessionData.gameSetupData.players[0].playerId = userId;
        fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;

        return knex('user_quests').delete().where('user_id', userId)
          .then(() => UsersModule.setNewPlayerFeatureProgression(userId, NewPlayerProgressionModuleLookup.Core, NewPlayerProgressionStageEnum.TutorialDone.key))
          .then(() => QuestsModule.generateBeginnerQuests(userId));
      });

      after(() => {
      });

      it('expect to recieve a spirit orb for completing win 1 practice game quest', () => {
        const systemTime = moment().utc();
        return knex.select().from('user_spirit_orbs').where('user_id', userId)
          .bind({})
          .then(function (userSpiritOrbRows) {
            this.userSpiritOrbRows = userSpiritOrbRows;
            return QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), fakeGameSessionData, systemTime);
          })
          .then((result) => {
            expect(result).to.exist;
            expect(result.quests[0].progress).to.equal(1);
            expect(result.quests[0].completed_at.valueOf()).to.equal(systemTime.valueOf());

            return DuelystFirebase.connect().getRootRef();
          })
          .then((rootRef) => Promise.all([
            knex.select().from('user_spirit_orbs').where('user_id', userId),
            FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('spirit-orbs'), 'value'),
          ]))
          .spread(function (userSpiritOrbRows, firebaseSpiritOrbsSnapshot) {
            expect(userSpiritOrbRows.length).to.equal(this.userSpiritOrbRows.length + 1);

            const fbBoosters = firebaseSpiritOrbsSnapshot.val();
            expect(fbBoosters).to.exist;

            const numFbBoosters = Object.keys(fbBoosters).length;
            expect(numFbBoosters).to.equal(userSpiritOrbRows.length);
          });
      });
    });

    describe('_giveUserCatchUpQuestCharge()', () => {
      let fakeGameSessionData;
      let catchUpChargesGiven = 0;

      before(function () {
        this.timeout(5000);
        const systemTime = moment().utc();

        return knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.CATCH_UP_QUEST_SLOT);
      });

      after(() => {
      });

      it('expect to create a quest when giving a user first catch up charge', () => {
        const systemTime = moment().utc();
        const catchUpChargesToGive = 1;
        catchUpChargesGiven += catchUpChargesToGive;
        const catchUpChargesToExpect = catchUpChargesGiven;
        const txPromise = knex.transaction((tx) => {
          QuestsModule._giveUserCatchUpQuestCharge(txPromise, tx, userId, catchUpChargesToGive, systemTime)
            .then(() => {
              tx.commit();
            })
            .catch((e) => {
              Logger.module('UNITTEST').log(e);
              tx.rollback();
            });
        });

        return txPromise.then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
          knex('user_quests').first().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.CATCH_UP_QUEST_SLOT),
          FirebasePromises.once(rootRef.child('user-quests').child(userId).child('daily').child('current')
            .child('quests')
            .child(QuestsModule.CATCH_UP_QUEST_SLOT), 'value'),
        ])).spread((catchUpQuestRow, fbCatchUpQuest) => {
          expect(catchUpQuestRow).to.exist;
          expect(catchUpQuestRow.gold).to.equal(QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE * catchUpChargesToExpect);

          expect(fbCatchUpQuest).to.exist;
          const fbCatchUpQuestData = fbCatchUpQuest.val();
          expect(fbCatchUpQuestData).to.exist;
          expect(fbCatchUpQuestData.gold).to.equal(QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE * catchUpChargesToExpect);
        });
      });

      it('expect quest catch up charges to add to the current catch up quest\'s value', () => {
        const systemTime = moment().utc();
        const catchUpChargesToGive = 2;
        catchUpChargesGiven += catchUpChargesToGive;
        const catchUpChargesToExpect = catchUpChargesGiven;
        const txPromise = knex.transaction((tx) => {
          QuestsModule._giveUserCatchUpQuestCharge(txPromise, tx, userId, catchUpChargesToGive, systemTime)
            .then(() => {
              tx.commit();
            })
            .catch((e) => {
              Logger.module('UNITTEST').log(e);
              tx.rollback();
            });
        });

        return txPromise
          .then(() => Promise.delay(2000)).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
            knex('user_quests').first().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.CATCH_UP_QUEST_SLOT),
            FirebasePromises.once(rootRef.child('user-quests').child(userId).child('daily').child('current')
              .child('quests')
              .child(QuestsModule.CATCH_UP_QUEST_SLOT), 'value'),
          ])).spread((catchUpQuestRow, fbCatchUpQuest) => {
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE * catchUpChargesToExpect);

            expect(fbCatchUpQuest).to.exist;
            const fbCatchUpQuestData = fbCatchUpQuest.val();
            expect(fbCatchUpQuestData).to.exist;
            expect(fbCatchUpQuestData.gold).to.equal(QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE * catchUpChargesToExpect);
          });
      });

      it('expect quest catch up charges to max out', () => {
        const systemTime = moment().utc();
        const catchUpChargesToGive = 20;
        catchUpChargesGiven += catchUpChargesToGive;
        const txPromise = knex.transaction((tx) => {
          QuestsModule._giveUserCatchUpQuestCharge(txPromise, tx, userId, catchUpChargesToGive, systemTime)
            .then(() => {
              tx.commit();
            })
            .catch((e) => {
              Logger.module('UNITTEST').log(e);
              tx.rollback();
            });
        });

        return txPromise
          .then(() => Promise.delay(2000)).then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
            knex('user_quests').first().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.CATCH_UP_QUEST_SLOT),
            FirebasePromises.once(rootRef.child('user-quests').child(userId).child('daily').child('current')
              .child('quests')
              .child(QuestsModule.CATCH_UP_QUEST_SLOT), 'value'),
          ])).spread((catchUpQuestRow, fbCatchUpQuest) => {
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(QuestsModule.CATCH_UP_MAX_GOLD_VALUE);

            expect(fbCatchUpQuest).to.exist;
            const fbCatchUpQuestData = fbCatchUpQuest.val();
            expect(fbCatchUpQuestData).to.exist;
            expect(fbCatchUpQuestData.gold).to.equal(QuestsModule.CATCH_UP_MAX_GOLD_VALUE);
          });
      });
    });

    describe('generateDailyQuests() - catch up quest', () => {
      let fakeGameSessionData;

      before(function () {
        this.timeout(5000);
        const systemTime = moment().utc();

        return Promise.all([
          knex('user_quests').delete().where('user_id', userId),
          knex('users').where('id', userId).update({
            daily_quests_generated_at: systemTime.toDate(),
          }),
        ]);
      });

      after(() => {
      });

      it('expect to not generate a catch up quest when user has completed all of their quests and can generate quests 1 day later', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            expect(questRows.length).to.equal(2);
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(0);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
          });
      });

      it('expect to generate a catch up quest with 1 charge when user has completed 1 of their quests and can generate quests 1 day later', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(() => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[0]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(2, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            expect(questRows.length).to.equal(3);
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(1);

            const catchUpQuestRow = catchUpQuestRows[0];
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(1 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(1 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
          });
      });

      it('expect to generate a catch up quest with 2 charges when user has completed none of their quests and can generate quests 1 day later', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(2, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            expect(questRows.length).to.equal(3);
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(1);

            const catchUpQuestRow = catchUpQuestRows[0];
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
          });
      });

      it('expect to generate a catch up quest with 3 charges when user has completed 1 of their quests and can generate quests 2 days later', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(() => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[0]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(3, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            expect(questRows.length).to.equal(3);
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(1);

            const catchUpQuestRow = catchUpQuestRows[0];
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(3 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(3 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
          });
      });

      it('expect to generate a catch up quest with 2 charges when doesn\'t complete 1 of their quests 2 days in a row', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(() => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[0]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(2, 'days')))
          .then(() => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[0]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(3, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            expect(questRows.length).to.equal(3);
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(1);

            const catchUpQuestRow = catchUpQuestRows[0];
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
          });
      });

      it('expect to generate a catch up quest with max charges when user has completed 1 quest and can generate quests 10 days later', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(() => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[0]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(10, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            expect(questRows.length).to.equal(3);
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(1);

            const catchUpQuestRow = catchUpQuestRows[0];
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(QuestsModule.CATCH_UP_MAX_GOLD_VALUE);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(QuestsModule.CATCH_UP_MAX_GOLD_VALUE);
          });
      });
    });
  });

  describe('After FTUE - with one beginner quest', () => {
    before(() => {
      QuestsModule.SEASONAL_QUESTS_ACTIVE = false;

      return SyncModule.wipeUserData(userId)
        .then(() => knex('user_new_player_progression').insert({
          user_id: userId,
          module_name: NewPlayerProgressionModuleLookup.Core,
          stage: NewPlayerProgressionHelper.DailyQuestsStartToGenerateStage.key,
        })).then(() => QuestsModule.generateBeginnerQuests(userId)).then(() => knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[1]));
    });

    describe('generateDailyQuests() - catch up quest', () => {
      it('expect to not generate a catch up quest when user has completed 1 of their quests and the has 1 beginner quest and can generate quests 1 day later', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId).andWhere('quest_slot_index', QuestsModule.DAILY_QUEST_SLOTS[1]),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(0);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
          });
      });

      it('expect to generate a catch up quest with 2 charges when user doesn\'t complete 1 of their quests and the other is a beginner quest 2 days in a row', () => {
        const systemTime = moment().utc();

        return DuelystFirebase.connect().getRootRef()
          .bind({})
          .then(function (fbRootRef) {
            this.fbRootRef = fbRootRef;
          })
          .then(() => Promise.all([
            knex('user_quests').delete().where('user_id', userId),
            knex('users').where('id', userId).update({
              daily_quests_generated_at: systemTime.toDate(),
            }),
          ]))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'days')))
          .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(2, 'days')))
          .then(function () {
            return Promise.all([
              knex.select().from('user_quests').where('user_id', userId),
              FirebasePromises.once(this.fbRootRef.child('user-quests').child(userId), 'value'),
            ]);
          })
          .spread((questRows, firebaseQuestsSnapshot) => {
            const catchUpQuestRows = _.filter(questRows, (questRow) => questRow.quest_slot_index === QuestsModule.CATCH_UP_QUEST_SLOT);
            expect(catchUpQuestRows.length).to.equal(1);

            const catchUpQuestRow = catchUpQuestRows[0];
            expect(catchUpQuestRow).to.exist;
            expect(catchUpQuestRow.gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);

            const currentQuestsData = firebaseQuestsSnapshot.val().daily.current;
            expect(currentQuestsData).to.exist;
            expect(currentQuestsData.quests[0]).to.exist;
            expect(currentQuestsData.quests[1]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
            expect(currentQuestsData.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
          });
      });
    });
  });

  describe('Seasonal Quests', () => {
    before(() => {
      QuestsModule.SEASONAL_QUESTS_ACTIVE = true;
      return SyncModule.wipeUserData(userId)
        .then(() => knex('user_new_player_progression').insert({
          user_id: userId,
          module_name: NewPlayerProgressionModuleLookup.Core,
          stage: NewPlayerProgressionStageEnum.Skipped.key,
        }));
    });
    describe('Frostfire 2016 Quest', () => {
      describe('generateDailyQuests() - Frostfire 2016 Quest', () => {
        it('expect not to generate the seasonal Frostfire-2016 quest before December 1st 2016', () => QuestsModule.generateDailyQuests(userId, moment.utc('2016-11-30'))
          .then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
            // expect(_.keys(result.quests).length).to.equal(2)
          }));
        it('expect not to generate the seasonal Frostfire-2016 quest after January 1st 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-01-02'))
          .then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
            // expect(_.keys(result.quests).length).to.equal(2)
          }));
        it('expect to generate the seasonal Frostfire-2016 during December 2016', () => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))
          .then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.exist;
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].quest_type_id).to.equal(30001);
            // expect(_.keys(result.quests).length).to.equal(3)
          }));
        it('expect to NOT generate/overwrite the seasonal Frostfire-2016 quest if it already exists', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows)).then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.exist;
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
          })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then((result) => {
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.exist;
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].quest_type_id).to.equal(30001);
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
        }));
        it('expect to NOT generate the seasonal Frostfire-2016 quest if it\'s already complete', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => {
            const array = [];
            _.times(14, (i) => { array.push(i); });
            return Promise.map(array, (i) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows), { concurrency: 1 });
          })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then((result) => {
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('user_quests').where('user_id', userId).select(),
          knex('user_quests_complete').where('user_id', userId).select(),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
        ]))
          .spread((questRows, questCompleteRows, questSnapshot) => {
            const currentQuestsData = questSnapshot.val().daily.current;
            expect(currentQuestsData[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
            const q1 = _.find(questRows, (q) => q.quest_slot_index === QuestsModule.SEASONAL_QUEST_SLOT);
            const q2 = _.find(questCompleteRows, (q) => q.quest_slot_index === QuestsModule.SEASONAL_QUEST_SLOT);
            expect(q1).to.not.exist;
            expect(q2).to.exist;
          }));
        it('expect the seasonal Frostfire-2016 quest to NOT contribute to catchup quests', () => {
          const systemTime = moment.utc('2016-12-02').add(1, 'hour');
          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            })).then(() => QuestsModule.generateDailyQuests(userId, systemTime)).then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(1, 'day')))
            .then((result) => {
              expect(result.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
              expect(result.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(2 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
            })
            .then(() => QuestsModule.generateDailyQuests(userId, systemTime.clone().add(2, 'day')))
            .then((result) => {
              expect(result.quests[QuestsModule.CATCH_UP_QUEST_SLOT]).to.exist;
              expect(result.quests[QuestsModule.CATCH_UP_QUEST_SLOT].gold).to.equal(4 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);

              return knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.CATCH_UP_QUEST_SLOT).first();
            })
            .then((questRow) => {
              expect(questRow).to.exist;
              expect(questRow.gold).to.equal(4 * QuestsModule.CATCH_UP_CHARGE_GOLD_VALUE);
            });
        });
      });
      describe('mulliganDailyQuest() - Frostfire 2016 Quest', () => {
        before(() => {
          QuestsModule.SEASONAL_QUESTS_ACTIVE = true;
          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            }))
            .then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-05')));
        });
        it('expect not to be able to mulligan seasonal Frostfire-2016 quest', () => QuestsModule.mulliganDailyQuest(userId, QuestsModule.SEASONAL_QUEST_SLOT)
          .then((result) => {
            expect(result).to.not.exist;
          }).catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.BadRequestError);
          }));
      });
      describe('updateQuestProgressWithGame() - Frostfire 2016 Quest', () => {
        let fakeGameSessionData;
        before(function () {
          this.timeout(5000);
          const systemTime = moment().add(50, 'hours');
          //
          fakeGameSessionData = {};
          fakeGameSessionData.status = SDK.GameStatus.over;
          fakeGameSessionData.gameType = SDK.GameType.Ranked;
          fakeGameSessionData.players = [];
          fakeGameSessionData.players.push({ playerId: userId, deck: {} });
          fakeGameSessionData.gameSetupData = {};
          fakeGameSessionData.gameSetupData.players = [];
          fakeGameSessionData.gameSetupData.players[0] = {};
          fakeGameSessionData.gameSetupData.players[0].playerId = userId;
          fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;
          // set up user quests as Lyonar and Songhai participation quests
          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then(() => Promise.all([
              QuestsModule.mulliganDailyQuest(userId, 0, systemTime, 101),
              QuestsModule.mulliganDailyQuest(userId, 1, systemTime, 102),
            ]));
        });
        it('expect completing a quest to fire updateQuestProgressWithCompletedQuest() and progress the Frostfire-2016 quest', () => Promise.map([
          generatePushId(),
          generatePushId(),
          generatePushId(),
          generatePushId(),
        ], (gameId) => QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), fakeGameSessionData), { concurrency: 1 })
          .spread(() => knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first()).then((questRow) => {
            expect(questRow.progress).to.equal(1);
          }));
        it('expect completing 2 quests to fire updateQuestProgressWithCompletedQuest() and progress the Frostfire-2016 quest by 2 ticks', () => {
          const futureTime = moment().add(100, 'hours');

          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then(() => Promise.all([
              QuestsModule.mulliganDailyQuest(userId, 0, futureTime, 101),
              QuestsModule.mulliganDailyQuest(userId, 1, futureTime, 101),
            ]))
            .then(() => Promise.map([
              generatePushId(),
              generatePushId(),
              generatePushId(),
              generatePushId(),
            ], (gameId) => QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), fakeGameSessionData), { concurrency: 1 }))
            .spread(() => knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first())
            .then((questRow) => {
              expect(questRow.progress).to.equal(2);
            });
        });
        it('expect completing 2 quests at the very end of the Frostfire Quest Progress (14/15) to complete the season quest but not award double gift crates', () => {
          const futureTime = moment().add(100, 'hours');

          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then(() => Promise.all([
              QuestsModule.mulliganDailyQuest(userId, 0, futureTime, 101),
              QuestsModule.mulliganDailyQuest(userId, 1, futureTime, 101),
              knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).update({ progress: 14 }),
            ]))
            .then(() => Promise.map([
              generatePushId(),
              generatePushId(),
              generatePushId(),
              generatePushId(),
            ], (gameId) => QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), fakeGameSessionData), { concurrency: 1 }))
            .spread(() => Promise.all([
              knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first(),
              knex('user_quests_complete').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first(),
              knex('user_gift_crates').where('user_id', userId),
            ]))
            .spread((questRow, completedQuestRow, giftChestRows) => {
              expect(questRow).to.not.exist;
              expect(completedQuestRow.progress).to.equal(15);
              expect(giftChestRows.length).to.equal(1);
            });
        });
      });
      // describe("updateQuestProgressWithProgressedFactionData() - Frostfire 2016 Quest",function(){
      //   const fakeGameSessionData;
      //   before(function(){
      //     this.timeout(5000);
      //     const systemTime = moment().add(50,'hours');
      //     //
      //     fakeGameSessionData = {};
      //     fakeGameSessionData.status = SDK.GameStatus.over;
      //     fakeGameSessionData.gameType = SDK.GameType.Ranked;
      //     fakeGameSessionData.players = [];
      //     fakeGameSessionData.players.push({ playerId:userId, deck:{} });
      //     fakeGameSessionData.gameSetupData = {};
      //     fakeGameSessionData.gameSetupData.players = [];
      //     fakeGameSessionData.gameSetupData.players[0] = {};
      //     fakeGameSessionData.gameSetupData.players[0].playerId = userId;
      //     fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;
      //
      //     // set up user quests as Lyonar and Faction Level Quests
      //     return SyncModule.wipeUserData(userId)
      //     .then(function(){
      //       return UsersModule.setNewPlayerFeatureProgression(userId, NewPlayerProgressionModuleLookup.Core, NewPlayerProgressionStageEnum.FirstGameDone.key)
      //     }).then(function(){
      //       return QuestsModule.generateBeginnerQuests(userId)
      //     }).then(function(){
      //       return UsersModule.setNewPlayerFeatureProgression(userId, NewPlayerProgressionModuleLookup.Core, NewPlayerProgressionStageEnum.Skipped.key)
      //     }).then(function(){
      //       return UsersModule.generateDailyQuests(userId)
      //     }).then(function(){
      //       return Promise.all([
      //         QuestsModule.mulliganDailyQuest(userId,1,systemTime,101)
      //       ])
      //     })
      //   })
      //
      //   it("expect completing a faction level quest to fire updateQuestProgressWithCompletedQuest() and progress the Frostfire-2016 quest",function(){
      //     return Promise.map([
      //       generatePushId(),
      //       generatePushId(),
      //       generatePushId(),
      //       generatePushId()
      //     ],function(gameId){
      //       return QuestsModule.updateQuestProgressWithGame(userId,generatePushId(),fakeGameSessionData)
      //     },{concurrency:1})
      //     .spread(function(){
      //       return knex("user_quests").where("user_id",userId).andWhere("quest_slot_index",QuestsModule.SEASONAL_QUEST_SLOT).first()
      //     }).then(function(questRow){
      //       expect(questRow.progress).to.equal(1)
      //     })
      //   })
      //
      // })
      describe('updateQuestProgressWithCompletedQuest() - Frostfire 2016 Quest', () => {
        before(function () {
          this.timeout(5000);
          const systemTime = moment().add(50, 'hours');
          // set up user quests as Lyonar and Songhai participation quests
          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then(() => Promise.all([
              QuestsModule.mulliganDailyQuest(userId, 0, systemTime, 101),
              QuestsModule.mulliganDailyQuest(userId, 1, systemTime, 102),
            ]));
        });
        it('expect Frostfire-2016 quest to progress with a quest completion', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows)).then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
          })));
        it('expect completing the Frostfire-2016 quest to award 1 gift chest', () => {
          const gameId = generatePushId();
          return knex.transaction((tx) => tx('user_quests').where('user_id', userId)
            .then((questRows) => {
              const array = [];
              _.times(14, (i) => { array.push(i); });
              return Promise.map(array, (i) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, gameId, 1, questRows), { concurrency: 1 });
            }))
            .then(() => Promise.all([
              knex('user_gift_crates').where('user_id', userId).andWhere('crate_type', GiftCrateLookup.Frostfire2016).select(),
              knex('user_quests_complete').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first(),
              knex('user_rewards').where('user_id', userId).andWhere('game_id', gameId).select(),
            ]))
            .spread((giftCrateRows, questRow, rewardRows) => {
              expect(giftCrateRows.length).to.equal(1);
              expect(giftCrateRows[0].crate_type).to.equal(GiftCrateLookup.Frostfire2016);
              expect(questRow).to.exist;
              expect(rewardRows.length).to.equal(1);
              expect(rewardRows[0].gift_chests.length).to.equal(1);
            });
        });
      });
    });

    describe('February 2017 Quest', () => {
      const FebQuestId = 30002;
      before(function () {
        this.timeout(5000);
        return SyncModule.wipeUserData(userId)
          .then(() => knex('user_new_player_progression').insert({
            user_id: userId,
            module_name: NewPlayerProgressionModuleLookup.Core,
            stage: NewPlayerProgressionStageEnum.Skipped.key,
          }));
      });
      describe('generateDailyQuests() - February 2017 Quest', () => {
        it('expect not to generate the seasonal February-2017 quest before February 1st 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-01-31'))
          .then((result) => {
            if (result.quests[QuestsModule.SEASONAL_QUEST_SLOT] != null) {
              expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.equal(FebQuestId);
            } else {
              expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
            }
          }));
        it('expect not to generate the seasonal February-2017 quest after March 1st 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-03-01'))
          .then((result) => {
            if (result.quests[QuestsModule.SEASONAL_QUEST_SLOT] != null) {
              expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.equal(FebQuestId);
            } else {
              expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
            }
          }));
        it('expect to generate the seasonal February-2017 during February 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-02-05'))
          .then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.exist;
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].quest_type_id).to.equal(FebQuestId);
          }));
        it('expect to NOT generate/overwrite the seasonal quest if it already exists', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows)).then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.exist;
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
          })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2017-02-06'))).then((result) => {
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.exist;
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].quest_type_id).to.equal(FebQuestId);
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
        }));
        it('expect to NOT generate the seasonal February-2017 quest if it\'s already complete', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => {
            const array = [];
            _.times(14, (i) => { array.push(i); });
            return Promise.map(array, (i) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows), { concurrency: 1 });
          })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2017-02-07'))).then((result) => {
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('user_quests').where('user_id', userId).select(),
          knex('user_quests_complete').where('user_id', userId).select(),
          FirebasePromises.once(rootRef.child('user-quests').child(userId), 'value'),
        ]))
          .spread((questRows, questCompleteRows, questSnapshot) => {
            const currentQuestsData = questSnapshot.val().daily.current;
            expect(currentQuestsData[QuestsModule.SEASONAL_QUEST_SLOT]).to.not.exist;
            const q1 = _.find(questRows, (q) => q.quest_slot_index === QuestsModule.SEASONAL_QUEST_SLOT);
            const q2 = _.find(questCompleteRows, (q) => q.quest_slot_index === QuestsModule.SEASONAL_QUEST_SLOT);
            expect(q1).to.not.exist;
            expect(q2).to.exist;
          }));
      });

      describe('updateQuestProgressWithCompletedQuest() - February 2017 Quest', () => {
        before(function () {
          this.timeout(5000);
          const systemTime = moment().add(50, 'hours');
          // set up user quests as Lyonar and Songhai participation quests
          return SyncModule.wipeUserData(userId)
            .then(() => knex('user_new_player_progression').insert({
              user_id: userId,
              module_name: NewPlayerProgressionModuleLookup.Core,
              stage: NewPlayerProgressionStageEnum.Skipped.key,
            })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2017-02-05'))).then(() => Promise.all([
              QuestsModule.mulliganDailyQuest(userId, 0, systemTime, 101),
              QuestsModule.mulliganDailyQuest(userId, 1, systemTime, 102),
            ]));
        });
        it('expect February-2017 quest to progress with a quest completion', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows)).then((result) => {
            expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
          })));
        it('expect completing the February-2017 quest to award 1 common cosmetic key', () => {
          const gameId = generatePushId();
          return knex.transaction((tx) => tx('user_quests').where('user_id', userId)
            .then((questRows) => {
              const array = [];
              _.times(14, (i) => { array.push(i); });
              return Promise.map(array, (i) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, gameId, 1, questRows), { concurrency: 1 });
            }))
            .then(() => Promise.all([
              knex('user_gift_crates').where('user_id', userId).andWhere('crate_type', GiftCrateLookup.Frostfire2016).select(),
              knex('user_cosmetic_chest_keys').where('user_id', userId).andWhere('key_type', SDK.CosmeticsChestTypeLookup.Common).select(),
              knex('user_quests_complete').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first(),
              knex('user_rewards').where('user_id', userId).andWhere('game_id', gameId).select(),
            ])).spread((giftCrateRows, crateKeyRows, questRow, rewardRows) => {
              expect(giftCrateRows.length).to.equal(0);
              expect(crateKeyRows.length).to.equal(1);
              expect(questRow).to.exist;
              expect(rewardRows.length).to.equal(1);
              expect(rewardRows[0].cosmetic_keys.length).to.equal(1);
            });
        });
      });
    });

    //

    describe('updateQuestProgressWithCompletedQuest() - Frostfire 2016 Quest', () => {
      before(function () {
        this.timeout(5000);
        const systemTime = moment().add(50, 'hours');
        // set up user quests as Lyonar and Songhai participation quests
        return SyncModule.wipeUserData(userId)
          .then(() => knex('user_new_player_progression').insert({
            user_id: userId,
            module_name: NewPlayerProgressionModuleLookup.Core,
            stage: NewPlayerProgressionStageEnum.Skipped.key,
          })).then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2016-12-02'))).then(() => Promise.all([
            QuestsModule.mulliganDailyQuest(userId, 0, systemTime, 101),
            QuestsModule.mulliganDailyQuest(userId, 1, systemTime, 102),
          ]));
      });
      it('expect Frostfire-2016 quest to progress with a quest completion', () => knex.transaction((tx) => tx('user_quests').where('user_id', userId)
        .then((questRows) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, generatePushId(), 1, questRows)).then((result) => {
          expect(result.quests[QuestsModule.SEASONAL_QUEST_SLOT].progress).to.equal(1);
        })));
      it('expect completing the Frostfire-2016 quest to award 1 gift chest', () => {
        const gameId = generatePushId();
        return knex.transaction((tx) => tx('user_quests').where('user_id', userId)
          .then((questRows) => {
            const array = [];
            _.times(14, (i) => { array.push(i); });
            return Promise.map(array, (i) => QuestsModule.updateQuestProgressWithCompletedQuest(Promise.resolve(), tx, userId, gameId, 1, questRows), { concurrency: 1 });
          }))
          .then(() => Promise.all([
            knex('user_gift_crates').where('user_id', userId).andWhere('crate_type', GiftCrateLookup.Frostfire2016).select(),
            knex('user_quests_complete').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.SEASONAL_QUEST_SLOT).first(),
            knex('user_rewards').where('user_id', userId).andWhere('game_id', gameId).select(),
          ]))
          .spread((giftCrateRows, questRow, rewardRows) => {
            expect(giftCrateRows.length).to.equal(1);
            expect(giftCrateRows[0].crate_type).to.equal(GiftCrateLookup.Frostfire2016);
            expect(questRow).to.exist;
            expect(rewardRows.length).to.equal(1);
            expect(rewardRows[0].gift_chests.length).to.equal(1);
          });
      });
    });
  });

  describe('Promo Quest', () => {
    const annQuestId = 40001;
    before(function () {
      this.timeout(5000);
      return SyncModule.wipeUserData(userId)
        .then(() => knex('user_new_player_progression').insert({
          user_id: userId,
          module_name: NewPlayerProgressionModuleLookup.Core,
          stage: NewPlayerProgressionStageEnum.Skipped.key,
        }));
    });
    describe('generateDailyQuests() - Anniversary 2017 Quest', () => {
      it('expect not to generate the promo Anniversary-2017 quest before May 1st 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-04-29'))
        .then((result) => {
          if (result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT] != null) {
            expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.not.equal(annQuestId);
          } else {
            expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.not.exist;
          }
        }));
      it('expect not to generate the promo Anniversary-2017 quest after May 15th 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-05-16'))
        .then((result) => {
          if (result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT] != null) {
            expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.not.equal(annQuestId);
          } else {
            expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.not.exist;
          }
        }));
      it('expect to generate the promo Anniversary-2017 during May first week 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-05-05'))
        .then((result) => {
          expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.exist;
          expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT].quest_type_id).to.equal(annQuestId);
        }));
      it('expect to NOT generate/overwrite the promo quest if it already exists', () => {
        const genTime = moment.utc('2017-05-06');
        return knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.PROMOTIONAL_QUEST_SLOT).update({ progress: 0 })
          .then(() => {
            const fakeGameSessionData = {};
            fakeGameSessionData.status = SDK.GameStatus.over;
            fakeGameSessionData.gameType = SDK.GameType.Rift;
            fakeGameSessionData.players = [];
            fakeGameSessionData.players.push({ playerId: userId, deck: {}, isWinner: true });
            fakeGameSessionData.gameSetupData = {};
            fakeGameSessionData.gameSetupData.players = [];
            fakeGameSessionData.gameSetupData.players[0] = {};
            fakeGameSessionData.gameSetupData.players[0].playerId = userId;
            fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;
            return QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), fakeGameSessionData);
          })
          .then(() => QuestsModule.generateDailyQuests(userId, genTime))
          .then((result) => {
            if (result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT] != null) {
              expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT].created_at).to.not.equal(genTime.toDate());
            }
          });
      });
      it('expect to NOT generate/overwrite the promo quest if it already complete', () => knex('user_quests').where('user_id', userId).andWhere('quest_slot_index', QuestsModule.PROMOTIONAL_QUEST_SLOT).update({ progress: 3 })
        .then(() => {
          const fakeGameSessionData = {};
          fakeGameSessionData.status = SDK.GameStatus.over;
          fakeGameSessionData.gameType = SDK.GameType.Rift;
          fakeGameSessionData.players = [];
          fakeGameSessionData.players.push({ playerId: userId, deck: {}, isWinner: true });
          fakeGameSessionData.gameSetupData = {};
          fakeGameSessionData.gameSetupData.players = [];
          fakeGameSessionData.gameSetupData.players[0] = {};
          fakeGameSessionData.gameSetupData.players[0].playerId = userId;
          fakeGameSessionData.gameSetupData.players[0].factionId = SDK.Factions.Lyonar;
          return QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), fakeGameSessionData);
        })
        .then(() => QuestsModule.generateDailyQuests(userId, moment.utc('2017-05-06')))
        .then((result) => {
          expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.not.exist;
        }));
      it('expect to remove the promo Anniversary-2017 during May third week 2017', () => QuestsModule.generateDailyQuests(userId, moment.utc('2017-05-21'))
        .then((result) => {
          expect(result.quests[QuestsModule.PROMOTIONAL_QUEST_SLOT]).to.not.exist;
        }));
    });
  });
});
