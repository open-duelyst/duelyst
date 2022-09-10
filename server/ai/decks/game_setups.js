const Cards = require('app/sdk/cards/cardsLookupComplete');

const GameSetups = {};

// format for game setups (all options are optional):
// GameSetups[gameSetupId] = {
//  withoutManaTiles: false, // false = default board, true = no mana tiles
//   ai: {
//    startingOrder: 0, // 0 = random, 1 = starts as player 1, 2 = starts as player 2
//     startingHandSize: number, // ai's starting hand size
//    startingMana: number, // ai's starting mana
//    startingGeneralPosition: {x: number, y: number}, // ai general's starting position
//    startingBoardCardsData: [ // list of card data objects that define cards on the board at the start of the game
//      {
//         id: cardId,
//         position: {x: number, y: number},
//        additionalModifiersContextObjects: [] // list of custom modifier context objects
//      },
//      ...
//    ]
//   },
//   player: {
//    startingOrder: 0, // 0 = random, 1 = starts as player 1, 2 = starts as player 2
//     startingHandSize: number, // player's starting hand size
//    startingMana: number, // player's starting mana
//    startingGeneralPosition: {x: number, y: number}, // player general's starting position
//    startingBoardCardsData: [ // list of card data objects that define cards on the board at the start of the game
//      {
//         id: cardId,
//         position: {x: number, y: number},
//        additionalModifiersContextObjects: [] // list of custom modifier context objects
//      },
//      ...
//    ]
//   }
// }

GameSetups[Cards.Boss.Boss1] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction6.BonechillBarrier,
        position: { x: 6, y: 0 },
      },
      {
        id: Cards.Faction6.BonechillBarrier,
        position: { x: 7, y: 0 },
      },
      {
        id: Cards.Faction6.BonechillBarrier,
        position: { x: 8, y: 0 },
      },
      {
        id: Cards.Faction6.BonechillBarrier,
        position: { x: 6, y: 4 },
      },
      {
        id: Cards.Faction6.BonechillBarrier,
        position: { x: 7, y: 4 },
      },
      {
        id: Cards.Faction6.BonechillBarrier,
        position: { x: 8, y: 4 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 5, y: 0 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 5, y: 4 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 6, y: 1 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 6, y: 3 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 7, y: 1 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 7, y: 2 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 7, y: 3 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 8, y: 1 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 8, y: 2 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 8, y: 3 },
      },
      {
        id: Cards.Faction6.FenrirWarmaster,
        position: { x: 5, y: 1 },
      },
      {
        id: Cards.Faction6.FenrirWarmaster,
        position: { x: 5, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingGeneralPosition: { x: 1, y: 2 },
    startingMana: 3,
  },
};

GameSetups[Cards.Boss.Boss2] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Bastion,
        position: { x: 8, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss3] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.BossArtifact.CycloneGenerator,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.QABoss3] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 3, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.BossArtifact.CycloneGenerator,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 2,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss4] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.ChaosElemental,
        position: { x: 7, y: 1 },
      },
      {
        id: Cards.Faction4.DarkspineElemental,
        position: { x: 7, y: 3 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 2, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 3, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 4, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 5, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 6, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 7, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 8, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 2, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 3, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 4, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 5, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 6, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 7, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 8, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 1 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 3 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 8, y: 1 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 8, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 8, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss5] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction4.DarkspineElemental,
        position: { x: 0, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 1 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 3 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 2, y: 1 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 2, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 2, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 2,
    startingMana: 3,
    startingGeneralPosition: { x: 7, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss6] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Boss.Boss6Wings,
        position: { x: 7, y: 0 },
      },
      {
        id: Cards.Boss.Boss6Chassis,
        position: { x: 6, y: 1 },
      },
      {
        id: Cards.Boss.Boss6Sword,
        position: { x: 6, y: 3 },
      },
      {
        id: Cards.Boss.Boss6Helm,
        position: { x: 7, y: 4 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss7] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.BossArtifact.CycloneGenerator,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss8] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.SarlacTheEternal,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss9] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 3 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Beastmaster,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 1 },
  },
};

