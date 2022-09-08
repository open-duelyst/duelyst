const Cards = require('app/sdk/cards/cardsLookupComplete');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const NU = {

};

// NEUTRAL ANCIENT BONDS CARD INTENTS

NU[Cards.Neutral.Grimes] = [
  {
    type: CardIntentType.Summon,
    amount: 2, // one on summon, one on death
    cardId: Cards.Faction6.CrystalCloaker,
  },
];

NU[Cards.Neutral.EMP] = [
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly | CardTargetType.All | CardTargetType.General,
  },
];

NU[Cards.Spell.DragonBreath] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly | CardTargetType.General,
  },
];

NU[Cards.Spell.DragonGrace] = [
  {
    type: CardIntentType.Heal,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly | CardTargetType.General,
  },
];

NU[Cards.Spell.DragonHeart] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

module.exports = NU;
