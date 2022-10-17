'use strict';

var SDK = require('app/sdk');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var Firebase = require('firebase');
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var i18next = require('i18next');
var DeckMetadataTmpl = require('./templates/deck_metadata.hbs');
var HistogramTmpl = require('./templates/histogram.hbs');

var DeckMetadataItemView = Backbone.Marionette.ItemView.extend({

  className: 'deck-metadata',
  template: DeckMetadataTmpl,

  /* ui selector cache */
  ui: {
    $deckName: '.deck-name',
    $histogram: '.deck-histogram',
    $colorCodeSelect: '.deck-color-code-select',
    $deckCardBack: '.deck-card-back',
    $deckCardBackImg: '.deck-card-back img',
  },

  /* Ui events hash */
  events: {
    'click .deck-color-code-select-menu .deck-color-code': 'onDeckColorCodeClicked',
    'click .deck-card-back': 'onDeckCardBackClicked',
    'mouseleave .deck-card-back': 'onDeckCardBackEndHover',
    'input input.deck-name': 'onNameChange',
  },

  modelEvents: {
    'change:cards': 'render',
    'change:card_back_id': 'bindDeckCardBack',
  },

  templateHelpers: {

    getDeckSize: function () {
      return this.model.get('cards').length;
    },

    getDeckSizeMax: function () {
      return CONFIG.MAX_DECK_SIZE;
    },

    getColorCodes: function () {
      return CONFIG.COLOR_CODES;
    },

  },

  /* region MARIONETTE */

  onRender: function () {
    // recreate histogram
    var histogramModel = new Backbone.Model({ histogram: this.model._histogram });
    var histogramHTMLData = HistogramTmpl(histogramModel.toJSON());
    if (this.ui.$histogram instanceof $) {
      this.ui.$histogram.append(histogramHTMLData);
    }

    // bind card back
    this.bindDeckCardBack();
  },

  onPrepareForDestroy: function () {
    this.ui.$deckCardBack.tooltip('destroy');
  },

  /* endregion MARIONETTE */

  /* region EVENTS */

  onNameChange: function (e) {
    this.model.set('name', $(e.currentTarget).val());
  },

  onDeckColorCodeClicked: function (e) {
    var $target = $(e.target);
    var colorCode = parseInt($target.data('code'));
    var colorCodeData = CONFIG.COLOR_CODES[colorCode];
    if (colorCodeData != null) {
      var currentColorCode = this.model.get('color_code');
      var currentColorCodeData = CONFIG.COLOR_CODES[currentColorCode];
      if (currentColorCodeData != null) {
        this.ui.$colorCodeSelect.removeClass(currentColorCodeData.cssClass);
      }
      this.model.set('color_code', colorCode);
      this.ui.$colorCodeSelect.addClass(colorCodeData.cssClass);
    }
  },

  onDeckCardBackClicked: function (e) {
    if (this.model.get('faction_id') == null) {
      this.ui.$deckCardBack.tooltip({
        animation: true,
        title: i18next.t('collection.must_select_general_error'),
        placement: 'bottom',
        trigger: 'manual',
      });
      this.ui.$deckCardBack.tooltip('show');
    } else {
      this.trigger('deck_card_back_selecting');
    }
  },

  onDeckCardBackEndHover: function () {
    this.ui.$deckCardBack.tooltip('destroy');
  },

  bindDeckCardBack: function () {
    var cardBackId = this.model.get('card_back_id');
    var cardBackImg = SDK.CosmeticsFactory.cardBackForIdentifier(cardBackId).img;
    this.ui.$deckCardBackImg.attr('src', RSX.getResourcePathForScale(cardBackImg, CONFIG.resourceScaleCSS));
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckMetadataItemView;
