'use strict';

var moment = require('moment');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var generatePushID = require('app/common/generate_push_id');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var UtilsUI = require('app/common/utils/utils_ui');
var ResumeGameTmpl = require('app/ui/templates/item/resume_game.hbs');
var GamesManager = require('app/ui/managers/games_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var Animations = require('app/ui/views/animations');

var ResumeGameItemView = Backbone.Marionette.ItemView.extend({

  id: 'app-resume-game',
  className: 'status game-vs',
  template: ResumeGameTmpl,

  /* ui selector cache */

  ui: {
    $cancelButton: '.btn-user-cancel',
    $resumeMode: '.resume-mode',
    $continueMode: '.continue-mode',
    $continueButton: '.continue',
    player1: '.player1',
    player1Name: '.player1 .user-name',
    player1General: '.player1 .player-general',
    player1GeneralPlatform: '.player1 .player-general-platform',
    player2: '.player2',
    player2Name: '.player2 .user-name',
    player2General: '.player2 .player-general',
    player2GeneralPlatform: '.player2 .player-general-platform',
    $gameCreatedAt: '.game-created-at',
  },

  _requestId: null,

  initialize: function () {
    // generate unique id for requests
    this._requestId = generatePushID();
  },

  onShow: function () {
    // change gradient color mapping
    Scene.getInstance().getFX().showGradientColorMap(this._requestId, CONFIG.ANIMATE_FAST_DURATION, {
      r: 194, g: 203, b: 240, a: 255,
    }, {
      r: 20, g: 25, b: 60, a: 255,
    });

    // start in resume mode
    this.ui.$resumeMode.show();
    this.ui.$continueMode.hide();

    // listen for click on continue to swap to continue mode
    this.ui.$continueButton.one('click', function () {
      this.ui.$cancelButton.remove();
      this.ui.$resumeMode.remove();
      this.ui.$continueMode.show();
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_confirm.audio, CONFIG.CONFIRM_SFX_PRIORITY);
      this.trigger('continue');
    }.bind(this));

    // animate activation
    Animations.cssClassAnimation.call(this, 'active');
  },

  onRender: function () {
    var player1Id = this.model.get('player1Id');
    var player1Username = this.model.get('player1Username');
    var player2Id = this.model.get('player2Id');
    var player2Username = this.model.get('player2Username');

    if (this.model.get('myPlayerIsPlayer1')) {
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
    var player1GeneralId = this.model.get('player1GeneralId');
    var player2GeneralId = this.model.get('player2GeneralId');
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
      // show player general animations
      if (this._displayedPlayer1SpriteData !== player1SpriteData) {
        this._displayedPlayer1SpriteData = player1SpriteData;
        this._player1GLData = UtilsUI.showCocosSprite(this.ui.player1General, this._player1GLData, player1SpriteData);
      }
      if (this._displayedPlayer2SpriteData !== player2SpriteData) {
        this._displayedPlayer2SpriteData = player2SpriteData;
        this._player2GLData = UtilsUI.showCocosSprite(this.ui.player2General, this._player2GLData, player2SpriteData);
      }
    } else {
      // remove player general visuals
      this.ui.player1General.remove();
      this.ui.player1GeneralPlatform.remove();
      this.ui.player2General.remove();
      this.ui.player2GeneralPlatform.remove();
    }

    this.ui.$gameCreatedAt.text(moment(this.model.get('createdAt')).format('ddd Do MMM HH:mm'));
  },

  onPrepareForDestroy: function () {
    // reset gradient color mapping
    Scene.getInstance().getFX().clearGradientColorMap(this._requestId, CONFIG.ANIMATE_MEDIUM_DURATION);
  },

  onDestroy: function () {
    UtilsUI.releaseCocosSprite(this._player1GLData);
    UtilsUI.releaseCocosSprite(this._player2GLData);
  },

});

// Expose the class either via CommonJS or the global object
module.exports = ResumeGameItemView;
