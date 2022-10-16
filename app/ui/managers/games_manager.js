// See: https://coderwall.com/p/myzvmg for why managers are created this way

const _GamesManager = {};
_GamesManager.instance = null;
_GamesManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new GamesManager();
  }
  return this.instance;
};
_GamesManager.current = _GamesManager.getInstance;

module.exports = _GamesManager;

const _ = require('underscore');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const NotificationModel = require('app/ui/models/notification');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const Analytics = require('app/common/analytics');
const AnalyticsTracker = require('app/common/analyticsTracker');
const GameInviteItemView = require('app/ui/views/item/game_invite');
const prettyMs = require('pretty-ms');
const moment = require('moment');
const i18next = require('i18next');
const ProfileManager = require('./profile_manager');
const TelemetryManager = require('./telemetry_manager');
const NavigationManager = require('./navigation_manager');
const ChatManager = require('./chat_manager');
const InventoryManager = require('./inventory_manager');
const NotificationsManager = require('./notifications_manager');
const Manager = require('./manager');

/** @namespace */
var GamesManager = Manager.extend({

  // firebase
  _matchmakingErrorRef: null,

  // backbone models and collection
  rankingModel: null,
  ladderPositionModel: null,
  historyRankingModelCollection: null,
  topRankingModel: null,
  lastSentInviteModel: null,
  lastReceivedInviteModel: null,
  lastAcceptedInviteModel: null,
  receivedInvitesCollection: null,
  playerGames: null,
  userStatsModel: null,

  // state
  matchRequest: null, // current match request obj
  isLookingForGame: false,
  inviteId: null,

  /**
  * Timer handle for updating the rank at the next midnight UTC since the season may roll over.
  * @type {number}
  * @private
  */
  _rankUpdateScheduleTimeout: null,

  initialize(options) {
    Manager.prototype.initialize.call(this);
  },

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');

        // initialize a rank model for best season
        this.topRankingModel = new DuelystFirebase.Model(null, { firebase: `${process.env.FIREBASE_URL}/user-ranking/${userId}/top` });

        // initialize a model for the users stats
        this.userStatsModel = new DuelystFirebase.Model(null, { firebase: `${process.env.FIREBASE_URL}/user-stats/${userId}` });

        // init player games collection
        this.playerGames = new DuelystFirebase.Collection(null, { firebase: new Firebase(`${process.env.FIREBASE_URL}/user-games/${userId}`).limit(1) });

        // init game invites collection
        this.receivedInvitesCollection = new DuelystFirebase.Collection(null, { firebase: `${process.env.FIREBASE_URL}/matchmaking/${process.env.NODE_ENV}/invites/to/${userId}` });
        this.listenTo(this.receivedInvitesCollection, 'add', this._onGameInviteReceived);

        // initialize a rank model
        this.rankingModel = new DuelystFirebase.Model(null, { firebase: `${process.env.FIREBASE_URL}/user-ranking/${userId}/current` });
        this.rankingModel.onSyncOrReady()
          .bind(this)
          .then(function (model) {
            this._onRankingSyncedOrChanged(model);
            return this._onRankingSyncedFirstTime(model);
          })
          .then(function (response) {
            this.listenTo(this.rankingModel, 'change', this._onRankingSyncedOrChanged);

            // initialize a rank model collection for past seasons
            this.historyRankingModelCollection = new DuelystBackbone.Collection();
            this.historyRankingModelCollection.url = `${process.env.API_URL}/api/me/rank/history`;
            this.historyRankingModelCollection.fetch();

            // initialize a ranked ladder position model
            this.ladderPositionModel = new DuelystBackbone.Model();
            this.ladderPositionModel.url = `${process.env.API_URL}/api/me/rank/current_ladder_position`;
            this.ladderPositionModel.fetch();

            this._markAsReadyWhenModelsAndCollectionsSynced([this.historyRankingModelCollection, this.playerGames, this.ladderPositionModel]);
          });
      });
  },

  onBeforeDisconnect() {
    Manager.prototype.onBeforeDisconnect.call(this);
    this._stopWatchingForGame();
    if (this._matchmakingErrorRef) {
      this._matchmakingErrorRef.off();
      this._matchmakingErrorRef = null;
    }
    this.stopListening(this.rankingModel);
    if (this._rankUpdateScheduleTimeout) clearTimeout(this._rankUpdateScheduleTimeout);
  },

  /**
  * Does first-time setup for ladder ranking. Fired ONCE as a result of the {@link GamesManager.rankingModel} first time 'sync'.
  * @private
  */
  _onRankingSyncedFirstTime() {
    Logger.module('UI').log('QuestsManager::_onRankingSynced()');

    // the first time the ranking is synced, request/check for new season ranking
    // ranking model should update itself through Firebase if needed
    return this._requestRankUpdateFromServer();
  },

  /**
  * Requests a ladder ranking update (if needed) from the API server.
  * @private
  * @return {Promise} $.ajax promise for the server call to update ranking.
  */
  _requestRankUpdateFromServer() {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rank`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        // schedule an update when the day rolls over
        // this is because rank could need an update after midnight UTC
        this._scheduleRankUpdateWhenUTCdayRollsOver();

        // If rank was cycled (status 200) and we have a rank history it needs to be refreshed
        // Also update which S-Rank season we are looking at
        if (request.status == 200 && this.historyRankingModelCollection) {
          const historyRequest = this.historyRankingModelCollection.fetch();

          historyRequest.done((historyResponse) => {
            resolve(response);
          });

          historyRequest.fail((historyResponse) => {
            const error = 'SEASON HISTORY RANK request failed';
            EventBus.getInstance().trigger(EVENTS.ajax_error, error);

            reject(new Error(error));
          });

          // Update S-Rank Ladder
          // refetch ranked ladder position model
          this.ladderPositionModel.fetch();
        } else {
          resolve(response);
        }
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const error = 'SEASON RANK request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);

        reject(new Error(error));
      });
    });
  },

  /**
  * Requests to enter matchmaking queue
  * @param {Object} matchRequest contains deck,factionId,gameType,etc
  * @return {Promise} $.ajax promise for the server call to enter matchmaking queue
  * @return {Object} response from server contains an matchmaking token ID
  */
  requestEnterMatchmaking(matchRequest) {
    const request = $.ajax({
      data: JSON.stringify(matchRequest),
      url: `${process.env.API_URL}/matchmaking`,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
    });

    request.done((response) => {
      Logger.module('UI').log('GamesManager::requestEnterMatchmaking -> entered queue');
      const { tokenId } = response;

      // We only get a velocity in the response if we entered queue (not invites)
      if (response.velocity) {
        const { velocity } = response;
        Logger.module('UI').log(`GamesManager::requestEnterMatchmaking -> expected wait ${prettyMs(velocity)}`);
        EventBus.getInstance().trigger(EVENTS.matchmaking_velocity, velocity);
      }

      // start watching for errors using the intermediate game 'tokenId' returned from AJAX request
      this._matchmakingErrorRef = new Firebase(`${process.env.FIREBASE_URL}/user-matchmaking-errors/${ProfileManager.getInstance().get('id')}/${tokenId}`);
      this._matchmakingErrorRef.on(
        'value',
        (snapshot) => {
          if (snapshot.val()) {
            this._onMatchmakingError(snapshot.val());
          }
        },
        (err) => { console.log(err); },
      );
    });

    request.fail((jqXHR) => {
      this._onMatchmakingError(jqXHR && jqXHR.responseJSON && (jqXHR.responseJSON.error || jqXHR.responseJSON.message) || 'Failed to connect to matchmaker. Please retry.');
    });

    return request;
  },

  /**
  * Requests to leave matchmaking queue
  * @return {Promise} $.ajax promise for the server call to leave matchmaking queue
  */
  requestLeaveMatchmaking() {
    const request = $.ajax({
      url: `${process.env.API_URL}/matchmaking`,
      type: 'DELETE',
      contentType: 'application/json',
      dataType: 'json',
    });

    request.done((response) => {});
    request.fail((jqXHR) => {});
    return request;
  },

  /**
  * Auto-marks ranking data as read. Fired as a result of the {@link GamesManager.rankingModel} 'change' and the inital load of the data.
  * @private
  */
  _onRankingSyncedOrChanged() {
    // set rank in chat manager
    let rank = this.rankingModel.get('rank');
    if (_.isUndefined(rank) || _.isNull(rank)) rank = 30;

    ChatManager.getInstance().onReady().then(() => {
      ChatManager.getInstance().setRankInStatus(rank);
    });

    Analytics.identify(null, { rank });

    if (this.rankingModel.get('is_unread')) {
      Logger.module('UI').log('GamesManager::_onRankingSynced() -> loaded an UNREAD ranking');
      // mark raking as read
      this.rankingModel.set('is_unread', false);
    }
  },

  /**
   * Get's the current rank for this season
   * @public
   */
  getCurrentRank() {
    return this.rankingModel.get('rank') || 30;
  },

  /**
   * Returns whether or not the player has an unread season reward to be claimed
   * @public
   */
  hasUnreadSeasonReward() {
    const seasonRewardsStartMoment = moment('8-1-2015 +0000', 'MM-DD-YYYY Z'); // TODO: Update to october before pushing
    for (let i = 0; i < this.historyRankingModelCollection.models.length; i++) {
      const historyRankModel = this.historyRankingModelCollection.models[i];
      if (historyRankModel.get('is_unread')) {
        if (historyRankModel.get('starting_at') >= seasonRewardsStartMoment.valueOf()) {
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Returns an array of models for past seasons where the player has rewards that are unread
   * @public
   */
  getSeasonsWithUnclaimedRewards() {
    const unreadSeasonRewardModels = [];
    const seasonRewardsStartMoment = moment('8-1-2015 +0000', 'MM-DD-YYYY Z'); // TODO: Update to october before pushing
    for (let i = 0; i < this.historyRankingModelCollection.models.length; i++) {
      const historyRankModel = this.historyRankingModelCollection.models[i];
      if (historyRankModel.get('is_unread')) {
        // Check that the season started after when season rewards are implemented
        if (historyRankModel.get('starting_at') >= seasonRewardsStartMoment.valueOf()) {
          unreadSeasonRewardModels.push(historyRankModel);
        }
      }
    }

    return unreadSeasonRewardModels;
  },

  /**
   * Returns an int representing the players current ladder position
   * @public
   */
  getCurrentLadderPosition() {
    return this.ladderPositionModel.get('ladder_position');
  },

  /**
   * Returns a promise that resolves to an array of reward objects for a season reward model that is passed in and marks that season rewards as read
   * @public
   * @param {Backbone model} seasonModel    backbone model for the season to claim rewards for
   */
  claimRewardsForSeason(seasonModel) {
    // Mark locally that this model is now read
    seasonModel.set('is_unread', false);

    return new Promise((resolve, reject) => {
      const season_key = moment(seasonModel.get('starting_at')).utc().format('YYYY-MM');
      // TODO: Mark rewards as claimed
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rank/history/${season_key}/claim_rewards`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        // Convert rewards to backbone models
        const rewardModels = [];
        for (let i = 0; i < response.length; i++) {
          rewardModels.push(new Backbone.Model(response[i]));
        }

        // resolve to rewards in response
        resolve(rewardModels);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const error = 'CLAIM RANK REWARDS request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(error);
      });
    });
  },

  /**
   * Initiate spectating a game of a player on your buddy list
   * @public
   * @param   {String}   buddyId    The User ID for the buddy to spectate.
   * @return   {Promise}        The promise that resolves when the spectate data is loaded and event to start spectating triggered.
   */
  spectateBuddyGame(buddyId) {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/spectate/${buddyId}`,
        type: 'GET',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        this.trigger(EVENTS.start_spectate, {
          gameData: response.gameData,
          token: response.token,
          playerId: buddyId,
        });
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const error = response && response.responseJSON && response.responseJSON.message || 'SPECTATE request failed';
        EventBus.getInstance().trigger(EVENTS.ajax_error, error);
        reject(new Error(error));
      });
    });
  },

  /**
  * Schedules an update request for the ladder ranking at UTC midnight. Ladder ranks could need a reset after season's end.
  * @private
  */
  _scheduleRankUpdateWhenUTCdayRollsOver() {
    if (this._rankUpdateScheduleTimeout) clearTimeout(this._rankUpdateScheduleTimeout);
    const milisecondsToUTCMidnight = moment().utc().endOf('day').valueOf() - moment().utc().valueOf();
    const duration = moment.duration(milisecondsToUTCMidnight);
    Logger.module('UI').log(`GamesManager::_scheduleRankUpdateWhenUTCdayRollsOver() -> rank scheduled to check for update in ${duration.humanize()}`);
    this._rankUpdateScheduleTimeout = setTimeout(this._requestRankUpdateFromServer.bind(this), milisecondsToUTCMidnight);
  },

  invitePlayerToGame(playerId, playerName) {
    if (!this.lastSentInviteModel || this.lastSentInviteModel.get('toId') !== playerId) {
      // cancel previous invite
      this.cancelInvite();

      // create a firebase reference for the invite keyed for the user we're sending the invite to
      const inviteRef = new Firebase(`${process.env.FIREBASE_URL}/matchmaking/${process.env.NODE_ENV}/invites/to/${playerId}/`).push();

      // initialize the invite attributes
      const inviteData = {};
      inviteData.fromName = ProfileManager.getInstance().get('username');
      inviteData.fromId = ProfileManager.getInstance().get('id');
      inviteData.toName = playerName;
      inviteData.toId = playerId;
      inviteData.status = 'sent';
      inviteData.createdAt = Date.now();

      // update invite queue
      inviteRef.setWithPriority(inviteData, Firebase.ServerValue.TIMESTAMP);

      // creat an invite model
      this.lastSentInviteModel = new DuelystFirebase.Model(inviteData, { firebase: inviteRef });

      // listen to a change to the accepted attribute
      this.listenTo(this.lastSentInviteModel, 'change:status', this._onSentInviteStatusChanged);

      // also keep an invite id for matchmaking
      this.inviteId = inviteRef.name();

      // create notification model
      const notificationModel = new NotificationModel({
        message: i18next.t('buddy_list.challenge_sent_title'),
        playerName,
        type: 'sent-invite',
      });

      // show game invite
      const gameInviteItemView = new GameInviteItemView({ model: notificationModel });

      // listen to changes to the view, such as knowing that the CTA has been clicked
      this.listenTo(gameInviteItemView, 'cta_accept', function () {
        this.stopListening(gameInviteItemView);
      }, this);
      this.listenTo(gameInviteItemView, 'dismiss', function () {
        this.stopListening(gameInviteItemView);
        if (NavigationManager.getInstance().getIsShowingModalViewClass(GameInviteItemView)) {
          NavigationManager.getInstance().destroyModalView();
        }
      }, this);
      this.listenTo(gameInviteItemView, 'destroy', function () {
        // this should only be triggered if something replaces the game invite view before it is accepted or dismissed
        this.stopListening(gameInviteItemView);
      }, this);

      NavigationManager.getInstance().showModalView(gameInviteItemView);

      // trigger invite_sent event
      this.trigger('invite_sent', this.lastSentInviteModel);

      TelemetryManager.getInstance().setSignal('invite', 'waiting');
    }
  },

  findNewGame(deck, factionId, gameType, generalId, cardBackId, battleMapId, ticketId) {
    // if we're already looking for a game, just ignore this
    if (this.isLookingForGame) return;

    // grab the current user id
    const userId = ProfileManager.getInstance().get('id');

    Logger.module('UI').log('GamesManager::findNewGame -> for faction id', factionId, 'with name', SDK.FactionFactory.factionForIdentifier(factionId).name, 'with deck', deck);

    // TODO : remove ranking model from AJAX request and retrieve server-side
    const matchRequest = {};
    matchRequest.name = ProfileManager.getInstance().get('username');
    matchRequest.gameType = gameType;
    matchRequest.namespace = process.env.NODE_ENV;
    matchRequest.deck = deck;
    matchRequest.factionId = factionId;
    matchRequest.generalId = generalId;
    matchRequest.cardBackId = cardBackId;
    matchRequest.battleMapId = battleMapId;
    matchRequest.ticketId = ticketId;
    matchRequest.hasPremiumBattleMaps = InventoryManager.getInstance().hasAnyBattleMapCosmetics();

    matchRequest.timestamp = Date.now();

    if (gameType == SDK.GameType.Friendly) {
      matchRequest.inviteId = this.inviteId || null;
    } else if (this.inviteId) {
      this.cancelInvite();
      this.rejectInvite();
    }

    // save a copy of request ?
    this.matchRequest = matchRequest;

    // fire matchmaking_start event
    // currently application.coffee listens to this event to show matchmaking view
    this.trigger(EVENTS.matchmaking_start, this.matchRequest);

    // mark ourselves as looking for game
    this.isLookingForGame = true;
    this._onFindingGame();

    // fire ajax request
    return this.requestEnterMatchmaking(this.matchRequest);
  },

  // TODO : merge this into startWatchingForGame
  _onFindingGame() {
    Logger.module('UI').log('GamesManager._onFindingGame');
    this.trigger(EVENTS.finding_game, this.matchRequest);
    this._startWatchingForGame();

    TelemetryManager.getInstance().setSignal('matchmaking', 'in-queue');
  },

  _startWatchingForGame() {
    Logger.module('UI').log('GamesManager._startWatchingForGame');
    // stop any previous watching
    this._stopWatchingForGame();

    // start listening for new games on the player games list
    this.listenTo(this.playerGames, 'add', this._onGameFound);
  },

  _stopWatchingForGame() {
    this.stopListening(this.playerGames, 'add', this._onGameFound);
  },

  // deals with ajax errors + error written back from firebase
  _onMatchmakingError(errorMessage) {
    this._cleanupMatchmaking();
    this.trigger(EVENTS.matchmaking_error, errorMessage);
  },

  _onGameFound(model) {
    Logger.module('UI').log('GamesManager._onGameFound');
    this._stopWatchingForGame();

    // Analytics call
    if (this.matchRequest) {
      // Only track for non friendly matchmaking
      if (this.inviteId == null) {
        if (model != null && model.get('game_type') != null) {
          const matchRequestMoment = new moment(this.matchRequest.timestamp);
          const secondsSinceMatchRequest = moment().diff(matchRequestMoment, 'seconds');
          Analytics.track('matchmaking complete', {
            category: Analytics.EventCategory.Matchmaking,
            duration: secondsSinceMatchRequest,
            game_type: model.get('game_type'),
          }, {
            nonInteraction: 1,
            valueKey: 'duration',
          });
        }
      }
    }

    // not looking for a game anymore
    this.isLookingForGame = false;
    // mark any invite with sent as complete
    if (this.lastSentInviteModel) {
      this.lastSentInviteModel.set('status', 'complete');
    }
    if (this.lastReceivedInviteModel) {
      this.lastReceivedInviteModel.set('status', 'complete');
    }
    // clear out any invite data we have sent
    this.cancelInvite();
    // clear out any invite data we have received
    this.rejectInvite();

    // this._clear_matchmakingQueueItemRef();
    this.trigger('found_game', model.attributes);

    TelemetryManager.getInstance().clearSignal('matchmaking', 'in-queue');
  },

  _onGameInviteReceived(inviteModel) {
    if (!inviteModel.has('fromName') || this.lastReceivedInviteModel != null || !ChatManager.getInstance().getIsMyStatusValidForBuddyGameInvite()) {
      // reject bad invite or an old artifact from a race condition
      // reject when we already have an active game invite
      // reject game invites unless our status is valid for buddy game invites
      // defer rejection because this is a direct response to the collection add event
      _.defer(() => {
        this._rejectInvite(inviteModel);
        this.receivedInvitesCollection.remove(inviteModel);
      });
      return;
    }

    this.lastReceivedInviteModel = inviteModel;
    this.listenTo(this.lastReceivedInviteModel, 'change:status', this._onReceivedInviteStatusChanged);

    // create a notification model
    const notificationModel = new NotificationModel({
      message: i18next.t('buddy_list.challenge_received_title'),
      playerName: this.lastReceivedInviteModel.get('fromName'),
      type: 'recieved-invite',
    });

    // create dialog view
    const gameInviteItemView = new GameInviteItemView({ model: notificationModel });

    // listen to changes to the view, such as knowing that the CTA has been clicked
    this.listenTo(gameInviteItemView, 'cta_accept', function () {
      this.stopListening(gameInviteItemView);
      if (NavigationManager.getInstance().getIsShowingModalViewClass(GameInviteItemView)) {
        NavigationManager.getInstance().destroyModalView();
      }
      this.acceptInvite(inviteModel);
    }, this);
    this.listenTo(gameInviteItemView, 'dismiss', function () {
      this.stopListening(gameInviteItemView);
      if (NavigationManager.getInstance().getIsShowingModalViewClass(GameInviteItemView)) {
        NavigationManager.getInstance().destroyModalView();
      }
      this.rejectInvite(inviteModel);
    }, this);
    this.listenTo(gameInviteItemView, 'destroy', function () {
      // this should only be triggered if something replaces the game invite view before it is accepted or dismissed
      this.stopListening(gameInviteItemView);
      this.rejectInvite(inviteModel);
    }, this);

    // show game invite
    NavigationManager.getInstance().showModalView(gameInviteItemView);
  },

  /**
  * Called when your opponent accepts or cancels an invite.
  * @private
  */
  _onSentInviteStatusChanged(inviteModel) {
    Logger.module('UI').log(`GamesManager::_onSentInviteStatusChanged -> ${inviteModel.get('status')}`);

    // TODO: hide dialog UI and move on to selecting a deck
    if (inviteModel.hasChanged('status')) {
      if (inviteModel.get('status') == 'accepted') {
        this.trigger(EVENTS.invite_accepted, this.lastSentInviteModel);
        TelemetryManager.getInstance().clearSignal('invite', 'waiting');
      }
      if (inviteModel.get('status') == 'rejected') {
        // defer execution of firing off the invite_rejected until the entire stack that's causing this event clears
        // this is because backbone models will process "pending" changes after we call the destroy method on them in the cancelInvite call, and will re-create the object with JUST the pending changes
        // this results in an empty invite with just the status:rejected property left on the database side
        _.defer(() => {
          if (this.isLookingForGame) {
            this._cleanupMatchmaking();
          }
          this.trigger(EVENTS.invite_rejected, this.lastSentInviteModel);
          this.cancelInvite();
        });

        TelemetryManager.getInstance().clearSignal('invite', 'waiting');
      }
    }
  },

  /**
  * Called when your opponent accepts or cancels an invite.
  * @private
  */
  _onReceivedInviteStatusChanged(inviteModel) {
    Logger.module('UI').log(`GamesManager::_onReceivedInviteStatusChanged -> ${inviteModel.get('status')}`);

    if (inviteModel.hasChanged('status')) {
      if (inviteModel.get('status') == 'complete') {
        this.stopListening(inviteModel);
      }
      if (inviteModel.get('status') == 'cancelled') {
        if (this.isLookingForGame) {
          this._cleanupMatchmaking();
        }
        // just go ahead and clear out the local received invite data too and reject it if needed
        // this will also stop listening to any events on the model
        this.rejectInvite();
        // redundant call below since rejectInvite should be doing this, but just in case
        this.stopListening(inviteModel);
        this.trigger(EVENTS.invite_cancelled, inviteModel);
      }
    }
  },

  acceptInvite(inviteModel) {
    if (this.lastReceivedInviteModel != null) {
      this.stopListening(this.lastReceivedInviteModel);
      this.lastReceivedInviteModel = null;
    }

    Logger.module('UI').log(`GamesManager::acceptInvite -> ID:${inviteModel.id}`);
    inviteModel.set('status', 'accepted'); // mark invite as accepted
    this.rejectInvite(); // reject and previous accepted invite
    this.inviteId = inviteModel.id;
    this.lastAcceptedInviteModel = inviteModel;
    this.listenTo(this.lastAcceptedInviteModel, 'change:status', this._onReceivedInviteStatusChanged);
    this.trigger(EVENTS.invite_accepted, inviteModel);
  },

  _cleanupMatchmaking() {
    this.isLookingForGame = false;

    // fire ajax request
    this.requestLeaveMatchmaking();

    TelemetryManager.getInstance().clearSignal('matchmaking', 'in-queue');
    this.matchRequest = null;

    this._stopWatchingForGame();

    if (this._matchmakingErrorRef) {
      this._matchmakingErrorRef.off();
      this._matchmakingErrorRef = null;
    }

    this.cancelInvite();
    this.rejectInvite();
  },

  cancelMatchmaking() {
    const wasLookingForGame = this.isLookingForGame;
    Logger.module('UI').log('GamesManager::cancelMatchmaking -> wasLookingForGame?', wasLookingForGame);

    // Analytics call
    if (this.matchRequest && wasLookingForGame) {
      // Only track for non friendly matchmaking
      if (this.inviteId == null) {
        const matchRequestMoment = new moment(this.matchRequest.timestamp);
        const secondsSinceMatchRequest = moment().diff(matchRequestMoment, 'seconds');
        Analytics.track('matchmaking canceled', {
          category: Analytics.EventCategory.Matchmaking,
          duration: secondsSinceMatchRequest,
        }, {
          nonInteraction: 1,
          valueKey: 'duration',
        });
      }
    }

    this._cleanupMatchmaking();

    if (wasLookingForGame) {
      // trigger cancel event only if was looking for a game
      this.trigger(EVENTS.matchmaking_cancel);
    }
  },

  cancelInvite() {
    if (this.lastSentInviteModel) {
      Logger.module('UI').log(`GamesManager.cancelInvite -> ID:${this.lastSentInviteModel.id}`);
      this.stopListening(this.lastSentInviteModel);
      if (this.lastSentInviteModel.get('status') != 'complete' && this.lastSentInviteModel.get('status') != 'rejected') {
        this.lastSentInviteModel.set('status', 'cancelled');
      }
      this.lastSentInviteModel.destroy({});
      this.lastSentInviteModel = null;
      this.inviteId = null;
    }
  },

  rejectInvite(specificInvite) {
    if (this.lastReceivedInviteModel) {
      if (this.lastReceivedInviteModel != specificInvite) {
        this._rejectInvite(this.lastReceivedInviteModel);
      }
      this.lastReceivedInviteModel = null;
    }

    if (this.lastAcceptedInviteModel) {
      if (this.lastAcceptedInviteModel != specificInvite) {
        this._rejectInvite(this.lastAcceptedInviteModel);
      }
      this.lastAcceptedInviteModel = null;
      this.inviteId = null;
    }

    this._rejectInvite(specificInvite);
  },

  _rejectInvite(inviteModel) {
    if (inviteModel) {
      Logger.module('UI').log(`GamesManager.rejectInvite -> ID:${inviteModel.id}`);
      this.stopListening(inviteModel);
      if (inviteModel.has('status') && inviteModel.get('status') != 'complete' && inviteModel.get('status') != 'cancelled') {
        inviteModel.set('status', 'rejected');
      }
    }
  },

});
