const Logger = require('app/common/logger');
const audio_engine = require('app/audio/audio_engine');
const NotificationsManager = require('app/ui/managers/notifications_manager');
const NotificationTmpl = require('app/ui/templates/item/notification.hbs');

/**
 * Base notification item view class.
 */

const NotificationItemView = Backbone.Marionette.ItemView.extend({

  className: 'notification',

  template: NotificationTmpl,

  ui: {},

  events: {
    'click .dismiss': 'onDismiss',
    'click .cta-button': 'onAcceptCTA',
  },

  onShow() {
    // play notification sound
    if (this.model.get('audio')) {
      audio_engine.current().play_effect(this.model.get('audio'), false);
    }
  },

  onDismiss() {
    NotificationsManager.getInstance().dismissNotification(this.model);
  },

  onAcceptCTA() {
    NotificationsManager.getInstance().acceptCTAForNotification(this.model);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = NotificationItemView;
