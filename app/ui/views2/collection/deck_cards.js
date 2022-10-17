'use strict';

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var UtilsUI = require('app/common/utils/utils_ui');
var DeckCardCompositeView = require('./deck_card');
var DeckCardsTmpl = require('./templates/deck_cards.hbs');

var DeckCardsCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'deck-cards',
  childView: DeckCardCompositeView,
  childViewContainer: '.cards',

  template: DeckCardsTmpl,

  /* ui selector cache */
  ui: {
    $cardsList: '.cards-list',
  },

  /* BACKBONE Events */

  onRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });
  },

  onAddChild: function () {
    this.onResize();
  },

  onRemoveChild: function () {
    this.onResize();
  },

  onShow: function () {
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();
  },

  onResize: function () {
    UtilsUI.overlayScrollbars(this.$el);
  },

  onDestroy: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onBeforeRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = DeckCardsCompositeView;
