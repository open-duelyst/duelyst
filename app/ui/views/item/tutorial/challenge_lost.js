// pragma PKGS: tutorial_support
const Template = require('app/ui/templates/item/tutorial/challenge_lost.hbs');
const TutorialSupportView = require('./tutorial_support');

const TutorialChallengeLostView = TutorialSupportView.extend({

  id: 'tutorial-challenge-lost',

  template: Template,

  events: {
    'click .retry': 'onRetry',
  },

  initialize() {
    TutorialSupportView.prototype.initialize.call(this);

    const challenge = this.model.get('challenge');
    if (challenge != null) {
      let challengeHint = '';
      if (challenge.otkChallengeFailureMessages && challenge.otkChallengeFailureMessages.length) {
        const hintIndex = Math.min(challenge.otkChallengeFailureCount - 1, challenge.otkChallengeFailureMessages.length - 1);
        challengeHint = challenge.otkChallengeFailureMessages[hintIndex];
      }
      this.model.set('challenge_hint', challengeHint);
    }
  },

  onRetry() {
    this.trigger('retry_challenge');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialChallengeLostView;
