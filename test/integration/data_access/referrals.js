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
const GamesModule = require('../../../server/lib/data_access/games.coffee');
const QuestsModule = require('../../../server/lib/data_access/quests.coffee');
const SyncModule = require('../../../server/lib/data_access/sync.coffee');
const InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
const ReferralsModule = require('../../../server/lib/data_access/referrals.coffee');
const FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
const generatePushId = require('../../../app/common/generate_push_id');
const config = require('../../../config/config');
const Logger = require('../../../app/common/logger.coffee');
const SDK = require('../../../app/sdk.coffee');
const knex = require('../../../server/lib/data_access/knex.coffee');
const FirstReferralPurchaseAchievement = require('../../../app/sdk/achievements/referralBasedAchievements/firstReferralPurchaseAchievement.coffee');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('referrals module', function () {
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

  describe('referral program', () => {
    let newUserId = null;
    let oldUserId = null;
    let oldUserWithEventsId = null;
    let userWithRankedGame = null;

    before(() => {
      const rando1 = generatePushId();
      const email1 = `${rando1}-unit-test@duelyst.local`;
      const username1 = `${rando1.toLowerCase()}-unit-test`;

      const rando2 = generatePushId();
      const email2 = `${rando2}-unit-test@duelyst.local`;
      const username2 = `${rando2.toLowerCase()}-unit-test`;

      const rando3 = generatePushId();
      const email3 = `${rando3}-unit-test@duelyst.local`;
      const username3 = `${rando3.toLowerCase()}-unit-test`;

      const rando4 = generatePushId();
      const email4 = `${rando4}-unit-test@duelyst.local`;
      const username4 = `${rando4.toLowerCase()}-unit-test`;

      return Promise.all([
        UsersModule.createNewUser(email1, username1, 'testpassword', 'kumite14'),
        UsersModule.createNewUser(email2, username2, 'testpassword', 'kumite14'),
        UsersModule.createNewUser(email3, username3, 'testpassword', 'kumite14'),
        UsersModule.createNewUser(email4, username4, 'testpassword', 'kumite14'),
        SyncModule.wipeUserData(userId),
      ]).spread((newUserId1, newUserId2, newUserId3, newUserId4) => {
        newUserId = newUserId1;
        oldUserId = newUserId2;
        oldUserWithEventsId = newUserId3;
        userWithRankedGame = newUserId4;
        return Promise.all([
          knex('users').where('id', oldUserId).update({
            created_at: moment().utc().subtract(40, 'days').toDate(),
          }),
          knex('users').where('id', oldUserWithEventsId).update({
            created_at: moment().utc().subtract(15, 'days').toDate(),
            top_rank: 13,
            purchase_count: 2,
          }),
          UsersModule.updateUserProgressionWithGameOutcome(userWithRankedGame, generatePushId(), true, generatePushId()),
        ]);
      });
    });

    describe('markUserAsReferredByFriend()', () => {
      it('expect to fail to mark a user as referred with invalid user id', () => ReferralsModule.markUserAsReferredByFriend(newUserId, 'invalidUserId-C$N#Qrnv')
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.NotFoundError);
        }));

      it('expect to be able to mark a user as referred by a friend and gain 100 starting GOLD', () => ReferralsModule.markUserAsReferredByFriend(newUserId, userId)
        .then((response) => {
          expect(response).to.exist;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('users').where('id', newUserId).first(),
          knex('user_referrals').where('user_id', userId),
          knex('user_referral_events').where('referrer_id', userId).select(),
          FirebasePromises.once(rootRef.child('users').child(newUserId), 'value'),
          FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
        ])).spread((userRow, referralRows, referralEventRows, userSnapshot, friendSnapshot) => {
          expect(userRow.referred_by_user_id).to.equal(userId);
          expect(userRow.wallet_gold).to.equal(100);
          expect(referralRows.length).to.equal(1);
          expect(referralRows[0].referred_user_id).to.equal(newUserId);
          expect(referralEventRows.length).to.equal(0);
          // expect(userSnapshot.val().buddies[userId]).to.exist
          // expect(friendSnapshot.val().buddies[newUserId]).to.exist
        }));

      it('expect to NOT be able to set a referrer for a user that registered over 30 days ago', () => ReferralsModule.markUserAsReferredByFriend(oldUserId, userId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));

      it('expect to NOT be able to set a referrer for a user that has played a ranked game', () => ReferralsModule.markUserAsReferredByFriend(userWithRankedGame, userId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
          expect(error.message).to.equal('Can not set referral info on players who have played ranked games.');
        }));

      it('expect to be fail to change a users referrer after it\'s been set', () => ReferralsModule.markUserAsReferredByFriend(newUserId, userId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
        }));

      it('expect to backfill referral events for users who have already achieved certain milestones but marked late', () => ReferralsModule.markUserAsReferredByFriend(oldUserWithEventsId, newUserId)
        .then((response) => {
          expect(response).to.exist;
          return Promise.all([
            knex('users').where('id', oldUserWithEventsId).first(),
            knex('user_referral_events').where('referrer_id', newUserId).select(),
          ]);
        }).spread((userRow, referralEventRows) => {
          expect(userRow.referred_by_user_id).to.equal(newUserId);
          expect(referralEventRows.length).to.equal(2);
        }));

      it('expect to NOT be able to mark self as referred by someone you referred', () => ReferralsModule.markUserAsReferredByFriend(userId, newUserId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
          expect(error.message).to.equal('User can not be marked as referred by one of their referrals.');
        }));

      it('expect to NOT be able to mark self as referred by self', () => ReferralsModule.markUserAsReferredByFriend(userId, userId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
          expect(error.message).to.equal('Can not be marked as referred by self.');
        }));
    });

    describe('processReferralEventForUser()', () => {
      it('expect to fail to process anything for an user with no referrer', () => ReferralsModule.processReferralEventForUser(userId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.NotFoundError);
        }));

      it('expect to update referral event for a user with a referrer', () => ReferralsModule.processReferralEventForUser(newUserId, userId, 'silver')
        .then((response) => {
          expect(response).to.exist;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('user_referrals').where('user_id', userId).select(),
          knex('user_referral_events').where('referrer_id', userId).select(),
        ])).spread((referralRows, referralEventRows) => {
          expect(referralRows.length).to.equal(1);
          expect(referralRows[0].level_reached).to.equal(1);
          expect(referralEventRows.length).to.equal(1);
          expect(_.pluck(referralEventRows, 'event_type')).to.have.members(['silver']);
        }));

      it('expect referral row record "level" to iterate upwards with events', () => ReferralsModule.processReferralEventForUser(newUserId, userId, 'gold')
        .then((response) => {
          expect(response).to.exist;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('user_referrals').where('user_id', userId).select(),
          knex('user_referral_events').where('referrer_id', userId).select(),
        ])).spread((referralRows, referralEventRows) => {
          expect(referralRows.length).to.equal(1);
          expect(referralRows[0].level_reached).to.equal(2);
          expect(referralEventRows.length).to.equal(2);
          expect(_.pluck(referralEventRows, 'event_type')).to.have.members(['silver', 'gold']);
        }));

      it('expect off master flow events (such as "purchase") to not change referral record level', () => ReferralsModule.processReferralEventForUser(newUserId, userId, 'purchase')
        .then((response) => {
          expect(response).to.exist;
          return DuelystFirebase.connect().getRootRef();
        }).then((rootRef) => Promise.all([
          knex('user_referrals').where('user_id', userId).select(),
          knex('user_referral_events').where('referrer_id', userId).select(),
        ])).spread((referralRows, referralEventRows) => {
          expect(referralRows.length).to.equal(1);
          expect(referralRows[0].level_reached).to.equal(2);
          expect(referralEventRows.length).to.equal(3);
          expect(_.pluck(referralEventRows, 'event_type')).to.have.members(['silver', 'gold', 'purchase']);
        }));

      // it('expect stats to increment correctly', function() {
      //   return ReferralsModule.processReferralEventForUser(generatePushId(),'unittestercode','gold')
      //   .then(function(response){
      //     expect(response).to.exist
      //     return DuelystFirebase.connect().getRootRef()
      //   }).then(function(rootRef){
      //     return Promise.all([
      //       knex("referral_codes").where('code','unittestercode').first(),
      //       knex("referral_events").where('code','unittestercode').select()
      //     ])
      //   }).spread(function(referralCodeRow,referralEventRows){
      //     expect(referralCodeRow).to.exist
      //     expect(referralCodeRow.event_stats_json['gold']).to.equal(2)
      //     expect(referralEventRows.length).to.equal(2)
      //   })
      // })
    });

    describe('claimReferralRewards()', () => {
      let noReferralUserId = null;

      before(() => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        return UsersModule.createNewUser(email, username, 'testpassword', 'kumite14')
          .then((userId) => {
            noReferralUserId = userId;
          });
      });

      it('expect to fail to claim anything if you don\'t have any rewards waiting', () => ReferralsModule.claimReferralRewards(noReferralUserId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));

      it('expect to be able to claim referral rewards and receive rewards', () => ReferralsModule.claimReferralRewards(userId)
        .then((response) => {
          expect(response).to.exist;
          return Promise.all([
            knex('users').where('id', userId).first(),
            knex('user_rewards').where('user_id', userId).andWhere('reward_category', 'referral').select(),
          ]);
        }).spread((userRow, rewardRows) => {
          expect(userRow.referral_rewards_claimed_at).to.exist;
          expect(rewardRows.length).to.equal(2);
          const rewards = _.reduce(rewardRows, (memo, r) => {
            memo.spirit_orbs += (r.spirit_orbs || 0);
            memo.gold += (r.gold || 0);
            return memo;
          }, {
            spirit_orbs: 0,
            gold: 0,
          });
          expect(rewards.spirit_orbs).to.equal(1);
          expect(rewards.gold).to.equal(200);
        }));

      it('expect claiming again with no new rewards added to ERROR out', () => ReferralsModule.claimReferralRewards(userId)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.BadRequestError);
        }));
    });

    describe('referral hidden achievement', () => {
      it('expect first purchase by a referral achievement to have awarded ROOK emote', () =>
      // NOTE: purchase event fires above no need to do here so commented out

        // return ReferralsModule.processReferralEventForUser(newUserId,userId,'purchase')
        // .then(function(response){
        //   return Promise.delay(500)
        // })
        Promise.resolve()
          .then(() => Promise.all([
            knex('user_achievements').where('user_id', userId).select(),
            knex('user_cosmetic_inventory').where('user_id', userId).select(),
          ])).spread((achievementRows, emoteRows) => {
            expect(achievementRows.length).to.equal(1);
            expect(achievementRows[0].achievement_id).to.equal(FirstReferralPurchaseAchievement.id);
            expect(emoteRows.length).to.equal(1);
            expect(parseInt(emoteRows[0].cosmetic_id, 10)).to.equal(SDK.CosmeticsLookup.Emote.OtherRook);
          }));
    });
  });
});
