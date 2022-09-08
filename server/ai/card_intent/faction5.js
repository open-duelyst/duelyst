const CONFIG = require('app/common/config');
const Cards = require('app/sdk/cards/cardsLookupComplete');
const ModifierFrenzy = require('app/sdk/modifiers/modifierFrenzy');
const ModifierGrow = require('app/sdk/modifiers/modifierGrow');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const F5 = {};

// MAGMAR CARD INTENTS
/*
F5[Cards.Faction5.EarthWalker] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
  phase: CardPhaseType.StartTurn,
    targets: CardTargetType.Self
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
  phase: CardPhaseType.StartTurn,
    targets: CardTargetType.Self
  }
]; */

F5[Cards.Faction5.PrimordialGazer] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.ModifyATK,
        amount: 2,
        amountIsRebase: false,
        followupIndex: 0,
        targets: CardTargetType.Friendly | CardTargetType.Minion,
      },
      {
        type: CardIntentType.ModifyHP,
        amount: 2,
        amountIsRebase: false,
        followupIndex: 0,
        targets: CardTargetType.Friendly | CardTargetType.Minion,
      },
    ],
  },
];
/*
F5[Cards.Faction5.Grimrock] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
  phase: CardPhaseType.StartTurn,
    targets: CardTargetType.Self
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
  phase: CardPhaseType.StartTurn,
    targets: CardTargetType.Self
  }
];

F5[Cards.Faction5.Kolossus] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 4,
    amountIsRebase: false,
  phase: CardPhaseType.StartTurn,
    targets: CardTargetType.Self
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 4,
    amountIsRebase: false,
  phase: CardPhaseType.StartTurn,
    targets: CardTargetType.Self
  }
];
*/
F5[Cards.Spell.EarthSphere] = [
  {
    type: CardIntentType.Heal,
    amount: 8,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F5[Cards.Spell.Tremor] = [
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
    pattern: CONFIG.PATTERN_2X2,
  },
];

F5[Cards.Spell.NaturalSelection] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
];

/*
F5[Cards.Spell.PlasmaStorm] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.All | CardTargetType.Friendly | CardTargetType.Enemy
  }
];
*/
F5[Cards.Spell.ChrysalisBloom] = [
  {
    type: CardIntentType.Summon,
    amount: 4,
    cardId: Cards.Faction5.Kolossus,
  },
];

F5[Cards.Spell.FlashReincarnation] = [
  {
    type: CardIntentType.ManaCost,
    amount: -2,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Hand,
  },
];
/*
F5[Cards.Spell.DampeningWave] = [
  {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.Minion | CardTargetType.Enemy
  }
];

F5[Cards.Spell.DanceOfDreams] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    phase: CardPhaseType.Death,
    targets: CardTargetType.General | CardTargetType.Friendly
  }
];
*/
F5[Cards.Spell.BoundedLifeforce] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 10,
    amountIsRebase: true,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 10,
    amountIsRebase: true,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.EggMorph] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
];
/*
F5[Cards.Spell.MindSteal] = [
  {
    type: CardIntentType.Summon,
    numRandomTargets: 1,
    amount: 1
  }
];

F5[Cards.Spell.FractalReplication] = [
  {
    type: CardIntentType.Summon,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  }
]; */

F5[Cards.Spell.Metamorphosis] = [
  {
    // type: CardIntentType.Remove,
    type: CardIntentType.Transform,
    cardId: Cards.Faction5.MiniMagmar,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
];
/*
F5[Cards.Faction5.SpiritHarvester] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All | CardTargetType.Friendly
  }
];
*/
F5[Cards.Artifact.PristineScale] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierFrenzy.type,
    ],
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Artifact.AdamantineClaws] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 4,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Artifact.TwinFang] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    phase: CardPhaseType.Damage,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.KineticEquilibrium] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
    pattern: CONFIG.PATTERN_3x3_INCLUDING_CENTER,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
    pattern: CONFIG.PATTERN_3x3_INCLUDING_CENTER,
  },
];

F5[Cards.Spell.DiretideFrenzy] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierFrenzy.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.GreaterFortitude] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.Amplification] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 4,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.Overload] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.SeekingEye] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F5[Cards.Artifact.MorinKhur] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.FlamingStampede] = [
  {
    type: CardIntentType.Burn,
    amount: 5,
    targets: CardTargetType.All | CardTargetType.General | CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F5[Cards.Spell.RazorSkin] = [
  {
    type: CardIntentType.ModifyATK,
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

F5[Cards.Spell.EntropicGaze] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Enemy | CardTargetType.General,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.Friendly | CardTargetType.General | CardTargetType.Enemy,
  },
];

F5[Cards.Spell.TectonicSpikes] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.Enemy | CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 3,
    targets: CardTargetType.Friendly | CardTargetType.General | CardTargetType.Enemy,
  },
];

F5[Cards.Artifact.GrowthBangle] = [
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierGrow.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.All,
  },
];

F5[Cards.Spell.MoltenRebirth] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        cardId: Cards.Faction5.Grimrock,
      },
    ],
  },
];

F5[Cards.Faction5.Lavaslasher] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Burn,
        amount: 4,
        targets: CardTargetType.Minion | CardTargetType.Enemy,
      },
    ],
  },
];

F5[Cards.Spell.VaathsBrutality] = [
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Spell.PrimalBallast] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General | CardTargetType.Friendly,
  },
];

F5[Cards.Artifact.RageReactor] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
];

F5[Cards.Spell.SaurianFinality] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Heal,
    amount: 10,
    targets: CardTargetType.Friendly | CardTargetType.General,
  },
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.Enemy | CardTargetType.General,
  },
];

module.exports = F5;
