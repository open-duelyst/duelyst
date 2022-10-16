const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const BoosterPackPreviewTmpl = require('app/ui/templates/item/booster_pack_preview.hbs');

const BoosterPackPreviewItemView = Backbone.Marionette.ItemView.extend({

  initialize() {
    Logger.module('UI').log('initialize a BoosterPackPreviewItemView');
  },

  className: 'booster-pack-preview',

  template: BoosterPackPreviewTmpl,

  onRender() {
    this.$el.attr('id', this.model.get('id'));
    this.$el.addClass(`card-set-${parseInt(this.model.get('card_set')) || SDK.CardSet.Core}`);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = BoosterPackPreviewItemView;
