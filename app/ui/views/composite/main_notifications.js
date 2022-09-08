const MainNotificationItemView = require('app/ui/views/item/main_notification');
const NotificationsCompositeView = require('./notifications');

const MainNotificationsView = NotificationsCompositeView.extend({

  id: 'app-main-notifications',

  childView: MainNotificationItemView,

});

// Expose the class either via CommonJS or the global object
module.exports = MainNotificationsView;
