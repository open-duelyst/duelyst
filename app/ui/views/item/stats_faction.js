'use strict';

var StatsFactionItemViewTempl = require('app/ui/templates/item/stats_faction.hbs');

var StatsFactionItemView = Backbone.Marionette.ItemView.extend({

  className: 'stat-faction',

  template: StatsFactionItemViewTempl,

});

// Expose the class either via CommonJS or the global object
module.exports = StatsFactionItemView;
