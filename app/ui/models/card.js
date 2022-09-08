const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');

const CardModel = Backbone.Model.extend({

  initialize() {
    this.on('change:card', this.onCardChanged, this);
    this.onCardChanged();
  },

  onCardChanged() {
    // create basic searchable content
    let searchableContent = this.get('name');
    searchableContent += ` ${this.get('description')}`;
    searchableContent += ` ${this.get('raceName')}`;
    searchableContent += ` ${this.get('rarityName')}`;
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
    const cardSetData = SDK.CardSetFactory.cardSetForIdentifier(this.get('cardSetId'));
    if (cardSetData != null) {
      searchableContent += ` ${cardSetData.title || ''} ${cardSetData.name || ''} ${cardSetData.devName || ''}`;

      this.set({
        cardSetName: cardSetData.name,
      });
    }

    // extract keywords from card
    const card = this.get('card');
    const keywordDescriptionsArray = [];
    if (card) {
      const keywordClasses = card.getKeywordClasses();
      for (let i = 0; i < keywordClasses.length; i++) {
        const keywordClass = keywordClasses[i];
        const keywordName = keywordClass.getName();
        const keywordDescription = keywordClass.getKeywordDefinition();
        const keywordData = {
          name: keywordName,
          description: keywordDescription,
        };
        searchableContent += ` ${keywordName} ${keywordDescription}`;
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
      searchableContent,
    });
  },

  getCardDataForDeck() {
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
