'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var SDK = require('app/sdk');
var InventoryManager = require('app/ui/managers/inventory_manager');
var BoosterPacksCompositeViewTemplate = require('app/ui/templates/composite/booster_packs.hbs');
var BoosterPackPreviewItemView = require('app/ui/views/item/booster_pack_preview');
var i18next = require('i18next');

var BoosterPacksCompositeView = Backbone.Marionette.CompositeView.extend({

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
    spiritOrbNameForCardSet: function (cardSetId) {
      var cardSetData = SDK.CardSetFactory.cardSetForIdentifier(cardSetId);
      if (cardSetData == null || cardSetData.id === SDK.CardSet.Core) {
        return i18next.t('common.spirit_orb_plural');
      } else {
        return cardSetData.name + ' Orbs';
      }
    },
  },

  _boosterPackModels: null,

  initialize: function () {
    this._boosterPackModels = [];
  },

  /* region LAYOUT */

  onResize: function () {
    if (!this._stateLocked) {
      var cardSet = this.model.get('cardSet') || SDK.CardSet.Core;
      this._boosterPackModels = InventoryManager.getInstance().boosterPacksCollection.filter(function (p) {
        return p.get('card_set') === cardSet || (!p.get('card_set') && cardSet === SDK.CardSet.Core);
      }.bind(this));
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
        this.children.each(function (childView, index) {
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

  onShow: function () {
    // listen to manager events
    InventoryManager.getInstance().onConnect().then(this.onInventoryManagerConnected.bind(this));

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onInventoryManagerConnected: function () {
    this.listenTo(InventoryManager.getInstance().boosterPacksCollection, 'add remove', this.onResize);
    this.onResize();
  },

  /* endregion EVENT LISTENERS */

  setLocked: function (locked) {
    if (this._stateLocked !== locked) {
      this._stateLocked = locked;
      this.setDraggingEnabled(!locked);
      this.onResize();
    }
  },

  setDraggingEnabled: function (draggingEnabled) {
    if (this._draggingEnabled !== draggingEnabled) {
      this._draggingEnabled = draggingEnabled;
      this._updateBoosterPackDragging();
    }
  },

  getLocked: function () {
    return this._stateLocked;
  },

  _updateBoosterPackCounts: function () {
    this.ui.$totalBoosterPacksCount.text(this._boosterPackModels.length);
  },

  _updateBoosterPackDragging: function () {
    if (this.children.length > 0 && this.$childViewContainer instanceof $) {
      this.children.each(function (childView) {
        this._updateBoosterPackDraggingForItemView(childView);
      }.bind(this));
    }
  },

  _updateBoosterPackDraggingForItemView: function (childView) {
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
