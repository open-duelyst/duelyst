// pragma PKGS: nongame

'use strict';

var _ = require('underscore');
var SDK = require('app/sdk');
var RSX = require('app/data/resources');
var PlayModeTmpl = require('app/ui/templates/item/play_mode.hbs');
var moment = require('moment');
var UtilsEnv = require('app/common/utils/utils_env');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var QuestsManager = require('app/ui/managers/quests_manager');
var QuestBeginnerCompleteSoloChallenges = require('app/sdk/quests/questBeginnerCompleteSoloChallenges');
var i18next = require('i18next');
var SlidingPanelItemView = require('./sliding_panel');

var PlayModeItemView = SlidingPanelItemView.extend({

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

    isAvailableToday: function () {
      return this.isModeAvailableToday();
    },

    isAvailableTommorrow: function () {
      return this.isModeAvailableTommorrow();
    },

    getNextAvailableDate: function () {
      if (this.getNextAvailableMoment()) {
        var local = this.getNextAvailableMoment().clone().zone(moment().zone());
        return local.format('ddd MMM DD hh:mm A');
      }
    },

  },

  /* region INITIALIZE */

  initialize: function () {
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
      var gamesRequiredToUnlock = this.model.get('gamesRequiredToUnlock');
      this.model.set('unlockMessage', i18next.t('new_player_experience.play_mode_unlock_game_count_message', { game_count: (gamesRequiredToUnlock - ProgressionManager.getInstance().getGameCount()) }));
    }
  },

  /* endregion INITIALIZE */

  /* region EVENTS */

  onRender: function () {
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

  onShow: function () {
    this._showNewPlayerStylingTimeout = setTimeout(function () {
      this._showNewPlayerUI();
    }.bind(this), 1000);
  },

  onDestroy: function () {
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

  onClick: function () {
    if (this.isModeAvailableToday()) {
      this.trigger('select');
    }
  },

  /* endregion EVENTS */

  /* region HELPERS */

  isModeAvailableToday: function () {
    if (UtilsEnv.getIsInStaging() || UtilsEnv.getIsInDevelopment())
      return true;

    var days = this.model.get('availableOnDaysOfWeek');
    if (days && days.length > 0) {
      var myDate = moment().zone('-08:00'); // PDT
      var isAvailable = _.contains(days, myDate.weekday());
      return isAvailable;
    } else {
      return true;
    }
  },

  isModeAvailableTommorrow: function () {
    var days = this.model.get('availableOnDaysOfWeek');
    if (days && days.length > 0) {
      var myDate = moment().zone('-08:00').add(1, 'day'); // PDT
      var isAvailable = _.contains(days, myDate.weekday());
      return isAvailable;
    } else {
      return true;
    }
  },

  getNextAvailableMoment: function () {
    var now = moment().zone('-08:00'); // PDT
    var currentDay = now.weekday(); // indexed off 0
    if (this.model.get('availableOnDaysOfWeek')) {
      var daysOfWeekAvailable = this.model.get('availableOnDaysOfWeek');
      if (daysOfWeekAvailable && daysOfWeekAvailable.length > 0) {
        var nextDay = daysOfWeekAvailable[0];
        for (var i = 0; i < daysOfWeekAvailable.length; i++) {
          if (currentDay < daysOfWeekAvailable[i]) {
            nextDay = daysOfWeekAvailable[i];
            break;
          }
        }

        var delta;
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

  hasPlayedEnoughGames: function () {
    var gamesRequiredToUnlock = this.model.get('gamesRequiredToUnlock');
    return gamesRequiredToUnlock == null || gamesRequiredToUnlock <= ProgressionManager.getInstance().getGameCount();
  },

  _showNewPlayerUI: function () {
    var newPlayerManager = NewPlayerManager.getInstance();

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
      var soloChallengeQuest = QuestsManager.getInstance().dailyQuestsCollection.find(function (q) {
        return q.get('quest_type_id') == QuestBeginnerCompleteSoloChallenges.Identifier;
      });
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

  updateTimeUntilAvailable: function () {
    var now = moment().zone('-08:00'); // PDT
    var nextAvailable = this.getNextAvailableMoment();
    if (nextAvailable) {
      var time = nextAvailable.diff(now);
      var durationStr = '';
      if (time >= 0) {
        var duration = moment.duration(time);
        var durationDays = Math.floor(duration.asDays());
        var durationHours = duration.hours();
        var durationMinutes = duration.minutes();
        var durationSeconds = duration.seconds();
        if (durationDays) {
          var pluralS = '';
          if (durationDays > 1) pluralS = 's';
          durationStr += durationDays + ' day' + pluralS + ' ';
        }
        if (durationHours) {
          var pluralS = '';
          if (durationHours > 1) pluralS = 's';
          durationStr += durationHours + ' hour' + pluralS + ' ';
        }
        if (durationMinutes) {
          var pluralS = '';
          if (durationMinutes > 1) pluralS = 's';
          durationStr += durationMinutes + ' minute' + pluralS + ' ';
        }
        if (!durationDays) { // Only show seconds if we dont have days
          var pluralS = '';
          if (durationSeconds > 1) pluralS = 's';
          durationStr += durationSeconds + ' second' + pluralS;
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

  updateTimeAvailableFor: function () {
    var now = moment().zone('-08:00'); // PDT
    var until = null;
    if (this.model.get('softDisableOnDate')) {
      until = moment.utc(this.model.get('softDisableOnDate'));
    } else {
      // Else available tomorrow
      until = now.clone().add(1, 'day').startOf('day');
    }
    var time = until.diff(now);

    var duration = moment.duration(time);
    var durationStr = '';

    if (time > 0) {
      var durationDays = duration.days();
      var durationHours = duration.hours();
      var durationMinutes = duration.minutes();
      var durationSeconds = duration.seconds();
      if (durationDays) {
        var pluralS = '';
        if (durationDays > 1) pluralS = 's';
        durationStr += durationDays + ' day' + pluralS + ' ';
      }
      if (durationHours) {
        var pluralS = '';
        if (durationHours > 1) pluralS = 's';
        durationStr += durationHours + ' hour' + pluralS + ' ';
      }
      if (durationMinutes) {
        var pluralS = '';
        if (durationMinutes > 1) pluralS = 's';
        durationStr += durationMinutes + ' minute' + pluralS + ' ';
      }
      if (!durationDays) { // Only show seconds if we dont have days
        var pluralS = '';
        if (durationSeconds > 1) pluralS = 's';
        durationStr += durationSeconds + ' second' + pluralS;
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
