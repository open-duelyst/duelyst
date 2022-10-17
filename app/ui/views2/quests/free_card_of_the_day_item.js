'use strict';

var SDK = require('app/sdk');
var moment = require('moment');
var InventoryManager = require('app/ui/managers/inventory_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var ProgressionRewardLayer = require('app/view/layers/reward/ProgressionRewardLayer');
var Scene = require('app/view/Scene');
var i18next = require('i18next');
var Template = require('./templates/free_card_of_the_day_item.hbs');

var FreeCardOfTheDayItemView = Backbone.Marionette.ItemView.extend({

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

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    if (data) {
      data.is_available = InventoryManager.getInstance().isFreeCardOfTheDayAvailable();
      data.progress = (data.is_available) ? 0 : 1;
    }
    return data;
  },

  onShow: function () {
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

  onDestroy: function () {
    if (this.rolloverUpdateInterval) {
      clearInterval(this.rolloverUpdateInterval);
      this.rolloverUpdateInterval = null;
    }
  },

  onClaimPressed: _.throttle(function () {
    InventoryManager.getInstance().claimFreeCardOfTheDay().then(function (response) {
      EventBus.getInstance().trigger(EVENTS.show_free_card_of_the_day, { cardId: response.card_id });
      Analytics.track('free card of the day claimed', {
        category: Analytics.EventCategory.Quest,
        cardId: response.card_id,
      });
    });
    this.ui.claimButton.attr('disabled', true);
  }, 3000),

  updateRolloverCountdown: function () {
    var tomorrow = moment().utc().startOf('day').add(24, 'hours');
    var now = moment().utc();
    var time = tomorrow.diff(now);
    var duration = moment.duration(time);
    var durationStr = i18next.t('common.available_in_duration_label') + '<br/>';

    if (duration.hours())
      durationStr += duration.hours() + 'hr ';

    if (duration.minutes())
      durationStr += duration.minutes() + 'min ';

    durationStr += duration.seconds() + 's';

    this.ui.instructions.html(durationStr);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = FreeCardOfTheDayItemView;
