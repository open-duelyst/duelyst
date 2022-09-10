// pragma PKGS: alwaysloaded

const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const Animations = require('app/ui/views/animations');
const audio_engine = require('app/audio/audio_engine');
const ErrorDialogItemViewTempl = require('app/ui/templates/item/error_dialog.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');
const i18next = require('i18next');

const ErrorDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-error-dialog',
  className: 'dialog prompt-modal',

  template: ErrorDialogItemViewTempl,

  events: {
    'click .cancel-dialog': 'onCancel',
    'click .dialog-background': 'onCancel',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize() {
    this.model = new Backbone.Model({
      title: this.options.title || i18next.t('common.default_error_dialog_title'),
      message: this.options.message,
      background: this.options.background,
    });
  },

  onShow() {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onCancel);

    // play error audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
  },

  onPress(e) {
    if ($(e.target).attr('id') === this.id) {
      this.onCancel(e);
    }
  },

  onCancel() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    NavigationManager.getInstance().destroyDialogView();
    this.trigger('cancel');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ErrorDialogItemView;
