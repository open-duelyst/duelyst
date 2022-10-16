const Promise = require('bluebird');
const Session = require('app/common/session2');
const Logger = require('app/common/logger');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const validator = require('validator');
const Animations = require('app/ui/views/animations');
const NavigationManager = require('app/ui/managers/navigation_manager');
const LoginMenuTmpl = require('app/ui/templates/item/login_menu.hbs');
const openUrl = require('app/common/openUrl');
const i18next = require('i18next');
const RegistrationItemView = require('./registration');
const ErrorDialogItemView = require('./error_dialog');

const LoginMenuItemView = Backbone.Marionette.ItemView.extend({

  template: LoginMenuTmpl,

  id: 'app-login',
  className: 'login-menu',

  /* ui selector cache */
  ui: {
    $brandDynamic: '.brand-dynamic',
    $input: 'input',
    $login: '.login',
    $loginForm: '.login-form',
    $registrationBlock: '.registration-block',
    $registration: '.registration',
    $forgotPassword: '.forgot-password',
    $username: '.login-username',
    $password: '.login-password',
  },

  /* Ui events hash */
  events: {
    'click .login': 'onLogin',
    'click .registration': 'onShowRegistration',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  // whether form is valid
  isValid: true,

  _userNavLockId: 'LoginUserNavLockId',

  /* region INITIALIZE */

  initialize() {
    this.resetInvalidStateBound = this.resetInvalidState.bind(this);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onBeforeRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
    this.enableForm();
  },

  onShow() {
    const brandAnimationDuration = 2.0;

    // slight delay before showing brand to ensure dom is rendered
    this._brandTimeoutId = setTimeout(() => {
      this.showBrand(brandAnimationDuration);
    }, 120.0);

    // slight delay before showing registration block to focus attention on it
    this._registrationTimeoutId = setTimeout(() => {
      this.ui.$registrationBlock.addClass('active');
    }, brandAnimationDuration * 0.5 * 1000.0);

    // show login immediately
    this.ui.$loginForm.addClass('active');

    // login when focused on input and triggering confirm
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_confirm, function () {
      if (this.ui.$input.is(this.$el.find('input:focus'))) {
        this.onLogin();
      }
    });

    $('#tos').fadeIn(125);
    $('#tos').find('a').click((e) => {
      openUrl($(e.currentTarget).attr('href'));
      e.stopPropagation();
      e.preventDefault();
    });
    $('.utility-links').find('a').click((e) => {
      const href = $(e.currentTarget).attr('href');
      if (href.indexOf('http') == 0) {
        openUrl($(e.currentTarget).attr('href'));
        e.stopPropagation();
        e.preventDefault();
      }
    });
  },

  onDestroy() {
    // unlock user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);

    if (this._brandTimeoutId != null) {
      clearTimeout(this._brandTimeoutId);
      this._brandTimeoutId = null;
    }
    if (this._registrationTimeoutId != null) {
      clearTimeout(this._registrationTimeoutId);
      this._registrationTimeoutId = null;
    }
  },

  /* endregion EVENTS */

  /* region ANIMATION */

  showBrand(animationDuration) {
    return new Promise((resolve, reject) => {
      // animate brand in
      this.ui.$brandDynamic.addClass('active');
      this.ui.$brandDynamic.find('.draw-line').each(function () {
        const $element = $(this);
        let length = this.getTotalLength() / 5;
        $element.data('length', length);
        $element.css('stroke-dasharray', length);
        $element.css('stroke-dashoffset', length);

        length = $element.data('length');
        $element.css('transition', `stroke-dashoffset ${animationDuration}s ease-in`);
        $element.css('stroke-dashoffset', -length);
      });

      this.ui.$brandDynamic.find('.fill').each(function () {
        const $element = $(this);
        $element.css('transition', `opacity ${animationDuration * 0.5}s ease-out`);
        $element.css('transition-delay', `${animationDuration * 0.5}s`);
        $element.css('opacity', '1');
      });

      this.ui.$brandDynamic.find('.ring-blue').removeClass('active');
      this.ui.$brandDynamic.find('.ring-white').addClass('active');

      this._brandTimeoutId = setTimeout(() => {
        resolve();
      }, animationDuration * 1000.0);
    });
  },

  /* endregion ANIMATION */

  /* region LOGIN */

  onLogin() {
    const username = this.ui.$username.val();
    const password = this.ui.$password.val();

    this.updateValidState();
    if (this.isValid) {
      this.disableForm();

      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

      // lockdown user triggered navigation while we login
      NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._userNavLockId);
      Session.login(username, password)
        .bind(this)
        .catch(function (e) {
        // onError expects a string not an actual error
          this.onError(e.codeMessage || e.innerMessage || e.message);
        })
        .finally(function () {
        // unlock user triggered navigation
          NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);
        });
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
    }
  },

  updateValidState() {
    const username = this.ui.$username.val();
    const password = this.ui.$password.val();
    this.isValid = true;

    // check username
    if ((!validator.isLength(username, 3, 18) || !validator.isAlphanumeric(username))) {
      this.showInvalidFormControlWithTooltip(this.ui.$username, i18next.t('login.invalid_username_message'));
      this.isValid = false;
    } else {
      this.showValidFormControl(this.ui.$username);
    }

    // check password
    if (this.isValid && !validator.isLength(password, 6)) {
      this.showInvalidFormControlWithTooltip(this.ui.$password, i18next.t('login.invalid_password_message'));
      this.isValid = false;
    } else {
      this.showValidFormControl(this.ui.$password);
    }
  },

  resetInvalidState() {
    this.showValidFormControl(this.ui.$username);
    this.showValidFormControl(this.ui.$password);
  },

  showInvalidFormControl($formControl) {
    $formControl.closest('.form-group').addClass('has-error');
    $formControl.one('input', this.resetInvalidStateBound);
  },

  showValidFormControl($formControl) {
    $formControl.closest('.form-group').removeClass('has-error');
    $formControl.off('input', this.resetInvalidStateBound);
    this.hideInvalidTooltip($formControl);
  },

  showInvalidFormControlWithTooltip($formControl, helpMessage) {
    this.showInvalidFormControl($formControl);
    this.showInvalidTooltip($formControl, helpMessage);
  },

  showInvalidTooltip($formControl, helpMessage) {
    const tooltipData = $formControl.data('bs.tooltip');
    if (tooltipData == null || tooltipData.options.title !== helpMessage) {
      $formControl.tooltip('destroy').tooltip({ title: helpMessage || i18next.t('common.generic_invalid_input_message'), placement: 'left', trigger: 'manual' }).tooltip('show');
    }
  },

  hideInvalidTooltip($formControl) {
    $formControl.tooltip('destroy');
  },

  enableForm() {
    this.ui.$loginForm.removeClass('disabled');
    this.ui.$login.removeClass('disabled');
    this.ui.$registration.removeClass('disabled');
    this.ui.$forgotPassword.removeClass('disabled');
  },

  disableForm() {
    this.ui.$loginForm.addClass('disabled');
    this.ui.$login.addClass('disabled');
    this.ui.$registration.addClass('disabled');
    this.ui.$forgotPassword.addClass('disabled');
  },

  onError(errorMessage) {
    this.enableForm();
    if (errorMessage.indexOf('suspended') > 0) {
      NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: i18next.t('login.account_suspended_message'), message: errorMessage });
    } else {
      this.showInvalidFormControlWithTooltip(this.ui.$username, errorMessage || i18next.t('login.invalid_username_or_password_message'));
      this.showInvalidFormControl(this.ui.$password);
    }
  },

  /* endregion LOGIN */

  /* region REGISTRATION */

  onShowRegistration() {
    // registration will auto log in on success
    NavigationManager.getInstance().showModalView(new RegistrationItemView());
  },

  /* endregion REGISTRATION */

});

module.exports = LoginMenuItemView;
