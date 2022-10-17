'use strict';

var Session = require('app/common/session2');
var validator = require('validator');
var Logger = require('app/common/logger');
var Animations = require('app/ui/views/animations');
var SelectUsernameTmpl = require('app/ui/templates/item/select_username.hbs');
var moment = require('moment');
var FormPromptDialogItemView = require('./form_prompt_dialog');

var SelectUsernameItemView = FormPromptDialogItemView.extend({

  template: SelectUsernameTmpl,

  id: 'app-change-username',

  ui: {
    $form: '.prompt-form',
    $username: '.username',
    $submit: '.prompt-submit',
    $submitted: '.prompt-submitted',
    $error: '.prompt-error',
    $errorMessage: '.error-message',
    $success: '.prompt-success',
  },

  _hasModifiedUsername: false,

  templateHelpers: {
  },

  onFormControlChangeContent: function (event) {
    // update modified state
    var $target = $(event.target);
    if (this.ui.$username.is($target)) {
      this._hasModifiedUsername = true;
    }

    FormPromptDialogItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  onShow: function () {
    FormPromptDialogItemView.prototype.onShow.apply(this, arguments);
  },

  onSubmit: function (e) {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);

    var username = this.ui.$username.val();
    Session.changeUsername(username)
      .bind(this)
      .then(function (res) {
        this.onSuccess(res);
      })
      .catch(function (e) {
      // onError expects a string not an actual error
        this.onError(e.innerMessage || e.message);
      });
  },

  // do nothing in onCancel as we want to block them from cancelling
  onCancel: function () {
    return;
  },

  updateValidState: function () {
    FormPromptDialogItemView.prototype.updateValidState.apply(this, arguments);

    var username = this.ui.$username.val();
    var isValid = true;

    // check username
    if (this._hasModifiedUsername) {
      if (!validator.isLength(username, 3, 18) || !validator.isAlphanumeric(username)) {
        this.showInvalidFormControl(this.ui.$username, '3 to 18 alphanumeric characters');
        isValid = false;
      } else {
        this.showValidFormControl(this.ui.$username);
      }
    }

    // set valid state
    this.isValid = isValid && this._hasModifiedUsername;
  },

});

module.exports = SelectUsernameItemView;
