// pragma PKGS: alwaysloaded

'use strict';

var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var audio_engine = require('app/audio/audio_engine');
var Templ = require('app/ui/views2/profile/templates/profile_match_history_copy_replay_to_clipboard_dialog.hbs');
var Clipboard = require('clipboard');

var CopyReplayDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-copy-replay-link-dialog',
  className: 'dialog prompt-modal',

  template: Templ,

  events: {
    'click .cancel-dialog': 'onCancel',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  initialize: function () {
    this.model = new Backbone.Model({
      replayUrl: this.options.replayUrl || '',
      background: this.options.background,
    });
  },

  onRender: function () {
    // clipboard
    new Clipboard('#copy_replay_url_button');
  },

  onShow: function () {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_skip, this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onCancel);

    // play error audio
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    NavigationManager.getInstance().destroyDialogView();
    this.trigger('cancel');
  },

});

module.exports = CopyReplayDialogItemView;
