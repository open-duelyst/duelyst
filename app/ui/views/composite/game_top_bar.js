'use strict';

var GameTopBarTmpl = require('app/ui/templates/composite/game_top_bar.hbs');
var ProfileManager = require('app/ui/managers/profile_manager');

var GameTopBarCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'app-game-topbar',
  template: GameTopBarTmpl,

  onShow: function () {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GameTopBarCompositeView;
