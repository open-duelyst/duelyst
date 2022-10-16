const Animations = require('app/ui/views/animations');
const Template = require('./templates/watch_games_empty.hbs');

const WatchGamesEmptyView = Backbone.Marionette.ItemView.extend({

  className: 'watch-games-empty',
  template: Template,

  animateReveal(duration, delay) {
    Animations.fadeZoomUpIn.call(this, duration, delay, 0, 0, 0.9);
  },

});

module.exports = WatchGamesEmptyView;
