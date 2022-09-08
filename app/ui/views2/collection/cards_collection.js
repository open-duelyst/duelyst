// pragma PKGS: alwaysloaded

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const SDK = require('app/sdk');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const UtilsEnv = require('app/common/utils/utils_env');
const UtilsUI = require('app/common/utils/utils_ui');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const audio_engine = require('app/audio/audio_engine');
const CardModel = require('app/ui/models/card');
const ProfileManager = require('app/ui/managers/profile_manager');
const GameDataManager = require('app/ui/managers/game_data_manager');
const ProgressionManager = require('app/ui/managers/progression_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const CardsCollectionTmpl = require('./templates/cards_collection.hbs');
const CollectionCardCompositeView = require('./collection_card');

const CARD_BACKS_FACTION_ID = 'card_backs';

const CardsCollectionCompositeView = Backbone.Marionette.CompositeView.extend({

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

  initialize() {
    this.model.set('factionsEnabled', new Backbone.Collection());
  },

  /* region LAYOUT */

  onResize() {
    // create a test card to get width/height of cards
    if (this._testCardView == null) {
      this._testCardView = new (this.childView)(new CardModel({ id: -1 }));
    }
    this._testCardView.$el.css('position', 'absolute');
    $('body').prepend(this._testCardView.$el);
    const cardWidth = this._testCardView.$el.outerWidth(true);
    const cardHeight = this._testCardView.$el.outerHeight(true);
    this._testCardView.$el.remove();

    // calculate number of cards that can fit in a page
    const width = this.$el.outerWidth();
    const height = this.$el.outerHeight();
    const columns = Math.max(CONFIG.MIN_COLUMNS_CARDS, Math.floor(width / cardWidth));
    const rows = Math.max(CONFIG.MIN_ROWS_CARDS, Math.floor(height / cardHeight));
    this._numCardsPerPage = columns * rows;

    // clear out the existing collection
    this.collection.reset();

    // force fake ids so we can preallocate max card views per page
    for (let i = 0; i < this._numCardsPerPage; i++) {
      this.collection.add(new CardModel({ id: -i }));
    }

    // go to this page again to repopulate cards
    this._gotoPage(this._currentPage);
  },

  /* endregion LAYOUT */

  /* BACKBONE EVENTS */

  onRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });

    this.onResize();
  },

  onDestroy() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    if (this._testCardView != null) {
      this._testCardView.$el.remove();
      this._testCardView = null;
    }
  },

  onBeforeRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onShow() {
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

  onShowPrismaticsInCollectionChanged() {
    this.showValidCards();
  },

  onShowSkinsInCollectionChanged() {
    this.showValidCards();
  },

  onFilterCollectionCardSetChanged() {
    this.showValidCards();
  },

  onCosmeticsCollectionChanged(event) {
    const model = event && event.model;
    const cosmeticId = model && model.get('id');
    if (cosmeticId != null && SDK.CosmeticsFactory.isIdentifierForCardSkin(cosmeticId)) {
      this.showValidCards();
    }
  },

  animateReveal() {

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

  onCardDropped(event, ui) {
    // don't respond to own cards
    const $draggable = ui.draggable;
    if ($draggable instanceof $ && !$draggable.hasClass('collection-card')) {
      $draggable.trigger('click');
    }
  },

  onCardStartDragging(cardItemViewDragging) {
    // force all cards to be non-interactive
    this.children.each((cardItemView) => {
      if (cardItemView !== cardItemViewDragging) {
        cardItemView.setInteractive(false);
        cardItemView.setDraggable(false);
      }
    });
  },

  onCardStopDragging(cardItemViewDragging) {
    // reset all cards interactivity
    this.children.each((cardItemView) => {
      if (cardItemView !== cardItemViewDragging) {
        cardItemView.setInteractive(true);
        cardItemView.setDraggable(!this._browsingMode);
      }
    });
  },

  /* FACTIONS */

  getCurrentFaction() {
    return this._currentFaction;
  },

  getEnabledFactions() {
    return this.model.get('factionsEnabled');
  },

  /**
   * Switches the page to the first page of a faction, given that faction's id.
   * @param factionId
   */
  gotoFactionById(factionId) {
    const faction = this.model.get('factionsEnabled').get(factionId);
    const currentFaction = this._currentFaction;
    const currentPage = this._currentPage;

    this._showCardsForFaction(faction);

    if (currentFaction !== this._currentFaction || currentPage !== this._currentPage) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    }
  },

  /**
   * Switches the page to the previous faction from the current faction.
   */
  _gotoPreviousFaction() {
    const factions = this.model.get('factionsEnabled');
    const currentFactionIndex = factions.indexOf(this._currentFaction);
    let nextFactionIndex = currentFactionIndex - 1;
    if (nextFactionIndex < 0) {
      nextFactionIndex = factions.length - 1;
    }
    this._showCardsForFaction(factions.at(nextFactionIndex), CONFIG.INFINITY);
  },

  /**
   * Switches the page to the next faction from the current faction.
   */
  _gotoNextFaction() {
    const factions = this.model.get('factionsEnabled');
    const currentFactionIndex = factions.indexOf(this._currentFaction);
    const nextFactionIndex = (currentFactionIndex + 1) % factions.length;
    this._showCardsForFaction(factions.at(nextFactionIndex));
  },

  /**
   * Shows cards for a specific faction model and optionally from the end of the faction instead of the beginning.
   * @private
   * @param faction
   * @param page
   */
  _showCardsForFaction(faction, page) {
    const factions = this.model.get('factionsEnabled');

    // cleanup last cards
    this._currentShowingCards = [];

    // show new
    if (factions.length > 0) {
      if (faction == null) { faction = factions.first(); }
      if (faction != null) {
        // get new collection based on selected faction
        const factionId = faction.get('id');
        const factionEnabled = factions.get(factionId);

        // set new faction
        this._currentFaction = factionEnabled;

        // show cards if faction has been unlocked
        if (factionEnabled != null
          && (factionEnabled.get('id') === CARD_BACKS_FACTION_ID
            || factionEnabled.get('id') === GameDataManager.getInstance().generalsFaction.get('id')
            || ProgressionManager.getInstance().isFactionUnlockedOrCardsOwned(factionId))) {
          // store currently showing cards
          const cardsToShow = factionEnabled.get('cards');
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
  _showCards(cards, page) {
    // store showing cards
    this._currentShowingCards = cards || [];

    // check page
    page = page != null ? Math.min(this.getLastPage(this._currentShowingCards), page) : 0;

    // go to page of current showing cards
    this._gotoPage(page);
  },

  getCurrentShowingCards() {
    return this._currentShowingCards;
  },

  /* VALID CARDS */

  /**
   * Searches for a string across every card in the collection and filtering visibility to matches only.
   * @param {String} searchQuery
   * @param {Boolean} [debounced=false] whether to debounce search, only allowing 1 execution per ~300 ms
   */
  search(searchQuery, debounced) {
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

  getCurrentSearchQuery() {
    return this._currentSearchQuery;
  },

  /**
   * Filters provided cards by a search query.
   * @param cards
   * @param searchQuery
   * @param [searchAllCards=false] whether to skip checking for inventory count
   */
  _filterCardsForSearchQuery(cards, searchQuery, searchAllCards) {
    let filteredCards = (cards && cards.slice(0)) || [];

    if (filteredCards.length > 0 && searchQuery) {
      // cleanup search query and double check that it is still valid
      searchQuery = UtilsJavascript.escapeStringForRegexSearch($.trim(searchQuery).toLowerCase());
      if (searchQuery) {
        const manaQuery = parseInt(searchQuery);
        if (_.isNumber(manaQuery) && !isNaN(manaQuery)) {
          // special search case for numbers as mana cost
          filteredCards = _.filter(filteredCards, (card) => {
            if (searchAllCards || card.get('inventoryCount') > 0) {
              return card.get('manaCost') === manaQuery;
            }
            return false;
          });
        } else if (searchQuery === 'new') {
          // special search case for new cards
          filteredCards = _.filter(filteredCards, (card) => InventoryManager.getInstance().isCardUnread(card.get('id')));
        } else if (searchQuery === 'lore' || searchQuery === 'new lore') {
          // special search case for new card lore
          filteredCards = _.filter(filteredCards, (card) => SDK.CardLore.loreForIdentifier(card.get('baseCardId')) != null && InventoryManager.getInstance().isCardLoreUnread(card.get('baseCardId')));
        } else {
          // break search query into multiple look-aheads per word (word here = any group of characters delimited by spaces)
          // this way we can search for card descriptions that match all words instead of one of the words
          searchQuery = `${searchQuery.replace(/(\S+)/g, '(?=.*$1)').replace(/[\s\t]/g, '')}.+`;
          const searchPattern = new RegExp(searchQuery, 'i');
          filteredCards = _.filter(filteredCards, (card) => {
            if (searchAllCards || card.get('inventoryCount') > 0) {
              // test against card's searchable content
              return searchPattern.test(card.get('searchableContent'));
            }
            return false;
          });
        }
      }
    }

    return filteredCards;
  },

  /**
   * Shows only valid cards for the current collection state.
   */
  showValidCards() {
    const deck = this._currentDeck;
    const deckFactionId = deck && deck.get('faction_id');
    const hasGeneral = deckFactionId != null;
    let currentFaction = this._currentFaction;
    const factionsEnabled = [];
    const factionsCollection = GameDataManager.getInstance().visibleFactionsCollection;
    const searchQuery = this._currentSearchQuery;
    const searchAllCards = this._craftingMode;
    const showPrismaticsInCollection = ProfileManager.getInstance().profile.get('showPrismaticsInCollection');
    const showPrismaticsWhileCrafting = ProfileManager.getInstance().profile.get('showPrismaticsWhileCrafting');
    const showSkinsInCollection = ProfileManager.getInstance().profile.get('showSkinsInCollection');
    const cardSet = ProfileManager.getInstance().profile.get('filterCollectionCardSet');

    if (this._deckCardBackSelectingMode) {
      // card back selecting mode, swap current faction out with pseudo card backs faction
      const cardBacks = SDK.CosmeticsFactory.cosmeticsForType(SDK.CosmeticsTypeLookup.CardBack);
      const cardBackModels = [];
      for (let i = 0, il = cardBacks.length; i < il; i++) {
        const cardBackData = cardBacks[i];
        const cardBackId = cardBackData.id;
        if (InventoryManager.getInstance().getCanSeeCosmeticById(cardBackId)) {
          const cardBackModel = new Backbone.Model(cardBackData);
          cardBackModel.set('_canUse', InventoryManager.getInstance().getCanUseCosmeticById(cardBackId));
          cardBackModel.set('_canPurchase', InventoryManager.getInstance().getCanPurchaseCosmeticById(cardBackId));
          cardBackModels.push(cardBackModel);
        }
      }

      const cardBacksFaction = new Backbone.Model({
        id: CARD_BACKS_FACTION_ID,
        name: 'Card Backs',
        cards: cardBackModels,
      });
      factionsEnabled.push(cardBacksFaction);
      currentFaction = cardBacksFaction;
    } else if (deck && !hasGeneral) {
      // deck needs a general/faction, swap current faction out with pseudo generals faction
      const { generalsFaction } = GameDataManager.getInstance();
      let generalCards = generalsFaction.get('cards');

      // filter prismatics/skins as needed
      generalCards = _.filter(generalCards, (cardModel) => cardModel.get('inventoryCount') > 0
          && (!cardModel.get('isPrismatic') || showPrismaticsInCollection)
          && (!cardModel.get('isSkinned') || (showSkinsInCollection && cardModel.get('canShowSkin')))
          && (cardSet == 0 || cardSet == 9 || cardModel.get('cardSetId') === cardSet));

      generalCards = _.sortBy(generalCards, (cardModel) =>
        // return cardModel.get('baseCardId') + "." + cardModel.get("id")
        cardModel.get('baseCardId'));

      const generalsEnabledFaction = new Backbone.Model({
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
      factionsCollection.each((faction) => {
        const factionId = faction.get('id');
        // faction must match deck faction id when building a deck
        if (ProgressionManager.getInstance().isFactionUnlockedOrCardsOwned(factionId)
          && (deck == null || factionId === deckFactionId || faction.get('isNeutral'))) {
          // filter cards by search
          let factionCards = this._filterCardsForSearchQuery(faction.get('cards'), searchQuery, searchAllCards);

          // Filter legacy cards if a card set is chosen
          if (cardSet != 0) {
            factionCards = _.filter(factionCards, (cardModel) => (cardModel.get('isLegacy') == false));
          }
          // filter shim'zar cards when "standard cards" is chosen
          if (cardSet == 9) {
            factionCards = _.filter(factionCards, (cardModel) => (cardModel.get('cardSetId') != SDK.CardSet.Shimzar));
          }

          if (!ProgressionManager.getInstance().isFactionUnlocked(factionId)) {
            // faction is visible in collection but not unlocked
            // which means user must own some cards from that faction
            factionCards = _.filter(factionCards, (cardModel) => (cardModel.get('inventoryCount') > 0
                  && (cardModel.get('isGeneral') || cardModel.get('rarityId') !== SDK.Rarity.Fixed))
                && (!cardModel.get('isSkinned') || (showSkinsInCollection && cardModel.get('canShowSkin')))
                && (cardSet == 0 || cardModel.get('cardSetId') === cardSet));
          } else if (this._craftingMode) {
            // filter for crafting mode
            factionCards = _.filter(factionCards, (cardModel) =>
              // don't show skins
              !cardModel.get('isSkinned')
                // don't show prismatics unless allowed or has copies
                && ((showPrismaticsInCollection && showPrismaticsWhileCrafting) || !cardModel.get('isPrismatic') || cardModel.get('inventoryCount') > 0)
                && (cardSet == 0 || cardSet == 9 || cardModel.get('cardSetId') === cardSet));
          } else {
            // filter prismatics/skins as needed
            factionCards = _.filter(factionCards, (cardModel) => cardModel.get('inventoryCount') > 0
                && (!cardModel.get('isPrismatic') || showPrismaticsInCollection)
                && (!cardModel.get('isSkinned') || (showSkinsInCollection && cardModel.get('canShowSkin')))
                && (cardSet == 0 || cardSet == 9 || cardModel.get('cardSetId') === cardSet));
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
      });
    }

    // update enabled factions
    this.model.get('factionsEnabled').reset(factionsEnabled);

    // show new cards
    this._showCardsForFaction(currentFaction, this._currentPage);
  },

  /* PAGES */

  getCurrentPage() {
    return this._currentPage;
  },

  /**
   * Returns the index of the last page based on the provided cards.
   */
  getLastPage(cards) {
    if (cards) {
      return Math.max(Math.ceil(cards.length / this._numCardsPerPage) - 1, 0);
    }
    return 0;
  },

  /**
   * Switches to the previous page from the current, can cause a faction switch.
   */
  gotoPreviousPage() {
    const currentFaction = this._currentFaction;
    const currentPage = this._currentPage;

    this._gotoPage(this._currentPage - 1);

    if (currentFaction !== this._currentFaction || currentPage !== this._currentPage) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
    }
  },

  /**
   * Switches to the next page from the current, can cause a faction switch.
   */
  gotoNextPage() {
    const currentFaction = this._currentFaction;
    const currentPage = this._currentPage;

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
  _gotoPage(page) {
    const currentShowingCards = this._currentShowingCards;
    if (currentShowingCards) {
      const lastPage = this.getLastPage(currentShowingCards);
      const deck = this._currentDeck;

      if (page > lastPage) {
        this._gotoNextFaction();
      } else if (page < 0) {
        this._gotoPreviousFaction();
      } else {
        this._currentPage = page;
        const startIndex = this._currentPage * this._numCardsPerPage;
        const endIndex = startIndex + this._numCardsPerPage;
        const cardsOnPage = currentShowingCards.slice(startIndex, endIndex);

        // instead of resetting the collection with the card models on this page
        // we're going to allocate and cache card views and just change their options
        for (let i = 0; i < this._numCardsPerPage; i++) {
          const cardView = this.children.findByIndex(i);
          if (cardView != null) {
            const card = cardsOnPage[i];
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
              } else if (deck) {
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

  isShowingCardOnCurrentPage(cardId) {
    for (let i = 0; i < this._numCardsPerPage; i++) {
      const cardView = this.children.findByIndex(i);
      if (cardView != null && cardView.model != null && cardView.model.get('id') === cardId) {
        return true;
      }
    }
    return false;
  },

  isShowingBaseCardOnCurrentPage(baseCardId) {
    for (let i = 0; i < this._numCardsPerPage; i++) {
      const cardView = this.children.findByIndex(i);
      if (cardView != null && cardView.model != null && cardView.model.get('baseCardId') === baseCardId) {
        return true;
      }
    }
    return false;
  },

  /* MODES */

  _cleanupCurrentMode() {
    this._browsingMode = false;
    this._craftingMode = false;
    this._deckCardBackSelectingMode = false;
    this._resetCurrentDeck();
  },

  /**
   * Starts browsing mode, where cards are locked down and only hoverable.
   */
  startBrowsingMode() {
    this._cleanupCurrentMode();
    this._browsingMode = true;
    this.showValidCards();
  },

  /**
   * Starts deck building mode, where cards are selectable for deck.
   */
  startDeckBuildingMode(deck) {
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
  _startBuildingDeck() {
    this._currentPage = null;
    this.showValidCards();
  },

  _resetCurrentDeck() {
    if (this._currentDeck) {
      this.stopListening(this._currentDeck, 'change:faction_id', this.showValidCards);
      this._currentDeck = null;
    }
  },

  /**
   * Starts crafting mode, changing card states to show craftable status.
   */
  startCraftingMode() {
    this._cleanupCurrentMode();
    this._craftingMode = true;
    this.showValidCards();
  },

  /**
   * Starts deck card back selecting mode, changing card states to show card backs.
   */
  startDeckCardBackSelectingMode(deck) {
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
