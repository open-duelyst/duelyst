const _GameDataManager = {};
_GameDataManager.instance = null;
_GameDataManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new GameDataManager();
  }
  return this.instance;
};
_GameDataManager.current = _GameDataManager.getInstance;

module.exports = _GameDataManager;

const Promise = require('bluebird');
const Logger = require('app/common/logger');
const UtilsEnv = require('app/common/utils/utils_env');
const CardsCollection = require('app/ui/collections/cards');
const FactionsCollection = require('app/ui/collections/factions');
const Manager = require('./manager');
const InventoryManager = require('./inventory_manager');
const ProgressionManager = require('./progression_manager');

var GameDataManager = Manager.extend({

  cardsCollection: null,
  visibleCardsCollection: null,
  factionsCollection: null,
  visibleFactionsCollection: null,

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    // create empty collections
    this.cardsCollection = new CardsCollection();
    this.visibleCardsCollection = new CardsCollection();
    this.factionsCollection = new FactionsCollection();
    this.visibleFactionsCollection = new FactionsCollection();
    this.generalsFaction = new Backbone.Model({
      id: 'generals',
      name: 'Generals',
      cards: [],
    });

    // make sure that inventory and progression manager are done loading because card collection depends on those two
    Promise.all([
      InventoryManager.getInstance().onReady(),
      ProgressionManager.getInstance().onReady(),
    ]).then(this.onInventoryReady.bind(this));
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.cardsCollection = null;
    this.factionsCollection = null;
  },

  onInventoryReady() {
    // add all cards
    this.cardsCollection.addAllCardsToCollection();

    // get all factions
    this.factionsCollection.addAllFactionsToCollection();

    // modify factions to cache cards and check availability
    this.factionsCollection.each((factionModel) => {
      const factionCards = this.cardsCollection.where({ factionId: factionModel.get('id') });
      factionModel.set('cards', factionCards);

      // record fully enabled faction
      const isAvailable = !factionModel.get('isInDevelopment');
      if (isAvailable) {
        const visibleFactionModel = factionModel.clone();
        const visibleCards = [];
        _.each(factionCards, (cardModel) => {
          // record visible card
          if (!cardModel.get('isHiddenInCollection') && cardModel.get('isAvailable')) {
            visibleCards.push(cardModel);
          }
          // record general in pseudo-faction
          if (cardModel.get('isGeneral')) {
            this.generalsFaction.get('cards').push(cardModel);
          }
        });

        visibleFactionModel.set('cards', visibleCards);
        this.visibleFactionsCollection.add(visibleFactionModel);

        // record fully enabled cards as visible
        this.visibleCardsCollection.add(visibleCards);
      }
    });

    // mark as ready
    this.ready();
  },

  getCardsCollection() {
    return this.cardsCollection;
  },

  getCardModelById(cardId) {
    return this.cardsCollection && this.cardsCollection.get(cardId);
  },

  getVisibleCardsCollection() {
    return this.visibleCardsCollection;
  },

  getVisibleCardModelById(cardId) {
    return this.visibleCardsCollection && this.visibleCardsCollection.get(cardId);
  },

  getFactionModelById(factionId) {
    return this.factionsCollection && this.factionsCollection.get(factionId);
  },

  getVisibleFactionModelById(factionId) {
    return this.visibleFactionsCollection && this.visibleFactionsCollection.get(factionId);
  },

  /**
   * Returns all card models from a faction that match optional filters.
   * @param {String|Number} factionId
   * @param {Object} [filters=null] optional, formatted as key/value map (ex: {type: SDK.CardType.Unit, rarityId: SDK.Rarity.Common})
   * @returns {Array}
     */
  getFactionCardModels(factionId, filters) {
    let matchingCardModels = [];

    const factionModel = this.getFactionModelById(factionId);
    if (factionModel != null) {
      const cardModels = factionModel.get('cards');
      if (filters != null) {
        for (let i = 0, il = cardModels.length; i < il; i++) {
          const cardModel = cardModels[i];
          const cardAttributes = cardModel.attributes;
          let matches = true;
          const keys = Object.keys(filters);
          for (let j = 0, jl = keys.length; j < jl; j++) {
            const key = keys[j];
            if (cardAttributes[key] !== filters[key]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            matchingCardModels.push(cardModel);
          }
        }
      } else {
        matchingCardModels = cardModels.slice(0);
      }
    }

    return matchingCardModels;
  },

});
