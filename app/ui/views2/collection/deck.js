// pragma PKGS: alwaysloaded

'use strict';

var SDK = require('app/sdk');
var UtilsEnv = require('app/common/utils/utils_env');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var audio_engine = require('app/audio/audio_engine');
var Cards = require('app/sdk/cards/cardsLookupComplete');
var GameDataManager = require('app/ui/managers/game_data_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var DeckTmpl = require('./templates/deck.hbs');
var DeckCardsCompositeView = require('./deck_cards');
var DeckMetadataItemView = require('./deck_metadata');

var DeckLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-deck',
  className: 'deck',
  template: DeckTmpl,

  regions: {
    metadataRegion: { selector: '#app-deck-metadata-region' },
    cardsRegion: { selector: '#app-deck-cards-region' },
  },

  events: {
    'click .deck-import': 'onDeckImport',
    'click .deck-export': 'onDeckExport',
  },

  ui: {
    $deckImportExport: '.deck-import-export',
    $deckCardIds: '.deck-card-ids',
  },

  cardsCompositeView: null,
  metadataItemView: null,

  onRender: function () {
    // if we're in production, remove import/export
    // if (UtilsEnv.getIsInProduction()) {
    //  this.ui.$deckImportExport.remove();
    // }

    // make this element a droppable area
    this.$el.droppable({
      drop: this.onCardDropped.bind(this),
      scope: 'add',
    });
  },

  onShow: function () {
    this.bindDeckModel();

    this.listenTo(this.model, 'sync', this.onDeckSync);
  },

  onDeckSync: function () {
    if (this.model.hasChanged()) {
      this.bindDeckModel();
    }
  },

  bindDeckModel: function () {
    this.metadataItemView = new DeckMetadataItemView({ model: this.model });
    this.metadataItemView.listenTo(this.metadataItemView, 'deck_card_back_selecting', function () { this.trigger('deck_card_back_selecting'); }.bind(this));
    this.metadataRegion.show(this.metadataItemView);

    this.cardsCompositeView = new DeckCardsCompositeView({ collection: this.model.getCardModels() });
    this.cardsCompositeView.listenTo(this.cardsCompositeView, 'childview:select', this.deselectCardView.bind(this));
    this.cardsRegion.show(this.cardsCompositeView);
  },

  onCardDropped: function (event, ui) {
    // don't respond to own cards
    var $draggable = ui.draggable;
    if ($draggable instanceof $ && !$draggable.hasClass('deck-card')) {
      $draggable.trigger('click');
    }
  },

  /* region SELECT */

  selectCard: function (cardModel) {
    // returns whether card was added to deck
    return this.model.addCard(cardModel);
  },

  selectCardView: function (cardView) {
    var changed;
    var cardModel = cardView && cardView.model;
    if (cardModel != null) {
      changed = this.selectCard(cardModel);
      if (changed) {
        this._scrollToAndFlashCardInDeck(cardModel);

        // flash card in collection
        Animations.cssClassAnimation.call(cardView, 'flash-brightness');

        audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
      } else {
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      }
    }
    return changed;
  },

  deselectCard: function (cardModel) {
    // returns whether card was removed from deck
    return this.model.removeCard(cardModel);
  },

  deselectCardView: function (cardView) {
    var changed;
    var cardModel = cardView && cardView.model;
    if (cardModel != null) {
      changed = this.deselectCard(cardModel);
      if (changed) {
        this._scrollToAndFlashCardInDeck(cardModel);
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cardburn.audio, CONFIG.SELECT_SFX_PRIORITY);
      }
    }
    return changed;
  },

  _scrollToAndFlashCardInDeck: function (cardModel) {
    // scroll to card
    var cardId = cardModel.get('id');
    var childCardView = this.cardsCompositeView.children.find(function (childView) {
      if (childView.model.get('id') === cardId) {
        return true;
      }
    });
    if (childCardView != null) {
      var scrollTop = this.cardsRegion.$el.scrollTop();
      var scrollHeight = this.cardsRegion.$el.height();
      var cardTop = childCardView.$el.position().top;
      var cardHeight = childCardView.$el.outerHeight(true);
      var cardBottom = cardTop + cardHeight;
      var scrollBottom = cardBottom - scrollHeight;
      if (scrollTop < scrollBottom) {
        this.cardsRegion.$el.scrollTop(scrollBottom);
      } else if (scrollTop > cardTop) {
        this.cardsRegion.$el.scrollTop(cardTop);
      }

      // flash card in deck
      Animations.cssClassAnimation.call(childCardView, 'flash-brightness');
    }
  },

  /* endregion SELECT */

  /* region IMPORT / EXPORT */

  onDeckImport: function () {
    var val = this.ui.$deckCardIds.val();
    if (val && val.length > 0) {
      // find deck name
      var nameMatch = val.match(/^\[(.*?)\]/);
      if (nameMatch && nameMatch.length > 0) {
        this.model.set('name', nameMatch[1]);
        // if found, set deck name and remove deck name part of deck string
        val = val.split(']')[1];
      }

      // clear the input box
      this.ui.$deckCardIds.val('').popover('destroy');

      // convert card data from base 64 into array of [count:id][count:id]...
      val = atob(val);
      this.model.emptyDeck();
      var cardsData = val.split(',');
      var cardIdsToAdd = [];
      var phantomCardIdsToAdd = [];

      // parse card string into array of card ids
      for (var i = 0; i < cardsData.length; i++) {
        var splitData = cardsData[i].split(':');
        var count = splitData[0];
        var cardId = splitData[1];
        cardId = Cards.getBaseCardId(cardId); // convert card ID to non-prismatic (this should be the deck format default, but just in case!)
        // account for prismatics
        var countBaseCard = 0;
        if (GameDataManager.getInstance().getVisibleCardModelById(cardId)) {
          countBaseCard = GameDataManager.getInstance().getVisibleCardModelById(cardId).get('inventoryCount');
        }
        var countPrismaticCard = 0;
        if (GameDataManager.getInstance().getVisibleCardModelById(Cards.getPrismaticCardId(cardId))) {
          countPrismaticCard = GameDataManager.getInstance().getVisibleCardModelById(Cards.getPrismaticCardId(cardId)).get('inventoryCount');
        }
        for (var j = 0; j < count; j++) {
          if (countPrismaticCard > 0) {
            cardIdsToAdd.push(Cards.getPrismaticCardId(cardId));
            countPrismaticCard--;
          } else if (countBaseCard > 0) {
            cardIdsToAdd.push(cardId);
            countBaseCard--;
          } else {
            phantomCardIdsToAdd.push(cardId);
          }
        }
      }

      // add card ids to create deck
      if (cardIdsToAdd.length > 0) {
        this.model.addCardIds(cardIdsToAdd);
      }
      if (phantomCardIdsToAdd.length > 0) {
        var phantomCardsString = '';
        if (SDK.CardFactory.cardForIdentifier(phantomCardIdsToAdd[0], SDK.GameSession.getInstance())) {
          phantomCardsString = SDK.CardFactory.cardForIdentifier(phantomCardIdsToAdd[0], SDK.GameSession.getInstance()).getName();
        } else {
          phantomCardsString = 'unknown card';
        }
        for (var i = 1; i < phantomCardIdsToAdd.length; i++) {
          if (SDK.CardFactory.cardForIdentifier(phantomCardIdsToAdd[i], SDK.GameSession.getInstance())) {
            phantomCardsString = phantomCardsString + ', ' + SDK.CardFactory.cardForIdentifier(phantomCardIdsToAdd[i], SDK.GameSession.getInstance()).getName();
          } else {
            phantomCardsString = phantomCardsString + ', unknown card';
          }
        }
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'Deck imported but missing cards:', message: '' + phantomCardsString }));
      }
    }
  },

  onDeckExport: function () {
    // deck format = [deck name]count:id,count:id,count:id...
    // deck name is plain text in brackets
    // count:id string is base 64 encoded hash

    // sort card ids by count
    var cardsData = {};
    var cards = this.model.get('cards');
    var generalCardId = 1;
    for (var item in cards) {
      var cardId = cards[item].id;
      cardId = Cards.getBaseCardId(cardId); // always export base card IDs (import will account for prismatics owned when importing deck list)
      var card = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
      if (card.getType() === SDK.CardType.Unit && card.getIsGeneral()) {
        generalCardId = cardId;
      } else {
        if (!cardsData[cardId]) {
          cardsData[cardId] = 1;
        } else {
          cardsData[cardId]++;
        }
      }
    }

    if (generalCardId) {
      // general must always be first card in the list
      var cardString = '1:' + generalCardId;
      // build string count:id,count:id...
      for (var cardData in cardsData) {
        cardString += ',';
        cardString += cardsData[cardData] + ':' + cardData;
      }

      // base 64 hash the deck string
      var cardsEncoded = btoa(cardString);
      // add deck name as plain text in brackets, set hash as value, show popover, then select it
      this.ui.$deckCardIds.val('[' + this.model.get('name') + ']' + cardsEncoded).popover({ trigger: 'focus' }).focus().select();
    }
  },

  /* endregion IMPORT / EXPORT */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckLayout;
