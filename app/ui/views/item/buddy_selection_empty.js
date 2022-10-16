const Logger = require('app/common/logger');
const ProfileManager = require('app/ui/managers/profile_manager');
const ProgressionManager = require('app/ui/managers/progression_manager');
const Template = require('app/ui/templates/item/buddy_selection_empty.hbs');
const ReferralDialogView = require('app/ui/views2/referrals/referral_dialog');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const RedeemGiftCodeModalView = require('app/ui/views/item/redeem_gift_code_modal');

const BuddySelectionEmptyItemView = Backbone.Marionette.ItemView.extend({

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
    canRedeemReferralCode() {
      return ProfileManager.getInstance().get('referred_by_user_id') == null && ProgressionManager.getInstance().getGameCount() <= 0;
    },
  },

  initialize() {
  },

  onRender() {
  },

  onOpenReferralProgram() {
    const model = new DuelystBackbone.Model();
    model.url = `${process.env.API_URL}/api/me/referrals/summary`;
    model.fetch();
    NavigationManager.getInstance().showModalView(new ReferralDialogView({ model }));
  },

  onClaimReferralCode() {
    NavigationManager.getInstance().showModalView(new RedeemGiftCodeModalView());
  },
});

// Expose the class either via CommonJS or the global object
module.exports = BuddySelectionEmptyItemView;
