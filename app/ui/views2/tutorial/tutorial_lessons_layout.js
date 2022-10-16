// pragma PKGS: nongame

const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const Scene = require('app/view/Scene');
const SDK = require('app/sdk');
const moment = require('moment');
const Promise = require('bluebird');
const RSX = require('app/data/resources');
const audio_engine = require('app/audio/audio_engine');
// template
//
const Animations = require('app/ui/views/animations');
const NavigationManager = require('app/ui/managers/navigation_manager');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const ProgressionManager = require('app/ui/managers/progression_manager');
const UtilsUI = require('app/common/utils/utils_ui');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const ActivityDialogItemView = require('app/ui/views/item/activity_dialog');
const i18next = require('i18next');
const TutorialLessonsLayoutTemplate = require('./templates/tutorial_lessons_layout.hbs');

const TutorialLessonsLayout = Backbone.Marionette.LayoutView.extend({

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

  initialize(options) {
    this._lastCompletedChallenge = options.lastCompletedChallenge;
    this.model = new Backbone.Model();
    const tutorialChallenges = SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type);
    const lessons = [];
    _.each(tutorialChallenges, (c) => {
      const data = _.pick(c, ['type', 'name', 'description', 'iconUrl']);
      data.isComplete = ProgressionManager.getInstance().hasCompletedChallengeOfType(c.type);
      lessons.push(data);
      this.model.set(c.type, data);
    });
    this.model.set('lessons', lessons);
  },

  onShow() {
    this._previousBlurProgramKey = Scene.getInstance().getFX().surfaceBlurShaderProgramKey;
    if (this._screenBlurId == null) {
      this._screenBlurId = UtilsJavascript.generateIncrementalId();
    }
    Scene.getInstance().getFX().screenBlurShaderProgramKey = 'BlurFullScreenMega';
    Scene.getInstance().getFX().requestBlurScreen(this._screenBlurId);

    this.animateReveal();
  },

  onPrepareForDestroy() {
    Scene.getInstance().getFX().screenBlurShaderProgramKey = this._previousBlurProgramKey;
    Scene.getInstance().getFX().requestUnblurScreen(this._screenBlurId);
  },

  animateReveal() {
    const title = this.$el.find('.header > h1').css('opacity', 0)[0];
    const hr = this.$el.find('.header > hr').css('opacity', 0)[0];
    const titleParagraph = this.$el.find('.header > p').css('opacity', 0)[0];
    const lessons = this.$el.find('.lessons > .lesson').css('opacity', 0);
    const line = this.$el.find('.line').css('opacity', 0)[0];
    const actionBar = this.$el.find('.action-bar').css('opacity', 0)[0];

    // remove the last completed lesson marker so we can animate it in
    for (let i = 0; i < lessons.length; i++) {
      if (this._lastCompletedChallenge && $(lessons[i]).attr('id') === this._lastCompletedChallenge.type) {
        $(lessons[i]).removeClass('complete').addClass('has-emphasis');
      }
    }

    let delay = 400;

    title.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    hr.animate([
      { opacity: 0.0 },
      { opacity: 1.0 },
    ], {
      duration: 200,
      delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    titleParagraph.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });

    delay += 100;

    _.each(lessons, (lesson) => {
      lesson.animate([
        { opacity: 0.0, transform: 'translateY(1.0rem)' },
        { opacity: 1.0, transform: 'translateY(0)' },
      ], {
        duration: 400,
        delay,
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
      delay,
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      fill: 'forwards',
    });
    delay += 100;

    const animation = actionBar.animate([
      { opacity: 0.0, transform: 'translateY(1.0rem)' },
      { opacity: 1.0, transform: 'translateY(0)' },
    ], {
      duration: 200,
      delay,
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

  emphasizeNextLesson() {
    const lessons = this.$el.find('.lessons > .lesson');
    for (var i = 0; i < lessons.length; i++) {
      if (this._lastCompletedChallenge && $(lessons[i]).attr('id') === this._lastCompletedChallenge.type) {
        _.delay(() => {
          $(lessons[i]).removeClass('has-emphasis').addClass('complete');
          audio_engine.current().play_effect(RSX.sfx_ui_confirm.audio);
          this._lastCompletedChallenge = null;
          this.emphasizeNextLesson();
        }, 200);
        break;
      } else if (!$(lessons[i]).hasClass('complete')) {
        $(lessons[i]).addClass('has-emphasis');
        break;
      }
    }
  },

  onLessonSelected(e) {
    const lessonType = $(e.currentTarget).data('lesson-id');
    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_click.audio, CONFIG.CLICK_SFX_PRIORITY);
    if (this.model.get(lessonType).isComplete) {
      return;
    }

    const challenge = SDK.ChallengeFactory.challengeForType(lessonType);
    EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
  },

  onContinuePressed() {
    // TODO: Use ProgressionManager.hasCompletedChallengeOfType
    const lessons = this.$el.find('.lessons > .lesson');
    for (let i = 0; i < lessons.length; i++) {
      if (!$(lessons[i]).hasClass('complete')) {
        const lessonType = $(lessons[i]).attr('id');
        const challenge = SDK.ChallengeFactory.challengeForType(lessonType);
        EventBus.getInstance().trigger(EVENTS.start_challenge, challenge);
        return;
      }
    }

    // if we're here looks like we're done
    NewPlayerManager.getInstance().updateCoreState();
    NavigationManager.getInstance().requestUserTriggeredExit();
  },

  onSkipPressed() {
    NavigationManager.getInstance().showDialogForConfirmation(i18next.t('tutorial.confirm_skip_message')).then(() => {
      NavigationManager.getInstance().showDialogView(new ActivityDialogItemView());

      const lessons = SDK.ChallengeFactory.getChallengesForCategoryType(SDK.ChallengeCategory.tutorial.type);
      const challengeCompletionPromises = _.map(lessons, (lesson) => {
        // error checking
        if (lesson == null || lesson.type == null) {
          console.error('Error in FTUE Tutorial Challenge data');
          return Promise.reject('Error in FTUE Tutorial Challenge data');
        }

        if (!ProgressionManager.getInstance().hasCompletedChallengeOfType(lesson.type)) {
          // Set challenge as completed
          return ProgressionManager.getInstance().completeChallengeWithType(lesson.type);
        }
        // Challenge was already completed
        return Promise.resolve();
      });

      return Promise.all(challengeCompletionPromises)
        .bind(this)
        .then(() => NewPlayerManager.getInstance().updateCoreState()).then(() => {
          NavigationManager.getInstance().destroyDialogView();
          NavigationManager.getInstance().requestUserTriggeredExit();
        });
    });
  },

  onMouseEnterLesson() {
    audio_engine.current().play_effect(RSX.sfx_ui_menu_hover.audio);
  },
});

// Expose the class either via CommonJS or the global object
module.exports = TutorialLessonsLayout;
