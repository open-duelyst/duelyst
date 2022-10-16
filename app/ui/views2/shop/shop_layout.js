// pragma PKGS: shop

const Scene = require('app/view/Scene');
const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const openUrl = require('app/common/openUrl');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const moment = require('moment');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsUI = require('app/common/utils/utils_ui');
const audio_engine = require('app/audio/audio_engine');
const Animations = require('app/ui/views/animations');
const ShopManager = require('app/ui/managers/shop_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const Logger = require('app/common/logger');

const CosmeticsFactory = require('app/sdk/cosmetics/cosmeticsFactory');
const CosmeticsType = require('app/sdk/cosmetics/cosmeticsTypeLookup');
const ShopData = require('app/data/shop.json');

const RedeemGiftCodeModalView = require('app/ui/views/item/redeem_gift_code_modal');
const PremiumPurchaseDialog = require('app/ui/views2/shop/premium_purchase_dialog');

const Session = require('app/common/session2');

const ShopProductCollectionView = require('./shop_product_collection_view');
const ShopSpiritOrbsCollectionView = require('./shop_spirit_orbs_collection_view');
const ShopSpecialsView = require('./shop_specials_view');
const Template = require('./templates/shop_layout.hbs');

const ShopLayout = Backbone.Marionette.LayoutView.extend({

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

  onRender() {
    this.bindScrollbars();
    this.onWalletChange();
  },

  onShow() {
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

  onPrepareForDestroy() {
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);

    // hide ZENDSEK widget
    window.zE && window.zE.hide && window.zE.hide();
  },

  /* endregion MARIONETTE EVENTS */

  /* region LAYOUT */

  onResize() {
    this.bindScrollbars();
  },

  /* endregion LAYOUT */

  /* region EVENTS */

  onWalletChange() {
    this.ui.gold_amount.text(InventoryManager.getInstance().walletModel.get('gold_amount') || 0);
    this.ui.spirit_amount.text(InventoryManager.getInstance().walletModel.get('spirit_amount') || 0);
    this.ui.spirit_orb_count.text(InventoryManager.getInstance().boosterPacksCollection.length);
    this.ui.premium_amount.text(InventoryManager.getInstance().getWalletModelPremiumAmount());
  },

  /* endregion EVENTS */

  /* region CATEGORIES */

  onProductCategoryChanged(e) {
    const button = $(e.currentTarget);
    const selectedValue = button.data('value');
    this.setProductCategory(selectedValue);
  },

  setProductCategory(selectedValue) {
    if (selectedValue !== this.selectedProductCategory) {
      this.selectedProductCategory = selectedValue;
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
      $('button', this.ui.shop_menu).removeClass('active');
      this.ui.shop_menu.find(`[data-value='${selectedValue}']`).addClass('active');
      this.showProductCategory(selectedValue);
    }
  },

  showProductCategory(category) {
    let productCollection = null;
    let subCategoryOrdering = null;
    let productCollectionView = null;
    switch (category) {
    case 'emotes':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.Emote), (p) => {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find((c) => parseInt(c.get('cosmetic_id')) === p.id) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.Emote);
      break;
    case 'profile-icons':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.ProfileIcon), (p) => {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find((c) => parseInt(c.get('cosmetic_id')) === p.id) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.ProfileIcon);
      break;
    case 'card-backs':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.CardBack), (p) => {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find((c) => parseInt(c.get('cosmetic_id')) === p.id) || false;
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      subCategoryOrdering = CosmeticsFactory.visibleCosmeticSubTypesForType(CosmeticsType.CardBack);
      break;
    case 'card-skins':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.CardSkin), (p) => {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find((c) => parseInt(c.get('cosmetic_id')) === p.id) || false;
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
      var productsArray = _.map(productsDataValues, (p) => {
        if (InventoryManager.getInstance().getCosmeticsCollection().find((c) => parseInt(c.get('cosmetic_id')) === p.id)) {
          p.is_purchased = true;
        }
        return p;
      });
      productCollection = new Backbone.Collection(productsArray);
      break;
    case 'battle-maps':
      var productsArray = _.map(CosmeticsFactory.cosmeticProductDataForType(CosmeticsType.BattleMap), (p) => {
        p.is_purchased = InventoryManager.getInstance().getCosmeticsCollection().find((c) => parseInt(c.get('cosmetic_id')) === p.id) || false;
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

  bindScrollbars() {
    UtilsUI.overlayScrollbars(this.$el, this.ui.$productCollection);
  },

  /* endregion CATEGORIES */

  onHelpPress(e) {
  },

  onRedeemGiftCodePressed() {
    NavigationManager.getInstance().showModalView(new RedeemGiftCodeModalView());
  },

  onPremiumCurrencyPressed: _.throttle((e) => {
    // if (!window.isSteam) {
    //   Session.initPremiumPurchase()
    //   .then(function (url) {
    //     if (window.isDesktop) {
    //       window.ipcRenderer.send('create-window', {
    //         url: url,
    //         width: 920,
    //         height: 660
    //       })
    //     } else {
    //       openUrl(url)
    //     }
    //   })
    // } else {
    //   NavigationManager.getInstance().showModalView(new PremiumPurchaseDialog());
    // }
  }, 1500, { trailing: false }),

});

module.exports = ShopLayout;
