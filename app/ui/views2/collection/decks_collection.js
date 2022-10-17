'use strict';

var DeckPreviewItemView = require('./deck_preview');
var DecksCollectionTmpl = require('./templates/decks_collection.hbs');

var DecksCollectionCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'decks-collection',
  childView: DeckPreviewItemView,
  childViewContainer: '.decks',
  _scrollLast: 0,

  template: DecksCollectionTmpl,

  /* ui selector cache */
  ui: {
    $decksList: '.decks-list',
  },

  /* Ui events hash */
  events: {},

  /* BACKBONE Events */

  initialize: function () {
    // force one time sort of decks
    this.collection.sort();
    this.listenTo(this.collection, 'change', this.onDecksChanged);
  },

  onDecksChanged: function () {
    this.collection.sort();
  },

  onRender: function () {
    if (this.ui.$cardsList instanceof $) {
      this.ui.$cardsList.scrollTop(this._scrollLast);
    }
  },

  onBeforeRender: function () {
    if (this.ui.$cardsList instanceof $) {
      this._scrollLast = this.ui.$cardsList.scrollTop();
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DecksCollectionCompositeView;
