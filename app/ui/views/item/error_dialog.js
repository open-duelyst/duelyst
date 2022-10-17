// pragma PKGS: alwaysloaded

'use strict';

var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var audio_engine = require('app/audio/audio_engine');
var ErrorDialogItemViewTempl = require('app/ui/templates/item/error_dialog.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var i18next = require('i18next');

var ErrorDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-error-dialog',
  className: 'dialog prompt-modal',

  template: ErrorDialogItemViewTempl,

  events: {
    'click .cancel-dialog': 'onCancel',
    'click .dialog-background': 'onCancel',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize: function () {
    this.model = new Backbone.Model({
      title: this.options.title || i18next.t('common.default_error_dialog_title'),
      message: this.options.message,
      background: this.options.background,
    });
  },

  onShow: function () {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onCancel);

    // play error audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
  },

  onPress: function (e) {
    if ($(e.target).attr('id') === this.id) {
      this.onCancel(e);
    }
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    NavigationManager.getInstance().destroyDialogView();
    this.trigger('cancel');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ErrorDialogItemView;
