const Enum = require('enum');

const CardIntentType = new Enum([
  'Burn',
  'Heal',
  'Remove',
  'Dispel',
  'Stun',
  'DrawCard',
  'TeleportTarget',
  'TeleportDestination',
  'Refresh',
  'Summon',
  'ApplyModifiers',
  'ManaCost',
  'ModifyATK',
  'ModifyHP',
  'Transform',
  'Immunity',
  'Followup',
  // more?
]);

module.exports = CardIntentType;
