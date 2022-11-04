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

  describe("Seven Sisters Achievement", function() {

    this.timeout(100000);

    it('expect that collecting some, but not all, Lyonar rares does not award the Sun Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction1).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 2 copies of each rare
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId)
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','sunSister'),
          knex('user_rewards').select().where('user_id',userId),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction1.SunSister),
          FirebasePromises.once(rootRef.child('user-achievements').child(userId),"value"),
          FirebasePromises.once(rootRef.child('user-rewards').child(userId),"value")
        ])
      }).spread(function(achievementRows,rewardRows,cardRow,achievementsSnapshot,rewardsSnapshot){
        expect(achievementRows.length).to.equal(0)
        expect(cardRow).to.not.exist
      })
    })

    it('expect that collecting all Lyonar rares awards the Sun Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction1).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId)
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','sunSister'),
          knex('user_rewards').select().where('user_id',userId),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction1.SunSister),
          FirebasePromises.once(rootRef.child('user-achievements').child(userId),"value"),
          FirebasePromises.once(rootRef.child('user-rewards').child(userId),"value")
        ])
      }).spread(function(achievementRows,rewardRows,cardRow,achievementsSnapshot,rewardsSnapshot){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that crafting an extra Lyonar rare has no effect on Sun Sister inventory', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction1).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

       return InventoryModule.craftCard(userId,allRareCardIds[0])
      .then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId),
          knex('user_rewards').select().where('user_id',userId),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction1.SunSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that collecting a combination of all normal and prismatic Songhai rares awards the Lightning Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction2).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          // where the 3rd is a prismatic
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,SDK.Cards.getPrismaticCardId(cardId))
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','lightningSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','lightningSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction2.LightningSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that collecting a combination of all normal and prismatic Vetruvian rares awards the Sand Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction3).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          // where the 3rd is a prismatic
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,SDK.Cards.getPrismaticCardId(cardId))
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','sandSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','sandSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction3.SandSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that collecting a combination of all normal and prismatic Abyssian rares awards the Shadow Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction4).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          // where the 3rd is a prismatic
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,SDK.Cards.getPrismaticCardId(cardId))
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','shadowSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','shadowSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction4.ShadowSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that collecting a combination of all normal and prismatic Magmar rares awards the Earth Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction5).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          // where the 3rd is a prismatic
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,SDK.Cards.getPrismaticCardId(cardId))
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','earthSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','earthSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction5.EarthSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that collecting a combination of all normal and prismatic Vanar rares awards the Wind Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction6).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex("users").where('id',userId).update({wallet_spirit:10000})
      .then(function(){
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          // where the 3rd is a prismatic
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,SDK.Cards.getPrismaticCardId(cardId))
          ])
        })
      }).then(function(){
        return Promise.delay(5000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','windSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','windSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction6.WindSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    it('expect that collecting a combination of all normal and prismatic Neutral rares awards the Sworn Sister achievement', function() {

      const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Neutral).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();

      return knex.transaction(function(tx){
        const cards = _.flatten(_.map(allRareCardIds,function(c) { return [c,c,SDK.Cards.getPrismaticCardId(c)] }))
        return InventoryModule.giveUserCards(null,tx,userId,cards)
      }).then(function(){
        return Promise.delay(3000)
      }).then(function(){
        return DuelystFirebase.connect().getRootRef()
      }).then(function(rootRef){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','swornSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','swornSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Neutral.SwornSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })

    // CURRENTLY BROKEN: setting achievement to enabled = false does not work in unit tests, as achievements are handled by job on server
    it('expect that users who filled out collection PRIOR to Seven Sisters release get a backfill of the cards', function() {

      SDK.AchievementsFactory.achievementForIdentifier('sunSister').enabled = false

      return SyncModule.wipeUserData(userId)
      .then(function(){
        return knex("users").where('id',userId).update({wallet_spirit:10000})
      }).then(function(){
        const allRareCardIds = SDK.GameSession.getCardCaches().getCardSet(SDK.CardSet.Core).getFaction(SDK.Factions.Faction2).getRarity(SDK.Rarity.Rare).getIsCollectible(true).getIsUnlockable(false).getIsPrismatic(false).getCardIds();
        return Promise.map(allRareCardIds,function(cardId){
          // craft 3 copies of each rare
          return Promise.all([
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId),
            InventoryModule.craftCard(userId,cardId)
          ])
        })
      }).then(function(){
        return Promise.delay(3000)
      }).then(function(){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','lightningSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','lightningSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction2.LightningSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(0)
        expect(rewardRows.length).to.equal(0)
        expect(cardRow).to.not.exist
        SDK.AchievementsFactory.achievementForIdentifier('sunSister').enabled = true
        return UsersModule.bumpSessionCountAndSyncDataIfNeeded(userId)
      }).then(function(){
        return Promise.delay(1000)
      }).then(function(){
        return Promise.all([
          knex('user_achievements').select().where('user_id',userId).andWhere('achievement_id','lightningSister'),
          knex('user_rewards').select().where('user_id',userId).andWhere('reward_type','lightningSister'),
          knex('user_cards').first().where('user_id',userId).andWhere('card_id',SDK.Cards.Faction2.LightningSister),
        ])
      }).spread(function(achievementRows,rewardRows,cardRow){
        expect(achievementRows.length).to.equal(1)
        expect(achievementRows[0].progress).to.equal(1)
        expect(rewardRows.length).to.equal(1)
        expect(cardRow).to.exist
        expect(cardRow.count).to.equal(3)
      })
    })
  })
})
*/
