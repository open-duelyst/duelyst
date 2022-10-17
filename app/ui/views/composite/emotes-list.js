'use strict';

var EmotesListTempl = require('app/ui/templates/composite/emotes-list.hbs');
var EmoteItemView = require('app/ui/views/item/emote');
var Animations = require('app/ui/views/animations');

var EmotesListCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'emotes-list',

  template: EmotesListTempl,

  childView: EmoteItemView,

  // animateIn: Animations.fadeIn,
  // animateOut: Animations.fadeOut

});

// Expose the class either via CommonJS or the global object
module.exports = EmotesListCompositeView;
