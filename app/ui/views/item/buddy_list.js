const SDK = require('app/sdk');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const UtilsUI = require('app/common/utils/utils_ui');
const RSX = require('app/data/resources');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const BuddyListTemplate = require('app/ui/templates/item/buddy_list.hbs');
const BuddyPreviewTemplate = require('app/ui/templates/item/buddy_preview.hbs');
const ChatManager = require('app/ui/managers/chat_manager');
const GamesManager = require('app/ui/managers/games_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const ListWithPooledRowsView = require('app/ui/extensions/list_with_pooled_rows');
const VirtualCollection = require('backbone-virtual-collection');
const _ = require('underscore');
const i18next = require('i18next');

const BuddyListView = ListWithPooledRowsView.extend({

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

  initialize(opts) {
    // set the internal model/collection
    const presenceCollection = ChatManager.getInstance().getBuddiesCollection().getPresenceCollection();
    this.collection = new VirtualCollection(presenceCollection, {
      destroy_with: this,
    });
    this.previouslySelectedBuddy = this.collection.find((model) => model.get('_active'));

    // start listening then check for unread messages
    this.listenTo(ChatManager.getInstance().conversations, 'change:unread', this.onUpdateUnreadMessages);
    ChatManager.getInstance().conversations.each((conversationModel) => {
      this.onUpdateUnreadMessages(conversationModel);
    });

    this.listenTo(this.collection, 'change:status change:_lastUnreadMessageAt', () => {
      this.listenToOnce(this.collection, 'sort', this.bindItemViewsAfterSort);
    });

    ListWithPooledRowsView.prototype.initialize.call(this, opts);
  },

  onSearchInputChanged: _.throttle(function () {
    const query = this.ui.$searchInput.val();
    if (query && query.length > 0) {
      this.collection.updateFilter((model) => model.get('username').toLowerCase().indexOf(query) >= 0);
    } else {
      this.collection.updateFilter((model) => true);
    }
    this.bindAndReset();
  }, 100),

  onModelAddedOrRemoved(model, collection, options) {
    ListWithPooledRowsView.prototype.onModelAddedOrRemoved.apply(this, arguments);

    // clear last opponent as needed
    const lastOpponentName = this.model.get('lastOpponentName');
    if (lastOpponentName != null && model.get('username') === lastOpponentName) {
      this.updateLastOpponent();
    }
  },

  getListHeightForCache() {
    return (this.$el.height() - this.ui.$buddyControls.height()) / CONFIG.globalScale;
  },

  getRowHeightForCache() {
    return 65;
  },

  onRender() {
    this._updateDoNotDisturbStatus();
    this.updateLastOpponent(true);
    ListWithPooledRowsView.prototype.onRender.call(this);
  },

  onShow() {
    ListWithPooledRowsView.prototype.onShow.call(this);
    this.ui.$searchInput.focus();
    if (this.previouslySelectedBuddy) {
      this.selectBuddy(this.previouslySelectedBuddy);
    }
  },

  onDoNotDisturbClick() {
    ProfileManager.getInstance().profile.set('doNotDisturb', !ProfileManager.getInstance().profile.get('doNotDisturb'));
    this._updateDoNotDisturbStatus();
  },

  _updateDoNotDisturbStatus() {
    if (ProfileManager.getInstance().profile.get('doNotDisturb')) {
      this.ui.$doNotDisturb.addClass('active');
    } else {
      this.ui.$doNotDisturb.removeClass('active');
    }
  },

  updateLastOpponent(forRender) {
    // figure out last opponent name / id
    let lastOpponentName;
    let lastOpponentBuddy;
    const lastGame = GamesManager.getInstance().playerGames.last();
    if (lastGame != null && SDK.GameType.isMultiplayerGameType(lastGame.get('game_type'))) {
      // store last opponent data
      lastOpponentName = lastGame.get('opponent_username');
      this.model.set('lastOpponentName', lastOpponentName);
      this.ui.$lastPlayedUsername.text(lastOpponentName);

      // find whether opponent already exists as buddy
      const lastOpponentId = lastGame.get('opponent_id');
      lastOpponentBuddy = ChatManager.getInstance().getBuddiesCollection().find((buddy) => buddy.get('id') == lastOpponentId);
    }

    const wasShowingLastOpponent = this._showingLastOpponent;
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

  showLastOpponentUI() {
    this._showingLastOpponent = true;

    // inset the list by the height of the last opponent UI
    this.scrollInsetTop = 71;

    // show last opponent UI
    this.ui.$lastPlayed.removeClass('invite-sent').addClass('active');
  },

  hideLastOpponentUI() {
    this._showingLastOpponent = false;

    // reset list inset
    this.scrollInsetTop = 0;

    // hide last opponent UI
    this.ui.$lastPlayed.removeClass('active invite-sent');
  },

  onAddLastOpponent() {
    const lastOpponentName = this.model.get('lastOpponentName');
    if (lastOpponentName != null) {
      ChatManager.getInstance().inviteBuddy(lastOpponentName);
      this.ui.$lastPlayed.addClass('invite-sent');
    }
  },

  // bindItemViewsAfterSort: _.throttle(this.bindItemViewsAfterSort,1000);

  bindModelToItemView(model, itemView) {
    // skip any binding if this view is in the process/done getting destroyed
    if (this.isDestroyed) return;

    Logger.module('UI').log(`BuddyListView.bindModelToItemView() -> ${model.get('username')}`);

    ListWithPooledRowsView.prototype.bindModelToItemView.call(this, model, itemView);

    // content
    let rankText = model.get('rank');
    if (_.isUndefined(rankText) || _.isNull(rankText)) rankText = '?';
    $('.username-block', itemView).text(model.get('username'));
    const localizedCurrentStatus = i18next.t(`buddy_list.status_${model.getStatus()}`);
    $('.status-label', itemView).text(localizedCurrentStatus);
    const portraitData = SDK.CosmeticsFactory.profileIconForIdentifier(model.get('portrait_id'));
    const portraitImg = portraitData.img;
    const portraitScaledImg = RSX.getResourcePathForScale(portraitImg, CONFIG.resourceScaleCSS);
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
      const divisionName = SDK.RankFactory.rankedDivisionNameForRank(model.get('rank')).toLowerCase();
      const divisionClassName = SDK.RankFactory.rankedDivisionAssetNameForRank(model.get('rank')).toLowerCase();
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

  onBuddySelected(e) {
    const itemView = $(e.currentTarget);
    const index = itemView.data('index');
    const model = this.collection.at(index);

    if (model) {
      this.selectBuddy(model, itemView, true);
    }
  },

  selectBuddy(model, itemView, dontScroll) {
    const index = this.collection.indexOf(model);

    if (!itemView) {
      itemView = _.find(this.itemViewPool, (itemView) => $.data(itemView[0], 'index') == index);
    }

    if (this.previouslySelectedBuddy) {
      this.previouslySelectedBuddy.set('_active', false);
      const previousModelIndex = this.collection.indexOf(this.previouslySelectedBuddy);
      const previouslySelectedItemView = _.find(this.itemViewPool, (itemView) => $.data(itemView[0], 'index') == previousModelIndex);
      if (previouslySelectedItemView) {
        $(previouslySelectedItemView).removeClass('active');
      }
    }

    model.set({ _active: true, _unread: false });

    if (itemView) itemView.addClass('active').removeClass('unread');

    ChatManager.getInstance().setConversationAsRead(model.userId);
    this.trigger('buddy_selected', model);

    this.previouslySelectedBuddy = model;

    // scroll the list to this item
    if (!dontScroll) this.scrollToIndex(index);
  },

  onUpdateUnreadMessages(unreadConversationModel) {
    if (unreadConversationModel.get('unread')) {
      // get the buddy presence model for the active conversation
      const unreadBuddyModel = this.collection.find((buddyPresenceModel) => (unreadConversationModel.get('id').indexOf(buddyPresenceModel.userId) >= 0));

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

  onDestroy() {
    // if (this.previouslySelectedBuddy)
    //   this.previouslySelectedBuddy.set("_active",false);

    this.collection.each((model) => {
      if (!model.get('_unread')) model.unset('_lastUnreadMessageAt');
    });
  },

  /**/

  openAddBuddyPrompt() {
    this.ui.$addBuddyPrompt.show();
    this.ui.$addBuddyInput.focus();
  },

  onBuddyInputKeyPressed(e) {
    if (e.which === cc.KEY.enter) {
      e.preventDefault();
      this.onAddBuddyClick();
    }
  },

  onCancelAddBuddyClick() {
    this.ui.$addBuddyPrompt.hide();
    this.ui.$searchInput.focus();
  },

  onAddBuddyClick() {
    if (this._addBuddyPromise == null) {
      const buddyInput = $.trim(this.ui.$addBuddyInput.val());
      if (buddyInput) {
        this._addBuddyPromise = ChatManager.getInstance().inviteBuddy(buddyInput);
        this._addBuddyPromise.then(
          () => {
            this.ui.$addBuddySubmit.addClass('done');
            this.ui.$addBuddyInput.addClass('done');
            this.ui.$addBuddySubmit.button('done');
          },
          (error) => {
            this.ui.$addBuddySubmit.data('fail-text', error.message);
            this.ui.$addBuddySubmit.addClass('fail');
            this.ui.$addBuddyInput.addClass('fail');
            this.ui.$addBuddySubmit.button('fail');
          },
          () => {
            this.ui.$addBuddySubmit.addClass('disabled');
            this.ui.$addBuddyInput.addClass('disabled');
            this.ui.$addBuddySubmit.button('progress');
          },
        ).finally(() => {
          setTimeout(() => {
            // reset everything
            if (this._addBuddyPromise.isFulfilled()) {
              this.ui.$addBuddyInput.val('');
            }
            this.ui.$addBuddySubmit.removeClass('done fail disabled');
            this.ui.$addBuddyInput.removeClass('done fail disabled');
            this.ui.$addBuddySubmit.button('reset');
            this._addBuddyPromise = null;

            this.ui.$addBuddyPrompt.fadeOut();
          }, 1000);
        });
      }
    }
  },

});

// Expose the class either via CommonJS or the global object
module.exports = BuddyListView;
