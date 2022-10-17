'use strict';

var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var BoosterPackPreviewTmpl = require('app/ui/templates/item/booster_pack_preview.hbs');

var BoosterPackPreviewItemView = Backbone.Marionette.ItemView.extend({

  initialize: function () {
    Logger.module('UI').log('initialize a BoosterPackPreviewItemView');
  },

  className: 'booster-pack-preview',

  template: BoosterPackPreviewTmpl,

  onRender: function () {
    this.$el.attr('id', this.model.get('id'));
    this.$el.addClass('card-set-' + (parseInt(this.model.get('card_set')) || SDK.CardSet.Core));
  },
});

// Expose the class either via CommonJS or the global object
module.exports = BoosterPackPreviewItemView;
