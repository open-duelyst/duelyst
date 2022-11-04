/* Achievements tests are temporarily disabled.
var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffeescript/register')
var chai = require('chai');
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var AchievementsModule = require('../../../server/lib/data_access/achievements.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger.coffee');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk.coffee');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex.coffee')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("achievements module", function() {
  this.timeout(25000);

  const userId = null;

  // before cleanup to check if user already exists and delete
  before(function(){
    Logger.module("UNITTEST").log("creating user");
    return UsersModule.createNewUser('unit-test@duelyst.local','unittest','hash','kumite14')
    .then(function(userIdCreated){
      Logger.module("UNITTEST").log("created user ",userIdCreated);
      userId = userIdCreated;
    }).catch(Errors.AlreadyExistsError,function(error){
      Logger.module("UNITTEST").log("existing user");
      return UsersModule.userIdForEmail('unit-test@duelyst.local').then(function(userIdExisting){
        Logger.module("UNITTEST").log("existing user retrieved",userIdExisting);
        userId = userIdExisting;
        return SyncModule.wipeUserData(userIdExisting);
      }).then(function(){
        Logger.module("UNITTEST").log("existing user data wiped",userId);
      })
    })
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

  describe("AchievementsModule", function() {

    describe("updateAchievementsProgressWithCardCollection()", function() {
      it('expect to complete an achievement once a player owns 1 of all common cards', function() {

        const collection = {};
        const allCommonCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Common).getCards();
        _.each(allCommonCards,function(card){
          collection[card.getId()] = { count:1 }
        });

        return AchievementsModule.updateAchievementsProgressWithCardCollection(userId,collection)
        .then(function(){
          return DuelystFirebase.connect().getRootRef()
        }).then(function(rootRef){
          return Promise.all([
            knex('user_achievements').select().where('user_id',userId),
            knex('user_rewards').select().where('user_id',userId),
            FirebasePromises.once(rootRef.child('user-achievements').child(userId),"value"),
            FirebasePromises.once(rootRef.child('user-rewards').child(userId),"value")
          ])
        }).spread(function(achievementRows,rewardRows,achievementsSnapshot,rewardsSnapshot){
          expect(achievementRows.length).to.equal(1);
        });
      });
    });

    // Achievement has been disabled
    //describe("updateAchievementsProgressWithDisenchantedCard()", function() {
    //  it('expect a spirit reward for DISENCHANTING your first card', function() {
    //    return AchievementsModule.updateAchievementsProgressWithDisenchantedCard(userId,SDK.Cards.Faction1.Lightchaser)
    //    .then(function(){
    //      return DuelystFirebase.connect().getRootRef()
    //    }).then(function(rootRef){
    //      return Promise.all([
    //        knex('user_achievements').select().where('user_id',userId),
    //        knex('user_rewards').select().where('user_id',userId),
    //        FirebasePromises.once(rootRef.child('user-achievements').child(userId),"value"),
    //        FirebasePromises.once(rootRef.child('user-rewards').child(userId),"value")
    //      ])
    //    }).spread(function(achievementRows,rewardRows,achievementsSnapshot,rewardsSnapshot){
    //      expect(achievementRows.length).to.equal(2);
    //    });
    //  });
    //});

  });

  // describe("crafting achievements", function() {

  //   describe("welcome to crafting", function() {

  //     it('expect a spirit reward for DISENCHANTING your first card', function() {

  //       return knex("users").where('id',userId).update({
  //         wallet_spirit:40
  //       }).then(function(){
  //         return InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
  //       }).then(function(){
  //         return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.Lightchaser])
  //       }).then(function(result){
  //         expect(result).to.exist;
  //         return DuelystFirebase.connect().getRootRef()
  //       }).then(function(rootRef){

  //       });

  //     });

  //     it('expect no spirit reward for DISENCHANTING your second card', function() {

  //       return knex("users").where('id',userId).update({
  //         wallet_spirit:40
  //       }).then(function(){
  //         return InventoryModule.craftCard(userId,SDK.Cards.Faction1.Lightchaser)
  //       }).then(function(){
  //         return InventoryModule.disenchantCards(userId,[SDK.Cards.Faction1.Lightchaser])
  //       }).then(function(result){
  //         expect(result).to.exist;
  //         return DuelystFirebase.connect().getRootRef()
  //       }).then(function(rootRef){
  //       });
  //     });
  //   });
  // })
});
*/
