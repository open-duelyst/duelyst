// pragma PKGS: tutorial_support
const TutorialChallengeStartTmpl = require('app/ui/templates/item/tutorial/challenge_start.hbs');
const TutorialSupportView = require('./tutorial_support');

const TutorialChallengeStartView = TutorialSupportView.extend({

  id: 'tutorial-challenge-start',

  template: TutorialChallengeStartTmpl,

  events: {
    'click .start': 'onStartChallenge',
  },

  onStartChallenge() {
    this.trigger('start_challenge');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialChallengeStartView;
