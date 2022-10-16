// pragma PKGS: shop

const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const audio_engine = require('app/audio/audio_engine');
const Animations = require('app/ui/views/animations');
const InventoryManager = require('app/ui/managers/inventory_manager');
const EVENTS = require('app/common/event_types');
const ProfileManager = require('app/ui/managers/profile_manager');
const Analytics = require('app/common/analytics');
const moment = require('moment');
const ShopSpiritOrbsCollectionView = require('./shop_spirit_orbs_collection_view');
const Template = require('./templates/shop_spirit_orbs_modal.hbs');

const ShopSpiritOrbsModalView = Backbone.Marionette.LayoutView.extend({

  className: 'shop-spirit-orbs-modal',
  template: Template,
  selectedCardSetTab: null,

  ui: {
    gold_amount: '.gold-amount',
    spirit_orb_count: '.spirit-orb-count',
    premium_amount: '.premium-amount',
  },

  regions: {
    productCollectionRegion: '.shop-product-collection-region',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  /* region INITIALIZE */

  initialize(opts) {
    // Listen for PayPal 'cancel' event if the user closes PayPal window
    if (window.isDesktop) {
      // window.ipcRenderer.on('paypal-cancel', this.onCancelConfirmPurchase.bind(this))
    }

    this.selectedCardSetTab = opts.selectedCardSetTab;
  },

  /* endregion INITIALIZE */

  /* region MARIONETTE EVENTS */

  onRender() {
    this.onWalletChange();
  },

  onShow() {
    Analytics.page('Shop', { path: '/#shop' });

    this.listenTo(InventoryManager.getInstance().walletModel, 'change', this.onWalletChange);
    this.listenTo(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onWalletChange);

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);

    // show spirit orbs shop
    const orbsCollectionView = new ShopSpiritOrbsCollectionView({ model: new Backbone.Model({}), selectedCardSetTab: this.selectedCardSetTab });
    this.productCollectionRegion.show(orbsCollectionView);
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENTS */

  onWalletChange() {
    this.ui.gold_amount.text(InventoryManager.getInstance().walletModel.get('gold_amount'));
    this.ui.spirit_orb_count.text(InventoryManager.getInstance().boosterPacksCollection.length);
    this.ui.premium_amount.text(InventoryManager.getInstance().getWalletModelPremiumAmount());
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = ShopSpiritOrbsModalView;
