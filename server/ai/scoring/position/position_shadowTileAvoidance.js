const ModifierStackingShadows = require('app/sdk/modifiers/modifierStackingShadows');
const ScoreForUnitDamage = require('server/ai/scoring/base/unit_damage');

const position_shadowTileAvoidance = function (gameSession, unit, position) {
  let score = 0;
  const { x } = position;
  const { y } = position;
  const tiles = gameSession.getBoard().getTiles(true);
  for (let i = 0, il = tiles.length; i < il; i++) {
    const tile = tiles[i];
    // find an enemy tile at this position
    if (tile.getPositionX() == x && tile.getPositionY() == y && !tile.getIsSameTeamAs(unit)) {
      // score damage dealt by shadow tile
      const modifierStackingShadows = tile.getModifierByClass(ModifierStackingShadows);
      if (modifierStackingShadows != null) {
        score -= ScoreForUnitDamage(unit, modifierStackingShadows.getShadowCreepDamage());
      }
    }
  }

  return score;
};

module.exports = position_shadowTileAvoidance;
