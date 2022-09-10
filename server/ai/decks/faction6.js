const Cards = require('app/sdk/cards/cardsLookupComplete');
const UsableDecksLookup = require('./usable_decks_lookup');

const F6 = {};

F6.deckByDifficulty = {
  0: [
    // 0% difficulty - low cost melee units (~14)
    { id: Cards.Faction6.CrystalCloaker },
    { id: Cards.Faction6.CrystalCloaker },
    { id: Cards.Faction6.CrystalCloaker },
    { id: Cards.Faction6.FenrirWarmaster },
    { id: Cards.Faction6.FenrirWarmaster },
    { id: Cards.Faction6.FenrirWarmaster },
    { id: Cards.Neutral.PutridMindflayer },
    { id: Cards.Neutral.FlameWing },
    { id: Cards.Neutral.FlameWing },
    { id: Cards.Neutral.HailstoneGolem },
    { id: Cards.Neutral.PrimusShieldmaster },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Faction6.ArcticDisplacer },
  ],
  0.2: [
    // 20% difficulty - spells (~15)
    { id: Cards.Spell.FlashFreeze },
    { id: Cards.Spell.FlashFreeze },
    { id: Cards.Spell.FlashFreeze },
    { id: Cards.Spell.PermafrostShield },
    { id: Cards.Spell.PermafrostShield },
    { id: Cards.Spell.PermafrostShield },
    { id: Cards.Spell.AspectOfTheWolf },
    { id: Cards.Spell.AspectOfTheWolf },
    { id: Cards.Spell.AspectOfTheWolf },
    { id: Cards.Spell.ChromaticCold },
    { id: Cards.Spell.ChromaticCold },
    { id: Cards.Spell.ChromaticCold },
    { id: Cards.Spell.Avalanche },
    { id: Cards.Spell.Avalanche },
    { id: Cards.Spell.Avalanche },
  ],
  0.5: [
    // 50% difficulty - artifacts and ranged/blast/additional mid range units (~3)
    { id: Cards.Artifact.Snowpiercer },
    { id: Cards.Artifact.Snowpiercer },
    { id: Cards.Artifact.Snowpiercer },
    { id: Cards.Faction6.ArcticDisplacer },
    { id: Cards.Faction6.ArcticDisplacer },
    { id: Cards.Neutral.Necroseer },
  ],
  0.75: [
    // 75% difficulty - end game units (~5)
    { id: Cards.Neutral.StormmetalGolem },
    { id: Cards.Neutral.StormmetalGolem },
    { id: Cards.Neutral.Bloodletter },
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
F6.decks = {};

module.exports = F6;
