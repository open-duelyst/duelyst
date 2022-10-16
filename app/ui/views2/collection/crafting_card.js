const CONFIG = require('app/common/config');
const CardCompositeView = require('app/ui/views/composite/card');

const CraftingCardCompositeView = CardCompositeView.extend({

  draggable: true,
  draggableScope: 'remove',

  onRender() {
    CardCompositeView.prototype.onRender.apply(this, arguments);

    // crafting cards should always set read states to true
    this.setRead(true);
    this.setLoreRead(true);
  },

  getCardClasses() {
    return `${CardCompositeView.prototype.getCardClasses.apply(this, arguments)} crafting-card`;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CraftingCardCompositeView;
