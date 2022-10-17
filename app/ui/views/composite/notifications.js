'use strict';

var NotificationItemView = require('app/ui/views/item/notification');
var NotificationsViewTemplate = require('app/ui/templates/composite/notifications.hbs');

/**
 * Base notifications composite view used to show notification items.
 */

var NotificationsCompositeView = Backbone.Marionette.CompositeView.extend({

  childView: NotificationItemView,
  childViewContainer: '.notifications',

  template: NotificationsViewTemplate,

});

// Expose the class either via CommonJS or the global object
module.exports = NotificationsCompositeView;
