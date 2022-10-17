'use strict';

var CONFIG = require('app/common/config');
var CardCompositeView = require('app/ui/views/composite/card');

var CraftingCardCompositeView = CardCompositeView.extend({

  draggable: true,
  draggableScope: 'remove',

  onRender: function () {
    CardCompositeView.prototype.onRender.apply(this, arguments);

    // crafting cards should always set read states to true
    this.setRead(true);
    this.setLoreRead(true);
  },

  getCardClasses: function () {
    return CardCompositeView.prototype.getCardClasses.apply(this, arguments) + ' crafting-card';
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CraftingCardCompositeView;
