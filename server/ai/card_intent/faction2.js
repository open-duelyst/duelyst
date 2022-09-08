const Cards = require('app/sdk/cards/cardsLookupComplete');
const ModifierRanged = require('app/sdk/modifiers/modifierRanged');
const ModifierBackstab = require('app/sdk/modifiers/modifierBackstab');
const ModifierTranscendance = require('app/sdk/modifiers/modifierTranscendance');
const ModifierFlying = require('app/sdk/modifiers/modifierFlying');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const F2 = {};

// SONGHAI CARD INTENTS

F2[Cards.Spell.PhoenixFire] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.KageLightning] = [
  {
    type: CardIntentType.Burn,
    amount: 5,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F2[Cards.Spell.SpiralTechnique] = [
  {
    type: CardIntentType.Burn,
    amount: 8,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.GhostLightning] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
];

F2[Cards.Spell.TwinStrike] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    numRandomTargets: 2,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

/* F2[Cards.Spell.ArtifactDefiler] = [
{
type: CardIntentType.Remove,
targets: CardTargetType.Artifact | CardTargetType.Enemy
}
]; */

F2[Cards.Spell.ManaVortex] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ManaCost,
    amount: -1,
    targets: CardTargetType.Spell | CardTargetType.Friendly | CardTargetType.Hand,
  },
];

F2[Cards.Spell.HeavensEclipse] = [
  {
    type: CardIntentType.DrawCard,
    amount: 3,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F2[Cards.Spell.InnerFocus] = [
  {
    type: CardIntentType.Refresh,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.Juxtaposition] = [
  {
    type: CardIntentType.TeleportTarget,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportDestination,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
      },
    ],
  },
];

/* F2[Cards.Spell.AncestralDivination] = [
{
type: CardIntentType.DrawCard,
targets: CardTargetType.Minion | CardTargetType.General | CardTargetType.Hand | CardTargetType.Friendly
}
]; */

// old logic is better
/* F2[Cards.Artifact.MaskOfBloodLeech] = [
{
type: CardIntentType.Burn,
amount: 1,
phase: CardPhaseType.Spell,
targets: CardTargetType.General | CardTargetType.Enemy
}
]; */
/*
F2[Cards.Spell.MistDragonSeal] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.TeleportTarget,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportDestination,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Friendly
      }
    ]
  }
];
*/
/* F2[Cards.Spell.MistWalking] = [
{
type: CardIntentType.TeleportTarget,
targets: CardTargetType.General | CardTargetType.Friendly
}
];
*/
F2[Cards.Spell.SaberspineSeal] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.General,
  },
];
/*
F2[Cards.Faction2.ChakriAvatar] = [
{
type: CardIntentType.ModifyATK,
amount: 1,
amountIsRebase: false,
targets: CardTargetType.Self,
phase: CardPhaseType.Spell
},
{
type: CardIntentType.ModifyHP,
amount: 1,
amountIsRebase: false,
targets: CardTargetType.Self,
phase: CardPhaseType.Spell
}
]; */
/*
F2[Cards.Spell.EightGates] = [
{
type: CardIntentType.ApplyModifiers,
targets: CardTargetType.Spell | CardTargetType.Friendly
}
]; */

F2[Cards.Artifact.MaskOfShadows] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierBackstab.type,
    ],
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Artifact.MaskOfTranscendance] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierRanged.type,
    ],
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.KillingEdge] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 4,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.OnyxBearSeal] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction2.OnyxBear,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F2[Cards.Faction2.MageOfFourWinds] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Enemy,
    phase: CardPhaseType.Spell,
  },
  {
    type: CardIntentType.Heal,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
    phase: CardPhaseType.Spell,
  },
];
/*
F2[Cards.Spell.Blink] = [
  {
    type: CardIntentType.TeleportTarget,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportDestination,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Friendly
      }
    ]
  }
];
*/
F2[Cards.Spell.ArcaneHeart] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction2.Heartseeker,
  },
];

F2[Cards.Spell.Pandamonium] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction2.OnyxBear,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
];

F2[Cards.Spell.EtherealBlades] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.CobraStrike] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Enemy,
  },
];

F2[Cards.Artifact.MaskOfCelerity] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierTranscendance.type,
    ],
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.SpiralCounter] = [
  {
    type: CardIntentType.Burn,
    amount: 8,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F2[Cards.Spell.Gotatsu] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F2[Cards.Spell.TwilightReiki] = [
  {
    type: CardIntentType.DrawCard,
    amount: 3,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F2[Cards.Spell.Thunderbomb] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Nearby,
  },
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F2[Cards.Spell.MassFlight] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierFlying.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.All,
  },
];

F2[Cards.Spell.SeekerSquad] = [
  {
    type: CardIntentType.Summon,
    amount: 4,
    cardId: Cards.Faction2.Heartseeker,
  },
];

module.exports = F2;
