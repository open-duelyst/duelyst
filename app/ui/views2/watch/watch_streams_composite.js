// pragma PKGS: nongame

'use strict';

var WatchStreamItemView = require('./watch_stream_item');
var Template = require('./templates/watch_streams_composite.hbs');
var WatchGamesEmptyView = require('./watch_games_empty');

var WatchStreamsCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'watch_streams_collection',
  template: Template,
  childViewContainer: '.watch-streams-list',
  childView: WatchStreamItemView,
  emptyView: WatchGamesEmptyView,

  onShow: function () {
    var delay = 0;
    this.children.each(function (childView) {
      childView.animateReveal(200.0, delay);
      delay += 100.0;
    }.bind(this));
  },

});

module.exports = WatchStreamsCompositeView;
