const ModifierTmpl = require('app/ui/templates/item/modifier.hbs');

const ModifierItemView = Backbone.Marionette.ItemView.extend({

  className: 'media modifier',

  template: ModifierTmpl,

  /* ui selector cache */
  ui: {},

  /* Ui events hash */
  events: {},

  /* on render callback */
  onRender() {},
});

// Expose the class either via CommonJS or the global object
module.exports = ModifierItemView;
