// pragma PKGS: alwaysloaded

'use strict';

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ShopData = require('app/data/shop.json');

var Template = require('./templates/shop_special_product_available_dialog.hbs');

var ShopSpecialProductAvailableDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-shop-special-product-available-dialog',
  className: 'modal prompt-modal',

  template: Template,

  events: {
    'click .confirm-dialog': 'onConfirm',
  },

  serializeModel: function (model) {
    // var data =  model.toJSON.apply(model, _.rest(arguments))
    // var keys = _.keys(data)
    // var specials = []
    // _.each(keys,function(k){
    //   specials.push(data[k])
    // })

    var imageUrl = null;
    switch (model.get('sku')) {
    case ShopData.earned_specials.BRONZE_DIVISION_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/bronze_special.png', CONFIG.resourceScaleCSS);
      break;
    case ShopData.earned_specials.SILVER_DIVISION_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/silver_special.png', CONFIG.resourceScaleCSS);
      break;
    case ShopData.earned_specials.GOLD_DIVISION_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/gold_special.png', CONFIG.resourceScaleCSS);
      break;
    case ShopData.earned_specials.F1_F5_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/f1_f5_special.png', CONFIG.resourceScaleCSS);
      break;
    case ShopData.earned_specials.F2_F4_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/f2_f4_special.png', CONFIG.resourceScaleCSS);
      break;
    case ShopData.earned_specials.F3_F6_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/f3_f6_special.png', CONFIG.resourceScaleCSS);
      break;
    case ShopData.earned_specials.ALL_FACTIONS_STARTER_SPECIAL_name_STARTER_SPECIAL.sku:
      imageUrl = RSX.getResourcePathForScale('resources/shop/f_all_special.png', CONFIG.resourceScaleCSS);
      break;
    default:
      break;
    }

    return {
      name: model.get('name'),
      description: model.get('description'),
      gold: model.get('gold'),
      image_url: imageUrl,
    };
  },

  initialize: function () {},

  onShow: function () {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onConfirm);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onConfirm);
  },

  onConfirm: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    this.trigger('confirm');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ShopSpecialProductAvailableDialogItemView;
