// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _TwitchManager = {};
_TwitchManager.instance = null;
_TwitchManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new TwitchManager();
  }
  return this.instance;
};
_TwitchManager.current = _TwitchManager.getInstance;

module.exports = _TwitchManager;

var moment = require('moment');
var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var NotificationModel = require('app/ui/models/notification');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var Analytics = require('app/common/analytics');
var AnalyticsTracker = require('app/common/analyticsTracker');
var AchievementsFactory = require('app/sdk/achievements/achievementsFactory');
var i18next = require('i18next');
var NavigationManager = require('./navigation_manager');
var ProfileManager = require('./profile_manager');
var NotificationsManager = require('./notifications_manager');
var Manager = require('./manager');

var TwitchManager = Manager.extend({

  unreadTwitchRewardsQueue: null, // Queue of unclaimed twitch rewards to be displayed next time we reach main menu
  _twitchStatusModel: null, // Tracks any global status about this user's twitch rewards e.g. last_claimed_earned_at

  initialize: function (options) {
    Manager.prototype.initialize.call(this);
    this.unreadTwitchRewardsQueue = [];
  },

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);
    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');
        var username = ProfileManager.getInstance().get('username');
        this._twitchStatusModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL + '/user-twitch-rewards/' + userId + '/status'),
        });

        this._markAsReadyWhenModelsAndCollectionsSynced([this._twitchStatusModel]);

        this.onReady().then(function () {
          this._twitchStatusModel.on('change', this.onTwitchStatusChange, this);

          return this.onTwitchStatusChange();
        }.bind(this));
      });
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
  },

  /* endregion CONNECT */

  hasUnclaimedTwitchRewards: function () {
    return this.unreadTwitchRewardsQueue.length != 0;
  },

  onTwitchStatusChange: function () {
    var lastRewardEarnedAt = this._twitchStatusModel.get('last_earned_at');
    var lastClaimedAt = this._twitchStatusModel.get('last_claimed_earned_at');
    if (lastRewardEarnedAt != null) {
      if (lastClaimedAt == null || lastRewardEarnedAt > lastClaimedAt) {
        return new Promise(function (resolve, reject) {
          var request = $.ajax({
            url: process.env.API_URL + '/api/me/rewards/twitch_rewards/unread',
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
          });

          // var request = $.ajax({
          //  data: JSON.stringify({
          //    qty: numBoosterPacks,
          //    card_set_id: cardSetId,
          //    currency_type:"soft"
          //  }),
          //  url: process.env.API_URL + '/api/me/inventory/spirit_orbs',
          //  type: 'POST',
          //  contentType: 'application/json',
          //  dataType: 'json'
          // });

          request.done(function (response) {
            var allPromises = [];

            _.each(response, function (twitchRewardData) {
              allPromises.push(this._addTwitchRewardToQueue(twitchRewardData));
            }.bind(this));

            return Promise.all(allPromises).then(function () {
              resolve();
            });
          }.bind(this));

          request.fail(function (response) {
            var errorMessage = response.responseJSON && response.responseJSON.message || 'Retrieving Twitch Rewards Failed';
          });
        }.bind(this));
      }
    }

    return Promise.resolve();
  },

  _addTwitchRewardToQueue: function (twitchRewardData) {
    if (twitchRewardData == null) {
      return;
    }

    // if for some reason a read achievement comes in as completed
    if (twitchRewardData.claimed_at != null) {
      // Reward already claimed, ignore it
      return;
    }

    // Prevent adding duplicates
    var existingMatch = _.find(this.unreadTwitchRewardsQueue, function (currentUnreadTwitchReward) {
      return currentUnreadTwitchReward.twitch_reward_id == twitchRewardData.twitch_reward_id;
    });
    if (existingMatch != null) {
      // Already in the list
      return;
    }

    var allRewardPromises = [];
    if (twitchRewardData && twitchRewardData.reward_ids) {
      _.each(twitchRewardData.reward_ids, function (rewardId) {
        allRewardPromises.push(new Promise(function (resolve, reject) {
          var rewardModel = new DuelystBackbone.Model();
          rewardModel.url = process.env.API_URL + '/api/me/rewards/' + rewardId;
          rewardModel.fetch();

          rewardModel.onSyncOrReady()
            .then(function () {
              resolve(rewardModel.attributes);
            }).catch(function (error) {
              reject(error);
            });
        }));
      });

      // when all the rewards are loaded, push the twitch reward onto the unread queue
      return Promise.all(allRewardPromises).then(function (rewards) {
        twitchRewardData.rewards = rewards;
        this.unreadTwitchRewardsQueue.push(twitchRewardData);
      }.bind(this));
    }
  },

  popNextUnclaimedTwitchRewardModel: function () {
    var nextUnread = this.unreadTwitchRewardsQueue.shift();
    this._setTwitchRewardAsClaimed(nextUnread);

    var twitchRewardModel = new Backbone.Model();
    var reward = nextUnread.rewards[0];
    if (reward.reward_category && reward.reward_category == 'TWITCH_DROP') {
      twitchRewardModel.set('_title', 'Thanks for participating in Twitch Drops for Duelyst!');
      twitchRewardModel.set('_subTitle', 'Your reward has been automatically been added to your account.');
    } else if (reward.reward_category && reward.reward_category == 'TWITCH_COMMERCE') {
      twitchRewardModel.set('_title', 'Thanks for your Twitch Commerce purchase!');
      twitchRewardModel.set('_subTitle', 'Your items have been added to your account.');
    }
    // twitchRewardModel.set("_achievementId", nextUnread.achievement_id);

    if (reward.gold) {
      twitchRewardModel.set('gold', reward.gold);
    } else if (reward.spirit) {
      twitchRewardModel.set('spirit', reward.spirit);
    } else if (reward.cards) {
      twitchRewardModel.set('cards', reward.cards);
    } else if (reward.spirit_orbs) {
      twitchRewardModel.set('spirit_orbs', reward.spirit_orbs);
    } else if (reward.gauntlet_tickets) {
      twitchRewardModel.set('gauntlet_tickets', reward.gauntlet_tickets);
    } else if (reward.cosmetics) {
      twitchRewardModel.set('cosmetics', reward.cosmetics);
    } else if (reward.cosmetic_keys) {
      twitchRewardModel.set('cosmetic_keys', reward.cosmetic_keys);
    } else if (reward.gift_chests) {
      twitchRewardModel.set('gift_chests', reward.gift_chests);
    }

    return twitchRewardModel;
  },

  _setTwitchRewardAsClaimed: function (twitchReward) {
    this._twitchStatusModel.set('last_claimed_earned_at', moment.utc(twitchReward.earned_at).valueOf());

    if (twitchReward.claimed_at == null) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rewards/twitch_rewards/' + twitchReward.twitch_reward_id,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }
  },

  getTwitchRewardsLastClaimedAt: function () {
    return this._twitchStatusModel.get('last_claimed_earned_at') || 0;
  },

});
