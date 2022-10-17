// pragma PKGS: nongame

'use strict';

var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var Scene = require('app/view/Scene');
var SDK = require('app/sdk');
var moment = require('moment');
var Promise = require('bluebird');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
// template
//
var Animations = require('app/ui/views/animations');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var UtilsUI = require('app/common/utils/utils_ui');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
var i18next = require('i18next');
var TutorialLessonsLayoutTemplate = require('./templates/tutorial_lessons_layout.hbs');

var TutorialLessonsLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-tutorial',
  className: 'modal duelyst-modal',
  template: TutorialLessonsLayoutTemplate,
  ui: {},
  events: {
    'click .lesson > .image': 'onLessonSelected',
    'click #button_continue': 'onContinuePressed',
    'click #button_skip': 'onSkipPressed',
    'mouseenter .lesson': 'onMouseEnterLesson',
  },

  _screenBlurId: null,
  _previousBlurProgramKey: null,
  _lastCompletedChallenge: null,

  initialize: function (options) {
    this._lastCompletedChallenge = options.lastCompletedChallenge;
    this.model = new Backbone.Model();
    var tutorialChallenges = SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type);
    var lessons = [];
    _.each(tutorialChallenges, function (c) {
      var data = _.pick(c, ['type', 'name', 'description', 'iconUrl']);
      data.isComplete = ProgressionManager.getInstance().hasCompletedChallengeOfType(c.type);
      lessons.push(data);
      this.model.set(c.type, data);
    }.bind(this));
    this.model.set('lessons', lessons);
  },

  onShow: function () {
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    this.animateReveal();
  },

  onPrepareForDestroy: function () {
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);
  },

  animateReveal: function () {
    var title = this.$el.find('.header > h1').css('opacity', 0)[0];
    var hr = this.$el.find('.header > hr').css('opacity', 0)[0];
    var titleParagraph = this.$el.find('.header > p').css('opacity', 0)[0];
    var lessons = this.$el.find('.lessons > .lesson').css('opacity', 0);
    var line = this.$el.find('.line').css('opacity', 0)[0];
    var actionBar = this.$el.find('.action-bar').css('opacity', 0)[0];

    // remove the last completed lesson marker so we can animate it in
    for (var i = 0; i < lessons.length; i++) {
      if (this._lastCompletedChallenge && $(lessons[i]).attr('id') === this._lastCompletedChallenge.type) {
        $(lessons[i]).removeClass('complete').addClass('has-emphasis');
      }
    }

    var delay = 400;

    title.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    hr.animate([
      { opacity: 0.0 },
      { opacity: 1.0 },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    titleParagraph.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    _.each(lessons, function (lesson) {
      lesson.animate([
        { opacity: 0.0, transform: 'translateY(1.0rem)' },
        { opacity: 1.0, transform: 'translateY(0)' },
      ], {
        duration: 400,
        delay: delay,
        easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        fill: 'forwards',
      });
      delay += 100;
    });

    line.animate([
      { opacity: 0.0 },
      { opacity: 1.0 },
    ], {
      duration: 100,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });
    delay += 100;

    var animation = actionBar.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay: delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    if (this._lastCompletedChallenge) {
      animation.onfinish = function () {
        this.emphasizeNextLesson();
      }.bind(this);
    } else {
      this.emphasizeNextLesson();
    }
  },

  emphasizeNextLesson: function () {
    var lessons = this.$el.find('.lessons > .lesson');
    for (var i = 0; i < lessons.length; i++) {
      if (this._lastCompletedChallenge && $(lessons[i]).attr('id') === this._lastCompletedChallenge.type) {
        _.delay(function () {
          $(lessons[i]).removeClass('has-emphasis').addClass('complete');
          audio_engine.current().play_effect(RSX.sfx_ui_confirm.audio);
          this._lastCompletedChallenge = null;
          this.emphasizeNextLesson();
        }.bind(this), 200);
        break;
      } else if (!$(lessons[i]).hasClass('complete')) {
        $(lessons[i]).addClass('has-emphasis');
        break;
      }
    }
  },

  onLessonSelected: function (e) {
    var lessonType = $(e.currentTarget).data('lesson-id');
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
    if (this.model.get(lessonType).isComplete) {
      return;
    }

    var challenge = SDK.ChallengeFactory.challengeForType(lessonType);
    EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
  },

  onContinuePressed: function () {
    // TODO: Use ProgressionManager.hasCompletedChallengeOfType
    var lessons = this.$el.find('.lessons > .lesson');
    for (var i = 0; i < lessons.length; i++) {
      if (!$(lessons[i]).hasClass('complete')) {
        var lessonType = $(lessons[i]).attr('id');
        var challenge = SDK.ChallengeFactory.challengeForType(lessonType);
        EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
        return;
      }
    }

    // if we're here looks like we're done
    NewPlayerManager.getInstance().updateCoreState();
    NavigationManager.getInstance().requestUserTriggeredExit();
  },

  onSkipPressed: function () {
    NavigationManager.getInstance().showDialogForConfirmation(i18next.t('tutorial.confirm_skip_message')).then(function () {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

      var lessons = SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type);
      var challengeCompletionPromises = _.map(lessons, function (lesson) {
        // error checking
        if (lesson == null || lesson.type == null) {
          console.error('Error in FTUE Tutorial Challenge data');
          return Promise.reject('Error in FTUE Tutorial Challenge data');
        }

        if (!ProgressionManager.getInstance().hasCompletedChallengeOfType(lesson.type)) {
          // Set challenge as completed
          return ProgressionManager.getInstance().completeChallengeWithType(lesson.type);
        } else {
          // Challenge was already completed
          return Promise.resolve();
        }
      });

      return Promise.all(challengeCompletionPromises)
        .bind(this)
        .then(function () {
          return NewPlayerManager.getInstance().updateCoreState();
        }).then(function () {
          NavigationManager.getInstance().destroyDialogView();
          NavigationManager.getInstance().requestUserTriggeredExit();
        });
    }.bind(this));
  },

  onMouseEnterLesson: function () {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = TutorialLessonsLayout;
