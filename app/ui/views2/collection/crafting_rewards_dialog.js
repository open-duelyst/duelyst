'use strict';

var NavigationManager = require('app/ui/managers/navigation_manager');
var CraftingRewardsDialogItemViewTempl = require('./templates/crafting_rewards_dialog.hbs');

var CraftingRewardsDialogItemView = Backbone.Marionette.ItemView.extend({

  id: 'crafting-rewards-dialog',
  className: 'modal prompt-modal',

  template: CraftingRewardsDialogItemViewTempl,

  ui: {},

  events: {
    'click .cancel-dialog': 'onCancel',
  },

  onShow: function () {
    // listen to specific user attempted actions as this is a dialog and dialogs block user actions
    this.listenToOnce(NavigationManager.getInstance(), 'user_attempt_skip', this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), 'user_attempt_cancel', this.onCancel);
    this.listenToOnce(NavigationManager.getInstance(), 'user_attempt_confirm', this.onCancel);
  },

  onCancel: function () {
    NavigationManager.getInstance().destroyDialogView();
    this.trigger('cancel');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = CraftingRewardsDialogItemView;
