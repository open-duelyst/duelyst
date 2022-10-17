'use strict';

var ViewTempl = require('app/ui/templates/item/maintenance_announcement.hbs');

var MaintenanceAnnouncementItemView = Backbone.Marionette.ItemView.extend({

  template: ViewTempl,

  events: {
    'click .close': 'dismiss',
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
  },

  /* region MARIONETTE EVENTS */

  onRender: function () {
    if (this.model.get('message')) {
      this.$el.removeClass('hide');
    } else {
      this.$el.addClass('hide');
    }
  },

  onShow: function () {
    // Animations.cssClassAnimation.call(this, "active");
  },

  /* endregion MARIONETTE EVENTS */

  dismiss: function () {
    this.$el.addClass('hide');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MaintenanceAnnouncementItemView;
