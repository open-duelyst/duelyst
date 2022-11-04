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
const NewPlayerProgressionStageEnum = require('../../../app/sdk/progression/newPlayerProgressionStageEnum.coffee');

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe('users module', () => {
  let userId = null;

  // before cleanup to check if user already exists and delete
  before(() => {
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

  // // after cleanup
  // after(function(){
  //   return DuelystFirebase.connect().getRootRef()
  //   .bind({})
  //   .then(function(fbRootRef){
  //     this.fbRootRef = fbRootRef;
  //     if (userId)
  //       return SyncModule.wipeUserData(userId);
  //   });
  // });
  describe('userIdForEmail()', () => {
    it('expect a user id if email exists', () => UsersModule.userIdForEmail('unit-test@duelyst.local')
      .then((id) => {
        expect(id).to.exist;
        expect(id).to.have.length(20);
      }));

    it('expect null if the email does not exist', () => UsersModule.userIdForEmail('does@not.exist')
      .then((id) => {
        expect(id).to.be.equal(null);
      }));
  });

  describe('createNewUser()', () => {
    before(() =>
      // destroy referral codes
      Promise.all([
        knex('referral_codes').where('code', 'test-referral-20-gold').delete(),
        knex('referral_codes').where('code', 'test-referral-10-gold-friend').delete(),
        knex('referral_codes').where('code', 'expired-gold-code').delete(),
        knex('referral_codes').where('code', 'maxed-gold-code').delete(),
        knex('referral_codes').where('code', 'inactive-gold-code').delete(),
      ]));

    describe('registration - when invite codes are active', () => {
      //
      let invitesActiveBefore = null;
      before(() => {
        invitesActiveBefore = config.get('inviteCodesActive');
        config.set('inviteCodesActive', true);
      });
      after(() => { config.set('inviteCodesActive', invitesActiveBefore); });

      it('expect NOT to be able to create a user with an invalid invite code if invite codes are ACTIVE', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        return UsersModule.createNewUser(email, `testuser${rando}`, 'testpassword', 'invalid invite')
          .then((result) => {
            expect(result).to.not.exist;
          })
          .catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.InvalidInviteCodeError);
          });
      });

      it('expect to be able to create a user with a valid invite code if invite codes are ACTIVE', () => {
        const rando = generatePushId();
        const code = `test-invite-${rando}`;
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        return knex('invite_codes').insert({ code })
          .bind({})
          .then(() => UsersModule.createNewUser(email, username, 'testpassword', code))
          .then(function (newUserId) {
            this.newUserId = newUserId;
            expect(newUserId).to.exist;
            return DuelystFirebase.connect().getRootRef();
          })
          .then(function (rootRef) {
            return Promise.all([
              knex('users').where('id', this.newUserId).first(),
              FirebasePromises.once(rootRef.child('users').child(this.newUserId), 'value'),
            ]);
          })
          .spread((userRow, userSnapshot) => {
            expect(userRow.username).to.equal(username);
            expect(userSnapshot.val().username).to.equal(username);
          });
      });
    });

    describe('registration - when invite codes are in-active', () => {
      //
      let invitesActiveBefore = null;
      before(() => {
        invitesActiveBefore = config.get('inviteCodesActive');
        config.set('inviteCodesActive', false);
      });
      after(() => { config.set('inviteCodesActive', invitesActiveBefore); });

      it('expect to be able to create a user with an invalid invite code if invite codes are INACTIVE', () => {
        const rando = generatePushId();
        const code = `fake-test-invite-${rando}`;
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        return UsersModule.createNewUser(email, username, 'testpassword', code)
          .then(function (newUserId) {
            this.newUserId = newUserId;
            expect(newUserId).to.exist;
            return DuelystFirebase.connect().getRootRef();
          }).then(function (rootRef) {
            return Promise.all([
              knex('users').where('id', this.newUserId).first(),
              FirebasePromises.once(rootRef.child('users').child(this.newUserId), 'value'),
            ]);
          }).spread((userRow, userSnapshot) => {
            expect(userRow.username).to.equal(username);
            expect(userSnapshot.val().username).to.equal(username);
          });
      });
    });

    describe('registration - with referral codes', () => {
      it('expect a referral code with 20 bonus signup GOLD to work', () => {
        const rando = generatePushId();
        const code = `test-invite-${rando}`;
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        const referralCode = 'test-referral-20-gold';
        return Promise.all([
          knex('invite_codes').insert({ code }),
          knex('referral_codes').insert({
            code: referralCode,
            params: {
              gold: 20,
            },
          }),
        ])
          .then(() => UsersModule.createNewUser(email, username, 'testpassword', code, referralCode))
          .then(function (newUserId) {
            this.newUserId = newUserId;
            expect(newUserId).to.exist;
            return DuelystFirebase.connect().getRootRef();
          }).then(function (rootRef) {
            return Promise.all([
              knex('users').where('id', this.newUserId).first(),
              knex('referral_codes').where('code', referralCode).first(),
              FirebasePromises.once(rootRef.child('users').child(this.newUserId), 'value'),
              FirebasePromises.once(rootRef.child('user-inventory').child(this.newUserId).child('wallet'), 'value'),
            ]);
          })
          .spread((userRow, referralCodeRow, userSnapshot, walletSnapshot) => {
            expect(userRow.username).to.equal(username);
            expect(userRow.wallet_gold).to.equal(20);
            expect(referralCodeRow.signup_count).to.equal(1);
            expect(userSnapshot.val().username).to.equal(username);
            expect(walletSnapshot.val().gold_amount).to.equal(20);
          });
      });

      it('expect a referral code to be CaSE insensitive', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        const referralCode = 'TEST-referral-20-Gold';
        return UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', referralCode)
          .then(function (newUserId) {
            this.newUserId = newUserId;
            expect(newUserId).to.exist;
            return DuelystFirebase.connect().getRootRef();
          }).then(function (rootRef) {
            return Promise.all([
              knex('users').where('id', this.newUserId).first(),
              knex('referral_codes').where('code', referralCode.toLowerCase()).first(),
              FirebasePromises.once(rootRef.child('users').child(this.newUserId), 'value'),
              FirebasePromises.once(rootRef.child('user-inventory').child(this.newUserId).child('wallet'), 'value'),
            ]);
          }).spread((userRow, referralCodeRow, userSnapshot, walletSnapshot) => {
            expect(userRow.username).to.equal(username);
            expect(userRow.wallet_gold).to.equal(20);
            expect(referralCodeRow.signup_count).to.equal(2);
            expect(userSnapshot.val().username).to.equal(username);
            expect(walletSnapshot.val().gold_amount).to.equal(20);
          });
      });

      it('expect a referral code to trim whitespace', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        const referralCode = ' TEST-referral-20-Gold ';
        return UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', referralCode)
          .then(function (newUserId) {
            this.newUserId = newUserId;
            expect(newUserId).to.exist;
            return DuelystFirebase.connect().getRootRef();
          }).then(function (rootRef) {
            return Promise.all([
              knex('users').where('id', this.newUserId).first(),
              knex('referral_codes').where('code', referralCode.toLowerCase().trim()).first(),
              FirebasePromises.once(rootRef.child('users').child(this.newUserId), 'value'),
              FirebasePromises.once(rootRef.child('user-inventory').child(this.newUserId).child('wallet'), 'value'),
            ]);
          }).spread((userRow, referralCodeRow, userSnapshot, walletSnapshot) => {
            expect(userRow.username).to.equal(username);
            expect(userRow.wallet_gold).to.equal(20);
            expect(referralCodeRow.signup_count).to.equal(3);
            expect(userSnapshot.val().username).to.equal(username);
            expect(walletSnapshot.val().gold_amount).to.equal(20);
          });
      });

      // it('expect a referral code with auto friending to work', function() {
      //   const rando1 = generatePushId()
      //   const email1 = rando1+'-unit-test@duelyst.local'
      //   const username1 = rando1.toLowerCase()+'-unit-test'
      //   const rando2 = generatePushId()
      //   const email2 = rando2+'-unit-test@duelyst.local'
      //   const username2 = rando2.toLowerCase()+'-unit-test'
      //   const referralCode = "test-referral-10-gold-friend"
      //   const friendId = null
      //   return UsersModule.createNewUser(email1,username1,'testpassword',"kumite14")
      //   .then(function(newUserId){
      //     friendId = this.friendId = newUserId
      //     return Promise.all([
      //       knex("referral_codes").insert({
      //         code:referralCode,
      //         user_id:friendId,
      //         params:{
      //           autoFriend:true,
      //           gold:10
      //         }
      //       })
      //     ])
      //   }).then(function(){
      //     return UsersModule.createNewUser(email2,username2,'testpassword',"kumite14",referralCode)
      //   })
      //   .then(function(newUserId){
      //     this.newUserId = newUserId
      //     expect(newUserId).to.exist;
      //     return DuelystFirebase.connect().getRootRef()
      //   }).then(function(rootRef){
      //     return Promise.all([
      //       knex("users").where('id',this.newUserId).first(),
      //       knex("referral_codes").where('code',referralCode).first(),
      //       FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
      //       FirebasePromises.once(rootRef.child("users").child(friendId),"value"),
      //     ])
      //   }).spread(function(userRow,referralCodeRow,userSnapshot,friendSnapshot){
      //     expect(userRow.wallet_gold).to.equal(10)
      //     expect(referralCodeRow.signup_count).to.equal(1)
      //     expect(userSnapshot.val().buddies[friendId]).to.exist
      //     expect(friendSnapshot.val().buddies[this.newUserId]).to.exist
      //   })
      // });

      it('expect using an invalid referral code to ERROR out', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        return Promise.all([])
          .then(() => UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', 'invalid-code'))
          .then((newUserId) => {
            expect(newUserId).to.not.exist;
          }).catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
          });
      });

      it('expect using an MAXED-out referral code to error out', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        return Promise.all([
          knex('referral_codes').insert({
            code: 'maxed-gold-code',
            signup_limit: 1,
            signup_count: 1,
            params: {
              gold: 20,
            },
          }),
        ])
          .then(() => UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', 'maxed-gold-code'))
          .then((newUserId) => {
            expect(newUserId).to.not.exist;
          }).catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
          });
        // .then(function(newUserId){
        //   this.newUserId = newUserId
        //   expect(newUserId).to.exist;
        //   return DuelystFirebase.connect().getRootRef()
        // }).then(function(rootRef){
        //   return Promise.all([
        //     knex("users").where('id',this.newUserId).first(),
        //     FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
        //   ])
        // }).spread(function(userRow,userSnapshot){
        //   expect(userRow.username).to.equal(username)
        //   expect(userRow.referral_code).to.not.exist
        //   expect(userRow.wallet_gold).to.equal(0)
        //   expect(userSnapshot.val().username).to.equal(username)
        // })
      });

      it('expect using an expired referral code to error out', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        const expires = moment().utc().subtract(1, 'month').toDate();
        return Promise.all([
          knex('referral_codes').insert({
            code: 'expired-gold-code',
            params: {
              gold: 20,
            },
            expires_at: expires,
          }),
        ])
          .then(() => UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', 'expired-gold-code'))
          .then((newUserId) => {
            expect(newUserId).to.not.exist;
          }).catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
          });
        // .then(function(newUserId){
        //   this.newUserId = newUserId
        //   expect(newUserId).to.exist;
        //   return DuelystFirebase.connect().getRootRef()
        // }).then(function(rootRef){
        //   return Promise.all([
        //     knex("users").where('id',this.newUserId).first(),
        //     FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
        //   ])
        // }).spread(function(userRow,userSnapshot){
        //   expect(userRow.username).to.equal(username)
        //   expect(userRow.referral_code).to.not.exist
        //   expect(userRow.wallet_gold).to.equal(0)
        //   expect(userSnapshot.val().username).to.equal(username)
        // })
      });

      it('expect using an inactive referral code to error out', () => {
        const rando = generatePushId();
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        return Promise.all([
          knex('referral_codes').insert({
            code: 'inactive-gold-code',
            params: {
              gold: 20,
            },
            is_active: false,
          }),
        ])
          .then(() => UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', 'inactive-gold-code'))
          .then((newUserId) => {
            expect(newUserId).to.not.exist;
          }).catch((error) => {
            expect(error).to.exist;
            expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError);
          });
        // .then(function(newUserId){
        //   this.newUserId = newUserId
        //   expect(newUserId).to.exist;
        //   return DuelystFirebase.connect().getRootRef()
        // }).then(function(rootRef){
        //   return Promise.all([
        //     knex("users").where('id',this.newUserId).first(),
        //     FirebasePromises.once(rootRef.child("users").child(this.newUserId),"value"),
        //   ])
        // }).spread(function(userRow,userSnapshot){
        //   expect(userRow.username).to.equal(username)
        //   expect(userRow.referral_code).to.not.exist
        //   expect(userRow.wallet_gold).to.equal(0)
        //   expect(userSnapshot.val().username).to.equal(username)
        // })
      });
    });

    describe('registration - with campaign data', () => {
      it('expect campaign data to set correctly', () => {
        const rando = generatePushId();
        const code = `test-invite-${rando}`;
        const email = `${rando}-unit-test@duelyst.local`;
        const username = `${rando.toLowerCase()}-unit-test`;
        const referralCode = 'test-referral-20-gold';
        const campaignData = {
          campaign_source: 'test_campaign_source',
          campaign_medium: 'test_campaign_medium',
          campaign_term: 'test_campaign_term',
          campaign_content: 'test_campaign_content',
          campaign_name: 'test_campaign_name',
          referrer: 'test_referrer',
        };
        return UsersModule.createNewUser(email, username, 'testpassword', 'kumite14', null, campaignData)
          .then(function (newUserId) {
            this.newUserId = newUserId;
            expect(newUserId).to.exist;

            return knex('users').where('id', this.newUserId).first();
          }).then((userRow) => {
            expect(userRow.campaign_source).to.equal(campaignData.campaign_source);
            expect(userRow.campaign_medium).to.equal(campaignData.campaign_medium);
            expect(userRow.campaign_term).to.equal(campaignData.campaign_term);
            expect(userRow.campaign_content).to.equal(campaignData.campaign_content);
            expect(userRow.campaign_name).to.equal(campaignData.campaign_name);
            expect(userRow.referrer).to.equal(campaignData.referrer);
          });
      });
    });
  });

  describe('updateDaysSeen()', () => {
    let registeredMoment;
    let daysSeenUserId;
    before(() => {
      const rando = generatePushId();
      const email = `${rando}-unit-test@duelyst.local`;
      const username = `${rando.toLowerCase()}-unit-test`;
      return UsersModule.createNewUser(email, username, 'hash', 'kumite14')
        .then((userIdCreated) => {
          daysSeenUserId = userIdCreated;
          return knex('users').where('id', daysSeenUserId).first();
        }).then((userRow) => {
          registeredMoment = moment.utc(userRow.created_at);
        });
    });

    it('expect days seen to be empty when user is seen day of registration', () => UsersModule.updateDaysSeen(daysSeenUserId, registeredMoment)
      .then(() => knex('users').where('id', daysSeenUserId).first()).then((userRow) => {
        expect(userRow.seen_on_days).to.not.exist;
      }));

    it('expect days seen to have recorded day 1 when user is seen 1 day after registration', () => UsersModule.updateDaysSeen(daysSeenUserId, registeredMoment.clone().add(1, 'days'))
      .then(() => knex('users').where('id', daysSeenUserId).first()).then((userRow) => {
        expect(userRow.seen_on_days).to.exist;
        expect(_.contains(userRow.seen_on_days, 1)).to.equal(true);
        expect(userRow.seen_on_days.length).to.equal(1);
      }));

    it('expect days seen to not have recorded day 2 when user is seen 2 days after registration', () => UsersModule.updateDaysSeen(daysSeenUserId, registeredMoment.clone().add(2, 'days'))
      .then(() => knex('users').where('id', daysSeenUserId).first()).then((userRow) => {
        expect(userRow.seen_on_days).to.exist;
        expect(_.contains(userRow.seen_on_days, 2)).to.equal(false);
        expect(userRow.seen_on_days.length).to.equal(1);
      }));

    it('expect days seen to have recorded day 3 when user is seen 3 days after registration', () => UsersModule.updateDaysSeen(daysSeenUserId, registeredMoment.clone().add(3, 'days'))
      .then(() => knex('users').where('id', daysSeenUserId).first()).then((userRow) => {
        expect(userRow.seen_on_days).to.exist;
        expect(_.contains(userRow.seen_on_days, 3)).to.equal(true);
        expect(userRow.seen_on_days.length).to.equal(2);
      }));
  });

  describe('userIdForUsername()', () => {
    it('expect a user id if user exists', () => UsersModule.userIdForUsername('unittest')
      .then((id) => {
        expect(id).to.exist;
        expect(id).to.have.length(20);
      }));

    it('expect null if the username does not exist', () => UsersModule.userIdForUsername('thisusername_doesnotexist')
      .then((id) => {
        expect(id).to.be.equal(null);
      }));
  });

  describe('setPortraitId()', () => {
    it('expect to be able to set a portrait id', () => UsersModule.setPortraitId(userId, SDK.CosmeticsLookup.ProfileIcon.Tree)
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
      ]))
      .spread((userRow, userSnapshot) => {
        expect(userRow.portrait_id).to.equal(SDK.CosmeticsLookup.ProfileIcon.Tree);
        expect(userSnapshot.val().presence.portrait_id).to.equal(SDK.CosmeticsLookup.ProfileIcon.Tree);
      }));

    it('expect NOT to be able to set a portrait id you dont own', () => UsersModule.setPortraitId(userId, SDK.CosmeticsLookup.ProfileIcon.vanar_arcticdisplacer)
      .then((response) => {
        // should never hit this
        expect(response).to.not.exist;
      })
      .catch((error) => {
        // Logger.module("UNITTEST").log(error)
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));
  });

  describe('setBattleMapId()', () => {
    it('expect to be able to set a battle map id', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, SDK.CosmeticsLookup.BattleMap.Magmar, 'unit test', generatePushId()))
        .then(() => UsersModule.setBattleMapId(userId, SDK.CosmeticsLookup.BattleMap.Magmar))
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex('users').where('id', userId).first(),
          FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
        ]))
        .spread((userRow, userSnapshot) => {
          expect(userRow.battle_map_id).to.equal(SDK.CosmeticsLookup.BattleMap.Magmar);
          expect(userSnapshot.val().battle_map_id).to.equal(SDK.CosmeticsLookup.BattleMap.Magmar);
        });

      return txPromise;
    });

    it('expect NOT to be able to set a battle map id you dont own', () => UsersModule.setPortraitId(userId, SDK.CosmeticsLookup.BattleMap.Redrock)
      .then((response) => {
        // should never hit this
        expect(response).to.not.exist;
      })
      .catch((error) => {
        // Logger.module("UNITTEST").log(error)
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect to be able to CLEAR your selected battle map', () => UsersModule.setBattleMapId(userId, null)
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
      ]))
      .spread((userRow, userSnapshot) => {
        expect(userRow.battle_map_id).to.equal(null);
        expect(userSnapshot.val().battle_map_id).to.equal(undefined);
      }));
  });

  // describe("setCardBackId()", function() {
  //
  //   it('expect to be able to set a card back id', function() {
  //     return UsersModule.setCardBackId(userId, SDK.CosmeticsLookup.CardBack.Normal)
  //     .then(function(){
  //       return DuelystFirebase.connect().getRootRef()
  //     })
  //     .then(function(rootRef){
  //       return Promise.all([
  //         knex("users").where('id',userId).first(),
  //         FirebasePromises.once(rootRef.child("users").child(userId),"value"),
  //       ])
  //     })
  //     .spread(function(userRow,userSnapshot){
  //       expect(userRow.card_back_id).to.equal(SDK.CosmeticsLookup.CardBack.Normal)
  //       expect(userSnapshot.val().presence.card_back_id).to.equal(SDK.CosmeticsLookup.CardBack.Normal)
  //     });
  //   });
  //
  //   it('expect NOT to be able to set a card back id you dont own', function() {
  //     return UsersModule.setCardBackId(userId, SDK.CosmeticsLookup.CardBack.Test)
  //     .then(function(){
  //       // should never hit this
  //       expect(false).to.equal(true);
  //     })
  //     .catch(function(error){
  //       expect(error).to.exist;
  //       expect(error).to.be.an.instanceof(Errors.NotFoundError);
  //     });
  //   });
  //
  // });

  // describe("createUserReferralCode()", function() {
  //
  //   it('expect NOT to be able to create an invalid (#%^$%#) referral code', function() {
  //     return UsersModule.createUserReferralCode(userId,'4#$^634')
  //     .then(function(response){
  //       expect(response).to.not.exist
  //     })
  //     .catch(function(error){
  //       expect(error).to.exist
  //       expect(error).to.be.an.instanceof(Errors.InvalidReferralCodeError)
  //     })
  //   })
  //
  //   it('expect to be able to create a referral code', function() {
  //     return UsersModule.createUserReferralCode(userId,'unittestercode')
  //     .then(function(response){
  //       expect(response).to.exist
  //       return DuelystFirebase.connect().getRootRef()
  //     }).then(function(rootRef){
  //       return Promise.all([
  //         knex("referral_codes").where('code','unittestercode').first()
  //       ])
  //     }).spread(function(referralCodeRow,userSnapshot,indexSnapshot,walletSnapshot){
  //       expect(referralCodeRow).to.exist
  //       expect(referralCodeRow.user_id).to.equal(userId)
  //     })
  //   })
  //
  //   it('expect to NOT be able to create a referral code if you already have one', function() {
  //     return UsersModule.createUserReferralCode(userId,'unittestercode2')
  //     .then(function(response){
  //       expect(response).to.not.exist
  //     }).catch(function(error){
  //       expect(error).to.exist;
  //       expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
  //     })
  //   })
  //
  // })

  describe('changeUsername()', () => {
    // // after cleanup
    // after(function(){
    //   return UsersModule.changeUsername(userId,'unittest')
    // });

    it('expect NOT to be able to change to an existing username', () => UsersModule.changeUsername(userId, 'unittest')
      .then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.AlreadyExistsError);
      }));

    it('expect to be able to change to an another username first time for FREE', () => UsersModule.changeUsername(userId, 'unittest_2')
      .then((response) => {
        expect(response).to.exist;
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
        FirebasePromises.once(rootRef.child('username-index').child('unittest_2'), 'value'),
      ])).spread((userRow, userSnapshot, indexSnapshot) => {
        expect(userRow.username).to.equal('unittest_2');
        expect(userSnapshot.val().username).to.equal('unittest_2');
        expect(indexSnapshot.val()).to.equal(userId);
      }));

    it('expect to NOT be able to change again in the same month', () => UsersModule.changeUsername(userId, 'unittest_3')
      .then((response) => {
        expect(response).to.not.exist;
      }).catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.InvalidRequestError);
      }));

    it('expect to NOT be able to change again a month later with insufficient (0) gold', () => {
      const systemTime = moment().utc().add(1, 'month').add(1, 'day');
      return UsersModule.changeUsername(userId, 'unittest_3', false, systemTime)
        .then((response) => {
          expect(response).to.not.exist;
        }).catch((error) => {
          expect(error).to.exist;
          Logger.module('UNITTEST').log(error);
          expect(error).to.be.an.instanceof(Errors.InsufficientFundsError);
        });
    });

    it('expect to be able to change again a month later by spending 100 GOLD', () => {
      const systemTime = moment().utc().add(1, 'month').add(1, 'day');
      return knex.transaction((tx) => InventoryModule.giveUserGold(null, tx, userId, 100)).then(() => UsersModule.changeUsername(userId, 'unittest', false, systemTime)).then((response) => {
        expect(response).to.exist;
        return DuelystFirebase.connect().getRootRef();
      }).then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
        FirebasePromises.once(rootRef.child('users').child(userId), 'value'),
        FirebasePromises.once(rootRef.child('username-index').child('unittest'), 'value'),
        FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('wallet'), 'value'),
      ]))
        .spread((userRow, userSnapshot, indexSnapshot, walletSnapshot) => {
          expect(userRow.username).to.equal('unittest');
          expect(userRow.wallet_gold).to.equal(0);
          expect(userSnapshot.val().username).to.equal('unittest');
          expect(indexSnapshot.val()).to.equal(userId);
          expect(walletSnapshot.val().gold_amount).to.equal(0);
        });
    });
  });

  describe('changePassword()', () => {
    // after cleanup
    after(() => UsersModule.changePassword(userId, 'newpass', 'hash'));

    it('expect to FAIL changing password if you don\'t provide correct existing password', () => UsersModule.changePassword(userId, 'wrongpass', 'newpass')
      .then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.BadPasswordError);
      }));

    it('expect to be able to change your password', () => UsersModule.changePassword(userId, 'hash', 'newpass')
      .then((response) => {
        expect(response).exist;
      }).then((rootRef) => Promise.all([
        knex('users').where('id', userId).first(),
      ])).spread((userRow) => {
        expect(userRow.password).to.exist;
      }));
  });

  describe('iterateNewPlayerCoreProgression()', () => {
    it('expect it to iterate from Tutorial (null stage) to TutorialDone', () => UsersModule.iterateNewPlayerCoreProgression(userId)
      .then((response) => {
        expect(response).to.exist;
        expect(response.progressionData.stage).to.equal(SDK.NewPlayerProgressionStageEnum.TutorialDone.key);
        expect(response.questData).to.exist;
      }));

    it('expect to have correct beginner quests for TutorialDone stage', () => knex('user_quests').where('user_id', userId).select()
      .then((questRows) => {
        expect(questRows).to.exist;
        const beginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(SDK.NewPlayerProgressionStageEnum.TutorialDone);
        const beginnerQuestIds = _.map(beginnerQuests, (q) => q.id);
        const questRowIds = _.map(questRows, (q) => q.quest_type_id);
        expect(_.intersection(questRowIds, beginnerQuestIds).length).to.equal(beginnerQuestIds.length);
      }));

    it('expect no change if trying to iterate forward from TutorialDone with unfinished quests', () => UsersModule.iterateNewPlayerCoreProgression(userId)
      .then((response) => {
        expect(response).to.not.exist;
        return Promise.all([
          knex('user_new_player_progression').where('user_id', userId).andWhere('module_name', SDK.NewPlayerProgressionModuleLookup.Core).first(),
          knex('user_quests').where('user_id', userId).select(),
        ]);
      }).spread((moduleRow, questRows) => {
        expect(moduleRow.stage).to.equal(SDK.NewPlayerProgressionStageEnum.TutorialDone.key);
        expect(questRows.length).to.equal(1);
      }));

    it('expect to move from TutorialDone to FirstPracticeDuelDone if the first quest is complete', () => {
      const gs = SDK.GameSession.create();
      gs.setGameType(SDK.GameType.SinglePlayer);
      SDK.GameSetup.setupNewSession(
        gs,
        {
          userId,
          name: 'user1',
          deck: SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1),
        },
        {
          userId: generatePushId(),
          name: 'user2',
          deck: SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1),
        },
      );
      gs.setIsRunningAsAuthoritative(true);
      gs.executeAction(gs.players[1].actionResign());

      return QuestsModule.updateQuestProgressWithGame(userId, generatePushId(), gs)
        .then((result) => UsersModule.iterateNewPlayerCoreProgression(userId)).then((response) => {
          expect(response).to.exist;
          return Promise.all([
            knex('user_new_player_progression').where('user_id', userId).andWhere('module_name', SDK.NewPlayerProgressionModuleLookup.Core).first(),
            knex('user_quests').where('user_id', userId).select(),
          ]);
        }).spread((moduleRow, questRows) => {
          expect(moduleRow.stage).to.equal(SDK.NewPlayerProgressionStageEnum.FirstPracticeDuelDone.key);
          expect(questRows.length).to.equal(1);
        });
    });

    it('expect to not change stage but re-generate FirstPracticeDuelDone quests if any are missing for some reason', () => knex('user_quests').where('user_id', userId).delete()
      .then(() => UsersModule.iterateNewPlayerCoreProgression(userId))
      .then((response) => {
        expect(response).to.exist;
        return Promise.all([
          knex('user_new_player_progression').where('user_id', userId).andWhere('module_name', SDK.NewPlayerProgressionModuleLookup.Core).first(),
          knex('user_quests').where('user_id', userId).select(),
        ]);
      })
      .spread((moduleRow, questRows) => {
        expect(moduleRow.stage).to.equal(SDK.NewPlayerProgressionStageEnum.FirstPracticeDuelDone.key);
        expect(questRows.length).to.equal(1);
      }));
    // it('expect to moving to FirstGameDone state to generate 2 begginer quests',function(){
    //
    // })

    // it('expect it to iterate from Tutorial (null stage) to TutorialDone', function() {
    //   return UsersModule.iterateNewPlayerCoreProgression(userId)
    //   .then(function(response){
    //     expect(response).to.not.exist;
    //   })
    //   .catch(function(error){
    //     expect(error).to.exist;
    //     expect(error).to.be.an.instanceof(Errors.BadPasswordError);
    //   })
    // })
  });

  describe('updateGameCounters()', () => {
    // it('expect LYONAR RANKED game counter to work', function() {
    //   return UsersModule.updateGameCounters(userId,SDK.Factions.Lyonar,true,"ranked")
    //   .bind({})
    //   .then(function(){
    //     return DuelystFirebase.connect().getRootRef()
    //   })
    //   .then(function(rootRef){
    //     return Promise.all([
    //       knex("user_game_counters").where({"user_id",userId,"game_type":"ranked"}).first(),
    //       knex("user_faction_game_counters").where({"user_id":userId,"game_type":"ranked","faction_id":SDK.Factions.Lyonar}).first(),
    //       FirebasePromises.once(rootRef.child("user-game-counters").child(userId).child("ranked").child('stats'),"value"),
    //       FirebasePromises.once(rootRef.child("user-game-counters").child(userId).child("ranked").child('factions').child(SDK.Factions.Lyonar),"value"),
    //     ])
    //   }).spread(function(counterRow,factionCounterRow,counterSnapshot,factionCounterSnapshot){
    //     expect(counterRow.game_count).to.equal(1);
    //     expect(counterRow.win_count).to.equal(1);

    //     expect(factionCounterRow.game_count).to.equal(1);
    //     expect(factionCounterRow.win_count).to.equal(1);

    //     expect(counterSnapshot.val().game_count).to.equal(1);
    //     expect(counterSnapshot.val().win_count).to.equal(1);

    //     expect(factionCounterSnapshot.val().game_count).to.equal(1);
    //     expect(factionCounterSnapshot.val().win_count).to.equal(1);
    //   });
    // });

    it('expect all game counters to work', () => Promise.map([
      // lyonar
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'ranked'],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, false, 'ranked', false, true], // ranked draw
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'ranked'],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, false, 'ranked'],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'ranked'],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.AltGeneral, true, 'casual'],
      // songhai
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, true, 'casual'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, true, 'casual'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, true, 'ranked'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, true, 'ranked'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, false, 'casual'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, false, 'casual'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, false, 'casual'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, true, 'ranked'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, true, 'ranked'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.General, false, 'ranked'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.AltGeneral, false, 'ranked'],
      [userId, SDK.Factions.Songhai, SDK.Cards.Faction2.AltGeneral, true, 'ranked'],
      // lyonar friendly
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'friendly', false, false, false, moment().utc().add(1, 'month')],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'friendly', false, false, false, moment().utc().add(1, 'month')],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'friendly', false, false, false, moment().utc().add(1, 'month')],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, false, 'friendly', false, false, false, moment().utc().add(1, 'month')],
      [userId, SDK.Factions.Lyonar, SDK.Cards.Faction1.General, true, 'friendly', false, false, false, moment().utc().add(1, 'month')],
    ], (input) => UsersModule.updateGameCounters.apply(null, input))
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_game_counters').where({ user_id: userId }).select(),
        knex('user_game_faction_counters').where({ user_id: userId }).select(),
        knex('user_game_general_counters').where({ user_id: userId }).select(),
        knex('user_game_season_counters').where({ user_id: userId }).select(),
        FirebasePromises.once(rootRef.child('user-game-counters').child(userId), 'value'),
        FirebasePromises.once(rootRef.child('user-game-counters').child(userId), 'value'),
      ]))
      .spread((counterRows, factionCounterRows, generalCounterRows, seasonCounterRows, counterSnapshot, factionCounterSnapshot) => {
        const rankedCounter = _.find(counterRows, (row) => row.game_type === 'ranked');
        const lyonarRankedFactionCounter = _.find(factionCounterRows, (row) => row.faction_id === SDK.Factions.Lyonar && row.game_type === 'ranked');
        const songhaiRankedFactionCounter = _.find(factionCounterRows, (row) => row.faction_id === SDK.Factions.Songhai && row.game_type === 'ranked');
        const lyonarCasualAltGeneralCounter = _.find(generalCounterRows, (row) => row.general_id === SDK.Cards.Faction1.AltGeneral && row.game_type === 'casual');
        const songhaiRankedAltGeneralCounter = _.find(generalCounterRows, (row) => row.general_id === SDK.Cards.Faction2.AltGeneral && row.game_type === 'ranked');
        const lyonarFriendlyFactionCounter = _.find(factionCounterRows, (row) => row.faction_id === SDK.Factions.Lyonar && row.game_type === 'friendly');
        const songhaiFriendlyFactionCounter = _.find(factionCounterRows, (row) => row.faction_id === SDK.Factions.Songhai && row.game_type === 'friendly');

        expect(rankedCounter.game_count).to.equal(12);
        expect(rankedCounter.win_count).to.equal(8);
        expect(rankedCounter.loss_count).to.equal(3);
        expect(rankedCounter.draw_count).to.equal(1);

        expect(lyonarRankedFactionCounter.game_count).to.equal(5);
        expect(lyonarRankedFactionCounter.win_count).to.equal(3);
        expect(lyonarRankedFactionCounter.win_streak).to.equal(1);
        expect(lyonarRankedFactionCounter.top_win_streak).to.equal(2);
        expect(lyonarRankedFactionCounter.draw_count).to.equal(1);

        expect(songhaiRankedFactionCounter.game_count).to.equal(7);
        expect(songhaiRankedFactionCounter.win_count).to.equal(5);
        expect(songhaiRankedFactionCounter.win_streak).to.equal(1);
        expect(songhaiRankedFactionCounter.top_win_streak).to.equal(4);
        expect(songhaiRankedFactionCounter.loss_count).to.equal(2);
        expect(songhaiRankedFactionCounter.loss_streak).to.equal(0);
        expect(songhaiRankedFactionCounter.top_loss_streak).to.equal(2);

        expect(lyonarCasualAltGeneralCounter.game_count).to.equal(1);
        expect(lyonarCasualAltGeneralCounter.win_count).to.equal(1);

        expect(songhaiRankedAltGeneralCounter.game_count).to.equal(2);
        expect(songhaiRankedAltGeneralCounter.win_count).to.equal(1);

        expect(lyonarFriendlyFactionCounter.game_count).to.equal(5);
        expect(lyonarFriendlyFactionCounter.win_count).to.equal(4);
        expect(lyonarFriendlyFactionCounter.top_win_streak).to.equal(3);

        expect(seasonCounterRows.length).to.equal(3);

        // currently nothing gets written to firebase
        // expect(counterSnapshot.val()["ranked"]["stats"].game_count).to.equal(11);
        // expect(counterSnapshot.val()["ranked"]["stats"].win_count).to.equal(8);
        // expect(counterSnapshot.val()["ranked"]["factions"][SDK.Factions.Lyonar].game_count).to.equal(4);
        // expect(counterSnapshot.val()["ranked"]["factions"][SDK.Factions.Lyonar].win_count).to.equal(3);
        // expect(counterSnapshot.val()["ranked"]["factions"][SDK.Factions.Lyonar].top_win_streak).to.equal(2);
      }));
  });

  describe('updateUserProgressionWithGameOutcome()', () => {
    let lastProgressionRow;

    let currentWinRewardCount = 0;
    let currentPlayRewardCount = 0;
    let currentDailyWinRewardCount = 0;
    let walletGoldSoFar = 0;
    let lastDailyWinAt = null;
    let gameCount = 0;

    it('expect game counter to work', () => {
      const gameId = generatePushId();
      return UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, gameId)
        .bind({})
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex('user_progression').where('user_id', userId).first(),
          FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
          FirebasePromises.once(rootRef.child('user-games').child(userId).child(gameId).child('job_status'), 'value'),
        ]))
        .spread((progressionRow, progressionSnapshot, firebaseGameJobStatusSnapshot) => {
          expect(progressionRow.game_count).to.equal(1);
          expect(progressionRow.loss_count).to.equal(1);
          expect(progressionRow.loss_streak).to.equal(1);

          expect(progressionSnapshot.val().game_count).to.equal(1);
          expect(progressionSnapshot.val().loss_count).to.equal(1);

          lastProgressionRow = progressionRow;
          expect(firebaseGameJobStatusSnapshot.val().progression).to.equal(true);
        });
    });

    it('expect unscored games to record correctly', () => Promise.all([
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', true),
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', true),
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', true),
    ])
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        // unchanged game count
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count);
        // unchanged loss count
        expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count);
        // unchanged loss streak
        expect(progressionRow.loss_streak).to.equal(lastProgressionRow.loss_streak);
        // 3 more unscored games
        expect(progressionRow.unscored_count).to.equal(lastProgressionRow.unscored_count + 3);

        expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
        expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
        expect(progressionSnapshot.val().unscored_count).to.equal(progressionRow.unscored_count);

        lastProgressionRow = progressionRow;
      }));

    it('expect draws to record correctly and not progress rewards counters', () => Promise.all([
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', false, true),
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', false, true),
    ])
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 2);
        expect(progressionRow.draw_count).to.equal(lastProgressionRow.draw_count + 2);
        expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count);
        expect(progressionRow.loss_streak).to.equal(lastProgressionRow.loss_streak);

        expect(progressionSnapshot.val().draw_count).to.equal(progressionRow.draw_count);
        lastProgressionRow = progressionRow;
      }));

    // it('expect that unscored games did not earn a PLAY reward', function() {

    //   return knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).select()
    //   .then(function(rewardRows){
    //     expect(rewardRows.length).to.equal(0);
    //   });
    // });

    it('expect that 2 scored daily plays (losses) record correctly and iterate loss streaks', () => Promise.all([
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', false),
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', false),
    ])
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 2);
        expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count + 2);
        expect(progressionRow.loss_streak).to.equal(progressionRow.loss_count);
        expect(progressionRow.unscored_count).to.equal(lastProgressionRow.unscored_count);

        expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
        expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
        expect(progressionSnapshot.val().unscored_count).to.equal(progressionRow.unscored_count);

        lastProgressionRow = progressionRow;
      }));

    // it('expect a first 3 games 100G reward', function() {
    //   Promise.all([
    //     knex("user_rewards").where({"user_id":userId,"reward_type":"first 3 games"}).first(),
    //     knex("users").where('id',userId).first()
    //   ])
    //   .bind({})
    //   .spread(function(rewardRow,userRow){
    //     expect(rewardRow).to.exist;
    //     expect(userRow.wallet_gold).to.equal(rewardRow.gold);
    //     this.rewardId = rewardRow.id;
    //     walletGoldSoFar = userRow.wallet_gold;
    //     return DuelystFirebase.connect().getRootRef()
    //   }).then(function(rootRef){
    //     return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //   }).then(function(rewardSnapshot){
    //     expect(rewardSnapshot.val()).to.not.exist;
    //     expect(rewardSnapshot.val().is_unread).to.equal(true);
    //   });
    // });

    // it('expect a gold reward for 4 daily plays', function() {

    //   return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false)
    //   .bind({})
    //   .then(function(){
    //     return Promise.all([
    //       knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).first(),
    //       knex("users").where('id',userId).first()
    //     ])
    //   }).spread(function(rewardRow,userRow){
    //     expect(rewardRow).to.exist;
    //     expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
    //     this.rewardId = rewardRow.id;
    //     walletGoldSoFar = userRow.wallet_gold;
    //     return DuelystFirebase.connect().getRootRef()
    //   }).then(function(rootRef){
    //     return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //   }).then(function(rewardSnapshot){
    //     expect(rewardSnapshot.val()).to.not.exist;
    //     expect(rewardSnapshot.val().is_unread).to.equal(true);
    //     currentPlayRewardCount += 1;
    //   });
    // });

    it('expect a reward for the first win of the day and loss streak to reset to 0', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => Promise.all([
        knex('user_rewards').where({ user_id: userId, reward_type: 'daily win' }).first(),
        knex('users').where('id', userId).first(),
      ])).spread(function (rewardRow, userRow) {
        expect(rewardRow).to.exist;
        expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
        this.rewardId = rewardRow.id;
        walletGoldSoFar = userRow.wallet_gold;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex('user_progression').where('user_id', userId).first(),
          FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
          FirebasePromises.once(rootRef.child('user-rewards').child(userId).child(this.rewardId), 'value'),
        ]);
      })
      .spread((progressionRow, progressionSnapshot, rewardSnapshot) => {
        expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count + 1);
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1);
        expect(progressionRow.loss_streak).to.equal(0);
        expect(progressionRow.last_daily_win_at.valueOf()).to.not.equal(lastDailyWinAt);

        expect(progressionSnapshot.val().win_count).to.equal(lastProgressionRow.win_count + 1);
        expect(progressionSnapshot.val().game_count).to.equal(lastProgressionRow.game_count + 1);
        expect(rewardSnapshot.val()).to.not.exist;
        // expect(rewardSnapshot.val().is_unread).to.equal(true);

        lastDailyWinAt = progressionRow.last_daily_win_at.valueOf();
        lastProgressionRow = progressionRow;
        currentDailyWinRewardCount += 1;
      }));

    it('expect win streaks to count up for wins', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionSnapshot.val().win_count).to.equal(lastProgressionRow.win_count + 1);
        expect(progressionSnapshot.val().win_streak).to.equal(2);
        expect(progressionSnapshot.val().game_count).to.equal(lastProgressionRow.game_count + 1);
        lastProgressionRow = progressionRow;
      }));

    it('expect win streaks to be unaffected by draws', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false, true)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionSnapshot.val().draw_count).to.equal(lastProgressionRow.draw_count + 1);
        expect(progressionSnapshot.val().win_count).to.equal(lastProgressionRow.win_count);
        expect(progressionSnapshot.val().win_streak).to.equal(2);
        expect(progressionSnapshot.val().game_count).to.equal(lastProgressionRow.game_count + 1);
        lastProgressionRow = progressionRow;
      }));

    it('expect to have received a gold reward for 3 wins', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false)).then(() => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        knex('user_rewards').where({ user_id: userId, reward_type: 'win count' }).first(),
        knex('users').where('id', userId).first(),
      ]))
      .spread(function (progressionRow, rewardRow, userRow) {
        expect(rewardRow).to.exist;
        expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
        this.rewardId = rewardRow.id;
        walletGoldSoFar = userRow.wallet_gold;
        currentWinRewardCount += 1;
        lastProgressionRow = progressionRow;
        return DuelystFirebase.connect().getRootRef();
      }));

    it('expect only one first win of the day reward', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        knex('user_rewards').where({ user_id: userId, reward_type: 'daily win' }).select(),
        knex('users').where('id', userId).first(),
      ])).spread((progressionRow, rewardRows, userRow) => {
        expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count + 1);
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1);
        expect(rewardRows.length).to.equal(1);
        expect(userRow.wallet_gold).to.equal(walletGoldSoFar);
        expect(progressionRow.last_daily_win_at.valueOf()).to.equal(lastDailyWinAt);
        lastProgressionRow = progressionRow;
      }));

    it('expect casual game losses to not affect win streaks but bump loss streaks', () => Promise.all([
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'casual', false),
    ])
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1);
        expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count);
        expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count + 1);
        expect(progressionRow.loss_streak).to.equal(1);
        expect(progressionRow.win_streak).to.equal(lastProgressionRow.win_streak);

        expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
        expect(progressionSnapshot.val().win_count).to.equal(progressionRow.win_count);
        expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
        expect(progressionSnapshot.val().win_streak).to.equal(progressionRow.win_streak);

        lastProgressionRow = progressionRow;
      }));

    it('expect win streaks to reset with losses', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count);
        expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count + 1);
        expect(progressionRow.win_streak).to.equal(0);
        expect(progressionRow.loss_streak).to.equal(2);
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1);

        expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
        expect(progressionSnapshot.val().win_count).to.equal(progressionRow.win_count);
        expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
        expect(progressionSnapshot.val().win_streak).to.equal(progressionRow.win_streak);

        gameCount = progressionSnapshot.val().game_count;
        lastProgressionRow = progressionRow;
      }));

    // it('expect that 8 daily plays have earned TWO play count rewards', function() {

    //   return Promise.all([
    //     knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
    //     knex("users").where('id',userId).first()
    //   ])
    //   .bind({})
    //   .spread(function(rewardRows,userRow){
    //     expect(rewardRows.length).to.equal(2);
    //     expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
    //     this.rewardId = rewardRows[0].id;
    //     walletGoldSoFar = userRow.wallet_gold;
    //     return DuelystFirebase.connect().getRootRef()
    //   }).then(function(rootRef){
    //     return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //   }).then(function(rewardSnapshot){
    //     expect(rewardSnapshot.val()).to.not.exist;
    //     expect(rewardSnapshot.val().is_unread).to.equal(true);
    //     currentPlayRewardCount += 1;
    //   });
    // });

    // it('expect that 4 daily wins have earned TWO win count rewards', function() {
    //  return UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false)
    //  .bind({})
    //  .then(function(){
    //    return Promise.all([
    //      knex("user_progression").where("user_id",userId).first(),
    //      knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).orderBy('created_at','desc').select(),
    //      knex("users").where('id',userId).first()
    //    ])
    //  }).spread(function(progressionRow,rewardRows,userRow){
    //    expect(rewardRows.length).to.equal(2);
    //    expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
    //    this.rewardId = rewardRows[0].id;
    //    walletGoldSoFar = userRow.wallet_gold;
    //
    //    lastProgressionRow = progressionRow
    //
    //    return DuelystFirebase.connect().getRootRef()
    //  }).then(function(rootRef){
    //    return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //  }).then(function(rewardSnapshot){
    //    expect(rewardSnapshot.val()).to.not.exist;
    //    // expect(rewardSnapshot.val().is_unread).to.equal(true);
    //    currentWinRewardCount += 1;
    //  });
    // });

    // it('expect to have recieve a first 10 games 100 GOLD reward', function() {

    //   const allPromises = [];
    //   if (gameCount < 10) {
    //     for (var i=gameCount; i<10; i++) {
    //       allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false))
    //     }
    //     gameCount = 10;
    //   }

    //   return Promise.all(allPromises)
    //   .bind({})
    //   .then(function(){
    //     return Promise.all([
    //       knex("user_rewards").where({"user_id":userId,"reward_type":"first 10 games"}).first(),
    //       knex("users").where('id',userId).first()
    //     ])
    //   }).spread(function(rewardRow,userRow){
    //     expect(rewardRow).to.exist;
    //     expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRow.gold);
    //     this.rewardId = rewardRow.id;
    //     walletGoldSoFar = userRow.wallet_gold;
    //     return DuelystFirebase.connect().getRootRef()
    //   }).then(function(rootRef){
    //     return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //   }).then(function(rewardSnapshot){
    //     expect(rewardSnapshot.val()).to.not.exist;
    //     expect(rewardSnapshot.val().is_unread).to.equal(true);
    //   });
    // });

    // it('expect a maximum of 5 daily play gold reward', function() {

    //   // get up to 24 games
    //   const allPromises = [];
    //   if (gameCount < 24) {
    //     for (var i=gameCount; i<24; i++) {
    //       allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false))
    //     }
    //     gameCount = 24;
    //   }

    //   //
    //   UsersModule.DAILY_REWARD_GAME_CAP = 20;

    //   return Promise.all(allPromises)
    //   .bind({})
    //   .then(function(){
    //     return Promise.all([
    //       knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
    //       knex("users").where('id',userId).first()
    //     ])
    //   }).spread(function(rewardRows,userRow){
    //     expect(rewardRows.length).to.equal(5);
    //     expect(userRow.wallet_gold - walletGoldSoFar).to.equal(3*rewardRows[0].gold);
    //     this.rewardId = rewardRows[0].id;
    //     walletGoldSoFar = userRow.wallet_gold;
    //     currentPlayRewardCount = rewardRows.length;
    //     return DuelystFirebase.connect().getRootRef()
    //   });
    // });

    // it('expect games after the daily play reward max to reset last reward game/time', function() {

    //   return knex("user_progression").where("user_id",userId).first()
    //   .bind({})
    //   .then(function(progressionRow){
    //     this.last_awarded_game_count = progressionRow.last_awarded_game_count;
    //     return UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false);
    //   }).then(function(){
    //     return knex("user_progression").where("user_id",userId).first()
    //   }).then(function(progressionRow){
    //     expect(progressionRow.last_awarded_game_count).to.equal(this.last_awarded_game_count+1);
    //   });
    // });

    it('expect first win of the day reward to require 22 hours and not just midnight rollover', () => {
      const systemTime = moment().utc().add(21, 'hours');

      return UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false, false, systemTime)
        .then(() => Promise.all([
          knex('user_progression').where('user_id', userId).first(),
          knex('user_rewards').where({ user_id: userId, reward_type: 'daily win' }).select(),
          knex('users').where('id', userId).first(),
        ])).spread((progressionRow, rewardRows, userRow) => {
          expect(rewardRows.length).to.equal(1);
          expect(userRow.wallet_gold).to.equal(walletGoldSoFar);
          expect(progressionRow.last_daily_win_at.valueOf()).to.equal(lastDailyWinAt);
          lastProgressionRow = progressionRow;
        });
    });

    it('expect that 6 daily wins have earned TWO win count rewards', () => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false, false)).then(() => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        knex('user_rewards').where({ user_id: userId, reward_type: 'win count' }).orderBy('created_at', 'desc').select(),
        knex('users').where('id', userId).first(),
      ]))
      .spread(function (progressionRow, rewardRows, userRow) {
        expect(rewardRows.length).to.equal(2);
        expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
        this.rewardId = rewardRows[0].id;
        walletGoldSoFar = userRow.wallet_gold;
        currentWinRewardCount += 1;
        lastProgressionRow = progressionRow;
      }));

    it('expect first win of the day reward to re-activate after 22 hours', () => {
      const systemTime = moment().utc().add(22, 'hours');

      return UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false, false, systemTime)
        .then(() => Promise.all([
          knex('user_progression').where('user_id', userId).first(),
          knex('user_rewards').where({ user_id: userId, reward_type: 'daily win' }).orderBy('created_at', 'desc').select(),
          knex('users').where('id', userId).first(),
        ])).spread(function (progressionRow, rewardRows, userRow) {
          expect(rewardRows.length).to.equal(2);
          expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
          expect(progressionRow.last_daily_win_at.valueOf()).to.not.equal(lastDailyWinAt);
          lastDailyWinAt = progressionRow.last_daily_win_at.valueOf();
          currentDailyWinRewardCount = rewardRows.length;
          this.rewardId = rewardRows[0].id;
          walletGoldSoFar = userRow.wallet_gold;
          lastProgressionRow = progressionRow;
        });
    });

    it('expect win counter rewards to restart after UTC midnight', () => {
      const systemTime = moment().utc().startOf('day').add(24, 'hours')
        .add(1, 'second');

      return knex('user_progression').where('user_id', userId).first()
        .bind({})
        .then((progressionRow) => {
          const winsSoFarToday = progressionRow.win_count - progressionRow.last_awarded_win_count;
          gameCount = progressionRow.game_count;
          const allPromises = [];
          for (let i = winsSoFarToday; i < 3; i++) {
            allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'ranked', false, false, systemTime));
            gameCount += 1;
          }
          return Promise.all(allPromises);
        })
        .then(() => Promise.all([
          knex('user_progression').where('user_id', userId).first(),
          knex('user_rewards').where({ user_id: userId, reward_type: 'win count' }).orderBy('created_at', 'desc').select(),
          knex('users').where('id', userId).first(),
        ]))
        .spread(function (progressionRow, rewardRows, userRow) {
          expect(rewardRows.length).to.equal(3);
          expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
          this.rewardId = rewardRows[0].id;
          walletGoldSoFar = userRow.wallet_gold;
          currentPlayRewardCount = rewardRows.length;
          lastProgressionRow = progressionRow;
        });
    });

    // it('expect win counter rewards to give 15 gold for first 14 wins and 5 gold after', function() {
    //
    //
    //  const systemTime = moment().utc().startOf("day").add(48,'hours').add(2,'second');
    //  const queryTime = moment().utc().startOf("day").add(48,'hours').add(1,'second');
    //
    //  return knex("user_progression").where("user_id",userId).first()
    //  .bind({})
    //  .then(function(progressionRow){
    //
    //    gameCount = progressionRow.game_count;
    //    const extraGame = 0; // progressionRow.win_count % 2;
    //    const allPromises = [];
    //    for (var i=0; i<20 - extraGame; i++) {
    //      const time = moment(systemTime).add(i,'seconds');
    //      allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, true, generatePushId(), 'ranked', false, false, time))
    //      gameCount += 1;
    //    }
    //    return Promise.all(allPromises)
    //
    //  }).then(function(){
    //    return Promise.all([
    //      knex("user_progression").where("user_id",userId).first(),
    //      knex("user_rewards").where({"user_id":userId,"reward_type":"win count"}).andWhere('created_at','>',queryTime.toDate()).orderBy('created_at','asc').select(),
    //      knex("users").where('id',userId).first()
    //    ])
    //  }).spread(function(progressionRow,rewardRows,userRow){
    //    expect(rewardRows.length).to.equal(10);
    //    for (var i=0; i<7; i++) {
    //      expect(rewardRows[i].gold).to.equal(15);
    //    }
    //    for (var i=7; i<rewardRows.length; i++) {
    //      expect(rewardRows[i].gold).to.equal(5);
    //    }
    //    lastProgressionRow = progressionRow
    //  })
    // })

    // it('expect play counter rewards to restart after UTC midnight', function() {

    //   const systemTime = moment().utc().startOf("day").add(24,'hours').add(1,'second');

    //   return knex("user_progression").where("user_id",userId).first()
    //   .bind({})
    //   .then(function(progressionRow){

    //     const gamesSoFarToday = progressionRow.game_count - progressionRow.last_awarded_game_count;
    //     gameCount = progressionRow.game_count;
    //     const allPromises = [];
    //     for (var i=gamesSoFarToday; i<4; i++) {
    //       allPromises.push(UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', false, false, systemTime))
    //       gameCount += 1;
    //     }
    //     return Promise.all(allPromises)

    //   }).then(function(){
    //     return Promise.all([
    //       knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
    //       knex("users").where('id',userId).first()
    //     ])
    //   }).spread(function(rewardRows,userRow){
    //     expect(rewardRows.length).to.equal(6);
    //     expect(userRow.wallet_gold - walletGoldSoFar).to.equal(rewardRows[0].gold);
    //     this.rewardId = rewardRows[0].id;
    //     walletGoldSoFar = userRow.wallet_gold;
    //     currentPlayRewardCount = rewardRows.length;
    //     return DuelystFirebase.connect().getRootRef()
    //   }).then(function(rootRef){
    //     return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //   }).then(function(rewardSnapshot){
    //     expect(rewardSnapshot.val()).to.not.exist;
    //     expect(rewardSnapshot.val().is_unread).to.equal(true);
    //   });
    // });

    // it('expect no rewards progression for unscored games', function() {

    //   return Promise.all([
    //     UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
    //     UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
    //     UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true),
    //     UsersModule.updateUserProgressionWithGameOutcome(userId,null, false, generatePushId(), 'ranked', true)
    //   ]).then(function(){
    //     return Promise.all([
    //       knex("user_progression").where("user_id",userId).first(),
    //       knex("user_rewards").where({"user_id":userId,"reward_type":"play count"}).orderBy('created_at','desc').select(),
    //       knex("users").where('id',userId).first()
    //     ])
    //   }).spread(function(progressionRow,rewardRows,userRow){
    //     expect(rewardRows.length).to.equal(currentPlayRewardCount)
    //     expect(userRow.wallet_gold).to.equal(walletGoldSoFar);
    //     expect(progressionRow.unscored_count).to.equal(7);
    //   });
    // });

    it('expect casual game wins to not affect win streaks', () => Promise.all([
      UsersModule.updateUserProgressionWithGameOutcome(userId, null, true, generatePushId(), 'casual', false),
    ])
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-progression').child(userId).child('game-counter'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(lastProgressionRow.game_count + 1);
        expect(progressionRow.win_count).to.equal(lastProgressionRow.win_count + 1);
        expect(progressionRow.loss_count).to.equal(lastProgressionRow.loss_count);
        expect(progressionRow.win_streak).to.equal(lastProgressionRow.win_streak);

        expect(progressionSnapshot.val().game_count).to.equal(progressionRow.game_count);
        expect(progressionSnapshot.val().win_count).to.equal(progressionRow.win_count);
        expect(progressionSnapshot.val().loss_count).to.equal(progressionRow.loss_count);
        expect(progressionSnapshot.val().win_streak).to.equal(progressionRow.win_streak);

        lastProgressionRow = progressionRow;
      }));
  });

  describe('updateUserProgressionWithGameOutcome() - codex reward', () => {
    before(() => DuelystFirebase.connect().getRootRef()
      .bind({})
      .then((fbRootRef) => Promise.all([
        FirebasePromises.remove(fbRootRef.child('user-inventory').child(userId)),
        knex('user_codex_inventory').where('user_id', userId).delete(),
        knex('user_progression').where('user_id', userId).delete(),
        knex('user_rewards').where({ user_id: userId }).delete(),
        knex('user_games').where({ user_id: userId }).delete(),
      ])
        .then(() => {
          const progressionRowData = {
            user_id: userId,
            game_count: 2,
            win_streak: 0,
            loss_count: 0,
            draw_count: 0,
            unscored_count: 0,
          };
          return knex('user_progression').insert(progressionRowData);
        })));

    it('expect to receive a codex chapter from reaching 3 game count', () => {
      const gameId = generatePushId();
      const gameData = {
        game_type: SDK.GameType.Ranked,
        game_id: gameId,
        is_player_1: true,
        opponent_username: 'FakeOpponent',
        opponent_id: generatePushId(),
        opponent_faction_id: SDK.Factions.Lyonar,
        opponent_general_id: SDK.Cards.Faction1.General,
        status: SDK.GameStatus.active,
        faction_id: SDK.Factions.Lyonar,
        general_id: SDK.Cards.Faction1.General,
      };
      return GamesModule.newUserGame(userId, gameId, gameData)
        .bind({})
        .then(() => UsersModule.updateUserProgressionWithGameOutcome(userId, null, false, gameId))
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex('user_codex_inventory').where('user_id', userId).select('chapter_id'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('codex'), 'value'),
          knex('user_rewards').where({ user_id: userId, reward_category: 'codex' }).select(),
          knex('user_games').where({ user_id: userId, game_id: gameId }).first('reward_ids'),
        ]))
        .spread((codexChapterRows, fbCodexCollection, userCodexRewardRows, userGameRow) => {
          expect(codexChapterRows.length).to.equal(1);
          expect(_.keys(fbCodexCollection.val()).length).to.equal(1);
          expect(userCodexRewardRows).to.exist;
          expect(userGameRow).to.exist;
          expect(userCodexRewardRows.length).to.equal(1);

          const userCodexRewardRow = userCodexRewardRows[0];

          // check that the reward row is in game row rewards
          const codexGameReward = _.find(userGameRow.reward_ids, (rewardId) => rewardId === userCodexRewardRow.id);
          expect(codexGameReward).to.exist;
        });
    });
  });

  describe('createFactionProgressionRecord()', () => {
    it('expect a 0 XP Lyonar record when used for Faction 1', () => UsersModule.createFactionProgressionRecord(userId, SDK.Factions.Lyonar, generatePushId(), 'ranked')
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Lyonar }).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(0);
        expect(progressionRow.loss_count).to.equal(0);
        expect(progressionRow.xp).to.equal(0);

        expect(progressionSnapshot.val()).to.exist;
        expect(progressionSnapshot.val().game_count).to.equal(0);
        expect(progressionSnapshot.val().loss_count).to.equal(0);
        expect(progressionSnapshot.val().xp).to.equal(0);
      }));
  });

  describe('updateUserFactionProgressionWithGameOutcome()', () => {
    it('expect stats counter to count games correctly after 1 loss', () => {
      const gameId = generatePushId();
      return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, gameId, 'ranked', false)
        .bind({})
        .then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Lyonar }).first(),
          FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
          FirebasePromises.once(rootRef.child('user-games').child(userId).child(gameId).child('job_status'), 'value'),
        ]))
        .spread((progressionRow, progressionSnapshot, firebaseGameJobStatusSnapshot) => {
          expect(progressionRow.game_count).to.equal(1);
          expect(progressionRow.loss_count).to.equal(1);
          expect(progressionRow.xp).to.equal(SDK.FactionProgression.lossXP);

          expect(progressionSnapshot.val()).to.exist;
          expect(progressionSnapshot.val().game_count).to.equal(1);
          expect(progressionSnapshot.val().loss_count).to.equal(1);
          expect(progressionSnapshot.val().xp).to.equal(SDK.FactionProgression.lossXP);

          expect(firebaseGameJobStatusSnapshot.val().faction_progression).to.equal(true);
        });
    });

    it('expect level 1 after 1 loss', () => DuelystFirebase.connect().getRootRef()
      .bind({})
      .then((rootRef) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(1);
        expect(progressionRow.win_count).to.equal(0);
        expect(progressionRow.xp).to.equal(SDK.FactionProgression.lossXP);
        expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(1);
        expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp, progressionRow.xp_earned)).to.equal(true);

        expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
      }));

    it('expect a basic card reward for level 1', () => Promise.all([
      knex('user_rewards').where({ user_id: userId, reward_category: 'faction xp' }).orderBy('created_at', 'desc').select(),
    ])
      .bind({})
      .spread(function (rewardRows) {
        expect(rewardRows.length).to.equal(1);
        expect(rewardRows[0].cards).to.exist;
        expect(rewardRows[0].cards.length).to.be.above(0);
        this.rewardId = rewardRows[0].id;
        return DuelystFirebase.connect().getRootRef();
      }).then(function (rootRef) {
        return FirebasePromises.once(rootRef.child('user-rewards').child(userId).child(this.rewardId), 'value');
      })
      .then((rewardSnapshot) => {
        expect(rewardSnapshot.val()).to.not.exist;
        // expect(rewardSnapshot.val().cards).to.exist;
        // expect(rewardSnapshot.val().is_unread).to.equal(true);
      }));

    it('expect unscored game counter to work', () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, generatePushId(), 'ranked', true)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Lyonar }).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(1);
        expect(progressionRow.loss_count).to.equal(1);
        expect(progressionRow.unscored_count).to.equal(1);
        expect(progressionRow.xp_earned).to.equal(0);
        expect(progressionRow.xp).to.equal(SDK.FactionProgression.lossXP);

        expect(progressionSnapshot.val()).to.exist;
        expect(progressionSnapshot.val().game_count).to.equal(1);
        expect(progressionSnapshot.val().loss_count).to.equal(1);
        expect(progressionSnapshot.val().unscored_count).to.equal(1);
        expect(progressionSnapshot.val().xp_earned).to.equal(0);
        expect(progressionSnapshot.val().xp).to.equal(SDK.FactionProgression.lossXP);
      }));

    it('expect level 2 and 14 XP after 2 scored losses', () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(2);
        expect(progressionRow.loss_count).to.equal(2);
        expect(progressionRow.win_count).to.equal(0);
        expect(progressionRow.xp).to.equal(2 * SDK.FactionProgression.lossXP);
        expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(2);
        expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp, progressionRow.xp_earned)).to.equal(true);

        expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
      }));

    it('expect level 3 and 24 XP after 2 losses and 1 win', () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(3);
        expect(progressionRow.loss_count).to.equal(2);
        expect(progressionRow.win_count).to.equal(1);
        expect(progressionRow.xp).to.equal(2 * SDK.FactionProgression.lossXP + 1 * SDK.FactionProgression.winXP);
        expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(3);
        expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp, progressionRow.xp_earned)).to.equal(true);

        expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
      }));

    it('expect level 3 and 24 XP after 2 losses and 1 win and 1 more UNSCORED loss', () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', true)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(3);
        expect(progressionRow.unscored_count).to.equal(2);
        expect(progressionRow.xp).to.equal(2 * SDK.FactionProgression.lossXP + 1 * SDK.FactionProgression.winXP);
        expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(3);
        expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp, progressionRow.xp_earned)).to.equal(false);

        expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
      }));

    it('expect level 3 and 31 XP after 3 losses and 1 win', () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, false, generatePushId(), 'ranked', false)
      .bind({})
      .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.game_count).to.equal(4);
        expect(progressionRow.unscored_count).to.equal(2);
        expect(progressionRow.xp).to.equal(3 * SDK.FactionProgression.lossXP + 1 * SDK.FactionProgression.winXP);
        expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(3);
        expect(SDK.FactionProgression.hasLeveledUp(progressionRow.xp, progressionRow.xp_earned)).to.equal(false);

        expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
      }));

    const xpCap = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
    it(`expect max level ${SDK.FactionProgression.maxLevel} to cap at ${xpCap} XP`, () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => {
        const times = [];
        const numWinsNeeded = xpCap / SDK.FactionProgression.winXP;
        for (let i = 0; i < numWinsNeeded; i++) times.push(1);
        return Promise.map(times, () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false), { concurrency: 1 });
      }).then(() => DuelystFirebase.connect().getRootRef())
      .then((rootRef) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).first(),
        FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Lyonar).child('stats'), 'value'),
      ]))
      .spread((progressionRow, progressionSnapshot) => {
        expect(progressionRow.xp).to.equal(xpCap);
        expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(SDK.FactionProgression.maxLevel);
        expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
      }));

    it('expect level 12 and 220 XP after 22 SONGHAI wins', () => {
      const allPromises = [];
      for (let i = 0; i < 22; i++) allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Songhai, true, generatePushId(), 'ranked', false));

      return Promise.all(allPromises)
        .bind({})
        .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
          knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first(),
          FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Songhai).child('stats'), 'value'),
        ]))
        .spread((progressionRow, progressionSnapshot) => {
          expect(progressionRow.game_count).to.equal(22);
          expect(progressionRow.unscored_count).to.equal(0);
          expect(progressionRow.win_count).to.equal(22);
          expect(progressionRow.xp).to.equal(22 * SDK.FactionProgression.winXP);
          expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(12);

          expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
        });
    });

    // it('expect to have received an emote reward for level 12', function() {
    //
    //   return Promise.all([
    //     knex("user_rewards").where({"user_id":userId,"reward_category":"faction xp"}).orderBy('created_at','desc').select(),
    //   ])
    //   .bind({})
    //   .spread(function(rewardRows){
    //     const foundSonghaiEmoteRow = false;
    //     _.each(rewardRows,function(rewardRow) {
    //       if (rewardRow.emotes && rewardRow.emotes[0] == SDK.CosmeticsLookup.Emote.Faction2Taunt) {
    //         foundSonghaiEmoteRow = true;
    //         this.rewardId = rewardRow.id
    //       }
    //     }.bind(this))
    //     expect(foundSonghaiEmoteRow).to.equal(true);
    //     return DuelystFirebase.connect().getRootRef()
    //   }).then(function(rootRef){
    //     this.rootRef = rootRef;
    //     return FirebasePromises.once(rootRef.child("user-rewards").child(userId).child(this.rewardId),"value")
    //   }).then(function(rewardSnapshot){
    //     expect(rewardSnapshot.val()).to.not.exist;
    //     // expect(rewardSnapshot.val().is_unread).to.equal(true);
    //
    //     // check inventory too
    //     return Promise.all([
    //       knex("user_emotes").where({"user_id":userId,"emote_id":SDK.CosmeticsLookup.Emote.Faction2Taunt}).select(),
    //       FirebasePromises.once(this.rootRef.child("user-inventory").child(userId).child("emotes").child(SDK.CosmeticsLookup.Emote.Faction2Taunt),"value")
    //     ])
    //   }).spread(function(emoteRows,emoteSnapshot){
    //
    //     expect(emoteRows.length).to.equal(1);
    //     expect(emoteSnapshot.val()).to.exist;
    //
    //   });
    // });

    it('expect to have received a ribbon reward for 100 SONGHAI faction wins', () => Promise.all([
      knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({
        win_count: 99,
      }),
    ])
      .bind({})
      .spread(function () {
        this.gameId = generatePushId();
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Songhai, true, this.gameId, 'ranked');
      }).then(() => DuelystFirebase.connect().getRootRef())
      .then(function (rootRef) {
        this.rootRef = rootRef;
        return Promise.all([
          knex('user_ribbons').where({ user_id: userId, ribbon_id: 'f2_champion' }).select(),
          knex('user_rewards').where({ user_id: userId, game_id: this.gameId }).select(),
          FirebasePromises.once(rootRef.child('user-ribbons').child(userId), 'value'),
        ]);
      })
      .spread((ribbonRows, rewardRows, ribbonsSnapshot) => {
        expect(ribbonsSnapshot.val()).to.exist;
        expect(ribbonRows.length).to.be.above(0);
        const ribbonId = ribbonRows[0].ribbon_id;
        expect(ribbonsSnapshot.val()[ribbonId]).to.exist;
        expect(ribbonsSnapshot.val()[ribbonId].count).to.equal(1);
        expect(rewardRows.length).to.be.above(0);
        expect(rewardRows[0].ribbons.length).to.be.above(0);
        expect(rewardRows[0].ribbons[0]).to.equal(ribbonId);
      }));

    it('expect to NOT have received a MAGMAR ribbon reward for SINGLE PLAYER games', () => Promise.all([
      knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Magmar }).update({
        win_count: 99,
      }),
    ])
      .bind({})
      .spread(function () {
        this.gameId = generatePushId();
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Magmar, true, this.gameId, SDK.GameType.SinglePlayer);
      }).then(() => Promise.all([
        knex('user_ribbons').where({ user_id: userId, ribbon_id: 'f5_champion' }).select(),
      ]))
      .spread((ribbonRows, rewardRows, ribbonsSnapshot) => {
        expect(ribbonRows.length).to.equal(0);
      }));

    it('expect to NOT have received a MAGMAR ribbon reward if user record is marked as bot', () => Promise.all([
      knex('users').update({ is_bot: true }).where('id', userId),
      knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Magmar }).update({
        win_count: 99,
      }),
    ])
      .bind({})
      .spread(function () {
        this.gameId = generatePushId();
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Magmar, true, this.gameId, SDK.GameType.Ranked);
      }).then(() => Promise.all([
        knex('user_ribbons').where({ user_id: userId, ribbon_id: 'f3_champion' }).select(),
      ]))
      .spread((ribbonRows, rewardRows, ribbonsSnapshot) => {
        expect(ribbonRows.length).to.equal(0);
        return Promise.resolve();
      })
      .then(() => knex('users').update({ is_bot: false }).where('id', userId)));

    it('expect to earn Vanar Faction XP up to level 11 with SINGLE PLAYER games', () => {
      const allPromises = [];
      // levels are indexed from 0 so we check 10 here instead of 11
      const xpToLevel11 = SDK.FactionProgression.totalXPForLevel(10);
      const numGamesToLevel11 = xpToLevel11 / SDK.FactionProgression.winXP;
      for (let i = 0; i < numGamesToLevel11; i++) {
        allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.SinglePlayer, false));
      }

      return Promise.all(allPromises)
        .bind({})
        .then(() => DuelystFirebase.connect().getRootRef()).then((rootRef) => Promise.all([
          knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Vanar }).first(),
          FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Vanar).child('stats'), 'value'),
        ]))
        .spread((progressionRow, progressionSnapshot) => {
          expect(progressionRow.game_count).to.equal(numGamesToLevel11);
          expect(progressionRow.unscored_count).to.equal(0);
          expect(progressionRow.win_count).to.equal(numGamesToLevel11);
          expect(progressionRow.single_player_win_count).to.equal(numGamesToLevel11);
          expect(progressionRow.xp).to.equal(xpToLevel11);
          // levels are indexed from 0 so we check 10 here instead of 11
          expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(10);
          expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
        });
    });

    it('expect to NOT earn faction XP after level 11 with SINGLE PLAYER games', () => knex('user_faction_progression').where('user_id', userId).first()
      .bind({})
      .then(function (row) {
        this.previousRow = row;
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, false, generatePushId(), SDK.GameType.SinglePlayer, false);
      })
      .then((result) => {
        expect(result).to.not.exist;
        return Promise.all([
          knex('user_faction_progression').where('user_id', userId).first(),
        ]);
      })
      .spread(function (progressionRow) {
        expect(progressionRow.xp).to.equal(this.previousRow.xp);
        expect(progressionRow.level).to.equal(this.previousRow.level);
        expect(progressionRow.updated_at.valueOf()).to.equal(this.previousRow.updated_at.valueOf());
      }));

    it('expect to earn faction XP in casual games', () => knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vanar).first()
      .bind({})
      .then(function (row) {
        this.previousRow = row;
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.Casual, false);
      })
      .then((result) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vanar).first(),
      ]))
      .spread(function (progressionRow) {
        if (this.previousRow == null) {
          expect(progressionRow).to.exist;
          expect(progressionRow.xp).to.not.equal(0);
        } else {
          expect(progressionRow.xp).to.not.equal(this.previousRow.xp);
          expect(progressionRow.updated_at.valueOf()).to.not.equal(this.previousRow.updated_at.valueOf());
        }
      }));

    it('expect game counter to correctly account for DRAW games', () => knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vetruvian).first()
      .bind({})
      .then(function (row) {
        this.previousRow = row;
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vetruvian, false, generatePushId(), SDK.GameType.Casual, false, true);
      })
      .then((result) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vetruvian).first(),
      ]))
      .spread((progressionRow) => {
        expect(progressionRow.game_count).to.equal(1);
        expect(progressionRow.draw_count).to.equal(1);
        expect(progressionRow.loss_count).to.equal(0);
        expect(progressionRow.win_count).to.equal(0);
      }));

    it('expect to earn faction XP for draws', () => knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vetruvian).first()
      .bind({})
      .then(function (row) {
        this.previousRow = row;
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vetruvian, true, generatePushId(), SDK.GameType.Casual, false, true);
      })
      .then((result) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vetruvian).first(),
      ]))
      .spread(function (progressionRow) {
        if (this.previousRow == null) {
          expect(progressionRow).to.exist;
        } else {
          expect(progressionRow.xp).to.be.above(this.previousRow.xp);
        }
        expect(progressionRow.updated_at.valueOf()).to.not.equal(this.previousRow.updated_at.valueOf());
      }));

    it('expect to earn faction XP in FRIENDLY games', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.Friendly, false)).then((result) => Promise.all([
        knex('user_faction_progression').where('user_id', userId).andWhere('faction_id', SDK.Factions.Vanar).first(),
      ]))
      .spread((progressionRow) => {
        expect(progressionRow).to.exist;
        expect(progressionRow.xp).to.not.equal(0);
        expect(progressionRow.friendly_win_count).to.equal(1);
      }));

    it('expect to earn faction XP only up to level 11 with FRIENDLY games', () => {
      // levels are indexed from 0 so we check 10 here instead of 11
      const xpToLevel11 = SDK.FactionProgression.totalXPForLevel(10);
      const numGamesToLevel11 = xpToLevel11 / SDK.FactionProgression.winXP;

      return SyncModule.wipeUserData(userId)
        .bind({})
        .then(() => {
          const allPromises = [];
          for (let i = 0; i < numGamesToLevel11 + 2; i++) {
            allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Vanar, true, generatePushId(), SDK.GameType.Friendly, false));
          }
          return Promise.all(allPromises);
        }).then(() => DuelystFirebase.connect().getRootRef())
        .then((rootRef) => Promise.all([
          knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Vanar }).first(),
          FirebasePromises.once(rootRef.child('user-faction-progression').child(userId).child(SDK.Factions.Vanar).child('stats'), 'value'),
        ]))
        .spread((progressionRow, progressionSnapshot) => {
          expect(progressionRow.game_count).to.equal(numGamesToLevel11);
          expect(progressionRow.unscored_count).to.equal(0);
          expect(progressionRow.win_count).to.equal(numGamesToLevel11);
          expect(progressionRow.friendly_win_count).to.equal(numGamesToLevel11);
          expect(progressionRow.xp).to.equal(xpToLevel11);
          // levels are indexed from 0 so we check 10 here instead of 11
          expect(SDK.FactionProgression.levelForXP(progressionRow.xp)).to.equal(10);
          expect(progressionRow.xp).to.equal(progressionSnapshot.val().xp);
        });
    });

    it('expect to NOT have received a ribbon reward for FRIENDLY games', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => UsersModule.createFactionProgressionRecord(userId, SDK.Factions.Magmar, generatePushId(), SDK.GameType.Ranked)).then(() => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Magmar }).update({
        win_count: 99,
      }))
      .then(function (updateCount) {
        expect(updateCount).to.equal(1);
        this.gameId = generatePushId();
        return UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Magmar, true, this.gameId, SDK.GameType.Friendly);
      })
      .then(() => Promise.all([
        knex('user_ribbons').where({ user_id: userId }).select(),
      ]))
      .spread((ribbonRows, rewardRows, ribbonsSnapshot) => {
        expect(ribbonRows.length).to.equal(0);
      }));

    it('expect to earn a prismatic faction basic card at level 13', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => {
        const xpToLevel = SDK.FactionProgression.totalXPForLevel(13);
        const numWinsToLevel = xpToLevel / SDK.FactionProgression.winXP;
        const allPromises = [];
        for (let i = 0; i < numWinsToLevel; i++) allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false));
        return Promise.all(allPromises);
      }).then(() => knex('user_rewards').where({ user_id: userId, reward_category: 'faction xp' }).orderBy('created_at', 'desc'))
      .then(function (rewardRows) {
        let cardId = null;
        let rewardId = null;
        _.each(rewardRows, (rewardRow) => {
          if (rewardRow.cards != null && SDK.Cards.getIsPrismaticCardId(rewardRow.cards[0])) {
            expect(cardId).to.equal(null);
            cardId = rewardRow.cards[0];
            rewardId = rewardRow.id;
          }
        });
        expect(cardId).to.not.equal(null);
        this.cardId = cardId;
        this.rewardId = rewardId;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: this.cardId }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-rewards').child(userId).child(this.rewardId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection').child(this.cardId), 'value'),
        ]);
      })
      .spread(function (cardCountRow, cardCollection, rewardSnapshot, fbCardEntry) {
        expect(cardCountRow[0].is_new).to.equal(true);
        expect(cardCountRow[0].is_unread).to.equal(true);
        expect(cardCollection.cards[this.cardId]).to.exist;
        expect(cardCollection.cards[this.cardId].is_new).to.equal(true);
        expect(cardCollection.cards[this.cardId].is_unread).to.equal(true);
        expect(rewardSnapshot.val()).to.not.exist;
        // expect(rewardSnapshot.val().cards).to.exist;
        // expect(rewardSnapshot.val().is_unread).to.equal(true);
        expect(fbCardEntry.val().is_new).to.equal(true);
        expect(fbCardEntry.val().is_unread).to.equal(true);
      }));

    it('expect to earn a prismatic neutral basic card at level 17', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => {
        const xpToLevel = SDK.FactionProgression.totalXPForLevel(17);
        const numWinsToLevel = xpToLevel / SDK.FactionProgression.winXP;
        const allPromises = [];
        for (let i = 0; i < numWinsToLevel; i++) allPromises.push(UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false));
        return Promise.all(allPromises);
      }).then(() => knex('user_rewards').where({ user_id: userId, reward_category: 'faction xp' }).orderBy('created_at', 'desc'))
      .then(function (rewardRows) {
        let cardId = null;
        let rewardId = null;
        _.each(rewardRows, (rewardRow) => {
          if (rewardRow.cards != null && SDK.Cards.getIsPrismaticCardId(rewardRow.cards[0])) {
            const card = SDK.CardFactory.cardForIdentifier(rewardRow.cards[0], SDK.GameSession.create());
            expect(card).to.exist;
            if (card.getFactionId() === SDK.Factions.Neutral) {
              expect(cardId).to.equal(null);
              cardId = rewardRow.cards[0];
              rewardId = rewardRow.id;
            }
          }
        });
        expect(cardId).to.not.equal(null);
        this.cardId = cardId;
        this.rewardId = rewardId;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: this.cardId }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-rewards').child(userId).child(this.rewardId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection').child(this.cardId), 'value'),
        ]);
      })
      .spread(function (cardCountRow, cardCollection, rewardSnapshot, fbCardEntry) {
        expect(cardCountRow[0].is_new).to.equal(true);
        expect(cardCountRow[0].is_unread).to.equal(true);
        expect(cardCollection.cards[this.cardId]).to.exist;
        expect(cardCollection.cards[this.cardId].is_new).to.equal(true);
        expect(cardCollection.cards[this.cardId].is_unread).to.equal(true);
        expect(rewardSnapshot.val()).to.not.exist;
        // expect(rewardSnapshot.val().cards).to.exist;
        // expect(rewardSnapshot.val().is_unread).to.equal(true);
        expect(fbCardEntry.val().is_new).to.equal(true);
        expect(fbCardEntry.val().is_unread).to.equal(true);
      }));

    it('expect to earn a prismatic general card at max level', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => {
        const xpToLevel = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        const numWinsToLevel = xpToLevel / SDK.FactionProgression.winXP;
        const times = [];
        for (let i = 0; i < numWinsToLevel; i++) times.push(1);
        return Promise.map(times, () => UsersModule.updateUserFactionProgressionWithGameOutcome(userId, SDK.Factions.Lyonar, true, generatePushId(), 'ranked', false), { concurrency: 1 });
      }).then(() => knex('user_rewards').where({ user_id: userId, reward_category: 'faction xp' }).orderBy('created_at', 'desc'))
      .then(function (rewardRows) {
        let cardId = null;
        let rewardId = null;
        _.each(rewardRows, (rewardRow) => {
          if (rewardRow.cards != null && SDK.Cards.getIsPrismaticCardId(rewardRow.cards[0]) && SDK.Cards.getBaseCardId(rewardRow.cards[0]) === SDK.Cards.Faction1.General) {
            expect(cardId).to.equal(null);
            cardId = rewardRow.cards[0];
            rewardId = rewardRow.id;
          }
        });
        expect(cardId).to.not.equal(null);
        this.cardId = cardId;
        this.rewardId = rewardId;
        return DuelystFirebase.connect().getRootRef();
      })
      .then(function (rootRef) {
        return Promise.all([
          knex.select().from('user_cards').where({ user_id: userId, card_id: this.cardId }),
          knex.first().from('user_card_collection').where({ user_id: userId }),
          FirebasePromises.once(rootRef.child('user-rewards').child(userId).child(this.rewardId), 'value'),
          FirebasePromises.once(rootRef.child('user-inventory').child(userId).child('card-collection').child(this.cardId), 'value'),
        ]);
      })
      .spread(function (cardCountRow, cardCollection, rewardSnapshot, fbCardEntry) {
        expect(cardCountRow[0].is_new).to.equal(true);
        expect(cardCountRow[0].is_unread).to.equal(true);
        expect(cardCollection.cards[this.cardId]).to.exist;
        expect(cardCollection.cards[this.cardId].is_new).to.equal(true);
        expect(cardCollection.cards[this.cardId].is_unread).to.equal(true);
        expect(rewardSnapshot.val()).to.not.exist;
        // expect(rewardSnapshot.val().cards).to.exist;
        // expect(rewardSnapshot.val().is_unread).to.equal(true);
        expect(fbCardEntry.val().is_new).to.equal(true);
        expect(fbCardEntry.val().is_unread).to.equal(true);
      }));
  });

  describe('isAllowedToUseDeck()', () => {
    before(() =>
      // clear any existing data
      DuelystFirebase.connect().getRootRef()
        .then((rootRef) => SyncModule.wipeUserData(userId)));

    /* Test disabled: slow
    it('expect player to be allowed to use a SONGHAI starter level 0 deck in RANKED play', function() {
      const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2,0);
      return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
      .spread(function(cardsAreValid, skinsAreValid){
        expect(cardsAreValid).to.equal(true);
        expect(skinsAreValid).to.equal(true);
      })
    });
    */

    it('expect a player to NOT be able to use a full SONGHAI starter deck at level 0', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => {
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      }).then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        Logger.module('UNITTEST').log(error);
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect a player to NOT be able to use a full LYONAR starter deck with 10 xp', () => SyncModule.wipeUserData(userId)
      .bind({})
      .then(() => knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Lyonar, xp: 10 })).then(() => {
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction1, SDK.FactionProgression.maxLevel);
        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      })
      .then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect a player to be able to use a full SONGHAI starter deck at level 10', () => {
      const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);

      return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp })
        .then(() => {
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        });
    });

    it('expect a player to NOT be able to use a deck with more than 40 cards', () => {
      // extra large starter deck
      const deck = [].concat(
        SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0),
        SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0).slice(1),
      );
      // add a non-basic card the user does not own
      deck.push({ id: SDK.Cards.Neutral.RedSynja });
      return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.InvalidDeckError);
        });
    });

    it('expect a player to NOT be able to use a deck with more than 40 basics', () => {
      const deck = [].concat(
        SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0),
        SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0).slice(1),
        SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, 0).slice(1),
      );
      return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.InvalidDeckError);
        });
    });

    it('expect a player to NOT be able to use cards they don\'t own', () => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()
      .then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      })
      .then(() => {
        // starter deck
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
        // remove last card
        deck.pop();
        // add a card the user does not own
        deck.push({ id: SDK.Cards.Neutral.RedSynja });

        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      })
      .then((response) => {
        expect(response).to.not.exist;
      })
      .catch((error) => {
        expect(error).to.exist;
        expect(error).to.be.an.instanceof(Errors.NotFoundError);
      }));

    it('expect a player to be able to use a deck with cards they own', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserSpirit(txPromise, tx, userId, 2000)).then(() => InventoryModule.craftCard(userId, SDK.Cards.Neutral.RedSynja)).then(() => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()).then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      })
        .then(() => {
          // starter deck
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
          // remove last card
          deck.pop();
          // add the card we just crafted
          deck.push({ id: SDK.Cards.Neutral.RedSynja });

          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        });

      return txPromise;
    });

    it('expect a player to NOT be able to use a deck with cards that are not yet available', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserSpirit(txPromise, tx, userId, 2000)).then(() => InventoryModule.craftCard(userId, SDK.Cards.Neutral.ChaosElemental)).then(() => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()).then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      })
        .then(() => {
          const chaosElemental = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (c) => c.getId() === SDK.Cards.Neutral.ChaosElemental);
          chaosElemental.setAvailableAt(moment().utc().add(1, 'day'));

          // starter deck
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
          // remove last card
          deck.pop();
          // add the card we just crafted
          deck.push({ id: SDK.Cards.Neutral.ChaosElemental });

          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Errors.NotFoundError);
          expect(error.message).to.equal('Deck has cards that are not yet available');
        });

      return txPromise;
    });

    it('expect a player to be able to use a deck with cards that have become available', () => {
      const txPromise = knex.transaction((tx) => InventoryModule.giveUserSpirit(txPromise, tx, userId, 2000)).then(() => InventoryModule.craftCard(userId, SDK.Cards.Neutral.FirstSwordofAkrane)).then(() => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()).then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      })
        .then(() => {
          const firstSwordofAkrane = _.find(SDK.GameSession.getCardCaches().getIsCollectible(true).getCards(), (c) => c.getId() === SDK.Cards.Neutral.FirstSwordofAkrane);
          firstSwordofAkrane.setAvailableAt(moment().utc().subtract(1, 'day'));

          // starter deck
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
          // remove last card
          deck.pop();
          // add the card we just crafted
          deck.push({ id: SDK.Cards.Neutral.FirstSwordofAkrane });
          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        })
        .catch((error) => {
          // Logger.module("UNITTEST").log(error)
          expect(error).to.not.exist;
        });

      return txPromise;
    });

    it('expect to not be able to enter matchmaking with cross faction cards', () => {
      const cardId = SDK.Cards.Faction1.WindbladeAdept;

      const txPromise = knex.transaction((tx) => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()).then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      }).then(() => {
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
        // remove last card
        deck.pop();
        // add the cross faction cards
        deck.push({ id: cardId });
        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      }).then((response) => {
        expect(response).to.not.exist;
      })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });

      return txPromise;
    });

    it('expect to not be able to enter matchmaking with a prismatic basic that I dont own', () => {
      // use prismatic basic NOT awarded by songhai progression
      const cardId = SDK.Cards.Neutral.KomodoCharger;
      const prismaticCardId = cardId + SDK.Cards.Prismatic;

      const txPromise = knex.transaction((tx) => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()).then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      }).then(() => {
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
        // remove last card
        deck.pop();
        // add the prismatic cards
        deck.push({ id: prismaticCardId });
        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      }).then((response) => {
        expect(response).to.not.exist;
      })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });

      return txPromise;
    });

    it('expect to be able to enter matchmaking with a prismatic basic that I own', () => {
      // use prismatic basic awarded by songhai progression
      const cardId = SDK.Cards.Neutral.ValeHunter;
      const prismaticCardId = cardId + SDK.Cards.Prismatic;

      const txPromise = knex.transaction((tx) => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first()).then((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      }).then(() => {
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
        // remove last card
        deck.pop();
        // add the prismatic cards
        deck.push({ id: prismaticCardId });
        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        })
        .catch((error) => {
          expect(error).to.not.exist;
        });

      return txPromise;
    });

    it('expect to not be able to enter matchmaking with more than a combined 3 normal + prismatic copies of a card', () => {
      const cardId = SDK.Cards.Neutral.TwilightMage;
      const prismaticCardId = cardId + SDK.Cards.Prismatic;

      const txPromise = knex.transaction((tx) => Promise.all([
        knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first(),
        InventoryModule.giveUserCards(txPromise, tx, userId, [
          cardId, cardId, cardId,
          prismaticCardId, prismaticCardId, prismaticCardId,
        ]),
      ])).spread((factionProgressionRow) => {
        const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
        if (factionProgressionRow == null) {
          return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
        } if (factionProgressionRow.xp !== maxXp) {
          return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
        }
        return Promise.resolve();
      }).then(() => {
        const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
        // remove last 3 cards
        deck.pop();
        deck.pop();
        deck.pop();
        // add the normal and prismatic cards
        deck.push({ id: cardId });
        deck.push({ id: prismaticCardId });
        deck.push({ id: prismaticCardId });
        return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
      })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        })
        .catch((error) => {
          expect(error).to.not.exist;
        })
        .then(() => {
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
          // remove last 4 cards
          deck.pop();
          deck.pop();
          deck.pop();
          deck.pop();
          // add the normal and prismatic cards
          deck.push({ id: cardId });
          deck.push({ id: cardId });
          deck.push({ id: prismaticCardId });
          deck.push({ id: prismaticCardId });
          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });

      return txPromise;
    });

    it('expect to not be able to enter matchmaking with a skin that I dont own', () => {
      const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1);
      const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2);
      // remove general (first card)
      deck.shift();
      // add the skinned card
      deck.unshift({ id: skinnedCardId });
      return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to not be able to enter matchmaking with a prismatic skin that I dont own', () => {
      const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1);
      const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2);
      // remove general (first card)
      deck.shift();
      // add the skinned card
      deck.unshift({ id: skinnedCardId });
      return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error).to.not.be.an.instanceof(chai.AssertionError);
        });
    });

    it('expect to be able to enter matchmaking with a skin that I own', () => {
      const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.General, 1);
      const skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, skinId, 'unit test', generatePushId()))
        .then(() => {
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2);
          // remove general (first card)
          deck.shift();
          // add the skinned card
          deck.unshift({ id: skinnedCardId });
          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        })
        .catch((error) => {
          expect(error).to.not.exist;
        });

      return txPromise;
    });

    it('expect to be able to enter matchmaking with a prismatic skin that I own', () => {
      const skinnedCardId = SDK.Cards.getSkinnedCardId(SDK.Cards.Faction2.GeneralPrismatic, 1);
      const skinId = SDK.Cards.getCardSkinIdForCardId(skinnedCardId);

      const txPromise = knex.transaction((tx) => InventoryModule.giveUserCosmeticId(txPromise, tx, userId, skinId, 'unit test', generatePushId()))
        .then(() => knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).first())
        .then((factionProgressionRow) => {
          const maxXp = SDK.FactionProgression.totalXPForLevel(SDK.FactionProgression.maxLevel);
          if (factionProgressionRow == null) {
            return knex('user_faction_progression').insert({ user_id: userId, faction_id: SDK.Factions.Songhai, xp: maxXp });
          } if (factionProgressionRow.xp !== maxXp) {
            return knex('user_faction_progression').where({ user_id: userId, faction_id: SDK.Factions.Songhai }).update({ xp: maxXp });
          }
          return Promise.resolve();
        })
        .then(() => {
          const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2, SDK.FactionProgression.maxLevel);
          // remove general (first card)
          deck.shift();
          // add the skinned card
          deck.unshift({ id: skinnedCardId });
          return UsersModule.isAllowedToUseDeck(userId, deck, 'ranked', null, true);
        })
        .spread((cardsAreValid, skinsAreValid) => {
          expect(cardsAreValid).to.equal(true);
          expect(skinsAreValid).to.equal(true);
        })
        .catch((error) => {
          expect(error).to.not.exist;
        });

      return txPromise;
    });
  });

  // describe("tipAnotherPlayerForGame",function(){

  //   const opponentId = null;

  //   // before cleanup to check if user already exists and delete
  //   before(function(){
  //     Logger.module("UNITTEST").log("creating user");
  //     return UsersModule.createNewUser('unit-test-opponent@duelyst.local','unittestopponent','hash','kumite14')
  //     .then(function(userIdCreated){
  //       Logger.module("UNITTEST").log("created user ",userIdCreated);
  //       opponentId = userIdCreated;
  //     }).catch(Errors.AlreadyExistsError,function(error){
  //       Logger.module("UNITTEST").log("existing user");
  //       return UsersModule.userIdForEmail('unit-test-opponent@duelyst.local').then(function(userIdExisting){
  //         Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
  //         opponentId = userIdExisting;
  //         return SyncModule.wipeUserData(userIdExisting);
  //       }).then(function(){
  //         Logger.module("UNITTEST").log("existing user data wiped",opponentId);
  //       })
  //     }).then(function(){

  //     });
  //   });

  //   it('expect to be able to tip another player after a game', function() {
  //     const deck = SDK.FactionFactory.starterDeckForFactionLevel(SDK.Factions.Faction2,0);
  //     return UsersModule.isAllowedToUseDeck(userId,deck,'ranked',null,true)
  //     .then(function(val){
  //       expect(val).to.equal(true);
  //     })
  //   });

  // })

  // region ftue tests
  describe('setNewPlayerFeatureProgression()', () => {
    before(() =>
      // clear any existing data
      DuelystFirebase.connect().getRootRef()
        .then((rootRef) => SyncModule.wipeUserData(userId)));

    /* Test disabled: slow
    it('expect to not be able to set core module to a junk stage value', function() {
      return UsersModule.setNewPlayerFeatureProgression(userId,"core","this_is_a_non_existant_core_stage_value")
        .then(function(response){
          expect(response).to.not.exist;
        }).catch(Errors.BadRequestError,function(e) {
          // Expect this type of error to happen
          expect(e).to.exist;
        }).catch(function (e) {
          // Should be the above error, not a generic error
          expect(e).to.not.exist
        })
    });
    */

    it('expect to not be able to set core module to lower stage value', () => UsersModule.setNewPlayerFeatureProgression(userId, 'core', NewPlayerProgressionStageEnum.TutorialDone)
      .then((response) => {
        UsersModule.setNewPlayerFeatureProgression(userId, 'core', NewPlayerProgressionStageEnum.Tutorial);
      }).then((response) => {
        expect(response).to.not.exist;
      }).catch(Errors.BadRequestError, (e) => {
        // Expect this type of error to happen
        expect(e).to.exist;
      })
      .catch((e) => {
        // Should be the above error, not a generic error
        expect(e).to.not.exist;
      }));

    it('expect to generate correct quests for all FTUE stages', () => Promise.each(NewPlayerProgressionStageEnum.enums, (enumStage) => knex('user_quests').delete().where('user_id', userId)
      .then(() => UsersModule.setNewPlayerFeatureProgression(userId, SDK.NewPlayerProgressionModuleLookup.Core, enumStage.key))
      .then(() => QuestsModule.generateBeginnerQuests(userId))
      .then(() => knex('user_quests').select().where('user_id', userId))
      .then((userQuestRows) => {
        const beginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(enumStage) || [];
        expect(beginnerQuests.length).to.equal(userQuestRows.length);

        _.each(beginnerQuests, (beginnerQuest) => {
          const existingQuestRow = _.find(userQuestRows, (userQuestRow) => userQuestRow.quest_type_id === beginnerQuest.getId());
          expect(existingQuestRow).to.exist;
        });
      })
      .catch(Errors.NoNeedForNewBeginnerQuestsError, (e) => {
        // This is valid if no beginner quests were needed
        const beginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(enumStage) || [];
        expect(beginnerQuests.length).to.equal(0);
      }), { concurrency: 1 }));

    // Not yet implemented
    // it('expect to not be able to skip multiple core module stages', function() {
    //  return SyncModule.wipeUserData(userId)
    //    .then(function(response){
    //      return UsersModule.setNewPlayerFeatureProgression(userId,"core",NewPlayerProgressionStageEnum.Tutorial)
    //    }).then(function(response){
    //      return UsersModule.setNewPlayerFeatureProgression(userId,"core",NewPlayerProgressionStageEnum.FirstGameDone)
    //    }).then(function(response){
    //      expect(response).to.not.exist;
    //    }).catch(Errors.BadRequestError,function(e) {
    //      // Expect this type of error to happen
    //      expect(e).to.exist;
    //    }).catch(function (e) {
    //      // Should be the above error, not a generic error
    //      expect(e).to.not.exist
    //    })
    // });
  });

  // endregion ftue tests
});
