const EmotesListTempl = require('app/ui/templates/composite/emotes-list.hbs');
const EmoteItemView = require('app/ui/views/item/emote');
const Animations = require('app/ui/views/animations');

const EmotesListCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'emotes-list',

  template: EmotesListTempl,

  childView: EmoteItemView,

  // animateIn: Animations.fadeIn,
  // animateOut: Animations.fadeOut

});

// Expose the class either via CommonJS or the global object
module.exports = EmotesListCompositeView;
