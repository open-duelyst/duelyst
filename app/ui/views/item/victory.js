// pragma PKGS: game

'use strict';

var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var RSX = require('app/data/resources');
var CONFIG = require('app/common/config');
var Animations = require('app/ui/views/animations');
var audio_engine = require('app/audio/audio_engine');
var NavigationManager = require('app/ui/managers/navigation_manager');
var InventoryManager = require('app/ui/managers/inventory_manager');
var VictoryTemplate = require('app/ui/templates/item/victory.hbs');
var VictoryLayer = require('app/view/layers/postgame/VictoryLayer');
var ChatManager = require('app/ui/managers/chat_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var moment = require('moment');
var AnalyticsTracker = require('app/common/analyticsTracker');
var i18next = require('i18next');
var ConfirmDialogItemView = require('./confirm_dialog');

var VictoryItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-victory',
  className: 'status',

  template: VictoryTemplate,

  _hasTipped: false,

  ui: {
    result: '.result',
    resultContent: '.result-content',
    opponentInfo: '.opponent-info',
    progressBarComplete: '#progressBarComplete',
    progressBarEarned: '#progressBarEarned',
    levelUpNotice: '.level-up-notice',
    factionLevel: '.faction-level',
    confirm_report_dialog: '#confirm_report_dialog',
    report_text: '#report_text',
    report_form_error: '#report_form_error',
  },

  events: {
    'click .btn-add-opponent-to-buddies': 'onAddOpponentToBuddiesPress',
    'click .btn-tip-opponent': 'onTipPress',
    'click .btn-report-opponent': 'onReportPress',
    'click #confirm_report_button': 'onConfirmReportPress',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  isCancelLocked: false,
  _userNavLockId: 'VictoryUserNavLockId',

  templateHelpers: {

    havePlayRewardsBeenMaxed: function () {
      return this.model.get('has_maxed_play_count_rewards');
      // var last_maxed = this.model.get("play_awards_last_maxed_at")
      // if (last_maxed) {
      //   var now = moment().utc()
      //   var lastMaxedStartOfDay = moment(last_maxed).startOf('day')
      //   var days_since_last_maxed = now.diff(lastMaxedStartOfDay,'days');
      //   if (days_since_last_maxed == 0)
      //     return true;
      //   else
      //     return false;
      // } else {
      //   return false;
      // }
    },

    haveWinRewardsBeenMaxed: function () {
      return this.model.get('has_maxed_win_count_rewards');
      // var last_maxed = this.model.get("win_awards_last_maxed_at")
      // if (last_maxed) {
      //   var now = moment().utc()
      //   var lastMaxedStartOfDay = moment(last_maxed).startOf('day')
      //   var days_since_last_maxed = now.diff(lastMaxedStartOfDay,'days');
      //   if (days_since_last_maxed == 0)
      //     return true;
      //   else
      //     return false;
      // } else {
      //   return false;
      // }
    },

    shouldShowGameCounterRewards: function () {
      return SDK.GameType.isCompetitiveGameType(SDK.GameSession.getInstance().getGameType()) && SDK.GameSession.getInstance().getGameType() != SDK.GameType.Rift;
    },

    winsToReward: function () {
      var delta = this.model.get('win_count_reward_progress');
      if (delta == 0) {
        if (this.model.get('is_winner')) {
          return 2;
        } else {
          return 0;
        }
      } else {
        return delta;
      }
    },

    gamesToReward: function () {
      var delta = this.model.get('play_count_reward_progress');
      if (delta == 0) {
        return 4;
      } else {
        return delta;
      }
    },

    shouldShowFactionLevel: function () {
      return this.model.get('faction_xp') != null;
    },

    shouldShowFactionXP: function () {
      return this.model.get('faction_xp_earned');
    },

    hasMaxedSinglePlayerXp: function () {
      return this.model.get('is_scored') && (SDK.GameSession.getInstance().getGameType() == SDK.GameType.SinglePlayer || SDK.GameSession.getInstance().getGameType() == SDK.GameType.BossBattle || SDK.GameSession.getInstance().getGameType() == SDK.GameType.Friendly) && this.model.get('faction_xp_earned') == null;
    },

  },

  initialize: function () {
  },

  /* region MODEL to VIEW DATA */

  serializeModel: function (model) {
    var data = model.toJSON.apply(model, _.rest(arguments));

    var winningPlayer = SDK.GameSession.getInstance().getWinner();
    var isFriendly = SDK.GameSession.getInstance().isFriendly();
    var myPlayer;
    var myPlayerWon;
    if (SDK.GameSession.getInstance().isSandbox()) {
      if (winningPlayer == null) {
        winningPlayer = SDK.GameSession.getInstance().getCurrentPlayer();
      }
      myPlayer = winningPlayer;
      myPlayerWon = true;
    } else {
      myPlayer = SDK.GameSession.getInstance().getMyPlayer();
      myPlayerWon = myPlayer === winningPlayer;
    }

    data.is_network_game = SDK.GameType.isNetworkGameType(SDK.GameSession.getInstance().getGameType());
    data.is_spectate_or_replay = SDK.GameSession.getInstance().getIsSpectateMode();
    data.has_won = myPlayerWon;

    var playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(myPlayer.getPlayerId());
    var factionData = SDK.FactionFactory.factionForIdentifier(playerSetupData.factionId);
    data.faction_name = factionData.name;

    if (data.faction_xp != null) {
      // Set faction level to level prior to this game (don't add xp earned) higher level is shown after animation
      var xp_previous = data.faction_xp;

      var prev_level = SDK.FactionProgression.levelForXP(xp_previous);
      data.faction_level = prev_level;

      // show level indexed off of 1
      data.faction_level = data.faction_level + 1;
    }

    // figure out last opponent name / id
    if (data.opponent_id) {
      if (SDK.GameType.isCompetitiveGameType(SDK.GameSession.getInstance().getGameType())) {
        var buddyExists = ChatManager.getInstance().getBuddiesCollection().find(function (buddy) {
          return (buddy.get('id') == data.opponent_id);
        });
        data.show_add_buddy = !buddyExists;

        if (data.is_winner && !isFriendly) {
          var walletModel = InventoryManager.getInstance().getWalletModel();
          // Check if user has enough gold to tip
          if (walletModel != null && walletModel.get('gold_amount') >= 5) {
            data.show_tip = true;
          }
        }

        data.show_report = true;
      } else {
        data.show_add_buddy = false;
        data.show_tip = false;
        data.show_report = false;
      }
    }

    // clear opponent id for single player games
    if (SDK.GameType.isSinglePlayerGameType(SDK.GameSession.getInstance().getGameType())) {
      data.opponent_id = null;
    }

    var now = moment();
    var then = moment(SDK.GameSession.getInstance().createdAt);
    var duration = moment.duration(now.diff(then));
    data.game_duration = moment(duration.asMilliseconds()).format('m:ss');
    data.game_turn_count = SDK.GameSession.getInstance().turns.length;

    return data;
  },

  /* endregion MODEL to VIEW DATA */

  onRender: function () {
    var winningPlayer = SDK.GameSession.getInstance().getWinner();
    var myPlayer = SDK.GameSession.getInstance().getMyPlayer();

    this.$el.find('[data-toggle=\'tooltip\']').tooltip();

    if (SDK.GameSession.getInstance().isSandbox()) {
      this.ui.result.addClass('friendly');
      this.ui.resultContent.text(i18next.t('battle.outcome_victory'));
    } else if (winningPlayer == null) {
      this.ui.result.addClass('enemy');
      this.ui.resultContent.text(i18next.t('battle.outcome_draw'));
    } else if (myPlayer === winningPlayer) {
      this.ui.result.addClass('friendly');
      this.ui.resultContent.text(i18next.t('battle.outcome_victory'));
    } else {
      this.ui.result.addClass('enemy');
      this.ui.resultContent.text(i18next.t('battle.outcome_defeat'));
    }
  },

  onDestroy: function () {
    // unlock user triggered navigation
    NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);

    this.$el.find('[data-toggle=\'tooltip\']').tooltip('destroy');
  },

  onAnimatedIn: function () {
    var winningPlayer = SDK.GameSession.getInstance().getWinner();
    var myPlayer = SDK.GameSession.getInstance().getMyPlayer();

    if (myPlayer === winningPlayer || SDK.GameSession.getInstance().isSandbox()) {
      audio_engine.current().play_effect(RSX.sfx_victory_match_w_vo.audio);
    }

    this.ui.resultContent.addClass('active');

    // if this was a competitive game, animate level progression
    var lastGame = null;
    if (GamesManager.getInstance().playerGames != null) {
      lastGame = GamesManager.getInstance().playerGames.last();
    }
    if (lastGame && SDK.GameSession.getInstance().getGameId() === lastGame.get('game_id')) {
      if (lastGame.get('is_scored') && SDK.GameType.isFactionXPGameType(SDK.GameSession.getInstance().getGameType())) {
        var data = this.model.attributes;
        var factionName = SDK.FactionFactory.factionForIdentifier(data.faction_id).name;

        var xp_previous = data.faction_xp;
        var xp_earned = data.faction_xp_earned;
        var xp = xp_previous + xp_earned;

        var level = SDK.FactionProgression.levelForXP(xp_previous);
        var levelXPCost = SDK.FactionProgression.totalXPForLevel(level);
        var levelXPProgress = xp_previous - levelXPCost;
        var levelUpXPRequired = SDK.FactionProgression.deltaXPForLevel(level + 1);
        var hasLeveledUp = SDK.FactionProgression.hasLeveledUp(xp, xp_earned);

        if (hasLeveledUp) {
          // Lock while we show level up animation
          NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._userNavLockId);

          var xp_current_percent = Math.min(100, 100 * levelXPProgress / levelUpXPRequired);
          var xp_earned_percent = Math.min(100, 100 * (levelUpXPRequired - levelXPProgress) / levelUpXPRequired);

          this.animateFactionProgress(xp_current_percent, xp_earned_percent, function () {
            this.showLevelUpAnimation(function () {
              var nextLevel = SDK.FactionProgression.levelForXP(xp);
              var nextLevelXPCost = SDK.FactionProgression.totalXPForLevel(nextLevel);
              var nextLevelXPProgress = xp - nextLevelXPCost;
              var nextLevelXPRequired = SDK.FactionProgression.deltaXPForLevel(nextLevel + 1);

              var xp_next_earned_percent = 100 * nextLevelXPProgress / nextLevelXPRequired;

              this.animateFactionProgress(0, xp_next_earned_percent);

              this.ui.factionLevel.velocity({
                opacity: [0, 'easeOutCubic', 1],
              }, {
                duration: 800,
                complete: function () {
                  // show level indexed off of 1
                  this.ui.factionLevel.text(factionName + ' - ' + i18next.t('common.xp_level').toUpperCase() + ' ' + (nextLevel + 1));
                  this.ui.factionLevel.velocity({
                    opacity: [1, 'easeOutCubic', 0],
                  }, {
                    duration: 400,
                    complete: function () {
                      NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);
                    }.bind(this),
                  });
                }.bind(this),
              });
            }.bind(this));
          }.bind(this));
        } else if (xp_earned) {
          // Lock while we show xp gained animation
          NavigationManager.getInstance().requestUserTriggeredNavigationLocked(this._userNavLockId);

          var xp_current_percent = Math.min(100, 100 * levelXPProgress / levelUpXPRequired);
          var xp_earned_percent = Math.min(100, 100 * xp_earned / levelUpXPRequired);

          this.animateFactionProgress(xp_current_percent, xp_earned_percent, function () {
            NavigationManager.getInstance().requestUserTriggeredNavigationUnlocked(this._userNavLockId);
          }.bind(this));
        }
      }
    }
  },

  showLevelUpAnimation: function (onComplete) {
    var victoryLayer = Scene.getInstance().getOverlay();
    if (victoryLayer instanceof VictoryLayer) {
      victoryLayer.showLevelUpEffect();
    }

    this.ui.levelUpNotice.velocity({
      opacity: [1, 'easeOutCubic', 0],
      translateY: ['0px', 'easeOutCubic', '100px'],
    }, { duration: 800, complete: onComplete });
  },

  animateFactionProgress: function (percentCurrent, percentEarned, onComplete) {
    var totalWidth = percentCurrent + percentEarned;

    this.ui.progressBarComplete.width(percentCurrent + '%');
    this.ui.progressBarEarned.width(0);

    this.ui.progressBarEarned.css('backgroundColor', '#6dcff6');
    this.ui.progressBarEarned.velocity({ width: [percentEarned + '%', 'none', '0%'] }, {
      duration: 1000,
      complete: function () {
        // this.ui.progressBarEarned.velocity({ width: [ "0%", "none", percentEarned+"%" ] }, { duration: 1000 });
        // this.ui.progressBarComplete.velocity({ width: [ totalWidth+"%", "none", percentCurrent+"%" ] }, { duration: 1000, complete:onComplete });

        this.ui.progressBarEarned.velocity({ backgroundColor: '#ffffff' }, { duration: 400, complete: onComplete });
      }.bind(this),
    });
  },

  onAddOpponentToBuddiesPress: function (e) {
    this.ui.opponentInfo.find('.sent').removeClass('hide');
    this.ui.opponentInfo.find('.btn').addClass('hide');

    var lastOpponentName = this.model.get('opponent_username');
    if (lastOpponentName)
      ChatManager.getInstance().inviteBuddy(lastOpponentName);

    // e.isStopped = true;
    e.preventDefault();
    return false;
  },

  onReportPress: function (e) {
    this.ui.confirm_report_dialog.modal();
    this.ui.confirm_report_dialog.css('display', 'flex');

    this.ui.report_text.focus();

    // e.isStopped = true;
    e.preventDefault();
    return false;
  },

  onTipPress: function (e) {
    if (!NewPlayerManager.getInstance().getHasSeenGameGoldTipConfirmation()) {
      var dialog = new ConfirmDialogItemView({
        title: i18next.t('battle.gold_tip_confirm_message'),
      });
      this.listenToOnce(dialog, 'confirm', function () {
        NewPlayerManager.getInstance().setHasSeenGameGoldTipConfirmation(true);
        this.onTipPress(e);
      }.bind(this));
      NavigationManager.getInstance().showDialogView(dialog);
      return;
    }

    if (this._hasTipped)
      return;
    else
      this._hasTipped = true;

    var lastGame = GamesManager.getInstance().playerGames.last();
    var lastOpponentId = lastGame ? lastGame.get('opponent_id') : null;
    var gameId = lastGame ? lastGame.get('game_id') : null;

    // this.ui.confirm_report_dialog.modal('hide');

    if (lastOpponentId) {
      var tipAmount = 5;
      $.ajax({
        data: JSON.stringify({ amount: tipAmount }),
        url: process.env.API_URL + '/api/me/games/' + gameId + '/gold_tip_amount',
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
      });
    }

    var p = $(e.currentTarget).offset();
    p.x = p.left - cc.winSize.width / 2 + $(e.currentTarget).width() / 2;
    p.y = cc.winSize.height - p.top - cc.winSize.height / 2;

    $(e.currentTarget).get(0).animate([
      { opacity: 1.0 },
      { opacity: 0.0 },
    ], {
      duration: 100,
      delay: 0,
      fill: 'forwards',
    });

    var victoryLayer = Scene.getInstance().getOverlay();
    if (victoryLayer instanceof VictoryLayer) {
      victoryLayer.showGoldTipEffect(p);
    }

    // e.isStopped = true;
    e.preventDefault();
    return false;
  },

  onConfirmReportPress: function (e) {
    if (this.ui.report_text.val().length < 1) {
      this.ui.report_form_error.text('Can you please provide the reason for reporting the player?');
      this.ui.report_form_error.removeClass('hide');
      return;
    } else {
      this.ui.report_form_error.addClass('hide');
    }

    var lastGame = GamesManager.getInstance().playerGames.last();
    var lastOpponentId = lastGame ? lastGame.get('opponent_id') : null;

    this.ui.confirm_report_dialog.modal('hide');

    if (lastOpponentId) {
      $.ajax({
        data: JSON.stringify({
          user_id: lastOpponentId,
          message: this.ui.report_text.val(),
        }),
        url: process.env.API_URL + '/api/me/report_player',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
      });
    }

    // e.isStopped = true;
    e.preventDefault();
    return false;
  },
});

// Expose the class either via CommonJS or the global object
module.exports = VictoryItemView;
