const Cards = require('app/sdk/cards/cardsLookupComplete');
const UsableDecksLookup = require('./usable_decks_lookup');

const F1 = {};

F1.deckByDifficulty = {
  0: [
    // 0% difficulty - low cost melee units (~14)
    { id: Cards.Faction1.WindbladeAdept },
    { id: Cards.Faction1.WindbladeAdept },
    { id: Cards.Faction1.WindbladeAdept },
    { id: Cards.Faction1.SilverguardKnight },
    { id: Cards.Faction1.SilverguardKnight },
    { id: Cards.Faction1.SilverguardKnight },
    { id: Cards.Neutral.BloodshardGolem },
    { id: Cards.Neutral.PutridMindflayer },
    { id: Cards.Neutral.SaberspineTiger },
    { id: Cards.Neutral.PrimusShieldmaster },
    { id: Cards.Neutral.PrimusShieldmaster },
    { id: Cards.Faction1.LysianBrawler },
    { id: Cards.Faction1.LysianBrawler },
    { id: Cards.Neutral.Necroseer },
  ],
  0.2: [
    // 20% difficulty - spells (~15)
    { id: Cards.Spell.TrueStrike },
    { id: Cards.Spell.TrueStrike },
    { id: Cards.Spell.TrueStrike },
    { id: Cards.Spell.WarSurge },
    { id: Cards.Spell.WarSurge },
    { id: Cards.Spell.WarSurge },
    { id: Cards.Spell.DivineBond },
    { id: Cards.Spell.DivineBond },
    { id: Cards.Spell.DivineBond },
    { id: Cards.Spell.Martyrdom },
    { id: Cards.Spell.Martyrdom },
    { id: Cards.Spell.Martyrdom },
    { id: Cards.Spell.Tempest },
    { id: Cards.Spell.Tempest },
    { id: Cards.Spell.Tempest },
  ],
  0.5: [
    // 50% difficulty - artifacts and ranged/blast/additional mid range units (~3)
    { id: Cards.Artifact.SunstoneBracers },
    { id: Cards.Artifact.SunstoneBracers },
    { id: Cards.Artifact.SunstoneBracers },
    { id: Cards.Faction1.LysianBrawler },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Neutral.Necroseer },
  ],
  0.75: [
    // 75% difficulty - end game units (~5)
    { id: Cards.Neutral.Bloodletter },
    { id: Cards.Neutral.StormmetalGolem },
    { id: Cards.Neutral.DragoneboneGolem },
    { id: Cards.Neutral.DragoneboneGolem },
  ],
};

// format for decks: {
//   deckId: [
//     {id: cardId}
//     {id: cardId}
//     ...
//   ]
// }
F1.decks = {};

module.exports = F1;
