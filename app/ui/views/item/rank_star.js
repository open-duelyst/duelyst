const RankStarTmpl = require('app/ui/templates/item/rank_star.hbs');

const RankStarView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'star',
  template: RankStarTmpl,

});

// Expose the class either via CommonJS or the global object
module.exports = RankStarView;
