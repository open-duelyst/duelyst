'use strict';

var Templ = require('./templates/rift_runs_empty.hbs');

var RiftRunsEmpty = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  template: Templ,
  ui: {
  },

  onShow: function () {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = RiftRunsEmpty;
