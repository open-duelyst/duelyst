const _ = require('underscore');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const Factions = require('app/sdk/cards/factionsLookup');
const SDK = require('app/sdk.coffee');
const UsableCards = require('../cards/usable_cards');
const F1 = require('./faction1');
const F2 = require('./faction2');
const F3 = require('./faction3');
const F4 = require('./faction4');
const F5 = require('./faction5');
const F6 = require('./faction6');
const Boss = require('./boss');

const UsableDecks = {
  _decksById: {},
  _decksByDifficultyByFactionId: {},
};

// decks by id
UsableDecks._decksById = _.extend(UsableDecks._decksById, F1.decks);
UsableDecks._decksById = _.extend(UsableDecks._decksById, F2.decks);
UsableDecks._decksById = _.extend(UsableDecks._decksById, F3.decks);
UsableDecks._decksById = _.extend(UsableDecks._decksById, F4.decks);
UsableDecks._decksById = _.extend(UsableDecks._decksById, F5.decks);
UsableDecks._decksById = _.extend(UsableDecks._decksById, F6.decks);
UsableDecks._decksById = _.extend(UsableDecks._decksById, Boss.decks);

// decks by difficulty by faction id
UsableDecks._decksByDifficultyByFactionId[Factions.Faction1] = F1.deckByDifficulty || {};
UsableDecks._decksByDifficultyByFactionId[Factions.Faction2] = F2.deckByDifficulty || {};
UsableDecks._decksByDifficultyByFactionId[Factions.Faction3] = F3.deckByDifficulty || {};
UsableDecks._decksByDifficultyByFactionId[Factions.Faction4] = F4.deckByDifficulty || {};
UsableDecks._decksByDifficultyByFactionId[Factions.Faction5] = F5.deckByDifficulty || {};
UsableDecks._decksByDifficultyByFactionId[Factions.Faction6] = F6.deckByDifficulty || {};

/**
 * Returns a pre-generated deck for an identifier.
 * @param {Number} generalId
 * @param {Number} identifier
 * @returns {Array}
 */
UsableDecks.getUsableDeckForIdentifier = function (generalId, identifier) {
  // get copy of deck for id
  const deck = (UsableDecks._decksById[identifier] || []).slice(0);

  // add general as first card
  deck.unshift({ id: generalId });

  return deck;
};

/**
 * Returns an automatically generated deck for a faction based on difficulty and optionally a number of random cards.
 * @param {Number} generalId
 * @param {Number} [difficulty=0.0]
 * @param {Number} [numRandomCards=0]
 * @returns {Array}
 */
UsableDecks.getAutomaticUsableDeck = function (generalId, difficulty, numRandomCards) {
  if (difficulty == null) { difficulty = 0.0; }

  let deck = [];

  // get faction data
  const factionData = SDK.FactionFactory.factionForGeneralId(generalId);
  if (factionData != null) {
    const factionId = factionData.id;

    // add general as first card
    deck.push({ id: generalId });

    // try to build deck by difficulty
    const deckByDifficulty = UsableDecks._decksByDifficultyByFactionId[factionId];
    if (deckByDifficulty != null) {
      const deckDifficulties = Object.keys(deckByDifficulty);
      for (let i = 0, il = deckDifficulties.length; i < il; i++) {
        const deckDifficulty = deckDifficulties[i];
        if (deckDifficulty <= difficulty) {
          deck = deck.concat(deckByDifficulty[deckDifficulty]);
        }
      }
    }
  }

  return UsableDecks.randomizeDeck(deck, numRandomCards, difficulty);
};

/**
 * Randomly removes cards from a deck based on number of cards and certain categories.
 * NOTE: first 4 array slots are the number of each category that was removed
 * @param {Array} deck
 * @param {Number} [numCardsToRemove]
 * @returns {Array}
 */
