const Cards = require('app/sdk/cards/cardsLookupComplete');
const UsableDecksLookup = require('./usable_decks_lookup');

const F4 = {};

F4.deckByDifficulty = {
  0: [
    // 0% difficulty - low cost melee units (~14)
    { id: Cards.Faction4.AbyssalCrawler },
    { id: Cards.Faction4.AbyssalCrawler },
    { id: Cards.Faction4.AbyssalCrawler },
    { id: Cards.Faction4.GloomChaser },
    { id: Cards.Faction4.GloomChaser },
    { id: Cards.Faction4.GloomChaser },
    { id: Cards.Faction4.ShadowWatcher },
    { id: Cards.Faction4.ShadowWatcher },
    { id: Cards.Neutral.PutridMindflayer },
    { id: Cards.Neutral.HailstoneGolem },
    { id: Cards.Neutral.HailstoneGolem },
    { id: Cards.Neutral.ThornNeedler },
    { id: Cards.Neutral.ThornNeedler },
    { id: Cards.Neutral.Necroseer },
  ],
  0.2: [
    // 20% difficulty - spells (~15)
    { id: Cards.Spell.WraithlingSwarm },
    { id: Cards.Spell.WraithlingSwarm },
    { id: Cards.Spell.WraithlingSwarm },
    { id: Cards.Spell.DarkTransformation },
    { id: Cards.Spell.DarkTransformation },
    { id: Cards.Spell.DarkTransformation },
    { id: Cards.Spell.DaemonicLure },
    { id: Cards.Spell.DaemonicLure },
    { id: Cards.Spell.DaemonicLure },
    { id: Cards.Spell.SoulshatterPact },
    { id: Cards.Spell.SoulshatterPact },
    { id: Cards.Spell.SoulshatterPact },
    { id: Cards.Spell.ShadowNova },
    { id: Cards.Spell.ShadowNova },
    { id: Cards.Spell.ShadowNova },
  ],
  0.5: [
    // 50% difficulty - artifacts and ranged/blast/additional mid range units (~3)
    { id: Cards.Artifact.HornOfTheForsaken },
    { id: Cards.Artifact.HornOfTheForsaken },
    { id: Cards.Artifact.HornOfTheForsaken },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Faction4.ShadowWatcher },
  ],
  0.75: [
    // 75% difficulty - end game units (~5)
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Neutral.StormmetalGolem },
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
F4.decks = {};

module.exports = F4;
