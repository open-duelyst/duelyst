'use strict';

var RSX = require('app/data/resources');

var NotificationModel = Backbone.Model.extend({

  initialize: function () {
    // if the underlying firebase reference this notification is based on is removed, then destroy this notification
    // TODO: @eanticev: this gets called once to load data even though the data is already loaded and passed here... I may need to refactor this.
    if (this.get('firebaseRef')) {
      this.get('firebaseRef').on('value', this.firebaseValueChanged, this);
    }
  },

  firebaseValueChanged: function (snapshot) {
    if (snapshot.val() == null) {
      this.get('firebaseRef').off('value', this.firebaseValueChanged);
      this.destroy();
    }
  },

  defaults: {
    message: 'Notification',
    audio: RSX.sfx_ui_notification.audio,
  },
});

// Expose the class either via CommonJS or the global object
module.exports = NotificationModel;
