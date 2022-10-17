'use strict';

var SDK = require('app/sdk');
var moment = require('moment');
var QuestsManager = require('app/ui/managers/quests_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Template = require('./templates/daily_challenge_item.hbs');

var DailyChallengeItemView = Backbone.Marionette.ItemView.extend({

  tagName: 'li',
  className: 'quest daily-challenge',

  template: Template,

  ui: {
    $outlinePath: '.path',
    $frameImage: '.frame-image',
    $questContent: '.quest-content',
  },

  events: {
    'click button.play-challenge': 'onPlayPressed',
  },

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    if (data) {
      data.is_rewardable = QuestsManager.getInstance().getDailyChallengesLastCompletedAtMoment().isBefore(moment.utc().startOf('day'));
      if (data.is_rewardable) {
        data.progress = 0;
      } else {
        data.progress = 1;
      }
    }

    return data;
  },

  onShow: function () {
    // model changes do not auto render unless we listen for changes and listeners should only be added onShow to prevent zombie views
    this.listenTo(this.model, 'change', this.render);
    if (QuestsManager.getInstance().getDailyChallengesLastCompletedAtMoment().isBefore(moment.utc().startOf('day'))) {
      this.$el.addClass('animateInShake');
    } else {
      this.$el.addClass('animateIn');
    }
  },

  onPlayPressed: function () {
    SDK.ChallengeRemote.loadAndCreateFromModelData(this.model.attributes).then(function (challenge) {
      // App._startGameWithChallenge(challenge)
      EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
    });
  },

});

// Expose the class either via CommonJS or the global object
module.exports = DailyChallengeItemView;
