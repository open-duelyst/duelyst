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
});
*/
