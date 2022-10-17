'use strict';

var Logger = require('app/common/logger');
var audio_engine = require('app/audio/audio_engine');
var NotificationsManager = require('app/ui/managers/notifications_manager');
var NotificationTmpl = require('app/ui/templates/item/notification.hbs');

/**
 * Base notification item view class.
 */

var NotificationItemView = Backbone.Marionette.ItemView.extend({

  className: 'notification',

  template: NotificationTmpl,

  ui: {},

  events: {
    'click .dismiss': 'onDismiss',
    'click .cta-button': 'onAcceptCTA',
  },

  onShow: function () {
    // play notification sound
    if (this.model.get('audio')) {
      audio_engine.current().play_effect(this.model.get('audio'), false);
    }
  },

  onDismiss: function () {
    NotificationsManager.getInstance().dismissNotification(this.model);
  },

  onAcceptCTA: function () {
    NotificationsManager.getInstance().acceptCTAForNotification(this.model);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = NotificationItemView;
