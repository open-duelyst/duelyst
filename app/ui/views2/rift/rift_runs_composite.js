const Scene = require('app/view/Scene');
const NavigationManager = require('app/ui/managers/navigation_manager');
const InventoryManager = require('app/ui/managers/inventory_manager');
const Logger = require('app/common/logger');
const SlidingPanelSelectCompositeView = require('app/ui/views/composite/sliding_panel_select');
const RiftDeckSelectLayer = require('app/view/layers/rift/RiftDeckSelectLayer');
const RiftRunDeckView = require('./rift_run_deck');
const RiftRunsEmptyView = require('./rift_runs_empty');
const Templ = require('./templates/rift_runs_composite.hbs');

const RiftRunsComposite = SlidingPanelSelectCompositeView.extend({

  tagName: 'div',
  className: 'sliding-panel-select rift-runs',
  template: Templ,
  childView: RiftRunDeckView,
  emptyView: RiftRunsEmptyView,
  childViewContainer: '.rift-runs-list',
  slidingPanelsStack: false,

  ui: {
    $start_new_run_container_buy: '#start_new_run_container_buy',
    $start_new_run_container_existing: '#start_new_run_container_existing',
    $start_new_run_button_with_gold: '#start_new_run_button_with_gold',
  },

  triggers: {
    'click #start_new_run_button_with_gold': 'start_new_run_with_gold',
    'click #start_new_run_button_with_currency': 'start_new_run_with_currency',
    'click #start_new_run_button_with_existing': 'start_new_run_with_existing',
  },

  templateHelpers: {
    hasAnyBattleMapCosmetics() {
      return InventoryManager.getInstance().hasAnyBattleMapCosmetics();
    },
    hasAnyStoredRiftUpgrades() {
      const storedUpgradeCount = ProfileManager.getInstance().profile.get('rift_stored_upgrade_count');
      return storedUpgradeCount != null && storedUpgradeCount != 0;
    },
    getStoredRiftUpgradesCount() {
      const storedUpgradeCount = ProfileManager.getInstance().profile.get('rift_stored_upgrade_count');
      return storedUpgradeCount || 0;
    },
  },

  onShow() {
    SlidingPanelSelectCompositeView.prototype.onShow.call(this);

    // show play layer
    Scene.getInstance().showContentByClass(RiftDeckSelectLayer, true);

    // change fx
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 255, g: 0, b: 0, a: 255,
    }, {
      r: 0, g: 0, b: 0, a: 255,
    });

    let riftRunModels = [];
    if (this.collection != null && this.collection.models != null) {
      riftRunModels = this.collection.models;
    }

    const canClaimFreeTicket = !InventoryManager.getInstance().hasUnusedRiftTicket() && (riftRunModels.length == 0);

    if (InventoryManager.getInstance().hasUnusedRiftTicket() || canClaimFreeTicket) {
      this.ui.$start_new_run_container_existing.removeClass('hide');
    } else {
      this.ui.$start_new_run_container_buy.removeClass('hide');
      if (InventoryManager.getInstance().getWalletModelGoldAmount() < CONFIG.RIFT_TICKET_GOLD_PRICE) {
        this.ui.$start_new_run_button_with_gold.addClass('disabled');
      }
    }
  },

  onPrepareForDestroy() {
    // reset fx
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = RiftRunsComposite;
