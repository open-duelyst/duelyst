'use strict';

var FindingGameTemplate = require('app/ui/templates/item/finding_game.hbs');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var generatePushID = require('app/common/generate_push_id');
var Promise = require('bluebird');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var CONFIG = require('app/common/config');
var UtilsUI = require('app/common/utils/utils_ui');
var GAME_TIPS = require('app/data/game_tips');
var GamesManager = require('app/ui/managers/games_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Animations = require('app/ui/views/animations');
var moment = require('moment');
var momentDurationFormat = require('moment-duration-format');
var i18next = require('i18next');

var FindingGameItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-finding-game',
  className: 'status game-vs',

  template: FindingGameTemplate,

  /* ui selector cache */
  ui: {
    velocity: '#expected-wait',
    $cancelButton: '.btn-user-cancel',
    $findingMode: '.finding-mode',
    $singlePlayerMode: '.single-player-mode',
    $foundMode: '.found-mode',
    player1: '.player1',
    player1Name: '.player1 .user-name',
    player1General: '.player1 .player-general',
    player1GeneralPlatform: '.player1 .player-general-platform',
    player2: '.player2',
    player2Name: '.player2 .user-name',
    player2General: '.player2 .player-general',
    player2GeneralPlatform: '.player2 .player-general-platform',
    $game_tip: '.game-tip',
    clock: '#clock',
  },

  _canShowGame: false,
  _foundGamePlayerDataModel: null,
  _requestId: null,

  initialize: function () {
    // generate unique id for requests
    this._requestId = generatePushID();
  },

  /* region MARIONETTE EVENTS */

  onShow: function () {
    // change gradient color mapping
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 194, g: 203, b: 240, a: 255,
    }, {
      r: 20, g: 25, b: 60, a: 255,
    });

    this._canShowGame = true;
    if (this._foundGamePlayerDataModel) {
      this._showFoundGame();
    } else {
      if (SDK.GameType.isSinglePlayerGameType(this.model.get('gameType'))) {
        // show single player game
        this._showSinglePlayerMode();
      } else {
        // show finding game
        this._showFindingMode();
      }
      this.ui.$foundMode.hide();
    }

    // show first tip
    this._showNextGameTip();

    // listen to events
    this.listenTo(EventBus.getInstance(), EVENTS.matchmaking_velocity, this.onShowVelocity);

    this.clockTime = 0;
    this.clockInterval = setInterval(this.updateClock.bind(this), 1000);
  },

  onPrepareForDestroy: function () {
    // reset gradient color mapping
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onDestroy: function () {
    GamesManager.getInstance().cancelMatchmaking();
    this._stopShowingGameTips();
    UtilsUI.releaseCocosSprite(this._player1GLData);
    UtilsUI.releaseCocosSprite(this._player2GLData);
    clearInterval(this.clockInterval);
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENTS */

  onShowVelocity: function (velocity) {
    var prettyTimestamp = moment.duration(velocity).format('m:ss', { trim: false });

    var waitString = i18next.t('game_setup.matchmaking_wait_time_message', { wait_time: prettyTimestamp });

    if (!velocity || velocity <= 5) {
      velocity = 90000 + 10000 - Math.round(Math.random() * 20000);
      var waitString = i18next.t('game_setup.matchmaking_estimated_wait_time_message', { wait_time: prettyTimestamp });
    }

    this.ui.velocity.html(waitString);
    this.ui.velocity.animate({
      opacity: 1,
    }, 250);
  },

  updateClock: function () {
    this.clockTime += 1000;
    var prettyTimestamp = moment.duration(this.clockTime).format('mm:ss', { trim: false });
    this.ui.clock.text(prettyTimestamp);
  },

  /* endregion EVENTS */

  /* region TIPS */

  _showNextGameTip: function () {
    // cleanup
    this._stopShowingGameTips();

    // fade out
    this.ui.$game_tip
      .velocity('stop')
      .velocity(
        { opacity: 0 },
        { duration: CONFIG.FADE_FAST_DURATION * 1000.0, complete: function () { this.ui.$game_tip.text(GAME_TIPS.random_tip()); }.bind(this) },
      )
      .velocity(
        { opacity: 1 },
        { duration: CONFIG.FADE_FAST_DURATION * 1000.0 },
      );

    // delay and show next
    this._game_tip_timeout_id = setTimeout(this._showNextGameTip.bind(this), CONFIG.GAME_TIP_DURATION * 1000.0);
  },

  _stopShowingGameTips: function () {
    this.ui.$game_tip.velocity('stop');
    if (this._game_tip_timeout_id != null) {
      clearTimeout(this._game_tip_timeout_id);
      this._game_tip_timeout_id = null;
    }
  },

  /* endregion TIPS */

  /* region MODES */

  _showFindingMode: function () {
    this.ui.$findingMode.show();
    this.ui.$singlePlayerMode.remove();
  },

  _showSinglePlayerMode: function () {
    this.ui.$singlePlayerMode.show();
    this.ui.$findingMode.remove();
  },

  showFoundGame: function (foundGamePlayerDataModel) {
    this._foundGamePlayerDataModel = foundGamePlayerDataModel;

    // when showing
    if (this._canShowGame && !this.isDestroyed) {
      this._showFoundGame();
    }

    return Promise.resolve();
  },

  _showFoundGame: function () {
    if (this._foundGamePlayerDataModel != null) {
      this.ui.$cancelButton.remove();
      this.ui.$findingMode.remove();
      this.ui.$singlePlayerMode.remove();
      this.ui.$foundMode.show();

      var player1Id = this._foundGamePlayerDataModel.get('player1Id');
      var player1Username = this._foundGamePlayerDataModel.get('player1Username');
      var player2Id = this._foundGamePlayerDataModel.get('player2Id');
      var player2Username = this._foundGamePlayerDataModel.get('player2Username');

      if (this._foundGamePlayerDataModel.get('myPlayerIsPlayer1')) {
        this.ui.player1.addClass('friendly');
        this.ui.player2.addClass('enemy');
      } else {
        this.ui.player1.addClass('enemy');
        this.ui.player2.addClass('friendly');
      }

      // set player names
      this.ui.player1Name.text(player1Username);
      this.ui.player2Name.text(player2Username);

      // general sprites
      var player1GeneralId = this._foundGamePlayerDataModel.get('player1GeneralId');
      var player2GeneralId = this._foundGamePlayerDataModel.get('player2GeneralId');
      var player1General;
      var player1SpriteData;
      var player2General;
      var player2SpriteData;
      /*
      // for now, don't show general sprites
      if (player1GeneralId != null && player2GeneralId != null) {
        player1General = SDK.CardFactory.cardForIdentifier(player1GeneralId, SDK.GameSession.getInstance());
        player1SpriteData = player1General && player1General.getAnimResource() && UtilsUI.getCocosSpriteData(player1General.getAnimResource().idle);
        player2General = SDK.CardFactory.cardForIdentifier(player2GeneralId, SDK.GameSession.getInstance());
        player2SpriteData = player2General && player2General.getAnimResource() && UtilsUI.getCocosSpriteData(player2General.getAnimResource().idle);
      }
      */

      if (player1SpriteData != null && player2SpriteData != null) {
        if (this._displayedPlayer1SpriteData !== player1SpriteData) {
          this._displayedPlayer1SpriteData = player1SpriteData;
          this._player1GLData = UtilsUI.showCocosSprite(this.ui.player1General, this._player1GLData, player1SpriteData);
        }
        if (this._displayedPlayer2SpriteData !== player2SpriteData) {
          this._displayedPlayer2SpriteData = player2SpriteData;
          this._player2GLData = UtilsUI.showCocosSprite(this.ui.player2General, this._player2GLData, player2SpriteData);
        }
      } else {
        this.ui.player1General.remove();
        this.ui.player1GeneralPlatform.remove();
        this.ui.player2General.remove();
        this.ui.player2GeneralPlatform.remove();
      }

      // show active vs state
      Animations.cssClassAnimation.call(this, 'active');
    }
  },

  /* endregion MODES */

});

// Expose the class either via CommonJS or the global object
module.exports = FindingGameItemView;
