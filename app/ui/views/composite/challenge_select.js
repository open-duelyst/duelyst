// pragma PKGS: nongame

'use strict';

var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var generatePushID = require('app/common/generate_push_id');
var audio_engine = require('app/audio/audio_engine');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var Analytics = require('app/common/analytics');
var Animations = require('app/ui/views/animations');
var ProgressionManager = require('app/ui/managers/progression_manager');
var ChallengePreviewItemView = require('app/ui/views/item/challenge_preview');
var ChallengeSelectTmpl = require('app/ui/templates/composite/challenge_select.hbs');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');

var ChallengeSelectCompositeView = Backbone.Marionette.CompositeView.extend({

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

  initialize: function () {
    // generate unique id for requests
    this._requestId = generatePushID();

    // get challenge models
    var challengeModels = [];
    var challenges = this.model.get('challenges');
    if (challenges != null && challenges.length > 0) {
      // add all challenge models as active content
      for (var i = 0, il = challenges.length; i < il; i++) {
        var challenge = challenges[i];

        // get basic options
        var challengeType = challenge.type;
        var challengeOptions = {
          name: challenge.name,
          description: challenge.description,
          rewards: _.extend({}, challenge.rewards, SDK.ChallengeFactory.getRewardsObjectForChallengeType(challengeType)),
          type: challengeType,
          playMode: challenge.playMode,
          iconUrl: challenge.iconUrl,
          unlockMessage: challenge.unlockMessage,
        };

        // merge progression
        var challengeProgressionModel = ProgressionManager.getInstance().challengeProgressionCollection.get(challengeType);
        if (challengeProgressionModel != null) {
          challengeOptions = _.extend(challengeOptions, challengeProgressionModel.attributes);
        }

        // create model
        var challengeModel = new Backbone.Model(challengeOptions);

        // set whether enabled
        var enabled = challenge.enabled != null ? challenge.enabled : true;

        // check user challenge progression and disable challenge if prerequisite challenge hasn't been completed
        if (challenge.prerequisiteChallengeTypes) {
          _.each(challenge.prerequisiteChallengeTypes, function (prereqChallengeType) {
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

  onRender: function () {
    if (!this.model.get('enabled')) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }

    var numChallengesAttempted = this.model.get('numChallengesAttempted');
    if (numChallengesAttempted != null && numChallengesAttempted === 0) {
      this.$el.addClass('is-new');
    } else {
      this.$el.removeClass('is-new');
    }
  },

  onShow: function () {
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

  onPrepareForDestroy: function () {
    // reset fx
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onSelectChildView: function (childView) {
    var model = childView && childView.model;
    if (model != null) {
      if (model.get('playMode') != null) {
        // play select sound
        audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

        // trigger play event with play mode
        EventBus.getInstance().trigger(EVENTS.show_play, model.get('playMode'));
      } else if (model.get('type') != null) {
        var challenge = SDK.ChallengeFactory.challengeForType(model.get('type'));
        if (challenge != null) {
          // play select sound
          audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);

          // trigger challenge event
          EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
        }
      }
    }
  },

  onMouseEnter: function () {
    if (!this._selected) {
      audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
    }
  },

  onClick: function () {
    this.trigger('select');
  },

  /* endregion EVENTS */

});

module.exports = ChallengeSelectCompositeView;
