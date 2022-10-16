const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const UtilsUI = require('app/common/utils/utils_ui');
const DeckCardCompositeView = require('./deck_card');
const DeckCardsTmpl = require('./templates/deck_cards.hbs');

const DeckCardsCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'deck-cards',
  childView: DeckCardCompositeView,
  childViewContainer: '.cards',

  template: DeckCardsTmpl,

  /* ui selector cache */
  ui: {
    $cardsList: '.cards-list',
  },

  /* BACKBONE Events */

  onRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });
  },

  onAddChild() {
    this.onResize();
  },

  onRemoveChild() {
    this.onResize();
  },

  onShow() {
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();
  },

  onResize() {
    UtilsUI.overlayScrollbars(this.$el);
  },

  onDestroy() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onBeforeRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = DeckCardsCompositeView;
