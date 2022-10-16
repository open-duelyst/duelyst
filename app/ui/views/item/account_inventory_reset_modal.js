const _ = require('underscore');
const Promise = require('bluebird');
const Analytics = require('app/common/analytics');
const validator = require('validator');
const Template = require('app/ui/templates/item/account_inventory_reset_modal.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const FormPromptModalItemView = require('./form_prompt_modal');

const AccountInventoryResetModalView = FormPromptModalItemView.extend({

  id: 'app-account-wipe',
  template: Template,

  ui: {
    $form: '.prompt-form',
    $password: '.password',
    $submit: '.prompt-submit',
    $submitted: '.prompt-submitted',
    $error: '.prompt-error',
    $errorMessage: '.error-message',
    $success: '.prompt-success',
  },

  isValid: false,
  _hasModifiedPassword: false,
  _userNavLockId: 'AccountWipeUserNavLockId',

  /* region EVENTS */

  onShow() {
    FormPromptModalItemView.prototype.onShow.apply(this, arguments);
  },

  onFormControlChangeContent(event) {
    // update modified state
    const $target = $(event.target);
    if (this.ui.$password.is($target)) {
      this._hasModifiedPassword = true;
    }

    FormPromptModalItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  updateValidState() {
    FormPromptModalItemView.prototype.updateValidState.apply(this, arguments);

    const password = this.ui.$password.val();
    let isValid = true;

    // check password
    if (isValid && this._hasModifiedPassword && !validator.isLength(password, 6)) {
      // password is not long enough
      this.showInvalidFormControl(this.ui.$password, 'Minimum 6 characters');
      isValid = false;
    } else {
      this.showValidFormControl(this.ui.$password);
    }

    // ...
    isValid = isValid && this._hasModifiedPassword;

    // set final valid state
    this.isValid = isValid;
  },

  onSubmit() {
    FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

    // execute
    const password = this.ui.$password.val();

    Promise.resolve($.ajax({
      url: `${process.env.API_URL}/api/me/inventory/card_collection/soft_wipe`,
      type: 'POST',
      data: JSON.stringify({
        password,
      }),
      contentType: 'application/json',
      dataType: 'json',
    }))
      .then(this.onSuccess.bind(this))
      .catch((response) => {
        let message;
        if (response && response.responseJSON) message = response.responseJSON.message;
        message = message || 'unknown error';
        this.onError(message);
      });
  },

  onSuccessComplete(registration) {
    FormPromptModalItemView.prototype.onSuccessComplete.apply(this, arguments);
  },

  onErrorComplete(errorMessage) {
    FormPromptModalItemView.prototype.onErrorComplete.apply(this, arguments);

    // try to force showing invalid input
    if (/password/i.test(errorMessage)) {
      this.showInvalidFormControl(this.ui.$password, errorMessage);
    }
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = AccountInventoryResetModalView;
