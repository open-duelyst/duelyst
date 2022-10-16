// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _AchievementsManager = {};
_AchievementsManager.instance = null;
_AchievementsManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new AchievementsManager();
  }
  return this.instance;
};
_AchievementsManager.current = _AchievementsManager.getInstance;

module.exports = _AchievementsManager;

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

var AchievementsManager = Manager.extend({

  _unreadAchievementsQueue: null, // Queue of achievements to be displayed next time we reach main menu
  _achievementsStatusModel: null, // Tracks any global status about this user's achievements e.g. last_read_at

  _completedAchievementsRef: null, // Reference to completed achievements

  _completedAchievementsCollection: null, // Collection of a user's completed achievements
  _checkLoginAchievementsTimeout: null,
  _progressedAchievementsCollection: null, // Contains progress for achievements that players have progressed and are marked for tracking

  initialize(options) {
    Manager.prototype.initialize.call(this);
    this._unreadAchievementsQueue = [];
  },

  /* region CONNECT */

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);
    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');
        const username = ProfileManager.getInstance().get('username');

        this._achievementsStatusModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(`${process.env.FIREBASE_URL}/user-achievements/${userId}/status`),
        });

        this._completedAchievementsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-achievements/${userId}/completed`,
        });

        this._progressedAchievementsCollection = new DuelystFirebase.Collection(null, {
          firebase: `${process.env.FIREBASE_URL}user-achievements/${userId}/progress`,
        });

        this.onReady().then(() => {
        // listen to changes immediately so we don't miss anything
        // this.listenTo(this._achievementsModel, "change",this._onNewPlayerChange);
          this._completedAchievementsRef = new Firebase(`${process.env.FIREBASE_URL}/user-achievements/${userId}`).child('completed');
          if (window.isSteam) {
            this._completedAchievementsRef.orderByChild('completed_at').once('value', this.syncSteamAchievements.bind(this));
          }
          this._completedAchievementsRef.orderByChild('completed_at').startAt(this.getAchievementsLastReadAt()).on('child_added', this._onNewCompletedAchievement.bind(this));

          return this._scheduleOrRequestLoginAchievements();
        });

        this._markAsReadyWhenModelsAndCollectionsSynced([this._achievementsStatusModel, this._completedAchievementsCollection, this._progressedAchievementsCollection]);
      });
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    if (this._completedAchievementsRef) {
      this._completedAchievementsRef.off();
    }

    this._clearLoginAchievementsTimeout();
  },

  /* endregion CONNECT */
  syncSteamAchievements(snapshot) {
    const achievements = snapshot.val();
    if (!achievements) {
      return;
    }
    Object.keys(achievements).map((achievement) => {
      // trigger steam achievement here
      // we don't care about error
      steamworks.activateAchievement(
        achievement,
        () => {},
        (err) => {},
      );
    });
  },

  hasUnreadCompletedAchievements() {
    return this._unreadAchievementsQueue.length != 0;
  },

  popNextUnreadAchievementModel() {
    const nextUnread = this._unreadAchievementsQueue.shift();
    this._setCompletedAchievementAsRead(nextUnread);

    // Build out the unread achievement model
    const achievement = AchievementsFactory.achievementForIdentifier(nextUnread.achievement_id);
    const achievementRewardModel = new Backbone.Model();
    achievementRewardModel.set('_title', `${i18next.t('rewards.achievement_complete_title')} ${achievement.title}`);
    achievementRewardModel.set('_subTitle', achievement.description);
    achievementRewardModel.set('_achievementId', nextUnread.achievement_id);

    const reward = nextUnread.rewards[0];

    if (reward.gold) {
      achievementRewardModel.set('gold', reward.gold);
    } else if (reward.spirit) {
      achievementRewardModel.set('spirit', reward.spirit);
    } else if (reward.cards) {
      achievementRewardModel.set('cards', reward.cards);
    } else if (reward.spirit_orbs) {
      achievementRewardModel.set('spirit_orbs', reward.spirit_orbs);
    } else if (reward.gauntlet_tickets) {
      achievementRewardModel.set('gauntlet_tickets', reward.gauntlet_tickets);
    } else if (reward.cosmetics) {
      achievementRewardModel.set('cosmetics', reward.cosmetics);
    } else if (reward.cosmetic_keys) {
      achievementRewardModel.set('cosmetic_keys', reward.cosmetic_keys);
    } else if (reward.gift_chests) {
      achievementRewardModel.set('gift_chests', reward.gift_chests);
    }

    // trigger steam achievement here
    // use same achievement_id
    // we don't care about error
    if (window.isSteam) {
      steamworks.activateAchievement(
        nextUnread.achievement_id,
        () => {},
        (err) => {},
      );
    }

    return achievementRewardModel;
  },

  _setCompletedAchievementAsRead(completedAchievement) {
    // If this achievement was completed after the current last_read_at in status then update status
    if (completedAchievement.completed_at + 1 > this.getAchievementsLastReadAt()) {
      this._achievementsStatusModel.set('last_read_at', completedAchievement.completed_at + 1);
    }

    if (completedAchievement.is_unread != false) {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/achievements/${completedAchievement.achievement_id}/read_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }
  },

  getAchievementsLastReadAt() {
    return this._achievementsStatusModel.get('last_read_at') || 0;
  },

  getUnlockMessageForAchievementId(achievementId) {
    const sdkAchievement = AchievementsFactory.achievementForIdentifier(achievementId);

    if (achievementId == null || sdkAchievement == null) return '';

    let progressMade = 0;
    const achievementProgressModel = this._progressedAchievementsCollection.get(achievementId);
    if (achievementProgressModel != null && achievementProgressModel.get('progress')) {
      progressMade = achievementProgressModel.get('progress');
    }

    return sdkAchievement.rewardUnlockMessage(progressMade);
  },

  _clearLoginAchievementsTimeout() {
    if (this._checkLoginAchievementsTimeout) {
      clearTimeout(this._checkLoginAchievementsTimeout);
      this._checkLoginAchievementsTimeout = null;
    }
  },

  _scheduleOrRequestLoginAchievements() {
    this._clearLoginAchievementsTimeout();

    const timeUntilNeedsLoginAchievementCheck = this.timeUntilNeedsLoginAchievementCheck();

    if (timeUntilNeedsLoginAchievementCheck == null) {
      return Promise.resolve();
    } if (timeUntilNeedsLoginAchievementCheck <= 0) {
      return this.requestLoginAchievements();
    }
    // var bufferAchievementCheck = 1000 * 60 * 5; // 5 minutes
    const bufferAchievementCheck = 1000; // 5 minutes
    const maxScheduleTime = 1000 * 60 * 60 * 2; // 2 hours
    const scheduleWaitTime = Math.min(maxScheduleTime, timeUntilNeedsLoginAchievementCheck + bufferAchievementCheck);
    this._checkLoginAchievementsTimeout = setTimeout(this._scheduleOrRequestLoginAchievements.bind(this), scheduleWaitTime);
    return Promise.resolve();
  },

  requestLoginAchievements() {
    this._clearLoginAchievementsTimeout();

    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/achievements/login`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        resolve(response);
      });

      request.fail((response) => {
        const errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Login Achievement check failed.';
        reject(errorMessage);
      });
    });
  },

  timeUntilNeedsLoginAchievementCheck() {
    const enabledAchievementsMap = AchievementsFactory.getEnabledAchievementsMap();
    const momentNowUtc = moment.utc();
    let closestLoginAchievmentMs = null;
    for (const achievementId in enabledAchievementsMap) {
      const sdkAchievement = enabledAchievementsMap[achievementId];
      if (!this._getHasCompletedAchievement(achievementId)) {
        // if (sdkAchievement.getLoginAchievementStartsMoment() != null && sdkAchievement.getLoginAchievementStartsMoment().valueOf() > momentNowUtc.valueOf()) {
        if (sdkAchievement.getLoginAchievementStartsMoment() != null) {
          const upcomingLoginAchievementStartMoment = sdkAchievement.getLoginAchievementStartsMoment();
          if (sdkAchievement.progressForLoggingIn(upcomingLoginAchievementStartMoment.clone().add(1, 'minute')) >= 1) {
            if (closestLoginAchievmentMs == null || closestLoginAchievmentMs > (upcomingLoginAchievementStartMoment.valueOf() - momentNowUtc.valueOf())) {
              // Note: this may be negative or 0, meaning the login achievement has started
              closestLoginAchievmentMs = upcomingLoginAchievementStartMoment.valueOf() - momentNowUtc.valueOf();
            }
          }
        }
      }
    }

    return closestLoginAchievmentMs;
  },

  _getHasCompletedAchievement(achievementId) {
    if (this._completedAchievementsCollection != null && this._completedAchievementsCollection.models != null) {
      for (let i = 0; i < this._completedAchievementsCollection.models.length; i++) {
        const model = this._completedAchievementsCollection.models[i];
        if (model.get('achievement_id') == achievementId) {
          return true;
        }
      }
    }

    return false;
  },

  /* region EVENT HANDLERS */

  _onNewCompletedAchievement(snapshot) {
    if (!this._unreadAchievementsQueue) {
      this._unreadAchievementsQueue = [];
    }

    // start loading all rewards for the achievement
    const achievement = snapshot.val();

    // if for some reason a read achievement comes in as completed
    if (achievement.is_unread == false) {
      this._setCompletedAchievementAsRead(achievement);
      return;
    }

    const allRewardPromises = [];
    if (achievement && achievement.reward_ids) {
      _.each(achievement.reward_ids, (rewardId) => {
        allRewardPromises.push(new Promise((resolve, reject) => {
          const rewardModel = new DuelystBackbone.Model();
          rewardModel.url = `${process.env.API_URL}/api/me/rewards/${rewardId}`;
          rewardModel.fetch();
          rewardModel.onSyncOrReady().then(() => {
            resolve(rewardModel.attributes);
          }).catch((error) => {
            reject(error);
          });
        }));
      });
    }

    // when all the rewards are loaded, push the achievent onto the unread queue
    Promise.all(allRewardPromises).then((rewards) => {
      achievement.rewards = rewards;
      this._unreadAchievementsQueue.push(achievement);
    });
  },

  /* endregion EVENT HANDLERS */

});
