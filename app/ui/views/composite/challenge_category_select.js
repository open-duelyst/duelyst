// pragma PKGS: nongame

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const Analytics = require('app/common/analytics');
const Animations = require('app/ui/views/animations');
const ProgressionManager = require('app/ui/managers/progression_manager');
const ChallengeCategorySelectTmpl = require('app/ui/templates/composite/challenge_category_select.hbs');
const UtilsEnv = require('app/common/utils/utils_env');
const PlayLayer = require('app/view/layers/pregame/PlayLayer');
const ChallengeSelectCompositeView = require('./challenge_select');
const SlidingPanelSelectCompositeView = require('./sliding_panel_select');

const ChallengeCategorySelectCompositeView = SlidingPanelSelectCompositeView.extend({

  className: 'sliding-panel-select challenge-category-select',

  template: ChallengeCategorySelectTmpl,

  childView: ChallengeSelectCompositeView,
  childViewOptions(model, index) {
    // each child view should have a collection as it is a composite view
    return { collection: new Backbone.Collection() };
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  // sliding panels should snap
  slidingPanelsSnap: true,
  slidingPanelsStack: false,

  /* region INITIALIZE */

  initialize() {
    SlidingPanelSelectCompositeView.prototype.initialize.apply(this, arguments);

    // build models for each category
    let challengeCategories = SDK.ChallengeFactory.getAllChallengeCategories();
    if (UtilsEnv.getIsInProduction()) {
      challengeCategories = _.without(challengeCategories, SDK.ChallengeCategory.tutorial); // remove tutorial
    }
    const categoryModels = [];
    const hasAttemptedTutorial = ProgressionManager.getInstance().hasAttemptedChallengeCategory(SDK.ChallengeCategory.tutorial.type);
    _.each(challengeCategories, (challengeCategory) => {
      const challenges = SDK.ChallengeFactory.getChallengesForCategoryType(challengeCategory.type);
      if (challenges && challenges.length) {
        let enabled = true;
        let unlockMessage = '';

        // check if not tutorial category and has not attempted full tutorial
        if (challengeCategory.type !== SDK.ChallengeCategory.tutorial.type && !hasAttemptedTutorial) {
          unlockMessage += 'Complete the Tutorial Gate';
          enabled = false;
        }

        // check if player has played enough games to unlock
        const gameCount = ProgressionManager.getInstance().getGameCount();
        const gameCountRequired = challengeCategory.gamesRequiredToUnlock;
        if (gameCountRequired != null && gameCountRequired > 0 && gameCount < gameCountRequired) {
          const gamesNeeded = gameCountRequired - gameCount;
          unlockMessage += `${unlockMessage.length === 0 ? '' : ' and '}Play ${gamesNeeded} more online matches to unlock`;
          enabled = false;
        }

        // check user attempt and completion progress
        let numChallengesAttempted = 0;
        let numChallengesCompleted = 0;
        _.each(challenges, (challenge) => {
          if (ProgressionManager.getInstance().hasAttemptedChallengeOfType(challenge.type)) {
            numChallengesAttempted++;
          }
          if (ProgressionManager.getInstance().hasCompletedChallengeOfType(challenge.type)) {
            numChallengesCompleted++;
          }
        });

        // create model for category
        const categoryModel = new Backbone.Model(_.extend({}, challengeCategory, {
          challenges,
          numChallengesAttempted,
          numChallengesCompleted,
          enabled,
          unlockMessage: `${unlockMessage}.`,
        }));
        categoryModels.push(categoryModel);
      }
    });

    // reset collection to categories
    this.collection.reset(categoryModels);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onShow() {
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

  setSelectedChildView() {
    // get last selected
    const selectedChildViewPrev = this.getSelectedChildView();

    // make selection
    SlidingPanelSelectCompositeView.prototype.setSelectedChildView.apply(this, arguments);

    // get new selected
    const selectedChildView = this.getSelectedChildView();

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