GameSetups[Cards.Boss.Boss10] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction3.Incinera,
        position: { x: 7, y: 1 },
      },
      {
        id: Cards.Neutral.SwornAvenger,
        position: { x: 7, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss11] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.GolemVanquisher,
        position: { x: 5, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss12] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 3 },
    startingBoardCardsData: [
      {
        id: Cards.Boss.Boss12Idol,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 1 },
  },
};

GameSetups[Cards.Boss.Boss13] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 1 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Spelljammer,
        position: { x: 4, y: 2 },
      },
      {
        id: Cards.Artifact.AngryRebirthAmulet,
        position: { x: 4, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 3 },
  },
};

GameSetups[Cards.Boss.Boss14] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 9,
    startingGeneralPosition: { x: 5, y: 2 },
  },
  player: {
    startingOrder: 1,
    startingMana: 9,
    startingGeneralPosition: { x: 3, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss15] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction1.SunSister,
        position: { x: 5, y: 2 },
      },
      {
        id: Cards.Artifact.GoldVitriol,
        position: { x: 7, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 3, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss16] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 4, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction4.Gor,
        position: { x: 5, y: 1 },
      },
      {
        id: Cards.Faction4.Gor,
        position: { x: 3, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 1 },
  },
};

GameSetups[Cards.Boss.Boss17] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Prisoner6,
        position: { x: 5, y: 1 },
      },
      {
        id: Cards.Neutral.Prisoner3,
        position: { x: 5, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 3, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss18] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 5, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Serpenti,
        position: { x: 7, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 3, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss19] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction4.Wraithling,
        position: { x: 6, y: 2 },
      },
      {
        id: Cards.Faction4.GloomChaser,
        position: { x: 5, y: 2 },
      },
      {
        id: Cards.Artifact.SpectralBlade,
        position: { x: 7, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 3, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss20] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 8, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 6, y: 0 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 5, y: 1 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 4, y: 2 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 5, y: 3 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 6, y: 4 },
      },
      {
        id: Cards.Faction6.GravityWell,
        position: { x: 5, y: 2 },
      },
      {
        id: Cards.Faction6.GravityWell,
        position: { x: 6, y: 1 },
      },
      {
        id: Cards.Faction6.GravityWell,
        position: { x: 6, y: 2 },
      },
      {
        id: Cards.Faction6.GravityWell,
        position: { x: 6, y: 3 },
      },
      {
        id: Cards.Neutral.WindStopper,
        position: { x: 7, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss21] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction3.BrazierGoldenFlame,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss22] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction6.CrystalWisp,
        position: { x: 4, y: 3 },
      },
      {
        id: Cards.Faction6.CrystalCloaker,
        position: { x: 4, y: 1 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss23] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.AshMephyt,
        position: { x: 6, y: 1 },
      },
      {
        id: Cards.Neutral.AshMephyt,
        position: { x: 6, y: 3 },
      },
      {
        id: Cards.Neutral.AshMephyt,
        position: { x: 5, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.SarlacTheEternal,
        position: { x: 3, y: 3 },
      },
      {
        id: Cards.Neutral.SarlacTheEternal,
        position: { x: 3, y: 1 },
      },
    ],
  },
};

GameSetups[Cards.Boss.Boss24] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 3 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Jaxi,
        position: { x: 6, y: 1 },
      },
      {
        id: Cards.Neutral.Jaxi,
        position: { x: 5, y: 2 },
      },
      {
        id: Cards.Neutral.Jaxi,
        position: { x: 4, y: 3 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 1 },
  },
};

GameSetups[Cards.Boss.Boss25] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction2.GoreHorn,
        position: { x: 5, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 1 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 3 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 0, y: 4 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 0 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 1 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 3 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 1, y: 4 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss26] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.InquisitorKron,
        position: { x: 5, y: 2 },
      },
      {
        id: Cards.Artifact.SunstoneBracers,
        position: { x: 7, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 1 },
    startingBoardCardsData: [
      {
        id: Cards.Boss.Boss26Companion,
        position: { x: 2, y: 3 },
      },
    ],
  },
};

