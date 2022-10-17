// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _CosmeticChestManager = {};
_CosmeticChestManager.instance = null;
_CosmeticChestManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new CrateManager();
  }
  return this.instance;
};
_CosmeticChestManager.current = _CosmeticChestManager.getInstance;

module.exports = _CosmeticChestManager;

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var Promise = require('bluebird');
var Analytics = require('app/common/analytics');
var _ = require('underscore');
var moment = require('moment');
var GiftCrateLookup = require('../../sdk/giftCrates/giftCrateLookup.coffee');
var GiftCrateFactory = require('../../sdk/giftCrates/giftCrateFactory.coffee');
var ProfileManager = require('./profile_manager');
var Manager = require('./manager');

var CrateManager = Manager.extend({

  _cosmeticChestCollection: null,
  _cosmeticChestKeyCollection: null,
  _giftCrateCollection: null,

  _activeCosmeticChestsCache: null,

  initialize: function (options) {
    Manager.prototype.initialize.call(this);
  },

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');

        this._cosmeticChestCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/cosmetic-chests',
        });

        this._cosmeticChestKeyCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/cosmetic-chest-keys',
        });

        this._giftCrateCollection = new DuelystBackbone.Collection();
        this._giftCrateCollection.url = process.env.API_URL + '/api/me/crates/gift_crates';
        this._giftCrateCollection.fetch();

        this._markAsReadyWhenModelsAndCollectionsSynced([
          this._cosmeticChestCollection,
          this._cosmeticChestKeyCollection,
          this._giftCrateCollection,
        ]);

        this.onReady().then(function () {
          this.listenTo(this._cosmeticChestCollection, 'change add remove', this.onCosmeticChestCollectionChange);
          this.listenTo(this._cosmeticChestKeyCollection, 'change add remove', this.onCosmeticChestKeyCollectionChange);

          if (this._giftCrateCollection && this._giftCrateCollection.length > 0
          || this._cosmeticChestCollection && this._cosmeticChestCollection.length > 0
          || this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.length > 0) {
            NewPlayerManager.getInstance().onReady().then(function () {
              NewPlayerManager.getInstance().setHasReceivedCrateProduct();
            });
          }
        }.bind(this));
      });
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    if (this._cosmeticChestCollection != null) {
      this._cosmeticChestCollection.off();
      this._cosmeticChestCollection = null;
    }
    if (this._cosmeticChestKeyCollection != null) {
      this._cosmeticChestKeyCollection.off();
      this._cosmeticChestKeyCollection = null;
    }
    if (this._giftCrateCollection != null) {
      this._giftCrateCollection.off();
      this._giftCrateCollection = null;
    }
  },

  /* endregion CONNECT */

  /* region CHESTS */

  getActiveCosmeticChestModels: function () {
    if (this._activeCosmeticChestsCache == null) {
      // If there's no cache then build it
      var chests = [];
      if (this._cosmeticChestCollection != null && this._cosmeticChestCollection.models != null && this._cosmeticChestCollection.models.length != 0) {
        var momentNowUtc = moment.utc();
        var chestModels = this._cosmeticChestCollection.models;
        chests = _.filter(chestModels, function (chestModel) {
          // Filter chests by expiration if they have one
          var chestExpirationAt = chestModel.get('expires_at');
          if (chestExpirationAt != null) {
            var crateExpirationMoment = moment.utc(chestModel.get('expires_at'));
            if (momentNowUtc.isAfter(crateExpirationMoment)) {
              return false;
            }
          }

          return true;
        });
      }

      this._activeCosmeticChestsCache = chests;
    }

    return this._activeCosmeticChestsCache;
  },

  /**
   * Returns the type of chest a player can open (has a key and crate, or doesn't need key for) or null
   * @public
   * @returns {String||null} Returns either a cosmeticsChestType string, "gift" or null (if there are none openable
   */
  getOpenableChestType: function () {
    if (this.getGiftCrateCount(GiftCrateLookup.FrostfirePremiumPurchasable2017) > 0) {
      return GiftCrateLookup.FrostfirePremiumPurchasable2017;
    }

    if (this.getGiftCrateCount(GiftCrateLookup.FrostfirePurchasable2017) > 0) {
      return GiftCrateLookup.FrostfirePurchasable2017;
    }

    if (this.getGiftCrateCount() > 0) {
      return 'gift';
    }

    var activeCosmeticChests = this.getActiveCosmeticChestModels();
    for (var i = 0; i < activeCosmeticChests.length; i++) {
      var chestModel = activeCosmeticChests[i];
      if (chestModel.get('chest_type') != null) {
        return chestModel.get('chest_type');
      }
    }

    return null;
  },

  getCosmeticChestCount: function () {
    return this.getActiveCosmeticChestModels().length;
  },

  getCosmeticChestModelsForType: function (chestType) {
    var chestsForType = [];

    var models = this.getActiveCosmeticChestModels();
    for (var i = 0, il = models.length; i < il; i++) {
      var chestModel = models[i];
      if (chestModel.get('chest_type') === chestType) {
        chestsForType.push(chestModel);
      }
    }
    return chestsForType;
  },

  getNextBossCrateExpirationMoment: function () {
    var bossCrates = this.getCosmeticChestModelsForType(SDK.CosmeticsChestTypeLookup.Boss);

    if (bossCrates.length == 0) {
      return null;
    } else {
      var bossCratesSortedByAscExpiration = _.sortBy(bossCrates, function (bossCrate) {
        return bossCrate.get('expires_at');
      });
      var nextExpiringBossCrate = bossCratesSortedByAscExpiration[0];
      return moment.utc(nextExpiringBossCrate.get('expires_at'));
    }
  },

  getCosmeticChestCountForType: function (chestType) {
    return this.getCosmeticChestModelsForType(chestType).length;
  },

  getNextAvailableCosmeticChestIdForType: function (chestType) {
    var models = this.getCosmeticChestModelsForType(chestType);

    if (models == null || models.length == 0) {
      return null;
    }

    if (chestType == SDK.CosmeticsChestTypeLookup.Boss) {
      models = _.sortBy(models, function (model) {
        return model.get('expires_at');
      });
    }

    return models[0].get('chest_id');
  },

  onCosmeticChestCollectionChange: function () {
    // Invalidate cosmetics chest cache
    this._activeCosmeticChestsCache = null;

    NewPlayerManager.getInstance().setHasReceivedCrateProduct();
    EventBus.getInstance().trigger(EVENTS.cosmetic_chest_collection_change);
  },

  /* endregion CHESTS */

  /* region KEYS */

  getCosmeticChestKeyCount: function () {
    return (this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.length) || 0;
  },

  getCosmeticChestKeyModelsForType: function (chestType) {
    var chests = [];
    if (this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.models) {
      var models = this._cosmeticChestKeyCollection.models;
      for (var i = 0, il = models.length; i < il; i++) {
        var chestKeyModel = models[i];
        if (chestKeyModel.get('key_type') === chestType) {
          chests.push(chestKeyModel);
        }
      }
    }
    return chests;
  },

  getCosmeticChestKeyCountForType: function (chestType) {
    return this.getCosmeticChestKeyModelsForType(chestType).length;
  },

  getNextAvailableCosmeticChestKeyIdForType: function (chestType) {
    if (this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.models) {
      var models = this._cosmeticChestKeyCollection.models;
      for (var i = 0, il = models.length; i < il; i++) {
        var chestKeyModel = models[i];
        if (chestKeyModel.get('key_type') === chestType) {
          return chestKeyModel.get('key_id');
        }
      }
    }

    return null;
  },

  onCosmeticChestKeyCollectionChange: function () {
    NewPlayerManager.getInstance().setHasReceivedCrateProduct();
    EventBus.getInstance().trigger(EVENTS.cosmetic_chest_key_collection_change);
  },

  /* endregion KEYS */

  /* region GIFT CRATES */

  getGiftCrateCount: function (giftCrateType) {
    if (this._giftCrateCollection && this._giftCrateCollection.models) {
      var count = 0;
      var models = this._giftCrateCollection.models;
      for (var i = 0, il = models.length; i < il; i++) {
        var giftCrateModel = models[i];
        if (GiftCrateFactory.getIsCrateTypeAvailable(giftCrateModel.get('crate_type'))) {
          if (giftCrateType != null && giftCrateModel.get('crate_type') == giftCrateType) {
            count++;
          } else if (giftCrateType == null && !this.getIsSpecialGiftCrate(giftCrateModel.get('crate_type'))) {
            count++;
          }
        }
      }
      return count;
    } else {
      return 0;
    }
  },

  // For things like Frostfire gift crate which is displayed separately than regular gift crates
  getIsSpecialGiftCrate: function (giftCrateType) {
    if (giftCrateType == GiftCrateLookup.FrostfirePurchasable2017) {
      return true;
    }

    if (giftCrateType == GiftCrateLookup.FrostfirePremiumPurchasable2017) {
      return true;
    }

    return false;
  },

  getNextAvailableGiftCrateId: function (giftCrateType) {
    if (this._giftCrateCollection && this._giftCrateCollection.models) {
      var models = this._giftCrateCollection.models;
      for (var i = 0, il = models.length; i < il; i++) {
        var giftCrateModel = models[i];
        if (GiftCrateFactory.getIsCrateTypeAvailable(giftCrateModel.get('crate_type'))) {
          if (giftCrateType != null && giftCrateModel.get('crate_type') == giftCrateType) {
            return giftCrateModel.get('crate_id');
          } else if (giftCrateType == null && !this.getIsSpecialGiftCrate(giftCrateModel.get('crate_type'))) {
            return giftCrateModel.get('crate_id');
          }
        }
      }
    }
    // None found, return null
    return null;
  },

  getGiftCrateModelForId: function (crateId) {
    return _.find(this._giftCrateCollection.models, function (model) {
      return model.get('crate_id') == crateId;
    }.bind(this));
  },

  refreshGiftCrates: function () {
    return new Promise(function (resolve, reject) {
      var giftCrateRequest = this._giftCrateCollection.fetch();

      giftCrateRequest.done(function (response) {
        EventBus.getInstance().trigger(EVENTS.gift_crate_collection_change);
        if (this._giftCrateCollection && this._giftCrateCollection.length > 0) {
          NewPlayerManager.getInstance().setHasReceivedCrateProduct();
        }
        resolve(response);
      }.bind(this));

      giftCrateRequest.fail(function (response) {
        var error = 'GIFT CRATE request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);

        reject(new Error(error));
      }.bind(this));
    }.bind(this));
  },

  /* endregion GIFT CRATES */

  /* region UNLOCK */

  /**
   * Returns a promise that resolves to an array of reward objects for a loot crate that is passed in by id
   * @public
   * @param {String} crateId - id of crate to claim rewards for
   */
  unlockCosmeticChestWithId: function (crateId) {
    var chestType = null;
    // find chest type from current chests for analytics call
    if (this._cosmeticChestCollection && this._cosmeticChestCollection.models) {
      var models = this._cosmeticChestCollection.models;
      for (var i = 0, il = models.length; i < il; i++) {
        var chestModel = models[i];
        if (chestModel.get('chest_id') === crateId) {
          chestType = chestModel.get('chest_type');
          break;
        }
      }
    }

    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/crates/cosmetic_chest/' + crateId + '/unlock',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        data: '',
      });

      request.done(function (response) {
        // convert rewards to backbone models
        var rewardModels = [];
        for (var i = 0; i < response.length; i++) {
          rewardModels.push(new Backbone.Model(response[i]));
        }

        if (chestType != null) {
          Analytics.track('opened cosmetic crate', {
            category: Analytics.EventCategory.Crate,
            product_id: chestType,
          }, {
            labelKey: 'product_id',
          });
        }

        // resolve with rewards
        resolve(rewardModels);
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var error = 'Claim Cosmetic Chest rewards failed';
        if (response) {
          error += ' - Status ' + response.status;
        }
        if (response && response.responseJSON) {
          error += '<br>' + (response.responseJSON.error || response.responseJSON.message);
        }

        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(error);
      }.bind(this));
    }.bind(this));
  },

  /**
   * Returns a promise that resolves to an array of reward objects for a loot crate that is passed in by id
   * @public
   * @param {String} crateId - id of crate to claim rewards for
   */
  unlockGiftCrateWithId: function (crateId) {
    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/crates/gift_crate/' + crateId + '/unlock',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        // update gift crates
        // gift crates don't live in firebase
        // so we need to manually refresh
        this.refreshGiftCrates()
          .then(function () {
          // convert rewards to backbone models
            var rewardModels = [];
            for (var i = 0; i < response.length; i++) {
              rewardModels.push(new Backbone.Model(response[i]));
            }

            // resolve with rewards
            resolve(rewardModels);
          }.bind(this));
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var error = 'Claim Gift Crate rewards failed';
        if (response) {
          error += ' - Status ' + response.status;
        }
        if (response && response.responseJSON) {
          error += '<br>' + (response.responseJSON.error || response.responseJSON.message);
        }

        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(error);
      }.bind(this));
    }.bind(this));
  },

  /* endregion UNLOCK */

});
