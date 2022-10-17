'use strict';

// pragma PKGS: tutorial_support
var TutorialChallengeStartTmpl = require('app/ui/templates/item/tutorial/challenge_start.hbs');
var TutorialSupportView = require('./tutorial_support');

var TutorialChallengeStartView = TutorialSupportView.extend({

  id: 'tutorial-challenge-start',

  template: TutorialChallengeStartTmpl,

  events: {
    'click .start': 'onStartChallenge',
  },

  onStartChallenge: function () {
    this.trigger('start_challenge');
  },

});

// Expose the class either via CommonJS or the global object
module.exports = TutorialChallengeStartView;
