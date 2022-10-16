// pragma PKGS: alwaysloaded

const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const Animations = require('app/ui/views/animations');
const audio_engine = require('app/audio/audio_engine');
const GameInviteViewTempl = require('app/ui/templates/item/game_invite.hbs');
const GamesManager = require('app/ui/managers/games_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');

const GameInviteItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-game-invite',
  className: 'modal duelyst-modal',

  template: GameInviteViewTempl,

  events: {
    'click .cancel': 'onCancel',
    'click .cta-button': 'onCTAAccept',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onShow() {
    // listen to user triggered actions
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_cancel, this.onCancel);
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_confirm, this.onClickSubmit);

    // listen to user attempted actions
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_attempt_cancel, this.onCancel);
    this.listenTo(NavigationManager.getInstance(), EVENTS.user_attempt_confirm, this.onClickSubmit);

    // play notification sound
    audio_engine.current().play_effect(RSX.sfx_ui_yourturn.audio, false);
  },

  onCancel() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cancel.audio, CONFIG.CANCEL_SFX_PRIORITY);
    GamesManager.getInstance().cancelMatchmaking();
    this.trigger('dismiss');
  },

  onCTAAccept() {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
    this.trigger('cta_accept');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GameInviteItemView;
