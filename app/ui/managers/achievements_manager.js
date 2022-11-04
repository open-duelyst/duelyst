// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _AchievementsManager = {};
_AchievementsManager.instance = null;
_AchievementsManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new AchievementsManager();
  }
  return this.instance;
};
_AchievementsManager.current = _AchievementsManager.getInstance;

module.exports = _AchievementsManager;

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

var AchievementsManager = Manager.extend({

  _unreadAchievementsQueue: null, // Queue of achievements to be displayed next time we reach main menu
  _achievementsStatusModel: null, // Tracks any global status about this user's achievements e.g. last_read_at

  _completedAchievementsRef: null, // Reference to completed achievements

  _completedAchievementsCollection: null, // Collection of a user's completed achievements
  _checkLoginAchievementsTimeout: null,
  _progressedAchievementsCollection: null, // Contains progress for achievements that players have progressed and are marked for tracking

  initialize: function (options) {
    Manager.prototype.initialize.call(this);
    this._unreadAchievementsQueue = [];
  },

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);
    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');
        var username = ProfileManager.getInstance().get('username');

        this._achievementsStatusModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL + '/user-achievements/' + userId + '/status'),
        });

        this._completedAchievementsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-achievements/' + userId + '/completed',
        });

        this._progressedAchievementsCollection = new DuelystFirebase.Collection(null, {
          firebase: process.env.FIREBASE_URL + 'user-achievements/' + userId + '/progress',
        });

        this.onReady().then(function () {
        // listen to changes immediately so we don't miss anything
        // this.listenTo(this._achievementsModel, "change",this._onNewPlayerChange);
          this._completedAchievementsRef = new Firebase(process.env.FIREBASE_URL + '/user-achievements/' + userId).child('completed');
          this._completedAchievementsRef.orderByChild('completed_at').startAt(this.getAchievementsLastReadAt()).on('child_added', this._onNewCompletedAchievement.bind(this));

          return this._scheduleOrRequestLoginAchievements();
        }.bind(this));

        this._markAsReadyWhenModelsAndCollectionsSynced([this._achievementsStatusModel, this._completedAchievementsCollection, this._progressedAchievementsCollection]);
      });
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    if (this._completedAchievementsRef) {
      this._completedAchievementsRef.off();
    }

    this._clearLoginAchievementsTimeout();
  },

  hasUnreadCompletedAchievements: function () {
    return this._unreadAchievementsQueue.length != 0;
  },

  popNextUnreadAchievementModel: function () {
    var nextUnread = this._unreadAchievementsQueue.shift();
    this._setCompletedAchievementAsRead(nextUnread);

    // Build out the unread achievement model
    var achievement = AchievementsFactory.achievementForIdentifier(nextUnread.achievement_id);
    var achievementRewardModel = new Backbone.Model();
    achievementRewardModel.set('_title', i18next.t('rewards.achievement_complete_title') + ' ' + achievement.title);
    achievementRewardModel.set('_subTitle', achievement.description);
    achievementRewardModel.set('_achievementId', nextUnread.achievement_id);

    var reward = nextUnread.rewards[0];

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

    return achievementRewardModel;
  },

  _setCompletedAchievementAsRead: function (completedAchievement) {
    // If this achievement was completed after the current last_read_at in status then update status
    if (completedAchievement.completed_at + 1 > this.getAchievementsLastReadAt()) {
      this._achievementsStatusModel.set('last_read_at', completedAchievement.completed_at + 1);
    }

    if (completedAchievement.is_unread != false) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/achievements/' + completedAchievement.achievement_id + '/read_at',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }
  },

  getAchievementsLastReadAt: function () {
    return this._achievementsStatusModel.get('last_read_at') || 0;
  },

  getUnlockMessageForAchievementId: function (achievementId) {
    var sdkAchievement = AchievementsFactory.achievementForIdentifier(achievementId);

    if (achievementId == null || sdkAchievement == null)
      return '';

    var progressMade = 0;
    var achievementProgressModel = this._progressedAchievementsCollection.get(achievementId);
    if (achievementProgressModel != null && achievementProgressModel.get('progress')) {
      progressMade = achievementProgressModel.get('progress');
    }

    return sdkAchievement.rewardUnlockMessage(progressMade);
  },

  _clearLoginAchievementsTimeout: function () {
    if (this._checkLoginAchievementsTimeout) {
      clearTimeout(this._checkLoginAchievementsTimeout);
      this._checkLoginAchievementsTimeout = null;
    }
  },

  _scheduleOrRequestLoginAchievements: function () {
    this._clearLoginAchievementsTimeout();

    var timeUntilNeedsLoginAchievementCheck = this.timeUntilNeedsLoginAchievementCheck();

    if (timeUntilNeedsLoginAchievementCheck == null) {
      return Promise.resolve();
    } else if (timeUntilNeedsLoginAchievementCheck <= 0) {
      return this.requestLoginAchievements();
    } else {
      // var bufferAchievementCheck = 1000 * 60 * 5; // 5 minutes
      var bufferAchievementCheck = 1000; // 5 minutes
      var maxScheduleTime = 1000 * 60 * 60 * 2; // 2 hours
      var scheduleWaitTime = Math.min(maxScheduleTime, timeUntilNeedsLoginAchievementCheck + bufferAchievementCheck);
      this._checkLoginAchievementsTimeout = setTimeout(this._scheduleOrRequestLoginAchievements.bind(this), scheduleWaitTime);
      return Promise.resolve();
    }
  },

  requestLoginAchievements: function () {
    this._clearLoginAchievementsTimeout();

    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/achievements/login',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        resolve(response);
      });

      request.fail(function (response) {
        var errorMessage = response.responseJSON != null ? response.responseJSON.message : 'Login Achievement check failed.';
        reject(errorMessage);
      });
    }.bind(this));
  },

  timeUntilNeedsLoginAchievementCheck: function () {
    var enabledAchievementsMap = AchievementsFactory.getEnabledAchievementsMap();
    var momentNowUtc = moment.utc();
    var closestLoginAchievmentMs = null;
    for (var achievementId in enabledAchievementsMap) {
      var sdkAchievement = enabledAchievementsMap[achievementId];
      if (!this._getHasCompletedAchievement(achievementId)) {
        // if (sdkAchievement.getLoginAchievementStartsMoment() != null && sdkAchievement.getLoginAchievementStartsMoment().valueOf() > momentNowUtc.valueOf()) {
        if (sdkAchievement.getLoginAchievementStartsMoment() != null) {
          var upcomingLoginAchievementStartMoment = sdkAchievement.getLoginAchievementStartsMoment();
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

  _getHasCompletedAchievement: function (achievementId) {
    if (this._completedAchievementsCollection != null && this._completedAchievementsCollection.models != null) {
      for (var i = 0; i < this._completedAchievementsCollection.models.length; i++) {
        var model = this._completedAchievementsCollection.models[i];
        if (model.get('achievement_id') == achievementId) {
          return true;
        }
      }
    }

    return false;
  },

  /* region EVENT HANDLERS */

  _onNewCompletedAchievement: function (snapshot) {
    if (!this._unreadAchievementsQueue) {
      this._unreadAchievementsQueue = [];
    }

    // start loading all rewards for the achievement
    var achievement = snapshot.val();

    // if for some reason a read achievement comes in as completed
    if (achievement.is_unread == false) {
      this._setCompletedAchievementAsRead(achievement);
      return;
    }

    var allRewardPromises = [];
    if (achievement && achievement.reward_ids) {
      _.each(achievement.reward_ids, function (rewardId) {
        allRewardPromises.push(new Promise(function (resolve, reject) {
          var rewardModel = new DuelystBackbone.Model();
          rewardModel.url = process.env.API_URL + '/api/me/rewards/' + rewardId;
          rewardModel.fetch();
          rewardModel.onSyncOrReady().then(function () {
            resolve(rewardModel.attributes);
          }).catch(function (error) {
            reject(error);
          });
        }));
      });
    }

    // when all the rewards are loaded, push the achievent onto the unread queue
    Promise.all(allRewardPromises).then(function (rewards) {
      achievement.rewards = rewards;
      this._unreadAchievementsQueue.push(achievement);
    }.bind(this));
  },

  /* endregion EVENT HANDLERS */

});
