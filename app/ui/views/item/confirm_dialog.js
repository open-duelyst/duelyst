// pragma PKGS: alwaysloaded
// pragma PKGS: alwaysloaded

const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const ConfirmDialogItemViewTempl = require('app/ui/templates/item/confirm_dialog.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');

const ConfirmDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-confirm-dialog',
  className: 'modal prompt-modal',

  template: ConfirmDialogItemViewTempl,

  events: {
    click: 'onPress',
    'click .cancel-dialog': 'onCancel',
    'click .confirm-dialog': 'onConfirm',
  },

  initialize() {
    this.model = new Backbone.Model({
      title: this.options.title || 'Are you sure you want to do that?',
      message: this.options.message,
      buttonLabel: this.options.buttonLabel,
    });
  },

  onPress(e) {
    if ($(e.target).attr('id') === this.id) {
      this.onCancel(e);
    }
  },

  onShow() {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onConfirm);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onConfirm);
  },

  onCancel() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

  onConfirm() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    this.trigger('confirm');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ConfirmDialogItemView;
