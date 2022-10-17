// pragma PKGS: game

'use strict';

var _ = require('underscore');
var Animations = require('app/ui/views/animations');
var TransitionRegion = require('app/ui/views/regions/transition');
var GameTmpl = require('app/ui/templates/layouts/game.hbs');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var CONFIG = require('app/common/config');
var RSX = require('app/data/resources');
var audio_engine = require('app/audio/audio_engine');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Scene = require('app/view/Scene');
var GameLayer = require('app/view/layers/game/GameLayer');
var UtilsEngine = require('app/common/utils/utils_engine');
var GameFollowupItemView = require('app/ui/views/item/game_followup');
var GameDataManager = require('app/ui/managers/game_data_manager');
var NewPlayerManager = require('app/ui/managers/new_player_manager');
var ProgressionManager = require('app/ui/managers/progression_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var NetworkManager = require('app/sdk/networkManager');
var ProfileManager = require('app/ui/managers/profile_manager');
var NotificationModel = require('app/ui/models/notification');
var GameTopBarCompositeView = require('app/ui/views/composite/game_top_bar');
var GameBottomBarCompositeView = require('app/ui/views/composite/game_bottom_bar');
var GameChooseHandItemView = require('app/ui/views/item/game_choose_hand');
var GameStartingHandItemView = require('app/ui/views/item/game_starting_hand');
var GamePlayerProfilePreview = require('app/ui/views/composite/game_player_profile_preview');
var InstructionNode = require('app/view/nodes/cards/InstructionNode');
var Analytics = require('app/common/analytics');
var moment = require('moment');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var i18next = require('i18next');
const Chroma = require('app/common/chroma');
var GamePlayer2Layout = require('./game_player2');
var GamePlayer1Layout = require('./game_player1');

var GameLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-game',

  template: GameTmpl,

  regions: {
    player1Region: { selector: '#app-game-player1-region', regionClass: TransitionRegion },
    player2Region: { selector: '#app-game-player2-region', regionClass: TransitionRegion },
    leftRegion: { selector: '#app-game-left-region', regionClass: TransitionRegion },
    middleRegion: { selector: '#app-game-middle-region', regionClass: TransitionRegion },
    rightRegion: { selector: '#app-game-right-region', regionClass: TransitionRegion },
    topRegion: { selector: '#app-game-top-region', regionClass: TransitionRegion },
    centerRegion: { selector: '#app-game-center-region', regionClass: TransitionRegion },
    bottomRegion: { selector: '#app-game-bottom-region', regionClass: TransitionRegion },
    followupRegion: { selector: '#app-game-followup-region', regionClass: TransitionRegion },
    customOverlayRegion: { selector: '#app-game-custom-overlay-region', regionClass: TransitionRegion },
  },

  ui: {
    $content: '#app-game-content',
    $overlay: '#app-game-overlay',
    $turnTimerContainer: '.timer-container',
    $turnTimerBar: '.timer-bar',
    spectator_notification: '#spectator_notification',
  },

  animateIn: Animations.fadeIn,
  animateOut: Animations.fadeOut,

  chooseHandView: null,

  _hasFadedContent: false,
  _hasShownBattlePetTip: false,
  _aiHasShownGG: false,
  _aiHasShownGLHF: false,
  _numTurnsSinceSignatureCardUsed: -1,
  _remindSignatureCardTimeoutId: null,
  _numTurnsSinceReplaceUsed: -1,
  _remindReplaceCardTimeoutId: null,
  _spectatorNotificationTimeout: null,

  /* region INITIALIZATION */

  initialize: function () {
    this._numTurnsSinceSignatureCardUsed = -1;
    this._numTurnsSinceReplaceUsed = -1;
  },

  /* endregion INITIALIZATION */

  /* region LAYOUT */

  onResize: function () {
    var startPosition = UtilsEngine.getCardsInHandStartPositionForCSS();
    var endPosition = UtilsEngine.getCardsInHandEndPositionForCSS();
    var startX = startPosition.x - CONFIG.HAND_CARD_SIZE * 0.5;
    var endX = endPosition.x;

    this.ui.$turnTimerContainer.css({
      transform: 'translate(' + (startX) / 10.0 + 'rem, ' + (-startPosition.y - CONFIG.HAND_CARD_SIZE * 0.5) / 10.0 + 'rem)',
      width: (endX - startX) / 10.0 + 'rem',
    });
  },

  _emptyContent: function () {
    this._emptyCentralContent();
    this._emptyPlayerContent();
  },
  _emptyCentralContent: function () {
    this.leftRegion.empty();
    this.middleRegion.empty();
    this.rightRegion.empty();
    this.topRegion.empty();
    this.centerRegion.empty();
    this.bottomRegion.empty();
  },
  _emptyPlayerContent: function () {
    this.player1Region.empty();
    this.player2Region.empty();
  },
  _emptyOverlay: function () {
    this.followupRegion.empty();
    this.customOverlayRegion.empty();
  },

  /* endregion LAYOUT */

  /* region MARIONETTE EVENTS */

  onRender: function () {
    this.onResize();
    this.listenTo(NetworkManager.getInstance().spectators, 'add', this.onSpectatorJoined);
    this.listenTo(NetworkManager.getInstance().spectators, 'remove', this.onSpectatorLeft);
  },

  onShow: function () {
    // listen to game events
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.status, this.onGameStatusChanged);
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.turn_time, this.onTurnTimeChanged);

    var scene = Scene.getInstance();
    var gameLayer = scene && scene.getGameLayer();
    if (gameLayer != null) {
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_active_game, this.onShowActiveGame);
      this.listenTo(gameLayer.getEventBus(), EVENTS.before_show_game_over, this.onBeforeShowGameOver);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_game_over, this.onShowGameOver);
      this.listenTo(gameLayer.getEventBus(), EVENTS.show_end_turn, this.onShowEndTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.after_show_start_turn, this.onAfterShowStartTurn);
      this.listenTo(gameLayer.getEventBus(), EVENTS.after_show_step, this.onAfterShowStep);
      this.listenTo(gameLayer.getEventBus(), EVENTS.followup_card_start, this.onGameFollowupCardStart);
      this.listenTo(gameLayer.getEventBus(), EVENTS.followup_card_stop, this.onGameFollowupCardStop);
      this.listenTo(gameLayer.getEventBus(), EVENTS.inspect_card_start, this.onInspectCardStart);
      this.listenTo(gameLayer.getEventBus(), EVENTS.inspect_card_stop, this.onInspectCardStop);
    }

    // listen to global events
    this.listenTo(EventBus.getInstance(), EVENTS.resize, this.onResize);

    this.showNextStepInGameSetup();

    this.onResize();
  },

  onDestroy: function () {
    this._clearInspectCardHideProfilesTimeout();
    this._stopReminderTimeouts();
    this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);
  },

  /* endregion MARIONETTE EVENTS */

  /* region EVENT LISTENERS */

  onGameStatusChanged: function (event) {
    // defer so the current call stack can complete
    // this allows promises to resolve before we check statuses
    _.defer(function () {
      // when mulligan is done and we need to go to the next step in game setup
      if (event && event.from == SDK.GameStatus.new && event.to == SDK.GameStatus.active) {
        var scene = Scene.getInstance();
        var gameLayer = scene && scene.getGameLayer();
        if (gameLayer != null) {
          // if still choosing starting hand, skip
          if (gameLayer.getStatus() <= GameLayer.STATUS.CHOOSE_HAND
            && gameLayer.getStatus() !== GameLayer.STATUS.TRANSITIONING_TO_DRAW_HAND) {
            this.showNextStepInGameSetup();
          } else {
            // wait until engine is at least showing starting hand
            gameLayer.whenStatus(GameLayer.STATUS.STARTING_HAND).then(function () {
              this.showNextStepInGameSetup();
            }.bind(this));
          }
        }
      }
    }.bind(this));
  },

  onGameFollowupCardStart: function (event) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      var followupCard = event.card;
      // fade content out temporarily
      Animations.fadeOut.call(this.ui.$content, 0.0);
      var utilityView = NavigationManager.getInstance().getUtilityView();
      if (utilityView != null) {
        Animations.fadeOut.call(utilityView, 0.0);
      }

      // show
      var gameFollowupItemView = new GameFollowupItemView({ followupCard: followupCard, model: new Backbone.Model() });
      this.followupRegion.show(gameFollowupItemView);
    }
  },

  onGameFollowupCardStop: function (event) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      // remove
      this.followupRegion.empty();

      // restore faded regions
      Animations.fadeIn.call(this.ui.$content);
      var utilityView = NavigationManager.getInstance().getUtilityView();
      if (utilityView != null) {
        Animations.fadeIn.call(utilityView);
      }
    }
  },

  onShowActiveGame: function () {
    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer != null) {
      // show bloodborn spell tip if user has never seen it
      if (!NewPlayerManager.getInstance().getHasSeenBloodbornSpellInfo()) {
        var myPlayerLayer = gameLayer.getMyPlayerLayer();
        var mySignatureCardNode = myPlayerLayer.getSignatureCardNode();
        if (!mySignatureCardNode.getIsDisabled()) {
          // flag as having seen tip
          NewPlayerManager.getInstance().setHasSeenBloodbornSpellInfo();

          // assemble text
          var owner = gameLayer.getMyPlayer().getSdkPlayer();
          var cooldown = SDK.GameSession.getInstance().getNumberOfPlayerTurnsUntilPlayerActivatesSignatureCard(owner, true);
          var text = i18next.t('new_player_experience.bloodborn_message', { count: cooldown });

          // show instruction
          var direction = owner.getPlayerId() === SDK.GameSession.getInstance().getPlayer2Id() ? InstructionNode.DIRECTION_RIGHT : InstructionNode.DIRECTION_LEFT;
          gameLayer.showInstructionForSdkNode(mySignatureCardNode, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, direction);
        }
      }
    }
  },

  onBeforeShowGameOver: function (event) {
    this._stopReminderTimeouts();

    if (!Scene.getInstance().getGameLayer().getIsActive()
      && !Scene.getInstance().getGameLayer().getIsTransitioningToActive()) {
      this._emptyCentralContent();
      this._emptyOverlay();
    } else if (SDK.GameSession.getInstance().isSinglePlayer() && !this._aiHasShownGG) {
      // ai should send player gg as soon as game session is over
      this._aiHasShownGG = true;
      this.showAIEmote(SDK.CosmeticsLookup.Emote.TextGG);
    }
  },

  onShowGameOver: function (event) {
    this._emptyContent();
    this._emptyOverlay();
  },

  onShowEndTurn: function () {
    this._stopReminderTimeouts();
    this.hideTurnTimerBar();
  },

  _stopReminderTimeouts: function () {
    if (this._remindSignatureCardTimeoutId != null) {
      clearTimeout(this._remindSignatureCardTimeoutId);
      this._remindSignatureCardTimeoutId = null;
    }
    if (this._remindReplaceCardTimeoutId != null) {
      clearTimeout(this._remindReplaceCardTimeoutId);
      this._remindReplaceCardTimeoutId = null;
    }
  },

  onAfterShowStartTurn: function () {
    if (CONFIG.razerChromaEnabled) {
      if (Scene.getInstance().getGameLayer().getIsMyTurn()) {
        Chroma.flashActionThrottled(CONFIG.razerChromaIdleColor, 50, 2)
          .then(() => {
            Chroma.setAll(CONFIG.razerChromaIdleColor);
          });
      } else {
        // enemy color just white, we might want to make this dynamic based on enemy faction
        const color = new Chroma.Color('FFFFFF');
        Chroma.flashActionThrottled(color, 50, 2)
          .then(() => {
            Chroma.setAll(color);
          });
      }
    }
    if (CONFIG.showInGameTips
      && !SDK.GameSession.getInstance().getIsSpectateMode()
      && !SDK.GameSession.getInstance().isChallenge()
      && Scene.getInstance().getGameLayer().getIsMyTurn()) {
      // increment reminder counters
      var gameLayer = Scene.getInstance().getGameLayer();
      if (gameLayer != null) {
        var myPlayer = gameLayer.getMyPlayer();
        var sdkPlayer = myPlayer.getSdkPlayer();
        if (sdkPlayer.getCurrentSignatureCard() != null && sdkPlayer.getIsSignatureCardActive()) {
          this._numTurnsSinceSignatureCardUsed++;
        } else {
          this._numTurnsSinceSignatureCardUsed = -1;
        }
        if (sdkPlayer.getDeck().getCanReplaceCardThisTurn()) {
          this._numTurnsSinceReplaceUsed++;
        } else {
          this._numTurnsSinceReplaceUsed = -1;
        }
      }

      var delay = CONFIG.REMINDER_DELAY;

      // show signature card reminder as needed
      if (this._remindSignatureCardTimeoutId == null
        && this._numTurnsSinceSignatureCardUsed >= CONFIG.NUM_TURNS_BEFORE_SHOW_SIGNATURE_CARD_REMINDER
        && ProgressionManager.getInstance().getGameCount() < CONFIG.NUM_GAMES_TO_SHOW_SIGNATURE_CARD_REMINDER) {
        this._remindSignatureCardTimeoutId = setTimeout(function () {
          this._remindSignatureCardTimeoutId = null;
          var gameLayer = Scene.getInstance().getGameLayer();
          if (gameLayer != null && gameLayer.getIsMyTurn()) {
            var myPlayerLayer = gameLayer.getMyPlayerLayer();
            var mySignatureCardNode = myPlayerLayer.getSignatureCardNode();
            var text = 'Remember, your [Bloodbound Spell] is very powerful.';
            var direction = gameLayer.getMyPlayerId() === SDK.GameSession.getInstance().getPlayer2Id() ? InstructionNode.DIRECTION_RIGHT : InstructionNode.DIRECTION_LEFT;
            gameLayer.showInstructionForSdkNode(mySignatureCardNode, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, direction);
          }
        }.bind(this), delay * 1000.0);

        // delay in case we're also showing replace reminder
        delay += CONFIG.INSTRUCTIONAL_LONG_DURATION;
      }

      // show replace reminder as needed
      if (this._remindReplaceCardTimeoutId == null
        && this._numTurnsSinceReplaceUsed >= CONFIG.NUM_TURNS_BEFORE_SHOW_REPLACE_REMINDER
        && ProgressionManager.getInstance().getGameCount() < CONFIG.NUM_GAMES_TO_SHOW_REPLACE_REMINDER) {
        this._remindReplaceCardTimeoutId = setTimeout(function () {
          this._remindReplaceCardTimeoutId = null;
          var gameLayer = Scene.getInstance().getGameLayer();
          if (gameLayer != null && gameLayer.getIsMyTurn()) {
            var bottomDeckLayer = gameLayer.getBottomDeckLayer();
            var replaceNode = bottomDeckLayer.getReplaceNode();
            var replacePosition = replaceNode.getPosition();
            replacePosition.y += replaceNode.height * 0.55;
            var text = 'Remember, you can [Replace] cards from your action bar.';
            gameLayer.showInstructionAtPosition(replacePosition, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, InstructionNode.DIRECTION_DOWN);
          }
        }.bind(this), delay * 1000.0);
      }
    }
  },

  onAfterShowStep: function (e) {
    var step = e && e.step;
    if (step != null) {
      var action = step.getAction();

      // reset reminder counters on my actions
      if (action.getOwnerId() === SDK.GameSession.getInstance().getMyPlayerId()) {
        if (action instanceof SDK.PlaySignatureCardAction) {
          this._numTurnsSinceSignatureCardUsed = -1;
        } else if (action instanceof SDK.ReplaceCardFromHandAction) {
          this._numTurnsSinceReplaceUsed = -1;
        }
      }

      // show battle pet tip once per game if user has never seen it
      var hasNotSeenBattlePetInfo = !NewPlayerManager.getInstance().getHasSeenBattlePetInfo();
      var hasNotSeenBattlePetReminder = !NewPlayerManager.getInstance().getHasSeenBattlePetReminder();
      var needsBattlePetTip = !this._hasShownBattlePetTip && (hasNotSeenBattlePetInfo || hasNotSeenBattlePetReminder);
      if (needsBattlePetTip && action instanceof SDK.ApplyCardToBoardAction && action.getCard().getRaceId() === SDK.Races.BattlePet) {
        var gameLayer = Scene.getInstance().getGameLayer();
        if (gameLayer != null) {
          var battlePetNode = gameLayer.getNodeForSdkCard(action.getCard());
          if (battlePetNode != null) {
            // flag as having seen tip
            this._hasShownBattlePetTip = true;
            if (hasNotSeenBattlePetInfo) {
              NewPlayerManager.getInstance().setHasSeenBattlePetInfo();
            } else if (hasNotSeenBattlePetReminder) {
              NewPlayerManager.getInstance().setHasSeenBattlePetReminder();
            }

            // assemble text
            var text = 'This is a [Battle Pet]. At the start of' + (battlePetNode.getSdkCard().isOwnedByMyPlayer() ? ' your' : ' its owner\'s') + ' turn, it will act on its own!';

            // show instruction
            var direction;
            var position = battlePetNode.getPosition();
            var winRect = UtilsEngine.getGSIWinRect();
            if (position.x > winRect.x + winRect.width * 0.5) {
              direction = InstructionNode.DIRECTION_RIGHT;
            } else {
              direction = InstructionNode.DIRECTION_LEFT;
            }
            gameLayer.showInstructionForSdkNode(battlePetNode, text, null, CONFIG.INSTRUCTIONAL_LONG_DURATION, false, direction);
          }
        }
      } else if (!NewPlayerManager.getInstance().getHasSeenBattlePetActionNotification() && action.getIsAutomatic() && action.getSource() != null && action.getSource().getRaceId() === SDK.Races.BattlePet) {
        var gameLayer = Scene.getInstance().getGameLayer();
        if (gameLayer != null) {
          var battlePetNode = gameLayer.getNodeForSdkCard(action.getSource());
          if (battlePetNode != null) {
            // flag as having seen tip
            NewPlayerManager.getInstance().setHasSeenBattlePetActionNotification();

            // assemble text
            var text = 'Remember, a [Battle Pet] will act on its own!';

            // show instruction
            var direction;
            var position = battlePetNode.getPosition();
            var winRect = UtilsEngine.getGSIWinRect();
            if (position.x > winRect.x + winRect.width * 0.5 || action.getSourcePosition().x < action.getTargetPosition().x) {
              direction = InstructionNode.DIRECTION_RIGHT;
            } else {
              direction = InstructionNode.DIRECTION_LEFT;
            }
            gameLayer.showInstructionForSdkNode(battlePetNode, text, null, CONFIG.INSTRUCTIONAL_SHORT_DURATION, false, direction);
          }
        }
      }
    }
  },

  onTurnTimeChanged: function (event) {
    this.updateTurnTimerBar(event && Math.ceil(event.time));
  },

  onInspectCardStart: function () {
    this._clearInspectCardHideProfilesTimeout();
    if (!this._hidingPlayerProfilePreviews) {
      this._hidingPlayerProfilePreviews = true;

      if (this.player1Region.currentView instanceof GamePlayerProfilePreview && this.player1Region.currentView.$el instanceof $) {
        Animations.fadeOut.call(this.player1Region.currentView, 100);
      }

      if (this.player2Region.currentView instanceof GamePlayerProfilePreview && this.player2Region.currentView.$el instanceof $) {
        Animations.fadeOut.call(this.player2Region.currentView, 100);
      }
    }
  },

  onInspectCardStop: function () {
    if (this._hidingPlayerProfilePreviews) {
      this._clearInspectCardHideProfilesTimeout();

      this._clearInspectCardHideProfilesTimeoutId = setTimeout(function () {
        this._hidingPlayerProfilePreviews = false;

        if (this.player1Region.currentView instanceof GamePlayerProfilePreview && this.player1Region.currentView.$el instanceof $) {
          Animations.fadeIn.call(this.player1Region.currentView, 100);
        }

        if (this.player2Region.currentView instanceof GamePlayerProfilePreview && this.player2Region.currentView.$el instanceof $) {
          Animations.fadeIn.call(this.player2Region.currentView, 100);
        }
      }.bind(this), 500);
    }
  },

  _clearInspectCardHideProfilesTimeout: function () {
    if (this._clearInspectCardHideProfilesTimeoutId != null) {
      clearTimeout(this._clearInspectCardHideProfilesTimeoutId);
      this._clearInspectCardHideProfilesTimeoutId = null;
    }
  },

  /* endregion EVENT LISTENERS */

  /* region STATES */

  showNextStepInGameSetup: function () {
    Logger.module('UI').log('GameLayout.showNextStepInGameSetup');
    if (SDK.GameSession.getInstance().isActive()) {
      return this.showActiveGame();
    } else {
      // show bottom bar for spectate mode immediately
      if (SDK.GameSession.getInstance().getIsSpectateMode() && !(this.bottomRegion.currentView instanceof GameBottomBarCompositeView)) {
        this.bottomRegion.show(new GameBottomBarCompositeView());
      }

      // highlight generals
      Scene.getInstance().getGameLayer().highlightGenerals();

      // when in sandbox mode and my player has starting hand but opponent does not
      if (SDK.GameSession.getInstance().isSandbox()) {
        var myPlayer = SDK.GameSession.current().getMyPlayer();
        var opponentPlayer = SDK.GameSession.current().getOpponentPlayer();
        if (myPlayer.getHasStartingHand() && !opponentPlayer.getHasStartingHand()) {
          // reset game layer status to new
          Scene.getInstance().getGameLayer().resetStatus();

          // swap test user id so we can mulligan for other player
          if (myPlayer.getPlayerId() !== opponentPlayer.getPlayerId()) {
            SDK.GameSession.getInstance().setUserId(opponentPlayer.getPlayerId());
          } else {
            SDK.GameSession.getInstance().setUserId(myPlayer.getPlayerId());
          }
        }
      }

      // show starting or choose hand
      if (SDK.GameSession.current().getMyPlayer().getHasStartingHand()) {
        return this.showStartingHand();
      } else {
        return this.showChooseHand();
      }
    }
  },

  showChooseHand: function () {
    Logger.module('UI').log('GameLayout.showChooseHand');
    var allPromises = [];

    // always show cards for choose hand
    allPromises.push(Scene.getInstance().getGameLayer().showChooseHand());

    if (!SDK.GameSession.current().getIsSpectateMode()) {
      // store choose hand UI
      var chooseHandItemView = new GameChooseHandItemView({ model: new Backbone.Model({ maxMulliganCount: CONFIG.STARTING_HAND_REPLACE_COUNT }) });
      this.chooseHandView = chooseHandItemView;

      // listen for submit
      this.chooseHandView.on('confirm', this.showSubmitChosenHand, this);

      // show choose hand UI
      allPromises.push(this.middleRegion.show(chooseHandItemView));
    } else {
      // spectators do not show choose hand UI
      this.chooseHandView = null;

      // set status on game layer to assume hand was submitted
      Scene.getInstance().getGameLayer().showSubmitChosenHand();
    }

    // wait to hear from the server about new cards
    this.listenTo(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

    var gameSession = SDK.GameSession.getInstance();
    if (SDK.GameType.isNetworkGameType(gameSession.getGameType())) {
      // my player
      var myPlayerId = gameSession.getMyPlayerId();
      var myRibbonCollection;
      if (SDK.GameSession.getInstance().isGauntlet() || SDK.GameSession.getInstance().isCasual()) {
        // never show ribbons information in gauntlet and casual
        myRibbonCollection = new Backbone.Collection();
      } else {
        myRibbonCollection = new DuelystFirebase.Collection(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('user-ribbons').child(myPlayerId),
        });
      }
      var myProfile;
      if (ProfileManager.getInstance().get('id') === myPlayerId) {
        myProfile = new Backbone.Model(ProfileManager.getInstance().profile.get('presence'));
      } else {
        myProfile = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('users').child(myPlayerId).child('presence'),
        });
      }
      if (gameSession.getPlayer2Id() === myPlayerId) {
        allPromises.push(this.player2Region.show(new GamePlayerProfilePreview({ model: myProfile, collection: myRibbonCollection })));
      } else {
        allPromises.push(this.player1Region.show(new GamePlayerProfilePreview({ model: myProfile, collection: myRibbonCollection })));
      }

      // opponent player
      if (SDK.GameType.isMultiplayerGameType(gameSession.getGameType())) {
        var opponentPlayerId = gameSession.getOpponentPlayerId();
        var opponentRibbonCollection;
        if (SDK.GameSession.getInstance().isGauntlet() || SDK.GameSession.getInstance().isCasual()) {
          // never show ribbons information in gauntlet and casual
          opponentRibbonCollection = new Backbone.Collection();
        } else {
          opponentRibbonCollection = new DuelystFirebase.Collection(null, {
            firebase: new Firebase(process.env.FIREBASE_URL).child('user-ribbons').child(opponentPlayerId),
          });
        }
        var opponentProfile = new DuelystFirebase.Model(null, {
          firebase: new Firebase(process.env.FIREBASE_URL).child('users').child(opponentPlayerId).child('presence'),
        });
        if (gameSession.getPlayer2Id() === opponentPlayerId) {
          allPromises.push(this.player2Region.show(new GamePlayerProfilePreview({ model: opponentProfile, collection: opponentRibbonCollection })));
        } else {
          allPromises.push(this.player1Region.show(new GamePlayerProfilePreview({ model: opponentProfile, collection: opponentRibbonCollection })));
        }
      }
    }

    return Promise.all(allPromises);
  },

  showSubmitChosenHand: function () {
    // create an action to set the starting hand based on selected mulligan cards
    var mulliganIndices = Scene.getInstance().getGameLayer().getMulliganIndices();
    var drawStartingHandAction = SDK.GameSession.getInstance().getMyPlayer().actionDrawStartingHand(mulliganIndices);

    // submit chosen hand to server to get new cards
    var submitted = SDK.GameSession.getInstance().submitExplicitAction(drawStartingHandAction);

    // update UI if submitted
    Logger.module('UI').log('GameLayout.showSubmitChosenHand ->', mulliganIndices, 'submitted?', submitted);
    if (submitted) {
      // stop listening for submit
      if (this.chooseHandView != null) {
        this.chooseHandView.off('confirm', this.showSubmitChosenHand, this);
        this.chooseHandView = null;
      }

      // remove choose hand view
      this.middleRegion.empty();

      // show submit chosen hand in engine
      Scene.getInstance().getGameLayer().showSubmitChosenHand();
    }
  },

  onDrawStartingHand: function (event) {
    var action = event.action;

    if (action instanceof SDK.DrawStartingHandAction && action.ownerId === SDK.GameSession.getInstance().getMyPlayerId()) {
      Logger.module('UI').log('GameLayout.onDrawStartingHand', action.mulliganIndices);
      this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

      // show next step once we've transitioned to starting hand
      Scene.getInstance().getGameLayer().showDrawStartingHand(action.mulliganIndices).then(function () {
        this.showNextStepInGameSetup();
      }.bind(this));

      // if (SDK.GameType.isMultiplayerGameType(SDK.GameSession.getInstance().getGameType())) {
      //  var mulliganStartMoment = moment(SDK.GameSession.getInstance().createdAt);
      //  var mulliganEndMoment = moment();
      //  var mulliganDurationMoment = moment.duration(mulliganEndMoment.diff(mulliganStartMoment));
      //  var playerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(SDK.GameSession.getInstance().getMyPlayerId());
      //  var factionName = SDK.FactionFactory.factionForIdentifier(playerSetupData.factionId).name;
      //  Analytics.track("Mulligan Duration", {
      //    category:"Game",
      //    label:factionName,
      //    value:mulliganDurationMoment.asSeconds(),
      //    nonInteraction:1
      //  },Analytics.EventPriority.Optional);
      // }
    }
  },

  showStartingHand: function () {
    Logger.module('UI').log('GameLayout.showStartingHand');
    this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

    return Promise.all([
      Scene.getInstance().getGameLayer().showStartingHand(),
      this.middleRegion.show(new GameStartingHandItemView({ model: ProfileManager.getInstance().profile })),
    ]);
  },

  showActiveGame: function () {
    Logger.module('UI').log('GameLayout.showActiveGame');
    this.stopListening(SDK.GameSession.getInstance().getEventBus(), EVENTS.action, this.onDrawStartingHand);

    this.middleRegion.empty();

    var showActiveGamePromise;
    var gameLayer = Scene.getInstance().getGameLayer();
    if (gameLayer) {
      // when in sandbox mode, swap test user id back to profile user id
      if (SDK.GameSession.getInstance().isSandbox()) {
        gameLayer.whenIsStatusForActiveGame().then(function () {
          SDK.GameSession.getInstance().setUserId(SDK.GameSession.getInstance().getPlayer1().playerId);
        }.bind(this));
      }

      // show the active game
      gameLayer.showActiveGame();
      showActiveGamePromise = gameLayer.whenStatus(GameLayer.STATUS.ACTIVE).then(function () {
        // when the bottom deck (hand) is active, show the rest of the UI
        var uiPromises = [
          this.player1Region.show(new GamePlayer1Layout({ model: new Backbone.Model(), collection: new Backbone.Collection() })),
          this.player2Region.show(new GamePlayer2Layout({ model: new Backbone.Model(), collection: new Backbone.Collection() })),
          this.topRegion.show(new GameTopBarCompositeView()),
        ];
        if (!SDK.GameSession.getInstance().getIsSpectateMode() && !(this.bottomRegion.currentView instanceof GameBottomBarCompositeView)) {
          uiPromises.push(this.bottomRegion.show(new GameBottomBarCompositeView()));
        }
        return Promise.all(uiPromises);
      }.bind(this)).then(function () {
        // ai should send player glhf on show
        if (SDK.GameSession.getInstance().isActive() && SDK.GameSession.getInstance().isSinglePlayer() && !this._aiHasShownGLHF && !SDK.GameSession.getInstance().getIsSpectateMode()) {
          this._aiHasShownGLHF = true;
          this.showAIEmote(SDK.CosmeticsLookup.Emote.TextGLHF);
        }
      }.bind(this));
    } else {
      showActiveGamePromise = Promise.resolve();
    }

    return showActiveGamePromise;
  },

  showAIEmote: function (emoteId) {
    var aiPlayerLayout;
    if (this.player1Region.currentView && this.player1Region.currentView.model.get('playerId') === CONFIG.AI_PLAYER_ID) {
      aiPlayerLayout = this.player1Region.currentView;
    } else if (this.player2Region.currentView && this.player2Region.currentView.model.get('playerId') === CONFIG.AI_PLAYER_ID) {
      aiPlayerLayout = this.player2Region.currentView;
    }
    if (aiPlayerLayout != null) {
      aiPlayerLayout.popoverView.showEmote(emoteId);
    }
  },

  /* endregion STATES */

  /* region TURN TIMER */

  updateTurnTimerBar: function (time) {
    const isOpponentTurn = SDK.GameSession.getInstance().getCurrentPlayer() !== SDK.GameSession.getInstance().getMyPlayer();
    time = Math.ceil((time || 0) - CONFIG.TURN_DURATION_LATENCY_BUFFER);
    if (time <= CONFIG.TURN_TIME_SHOW) {
      this.ui.$turnTimerContainer.addClass('active');
      if (isOpponentTurn) {
        this.ui.$turnTimerBar.addClass('opponent');
      } else {
        this.ui.$turnTimerBar.removeClass('opponent');
      }

      var timePct = (time - 1.0) / CONFIG.TURN_TIME_SHOW;
      if (timePct < 0) {
        this.ui.$turnTimerBar.css('transform', 'translateX(100%) scaleX(0.0)');
      } else {
        this.ui.$turnTimerBar.css('transform', 'translateX(100%) scaleX(-' + timePct + ')');
        audio_engine.current().play_effect(RSX.sfx_ui_turn_time.audio, false);
        if (CONFIG.razerChromaEnabled) {
          // see game.scss .timer-bar for color definitions
          if (isOpponentTurn) {
            Chroma.flashTurnTimer(timePct, new Chroma.Color('E22A00'));
          } else {
            Chroma.flashTurnTimer(timePct, new Chroma.Color('00AAFD'));
          }
        }
      }
    } else {
      this.hideTurnTimerBar();
    }
  },

  hideTurnTimerBar: function () {
    if (this.ui.$turnTimerContainer.hasClass('active')) {
      this.ui.$turnTimerContainer.removeClass('active');
      this.ui.$turnTimerBar.css('transform', 'translateX(100%) scaleX(-1.0)');
    }
  },

  /* endregion TURN TIMER */

  onSpectatorJoined: function (spectatorModel) {
    if (spectatorModel.get('playerId') === ProfileManager.getInstance().get('id')) {
      this.showSpectatorNotification(spectatorModel.get('username') + ' is now spectating');
    }
  },

  onSpectatorLeft: function (spectatorModel) {
    if (spectatorModel.get('playerId') === ProfileManager.getInstance().get('id')) {
      this.showSpectatorNotification(spectatorModel.get('username') + ' has left');
    }
  },

  showSpectatorNotification: function (message) {
    this.ui.spectator_notification.show().find('.message').text(message);
    this.ui.spectator_notification.get(0).animate([
      { opacity: 0.0, transform: 'translateY(-2rem)' },
      { opacity: 1.0, transform: 'translateY(0rem)' },
    ], {
      duration: 500,
      delay: 0.0,
      fill: 'forwards',
    });
    clearTimeout(this._spectatorNotificationTimeout);
    this._spectatorNotificationTimeout = setTimeout(function () {
      var animation = this.ui.spectator_notification.get(0).animate([
        { opacity: 1.0, transform: 'translateY(0rem)' },
        { opacity: 0.0, transform: 'translateY(2rem)' },
      ], {
        duration: 300,
        delay: 0.0,
        fill: 'forwards',
      });

      animation.onfinish = this.showSpectatorStatus.bind(this);
    }.bind(this), 3000);
  },

  showSpectatorStatus: function () {
    if (NetworkManager.getInstance().spectators.length > 0) {
      this.ui.spectator_notification.find('.message').html('<i class="fa fa-eye"></i> ' + NetworkManager.getInstance().spectators.length).fadeIn();
      this.ui.spectator_notification.get(0).animate([
        { opacity: 0.0, transform: 'translateY(-2rem)' },
        { opacity: 1.0, transform: 'translateY(0rem)' },
      ], {
        duration: 100,
        delay: 0.0,
        fill: 'forwards',
      });
    }
  },

});

module.exports = GameLayout;
