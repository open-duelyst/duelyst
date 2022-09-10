const Enum = require('enum');

const CardImmunity = new Enum([
  'Generals',
  'Attacks',
  'Spells',
  'Damage',
  'DamagingGenerals',

  // more?
]);

module.exports = CardImmunity;
