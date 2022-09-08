// pragma PKGS: alwaysloaded

const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const PromptDialogItemViewTempl = require('app/ui/templates/item/prompt_dialog.hbs');
const NavigationManager = require('app/ui/managers/navigation_manager');

const PromptDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-prompt-dialog',
  className: 'modal prompt-modal',

  template: PromptDialogItemViewTempl,

  events: {
    'click .cancel-dialog': 'onCancel',
  },

  initialize() {
    this.model = new Backbone.Model({
      title: this.options.title,
      message: this.options.message,
    });
  },

  onShow() {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onCancel);
  },

  onCancel() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    this.trigger('cancel');

    // destroy last to allow any events to occur
    NavigationManager.getInstance().destroyDialogView();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = PromptDialogItemView;
