// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _ProgressionManager = {};
_ProgressionManager.instance = null;
_ProgressionManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new ProgressionManager();
  }
  return this.instance;
};
_ProgressionManager.current = _ProgressionManager.getInstance;

module.exports = _ProgressionManager;

var CONFIG = require('app/common/config');
var config = require('config/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var NotificationModel = require('app/ui/models/notification');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var Analytics = require('app/common/analytics');
var ReferralDialogView = require('app/ui/views2/referrals/referral_dialog');
var moment = require('moment');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');

var i18next = require('i18next');

var QuestBeginnerCompleteSoloChallenges = require('app/sdk/quests/questBeginnerCompleteSoloChallenges');
var InventoryManager = require('./inventory_manager');
var QuestsManager = require('./quests_manager');
var NavigationManager = require('./navigation_manager');
var NotificationsManager = require('./notifications_manager');
var NewPlayerManager = require('./new_player_manager');
var Manager = require('./manager');

var ChallengeModel = DuelystBackbone.Model.extend({
  idAttribute: 'challenge_id',
});

var ProgressionManager = Manager.extend({

  gameCounterModel: null,
  gameCounterRewardsCollection: null,
  bossesDefeatedCollection: null,
  bossEventsCollection: null,

  _factionProgressionStats: null,

  challengeProgressionCollection: null,
  unreadChallengeProgressionRewards: null,

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        this.checkForReferralRewards();

        var userId = ProfileManager.getInstance().get('id');
        var neededToBeReady = [];

        this.unreadChallengeProgressionRewards = [];

        this.gameCounterRewardsCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL)
            .child('user-progression')
            .child(userId)
            .child('game-counter-rewards'),
        });
        neededToBeReady.push(this.gameCounterRewardsCollection);

        this.gameCounterModel = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL)
            .child('user-progression')
            .child(userId)
            .child('game-counter'),
        });
        neededToBeReady.push(this.gameCounterModel);

        this.bossesDefeatedCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL)
            .child('user-bosses-defeated')
            .child(userId),
        });
        neededToBeReady.push(this.bossesDefeatedCollection);

        this.bossEventsCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL)
            .child('boss-events'),
        });
        this.bossEventsCollection.comparator = 'event_start';
        neededToBeReady.push(this.bossEventsCollection);

        this._factionProgressionStats = {};
        _.each(SDK.FactionFactory.getAllPlayableFactions(), function (faction) {
          var factionId = faction.id.toString();
          var factionProgressionModel = new DuelystFirebase.Model(null, {
            firebase: new Firebase(process.env.FIREBASE_URL)
              .child('user-faction-progression')
              .child(userId)
              .child(factionId)
              .child('stats'),
          });
          this._factionProgressionStats[factionId] = factionProgressionModel;
          neededToBeReady.push(factionProgressionModel);
        }.bind(this));

        this.challengeProgressionCollection = new DuelystBackbone.Collection();
        this.challengeProgressionCollection.model = ChallengeModel;
        this.challengeProgressionCollection.url = process.env.API_URL + '/api/me/challenges/gated';
        this.challengeProgressionCollection.fetch();
        neededToBeReady.push(this.challengeProgressionCollection);

        // this.challengeProgressionCollection = new DuelystFirebase.Model(null, {
        //   firebase: new Firebase(process.env.FIREBASE_URL).child("user-challenge-progression").child(userId)
        // });
        // neededToBeReady.push(this.challengeProgressionCollection);

        // what to do when we're ready
        this.onReady()
          .then(function () {
            this.listenTo(this.gameCounterRewardsCollection, 'add', this.ongameCounterRewardReceived);
          }.bind(this));

        this._markAsReadyWhenModelsAndCollectionsSynced(neededToBeReady);
      });
  },

  checkForReferralRewards: function () {
    var rewardsClaimedAt = moment.utc(ProfileManager.getInstance().get('referral_rewards_claimed_at') || 0);
    var rewardsUpdatedAt = moment.utc(ProfileManager.getInstance().get('referral_rewards_updated_at') || 0);
    if (rewardsClaimedAt.isBefore(rewardsUpdatedAt)) {
      var notification = new NotificationModel({
        message: i18next.t('rewards.referral_rewards_available_message'),
        type: NotificationsManager.NOTIFICATION_BUDDY_INVITE,
        ctaTitle: i18next.t('common.claim_label'),
      });
      this.listenTo(notification, 'cta_accept', function (model) {
        var model = new DuelystBackbone.Model();
        model.url = process.env.API_URL + '/api/me/referrals/summary';
        model.fetch();
        NavigationManager.getInstance().showModalView(new ReferralDialogView({ model: model }));
        this.stopListening(notification);
      }, this);
      this.listenTo(notification, 'dismiss', function (model) {
        this.stopListening(notification);
      }, this);
      NotificationsManager.getInstance().showNotification(notification);
    }
  },

  getFactionProgressionStatsModel: function (factionId) {
    if (factionId != null) {
      return this._factionProgressionStats[String(factionId)];
    }
  },

  isFactionUnlocked: function (factionId) {
    if (config.get('allCardsAvailable')) {
      return true;
    }
    // Lyonar and Neutral always unlocked
    if (factionId == SDK.Factions.Faction1 || factionId == SDK.Factions.Neutral) {
      return true;
    }
    var progressionStatsModel = this.getFactionProgressionStatsModel(factionId);
    return (progressionStatsModel != null && progressionStatsModel.get('xp') != null);
  },

  isFactionUnlockedOrCardsOwned: function (factionId) {
    return this.isFactionUnlocked(factionId) || InventoryManager.getInstance().hasAnyCardsOfFaction(factionId);
  },

  getGameCount: function () {
    return this.gameCounterModel.get('game_count') || 0;
  },

  getHasActiveBossEvent: function () {
    return this.getCurrentBossEventModels().length != 0;
  },

  getTimeToActiveBossEventEnds: function () {
    var bossEventModels = this.getCurrentBossEventModels();

    if (bossEventModels.length == 0) {
      return 0;
    }

    var currentEventModel = bossEventModels[0];
    var momentNowUtc = moment.utc();
    var eventEndMoment = moment.utc(currentEventModel.get('event_end'));

    return eventEndMoment.valueOf() - momentNowUtc.valueOf();
  },

  getCurrentBossEventModels: function () {
    var momentNowUtc = moment.utc();
    return this.bossEventsCollection.filter(function (eventModel) {
      var bossCard = SDK.GameSession.getCardCaches().getCardById(eventModel.get('boss_id'));

      return (eventModel.get('event_start') < momentNowUtc.valueOf())
        && (eventModel.get('event_end') > momentNowUtc.valueOf())
        && (bossCard != null);
    });
  },

  getUpcomingBossEventModel: function () {
    var momentNowUtc = moment.utc();
    return this.bossEventsCollection.find(function (eventModel) {
      var bossCard = SDK.GameSession.getCardCaches().getCardById(eventModel.get('boss_id'));

      return (eventModel.get('event_start') > momentNowUtc.valueOf()) && (bossCard != null);
    });
  },

  getTimeToUpcomingBossEventAvailable: function () {
    var currentEventModel = this.getUpcomingBossEventModel();
    if (!currentEventModel)
      return 0;
    var momentNowUtc = moment.utc();
    var eventStartMoment = moment.utc(currentEventModel.get('event_start'));

    return eventStartMoment.valueOf() - momentNowUtc.valueOf();
  },

  getHasDefeatedBossForEvent: function (bossCardId, bossEventId) {
    var defeatedBossModel = this.bossesDefeatedCollection.find(function (defeatedBossModel) {
      return (defeatedBossModel.get('boss_id') == bossCardId)
        && (defeatedBossModel.get('boss_event_id') == bossEventId);
    });

    return defeatedBossModel != null;
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.stopListening(this.gameCounterRewardsCollection);
    this.gameCounterRewardsCollection = null;
  },

  /* endregion CONNECT */

  // Returns a promise that resolves to the challenge type when completed
  completeChallengeWithType: function (challengeType) {
    return new Promise(function (resolve, reject) {
      var challengePreviouslyCompleted = this.hasCompletedChallengeOfType(challengeType);

      var processQuests = false;
      QuestsManager.getInstance().dailyQuestsCollection.each(function (questModel) {
        if (SDK.QuestFactory.questForIdentifier(questModel.get('quest_type_id')) instanceof QuestBeginnerCompleteSoloChallenges) {
          processQuests = true;
        }
      });

      var request = $.ajax({
        data: JSON.stringify({ completed_at: moment().utc().valueOf(), process_quests: processQuests }),
        url: process.env.API_URL + '/api/me/challenges/gated/' + challengeType + '/completed_at',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        if (request.status != 304) {
          // 304 Status means a challenge was already completed
          Analytics.track('challenge completed', {
            category: Analytics.EventCategory.Challenges,
            challenge_type: challengeType,
          }, {
            labelKey: 'challenge_type',
          });
          var challenge = response.challenge;
          this.challengeProgressionCollection.add([challenge], { merge: true });
          this.trigger(EVENTS.challenge_completed, { challengeCompletedType: challengeType });
        }

        if (response && response.challenge) {
          resolve(response.challenge);
        } else {
          resolve({});
        }
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var error = 'Complete challenge request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error('Failed to complete challenge with type ' + challengeType));
      });
    }.bind(this));
  },

  markChallengeAsAttemptedWithType: function (challengeType) {
    return new Promise(function (resolve, reject) {
      var challengePreviouslyAttempted = this.hasAttemptedChallengeOfType(challengeType);

      var request = $.ajax({
        data: JSON.stringify({ last_attempted_at: moment().utc().valueOf() }),
        url: process.env.API_URL + '/api/me/challenges/gated/' + challengeType + '/last_attempted_at',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        var challenge = response.challenge;
        this.challengeProgressionCollection.add([challenge], { merge: true });
        this.trigger(EVENTS.challenge_attempted, { challengeCompletedType: challengeType });

        resolve(challengeType);
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var error = 'Attempt challenge request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error('Failed to attempt challenge with type ' + challengeType));
      });
    }.bind(this));
  },

  completeDailyChallenge: function (challengeId) {
    var completeDailyChallengePromise = new Promise(function (resolve, reject) {
      var request = $.ajax({
        data: JSON.stringify({ completed_at: moment().utc().valueOf() }),
        url: process.env.API_URL + '/api/me/challenges/daily/' + challengeId + '/completed_at',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response, textStatus, jqXHR) {
        if (request.status != 304) {
          // 304 Status means a challenge was already completed
          Analytics.track('daily challenge completed', {
            category: Analytics.EventCategory.Challenges,
            challenge_type: challengeId,
          }, {
            labelKey: 'challenge_type',
          });
        }

        if (response && response.challenge) {
          resolve(response.challenge);
        } else {
          resolve({});
        }
      }.bind(this));

      request.fail(function (response) {
        var error = 'Complete daily challenge request failed';
        if (response && response.responseJSON && response.responseJSON.message) {
          error = response.responseJSON.message;
        }
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        resolve({});
      });
    }.bind(this));

    // This doesn't need to be directly part of the daily challenge completion promise chain
    completeDailyChallengePromise.then(function () {
      return QuestsManager.getInstance().updateDailyChallengeLastCompletedAt();
    });

    return completeDailyChallengePromise;
  },

  hasAttemptedChallengeOfType: function (challengeType) {
    var challengeData = this.challengeProgressionCollection.get(challengeType);
    return challengeData && (challengeData.get('last_attempted_at') != null || challengeData.get('completed_at') != null);
  },

  hasAttemptedChallengeCategory: function (challengeCategory) {
    var challengesInCategory = SDK.ChallengeFactory.getChallengesForCategoryType(challengeCategory);
    return _.reduce(challengesInCategory, function (memo, challenge) {
      return memo && this.hasAttemptedChallengeOfType(challenge.type);
    }, true, this);
  },

  hasCompletedChallengeOfType: function (challengeType) {
    var challengeData = this.challengeProgressionCollection.get(challengeType);
    return challengeData && (challengeData.get('completed_at') != null);
  },

  // A Challenge category is completed if all challenges in that category are done
  hasCompletedChallengeCategory: function (challengeCategory) {
    var challengesInCategory = SDK.ChallengeFactory.getChallengesForCategoryType(challengeCategory);
    return _.reduce(challengesInCategory, function (memo, challenge) {
      return memo && this.hasCompletedChallengeOfType(challenge.type);
    }, true, this);
  },

  /* region EVENT HANDLERS */

  ongameCounterRewardReceived: function (questModel) {
    Logger.module('UI').log('ProgressionManager::ongameCounterRewardReceived');
  },

  /* endregion EVENT HANDLERS */

});
