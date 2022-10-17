'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var CardModel = require('app/ui/models/card');
var InventoryManager = require('app/ui/managers/inventory_manager');
var AchievementsManager = require('app/ui/managers/achievements_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var i18next = require('i18next');

var CardsCollection = Backbone.Collection.extend({

  model: CardModel,

  initialize: function () {
    Logger.module('UI').log('initialize a Cards collection');
    this.on('add', this.onAddModel, this);
  },

  /**
   * Gets an array of card models from an array of plain card ids.
   * NOTE: only returns card models that are a part of this collection, so it may be necessary to call "addAllCardsToCollection" first.
   * @param {Array} cardIds
   * @returns {Array}
   */
  getCardModelsFromCardIds: function (cardIds) {
    var cardModels = [];
    if (cardIds) {
      for (var i = 0, il = cardIds.length; i < il; i++) {
        var id = cardIds[i];
        var cardModel = this.get(id);
        if (cardModel) {
          cardModels.push(cardModel);
        }
      }
    }
    return cardModels;
  },

  /**
   * Gets an array of card models from an array of plain card data objects.
   * NOTE: only returns card models that are a part of this collection, so it may be necessary to call "addAllCardsToCollection" first.
   * @param {Array} cards
   * @returns {Array}
   */
  getCardModelsFromCardsData: function (cards) {
    var cardModels = [];
    if (cards && cards.length > 0) {
      for (var i = 0, il = cards.length; i < il; i++) {
        var card = cards[i];
        var id = card.id;
        var cardModel = this.get(id);
        if (cardModel) {
          cardModels.push(cardModel);
        }
      }
    }
    return cardModels;
  },

  /**
   * Adds all cards from card factory to this collection as card models.
   */
  addAllCardsToCollection: function () {
    var cards = SDK.GameSession.getCardCaches().getCards();

    var factionProgressionCardIds = [];

    _.each(SDK.FactionFactory.getAllPlayableFactions(), function (factionData) {
      var factionId = factionData.id;
      var factionProgressionStatsModel = ProgressionManager.getInstance().getFactionProgressionStatsModel(factionId);
      var factionXp = (factionProgressionStatsModel && factionProgressionStatsModel.get('xp')) || 0;
      factionProgressionCardIds = _.union(factionProgressionCardIds, SDK.FactionProgression.unlockedCardsUpToXP(factionXp, factionId));
    });

    var cardModels = [];
    for (var i = 0, il = cards.length; i < il; i++) {
      var card = cards[i];
      var cardId = card.getId();
      var baseCardId = card.getBaseCardId();
      var skinNum = SDK.Cards.getCardSkinNum(cardId);
      var isSkinned = SDK.Cards.getIsSkinnedCardId(cardId);
      var isPrismatic = SDK.Cards.getIsPrismaticCardId(cardId);
      var cardFactionId = card.getFactionId();
      var cardFaction = SDK.FactionFactory.factionForIdentifier(cardFactionId);
      var raceId = card.getRaceId();
      var race = SDK.RaceFactory.raceForIdentifier(raceId);
      var rarityId = card.getRarityId();
      var rarity = SDK.RarityFactory.rarityForIdentifier(rarityId);
      var rarityIsCraftable = SDK.RarityFactory.getIsRarityTypeCraftable(rarityId);
      var isAvailable = !!card.getIsAvailable();
      var isHiddenInCollection = !!card.getIsHiddenInCollection();
      var unlockedWithAchievementId = card.getIsUnlockedWithAchievementId();
      var isLegacy = card.getIsLegacy();

      var isUnlockable;
      var isUnlockableThroughProgression;
      var isUnlockableBasic;
      var isUnlockablePrismaticBasic;
      var isUnlockableWithAchievement;
      var isUnlockablePrismaticWithAchievement;
      var isUnlockableWithSpiritOrbs;
      var isUnlockablePrismaticWithSpiritOrbs;
      var unlockMessage;
      if (!isAvailable || isHiddenInCollection || cardFactionId === SDK.Factions.Tutorial) {
        isUnlockable = isUnlockableThroughProgression = isUnlockableBasic = isUnlockablePrismaticBasic = isUnlockableWithAchievement = isUnlockablePrismaticWithAchievement = false;
      } else {
        isUnlockable = card.getIsUnlockable();
        isUnlockableThroughProgression = card.getIsUnlockableThroughProgression();
        isUnlockableBasic = card.getIsUnlockableBasic();
        isUnlockablePrismaticBasic = card.getIsUnlockablePrismaticBasic();
        isUnlockableWithAchievement = card.getIsUnlockableWithAchievement();
        isUnlockablePrismaticWithAchievement = card.getIsUnlockablePrismaticWithAchievement();
        isUnlockableWithSpiritOrbs = card.getIsUnlockableThroughSpiritOrbs();
        isUnlockablePrismaticWithSpiritOrbs = card.getIsUnlockablePrismaticWithSpiritOrbs();
        unlockMessage = card.getUnlockDescription();
      }

      // get unlock faction and level
      var unlocksAtLevel;
      var unlocksWithFaction;
      var unlocksWithFactionName;
      if (isUnlockableThroughProgression) {
        unlocksAtLevel = SDK.FactionProgression.levelRequiredForCard(cardId);
        unlocksWithFaction = SDK.FactionProgression.factionRequiredForCard(cardId);
        unlocksWithFactionName = SDK.FactionFactory.factionForIdentifier(unlocksWithFaction).name;
      } else {
        unlocksAtLevel = 0;
      }

      if (unlockedWithAchievementId != null) {
        unlockMessage = AchievementsManager.getInstance().getUnlockMessageForAchievementId(unlockedWithAchievementId);
      }

      var modelData = {
        baseCardId: baseCardId,
        card: card,
        cardSetId: card.getCardSetId(),
        description: card.getDescription(CONFIG.FORMATTING_HTML),
        factionId: cardFactionId,
        factionName: cardFaction.name,
        id: cardId,
        isAvailable: isAvailable,
        isHiddenInCollection: isHiddenInCollection,
        isLegacy: isLegacy,
        isNeutral: cardFaction.isNeutral,
        isPrismatic: isPrismatic,
        isSkinned: isSkinned,
        isUnlockable: isUnlockable,
        isUnlockableThroughProgression: isUnlockableThroughProgression,
        isUnlockableBasic: isUnlockableBasic,
        isUnlockablePrismaticBasic: isUnlockablePrismaticBasic,
        isUnlockablePrismaticWithAchievement: isUnlockablePrismaticWithAchievement,
        isUnlockableWithAchievement: isUnlockableWithAchievement,
        isUnlockableWithSpiritOrbs: isUnlockableWithSpiritOrbs,
        isUnlockablePrismaticWithSpiritOrbs: isUnlockablePrismaticWithSpiritOrbs,
        manaCost: card.getManaCost(),
        name: card.getName(),
        raceName: race.name,
        rarityColor: rarity.hex,
        rarityId: rarity.id,
        rarityName: rarity.name,
        rarityDevName: rarity.devName,
        rarityIsCraftable: rarityIsCraftable,
        skinNum: skinNum,
        showRarity: !rarity.isHiddenToUI,
        type: card.getType(),
        // typeName: i18next.t("common."+card.getType().toLowerCase()+"_label")
        unlockMessage: unlockMessage,
        unlocksAtLevel: unlocksAtLevel,
        unlockedWithAchievementId: unlockedWithAchievementId,
        unlocksWithFaction: unlocksWithFaction,
        unlocksWithFactionName: unlocksWithFactionName,
      };

      if (SDK.CardType.getIsEntityCardType(card.getType())) {
        modelData.isEntity = true;
        modelData.isGeneral = card.getIsGeneral();
        if (SDK.CardType.getIsUnitCardType(card.getType())) {
          modelData.isUnit = true;
          modelData.atk = card.getATK();
          modelData.hp = card.getHP();
        } else if (SDK.CardType.getIsTileCardType(card.getType())) {
          modelData.isTile = true;
          if (card.getATK() > 0) {
            modelData.atk = card.getATK();
          }
          if (card.getHP() > 0) {
            modelData.hp = card.getHP();
          }
        }
      } else if (SDK.CardType.getIsArtifactCardType(card.getType())) {
        modelData.isArtifact = true;
      } else {
        modelData.isSpell = true;
      }

      // add model to list
      cardModels.push(new CardModel(modelData));
    }

    // update card counts
    this.updateCardsCount(cardModels, factionProgressionCardIds);

    // reset collection
    this.reset(cardModels);
  },

  updateCardsCount: function (cardIdOrCardModels, factionProgressionCardIds) {
    if (factionProgressionCardIds == null) {
      factionProgressionCardIds = [];
      _.each(SDK.FactionFactory.getAllPlayableFactions(), function (factionData) {
        var factionId = factionData.id;
        var factionProgressionStatsModel = ProgressionManager.getInstance().getFactionProgressionStatsModel(factionId);
        var factionXp = (factionProgressionStatsModel && factionProgressionStatsModel.get('xp')) || 0;
        factionProgressionCardIds = _.union(factionProgressionCardIds, SDK.FactionProgression.unlockedCardsUpToXP(factionXp, factionId));
      });
    }

    if (cardIdOrCardModels != null) {
      if (_.isArray(cardIdOrCardModels)) {
        cardIdOrCardModels = _.sortBy(cardIdOrCardModels, function (cardModel) { return cardModel.get('id'); });
        for (var i = 0, il = cardIdOrCardModels.length; i < il; i++) {
          var cardModel = cardIdOrCardModels[i];
          this._updateCardCount(cardModel, cardIdOrCardModels, factionProgressionCardIds);
        }
      } else {
        var cardModel = this.get(cardIdOrCardModels);
        this._updateCardCount(cardModel, this.models, factionProgressionCardIds);
      }
    } else {
      for (var i = 0, il = this.models.length; i < il; i++) {
        var cardModel = this.models[i];
        this._updateCardCount(cardModel, this.models, factionProgressionCardIds);
      }
    }
  },

  _updateCardCount: function (cardModel, cardModels, factionProgressionCardIds) {
    if (cardModel != null && cardModels != null && factionProgressionCardIds != null) {
      var cardId = cardModel.get('id');
      var baseCardId = cardModel.get('baseCardId');
      var skinNum = cardModel.get('skinNum');

      // inventory count should always be the actual count
      var inventoryCount = 0;
      var canShowSkin = false;
      if (skinNum > 0) {
        var skinId = SDK.Cards.getCardSkinIdForCardId(cardId);
        // must own skin to see it
        if (InventoryManager.getInstance().hasCosmeticById(skinId) || InventoryManager.getInstance().getCanAlwaysUseCosmeticById(skinId)) {
          canShowSkin = true;

          if (cardModel.get('isPrismatic')) {
            // must own prismatic card to use skin on prismatic card
            var prismaticCardId = SDK.Cards.getPrismaticCardId(baseCardId);
            var prismaticCardModel = _.find(cardModels, function (otherCardModel) { return otherCardModel.get('id') === prismaticCardId; });
            if (prismaticCardModel != null && prismaticCardModel.get('inventoryCount') > 0) {
              inventoryCount = prismaticCardModel.get('inventoryCount');
            }
          } else {
            // must own base card to use skin on base card
            var baseCardModel = _.find(cardModels, function (otherCardModel) { return otherCardModel.get('id') === baseCardId; });
            if (baseCardModel != null && baseCardModel.get('inventoryCount') > 0) {
              inventoryCount = baseCardModel.get('inventoryCount');
            }
          }
        }
      } else if (cardModel.get('isUnlockableThroughProgression')) {
        // progression unlockable cards should check for if they are unlocked
        var progressionCardId = _.find(factionProgressionCardIds, function (progressionCardId) {
          return progressionCardId === cardId;
        });
        if (progressionCardId != null) {
          if (SDK.FactionFactory.cardIdIsGeneral(progressionCardId)) {
            inventoryCount = 1;
          } else {
            inventoryCount = CONFIG.MAX_DECK_DUPLICATES;
          }
        }
      // } else if (SDK.CardType.getIsEntityCardType(cardModel.get("type")) && cardModel.get("isGeneral")) {
      //  // generals only have 1 copy
      //  inventoryCount = 1;
      } else if (SDK.CardType.getIsEntityCardType(cardModel.get('type')) && cardModel.get('isGeneral') && !cardModel.get('isUnlockableWithAchievement')) {
        // generals only have 1 copy
        inventoryCount = 1;
      } else if (SDK.CardType.getIsEntityCardType(cardModel.get('type')) && cardModel.get('isGeneral') && cardModel.get('isUnlockableWithAchievement')) {
        // Inventory count is based on inventory
      } else if (!cardModel.get('rarityIsCraftable')) {
        // basic non-unlockable cards start at 3 copies
        inventoryCount = CONFIG.MAX_DECK_DUPLICATES;
      }

      if (inventoryCount == 0) {
        // if the count so far is 0, check the user's inventory data
        var inventoryCardModel = InventoryManager.getInstance().cardsCollection.get(cardId);
        if (inventoryCardModel != null) {
          inventoryCount = inventoryCardModel.get('count');
        }
      }

      var isUnlocked;
      var achievementUnlockMessage;
      if (cardModel.get('isUnlockable')) {
        isUnlocked = false;
        var inventoryCardModel = InventoryManager.getInstance().cardsCollection.get(cardId);
        // uncraftable prism sisters problem: Generals need to be unlocked by this
        // if (cardModel.get("isUnlockableWithAchievement")) {
        if (cardModel.get('isUnlockableWithAchievement') && !cardModel.get('isUnlockablePrismaticWithAchievement')) {
          if (inventoryCardModel != null && inventoryCardModel.get('count') > 0) {
            isUnlocked = true;
          } else if (cardModel.get('isSkinned')) {
            var baseInventoryCardModel = InventoryManager.getInstance().cardsCollection.get(baseCardId);
            if (baseInventoryCardModel != null && baseInventoryCardModel.get('count') > 0) {
              isUnlocked = true;
            }
          }
        } else if (inventoryCount > 0) {
          isUnlocked = true;
        } else if (cardModel.get('isUnlockablePrismaticWithAchievement')) {
          // Here
          var baseInventoryCardModel = InventoryManager.getInstance().cardsCollection.get(baseCardId);
          if (baseInventoryCardModel != null && baseInventoryCardModel.get('count') > 0) {
            isUnlocked = true;
          }
        } else if (cardModel.get('isUnlockablePrismaticWithSpiritOrbs')) {
          var baseInventoryCardModel = InventoryManager.getInstance().cardsCollection.get(baseCardId);
          if (baseInventoryCardModel != null && baseInventoryCardModel.get('count') > 0) {
            isUnlocked = true;
          }
        // TODO: this is where 3rd general prism unlock will probably go
        // } else if (cardModel.get("unlockedWithAchievementId") != null) {
        //  var baseInventoryCardModel = InventoryManager.getInstance().cardsCollection.get(baseCardId);
        //  if (baseInventoryCardModel != null && baseInventoryCardModel.get("count") > 0) {
        //    isUnlocked = true;
        //  } else {
        //    achievementUnlockMessage = AchievementsManager.getInstance().getUnlockMessageForAchievementId(cardModel.get("unlockedWithAchievementId"));
        //  }
        }
      } else {
        isUnlocked = true;
      }

      // update any achievement unlock messages
      var achievementUnlockMessage;
      if (cardModel.get('unlockedWithAchievementId') != null) {
        achievementUnlockMessage = AchievementsManager.getInstance().getUnlockMessageForAchievementId(cardModel.get('unlockedWithAchievementId'));
      }

      // set new values
      cardModel.set({
        inventoryCount: inventoryCount,
        canShowSkin: canShowSkin,
        isUnlocked: isUnlocked,
        isCraftable: cardModel.get('rarityIsCraftable')
          && !cardModel.get('isGeneral')
          && skinNum === 0
          && isUnlocked
          && (!cardModel.get('isUnlockableWithAchievement')
            || cardModel.get('isUnlockablePrismaticWithAchievement'))
          && (!cardModel.get('isUnlockableWithSpiritOrbs')
            || cardModel.get('isUnlockablePrismaticWithSpiritOrbs')),
        unlockMessage: achievementUnlockMessage || cardModel.get('unlockMessage'),
      });
    }
  },

  comparator: function (a, b) {
    // sort by general, mana cost
    var comparison = (b.get('isGeneral') - a.get('isGeneral')) || (a.get('manaCost') - b.get('manaCost'));
    if (comparison === 0) {
      var aName = a.get('name').toLowerCase();
      var bName = b.get('name').toLowerCase();
      if (aName === bName) return a.get('skinNum') - b.get('skinNum') || a.get('isPrismatic') - b.get('isPrismatic');
      else if (aName > bName) return 1;
      else if (aName < bName) return -1;
    }
    return comparison;
  },
});

// Expose the class either via CommonJS or the global object
module.exports = CardsCollection;
