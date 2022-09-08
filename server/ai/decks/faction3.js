const Cards = require('app/sdk/cards/cardsLookupComplete');
const UsableDecksLookup = require('./usable_decks_lookup');

const F3 = {};

F3.deckByDifficulty = {
  0: [
    // 0% difficulty - low cost melee units (~14)
    { id: Cards.Neutral.BloodshardGolem },
    { id: Cards.Neutral.SaberspineTiger },
    { id: Cards.Neutral.PutridMindflayer },
    { id: Cards.Faction3.BrazierRedSand },
    { id: Cards.Faction3.BrazierRedSand },
    { id: Cards.Faction3.BrazierRedSand },
    { id: Cards.Faction3.WindShrike },
    { id: Cards.Faction3.WindShrike },
    { id: Cards.Faction3.WindShrike },
    { id: Cards.Neutral.PrimusShieldmaster },
    { id: Cards.Neutral.PrimusShieldmaster },
    { id: Cards.Neutral.HailstoneGolem },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Neutral.Necroseer },
  ],
  0.2: [
    // 20% difficulty - spells (~15)
    { id: Cards.Spell.ScionsFirstWish },
    { id: Cards.Spell.ScionsFirstWish },
    { id: Cards.Spell.ScionsFirstWish },
    { id: Cards.Spell.EntropicDecay },
    { id: Cards.Spell.EntropicDecay },
    { id: Cards.Spell.EntropicDecay },
    { id: Cards.Spell.ScionsSecondWish },
    { id: Cards.Spell.ScionsSecondWish },
    { id: Cards.Spell.ScionsSecondWish },
    { id: Cards.Spell.Blindscorch },
    { id: Cards.Spell.Blindscorch },
    { id: Cards.Spell.Blindscorch },
    { id: Cards.Spell.CosmicFlesh },
    { id: Cards.Spell.CosmicFlesh },
    { id: Cards.Spell.CosmicFlesh },
  ],
  0.5: [
    // 50% difficulty - artifacts and ranged/blast/additional mid range units (~3)
    { id: Cards.Artifact.StaffOfYKir },
    { id: Cards.Artifact.StaffOfYKir },
    { id: Cards.Artifact.StaffOfYKir },
    { id: Cards.Faction3.Pyromancer },
    { id: Cards.Faction3.Pyromancer },
    { id: Cards.Faction3.Pyromancer },
  ],
  0.75: [
    // 75% difficulty - end game units (~5)
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
F3.decks = {};

module.exports = F3;
