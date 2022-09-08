const Cards = require('app/sdk/cards/cardsLookupComplete');
const ModifierProvoke = require('app/sdk/modifiers/modifierProvoke');
const ModifierFlying = require('app/sdk/modifiers/modifierFlying');
const ModifierBlastAttack = require('app/sdk/modifiers/modifierBlastAttack');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const F3 = {};

// VETRUVIAN CARD INTENTS

F3[Cards.Spell.Blindscorch] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 0,
    amountIsRebase: true,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];
F3[Cards.Faction3.OrbWeaver] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        cardId: Cards.Faction3.OrbWeaver,
      },
    ],
  },
];
/*
F3[Cards.Spell.AurorasTears] = [
{
type: CardIntentType.ModifyATK,
amount: 2,
targets: CardTargetType.Artifact | CardTargetType.General | CardTargetType.Friendly
}
]; */

F3[Cards.Spell.BoneSwarm] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.General | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Nearby | CardTargetType.General | CardTargetType.Enemy,
  },
];

F3[Cards.Spell.FountainOfYouth] = [
  {
    type: CardIntentType.Heal,
    amount: 3,
    targets: CardTargetType.All | CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.EntropicDecay] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F3[Cards.Spell.SiphonEnergy] = [
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F3[Cards.Spell.ScionsFirstWish] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.InnerOasis] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
  {
    type: CardIntentType.ModifyHP,
    amountIsRebase: false,
    amount: 3,
    targets: CardTargetType.Friendly | CardTargetType.Minion | CardTargetType.All,
  },
];

/* F3[Cards.Spell.RashasCurse] = [
{
type: CardIntentType.Remove,
amount: 1,
targets: CardTargetType.Artifact | CardTargetType.General | CardTargetType.Enemy
},
{
type: CardIntentType.Summon,
cardId: Cards.Faction3.Dervish
}
]; */

/* F3[Cards.Spell.StarsFury] = [
{
type: CardIntentType.Summon,
cardId: Cards.Faction3.Dervish,
}
]; */

F3[Cards.Spell.CosmicFlesh] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierProvoke.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

/* F3[Cards.Spell.DrainMorale] = [
{
type: CardIntentType.ApplyModifiers,
targets: CardTargetType.Minion | CardTargetType.Enemy
}
];
*/
F3[Cards.Artifact.StaffOfYKir] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.ScionsSecondWish] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  }, /* ,
  // TODO: apply immune to general
   {
   type: CardIntentType.ApplyModifiers,
   targets: CardTargetType.Minion | CardTargetType.Friendly
   }
   */
];

F3[Cards.Spell.ScionsThirdWish] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierFlying.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.AstralPhasing] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 5,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierFlying.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.Maelstrom] = [
  {
    type: CardIntentType.Refresh,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Artifact.AnkhFireNova] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierBlastAttack.type,
    ],
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Artifact.Hexblade] = [
  /* {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.General | CardTargetType.Friendly
  }, */
  {
    type: CardIntentType.ModifyATK,
    amount: 3,
    amountIsRebase: false,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.Enslave] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F3[Cards.Spell.WindShroud] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction3.IronDervish,
  },
];
/*
F3[Cards.Spell.PsionicStrike] = [
{
type: CardIntentType.ApplyModifiers,
cardId: CardTargetType.General | CardTargetType.Friendly
}
];
*/

F3[Cards.Artifact.Spinecleaver] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.CircleOfDesiccation] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.All | CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F3[Cards.Spell.AstralFlood] = [
  {
    type: CardIntentType.DrawCard,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.DivineSpark] = [
  {
    type: CardIntentType.DrawCard,
    amount: 2,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F3[Cards.Spell.BloodOfAir] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction3.Dervish,
  },
];

F3[Cards.Faction3.SandswirlReader] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Remove,
        targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly | CardTargetType.Nearby,
      },
    ],
  },
];

F3[Cards.Spell.CataclysmicFault] = [
  {
    type: CardIntentType.Summon,
    amount: 5,
    cardId: Cards.Faction3.IronDervish,
  },
];

F3[Cards.Spell.BurdenOfKnowledge] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

module.exports = F3;
