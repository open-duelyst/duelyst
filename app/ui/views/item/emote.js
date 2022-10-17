'use strict';

var EmotesLayoutTempl = require('app/ui/templates/item/emote.hbs');
var Animations = require('app/ui/views/animations');
var InventoryManager = require('app/ui/managers/inventory_manager');

var EmoteItemView = Backbone.Marionette.ItemView.extend({

  className: 'btn emote',

  template: EmotesLayoutTempl,

  events: {
    click: 'onSelect',
  },

  animateIn: function () {
    Animations.cssClassAnimation.call(this, 'active');
  },
  animateOut: Animations.fadeOut,

  /* region MARIONETTE EVENTS */

  onShow: function () {
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);
  },

  onRender: function () {
    this._bindUsability();
  },

  _bindUsability: function () {
    if (this.model.get('_canPurchase')) {
      this.$el.addClass('purchasable');
      this.$el.removeClass('disabled');
    } else {
      this.$el.removeClass('purchasable');
      if (!this.model.get('_canUse')) {
        this.$el.addClass('disabled');
      } else {
        this.$el.removeClass('disabled');
      }
    }
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENTS */

  onCosmeticsCollectionChange: function (cosmeticModel) {
    var emoteId = this.model.get('id');
    if (cosmeticModel != null && cosmeticModel.get('cosmetic_id') === emoteId) {
      this.model.set('_canUse', InventoryManager.getInstance().getCanUseCosmeticById(emoteId));
      this.model.set('_canPurchase', InventoryManager.getInstance().getCanPurchaseCosmeticById(emoteId));
      this._bindUsability();
    }
  },

  onSelect: function (e) {
    var saleData = {};
    var saleId = $(e.currentTarget).data('sale-id');
    var salePriceStr = $(e.currentTarget).data('sale-price');

    if (saleId != null && saleId != '') {
      saleData.saleId = saleId;
    }
    if (salePriceStr != null && salePriceStr != '' && !_.isNaN(parseInt(salePriceStr))) {
      saleData.salePrice = parseInt(salePriceStr);
    }

    this.saleData = saleData;

    if (this.model.get('_canUse') || this.model.get('_canPurchase')) {
      this.trigger('select', this);
    }
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = EmoteItemView;
