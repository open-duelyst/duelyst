// pragma PKGS: shop

const _ = require('underscore');
const moment = require('moment');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const ShopData = require('app/data/shop.json');
const Logger = require('app/common/logger');
// var PremiumShopData = require('app/data/premium_shop.json')
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const NavigationManager = require('app/ui/managers/navigation_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ShopManager = require('app/ui/managers/shop_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const openUrl = require('app/common/openUrl');
const Template = require('./templates/shop_premium_packs_collection_view.hbs');

const ShopPremiumPacksCollectionView = Backbone.Marionette.ItemView.extend({

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

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    return data;
  },

  initialize(opts) {
  },

  onRender() {
    this.onWalletChange();
  },

  onShow() {
    this.listenTo(InventoryManager.getInstance().walletModel, 'change', this.onWalletChange);
    this.onWalletChange();
  },

  onPrepareForDestroy() {
  },

  onWalletChange() {
  },

  /* region PURCHASE */

  onSelectProduct(e) {
    if (window.isSteam) {
      return this.onSelectProductSteam(e);
    }
  },

  onSelectProductSteam(e) {
    const productSkuId = $(e.currentTarget).data('productSkuId');
    // return InventoryManager.getInstance().purchaseProductSkuOnSteam([{sku_id: productSkuId, qty: 1}])
    // .then(function(steamUrl){
    //   // open [steam] browser then flash success
    //   // check platform here to determine if to use steam browser
    //   if (window.steamworksOverlayEnabled) {
    //     window.steamworks.activateGameOverlayToWebPage(steamUrl)
    //   } else {
    //     openUrl(steamUrl)
    //   }
    // })
    // .catch(function(e){
    //   Logger.module('STEAM').error("Initializing Steam transaction failed: #{e.message}")
    // })
  },

  onPurchaseComplete(purchaseData) {
  },

  /* endregion PURCHASE */

});

module.exports = ShopPremiumPacksCollectionView;
