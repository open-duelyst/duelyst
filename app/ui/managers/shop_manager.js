// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _ShopManager = {};
_ShopManager.instance = null;
_ShopManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new ShopManager();
  }
  return this.instance;
};
_ShopManager.current = _ShopManager.getInstance;

module.exports = _ShopManager;

var _ = require('underscore');
var Promise = require('bluebird');
var Firebase = require('firebase');
var Logger = require('app/common/logger');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var moment = require('moment');
var Analytics = require('app/common/analytics');
var CosmeticsFactory = require('app/sdk/cosmetics/cosmeticsFactory');
var GamesManager = require('./games_manager');
var ProgressionManager = require('./progression_manager');
var ProfileManager = require('./profile_manager');
var Manager = require('./manager');

var ShopManager = Manager.extend({

  isNewSpecialAvailable: false,
  availableSpecials: null,
  productPurchaseCountsModel: null,
  _shopProductsModel: null,
  _premiumProductsModel: null,
  _userPremiumReceiptsRef: null,
  _shopSalesCollection: null,
  _shopSalesLastUpdatedAtModel: null,

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    this.availableSpecials = new DuelystBackbone.Collection();

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');
        this.productPurchaseCountsModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('user-purchase-counts').child(userId),
        });

        this._userPremiumReceiptsRef = new Firebase(process.env.FIREBASE_URL).child('user-premium-receipts').child(userId).orderByChild('created_at')
          .startAt(moment().utc().valueOf());
        this._userPremiumReceiptsRef.on('child_added', this._onUserReceiptAdded.bind(this));

        // this._shopSalesCollection = new Firebase(process.env.FIREBASE_URL).child('shop-sales');
        // this._shopSalesCollection.on('child_added', this._onUserReceiptAdded.bind(this));
        this._shopSalesCollection = new DuelystBackbone.Collection();
        this._shopSalesCollection.url = process.env.API_URL + '/api/me/shop/sales';
        this._shopSalesCollection.fetch();

        this._shopProductsModel = new DuelystBackbone.Model();
        this._shopProductsModel.url = process.env.API_URL + '/api/me/shop/products';
        this._shopProductsModel.fetch();

        this._premiumProductsModel = new DuelystBackbone.Model();
        this._premiumProductsModel.url = process.env.API_URL + '/api/me/shop/premium_pack_products';
        this._premiumProductsModel.fetch();

        this._shopSalesLastUpdatedAtModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('shop-sales'),
        });

        this._markAsReadyWhenModelsAndCollectionsSynced([
          this.productPurchaseCountsModel,
          this._shopProductsModel,
          this._shopSalesLastUpdatedAtModel,
          this._premiumProductsModel,
        ]);
      });

    // what to do when we're ready
    Promise.all([
      this.onReady(),
      ProgressionManager.getInstance().onReady(),
    ])
      .bind(this)
      .then(function () {
      // whenever a purchase count changes, fire off a method that can clear out specials
        this.listenTo(this.productPurchaseCountsModel, 'change', this.onPurchaseCountsChanged.bind(this));
        // after everything is ready, update the available specials with the new requirements
        this.updateAvailableSpecialsWithNewRequirements();
        this.listenTo(ProgressionManager.getInstance().gameCounterModel, 'change', this.updateAvailableSpecialsWithNewRequirements);
        this.listenTo(this._shopSalesLastUpdatedAtModel, 'change', this.onSalesUpdatedChanged.bind(this));
        this.listenTo(this.availableSpecials, 'add', this.onNewSpecialHasBecomeAvailable);
        this.isNewSpecialAvailable = false;
      });
  },

  _retrievePremiumProductsData: function () {
    return this._premiumProductsModel.fetch().then(function (data) {
      // If we didn't get anything back, reject
      if (data == null) {
        return Promise.reject(new Error('Invalid Premium Product Data'));
      }
      // Sort the premium products
      data = _.sortBy(data, function (d) { return d.premium_currency; });
      // Attach display data based on pack size
      var packKeys = ['small', 'medium', 'large', 'massive', 'ultimate'];
      _.each(data, function (d, index) {
        var key = packKeys[Math.min(index, packKeys.length - 1)];
        d.icon_image_resource_name = 'shop_premium_pack_' + key;
        d.name = key[0].toUpperCase() + key.slice(1) + ' Premium Pack';
        // Map bn keys to consistent duelyst keys
        d.price = d.premium_currency;
        d.gold = d.currency_price;
      });
      return Promise.resolve(data);
    }.bind(this));
  },

  onPurchaseCountsChanged: function (m) {
    // Check if specials are still valid
    var toRemove = [];
    this.availableSpecials.each(function (special) {
      if (special.get('purchase_limit') <= this.getPurchaseCount(special.get('sku'))) {
        toRemove.push(special);
      }
    }.bind(this));
    this.availableSpecials.remove(toRemove);
    // TODO - Check if premium purchases are still valid
  },

  onSalesUpdatedChanged: function () {
    this._salesCachesBuiltAt = null;
    this._shopSalesCollection.fetch();
  },

  _onUserReceiptAdded: function (userReceipt) {
    // FIXME - Why is this here?
    if (userReceipt != null) {
      var userReceiptData = userReceipt.val();
      if (userReceiptData.sku != null && userReceiptData.price != null) {
        Analytics.trackMonetizationEvent(userReceiptData.sku, userReceiptData.price);

        if (userReceiptData.total_platinum_amount) {
          Analytics.track('premium currency purchased', {
            category: Analytics.EventCategory.Shop,
            sku: userReceiptData.sku,
            price: userReceiptData.price,
            total_platinum_amount: userReceiptData.total_platinum_amount,
          }, {
            labelKey: 'sku',
            valueKey: 'price',
          });
        }
      }
    }
  },

  onNewSpecialHasBecomeAvailable: function (m) {
    this.isNewSpecialAvailable = true;
  },

  markNewAvailableSpecialAsRead: function () {
    this.isNewSpecialAvailable = false;
  },

  updateAvailableSpecialsWithNewRequirements: function (statRequirements) {
    var topSeasonRank = GamesManager.getInstance().topRankingModel.get('rank') || 30;
    var lastKnownRank = GamesManager.getInstance().rankingModel.get('rank') || 30;
    var topRank = Math.min(topSeasonRank, lastKnownRank);

    var statRequirements = {
      top_rank: topRank,
      win_count: ProgressionManager.getInstance().gameCounterModel.get('win_count'),
    };

    _.chain(this._shopProductsModel.get('earned_specials')).keys().each(function (productKey) {
      var special = this._shopProductsModel.get('earned_specials')[productKey];

      // var specialModel = new DuelystBackbone.Model(special)
      // specialModel.id = special.sku
      // if (!this.availableSpecials.get(specialModel.id)) {
      //   this.availableSpecials.add(specialModel)
      //   this.isNewSpecialAvailable = true
      // }
      if (special.purchase_limit > this.getPurchaseCount(special.sku)) {
        if (special.minimum_requirements.top_rank && special.minimum_requirements.top_rank >= statRequirements.top_rank) {
          var specialModel = new DuelystBackbone.Model(special);
          specialModel.id = special.sku;
          this.availableSpecials.add(specialModel);
        }
        if (special.minimum_requirements.win_count && special.minimum_requirements.win_count <= statRequirements.win_count) {
          var specialModel = new DuelystBackbone.Model(special);
          specialModel.id = special.sku;
          this.availableSpecials.add(specialModel);
        }
        if (special.minimum_requirements.is_starter_special) {
          var specialModel = new DuelystBackbone.Model(special);
          specialModel.id = special.sku;
          this.availableSpecials.add(specialModel);
        }
      }
    }.bind(this));
  },

  hasAnyEarnedSpecials: function () {
    return this.availableSpecials.length > 0;
  },

  getPurchaseCount: function (sku) {
    return (this.productPurchaseCountsModel.get(sku) && this.productPurchaseCountsModel.get(sku).count) || 0;
  },

  getAttemptedPurchaseCount: function (sku) {
    return this.productPurchaseCountsModel.get('_' + sku) || 0;
  },

  markAttemptedPurchase: function (sku) {
    this.productPurchaseCountsModel.set('_' + sku, 1);
  },

  hasAttemptedPurchase: function (sku) {
    return this.getAttemptedPurchaseCount(sku) > 0;
  },

  _buildShopSalesCachesIfNeeded: function () {
    var momentNowUtc = moment.utc();

    // Build caches if they havent been built yet or if we have passed the next time to rebuild
    if (this._salesCachesBuiltAt != null && (this._salesCachesNeedRebuildAt != null && this._salesCachesBuiltAt < this._salesCachesNeedRebuildAt)) {
      return;
    }

    this._salesCachesBuiltAt = momentNowUtc.valueOf();

    this._activeShopSaleModelsCache = null;
    this._activeShopSaleDatasCache = null;
    this._activeShopSaleModelsBySkuCache = null;

    // Add any convenience data
    for (var i = 0; i < this._shopSalesCollection.models.length; i++) {
      var saleModel = this._shopSalesCollection.models[i];
      var productData = this.productDataForSKU(saleModel.get('sku'));

      var discountPercentage = Math.round(100 * (1.0 - (saleModel.get('sale_price') / productData.price)));
      saleModel.set('sale_discount_percent', discountPercentage);
    }

    // Sale Models Cache
    var activeShopSalesModels = [];
    var nextActiveSaleStartAt = null;

    if (this._shopSalesCollection != null) {
      this._shopSalesCollection.each(function (shopSaleModel) {
        if (moment.utc(shopSaleModel.get('sale_starts_at')).isBefore(momentNowUtc)
          && moment.utc(shopSaleModel.get('sale_ends_at')).isAfter(momentNowUtc)) {
          activeShopSalesModels.push(shopSaleModel);
        }

        if (moment.utc(shopSaleModel.get('sale_starts_at')).isAfter(momentNowUtc)) {
          if (nextActiveSaleStartAt == null) {
            nextActiveSaleStartAt = moment.utc(shopSaleModel.get('sale_starts_at')).valueOf();
          } else if (nextActiveSaleStartAt > moment.utc(shopSaleModel.get('sale_starts_at')).valueOf()) {
            nextActiveSaleStartAt = moment.utc(shopSaleModel.get('sale_starts_at')).valueOf();
          }
        }
      }.bind(this));
    }

    this._activeShopSaleModelsCache = activeShopSalesModels;
    if (nextActiveSaleStartAt != null) {
      this._salesCachesNeedRebuildAt = nextActiveSaleStartAt;
    }

    // Sale Product Datas cache
    var mappedShopSaleDatas = [];

    for (var i = 0; i < this._activeShopSaleModelsCache.length; i++) {
      var saleModel = this._activeShopSaleModelsCache[i];
      var productData = this.productDataForSKU(saleModel.get('sku'));
      var saleData = _.extend({}, saleModel.attributes, productData);
      mappedShopSaleDatas.push(saleData);
    }

    this._activeShopSaleDatasCache = mappedShopSaleDatas;

    // Sale models by sku cache
    var activeShopSaleModelsBySku = {};

    for (var i = 0; i < this._activeShopSaleModelsCache.length; i++) {
      var saleModel = this._activeShopSaleModelsCache[i];
      var saleSku = saleModel.get('sku');
      if (activeShopSaleModelsBySku[saleSku] == null) {
        activeShopSaleModelsBySku[saleSku] = saleModel;
      } else {
        // Collisions shouldnt happen, but in case of overlapping sales default to the one expiring last
        if (moment.utc(saleModel.get('sale_ends_at')).isAfter(moment.utc(activeShopSaleModelsBySku[saleSku].get('sale_ends_at')))) {
          activeShopSaleModelsBySku[saleSku] = saleModel;
        }
      }
    }

    this._activeShopSaleModelsBySkuCache = activeShopSaleModelsBySku;
  },

  getActiveShopSalesModels: function () {
    this._buildShopSalesCachesIfNeeded();
    return this._activeShopSaleModelsCache;
  },

  getMappedActiveShopSaleDatas: function () {
    this._buildShopSalesCachesIfNeeded();
    return this._activeShopSaleDatasCache;
  },

  getActiveShopSaleModelForSku: function (sku) {
    if (sku == null) {
      return null;
    }
    this._buildShopSalesCachesIfNeeded();
    return this._activeShopSaleModelsBySkuCache[sku];
  },

  _allProducts: function () {
    var categories = _.keys(this._shopProductsModel).concat(_.keys(this._premiumProductsModel));
    var categoryProducts = _.map(categories, function (category) {
      return _.values(this._shopProductsModel.get(category) || []).concat(_.values(this._premiumProductsModel.get(category) || []));
    });
    var allProducts = _.flatten(categoryProducts);
    return allProducts;
  },

  productDataForSKU: function (sku) {
    var productData = _.find(this._allProducts(), function (p) { return p.sku == sku; });
    if (productData == null) {
      productData = CosmeticsFactory.cosmeticProductAttrsForSKU(sku);
    }
    return productData;
  },

});
