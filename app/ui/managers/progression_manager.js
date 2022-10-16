// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _ProgressionManager = {};
_ProgressionManager.instance = null;
_ProgressionManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new ProgressionManager();
  }
  return this.instance;
};
_ProgressionManager.current = _ProgressionManager.getInstance;

module.exports = _ProgressionManager;

const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const NotificationModel = require('app/ui/models/notification');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const Analytics = require('app/common/analytics');
const ReferralDialogView = require('app/ui/views2/referrals/referral_dialog');
const moment = require('moment');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');

const i18next = require('i18next');

const QuestBeginnerCompleteSoloChallenges = require('app/sdk/quests/questBeginnerCompleteSoloChallenges');
const InventoryManager = require('./inventory_manager');
const QuestsManager = require('./quests_manager');
const NavigationManager = require('./navigation_manager');
const NotificationsManager = require('./notifications_manager');
const NewPlayerManager = require('./new_player_manager');
const Manager = require('./manager');

const ChallengeModel = DuelystBackbone.Model.extend({
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

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        this.checkForReferralRewards();

        const userId = ProfileManager.getInstance().get('id');
        const neededToBeReady = [];

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
        _.each(SDK.FactionFactory.getAllPlayableFactions(), (faction) => {
          const factionId = faction.id.toString();
          const factionProgressionModel = new DuelystFirebase.Model(null, {
            firebase: new Firebase(process.env.FIREBASE_URL)
              .child('user-faction-progression')
              .child(userId)
              .child(factionId)
              .child('stats'),
          });
          this._factionProgressionStats[factionId] = factionProgressionModel;
          neededToBeReady.push(factionProgressionModel);
        });

        this.challengeProgressionCollection = new DuelystBackbone.Collection();
        this.challengeProgressionCollection.model = ChallengeModel;
        this.challengeProgressionCollection.url = `${process.env.API_URL}/api/me/challenges/gated`;
        this.challengeProgressionCollection.fetch();
        neededToBeReady.push(this.challengeProgressionCollection);

        // this.challengeProgressionCollection = new DuelystFirebase.Model(null, {
        //   firebase: new Firebase(process.env.FIREBASE_URL).child("user-challenge-progression").child(userId)
        // });
        // neededToBeReady.push(this.challengeProgressionCollection);

        // what to do when we're ready
        this.onReady()
          .then(() => {
            this.listenTo(this.gameCounterRewardsCollection, 'add', this.ongameCounterRewardReceived);
          });

        this._markAsReadyWhenModelsAndCollectionsSynced(neededToBeReady);
      });
  },

  checkForReferralRewards() {
    const rewardsClaimedAt = moment.utc(ProfileManager.getInstance().get('referral_rewards_claimed_at') || 0);
    const rewardsUpdatedAt = moment.utc(ProfileManager.getInstance().get('referral_rewards_updated_at') || 0);
    if (rewardsClaimedAt.isBefore(rewardsUpdatedAt)) {
      const notification = new NotificationModel({
        message: i18next.t('rewards.referral_rewards_available_message'),
        type: NotificationsManager.NOTIFICATION_BUDDY_INVITE,
        ctaTitle: i18next.t('common.claim_label'),
      });
      this.listenTo(notification, 'cta_accept', function (model) {
        var model = new DuelystBackbone.Model();
        model.url = `${process.env.API_URL}/api/me/referrals/summary`;
        model.fetch();
        NavigationManager.getInstance().showModalView(new ReferralDialogView({ model }));
        this.stopListening(notification);
      }, this);
      this.listenTo(notification, 'dismiss', function (model) {
        this.stopListening(notification);
      }, this);
      NotificationsManager.getInstance().showNotification(notification);
    }
  },

  getFactionProgressionStatsModel(factionId) {
    if (factionId != null) {
      return this._factionProgressionStats[String(factionId)];
    }
  },

  isFactionUnlocked(factionId) {
    // Lyonar and Neutral always unlocked
    if (factionId == SDK.Factions.Faction1 || factionId == SDK.Factions.Neutral) {
      return true;
    }
    const progressionStatsModel = this.getFactionProgressionStatsModel(factionId);
    return (progressionStatsModel != null && progressionStatsModel.get('xp') != null);
  },

  isFactionUnlockedOrCardsOwned(factionId) {
    return this.isFactionUnlocked(factionId) || InventoryManager.getInstance().hasAnyCardsOfFaction(factionId);
  },

  getGameCount() {
    return this.gameCounterModel.get('game_count') || 0;
  },

  getHasActiveBossEvent() {
    return this.getCurrentBossEventModels().length != 0;
  },

  getTimeToActiveBossEventEnds() {
    const bossEventModels = this.getCurrentBossEventModels();

    if (bossEventModels.length == 0) {
      return 0;
    }

    const currentEventModel = bossEventModels[0];
    const momentNowUtc = moment.utc();
    const eventEndMoment = moment.utc(currentEventModel.get('event_end'));

    return eventEndMoment.valueOf() - momentNowUtc.valueOf();
  },

  getCurrentBossEventModels() {
    const momentNowUtc = moment.utc();
    return this.bossEventsCollection.filter((eventModel) => {
      const bossCard = SDK.GameSession.getCardCaches().getCardById(eventModel.get('boss_id'));

      return (eventModel.get('event_start') < momentNowUtc.valueOf())
        && (eventModel.get('event_end') > momentNowUtc.valueOf())
        && (bossCard != null);
    });
  },

  getUpcomingBossEventModel() {
    const momentNowUtc = moment.utc();
    return this.bossEventsCollection.find((eventModel) => {
      const bossCard = SDK.GameSession.getCardCaches().getCardById(eventModel.get('boss_id'));

      return (eventModel.get('event_start') > momentNowUtc.valueOf()) && (bossCard != null);
    });
  },

  getTimeToUpcomingBossEventAvailable() {
    const currentEventModel = this.getUpcomingBossEventModel();
    if (!currentEventModel) return 0;
    const momentNowUtc = moment.utc();
    const eventStartMoment = moment.utc(currentEventModel.get('event_start'));

    return eventStartMoment.valueOf() - momentNowUtc.valueOf();
  },

  getHasDefeatedBossForEvent(bossCardId, bossEventId) {
    const defeatedBossModel = this.bossesDefeatedCollection.find((defeatedBossModel) => (defeatedBossModel.get('boss_id') == bossCardId)
        && (defeatedBossModel.get('boss_event_id') == bossEventId));

    return defeatedBossModel != null;
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.stopListening(this.gameCounterRewardsCollection);
    this.gameCounterRewardsCollection = null;
  },

  /* endregion CONNECT */

  // Returns a promise that resolves to the challenge type when completed
  completeChallengeWithType(challengeType) {
    return new Promise((resolve, reject) => {
      const challengePreviouslyCompleted = this.hasCompletedChallengeOfType(challengeType);

      let processQuests = false;
      QuestsManager.getInstance().dailyQuestsCollection.each((questModel) => {
        if (SDK.QuestFactory.questForIdentifier(questModel.get('quest_type_id')) instanceof QuestBeginnerCompleteSoloChallenges) {
          processQuests = true;
        }
      });

      const request = $.ajax({
        data: JSON.stringify({ completed_at: moment().utc().valueOf(), process_quests: processQuests }),
        url: `${process.env.API_URL}/api/me/challenges/gated/${challengeType}/completed_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        if (request.status != 304) {
          // 304 Status means a challenge was already completed
          Analytics.track('challenge completed', {
            category: Analytics.EventCategory.Challenges,
            challenge_type: challengeType,
          }, {
            labelKey: 'challenge_type',
          });
          const { challenge } = response;
          this.challengeProgressionCollection.add([challenge], { merge: true });
          this.trigger(EVENTS.challenge_completed, { challengeCompletedType: challengeType });
        }

        if (response && response.challenge) {
          resolve(response.challenge);
        } else {
          resolve({});
        }
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const error = 'Complete challenge request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error(`Failed to complete challenge with type ${challengeType}`));
      });
    });
  },

  markChallengeAsAttemptedWithType(challengeType) {
    return new Promise((resolve, reject) => {
      const challengePreviouslyAttempted = this.hasAttemptedChallengeOfType(challengeType);

      const request = $.ajax({
        data: JSON.stringify({ last_attempted_at: moment().utc().valueOf() }),
        url: `${process.env.API_URL}/api/me/challenges/gated/${challengeType}/last_attempted_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        const { challenge } = response;
        this.challengeProgressionCollection.add([challenge], { merge: true });
        this.trigger(EVENTS.challenge_attempted, { challengeCompletedType: challengeType });

        resolve(challengeType);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const error = 'Attempt challenge request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error(`Failed to attempt challenge with type ${challengeType}`));
      });
    });
  },

  completeDailyChallenge(challengeId) {
    const completeDailyChallengePromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        data: JSON.stringify({ completed_at: moment().utc().valueOf() }),
        url: `${process.env.API_URL}/api/me/challenges/daily/${challengeId}/completed_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response, textStatus, jqXHR) => {
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
      });

      request.fail((response) => {
        let error = 'Complete daily challenge request failed';
        if (response && response.responseJSON && response.responseJSON.message) {
          error = response.responseJSON.message;
        }
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        resolve({});
      });
    });

    // This doesn't need to be directly part of the daily challenge completion promise chain
    completeDailyChallengePromise.then(() => QuestsManager.getInstance().updateDailyChallengeLastCompletedAt());

    return completeDailyChallengePromise;
  },

  hasAttemptedChallengeOfType(challengeType) {
    const challengeData = this.challengeProgressionCollection.get(challengeType);
    return challengeData && (challengeData.get('last_attempted_at') != null || challengeData.get('completed_at') != null);
  },

  hasAttemptedChallengeCategory(challengeCategory) {
    const challengesInCategory = SDK.ChallengeFactory.getChallengesForCategoryType(challengeCategory);
    return _.reduce(challengesInCategory, function (memo, challenge) {
      return memo && this.hasAttemptedChallengeOfType(challenge.type);
    }, true, this);
  },

  hasCompletedChallengeOfType(challengeType) {
    const challengeData = this.challengeProgressionCollection.get(challengeType);
    return challengeData && (challengeData.get('completed_at') != null);
  },

  // A Challenge category is completed if all challenges in that category are done
  hasCompletedChallengeCategory(challengeCategory) {
    const challengesInCategory = SDK.ChallengeFactory.getChallengesForCategoryType(challengeCategory);
    return _.reduce(challengesInCategory, function (memo, challenge) {
      return memo && this.hasCompletedChallengeOfType(challenge.type);
    }, true, this);
  },

  /* region EVENT HANDLERS */

  ongameCounterRewardReceived(questModel) {
    Logger.module('UI').log('ProgressionManager::ongameCounterRewardReceived');
  },

  /* endregion EVENT HANDLERS */

});
