'use strict';

var CONFIG = require('app/common/config');
var NotificationsManager = require('app/ui/managers/notifications_manager');
var QuestNotificationItemView = require('app/ui/views/item/quest_notification');
var NotificationsCompositeView = require('./notifications');

var QuestNotificationsView = NotificationsCompositeView.extend({

  id: 'app-quest-notifications',

  childView: QuestNotificationItemView,

  onAddChild: function (childView) {
    // dismiss after short delay
    setTimeout(function () {
      childView.$el.fadeOut(CONFIG.QUEST_NOTIFICATION_FADE_DURATION * 1000.0, function () {
        NotificationsManager.getInstance().dismissNotification(childView.model);
      }.bind(this));
    }.bind(this), CONFIG.QUEST_NOTIFICATION_DURATION * 1000.0);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = QuestNotificationsView;
