'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var UtilsEnv = require('app/common/utils/utils_env');
var GameDataManager = require('app/ui/managers/game_data_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var CardsCollection = require('app/ui/collections/cards');
var Firebase = require('firebase');
var i18next = require('i18next');

var DeckModel = Backbone.Model.extend({

  _cardModels: null,
  _histogram: null,
  _isValid: null,
  _isLegacy: false,

  defaults: {
    name: i18next.t('' + CONFIG.DEFAULT_DECK_NAME),
    faction_id: null,
    plays: 0,
    wins: 0,
    loses: 0,
    isStarter: false,
    created_at: 0,
    updated_at: 0,
    played_at: 0,
    cards: [],
    minion_count: 0,
    spell_count: 0,
    artifact_count: 0,
    color_code: 0,
    numCardsUnlocked: 0,
    numCardsUnlockable: 0,
    searchableContent: '',
    card_back_id: null,
  },

  initialize: function () {
    Logger.module('UI').log('initialize a Deck model', this.get('name'));
    this.listenTo(this, 'sync', this.onSync);
    this._cardModels = new CardsCollection();
    this._histogram = [];
  },

  onSync: function () {
    if (this.hasChanged()) {
      this.updateCardModelsFromCardsData();
    }
  },

  getCardModels: function () {
    return this._cardModels;
  },

  addCard: function (cardModel) {
    // when attempting to add another general, remove current first
    if (cardModel && cardModel.get('isGeneral') && this.hasGeneral()) {
      var generalCardModel = this.getGeneralCardModel();
      if (cardModel.get('id') !== generalCardModel.get('id')) {
        this.changeCardModel(generalCardModel, -1);
      }
    }
    var changed = this.changeCardModel(cardModel, 1);
    if (changed) {
      this.updatePropertiesFromCardModels(changed);
    }
    return changed;
  },

  addCardIds: function (cardIds) {
    var changed = false;
    var cardModels = GameDataManager.getInstance().visibleCardsCollection.getCardModelsFromCardIds(cardIds);
    if (cardModels.length > 0) {
      for (var i = 0, il = cardModels.length; i < il; i++) {
        changed = this.changeCardModel(cardModels[i], 1) || changed;
      }
    }
    if (changed) {
      this.updatePropertiesFromCardModels(changed);
    }
    return changed;
  },

  addCardsData: function (cardsData) {
    var changed = false;
    var cardModels = GameDataManager.getInstance().visibleCardsCollection.getCardModelsFromCardsData(cardsData);
    if (cardModels.length > 0) {
      for (var i = 0, il = cardModels.length; i < il; i++) {
        changed = this.changeCardModel(cardModels[i], 1) || changed;
      }
    }
    if (changed) {
      this.updatePropertiesFromCardModels(changed);
    }
    return changed;
  },

  removeCard: function (cardModel) {
    var changed = this.changeCardModel(cardModel, -1);
    if (changed) {
      this.updatePropertiesFromCardModels(changed);
    }
    return changed;
  },

  emptyDeck: function () {
    this.set('cards', []);
    this._cardModels.reset();
  },

  getCountForBaseCardId: function (cardId) {
    var count = 0;

    // add counts of all cards in deck that have a matching base card id
    var baseCardId = SDK.Cards.getBaseCardId(cardId);
    this._cardModels.forEach(function (cardModel) {
      if (cardModel.get('baseCardId') === baseCardId) {
        count += (cardModel.get('deckCount') || 0);
      }
    });

    return count;
  },

  getCountForCardId: function (cardId) {
    var count = 0;

    // add counts of all cards in deck that have the exact id
    // skins count as same version of card
    cardId = SDK.Cards.getNonSkinnedCardId(cardId);
    var baseCardId = SDK.Cards.getBaseCardId(cardId);
    var isPrismatic = SDK.Cards.getIsPrismaticCardId(cardId);
    this._cardModels.forEach(function (cardModel) {
      if (cardModel.get('id') === cardId || (cardModel.get('isSkinned') && cardModel.get('baseCardId') === baseCardId && cardModel.get('isPrismatic') === isPrismatic)) {
        count += (cardModel.get('deckCount') || 0);
      }
    });

    return count;
  },

  changeCardModel: function (cardModel, deltaCount) {
    var cardId = cardModel.get('id');
    var factionId = cardModel.get('factionId');
    if (cardId != null && (this.get('isStarter') || ProgressionManager.getInstance().isFactionUnlocked(factionId))) {
      deltaCount || (deltaCount = 1);

      // check for existing card
      var deckCardModel = this._cardModels.get(cardId);
      if (!deckCardModel) {
        // clone card so that we can modify it in deck
        deckCardModel = cardModel.clone();
      }

      // validate card type and deck size
      var deckSize = this.get('cards').length;
      var isGeneral = deckCardModel.get('isGeneral');
      var validCard = (isGeneral || this.hasGeneral()) && deckCardModel.get('isNeutral') || this.get('faction_id') === factionId;
      var deckCount = this.getCountForCardId(cardId);
      var inventoryCount = cardModel.get('inventoryCount');
      if (deltaCount > 0) {
        deltaCount = Math.min(deckCount + deltaCount, inventoryCount) - deckCount;
      }
      if (isGeneral || deltaCount < 0 || (deltaCount > 0 && deckSize < CONFIG.MAX_DECK_SIZE && validCard)) {
        // validate card count in deck
        var totalCount = this.getCountForBaseCardId(cardId);
        var maxDeckDuplicates = isGeneral ? 1 : CONFIG.MAX_DECK_DUPLICATES;
        var newCount = Math.max(Math.min(totalCount + deltaCount, maxDeckDuplicates), 0);
        deltaCount = newCount - totalCount;
        if (newCount !== totalCount && ((deltaCount < 0 && deckCount > 0) || (inventoryCount >= deckCount + deltaCount))) {
          // update card count in deck
          var cardDeckCount = deckCardModel.get('deckCount');
          var newCardDeckCount = cardDeckCount + deltaCount;
          deckCardModel.set('deckCount', newCardDeckCount);

          // add or remove the card
          if (newCardDeckCount === 0) {
            // remove card
            this._cardModels.remove(deckCardModel);
          } else if (cardDeckCount === 0 && newCardDeckCount > cardDeckCount) {
            // set deck faction
            if (isGeneral && this.get('faction_id') !== factionId) {
              this.set('faction_id', factionId);
            }

            // add card
            this._cardModels.add(deckCardModel);
          }

          // a card was changed
          return true;
        }
      }
    }

    // no card was changed
    return false;
  },

  updateCard: function (cardModel) {
    var cardId = cardModel.get('id');
    var changed = false;

    // update for skinned cards in deck
    if (!SDK.Cards.getIsSkinnedCardId(cardId)) {
      var baseCardId = SDK.Cards.getBaseCardId(cardId);
      var skinIds = SDK.CosmeticsFactory.cardSkinIdsForCard(baseCardId);
      var removeAllSkins = false;
      if (skinIds.length > 1) {
        var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
        if (gameDataCardModel.get('inventoryCount') < this.getCountForCardId(cardId)) {
          removeAllSkins = true;
        }
      }

      for (var i = 0, il = skinIds.length; i < il; i++) {
        var skinId = skinIds[i];
        var skinnedCardId = SDK.Cards.getCardIdForCardSkinId(skinId);
        if (SDK.Cards.getIsPrismaticCardId(cardId)) {
          skinnedCardId = SDK.Cards.getPrismaticCardId(skinnedCardId);
        }
        if (removeAllSkins) {
          var skinnedDeckCardModel = this._cardModels.get(skinnedCardId);
          if (skinnedDeckCardModel != null && skinnedDeckCardModel.get('deckCount') > 0) {
            var skinnedGameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(skinnedCardId);
            this.changeCardModel(skinnedGameDataCardModel, -skinnedDeckCardModel.get('deckCount'));
            changed = true;
          }
        } else {
          var skinChanged = this._updateCardFromId(skinnedCardId);
          if (!changed) { changed = skinChanged; }
        }
      }
    }

    // update for this card in deck
    var baseChanged = this._updateCardFromId(cardId);
    if (!changed) { changed = baseChanged; }

    // update deck if changed
    if (changed) {
      this.updatePropertiesFromCardModels();
    }
    return changed;
  },

  _updateCardFromId: function (cardId) {
    var changed = false;

    var deckCardModel = this._cardModels.get(cardId);
    if (deckCardModel != null) {
      // card is in deck
      var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
      var inventoryCount = gameDataCardModel.get('inventoryCount');
      var deckCount = deckCardModel.get('deckCount');
      var totalCount = this.getCountForCardId(cardId);

      // update existing deck card's inventory count
      deckCardModel.set('inventoryCount', inventoryCount);

      // check if card has less usable count than are in deck
      if (deckCount > 0 && inventoryCount < totalCount) {
        changed = this.changeCardModel(gameDataCardModel, -Math.min(totalCount - inventoryCount, deckCount));
      } else if (inventoryCount < deckCount) {
        changed = this.changeCardModel(gameDataCardModel, deckCount - inventoryCount);
      }
    }

    return changed;
  },

  hasGeneral: function () {
    var generalCardModel = this.getGeneralCardModel();
    return generalCardModel && generalCardModel.get('isGeneral');
  },

  getGeneralId: function () {
    var generalCardModel = this.getGeneralCardModel();
    return generalCardModel && generalCardModel.get('id');
  },

  getGeneralCardModel: function () {
    return this._cardModels.at(0);
  },

  isValid: function () {
    return this._isValid;
  },

  isLegacy: function () {
    return this._isLegacy;
  },

  updatePropertiesFromCardModels: function (changed) {
    var i; var il;
    var cards = [];
    var minionCount = 0;
    var spellCount = 0;
    var artifactCount = 0;

    // if we have a faction id, that means we have a general
    var factionId = this.get('faction_id');
    var needsGeneral = !this.hasGeneral();

    // reset histogram
    this._histogram = [];
    for (i = 0, il = CONFIG.MAX_MANA; i <= il; i++) {
      this._histogram[i] = {
        manaCost: i,
        histogramDisplayCost: '' + i,
        count: 0,
        height: 0,
      };
    }
    this._histogram[9].histogramDisplayCost = '9+';

    // filter collection
    var modelsToRemove = [];
    var hasLegacyCard = false;
    this._cardModels.forEach(function (cardModel) {
      // we must have a general and the card must either be neutral or of the same faction as the general
      // card must have a count above 0 and total below max
      // otherwise the card is removed from the collection
      var id = cardModel.get('id');
      var inventoryCount = cardModel.get('inventoryCount');
      var deckCount = cardModel.get('deckCount');
      var count = Math.min(deckCount, inventoryCount);
      if (!needsGeneral
        && cardModel.get('isUnlocked')
        && (cardModel.get('isNeutral') || factionId === cardModel.get('factionId'))
        && count > 0 && deckCount <= inventoryCount && this.getCountForBaseCardId(id) <= CONFIG.MAX_DECK_DUPLICATES) {
        // add one card data object for each count of the card
        _.times(count, function () {
          cards.push(cardModel.getCardDataForDeck());
        });

        if (!cardModel.get('isGeneral')) {
          // update histogram count as long as the card is not a general
          var manaCost = cardModel.get('manaCost');
          if (manaCost > 9) { // for cards with cost greater than 9 mana, lump them into the 9 mana count
            manaCost = 9;
          }
          this._histogram[manaCost].count += count;

          // update individual counts
          if (cardModel.get('isEntity')) {
            minionCount += count;
          } else if (cardModel.get('isSpell')) {
            spellCount += count;
          } else if (cardModel.get('isArtifact')) {
            artifactCount += count;
          }

          // check for legacy status of card
          if (cardModel.get('isLegacy') || cardModel.get('cardSetId') == SDK.CardSet.Shimzar) {
            hasLegacyCard = true;
          }
        }
      } else {
        modelsToRemove.push(cardModel);
      }
    }.bind(this));

    // remove card models as needed
    if (modelsToRemove.length > 0) {
      this._cardModels.remove(modelsToRemove);
    }

    // set deck to legacy if it has any legacy cards
    if (hasLegacyCard) {
      this._isLegacy = true;
    } else {
      this._isLegacy = false;
    }

    // set base deck size
    var deckSize = minionCount + spellCount + artifactCount;

    // set histogram
    if (deckSize > 0) {
      for (i = 0, il = this._histogram.length; i < il; i++) {
        var histogramItem = this._histogram[i];
        histogramItem.height = (histogramItem.count / deckSize) * 100.0;
      }
    }

    if (!needsGeneral && CONFIG.DECK_SIZE_INCLUDES_GENERAL) {
      deckSize += 1;
    }

    // update validation state
    // deck defaults to valid because:
    // - any deck in development is valid
    // - any starter deck is valid
    // - each card is already validated as it is added/removed
    var valid = true;
    if (!this.get('isStarter') && !process.env.DISABLE_DECK_VALIDATION) {
      // when deck is in production
      if (needsGeneral) {
        // deck must have a general
        valid = false;
      } else if (deckSize !== (CONFIG.DECK_SIZE_INCLUDES_GENERAL ? CONFIG.MAX_DECK_SIZE : CONFIG.MAX_DECK_SIZE + 1)) {
        // deck must match the max deck size
        valid = false;
      }
    }
    this._isValid = valid;

    // get searchable content
    var searchableContent = this.get('name');
    if (factionId != null) {
      var faction = SDK.FactionFactory.factionForIdentifier(factionId);
      if (faction != null) {
        searchableContent += ' ' + faction.name;
      }
    }

    this.set({
      minion_count: minionCount,
      spell_count: spellCount,
      artifact_count: artifactCount,
      cards: cards,
      searchableContent: searchableContent,
    });
  },

  updateCardModelsFromCardsData: function () {
    // resets and repopulates card models from card ids
    this._cardModels.reset();

    // get card models from cards
    var cards = this.get('cards');
    var cardModels = GameDataManager.getInstance().visibleCardsCollection.getCardModelsFromCardsData(cards);
    if (cardModels.length > 0) {
      for (var i = 0, il = cardModels.length; i < il; i++) {
        var cardModel = cardModels[i];
        var cardId = cardModel.get('id');

        // create each deck card model
        var deckCardModel = this._cardModels.get(cardId);
        if (!deckCardModel) {
          deckCardModel = cardModel.clone();
          this._cardModels.add(deckCardModel);
        }

        // update count
        deckCardModel.set('deckCount', (deckCardModel.get('deckCount') || 0) + 1);
      }

      // update cards list
      this.updatePropertiesFromCardModels();
    }
  },
});

// Expose the class either via CommonJS or the global object
module.exports = DeckModel;