UsableDecks.splitUpDeck = function (deck, numCardsToRemove) {
  // create separate decks for each of the categories we want to split by

  // preserve general (always first card in deck)
  const general = deck[0];

  // select minions with cost 4 or less without grow, deathwatch, ranged, or blast
  const lowCostMinions = _.filter(deck.slice(1), (cardData) => {
    const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
    return card.getManaCost() < 5 && SDK.CardType.getIsEntityCardType(card.getType()) && !card.getIsGeneral();
    // && !(card.hasModifierClass(SDK.ModifierGrow) || card.hasModifierClass(SDK.ModifierRanged) || card.hasModifierClass(SDK.ModifierBlastAttack));
  });

  // select other in faction spells
  const spells = _.filter(deck.slice(1), (cardData) => {
    const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
    return card.getType() === SDK.CardType.Spell;
  });

  // select other artifacts OR minions with cost 5 OR minions with grow, deathwatch, ranged, or blast
  const artifactsOtherMinions = _.filter(deck.slice(1), (cardData) => {
    const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
    return card.getType() === SDK.CardType.Artifact || (SDK.CardType.getIsEntityCardType(card.getType()) && !card.getIsGeneral() && card.getManaCost() == 5);
    // || (cardData.hasModifierClass(SDK.ModifierGrow) || cardData.hasModifierClass(SDK.ModifierRanged) || cardData.hasModifierClass(SDK.ModifierBlastAttack));
  });

  // select minions with cost 6 or higher
  const highCostMinions = _.filter(deck.slice(1), (cardData) => {
    const card = SDK.GameSession.getCardCaches().getCardById(cardData.id);
    return card.getManaCost() > 5 && SDK.CardType.getIsEntityCardType(card.getType()) && !card.getIsGeneral();
  });

  // now that the decks are split we need to get the number of cards we will be removing from each
  const totalFilteredCards = lowCostMinions.length + spells.length + artifactsOtherMinions.length + highCostMinions.length;
  const scaleBy = numCardsToRemove / totalFilteredCards;
  const numLowCostMinions = Math.min(lowCostMinions.length, Math.round(lowCostMinions.length * scaleBy));
  const numSpells = Math.min(spells.length, Math.round(spells.length * scaleBy));
  const numArtifactsOtherMinions = Math.min(artifactsOtherMinions.length, Math.round(artifactsOtherMinions.length * scaleBy));
  const numHighCostMinions = Math.min(highCostMinions.length, Math.round(highCostMinions.length * scaleBy));

  // now we go through and remove the cards from each of these decks
  for (let i = 0, il = numLowCostMinions; i < il; i++) {
    const randomIndexToRemove = Math.floor(Math.random() * (lowCostMinions.length));
    // Logger.module("AI").debug("UsableDecks.splitUpDeck -> removed existing low cost minion card " + lowCostMinions[randomIndexToRemove].id + " from deck");
    lowCostMinions.splice(randomIndexToRemove, 1);
  }

  for (let i = 0, il = numSpells; i < il; i++) {
    const randomIndexToRemove = Math.floor(Math.random() * (spells.length));
    // Logger.module("AI").debug("UsableDecks.splitUpDeck ->  removed existing spell card " + spells[randomIndexToRemove].id + " from deck");
    spells.splice(randomIndexToRemove, 1);
  }

  for (let i = 0, il = numArtifactsOtherMinions; i < il; i++) {
    const randomIndexToRemove = Math.floor(Math.random() * (artifactsOtherMinions.length));
    // Logger.module("AI").debug("UsableDecks.splitUpDeck -> removed existing artifact/5 cost minion card " + artifactsOtherMinions[randomIndexToRemove].id + " from deck");
    artifactsOtherMinions.splice(randomIndexToRemove, 1);
  }

  for (let i = 0, il = numHighCostMinions; i < il; i++) {
    const randomIndexToRemove = Math.floor(Math.random() * (highCostMinions.length));
    // Logger.module("AI").debug("UsableDecks.splitUpDeck -> removed existing high cost minion card " + highCostMinions[randomIndexToRemove].id + " from deck");
    highCostMinions.splice(randomIndexToRemove, 1);
  }

  // now that the random cards were removed from each category, we merge the cut decks together and return the results
  // but first we stick the number of cards that were cut from each category into the first 4 indexes of the array to extract later
  return [
    numLowCostMinions,
    numSpells,
    numArtifactsOtherMinions,
    numHighCostMinions,
    general,
  ].concat(
    lowCostMinions,
    spells,
    artifactsOtherMinions,
    highCostMinions,
  );
};

/**
 * Randomizes a deck.
 * NOTE: modifies deck in place!
 * @param {Array} deck
 * @param {Number} [numRandomCards=0]
 * @returns {Array}
 */
