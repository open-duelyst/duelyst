const CONFIG = require('app/common/config');
const NotificationsManager = require('app/ui/managers/notifications_manager');
const QuestNotificationItemView = require('app/ui/views/item/quest_notification');
const NotificationsCompositeView = require('./notifications');

const QuestNotificationsView = NotificationsCompositeView.extend({

  id: 'app-quest-notifications',

  childView: QuestNotificationItemView,

  onAddChild(childView) {
    // dismiss after short delay
    setTimeout(() => {
      childView.$el.fadeOut(CONFIG.QUEST_NOTIFICATION_FADE_DURATION * 1000.0, () => {
        NotificationsManager.getInstance().dismissNotification(childView.model);
      });
    }, CONFIG.QUEST_NOTIFICATION_DURATION * 1000.0);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = QuestNotificationsView;
