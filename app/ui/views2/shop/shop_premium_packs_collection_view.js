// pragma PKGS: shop

'use strict';

var _ = require('underscore');
var moment = require('moment');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var ShopData = require('app/data/shop.json');
var Logger = require('app/common/logger');
// var PremiumShopData = require('app/data/premium_shop.json')
var audio_engine = require('app/audio/audio_engine');
var SDK = require('app/sdk');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ShopManager = require('app/ui/managers/shop_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var openUrl = require('app/common/openUrl');
var Template = require('./templates/shop_premium_packs_collection_view.hbs');

var ShopPremiumPacksCollectionView = Backbone.Marionette.ItemView.extend({

  className: 'shop-premium-packs-container',
  selectedSubCategory: null,
  initialSubCategory: null,
  template: Template,
  tooltipElement: null,
  events: {
    'click button': 'onSelectProduct',
  },

  _premiumProductsData: null,

  /* ui selector cache */
  ui: {
    productForGoldButtons: '.product-for-gold .btn-buy',
    premiumPackProducts: '.shop-premium-packs',
    tabs: '.nav-tabs',
    tabBody: '.tab-body',
  },

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    return data;
  },

  initialize: function (opts) {
  },

  onRender: function () {
    this.onWalletChange();
  },

  onShow: function () {
    this.listenTo(InventoryManager.getInstance().walletModel, 'change', this.onWalletChange);
    this.onWalletChange();
  },

  onPrepareForDestroy: function () {
  },

  onWalletChange: function () {
  },

  /* region PURCHASE */

  onSelectProduct: function (e) {
  },

  onPurchaseComplete: function (purchaseData) {
  },

  /* endregion PURCHASE */

});

module.exports = ShopPremiumPacksCollectionView;
