const Session = require('app/common/session2');
const validator = require('validator');
const Logger = require('app/common/logger');
const Animations = require('app/ui/views/animations');
const ChangePasswordTmpl = require('app/ui/templates/item/change_password.hbs');
const FormPromptDialogItemView = require('./form_prompt_dialog');

const ChangePasswordItemView = FormPromptDialogItemView.extend({

  template: ChangePasswordTmpl,

  id: 'app-change-password',

  ui: {
    $form: '.prompt-form',
    $password: '.password',
    $passwordConfirm: '.password-confirm',
    $passwordCurrent: '.password-current',
    $submit: '.prompt-submit',
    $submitted: '.prompt-submitted',
    $error: '.prompt-error',
    $errorMessage: '.error-message',
    $success: '.prompt-success',
  },

  _hasModifiedPassword: false,
  _hasModifiedPasswordConfirm: false,
  _hasModifiedPasswordCurrent: false,

  /* region EVENTS */

  onFormControlChangeContent(event) {
    // update modified state
    const $target = $(event.target);
    if (this.ui.$password.is($target)) {
      this._hasModifiedPassword = true;
    } else if (this.ui.$passwordConfirm.is($target)) {
      this._hasModifiedPasswordConfirm = true;
    } else if (this.ui.$passwordCurrent.is($target)) {
      this._hasModifiedPasswordCurrent = true;
    }

    FormPromptDialogItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  onSubmit(e) {
    FormPromptDialogItemView.prototype.onSubmit.apply(this, arguments);

    const passwordCurrent = this.ui.$passwordCurrent.val();
    const password = this.ui.$password.val();
    Session.changePassword(passwordCurrent, password).bind(this)
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

    const password = this.ui.$password.val();
    const passwordConfirm = this.ui.$passwordConfirm.val();
    const passwordCurrent = this.ui.$passwordCurrent.val();
    let isValid = true;

    // check password
    if (this._hasModifiedPassword) {
      if (!this._hasModifiedPasswordCurrent) {
        this.showInvalidFormControl(this.ui.$passwordCurrent, 'Please enter current password');
        isValid = false;
      } else if (validator.equals(password, passwordCurrent)) {
        // password matches current
        this.showInvalidFormControl(this.ui.$password, 'Password cannot be the same');
        isValid = false;
      } else if (!validator.isLength(password, 8)) {
        // password is not long enough
        this.showInvalidFormControl(this.ui.$password, 'Minimum 8 characters');
        isValid = false;
      } else if (this._hasModifiedPasswordConfirm && !validator.equals(password, passwordConfirm)) {
        // passwords don't match
        this.showInvalidFormControl(this.ui.$passwordConfirm, 'Passwords must match');
        isValid = false;
      }
    }

    if (isValid) {
      this.showValidFormControl(this.ui.$password);
      this.showValidFormControl(this.ui.$passwordConfirm);
      this.showValidFormControl(this.ui.$passwordCurrent);
    }

    // set valid state
    this.isValid = isValid && this._hasModifiedPassword && this._hasModifiedPasswordConfirm && this._hasModifiedPasswordCurrent;
  },

  /* endregion STATE */

});

// Expose the class either via CommonJS or the global object
module.exports = ChangePasswordItemView;
