const EmotesLayoutTempl = require('app/ui/templates/item/emote.hbs');
const Animations = require('app/ui/views/animations');
const InventoryManager = require('app/ui/managers/inventory_manager');

const EmoteItemView = Backbone.Marionette.ItemView.extend({

  className: 'btn emote',

  template: EmotesLayoutTempl,

  events: {
    click: 'onSelect',
  },

  animateIn() {
    Animations.cssClassAnimation.call(this, 'active');
  },
  animateOut: Animations.fadeOut,

  /* region MARIONETTE EVENTS */

  onShow() {
    this.listenTo(InventoryManager.getInstance().getCosmeticsCollection(), 'add remove', this.onCosmeticsCollectionChange);
  },

  onRender() {
    this._bindUsability();
  },

  _bindUsability() {
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

  onCosmeticsCollectionChange(cosmeticModel) {
    const emoteId = this.model.get('id');
    if (cosmeticModel != null && cosmeticModel.get('cosmetic_id') === emoteId) {
      this.model.set('_canUse', InventoryManager.getInstance().getCanUseCosmeticById(emoteId));
      this.model.set('_canPurchase', InventoryManager.getInstance().getCanPurchaseCosmeticById(emoteId));
      this._bindUsability();
    }
  },

  onSelect(e) {
    const saleData = {};
    const saleId = $(e.currentTarget).data('sale-id');
    const salePriceStr = $(e.currentTarget).data('sale-price');

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
