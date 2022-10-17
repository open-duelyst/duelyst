'use strict';

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var Scene = require('app/view/Scene');
var EscGameMenuTmpl = require('app/ui/templates/item/esc_game_menu.hbs');
var NavigationManager = require('app/ui/managers/navigation_manager');
var UtilityMenuItemView = require('./utility_menu');

var EscGameMenuItemView = UtilityMenuItemView.extend({

  template: EscGameMenuTmpl,

  id: 'app-esc-game-menu',
  className: 'modal duelyst-modal',

  events: {
    'click button.concede': 'onConcede',
  },

  onRender: function () {
    UtilityMenuItemView.prototype.onRender.apply(this, arguments);
    this._updateConcedeButton();
  },

  onShow: function () {
    UtilityMenuItemView.prototype.onShow.apply(this, arguments);
    this._updateConcedeButton();
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.game_over, this._updateConcedeButton);
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);
  },

  animateReveal: function () {
    // don't animate reveal esc menu
  },

  _updateConcedeButton: function () {
    if (SDK.GameType.isLocalGameType(SDK.GameSession.getInstance().getGameType()) || SDK.GameSession.getInstance().getIsSpectateMode()) {
      // when in local games, allow only exit
      this.$el.find('.concede').remove();
    } else {
      // when playing a network game, allow only concede
      this.$el.find('.btn-user-exit').remove();
    }
  },

  onConcede: function () {
    var gameSession = SDK.GameSession.getInstance();
    if (SDK.GameType.isNetworkGameType(gameSession.getGameType())) {
      if (gameSession.isOver()) {
        // allow loser to skip all remaining showing actions and go straight to game over screen
        var gameLayer = Scene.getInstance().getGameLayer();
        if (gameLayer != null && !gameLayer.getIsGameOver() && gameSession.getLoserId() === gameSession.getMyPlayerId()) {
          gameLayer.resetStepQueue();
          gameLayer.showGameOver();
        }
      } else {
        var concedeAction = gameSession.getMyPlayer().actionResign();
        gameSession.submitExplicitAction(concedeAction);
      }
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = EscGameMenuItemView;
