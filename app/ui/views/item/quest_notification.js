'use strict';

var Logger = require('app/common/logger');
var Animations = require('app/ui/views/animations');
var QuestNotificationItemTmpl = require('app/ui/templates/item/quest_notification.hbs');
var NotificationItemView = require('./notification');

var QuestNotificationItemView = NotificationItemView.extend({

  className: 'notification quest-notification',
  template: QuestNotificationItemTmpl,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

});

// Expose the class either via CommonJS or the global object
module.exports = QuestNotificationItemView;
