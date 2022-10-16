const Animations = require('app/ui/views/animations');
const moment = require('moment');
const Analytics = require('app/common/analytics');
const openUrl = require('app/common/openUrl');
const Template = require('./templates/watch_stream_item.hbs');

const WatchStreamItemView = Backbone.Marionette.ItemView.extend({

  className: 'watch-stream-item',
  template: Template,

  events: {
    'click a': 'onOpenStream',
    'click button': 'onOpenStream',
  },

  init() {
  },

  onRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
  },

  onDestroy() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  animateReveal(duration, delay) {
    Animations.fadeZoomUpIn.call(this, duration, delay, 0, 0, 0.9);
  },

  onOpenStream(e) {
    openUrl(this.model.get('url'));

    let streamerName = '';
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
