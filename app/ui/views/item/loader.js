'use strict';

var LoaderTmpl = require('app/ui/templates/item/loader.hbs');

var LoaderItemView = Backbone.Marionette.ItemView.extend({

  template: LoaderTmpl,

  id: 'app-loader',

  /* ui selector cache */
  ui: {
    brandDynamic: '.brand-dynamic',
  },

  onRender: function () {
    // short timeout to ensure dom is rendered
    var delay = 120;
    setTimeout(function () {
      this.ui.brandDynamic.addClass('active');

      this.ui.brandDynamic.find('.draw-line').each(function () {
        var $element = $(this);
        var length = this.getTotalLength() / 5;
        $element.data('length', length);
        $element.css('stroke-dasharray', length);
        $element.css('stroke-dashoffset', length);

        length = $element.data('length');
        $element.css('transition', 'stroke-dashoffset 2.0s ease-in');
        $element.css('stroke-dashoffset', -length);
      });

      this.ui.brandDynamic.find('.fill').each(function () {
        var $element = $(this);
        $element.css('transition', 'opacity 1.0s ease-out');
        $element.css('transition-delay', '1.0s');
        $element.css('opacity', '1');
      });

      this.ui.brandDynamic.find('.ring-blue').removeClass('active');
      this.ui.brandDynamic.find('.ring-white').addClass('active');
    }.bind(this), delay);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = LoaderItemView;
