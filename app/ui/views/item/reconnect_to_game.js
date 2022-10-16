const EventBus = require('app/common/eventbus');
const ReconnectToGameTemplate = require('app/ui/templates/item/reconnect_to_game.hbs');

const ReconnectToGameItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-reconnect-to-game',
  className: 'status',

  template: ReconnectToGameTemplate,

  /* ui selector cache */
  ui: {
    exit: '.exit',
  },

  /* ui events hash */
  events: {
    'click .exit': 'onClickExit',
  },

  initialize() {
  },

  /* on render callback */
  onRender() {
  },

  onClickExit() {
    EventBus.getInstance().trigger('APP:cancelConnection');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ReconnectToGameItemView;
