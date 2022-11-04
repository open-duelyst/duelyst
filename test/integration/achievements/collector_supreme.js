/* Test disabled: slow
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
Logger.enabled = Logger.enabled && true;

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

  describe("Collector Supreme Achievement", function() {

    it('expect that collecting one of each Shimzar set Neutral Commons, normal or prismatic, does not award the Collector Supreme achievement', function() {

      this.timeout(10000);

      const allCommonCards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Shimzar).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCards();
      const allCommonCardIds = _.map(allCommonCards,function(c) {
        return Math.random() < 0.5 ? SDK.Cards.getPrismaticCardId(c.getId()) : c.getId();
      })

      return knex.transaction(function(tx){
        return InventoryModule.giveUserCards(null,tx,userId,allCommonCardIds)
      }).then(function(){
        return Promise.delay(3000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','collectorSupreme'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','collectorSupreme')
        ])
      }).spread(function(achievementRows,rewardRows){
        expect(achievementRows.length).to.equal(0)
        expect(rewardRows.length).to.equal(0)
      })
    })

    it('expect that collecting one of each Core set Neutral Commons, normal or prismatic, awards the Collector Supreme achievement', function() {

      this.timeout(10000);

      const allCommonCards = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getRarity(SDK.Rarity.Common).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCards();
      const allCommonCardIds = _.map(allCommonCards,function(c) {
        return Math.random() < 0.5 ? SDK.Cards.getPrismaticCardId(c.getId()) : c.getId();
      })

      return knex.transaction(function(tx){
        return InventoryModule.giveUserCards(null,tx,userId,allCommonCardIds)
      }).then(function(){
        return Promise.delay(3000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','collectorSupreme'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','collectorSupreme')
        ])
      }).spread(function(achievementRows,rewardRows){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
      })
    })
  })
})
*/
