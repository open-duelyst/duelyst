'use strict';

var MainNotificationItemView = require('app/ui/views/item/main_notification');
var NotificationsCompositeView = require('./notifications');

var MainNotificationsView = NotificationsCompositeView.extend({

  id: 'app-main-notifications',

  childView: MainNotificationItemView,

});

// Expose the class either via CommonJS or the global object
module.exports = MainNotificationsView;
