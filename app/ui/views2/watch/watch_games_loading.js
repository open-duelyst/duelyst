'use strict';

var Template = require('./templates/watch_games_loading.hbs');

var WatchGamesLoadingView = Backbone.Marionette.ItemView.extend({

  className: 'watch-games-loading',
  template: Template,

});

// Expose the class either via CommonJS or the global object
module.exports = WatchGamesLoadingView;
