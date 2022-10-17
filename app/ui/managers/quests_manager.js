// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _QuestsManager = {};
_QuestsManager.instance = null;
_QuestsManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new QuestsManager();
  }
  return this.instance;
};
_QuestsManager.current = _QuestsManager.getInstance;

module.exports = _QuestsManager;

var Promise = require('bluebird');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var NotificationModel = require('app/ui/models/notification');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var Analytics = require('app/common/analytics');
var AnalyticsTracker = require('app/common/analyticsTracker');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var moment = require('moment');
var NewPlayerProgressionHelper = require('app/sdk/progression/newPlayerProgressionHelper');
var Session = require('app/common/session2');
var NewPlayerManager = require('./new_player_manager');
var NavigationManager = require('./navigation_manager');
var NotificationsManager = require('./notifications_manager');
var ProfileManager = require('./profile_manager');
var Manager = require('./manager');

var QuestsManager = Manager.extend({

  dailyQuestsCollection: null,
  dailyQuestsGeneratedAtModel: null,
  dailyChallengesLastCompletedAtModel: null,
  _questUpdateScheduleTimeout: null,
  _unreadQuestProgressNotificationModels: null,

  _dailyChallengeReadAt: null, // Local only timestamp of when daily challenge was read
  _hasUnreadDailyChallengeCompletion: null, // Local only, marked as true when a user completes a daily challenge

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');
        this._unreadQuestProgressNotificationModels = [];
        this.dailyQuestsGeneratedAtModel = null;
        this.dailyQuestsCollection = null;

        NewPlayerManager.getInstance().onReady().then(function () {
        // on first connect/session start request new daily quests
          this.requestNewDailyQuests().finally(function () {
            var dailyquestsFirebaseReference = new Firebase(process.env.FIREBASE_URL + 'user-quests/' + userId + '/daily/current/generated_at');
            this.dailyQuestsGeneratedAtModel = new DuelystFirebase.Model(null, {
              firebase: dailyquestsFirebaseReference,
            });

            // var dailyChallengesLastCompletedAtModelFirebaseReference = new Firebase(process.env.FIREBASE_URL + "user-challenges-daily/" + userId + "/last_completed_at")
            // this.dailyChallengesLastCompletedAtModel = new DuelystFirebase.Model(null, {
            //  firebase: dailyChallengesLastCompletedAtModelFirebaseReference
            // })

            this.dailyChallengesLastCompletedAtModel = new DuelystBackbone.Model();
            this.dailyChallengesLastCompletedAtModel.url = process.env.API_URL + '/api/me/challenges/daily/completed_at';
            this.dailyChallengesLastCompletedAtModel.fetch();

            var dailyQuestsPath = process.env.FIREBASE_URL + 'user-quests/' + userId + '/daily/current/quests';
            var dailyquestsFirebaseReference = new Firebase(dailyQuestsPath);

            this.dailyQuestsCollection = new DuelystFirebase.Collection(null, {
              firebase: dailyquestsFirebaseReference,
            });

            // what to do when we're ready
            this.onReady().then(function () {
              this.listenTo(this.dailyQuestsCollection, 'add', this.onQuestAdded);
              this.listenTo(this.dailyQuestsCollection, 'remove', this.onQuestRemoved);
              this.listenTo(this.dailyQuestsCollection, 'change', this.onQuestsChanged);
              this.dailyQuestsCollection.each(this.onQuestAdded.bind(this));
            }.bind(this));

            this._markAsReadyWhenModelsAndCollectionsSynced([this.dailyQuestsGeneratedAtModel, this.dailyQuestsCollection]);
          }.bind(this));
        }.bind(this));
      });
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.stopListening(this.dailyQuestsCollection);
    this.dailyQuestsCollection = null;
  },

  /* endregion CONNECT */

  // returns daily quests and catch up quests in one collection
  getQuestCollection: function () {
    return this.dailyQuestsCollection;
  },

  getDailyChallengesLastCompletedAtMoment: function () {
    if (this.dailyChallengesLastCompletedAtModel) {
      var lastCompletedAt = this.dailyChallengesLastCompletedAtModel.get('daily_challenge_last_completed_at');
      return moment.utc(lastCompletedAt || '2016-01-01');
    } else {
      return moment.utc('2016-01-01');
    }
  },

  /* region EVENT HANDLERS */

  onQuestAdded: function (questModel) {
    Logger.module('UI').log('QuestsManager::onQuestAdded');
    questModel.on('change:progress', this.onQuestsProgressed, this);
  },

  onQuestRemoved: function (questModel) {
    Logger.module('UI').log('QuestsManager::onQuestRemoved');
    questModel.off('change:progress', this.onQuestsProgressed, this);
  },

  onQuestsChanged: function () {
    Logger.module('UI').log('QuestsManager::onQuestsChanged');

    // var daysPassed = false;
    // var latest_quest_generated_at = null;

    // if (this.dailyQuestsCollection.length > 0) {
    //   var latest_quest = this.dailyQuestsCollection.max(function(q) {
    //     return q.get("begin_at");
    //   });

    //   try {
    //     if (latest_quest)
    //       latest_quest_generated_at = latest_quest.get("begin_at");
    //   } catch (e) {}

    //   if (latest_quest_generated_at) {
    //     var now = new Date();
    //     var now_utc = moment().utc().valueOf(); // use moment.js (via Bower)
    //     daysPassed = (now_utc - latest_quest_generated_at) / 1000 / 60 / 60 / 24;
    //   }
    // }

    // if (!latest_quest_generated_at || (this.dailyQuestsCollection.length < 3 && daysPassed >= 1)) {
    //   this.requestNewDailyQuests();
    // }
    this.trigger('daily_quests_change');
  },

  onQuestsProgressed: function (questModel) {
    Logger.module('UI').log('QuestsManager.onQuestsProgressed', questModel);
    if (questModel.get('progress') > 0) {
      // generate quest
      var quest = SDK.QuestFactory.questForIdentifier(questModel.get('quest_type_id'));
      quest.params = questModel.get('params');

      // generate notification
      var notification = new NotificationModel(_.extend(_.clone(questModel.attributes), {
        type: NotificationsManager.NOTIFICATION_QUEST_PROGRESS,
        title: quest.getName(),
        quest_instructions: quest.getDescription(),
        audio: RSX.sfx_collection_next.audio,
      }));

      // show the unread quest notifications
      NotificationsManager.getInstance().showNotification(notification);

      // defer marking quest as read until the current stack call completes
      // just in case this method is called as a result of a change event
      _.defer(function () {
        // showing quest as notification so mark as read
        if (questModel.get('is_unread')) {
          questModel.set('is_unread', false);
        }
      }.bind(this));
    }
  },

  /* endregion EVENT HANDLERS */

  /* region UNREAD QUEST PROGRESS */

  hasUnreadQuests: function () {
    var anyUnread = false;
    this.dailyQuestsCollection.each(function (q) {
      if (q.get('is_unread')) {
        anyUnread = true;
      }
    });
    return anyUnread;
  },

  markQuestsAsRead: function () {
    // defer marking as read until the current stack call completes
    _.defer(function () {
      this.dailyQuestsCollection.each(function (q) {
        if (q.get('is_unread')) {
          q.set('is_unread', false);
        }
      });
    }.bind(this));
  },

  /* endregion UNREAD QUEST PROGRESS */

  /* region UNREAD DAILY CHALLENGE PROGRESS */

  hasUnreadDailyChallenges: function () {
    var startOfToday = moment.utc().startOf('day');
    var dailyChallengeCompletedStartOfDay = this.getDailyChallengesLastCompletedAtMoment().startOf('day');

    // If user has recently completed a daily challenge return true
    if (this._hasUnreadDailyChallengeCompletion) {
      return true;
    }

    // If already completed today's challenge, consider read
    if (dailyChallengeCompletedStartOfDay.valueOf() == startOfToday.valueOf()) {
      return false;
    }

    // If this isn't the first session of the day consider read
    if (!Session.getIsFirstSessionOfDay()) {
      return false;
    }

    // Consider read if we have a local read timestamp that matches today
    if (this._dailyChallengeReadAt) {
      var dailyChallengeReadAtStartOfDay = moment.utc(this._dailyChallengeReadAt).startOf('day');
      if (dailyChallengeReadAtStartOfDay.valueOf() == startOfToday.valueOf()) {
        return false;
      }
    }

    // If none of the above the daily challenge hasn't been read yet
    return true;
  },

  // Sets a local only value of challenges having been read
  markDailyChallengeAsRead: function () {
    this._dailyChallengeReadAt = moment.utc().valueOf();
    this._hasUnreadDailyChallengeCompletion = false;
  },

  markDailyChallengeCompletionAsUnread: function () {
    this._hasUnreadDailyChallengeCompletion = true;
  },

  updateDailyChallengeLastCompletedAt: function () {
    if (this.dailyChallengesLastCompletedAtModel == null) {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var updateRequest = this.dailyChallengesLastCompletedAtModel.fetch();

      updateRequest.done(function () {
        resolve();
      }.bind(this));

      updateRequest.fail(function () {
        var error = 'Daily challenge last completed at update request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);

        reject(new Error(error));
      }.bind(this));
    }.bind(this));
  },

  fetchDailyChallengeModel: function () {
    var dailyChallengeModel = new DuelystFirebase.Model(null, {
      firebase: new Firebase(process.env.FIREBASE_URL + 'daily-challenges/' + moment.utc().format('YYYY-MM-DD')),
    });

    return dailyChallengeModel.onSyncOrReady();
  },

  /* endregion UNREAD DAILY CHALLENGE PROGRESS */

  /* region QUEST CYCLING */

  requestNewDailyQuests: function () {
    Logger.module('UI').log('QuestsManager::requestNewDailyQuests');

    // if we're at a stage that doesn't need daily quests just RESOLVE
    if (NewPlayerManager.getInstance().getCurrentCoreStage().value < NewPlayerProgressionHelper.DailyQuestsStartToGenerateStage.value) {
      return Promise.resolve();
    }

    // let's check if we even need to request new daily quests
    if (this.dailyQuestsCollection && this.dailyQuestsCollection.length > 0) {
      // do we have a quest that was generated today and is not a begginer quest?
      var todayQuest = this.dailyQuestsCollection.find(function (q) {
        // if a quest was generated today
        var generatedToday = moment.utc(q.get('begin_at')).valueOf() == moment().utc().valueOf();
        // that is not a begginer FTUE quest
        var sdkQuest = SDK.QuestFactory.questForIdentifier(q.get('quest_type_id'));
        var isBeginnerQuest = sdkQuest && sdkQuest.isBeginner;
        // then we consider this a "quest generated today"
        return generatedToday && !isBeginnerQuest;
      });
      // if we have a quest generated today, just skip this
      if (todayQuest) {
        return Promise.resolve();
      }
    }

    if (this.dailyQuestsGeneratedAtModel) {
      var questsLastGeneratedAt = parseInt(_.keys(this.dailyQuestsGeneratedAtModel.attributes)[0]);
      // looks like we're still in the same day
      if (moment().utc().startOf('day').valueOf() <= moment.utc(questsLastGeneratedAt).startOf('day').valueOf()) {
        return Promise.resolve();
      }
    }

    var url = process.env.API_URL + '/api/me/quests/daily';

    // // if this is a tutorial or progression stage where a user is supposed to be
    // var beginnerQuests = SDK.NewPlayerProgressionHelper.questsForStage(NewPlayerManager.getInstance().getCurrentCoreStage())
    // if (beginnerQuests) {
    //   var url = process.env.API_URL + '/api/me/quests/beginner'
    // }

    var request = $.ajax({
      url: url,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
    });

    request.done(function (response) {
      this._scheduleQuestsUpdateWhenUTCdayRollsOver();
    }.bind(this));

    request.fail(function (response) {
      // Temporary error, should parse server response.
      var error = 'Daily quest generation failed';
      EventBus.getInstance().trigger(EVENTS.ajax_error, error);
    });

    // wrap jquery request in bluebird promise
    return Promise.resolve(request);
  },

  /**
  * Schedules an update request for new daily quests at UTC midnight.
  * @private
  */
  _scheduleQuestsUpdateWhenUTCdayRollsOver: function () {
    if (this._questUpdateScheduleTimeout)
      clearTimeout(this._questUpdateScheduleTimeout);
    var milisecondsToUTCMidnight = moment().utc().endOf('day').valueOf() - moment().utc().valueOf();
    // add 3 minutes to quest refresh just in case of clock skew
    milisecondsToUTCMidnight += (3 * 60 * 1000);
    var duration = moment.duration(milisecondsToUTCMidnight);
    Logger.module('UI').log('QuestsManager::_scheduleQuestsUpdateWhenUTCdayRollsOver() -> quests scheduled to check for update in ' + duration.humanize());
    this._questUpdateScheduleTimeout = setTimeout(this.requestNewDailyQuests.bind(this), milisecondsToUTCMidnight);
  },

  requestQuestReplace: function (index) {
    // for analytics we want to track what kinds of quests are getting replaced
    var replacedQuestId = this.dailyQuestsCollection.get(index).get('quest_type_id');

    var request = $.ajax({
      url: process.env.API_URL + '/api/me/quests/daily/' + index,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
    });

    request.done(function (response, textStatus, jqXHR) {
      if (response) {
        // track an event in analytics
        Analytics.track('quest replaced', {
          category: Analytics.EventCategory.Quest,
          quest_type_id: replacedQuestId,
        }, {
          labelKey: 'quest_type_id',
        });
      } else if (jqXHR.status == 304) {
        NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'Daily quest has already been mulliganed once today.' }));
      }
    });

    request.fail(function (response) {
      // Temporary error, should parse server response.
      var error = 'Daily quest mulligan/replacement failed';
      EventBus.getInstance().trigger(EVENTS.ajax_error, error);
    });

    return request;
  },

  /* endregion QUEST CYCLING */

});
