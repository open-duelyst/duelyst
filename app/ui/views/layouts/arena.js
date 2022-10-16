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
const ArenaTempl = require('app/ui/templates/layouts/arena.hbs');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const ArenaLayer = require('app/view/layers/arena/ArenaLayer');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const Promise = require('bluebird');
const _ = require('underscore');
const moment = require('moment');
const ShopData = require('app/data/shop.json');
const i18next = require('i18next');

const ArenaLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-arena',
  template: ArenaTempl,

  /* region MARIONETTE EVENTS */

  onShow() {
    // get arena model for current arena run if exists
    const arenaRef = new Firebase(process.env.FIREBASE_URL).child('user-gauntlet-run').child(ProfileManager.getInstance().get('id')).child('current');
    this.model = new DuelystFirebase.Model(null, { firebase: arenaRef });

    // load gauntlet resources
    // wait for model data to sync
    // show activity dialog while we load
    Promise.all([
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView()),
      PackageManager.getInstance().loadMinorPackage('gauntlet'),
      this.model.onSyncOrReady(),
    ]).then(() => {
      if (this.isDestroyed) return; // view is destroyed

      // remove activity dialog
      NavigationManager.getInstance().destroyDialogView();

      // show the arena layer
      const arenaLayer = new ArenaLayer();
      Scene.getInstance().showContent(arenaLayer, true);

      // wire up this as the arena layer delegate
      arenaLayer.delegate = this;
      arenaLayer.dataSource = this;

      // events
      this.listenTo(NavigationManager.getInstance(), EVENTS.user_triggered_cancel, this.cancelLookingForGame);

      // bind deck
      if (!this.needsEmptyDeckForArenaRunData(this.model.attributes)) {
        arenaLayer.bindDeck(this.model.attributes.deck);
      }

      // show run data
      return this.showScreenForArenaRunData(this.model.attributes);
    });
  },

  onDestroy() {
    // unload gauntlet resources
    PackageManager.getInstance().unloadMajorMinorPackage('gauntlet');
  },

  /* endregion MARIONETTE EVENTS */

  /* region GETTERS / SETTERS */

  getTicketCount() {
    return InventoryManager.getInstance().arenaTicketsCollection.length;
  },

  /* endregion GETTERS / SETTERS */

  /* region BINDING DATA */

  needsLoadForArenaRunData(arenaRunData) {
    return arenaRunData != null && arenaRunData.created_at != null && !arenaRunData.rewards_claimed_at && arenaRunData.faction_id != null;
  },

  needsShowFreshArenaRunForArenaRunData(arenaRunData) {
    return arenaRunData != null && (arenaRunData.created_at == null || arenaRunData.rewards_claimed_at);
  },

  needsShowRewardsForArenaRunData(arenaRunData) {
    // return arenaRunData != null && arenaRunData.faction_id != null && (arenaRunData.ended_at != null || arenaRunData.rewards_claimed_at != null);
    return arenaRunData != null && (arenaRunData.ended_at != null || arenaRunData.rewards_claimed_at != null);
  },

  needsEmptyDeckForArenaRunData(arenaRunData) {
    return this.needsShowFreshArenaRunForArenaRunData(arenaRunData) || this.needsShowRewardsForArenaRunData(arenaRunData);
  },

  loadResourcesForArenaRunData(arenaRunData) {
    // arena nodes all handle their own resources as needed
    return Promise.resolve();
  },

  showScreenForArenaRunData(arenaRunData) {
    const scene = Scene.getInstance();
    const arenaLayer = scene && scene.getContent();
    if (arenaLayer instanceof ArenaLayer) {
      if (this.needsEmptyDeckForArenaRunData(arenaRunData)) {
        arenaLayer.bindDeck([]);
      }

      // show screen for data
      if (this.needsShowFreshArenaRunForArenaRunData(arenaRunData)) {
        // new arena run
        arenaLayer.showStartArenaRunScreen();
      } else {
        // in progress arena run
        if (this.needsShowRewardsForArenaRunData(arenaRunData)) {
          arenaLayer.showArenaRewardsScreen(arenaRunData);
        } else if (arenaRunData.is_complete) {
          const lastGameModel = GamesManager.getInstance().playerGames.first();
          let wonLastGauntletGame = false;
          if (lastGameModel != null) {
            const isRecent = moment.utc(lastGameModel.get('created_at')).isAfter(moment().utc().subtract(1, 'hour'));
            wonLastGauntletGame = isRecent && lastGameModel.get('game_type') == SDK.GameType.Gauntlet && lastGameModel.get('is_winner');
          }
          arenaLayer.showArenaRunScreen(arenaRunData, wonLastGauntletGame);
        } else if (arenaRunData.card_choices != null) {
          arenaLayer.showCardSelectScreen(arenaRunData);
        } else if (arenaRunData.general_choices != null) {
          arenaLayer.showCardSelectScreen(arenaRunData);
        }
      }
    }

    return Promise.resolve();
  },

  /* endregion BINDING DATA */

  /* region TICKETS */

  _retrieveArenaRunTicket() {
    return new Promise((resolve, reject) => {
      if (InventoryManager.getInstance().arenaTicketsCollection.length > 0) {
        // start with first ticket
        resolve(InventoryManager.getInstance().arenaTicketsCollection.at(0));
      } else {
        // attempt to buy a new ticket
        if (InventoryManager.getInstance().walletModel.get('gold_amount') < 150) {
          reject(i18next.t('gauntlet.start_error_message_insufficient_gold'));
        } else {
          // buy an arena ticket
          const request = $.ajax({
            url: `${process.env.API_URL}/api/me/inventory/gauntlet_tickets`,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
          });

          request.done((response) => {
            resolve({ id: response });
          });

          request.fail((response) => {
            // Temporary error, should parse server response.
            const errorMessage = i18next.t('gauntlet.start_error_message_generic'); // "Oops... there was a problem purchasing your Gauntlet ticket. Please try again.";
            EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
            reject(errorMessage);
          });
        }
      }
    });
  },

  _startArenaRunWithTicketId(ticketId) {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/gauntlet/runs`,
        data: JSON.stringify({ ticket_id: ticketId }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = i18next.t('gauntlet.start_error_message_generic');
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });
  },

  /* endregion TICKETS */

  /* region ARENA LAYER DELEGATE */

  /**
   * Shows next arena screen based on an optional promise, handling loading and errors as needed.
   * @param {Promise} [promise=null]
   * @returns {Promise}
   */
  showNextScreen(promise) {
    const nextScreenPromise = (promise || Promise.resolve()).then((arenaRunData) => {
      // always fallback to current model data
      if (arenaRunData == null) { arenaRunData = this.model.attributes; }

      // load resources while delegate is running callback
      return this.loadResourcesForArenaRunData(arenaRunData).then(() => this.showScreenForArenaRunData(arenaRunData));
    });

    // show dialog for errors
    nextScreenPromise.catch((errorMessage) => NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: errorMessage }));

    return nextScreenPromise;
  },

  /**
   * Open purchase dialog.
   * @returns {Promise}
   */
  purchaseTicket() {
    const productData = ShopData.gauntlet.GAUNTLET_TICKET;
    return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
      .bind(this)
      .then(function (purchaseData) {
        if (InventoryManager.getInstance().arenaTicketsCollection.length == 0) {
        // wait until has an arena ticket
        // NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());
          this.listenToOnce(InventoryManager.getInstance().arenaTicketsCollection, 'add', () => {
            NavigationManager.getInstance().destroyDialogView();
            EventBus.getInstance().trigger(EVENTS.show_play, SDK.PlayModes.Gauntlet);
          });
        } else {
        // already has arena ticket
          EventBus.getInstance().trigger(EVENTS.show_play, SDK.PlayModes.Gauntlet);
        }
      })
      .catch(() => {
      // do nothing on cancel
      });
  },

  /**
   * Requests start of new arena run and progresses arena flow to next step.
   * @returns {Promise}
   */
  startNewArenaRun() {
    // make request
    const requestPromise = this._retrieveArenaRunTicket().then((ticketData) => this._startArenaRunWithTicketId(ticketData.id));

    // progress arena flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests a faction selection and progresses arena flow to next step.
   * @param factionId
   * @returns {Promise}
   */
  selectFaction(factionId) {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/gauntlet/runs/current/faction_id`,
        data: JSON.stringify({ faction_id: factionId }),
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        const unchosenFactionIds = _.without(this.model.get('faction_choices'), factionId);
        const unchosenFaction1 = unchosenFactionIds[0] || null;
        const unchosenFaction2 = unchosenFactionIds[1] || null;
        Analytics.track('start gauntlet run', {
          category: Analytics.EventCategory.Gauntlet,
          ticket_id: this.model.get('ticket_id'),
          faction_id: factionId,
          did_not_choose_faction_1: unchosenFaction1,
          did_not_choose_faction_2: unchosenFaction2,
        });

        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = i18next.t('common.start_error_message_generic_please_retry'); // "Oops... there was a problem selecting your faction. Please try again."
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });

    // progress arena flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests a card selection and progresses arena flow to next step.
   * @param {SDK.Card} selectedSdkCard
   * @param {Array} unselectedSdkCards list of cards not selected
   * @returns {Promise}
   */
  selectCard(selectedSdkCard, unselectedSdkCards) {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/gauntlet/runs/current/cards`,
        data: JSON.stringify({ card_id: selectedSdkCard.id }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        let unchosenCard1Id = null;
        let unchosenCard2Id = null;
        if (unselectedSdkCards && unselectedSdkCards[0]) {
          unchosenCard1Id = unselectedSdkCards[0].id;
        }
        if (unselectedSdkCards && unselectedSdkCards[1]) {
          unchosenCard2Id = unselectedSdkCards[1].id;
        }
        let choiceIndex = 0;
        if (response && response.deck) {
          choiceIndex = (response.deck.length - 1);
        }
        Analytics.track('gauntlet card choice', {
          category: Analytics.EventCategory.Gauntlet,
          ticket_id: this.model.get('ticket_id'),
          card_id: selectedSdkCard.id,
          did_not_choose_card_1_id: unchosenCard1Id,
          did_not_choose_card_2_id: unchosenCard2Id,
          card_choice_index: choiceIndex,
        }, {
          labelKey: 'card_id',
        });

        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = i18next.t('common.start_error_message_generic_please_retry'); // "Oops... there was a problem selecting your card. Please try again.";
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });

    // progress arena flow after request
    return this.showNextScreen(requestPromise);
  },

  /**
   * Requests resign and progresses arena flow to next step.
   * @returns {Promise}
   */
  resignArenaRun() {
    return NavigationManager.getInstance().showDialogForConfirmation(i18next.t('gauntlet.resign_confirmation_message')).then(() => {
      // make request
      const requestPromise = new Promise((resolve, reject) => {
        const request = $.ajax({
          url: `${process.env.API_URL}/api/me/gauntlet/runs/current`,
          type: 'DELETE',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          resolve(response);
        });

        request.fail((response) => {
          // Temporary error, should parse server response.
          const errorMessage = i18next.t('common.start_error_message_generic_please_retry'); // "Oops... there was a problem resigning your run. Please try again.";
          EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
          reject(errorMessage);
        });
      });

      // progress arena flow after request
      return this.showNextScreen(requestPromise);
    });
  },

  /**
   * Requests rewards and progresses arena flow to next step.
   * @returns {Promise}
   */
  claimArenaRewards() {
    // make request
    const requestPromise = new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/gauntlet/runs/current/rewards_claimed_at`,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        const winCount = this.model.get('win_count') || 0;
        let didResign = 0;
        if (this.model.get('is_resigned')) {
          didResign = 1;
        }
        Analytics.track('claim gauntlet rewards', {
          category: Analytics.EventCategory.Gauntlet,
          faction_id: this.model.get('faction_id'),
          ticket_id: this.model.get('ticket_id'),
          win_count: winCount,
          did_resign: didResign,
          general_id: this.getArenaRunGeneralId(),
        }, {
          labelKey: 'faction_id',
          valueKey: 'win_count',
        });
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = i18next.t('common.start_error_message_generic_please_retry'); // "Oops... there was a problem claiming your rewards. Please try again.";
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }).then((arenaRunData) => {
      const scene = Scene.getInstance();
      const arenaLayer = scene && scene.getContent();
      if (arenaLayer instanceof ArenaLayer) {
        arenaLayer.showArenaRewardsScreen(arenaRunData);
      }
    }).catch((errorMessage) => NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: errorMessage }));

    return requestPromise;
  },

  /**
   * Marks current arena rewards as seen.
   * @returns {Promise}
   */
  markArenaRewardsAsSeen() {
    // mark rewards as seen
    this.model.set('rewards_seen', true);

    // show next screen
    return this.showNextScreen();
  },

  /**
   * Requests start looking for arena game.
   * @returns {Promise}
   */
  startLookingForGame() {
    // arena deck is saved on server and not with user
    // so we'll start finding a new game with an empty deck but flag it as an arena game type
    GamesManager.getInstance().findNewGame([], this.model.get('faction_id'), SDK.GameType.Gauntlet, this.getArenaRunGeneralId());

    return Promise.resolve();
  },

  /**
   * Requests stop looking for arena game.
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
   * Returns the general id for the current arena run, or null
   * @returns {int} The card id of the general for this run || null
   */
  getArenaRunGeneralId() {
    // check if deck is complete, if it's not we don't know the general yet
    const isComplete = this.model.get('is_complete');
    if (!isComplete) {
      return null;
    }

    let generalId = this.model.get('general_id');

    // https://github.com/88dots/cleancoco/pull/8372
    // Runs created prior to this change will have complete decks but not have a general in the arenaData.deck
    // To handle this we will continue to use default general if generalId does not exist
    if (generalId == null && isComplete) {
      const factionId = this.model.get('faction_id');
      const sdkFaction = SDK.FactionFactory.factionForIdentifier(factionId);
      const defaultGeneralId = sdkFaction.generalIdsByOrder[SDK.FactionFactory.GeneralOrder.Primary];
      generalId = defaultGeneralId;
    }

    return generalId;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ArenaLayout;
