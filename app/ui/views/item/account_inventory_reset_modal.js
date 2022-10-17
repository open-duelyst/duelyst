'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var Analytics = require('app/common/analytics');
var validator = require('validator');
var Template = require('app/ui/templates/item/account_inventory_reset_modal.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var FormPromptModalItemView = require('./form_prompt_modal');

var AccountInventoryResetModalView = FormPromptModalItemView.extend({

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

  onShow: function () {
    FormPromptModalItemView.prototype.onShow.apply(this, arguments);
  },

  onFormControlChangeContent: function (event) {
    // update modified state
    var $target = $(event.target);
    if (this.ui.$password.is($target)) {
      this._hasModifiedPassword = true;
    }

    FormPromptModalItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  updateValidState: function () {
    FormPromptModalItemView.prototype.updateValidState.apply(this, arguments);

    var password = this.ui.$password.val();
    var isValid = true;

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

  onSubmit: function () {
    FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

    // execute
    var password = this.ui.$password.val();

    Promise.resolve($.ajax({
      url: process.env.API_URL + '/api/me/inventory/card_collection/soft_wipe',
      type: 'POST',
      data: JSON.stringify({
        password: password,
      }),
      contentType: 'application/json',
      dataType: 'json',
    }))
      .then(this.onSuccess.bind(this))
      .catch(function (response) {
        var message;
        if (response && response.responseJSON)
          message = response.responseJSON.message;
        message = message || 'unknown error';
        this.onError(message);
      }.bind(this));
  },

  onSuccessComplete: function (registration) {
    FormPromptModalItemView.prototype.onSuccessComplete.apply(this, arguments);
  },

  onErrorComplete: function (errorMessage) {
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
