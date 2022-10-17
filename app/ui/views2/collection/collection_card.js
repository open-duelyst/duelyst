'use strict';

var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var UtilsEnv = require('app/common/utils/utils_env');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var CardCompositeView = require('app/ui/views/composite/card');

var CollectionCardCompositeView = CardCompositeView.extend({

  _craftingMode: false,
  _browsingMode: false,
  _deckCardBackSelectingMode: false,
  _currentDeck: null,
  _craftable: false,

  onRender: function () {
    CardCompositeView.prototype.onRender.apply(this, arguments);
  },

  _updateState: function () {
    var id = this.model.get('id');
    var baseCardId = this.model.get('baseCardId');

    this.setInteractive(this.interactive);

    if (this._deckCardBackSelectingMode) {
      this.setUnlockable(false);
    } else {
      this.setUnlockable(
        (this.model.get('isUnlockable') && !this.model.get('isUnlocked'))
        || (!ProgressionManager.getInstance().isFactionUnlocked(this.model.get('factionId'))
          && (this.model.get('isGeneral') || (this.model.get('rarityId') == SDK.Rarity.Fixed && !this.model.get('isUnlockableBasic')))
        ),
      );
    }

    if (this._deckCardBackSelectingMode) {
      this.setRead(true);
      this.setLoreRead(true);
      this.setDraggable(true);
      this.setUsable(true);
      this.setCraftable(false);
    } else if (this._craftingMode) {
      // when in crafting mode
      // mark cards as draggable and the crafting_create.js view will manage the case for trying to craft a general or basic card
      this.setRead(true);
      this.setLoreRead(true);
      this.setDraggable(true);
      this.setUsable(true);
      this.setInteractive(true);
      this.setCraftable(this.model.get('isCraftable') && this.model.get('inventoryCount') === 0);
    } else {
      this.setCraftable(false);
      var usable = this.model.get('inventoryCount') > 0;
      if (this._currentDeck != null) {
        // when in deck building mode
        // must have some copies left AND must not have 3 copies already in deck
        var baseCardCountInDeck = this._currentDeck.getCountForBaseCardId(this.model.get('id'));
        var isMaxedOutInDeck;
        if (this.model.get('isGeneral')) {
          // generals are never maxed in deck unless is current deck general
          isMaxedOutInDeck = this.model.get('id') === this._currentDeck.getGeneralId();
        } else if (this.model.get('rarityId') == SDK.Rarity.Mythron) {
          var mythronCards = SDK.GameSession.getCardCaches().getRarity(SDK.Rarity.Mythron).getIsUnlockable(false).getIsCollectible(true)
            .getIsPrismatic(false)
            .getCards();
          var mythronCount = 0;
          for (var i = 0; i < mythronCards.length; i++) {
            mythronCount += this._currentDeck.getCountForBaseCardId(mythronCards[i].id);
          }
          if (mythronCount >= 1) {
            isMaxedOutInDeck = true;
          }
        } else {
          isMaxedOutInDeck = baseCardCountInDeck >= CONFIG.MAX_DECK_DUPLICATES || (this._currentDeck.getCountForCardId(this.model.get('id')) >= this.model.get('inventoryCount'));
        }
        usable = usable && !isMaxedOutInDeck;

        this.setMaxedOutInDeck(isMaxedOutInDeck);
        this.setDraggable(usable);
        if (!usable) {
          this.setInteractive(false);
        } else {
          this.setInteractive(true);
        }
        this.setRead(true);
        this.setLoreRead(true);
      } else {
        // when in browsing mode
        this.setDraggable(false);
        this.setRead(!InventoryManager.getInstance().isCardUnread(id));
        this.setLoreRead(SDK.CardLore.loreForIdentifier(baseCardId) == null || !InventoryManager.getInstance().isCardLoreUnread(baseCardId));
      }
      this.setUsable(usable);
    }
  },

  getCardClasses: function () {
    return CardCompositeView.prototype.getCardClasses.apply(this, arguments) + ' collection-card';
  },

  setCraftable: function (craftable) {
    this._craftable = craftable;
    if (craftable) {
      this.$el.addClass('craftable');
    } else {
      this.$el.removeClass('craftable');
    }
  },

  setUnlockable: function (unlockable) {
    this._unlockable = unlockable;
    if (unlockable) {
      // this.setAnimated(false)
      this.$el.addClass('unlockable');
    } else {
      // this.setAnimated(true)
      this.$el.removeClass('unlockable');
    }
  },

  setMaxedOutInDeck: function (isMaxedOutInDeck) {
    this._isMaxedOutInDeck = isMaxedOutInDeck;
    if (isMaxedOutInDeck) {
      this.$el.addClass('maxed-out');
    } else {
      this.$el.removeClass('maxed-out');
    }
  },

  /* MODES */

  _cleanupCurrentMode: function () {
    this._browsingMode = false;
    this._craftingMode = false;
    this._deckCardBackSelectingMode = false;
    if (this._currentDeck) {
      this.stopListening(this._currentDeck);
      this.setMaxedOutInDeck(false);
    }
    this._currentDeck = null;
  },

  startBrowsingMode: function () {
    this._cleanupCurrentMode();
    this._browsingMode = true;
    this._updateState();
  },

  startDeckBuildingMode: function (deck) {
    if (this._currentDeck !== deck || this._deckCardBackSelectingMode) {
      this._cleanupCurrentMode();
      this._currentDeck = deck;

      this._updateState();

      // whenever the deck changes, update state
      this.listenTo(deck, 'change', this._updateState.bind(this));
    }
  },

  startDeckCardBackSelectingMode: function (deck) {
    if (this._currentDeck !== deck || !this._deckCardBackSelectingMode) {
      this._cleanupCurrentMode();
      this._deckCardBackSelectingMode = true;
      this._currentDeck = deck;

      this._updateState();
    }
  },

  startCraftingMode: function () {
    this._cleanupCurrentMode();
    this._craftingMode = true;
    this._updateState();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CollectionCardCompositeView;
