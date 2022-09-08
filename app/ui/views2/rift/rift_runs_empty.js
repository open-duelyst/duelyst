const Templ = require('./templates/rift_runs_empty.hbs');

const RiftRunsEmpty = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  template: Templ,
  ui: {
  },

  onShow() {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = RiftRunsEmpty;
