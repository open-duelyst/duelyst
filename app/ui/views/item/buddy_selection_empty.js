'use strict';

var Logger = require('app/common/logger');
var ProfileManager = require('app/ui/managers/profile_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var Template = require('app/ui/templates/item/buddy_selection_empty.hbs');
var ReferralDialogView = require('app/ui/views2/referrals/referral_dialog');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var RedeemGiftCodeModalView = require('app/ui/views/item/redeem_gift_code_modal');

var BuddySelectionEmptyItemView = Backbone.Marionette.ItemView.extend({

  className: 'buddy-selection-empty',
  template: Template,
  events: {
    'click #open_referral_program': 'onOpenReferralProgram',
    'click #claim_referral_code': 'onClaimReferralCode',
  },
  ui: {
    claim_referral_code: '#claim_referral_code',
  },

  templateHelpers: {
    canRedeemReferralCode: function () {
      return ProfileManager.getInstance().get('referred_by_user_id') == null && ProgressionManager.getInstance().getGameCount() <= 0;
    },
  },

  initialize: function () {
  },

  onRender: function () {
  },

  onOpenReferralProgram: function () {
    var model = new DuelystBackbone.Model();
    model.url = process.env.API_URL + '/api/me/referrals/summary';
    model.fetch();
    NavigationManager.getInstance().showModalView(new ReferralDialogView({ model: model }));
  },

  onClaimReferralCode: function () {
    NavigationManager.getInstance().showModalView(new RedeemGiftCodeModalView());
  },
});

// Expose the class either via CommonJS or the global object
module.exports = BuddySelectionEmptyItemView;
