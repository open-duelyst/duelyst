'use strict';

var StatsSeasonRankItemView = require('app/ui/views/item/stats_season_rank');
var StatsSeasonsCompositeViewTempl = require('app/ui/templates/composite/stats_seasons.hbs');

var StatsSeasonsCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'stats-seasons',

  template: StatsSeasonsCompositeViewTempl,

  childView: StatsSeasonRankItemView,
  childViewContainer: '.seasons',

});

// Expose the class either via CommonJS or the global object
module.exports = StatsSeasonsCompositeView;
