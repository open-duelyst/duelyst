const GameTopBarTmpl = require('app/ui/templates/composite/game_top_bar.hbs');
const ProfileManager = require('app/ui/managers/profile_manager');

const GameTopBarCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'app-game-topbar',
  template: GameTopBarTmpl,

  onShow() {
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GameTopBarCompositeView;
