const Cards = require('app/sdk/cards/cardsLookupComplete');
const CardIntentType = require('./card_intent_type');
const CardTargetType = require('./card_target_type');
const CardPhaseType = require('./card_phase_type');
const CardImmunity = require('./card_immunity');

const NC = {};

// NEUTRAL CORE SET CARD INTENTS

NC[Cards.Neutral.EphemeralShroud] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Dispel,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy | CardTargetType.Friendly | CardTargetType.General,
      },
    ],
  },
];

NC[Cards.Neutral.PhaseHound] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    targets: CardTargetType.General | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

NC[Cards.Neutral.BloodtearAlchemist] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Burn,
        amount: 1,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy,
      },
    ],
  },
];

NC[Cards.Neutral.DeathBlighter] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.Nearby | CardTargetType.Minion | CardTargetType.Enemy,
  },
];

NC[Cards.Neutral.HealingMystic] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Heal,
        amount: 2,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.General | CardTargetType.Enemy | CardTargetType.Friendly,
      },
    ],
  },
];

NC[Cards.Neutral.EmeraldRejuvenator] = [
  {
    type: CardIntentType.Heal,
    amount: 4,
    targets: CardTargetType.General | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

NC[Cards.Neutral.Spelljammer] = [
  {
    type: CardIntentType.DrawCard,
    amount: 1,
    phase: CardPhaseType.EndTurn,
    targets: CardTargetType.General | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

NC[Cards.Neutral.CrimsonOculus] = [
  {
    type: CardIntentType.ModifyATK,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Self,
    phase: CardPhaseType.Summon,
  },
  {
    type: CardIntentType.ModifyHP,
    amount: 1,
    amountIsRebase: false,
    targets: CardTargetType.Self,
    phase: CardPhaseType.Summon,
  },
];

NC[Cards.Neutral.FlamebloodWarlock] = [
  {
    type: CardIntentType.Burn,
    amount: 3,
    targets: CardTargetType.General | CardTargetType.Friendly | CardTargetType.Enemy,
  },
];

NC[Cards.Neutral.Lightbender] = [
  {
    type: CardIntentType.Dispel,
    targets: CardTargetType.Friendly | CardTargetType.Enemy | CardTargetType.Nearby,
  },
];

NC[Cards.Neutral.FrostboneNaga] = [
  {
    type: CardIntentType.Burn,
    amount: 2,
    targets: CardTargetType.Friendly | CardTargetType.Enemy | CardTargetType.Nearby,
  },
];

NC[Cards.Neutral.Maw] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.Burn,
        amount: 2,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy,
      },
    ],
  },
];

NC[Cards.Neutral.Crossbones] = [
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

NC[Cards.Neutral.PrimusFist] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.ModifyATK,
        amountIsRebase: false,
        amount: 2,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Friendly,
      },
    ],
  },
];
/*
NC[Cards.Neutral.RepulsionBeast] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportTarget,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Enemy
      },
      {
        type: CardIntentType.Followup,
        followups: [
          {
            type: CardIntentType.TeleportDestination,
            followupIndex: 1,
            targets: CardTargetType.Minion | CardTargetType.Enemy
          }
        ]
      }
    ]
  }
];
*/
NC[Cards.Neutral.Songweaver] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.ModifyATK,
        amountIsRebase: false,
        amount: 1,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Friendly,
      },
      {
        type: CardIntentType.ModifyHP,
        amountIsRebase: false,
        amount: 1,
        followupIndex: 0,
        targets: CardTargetType.Minion | CardTargetType.Friendly,
      },
    ],
  },
];
/*
NC[Cards.Neutral.SilhoutteTracer] = [
  {
    type: CardIntentType.Followup,
    followups: [
      {
        type: CardIntentType.TeleportTarget,
        followupIndex: 0,
        targets: CardTargetType.General | CardTargetType.Friendly
      },
      {
        type: CardIntentType.TeleportDestination,
        followupIndex: 1
        //targets: CardTargetType.General | CardTargetType.Friendly
      }
    ]
  }
]; */

NC[Cards.Neutral.ZenRui] = [
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

module.exports = NC;
