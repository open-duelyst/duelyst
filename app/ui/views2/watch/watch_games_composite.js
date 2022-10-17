// pragma PKGS: nongame

'use strict';

var WatchGameItemView = require('./watch_game_item');
var WatchGamesEmptyView = require('./watch_games_empty');
var Template = require('./templates/watch_games_composite.hbs');

var WatchGamesCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'watch_games_collection',
  template: Template,

  childView: WatchGameItemView,
  childViewContainer: '.watch-game-list',
  emptyView: WatchGamesEmptyView,

  onShow: function () {
    var delay = 0;
    this.children.each(function (childView) {
      childView.animateReveal(200.0, delay);
      delay += 100.0;
    }.bind(this));
  },

});

module.exports = WatchGamesCompositeView;
