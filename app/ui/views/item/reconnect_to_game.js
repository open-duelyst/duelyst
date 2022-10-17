'use strict';

var EventBus = require('app/common/eventbus');
var ReconnectToGameTemplate = require('app/ui/templates/item/reconnect_to_game.hbs');

var ReconnectToGameItemView = Backbone.Marionette.ItemView.extend({

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

  initialize: function () {
  },

  /* on render callback */
  onRender: function () {
  },

  onClickExit: function () {
    EventBus.getInstance().trigger('APP:cancelConnection');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ReconnectToGameItemView;
