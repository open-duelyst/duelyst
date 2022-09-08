const Session = require('app/common/session2');
const validator = require('validator');
const Logger = require('app/common/logger');
const Animations = require('app/ui/views/animations');
const ChangeUsernameTmpl = require('app/ui/templates/item/change_username.hbs');
const moment = require('moment');
const ProfileManager = require('app/ui/managers/profile_manager');
const FormPromptDialogItemView = require('./form_prompt_dialog');

const ChangeUsernameItemView = FormPromptDialogItemView.extend({

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

    canChangeUsernameThisMonth() {
      const updatedAt = this.model.get('username_updated_at') || 0;
      const then = moment(updatedAt);
      const duration = moment.duration(moment().utc().diff(then));
      return duration.asMonths() >= 1.0;
    },

    canChangeUsernameForFree() {
      return !this.model.get('username_updated_at');
    },
  },

  /* region EVENTS */

  onFormControlChangeContent(event) {
    // update modified state
    const $target = $(event.target);
    if (this.ui.$username.is($target)) {
      this._hasModifiedUsername = true;
    }

    FormPromptDialogItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  onSubmit(e) {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);

    const username = this.ui.$username.val();
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

  updateValidState() {
    FormPromptDialogItemView.prototype.updateValidState.apply(this, arguments);

    const username = this.ui.$username.val();
    let isValid = true;

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
