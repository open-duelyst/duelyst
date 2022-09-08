// pragma PKGS: nongame

const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const PKGS = require('app/data/packages');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const Analytics = require('app/common/analytics');
const AnalyticsTracker = require('app/common/analyticsTracker');
const audio_engine = require('app/audio/audio_engine');
const UtilsEnv = require('app/common/utils/utils_env');
const PackageManager = require('app/ui/managers/package_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const GamesManager = require('app/ui/managers/games_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const RiftLayer = require('app/view/layers/rift/RiftLayer');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const Promise = require('bluebird');
const _ = require('underscore');
const moment = require('moment');
const ShopData = require('app/data/shop.json');
var ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const i18next = require('i18next');

const Templ = require('./templates/rift_run_layout.hbs');

const RiftLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-rift',
  template: Templ,

  /* region MARIONETTE EVENTS */

  onShow() {
    // load rift resources
    // wait for model data to sync
    // show activity dialog while we load
    Promise.all([
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView()),
      PackageManager.getInstance().loadMinorPackage('rift'),
    ]).then(() => {
      if (this.isDestroyed) return; // view is destroyed

      // remove activity dialog
      NavigationManager.getInstance().destroyDialogView();

      // show the rift layer
      const riftLayer = new RiftLayer();
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
    });
  },

  onDestroy() {
    // unload rift resources
    PackageManager.getInstance().unloadMajorMinorPackage('rift');
  },

  /* endregion MARIONETTE EVENTS */

  /* region BINDING DATA */

  needsLoadForRiftRunData(riftRunData) {
    return riftRunData != null && riftRunData.created_at != null && !riftRunData.rewards_claimed_at && riftRunData.faction_id != null;
  },

  needsShowFreshRiftRunForRiftRunData(riftRunData) {
    return riftRunData != null && (riftRunData.created_at == null || riftRunData.rewards_claimed_at);
  },

  needsEmptyDeckForRiftRunData(riftRunData) {
    return this.needsShowFreshRiftRunForRiftRunData(riftRunData);
  },

  loadResourcesForRiftRunData(riftRunData) {
    // rift nodes all handle their own resources as needed
    return Promise.resolve();
  },

  showScreenForRiftRunData(riftRunData) {
    const scene = Scene.getInstance();
    const riftLayer = scene && scene.getContent();
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
        const lastGameModel = GamesManager.getInstance().playerGames.first();
        if (lastGameModel) {
          const isRecent = moment.utc(lastGameModel.get('created_at')).isAfter(moment().utc().subtract(1, 'hour'));
          const wonLastGauntletGame = isRecent && lastGameModel.get('game_type') == SDK.GameType.Gauntlet && lastGameModel.get('is_winner');
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
  showNextScreen(promise) {
    const nextScreenPromise = (promise || Promise.resolve()).then((riftRunData) => {
      // always fallback to current model data
      if (riftRunData == null) { riftRunData = this.model.attributes; }

      // load resources while delegate is running callback
      return this.loadResourcesForRiftRunData(riftRunData).then(() => this.showScreenForRiftRunData(riftRunData));
    });

    // show dialog for errors
    nextScreenPromise.catch((errorMessage) => NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: errorMessage }));

    return nextScreenPromise;
  },

  /**
   * Requests a faction selection and progresses rift flow to next step.
   * @param factionId
   * @returns {Promise}
   */
  selectGeneral(selectedSdkCard, unselectedSdkCards) {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rift/runs/${this.model.get('ticket_id')}/general_id`,
        data: JSON.stringify({ general_id: selectedSdkCard.id }),
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        if (selectedSdkCard != null && selectedSdkCard.id != null) {
          Analytics.track('select rift general', {
            category: Analytics.EventCategory.Rift,
            card_id: selectedSdkCard.id,
          });
        }
        this.model.set(response);
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = 'Oops... there was a problem selecting your general. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests a card selection and progresses rift flow to next step.
   * @param {SDK.Card} selectedSdkCard
   * @param {Array} unselectedSdkCards list of cards not selected
   * @returns {Promise}
   */
  selectCard(selectedSdkCard, unselectedSdkCards) {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rift/runs/${this.model.get('ticket_id')}/upgrade`,
        data: JSON.stringify({ card_id: selectedSdkCard.id }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        this.model.set(response);
        NewPlayerManager.getInstance().setHasUsedRiftUpgrade(true);
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = 'Oops... there was a problem selecting your card. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  selectCardToUpgrade(cardId) {
    if (this.model.get('card_id_to_upgrade')) {
      return NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'You already have a card replace in progress' }));
    }
    const upgradesAvailableCount = this.model.get('upgrades_available_count') || 0;
    let storedUpgradesAvailableCount = 0;
    if (this.model.get('stored_upgrades') != null) {
      storedUpgradesAvailableCount = this.model.get('stored_upgrades').length;
    }

    if (upgradesAvailableCount == 0 && storedUpgradesAvailableCount == 0) {
      return NavigationManager.getInstance().showDialogView(new ErrorDialogItemView({ title: 'You don\'t have any card upgrades available' }));
    }

    return NavigationManager.getInstance().showDialogForConfirmation(i18next.t('rift.confirm_replace_card_message')).then(() => {
      // make request
      const requestPromise = new Promise((resolve, reject) => {
        const request = $.ajax({
          url: `${process.env.API_URL}/api/me/rift/runs/${this.model.get('ticket_id')}/card_id_to_upgrade`,
          data: JSON.stringify({ card_id: cardId }),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          this.model.set(response);
          resolve(response);
        });

        request.fail((response) => {
          // Temporary error, should parse server response.
          const errorMessage = 'Oops... there was a problem selecting your card. Please try again.';
          EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
          reject(errorMessage);
        });
      });

      // progress rift flow after request
      return this.showNextScreen(requestPromise);
    });
  },

  /**
   * Requests start looking for rift game.
   * @returns {Promise}
   */
  startLookingForGame() {
    // rift deck is saved on server and not with user
    // so we'll start finding a new game with an empty deck but flag it as an rift game type
    GamesManager.getInstance().findNewGame([], this.model.get('faction_id'), SDK.GameType.Rift, this.getRiftRunGeneralId(), null, null, this.model.get('ticket_id'));

    return Promise.resolve();
  },

  /**
   * Stores the current upgrade pack for the next rift run
   * @returns {Promise}
   */
  storeCurrentUpgradePack() {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rift/runs/${this.model.get('ticket_id')}/store_upgrade`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        this.model.set(response);
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = 'Oops... there was a problem storing your upgrade. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Rerolls the current upgrade pack for the current rift run
   * @returns {Promise}
   */
  rerollCurrentUpgradePack() {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rift/runs/${this.model.get('ticket_id')}/reroll_upgrade`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        this.model.set(response);
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = 'Oops... there was a problem rerolling your upgrade. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });

    // progress rift flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests stop looking for rift game.
   * @returns {Promise}
   */
  cancelLookingForGame() {
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
  getRiftRunGeneralId() {
    const generalId = this.model.get('general_id');
    return generalId;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = RiftLayout;
