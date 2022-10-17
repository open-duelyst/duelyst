'use strict';

var ProfileErrorViewTempl = require('./templates/profile_error_item.hbs');

var ProfileErrorView = Backbone.Marionette.ItemView.extend({

  className: 'loading-region',

  template: ProfileErrorViewTempl,

  onShow: function () {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ProfileErrorView;
