// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _TwitchManager = {};
_TwitchManager.instance = null;
_TwitchManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new TwitchManager();
  }
  return this.instance;
};
_TwitchManager.current = _TwitchManager.getInstance;

module.exports = _TwitchManager;

const moment = require('moment');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const NotificationModel = require('app/ui/models/notification');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const Analytics = require('app/common/analytics');
const AnalyticsTracker = require('app/common/analyticsTracker');
const AchievementsFactory = require('app/sdk/achievements/achievementsFactory');
const i18next = require('i18next');
const NavigationManager = require('./navigation_manager');
const ProfileManager = require('./profile_manager');
const NotificationsManager = require('./notifications_manager');
const Manager = require('./manager');

var TwitchManager = Manager.extend({

  unreadTwitchRewardsQueue: null, // Queue of unclaimed twitch rewards to be displayed next time we reach main menu
  _twitchStatusModel: null, // Tracks any global status about this user's twitch rewards e.g. last_claimed_earned_at

  initialize(options) {
    Manager.prototype.initialize.call(this);
    this.unreadTwitchRewardsQueue = [];
  },

  /* region CONNECT */

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);
    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');
        const username = ProfileManager.getInstance().get('username');
        this._twitchStatusModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(`${process.env.FIREBASE_URL}/user-twitch-rewards/${userId}/status`),
        });

        this._markAsReadyWhenModelsAndCollectionsSynced([this._twitchStatusModel]);

        this.onReady().then(() => {
          this._twitchStatusModel.on('change', this.onTwitchStatusChange, this);

          return this.onTwitchStatusChange();
        });
      });
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
  },

  /* endregion CONNECT */

  hasUnclaimedTwitchRewards() {
    return this.unreadTwitchRewardsQueue.length != 0;
  },

  onTwitchStatusChange() {
    const lastRewardEarnedAt = this._twitchStatusModel.get('last_earned_at');
    const lastClaimedAt = this._twitchStatusModel.get('last_claimed_earned_at');
    if (lastRewardEarnedAt != null) {
      if (lastClaimedAt == null || lastRewardEarnedAt > lastClaimedAt) {
        return new Promise((resolve, reject) => {
          const request = $.ajax({
            url: `${process.env.API_URL}/api/me/rewards/twitch_rewards/unread`,
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

          request.done((response) => {
            const allPromises = [];

            _.each(response, (twitchRewardData) => {
              allPromises.push(this._addTwitchRewardToQueue(twitchRewardData));
            });

            return Promise.all(allPromises).then(() => {
              resolve();
            });
          });

          request.fail((response) => {
            const errorMessage = response.responseJSON && response.responseJSON.message || 'Retrieving Twitch Rewards Failed';
          });
        });
      }
    }

    return Promise.resolve();
  },

  _addTwitchRewardToQueue(twitchRewardData) {
    if (twitchRewardData == null) {
      return;
    }

    // if for some reason a read achievement comes in as completed
    if (twitchRewardData.claimed_at != null) {
      // Reward already claimed, ignore it
      return;
    }

    // Prevent adding duplicates
    const existingMatch = _.find(this.unreadTwitchRewardsQueue, (currentUnreadTwitchReward) => currentUnreadTwitchReward.twitch_reward_id == twitchRewardData.twitch_reward_id);
    if (existingMatch != null) {
      // Already in the list
      return;
    }

    const allRewardPromises = [];
    if (twitchRewardData && twitchRewardData.reward_ids) {
      _.each(twitchRewardData.reward_ids, (rewardId) => {
        allRewardPromises.push(new Promise((resolve, reject) => {
          const rewardModel = new DuelystBackbone.Model();
          rewardModel.url = `${process.env.API_URL}/api/me/rewards/${rewardId}`;
          rewardModel.fetch();

          rewardModel.onSyncOrReady()
            .then(() => {
              resolve(rewardModel.attributes);
            }).catch((error) => {
              reject(error);
            });
        }));
      });

      // when all the rewards are loaded, push the twitch reward onto the unread queue
      return Promise.all(allRewardPromises).then((rewards) => {
        twitchRewardData.rewards = rewards;
        this.unreadTwitchRewardsQueue.push(twitchRewardData);
      });
    }
  },

  popNextUnclaimedTwitchRewardModel() {
    const nextUnread = this.unreadTwitchRewardsQueue.shift();
    this._setTwitchRewardAsClaimed(nextUnread);

    const twitchRewardModel = new Backbone.Model();
    const reward = nextUnread.rewards[0];
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

  _setTwitchRewardAsClaimed(twitchReward) {
    this._twitchStatusModel.set('last_claimed_earned_at', moment.utc(twitchReward.earned_at).valueOf());

    if (twitchReward.claimed_at == null) {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rewards/twitch_rewards/${twitchReward.twitch_reward_id}`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }
  },

  getTwitchRewardsLastClaimedAt() {
    return this._twitchStatusModel.get('last_claimed_earned_at') || 0;
  },

});
