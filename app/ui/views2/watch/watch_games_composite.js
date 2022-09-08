// pragma PKGS: nongame

const WatchGameItemView = require('./watch_game_item');
const WatchGamesEmptyView = require('./watch_games_empty');
const Template = require('./templates/watch_games_composite.hbs');

const WatchGamesCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'watch_games_collection',
  template: Template,

  childView: WatchGameItemView,
  childViewContainer: '.watch-game-list',
  emptyView: WatchGamesEmptyView,

  onShow() {
    let delay = 0;
    this.children.each((childView) => {
      childView.animateReveal(200.0, delay);
      delay += 100.0;
    });
  },

});

module.exports = WatchGamesCompositeView;
