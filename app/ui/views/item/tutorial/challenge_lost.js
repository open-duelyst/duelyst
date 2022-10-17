'use strict';

// pragma PKGS: tutorial_support
var Template = require('app/ui/templates/item/tutorial/challenge_lost.hbs');
var TutorialSupportView = require('./tutorial_support');

var TutorialChallengeLostView = TutorialSupportView.extend({

  id: 'tutorial-challenge-lost',

  template: Template,

  events: {
    'click .retry': 'onRetry',
  },

  initialize: function () {
    TutorialSupportView.prototype.initialize.call(this);

    var challenge = this.model.get('challenge');
    if (challenge != null) {
      var challengeHint = '';
      if (challenge.otkChallengeFailureMessages && challenge.otkChallengeFailureMessages.length) {
        var hintIndex = Math.min(challenge.otkChallengeFailureCount - 1, challenge.otkChallengeFailureMessages.length - 1);
        challengeHint = challenge.otkChallengeFailureMessages[hintIndex];
      }
      this.model.set('challenge_hint', challengeHint);
    }
  },

  onRetry: function () {
    this.trigger('retry_challenge');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialChallengeLostView;
