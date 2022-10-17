'use strict';

var Logger = require('app/common/logger');
var QuestsManager = require('app/ui/managers/quests_manager');
var QuestFactory = require('app/sdk').QuestFactory;
var NavigationManager = require('app/ui/managers/navigation_manager');
var QuestItemViewTempl = require('./templates/quest_item.hbs');

var QuestItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'quest',

  template: QuestItemViewTempl,

  ui: {
    $outlinePath: '.path',
    $frameImage: '.frame-image',
    $questContent: '.quest-content',
  },

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    var quest = QuestFactory.questForIdentifier(data.quest_type_id);

    if (quest) {
      quest.params = data.params;

      data.quest_name = quest.getName();
      data.quest_instructions = quest.getDescription();
      data.is_replaceable = (data.is_replaceable != false);
      data.is_beginner = quest.isBeginner || false;
      data.is_catch_up = quest.isCatchUp || false;
      data.gift_chests = quest.giftChests;
      if (quest.cosmeticKeys != null && quest.cosmeticKeys.length != 0) {
        // For now only grab one, change this if we want to show a stack in future
        data.cosmetic_key = quest.cosmeticKeys[0];
      }
      data.rewards_details = quest.rewardDetails;
    }

    return data;
  },

  onShow: function () {
    // model changes do not auto render unless we listen for changes and listeners should only be added onShow to prevent zombie views
    this.listenTo(this.model, 'change', this.render);

    this.$el.addClass('animateIn');
    this.$el.find('[data-toggle="popover"]').popover({
      container: $('.daily-quests-region'),
      animation: true,
      placement: 'right',
    }).popover('show');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = QuestItemView;