GameSetups[Cards.Boss.Boss27] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss28] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 5, y: 2 },
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 1 },
  },
};

GameSetups[Cards.Boss.Boss29] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Bastion,
        position: { x: 7, y: 1 },
      },
      {
        id: Cards.Neutral.Bastion,
        position: { x: 7, y: 3 },
      },
      {
        id: Cards.Tile.SandPortal,
        position: { x: 6, y: 1 },
      },
      {
        id: Cards.Tile.SandPortal,
        position: { x: 6, y: 3 },
      },
      {
        id: Cards.Artifact.OblivionSickle,
        position: { x: 6, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 5,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss30] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 3 },
    startingBoardCardsData: [
      {
        id: Cards.Faction6.FenrirWarmaster,
        position: { x: 4, y: 2 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 0, y: 4 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 1, y: 3 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 7, y: 1 },
      },
      {
        id: Cards.Faction6.BlazingSpines,
        position: { x: 8, y: 0 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 1 },
  },
};

GameSetups[Cards.Boss.Boss31] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 1 },
    startingBoardCardsData: [
      {
        id: Cards.Tile.Shadow,
        position: { x: 3, y: 3 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 4, y: 2 },
      },
      {
        id: Cards.Tile.Shadow,
        position: { x: 5, y: 1 },
      },
      {
        id: Cards.Faction4.Phantasm,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 3 },
  },
};

GameSetups[Cards.Boss.Boss32] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Boss.Boss32_2,
        position: { x: 6, y: 0 },
      },
      {
        id: Cards.Boss.Boss32_2,
        position: { x: 6, y: 4 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss33] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 2,
    startingGeneralPosition: { x: 8, y: 0 },
    startingBoardCardsData: [
      {
        id: Cards.Boss.Boss33_2,
        position: { x: 8, y: 4 },
      },
      {
        id: Cards.Boss.Boss33_3,
        position: { x: 0, y: 0 },
      },
      {
        id: Cards.Boss.Boss33_4,
        position: { x: 0, y: 4 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 5,
    startingGeneralPosition: { x: 4, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss34] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 1,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [

    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 1,
    startingGeneralPosition: { x: 1, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction5.Kolossus,
        position: { x: 0, y: 0 },
      },
      {
        id: Cards.Neutral.Khymera,
        position: { x: 0, y: 4 },
      },
    ],
  },
};

GameSetups[Cards.Boss.Boss35] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 7, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Neutral.Moebius,
        position: { x: 4, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 1, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss36] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 8, y: 2 },
    startingBoardCardsData: [

    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Boss.Boss36_2,
        position: { x: 1, y: 2 },
      },
      {
        id: Cards.Boss.Boss36_3,
        position: { x: 7, y: 4 },
      },
      {
        id: Cards.Boss.Boss36_3,
        position: { x: 2, y: 3 },
      },
      {
        id: Cards.Boss.Boss36_3,
        position: { x: 4, y: 2 },
      },
      {
        id: Cards.Boss.Boss36_3,
        position: { x: 6, y: 0 },
      },
      {
        id: Cards.Boss.Boss36_3,
        position: { x: 0, y: 1 },
      },
    ],
  },
};

GameSetups[Cards.Boss.Boss37] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 6, y: 2 },
    startingBoardCardsData: [

    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

GameSetups[Cards.Boss.Boss38] = {
  withoutManaTiles: true,
  ai: {
    startingOrder: 2,
    startingMana: 4,
    startingGeneralPosition: { x: 8, y: 2 },
    startingBoardCardsData: [
      {
        id: Cards.Faction1.PurebladeEnforcer,
        position: { x: 6, y: 2 },
      },
    ],
  },
  player: {
    startingOrder: 1,
    startingMana: 3,
    startingGeneralPosition: { x: 2, y: 2 },
  },
};

module.exports = GameSetups;
