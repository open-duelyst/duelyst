const Enum = require('enum');

const CardTargetType = new Enum([
  'Self', // targets self
  'All', // everything (ex: CardTargetType.All | CardTargetType.Friendly | CardTargetType.Minion -> all friendly minions)
  'Friendly', // friendly units
  'Enemy', // enemy units
  'Dead', // dead units
  'DeadUntilLastFriendlyTurn', // dead units until last friendly turn
  'DeadUntilLastEnemyTurn', // dead units until last enemy turn
  'TargetFriendly', // friendly of target (ex: CardTargetType.General | CardTargetType.TargetFriendly -> friendly general of target)
  'TargetEnemy', // enemy of target (ex: CardTargetType.General | CardTargetType.TargetEnemy -> enemy general of target)
  'General', // generals (same as player), has special behavior when targets does not include minion
  'Minion', // minions
  'Tile', // tiles
  'Artifact', // artifacts
  'Spell', // spells
  'Hand', // cards in hand
  'Deck', // cards in deck
  'Played', // played spells/artifacts
  'Nearby', // cards nearby the target position
  'NotNearby', // cards not nearby the target position
  'Row', // cards in the row of the target position
  'Column', // cards in the column of the target position
  'FriendlySide', // cards on the friendly side of the card owner (ex: CardTargetType.FriendlySide | CardTargetType.Minion -> all minions on my side)
  'EnemySide', // cards on the enemy side of the card owner (ex: CardTargetType.EnemySide | CardTargetType.Minion -> all minions on enemy side)
  // more?
]);

module.exports = CardTargetType;
