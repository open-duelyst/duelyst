const Cards = require('app/sdk/cards/cardsLookupComplete');
const ModifierProvoke = require('app/sdk/modifiers/modifierProvoke');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const NM = {};

// NEUTRAL CARD INTENTS

NM[Cards.Neutral.Khymera] = [
  {
    type: CardIntentType.Summon,
    phase: CardPhaseType.Damage,
    amount: 1,
    cardId: Cards.Faction6.AzureDrake, // average token summoned
  },
];

NM[Cards.Neutral.HollowGrovekeeper] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Remove,
        followupIndex: 0,
        targets: CardTargetType.Enemy | CardTargetType.Minion,
      },
    ],
  },
];

NM[Cards.Neutral.KeeperOfTheVale] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        followupIndex: 0,
        numRandomTargets: 1,
        targets: CardTargetType.Dead | CardTargetType.Minion | CardTargetType.Friendly,
      },
    ],
  },
];

/*
NM[Cards.Neutral.GhostLynx] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportTarget,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly
      }
    ]
  }
];
*/

NM[Cards.Neutral.WoodWen] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.ApplyModifiers,
        modifiers: [
          ModifierProvoke.type,
        ],
        targets: CardTargetType.Minion | CardTargetType.Friendly,
      },
    ],
  },
];

module.exports = NM;
