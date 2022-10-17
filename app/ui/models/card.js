'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');

var CardModel = Backbone.Model.extend({

  initialize: function () {
    this.on('change:card', this.onCardChanged, this);
    this.onCardChanged();
  },

  onCardChanged: function () {
    // create basic searchable content
    var searchableContent = this.get('name');
    searchableContent += ' ' + this.get('description');
    searchableContent += ' ' + this.get('raceName');
    searchableContent += ' ' + this.get('rarityName');
    if (this.get('isEntity')) {
      searchableContent += ' minion unit';
      if (this.get('isGeneral')) {
        searchableContent += ' general';
      }
    } else if (this.get('isSpell')) {
      searchableContent += ' spell';
    } else if (this.get('isArtifact')) {
      searchableContent += ' artifact';
    }

    if (this.get('isPrismatic')) {
      searchableContent += ' prismatic';
    }

    // add card set data
    var cardSetData = SDK.CardSetFactory.cardSetForIdentifier(this.get('cardSetId'));
    if (cardSetData != null) {
      searchableContent += ' ' + (cardSetData.title || '') + ' ' + (cardSetData.name || '') + ' ' + (cardSetData.devName || '');

      this.set({
        cardSetName: cardSetData.name,
      });
    }

    // extract keywords from card
    var card = this.get('card');
    var keywordDescriptionsArray = [];
    if (card) {
      var keywordClasses = card.getKeywordClasses();
      for (var i = 0; i < keywordClasses.length; i++) {
        var keywordClass = keywordClasses[i];
        var keywordName = keywordClass.getName();
        var keywordDescription = keywordClass.getKeywordDefinition();
        var keywordData = {
          name: keywordName,
          description: keywordDescription,
        };
        searchableContent += ' ' + keywordName + ' ' + keywordDescription;
        if (!keywordClass.isHiddenToUI) {
          keywordDescriptionsArray.push(keywordData);
        }
      }
    }

    // replace tabs and double spaces with single spaces
    searchableContent = searchableContent.replace(/\t/g, ' ').replace(/\s+/g, ' ');

    // update model
    this.set({
      keywordDescriptions: keywordDescriptionsArray,
      searchableContent: searchableContent,
    });
  },

  getCardDataForDeck: function () {
    return {
      id: this.get('id'),
    };
  },

  defaults: {
    atk: null,
    baseCardId: 0,
    card: null,
    count: 0,
    deckCount: 0,
    description: '',
    factionId: 0,
    factionName: 'Neutral',
    hp: null,
    id: 0,
    isArtifact: false,
    isAvailable: true,
    isCraftable: true,
    isEntity: false,
    isGeneral: false,
    isHiddenInCollection: false,
    isNeutral: true,
    inventoryCount: 0,
    isPrismatic: false,
    isSpell: false,
    isTile: false,
    isUnit: false,
    isUnlocked: true,
    isUnlockable: false,
    isUnlockableThroughProgression: false,
    isUnlockableBasic: false,
    isUnlockablePrismaticBasic: false,
    isUnlockablePrismaticWithAchievement: false,
    isUnlockableWithAchievement: false,
    keywordDescriptions: [],
    manaCost: 0,
    name: 'Card',
    raceName: '',
    rarityColor: null,
    rarityId: 0,
    rarityName: '',
    rarityIsCraftable: false,
    showRarity: true,
    searchableContent: '',
    type: 'Card',
    unlockMessage: null,
    unlocksAtLevel: null,
    unlocksWithFaction: null,
    unlocksWithFactionName: null,
  },
});

module.exports = CardModel;
