// pragma PKGS: tutorial_support
const SDK = require('app/sdk');
const TutorialIntroTmpl = require('app/ui/templates/item/tutorial/tutorial_intro.hbs');
const ProgressionManager = require('app/ui/managers/progression_manager');
const TutorialSupportView = require('./tutorial_support');

const TutorialIntroView = TutorialSupportView.extend({

  id: 'tutorial-intro',

  template: TutorialIntroTmpl,

  events: {
    'click .start': 'onStartTutorial',
  },

  initialize() {
    TutorialSupportView.prototype.initialize.call(this);

    // parse challenge
    const challenge = this.model.get('challenge');
    if (challenge) {
      const cardRewards = SDK.ChallengeFactory.getCardIdsRewardedForChallengeType(challenge.type);
      const cardRewardNames = [];
      if (cardRewards) {
        for (let i = 0; i < cardRewards.length; i++) {
          const card = SDK.CardFactory.cardForIdentifier(cardRewards[i]);
          cardRewardNames.push(card.getName());
        }
      }
      this.model.set('card_rewards', cardRewardNames);
      const gold_reward = SDK.ChallengeFactory.getGoldRewardedForChallengeType(challenge.type);
      if (gold_reward) {
        this.model.set('gold_reward', gold_reward);
      } else if (challenge.goldReward) {
        this.model.set('gold_reward', challenge.goldReward);
      }

      this.model.set('challenge_previously_completed', ProgressionManager.getInstance().hasCompletedChallengeOfType(this.model.get('challenge').type));
    }
  },

  /* region EVENTS */

  onStartTutorial() {
    this.trigger('start_tutorial');
  },

  /* endregion EVENTS */

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialIntroView;
