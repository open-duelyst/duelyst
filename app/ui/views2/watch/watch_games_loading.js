const Template = require('./templates/watch_games_loading.hbs');

const WatchGamesLoadingView = Backbone.Marionette.ItemView.extend({

  className: 'watch-games-loading',
  template: Template,

});

// Expose the class either via CommonJS or the global object
module.exports = WatchGamesLoadingView;
