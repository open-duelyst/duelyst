'use strict';

var CONFIG = require('app/common/config');
var UtilsUI = require('app/common/utils/utils_ui');
var Animations = require('app/ui/views/animations');
var CardCompositeView = require('app/ui/views/composite/card');
var CardTempl = require('app/ui/templates/composite/card.hbs');

var DeckCardCompositeView = CardCompositeView.extend({

  _cardData: null,
  signatureSpriteScale: 0.75,
  signatureSpriteScaleDraggable: 0.75,
  signatureSpriteScalePopover: 1.0,
  _popoverSpriteGLData: null,
  _popoverSignatureSpriteGLData: null,

  // deck cards are always draggable
  draggable: true,
  draggableScope: 'remove',
  draggableAppendTo: '#app-deck-cards-region',

  // deck cards are never animated
  animated: false,

  onChangedOptions: function () {
    CardCompositeView.prototype.onChangedOptions.apply(this, arguments);

    // remove last popover
    this._removePopover();

    // setup popover
    var cardClasses = this.getCardClasses();
    var modelData = this.model.toJSON();
    modelData = this.mixinTemplateHelpers(modelData);
    var htmlData = CardTempl(modelData);
    if (htmlData) {
      this._cardData = '<div class="card' + cardClasses + '">' + htmlData + '</div>';
      this.$el.popover({
        trigger: 'manual', container: CONFIG.COLLECTION_SELECTOR, viewport: CONFIG.COLLECTION_SELECTOR, placement: this._positionPopover.bind(this), html: true, content: this._cardData,
      });
    }
  },

  onRender: function () {
    // general cards should be unusable in deck
    if (this.model.get('isGeneral')) {
      this.setInteractive(false);
      this.setDraggable(false);
    }

    // deck cards should always set read states to true
    this.setRead(true);
    this.setLoreRead(true);

    CardCompositeView.prototype.onRender.apply(this, arguments);
  },

  onDestroy: function () {
    CardCompositeView.prototype.onDestroy.apply(this, arguments);
    this._removePopover();
    UtilsUI.releaseCocosSprite(this._popoverSpriteGLData);
    UtilsUI.releaseCocosSprite(this._popoverSignatureSpriteGLData);
  },

  onStartDragging: function () {
    CardCompositeView.prototype.onStartDragging.apply(this, arguments);
    this._removePopover();
  },

  onMouseEnter: function () {
    CardCompositeView.prototype.onMouseEnter.apply(this, arguments);
    this.$el.popover('show');
    var $popover = UtilsUI.getPopover(this.$el);
    var $popoverCardSprite = $popover.find('.card-sprite .sprite');
    this._popoverSpriteGLData = UtilsUI.showCocosSprite($popoverCardSprite, this._popoverSpriteGLData, this._popoverSpriteData, null, true, this.model.get('card'), this._popoverStartingSpriteData, this._popoverStartingSound);

    if (this._signatureSpriteData != null) {
      var $popoverSignatureCardSprite = $popover.find('.signature-card-sprite .sprite');
      this._popoverSignatureSpriteGLData = UtilsUI.showCocosSprite($popoverSignatureCardSprite, this._popoverSignatureSpriteGLData, this._signatureSpriteData, null, this.animated, null, null, null, this.signatureSpriteScalePopover);
    }
  },

  onMouseLeave: function () {
    CardCompositeView.prototype.onMouseLeave.apply(this, arguments);
    UtilsUI.resetCocosSprite(this._popoverSpriteGLData);
    UtilsUI.resetCocosSprite(this._popoverSignatureSpriteGLData);
    this.$el.popover('hide');
  },

  _removePopover: function () {
    UtilsUI.resetCocosSprite(this._popoverSpriteGLData);
    UtilsUI.resetCocosSprite(this._popoverSignatureSpriteGLData);
    UtilsUI.removePopover(this.$el);
  },

  _positionPopover: function () {
    return 'left';
  },

  _findSpriteData: function () {
    CardCompositeView.prototype._findSpriteData.apply(this, arguments);

    // retain sprite data for popover
    this._popoverSpriteData = this._activeSpriteData;
    this._popoverStartingSpriteData = this._activeStartingSpriteData;
    this._popoverStartingSound = this._activeStartingSound;

    // remove active starting sprite data
    this._activeStartingSpriteData = null;

    // active sprite and inactive sprite should be the same
    this._activeSpriteData = this._inactiveSpriteData;
  },

  getCardClasses: function () {
    return CardCompositeView.prototype.getCardClasses.apply(this, arguments) + ' deck-card';
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DeckCardCompositeView;
