// pragma PKGS: game

'use strict';

var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var Animations = require('app/ui/views/animations');
var GameBottomBarTmpl = require('app/ui/templates/composite/game_bottom_bar.hbs');
var ReplayEngine = require('app/replay/replayEngine');
var i18next = require('i18next');
var UtilsEngine = require('../../../common/utils/utils_engine');

var GameBottomBarCompositeView = Backbone.Marionette.CompositeView.extend({

  id: 'app-game-bottombar',

  template: GameBottomBarTmpl,

  ui: {
    $submitTurn: '.submit-turn',
    $submitTurnType: '.submit-turn .turn-type',
    $replayControl: '.replay-control',
    $replayControlPause: '.replay-control .control-type-pause',
    $replayControlPlay: '.replay-control .control-type-play',
    $replayControlSpeedValue: '.replay-control .control-info-speed .control-value',
    $replayControlRealTimeModeValue: '.replay-control .control-type-real-time-mode #checkbox-real-time-mode',
  },

  events: {
    'click .submit-turn': 'onClickSubmitTurn',
    'click .replay-control .control-type-pause': 'onReplayPause',
    'click .replay-control .control-type-play': 'onReplayPlay',
    'click .replay-control .control-type-speed': 'onIncreaseReplaySpeed',
    'change .replay-control .control-type-real-time-mode': 'onReplayRealTimeModeChange',
    'mouseenter .submit-turn': 'onMouseEnterSubmitTurn',
    'mouseleave .submit-turn': 'onMouseLeaveSubmitTurn',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  /* region INITIALIZE */

  initialize: function () {
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize: function () {
    var endPosition = UtilsEngine.getCardsInHandEndPositionForCSS();
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      if (SDK.GameSession.getInstance().getIsReplay()) {
        this.ui.$replayControl.css(
          'transform',
          'translate(' + (endPosition.x - 60.0) / 10.0 + 'rem, ' + (-endPosition.y + CONFIG.HAND_CARD_SIZE * 0.35) / 10.0 + 'rem)',
        );
      }
    } else {
      this.ui.$submitTurn.css(
        'transform',
        'translate(' + (endPosition.x - 10.0) / 10.0 + 'rem, ' + (-endPosition.y + CONFIG.HAND_CARD_SIZE * 0.35) / 10.0 + 'rem)',
      );
    }
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      this.ui.$submitTurn.remove();
      if (!SDK.GameSession.getInstance().getIsReplay()) {
        this.ui.$replayControl.remove();
      }
    } else {
      this.ui.$replayControl.remove();
    }
    this._updateControls();
  },

  _updateControls: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      this._updateReplayControlPlaying();
      this._updateReplayControlSpeed();
      this._updateReplayRealTimeMode();
    } else {
      this._updateSubmitTurnState();
    }
  },

  onShow: function () {
    // game events
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.end_turn, this._setSubmitTurnButtonToEnemyState);
    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      this.listenTo(gameLayer.getEventBus(), EVENTS.before_show_step, this.onBeforeShowStep);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_end_turn, this.onShowEndTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_start_turn, this.onShowStartTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_rollback, this.onShowRollback);
    }

    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      this.listenTo(ReplayEngine.getInstance().getEventBus(), EVENTS.replay_started, this._updateReplayControlPlaying);
      this.listenTo(ReplayEngine.getInstance().getEventBus(), EVENTS.replay_paused, this._updateReplayControlPlaying);
      this.listenTo(ReplayEngine.getInstance().getEventBus(), EVENTS.replay_resumed, this._updateReplayControlPlaying);
    }

    this._updateControls();

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);
    this.onResize();
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onBeforeShowStep: function (event) {
    this._updateSubmitTurnState();
  },

  onShowEndTurn: function (event) {
    this._updateSubmitTurnState();
  },
  onShowStartTurn: function (event) {
    this._updateSubmitTurnState();
  },
  onShowRollback: function (event) {
    this._updateSubmitTurnState();
  },

  onClickSubmitTurn: function () {
    var gameLayer = Scene.getInstance().getGameLayer();
    var gameSession = SDK.GameSession.getInstance();

    if (gameSession.isChallenge() && gameSession.getChallenge() != null && gameSession.getChallenge().usesResetTurn && !gameSession.isOver()) {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      gameSession.getChallenge().challengeReset();
    } else if (gameLayer && gameLayer.getIsMyTurn() && !gameLayer.getPlayerSelectionLocked()) {
      gameSession.submitExplicitAction(gameSession.actionEndTurn());
    } else {
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);
    }
  },

  onReplayPause: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      ReplayEngine.getInstance().pause();
    }
  },

  onReplayPlay: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      ReplayEngine.getInstance().resume();
    }
  },

  onIncreaseReplaySpeed: function () {
    if (CONFIG.replayActionSpeedModifier == 2.0) {
      CONFIG.replayActionSpeedModifier = 1.0;
    } else {
      CONFIG.replayActionSpeedModifier += 0.5;
    }

    if (this._updateAllActionsSpeedModifiersDebounced == null) {
      this._updateAllActionsSpeedModifiersDebounced = _.debounce(function () {
        cc.director.getActionManager().setAllActionsSpeedModifiers(CONFIG.replayActionSpeedModifier);
      }, 300);
    }
    this._updateAllActionsSpeedModifiersDebounced();

    this._updateReplayControlSpeed();
  },

  onReplayRealTimeModeChange: function () {
    CONFIG.replaysCullDeadtime = !this.ui.$replayControlRealTimeModeValue.prop('checked');

    // update replay timing for current step
    ReplayEngine.getInstance().updateTimeForPlayingStep();
  },

  _updateReplayControlSpeed: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      this.ui.$replayControlSpeedValue.text(CONFIG.replayActionSpeedModifier.toFixed(1) + 'x');
    }
  },

  _updateReplayControlPlaying: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      if (ReplayEngine.getInstance().isPlaying()) {
        this.ui.$replayControl.removeClass('paused').addClass('playing');
      } else {
        this.ui.$replayControl.removeClass('playing').addClass('paused');
      }
    }
  },

  _updateReplayRealTimeMode: function () {
    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      this.ui.$replayControlRealTimeModeValue.prop('checked', !CONFIG.replaysCullDeadtime);
    }
  },

  onMouseEnterSubmitTurn: function () {
    audio_engine.current().play_effect(RSX.sfx_ui_in_game_hover.audio);

    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer) {
      if (CONFIG.SHOW_UNUSED_ENTITIES) {
        gameLayer.tagUnusedEntities();
      }
    }
  },
  onMouseLeaveSubmitTurn: function () {
    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer && CONFIG.SHOW_UNUSED_ENTITIES) {
      gameLayer.removeUnusedEntitiesTags();
    }
  },

  /* endregion EVENT LISTENERS */

  /* region TURN */

  _updateSubmitTurnState: function () {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      var gameLayer = Scene.getInstance().getGameLayer();
      var gameSession = SDK.GameSession.getInstance();

      // If in a challenge with reset turn, show reset turn, else if it's my turn show my turn, else show enemy turn
      if (gameSession.isChallenge() && gameSession.getChallenge() != null && gameSession.getChallenge().usesResetTurn) {
        this._setSubmitTurnButtonToResetOTKState();
      } else if (!(gameLayer && gameLayer.getIsMyTurn()) || gameSession.getCurrentTurn().getEnded()) {
        this._setSubmitTurnButtonToEnemyState();
      } else {
        this._setSubmitTurnButtonToMyState();
      }
    }
  },

  _setSubmitTurnButtonToMyState: function () {
    this.ui.$submitTurnType.text(i18next.t('battle.turn_button_label_end_turn'));
    this.ui.$submitTurn.addClass('my-turn');

    // check if player is finished (i.e. nothing left to do)
    if (this.getIsPlayerFinished()) {
      this.ui.$submitTurn.addClass('finished');
    } else {
      this.ui.$submitTurn.removeClass('finished');
    }

    this.ui.$submitTurn.removeClass('enemy-turn');
  },

  _setSubmitTurnButtonToResetOTKState: function () {
    var gameSession = SDK.GameSession.current();
    this.ui.$submitTurnType.text(i18next.t('battle.turn_button_label_restart_turn'));
    if (!gameSession.isOver()) {
      this.ui.$submitTurn.addClass('my-turn');
    } else {
      this.ui.$submitTurn.removeClass('my-turn');
    }

    // check if player is finished (i.e. nothing left to do)
    if (this.getIsPlayerFinished()) {
      this.ui.$submitTurn.addClass('finished');
    } else {
      this.ui.$submitTurn.removeClass('finished');
    }

    this.ui.$submitTurn.removeClass('enemy-turn');
  },

  getIsPlayerFinished: function () {
    var player = SDK.GameSession.getInstance().getCurrentPlayer();

    // check if player can:
    // - replace a card
    // - play signature card
    // - play a card in hand
    var canUseCard = false;
    var deck = player.getDeck();
    if (deck.getCanReplaceCardThisTurn()) {
      canUseCard = true;
    } else {
      var signatureCard = player.getCurrentSignatureCard();
      if (signatureCard != null && signatureCard.getDoesOwnerHaveEnoughManaToPlay() && player.getIsSignatureCardActive()) {
        canUseCard = true;
      } else {
        var handCards = deck.getCardsInHand();
        if (handCards && handCards.length > 0) {
          for (var i = 0, il = handCards.length; i < il; i++) {
            var card = handCards[i];
            if (card && card.getDoesOwnerHaveEnoughManaToPlay()) {
              canUseCard = true;
              break;
            }
          }
        }
      }
    }

    return !canUseCard && Scene.getInstance().getGameLayer().getReadyEntityNodes().length === 0;
  },

  _setSubmitTurnButtonToEnemyState: function () {
    this.ui.$submitTurnType.text(i18next.t('battle.turn_button_label_enemy_turn'));
    this.ui.$submitTurn.addClass('enemy-turn');
    this.ui.$submitTurn.removeClass('my-turn');
    this.ui.$submitTurn.removeClass('finished');
  },

  /* endregion TURN */

});

// Expose the class either via CommonJS or the global object
module.exports = GameBottomBarCompositeView;
