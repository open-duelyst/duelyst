'use strict';

var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Animations = require('app/ui/views/animations');
var GameStartingHandTemplate = require('app/ui/templates/item/game_starting_hand.hbs');

var GameStartingHandItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-game-starting-hand',
  className: 'modal duelyst-modal',

  template: GameStartingHandTemplate,

  ui: {
    $opponentConnected: '.opponent-connected',
    $opponentConnecting: '.opponent-connecting',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  onRender: function () {
    if (!SDK.GameType.isMultiplayerGameType(SDK.GameSession.getInstance().getGameType()) || SDK.GameSession.getInstance().getIsSpectateMode()) {
      // in non-multiplayer game, no need to show opponent connection status
      this.ui.$opponentConnecting.hide();
      this.ui.$opponentConnected.hide();
    }
    this._updateOpponentConnection();
  },

  onShow: function () {
    this.listenTo(SDK.NetworkManager.getInstance().getEventBus(), EVENTS.opponent_connection_status_changed, this._updateOpponentConnection);
  },

  _updateOpponentConnection: function () {
    if (SDK.NetworkManager.getInstance().isOpponentConnected) {
      this.ui.$opponentConnecting.removeClass('active');
      this.ui.$opponentConnected.addClass('active');
    } else {
      this.ui.$opponentConnecting.addClass('active');
      this.ui.$opponentConnected.removeClass('active');
    }
  },
});

// Expose the class either via CommonJS or the global object
module.exports = GameStartingHandItemView;
