// pragma PKGS: nongame

const _ = require('underscore');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PlayModeTmpl = require('app/ui/templates/item/play_mode.hbs');
const moment = require('moment');
const UtilsEnv = require('app/common/utils/utils_env');
const NewPlayerManager = require('app/ui/managers/new_player_manager');
const ProgressionManager = require('app/ui/managers/progression_manager');
const QuestsManager = require('app/ui/managers/quests_manager');
const QuestBeginnerCompleteSoloChallenges = require('app/sdk/quests/questBeginnerCompleteSoloChallenges');
const i18next = require('i18next');
const SlidingPanelItemView = require('./sliding_panel');

const PlayModeItemView = SlidingPanelItemView.extend({

  className: 'sliding-panel play-mode',

  template: PlayModeTmpl,

  ui: {
    countdownUntilAvailable: '.countdown-until-available',
    countdownAvailableFor: '.countdown-available-for',
    description: '.description',
    background: '.background',
  },

  _showNewPlayerStylingTimeout: null,
  timeUntilAvailableInterval: null,
  timeAvailableForInterval: null,

  templateHelpers: {

    isAvailableToday() {
      return this.isModeAvailableToday();
    },

    isAvailableTommorrow() {
      return this.isModeAvailableTommorrow();
    },

    getNextAvailableDate() {
      if (this.getNextAvailableMoment()) {
        const local = this.getNextAvailableMoment().clone().zone(moment().zone());
        return local.format('ddd MMM DD hh:mm A');
      }
    },

  },

  /* region INITIALIZE */

  initialize() {
    // Add unlock message
    if (!this.model.get('enabled') || !this.isModeAvailableToday()) {
      // leave default message
    } else if (!NewPlayerManager.getInstance().canPlayPlayMode(this.model.get('id'))) {
      // Show a more specific message if player has completed practice up until the point of unlocking Gauntlet
      if (this.model.get('id') == SDK.PlayModes.Gauntlet && NewPlayerManager.getInstance().getCurrentCoreStage().value == SDK.NewPlayerProgressionStageEnum.FirstGameDone.value) {
        this.model.set('unlockMessage', i18next.t('new_player_experience.play_mode_gauntlet_unlock_message'));
      } else {
        this.model.set('unlockMessage', i18next.t('new_player_experience.play_mode_unlock_message'));
      }
    } else if (!this.hasPlayedEnoughGames()) {
      const gamesRequiredToUnlock = this.model.get('gamesRequiredToUnlock');
      this.model.set('unlockMessage', i18next.t('new_player_experience.play_mode_unlock_game_count_message', { game_count: (gamesRequiredToUnlock - ProgressionManager.getInstance().getGameCount()) }));
    }
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onRender() {
    SlidingPanelItemView.prototype.onRender.call(this);

    if (!this.model.get('enabled') || !this.isModeAvailableToday() || !NewPlayerManager.getInstance().canPlayPlayMode(this.model.get('id')) || !this.hasPlayedEnoughGames()) {
      this.$el.addClass('disabled');
    } else {
      this.$el.removeClass('disabled');
    }

    if (!this.isModeAvailableToday() || this.model.get('softAvailableOnDate')) {
      this.timeUntilAvailableInterval = setInterval(this.updateTimeUntilAvailable.bind(this), 1000);
    } else if (!this.isModeAvailableTommorrow() || this.model.get('softDisableOnDate')) {
      this.timeAvailableForInterval = setInterval(this.updateTimeAvailableFor.bind(this), 1000);
    }
  },

  onShow() {
    this._showNewPlayerStylingTimeout = setTimeout(() => {
      this._showNewPlayerUI();
    }, 1000);
  },

  onDestroy() {
    if (this._showNewPlayerStylingTimeout != null) {
      clearTimeout(this._showNewPlayerStylingTimeout);
      this._showNewPlayerStylingTimeout = null;
    }
    if (this.timeUntilAvailableInterval) {
      clearInterval(this.timeUntilAvailableInterval);
      this.timeUntilAvailableInterval = null;
    }
    if (this.timeAvailableForInterval) {
      clearInterval(this.timeAvailableForInterval);
      this.timeAvailableForInterval = null;
    }
  },

  onClick() {
    if (this.isModeAvailableToday()) {
      this.trigger('select');
    }
  },

  /* endregion EVENTS */

  /* region HELPERS */

  isModeAvailableToday() {
    if (UtilsEnv.getIsInStaging() || UtilsEnv.getIsInDevelopment()) return true;

    const days = this.model.get('availableOnDaysOfWeek');
    if (days && days.length > 0) {
      const myDate = moment().zone('-08:00'); // PDT
      const isAvailable = _.contains(days, myDate.weekday());
      return isAvailable;
    }
    return true;
  },

  isModeAvailableTommorrow() {
    const days = this.model.get('availableOnDaysOfWeek');
    if (days && days.length > 0) {
      const myDate = moment().zone('-08:00').add(1, 'day'); // PDT
      const isAvailable = _.contains(days, myDate.weekday());
      return isAvailable;
    }
    return true;
  },

  getNextAvailableMoment() {
    const now = moment().zone('-08:00'); // PDT
    const currentDay = now.weekday(); // indexed off 0
    if (this.model.get('availableOnDaysOfWeek')) {
      const daysOfWeekAvailable = this.model.get('availableOnDaysOfWeek');
      if (daysOfWeekAvailable && daysOfWeekAvailable.length > 0) {
        let nextDay = daysOfWeekAvailable[0];
        for (let i = 0; i < daysOfWeekAvailable.length; i++) {
          if (currentDay < daysOfWeekAvailable[i]) {
            nextDay = daysOfWeekAvailable[i];
            break;
          }
        }

        let delta;
        if (nextDay < currentDay) {
          delta = (7 + nextDay) - currentDay;
        } else {
          delta = nextDay - currentDay;
        }
        var nextAvailable = now.clone().add(delta, 'days').startOf('day');
        return nextAvailable;
      }
    } else if (this.model.get('softAvailableOnDate')) {
      var nextAvailable = moment.utc(this.model.get('softAvailableOnDate'));
      return nextAvailable;
    }
  },

  hasPlayedEnoughGames() {
    const gamesRequiredToUnlock = this.model.get('gamesRequiredToUnlock');
    return gamesRequiredToUnlock == null || gamesRequiredToUnlock <= ProgressionManager.getInstance().getGameCount();
  },

  _showNewPlayerUI() {
    const newPlayerManager = NewPlayerManager.getInstance();

    if (this.model.get('id') == SDK.PlayModes.Practice && newPlayerManager.getCurrentCoreStage() == SDK.NewPlayerProgressionStageEnum.TutorialDone) {
      var popoverContainer = this.$el;
      popoverContainer.popover({
        content: i18next.t('new_player_experience.highlight_practice_game_popover'),
        container: popoverContainer,
        placement: 'top',
        animation: true,
      });
      popoverContainer.popover('show');
      this.$el.addClass('emphasize');
    }

    if (this.model.get('id') == SDK.PlayModes.Ranked && newPlayerManager.getCurrentCoreStage() == SDK.NewPlayerProgressionStageEnum.ExtendedPracticeDone) {
      var popoverContainer = this.$el;
      popoverContainer.popover({
        content: i18next.t('new_player_experience.highlight_ladder_popover'),
        container: popoverContainer,
        placement: 'top',
        animation: true,
      });
      popoverContainer.popover('show');
      this.$el.addClass('emphasize');
    }

    if (this.model.get('id') == SDK.PlayModes.Challenges) {
      const soloChallengeQuest = QuestsManager.getInstance().dailyQuestsCollection.find((q) => q.get('quest_type_id') == QuestBeginnerCompleteSoloChallenges.Identifier);
      if (soloChallengeQuest) {
        var popoverContainer = this.$el;
        popoverContainer.popover({
          content: i18next.t('new_player_experience.highlight_solo_challenge_popover'),
          container: popoverContainer,
          placement: 'top',
          animation: true,
        });
        popoverContainer.popover('show');
        this.$el.addClass('emphasize');
      }
    }
  },

  updateTimeUntilAvailable() {
    const now = moment().zone('-08:00'); // PDT
    const nextAvailable = this.getNextAvailableMoment();
    if (nextAvailable) {
      const time = nextAvailable.diff(now);
      let durationStr = '';
      if (time >= 0) {
        const duration = moment.duration(time);
        const durationDays = Math.floor(duration.asDays());
        const durationHours = duration.hours();
        const durationMinutes = duration.minutes();
        const durationSeconds = duration.seconds();
        if (durationDays) {
          var pluralS = '';
          if (durationDays > 1) pluralS = 's';
          durationStr += `${durationDays} day${pluralS} `;
        }
        if (durationHours) {
          var pluralS = '';
          if (durationHours > 1) pluralS = 's';
          durationStr += `${durationHours} hour${pluralS} `;
        }
        if (durationMinutes) {
          var pluralS = '';
          if (durationMinutes > 1) pluralS = 's';
          durationStr += `${durationMinutes} minute${pluralS} `;
        }
        if (!durationDays) { // Only show seconds if we dont have days
          var pluralS = '';
          if (durationSeconds > 1) pluralS = 's';
          durationStr += `${durationSeconds} second${pluralS}`;
        }
      } else {
        durationStr = 'or next patch release';
      }

      this.ui.countdownUntilAvailable.text(durationStr);

      if (time < 0) {
        clearInterval(this.timeUntilAvailableInterval);
        // If only enabled on days of week, trigger a rerender as the timer should be going away now
        if (this.model.get('availableOnDaysOfWeek')) {
          this.render();
        }
      }
    } else {
      clearInterval(this.timeUntilAvailableInterval);
    }
  },

  updateTimeAvailableFor() {
    const now = moment().zone('-08:00'); // PDT
    let until = null;
    if (this.model.get('softDisableOnDate')) {
      until = moment.utc(this.model.get('softDisableOnDate'));
    } else {
      // Else available tomorrow
      until = now.clone().add(1, 'day').startOf('day');
    }
    const time = until.diff(now);

    const duration = moment.duration(time);
    let durationStr = '';

    if (time > 0) {
      const durationDays = duration.days();
      const durationHours = duration.hours();
      const durationMinutes = duration.minutes();
      const durationSeconds = duration.seconds();
      if (durationDays) {
        var pluralS = '';
        if (durationDays > 1) pluralS = 's';
        durationStr += `${durationDays} day${pluralS} `;
      }
      if (durationHours) {
        var pluralS = '';
        if (durationHours > 1) pluralS = 's';
        durationStr += `${durationHours} hour${pluralS} `;
      }
      if (durationMinutes) {
        var pluralS = '';
        if (durationMinutes > 1) pluralS = 's';
        durationStr += `${durationMinutes} minute${pluralS} `;
      }
      if (!durationDays) { // Only show seconds if we dont have days
        var pluralS = '';
        if (durationSeconds > 1) pluralS = 's';
        durationStr += `${durationSeconds} second${pluralS}`;
      }
    } else {
      durationStr = 'Until Next Patch Release';
    }

    this.ui.countdownAvailableFor.text(durationStr);

    if (time < 0) {
      clearInterval(this.timeAvailableForInterval);
      // If only enabled on days of week, trigger a rerender as the timer should be going away now
      if (this.model.get('availableOnDaysOfWeek')) {
        this.render();
      }
    }
  },

  /* endregion HELPERS */

});

// Expose the class either via CommonJS or the global object
module.exports = PlayModeItemView;
