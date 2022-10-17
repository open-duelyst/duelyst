var _GameDataManager = {};
_GameDataManager.instance = null;
_GameDataManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new GameDataManager();
  }
  return this.instance;
};
_GameDataManager.current = _GameDataManager.getInstance;

module.exports = _GameDataManager;

var Promise = require('bluebird');
var Logger = require('app/common/logger');
var UtilsEnv = require('app/common/utils/utils_env');
var CardsCollection = require('app/ui/collections/cards');
var FactionsCollection = require('app/ui/collections/factions');
var Manager = require('./manager');
var InventoryManager = require('./inventory_manager');
var ProgressionManager = require('./progression_manager');

var GameDataManager = Manager.extend({

  cardsCollection: null,
  visibleCardsCollection: null,
  factionsCollection: null,
  visibleFactionsCollection: null,

  onBeforeConnect: function () {
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

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.cardsCollection = null;
    this.factionsCollection = null;
  },

  onInventoryReady: function () {
    // add all cards
    this.cardsCollection.addAllCardsToCollection();

    // get all factions
    this.factionsCollection.addAllFactionsToCollection();

    // modify factions to cache cards and check availability
    this.factionsCollection.each(function (factionModel) {
      var factionCards = this.cardsCollection.where({ factionId: factionModel.get('id') });
      factionModel.set('cards', factionCards);

      // record fully enabled faction
      var isAvailable = !factionModel.get('isInDevelopment');
      if (isAvailable) {
        var visibleFactionModel = factionModel.clone();
        var visibleCards = [];
        _.each(factionCards, function (cardModel) {
          // record visible card
          if (!cardModel.get('isHiddenInCollection') && cardModel.get('isAvailable')) {
            visibleCards.push(cardModel);
          }
          // record general in pseudo-faction
          if (cardModel.get('isGeneral')) {
            this.generalsFaction.get('cards').push(cardModel);
          }
        }.bind(this));

        visibleFactionModel.set('cards', visibleCards);
        this.visibleFactionsCollection.add(visibleFactionModel);

        // record fully enabled cards as visible
        this.visibleCardsCollection.add(visibleCards);
      }
    }.bind(this));

    // mark as ready
    this.ready();
  },

  getCardsCollection: function () {
    return this.cardsCollection;
  },

  getCardModelById: function (cardId) {
    return this.cardsCollection && this.cardsCollection.get(cardId);
  },

  getVisibleCardsCollection: function () {
    return this.visibleCardsCollection;
  },

  getVisibleCardModelById: function (cardId) {
    return this.visibleCardsCollection && this.visibleCardsCollection.get(cardId);
  },

  getFactionModelById: function (factionId) {
    return this.factionsCollection && this.factionsCollection.get(factionId);
  },

  getVisibleFactionModelById: function (factionId) {
    return this.visibleFactionsCollection && this.visibleFactionsCollection.get(factionId);
  },

  /**
   * Returns all card models from a faction that match optional filters.
   * @param {String|Number} factionId
   * @param {Object} [filters=null] optional, formatted as key/value map (ex: {type: SDK.CardType.Unit, rarityId: SDK.Rarity.Common})
   * @returns {Array}
     */
  getFactionCardModels: function (factionId, filters) {
    var matchingCardModels = [];

    var factionModel = this.getFactionModelById(factionId);
    if (factionModel != null) {
      var cardModels = factionModel.get('cards');
      if (filters != null) {
        for (var i = 0, il = cardModels.length; i < il; i++) {
          var cardModel = cardModels[i];
          var cardAttributes = cardModel.attributes;
          var matches = true;
          var keys = Object.keys(filters);
          for (var j = 0, jl = keys.length; j < jl; j++) {
            var key = keys[j];
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
