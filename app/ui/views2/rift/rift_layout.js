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

var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');
var ShopData = require('app/data/shop.json');

// var RiftLayer = require('app/view/layers/rift/RiftLayer')
var RiftRunsCompositeView = require('./rift_runs_composite');
var RiftRunLayout = require('./rift_run_layout');
var Templ = require('./templates/rift_layout.hbs');

var RiftDeckSelectLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-rift',
  template: Templ,
  regions: {
    contentRegion: '.content-region',
  },

  runsCollection: null,
  _activeRiftRequest: null,

  initialize: function () {
    this.runsCollection = new DuelystBackbone.Collection();
    this.runsCollection.url = process.env.API_URL + '/api/me/rift/runs';
    this.runsCollection.fetch();
  },

  onShow: function () {
    this.runsCollection.onSyncOrReady().then(function () {
      var riftRunsView = new RiftRunsCompositeView({ collection: this.runsCollection });
      this.listenTo(riftRunsView, 'start_new_run_with_gold', this.startNewRiftRunWithGold);
      this.listenTo(riftRunsView, 'start_new_run_with_currency', this.startNewRiftRunWithCurrency);
      this.listenTo(riftRunsView, 'start_new_run_with_existing', this.startNewRiftRunWithExisting);
      this.contentRegion.show(riftRunsView);
      this.listenToOnce(riftRunsView, 'select', function (model) {
        if (model != null) {
          var runLayout = new RiftRunLayout({ model: model });
          this.contentRegion.show(runLayout);
        }
      }.bind(this));
    }.bind(this));
  },

  startNewRiftRunWithGold: function () {
    // make request
    if (this._activeRiftRequest == null) {
      this._activeRiftRequest = this._purchaseRiftRunTicketWithGold().then(function (ticketData) {
        return this._startRiftRunWithTicketId(ticketData.id);
      }.bind(this))
        .then(function (runData) {
          this._beginRiftRun(runData);
        }.bind(this))
        .catch(function (e) {
          this._activeRiftRequest = null;
        }.bind(this));
    }
  },

  startNewRiftRunWithCurrency: function () {
    // make request
    if (this._activeRiftRequest == null) {
      this._activeRiftRequest = this._purchaseRiftRunTicketWithCurrency().then(function (ticketData) {
        return this._startRiftRunWithTicketId(ticketData.id);
      }.bind(this))
        .then(function (runData) {
          this._activeRiftRequest = null;
          var runLayout = new RiftRunLayout({ model: new DuelystBackbone.Model(runData) });
          this.contentRegion.show(runLayout);
        }.bind(this))
        .catch(function (e) {
        // do nothing on cancel
          this._activeRiftRequest = null;
        }.bind(this));
    }
  },

  startNewRiftRunWithExisting: function () {
    var hasUnusedRiftTickets = InventoryManager.getInstance().hasUnusedRiftTicket();

    // Determine if a player can claim a free rift ticket (if they have no rift runs and they have no rift tickets)
    var riftRunModels = [];
    if (this.collection != null && this.collection.models != null) {
      riftRunModels = this.collection.models;
    }
    var canClaimFreeTicket = !hasUnusedRiftTickets && (riftRunModels.length == 0);
    var unusedRiftTickets = InventoryManager.getInstance().getUnusedRiftTicketModels();

    if (this._activeRiftRequest == null) {
      if (canClaimFreeTicket) {
        this._activeRiftRequest = this._startFirstFreeRiftRun();
      } else if (hasUnusedRiftTickets) {
        var unusedTicketId = unusedRiftTickets[0].get('id');
        this._activeRiftRequest = this._startRiftRunWithTicketId(unusedTicketId);
      } else {
        return Promise.reject('No existing or free ticket available');
      }

      this._activeRiftRequest
        .bind(this)
        .then(function (runData) {
          this._activeRiftRequest = null;
          var runLayout = new RiftRunLayout({ model: new DuelystBackbone.Model(runData) });
          this.contentRegion.show(runLayout);
        }.bind(this))
        .catch(function (e) {
          this._activeRiftRequest = null;
        }.bind(this));
    }

    return this._activeRiftRequest;
  },

  _beginRiftRun: function (runData) {
    var runLayout = new RiftRunLayout({ model: new DuelystBackbone.Model(runData) });
    this.contentRegion.show(runLayout);
  },

  _purchaseRiftRunTicketWithGold: function () {
    return new Promise(function (resolve, reject) {
      // attempt to buy a new ticket
      if (InventoryManager.getInstance().walletModel.get('gold_amount') < 150) {
        reject('You do not have sufficient gold to start the Gauntlet run.');
      } else {
        // buy an rift ticket
        var request = $.ajax({
          url: process.env.API_URL + '/api/me/inventory/rift_tickets',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
        });

        request.done(function (response) {
          Analytics.track('buy rift ticket with gold', {
            category: Analytics.EventCategory.Rift,
          });
          resolve(response);
        });

        request.fail(function (response) {
          // Temporary error, should parse server response.
          var errorMessage = 'Oops... there was a problem purchasing your ticket. Please try again.';
          EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
          reject(errorMessage);
        });
      }
    }.bind(this));
  },

  _purchaseRiftRunTicketWithCurrency: function () {
    var productData = ShopData.rift.RIFT_TICKET;
    return NavigationManager.getInstance().showDialogForConfirmPurchase(productData)
      .bind(this)
      .then(function (purchaseData) {
        Analytics.track('buy rift ticket with currency', {
          category: Analytics.EventCategory.Rift,
        });
        if (InventoryManager.getInstance().riftTicketsCollection.length == 0) {
        // wait until has a rift ticket
          return new Promise(function (resolve, reject) {
            this.listenToOnce(InventoryManager.getInstance().riftTicketsCollection, 'add', function () {
              NavigationManager.getInstance().destroyDialogView();
              return Promise.resolve();
            });
          }.bind(this));
        } else {
        // Ticket arrived in inventory before we got here
          return Promise.resolve();
        }
      })
      .catch(function (e) {
      // do nothing on cancel
      });
  },

  _startRiftRunWithTicketId: function (ticketId) {
    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rift/runs',
        data: JSON.stringify({ ticket_id: ticketId }),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        Analytics.track('start rift run with ticket', {
          category: Analytics.EventCategory.Rift,
        });
        resolve(response);
      });

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var errorMessage = 'Oops... there was a problem starting your run. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }.bind(this));
  },

  _startFirstFreeRiftRun: function () {
    return new Promise(function (resolve, reject) {
      var request = $.ajax({
        url: process.env.API_URL + '/api/me/rift/runs/free',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });

      request.done(function (response) {
        Analytics.track('claim free rift run', {
          category: Analytics.EventCategory.Rift,
        });
        resolve(response);
      });

      request.fail(function (response) {
        // Temporary error, should parse server response.
        var errorMessage = 'Oops... there was a problem starting your free run. Please try again.';
        EventBus.getInstance().trigger(EVENTS.ajax_error, errorMessage);
        reject(errorMessage);
      });
    }.bind(this));
  },
});

// Expose the class either via CommonJS or the global object
module.exports = RiftDeckSelectLayout;
