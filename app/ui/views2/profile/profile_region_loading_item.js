'use strict';

var ProfileRegionLoadingViewTempl = require('./templates/profile_region_loading_item.hbs');

var ProfileRegionLoadingView = Backbone.Marionette.ItemView.extend({

  className: 'loading-region',

  template: ProfileRegionLoadingViewTempl,

  onShow: function () {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileRegionLoadingView;
