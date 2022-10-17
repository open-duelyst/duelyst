'use strict';

// pragma PKGS: tutorial_support
var SDK = require('app/sdk');
var TutorialIntroTmpl = require('app/ui/templates/item/tutorial/tutorial_intro.hbs');
var ProgressionManager = require('app/ui/managers/progression_manager');
var TutorialSupportView = require('./tutorial_support');

var TutorialIntroView = TutorialSupportView.extend({

  id: 'tutorial-intro',

  template: TutorialIntroTmpl,

  events: {
    'click .start': 'onStartTutorial',
  },

  initialize: function () {
    TutorialSupportView.prototype.initialize.call(this);

    // parse challenge
    var challenge = this.model.get('challenge');
    if (challenge) {
      var cardRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challenge.type);
      var cardRewardNames = [];
      if (cardRewards) {
        for (var i = 0; i < cardRewards.length; i++) {
          var card = SDK.CardFactory.cardForIdentifier(cardRewards[i]);
          cardRewardNames.push(card.getName());
        }
      }
      this.model.set('card_rewards', cardRewardNames);
      var gold_reward = SDK.ChallengeFactory.getGoldRewardedForChallengeType(challenge.type);
      if (gold_reward) {
        this.model.set('gold_reward', gold_reward);
      } else if (challenge.goldReward) {
        this.model.set('gold_reward', challenge.goldReward);
      }

      this.model.set('challenge_previously_completed', ProgressionManager.getInstance().hasCompletedChallengeOfType(this.model.get('challenge').type));
    }
  },

  /* region EVENTS */

  onStartTutorial: function () {
    this.trigger('start_tutorial');
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialIntroView;
