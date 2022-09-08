const CONFIG = require('app/common/config');
const Cards = require('app/sdk/cards/cardsLookupComplete');
const ModifierAirdrop = require('app/sdk/modifiers/modifierAirdrop');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const F1 = {};

// LYONAR CARD INTENTS

F1[Cards.Spell.Tempest] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.All | CardTargetType.General | CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F1[Cards.Spell.TrueStrike] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F1[Cards.Faction1.ArclyteSentinel] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.ModifyATK,
        amount: 2,
        amountIsRebase: false,
        followupIndex: 0,
        targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.Enemy,
      },
      {
        type: CardIntentType.ModifyHP,
        amount: -2,
        amountIsRebase: false,
        followupIndex: 0,
        targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.Enemy,
      },
    ],
  },
];

F1[Cards.Spell.CircleLife] = [
  {
    type: CardIntentType.Burn,
    amount: 5,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Heal,
    amount: 5,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F1[Cards.Spell.HolyImmolation] = [
  {
    type: CardIntentType.Burn,
    amount: 4,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Nearby,
  },
  {
    type: CardIntentType.Heal,
    amount: 4,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F1[Cards.Spell.SundropElixir] = [
  {
    type: CardIntentType.Heal,
    amount: 5,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.General | CardTargetType.Enemy,
  },
];

F1[Cards.Spell.BeamShock] = [
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General,
  },
];

F1[Cards.Spell.Martyrdom] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Heal,
    amount: 5,
    targets: CardTargetType.General | CardTargetType.TargetFriendly,
  },
];

F1[Cards.Spell.SunBloom] = [
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly | CardTargetType.Tile,
    pattern: CONFIG.PATTERN_2X2,
  },
];

F1[Cards.Spell.AegisBarrier] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
  {
    type: CardIntentType.Immunity,
    immunity: CardImmunity.Spells,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Spell,
  },
];

F1[Cards.Spell.AerialRift] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierAirdrop.type,
    ],
    targets: CardTargetType.Hand | CardTargetType.Minion | CardTargetType.Friendly,
  },
];

// This one is questionable but I think the old logic might be better here just in case it tries to use this on a bloodtear alchemist
/* F1[Cards.Spell.DivineBond] = [
{
type: CardIntentType.ModifyATK,
amount: 6,
amountIsRebase: false,
targets: CardTargetType.Friendly | CardTargetType.Minion
}
]; */

F1[Cards.Spell.WarSurge] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.All,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.All,
  },
];

F1[Cards.Artifact.SunstoneBracers] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];
/*
F1[Cards.Spell.LionheartBlessing] = [
{
type: CardIntentType.DrawCard,
phase: CardPhaseType.Attack,
targets: CardTargetType.Friendly | CardTargetType.Minion
}
]; */

F1[Cards.Spell.LastingJudgement] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: -3,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F1[Cards.Spell.AurynNexus] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion,
  },
];

/* F1[Cards.Spell.Magnetize] = [
{
type: CardIntentType.TeleportTarget,
targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.Enemy
}
]; */

/* F1[Cards.Artifact.IndomitableWill] = [
{
type: CardIntentType.ModifyATK,
amount: 2,
amountIsRebase: false,
targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.Nearby
}
];

F1[Cards.Artifact.ArclyteRegalia] = [
{
type: CardIntentType.ModifyATK,
amount: 2,
amountIsRebase: false,
targets: CardTargetType.Friendly | CardTargetType.General
},
{
type: CardIntentType.ApplyModifiers,
targets: CardTargetType.Friendly | CardTargetType.General
}
];
*/
F1[Cards.Spell.Decimate] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.NotNearby | CardTargetType.General | CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F1[Cards.Spell.Roar] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F1[Cards.Spell.Afterglow] = [
  {
    type: CardIntentType.Heal,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F1[Cards.Faction1.SunWisp] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F1[Cards.Spell.Afterblaze] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 4,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion,
  },
];

F1[Cards.Spell.IroncliffeHeart] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction1.IroncliffeGuardian,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F1[Cards.Spell.FightingSpirit] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.All,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F1[Cards.Artifact.DawnsEye] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 4,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F1[Cards.Faction1.Fiz] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Heal,
        amount: 2,
        followupIndex: 0,
        targets: CardTargetType.General | CardTargetType.Minion | CardTargetType.Friendly,
      },
    ],
  },
];

F1[Cards.Spell.SkyPhalanx] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction1.SilverguardKnight,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        followupIndex: 0,
        cardId: Cards.Faction1.SilverguardKnight,
      },
      {
        type: CardIntentType.Followup,
        followups: [
          {
            type: CardIntentType.Summon,
            amount: 1,
            followupIndex: 1,
            cardId: Cards.Faction1.SilverguardKnight,
          },
        ],
      },
    ],
  },
];

F1[Cards.Spell.SkyBurial] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.NotNearby | CardTargetType.General | CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F1[Cards.Spell.DrainingWave] = [
  {
    type: CardIntentType.Burn,
    amount: 4,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Burn,
    amount: 4,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F1[Cards.Spell.TrinityOath] = [
  {
    type: CardIntentType.DrawCard,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Heal,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F1[Cards.Spell.AperionsClaim] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
    pattern: CONFIG.PATTERN_3x3_INCLUDING_CENTER,
  },
];

F1[Cards.Spell.Congregation] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
    pattern: CONFIG.PATTERN_2X2,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
    pattern: CONFIG.PATTERN_2X2,
  },
];

module.exports = F1;
