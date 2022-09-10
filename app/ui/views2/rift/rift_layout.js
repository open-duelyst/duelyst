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

const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');

const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const Promise = require('bluebird');
const _ = require('underscore');
const moment = require('moment');
const ShopData = require('app/data/shop.json');

// var RiftLayer = require('app/view/layers/rift/RiftLayer')
const RiftRunsCompositeView = require('./rift_runs_composite');
const RiftRunLayout = require('./rift_run_layout');
const Templ = require('./templates/rift_layout.hbs');

const RiftDeckSelectLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-rift',
  template: Templ,
  regions: {
    contentRegion: '.content-region',
  },

  runsCollection: null,
  _activeRiftRequest: null,

  initialize() {
    this.runsCollection = new DuelystBackbone.Collection();
    this.runsCollection.url = `${process.env.API_URL}/api/me/rift/runs`;
    this.runsCollection.fetch();
  },

  onShow() {
    this.runsCollection.onSyncOrReady().then(() => {
      const riftRunsView = new RiftRunsCompositeView({ collection: this.runsCollection });
      this.listenTo(riftRunsView, 'start_new_run_with_gold', this.startNewRiftRunWithGold);
      this.listenTo(riftRunsView, 'start_new_run_with_currency', this.startNewRiftRunWithCurrency);
      this.listenTo(riftRunsView, 'start_new_run_with_existing', this.startNewRiftRunWithExisting);
      this.contentRegion.show(riftRunsView);
      this.listenToOnce(riftRunsView, 'select', (model) => {
        if (model != null) {
          const runLayout = new RiftRunLayout({ model });
          this.contentRegion.show(runLayout);
        }
      });
    });
  },

  startNewRiftRunWithGold() {
    // make request
    if (this._activeRiftRequest == null) {
      this._activeRiftRequest = this._purchaseRiftRunTicketWithGold().then((ticketData) => this._startRiftRunWithTicketId(ticketData.id))
        .then((runData) => {
          this._beginRiftRun(runData);
        })
        .catch((e) => {
          this._activeRiftRequest = null;
        });
    }
  },

  startNewRiftRunWithCurrency() {
    // make request
    if (this._activeRiftRequest == null) {
      this._activeRiftRequest = this._purchaseRiftRunTicketWithCurrency().then((ticketData) => this._startRiftRunWithTicketId(ticketData.id))
        .then((runData) => {
          this._activeRiftRequest = null;
          const runLayout = new RiftRunLayout({ model: new DuelystBackbone.Model(runData) });
          this.contentRegion.show(runLayout);
        })
        .catch((e) => {
          // do nothing on cancel
          this._activeRiftRequest = null;
        });
    }
  },

  startNewRiftRunWithExisting() {
    const hasUnusedRiftTickets = InventoryManager.getInstance().hasUnusedRiftTicket();

    // Determine if a player can claim a free rift ticket (if they have no rift runs and they have no rift tickets)
    let riftRunModels = [];
    if (this.collection != null && this.collection.models != null) {
      riftRunModels = this.collection.models;
    }
    const canClaimFreeTicket = !hasUnusedRiftTickets && (riftRunModels.length == 0);
    const unusedRiftTickets = InventoryManager.getInstance().getUnusedRiftTicketModels();

    if (this._activeRiftRequest == null) {
      if (canClaimFreeTicket) {
        this._activeRiftRequest = this._startFirstFreeRiftRun();
      } else if (hasUnusedRiftTickets) {
        const unusedTicketId = unusedRiftTickets[0].get('id');
        this._activeRiftRequest = this._startRiftRunWithTicketId(unusedTicketId);
      } else {
        return Promise.reject('No existing or free ticket available');
      }

      this._activeRiftRequest
        .bind(this)
        .then((runData) => {
          this._activeRiftRequest = null;
          const runLayout = new RiftRunLayout({ model: new DuelystBackbone.Model(runData) });
          this.contentRegion.show(runLayout);
        })
        .catch((e) => {
          this._activeRiftRequest = null;
        });
    }

    return this._activeRiftRequest;
  },

  _beginRiftRun(runData) {
    const runLayout = new RiftRunLayout({ model: new DuelystBackbone.Model(runData) });
    this.contentRegion.show(runLayout);
  },

  _purchaseRiftRunTicketWithGold() {
    return new Promise((resolve, reject) => {
      // attempt to buy a new ticket
      if (InventoryManager.getInstance().walletModel.get('gold_amount') < 150) {
        reject('You do not have sufficient gold to start the Gauntlet run.');
      } else {
        // buy an rift ticket
        const request = $.ajax({
          url: `${process.env.API_URL}/api/me/inventory/rift_tickets`,
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done((response) => {
          Analytics.track('buy rift ticket with gold', {
            category: Analytics.EventCategory.Rift,
          });
          resolve(response);
        });

        request.fail((response) => {
          // Temporary error, should parse server response.
          const errorMessage = 'Oops... there was a problem purchasing your ticket. Please try again.';
          EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
          reject(errorMessage);
        });
      }
    });
  },

  _purchaseRiftRunTicketWithCurrency() {
    const productData = ShopData.rift.RIFT_TICKET;
    return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
      .bind(this)
      .then(function (purchaseData) {
        Analytics.track('buy rift ticket with currency', {
          category: Analytics.EventCategory.Rift,
        });
        if (InventoryManager.getInstance().riftTicketsCollection.length == 0) {
          // wait until has a rift ticket
          return new Promise((resolve, reject) => {
            this.listenToOnce(InventoryManager.getInstance().riftTicketsCollection, 'add', () => {
              NavigationManager.getInstance().destroyDialogView();
              return Promise.resolve();
            });
          });
        }
        // Ticket arrived in inventory before we got here
        return Promise.resolve();
      })
      .catch((e) => {
        // do nothing on cancel
      });
  },

  _startRiftRunWithTicketId(ticketId) {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rift/runs`,
        data: JSON.stringify({ ticket_id: ticketId }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        Analytics.track('start rift run with ticket', {
          category: Analytics.EventCategory.Rift,
        });
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = 'Oops... there was a problem starting your run. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });
  },

  _startFirstFreeRiftRun() {
    return new Promise((resolve, reject) => {
      const request = $.ajax({
        url: `${process.env.API_URL}/api/me/rift/runs/free`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done((response) => {
        Analytics.track('claim free rift run', {
          category: Analytics.EventCategory.Rift,
        });
        resolve(response);
      });

      request.fail((response) => {
        // Temporary error, should parse server response.
        const errorMessage = 'Oops... there was a problem starting your free run. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    });
  },
});

// Expose the class either via CommonJS or the global object
module.exports = RiftDeckSelectLayout;
