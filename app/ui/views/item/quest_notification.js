const Logger = require('app/common/logger');
const Animations = require('app/ui/views/animations');
const QuestNotificationItemTmpl = require('app/ui/templates/item/quest_notification.hbs');
const NotificationItemView = require('./notification');

const QuestNotificationItemView = NotificationItemView.extend({

  className: 'notification quest-notification',
  template: QuestNotificationItemTmpl,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

});

// Expose the class either via CommonJS or the global object
module.exports = QuestNotificationItemView;
