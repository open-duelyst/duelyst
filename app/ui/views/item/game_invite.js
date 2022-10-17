// pragma PKGS: alwaysloaded

'use strict';

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var audio_engine = require('app/audio/audio_engine');
var GameInviteViewTempl = require('app/ui/templates/item/game_invite.hbs');
var GamesManager = require('app/ui/managers/games_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');

var GameInviteItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-game-invite',
  className: 'modal duelyst-modal',

  template: GameInviteViewTempl,

  events: {
    'click .cancel': 'onCancel',
    'click .cta-button': 'onCTAAccept',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onShow: function () {
    // listen to user triggered actions
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_cancel, this.onCancel);
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_confirm, this.onClickSubmit);

    // listen to user attempted actions
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onClickSubmit);

    // play notification sound
    audio_engine.current().play_effect(RSX.sfx_ui_yourturn.audio, false);
  },

  onCancel: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    GamesManager.getInstance().cancelMatchmaking();
    this.trigger('dismiss');
  },

  onCTAAccept: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    this.trigger('cta_accept');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GameInviteItemView;
