// pragma PKGS: shop

'use strict';

var Scene = require('app/view/Scene');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var openUrl = require('app/common/openUrl');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var moment = require('moment');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsUI = require('app/common/utils/utils_ui');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var ShopManager = require('app/ui/managers/shop_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Logger = require('app/common/logger');

var CosmeticsFactory = require('app/sdk/cosmetics/cosmeticsFactory');
var CosmeticsType = require('app/sdk/cosmetics/cosmeticsTypeLookup');
var ShopData = require('app/data/shop.json');

var RedeemGiftCodeModalView = require('app/ui/views/item/redeem_gift_code_modal');
var PremiumPurchaseDialog = require('app/ui/views2/shop/premium_purchase_dialog');

var Session = require('app/common/session2');

var ShopProductCollectionView = require('./shop_product_collection_view');
var ShopSpiritOrbsCollectionView = require('./shop_spirit_orbs_collection_view');
var ShopSpecialsView = require('./shop_specials_view');
var Template = require('./templates/shop_layout.hbs');

var ShopLayout = Backbone.Marionette.LayoutView.extend({

  className: 'shop-layout',
  template: Template,
  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,
  selectedProductCategory: 'spirit-orbs',
  _previousBlurProgramKey: null,
  _screenBlurId: null,

  ui: {
    $productCollection: '.shop-product-collection-region',
    gold_amount: '.gold-amount',
    spirit_amount: '.spirit-amount',
    premium_amount: '.premium-amount',
    spirit_orb_count: '.spirit-orb-count',
    shop_menu: '.shop-menu',
    menu_item_specials: '.specials',
    menu_item_sales: '.sales',
  },

  events: {
    'click .shop-category > button': 'onProductCategoryChanged',
    'click .btn-get-help': 'onHelpPress',
    'click .btn-redeem-gift-code': 'onRedeemGiftCodePressed',
    'click .premium-currency-amount': 'onPremiumCurrencyPressed',
  },

  regions: {
    productCollectionRegion: '.shop-product-collection-region',
  },

  /* region MARIONETTE EVENTS */

  onRender: function () {
    this.bindScrollbars();
    this.onWalletChange();
  },

  onShow: function () {
    Analytics.page('Shop', { path: '/#shop' });

    // show ZENDSEK widget
    window.zE && window.zE.show && window.zE.show();

    if (ShopManager.getInstance().hasAnyEarnedSpecials()) {
      this.ui.menu_item_specials.removeClass('hide');
    }

    if (ShopManager.getInstance().getMappedActiveShopSaleDatas().length != 0) {
      this.ui.menu_item_sales.removeClass('hide');
    }

    // blur scene
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    // show initial products
    this.showProductCategory();

    // listen to events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.listenTo(InventoryManager.getInstance().walletModel, 'change', this.onWalletChange);
    this.listenTo(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onWalletChange);
  },

  onPrepareForDestroy: function () {
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);

    // hide ZENDSEK widget
    window.zE && window.zE.hide && window.zE.hide();
  },

  /* endregion MARIONETTE EVENTS */

  /* region LAYOUT */

  onResize: function () {
    this.bindScrollbars();
  },

  /* endregion LAYOUT */

  /* region EVENTS */

  onWalletChange: function () {
    this.ui.gold_amount.text(InventoryManager.getInstance().walletModel.get('gold_amount') || 0);
    this.ui.spirit_amount.text(InventoryManager.getInstance().walletModel.get('spirit_amount') || 0);
    this.ui.spirit_orb_count.text(InventoryManager.getInstance().boosterPacksCollection.length);
    this.ui.premium_amount.text(InventoryManager.getInstance().getWalletModelPremiumAmount());
  },

  /* endregion EVENTS */

  /* region CATEGORIES */

  onProductCategoryChanged: function (e) {
    var button = $(e.currentTarget);
    var selectedValue = button.data('value');
    this.setProductCategory(selectedValue);
  },

  setProductCategory: function (selectedValue) {
    if (selectedValue !== this.selectedProductCategory) {
      this.selectedProductCategory = selectedValue;
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
      $('button', this.ui.shop_menu).removeClass('active');
      this.ui.shop_menu.find('[data-value=\'' + selectedValue + '\']').addClass('active');
      this.showProductCategory(selectedValue);
    }
  },

  showProductCategory: function (category) {
    var productCollection = null;
    var subCategoryOrdering = null;
    var productCollectionView = null;
    switch (category) {
    case 'emotes':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.Emote), function (p) {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return parseInt(c.get('cosmetic_id')) === p.id; }) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.Emote);
      break;
    case 'profile-icons':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.ProfileIcon), function (p) {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return parseInt(c.get('cosmetic_id')) === p.id; }) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.ProfileIcon);
      break;
    case 'card-backs':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.CardBack), function (p) {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return parseInt(c.get('cosmetic_id')) === p.id; }) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.CardBack);
      break;
    case 'card-skins':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.CardSkin), function (p) {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return parseInt(c.get('cosmetic_id')) === p.id; }) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.CardSkin);
      break;
    case 'bundles':
      var productsDataValues = _.values(ShopData.bundles);
      productCollection = new Backbone.Collection(productsDataValues);
      break;
    case 'sales':
      var productsDataValues = ShopManager.getInstance().getMappedActiveShopSaleDatas();
      var productsArray = _.map(productsDataValues, function (p) {
        if (InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return parseInt(c.get('cosmetic_id')) === p.id; })) {
          p.is_purchased = true;
        }
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      break;
    case 'battle-maps':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.BattleMap), function (p) {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find(function (c) { return parseInt(c.get('cosmetic_id')) === p.id; }) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.BattleMap);
      break;
    case 'specials':
      productCollectionView = new ShopSpecialsView({ model: new Backbone.Model(ShopData.earned_specials) });
      break;
    default:
      productCollectionView = new ShopSpiritOrbsCollectionView({ model: new Backbone.Model() });
      break;
    }

    // show new products
    if (productCollection) {
      productCollectionView = new ShopProductCollectionView({ model: new Backbone.Model(), collection: productCollection, categoryOrdering: subCategoryOrdering });
    }
    productCollectionView.listenTo(productCollectionView, 'filter', this.bindScrollbars.bind(this));
    this.productCollectionRegion.show(productCollectionView);
    this.bindScrollbars();
  },

  bindScrollbars: function () {
    UtilsUI.overlayScrollbars(this.$el, this.ui.$productCollection);
  },

  /* endregion CATEGORIES */

  onHelpPress: function (e) {
  },

  onRedeemGiftCodePressed: function () {
    NavigationManager.getInstance().showModalView(new RedeemGiftCodeModalView());
  },

  onPremiumCurrencyPressed: _.throttle(function (e) {
    // NavigationManager.getInstance().showModalView(new PremiumPurchaseDialog());
  }, 1500, { trailing: false }),

});

module.exports = ShopLayout;
