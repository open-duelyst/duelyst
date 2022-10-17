'use strict';

var CONFIG = require('app/common/config');
var NotificationsManager = require('app/ui/managers/notifications_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var MessageItemView = require('app/ui/views/item/message');
var audio_engine = require('app/audio/audio_engine');
var BuddiesLayout = require('../layouts/buddies');
var NotificationsCompositeView = require('./notifications');

var MessageNotificationsView = NotificationsCompositeView.extend({

  id: 'app-message-notifications',

  childView: MessageItemView,

  initialize: function (opts) {
    NotificationsCompositeView.prototype.initialize.call(this, opts);
    this.listenTo(this, 'childview:select', this.onNotificationSelected);
  },

  onAddChild: function (childView) {
    // when showing too many messages, remove oldest immediately
    if (this.collection.length > CONFIG.MAX_BUDDY_MESSAGES_TO_PREVIEW) {
      NotificationsManager.getInstance().dismissNotification(this.collection.first());
    }

    // dismiss after short delay
    setTimeout(function () {
      childView.$el.fadeOut(CONFIG.QUEST_NOTIFICATION_FADE_DURATION * 1000.0, function () {
        NotificationsManager.getInstance().dismissNotification(childView.model);
      }.bind(this));
    }.bind(this), CONFIG.BUDDY_MESSAGES_PREVIEW_DURATION * 1000.0);

    // Play a sound effect when showing a new message notification
    if (this._throttledNotificationSFXPlay == null) {
      // Deferrted creation of a throttled sfx player
      this._throttledNotificationSFXPlay = _.throttle(function (sfxAudio) {
        audio_engine.current().play_effect(sfxAudio, false);
      }.bind(this), CONFIG.INCOMING_MESSAGE_SFX_DELAY * 1000.0);
    }
    if (childView && childView.model && childView.model.get('audio')) {
      this._throttledNotificationSFXPlay(childView.model.get('audio'));
    }
  },

  onNotificationSelected: function (childView) {
    var message = childView.model;
    NavigationManager.getInstance().toggleModalViewByClass(BuddiesLayout, null);
    var buddiesLayout = NavigationManager.getInstance().getModalView();
    buddiesLayout.selectBuddy(message.get('fromId'));
  },

});

// Expose the class either via CommonJS or the global object
module.exports = MessageNotificationsView;
