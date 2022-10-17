'use strict';

var _ = require('underscore');
var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var EVENTS = require('app/common/event_types');
var NavigationManager = require('app/ui/managers/navigation_manager');
var openUrl = require('app/common/openUrl');

/**
 * Abstract form prompt modal. Do not use this class directly.
 */
var FormPromptModalItemView = Backbone.Marionette.ItemView.extend({

  className: 'modal prompt-modal',

  /* ui selector cache */
  ui: {
    $form: '.prompt-form',
    $submit: '.prompt-submit',
    $submitted: '.prompt-submitted',
    $error: '.prompt-error',
    $errorMessage: '.error-message',
    $success: '.prompt-success',
  },

  events: {
    'click .prompt-submit': 'onClickSubmit',
    'click .prompt-cancel': 'onCancel',
    'input .form-control': 'onFormControlChangeContent',
    'blur .form-control': 'onFormControlBlur',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  // whether form is in process of submitting
  submitting: false,

  // whether form is valid
  isValid: true,

  // duration in seconds to wait after a user finishes typing to update the valid state
  updateValidStateDelay: 0.5,

  // duration in seconds to show status messages
  successMessageDuration: 3.0,
  errorMessageDuration: 3.0,

  _userNavLockId: 'FormPromptModalUserNavLockId',

  /* region INITIALIZE */

  initialize: function () {
    this.updateValidStateBound = this.updateValidState.bind(this);
    this.updateValidStateDebounced = _.debounce(this.updateValidStateBound, this.updateValidStateDelay * 1000.0);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onBeforeRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
    this.ui.$form.addClass('active');
    this.updateValidState();

    // auto wire target blank links to open in a new window
    $('a', this.$el).each(function (i) {
      if ($(this).attr('target') == '_blank') {
        $(this).on('click', function (e) {
          openUrl($(e.currentTarget).attr('href'));
          e.stopPropagation();
          e.preventDefault();
        });
      }
    });
  },

  onShow: function () {
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_confirm, this.onClickSubmit);
    this.updateValidState();
  },

  onDestroy: function () {
    // unlock user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);

    if (this._successTimeoutId != null) {
      clearTimeout(this._successTimeoutId);
      this._successTimeoutId = null;
    }
    if (this._errorTimeoutId != null) {
      clearTimeout(this._errorTimeoutId);
      this._errorTimeoutId = null;
    }
  },

  onFormControlChangeContent: function () {
    this.updateValidStateDebounced();
  },

  onFormControlBlur: function () {
    this.updateValidState();
  },

  onClickSubmit: function (event) {
    this.updateValidState();
    if (this.isValid && !this.submitting) {
      this.onSubmit();
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
    }
  },

  onSubmit: function () {
    // start submitting
    this.submitting = true;

    // show activity
    this.ui.$form.removeClass('active');
    this.ui.$submitted.addClass('active');

    // lockdown user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._userNavLockId);
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    NavigationManager.getInstance().destroyModalView();
  },

  /**
   * Method called automatically on successful submission.
   */
  onSuccess: function () {
    // we don't know what will be passed to the success method, so we'll pass everything along
    var successArgs = arguments;

    // show success
    this.ui.$submitted.removeClass('active');
    this.ui.$success.addClass('active');

    this._successTimeoutId = setTimeout(function () {
      this.onSuccessComplete.apply(this, successArgs);
    }.bind(this), this.successMessageDuration * 1000.0);
  },

  /**
   * Method called automatically on success completion.
   */
  onSuccessComplete: function () {
    // unlock user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);

    // trigger success to notify that we've finished
    this.trigger('success');
  },

  /**
   * Method called automatically on failed submission.
   */
  onError: function (errorMessage) {
    // we don't know what will be passed to the error method, so we'll pass everything along
    var errorArgs = arguments;

    // show error
    this.ui.$submitted.removeClass('active');
    this.ui.$error.addClass('active');
    this.ui.$errorMessage.text(errorMessage);
    var errorDuration = this.errorMessageDuration;
    if (errorMessage.length > 30) {
      errorDuration = 10.0;
    }

    this._errorTimeoutId = setTimeout(function () {
      this.onErrorComplete.apply(this, errorArgs);
    }.bind(this), errorDuration * 1000.0);
  },

  /**
   * Method called automatically on failure completion.
   */
  onErrorComplete: function (errorMessage) {
    // unlock user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);

    // no longer submitting
    this.submitting = false;

    // show form again
    this.ui.$error.removeClass('active');
    this.ui.$form.addClass('active');

    // trigger error to notify of issue
    this.trigger('error', errorMessage);
  },

  /* endregion EVENTS */

  /* region STATE */

  getSubmitting: function () {
    return this.submitting;
  },

  clearFormValidation: function () {
    this.$el.find('.has-error').removeClass('has-error');
  },

  showInvalidFormControl: function ($formControl, helpMessage) {
    $formControl.closest('.form-group').addClass('has-error');
    $formControl.off('input');
    $formControl.one('input', function () { this.showValidFormControl($formControl); }.bind(this));
    this.showInvalidTooltip($formControl, helpMessage);
  },

  showValidFormControl: function ($formControl) {
    $formControl.closest('.form-group').removeClass('has-error');
    $formControl.off('input');
    this.hideInvalidTooltip($formControl);
  },

  showInvalidTooltip: function ($formControl, helpMessage) {
    var tooltipData = $formControl.data('bs.tooltip');
    if (tooltipData == null || tooltipData.options.title !== helpMessage) {
      $formControl.tooltip('destroy').tooltip({ title: helpMessage || 'Invalid input', placement: 'right', trigger: 'manual' }).tooltip('show');
    }
  },

  hideInvalidTooltip: function ($formControl) {
    $formControl.tooltip('destroy');
  },

  updateValidStateDebounced: null,
  updateValidState: function () {
    // override in sub class to set valid state
    this.isValid = true;
  },

  /* endregion STATE */

});

// Expose the class either via CommonJS or the global object
module.exports = FormPromptModalItemView;
