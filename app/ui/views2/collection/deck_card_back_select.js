'use strict';

var SDK = require('app/sdk');
var audio_engine = require('app/audio/audio_engine');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var DeckPreviewItemView = require('./deck_preview');
var DeckCardBackSelectTmpl = require('./templates/deck_card_back_select.hbs');

var DeckCardBackSelectView = Backbone.Marionette.LayoutView.extend({

  id: 'app-deck-card-back-select',
  template: DeckCardBackSelectTmpl,

  regions: {
    deckPreviewRegion: { selector: '#app-deck-preview-region' },
  },

  ui: {
    $cardBack: '.deck-card-back',
    $cardBackImg: '.deck-card-back-img',
    $selectButton: '.select',
  },

  events: {
    'click .select': 'onSelect',
    'click .cancel': 'onCancel',
  },

  _selectedDeckCardBackModel: null,

  /* region MARIONETTE */

  onRender: function () {
    this.showSelectedDeckCardBack();
    this.showSelectedDeckCardBackUsability();

    // make this element a droppable area
    this.$el.droppable({
      drop: this.onCardDropped.bind(this),
      scope: 'add',
    });
  },

  onShow: function () {
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);
    this.listenTo(this.model, 'sync', this.onDeckSync);

    this.bindDeckModel();
  },

  onDeckSync: function () {
    if (this.model.hasChanged()) {
      this.bindDeckModel();
    }
  },

  bindDeckModel: function () {
    var deckPreviewItemView = new DeckPreviewItemView({ model: this.model });
    this.deckPreviewRegion.show(deckPreviewItemView);

    // show current deck card back
    var cardBackId = this.model.get('card_back_id');
    var cardBackData = SDK.CosmeticsFactory.cardBackForIdentifier(cardBackId);
    var cardBackModel = new Backbone.Model(cardBackData);
    this.selectCard(cardBackModel);
  },

  bindSelectedDeckCardBack: function () {
    if (this._selectedDeckCardBackModel != null) {
      this.showSelectedDeckCardBack();
      this.bindSelectedDeckCardBackUsability();
    }
  },

  bindSelectedDeckCardBackUsability: function () {
    if (this._selectedDeckCardBackModel != null) {
      var cardBackId = this._selectedDeckCardBackModel.get('id');
      this._selectedDeckCardBackModel.set('_canUse', InventoryManager.getInstance().getCanUseCosmeticById(cardBackId));
      this._selectedDeckCardBackModel.set('_canPurchase', InventoryManager.getInstance().getCanPurchaseCosmeticById(cardBackId));
      this.showSelectedDeckCardBackUsability();
    }
  },

  showSelectedDeckCardBack: function () {
    if (this._selectedDeckCardBackModel != null) {
      var cardBackId = this._selectedDeckCardBackModel.get('id');
      var cardBackImg = SDK.CosmeticsFactory.cardBackForIdentifier(cardBackId).img;
      this.ui.$cardBackImg.attr('src', RSX.getResourcePathForScale(cardBackImg, CONFIG.resourceScaleCSS));
    }
  },

  showSelectedDeckCardBackUsability: function () {
    if (this._selectedDeckCardBackModel != null) {
      if (this._selectedDeckCardBackModel.get('_canPurchase')) {
        this.ui.$cardBack.addClass('purchasable');
        this.ui.$selectButton.removeClass('disabled').text('Unlock');
      } else {
        this.ui.$cardBack.removeClass('purchasable');
        if (!this._selectedDeckCardBackModel.get('_canUse')) {
          this.ui.$selectButton.addClass('disabled').text('Unavailable');
        } else {
          this.ui.$selectButton.removeClass('disabled').text('Save');
        }
      }
    }
  },

  /* endregion MARIONETTE */

  /* region EVENTS */

  onCardDropped: function (event, ui) {
    // don't respond to own cards
    var $draggable = ui.draggable;
    if ($draggable instanceof $ && !$draggable.hasClass('deck-card')) {
      $draggable.trigger('click');
    }
  },

  onCosmeticsCollectionChange: function (cosmeticModel) {
    if (this._selectedDeckCardBackModel != null) {
      var cardBackId = this._selectedDeckCardBackModel.get('id');
      if (cosmeticModel != null && cosmeticModel.get('cosmetic_id') === cardBackId) {
        this.bindSelectedDeckCardBackUsability();
      }
    }
  },

  onSelect: function () {
    if (this._selectedDeckCardBackModel != null) {
      var cardBackId = this._selectedDeckCardBackModel.get('id');
      if (this._selectedDeckCardBackModel.get('_canPurchase')) {
        // buy card back
        var productData = SDK.CosmeticsFactory.cosmeticProductDataForIdentifier(cardBackId);
        return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
          .catch(function () {});
      } else if (this._selectedDeckCardBackModel.get('_canUse')) {
        // save card back
        this.model.set('card_back_id', cardBackId);
        this.trigger('select');
      }
    }
  },

  onCancel: function () {
    this.deselectCard();
  },

  /* endregion EVENTS */

  /* region SELECT */

  selectCard: function (cardBackModel) {
    if (cardBackModel != null && (this._selectedDeckCardBackModel == null || this._selectedDeckCardBackModel.get('id') !== cardBackModel.get('id'))) {
      this._selectedDeckCardBackModel = cardBackModel;
      this.bindSelectedDeckCardBack();
      Animations.cssClassAnimation.call(this.ui.$cardBack, 'active');
      return true;
    }
    return false;
  },

  selectCardView: function (cardView) {
    var changed;
    var cardModel = cardView && cardView.model;
    if (cardModel != null) {
      changed = this.selectCard(cardModel);
      if (changed) {
        // flash card in collection
        Animations.cssClassAnimation.call(cardView, 'flash-brightness');

        audio_engine.current().play_effect_for_interaction(RSX.sfx_collection_next.audio, CONFIG.SELECT_SFX_PRIORITY);
      } else {
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
      }
    }
    return changed;
  },

  deselectCard: function () {
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_cardburn.audio, CONFIG.SELECT_SFX_PRIORITY);
    this.trigger('cancel');
    return true;
  },

  deselectCardView: function () {
    return this.deselectCard();
  },

  /* endregion SELECT */

});

// Expose the class either via CommonJS or the global object
module.exports = DeckCardBackSelectView;
