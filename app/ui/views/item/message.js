'use strict';

var Logger = require('app/common/logger');
var MessageTmpl = require('app/ui/templates/item/message.hbs');
var ProgressionManager = require('app/ui/managers/progression_manager');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');

var MessageItemView = Backbone.Marionette.ItemView.extend({

  initialize: function () {
  },

  tagName: 'li',
  className: 'message',

  template: MessageTmpl,

  /* ui selector cache */
  ui: {},

  /* ui triggers hash */
  triggers: {
    click: 'select',
  },

  /* ui events hash */
  events: {
    'click .btn-watch-replay': 'onClickReplay',
  },

  onRender: function () {
  },

  onShow: function () {
    if (this.model.get('fromId') == ProfileManager.getInstance().get('id')) {
      this.$el.addClass('from-me');
    }
  },

  onClickReplay: function (e) {
    e.preventDefault();
    EventBus.getInstance().trigger(EVENTS.start_replay, {
      gameId: this.model.get('gameId'),
      userId: this.model.get('fromId'),
    });
    return false;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MessageItemView;
