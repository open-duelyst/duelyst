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

  initialize() {
  },

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
      if (typeof Stripe !== 'undefined') {
        Stripe.setPublishableKey(process.env.STRIPE_CLIENT_KEY);
        Stripe.card.createToken({
          number: this.ui.number.val(),
          cvc: this.ui.cvc.val(),
          exp_month: this.ui.expiration_month.val(),
          exp_year: this.ui.expiration_year.val(),
        }, (status, response) => {
          if (response.error) {
            // Show the errors on the form
            const errorMessage = response.error.message || 'Failed to save credit card data.';
            reject(errorMessage);
          } else {
            // response contains id and card, which contains additional card details
            const token = response.id;
            const last_four_digits = this.ui.number.val().substr(this.ui.number.val().length - 4);

            if (this.ui.save_card.is(':checked') || InventoryManager.getInstance().walletModel.get('card_last_four_digits')) {
              const request = $.ajax({
                data: JSON.stringify({
                  card_token: token,
                  last_four_digits,
                }),
                url: `${process.env.API_URL}/api/me/shop/customer`,
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
              });

              request.done((response) => {
                resolve({ token, stored: true });
              });

              request.fail((response) => {
                reject(response && response.responseJSON && (response.responseJSON.error || response.responseJSON.message) || 'Failed to save credit card data. Please retry.');
              });
            } else {
              resolve({ token, stored: false });
            }
          }
        });
      } else {
        const errorMessage = 'Failed to save credit card data.';
        reject(errorMessage);
      }
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
