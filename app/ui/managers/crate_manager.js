// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _CosmeticChestManager = {};
_CosmeticChestManager.instance = null;
_CosmeticChestManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new CrateManager();
  }
  return this.instance;
};
_CosmeticChestManager.current = _CosmeticChestManager.getInstance;

module.exports = _CosmeticChestManager;

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const Promise = require('bluebird');
const Analytics = require('app/common/analytics');
const _ = require('underscore');
const moment = require('moment');
const GiftCrateLookup = require('../../sdk/giftCrates/giftCrateLookup.coffee');
const GiftCrateFactory = require('../../sdk/giftCrates/giftCrateFactory.coffee');
const ProfileManager = require('./profile_manager');
const Manager = require('./manager');

var CrateManager = Manager.extend({

  _cosmeticChestCollection: null,
  _cosmeticChestKeyCollection: null,
  _giftCrateCollection: null,

  _activeCosmeticChestsCache: null,

  initialize(options) {
    Manager.prototype.initialize.call(this);
  },

  /* region CONNECT */

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');

        this._cosmeticChestCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/cosmetic-chests`,
        });

        this._cosmeticChestKeyCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/cosmetic-chest-keys`,
        });

        this._giftCrateCollection = new DuelystBackbone.Collection();
        this._giftCrateCollection.url = `${process.env.API_URL}/api/me/crates/gift_crates`;
        this._giftCrateCollection.fetch();

        this._markAsReadyWhenModelsAndCollectionsSynced([
          this._cosmeticChestCollection,
          this._cosmeticChestKeyCollection,
          this._giftCrateCollection,
        ]);

        this.onReady().then(() => {
          this.listenTo(this._cosmeticChestCollection, 'change add remove', this.onCosmeticChestCollectionChange);
          this.listenTo(this._cosmeticChestKeyCollection, 'change add remove', this.onCosmeticChestKeyCollectionChange);

          if (this._giftCrateCollection && this._giftCrateCollection.length > 0
          || this._cosmeticChestCollection && this._cosmeticChestCollection.length > 0
          || this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.length > 0) {
            NewPlayerManager.getInstance().onReady().then(() => {
              NewPlayerManager.getInstance().setHasReceivedCrateProduct();
            });
          }
        });
      });
  },

  onBeforeDisconnect() {
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

  getActiveCosmeticChestModels() {
    if (this._activeCosmeticChestsCache == null) {
      // If there's no cache then build it
      let chests = [];
      if (this._cosmeticChestCollection != null && this._cosmeticChestCollection.models != null && this._cosmeticChestCollection.models.length != 0) {
        const momentNowUtc = moment.utc();
        const chestModels = this._cosmeticChestCollection.models;
        chests = _.filter(chestModels, (chestModel) => {
          // Filter chests by expiration if they have one
          const chestExpirationAt = chestModel.get('expires_at');
          if (chestExpirationAt != null) {
            const crateExpirationMoment = moment.utc(chestModel.get('expires_at'));
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
  getOpenableChestType() {
    if (this.getGiftCrateCount(GiftCrateLookup.FrostfirePremiumPurchasable2017) > 0) {
      return GiftCrateLookup.FrostfirePremiumPurchasable2017;
    }

    if (this.getGiftCrateCount(GiftCrateLookup.FrostfirePurchasable2017) > 0) {
      return GiftCrateLookup.FrostfirePurchasable2017;
    }

    if (this.getGiftCrateCount() > 0) {
      return 'gift';
    }

    const activeCosmeticChests = this.getActiveCosmeticChestModels();
    for (let i = 0; i < activeCosmeticChests.length; i++) {
      const chestModel = activeCosmeticChests[i];
      if (chestModel.get('chest_type') != null) {
        return chestModel.get('chest_type');
      }
    }

    return null;
  },

  getCosmeticChestCount() {
    return this.getActiveCosmeticChestModels().length;
  },

  getCosmeticChestModelsForType(chestType) {
    const chestsForType = [];

    const models = this.getActiveCosmeticChestModels();
    for (let i = 0, il = models.length; i < il; i++) {
      const chestModel = models[i];
      if (chestModel.get('chest_type') === chestType) {
        chestsForType.push(chestModel);
      }
    }
    return chestsForType;
  },

  getNextBossCrateExpirationMoment() {
    const bossCrates = this.getCosmeticChestModelsForType(SDK.CosmeticsChestTypeLookup.Boss);

    if (bossCrates.length == 0) {
      return null;
    }
    const bossCratesSortedByAscExpiration = _.sortBy(bossCrates, (bossCrate) => bossCrate.get('expires_at'));
    const nextExpiringBossCrate = bossCratesSortedByAscExpiration[0];
    return moment.utc(nextExpiringBossCrate.get('expires_at'));
  },

  getCosmeticChestCountForType(chestType) {
    return this.getCosmeticChestModelsForType(chestType).length;
  },

  getNextAvailableCosmeticChestIdForType(chestType) {
    let models = this.getCosmeticChestModelsForType(chestType);

    if (models == null || models.length == 0) {
      return null;
    }

    if (chestType == SDK.CosmeticsChestTypeLookup.Boss) {
      models = _.sortBy(models, (model) => model.get('expires_at'));
    }

    return models[0].get('chest_id');
  },

  onCosmeticChestCollectionChange() {
    // Invalidate cosmetics chest cache
    this._activeCosmeticChestsCache = null;

    NewPlayerManager.getInstance().setHasReceivedCrateProduct();
    EventBus.getInstance().trigger(EVENTS.cosmetic_chest_collection_change);
  },

  /* endregion CHESTS */

  /* region KEYS */

  getCosmeticChestKeyCount() {
    return (this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.length) || 0;
  },

  getCosmeticChestKeyModelsForType(chestType) {
    const chests = [];
    if (this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.models) {
      const { models } = this._cosmeticChestKeyCollection;
      for (let i = 0, il = models.length; i < il; i++) {
        const chestKeyModel = models[i];
        if (chestKeyModel.get('key_type') === chestType) {
          chests.push(chestKeyModel);
        }
      }
    }
    return chests;
  },

  getCosmeticChestKeyCountForType(chestType) {
    return this.getCosmeticChestKeyModelsForType(chestType).length;
  },

  getNextAvailableCosmeticChestKeyIdForType(chestType) {
    if (this._cosmeticChestKeyCollection && this._cosmeticChestKeyCollection.models) {
      const { models } = this._cosmeticChestKeyCollection;
      for (let i = 0, il = models.length; i < il; i++) {
        const chestKeyModel = models[i];
        if (chestKeyModel.get('key_type') === chestType) {
          return chestKeyModel.get('key_id');
        }
      }
    }

    return null;
  },

  onCosmeticChestKeyCollectionChange() {
    NewPlayerManager.getInstance().setHasReceivedCrateProduct();
    EventBus.getInstance().trigger(EVENTS.cosmetic_chest_key_collection_change);
  },

  /* endregion KEYS */

  /* region GIFT CRATES */

  getGiftCrateCount(giftCrateType) {
    if (this._giftCrateCollection && this._giftCrateCollection.models) {
      let count = 0;
      const { models } = this._giftCrateCollection;
      for (let i = 0, il = models.length; i < il; i++) {
        const giftCrateModel = models[i];
        if (GiftCrateFactory.getIsCrateTypeAvailable(giftCrateModel.get('crate_type'))) {
          if (giftCrateType != null && giftCrateModel.get('crate_type') == giftCrateType) {
            count++;
          } else if (giftCrateType == null && !this.getIsSpecialGiftCrate(giftCrateModel.get('crate_type'))) {
            count++;
          }
        }
      }
      return count;
    }
    return 0;
  },

  // For things like Frostfire gift crate which is displayed separately than regular gift crates
  getIsSpecialGiftCrate(giftCrateType) {
    if (giftCrateType == GiftCrateLookup.FrostfirePurchasable2017) {
      return true;
    }

    if (giftCrateType == GiftCrateLookup.FrostfirePremiumPurchasable2017) {
      return true;
    }

    return false;
  },

  getNextAvailableGiftCrateId(giftCrateType) {
    if (this._giftCrateCollection && this._giftCrateCollection.models) {
      const { models } = this._giftCrateCollection;
      for (let i = 0, il = models.length; i < il; i++) {
        const giftCrateModel = models[i];
        if (GiftCrateFactory.getIsCrateTypeAvailable(giftCrateModel.get('crate_type'))) {
          if (giftCrateType != null && giftCrateModel.get('crate_type') == giftCrateType) {
            return giftCrateModel.get('crate_id');
          } if (giftCrateType == null && !this.getIsSpecialGiftCrate(giftCrateModel.get('crate_type'))) {
            return giftCrateModel.get('crate_id');
          }
        }
      }
    }
    // None found, return null
    return null;
  },

  getGiftCrateModelForId(crateId) {
    return _.find(this._giftCrateCollection.models, (model) => model.get('crate_id') == crateId);
  },

  refreshGiftCrates() {
    return new Promise((resolve, reject) => {
      const giftCrateRequest = this._giftCrateCollection.fetch();

      giftCrateRequest.done((response) => {
        EventBus.getInstance().trigger(EVENTS.gift_crate_collection_change);
        if (this._giftCrateCollection && this._giftCrateCollection.length > 0) {
          NewPlayerManager.getInstance().setHasReceivedCrateProduct();
        }
        resolve(response);
      });

      giftCrateRequest.fail((response) => {
        const error = 'GIFT CRATE request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);

        reject(new Error(error));
      });
    });
  },

  /* endregion GIFT CRATES */

  /* region UNLOCK */

  /**
   * Returns a promise that resolves to an array of reward objects for a loot crate that is passed in by id
   * @public
   * @param {String} crateId - id of crate to claim rewards for
   */
  unlockCosmeticChestWithId(crateId) {
    let chestType = null;
    // find chest type from current chests for analytics call
    if (this._cosmeticChestCollection && this._cosmeticChestCollection.models) {
      const { models } = this._cosmeticChestCollection;
      for (let i = 0, il = models.length; i < il; i++) {
        const chestModel = models[i];
        if (chestModel.get('chest_id') === crateId) {
          chestType = chestModel.get('chest_type');
          break;
        }
      }
    }

    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/crates/cosmetic_chest/${crateId}/unlock`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        data: '',
      });

      request.done((response) => {
        // convert rewards to backbone models
        const rewardModels = [];
        for (let i = 0; i < response.length; i++) {
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
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        let error = 'Claim Cosmetic Chest rewards failed';
        if (response) {
          error += ` - Status ${response.status}`;
        }
        if (response && response.responseJSON) {
          error += `<br>${response.responseJSON.error || response.responseJSON.message}`;
        }

        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(error);
      });
    });
  },

  /**
   * Returns a promise that resolves to an array of reward objects for a loot crate that is passed in by id
   * @public
   * @param {String} crateId - id of crate to claim rewards for
   */
  unlockGiftCrateWithId(crateId) {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/crates/gift_crate/${crateId}/unlock`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        // update gift crates
        // gift crates don't live in firebase
        // so we need to manually refresh
        this.refreshGiftCrates()
          .then(() => {
          // convert rewards to backbone models
            const rewardModels = [];
            for (let i = 0; i < response.length; i++) {
              rewardModels.push(new Backbone.Model(response[i]));
            }

            // resolve with rewards
            resolve(rewardModels);
          });
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        let error = 'Claim Gift Crate rewards failed';
        if (response) {
          error += ` - Status ${response.status}`;
        }
        if (response && response.responseJSON) {
          error += `<br>${response.responseJSON.error || response.responseJSON.message}`;
        }

        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(error);
      });
    });
  },

  /* endregion UNLOCK */

});
