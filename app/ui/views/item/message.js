const Logger = require('app/common/logger');
const MessageTmpl = require('app/ui/templates/item/message.hbs');
const ProgressionManager = require('app/ui/managers/progression_manager');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');

const MessageItemView = Backbone.Marionette.ItemView.extend({

  initialize() {
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

  onRender() {
  },

  onShow() {
    if (this.model.get('fromId') == ProfileManager.getInstance().get('id')) {
      this.$el.addClass('from-me');
    }
  },

  onClickReplay(e) {
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
