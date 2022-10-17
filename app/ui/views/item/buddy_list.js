'use strict';

var SDK = require('app/sdk');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var UtilsUI = require('app/common/utils/utils_ui');
var RSX = require('app/data/resources');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var BuddyListTemplate = require('app/ui/templates/item/buddy_list.hbs');
var BuddyPreviewTemplate = require('app/ui/templates/item/buddy_preview.hbs');
var ChatManager = require('app/ui/managers/chat_manager');
var GamesManager = require('app/ui/managers/games_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ListWithPooledRowsView = require('app/ui/extensions/list_with_pooled_rows');
var VirtualCollection = require('backbone-virtual-collection');
var _ = require('underscore');
var i18next = require('i18next');

var BuddyListView = ListWithPooledRowsView.extend({

  className: 'buddy-list',
  template: BuddyListTemplate,
  rowTemplate: BuddyPreviewTemplate,

  previouslySelectedBuddy: null,
  _showingLastOpponent: false,

  ui: {
    $listContainer: '.buddy-list-container',
    $list: '.buddy-list-items',
    $buddyControls: '.buddy-controls',
    $searchInput: 'input[type=\'search\']',
    $lastPlayed: '.last-played',
    $lastPlayedUsername: '.last-played .username',
    $addBuddyPrompt: '.add-buddy-prompt',
    $addBuddyInput: '.add-buddy-input',
    $addBuddyCancel: '.add-buddy-cancel',
    $addBuddySubmit: '.add-buddy-submit',
    $doNotDisturb: '.do-not-disturb',
  },

  events: {
    'click .buddy': 'onBuddySelected',
    'click .btn-add-last-played': 'onAddLastOpponent',
    'keyup input[type=\'search\']': 'onSearchInputChanged',
    'click .add-buddy': 'openAddBuddyPrompt',
    'keyup .add-buddy-input': 'onBuddyInputKeyPressed',
    'click .add-buddy-cancel': 'onCancelAddBuddyClick',
    'click .add-buddy-submit': 'onAddBuddyClick',
    'click .do-not-disturb': 'onDoNotDisturbClick',
  },

  initialize: function (opts) {
    // set the internal model/collection
    var presenceCollection = ChatManager.getInstance().getBuddiesCollection().getPresenceCollection();
    this.collection = new VirtualCollection(presenceCollection, {
      destroy_with: this,
    });
    this.previouslySelectedBuddy = this.collection.find(function (model) { return model.get('_active'); });

    // start listening then check for unread messages
    this.listenTo(ChatManager.getInstance().conversations, 'change:unread', this.onUpdateUnreadMessages);
    ChatManager.getInstance().conversations.each(function (conversationModel) {
      this.onUpdateUnreadMessages(conversationModel);
    }.bind(this));

    this.listenTo(this.collection, 'change:status change:_lastUnreadMessageAt', function () {
      this.listenToOnce(this.collection, 'sort', this.bindItemViewsAfterSort);
    }.bind(this));

    ListWithPooledRowsView.prototype.initialize.call(this, opts);
  },

  onSearchInputChanged: _.throttle(function () {
    var query = this.ui.$searchInput.val();
    if (query && query.length > 0) {
      this.collection.updateFilter(function (model) {
        return model.get('username').toLowerCase().indexOf(query) >= 0;
      });
    } else {
      this.collection.updateFilter(function (model) {
        return true;
      });
    }
    this.bindAndReset();
  }, 100),

  onModelAddedOrRemoved: function (model, collection, options) {
    ListWithPooledRowsView.prototype.onModelAddedOrRemoved.apply(this, arguments);

    // clear last opponent as needed
    var lastOpponentName = this.model.get('lastOpponentName');
    if (lastOpponentName != null && model.get('username') === lastOpponentName) {
      this.updateLastOpponent();
    }
  },

  getListHeightForCache: function () {
    return (this.$el.height() - this.ui.$buddyControls.height()) / CONFIG.globalScale;
  },

  getRowHeightForCache: function () {
    return 65;
  },

  onRender: function () {
    this._updateDoNotDisturbStatus();
    this.updateLastOpponent(true);
    ListWithPooledRowsView.prototype.onRender.call(this);
  },

  onShow: function () {
    ListWithPooledRowsView.prototype.onShow.call(this);
    this.ui.$searchInput.focus();
    if (this.previouslySelectedBuddy) {
      this.selectBuddy(this.previouslySelectedBuddy);
    }
  },

  onDoNotDisturbClick: function () {
    ProfileManager.getInstance().profile.set('doNotDisturb', !ProfileManager.getInstance().profile.get('doNotDisturb'));
    this._updateDoNotDisturbStatus();
  },

  _updateDoNotDisturbStatus: function () {
    if (ProfileManager.getInstance().profile.get('doNotDisturb')) {
      this.ui.$doNotDisturb.addClass('active');
    } else {
      this.ui.$doNotDisturb.removeClass('active');
    }
  },

  updateLastOpponent: function (forRender) {
    // figure out last opponent name / id
    var lastOpponentName;
    var lastOpponentBuddy;
    var lastGame = GamesManager.getInstance().playerGames.last();
    if (lastGame != null && SDK.GameType.isMultiplayerGameType(lastGame.get('game_type'))) {
      // store last opponent data
      lastOpponentName = lastGame.get('opponent_username');
      this.model.set('lastOpponentName', lastOpponentName);
      this.ui.$lastPlayedUsername.text(lastOpponentName);

      // find whether opponent already exists as buddy
      var lastOpponentId = lastGame.get('opponent_id');
      lastOpponentBuddy = ChatManager.getInstance().getBuddiesCollection().find(function (buddy) {
        return buddy.get('id') == lastOpponentId;
      });
    }

    var wasShowingLastOpponent = this._showingLastOpponent;
    if (lastOpponentName != null && lastOpponentBuddy == null) {
      this.showLastOpponentUI();
    } else {
      this.hideLastOpponentUI();
    }

    if (!forRender && this._showingLastOpponent !== wasShowingLastOpponent) {
      // rebind when not rendering and something has changed
      this.bindItemViewsAfterScroll();
    }
  },

  showLastOpponentUI: function () {
    this._showingLastOpponent = true;

    // inset the list by the height of the last opponent UI
    this.scrollInsetTop = 71;

    // show last opponent UI
    this.ui.$lastPlayed.removeClass('invite-sent').addClass('active');
  },

  hideLastOpponentUI: function () {
    this._showingLastOpponent = false;

    // reset list inset
    this.scrollInsetTop = 0;

    // hide last opponent UI
    this.ui.$lastPlayed.removeClass('active invite-sent');
  },

  onAddLastOpponent: function () {
    var lastOpponentName = this.model.get('lastOpponentName');
    if (lastOpponentName != null) {
      ChatManager.getInstance().inviteBuddy(lastOpponentName);
      this.ui.$lastPlayed.addClass('invite-sent');
    }
  },

  // bindItemViewsAfterSort: _.throttle(this.bindItemViewsAfterSort,1000);

  bindModelToItemView: function (model, itemView) {
    // skip any binding if this view is in the process/done getting destroyed
    if (this.isDestroyed)
      return;

    Logger.module('UI').log('BuddyListView.bindModelToItemView() -> ' + model.get('username'));

    ListWithPooledRowsView.prototype.bindModelToItemView.call(this, model, itemView);

    // content
    var rankText = model.get('rank');
    if (_.isUndefined(rankText) || _.isNull(rankText))
      rankText = '?';
    $('.username-block', itemView).text(model.get('username'));
    var localizedCurrentStatus = i18next.t('buddy_list.status_' + model.getStatus());
    $('.status-label', itemView).text(localizedCurrentStatus);
    var portraitData = SDK.CosmeticsFactory.profileIconForIdentifier(model.get('portrait_id'));
    var portraitImg = portraitData.img;
    var portraitScaledImg = RSX.getResourcePathForScale(portraitImg, CONFIG.resourceScaleCSS);
    $('.portrait', itemView).attr('src', portraitScaledImg);
    $('.rank', itemView).text(rankText);

    // status
    if ($.data(itemView, 'status') != model.getStatus()) {
      $(itemView).removeClass($.data(itemView, 'status'));
      $(itemView).addClass(model.getStatus());
      $.data(itemView, 'status', model.getStatus());
    }

    if (_.isNumber(model.get('rank'))) {
      // division
      var divisionName = SDK.RankFactory.rankedDivisionNameForRank(model.get('rank')).toLowerCase();
      var divisionClassName = SDK.RankFactory.rankedDivisionAssetNameForRank(model.get('rank')).toLowerCase();
      if ($.data(itemView, 'division') != divisionName) {
        // Update the class name
        $(itemView).removeClass($.data(itemView, 'divisionClassName'));
        $(itemView).addClass(divisionClassName);

        // Store data
        $.data(itemView, 'division', divisionName);
        $.data(itemView, 'divisionClassName', divisionClassName);
      }
    }

    // active
    $(itemView).toggleClass('active', model.get('_active') || false);

    // unread
    $(itemView).toggleClass('unread', model.get('_unread') || false);
  },

  onBuddySelected: function (e) {
    var itemView = $(e.currentTarget);
    var index = itemView.data('index');
    var model = this.collection.at(index);

    if (model) {
      this.selectBuddy(model, itemView, true);
    }
  },

  selectBuddy: function (model, itemView, dontScroll) {
    var index = this.collection.indexOf(model);

    if (!itemView) {
      itemView = _.find(this.itemViewPool, function (itemView) { return $.data(itemView[0], 'index') == index; });
    }

    if (this.previouslySelectedBuddy) {
      this.previouslySelectedBuddy.set('_active', false);
      var previousModelIndex = this.collection.indexOf(this.previouslySelectedBuddy);
      var previouslySelectedItemView = _.find(this.itemViewPool, function (itemView) { return $.data(itemView[0], 'index') == previousModelIndex; });
      if (previouslySelectedItemView) {
        $(previouslySelectedItemView).removeClass('active');
      }
    }

    model.set({ _active: true, _unread: false });

    if (itemView)
      itemView.addClass('active').removeClass('unread');

    ChatManager.getInstance().setConversationAsRead(model.userId);
    this.trigger('buddy_selected', model);

    this.previouslySelectedBuddy = model;

    // scroll the list to this item
    if (!dontScroll)
      this.scrollToIndex(index);
  },

  onUpdateUnreadMessages: function (unreadConversationModel) {
    if (unreadConversationModel.get('unread')) {
      // get the buddy presence model for the active conversation
      var unreadBuddyModel = this.collection.find(function (buddyPresenceModel) {
        return (unreadConversationModel.get('id').indexOf(buddyPresenceModel.userId) >= 0);
      });

      if (unreadBuddyModel != null) {
        if (unreadBuddyModel != this.previouslySelectedBuddy) {
          if (!unreadBuddyModel.get('_unread')) {
            unreadBuddyModel.set('_unread', true);
          }
        } else {
          ChatManager.getInstance().setConversationAsRead(unreadBuddyModel.userId);
        }
      }
    }
  },

  onDestroy: function () {
    // if (this.previouslySelectedBuddy)
    //   this.previouslySelectedBuddy.set("_active",false);

    this.collection.each(function (model) {
      if (!model.get('_unread'))
        model.unset('_lastUnreadMessageAt');
    });
  },

  /**/

  openAddBuddyPrompt: function () {
    this.ui.$addBuddyPrompt.show();
    this.ui.$addBuddyInput.focus();
  },

  onBuddyInputKeyPressed: function (e) {
    if (e.which === cc.KEY.enter) {
      e.preventDefault();
      this.onAddBuddyClick();
    }
  },

  onCancelAddBuddyClick: function () {
    this.ui.$addBuddyPrompt.hide();
    this.ui.$searchInput.focus();
  },

  onAddBuddyClick: function () {
    if (this._addBuddyPromise == null) {
      var buddyInput = $.trim(this.ui.$addBuddyInput.val());
      if (buddyInput) {
        this._addBuddyPromise = ChatManager.getInstance().inviteBuddy(buddyInput);
        this._addBuddyPromise.then(
          function () {
            this.ui.$addBuddySubmit.addClass('done');
            this.ui.$addBuddyInput.addClass('done');
            this.ui.$addBuddySubmit.button('done');
          }.bind(this),
          function (error) {
            this.ui.$addBuddySubmit.data('fail-text', error.message);
            this.ui.$addBuddySubmit.addClass('fail');
            this.ui.$addBuddyInput.addClass('fail');
            this.ui.$addBuddySubmit.button('fail');
          }.bind(this),
          function () {
            this.ui.$addBuddySubmit.addClass('disabled');
            this.ui.$addBuddyInput.addClass('disabled');
            this.ui.$addBuddySubmit.button('progress');
          }.bind(this),
        ).finally(function () {
          setTimeout(function () {
            // reset everything
            if (this._addBuddyPromise.isFulfilled()) {
              this.ui.$addBuddyInput.val('');
            }
            this.ui.$addBuddySubmit.removeClass('done fail disabled');
            this.ui.$addBuddyInput.removeClass('done fail disabled');
            this.ui.$addBuddySubmit.button('reset');
            this._addBuddyPromise = null;

            this.ui.$addBuddyPrompt.fadeOut();
          }.bind(this), 1000);
        }.bind(this));
      }
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BuddyListView;
