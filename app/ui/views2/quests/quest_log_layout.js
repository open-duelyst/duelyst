// pragma PKGS: alwaysloaded

const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const CONFIG = require('app/common/config');
const Animations = require('app/ui/views/animations');
const QuestsManager = require('app/ui/managers/quests_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const ProfileManager = require('app/ui/managers/profile_manager');
const RSX = require('app/data/resources');
const Logger = require('app/common/logger');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const audio_engine = require('app/audio/audio_engine');
const moment = require('moment');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const i18next = require('i18next');

const Template = require('./templates/quest_log_layout.hbs');
const QuestLogCompositeView = require('./quest_log_composite');
const DailyChallengeItemView = require('./daily_challenge_item');
const FreeCardOfTheDayItemView = require('./free_card_of_the_day_item');

const QuestLogLayout = Backbone.Marionette.LayoutView.extend({

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

  initialize(opts) {
    this.showConfirm = opts.showConfirm;
  },

  /* region MODEL to VIEW DATA */

  serializeModel(model) {
    const data = model.toJSON.apply(model, _.rest(arguments));
    data.first_win_of_the_day_available = this.isFirstWinOfTheDayAvailable();
    data.first_win_gold_amount = CONFIG.FIRST_WIN_OF_DAY_GOLD_REWARD;
    data.is_first_win_visible = NewPlayerManager.getInstance().canSeeFirstWinOfTheDay();
    data.is_replace_instruction_visible = this.collection.find((q) => q.get('is_replaceable'));
    data.is_confirm_visible = this.showConfirm;
    return data;
  },

  isFirstWinOfTheDayAvailable() {
    const now = moment().utc();
    const newFirstWinRewardMoment = moment(this.model.get('last_daily_win_at') || 0).utc().add(22, 'hours');
    return newFirstWinRewardMoment.isBefore(now);
  },

  /* endregion MODEL to VIEW DATA */

  onRender() {
    this.showDailyItems();
  },

  showDailyItems() {
    const newPlayerManager = NewPlayerManager.getInstance();
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
      const questsManager = QuestsManager.getInstance();
      questsManager.fetchDailyChallengeModel()
        .then((dailyChallengeModel) => {
          this._dailyChallengeModel = dailyChallengeModel;
          this.showDailyItems();
        });
    }
  },

  onShow() {
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
  updateRolloverCountdown() {
    const currentDate = new Date();
    const hsmDate = new Date(0);
    hsmDate.setUTCHours(currentDate.getUTCHours());
    hsmDate.setUTCMinutes(currentDate.getUTCMinutes());
    hsmDate.setUTCSeconds(currentDate.getUTCSeconds());
    const midnightDate = new Date(0);
    midnightDate.setUTCDate(1);
    const tillMidnightDate = new Date(midnightDate.getTime() - hsmDate.getTime());
    this.ui.$rollovercountdown.text(i18next.t('quests.quest_rollover_instructions', { time_until_quests: UtilsJavascript.stringifyHoursMinutesSeconds(tillMidnightDate.getUTCHours(), tillMidnightDate.getUTCMinutes(), tillMidnightDate.getUTCSeconds()) }));
  },

  updateFirstWinOfDayCountdown() {
    const last_win_at = moment(this.model.get('last_daily_win_at') || 0).add(22, 'hours').utc();
    const now = moment().utc();
    const time = last_win_at.diff(now);
    const duration = moment.duration(time);
    let durationStr = '';

    if (duration.hours()) durationStr += `${duration.hours()} ${i18next.t('common.time_hour', { count: duration.hours() })} `;

    if (duration.minutes()) durationStr += `${duration.minutes()} ${i18next.t('common.time_minute', { count: duration.minutes() })} `;

    durationStr += `${duration.seconds()} ${i18next.t('common.time_second', { count: duration.seconds() })} `;

    this.ui.$firstWinCountdown.find('span').text(durationStr);

    if (time <= 0) {
      clearInterval(this.firstWinOfDayUpdateInterval);
      this.render();
    }
  },

  onDestroy() {
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
