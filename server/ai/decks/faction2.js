const Cards = require('app/sdk/cards/cardsLookupComplete');
const UsableDecksLookup = require('./usable_decks_lookup');

const F2 = {};

F2.deckByDifficulty = {
  0: [
    // 0% difficulty - low cost melee units (~14)
    { id: Cards.Faction2.ChakriAvatar },
    { id: Cards.Faction2.ChakriAvatar },
    { id: Cards.Faction2.ChakriAvatar },
    { id: Cards.Faction2.KaidoAssassin },
    { id: Cards.Faction2.KaidoAssassin },
    { id: Cards.Faction2.KaidoAssassin },
    { id: Cards.Neutral.SaberspineTiger },
    { id: Cards.Neutral.PrimusShieldmaster },
    { id: Cards.Neutral.HailstoneGolem },
    { id: Cards.Neutral.HailstoneGolem },
    { id: Cards.Neutral.ThornNeedler },
    { id: Cards.Neutral.Necroseer },
    { id: Cards.Neutral.Necroseer },
  ],
  0.2: [
    // 20% difficulty - spells (~15)
    { id: Cards.Spell.PhoenixFire },
    { id: Cards.Spell.PhoenixFire },
    { id: Cards.Spell.PhoenixFire },
    { id: Cards.Spell.InnerFocus },
    { id: Cards.Spell.InnerFocus },
    { id: Cards.Spell.InnerFocus },
    { id: Cards.Spell.SaberspineSeal },
    { id: Cards.Spell.SaberspineSeal },
    { id: Cards.Spell.SaberspineSeal },
    { id: Cards.Spell.GhostLightning },
    { id: Cards.Spell.GhostLightning },
    { id: Cards.Spell.GhostLightning },
    // note: AI doesn't know how to use Killing Edge yet
    // replace Mist Dragon Seal with Killing Edge later
    { id: Cards.Spell.MistDragonSeal },
    { id: Cards.Spell.MistDragonSeal },
    { id: Cards.Spell.MistDragonSeal },
  ],
  0.5: [
    // 50% difficulty - artifacts and ranged/blast/additional mid range units (~3)
    { id: Cards.Artifact.MaskOfBloodLeech },
    { id: Cards.Artifact.MaskOfBloodLeech },
    { id: Cards.Artifact.MaskOfBloodLeech },
    { id: Cards.Faction2.Widowmaker },
    { id: Cards.Faction2.Widowmaker },
    { id: Cards.Faction2.Widowmaker },
  ],
  0.75: [
    // 75% difficulty - end game units (~5)
    { id: Cards.Neutral.Bloodletter },
    { id: Cards.Neutral.Bloodletter },
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
F2.decks = {};

module.exports = F2;
