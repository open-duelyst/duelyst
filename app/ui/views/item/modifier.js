'use strict';

var ModifierTmpl = require('app/ui/templates/item/modifier.hbs');

var ModifierItemView = Backbone.Marionette.ItemView.extend({

  className: 'media modifier',

  template: ModifierTmpl,

  /* ui selector cache */
  ui: {},

  /* Ui events hash */
  events: {},

  /* on render callback */
  onRender: function () {},
});

// Expose the class either via CommonJS or the global object
module.exports = ModifierItemView;