UsableDecks.randomizeDeck = function (deck, numRandomCards, difficulty) {
  if (difficulty == null) { difficulty = 1.0; }

  let randomizedDeck = deck.slice(0);

  if (numRandomCards != null && numRandomCards > 0) {
    // filter deck down to cards the AI can use
    const sizeBeforeFilterForUsable = randomizedDeck.length;
    randomizedDeck = _.filter(randomizedDeck, (cardData) => {
      const cardId = SDK.Cards.getBaseCardId(cardData.id);
      return SDK.FactionFactory.cardIdIsGeneral(cardId) || UsableCards.getIsCardUsable(cardId);
    });
    let numUnusableCards = sizeBeforeFilterForUsable - randomizedDeck.length;

    // get usable cards
    const factionId = SDK.FactionFactory.factionIdForGeneralId(randomizedDeck[0].id);
    const usableFactionCardIds = UsableCards.getUsableCardsForFactionId(factionId).slice(0);
    const usableNeutralCardIds = UsableCards.getUsableCardsForFactionId(Factions.Neutral).slice(0);
    // Logger.module("AI").debug("UsableDecks.randomizeDeck -> faction id " + factionId + " / num random " + numRandomCards + "");
    if (usableFactionCardIds.length + usableNeutralCardIds.length > 0) {
      let numMissingCards = Math.max(0, CONFIG.MAX_DECK_SIZE - randomizedDeck.length);
      const minNumRandomCards = Math.min(usableFactionCardIds.length + usableNeutralCardIds.length, numRandomCards);
      const numCardsToRemove = Math.min(randomizedDeck.length - 1, Math.max(0, minNumRandomCards - numMissingCards));
      let numLowCostMinions;
      let numSpells;
      let numArtifactsOtherMinions;
      let numHighCostMinions;
      if (numCardsToRemove > 0) {
        // Logger.module("AI").debug("UsableDecks.randomizeDeck -> replacing " + numCardsToRemove + " random cards in deck with random usable cards...");
        randomizedDeck = UsableDecks.splitUpDeck(randomizedDeck, numCardsToRemove);
        // extract the first 4 results in the array as the number of minions that were removed
        numLowCostMinions = randomizedDeck[0];
        numSpells = randomizedDeck[1];
        numArtifactsOtherMinions = randomizedDeck[2];
        numHighCostMinions = randomizedDeck[3];
        // the rest of the array is the remaining deck
        randomizedDeck = randomizedDeck.slice(4);
        numMissingCards = Math.max(0, CONFIG.MAX_DECK_SIZE - randomizedDeck.length);
      }
      // Logger.module("AI").debug("Filling deck with " + numMissingCards + " random usable cards...");
      while (randomizedDeck.length < CONFIG.MAX_DECK_SIZE && usableFactionCardIds.length + usableNeutralCardIds.length > 0) {
        // higher chance to pick faction card
        let cardIdsToPickFrom;
        if (usableFactionCardIds.length > 0 && (usableNeutralCardIds.length === 0 || Math.random() < 0.4)) {
          cardIdsToPickFrom = usableFactionCardIds;
        } else {
          cardIdsToPickFrom = usableNeutralCardIds;
        }
        const randomIndex = Math.floor(Math.random() * cardIdsToPickFrom.length);
        const cardIdToAdd = cardIdsToPickFrom[randomIndex];

        if (cardIdToAdd == null) {
          break; // stop if no more IDs to add
        }

        let countInDeck = 0;
        for (let i = 0, il = randomizedDeck.length; i < il; i++) {
          const cardData = randomizedDeck[i];
          if (SDK.Cards.getBaseCardId(cardData.id) === cardIdToAdd) {
            countInDeck++;
            if (countInDeck >= CONFIG.MAX_DECK_DUPLICATES) {
              break;
            }
          }
        }

        const card = SDK.GameSession.getCardCaches().getCardById(cardIdToAdd);

        let tooRareForDifficulty = false;
        if (difficulty == 0.00) {
          tooRareForDifficulty = card.getRarityId() != SDK.Rarity.Fixed && card.getRarityId() != SDK.Rarity.Common;
        } else if (difficulty <= 0.20) {
          tooRareForDifficulty = card.getRarityId() != SDK.Rarity.Fixed && card.getRarityId() != SDK.Rarity.Common && card.getRarityId() != SDK.Rarity.Rare;
        } else if (difficulty <= 0.50) {
          tooRareForDifficulty = card.getRarityId() != SDK.Rarity.Fixed && card.getRarityId() != SDK.Rarity.Common && card.getRarityId() != SDK.Rarity.Rare && card.getRarityId() != SDK.Rarity.Epic;
        }

        if (countInDeck >= CONFIG.MAX_DECK_DUPLICATES) {
          // Logger.module("AI").debug("UsableDecks.randomizeDeck -> cannot add random card " + cardIdToAdd + " to deck, max duplicates reached");
          cardIdsToPickFrom.splice(randomIndex, 1);
        } else if (tooRareForDifficulty == true) {
          // Logger.module("AI").debug("UsableDecks.randomizeDeck -> cannot add random card " + cardIdToAdd + " to deck, too rare for difficulty set");
          cardIdsToPickFrom.splice(randomIndex, 1);
        } else {
          // Logger.module("AI").debug("UsableDecks.randomizeDeck -> adding random card " + cardIdToAdd + " to deck");
          let neededCard = true;
          // if the card matches the right criteria, subtract it from the number of cards we've left to replace of the given category
          if (numLowCostMinions > 0 && (card.getManaCost() < 5 && SDK.CardType.getIsEntityCardType(card.getType()) && !card.getIsGeneral())) {
            // && !(cardData.hasModifierClass(SDK.ModifierGrow) || cardData.hasModifierClass(SDK.ModifierRanged) || cardData.hasModifierClass(SDK.ModifierBlastAttack)))){
            numLowCostMinions--;
          } else if (numSpells > 0 && (card.getType() === SDK.CardType.Spell)) {
            numSpells--;
          } else if (numArtifactsOtherMinions > 0 && (card.getType() === SDK.CardType.Artifact || (SDK.CardType.getIsEntityCardType(card.getType()) && !card.getIsGeneral() && (card.getManaCost() == 5)))) {
            numArtifactsOtherMinions--;
          } else if (numHighCostMinions > 0 && (card.getManaCost() > 5 && SDK.CardType.getIsEntityCardType(card.getType()) && !card.getIsGeneral())) {
            numHighCostMinions--;
          } else if (numUnusableCards > 0) {
            numUnusableCards--;
          } else {
            neededCard = false;
            cardIdsToPickFrom.splice(randomIndex, 1);
          }

          if (neededCard === true) {
            randomizedDeck.push({ id: cardIdToAdd });
          }
        }
      }
    }
  }

  return randomizedDeck;
};

module.exports = UsableDecks;
