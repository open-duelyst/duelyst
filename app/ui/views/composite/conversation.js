const semver = require('semver');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const MessageView = require('app/ui/views/item/message');
const ConversationTemplate = require('app/ui/templates/composite/conversation.hbs');
const ChatManager = require('app/ui/managers/chat_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const GamesManager = require('app/ui/managers/games_manager');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');

const ConversationCompositeView = Backbone.Marionette.CompositeView.extend({

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

  onAddChild() {
    this._scrollToBottom();
  },

  onBeforeRender() {
    this._scrollTop = this.ui.$messagesList instanceof $ ? this.ui.$messagesList.scrollTop() : 0;
  },

  onRender() {
    this.ui.$messagesList.scrollTop(this._scrollTop);
    if (!ChatManager.getInstance().getConnected() || !ChatManager.getInstance().getBuddiesCollection().getIsBuddyOnlineById(this.model.get('userId'))) {
      this.ui.$currentMessage.addClass('disabled');
    }
  },

  onShow() {
    this._scrollToBottom();
  },

  _scrollToBottom() {
    this._scrollTop = this.ui.$messagesList.get(0).scrollHeight;
    this.ui.$messagesList.scrollTop(this._scrollTop);
  },

  onKeyPressed(e) {
    if (e.which === cc.KEY.enter) {
      e.preventDefault();
      this.onSendCurrentMessage();
    }
  },

  onSendCurrentMessage() {
    const message = this.ui.chatInput.val();

    if (message) {
      // clear chat input
      this.ui.chatInput.val('');

      // send message
      this.model.sendMessage(message);
    }
  },

  onShareLastReplay() {
    const lastGame = GamesManager.getInstance().playerGames.last();
    if (lastGame && lastGame.get('game_id') && lastGame.get('game_id')) {
      const diff = semver.diff(process.env.VERSION, lastGame.get('game_version'));
      if (!diff || (diff != 'major' && diff != 'minor')) {
        const message = this.ui.chatInput.val();
        this.model.sendReplay(lastGame.get('game_id'), lastGame.get('general_id'), message);
      } else {
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'This game is too old to share :(' }));
      }
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ConversationCompositeView;
