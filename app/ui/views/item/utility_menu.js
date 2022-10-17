// pragma PKGS: alwaysloaded

'use strict';

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var RSX = require('app/data/resources');
var UtilityMenuTmpl = require('app/ui/templates/item/utility_menu.hbs');
var ChatManager = require('app/ui/managers/chat_manager');
var QuestsManager = require('app/ui/managers/quests_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NotificationsManager = require('app/ui/managers/notifications_manager');
var Animations = require('app/ui/views/animations');
var ProgressionManager = require('app/ui/managers/progression_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var BuddiesLayout = require('../layouts/buddies');
var SettingsMenuView = require('./settings_menu');

/**
 * Basic utility menu that shows buttons for settings and buddies/chat.
 */
var UtilityMenuItemView = Backbone.Marionette.CompositeView.extend({

  id: 'app-utility-menu',
  className: 'utility-menu',

  template: UtilityMenuTmpl,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  /* region LAYOUT */

  onResize: function () {
    // override in sub class
  },

  /* endregion LAYOUT */

  onBeforeRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');
  },

  onRender: function () {
    // check login state
    if (ProfileManager.getInstance().get('id')) {
      this.onLoggedInRender();
    } else {
      this.onLoggedOutRender();
    }

    this.$el.find('[data-toggle=\'tooltip\']').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });

    this.onResize();
  },

  onShow: function () {
    // check login state
    if (ProfileManager.getInstance().get('id')) {
      this.onLoggedInShow();
    } else {
      this.onLoggedOutShow();
    }

    // listen for login events
    this.listenTo(EventBus.getInstance(), EVENTS.session_logged_in, this.onLoggedIn);
    this.listenTo(EventBus.getInstance(), EVENTS.session_logged_out, this.onLoggedOut);

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();

    this.animateReveal();
  },

  animateReveal: function () {
    var buttons = this.$el.find('.animate-reveal:visible');
    var delay = 400;
    for (var i = 0; i < buttons.length; i++) {
      $(buttons[i]).css('opacity', 0);
      buttons[i].animate([
        { opacity: 0.0, transform: 'translateY(10px)' },
        { opacity: 1.0, transform: 'translateY(0px)' },
      ], {
        duration: 200,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      delay += 100;
    }
  },

  onDestroy: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');
  },

  onLoggedIn: function () {
    this.onLoggedInShow();
    this.render();
  },

  onLoggedOut: function () {
    this.onLoggedOutShow();
    this.render();
  },

  onLoggedInShow: function () {
    ChatManager.getInstance().onReady(function () {
      if (this.isDestroyed) return; // this view was destroyed

      // listen for unread messages
      this.listenTo(ChatManager.getInstance().conversations, 'change:unread remove', this.onUpdateUnreadConversations);
      this.listenTo(ChatManager.getInstance().getBuddiesCollection(), 'presence_change', this.onUpdateFriendCount);

      // listen for chat manager disconnect
      this.listenToOnce(ChatManager.getInstance(), 'before_disconnect', function () {
        this.stopListening(ChatManager.getInstance().conversations);
        this.stopListening(ChatManager.getInstance().getBuddiesCollection());
      });
    }.bind(this));
  },

  onLoggedOutShow: function () {
    this.updateUnreadConversations(0);
    this.updateFriendCount(0);
  },

  onLoggedInRender: function () {
    ChatManager.getInstance().onReady(function () {
      if (this.isDestroyed) return; // this view was destroyed

      if (ChatManager.getInstance().getConnected()) {
        this.onUpdateUnreadConversations();
        this.onUpdateFriendCount();
      }
    }.bind(this));
    this.$el.find('.buddy-list').on('click', this.toggleBuddyList.bind(this));
    this.$el.find('.settings').on('click', this.toggleSettingsMenu.bind(this));
  },

  onLoggedOutRender: function () {
    this.updateUnreadConversations(0);
    this.updateFriendCount(0);
    this.$el.find('.buddy-list').addClass('disabled');
    this.$el.find('.settings').addClass('disabled');
  },

  onUpdateUnreadConversations: function () {
    this.updateUnreadConversations(ChatManager.getInstance().conversations.getUnreadConversationCount());
  },

  updateUnreadConversations: function (unreadConversationsCount) {
    if (unreadConversationsCount == null) { unreadConversationsCount = 0; }
    this.$el.find('.unread-conversation-count').text(unreadConversationsCount);
    if (unreadConversationsCount > 0) {
      this.$el.find('.unread-conversation-block').removeClass('hide');
    } else {
      this.$el.find('.unread-conversation-block').addClass('hide');
    }
  },

  onUpdateFriendCount: function () {
    this.updateFriendCount(ChatManager.getInstance().getBuddiesCollection().getOnlineBuddyCount());
  },

  updateFriendCount: function (onlineBuddyCount) {
    this.$el.find('.buddy-count').text(onlineBuddyCount);
  },

  toggleBuddyList: function () {
    NavigationManager.getInstance().toggleModalViewByClass(BuddiesLayout, null);
  },

  toggleSettingsMenu: function () {
    NavigationManager.getInstance().toggleModalViewByClass(SettingsMenuView, { model: ProfileManager.getInstance().profile });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityMenuItemView;
