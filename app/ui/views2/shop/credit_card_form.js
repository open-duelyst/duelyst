//pragma PKGS: shop
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
var Promise = require("bluebird");

var Template = require('./templates/credit_card_form.hbs');

var CreditCardFormView = Backbone.Marionette.ItemView.extend({

	initialize: function() {
	},

	template: Template,

	/* ui selector cache */
	ui: {
		"name": "#cardholder_name",
		"number": "#card_number",
		"expiration_month": "#card_expiration_month",
		"expiration_year": "#card_expiration_year",
		"cvc": "#card_cvc",
		"save_card": "#save_card"
	},

	/* Ui events hash */
	events: {
		"click .btn-primary": "onSubmit",
		"click .btn-cancel-credit-card-form": "onCancelCreditCard"
	},

	triggers: {},

	templateHelpers: {
		shouldShowStoreCardOption: function() {
			return !InventoryManager.getInstance().walletModel.get("card_last_four_digits");
		},
	},

	onShow: function() {
		this.ui.number.focus();
	},

	onSubmit: function() {
		audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

		NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

		this.submit()
		.bind(this)
		.then(function(){
			NavigationManager.getInstance().destroyDialogView();
			this.trigger("complete");
		})
		.catch(function(errorMessage){
			NavigationManager.getInstance().showDialogView(new ErrorDialogItemView ({title: errorMessage}));
		});
	},

	submit: function() {

		this.trigger("submit");

		return new Promise(function(resolve,reject){

			if (typeof Stripe != 'undefined') {

				Stripe.setPublishableKey(process.env.STRIPE_CLIENT_KEY);
				Stripe.card.createToken({
					number: this.ui.number.val(),
					cvc: this.ui.cvc.val(),
					exp_month: this.ui.expiration_month.val(),
					exp_year: this.ui.expiration_year.val()
				}, function(status, response) {

					if (response.error) {
						// Show the errors on the form
						var errorMessage = response.error.message || 'Failed to save credit card data.';
						reject(errorMessage);
					} else {
						// response contains id and card, which contains additional card details
						var token = response.id;
						var last_four_digits = this.ui.number.val().substr(this.ui.number.val().length-4);

						if (this.ui.save_card.is(':checked') || InventoryManager.getInstance().walletModel.get("card_last_four_digits")) {

							var request = $.ajax({
								data: JSON.stringify({
									card_token:token,
									last_four_digits:last_four_digits
								}),
								url: process.env.API_URL + '/api/me/shop/customer',
								type: 'POST',
								contentType: 'application/json',
								dataType: 'json'
							});

							request.done(function(response){
								resolve({token:token,stored:true});
							}.bind(this));

							request.fail(function(response){
								reject(response && response.responseJSON && (response.responseJSON.error || response.responseJSON.message) || 'Failed to save credit card data. Please retry.');
							}.bind(this));

						} else {
							resolve({token:token,stored:false});
						}
					}
				}.bind(this));
			} else {
				var errorMessage = 'Failed to save credit card data.';
				reject(errorMessage);
			}

		}.bind(this));
	},

    isFocused: function() {
    	return $("input",this.el).is(":focus");
    },

	onCancelCreditCard: function() {
		audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
		this.trigger("cancel");
	}

});

// Expose the class either via CommonJS or the global object
module.exports = CreditCardFormView;
