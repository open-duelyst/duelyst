// pragma PKGS: alwaysloaded

const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const UtilityMenuTmpl = require('app/ui/templates/item/utility_menu.hbs');
const ChatManager = require('app/ui/managers/chat_manager');
const QuestsManager = require('app/ui/managers/quests_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const NotificationsManager = require('app/ui/managers/notifications_manager');
const Animations = require('app/ui/views/animations');
const ProgressionManager = require('app/ui/managers/progression_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const BuddiesLayout = require('../layouts/buddies');
const SettingsMenuView = require('./settings_menu');

/**
 * Basic utility menu that shows buttons for settings and buddies/chat.
 */
const UtilityMenuItemView = Backbone.Marionette.CompositeView.extend({

  id: 'app-utility-menu',
  className: 'utility-menu',

  template: UtilityMenuTmpl,

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  /* region LAYOUT */

  onResize() {
    // override in sub class
  },

  /* endregion LAYOUT */

  onBeforeRender() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');
  },

  onRender() {
    // check login state
    if (ProfileManager.getInstance().get('id')) {
      this.onLoggedInRender();
    } else {
      this.onLoggedOutRender();
    }

    this.$el.find('[data-toggle=\'tooltip\']').tooltip({ container: CONFIG.OVERLAY_SELECTOR, trigger: 'hover' });

    this.onResize();
  },

  onShow() {
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

  animateReveal() {
    const buttons = this.$el.find('.animate-reveal:visible');
    let delay = 400;
    for (let i = 0; i < buttons.length; i++) {
      $(buttons[i]).css('opacity', 0);
      buttons[i].animate([
        { opacity: 0.0, transform: 'translateY(10px)' },
        { opacity: 1.0, transform: 'translateY(0px)' },
      ], {
        duration: 200,
        delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      delay += 100;
    }
  },

  onDestroy() {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
    this.$el.find('[data-toggle=\'popover\']').popover('destroy');
  },

  onLoggedIn() {
    this.onLoggedInShow();
    this.render();
  },

  onLoggedOut() {
    this.onLoggedOutShow();
    this.render();
  },

  onLoggedInShow() {
    ChatManager.getInstance().onReady(() => {
      if (this.isDestroyed) return; // this view was destroyed

      // listen for unread messages
      this.listenTo(ChatManager.getInstance().conversations, 'change:unread remove', this.onUpdateUnreadConversations);
      this.listenTo(ChatManager.getInstance().getBuddiesCollection(), 'presence_change', this.onUpdateFriendCount);

      // listen for chat manager disconnect
      this.listenToOnce(ChatManager.getInstance(), 'before_disconnect', function () {
        this.stopListening(ChatManager.getInstance().conversations);
        this.stopListening(ChatManager.getInstance().getBuddiesCollection());
      });
    });
  },

  onLoggedOutShow() {
    this.updateUnreadConversations(0);
    this.updateFriendCount(0);
  },

  onLoggedInRender() {
    ChatManager.getInstance().onReady(() => {
      if (this.isDestroyed) return; // this view was destroyed

      if (ChatManager.getInstance().getConnected()) {
        this.onUpdateUnreadConversations();
        this.onUpdateFriendCount();
      }
    });
    this.$el.find('.buddy-list').on('click', this.toggleBuddyList.bind(this));
    this.$el.find('.settings').on('click', this.toggleSettingsMenu.bind(this));
  },

  onLoggedOutRender() {
    this.updateUnreadConversations(0);
    this.updateFriendCount(0);
    this.$el.find('.buddy-list').addClass('disabled');
    this.$el.find('.settings').addClass('disabled');
  },

  onUpdateUnreadConversations() {
    this.updateUnreadConversations(ChatManager.getInstance().conversations.getUnreadConversationCount());
  },

  updateUnreadConversations(unreadConversationsCount) {
    if (unreadConversationsCount == null) { unreadConversationsCount = 0; }
    this.$el.find('.unread-conversation-count').text(unreadConversationsCount);
    if (unreadConversationsCount > 0) {
      this.$el.find('.unread-conversation-block').removeClass('hide');
    } else {
      this.$el.find('.unread-conversation-block').addClass('hide');
    }
  },

  onUpdateFriendCount() {
    this.updateFriendCount(ChatManager.getInstance().getBuddiesCollection().getOnlineBuddyCount());
  },

  updateFriendCount(onlineBuddyCount) {
    this.$el.find('.buddy-count').text(onlineBuddyCount);
  },

  toggleBuddyList() {
    NavigationManager.getInstance().toggleModalViewByClass(BuddiesLayout, null);
  },

  toggleSettingsMenu() {
    NavigationManager.getInstance().toggleModalViewByClass(SettingsMenuView, { model: ProfileManager.getInstance().profile });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UtilityMenuItemView;
