// pragma PKGS: shop

'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var NavigationManager = require('app/ui/managers/navigation_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var Promise = require('bluebird');
var Template = require('./templates/credit_card_form.hbs');

var CreditCardFormView = Backbone.Marionette.ItemView.extend({
  initialize: function () {},

  template: Template,

  /* ui selector cache */
  ui: {
    name: '#cardholder_name',
    number: '#card_number',
    expiration_month: '#card_expiration_month',
    expiration_year: '#card_expiration_year',
    cvc: '#card_cvc',
    save_card: '#save_card',
  },

  /* Ui events hash */
  events: {
    'click .btn-primary': 'onSubmit',
    'click .btn-cancel-credit-card-form': 'onCancelCreditCard',
  },

  triggers: {},

  templateHelpers: {
    shouldShowStoreCardOption: function () {
      return !InventoryManager.getInstance().walletModel.get('card_last_four_digits');
    },
  },

  onShow: function () {
    this.ui.number.focus();
  },

  onSubmit: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

    this.submit()
      .bind(this)
      .then(function () {
        NavigationManager.getInstance().destroyDialogView();
        this.trigger('complete');
      })
      .catch(function (errorMessage) {
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: errorMessage }));
      });
  },

  submit: function () {
    this.trigger('submit');
    return new Promise(function (resolve, reject) {
      var errorMessage = 'Failed to save credit card data.';
      reject(errorMessage);
    }.bind(this));
  },

  isFocused: function () {
    return $('input', this.el).is(':focus');
  },

  onCancelCreditCard: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = CreditCardFormView;
