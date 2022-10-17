'use strict';

var SDK = require('app/sdk');
var GamePlayerLayout = require('./game_player');

var GamePlayer1Layout = GamePlayerLayout.extend({

  id: 'app-game-player1',

  initialize: function () {
    // set player id before anything else in case it is used in initialization
    this.model.set('playerId', SDK.GameSession.current().getPlayer1().getPlayerId());
    GamePlayerLayout.prototype.initialize.apply(this, arguments);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = GamePlayer1Layout;
