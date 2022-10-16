const CONFIG = require('app/common/config');
const NotificationsManager = require('app/ui/managers/notifications_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const MessageItemView = require('app/ui/views/item/message');
const audio_engine = require('app/audio/audio_engine');
const BuddiesLayout = require('../layouts/buddies');
const NotificationsCompositeView = require('./notifications');

const MessageNotificationsView = NotificationsCompositeView.extend({

  id: 'app-message-notifications',

  childView: MessageItemView,

  initialize(opts) {
    NotificationsCompositeView.prototype.initialize.call(this, opts);
    this.listenTo(this, 'childview:select', this.onNotificationSelected);
  },

  onAddChild(childView) {
    // when showing too many messages, remove oldest immediately
    if (this.collection.length > CONFIG.MAX_BUDDY_MESSAGES_TO_PREVIEW) {
      NotificationsManager.getInstance().dismissNotification(this.collection.first());
    }

    // dismiss after short delay
    setTimeout(() => {
      childView.$el.fadeOut(CONFIG.QUEST_NOTIFICATION_FADE_DURATION * 1000.0, () => {
        NotificationsManager.getInstance().dismissNotification(childView.model);
      });
    }, CONFIG.BUDDY_MESSAGES_PREVIEW_DURATION * 1000.0);

    // Play a sound effect when showing a new message notification
    if (this._throttledNotificationSFXPlay == null) {
      // Deferrted creation of a throttled sfx player
      this._throttledNotificationSFXPlay = _.throttle((sfxAudio) => {
        audio_engine.current().play_effect(sfxAudio, false);
      }, CONFIG.INCOMING_MESSAGE_SFX_DELAY * 1000.0);
    }
    if (childView && childView.model && childView.model.get('audio')) {
      this._throttledNotificationSFXPlay(childView.model.get('audio'));
    }
  },

  onNotificationSelected(childView) {
    const message = childView.model;
    NavigationManager.getInstance().toggleModalViewByClass(BuddiesLayout, null);
    const buddiesLayout = NavigationManager.getInstance().getModalView();
    buddiesLayout.selectBuddy(message.get('fromId'));
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MessageNotificationsView;
