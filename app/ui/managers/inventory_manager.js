// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _InventoryManager = {};
_InventoryManager.instance = null;
_InventoryManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new InventoryManager();
  }
  return this.instance;
};
_InventoryManager.current = _InventoryManager.getInstance;

module.exports = _InventoryManager;

// Duplicates unexported defaultOrbGoldCost var in cardSetFactory.coffee.
// Need to update here as well for purchase functionality.
const ORB_GOLD_COST = 50;

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var Promise = require('bluebird');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var UserDecksCollection = require('app/ui/collections/user_decks');
var Analytics = require('app/common/analytics');
var AnalyticsTracker = require('app/common/analyticsTracker');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var Session = require('app/common/session2');
var moment = require('moment');
var i18next = require('i18next');
var NavigationManager = require('./navigation_manager');
var NewPlayerManager = require('./new_player_manager');
var ProgressionManager = require('./progression_manager');
var GameDataManager = require('./game_data_manager');
var ProfileManager = require('./profile_manager');
var Manager = require('./manager');

var InventoryManager = Manager.extend({

  // backbone models / collections
  walletModel: null,
  boosterPacksCollection: null,
  arenaTicketsCollection: null,
  riftTicketsCollection: null,
  cardsCollection: null,
  cardLoreCollection: null,
  cardLoreReadRequests: null,
  decksCollection: null,
  cosmeticsCollection: null,
  codexChaptersCollection: null,
  portraitsCollection: null,
  totalOrbCountModel: null, // Tracks total orb counts for card sets with a max number of orbs a user can own
  _disenchantPromosCollection: null,

  _cached_hasAnyCardsOfFaction: null,

  /* region INITIALIZE */

  initialize: function (options) {
    this._cached_hasAnyCardsOfFaction = [];

    Manager.prototype.initialize.call(this);
  },

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');

        this.walletModel = new DuelystFirebase.Model(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/wallet',
        });

        this.boosterPacksCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/spirit-orbs',
        });

        this.arenaTicketsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/gauntlet-tickets',
        });

        this.riftTicketsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/rift-tickets',
        });

        this.cardsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/card-collection',
        });

        this.cardLoreCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/card-lore',
        });
        this.cardLoreReadRequests = [];

        this.decksCollection = new UserDecksCollection();
        this.decksCollection.fetch();

        this.cosmeticsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/cosmetic-inventory',
        });

        this.portraitsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/portraits',
        });

        this.codexChaptersCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/codex',
        });

        this.totalOrbCountModel = new DuelystFirebase.Model(null, {
          firebase: process.env.FIREBASE_URL + 'user-inventory/' + userId + '/spirit-orb-total',
        });

        this.onReady().then(function () {
        // listen to changes immediately so we don't miss anything
          this.listenTo(this.walletModel, 'change', this.onWalletChange);
          this.listenTo(this.boosterPacksCollection, 'change add remove', this.onBoosterPackCollectionChange);
          this.listenTo(this.cardsCollection, 'add', this.onCardsCollectionCardAdded);
          this.listenTo(this.cardsCollection, 'remove', this.onCardsCollectionCardRemoved);
          this.listenTo(this.cardsCollection, 'change', this.onCardsCollectionChange);
          this.listenTo(this.cardLoreCollection, 'change add remove', this.onCardLoreCollectionChange);
          this.listenTo(this.decksCollection, 'change add remove', this.onDecksCollectionChange);
          this.listenTo(this.cosmeticsCollection, 'add remove', this.onCosmeticsCollectionChange);
          this.listenTo(this.totalOrbCountModel, 'change', this.onOrbCountCollectionChange);

          // update decks when game data is ready
          Promise.all([
            GameDataManager.getInstance().onReady(),
            ProgressionManager.getInstance().onReady(),
            NewPlayerManager.getInstance().onReady(),
          ]).then(function () {
            // Check if player is missing codex chapters they should have earned once progression manager is ready
            this.checkForMissingCodexChapters();

            var invalidDeckModels = [];
            this.decksCollection.each(function (deckModel) {
              var deckFactionId = deckModel.get('faction_id');
              if (deckFactionId == null
              || !ProgressionManager.getInstance().isFactionUnlocked(deckModel.get('faction_id'))) {
              // no faction or faction not unlocked
                invalidDeckModels.push(deckModel);
              } else {
              // decks at this point have all properties
              // except their card models (these are not serialized)
              // so we need to update the card models from the list of card ids
                deckModel.updateCardModelsFromCardsData();

                // deck must have general
                if (!deckModel.hasGeneral()) {
                  invalidDeckModels.push(deckModel);
                }
              }
            }.bind(this));

            // remove all invalid decks
            this.decksCollection.remove(invalidDeckModels);
          }.bind(this));
        }.bind(this));

        this._markAsReadyWhenModelsAndCollectionsSynced([
          this.walletModel,
          this.boosterPacksCollection,
          this.cardsCollection,
          this.decksCollection,
          this.cardLoreCollection,
          this.codexChaptersCollection,
          this.cosmeticsCollection,
        ]);
      });
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.walletModel = null;
    this.boosterPacksCollection = null;
    this.cardsCollection = null;
    this.decksCollection = null;
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onWalletChange: function () {
    Logger.module('UI').log('InventoryManager::onWalletChange()');
    this.trigger(EVENTS.wallet_change, { model: this.walletModel });
  },

  onBoosterPackCollectionChange: function () {
    Logger.module('UI').log('InventoryManager::onBoosterPackCollectionChange()');
    this.trigger(EVENTS.booster_pack_collection_change, { collection: this.boosterPacksCollection });
  },

  onCardsCollectionCardAdded: function (addedCardModel) {
    Logger.module('UI').log('InventoryManager::onCardsCollectionCardAdded()');
    if (addedCardModel) {
      var cardId = addedCardModel.id;
      this._updateLocalCardCacheWithCardInventoryCount(cardId, addedCardModel.get('count'));
    }

    this.trigger(EVENTS.cards_collection_change, { model: addedCardModel, collection: this.cardsCollection });
  },

  onCardsCollectionCardRemoved: function (removedCardModel) {
    Logger.module('UI').log('InventoryManager::onCardsCollectionCardRemoved()');
    if (removedCardModel) {
      var cardId = removedCardModel.id;
      this._updateLocalCardCacheWithCardInventoryCount(cardId, 0);
    }

    this.trigger(EVENTS.cards_collection_change, { model: removedCardModel, collection: this.cardsCollection });
  },

  onCardsCollectionChange: function (changedInventoryModel) {
    Logger.module('UI').log('InventoryManager::onCardsCollectionChange()');
    if (changedInventoryModel) {
      var cardId = changedInventoryModel.id;
      var cardCollectionModel = this.cardsCollection.get(cardId);
      var cardWasRemoved = cardCollectionModel == null;
      var inventoryCountChanged = changedInventoryModel.hasChanged('count') || cardWasRemoved;
      // if inventory count of this card has changed or reduced to 0
      if (inventoryCountChanged) {
        var newInventoryCount = cardWasRemoved ? 0 : changedInventoryModel.get('count');
        this._updateLocalCardCacheWithCardInventoryCount(cardId, newInventoryCount);
      }
    } else {
      // because this could fire before game data is ready
      GameDataManager.getInstance().onReady().then(function () {
        // sync all cards
        this.cardsCollection.each(function (inventoryCardModel) {
          var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.id);
          if (gameDataCardModel != null) {
            gameDataCardModel.set('inventoryCount', inventoryCardModel.get('count'));
          }
        });

        // update unlocked/crafting state for all cards
        GameDataManager.getInstance().getVisibleCardsCollection().updateCardsCount();

        // sync all decks
        this.decksCollection.each(function (deckModel) {
          deckModel.updatePropertiesFromCardModels();
        });
      }.bind(this));
    }

    this.trigger(EVENTS.cards_collection_change, { model: changedInventoryModel, collection: this.cardsCollection });
  },

  _updateLocalCardCacheWithCardInventoryCount: function (cardId, newInventoryCount) {
    // because this could fire before game data is ready
    if (GameDataManager.getInstance().getIsReady()) {
      this._updateLocalCardCacheWithCardInventoryCountWhenGameDataReady(cardId, newInventoryCount);
    } else {
      GameDataManager.getInstance().onReady().then(function () {
        this._updateLocalCardCacheWithCardInventoryCountWhenGameDataReady(cardId, newInventoryCount);
      }.bind(this));
    }
  },

  _updateLocalCardCacheWithCardInventoryCountWhenGameDataReady: function (cardId, newInventoryCount) {
    // update card and any decks it is in
    var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
    if (gameDataCardModel != null) {
      // clear cache
      var factionId = gameDataCardModel.get('factionId');
      if (factionId != null) {
        this._cached_hasAnyCardsOfFaction[factionId] = null;
      }

      // update counts
      gameDataCardModel.set('inventoryCount', newInventoryCount);

      // update unlocked/crafting state for all cards
      GameDataManager.getInstance().getVisibleCardsCollection().updateCardsCount();

      // update decks
      this.decksCollection.each(function (deckModel) {
        var changed = deckModel.updateCard(gameDataCardModel);

        // force deck to save due to automatic change
        if (changed) {
          deckModel.save();
        }
      });
    }
  },

  onCardLoreCollectionChange: function (loreModel) {
    Logger.module('UI').log('InventoryManager::onCardLoreCollectionChange');
    this.onCardLoreCollectionChangeForCardId(loreModel && loreModel.get('card_id'));
  },

  onCardLoreCollectionChangeForCardId: function (cardId) {
    if (cardId != null) {
      // remove from read requests
      var index = _.indexOf(this.cardLoreReadRequests, cardId);
      if (index !== -1) {
        this.cardLoreReadRequests.splice(index, 1);
      }

      // trigger change event
      this.trigger(EVENTS.card_lore_collection_change, { card_id: cardId, collection: this.cardLoreCollection });
    }
  },

  onDecksCollectionChange: function (deckModel) {
    Logger.module('UI').log('InventoryManager::onDecksCollectionChange');
    this.trigger(EVENTS.decks_collection_change, { model: deckModel, collection: this.decksCollection });
  },

  onCosmeticsCollectionChange: function (cosmeticModel) {
    var cosmeticId = cosmeticModel && cosmeticModel.get('id');
    Logger.module('UI').log('InventoryManager::onCosmeticsCollectionChange()', cosmeticId, this.hasCosmeticById(cosmeticId), SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId), cosmeticModel);
    if (cosmeticId != null && SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
      var cardId = SDK.Cards.getCardIdForCardSkinId(cosmeticId);
      var newInventoryCount;
      if (this.hasCosmeticById(cosmeticId)) {
        if (SDK.FactionFactory.cardIdIsGeneral(cardId)) {
          newInventoryCount = 1;
        } else {
          newInventoryCount = CONFIG.MAX_DECK_DUPLICATES;
        }
      } else {
        newInventoryCount = 0;
      }
      this._updateLocalCardCacheWithCardInventoryCount(cardId, newInventoryCount);
    }

    this.trigger(EVENTS.cosmetics_collection_change, { model: cosmeticModel, collection: this.cosmeticsCollection });
  },

  onOrbCountCollectionChange: function (orbCountModel) {
    this.trigger(EVENTS.orb_count_collection_change, { model: orbCountModel, collection: this.totalOrbCountModel });
  },

  /* endregion EVENTS */

  /* region ACTIONS */

  markCardAsReadInCollection: function (cardId) {
    var inventoryCardModel = this.cardsCollection.get(cardId);
    if (inventoryCardModel != null && inventoryCardModel.get('is_unread')) {
      inventoryCardModel.set('is_unread', false);
      inventoryCardModel.set('is_new', false);
      $.ajax({
        data: JSON.stringify({ read_at: moment().utc() }),
        url: process.env.API_URL + '/api/me/inventory/card_collection/' + cardId + '/read_at',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }
  },

  dismissAllUnreadCards: function () {
    this.cardsCollection.each(function (inventoryCardModel) {
      if (inventoryCardModel.get('is_unread')) {
        inventoryCardModel.set('is_unread', false);
        inventoryCardModel.set('is_new', false);
      }
    });

    $.ajax({
      data: JSON.stringify({ read_at: moment().utc() }),
      url: process.env.API_URL + '/api/me/inventory/card_collection/read_all',
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
    });
  },

  markCardLoreAsReadInCollection: function (cardId) {
    var cardLoreModel = this.cardLoreCollection.get(cardId);
    var isUnread;
    if (cardLoreModel == null) {
      isUnread = !_.contains(this.cardLoreReadRequests, cardId);
    } else {
      isUnread = cardLoreModel.get('is_unread');
    }
    if (isUnread) {
      if (cardLoreModel == null) {
        // create a request entry so we can't re-request
        this.cardLoreReadRequests.push(cardId);
      } else {
        this.cardLoreCollection.each(function (cardLoreModel) {
          if (cardLoreModel != null && cardLoreModel.get('baseCardId') === cardId) {
            cardLoreModel.set('is_unread', false);
          }
        });
      }
      $.ajax({
        data: JSON.stringify({ read_at: moment().utc() }),
        url: process.env.API_URL + '/api/me/inventory/card_lore_collection/' + cardId + '/read_lore_at',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      }).fail(function () {
        // trigger change on failure to remove request and update ui
        this.onCardLoreCollectionChangeForCardId(cardId);
      }.bind(this));
    }
  },

  buyBoosterPacksWithGold: function (numBoosterPacks, cardSetId, sku) {
    if (numBoosterPacks == null || isNaN(numBoosterPacks) || numBoosterPacks <= 0) { numBoosterPacks = 1; }
    if (cardSetId == null) { cardSetId = SDK.CardSet.Core; }
    if (this.walletModel.get('gold_amount') >= numBoosterPacks * ORB_GOLD_COST) {
      NewPlayerManager.getInstance().setHasPurchasedBoosterPack();

      return new Promise(function (resolve, reject) {
        var request = $.ajax({
          data: JSON.stringify({
            sku,
            qty: numBoosterPacks,
            card_set_id: cardSetId,
            currency_type: 'soft',
          }),
          url: process.env.API_URL + '/api/me/inventory/spirit_orbs',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          Analytics.track('spirit orb purchased with gold', {
            category: Analytics.EventCategory.SpiritOrbs,
          });
          resolve(response);
        });

        request.fail(function (response) {
          var errorMessage = response.responseJSON && response.responseJSON.message || 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      }.bind(this));
    } else {
      return Promise.reject('Not enough gold.');
    }
  },

  purchaseProductWithPremiumCurrency: function (sku, saleData) {
    if (sku) {
      var saleId = null;
      if (saleData != null && saleData.saleId) {
        saleId = saleData.saleId;
      }
      return new Promise(function (resolve, reject) {
        var request = $.ajax({
          data: JSON.stringify({
            product_sku: sku,
            sale_id: saleId,
          }),
          url: process.env.API_URL + '/api/me/shop/premium_purchase',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          resolve(response);
        });

        request.fail(function (response) {
          var errorMessage = response.responseJSON && response.responseJSON.message || 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      }.bind(this));
    } else {
      return Promise.reject('No purchase method provided.');
    }
  },

  purchaseProductSku: function (sku, cardToken) {
    if (this.walletModel.get('card_last_four_digits') || cardToken) {
      NewPlayerManager.getInstance().setHasPurchasedBoosterPack();

      return new Promise(function (resolve, reject) {
        var request = $.ajax({
          data: JSON.stringify({ product_sku: sku, card_token: cardToken }),
          url: process.env.API_URL + '/api/me/shop/purchase',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          resolve(response);
        });

        request.fail(function (response) {
          var errorMessage = response.responseJSON && response.responseJSON.message || 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      }.bind(this));
    } else {
      return Promise.reject('No purchase method provided.');
    }
  },

  craftCosmetic: function (cosmeticId) {
    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/inventory/cosmetics/' + cosmeticId,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });
      request.done(function (response) {
        resolve(response);
      });
      request.fail(function (response) {
        var errorMessage = response.responseJSON && response.responseJSON.message || i18next.t('cosmetics.cosmetic_crafting_error_msg');
        reject(errorMessage);
      });
    }.bind(this));
  },

  unlockBoosterPack: function (boosterPackId) {
    if (this.boosterPacksCollection.length > 0) {
      return new Promise(function (resolve, reject) {
        if (!boosterPackId)
          boosterPackId = this.boosterPacksCollection.at(0).get('id');

        var request = $.ajax({
          url: process.env.API_URL + '/api/me/inventory/spirit_orbs/opened/' + boosterPackId,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          if (response && response.cards) {
            var rarityIds = _.map(response.cards, function (cardId) {
              var sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.current());
              return sdkCard.getRarityId();
            });
            rarityIds = rarityIds.sort();
            var spiritValue = _.reduce(rarityIds, function (memo, rarityId) {
              return memo + SDK.RarityFactory.rarityForIdentifier(rarityId).spiritCost;
            }, 0);
            var raritySplit = JSON.stringify(rarityIds);

            var isFirst = 0;
            if (NewPlayerManager.getInstance().getHasOpenedSpiritOrb()) {
              isFirst = 1;
            }

            Analytics.track('opened spirit orb', {
              category: Analytics.EventCategory.SpiritOrbs,
              rarity_split: raritySplit,
              spirit_value: spiritValue,
              is_first: isFirst,
            });
          }

          NewPlayerManager.getInstance().setHasOpenedSpiritOrb(true);
          resolve(response);
        });

        request.fail(function (response) {
          var errorMessage = response.responseJSON && response.responseJSON.message;
          errorMessage = errorMessage || (response.responseJSON && response.responseJSON.error);
          errorMessage = errorMessage || 'Booster pack unlock failed';
          reject(errorMessage);
        });
      }.bind(this));
    } else {
      return Promise.reject('No boosters to open.');
    }
  },

  craftCard: function (cardId) {
    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/inventory/card_collection/' + cardId,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        Logger.module('UI').log('InventoryManager::craftCard() ' + cardId);

        var newPlayerManager = NewPlayerManager.getInstance();
        if (!newPlayerManager.getHasCraftedCard()) {
          newPlayerManager.setHasCraftedCard(cardId);
        }

        Analytics.track('crafted card', {
          category: Analytics.EventCategory.Inventory,
          card_id: cardId,
        });

        resolve(response);
      });

      request.fail(function (response) {
        var errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Craft failed.';
        reject(errorMessage);
      });
    }.bind(this));
  },

  disenchantCards: function (cardIds) {
    return new Promise(function (resolve, reject) {
      var group = _.groupBy(cardIds, function (o) { return o; });
      var hasEnoughCards = true;
      _.each(group, function (cardArray, cardId, list) {
        var inventoryCardModel = this.cardsCollection.get(parseInt(cardId));
        if (inventoryCardModel && inventoryCardModel.get('count') < cardArray.length) {
          hasEnoughCards = false;
        }
      }.bind(this));

      if (hasEnoughCards) {
        var request = $.ajax({
          data: JSON.stringify({ card_ids: cardIds }),
          url: process.env.API_URL + '/api/me/inventory/card_collection',
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          Logger.module('UI').log('InventoryManager::disenchantCards() -> ' + JSON.stringify(response));

          resolve(response);
        });

        request.fail(function (response) {
          var errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Disenchant failed.';
          reject(errorMessage);
        });
      } else {
        var errorMessage = 'You do not have enough copies of all the cards you are trying to disenchant.';
        reject(errorMessage);
      }
    }.bind(this));
  },

  disenchantDuplicateCards: function () {
    return new Promise(function (resolve, reject) {
      var cardIds = [];
      this.cardsCollection.each(function (inventoryCardModel) {
        if (inventoryCardModel.get('count') > 3) {
          var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.id);
          if (gameDataCardModel != null && gameDataCardModel.get('isCraftable')) {
            for (var i = 0; i < inventoryCardModel.get('count') - 3; i++) {
              cardIds.push(inventoryCardModel.id);
            }
          }
        }
      });

      if (cardIds.length > 0) {
        var request = $.ajax({
          url: process.env.API_URL + '/api/me/inventory/card_collection/duplicates',
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          Logger.module('UI').log('InventoryManager::disenchantCards() -> ' + JSON.stringify(response));

          resolve(response);
        });

        request.fail(function (response) {
          var errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Disenchant failed.';
          reject(errorMessage);
        });
      } else {
        reject('No duplicate cards to disenchant.');
      }
    }.bind(this));
  },

  /* endregion ACTIONS */

  /* region GETTERS / SETTERS */

  getWalletModel: function () {
    return this.walletModel;
  },

  getWalletModelGoldAmount: function () {
    var walletModel = this.getWalletModel();
    if (walletModel != null && walletModel.get('gold_amount') != null) {
      return walletModel.get('gold_amount');
    } else {
      return 0;
    }
  },

  getWalletModelSpiritAmount: function () {
    var walletModel = this.getWalletModel();
    if (walletModel != null && walletModel.get('spirit_amount') != null) {
      return walletModel.get('spirit_amount');
    } else {
      return 0;
    }
  },

  getWalletModelPremiumAmount: function () {
    var walletModel = this.getWalletModel();
    if (walletModel != null && walletModel.get('premium_amount') != null) {
      return walletModel.get('premium_amount');
    } else {
      return 0;
    }
  },

  getBoosterPacksCollection: function () {
    return this.boosterPacksCollection;
  },

  getBoosterPacksBySet: function (cardSetId) {
    if (this.boosterPacksCollection == null || this.boosterPacksCollection.models == null) {
      return 0;
    }
    return this.boosterPacksCollection.filter(function (p) {
      return p.get('card_set') === cardSetId || (!p.get('card_set') && cardSetId === SDK.CardSet.Core);
    }.bind(this));
  },

  getArenaTicketsCollection: function () {
    return this.arenaTicketsCollection;
  },

  getCardsCollection: function () {
    return this.cardsCollection;
  },

  hasAnyCardsOfFaction: function (factionId) {
    // attempt to use cached result
    var hasAnyCardsOfFaction = this._cached_hasAnyCardsOfFaction[factionId];
    if (hasAnyCardsOfFaction != null) {
      return hasAnyCardsOfFaction;
    } else {
      // find first card from faction
      var cardOfFaction = this.cardsCollection.find(function (inventoryCardModel) {
        var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.get('id'));
        return gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId;
      });

      // if no cards owned, check for skins
      if (cardOfFaction == null) {
        cardOfFaction = this.cosmeticsCollection.find(function (cosmeticModel) {
          var cosmeticId = cosmeticModel.get('id');
          if (SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
            var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(SDK.Cards.getCardIdForCardSkinId(cosmeticId));
            return gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId;
          }
        });
      }

      // cache result
      var hasAnyCards = this._cached_hasAnyCardsOfFaction[factionId] = cardOfFaction != null;

      return hasAnyCards;
    }
  },

  getRemainingBloodbornPacks: function () {
    var bloodbornSetData = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Bloodborn);
    var maxBloodbornOrbs = bloodbornSetData.numOrbsToCompleteSet;
    if (this.totalOrbCountModel != null) {
      var bloodbornOrbsTotal = this.totalOrbCountModel.get(SDK.CardSet.Bloodborn) || 0;
      return Math.max(maxBloodbornOrbs - bloodbornOrbsTotal, 0);
    }
    // Default to max, allow server logic to deny if something goes wrong
    return maxBloodbornOrbs;
  },

  canBuyBloodbornPacks: function () {
    return (this.getRemainingBloodbornPacks() > 0);
  },

  canBuyPacksForCardSet: function (cardSetId) {
    if (cardSetId == SDK.CardSet.Bloodborn) {
      return this.canBuyBloodbornPacks();
    } else if (cardSetId == SDK.CardSet.Unity) {
      return this.canBuyAncientBondsPacks();
    } else {
      return true;
    }
  },

  getRemainingAncientBondsPacks: function () {
    var ancientBondsSetData = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Unity);
    var maxAncientBondsOrbs = ancientBondsSetData.numOrbsToCompleteSet;
    if (this.totalOrbCountModel != null) {
      var ancientBondsOrbsTotal = this.totalOrbCountModel.get(SDK.CardSet.Unity) || 0;
      return Math.max(maxAncientBondsOrbs - ancientBondsOrbsTotal, 0);
    }
    // Default to max, allow server logic to deny if something goes wrong
    return maxAncientBondsOrbs;
  },

  canBuyAncientBondsPacks: function () {
    return (this.getRemainingAncientBondsPacks() > 0);
  },

  getDecksCollection: function () {
    return this.decksCollection;
  },

  hasValidCustomDecks: function () {
    return this.decksCollection.filter(function (deckModel) { return deckModel.isValid(); }).length > 0;
  },

  getCosmeticsCollection: function () {
    return this.cosmeticsCollection;
  },

  getCosmeticById: function (cosmeticId) {
    return this.cosmeticsCollection.get(cosmeticId);
  },

  hasCosmeticById: function (cosmeticId) {
    return this.getCosmeticById(cosmeticId) != null;
  },

  getCanSeeCosmeticById: function (cosmeticId) {
    var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && (cosmeticData.alwaysVisible || this.hasCosmeticById(cosmeticId));
  },

  getCanUseCosmeticById: function (cosmeticId) {
    var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && ((!cosmeticData.purchasable && !cosmeticData.unlockable) || this.hasCosmeticById(cosmeticId));
  },

  getCanAlwaysUseCosmeticById: function (cosmeticId) {
    var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && !cosmeticData.purchasable && !cosmeticData.unlockable;
  },

  getCanPurchaseCosmeticById: function (cosmeticId) {
    var cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && cosmeticData.purchasable && !this.hasCosmeticById(cosmeticId);
  },

  getPortraitsCollection: function () {
    return this.portraitsCollection;
  },

  hasCollectionDuplicates: function () {
    var duplicateCard = this.cardsCollection.find(function (card) {
      var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(card.get('id'));
      return gameDataCardModel != null && gameDataCardModel.get('isCraftable') && card.get('count') > 3;
    }.bind(this));

    return duplicateCard != null;
  },

  isCardUnread: function (cardId) {
    var inventoryCardModel = this.cardsCollection.get(cardId);
    return (inventoryCardModel != null && inventoryCardModel.get('is_unread')) || false;
  },

  hasUnreadCards: function () {
    var unreadCard = this.cardsCollection.find(function (inventoryCardModel) {
      return inventoryCardModel.get('is_unread');
    });

    return unreadCard != null;
  },

  getTotalUnreadCardCount: function () {
    var unreadCount = 0;
    this.cardsCollection.each(function (inventoryCardModel) {
      if (inventoryCardModel.get('is_unread') && GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.id) != null) {
        unreadCount += 1;
      }
    });

    return unreadCount;
  },

  getUnreadCardCountForFaction: function (factionId) {
    var unreadCount = 0;
    this.cardsCollection.each(function (inventoryCardModel) {
      if (inventoryCardModel.get('is_unread')) {
        var cardId = inventoryCardModel.id;
        var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
        if (gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId) {
          unreadCount += 1;
        }
      }
    });

    return unreadCount;
  },

  isCardLoreUnread: function (cardId) {
    if (!this.isCardLoreVisible(cardId)) {
      return false;
    }

    var cardLoreModel = this.cardLoreCollection.get(cardId);
    if (cardLoreModel == null) {
      return !_.contains(this.cardLoreReadRequests, cardId);
    } else {
      return cardLoreModel.get('is_unread');
    }
  },

  isCardLoreVisible: function (cardId) {
    // lore for cards that users don't own isn't visible
    var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
    return gameDataCardModel != null && gameDataCardModel.get('inventoryCount') > 0 && ProgressionManager.getInstance().isFactionUnlocked(gameDataCardModel.get('factionId'));
  },

  hasUnreadCardLore: function () {
    var allLore = SDK.CardLore.getAllLore();
    for (var i = 0, il = allLore.length; i < il; i++) {
      var lore = allLore[i];
      var cardId = lore.id;
      if (this.isCardLoreUnread(cardId)) {
        return true;
      }
    }
    return false;
  },

  getTotalUnreadCardLoreCount: function () {
    var unreadCount = 0;

    var allLore = SDK.CardLore.getAllLore();
    for (var i = 0, il = allLore.length; i < il; i++) {
      var lore = allLore[i];
      var cardId = lore.id;
      if (this.isCardLoreUnread(cardId)) {
        unreadCount += 1;
      }
    }

    return unreadCount;
  },

  getUnreadCardLoreCountForFaction: function (factionId) {
    var unreadCount = 0;

    var allLore = SDK.CardLore.getAllLore();
    for (var i = 0, il = allLore.length; i < il; i++) {
      var lore = allLore[i];
      var cardId = lore.id;
      if (this.isCardLoreUnread(cardId)) {
        var gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
        if (gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId) {
          unreadCount += 1;
        }
      }
    }

    return unreadCount;
  },

  isFreeCardOfTheDayAvailable: function () {
    var startOfToday = moment.utc().startOf('day');
    var lastClaimedAtDay = this.getFreeCardOfTheDayLastClaimedAt().startOf('day');
    return lastClaimedAtDay.isBefore(startOfToday);
  },

  getFreeCardOfTheDayLastClaimedAt: function () {
    var lastClaimedAt = ProfileManager.getInstance().get('free_card_of_the_day_claimed_at') || 0;
    return moment.utc(lastClaimedAt);
  },

  getUnusedRiftTicketModels: function () {
    if (this.riftTicketsCollection == null || this.riftTicketsCollection.models == null || this.riftTicketsCollection.models.length == 0) {
      return [];
    } else {
      return this.riftTicketsCollection.models;
    }
  },

  hasUnusedRiftTicket: function () {
    return this.getUnusedRiftTicketModels().length != 0;
  },

  claimFreeCardOfTheDay: function () {
    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/inventory/free_card_of_the_day',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });
      request.done(function (response) {
        resolve(response);
      }.bind(this));
      request.fail(function (response) {
        var error = 'There was an error processing your request';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error(error));
      });
    }.bind(this));
  },

  /**
   * Checks against gamecount if a player is missing any codex chapter and calls an api route to award them if they are
   * @return {Promise} $.ajax promise for the server call to acquire missing chapters
   */
  checkForMissingCodexChapters: function () {
    if (!NewPlayerManager.getInstance().isReady || !ProgressionManager.getInstance().isReady || !this.isReady) {
      // In case we try to fire this before any of the required managers are ready, ignore the request, it will get called on ready anyways
      return Promise.resolve();
    }

    var newPlayerManager = NewPlayerManager.getInstance();
    if (!newPlayerManager.canSeeCodex()) {
      return Promise.resolve();
    }

    var missingACodexChapter = false;
    var earnedCodexChapterIds = SDK.Codex.chapterIdsOwnedByGameCount(ProgressionManager.getInstance().getGameCount());

    for (var i = 0; i < earnedCodexChapterIds.length; i++) {
      var earnedCodexChapterId = earnedCodexChapterIds[i];
      var chapterModel = this.codexChaptersCollection.get(earnedCodexChapterId);
      if (chapterModel == null) {
        missingACodexChapter = true;
        break;
      }
    }

    if (!missingACodexChapter) {
      return Promise.resolve();
    } else {
      // Return a promise that resolves when  ajax request for getting missing codex chapter completes
      return new Promise(function (resolve, reject) {
        var request = $.ajax({
          url: process.env.API_URL + '/api/me/inventory/codex/missing',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          resolve(response);
        }.bind(this));

        request.fail(function (response) {
          var error = 'Acquiring missing codex chapters request failed';
          EventBus.getInstance().trigger(EVENTS.ajax_error, error);

          reject(new Error(error));
        });
      }.bind(this));
    }
  },

  getUnlockedCodexChapter: function (chapterId) {
    return this.codexChaptersCollection.get(chapterId);
  },

  hasUnlockedCodexChapter: function (chapterId) {
    var codexChapterData = SDK.Codex.chapterForIdentifier(chapterId);
    return (codexChapterData != null && (codexChapterData.gamesRequiredToUnlock == null || codexChapterData.gamesRequiredToUnlock == 0))
            || this.getUnlockedCodexChapter(chapterId) != null;
  },

  /**
   * Get a collection of disenchant promos. This collection is LAZY intialized so may not be SYNCED at this point. Use onSyncOrReady promise on the collection to make sure it's ready.
   * @public
   * @return {DuelystFirebase.Collection} The disechant promos collection
   */
  getDisenchantPromosCollection: function () {
    if (!this._disenchantPromosCollection) {
      this._disenchantPromosCollection = new DuelystFirebase.Collection(null, {
        firebase: process.env.FIREBASE_URL + 'crafting/promos/disenchant',
      });
    }
    return this._disenchantPromosCollection;
  },

  hasAnyBattleMapCosmetics: function () {
    var battleMapCosmetic = this.cosmeticsCollection.find(function (m) {
      var cosmetic = SDK.CosmeticsFactory.cosmeticForIdentifier(m.get('id'));
      return cosmetic && cosmetic.typeId === SDK.CosmeticsTypeLookup.BattleMap;
    });
    if (battleMapCosmetic) {
      return true;
    } else {
      return false;
    }
  },

  /* endregion GETTERS / SETTERS */

});
