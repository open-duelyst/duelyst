const Factions = require('app/sdk/cards/factionsLookup');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const F1 = require('./faction1');
const F2 = require('./faction2');
const F3 = require('./faction3');
const F4 = require('./faction4');
const F5 = require('./faction5');
const F6 = require('./faction6');
const NC = require('./neutral_coreset');
const NS = require('./neutral_shimzar');
const NB = require('./neutral_bloodstorm');
const NM = require('./neutral_monthlies');
const NU = require('./neutral_unity');
const NF = require('./neutral_firstwatch');
const NW = require('./neutral_wartech');

const UsableCards = {
  _cardIds: [],
  _cardIdsByFactionId: {},
  _usableByCardId: {},
};

// all cards
UsableCards._cardIds = UsableCards._cardIds.concat(F1, F2, F3, F4, F5, F6, NC, NM, NS, NU, NB, NF, NW);

// usable state by cards id
for (let i = 0, il = UsableCards._cardIds.length; i < il; i++) {
  const cardId = UsableCards._cardIds[i];
  UsableCards._usableByCardId[cardId] = true;
}

// cards by faction id
UsableCards._cardIdsByFactionId[Factions.Faction1] = F1;
UsableCards._cardIdsByFactionId[Factions.Faction2] = F2;
UsableCards._cardIdsByFactionId[Factions.Faction3] = F3;
UsableCards._cardIdsByFactionId[Factions.Faction4] = F4;
UsableCards._cardIdsByFactionId[Factions.Faction5] = F5;
UsableCards._cardIdsByFactionId[Factions.Faction6] = F6;
UsableCards._cardIdsByFactionId[Factions.Neutral] = [].concat(NC, NM, NS, NB, NU, NF, NW);

UsableCards.getUsableCardIds = function () {
  return UsableCards._cardIds || [];
};

UsableCards.getUsableCardsForFactionId = function (factionId) {
  return UsableCards._cardIdsByFactionId[factionId] || [];
};

UsableCards.getIsCardUsable = function (cardId) {
  return UsableCards._usableByCardId[cardId];
};

module.exports = UsableCards;
