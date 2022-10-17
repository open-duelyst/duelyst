'use strict';

var semver = require('semver');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var MessageView = require('app/ui/views/item/message');
var ConversationTemplate = require('app/ui/templates/composite/conversation.hbs');
var ChatManager = require('app/ui/managers/chat_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var GamesManager = require('app/ui/managers/games_manager');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');

var ConversationCompositeView = Backbone.Marionette.CompositeView.extend({

  _scrollTop: 0,

  className: 'conversation',

  /* the item view which gets created */
  childView: MessageView,
  /* where are we appending the items views */
  childViewContainer: '.messages-list',

  template: ConversationTemplate,

  /* ui selector cache */
  ui: {
    chatInput: '.chat-input',
    $messagesList: '.messages-list',
    $currentMessage: '.current-message',
  },

  /* Ui events hash */
  events: {
    'keydown .chat-input': 'onKeyPressed',
    'click .send': 'onSendCurrentMessage',
    'click #share_replay': 'onShareLastReplay',
  },

  onAddChild: function () {
    this._scrollToBottom();
  },

  onBeforeRender: function () {
    this._scrollTop = this.ui.$messagesList instanceof $ ? this.ui.$messagesList.scrollTop() : 0;
  },

  onRender: function () {
    this.ui.$messagesList.scrollTop(this._scrollTop);
    if (!ChatManager.getInstance().getConnected() || !ChatManager.getInstance().getBuddiesCollection().getIsBuddyOnlineById(this.model.get('userId'))) {
      this.ui.$currentMessage.addClass('disabled');
    }
  },

  onShow: function () {
    this._scrollToBottom();
  },

  _scrollToBottom: function () {
    this._scrollTop = this.ui.$messagesList.get(0).scrollHeight;
    this.ui.$messagesList.scrollTop(this._scrollTop);
  },

  onKeyPressed: function (e) {
    if (e.which === cc.KEY.enter) {
      e.preventDefault();
      this.onSendCurrentMessage();
    }
  },

  onSendCurrentMessage: function () {
    var message = this.ui.chatInput.val();

    if (message) {
      // clear chat input
      this.ui.chatInput.val('');

      // send message
      this.model.sendMessage(message);
    }
  },

  onShareLastReplay: function () {
    var lastGame = GamesManager.getInstance().playerGames.last();
    if (lastGame && lastGame.get('game_id') && lastGame.get('game_id')) {
      var diff = semver.diff(process.env.VERSION, lastGame.get('game_version'));
      if (!diff || (diff != 'major' && diff != 'minor')) {
        var message = this.ui.chatInput.val();
        this.model.sendReplay(lastGame.get('game_id'), lastGame.get('general_id'), message);
      } else {
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'This game is too old to share :(' }));
      }
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ConversationCompositeView;
