const CONFIG = require('app/common/config');
const Cards = require('app/sdk/cards/cardsLookupComplete');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const Boss = {};

Boss[Cards.BossSpell.LaceratingFrost] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Enemy | CardTargetType.General,
  },
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Nearby | CardTargetType.General,
  },
];

Boss[Cards.BossSpell.EntanglingShadow] = [
  {
    type: CardIntentType.Summon,
    amount: 4,
    cardId: Cards.Faction4.Wraithling,
    targets: CardTargetType.Friendly,
    pattern: CONFIG.PATTERN_2X2,
  },
];

Boss[Cards.BossSpell.LivingFlame] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General,
  },
  {
    type: CardIntentType.Summon,
    amount: 2,
    cardId: Cards.Neutral.Spellspark,
    targets: CardTargetType.Nearby | CardTargetType.Friendly,
  },
];

Boss[Cards.BossSpell.MoldingEarth] = [
  {
    type: CardIntentType.Summon,
    amount: 3,
    cardId: Cards.Faction5.MiniMagmar,
    targets: CardTargetType.Nearby | CardTargetType.Friendly,
  },
];

Boss[Cards.BossSpell.EtherealWind] = [
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General,
  },
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction3.Dervish,
    targets: CardTargetType.Nearby | CardTargetType.Friendly,
  },
];

Boss[Cards.BossSpell.RestoringLight] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.All,
  },
  {
    type: CardIntentType.Heal,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

Boss[Cards.BossSpell.AncientKnowledge] = [
  {
    type: CardIntentType.DrawCard,
    amount: 2,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

module.exports = Boss;
