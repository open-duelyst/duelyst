'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var Analytics = require('app/common/analytics');
var validator = require('validator');
var Session = require('app/common/session2');
var RegistrationItemViewTempl = require('app/ui/templates/item/registration.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var i18next = require('i18next');
var FormPromptModalItemView = require('./form_prompt_modal');

var RegistrationItemView = FormPromptModalItemView.extend({

  id: 'app-registration',
  template: RegistrationItemViewTempl,

  ui: {
    $form: '.prompt-form',
    $username: '.username',
    $password: '.password',
    $passwordConfirm: '.password-confirm',
    $inviteCode: '.invite-code',
    $friendReferralCode: '.friend-referral-code',
    $submit: '.prompt-submit',
    $submitted: '.prompt-submitted',
    $error: '.prompt-error',
    $errorMessage: '.error-message',
    $success: '.prompt-success',
    $formGroupFriendReferralButton: '#formGroupFriendReferralButton',
    $formGroupFriendReferralInput: '#formGroupFriendReferralInput',
  },

  events: {
    'click .prompt-submit': 'onClickSubmit',
    'click .prompt-cancel': 'onCancel',
    'input .form-control': 'onFormControlChangeContent',
    'blur .form-control': 'onFormControlBlur',
    'click #show_friend_referral_code_button': 'onFriendReferralButtonPressed',
  },

  templateHelpers: {
    areInviteCodesActive: function () { return process.env.INVITE_CODES_ACTIVE; },
    isRecaptchaActive: function () { return process.env.RECAPTCHA_ACTIVE; },
  },

  isValid: false,
  _hasModifiedUsername: false,
  _hasModifiedPassword: false,
  _hasModifiedPasswordConfirm: false,
  _hasModifiedInviteCode: false,
  _usernameUnavailable: false,
  _userNavLockId: 'RegistrationUserNavLockId',

  /* region EVENTS */

  onRender: function () {
    FormPromptModalItemView.prototype.onRender.apply(this, arguments);
    if (process.env.RECAPTCHA_ACTIVE) {
      $.getScript('https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit');
      window.onRecaptchaReady = function () {
        grecaptcha.render('recaptcha', {
          sitekey: process.env.RECAPTCHA_SITE_KEY,
          theme: 'dark',
        });
      };
    }
  },

  onShow: function () {
    FormPromptModalItemView.prototype.onShow.apply(this, arguments);
    Analytics.page('Registration', { path: '/#registration' });
  },

  onFormControlChangeContent: function (event) {
    // update modified state
    var $target = $(event.target);
    if (this.ui.$username.is($target)) {
      this._hasModifiedUsername = true;
      this._usernameUnavailable = false;
    } else if (this.ui.$password.is($target)) {
      this._hasModifiedPassword = true;
    } else if (this.ui.$passwordConfirm.is($target)) {
      this._hasModifiedPasswordConfirm = true;
    } else if (this.ui.$inviteCode.is($target)) {
      this._hasModifiedInviteCode = true;
    }

    FormPromptModalItemView.prototype.onFormControlChangeContent.apply(this, arguments);
  },

  updateValidState: function () {
    FormPromptModalItemView.prototype.updateValidState.apply(this, arguments);

    var username = this.ui.$username.val();
    var password = this.ui.$password.val();
    var passwordConfirm = this.ui.$passwordConfirm.val();
    var inviteCode = this.ui.$inviteCode.val();
    var isValid = true;

    // check username
    if (isValid && this._hasModifiedUsername && !this._usernameUnavailable) {
      if (!validator.isLength(username, 3, 18) || !validator.isAlphanumeric(username)) {
        this.showInvalidFormControl(this.ui.$username, i18next.t('registration.registration_validation_username_instructions'));
        isValid = false;
      } else {
        this.showValidFormControl(this.ui.$username);

        // attempt to check whether username is available, but don't block registration for it
        Session.isUsernameAvailable(username)
          .then(function (available) {
            if (!available) {
              this._usernameUnavailable = true;
              this.showInvalidFormControl(this.ui.$username, i18next.t('registration.registration_validation_username_exists'));
            }
          }.bind(this));
      }
    }

    // check password
    if (isValid && this._hasModifiedPassword && !validator.isLength(password, 8)) {
      // password is not long enough
      this.showInvalidFormControl(this.ui.$password, i18next.t('registration.registration_validation_password_instructions'));
      isValid = false;
    } else if (isValid && this._hasModifiedPasswordConfirm && !validator.equals(password, passwordConfirm)) {
      // passwords don't match
      this.showInvalidFormControl(this.ui.$passwordConfirm, i18next.t('registration.registration_validation_passwords_dont_match'));
      isValid = false;
    } else {
      this.showValidFormControl(this.ui.$password);
      this.showValidFormControl(this.ui.$passwordConfirm);
    }

    // check invite code
    if (isValid && this._hasModifiedInviteCode && !validator.isLength(inviteCode, 8)) {
      this.showInvalidFormControl(this.ui.$inviteCode, i18next.t('registration.registration_validation_invite_code_invalid'));
      isValid = false;
    } else {
      this.showValidFormControl(this.ui.$inviteCode);
    }

    // ...
    isValid = isValid && this._hasModifiedUsername && this._hasModifiedPassword && this._hasModifiedPasswordConfirm;

    if (process.env.INVITE_CODES_ACTIVE)
      isValid = isValid && this._hasModifiedInviteCode;

    // set final valid state
    this.isValid = isValid;
  },

  onSubmit: function () {
    FormPromptModalItemView.prototype.onSubmit.apply(this, arguments);

    // register
    var username = this.ui.$username.val().trim();
    var password = this.ui.$password.val().trim();
    var inviteCode = this.ui.$inviteCode.val().trim();
    var friendReferralCode = this.ui.$friendReferralCode.val().trim();
    var captcha = $('#g-recaptcha-response').val();

    Session.register({
      username: username,
      password: password,
      keycode: inviteCode.length > 0 ? inviteCode : undefined,
      friend_referral_code: friendReferralCode.length > 0 ? friendReferralCode : undefined,
      captcha: captcha,
    })
      .bind(this)
      .then(function (res) {
        this.onSuccess(res);
      })
      .catch(function (e) {
      // onError expects a string not an actual error
        this.onError(e.innerMessage || e.message);
      });
  },

  onSuccessComplete: function (registration) {
    FormPromptModalItemView.prototype.onSuccessComplete.apply(this, arguments);

    // lockdown user triggered navigation while we login
    NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._userNavLockId);

    // log user in
    Session.login(registration.username, registration.password)
      .finally(function () {
      // unlock user triggered navigation
        NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);
      }.bind(this));
  },

  onErrorComplete: function (errorMessage) {
    FormPromptModalItemView.prototype.onErrorComplete.apply(this, arguments);

    // try to force showing invalid input
    if (/username/i.test(errorMessage)) {
      this.showInvalidFormControl(this.ui.$username, errorMessage);
    } else if (/password/i.test(errorMessage)) {
      this.showInvalidFormControl(this.ui.$password, errorMessage);
    } else if (/invite/i.test(errorMessage)) {
      this.showInvalidFormControl(this.ui.$inviteCode, errorMessage);
    }
  },

  onFriendReferralButtonPressed: function () {
    this.ui.$formGroupFriendReferralButton.addClass('hide');
    this.ui.$formGroupFriendReferralInput.removeClass('hide');
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = RegistrationItemView;
