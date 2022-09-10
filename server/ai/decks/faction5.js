const Cards = require('app/sdk/cards/cardsLookupComplete');
const UsableDecksLookup = require('./usable_decks_lookup');

const F5 = {};

F5.deckByDifficulty = {
  0: [
    // 0% difficulty - low cost melee units (~14)
    { id: Cards.Neutral.KomodoCharger },
    { id: Cards.Neutral.KomodoCharger },
    { id: Cards.Neutral.KomodoCharger },
    { id: Cards.Faction5.Phalanxar },
    { id: Cards.Faction5.Phalanxar },
    { id: Cards.Faction5.Phalanxar },
    { id: Cards.Neutral.BloodshardGolem },
    { id: Cards.Neutral.PutridMindflayer },
    { id: Cards.Neutral.SaberspineTiger },
    { id: Cards.Faction5.EarthWalker },
    { id: Cards.Faction5.EarthWalker },
    { id: Cards.Faction5.EarthWalker },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Neutral.Necroseer },
  ],
  0.2: [
    // 20% difficulty - spells (~15)
    { id: Cards.Spell.GreaterFortitude },
    { id: Cards.Spell.GreaterFortitude },
    { id: Cards.Spell.GreaterFortitude },
    { id: Cards.Spell.NaturalSelection },
    { id: Cards.Spell.NaturalSelection },
    { id: Cards.Spell.NaturalSelection },
    { id: Cards.Spell.DampeningWave },
    { id: Cards.Spell.DampeningWave },
    { id: Cards.Spell.DampeningWave },
    { id: Cards.Spell.PlasmaStorm },
    { id: Cards.Spell.PlasmaStorm },
    { id: Cards.Spell.PlasmaStorm },
    { id: Cards.Faction5.PrimordialGazer },
    { id: Cards.Faction5.PrimordialGazer },
    { id: Cards.Faction5.PrimordialGazer },
  ],
  0.5: [
    // 50% difficulty - artifacts and ranged/blast/additional mid range units (~3)
    { id: Cards.Artifact.AdamantineClaws },
    { id: Cards.Artifact.AdamantineClaws },
    { id: Cards.Artifact.AdamantineClaws },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Neutral.BrightmossGolem },
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
F5.decks = {};

module.exports = F5;
