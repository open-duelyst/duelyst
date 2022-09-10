const ProfileErrorViewTempl = require('./templates/profile_error_item.hbs');

const ProfileErrorView = Backbone.Marionette.ItemView.extend({

  className: 'loading-region',

  template: ProfileErrorViewTempl,

  onShow() {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileErrorView;
