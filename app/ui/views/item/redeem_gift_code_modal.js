const _ = require('underscore');
const Promise = require('bluebird');
const Analytics = require('app/common/analytics');
const validator = require('validator');
const Template = require('app/ui/templates/item/redeem_gift_code_modal.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const i18next = require('i18next');
const FormPromptModalItemView = require('./form_prompt_modal');

const RedeemGiftCodeModalView = FormPromptModalItemView.extend({

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

  onShow() {
    FormPromptModalItemView.prototype.onShow.apply(this, arguments);
  },

  onFormControlChangeContent(event) {
    // update modified state
    const $target = $(event.target);
    if (this.ui.$giftCode.is($target)) {
      this._hasModifiedGiftCode = true;
    }

    FormPromptModalItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  updateValidState() {
    FormPromptModalItemView.prototype.updateValidState.apply(this, arguments);

    const giftCode = this.ui.$giftCode.val();
    let isValid = true;

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

  onSubmit() {
    FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

    // execute
    const giftCode = this.ui.$giftCode.val();

    Promise.resolve($.ajax({
      url: `${process.env.API_URL}/api/me/gift_codes`,
      type: 'POST',
      data: JSON.stringify({
        gift_code: giftCode,
      }),
      contentType: 'application/json',
      dataType: 'json',
    }))
      .then(this.onSuccess.bind(this))
      .catch((response) => {
        this.onError(response && response.responseJSON && (response.responseJSON.message || response.responseJSON.error) || i18next.t('redeem_gift_code_modal.failed_to_redeem_error'));
      });
  },

  onSuccessComplete(registration) {
    FormPromptModalItemView.prototype.onSuccessComplete.apply(this, arguments);
  },

  onErrorComplete(errorMessage) {
    FormPromptModalItemView.prototype.onErrorComplete.apply(this, arguments);
    this.showInvalidFormControl(this.ui.$giftCode, errorMessage);
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = RedeemGiftCodeModalView;
