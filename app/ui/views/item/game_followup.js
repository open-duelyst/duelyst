const SDK = require('app/sdk');
const Animations = require('app/ui/views/animations');
const GameFollowupTemplate = require('app/ui/templates/item/game_followup.hbs');

const GameFollowupItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-followup',
  className: 'modal duelyst-modal',

  template: GameFollowupTemplate,

  animateOut: Animations.fadeOut,

  initialize(options) {
    const { followupCard } = options;
    if (followupCard instanceof SDK.Card) {
      this.model.set('description', 'Choose a Target');
    }
  },

  onShow() {
    // Don't show skip or cancel in tutorial
    if (SDK.GameSession.getInstance().isTutorial()) {
      this.$el.find('button.btn-user-cancel').remove();
      this.$el.find('button.btn-user-skip').remove();
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = GameFollowupItemView;
