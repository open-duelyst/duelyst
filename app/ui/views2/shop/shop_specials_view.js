// pragma PKGS: shop

const _ = require('underscore');
const moment = require('moment');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const ShopData = require('app/data/shop.json');
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const NavigationManager = require('app/ui/managers/navigation_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ShopManager = require('app/ui/managers/shop_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const i18next = require('i18next');
const Template = require('./templates/shop_specials_view.hbs');

const ShopSpecialsView = Backbone.Marionette.ItemView.extend({

  className: 'shop-specials-container',
  selectedSubCategory: null,
  initialSubCategory: null,
  template: Template,
  tooltipElement: null,
  events: {
    'click button': 'onSelectProduct',
    'click .nav-tabs li': 'onSubCategoryChanged',
  },

  /* ui selector cache */
  ui: {
    tabs: '.nav-tabs',
    tabBody: '.tab-body',
  },

  serializeModel(model) {
    // var data =  model.toJSON.apply(model, _.rest(arguments))
    // var keys = _.keys(data)
    // var specials = []
    // _.each(keys,function(k){
    //   specials.push(data[k])
    // })

    return {
      specials: ShopManager.getInstance().availableSpecials.toJSON(),
    };
  },

  initialize(opts) {
    this.listenTo(ShopManager.getInstance().availableSpecials, 'add remove', this.render.bind(this));
  },

  onShow() {
    this.setSubCategory(this.initialSubCategory);
    ShopManager.getInstance().availableSpecials.each((m) => {
      NewPlayerManager.getInstance().setModuleStage(m.id.toLowerCase(), 'read');
    });
  },

  onPrepareForDestroy() {
  },

  /* region PURCHASE */

  onSelectProduct(e) {
    const productSku = $(e.currentTarget).data('product-sku');
    const productData = ShopData.earned_specials[productSku];

    let packProductData = _.extend({
      cover_image_url: 'resources/play/play_mode_rankedladder.jpg',
    }, productData);

    packProductData = _.extend(packProductData, {
      name: i18next.t(`shop.${productData.name}`),
      description: i18next.t(`shop.${productData.description}`),
    });

    return NavigationManager.getInstance().showDialogForConfirmPurchase(packProductData)
      .bind(this)
      .then(function (purchaseData) {
        this.onPurchaseComplete(purchaseData);
      })
      .catch(() => {
        // do nothing on cancel
      });
  },

  onPurchaseComplete(purchaseData) {
  },

  /* endregion PURCHASE */

  onSubCategoryChanged(e) {
    const button = $(e.currentTarget);
    const selectedValue = button.data('value');
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.setSubCategory(selectedValue);
  },

  setSubCategory(selectedValue) {
    if (selectedValue !== this.selectedSubCategory) {
      this.selectedSubCategory = selectedValue;
      $('li', this.ui.tabs).removeClass('active');
      this.ui.tabs.find(`[data-value='${selectedValue}']`).addClass('active');

      $('div.shop-spirit-orbs', this.ui.tabBody).addClass('hide');
      $(`div.${selectedValue}`, this.ui.tabBody).removeClass('hide');
    }
  },

});

module.exports = ShopSpecialsView;
