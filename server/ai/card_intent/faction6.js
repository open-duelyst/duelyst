const Cards = require('app/sdk/cards/cardsLookupComplete');
const ModifierFlying = require('app/sdk/modifiers/modifierFlying');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const F6 = {};

// VANAR CARD INTENTS

F6[Cards.Spell.BonechillBarrier] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction6.BonechillBarrier,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        followupIndex: 0,
        cardId: Cards.Faction6.BonechillBarrier,
      },
      {
        type: CardIntentType.Followup,
        followups: [
          {
            type: CardIntentType.Summon,
            amount: 1,
            followupIndex: 1,
            cardId: Cards.Faction6.BonechillBarrier,
          },
        ],
      },
    ],
  },
];

F6[Cards.Spell.AspectOfTheWolf] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction6.WolfAspect,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  }, /* ,
  {
    type: CardIntentType.ModifyATK,
    amount: 3,
    amountIsRebase: true,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 3,
    amountIsRebase: true,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly
} */
];

F6[Cards.Spell.AspectOfTheDrake] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction6.AzureDrake,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ApplyModifiers,
    modifiers: [
      ModifierFlying.type,
    ],
    targets: CardTargetType.Minion | CardTargetType.Nearby | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.AspectOfTheMountains] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction6.SeismicElemental,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Burn,
    amount: 5,
    targets: CardTargetType.Minion | CardTargetType.Nearby | CardTargetType.Enemy,
  },
];

F6[Cards.Spell.SpiritoftheWild] = [
  {
    type: CardIntentType.Refresh,
    targets: CardTargetType.Minion | CardTargetType.EnemySide | CardTargetType.Friendly,
  },
];
/*
F6[Cards.Spell.RitualOfTheWind] = [
  {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly
  }
];

F6[Cards.Artifact.Frostbiter] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.Nearby | CardTargetType.General | CardTargetType.Friendly
  }
];

F6[Cards.Faction6.VoiceoftheWind] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    phase: CardPhaseType.Summon,
    cardId: Cards.Faction6.WaterBear
  }
];
*/
F6[Cards.Faction6.Razorback] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 2,
    amountIsRebase: false,
    targets: CardTargetType.All | CardTargetType.Friendly | CardTargetType.Minion,
  },
];

F6[Cards.Artifact.Winterblade] = [
  /* {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.General | CardTargetType.Friendly
}, */
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F6[Cards.Artifact.Snowpiercer] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.PermafrostShield] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amountIsRebase: false,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];
/*
F6[Cards.Spell.Mesmerize] = [
  {
    type: CardIntentType.TeleportTarget,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly
  }
]; */

F6[Cards.Spell.ElementalFury] = [
  /* {
    type: CardIntentType.ApplyModifiers,
    targets: CardTargetType.Minion | CardTargetType.Friendly
}, */
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 2,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.MarkOfSolitude] = [
  {
    type: CardIntentType.Immunity,
    immunity: CardImmunity.DamagingGenerals,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.ModifyATK,
    amount: 5,
    amountIsRebase: true,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 5,
    amountIsRebase: true,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F6[Cards.Spell.IceCage] = [
  {
    type: CardIntentType.Remove,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

F6[Cards.Spell.GravityWell] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction6.GravityWell,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        followupIndex: 0,
        cardId: Cards.Faction6.GravityWell,
      },
      {
        type: CardIntentType.Followup,
        followups: [
          {
            type: CardIntentType.Summon,
            amount: 1,
            followupIndex: 1,
            cardId: Cards.Faction6.GravityWell,
          },
          {
            type: CardIntentType.Followup,
            followups: [
              {
                type: CardIntentType.Summon,
                amount: 1,
                followupIndex: 2,
                cardId: Cards.Faction6.GravityWell,
              },
            ],
          },
        ],
      },
    ],
  },
];

F6[Cards.Spell.BlazingSpines] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction6.BlazingSpines,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        followupIndex: 0,
        cardId: Cards.Faction6.BlazingSpines,
      },
    ],
  },
];

F6[Cards.Spell.LuminousCharge] = [
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction6.FrostBomb,
  },
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Summon,
        amount: 1,
        followupIndex: 0,
        cardId: Cards.Faction6.FrostBomb,
      },
      {
        type: CardIntentType.Followup,
        followups: [
          {
            type: CardIntentType.Summon,
            amount: 1,
            followupIndex: 1,
            cardId: Cards.Faction6.FrostBomb,
          },
          {
            type: CardIntentType.Followup,
            followups: [
              {
                type: CardIntentType.Summon,
                amount: 1,
                followupIndex: 2,
                cardId: Cards.Faction6.FrostBomb,
              },
              {
                type: CardIntentType.Followup,
                followups: [
                  {
                    type: CardIntentType.Summon,
                    amount: 1,
                    followupIndex: 3,
                    cardId: Cards.Faction6.FrostBomb,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

F6[Cards.Spell.Avalanche] = [
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.FriendlySide | CardTargetType.General | CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Burn,
    amount: 4,
    targets: CardTargetType.FriendlySide | CardTargetType.General | CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.Cryogenesis] = [
  {
    type: CardIntentType.Burn,
    amount: 4,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.FlashFreeze] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.ChromaticCold] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General,
  },
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.Warbird] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Column | CardTargetType.General | CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F6[Cards.Spell.KineticSurge] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.Hand | CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amountIsRebase: false,
    amount: 1,
    targets: CardTargetType.Hand | CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.WailingOverdrive] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 5,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 5,
    amountIsRebase: false,
    targets: CardTargetType.Minion | CardTargetType.Friendly,
  },
];

F6[Cards.Spell.Frostburn] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All,
  },
];

F6[Cards.Artifact.WhiteAsp] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: false,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
];

F6[Cards.Faction6.Icy] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Stun,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.General,
      },
    ],
  },
];

F6[Cards.Spell.FrigidCorona] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly,
  },
  {
    type: CardIntentType.Stun,
    targets: CardTargetType.General | CardTargetType.Enemy | CardTargetType.Minion,
  },
];

F6[Cards.Spell.Enfeeble] = [
  {
    type: CardIntentType.ModifyATK,
    amountIsRebase: true,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy | CardTargetType.All,
  },
  {
    type: CardIntentType.ModifyHP,
    amountIsRebase: true,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Friendly | CardTargetType.Enemy | CardTargetType.All,
  },
];

F6[Cards.Spell.ManaDeathgrip] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy,
  },
];

F6[Cards.Spell.BlindingSnowstorm] = [
  {
    type: CardIntentType.Burn,
    amount: 1,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.All | CardTargetType.General,
  },
];

F6[Cards.Spell.SnowPatrol] = [
  {
    type: CardIntentType.Summon,
    amount: 2,
    cardId: Cards.Faction6.WyrBeast,
  },
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction6.CrystalCloaker,
  },
  {
    type: CardIntentType.Summon,
    amount: 1,
    cardId: Cards.Faction6.WolfRaven,
  },
];

F6[Cards.Spell.AspectOfBear] = [
  {
    type: CardIntentType.Transform,
    cardId: Cards.Faction6.Ursaplomb,
    targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly,
  },
];

module.exports = F6;
