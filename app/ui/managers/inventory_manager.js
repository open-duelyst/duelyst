// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _InventoryManager = {};
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

const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const UserDecksCollection = require('app/ui/collections/user_decks');
const Analytics = require('app/common/analytics');
const AnalyticsTracker = require('app/common/analyticsTracker');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const Session = require('app/common/session2');
const moment = require('moment');
const i18next = require('i18next');
const NavigationManager = require('./navigation_manager');
const NewPlayerManager = require('./new_player_manager');
const ProgressionManager = require('./progression_manager');
const GameDataManager = require('./game_data_manager');
const ProfileManager = require('./profile_manager');
const Manager = require('./manager');

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

  initialize(options) {
    this._cached_hasAnyCardsOfFaction = [];

    Manager.prototype.initialize.call(this);
  },

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');

        this.walletModel = new DuelystFirebase.Model(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/wallet`,
        });

        this.boosterPacksCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/spirit-orbs`,
        });

        this.arenaTicketsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/gauntlet-tickets`,
        });

        this.riftTicketsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/rift-tickets`,
        });

        this.cardsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/card-collection`,
        });

        this.cardLoreCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/card-lore`,
        });
        this.cardLoreReadRequests = [];

        this.decksCollection = new UserDecksCollection();
        this.decksCollection.fetch();

        this.cosmeticsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/cosmetic-inventory`,
        });

        this.portraitsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/portraits`,
        });

        this.codexChaptersCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/codex`,
        });

        this.totalOrbCountModel = new DuelystFirebase.Model(null, {
          firebase: `${process.env.FIREBASE_URL}user-inventory/${userId}/spirit-orb-total`,
        });

        this.onReady().then(() => {
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
          ]).then(() => {
            // Check if player is missing codex chapters they should have earned once progression manager is ready
            this.checkForMissingCodexChapters();

            const invalidDeckModels = [];
            this.decksCollection.each((deckModel) => {
              const deckFactionId = deckModel.get('faction_id');
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
            });

            // remove all invalid decks
            this.decksCollection.remove(invalidDeckModels);
          });
        });

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

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.walletModel = null;
    this.boosterPacksCollection = null;
    this.cardsCollection = null;
    this.decksCollection = null;
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onWalletChange() {
    Logger.module('UI').log('InventoryManager::onWalletChange()');
    this.trigger(EVENTS.wallet_change, { model: this.walletModel });
  },

  onBoosterPackCollectionChange() {
    Logger.module('UI').log('InventoryManager::onBoosterPackCollectionChange()');
    this.trigger(EVENTS.booster_pack_collection_change, { collection: this.boosterPacksCollection });
  },

  onCardsCollectionCardAdded(addedCardModel) {
    Logger.module('UI').log('InventoryManager::onCardsCollectionCardAdded()');
    if (addedCardModel) {
      const cardId = addedCardModel.id;
      this._updateLocalCardCacheWithCardInventoryCount(cardId, addedCardModel.get('count'));
    }

    this.trigger(EVENTS.cards_collection_change, { model: addedCardModel, collection: this.cardsCollection });
  },

  onCardsCollectionCardRemoved(removedCardModel) {
    Logger.module('UI').log('InventoryManager::onCardsCollectionCardRemoved()');
    if (removedCardModel) {
      const cardId = removedCardModel.id;
      this._updateLocalCardCacheWithCardInventoryCount(cardId, 0);
    }

    this.trigger(EVENTS.cards_collection_change, { model: removedCardModel, collection: this.cardsCollection });
  },

  onCardsCollectionChange(changedInventoryModel) {
    Logger.module('UI').log('InventoryManager::onCardsCollectionChange()');
    if (changedInventoryModel) {
      const cardId = changedInventoryModel.id;
      const cardCollectionModel = this.cardsCollection.get(cardId);
      const cardWasRemoved = cardCollectionModel == null;
      const inventoryCountChanged = changedInventoryModel.hasChanged('count') || cardWasRemoved;
      // if inventory count of this card has changed or reduced to 0
      if (inventoryCountChanged) {
        const newInventoryCount = cardWasRemoved ? 0 : changedInventoryModel.get('count');
        this._updateLocalCardCacheWithCardInventoryCount(cardId, newInventoryCount);
      }
    } else {
      // because this could fire before game data is ready
      GameDataManager.getInstance().onReady().then(() => {
        // sync all cards
        this.cardsCollection.each((inventoryCardModel) => {
          const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.id);
          if (gameDataCardModel != null) {
            gameDataCardModel.set('inventoryCount', inventoryCardModel.get('count'));
          }
        });

        // update unlocked/crafting state for all cards
        GameDataManager.getInstance().getVisibleCardsCollection().updateCardsCount();

        // sync all decks
        this.decksCollection.each((deckModel) => {
          deckModel.updatePropertiesFromCardModels();
        });
      });
    }

    this.trigger(EVENTS.cards_collection_change, { model: changedInventoryModel, collection: this.cardsCollection });
  },

  _updateLocalCardCacheWithCardInventoryCount(cardId, newInventoryCount) {
    // because this could fire before game data is ready
    if (GameDataManager.getInstance().getIsReady()) {
      this._updateLocalCardCacheWithCardInventoryCountWhenGameDataReady(cardId, newInventoryCount);
    } else {
      GameDataManager.getInstance().onReady().then(() => {
        this._updateLocalCardCacheWithCardInventoryCountWhenGameDataReady(cardId, newInventoryCount);
      });
    }
  },

  _updateLocalCardCacheWithCardInventoryCountWhenGameDataReady(cardId, newInventoryCount) {
    // update card and any decks it is in
    const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
    if (gameDataCardModel != null) {
      // clear cache
      const factionId = gameDataCardModel.get('factionId');
      if (factionId != null) {
        this._cached_hasAnyCardsOfFaction[factionId] = null;
      }

      // update counts
      gameDataCardModel.set('inventoryCount', newInventoryCount);

      // update unlocked/crafting state for all cards
      GameDataManager.getInstance().getVisibleCardsCollection().updateCardsCount();

      // update decks
      this.decksCollection.each((deckModel) => {
        const changed = deckModel.updateCard(gameDataCardModel);

        // force deck to save due to automatic change
        if (changed) {
          deckModel.save();
        }
      });
    }
  },

  onCardLoreCollectionChange(loreModel) {
    Logger.module('UI').log('InventoryManager::onCardLoreCollectionChange');
    this.onCardLoreCollectionChangeForCardId(loreModel && loreModel.get('card_id'));
  },

  onCardLoreCollectionChangeForCardId(cardId) {
    if (cardId != null) {
      // remove from read requests
      const index = _.indexOf(this.cardLoreReadRequests, cardId);
      if (index !== -1) {
        this.cardLoreReadRequests.splice(index, 1);
      }

      // trigger change event
      this.trigger(EVENTS.card_lore_collection_change, { card_id: cardId, collection: this.cardLoreCollection });
    }
  },

  onDecksCollectionChange(deckModel) {
    Logger.module('UI').log('InventoryManager::onDecksCollectionChange');
    this.trigger(EVENTS.decks_collection_change, { model: deckModel, collection: this.decksCollection });
  },

  onCosmeticsCollectionChange(cosmeticModel) {
    const cosmeticId = cosmeticModel && cosmeticModel.get('id');
    Logger.module('UI').log('InventoryManager::onCosmeticsCollectionChange()', cosmeticId, this.hasCosmeticById(cosmeticId), SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId), cosmeticModel);
    if (cosmeticId != null && SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
      const cardId = SDK.Cards.getCardIdForCardSkinId(cosmeticId);
      let newInventoryCount;
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

  onOrbCountCollectionChange(orbCountModel) {
    this.trigger(EVENTS.orb_count_collection_change, { model: orbCountModel, collection: this.totalOrbCountModel });
  },

  /* endregion EVENTS */

  /* region ACTIONS */

  markCardAsReadInCollection(cardId) {
    const inventoryCardModel = this.cardsCollection.get(cardId);
    if (inventoryCardModel != null && inventoryCardModel.get('is_unread')) {
      inventoryCardModel.set('is_unread', false);
      inventoryCardModel.set('is_new', false);
      $.ajax({
        data: JSON.stringify({ read_at: moment().utc() }),
        url: `${process.env.API_URL}/api/me/inventory/card_collection/${cardId}/read_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }
  },

  dismissAllUnreadCards() {
    this.cardsCollection.each((inventoryCardModel) => {
      if (inventoryCardModel.get('is_unread')) {
        inventoryCardModel.set('is_unread', false);
        inventoryCardModel.set('is_new', false);
      }
    });

    $.ajax({
      data: JSON.stringify({ read_at: moment().utc() }),
      url: `${process.env.API_URL}/api/me/inventory/card_collection/read_all`,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
    });
  },

  markCardLoreAsReadInCollection(cardId) {
    const cardLoreModel = this.cardLoreCollection.get(cardId);
    let isUnread;
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
        this.cardLoreCollection.each((cardLoreModel) => {
          if (cardLoreModel != null && cardLoreModel.get('baseCardId') === cardId) {
            cardLoreModel.set('is_unread', false);
          }
        });
      }
      $.ajax({
        data: JSON.stringify({ read_at: moment().utc() }),
        url: `${process.env.API_URL}/api/me/inventory/card_lore_collection/${cardId}/read_lore_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      }).fail(() => {
        // trigger change on failure to remove request and update ui
        this.onCardLoreCollectionChangeForCardId(cardId);
      });
    }
  },

  buyBoosterPacksWithGold(numBoosterPacks, cardSetId) {
    if (numBoosterPacks == null || isNaN(numBoosterPacks) || numBoosterPacks <= 0) { numBoosterPacks = 1; }
    if (cardSetId == null) { cardSetId = SDK.CardSet.Core; }
    if (this.walletModel.get('gold_amount') >= numBoosterPacks * ORB_GOLD_COST) {
      NewPlayerManager.getInstance().setHasPurchasedBoosterPack();

      return new Promise((resolve, reject) => {
        const request = $.ajax({
          data: JSON.stringify({
            qty: numBoosterPacks,
            card_set_id: cardSetId,
            currency_type: 'soft',
          }),
          url: `${process.env.API_URL}/api/me/inventory/spirit_orbs`,
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          Analytics.track('spirit orb purchased with gold', {
            category: Analytics.EventCategory.SpiritOrbs,
          });
          resolve(response);
        });

        request.fail((response) => {
          const errorMessage = response.responseJSON && response.responseJSON.message || 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      });
    }
    return Promise.reject('Not enough gold.');
  },

  purchaseProductWithPremiumCurrency(sku, saleData) {
    if (sku) {
      let saleId = null;
      if (saleData != null && saleData.saleId) {
        saleId = saleData.saleId;
      }
      return new Promise((resolve, reject) => {
        const request = $.ajax({
          data: JSON.stringify({
            product_sku: sku,
            sale_id: saleId,
          }),
          url: `${process.env.API_URL}/api/me/shop/premium_purchase`,
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          resolve(response);
        });

        request.fail((response) => {
          const errorMessage = response.responseJSON && response.responseJSON.message || 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      });
    }
    return Promise.reject('No purchase method provided.');
  },

  purchaseProductSku(sku, cardToken) {
    if (this.walletModel.get('card_last_four_digits') || cardToken) {
      NewPlayerManager.getInstance().setHasPurchasedBoosterPack();

      return new Promise((resolve, reject) => {
        const request = $.ajax({
          data: JSON.stringify({ product_sku: sku, card_token: cardToken }),
          url: `${process.env.API_URL}/api/me/shop/purchase`,
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          resolve(response);
        });

        request.fail((response) => {
          const errorMessage = response.responseJSON && response.responseJSON.message || 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      });
    }
    return Promise.reject('No purchase method provided.');
  },

  purchaseProductSkuOnSteam(sku, steamTicket) {
    if (steamTicket !== null) {
      return new Promise((resolve, reject) => {
        const request = $.ajax({
          data: JSON.stringify({ product_sku: sku, steam_ticket: steamTicket }),
          url: `${process.env.API_URL}/steam/init_txn`,
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });
        request.done((response) => {
          resolve(response);
        });
        request.fail((response) => {
          const errorMessage = 'Purchase failed. Please try again.';
          reject(errorMessage);
        });
      });
    }
    return Promise.reject('No steam ticket provided.');
  },

  craftCosmetic(cosmeticId) {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/inventory/cosmetics/${cosmeticId}`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });
      request.done((response) => {
        resolve(response);
      });
      request.fail((response) => {
        const errorMessage = response.responseJSON && response.responseJSON.message || i18next.t('cosmetics.cosmetic_crafting_error_msg');
        reject(errorMessage);
      });
    });
  },

  unlockBoosterPack(boosterPackId) {
    if (this.boosterPacksCollection.length > 0) {
      return new Promise((resolve, reject) => {
        if (!boosterPackId) boosterPackId = this.boosterPacksCollection.at(0).get('id');

        const request = $.ajax({
          url: `${process.env.API_URL}/api/me/inventory/spirit_orbs/opened/${boosterPackId}`,
          type: 'PUT',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          if (response && response.cards) {
            let rarityIds = _.map(response.cards, (cardId) => {
              const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.current());
              return sdkCard.getRarityId();
            });
            rarityIds = rarityIds.sort();
            const spiritValue = _.reduce(rarityIds, (memo, rarityId) => memo + SDK.RarityFactory.rarityForIdentifier(rarityId).spiritCost, 0);
            const raritySplit = JSON.stringify(rarityIds);

            let isFirst = 0;
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

        request.fail((response) => {
          let errorMessage = response.responseJSON && response.responseJSON.message;
          errorMessage = errorMessage || (response.responseJSON && response.responseJSON.error);
          errorMessage = errorMessage || 'Booster pack unlock failed';
          reject(errorMessage);
        });
      });
    }
    return Promise.reject('No boosters to open.');
  },

  craftCard(cardId) {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/inventory/card_collection/${cardId}`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        Logger.module('UI').log(`InventoryManager::craftCard() ${cardId}`);

        const newPlayerManager = NewPlayerManager.getInstance();
        if (!newPlayerManager.getHasCraftedCard()) {
          newPlayerManager.setHasCraftedCard(cardId);
        }

        Analytics.track('crafted card', {
          category: Analytics.EventCategory.Inventory,
          card_id: cardId,
        });

        resolve(response);
      });

      request.fail((response) => {
        const errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Craft failed.';
        reject(errorMessage);
      });
    });
  },

  disenchantCards(cardIds) {
    return new Promise((resolve, reject) => {
      const group = _.groupBy(cardIds, (o) => o);
      let hasEnoughCards = true;
      _.each(group, (cardArray, cardId, list) => {
        const inventoryCardModel = this.cardsCollection.get(parseInt(cardId));
        if (inventoryCardModel && inventoryCardModel.get('count') < cardArray.length) {
          hasEnoughCards = false;
        }
      });

      if (hasEnoughCards) {
        const request = $.ajax({
          data: JSON.stringify({ card_ids: cardIds }),
          url: `${process.env.API_URL}/api/me/inventory/card_collection`,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          Logger.module('UI').log(`InventoryManager::disenchantCards() -> ${JSON.stringify(response)}`);

          resolve(response);
        });

        request.fail((response) => {
          const errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Disenchant failed.';
          reject(errorMessage);
        });
      } else {
        const errorMessage = 'You do not have enough copies of all the cards you are trying to disenchant.';
        reject(errorMessage);
      }
    });
  },

  disenchantDuplicateCards() {
    return new Promise((resolve, reject) => {
      const cardIds = [];
      this.cardsCollection.each((inventoryCardModel) => {
        if (inventoryCardModel.get('count') > 3) {
          const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.id);
          if (gameDataCardModel != null && gameDataCardModel.get('isCraftable')) {
            for (let i = 0; i < inventoryCardModel.get('count') - 3; i++) {
              cardIds.push(inventoryCardModel.id);
            }
          }
        }
      });

      if (cardIds.length > 0) {
        const request = $.ajax({
          url: `${process.env.API_URL}/api/me/inventory/card_collection/duplicates`,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          Logger.module('UI').log(`InventoryManager::disenchantCards() -> ${JSON.stringify(response)}`);

          resolve(response);
        });

        request.fail((response) => {
          const errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Disenchant failed.';
          reject(errorMessage);
        });
      } else {
        reject('No duplicate cards to disenchant.');
      }
    });
  },

  /* endregion ACTIONS */

  /* region GETTERS / SETTERS */

  getWalletModel() {
    return this.walletModel;
  },

  getWalletModelGoldAmount() {
    const walletModel = this.getWalletModel();
    if (walletModel != null && walletModel.get('gold_amount') != null) {
      return walletModel.get('gold_amount');
    }
    return 0;
  },

  getWalletModelSpiritAmount() {
    const walletModel = this.getWalletModel();
    if (walletModel != null && walletModel.get('spirit_amount') != null) {
      return walletModel.get('spirit_amount');
    }
    return 0;
  },

  getWalletModelPremiumAmount() {
    const walletModel = this.getWalletModel();
    if (walletModel != null && walletModel.get('premium_amount') != null) {
      return walletModel.get('premium_amount');
    }
    return 0;
  },

  getBoosterPacksCollection() {
    return this.boosterPacksCollection;
  },

  getBoosterPacksBySet(cardSetId) {
    if (this.boosterPacksCollection == null || this.boosterPacksCollection.models == null) {
      return 0;
    }
    return this.boosterPacksCollection.filter((p) => p.get('card_set') === cardSetId || (!p.get('card_set') && cardSetId === SDK.CardSet.Core));
  },

  getArenaTicketsCollection() {
    return this.arenaTicketsCollection;
  },

  getCardsCollection() {
    return this.cardsCollection;
  },

  hasAnyCardsOfFaction(factionId) {
    // attempt to use cached result
    const hasAnyCardsOfFaction = this._cached_hasAnyCardsOfFaction[factionId];
    if (hasAnyCardsOfFaction != null) {
      return hasAnyCardsOfFaction;
    }
    // find first card from faction
    let cardOfFaction = this.cardsCollection.find((inventoryCardModel) => {
      const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.get('id'));
      return gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId;
    });

    // if no cards owned, check for skins
    if (cardOfFaction == null) {
      cardOfFaction = this.cosmeticsCollection.find((cosmeticModel) => {
        const cosmeticId = cosmeticModel.get('id');
        if (SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
          const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(SDK.Cards.getCardIdForCardSkinId(cosmeticId));
          return gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId;
        }
      });
    }

    // cache result
    const hasAnyCards = this._cached_hasAnyCardsOfFaction[factionId] = cardOfFaction != null;

    return hasAnyCards;
  },

  getRemainingBloodbornPacks() {
    const bloodbornSetData = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Bloodborn);
    const maxBloodbornOrbs = bloodbornSetData.numOrbsToCompleteSet;
    if (this.totalOrbCountModel != null) {
      const bloodbornOrbsTotal = this.totalOrbCountModel.get(SDK.CardSet.Bloodborn) || 0;
      return Math.max(maxBloodbornOrbs - bloodbornOrbsTotal, 0);
    }
    // Default to max, allow server logic to deny if something goes wrong
    return maxBloodbornOrbs;
  },

  canBuyBloodbornPacks() {
    return (this.getRemainingBloodbornPacks() > 0);
  },

  canBuyPacksForCardSet(cardSetId) {
    if (cardSetId == SDK.CardSet.Bloodborn) {
      return this.canBuyBloodbornPacks();
    } if (cardSetId == SDK.CardSet.Unity) {
      return this.canBuyAncientBondsPacks();
    }
    return true;
  },

  getRemainingAncientBondsPacks() {
    const ancientBondsSetData = SDK.CardSetFactory.cardSetForIdentifier(SDK.CardSet.Unity);
    const maxAncientBondsOrbs = ancientBondsSetData.numOrbsToCompleteSet;
    if (this.totalOrbCountModel != null) {
      const ancientBondsOrbsTotal = this.totalOrbCountModel.get(SDK.CardSet.Unity) || 0;
      return Math.max(maxAncientBondsOrbs - ancientBondsOrbsTotal, 0);
    }
    // Default to max, allow server logic to deny if something goes wrong
    return maxAncientBondsOrbs;
  },

  canBuyAncientBondsPacks() {
    return (this.getRemainingAncientBondsPacks() > 0);
  },

  getDecksCollection() {
    return this.decksCollection;
  },

  hasValidCustomDecks() {
    return this.decksCollection.filter((deckModel) => deckModel.isValid()).length > 0;
  },

  getCosmeticsCollection() {
    return this.cosmeticsCollection;
  },

  getCosmeticById(cosmeticId) {
    return this.cosmeticsCollection.get(cosmeticId);
  },

  hasCosmeticById(cosmeticId) {
    return this.getCosmeticById(cosmeticId) != null;
  },

  getCanSeeCosmeticById(cosmeticId) {
    const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && (cosmeticData.alwaysVisible || this.hasCosmeticById(cosmeticId));
  },

  getCanUseCosmeticById(cosmeticId) {
    const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && ((!cosmeticData.purchasable && !cosmeticData.unlockable) || this.hasCosmeticById(cosmeticId));
  },

  getCanAlwaysUseCosmeticById(cosmeticId) {
    const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && !cosmeticData.purchasable && !cosmeticData.unlockable;
  },

  getCanPurchaseCosmeticById(cosmeticId) {
    const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(cosmeticId);
    if (cosmeticData == null) {
      // doesn't exist
      return false;
    }

    return cosmeticData.enabled && cosmeticData.purchasable && !this.hasCosmeticById(cosmeticId);
  },

  getPortraitsCollection() {
    return this.portraitsCollection;
  },

  hasCollectionDuplicates() {
    const duplicateCard = this.cardsCollection.find((card) => {
      const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(card.get('id'));
      return gameDataCardModel != null && gameDataCardModel.get('isCraftable') && card.get('count') > 3;
    });

    return duplicateCard != null;
  },

  isCardUnread(cardId) {
    const inventoryCardModel = this.cardsCollection.get(cardId);
    return (inventoryCardModel != null && inventoryCardModel.get('is_unread')) || false;
  },

  hasUnreadCards() {
    const unreadCard = this.cardsCollection.find((inventoryCardModel) => inventoryCardModel.get('is_unread'));

    return unreadCard != null;
  },

  getTotalUnreadCardCount() {
    let unreadCount = 0;
    this.cardsCollection.each((inventoryCardModel) => {
      if (inventoryCardModel.get('is_unread') && GameDataManager.getInstance().getVisibleCardModelById(inventoryCardModel.id) != null) {
        unreadCount += 1;
      }
    });

    return unreadCount;
  },

  getUnreadCardCountForFaction(factionId) {
    let unreadCount = 0;
    this.cardsCollection.each((inventoryCardModel) => {
      if (inventoryCardModel.get('is_unread')) {
        const cardId = inventoryCardModel.id;
        const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
        if (gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId) {
          unreadCount += 1;
        }
      }
    });

    return unreadCount;
  },

  isCardLoreUnread(cardId) {
    if (!this.isCardLoreVisible(cardId)) {
      return false;
    }

    const cardLoreModel = this.cardLoreCollection.get(cardId);
    if (cardLoreModel == null) {
      return !_.contains(this.cardLoreReadRequests, cardId);
    }
    return cardLoreModel.get('is_unread');
  },

  isCardLoreVisible(cardId) {
    // lore for cards that users don't own isn't visible
    const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
    return gameDataCardModel != null && gameDataCardModel.get('inventoryCount') > 0 && ProgressionManager.getInstance().isFactionUnlocked(gameDataCardModel.get('factionId'));
  },

  hasUnreadCardLore() {
    const allLore = SDK.CardLore.getAllLore();
    for (let i = 0, il = allLore.length; i < il; i++) {
      const lore = allLore[i];
      const cardId = lore.id;
      if (this.isCardLoreUnread(cardId)) {
        return true;
      }
    }
    return false;
  },

  getTotalUnreadCardLoreCount() {
    let unreadCount = 0;

    const allLore = SDK.CardLore.getAllLore();
    for (let i = 0, il = allLore.length; i < il; i++) {
      const lore = allLore[i];
      const cardId = lore.id;
      if (this.isCardLoreUnread(cardId)) {
        unreadCount += 1;
      }
    }

    return unreadCount;
  },

  getUnreadCardLoreCountForFaction(factionId) {
    let unreadCount = 0;

    const allLore = SDK.CardLore.getAllLore();
    for (let i = 0, il = allLore.length; i < il; i++) {
      const lore = allLore[i];
      const cardId = lore.id;
      if (this.isCardLoreUnread(cardId)) {
        const gameDataCardModel = GameDataManager.getInstance().getVisibleCardModelById(cardId);
        if (gameDataCardModel != null && gameDataCardModel.get('factionId') == factionId) {
          unreadCount += 1;
        }
      }
    }

    return unreadCount;
  },

  isFreeCardOfTheDayAvailable() {
    const startOfToday = moment.utc().startOf('day');
    const lastClaimedAtDay = this.getFreeCardOfTheDayLastClaimedAt().startOf('day');
    return lastClaimedAtDay.isBefore(startOfToday);
  },

  getFreeCardOfTheDayLastClaimedAt() {
    const lastClaimedAt = ProfileManager.getInstance().get('free_card_of_the_day_claimed_at') || 0;
    return moment.utc(lastClaimedAt);
  },

  getUnusedRiftTicketModels() {
    if (this.riftTicketsCollection == null || this.riftTicketsCollection.models == null || this.riftTicketsCollection.models.length == 0) {
      return [];
    }
    return this.riftTicketsCollection.models;
  },

  hasUnusedRiftTicket() {
    return this.getUnusedRiftTicketModels().length != 0;
  },

  claimFreeCardOfTheDay() {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/inventory/free_card_of_the_day`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });
      request.done((response) => {
        resolve(response);
      });
      request.fail((response) => {
        const error = 'There was an error processing your request';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error(error));
      });
    });
  },

  /**
   * Checks against gamecount if a player is missing any codex chapter and calls an api route to award them if they are
   * @return {Promise} $.ajax promise for the server call to acquire missing chapters
   */
  checkForMissingCodexChapters() {
    if (!NewPlayerManager.getInstance().isReady || !ProgressionManager.getInstance().isReady || !this.isReady) {
      // In case we try to fire this before any of the required managers are ready, ignore the request, it will get called on ready anyways
      return Promise.resolve();
    }

    const newPlayerManager = NewPlayerManager.getInstance();
    if (!newPlayerManager.canSeeCodex()) {
      return Promise.resolve();
    }

    let missingACodexChapter = false;
    const earnedCodexChapterIds = SDK.Codex.chapterIdsOwnedByGameCount(ProgressionManager.getInstance().getGameCount());

    for (let i = 0; i < earnedCodexChapterIds.length; i++) {
      const earnedCodexChapterId = earnedCodexChapterIds[i];
      const chapterModel = this.codexChaptersCollection.get(earnedCodexChapterId);
      if (chapterModel == null) {
        missingACodexChapter = true;
        break;
      }
    }

    if (!missingACodexChapter) {
      return Promise.resolve();
    }
    // Return a promise that resolves when  ajax request for getting missing codex chapter completes
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/inventory/codex/missing`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        resolve(response);
      });

      request.fail((response) => {
        const error = 'Acquiring missing codex chapters request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);

        reject(new Error(error));
      });
    });
  },

  getUnlockedCodexChapter(chapterId) {
    return this.codexChaptersCollection.get(chapterId);
  },

  hasUnlockedCodexChapter(chapterId) {
    const codexChapterData = SDK.Codex.chapterForIdentifier(chapterId);
    return (codexChapterData != null && (codexChapterData.gamesRequiredToUnlock == null || codexChapterData.gamesRequiredToUnlock == 0))
            || this.getUnlockedCodexChapter(chapterId) != null;
  },

  /**
   * Get a collection of disenchant promos. This collection is LAZY intialized so may not be SYNCED at this point. Use onSyncOrReady promise on the collection to make sure it's ready.
   * @public
   * @return {DuelystFirebase.Collection} The disechant promos collection
   */
  getDisenchantPromosCollection() {
    if (!this._disenchantPromosCollection) {
      this._disenchantPromosCollection = new DuelystFirebase.Collection(null, {
        firebase: `${process.env.FIREBASE_URL}crafting/promos/disenchant`,
      });
    }
    return this._disenchantPromosCollection;
  },

  hasAnyBattleMapCosmetics() {
    const battleMapCosmetic = this.cosmeticsCollection.find((m) => {
      const cosmetic = SDK.CosmeticsFactory.cosmeticForIdentifier(m.get('id'));
      return cosmetic && cosmetic.typeId === SDK.CosmeticsTypeLookup.BattleMap;
    });
    if (battleMapCosmetic) {
      return true;
    }
    return false;
  },

  /* endregion GETTERS / SETTERS */

});
