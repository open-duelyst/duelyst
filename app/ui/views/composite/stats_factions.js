'use strict';

var StatsFactionItemView = require('app/ui/views/item/stats_faction');
var StatsFactionsCompositeViewTempl = require('app/ui/templates/composite/stats_factions.hbs');

var StatsFactionsCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'stats-factions',

  template: StatsFactionsCompositeViewTempl,

  childView: StatsFactionItemView,
  childViewContainer: '.factions',

});

// Expose the class either via CommonJS or the global object
module.exports = StatsFactionsCompositeView;
