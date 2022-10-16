// pragma PKGS: shop

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const NavigationManager = require('app/ui/managers/navigation_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const Promise = require('bluebird');
const Template = require('./templates/credit_card_form.hbs');

const CreditCardFormView = Backbone.Marionette.ItemView.extend({
  initialize() {},

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
    shouldShowStoreCardOption() {
      return !InventoryManager.getInstance().walletModel.get('card_last_four_digits');
    },
  },

  onShow() {
    this.ui.number.focus();
  },

  onSubmit() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

    this.submit()
      .bind(this)
      .then(function () {
        NavigationManager.getInstance().destroyDialogView();
        this.trigger('complete');
      })
      .catch((errorMessage) => {
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: errorMessage }));
      });
  },

  submit() {
    this.trigger('submit');
    return new Promise((resolve, reject) => {
      const errorMessage = 'Failed to save credit card data.';
      reject(errorMessage);
    });
  },

  isFocused() {
    return $('input', this.el).is(':focus');
  },

  onCancelCreditCard() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = CreditCardFormView;
