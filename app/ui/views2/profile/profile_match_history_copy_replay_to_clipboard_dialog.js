// pragma PKGS: alwaysloaded

const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const Animations = require('app/ui/views/animations');
const audio_engine = require('app/audio/audio_engine');
const Templ = require('app/ui/views2/profile/templates/profile_match_history_copy_replay_to_clipboard_dialog.hbs');
const Clipboard = require('clipboard');

const CopyReplayDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-copy-replay-link-dialog',
  className: 'dialog prompt-modal',

  template: Templ,

  events: {
    'click .cancel-dialog': 'onCancel',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize() {
    this.model = new Backbone.Model({
      replayUrl: this.options.replayUrl || '',
      background: this.options.background,
    });
  },

  onRender() {
    // clipboard
    new Clipboard('#copy_replay_url_button');
  },

  onShow() {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onCancel);

    // play error audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
  },

  onCancel() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    NavigationManager.getInstance().destroyDialogView();
    this.trigger('cancel');
  },

});

module.exports = CopyReplayDialogItemView;
