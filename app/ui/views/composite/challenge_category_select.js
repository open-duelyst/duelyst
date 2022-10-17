// pragma PKGS: nongame

'use strict';

var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var Analytics = require('app/common/analytics');
var Animations = require('app/ui/views/animations');
var ProgressionManager = require('app/ui/managers/progression_manager');
var ChallengeCategorySelectTmpl = require('app/ui/templates/composite/challenge_category_select.hbs');
var UtilsEnv = require('app/common/utils/utils_env');
var PlayLayer = require('app/view/layers/pregame/PlayLayer');
var ChallengeSelectCompositeView = require('./challenge_select');
var SlidingPanelSelectCompositeView = require('./sliding_panel_select');

var ChallengeCategorySelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select challenge-category-select',

  template: ChallengeCategorySelectTmpl,

  childView: ChallengeSelectCompositeView,
  childViewOptions: function (model, index) {
    // each child view should have a collection as it is a composite view
    return { collection: new Backbone.Collection() };
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  // sliding panels should snap
  slidingPanelsSnap: true,
  slidingPanelsStack: false,

  /* region INITIALIZE */

  initialize: function () {
    SlidingPanelSelectCompositeView.prototype.initialize.apply(this, arguments);

    // build models for each category
    var challengeCategories = SDK.ChallengeFactory.getAllChallengeCategories();
    if (UtilsEnv.getIsInProduction()) {
      challengeCategories = _.without(challengeCategories, SDK.ChallengeCategory.tutorial); // remove tutorial
    }
    var categoryModels = [];
    var hasAttemptedTutorial = ProgressionManager.getInstance().hasAttemptedChallengeCategory(SDK.ChallengeCategory.tutorial.type);
    _.each(challengeCategories, function (challengeCategory) {
      var challenges = SDK.ChallengeFactory.getChallengesForCategoryType(challengeCategory.type);
      if (challenges && challenges.length) {
        var enabled = true;
        var unlockMessage = '';

        // check if not tutorial category and has not attempted full tutorial
        if (challengeCategory.type !== SDK.ChallengeCategory.tutorial.type && !hasAttemptedTutorial) {
          unlockMessage += 'Complete the Tutorial Gate';
          enabled = false;
        }

        // check if player has played enough games to unlock
        var gameCount = ProgressionManager.getInstance().getGameCount();
        var gameCountRequired = challengeCategory.gamesRequiredToUnlock;
        if (gameCountRequired != null && gameCountRequired > 0 && gameCount < gameCountRequired) {
          var gamesNeeded = gameCountRequired - gameCount;
          unlockMessage += (unlockMessage.length === 0 ? '' : ' and ') + 'Play ' + gamesNeeded + ' more online matches to unlock';
          enabled = false;
        }

        // check user attempt and completion progress
        var numChallengesAttempted = 0;
        var numChallengesCompleted = 0;
        _.each(challenges, function (challenge) {
          if (ProgressionManager.getInstance().hasAttemptedChallengeOfType(challenge.type)) {
            numChallengesAttempted++;
          }
          if (ProgressionManager.getInstance().hasCompletedChallengeOfType(challenge.type)) {
            numChallengesCompleted++;
          }
        });

        // create model for category
        var categoryModel = new Backbone.Model(_.extend({}, challengeCategory, {
          challenges: challenges,
          numChallengesAttempted: numChallengesAttempted,
          numChallengesCompleted: numChallengesCompleted,
          enabled: enabled,
          unlockMessage: unlockMessage + '.',
        }));
        categoryModels.push(categoryModel);
      }
    });

    // reset collection to categories
    this.collection.reset(categoryModels);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onShow: function () {
    SlidingPanelSelectCompositeView.prototype.onShow.call(this);

    // analytics call
    Analytics.page('Select Tutorial Category', { path: '/#tutorial_category_selection' });

    // show play layer
    Scene.getInstance().showContentByClass(PlayLayer, true);

    // play music
    audio_engine.current().play_music(RSX.music_challengemode.audio);
  },

  /* endregion EVENTS */

  /* region SELECT */

  setSelectedChildView: function () {
    // get last selected
    var selectedChildViewPrev = this.getSelectedChildView();

    // make selection
    SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);

    // get new selected
    var selectedChildView = this.getSelectedChildView();

    // reset last
    if (selectedChildViewPrev != null) {
      if (selectedChildView == null) {
        // play audio
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_challenge_category_deselect.audio, CONFIG.SELECT_SFX_PRIORITY);
      }
    }

    // set new selected
    if (selectedChildView != null) {
      // play audio
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_challenge_category_select.audio, CONFIG.SELECT_SFX_PRIORITY);
    }
  },

  /* endregion SELECT */

});

// Expose the class either via CommonJS or the global object
module.exports = ChallengeCategorySelectCompositeView;
