const Enum = require('enum');

const CardPhaseType = new Enum([
  'Now',
  'EndTurn',
  'StartTurn',
  'Death',
  'Summon',
  'Spell',
  'Damage',
  // more?
]);

module.exports = CardPhaseType;
