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

  // describe("Home Turf Achievement", function() {
  //
  //   it('expect that winning 5 home games awards a random battle map', function() {
  //     this.timeout(100000);
  //     const gameData = {
  //       gameType: "ranked",
  //       players: [
  //         {
  //           playerId: userId,
  //           isWinner: true
  //         }
  //       ]
  //     }
  //     return Promise.all([
  //       AchievementsModule.updateAchievementsProgressWithGame(userId,generatePushId(),gameData,false,false),
  //       AchievementsModule.updateAchievementsProgressWithGame(userId,generatePushId(),gameData,false,false),
  //       AchievementsModule.updateAchievementsProgressWithGame(userId,generatePushId(),gameData,false,false),
  //       AchievementsModule.updateAchievementsProgressWithGame(userId,generatePushId(),gameData,false,false),
  //       AchievementsModule.updateAchievementsProgressWithGame(userId,generatePushId(),gameData,false,false)
  //     ]).then(function(){
  //       return Promise.delay(3000)
  //     }).then(function(){
  //       return Promise.all([
  //         knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','homeTurf'),
  //         knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','homeTurf'),
  //         knex('user_cosmetic_inventory').select().where('user_id',userId)
  //       ])
  //     }).spread(function(achievementRows,rewardRows,cosmeticsRows){
  //       expect(achievementRows.length).to.equal(1)
  //       expect(rewardRows.length).to.equal(1)
  //       expect(rewardRows[0].cosmetics.length).to.equal(1)
  //       expect(cosmeticsRows.length).to.equal(1)
  //       const cosmetic = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticsRows[0].cosmetic_id)
  //       expect(cosmetic.typeId).to.equal(SDK.CosmeticsTypeLookup.BattleMap)
  //     })
  //   })
  //
  // })
})
*/
