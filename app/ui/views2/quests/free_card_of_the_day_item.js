const SDK = require('app/sdk');
const moment = require('moment');
const InventoryManager = require('app/ui/managers/inventory_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const ProgressionRewardLayer = require('app/view/layers/reward/ProgressionRewardLayer.js');
const Scene = require('app/view/Scene');
const i18next = require('i18next');
const Template = require('./templates/free_card_of_the_day_item.hbs');

const FreeCardOfTheDayItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'quest free-card-of-the-day',
  template: Template,
  ui: {
    instructions: '.instructions',
    claimButton: 'button.claim-card',
  },
  events: {
    'click button.claim-card': 'onClaimPressed',
  },
  rolloverUpdateInterval: null,

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    if (data) {
      data.is_available = InventoryManager.getInstance().isFreeCardOfTheDayAvailable();
      data.progress = (data.is_available) ? 0 : 1;
    }
    return data;
  },

  onShow() {
    // model changes do not auto render unless we listen for changes and listeners should only be added onShow to prevent zombie views
    this.listenTo(this.model, 'change', this.render);
    if (InventoryManager.getInstance().isFreeCardOfTheDayAvailable()) {
      this.$el.addClass('animateInShake');
    } else {
      this.$el.addClass('animateIn');
      this.updateRolloverCountdown();
      this.rolloverUpdateInterval = setInterval(this.updateRolloverCountdown.bind(this), 1000);
    }
  },

  onDestroy() {
    if (this.rolloverUpdateInterval) {
      clearInterval(this.rolloverUpdateInterval);
      this.rolloverUpdateInterval = null;
    }
  },

  onClaimPressed: _.throttle(function () {
    InventoryManager.getInstance().claimFreeCardOfTheDay().then((response) => {
      EventBus.getInstance().trigger(EVENTS.show_free_card_of_the_day, { cardId: response.card_id });
      Analytics.track('free card of the day claimed', {
        category: Analytics.EventCategory.Quest,
        cardId: response.card_id,
      });
    });
    this.ui.claimButton.attr('disabled', true);
  }, 3000),

  updateRolloverCountdown() {
    const tomorrow = moment().utc().startOf('day').add(24, 'hours');
    const now = moment().utc();
    const time = tomorrow.diff(now);
    const duration = moment.duration(time);
    let durationStr = `${i18next.t('common.available_in_duration_label')}<br/>`;

    if (duration.hours()) durationStr += `${duration.hours()}hr `;

    if (duration.minutes()) durationStr += `${duration.minutes()}min `;

    durationStr += `${duration.seconds()}s`;

    this.ui.instructions.html(durationStr);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = FreeCardOfTheDayItemView;
