const ProfileRegionLoadingViewTempl = require('./templates/profile_region_loading_item.hbs');

const ProfileRegionLoadingView = Backbone.Marionette.ItemView.extend({

  className: 'loading-region',

  template: ProfileRegionLoadingViewTempl,

  onShow() {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileRegionLoadingView;
