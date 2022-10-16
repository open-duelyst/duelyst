const Session = require('app/common/session2');
const validator = require('validator');
const Logger = require('app/common/logger');
const Animations = require('app/ui/views/animations');
const SelectUsernameTmpl = require('app/ui/templates/item/select_username.hbs');
const moment = require('moment');
const FormPromptDialogItemView = require('./form_prompt_dialog');

const SelectUsernameItemView = FormPromptDialogItemView.extend({

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

  onFormControlChangeContent(event) {
    // update modified state
    const $target = $(event.target);
    if (this.ui.$username.is($target)) {
      this._hasModifiedUsername = true;
    }

    FormPromptDialogItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  onShow() {
    FormPromptDialogItemView.prototype.onShow.apply(this, arguments);
  },

  onSubmit(e) {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);

    const username = this.ui.$username.val();
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
  onCancel() {

  },

  updateValidState() {
    FormPromptDialogItemView.prototype.updateValidState.apply(this, arguments);

    const username = this.ui.$username.val();
    let isValid = true;

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
