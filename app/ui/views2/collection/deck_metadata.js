const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const Firebase = require('firebase');
const Animations = require('app/ui/views/animations');
const NavigationManager = require('app/ui/managers/navigation_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const i18next = require('i18next');
const DeckMetadataTmpl = require('./templates/deck_metadata.hbs');
const HistogramTmpl = require('./templates/histogram.hbs');

const DeckMetadataItemView = Backbone.Marionette.ItemView.extend({

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

    getDeckSize() {
      return this.model.get('cards').length;
    },

    getDeckSizeMax() {
      return CONFIG.MAX_DECK_SIZE;
    },

    getColorCodes() {
      return CONFIG.COLOR_CODES;
    },

  },

  /* region MARIONETTE */

  onRender() {
    // recreate histogram
    const histogramModel = new Backbone.Model({ histogram: this.model._histogram });
    const histogramHTMLData = HistogramTmpl(histogramModel.toJSON());
    if (this.ui.$histogram instanceof $) {
      this.ui.$histogram.append(histogramHTMLData);
    }

    // bind card back
    this.bindDeckCardBack();
  },

  onPrepareForDestroy() {
    this.ui.$deckCardBack.tooltip('destroy');
  },

  /* endregion MARIONETTE */

  /* region EVENTS */

  onNameChange(e) {
    this.model.set('name', $(e.currentTarget).val());
  },

  onDeckColorCodeClicked(e) {
    const $target = $(e.target);
    const colorCode = parseInt($target.data('code'));
    const colorCodeData = CONFIG.COLOR_CODES[colorCode];
    if (colorCodeData != null) {
      const currentColorCode = this.model.get('color_code');
      const currentColorCodeData = CONFIG.COLOR_CODES[currentColorCode];
      if (currentColorCodeData != null) {
        this.ui.$colorCodeSelect.removeClass(currentColorCodeData.cssClass);
      }
      this.model.set('color_code', colorCode);
      this.ui.$colorCodeSelect.addClass(colorCodeData.cssClass);
    }
  },

  onDeckCardBackClicked(e) {
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

  onDeckCardBackEndHover() {
    this.ui.$deckCardBack.tooltip('destroy');
  },

  bindDeckCardBack() {
    const cardBackId = this.model.get('card_back_id');
    const cardBackImg = SDK.CosmeticsFactory.cardBackForIdentifier(cardBackId).img;
    this.ui.$deckCardBackImg.attr('src', RSX.getResourcePathForScale(cardBackImg, CONFIG.resourceScaleCSS));
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckMetadataItemView;
