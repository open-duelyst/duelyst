'use strict';

var Session = require('app/common/session2');
var validator = require('validator');
var Logger = require('app/common/logger');
var Animations = require('app/ui/views/animations');
var ChangeUsernameTmpl = require('app/ui/templates/item/change_username.hbs');
var moment = require('moment');
var ProfileManager = require('app/ui/managers/profile_manager');
var FormPromptDialogItemView = require('./form_prompt_dialog');

var ChangeUsernameItemView = FormPromptDialogItemView.extend({

  template: ChangeUsernameTmpl,

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

    canChangeUsernameThisMonth: function () {
      var updatedAt = this.model.get('username_updated_at') || 0;
      var then = moment(updatedAt);
      var duration = moment.duration(moment().utc().diff(then));
      return duration.asMonths() >= 1.0;
    },

    canChangeUsernameForFree: function () {
      return !this.model.get('username_updated_at');
    },
  },

  /* region EVENTS */

  onFormControlChangeContent: function (event) {
    // update modified state
    var $target = $(event.target);
    if (this.ui.$username.is($target)) {
      this._hasModifiedUsername = true;
    }

    FormPromptDialogItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  onSubmit: function (e) {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);

    var username = this.ui.$username.val();
    Session.changeUsername(username).bind(this)
      .then(function (res) {
        this.onSuccess(res);
      })
      .catch(function (e) {
      // onError expects a string not an actual error
        this.onError(e.innerMessage || e.message);
      });
  },

  /* endregion EVENTS */

  /* region STATE */

  updateValidState: function () {
    FormPromptDialogItemView.prototype.updateValidState.apply(this, arguments);

    var username = this.ui.$username.val();
    var isValid = true;

    // check username
    if (this._hasModifiedUsername) {
      if (!validator.isLength(username, 3, 18) || !validator.isAlphanumeric(username)) {
        this.showInvalidFormControl(this.ui.$username, '3 to 18 alphanumeric characters');
        isValid = false;
      } else if (username === ProfileManager.getInstance().profile.get('username')) {
        this.showInvalidFormControl(this.ui.$username, 'Username must be different');
        isValid = false;
      } else {
        this.showValidFormControl(this.ui.$username);
      }
    }

    // set valid state
    this.isValid = isValid && this._hasModifiedUsername;
  },

  /* endregion STATE */

});

// Expose the class either via CommonJS or the global object
module.exports = ChangeUsernameItemView;
