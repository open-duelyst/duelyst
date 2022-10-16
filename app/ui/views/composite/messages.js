const MessageItemView = require('app/ui/views/item/message');
const MessagesTmpl = require('app/ui/templates/composite/messages.hbs');
const ProfileManager = require('app/ui/managers/profile_manager');

const MessagesView = Backbone.Marionette.CompositeView.extend({

  initialize() {
    Logger.module('UI').log('initialize a Messages CompositeView');
  },

  /* the item view which gets created */
  childView: MessageItemView,
  /* where are we appending the items views */
  childViewContainer: '.chats',

  // Overriding appendHtml method to prepend new message divs instead of append
  appendHtml(cv, iv, index) {
    const $container = this.getItemViewContainer(cv);
    $container.prepend(iv.el);
  },

  template: MessagesTmpl,

  /* ui selector cache */
  ui: {},

  /* Ui events hash */
  events: {
    'click button#chat-submit': 'onSubmitClick',
    'click .wclose': 'onDestroy',
    'click .wminimize': 'onMinimize',
  },

  /* on render callback */
  onRender() {},

  /* event handlers */
  onSubmitClick(e) {
    e.preventDefault();
    const value = this.$('#chat-input').val().trim();
    this.collection.add({
      body: value,
      sender: ProfileManager.getInstance().profile.getFullName(),
      timestamp: 'now',
    });
    this.$('#chat-input').val('');
  },

  onMinimize(e) {
    e.preventDefault();
    const $wcontent = this.$('.widget-content');
    if ($wcontent.is(':visible')) {
      $(this).children('i').removeClass('icon-chevron-up');
      $(this).children('i').addClass('icon-chevron-down');
    } else {
      $(this).children('i').removeClass('icon-chevron-down');
      $(this).children('i').addClass('icon-chevron-up');
    }
    $wcontent.toggle(500);
  },

  onDestroy(e) {
    /*
    e.preventDefault();
    var $wbox = this.$('.widget');
    $wbox.hide(100);
    */
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MessagesView;
