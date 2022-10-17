'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var Analytics = require('app/common/analytics');
var validator = require('validator');
var Template = require('app/ui/templates/item/redeem_gift_code_modal.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var i18next = require('i18next');
var FormPromptModalItemView = require('./form_prompt_modal');

var RedeemGiftCodeModalView = FormPromptModalItemView.extend({

  id: 'app-redeem-gift-code',
  template: Template,

  ui: {
    $form: '.prompt-form',
    $giftCode: '.gift-code',
    $submit: '.prompt-submit',
    $submitted: '.prompt-submitted',
    $error: '.prompt-error',
    $errorMessage: '.error-message',
    $success: '.prompt-success',
  },

  isValid: false,
  _hasModifiedGiftCode: false,
  _userNavLockId: 'AccountWipeUserNavLockId',

  /* region EVENTS */

  onShow: function () {
    FormPromptModalItemView.prototype.onShow.apply(this, arguments);
  },

  onFormControlChangeContent: function (event) {
    // update modified state
    var $target = $(event.target);
    if (this.ui.$giftCode.is($target)) {
      this._hasModifiedGiftCode = true;
    }

    FormPromptModalItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  updateValidState: function () {
    FormPromptModalItemView.prototype.updateValidState.apply(this, arguments);

    var giftCode = this.ui.$giftCode.val();
    var isValid = true;

    // check giftCode
    if (isValid && this._hasModifiedGiftCode && !validator.isLength(giftCode, 3)) {
      // giftCode is not long enough
      this.showInvalidFormControl(this.ui.$giftCode, i18next.t('redeem_gift_code_modal.min_char_requirement_error'));
      isValid = false;
    } else {
      this.showValidFormControl(this.ui.$giftCode);
    }

    // ...
    isValid = isValid && this._hasModifiedGiftCode;

    // set final valid state
    this.isValid = isValid;
  },

  onSubmit: function () {
    FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

    // execute
    var giftCode = this.ui.$giftCode.val();

    Promise.resolve($.ajax({
      url: process.env.API_URL + '/api/me/gift_codes',
      type: 'POST',
      data: JSON.stringify({
        gift_code: giftCode,
      }),
      contentType: 'application/json',
      dataType: 'json',
    }))
      .then(this.onSuccess.bind(this))
      .catch(function (response) {
        this.onError(response && response.responseJSON && (response.responseJSON.message || response.responseJSON.error) || i18next.t('redeem_gift_code_modal.failed_to_redeem_error'));
      }.bind(this));
  },

  onSuccessComplete: function (registration) {
    FormPromptModalItemView.prototype.onSuccessComplete.apply(this, arguments);
  },

  onErrorComplete: function (errorMessage) {
    FormPromptModalItemView.prototype.onErrorComplete.apply(this, arguments);
    this.showInvalidFormControl(this.ui.$giftCode, errorMessage);
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = RedeemGiftCodeModalView;
