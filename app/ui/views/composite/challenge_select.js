// pragma PKGS: nongame

const RSX = require('app/data/resources');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const generatePushID = require('app/common/generate_push_id');
const audio_engine = require('app/audio/audio_engine');
const SDK = require('app/sdk');
const Scene = require('app/view/Scene');
const Analytics = require('app/common/analytics');
const Animations = require('app/ui/views/animations');
const ProgressionManager = require('app/ui/managers/progression_manager');
const ChallengePreviewItemView = require('app/ui/views/item/challenge_preview');
const ChallengeSelectTmpl = require('app/ui/templates/composite/challenge_select.hbs');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');

const ChallengeSelectCompositeView = Backbone.Marionette.CompositeView.extend({

  className: 'sliding-panel challenge-select',

  template: ChallengeSelectTmpl,

  childView: ChallengePreviewItemView,
  childViewContainer: '.sliding-panel-active-content-choices',

  events: {
    mouseenter: 'onMouseEnter',
    'click .sliding-panel-content': 'onClick',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  _requestId: null,

  /* region INITIALIZE */

  initialize() {
    // generate unique id for requests
    this._requestId = generatePushID();

    // get challenge models
    const challengeModels = [];
    const challenges = this.model.get('challenges');
    if (challenges != null && challenges.length > 0) {
      // add all challenge models as active content
      for (let i = 0, il = challenges.length; i < il; i++) {
        const challenge = challenges[i];

        // get basic options
        const challengeType = challenge.type;
        let challengeOptions = {
          name: challenge.name,
          description: challenge.description,
          rewards: _.extend({}, challenge.rewards, SDK.ChallengeFactory.getRewardsObjectForChallengeType(challengeType)),
          type: challengeType,
          playMode: challenge.playMode,
          iconUrl: challenge.iconUrl,
          unlockMessage: challenge.unlockMessage,
        };

        // merge progression
        const challengeProgressionModel = ProgressionManager.getInstance().challengeProgressionCollection.get(challengeType);
        if (challengeProgressionModel != null) {
          challengeOptions = _.extend(challengeOptions, challengeProgressionModel.attributes);
        }

        // create model
        const challengeModel = new Backbone.Model(challengeOptions);

        // set whether enabled
        var enabled = challenge.enabled != null ? challenge.enabled : true;

        // check user challenge progression and disable challenge if prerequisite challenge hasn't been completed
        if (challenge.prerequisiteChallengeTypes) {
          _.each(challenge.prerequisiteChallengeTypes, (prereqChallengeType) => {
            enabled = enabled && ProgressionManager.getInstance().hasAttemptedChallengeOfType(prereqChallengeType);
          });
        }
        challengeModel.set('enabled', enabled);

        challengeModels.push(challengeModel);
      }
    }

    // reset collection for challenge models
    this.collection.reset(challengeModels);
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onRender() {
    if (!this.model.get('enabled')) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }

    const numChallengesAttempted = this.model.get('numChallengesAttempted');
    if (numChallengesAttempted != null && numChallengesAttempted === 0) {
      this.$el.addClass('is-new');
    } else {
      this.$el.removeClass('is-new');
    }
  },

  onShow() {
    // analytics call
    Analytics.page('Select Tutorial', { path: '/#tutorial_selection' });

    // start listening for select
    this.listenTo(this, 'childview:select', this.onSelectChildView);

    // change fx
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 194, g: 243, b: 200, a: 255,
    }, {
      r: 26, g: 31, b: 50, a: 255,
    });
  },

  onPrepareForDestroy() {
    // reset fx
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onSelectChildView(childView) {
    const model = childView && childView.model;
    if (model != null) {
      if (model.get('playMode') != null) {
        // play select sound
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

        // trigger play event with play mode
        EventBus.getInstance().trigger(EVENTS.show_play, model.get('playMode'));
      } else if (model.get('type') != null) {
        const challenge = SDK.ChallengeFactory.challengeForType(model.get('type'));
        if (challenge != null) {
          // play select sound
          audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

          // trigger challenge event
          EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
        }
      }
    }
  },

  onMouseEnter() {
    if (!this._selected) {
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onClick() {
    this.trigger('select');
  },

  /* endregion EVENTS */

});

module.exports = ChallengeSelectCompositeView;
