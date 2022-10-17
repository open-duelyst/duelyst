// pragma PKGS: alwaysloaded

'use strict';

var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var CONFIG = require('app/common/config');
var Animations = require('app/ui/views/animations');
var QuestsManager = require('app/ui/managers/quests_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProfileManager = require('app/ui/managers/profile_manager');
var RSX = require('app/data/resources');
var Logger = require('app/common/logger');
var UtilsJavascript = require('app/common/utils/utils_javascript');
var audio_engine = require('app/audio/audio_engine');
var moment = require('moment');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var i18next = require('i18next');

var Template = require('./templates/quest_log_layout.hbs');
var QuestLogCompositeView = require('./quest_log_composite');
var DailyChallengeItemView = require('./daily_challenge_item');
var FreeCardOfTheDayItemView = require('./free_card_of_the_day_item');

var QuestLogLayout = Backbone.Marionette.LayoutView.extend({

  className: 'modal duelyst-modal quest-modal',

  template: Template,

  id: 'quest-log',

  regions: {
    questsRegion: '.daily-quests-region',
    freeCardOfTheDayRegion: '.free-card-of-the-day-region',
    challengeRegion: '.daily-challenge-region',
  },

  ui: {
    $rollovercountdown: '.rollover-countdown',
    $firstWinCountdown: '.first-win-of-the-day-countdown',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  rolloverUpdateInterval: null,
  showConfirm: false,
  _dailyChallengeModel: null,

  initialize: function (opts) {
    this.showConfirm = opts.showConfirm;
  },

  /* region MODEL to VIEW DATA */

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));
    data.first_win_of_the_day_available = this.isFirstWinOfTheDayAvailable();
    data.first_win_gold_amount = CONFIG.FIRST_WIN_OF_DAY_GOLD_REWARD;
    data.is_first_win_visible = NewPlayerManager.getInstance().canSeeFirstWinOfTheDay();
    data.is_replace_instruction_visible = this.collection.find(function (q) { return q.get('is_replaceable'); });
    data.is_confirm_visible = this.showConfirm;
    return data;
  },

  isFirstWinOfTheDayAvailable: function () {
    var now = moment().utc();
    var newFirstWinRewardMoment = moment(this.model.get('last_daily_win_at') || 0).utc().add(22, 'hours');
    return newFirstWinRewardMoment.isBefore(now);
  },

  /* endregion MODEL to VIEW DATA */

  onRender: function () {
    this.showDailyItems();
  },

  showDailyItems: function () {
    var newPlayerManager = NewPlayerManager.getInstance();
    if (this._dailyChallengeModel != null || !newPlayerManager.canSeeDailyChallenge()) {
      // Show daily challenge if valid data exists
      if (this._dailyChallengeModel != null && this._dailyChallengeModel.get('challenge_id') != null && this._dailyChallengeModel.get('url') != null) {
        // this.challengeRegion.show(new DailyChallengeItemView({
        //   model: this._dailyChallengeModel
        // }))
      }

      // FCOTD
      if (newPlayerManager.canSeeFreeCardOfTheDay()) {
        this.freeCardOfTheDayRegion.show(new FreeCardOfTheDayItemView({
          model: new Backbone.Model(ProfileManager.getInstance().profile.attributes),
        }));
      }

      // Show quests regardless
      this.questsRegion.show(new QuestLogCompositeView({
        collection: this.collection,
      }));
    } else {
      // Fetch and set daily challenge model and trigger on render again when done
      var questsManager = QuestsManager.getInstance();
      questsManager.fetchDailyChallengeModel()
        .then(function (dailyChallengeModel) {
          this._dailyChallengeModel = dailyChallengeModel;
          this.showDailyItems();
        }.bind(this));
    }
  },

  onShow: function () {
    // Create an interval to update the quest rollover countdown
    this.updateRolloverCountdown();
    this.rolloverUpdateInterval = setInterval(this.updateRolloverCountdown.bind(this), 1000);

    // create an interval to update the FOWTD countdown
    if (!this.isFirstWinOfTheDayAvailable()) {
      this.updateFirstWinOfDayCountdown();
      this.firstWinOfDayUpdateInterval = setInterval(this.updateFirstWinOfDayCountdown.bind(this), 1000);
    }

    audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_tab_in.audio, CONFIG.SHOW_SFX_PRIORITY);
  },

  // Updates the text in the quest rollover countdown (which is to the next utc midnight)
  updateRolloverCountdown: function () {
    var currentDate = new Date();
    var hsmDate = new Date(0);
    hsmDate.setUTCHours(currentDate.getUTCHours());
    hsmDate.setUTCMinutes(currentDate.getUTCMinutes());
    hsmDate.setUTCSeconds(currentDate.getUTCSeconds());
    var midnightDate = new Date(0);
    midnightDate.setUTCDate(1);
    var tillMidnightDate = new Date(midnightDate.getTime() - hsmDate.getTime());
    this.ui.$rollovercountdown.text(i18next.t('quests.quest_rollover_instructions', { time_until_quests: UtilsJavascript.stringifyHoursMinutesSeconds(tillMidnightDate.getUTCHours(), tillMidnightDate.getUTCMinutes(), tillMidnightDate.getUTCSeconds()) }));
  },

  updateFirstWinOfDayCountdown: function () {
    var last_win_at = moment(this.model.get('last_daily_win_at') || 0).add(22, 'hours').utc();
    var now = moment().utc();
    var time = last_win_at.diff(now);
    var duration = moment.duration(time);
    var durationStr = '';

    if (duration.hours())
      durationStr += duration.hours() + ' ' + i18next.t('common.time_hour', { count: duration.hours() }) + ' ';

    if (duration.minutes())
      durationStr += duration.minutes() + ' ' + i18next.t('common.time_minute', { count: duration.minutes() }) + ' ';

    durationStr += duration.seconds() + ' ' + i18next.t('common.time_second', { count: duration.seconds() }) + ' ';

    this.ui.$firstWinCountdown.find('span').text(durationStr);

    if (time <= 0) {
      clearInterval(this.firstWinOfDayUpdateInterval);
      this.render();
    }
  },

  onDestroy: function () {
    // mark quests as read
    QuestsManager.getInstance().markQuestsAsRead();
    QuestsManager.getInstance().markDailyChallengeAsRead();

    if (this.rolloverUpdateInterval) {
      clearInterval(this.rolloverUpdateInterval);
      this.rolloverUpdateInterval = null;
    }
    if (this.firstWinOfDayUpdateInterval) {
      clearInterval(this.firstWinOfDayUpdateInterval);
      this.firstWinOfDayUpdateInterval = null;
    }

    this._dailyChallengeModel = null;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = QuestLogLayout;
