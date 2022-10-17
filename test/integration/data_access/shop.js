/* Shop unit tests are currently disabled.

var path = require('path')
require('app-module-path').addPath(path.join(__dirname, '../../../'))
require('coffeescript/register')
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var DuelystFirebase = require('../../../server/lib/duelyst_firebase_module.coffee');
var Errors = require('../../../server/lib/custom_errors.coffee');
var UsersModule = require('../../../server/lib/data_access/users.coffee');
var SyncModule = require('../../../server/lib/data_access/sync.coffee');
var InventoryModule = require('../../../server/lib/data_access/inventory.coffee');
var ShopModule = require('../../../server/lib/data_access/shop.coffee');
var FirebasePromises = require('../../../server/lib/firebase_promises.coffee');
var generatePushId = require('../../../app/common/generate_push_id');
var config = require('../../../config/config');
var Promise = require('bluebird');
var Logger = require('../../../app/common/logger.coffee');
var sinon = require('sinon');
var _ = require('underscore');
var SDK = require('../../../app/sdk.coffee');
var moment = require('moment');
var knex = require('../../../server/lib/data_access/knex.coffee');
var ShopData = require('../../../app/data/shop.json')

// disable the logger for cleaner test output
Logger.enabled = Logger.enabled && false;

describe("shop module", function() {
  const userId = null;

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

  describe("Shop.json", function () {
    it('expect no duplicate steam ids or skus', function () {
      const allSkus = [];
      const allSteamIds = [];

      for (var categoryId in ShopData) {
        const shopCategoryData = ShopData[categoryId];
        for (var productKey in shopCategoryData) {
          const productData = shopCategoryData[productKey];
          expect(productData.sku).to.exist
          allSkus.push(productData.sku);

          if (productData.gold != null) {
            expect(productData.gold).to.exist
          } else {
            expect(productData.steam_id).to.exist
            allSteamIds.push(productData.steam_id);
          }
        }
      }

      expect(_.unique(allSkus).length).to.equal(allSkus.length);
      expect(_.unique(allSteamIds).length).to.equal(allSteamIds.length);
    })
  })

  describe("ShopModule - tokens and charges", function() {
    describe("productDataForSKU()", function() {
      it('expect to pull up correct data for an SKU', function() {
        const data = ShopModule.productDataForSKU("BOOSTER3")
        expect(data).to.exist
        expect(data.name).to.equal("2 Spirit Orbs")
      })
    })

    describe("chargeUserCardToken()", function() {
      it('expect not to be able to charge an invalid token', function() {
        return ShopModule.chargeUserCardToken(userId,"sku","fake-token-id",100,"bad charge attempt")
        .then(function(chargeData){
          expect(chargeData).to.not.exist;
        }).catch(function(error){
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Error);
        });
      });
    })

    describe("updateUserCreditCardToken()", function() {
      it('expect not to be able to update user data with an invalid token', function() {
        return ShopModule.updateUserCreditCardToken(userId,"bad-token",'0000')
        .then(function(response){
          expect(response).to.not.exist;
        }).catch(function(error){
          expect(error).to.exist;
          expect(error).to.be.an.instanceof(Error);
        });
      });
    });
  })

  describe("ShopModule - STEAM", function() {
    before(function(){
      this.timeout(15000);
      return SyncModule.wipeUserData(userId)
    })

    describe("purchaseProductOnSteam()", function() {

      it('expect to record all data correctly for a steam purchase', function() {

        const orderId = "steam-tx-id"

        return ShopModule.purchaseProductOnSteam({
          userId: userId,
          sku: "BOOSTER3",
          orderId: orderId
        })
        .then(function(result){
          expect(result).to.exist;
          return DuelystFirebase.connect().getRootRef()
        }).then(function(rootRef){
          return Promise.all([
            knex("users").first().where('id',userId),
            FirebasePromises.once(rootRef.child("users").child(userId),"value"),
            knex("user_charges").select().where('user_id',userId),
            FirebasePromises.once(rootRef.child("user-charges").child(userId).child(orderId),"value"),
            knex.select().from("user_spirit_orbs").where('user_id',userId),
            FirebasePromises.once(rootRef.child("user-inventory").child(userId).child("spirit-orbs"),"value")
          ])
        }).spread(function(userRow,userSnapshot,chargeRows,userChargeSnapshot,spiritOrbRows,firebaseBoostersSnapshot){

          expect(spiritOrbRows.length).to.equal(2)
          expect(firebaseBoostersSnapshot.val()).to.exist

          expect(userRow.last_purchase_at).to.exist
          expect(userRow.first_purchased_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf())
          expect(userRow.purchase_count).to.equal(1)
          expect(userRow.ltv).to.equal(299)

          expect(chargeRows).to.exist
          expect(chargeRows.length).to.equal(1)
          expect(chargeRows[0].charge_id).to.equal(orderId)
          expect(chargeRows[0].amount).to.equal(userRow.ltv)
          expect(chargeRows[0].payment_type).to.equal("steam")
          expect(chargeRows[0].charge_json).to.exist
          expect(chargeRows[0].sku).to.equal('BOOSTER3')
          expect(chargeRows[0].created_at.valueOf()).to.equal(userRow.last_purchase_at.valueOf())

          expect(userSnapshot.val().ltv).to.equal(userRow.ltv)
        })
      })
    })
  })
});
*/
