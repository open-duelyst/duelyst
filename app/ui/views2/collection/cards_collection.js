// pragma PKGS: alwaysloaded

'use strict';

var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var SDK = require('app/sdk');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilsEnv = require('app/common/utils/utils_env');
var UtilsUI = require('app/common/utils/utils_ui');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var audio_engine = require('app/audio/audio_engine');
var CardModel = require('app/ui/models/card');
var ProfileManager = require('app/ui/managers/profile_manager');
var GameDataManager = require('app/ui/managers/game_data_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var CardsCollectionTmpl = require('./templates/cards_collection.hbs');
var CollectionCardCompositeView = require('./collection_card');

var CARD_BACKS_FACTION_ID = 'card_backs';

var CardsCollectionCompositeView = Backbone.Marionette.CompositeView.extend({

  factions: null,
  _browsingMode: false,
  _currentFaction: null,
  _currentShowingCards: null,
  _currentSearchQuery: null,
  _currentPage: null,
  _currentDeck: null,

  id: 'app-cards-collection',
  className: 'card-container-hover-keywords',

  childView: CollectionCardCompositeView,
  childViewContainer: '.cards',

  template: CardsCollectionTmpl,

  ui: {},
  events: {},

  _numCardsPerPage: 0,

  initialize: function () {
    this.model.set('factionsEnabled', new Backbone.Collection());
  },

  /* region LAYOUT */

  onResize: function () {
    // create a test card to get width/height of cards
    if (this._testCardView == null) {
      this._testCardView = new (this.childView)(new CardModel({ id: -1 }));
    }
    this._testCardView.$el.css('position', 'absolute');
    $('body').prepend(this._testCardView.$el);
    var cardWidth = this._testCardView.$el.outerWidth(true);
    var cardHeight = this._testCardView.$el.outerHeight(true);
    this._testCardView.$el.remove();

    // calculate number of cards that can fit in a page
    var width = this.$el.outerWidth();
    var height = this.$el.outerHeight();
    var columns = Math.max(CONFIG.MIN_COLUMNS_CARDS, Math.floor(width / cardWidth));
    var rows = Math.max(CONFIG.MIN_ROWS_CARDS, Math.floor(height / cardHeight));
    this._numCardsPerPage = columns * rows;

    // clear out the existing collection
    this.collection.reset();

    // force fake ids so we can preallocate max card views per page
    for (var i = 0; i < this._numCardsPerPage; i++) {
      this.collection.add(new CardModel({ id: -i }));
    }

    // go to this page again to repopulate cards
    this._gotoPage(this._currentPage);
  },

  /* endregion LAYOUT */

  /* BACKBONE EVENTS */

  onRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });

    this.onResize();
  },

  onDestroy: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    if (this._testCardView != null) {
      this._testCardView.$el.remove();
      this._testCardView = null;
    }
  },

  onBeforeRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onShow: function () {
    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showPrismaticsInCollection', this.onShowPrismaticsInCollectionChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showPrismaticsWhileCrafting', this.onShowPrismaticsInCollectionChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:showSkinsInCollection', this.onShowSkinsInCollectionChanged);
    this.listenTo(ProfileManager.getInstance().profile, 'change:filterCollectionCardSet', this.onFilterCollectionCardSetChanged);
    this.listenTo(InventoryManager.getInstance(), EVENTS.cosmetics_collection_change, this.onCosmeticsCollectionChanged);

    // listen to own events
    this.listenTo(this, 'childview:start_dragging', this.onCardStartDragging);
    this.listenTo(this, 'childview:stop_dragging', this.onCardStopDragging);

    this.$el.droppable({
      drop: this.onCardDropped.bind(this),
      scope: 'remove',
    });

    this.onResize();
    this.animateReveal();
  },

  onShowPrismaticsInCollectionChanged: function () {
    this.showValidCards();
  },

  onShowSkinsInCollectionChanged: function () {
    this.showValidCards();
  },

  onFilterCollectionCardSetChanged: function () {
    this.showValidCards();
  },

  onCosmeticsCollectionChanged: function (event) {
    var model = event && event.model;
    var cosmeticId = model && model.get('id');
    if (cosmeticId != null && SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
      this.showValidCards();
    }
  },

  animateReveal: function () {

    // this.children.each(function(view){
    //   view.setAnimated(false)
    // })
    //
    // var cards = this.$el.find(".card:visible")
    // var delay = 500
    // var animation
    //
    // this.$el.find(".loading-indicator")[0].animate([
    //   {"opacity": 1.0},
    //   {"opacity": 0.0}
    // ], {
    //   duration: 300 * speed,
    //   delay: delay,
    //   fill: 'forwards'
    // })
    //
    // for (var i=0; i<cards.length; i++) {
    //   $(cards[i])
    //     .css('opacity',0)
    //     .css("transform-origin", "50% 50%")
    //   $(cards[i]).parent().css("perspective", "1000px")
    //
    //   var rotateY = (0.5 - Math.random()) * 180
    //   var rotateZ = (0.5 - Math.random()) * 15
    //   var translateZ = -(150 + Math.random() * 100)
    //   var scale = (0.6 + Math.random() * 0.2)
    //
    //   var speed = 1.0;
    //
    //   animation = cards[i].animate([
    //     {"opacity": 0.0, transform: "translateZ(" + translateZ + "px) scale("+scale+") rotateY(" + rotateY + "deg) rotateZ(" + rotateZ + "deg)"},
    //     {"opacity": 1.0, transform: "translateZ(0px) scale(1.0) rotateY(0deg) rotateZ(0deg)"}
    //   ], {
    //     duration: 300 * speed,
    //     delay: delay,
    //     easing: "cubic-bezier(0.11, 0.66, 0.90, 1.00)",
    //     fill: 'forwards'
    //   })
    //   delay += 50 * speed
    //
    // }
    //
    // animation.onfinish = function () {
    //   this.children.each(function(view){
    //     view.setAnimated(true)
    //   })
    // }.bind(this)
  },

  /* DRAG AND DROP */

  onCardDropped: function (event, ui) {
    // don't respond to own cards
    var $draggable = ui.draggable;
    if ($draggable instanceof $ && !$draggable.hasClass('collection-card')) {
      $draggable.trigger('click');
    }
  },

  onCardStartDragging: function (cardItemViewDragging) {
    // force all cards to be non-interactive
    this.children.each(function (cardItemView) {
      if (cardItemView !== cardItemViewDragging) {
        cardItemView.setInteractive(false);
        cardItemView.setDraggable(false);
      }
    }.bind(this));
  },

  onCardStopDragging: function (cardItemViewDragging) {
    // reset all cards interactivity
    this.children.each(function (cardItemView) {
      if (cardItemView !== cardItemViewDragging) {
        cardItemView.setInteractive(true);
        cardItemView.setDraggable(!this._browsingMode);
      }
    }.bind(this));
  },

  /* FACTIONS */

  getCurrentFaction: function () {
    return this._currentFaction;
  },

  getEnabledFactions: function () {
    return this.model.get('factionsEnabled');
  },

  /**
   * Switches the page to the first page of a faction, given that faction's id.
   * @param factionId
   */
  gotoFactionById: function (factionId) {
    var faction = this.model.get('factionsEnabled').get(factionId);
    var currentFaction = this._currentFaction;
    var currentPage = this._currentPage;

    this._showCardsForFaction(faction);

    if (currentFaction !== this._currentFaction || currentPage !== this._currentPage) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    }
  },

  /**
   * Switches the page to the previous faction from the current faction.
   */
  _gotoPreviousFaction: function () {
    var factions = this.model.get('factionsEnabled');
    var currentFactionIndex = factions.indexOf(this._currentFaction);
    var nextFactionIndex = currentFactionIndex - 1;
    if (nextFactionIndex < 0) {
      nextFactionIndex = factions.length - 1;
    }
    this._showCardsForFaction(factions.at(nextFactionIndex), CONFIG.INFINITY);
  },

  /**
   * Switches the page to the next faction from the current faction.
   */
  _gotoNextFaction: function () {
    var factions = this.model.get('factionsEnabled');
    var currentFactionIndex = factions.indexOf(this._currentFaction);
    var nextFactionIndex = (currentFactionIndex + 1) % factions.length;
    this._showCardsForFaction(factions.at(nextFactionIndex));
  },

  /**
   * Shows cards for a specific faction model and optionally from the end of the faction instead of the beginning.
   * @private
   * @param faction
   * @param page
   */
  _showCardsForFaction: function (faction, page) {
    var factions = this.model.get('factionsEnabled');

    // cleanup last cards
    this._currentShowingCards = [];

    // show new
    if (factions.length > 0) {
      if (faction == null) { faction = factions.first(); }
      if (faction != null) {
        // get new collection based on selected faction
        var factionId = faction.get('id');
        var factionEnabled = factions.get(factionId);

        // set new faction
        this._currentFaction = factionEnabled;

        // show cards if faction has been unlocked
        if (factionEnabled != null
          && (factionEnabled.get('id') === CARD_BACKS_FACTION_ID
            || factionEnabled.get('id') === GameDataManager.getInstance().generalsFaction.get('id')
            || ProgressionManager.getInstance().isFactionUnlockedOrCardsOwned(factionId))) {
          // store currently showing cards
          var cardsToShow = factionEnabled.get('cards');
          /*
          if (this._deckCardBackSelectingMode || this._craftingMode || (this._currentDeck != null && process.env.ALL_CARDS_AVAILABLE)) {
            cardsToShow = factionCards;
          } else if (!ProgressionManager.getInstance().isFactionUnlocked(factionId)) {
            // faction is visible in collection but not unlocked
            // which means user must own some cards from that faction
            cardsToShow = _.filter(factionCards, function(cardModel){
              return (cardModel.get("inventoryCount") > 0
                  && (cardModel.get("isGeneral") || cardModel.get("rarityId") !== SDK.Rarity.Fixed))
                || (cardModel.get("isSkinned") && cardModel.get("canShowSkin"))
            });
          } else {
            cardsToShow = _.filter(factionCards, function(cardModel){
              return cardModel.get("inventoryCount") > 0
                || (cardModel.get("isSkinned") && cardModel.get("canShowSkin"));
            });
          }
          */

          this._showCards(cardsToShow, page);
        } else if (factions.length > 1 || (factions.length === 1 && factionId != factions.first().get('id'))) {
          // go to next/previous faction
          if (page != null) {
            this._gotoPreviousFaction();
          } else {
            this._gotoNextFaction();
          }
        }
      }
    } else {
      // reset the page
      this._showCards();
    }
  },

  /**
   * Shows cards from a provided list.
   * @private
   * @param cards
   * @param page
   */
  _showCards: function (cards, page) {
    // store showing cards
    this._currentShowingCards = cards || [];

    // check page
    page = page != null ? Math.min(this.getLastPage(this._currentShowingCards), page) : 0;

    // go to page of current showing cards
    this._gotoPage(page);
  },

  getCurrentShowingCards: function () {
    return this._currentShowingCards;
  },

  /* VALID CARDS */

  /**
   * Searches for a string across every card in the collection and filtering visibility to matches only.
   * @param {String} searchQuery
   * @param {Boolean} [debounced=false] whether to debounce search, only allowing 1 execution per ~300 ms
   */
  search: function (searchQuery, debounced) {
    if (debounced) {
      if (this._searchDebounced == null) {
        this._searchDebounced = _.debounce(this.search.bind(this), 300);
      }
      this._searchDebounced(searchQuery);
    } else if (this._currentSearchQuery !== searchQuery) {
      this._currentSearchQuery = searchQuery;
      this.showValidCards();
    }
  },

  getCurrentSearchQuery: function () {
    return this._currentSearchQuery;
  },

  /**
   * Filters provided cards by a search query.
   * @param cards
   * @param searchQuery
   * @param [searchAllCards=false] whether to skip checking for inventory count
   */
  _filterCardsForSearchQuery: function (cards, searchQuery, searchAllCards) {
    var filteredCards = (cards && cards.slice(0)) || [];

    if (filteredCards.length > 0 && searchQuery) {
      // cleanup search query and double check that it is still valid
      searchQuery = UtilsJavascript.escapeStringForRegexSearch($.trim(searchQuery).toLowerCase());
      if (searchQuery) {
        var manaQuery = parseInt(searchQuery);
        if (_.isNumber(manaQuery) && !isNaN(manaQuery)) {
          // special search case for numbers as mana cost
          filteredCards = _.filter(filteredCards, function (card) {
            if (searchAllCards || card.get('inventoryCount') > 0) {
              return card.get('manaCost') === manaQuery;
            }
            return false;
          });
        } else if (searchQuery === 'new') {
          // special search case for new cards
          filteredCards = _.filter(filteredCards, function (card) {
            return InventoryManager.getInstance().isCardUnread(card.get('id'));
          }.bind(this));
        } else if (searchQuery === 'lore' || searchQuery === 'new lore') {
          // special search case for new card lore
          filteredCards = _.filter(filteredCards, function (card) {
            return SDK.CardLore.loreForIdentifier(card.get('baseCardId')) != null && InventoryManager.getInstance().isCardLoreUnread(card.get('baseCardId'));
          }.bind(this));
        } else {
          // break search query into multiple look-aheads per word (word here = any group of characters delimited by spaces)
          // this way we can search for card descriptions that match all words instead of one of the words
          searchQuery = searchQuery.replace(/(\S+)/g, '(?=.*$1)').replace(/[\s\t]/g, '') + '.+';
          var searchPattern = new RegExp(searchQuery, 'i');
          filteredCards = _.filter(filteredCards, function (card) {
            if (searchAllCards || card.get('inventoryCount') > 0) {
              // test against card's searchable content
              return searchPattern.test(card.get('searchableContent'));
            }
            return false;
          }.bind(this));
        }
      }
    }

    return filteredCards;
  },

  /**
   * Shows only valid cards for the current collection state.
   */
  showValidCards: function () {
    var deck = this._currentDeck;
    var deckFactionId = deck && deck.get('faction_id');
    var hasGeneral = deckFactionId != null;
    var currentFaction = this._currentFaction;
    var factionsEnabled = [];
    var factionsCollection = GameDataManager.getInstance().visibleFactionsCollection;
    var searchQuery = this._currentSearchQuery;
    var searchAllCards = this._craftingMode;
    var showPrismaticsInCollection = ProfileManager.getInstance().profile.get('showPrismaticsInCollection');
    var showPrismaticsWhileCrafting = ProfileManager.getInstance().profile.get('showPrismaticsWhileCrafting');
    var showSkinsInCollection = ProfileManager.getInstance().profile.get('showSkinsInCollection');
    var cardSet = ProfileManager.getInstance().profile.get('filterCollectionCardSet');

    if (this._deckCardBackSelectingMode) {
      // card back selecting mode, swap current faction out with pseudo card backs faction
      var cardBacks = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.CardBack);
      var cardBackModels = [];
      for (var i = 0, il = cardBacks.length; i < il; i++) {
        var cardBackData = cardBacks[i];
        var cardBackId = cardBackData.id;
        if (InventoryManager.getInstance().getCanSeeCosmeticById(cardBackId)) {
          var cardBackModel = new Backbone.Model(cardBackData);
          cardBackModel.set('_canUse', InventoryManager.getInstance().getCanUseCosmeticById(cardBackId));
          cardBackModel.set('_canPurchase', InventoryManager.getInstance().getCanPurchaseCosmeticById(cardBackId));
          cardBackModels.push(cardBackModel);
        }
      }

      var cardBacksFaction = new Backbone.Model({
        id: CARD_BACKS_FACTION_ID,
        name: 'Card Backs',
        cards: cardBackModels,
      });
      factionsEnabled.push(cardBacksFaction);
      currentFaction = cardBacksFaction;
    } else if (deck && !hasGeneral) {
      // deck needs a general/faction, swap current faction out with pseudo generals faction
      var generalsFaction = GameDataManager.getInstance().generalsFaction;
      var generalCards = generalsFaction.get('cards');

      // filter prismatics/skins as needed
      generalCards = _.filter(generalCards, function (cardModel) {
        return cardModel.get('inventoryCount') > 0
          && (!cardModel.get('isPrismatic') || showPrismaticsInCollection)
          && (!cardModel.get('isSkinned') || (showSkinsInCollection && cardModel.get('canShowSkin')))
          && (cardSet == 0 || cardSet == 9 || cardModel.get('cardSetId') === cardSet);
      });

      generalCards = _.sortBy(generalCards, function (cardModel) {
        // return cardModel.get('baseCardId') + "." + cardModel.get("id")
        return cardModel.get('baseCardId');
      });

      var generalsEnabledFaction = new Backbone.Model({
        id: generalsFaction.get('id'),
        name: generalsFaction.get('name'),
        cards: generalCards,
      });
      factionsEnabled.push(generalsEnabledFaction);
      currentFaction = generalsEnabledFaction;
    } else if (factionsCollection) {
      // make sure current faction is not generals faction
      if (currentFaction && currentFaction.get('id') === GameDataManager.getInstance().generalsFaction.get('id')) {
        currentFaction = null;
      }

      // building deck with chosen faction or browsing/crafting
      factionsCollection.each(function (faction) {
        var factionId = faction.get('id');
        // faction must match deck faction id when building a deck
        if (ProgressionManager.getInstance().isFactionUnlockedOrCardsOwned(factionId)
          && (deck == null || factionId === deckFactionId || faction.get('isNeutral'))) {
          // filter cards by search
          var factionCards = this._filterCardsForSearchQuery(faction.get('cards'), searchQuery, searchAllCards);

          // Filter legacy cards if a card set is chosen
          if (cardSet != 0) {
            factionCards = _.filter(factionCards, function (cardModel) {
              return (cardModel.get('isLegacy') == false);
            });
          }
          // filter shim'zar cards when "standard cards" is chosen
          if (cardSet == 9) {
            factionCards = _.filter(factionCards, function (cardModel) {
              return (cardModel.get('cardSetId') != SDK.CardSet.Shimzar);
            });
          }

          if (!ProgressionManager.getInstance().isFactionUnlocked(factionId)) {
            // faction is visible in collection but not unlocked
            // which means user must own some cards from that faction
            factionCards = _.filter(factionCards, function (cardModel) {
              return (cardModel.get('inventoryCount') > 0
                  && (cardModel.get('isGeneral') || cardModel.get('rarityId') !== SDK.Rarity.Fixed))
                && (!cardModel.get('isSkinned') || (showSkinsInCollection && cardModel.get('canShowSkin')))
                && (cardSet == 0 || cardModel.get('cardSetId') === cardSet);
            });
          } else if (this._craftingMode) {
            // filter for crafting mode
            factionCards = _.filter(factionCards, function (cardModel) {
              // don't show skins
              return !cardModel.get('isSkinned')
                // don't show prismatics unless allowed or has copies
                && ((showPrismaticsInCollection && showPrismaticsWhileCrafting) || !cardModel.get('isPrismatic') || cardModel.get('inventoryCount') > 0)
                && (cardSet == 0 || cardSet == 9 || cardModel.get('cardSetId') === cardSet);
            });
          } else {
            // filter prismatics/skins as needed
            factionCards = _.filter(factionCards, function (cardModel) {
              return cardModel.get('inventoryCount') > 0
                && (!cardModel.get('isPrismatic') || showPrismaticsInCollection)
                && (!cardModel.get('isSkinned') || (showSkinsInCollection && cardModel.get('canShowSkin')))
                && (cardSet == 0 || cardSet == 9 || cardModel.get('cardSetId') === cardSet);
            });
          }

          // faction is enabled when it has cards to show
          if (factionCards.length > 0) {
            factionsEnabled.push(new Backbone.Model({
              id: factionId,
              name: faction.get('name'),
              cards: factionCards,
            }));
          }
        }
      }.bind(this));
    }

    // update enabled factions
    this.model.get('factionsEnabled').reset(factionsEnabled);

    // show new cards
    this._showCardsForFaction(currentFaction, this._currentPage);
  },

  /* PAGES */

  getCurrentPage: function () {
    return this._currentPage;
  },

  /**
   * Returns the index of the last page based on the provided cards.
   */
  getLastPage: function (cards) {
    if (cards) {
      return Math.max(Math.ceil(cards.length / this._numCardsPerPage) - 1, 0);
    } else {
      return 0;
    }
  },

  /**
   * Switches to the previous page from the current, can cause a faction switch.
   */
  gotoPreviousPage: function () {
    var currentFaction = this._currentFaction;
    var currentPage = this._currentPage;

    this._gotoPage(this._currentPage - 1);

    if (currentFaction !== this._currentFaction || currentPage !== this._currentPage) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    }
  },

  /**
   * Switches to the next page from the current, can cause a faction switch.
   */
  gotoNextPage: function () {
    var currentFaction = this._currentFaction;
    var currentPage = this._currentPage;

    this._gotoPage(this._currentPage + 1);

    if (currentFaction !== this._currentFaction || currentPage !== this._currentPage) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    }
  },

  /**
   * Switches to a specific page number. Accounts for past last or before first pages and switches factions.
   * @param page
   * @private
   */
  _gotoPage: function (page) {
    var currentShowingCards = this._currentShowingCards;
    if (currentShowingCards) {
      var lastPage = this.getLastPage(currentShowingCards);
      var deck = this._currentDeck;

      if (page > lastPage) {
        this._gotoNextFaction();
      } else if (page < 0) {
        this._gotoPreviousFaction();
      } else {
        this._currentPage = page;
        var startIndex = this._currentPage * this._numCardsPerPage;
        var endIndex = startIndex + this._numCardsPerPage;
        var cardsOnPage = currentShowingCards.slice(startIndex, endIndex);

        // instead of resetting the collection with the card models on this page
        // we're going to allocate and cache card views and just change their options
        for (var i = 0; i < this._numCardsPerPage; i++) {
          var cardView = this.children.findByIndex(i);
          if (cardView != null) {
            var card = cardsOnPage[i];
            if (card == null) {
              // no card at this location on page
              cardView.hide();
            } else {
              // change options for existing card view, but don't render
              cardView.setOptions(card, true);

              // set card mode
              if (this._deckCardBackSelectingMode) {
                cardView.startDeckCardBackSelectingMode();
              } else if (this._craftingMode) {
                cardView.startCraftingMode();
              } else if (!!deck) {
                cardView.startDeckBuildingMode(deck);
              } else {
                cardView.startBrowsingMode();
              }

              // show card
              cardView.show();
            }
          }
        }
        this.trigger('change_page');
      }
    }
  },

  isShowingCardOnCurrentPage: function (cardId) {
    for (var i = 0; i < this._numCardsPerPage; i++) {
      var cardView = this.children.findByIndex(i);
      if (cardView != null && cardView.model != null && cardView.model.get('id') === cardId) {
        return true;
      }
    }
    return false;
  },

  isShowingBaseCardOnCurrentPage: function (baseCardId) {
    for (var i = 0; i < this._numCardsPerPage; i++) {
      var cardView = this.children.findByIndex(i);
      if (cardView != null && cardView.model != null && cardView.model.get('baseCardId') === baseCardId) {
        return true;
      }
    }
    return false;
  },

  /* MODES */

  _cleanupCurrentMode: function () {
    this._browsingMode = false;
    this._craftingMode = false;
    this._deckCardBackSelectingMode = false;
    this._resetCurrentDeck();
  },

  /**
   * Starts browsing mode, where cards are locked down and only hoverable.
   */
  startBrowsingMode: function () {
    this._cleanupCurrentMode();
    this._browsingMode = true;
    this.showValidCards();
  },

  /**
   * Starts deck building mode, where cards are selectable for deck.
   */
  startDeckBuildingMode: function (deck) {
    if (this._currentDeck !== deck || this._deckCardBackSelectingMode) {
      this._cleanupCurrentMode();

      // set new
      this._currentDeck = deck;
      if (this._currentDeck) {
        this.listenTo(this._currentDeck, 'change:faction_id', this._startBuildingDeck);
      }

      // reset current browsing position
      this._currentFaction = null;
      this._currentPage = null;
      this.showValidCards();
    }
  },

  /**
  * Reset to page 0 once General is chosen
  */
  _startBuildingDeck: function () {
    this._currentPage = null;
    this.showValidCards();
  },

  _resetCurrentDeck: function () {
    if (this._currentDeck) {
      this.stopListening(this._currentDeck, 'change:faction_id', this.showValidCards);
      this._currentDeck = null;
    }
  },

  /**
   * Starts crafting mode, changing card states to show craftable status.
   */
  startCraftingMode: function () {
    this._cleanupCurrentMode();
    this._craftingMode = true;
    this.showValidCards();
  },

  /**
   * Starts deck card back selecting mode, changing card states to show card backs.
   */
  startDeckCardBackSelectingMode: function (deck) {
    if (this._currentDeck !== deck || !this._deckCardBackSelectingMode) {
      this._cleanupCurrentMode();

      // set mode flag
      this._deckCardBackSelectingMode = true;

      // store deck
      this._currentDeck = deck;

      // reset current browsing position
      this._currentFaction = null;
      this._currentPage = null;
      this.showValidCards();
    }
  },
});

// Expose the class either via CommonJS or the global object
module.exports = CardsCollectionCompositeView;
