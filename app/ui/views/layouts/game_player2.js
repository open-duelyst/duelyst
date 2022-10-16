const SDK = require('app/sdk');
const GamePlayerLayout = require('./game_player');

const GamePlayer2Layout = GamePlayerLayout.extend({

  id: 'app-game-player2',

  initialize() {
    // set player id before anything else in case it is used in initialization
    this.model.set('playerId', SDK.GameSession.current().getPlayer2().getPlayerId());
    GamePlayerLayout.prototype.initialize.apply(this, arguments);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = GamePlayer2Layout;
