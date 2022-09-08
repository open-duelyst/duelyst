const CONFIG = require('app/common/config');
const Cards = require('app/sdk/cards/cardsLookupComplete');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const F4 = {};

// ABYSSIAN CARD INTENTS

F4[Cards.Spell.VoidPulse] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.General | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Heal,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];
F4[Cards.Faction4.GloomChaser] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction4.Wraithling,
    targets: CardTargetType.Nearby | CardTargetType.Friendly,
  },
];
/*
F4[Cards.Spell.CurseOfAgony] = [
  {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.Minion | CardTargetType.Enemy
  }
];

F4[Cards.Artifact.HornOfTheForsaken] = [
  {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.General | CardTargetType.Friendly
  }
];

F4[Cards.Spell.ConsumingRebirth] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.Summon,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.ModifyHP,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  }
];
*/
/*
F4[Cards.Spell.DaemonicLure] = [
  {
    type: CardIntentType.TeleportTarget,
    targets: CardTargetType.Minion | CardTargetType.Enemy
  },
  {
    type: CardTargetType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportDestination,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy
      }
    ]
  }
];
*/
F4[Cards.Spell.SoulshatterPact] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.All,
  },
];

F4[Cards.Spell.ShadowReflection] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 5,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F4[Cards.Faction4.SharianShadowdancer] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    phase: CardPhaseType.Death,
    targets: CardTargetType.General | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Heal,
    amount: 1,
    phase: CardPhaseType.Death,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F4[Cards.Faction4.ShadowWatcher] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Self,
    phase: CardPhaseType.Death,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Self,
    phase: CardPhaseType.Death,
  },
];
/*
F4[Cards.Faction4.BloodmoonPriestess] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    phase: CardPhaseType.Death,
    cardId: Cards.Faction4.Wraithling
  }
];
*/
F4[Cards.Artifact.SpectralBlade] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  /* {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.General | CardTargetType.Friendly
} */
];
/*
F4[Cards.Spell.DeathfireCrescendo] = [
  {
    type: CardIntentType.ModifyHP,
    amount: 2,
    amountIsRebase: false,
    phase: CardPhaseType.Death,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    phase: CardPhaseType.Death,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  }
];

F4[Cards.Artifact.SoulGrimwar] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    phase: CardPhaseType.Death,
    targets: CardTargetType.General | CardTargetType.Friendly
  }
];
*/
F4[Cards.Spell.AbyssianStrength] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 4,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 4,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F4[Cards.Spell.NetherSummoning] = [
  {
    type: CardIntentType.Summon,
    numRandomTargets: 2,
    amount: 2,
    targets: CardTargetType.Dead | CardTargetType.DeadUntilLastFriendlyTurn | CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F4[Cards.Faction4.DarkSiren] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.ModifyATK,
        amount: -2,
        amountIsRebase: false,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy,
      },
    ],
  },
];

F4[Cards.Spell.DarkSeed] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Enemy,
  },
];

F4[Cards.Spell.BreathOfTheUnborn] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
  {
    type: CardIntentType.Heal,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.All,
  },
];

F4[Cards.Spell.DarkSacrifice] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ManaCost,
    amount: -2,
    targets: CardTargetType.Minion | CardTargetType.Hand | CardTargetType.Friendly,
  },
];

F4[Cards.Spell.DarkTransformation] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction4.Wraithling,
  },
];

F4[Cards.Faction4.NightsorrowAssassin] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Remove,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy,
      },
    ],
  },
];
/*
F4[Cards.Spell.RitualBanishing] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Friendly
  },
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Enemy
  }
]; */

F4[Cards.Spell.RiteOfTheUndervault] = [
  {
    type: CardIntentType.DrawCard,
    amount: 5,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F4[Cards.Spell.WraithlingSwarm] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction4.Wraithling,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        followupIndex: 0,
        cardId: Cards.Faction4.Wraithling,
      },
      {
        type: CardIntentType.Followup,
        followups: [
          {
            type: CardIntentType.Summon,
            amount: 1,
            followupIndex: 1,
            cardId: Cards.Faction4.Wraithling,
          },
        ],
      },
    ],
  },
];
/*

F4[Cards.Spell.ShadowNova] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.General | CardTargetType.Enemy | CardTargetType.Minion,
    pattern: CONFIG.PATTERN_2X2
  }
]; */

F4[Cards.Spell.Shadowspawn] = [
  {
    type: CardIntentType.Summon,
    amount: 2,
    cardId: Cards.Faction4.Wraithling,
  },
];

F4[Cards.Spell.AbyssalScar] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Enemy | CardTargetType.Minion,
  },
  {
    type: CardIntentType.Summon,
    phase: CardPhaseType.Death,
    amount: 1,
    cardId: Cards.Tile.Shadow,
  },
];

F4[Cards.Spell.VoidSteal] = [
  {
    type: CardIntentType.ModifyATK,
    amount: -3,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Nearby,
  },
];

F4[Cards.Spell.InkhornGaze] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

/* F4[Cards.Spell.NecroticSphere] = [
   {
     type: CardIntentType.Remove,
     targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Nearby | CardTargetType.Friendly | CardTargetType.General
   }
]; */

F4[Cards.Spell.VeilOfUnraveling] = [
  {
    type: CardIntentType.Burn,
    amount: 10,
    targets: CardTargetType.All | CardTargetType.General | CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F4[Cards.Artifact.AngryRebirthAmulet] = [
  {
    type: CardIntentType.Summon,
    numRandomTargets: 1,
    targets: CardTargetType.Dead | CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F4[Cards.Spell.Shadowstalk] = [
  {
    type: CardIntentType.Summon,
    amount: 2,
    cardId: Cards.Faction4.Wraithling,
  },
];

F4[Cards.Spell.Doom] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Enemy | CardTargetType.General,
  },
];

F4[Cards.Spell.HorrificVisage] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: -3,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
];

F4[Cards.Artifact.FurorChakram] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.All,
  },
];

F4[Cards.Spell.Vellumscry] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

module.exports = F4;
