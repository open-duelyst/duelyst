'use strict';

var NotificationsCompositeView = require('./notifications');
var MainNotificationItemView = require('app/ui/views/item/main_notification');

var MainNotificationsView = NotificationsCompositeView.extend({

  id: "app-main-notifications",

  childView: MainNotificationItemView

});

// Expose the class either via CommonJS or the global object
module.exports = MainNotificationsView;
