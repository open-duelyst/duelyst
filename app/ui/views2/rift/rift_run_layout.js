// pragma PKGS: nongame

'use strict';

var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var PKGS = require('app/data/packages');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var Analytics = require('app/common/analytics');
var AnalyticsTracker = require('app/common/analyticsTracker');
var audio_engine = require('app/audio/audio_engine');
var UtilsEnv = require('app/common/utils/utils_env');
var PackageManager = require('app/ui/managers/package_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var GamesManager = require('app/ui/managers/games_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var RiftLayer = require('app/view/layers/rift/RiftLayer');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');
var ShopData = require('app/data/shop.json');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var i18next = require('i18next');

var Templ = require('./templates/rift_run_layout.hbs');

var RiftLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-rift',
  template: Templ,

  /* region MARIONETTE EVENTS */

  onShow: function () {
    // load rift resources
    // wait for model data to sync
    // show activity dialog while we load
    Promise.all([
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView()),
      PackageManager.getInstance().loadMinorPackage('rift'),
    ]).then(function () {
      if (this.isDestroyed) return; // view is destroyed

      // remove activity dialog
      NavigationManager.getInstance().destroyDialogView();

      // show the rift layer
      var riftLayer = new RiftLayer();
      Scene.getInstance().showContent(riftLayer, true);

      // wire up this as the rift layer delegate
      riftLayer.delegate = this;
      riftLayer.dataSource = this;

      // events
      this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_cancel, this.cancelLookingForGame);

      // bind deck
      if (!this.needsEmptyDeckForRiftRunData(this.model.attributes)) {
        riftLayer.bindDeck(this.model.attributes.deck);
      }

      // show run data
      return this.showScreenForRiftRunData(this.model.attributes);
    }.bind(this));
  },

  onDestroy: function () {
    // unload rift resources
    PackageManager.getInstance().unloadMajorMinorPackage('rift');
  },

  /* endregion MARIONETTE EVENTS */

  /* region BINDING DATA */

  needsLoadForRiftRunData: function (riftRunData) {
    return riftRunData != null && riftRunData.created_at != null && !riftRunData.rewards_claimed_at && riftRunData.faction_id != null;
  },

  needsShowFreshRiftRunForRiftRunData: function (riftRunData) {
    return riftRunData != null && (riftRunData.created_at == null || riftRunData.rewards_claimed_at);
  },

  needsEmptyDeckForRiftRunData: function (riftRunData) {
    return this.needsShowFreshRiftRunForRiftRunData(riftRunData);
  },

  loadResourcesForRiftRunData: function (riftRunData) {
    // rift nodes all handle their own resources as needed
    return Promise.resolve();
  },

  showScreenForRiftRunData: function (riftRunData) {
    var scene = Scene.getInstance();
    var riftLayer = scene && scene.getContent();
    if (riftLayer instanceof RiftLayer) {
      if (this.needsEmptyDeckForRiftRunData(riftRunData)) {
        riftLayer.bindDeck([]);
      }

      if (riftRunData.general_id == null) {
        riftLayer.showCardSelectScreen(riftRunData);
      } else if (riftRunData.card_id_to_upgrade) {
        riftLayer.showCardUpgradeScreen(riftRunData);
      } else if (riftRunData.stored_upgrades && riftRunData.stored_upgrades.length > 0) {
        riftLayer.bindDeck(this.model.attributes.deck);
        riftLayer.showSelectCardToUpgradeScreen(riftRunData);
      } else {
        var lastGameModel = GamesManager.getInstance().playerGames.first();
        if (lastGameModel) {
          var isRecent = moment.utc(lastGameModel.get('created_at')).isAfter(moment().utc().subtract(1, 'hour'));
          var wonLastGauntletGame = isRecent && lastGameModel.get('game_type') == SDK.GameType.Gauntlet && lastGameModel.get('is_winner');
        }
        riftLayer.showRiftRunScreen(riftRunData, false);
      }
    }

    return Promise.resolve();
  },

  /* endregion BINDING DATA */

  /* region ARENA LAYER DELEGATE */

  /**
   * Shows next rift screen based on an optional promise, handling loading and errors as needed.
   * @param {Promise} [promise=null]
   * @returns {Promise}
   */
  showNextScreen: function (promise) {
    var nextScreenPromise = (promise || Promise.resolve()).then(function (riftRunData) {
      // always fallback to current model data
      if (riftRunData == null) { riftRunData = this.model.attributes; }

      // load resources while delegate is running callback
      return this.loadResourcesForRiftRunData(riftRunData).then(function () {
        return this.showScreenForRiftRunData(riftRunData);
      }.bind(this));
    }.bind(this));

    // show dialog for errors
    nextScreenPromise.catch(function (errorMessage) {
      return NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: errorMessage });
    }.bind(this));

    return nextScreenPromise;
  },

  /**
   * Requests a faction selection and progresses rift flow to next step.
   * @param factionId
   * @returns {Promise}
   */
  selectGeneral: function (selectedSdkCard, unselectedSdkCards) {
    // make request
    var requestPromise = new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rift/runs/' + this.model.get('ticket_id') + '/general_id',
        data: JSON.stringify({ general_id: selectedSdkCard.id }),
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        if (selectedSdkCard != null && selectedSdkCard.id != null) {
          Analytics.track('select rift general', {
            category: Analytics.EventCategory.Rift,
            card_id: selectedSdkCard.id,
          });
        }
        this.model.set(response);
        resolve(response);
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var errorMessage = 'Oops... there was a problem selecting your general. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }.bind(this));

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests a card selection and progresses rift flow to next step.
   * @param {SDK.Card} selectedSdkCard
   * @param {Array} unselectedSdkCards list of cards not selected
   * @returns {Promise}
   */
  selectCard: function (selectedSdkCard, unselectedSdkCards) {
    // make request
    var requestPromise = new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rift/runs/' + this.model.get('ticket_id') + '/upgrade',
        data: JSON.stringify({ card_id: selectedSdkCard.id }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        this.model.set(response);
        NewPlayerManager.getInstance().setHasUsedRiftUpgrade(true);
        resolve(response);
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var errorMessage = 'Oops... there was a problem selecting your card. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }.bind(this));

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  selectCardToUpgrade: function (cardId) {
    if (this.model.get('card_id_to_upgrade')) {
      return NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'You already have a card replace in progress' }));
    }
    var upgradesAvailableCount = this.model.get('upgrades_available_count') || 0;
    var storedUpgradesAvailableCount = 0;
    if (this.model.get('stored_upgrades') != null) {
      storedUpgradesAvailableCount = this.model.get('stored_upgrades').length;
    }

    if (upgradesAvailableCount == 0 && storedUpgradesAvailableCount == 0) {
      return NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'You don\'t have any card upgrades available' }));
    }

    return NavigationManager.getInstance().showDialogForConfirmation(i18next.t('rift.confirm_replace_card_message')).then(function () {
      // make request
      var requestPromise = new Promise(function (resolve, reject) {
        var request = $.ajax({
          url: process.env.API_URL + '/api/me/rift/runs/' + this.model.get('ticket_id') + '/card_id_to_upgrade',
          data: JSON.stringify({ card_id: cardId }),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          this.model.set(response);
          resolve(response);
        }.bind(this));

        request.fail(function (response) {
          // Temporary error, should parse server response.
          var errorMessage = 'Oops... there was a problem selecting your card. Please try again.';
          EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
          reject(errorMessage);
        });
      }.bind(this));

      // progress rift flow after request
      return this.showNextScreen(requestPromise);
    }.bind(this));
  },

  /**
   * Requests start looking for rift game.
   * @returns {Promise}
   */
  startLookingForGame: function () {
    // rift deck is saved on server and not with user
    // so we'll start finding a new game with an empty deck but flag it as an rift game type
    GamesManager.getInstance().findNewGame([], this.model.get('faction_id'), SDK.GameType.Rift, this.getRiftRunGeneralId(), null, null, this.model.get('ticket_id'));

    return Promise.resolve();
  },

  /**
   * Stores the current upgrade pack for the next rift run
   * @returns {Promise}
   */
  storeCurrentUpgradePack: function () {
    // make request
    var requestPromise = new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rift/runs/' + this.model.get('ticket_id') + '/store_upgrade',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        this.model.set(response);
        resolve(response);
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var errorMessage = 'Oops... there was a problem storing your upgrade. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }.bind(this));

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Rerolls the current upgrade pack for the current rift run
   * @returns {Promise}
   */
  rerollCurrentUpgradePack: function () {
    // make request
    var requestPromise = new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rift/runs/' + this.model.get('ticket_id') + '/reroll_upgrade',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        this.model.set(response);
        resolve(response);
      }.bind(this));

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var errorMessage = 'Oops... there was a problem rerolling your upgrade. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }.bind(this));

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests stop looking for rift game.
   * @returns {Promise}
   */
  cancelLookingForGame: function () {
    if (!NavigationManager.getInstance().getIsShowingModalView()) {
      GamesManager.getInstance().cancelMatchmaking();
    }

    return Promise.resolve();
  },

  /* endregion ARENA LAYER DELEGATE */

  /**
   * Returns the general id for the current rift run, or null
   * @returns {int} The card id of the general for this run || null
   */
  getRiftRunGeneralId: function () {
    var generalId = this.model.get('general_id');
    return generalId;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = RiftLayout;
