const ViewTempl = require('app/ui/templates/item/maintenance_announcement.hbs');

const MaintenanceAnnouncementItemView = Backbone.Marionette.ItemView.extend({

  template: ViewTempl,

  events: {
    'click .close': 'dismiss',
  },

  initialize() {
    this.listenTo(this.model, 'change', this.render);
  },

  /* region MARIONETTE EVENTS */

  onRender() {
    if (this.model.get('message')) {
      this.$el.removeClass('hide');
    } else {
      this.$el.addClass('hide');
    }
  },

  onShow() {
    // Animations.cssClassAnimation.call(this, "active");
  },

  /* endregion MARIONETTE EVENTS */

  dismiss() {
    this.$el.addClass('hide');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MaintenanceAnnouncementItemView;
