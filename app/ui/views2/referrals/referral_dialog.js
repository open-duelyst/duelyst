const moment = require('moment');
const Animations = require('app/ui/views/animations');
const NavigationManager = require('app/ui/managers/navigation_manager');
const Logger = require('app/common/logger.coffee');
const ProfileManager = require('app/ui/managers/profile_manager');
const ErrorDialogItemView = require('app/ui/views/item/error_dialog');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const openUrl = require('app/common/openUrl');

const ReferralEventHistoryView = require('./referral_event_history');
const Template = require('./templates/referral_dialog.hbs');

const ReferralDialogView = Backbone.Marionette.ItemView.extend({
  className: 'modal prompt-modal',
  template: Template,
  events: {
    'click #claim_rewards_button': 'onClaimRewards',
    'click #referral_code': 'onCopyReferralCode',
    'click #event_history_button': 'onShowEventHistory',
  },
  ui: {
    $claimRewardsButton: '#claim_rewards_button',
    $claimRewardsRegion: '#claim_rewards_region',
    $claimRewardsSuccess: '#claim_rewards_success',
    $referralCode: '#referral_code',
  },
  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,
  _userNavLockId: 'ReferralDialogViewLockId',

  initialize() {
    this.listenTo(this.model, 'sync', this.render);
  },

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    data.username = ProfileManager.getInstance().get('username');
    if (data.stats) {
      data.percent_silver = Math.round(100 * (data.stats.silver / data.stats.signups)) || 0;
      data.percent_gold = Math.round(100 * (data.stats.gold / data.stats.signups)) || 0;
    } else {
      data.percent_silver = 0;
      data.percent_gold = 0;
    }
    if (data.unclaimed_rewards && (data.unclaimed_rewards.gold || data.unclaimed_rewards.spirit_orbs)) {
      data.rewards_available = true;
    }
    return data;
  },

  onRender() {
    $('.pie-chart-canvas').each((i, canvas) => {
      const percent = $(canvas).data('percent-complete');
      const color = $(canvas).data('color');
      const shadowColor = $(canvas).data('shadow-color');
      this.drawPieChart(canvas, percent, 15, color, shadowColor);
    });

    $('a', this.$el).each(function (i) {
      if ($(this).attr('target') == '_blank') {
        $(this).on('click', (e) => {
          openUrl($(e.currentTarget).attr('href'));
          e.stopPropagation();
          e.preventDefault();
        });
      }
    });
  },

  onClaimRewards(e) {
    this.ui.$claimRewardsSuccess.removeClass('hide').addClass('animate');
    this.ui.$claimRewardsRegion.addClass('hide');

    Promise.resolve($.ajax({
      url: `${process.env.API_URL}/api/me/referrals/rewards/claim`,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
    })).then((response) => {
    }).catch(function (error) {
      NavigationManager.getInstance().showDialogViewByClass(ErrorDialogItemView, { title: 'Oops... there was a problem claiming your rewards.', message: error.message });
      this.ui.$claimRewardsSuccess.addClass('hide');
      this.ui.$claimRewardsRegion.removeClass('hide');
    });
  },

  drawPieChart(canvas, percent, segmentStrokeWidth, color, shadowColor) {
    if (!percent) return;

    const context = canvas.getContext('2d');
    context.save();
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const radius = Math.floor(canvas.width / 2);

    // percent = percent || 25.0

    const startingAngle = -Math.PI / 2.0;
    const arcSize = (2.0 * Math.PI * percent / 100.0);
    const endingAngle = startingAngle + arcSize;

    // draw the pie chart segment
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
    context.closePath();
    context.fillStyle = color || '#eb158d';
    context.fill();

    // add a circle with an outer shadow to the inside of the cutout area
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius - segmentStrokeWidth - 4, startingAngle, Math.PI * 2.0, false);
    context.shadowBlur = 10;
    context.shadowColor = shadowColor || '#ff47bf';
    context.lineWidth = 6;
    context.closePath();
    // stroke 5 times to add shadow strength
    context.stroke();
    context.stroke();
    context.stroke();
    context.stroke();
    context.stroke();

    // add a circle with an outer shadow right outside the pie segment
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(centerX, centerY, radius + 4, startingAngle, Math.PI * 2.0, false);
    context.shadowBlur = 10;
    context.shadowColor = shadowColor || '#ff47bf';
    context.lineWidth = 6;
    context.closePath();
    // stroke 5 times to add shadow strength
    context.stroke();
    context.stroke();
    context.stroke();
    context.stroke();
    context.stroke();

    // exclude all drawing outside the segment itself by re-drawing it one more time with the destination-atop composite op
    context.globalCompositeOperation = 'destination-atop';
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
    context.shadowBlur = 0;
    context.closePath();
    context.fillStyle = '#fff';
    context.fill();

    // cut out the middle circle to create the ring effect by using destination-out composite op
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.shadowBlur = 0;
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius - segmentStrokeWidth, startingAngle, Math.PI * 2.0, false);
    context.closePath();
    context.fill();

    context.restore();
  },

  onCopyReferralCode(e) {
    this.ui.$referralCode.focus();
    this.ui.$referralCode.select();
    // document.execCommand('SelectAll');
    document.execCommand('copy', false, null);
  },

  onShowEventHistory(e) {
    //
    const eventCollection = new DuelystBackbone.Collection();
    eventCollection.url = `${process.env.API_URL}/api/me/referrals`;
    eventCollection.fetch();

    eventCollection.onSyncOrReady().then(() => {
      const model = new Backbone.Model({
        eventHistory: eventCollection.toJSON(),
      });
      NavigationManager.getInstance().toggleModalViewByClass(ReferralEventHistoryView, { model });
    });
  },

});

// Expose the class either via CommonJS or the global object
if (typeof module === 'object' && module.exports) {
  module.exports = ReferralDialogView;
} else {
  this.ReferralDialogView = ReferralDialogView;
}
