// pragma PKGS: nongame

const WatchStreamItemView = require('./watch_stream_item');
const Template = require('./templates/watch_streams_composite.hbs');
const WatchGamesEmptyView = require('./watch_games_empty');

const WatchStreamsCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'watch_streams_collection',
  template: Template,
  childViewContainer: '.watch-streams-list',
  childView: WatchStreamItemView,
  emptyView: WatchGamesEmptyView,

  onShow() {
    let delay = 0;
    this.children.each((childView) => {
      childView.animateReveal(200.0, delay);
      delay += 100.0;
    });
  },

});

module.exports = WatchStreamsCompositeView;
