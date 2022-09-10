const BOUNTY = require('./bounty');

const getBountyForDistanceFromMyGeneral = function (gameSession, playerId) {
  // yields exponentially increasing desire to be near general as his health declines
  return BOUNTY.DISTANCE_FROM_MY_GENERAL * (BOUNTY.DISTANCE_FROM_MY_GENERAL_FACTOR / gameSession.getGeneralForPlayer(gameSession.getPlayerById(playerId)).getHP());
};

module.exports = getBountyForDistanceFromMyGeneral;
