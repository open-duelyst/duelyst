'use strict';

var Animations = require('app/ui/views/animations');
var Template = require('./templates/watch_games_empty.hbs');

var WatchGamesEmptyView = Backbone.Marionette.ItemView.extend({

  className: 'watch-games-empty',
  template: Template,

  animateReveal: function (duration, delay) {
    Animations.fadeZoomUpIn.call(this, duration, delay, 0, 0, 0.9);
  },

});

module.exports = WatchGamesEmptyView;
