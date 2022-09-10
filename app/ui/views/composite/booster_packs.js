const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const InventoryManager = require('app/ui/managers/inventory_manager');
const BoosterPacksCompositeViewTemplate = require('app/ui/templates/composite/booster_packs.hbs');
const BoosterPackPreviewItemView = require('app/ui/views/item/booster_pack_preview');
const i18next = require('i18next');

const BoosterPacksCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'booster-packs',
  template: BoosterPacksCompositeViewTemplate,
  childView: BoosterPackPreviewItemView,
  childViewContainer: '.booster-packs-list',

  _stateLocked: false,
  _draggingEnabled: true,

  ui: {
    $totalBoosterPacksCount: '.total-booster-packs-count',
  },

  templateHelpers: {
    spiritOrbNameForCardSet(cardSetId) {
      const cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
      if (cardSetData == null || cardSetData.id === SDK.CardSet.Core) {
        return i18next.t('common.spirit_orb_plural');
      }
      return `${cardSetData.name} Orbs`;
    },
  },

  _boosterPackModels: null,

  initialize() {
    this._boosterPackModels = [];
  },

  /* region LAYOUT */

  onResize() {
    if (!this._stateLocked) {
      const cardSet = this.model.get('cardSet') || SDK.CardSet.Core;
      this._boosterPackModels = InventoryManager.getInstance().boosterPacksCollection.filter((p) => p.get('card_set') === cardSet || (!p.get('card_set') && cardSet === SDK.CardSet.Core));
      this.collection.reset(this._boosterPackModels.slice(0, CONFIG.MAX_BOOSTER_PACKS_SHOWN));

      if (this.children.length > 0 && this.$childViewContainer instanceof $) {
        // use onShow because it guarantees elements will have been added to the DOM
        /*
        // update booster pack margin top dynamically based on how many are shown
        var containerHeight = this.$childViewContainer.innerHeight();
        var maxHeight = 0;
        this.children.each(function (childView, index) {
          var itemHeight = childView.$el.height();
          if (itemHeight > maxHeight) {
            maxHeight = itemHeight;
          }
        });
        var heightPerItem = containerHeight / this.collection.length;
        var maxHeightDiff = maxHeight - heightPerItem;
        heightPerItem = (containerHeight - maxHeightDiff) / this.collection.length;
        this.children.each(function (childView, index) {
          var itemHeight = childView.$el.height();
          if (index > 1 && heightPerItem < itemHeight) {
            childView.$el.css("margin-top", heightPerItem - itemHeight);
          } else {
            childView.$el.css("margin-top", 0);
          }
        });
         */
        this.children.each((childView, index) => {
          childView.$el.draggable({
            distance: 10,
            revert: true,
          });
        });
      }
    }

    this._updateBoosterPackDragging();
    this._updateBoosterPackCounts();
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onShow() {
    // listen to manager events
    InventoryManager.getInstance().onConnect().then(this.onInventoryManagerConnected.bind(this));

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onInventoryManagerConnected() {
    this.listenTo(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onResize);
    this.onResize();
  },

  /* endregion EVENT LISTENERS */

  setLocked(locked) {
    if (this._stateLocked !== locked) {
      this._stateLocked = locked;
      this.setDraggingEnabled(!locked);
      this.onResize();
    }
  },

  setDraggingEnabled(draggingEnabled) {
    if (this._draggingEnabled !== draggingEnabled) {
      this._draggingEnabled = draggingEnabled;
      this._updateBoosterPackDragging();
    }
  },

  getLocked() {
    return this._stateLocked;
  },

  _updateBoosterPackCounts() {
    this.ui.$totalBoosterPacksCount.text(this._boosterPackModels.length);
  },

  _updateBoosterPackDragging() {
    if (this.children.length > 0 && this.$childViewContainer instanceof $) {
      this.children.each((childView) => {
        this._updateBoosterPackDraggingForItemView(childView);
      });
    }
  },

  _updateBoosterPackDraggingForItemView(childView) {
    if (childView.$el.draggable('instance') != null) {
      if (this._draggingEnabled) {
        childView.$el.draggable('enable');
      } else {
        childView.$el.draggable('disable');
      }
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BoosterPacksCompositeView;
