'use strict';

var Animations = require('app/ui/views/animations');
var moment = require('moment');
var Analytics = require('app/common/analytics');
var openUrl = require('app/common/openUrl');
var Template = require('./templates/watch_stream_item.hbs');

var WatchStreamItemView = Backbone.Marionette.ItemView.extend({

  className: 'watch-stream-item',
  template: Template,

  events: {
    'click a': 'onOpenStream',
    'click button': 'onOpenStream',
  },

  init: function () {
  },

  onRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
  },

  onDestroy: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  animateReveal: function (duration, delay) {
    Animations.fadeZoomUpIn.call(this, duration, delay, 0, 0, 0.9);
  },

  onOpenStream: function (e) {
    openUrl(this.model.get('url'));

    var streamerName = '';
    if (this.model != null && this.model.get('name') != null) {
      streamerName = this.model.get('name');
    }
    Analytics.track('watch stream', {
      category: Analytics.EventCategory.Watch,
      streamer_name: streamerName,
    }, {
      labelKey: 'streamer_name',
    });

    e.preventDefault();
    return false;
  },

});

module.exports = WatchStreamItemView;
