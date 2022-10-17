// pragma PKGS: alwaysloaded

'use strict';

var Analytics = require('app/common/analytics');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var ChatManager = require('app/ui/managers/chat_manager');
var GamesManager = require('app/ui/managers/games_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var BuddySelectionTemplate = require('app/ui/templates/layouts/buddy_selection.hbs');
var ConversationCompositeView = require('app/ui/views/composite/conversation');
var ConfirmDialogItemView = require('app/ui/views/item/confirm_dialog');
var ProfileLayout = require('app/ui/views2/profile/profile_layout');
var i18next = require('i18next');

var BuddySelectionLayout = Backbone.Marionette.LayoutView.extend({

  className: 'buddy buddy-selection',

  template: BuddySelectionTemplate,

  regions: {
    conversationRegion: '.conversation-region',
  },

  /* ui selector cache */
  ui: {
    $username: '.username-block',
    $statusLabel: '.status-label',
    $userProfile: '.user-profile',
    $spectateGame: '.spectate-game',
    $inviteBuddyToGame: '.invite-buddy-to-game',
  },

  /* Ui events hash */
  events: {
    'click .user-profile': 'onViewProfile',
    'click .spectate-game': 'onSpectateGame',
    'click .invite-buddy-to-game': 'onInviteBuddyToGame',
    'click .remove-buddy': 'onRemoveBuddy',
  },

  onBeforeRender: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onRender: function () {
    this.onUpdateBuddy();
    this.$el.find('[data-toggle=\'tooltip\']').tooltip();
  },

  onShow: function () {
    ChatManager.getInstance().onConnect().then(this.onChatManagerConnected.bind(this));
  },

  onDestroy: function () {
    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onChatManagerConnected: function () {
    this.conversationModel = ChatManager.getInstance().startConversation(this.model.userId);

    // show conversation container between me and my buddy
    this.conversationRegion.show(new ConversationCompositeView({ model: this.conversationModel, collection: this.conversationModel.messages }));

    this.listenTo(this.model, 'change', this.onUpdateBuddy);
  },

  onUpdateBuddy: function () {
    // update username
    this.ui.$username.text(this.model.get('username'));

    var lastStatus = this.model.previous('status');
    var currentStatus = this.model.getStatus();
    var localizedCurrentStatus = i18next.t('buddy_list.status_' + currentStatus);

    // reset based on status
    if (lastStatus != null) {
      this.$el.removeClass(lastStatus);
    }
    this.$el.addClass(currentStatus);
    this.ui.$statusLabel.text(localizedCurrentStatus);

    // set invite button enabled state
    if (this.getCanSendBuddyGameInvite()) {
      this.ui.$inviteBuddyToGame.removeClass('disabled');
    } else {
      this.ui.$inviteBuddyToGame.addClass('disabled');
    }

    if (this.getShowSpectateBuddyGame()) {
      if (this.getCanSpectateBuddyGame()) {
        this.ui.$spectateGame.removeClass('disabled');
      } else {
        this.ui.$spectateGame.addClass('disabled');
      }
      this.ui.$spectateGame.show();
      this.ui.$inviteBuddyToGame.hide();
    } else {
      this.ui.$spectateGame.hide();
      this.ui.$inviteBuddyToGame.show();
    }
  },

  onSpectateGame: function () {
    if (this.model.get('status') === ChatManager.STATUS_GAME) {
      NavigationManager.getInstance().showDialogForLoad().then(function () {
        // analytics call
        Analytics.track('spectate game', {
          category: Analytics.EventCategory.Chat,
        });
        GamesManager.getInstance().spectateBuddyGame(this.model.userId);
      }.bind(this));
    }
  },

  onViewProfile: function () {
    NavigationManager.getInstance().toggleModalViewByClass(ProfileLayout, { model: this.model });
  },

  onInviteBuddyToGame: function () {
    if (this.getCanSendBuddyGameInvite()) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      GamesManager.getInstance().invitePlayerToGame(this.model.userId, this.model.get('username'));
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
    }
  },

  onRemoveBuddy: function () {
    var confirmDialogItemView = new ConfirmDialogItemView({ title: 'Are you sure you want to remove ' + this.model.get('username') + '?' });
    this.listenToOnce(confirmDialogItemView, 'confirm', function () {
      ChatManager.getInstance().removeBuddy(this.model);
    }.bind(this));
    this.listenToOnce(confirmDialogItemView, 'cancel', function () {
      this.stopListening(confirmDialogItemView);
    }.bind(this));
    NavigationManager.getInstance().showDialogView(confirmDialogItemView);
  },

  getCanSendBuddyGameInvite: function () {
    // only allow buddy game invites when both me and buddy have valid status
    return ChatManager.getInstance().getIsMyStatusValidForBuddyGameInvite() && ChatManager.getInstance().getIsStatusValidForBuddyGameInvite(this.model.getStatus());
  },

  getShowSpectateBuddyGame: function () {
    return this.model.get('status') === ChatManager.STATUS_GAME;
  },

  getCanSpectateBuddyGame: function () {
    return this.model.get('status') === ChatManager.STATUS_GAME && ChatManager.getInstance().getIsMyStatusValidForBuddyGameInvite();
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BuddySelectionLayout;
