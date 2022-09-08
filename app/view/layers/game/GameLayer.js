// pragma PKGS: game
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const DATA = require('app/data');
const Promise = require('bluebird');
const _ = require('underscore');
const UtilsJavascript = require('app/common/utils/utils_javascript');
const UtilsEngine = require('app/common/utils/utils_engine');
const UtilsPosition = require('app/common/utils/utils_position');
const NodeFactory = require('app/view/helpers/NodeFactory');
const TweenTypes = require('app/view/actions/TweenTypes');
const Player = require('app/view/Player');
const BaseLayer = require('app/view/layers/BaseLayer');
const ShadowCastingLayer = require('app/view/layers/ShadowCastingLayer');
const FXCompositeLayer = require('app/view/layers/FXCompositeLayer');
const BaseSprite = require('app/view/nodes/BaseSprite');
const GlowSprite = require('app/view/nodes/GlowSprite');
const FXSprite = require('app/view/nodes/fx/FXSprite');
const FXDecalSprite = require('app/view/nodes/fx/FXDecalSprite');
const FXShockwaveSprite = require('app/view/nodes/fx/FXShockwaveSprite');
const FXFlockSprite = require('app/view/nodes/fx/FXFlockSprite');
const FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
const Light = require('app/view/nodes/fx/Light');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const SdkNode = require('app/view/nodes/cards/SdkNode');
const EntityNode = require('app/view/nodes/cards/EntityNode');
const EntityNodeVisualStateTag = require('app/view/nodes/visualStateTags/EntityNodeVisualStateTag');
const UnitNode = require('app/view/nodes/cards/UnitNode');
const BottomDeckCardNode = require('app/view/nodes/cards/BottomDeckCardNode');
const TileNode = require('app/view/nodes/cards/TileNode');
const TooltipNode = require('app/view/nodes/cards/TooltipNode');
const Shake = require('app/view/actions/Shake');
const RadialBlurTo = require('app/view/actions/RadialBlurTo');
const CardNode = require('app/view/nodes/cards/CardNode');
const ArtifactNode = require('app/view/nodes/cards/ArtifactNode');
const SdkStepInterface = require('app/view/helpers/SdkStepInterface');
const SdkActionInterface = require('app/view/helpers/SdkActionInterface');
const ModifierAction = require('app/view/helpers/modifierAction');
const ModifierActivatedAction = require('app/view/helpers/modifierActivatedAction');
const ModifierDeactivatedAction = require('app/view/helpers/modifierDeactivatedAction');
const ModifierTriggeredAction = require('app/view/helpers/modifierTriggeredAction');
const SpeechNode = require('app/view/nodes/cards/SpeechNode');
const InstructionNode = require('app/view/nodes/cards/InstructionNode');
const GeneralSpeechNode = require('app/view/nodes/cards/GeneralSpeechNode');
const BattleLogNode = require('app/view/nodes/cards/BattleLogNode');
const SignatureCardNode = require('app/view/nodes/cards/SignatureCardNode');
const PrismaticPlayCardNode = require('app/view/nodes/fx/PrismaticPlayCardNode');
const InstructionalArrowSprite = require('app/view/nodes/map/InstructionalArrowSprite');
const EmphasisTriggeredSprite = require('app/view/nodes/emphasis/EmphasisTriggeredSprite');
const audio_engine = require('app/audio/audio_engine');
const PackageManager = require('app/ui/managers/package_manager');
const NavigationManager = require('app/ui/managers/navigation_manager');
const i18next = require('i18next');
const Chroma = require('app/common/chroma');
const BattleLog = require('./BattleLog');
const BattleMap = require('./BattleMap');
const Player2Layer = require('./Player2Layer');
const Player1Layer = require('./Player1Layer');
const BottomDeckLayer = require('./BottomDeckLayer');
const TileLayer = require('./TileLayer');

// custom UI modules
// var TimeMaelstromUIModule = require('app/view/ui_modules/TimeMaelstromUIModule');

/**
 * GameLayer - controller for all visuals in a game.
 */
var GameLayer = FXCompositeLayer.extend({

  _actionInterfacesByIndex: null,
  _afterShowStartTurnPromise: null,
  _afterShowStartTurnPromiseResolve: null,
  backgroundLayer: null,
  _battleMap: null,
  _battleLog: null,
  _beginShowStartTurnPromise: null,
  _beginShowStartTurnPromiseResolve: null,
  bottomDeckLayer: null,
  _burnCardNode: null,
  _currentSdkActionInterface: null,
  _currentActionSequence: null,
  _currentActionSetupForShowSequence: null,
  _currentActionSourceSdkCard: null,
  _currentActionSourceNode: null,
  _currentActionTargetSdkCard: null,
  _currentActionTargetNode: null,
  _currentSequenceRootSdkActionInterface: null,
  _currentSequenceMaxDelay: 0,
  _currentSequenceMaxTargetReactionDelay: 0,
  _currentSequenceNeedsAutoFX: false,
  _currentSdkStepInterface: null,
  _currentStepTargetingMap: null,
  _currentStepAutoFXMap: null,
  _currentStepRootActionInterface: null,
  _customUIModules: null,
  _eventBus: null,
  _entityNodes: null,
  _handlingMouseMove: false,
  _inspectCardNode: null,
  _lastCardWithAutomaticAction: null,
  _lastMouseOverEntityNodesForAction: null,
  _lastPlayedCardBoardPositions: null,
  _lastSelectedEntityNodeForAction: null,
  _lastShownSdkStateRecordingAction: null,
  middlegroundLayer: null,
  _mouseState: '',
  _nextActionIndex: 0,
  _opponent: null,
  _particleContainer: null,
  _playCardNode: null,
  _player: null,
  _playerSelectionLocked: false,
  _playerSelectionLockedId: -1,
  _playerSelectionLockedRequests: null,
  _referencedCardNode: null,
  _showActionCardSequence: null,
  _showActionCardSequenceCompletedCallback: null,
  _showingEndTurn: false,
  _showingStartTurn: false,
  _showingStartTurnWithAutomaticActions: false,
  _showingStatsForSdkStateRecordingAction: null,
  _showingStatsForSdkStateRecordingActionEventType: null,
  _showStartTurnPromise: null,
  _skippableActionsByIndex: null,
  _spellNodes: null,
  _startTurnAfterAutomaticNotificationAction: null,
  _startTurnNotificationAction: null,
  _status: null,
  _statusPromises: null,
  _stepInterfacesByIndex: null,
  _stepQueue: null,
  _speechNodes: null,
  tileLayer: null,
  _tileNodes: null,
  _tooltipNode: null,
  _ui_z_order_low_priority_support_nodes: 1,
  _ui_z_order_medium_priority_support_nodes: 2,
  _ui_z_order_high_priority_support_nodes: 3,
  _ui_z_order_indicators: 4,
  _ui_z_order_battle_log: 5,
  _ui_z_order_speech_nodes: 6,
  _ui_z_order_notification_nodes: 7,
  _ui_z_order_card_nodes: 8,
  _ui_z_order_instructional_nodes: 9,
  _ui_z_order_tooltip_nodes: 10,
  _unitNodes: null,
  _waitingForStatus: null,
  _waitingToShowStep: null,

  /* region INITIALIZE */

  ctor() {
    // initialize properties that may be required in init

    // events
    this._eventBus = EventBus.create();
    this._waitingForStatus = {};

    // step/action queue
    this._actionInterfacesByIndex = {};
    this._stepInterfacesByIndex = {};
    this._stepQueue = [];
    this._skippableActionsByIndex = {};

    // nodes
    this._entityNodes = [];
    this._unitNodes = [];
    this._tileNodes = [];
    this._speechNodes = {};
    this._burnCardNode = CardNode.create();
    this._inspectCardNode = CardNode.create();
    this._referencedCardNode = CardNode.create(),
    this._playCardNode = CardNode.create();
    this._particleContainer = [];

    // ui
    this._lastMouseOverEntityNodesForAction = [];
    this._lastPlayedCardBoardPositions = [];
    this._customUIModules = [];
    this._notificationYourTurnSprite = new BaseSprite(RSX.notification_your_turn.img);
    this._notificationYourTurnSprite.setVisible(false);
    var label = new cc.LabelTTF(i18next.t('game_ui.label_your_turn'), RSX.font_bold.name, 66, cc.size(1280, 280), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
    label.enableStroke(cc.color(0, 0, 0, 0), 2);
    label.enableShadow(3, 0.5, 0.0);
    this._notificationYourTurnSprite.addChild(label, 1);
    label.setAnchorPoint(cc.p(0.0, -0.05));
    this._notificationEnemyTurnSprite = new BaseSprite(RSX.notification_enemy_turn.img);
    this._notificationEnemyTurnSprite.setVisible(false);
    var label = new cc.LabelTTF(i18next.t('game_ui.label_enemy_turn'), RSX.font_bold.name, 66, cc.size(1280, 280), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
    label.enableStroke(cc.color(0, 0, 0, 0), 2);
    label.enableShadow(3, 0.5, 0.0);
    this._notificationEnemyTurnSprite.addChild(label, 1);
    label.setAnchorPoint(cc.p(0.0, -0.05));
    this._notificationGoSprite = new BaseSprite(RSX.notification_go.img);
    this._notificationGoSprite.setVisible(false);
    var label = new cc.LabelTTF(i18next.t('game_ui.label_automatic_moves'), RSX.font_bold.name, 66, cc.size(1280, 280), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
    label.enableStroke(cc.color(0, 0, 0, 0), 2);
    label.enableShadow(3, 0.5, 0.0);
    this._notificationGoSprite.addChild(label, 1);
    label.setAnchorPoint(cc.p(0.0, -0.05));
    this._playerSelectionLockedRequests = [];

    // players
    this._player = Player.create();
    this._opponent = Player.create();
    this._altPlayer = Player.create();

    // layers
    this._battleLog = BattleLog.create();
    this._battleLog.setVisible(false);
    this._battleMap = BattleMap.create(this);
    this.backgroundLayer = BaseLayer.create();
    this.tileLayer = TileLayer.create();
    this.middlegroundLayer = ShadowCastingLayer.create();
    this.foregroundLayer = BaseLayer.create();
    this.bottomDeckLayer = BottomDeckLayer.create();
    this.player1Layer = Player1Layer.create(SDK.GameSession.getInstance().getPlayer1Id());
    this.player2Layer = Player2Layer.create(SDK.GameSession.getInstance().getPlayer2Id());
    this.uiLayer = BaseLayer.create();

    // add ui elements to ui layer
    this.uiLayer.addChild(this._battleLog, this._ui_z_order_battle_log);
    this.uiLayer.addChild(this._notificationYourTurnSprite, this._ui_z_order_notification_nodes);
    this.uiLayer.addChild(this._notificationEnemyTurnSprite, this._ui_z_order_notification_nodes);
    this.uiLayer.addChild(this._notificationGoSprite, this._ui_z_order_notification_nodes);
    this.uiLayer.addChild(this._referencedCardNode, this._ui_z_order_card_nodes);
    this.uiLayer.addChild(this._inspectCardNode, this._ui_z_order_card_nodes);
    this.uiLayer.addChild(this._playCardNode, this._ui_z_order_card_nodes);
    this.uiLayer.addChild(this._burnCardNode, this._ui_z_order_card_nodes);

    // bind initial players
    this.bindSdkPlayers();

    // do super ctor
    this._super();

    // add layers
    this.getFXLayer().addChild(this.backgroundLayer, 0);
    this.getFXLayer().addChild(this.tileLayer, 1);
    this.getFXLayer().addChild(this.middlegroundLayer, 2);
    this.getFXLayer().addChild(this.foregroundLayer, 3);
    this.getNoFXLayer().addChild(this.bottomDeckLayer, 0);
    this.getNoFXLayer().addChild(this.player1Layer, 0);
    this.getNoFXLayer().addChild(this.player2Layer, 0);
    this.getNoFXLayer().addChild(this.uiLayer, 1);
  },

  start() {
    FXCompositeLayer.prototype.start.call(this);

    // start and enable this game layer instance
    Logger.module('ENGINE').log('GameLayer.start');

    this._battleMap.whenStatus(BattleMap.STATUS.SETUP).then(() => {
      // cocos node properties
      this.scheduleUpdate();

      // set up custom UI modules
      this._customUIModules = [
        // new TimeMaelstromUIModule()
      ];

      // start all UI modules
      for (let i = 0, il = this._customUIModules.length; i < il; i++) {
        this._customUIModules[i].start();
      }

      this.setStatus(GameLayer.STATUS.NEW);
    });
  },

  terminate() {
    Logger.module('ENGINE').log('GameLayer.terminate');
    // change status
    this.setStatus(GameLayer.STATUS.DISABLED);

    // stop showing steps
    this.resetStepQueue();

    // terminate all actions
    this.terminateAllActions();

    // terminate and cleanup this game layer instance
    this._prepareForTerminate();

    // force all entities to show base state
    for (var i = 0, il = this._entityNodes.length; i < il; i++) {
      this._entityNodes[i].showBaseState();
    }

    // terminate all UI modules
    for (var i = 0, il = this._customUIModules.length; i < il; i++) {
      this._customUIModules[i].terminate();
    }
    this._customUIModules = [];

    // reset players
    this._player.setPlayerId(null);
    this._opponent.setPlayerId(null);
    this._altPlayer.setPlayerId(null);

    // cocos node properties
    this.unscheduleUpdate();

    // terminate layers
    this._battleMap.terminate();
    this.bottomDeckLayer.terminate();
    this._battleLog.terminate();

    // super terminate
    this._super();
  },

  _prepareForTerminate() {
    // disable any active state
    this.resetActiveState();

    // stop showing turns
    this._stopShowingChangeTurn();

    // stop showing tooltip
    this.stopShowingTooltip();

    // reset any playback speed change
    CONFIG.replayActionSpeedModifier = 1.0;

    // destroy ui
    this.bottomDeckLayer.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this.player1Layer.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this.player2Layer.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this._burnCardNode.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this._playCardNode.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this._inspectCardNode.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this._referencedCardNode.destroy(CONFIG.VIEW_TRANSITION_DURATION);
    this._battleLog.destroy(CONFIG.VIEW_TRANSITION_DURATION);
  },

  _startListeningToEvents() {
    this._super();

    // events
    this.getEventBus().on(EVENTS.game_hover_changed, this.onHoverChanged, this);
    this.getEventBus().on(EVENTS.game_selection_changed, this.onSelectionChanged, this);
    this.getEventBus().on(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
    this.getEventBus().on(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);

    // game session events
    const gameSession = SDK.GameSession.getInstance();
    if (gameSession != null) {
      gameSession.getEventBus().on(EVENTS.invalid_action, this.onInvalidAction, this);
      gameSession.getEventBus().on(EVENTS.step, this.onStep, this);
      gameSession.getEventBus().on(EVENTS.rollback_to_snapshot, this.onRollBack, this);
    }

    // pointer events
    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().on(EVENTS.pointer_down, this.onPointerDown, this);
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
      /*
      // cocos method of pointer events (known to be buggy with browser tabs)
      if (cc.sys.isMobile && 'touches' in cc.sys.capabilities) {
        cc.eventManager.addListener({
          event: cc.EventListener.TOUCH_ONE_BY_ONE,
          swallowTouches: true,
          onTouchBegan: function (touch, event) { this.onPointerDown(touch); return true; }.bind(this),
          onTouchMoved: function (touch, event) { this.onPointerMove(touch); return false; }.bind(this),
          onTouchEnded: function (touch, event) { this.onPointerUp(touch); return false; }.bind(this)
        }, this);
      } else if ('mouse' in cc.sys.capabilities) {
        cc.eventManager.addListener({
          event: cc.EventListener.MOUSE,
          onMouseDown: this.onPointerDown.bind(this),
          onMouseMove: this.onPointerMove.bind(this),
          onMouseUp: this.onPointerUp.bind(this)
        }, this);
      }
      */
    }
  },

  _stopListeningToEvents() {
    this._super();

    // events
    this.getEventBus().off(EVENTS.game_hover_changed, this.onHoverChanged, this);
    this.getEventBus().off(EVENTS.game_selection_changed, this.onSelectionChanged, this);
    this.getEventBus().off(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
    this.getEventBus().off(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);

    // game session events
    const gameSession = SDK.GameSession.getInstance();
    if (gameSession != null) {
      gameSession.getEventBus().off(EVENTS.invalid_action, this.onInvalidAction, this);
      gameSession.getEventBus().off(EVENTS.step, this.onStep, this);
      gameSession.getEventBus().off(EVENTS.rollback_to_snapshot, this.onRollBack, this);
    }

    // pointer events
    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().off(EVENTS.pointer_down, this.onPointerDown, this);
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  getEventBus() {
    return this._eventBus;
  },

  getBattleMap() {
    return this._battleMap;
  },

  getBattleLog() {
    return this._battleLog;
  },

  getBottomDeckLayer() {
    return this.bottomDeckLayer;
  },

  getPlayer1Layer() {
    return this.player1Layer;
  },

  getPlayer2Layer() {
    return this.player2Layer;
  },

  getMyPlayerLayer() {
    if (this.getMyPlayer() === this.getPlayer2()) {
      return this.getPlayer2Layer();
    }
    return this.getPlayer1Layer();
  },

  getOpponentPlayerLayer() {
    if (this.getCurrentPlayer() === this.getPlayer2()) {
      return this.getPlayer2Layer();
    }
    return this.getPlayer1Layer();
  },

  getCurrentPlayerLayer() {
    if (this.getCurrentPlayer() === this.getPlayer2()) {
      return this.getPlayer2Layer();
    }
    return this.getPlayer1Layer();
  },

  getPlayerLayerByPlayerId(playerId) {
    if (playerId === SDK.GameSession.getInstance().getPlayer2Id()) {
      return this.getPlayer2Layer();
    }
    return this.getPlayer1Layer();
  },

  getPlayer1ArtifactNodes() {
    return this.player1Layer.getArtifactNodes();
  },

  getPlayer2ArtifactNodes() {
    return this.player2Layer.getArtifactNodes();
  },

  getMyPlayerArtifactNodes() {
    if (this.getMyPlayer() === this.getPlayer2()) {
      return this.getPlayer2ArtifactNodes();
    }
    return this.getPlayer1ArtifactNodes();
  },

  getOpponentPlayerArtifactNodes() {
    if (this.getOpponentPlayer() === this.getPlayer2()) {
      return this.getPlayer2ArtifactNodes();
    }
    return this.getPlayer1ArtifactNodes();
  },

  getTileLayer() {
    return this.tileLayer;
  },

  /**
   * Sets status, but only if the new status is an advancement over the last.
   * @param {Int} status
   * @see GameLayer.STATUS
   */
  setStatus(status) {
    const lastStatus = this._status;
    if (status > lastStatus) {
      this._status = status;
      const waitingForStatus = this._waitingForStatus[status];
      if (waitingForStatus != null && waitingForStatus.length > 0) {
        this._waitingForStatus[status] = null;
        for (let i = 0, il = waitingForStatus.length; i < il; i++) {
          waitingForStatus[i]();
        }
      }
    }
  },

  /**
   * Resets status, forcing to an optional passed status.
   * @param {Int} [status=GameLayer.STATUS.NEW]
   * @see GameLayer.STATUS
   */
  resetStatus(status) {
    if (status == null) { status = GameLayer.STATUS.NEW; }
    this._status = null;
    this.setStatus(status);
  },

  getStatus() {
    return this._status;
  },

  whenStatus(targetStatus, callback) {
    if (this._statusPromises == null) {
      this._statusPromises = {};
    }
    let statusPromise = this._statusPromises[targetStatus];
    if (statusPromise == null) {
      statusPromise = this._statusPromises[targetStatus] = new Promise((resolve, reject) => {
        if (this.getStatus() === targetStatus) {
          resolve();
        } else {
          if (this._waitingForStatus[targetStatus] == null) {
            this._waitingForStatus[targetStatus] = [];
          }
          this._waitingForStatus[targetStatus].push(resolve);
        }
      });
    }

    statusPromise.nodeify(callback);

    return statusPromise;
  },

  getIsNew() {
    return this._status === GameLayer.STATUS.NEW;
  },

  getIsTransitioningToChooseHand() {
    return this._status === GameLayer.STATUS.TRANSITIONING_TO_CHOOSE_HAND;
  },

  getIsChooseHand() {
    return this._status === GameLayer.STATUS.CHOOSE_HAND;
  },

  getIsSubmitHand() {
    return this._status === GameLayer.STATUS.SUBMIT_HAND;
  },

  getIsTransitioningToDrawHand() {
    return this._status === GameLayer.STATUS.TRANSITIONING_TO_DRAW_HAND;
  },

  getIsDrawHand() {
    return this._status === GameLayer.STATUS.DRAW_HAND;
  },

  getIsStartingHand() {
    return this._status === GameLayer.STATUS.STARTING_HAND;
  },

  getIsTransitioningToActive() {
    return this._status === GameLayer.STATUS.TRANSITIONING_TO_ACTIVE;
  },

  getIsActive() {
    return this._status === GameLayer.STATUS.ACTIVE;
  },

  getIsShowGameOver() {
    return this._status === GameLayer.STATUS.SHOW_GAME_OVER;
  },

  getIsDisabled() {
    return this._status == null || this._status === GameLayer.STATUS.DISABLED;
  },

  getIsGameOver() {
    return this.getIsShowGameOver() || this.getIsDisabled();
  },

  getIsGameActive() {
    return SDK.GameSession.getInstance().isActive() && this.getIsActive();
  },

  getIsTurnForPlayer(player) {
    return player && player.getIsCurrentPlayer();
  },

  getIsTurnForPlayerId(playerId) {
    const player = this.getPlayerById(playerId);
    return player && player.getIsCurrentPlayer();
  },

  getIsMyTurn() {
    return this.getIsTurnForPlayer(this._player);
  },

  getIsOpponentTurn() {
    return this.getIsTurnForPlayer(this._opponent);
  },

  getMyPlayer() {
    return this._player;
  },

  getMyPlayerId() {
    return this._player.getPlayerId();
  },

  getOpponentPlayer() {
    return this._opponent;
  },

  getOpponentPlayerId() {
    return this._opponent.getPlayerId();
  },

  getAltPlayer() {
    return this._altPlayer;
  },

  getCurrentPlayer() {
    return this._player.getIsCurrentPlayer() ? this._player : this._opponent;
  },

  getNonCurrentPlayer() {
    return !this._player.getIsCurrentPlayer() ? this._player : this._opponent;
  },

  getPlayer1() {
    return this.getPlayerById(SDK.GameSession.getInstance().getPlayer1Id());
  },

  getPlayer2() {
    return this.getPlayerById(SDK.GameSession.getInstance().getPlayer2Id());
  },

  getPlayerById(playerId) {
    if (this._player.getPlayerId() === playerId) {
      return this._player;
    } if (this._opponent.getPlayerId() === playerId) {
      return this._opponent;
    }
  },

  getPlayerSelectionLocked() {
    return this._playerSelectionLocked;
  },

  setPlayerSelectionLocked(val) {
    if (this._playerSelectionLocked != val) {
      this._playerSelectionLocked = val;
      this._updateGameForPlayerSelectionLockedChange();
    }
  },

  _updateGameForPlayerSelectionLockedChange() {
    // rebind usability
    this.bottomDeckLayer.bindHandUsability();
    this.player1Layer.getSignatureCardNode().updateUsability();
    this.player2Layer.getSignatureCardNode().updateUsability();

    // update all entity nodes
    for (let i = 0, il = this._entityNodes.length; i < il; i++) {
      const entityNode = this._entityNodes[i];
      entityNode.updateReadinessVisualTag();
    }
  },

  requestPlayerSelectionLocked(id) {
    if (id == null) {
      id = this._playerSelectionLockedId;
    }
    if (!_.contains(this._playerSelectionLockedRequests, id)) {
      const numRequests = this._playerSelectionLockedRequests.length;
      this._playerSelectionLockedRequests.push(id);
      if (numRequests === 0 && this._playerSelectionLockedRequests.length === 1) {
        this.setPlayerSelectionLocked(true);
      }
    }
  },

  requestPlayerSelectionUnlocked(id) {
    if (id == null) {
      id = this._playerSelectionLockedId;
    }
    const indexOf = _.lastIndexOf(this._playerSelectionLockedRequests, id);
    if (indexOf !== -1) {
      const numRequests = this._playerSelectionLockedRequests.length;
      this._playerSelectionLockedRequests.splice(indexOf, 1);
      if (numRequests === 1 && this._playerSelectionLockedRequests.length === 0) {
        this.setPlayerSelectionLocked(false);
      }
    }
  },

  getIsPlayerSelectionLocked() {
    return !this.getIsGameActive() || !this._player.getIsCurrentPlayer() || this._playerSelectionLocked || SDK.GameSession.getInstance().getIsWaitingForSubmittedExplicitAction();
  },

  getCurrentSdkActionInterface() {
    return this._currentSdkActionInterface;
  },
  getLastShownSdkStateRecordingAction() {
    return this._lastShownSdkStateRecordingAction;
  },
  getCurrentSdkStepInterface() {
    return this._currentSdkStepInterface;
  },
  getIsShowingStep() {
    return this.getCurrentSdkStepInterface() != null;
  },

  getDelayFromAnim(animIdentifier) {
    if (animIdentifier != null) {
      const anim = cc.animationCache.getAnimation(animIdentifier);
      if (anim) {
        return anim.getDuration();
      }
    }
    return 0.0;
  },

  getNextActionInterfaceInActionSequence(allowModifierAction) {
    // from current step look until we find next action
    for (let i = this._nextActionIndex, il = this._currentActionSequence.length; i < il; i++) {
      const sdkActionInterface = this._currentActionSequence[i];
      const nextAction = sdkActionInterface.getSdkAction();
      if (allowModifierAction || !(nextAction instanceof ModifierAction)) {
        return sdkActionInterface;
      }
    }
  },

  getIsActionSpawn(action) {
    return action instanceof SDK.ApplyCardToBoardAction && action.getCard() instanceof SDK.Entity;
  },

  getIsActionSpell(action) {
    return action instanceof SDK.ApplyCardToBoardAction && action.getCard() instanceof SDK.Spell;
  },

  getIsActionRemoval(action) {
    return action instanceof SDK.RemoveAction || action instanceof SDK.KillAction;
  },

  getEntityNodes() {
    return this._entityNodes;
  },

  getUnitNodes() {
    return this._unitNodes;
  },

  getTileNodes() {
    return this._tileNodes;
  },

  getSpellNodes() {
    return this._spellNodes;
  },

  getMovingUnitNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable) {
    const unitNode = this.getUnitNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable);
    if (unitNode && unitNode.getIsMoving()) {
      return unitNode;
    }
  },

  getEntityNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable) {
    return this.getUnitNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable) || this.getTileNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable);
  },

  getUnitNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable) {
    return this.getNodeUnderMouse(this._unitNodes, screenX, screenY, allowInactive, allowUntargetable);
  },

  getTileNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable) {
    return this.getNodeUnderMouse(this._tileNodes, screenX, screenY, allowInactive, allowUntargetable);
  },

  /**
   * Return the first cocos node/sprite under the mouse.
   * @param  {cc.Node|Array} nodes
   * @param  {Number} screenX
   * @param  {Number} screenY
   * @param  {Boolean} [allowInactive=false]
   * @param  {Boolean} [allowUntargetable=false]
   * @return {cc.Node}
   */
  getNodeUnderMouse(nodes, screenX, screenY, allowInactive, allowUntargetable) {
    let inactiveNode;

    if (nodes) {
      if (!_.isArray(nodes)) {
        nodes = [nodes];
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.isVisible() && node.getDisplayedOpacity() > 0.0 && (allowUntargetable || !(node instanceof EntityNode) || node.getIsTargetable()) && UtilsEngine.getNodeUnderMouse(node, screenX, screenY)) {
          // always return an active node first
          if (!(node instanceof EntityNode) || node.getIsActive()) {
            return node;
          } if (inactiveNode == null) {
            inactiveNode = node;
          }
        }
      }

      // fallback to returning inactive node
      if (allowInactive) {
        return inactiveNode;
      }
    }
  },

  getEntityNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable) {
    return this.getUnitNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable) || this.getTileNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable);
  },

  getUnitNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable) {
    return this.getNodeAtBoardPosition(this._unitNodes, boardX, boardY, allowInactive, allowUntargetable);
  },

  getTileNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable) {
    return this.getNodeAtBoardPosition(this._tileNodes, boardX, boardY, allowInactive, allowUntargetable);
  },

  /**
   * Return the first cocos node/sprite at a board position. Pass in rounded board x/y values for exact find, and un-rounded board x/y values to find nodes on board approximately.
   * @param  {cc.Node|Array} nodes
   * @param  {Number} boardX
   * @param  {Number} boardY
   * @param  {Boolean} [allowInactive=false]
   * @param  {Boolean} [allowUntargetable=false]
   * @return {cc.Node}
   */
  getNodeAtBoardPosition(nodes, boardX, boardY, allowInactive, allowUntargetable) {
    if (nodes) {
      if (!_.isArray(nodes)) {
        nodes = [nodes];
      }

      let activeApproximateNode;
      let activeExactNode;
      let inactiveApproximateNode;
      let inactiveExactNode;
      const approximate = boardY !== (boardY | 0);
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeBoardPosition = node.getBoardPosition();
        const nodeBoardX = nodeBoardPosition.x;
        const nodeBoardY = nodeBoardPosition.y;
        const dx = boardX - nodeBoardX;
        const dy = boardY - nodeBoardY;
        const isExactX = dx <= 0.5 && dx >= -0.5;
        const isExactY = dy <= 0.5 && dy >= -0.5;
        const isExact = isExactX && isExactY;
        const isApproximate = approximate && isExactX && !isExactY && dy < 0.5 + CONFIG.TILE_TARGET_PCT && dy > 0.5;
        const isTargetable = !_.isFunction(node.getIsTargetable) || node.getIsTargetable();
        if ((isExact || isApproximate) && (allowUntargetable || isTargetable)) {
          // always return an active node first
          if (!_.isFunction(node.getIsActive) || node.getIsActive()) {
            if (isExact) {
              activeExactNode = node;
            } else if (isTargetable) {
              activeApproximateNode = node;
            }
          } else if (allowInactive) {
            if (isExact) {
              inactiveExactNode = node;
            } else if (isTargetable) {
              inactiveApproximateNode = node;
            }
          }
        }
      }

      return activeExactNode || activeApproximateNode || inactiveExactNode || inactiveApproximateNode;
    }
  },

  getNodeForSdkCard(sdkCard) {
    if (sdkCard != null) {
      function nodeHasSdkCard(node) { return node.getSdkCard() === sdkCard; }
      return _.find(this._unitNodes, nodeHasSdkCard) || _.find(this.bottomDeckLayer.getCardNodes(), nodeHasSdkCard) || _.find(this._tileNodes, nodeHasSdkCard) || _.find(this.player1Layer.getArtifactNodes(), nodeHasSdkCard) || _.find(this.player2Layer.getArtifactNodes(), nodeHasSdkCard);
    }
  },

  getGeneralNodeForPlayer1() {
    return this.getNodeForSdkCard(SDK.GameSession.getInstance().getGeneralForPlayer1());
  },

  getGeneralNodeForPlayer2() {
    return this.getNodeForSdkCard(SDK.GameSession.getInstance().getGeneralForPlayer2());
  },

  /* endregion GETTERS / SETTERS */

  /* region COCOS EVENTS */

  /* endregion COCOS EVENTS */

  /* region EVENT HANDLERS */

  onSetupTransitionIn() {
    FXCompositeLayer.prototype.onSetupTransitionIn.call(this);
    Logger.module('ENGINE').log('GameLayer.onSetupTransitionIn');

    // setup battle
    this._battleMap.setup();
    this._battleMap.whenStatus(BattleMap.STATUS.SETUP).then(() => {
      // bind to sdk events and put loaded units/spells into battle
      this.bindToGameSession();
    });
  },

  onTransitionIn() {
    FXCompositeLayer.prototype.onTransitionIn.call(this);
    Logger.module('ENGINE').log('GameLayer.onTransitionIn');
    this.start();
  },

  onResize() {
    this._super();

    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

    // notifications
    this._notificationYourTurnSprite.setPosition(winCenterPosition);
    this._notificationEnemyTurnSprite.setPosition(winCenterPosition);
    this._notificationGoSprite.setPosition(winCenterPosition);

    // game state
    if (this.getIsGameActive()) {
      const currentSdkStepInterface = this._currentSdkStepInterface;

      // rebind to game session is safest method to reposition all entities when game active
      this.bindToGameSession();

      // issue an after show step if one was cleared that would have played
      if (currentSdkStepInterface != null) {
        this._afterShowStep(currentSdkStepInterface);
      }
    } else {
      // when game is not active, no actions should be executing and it is safe to just reposition
      const entityNodes = this._entityNodes;
      for (let i = 0, il = entityNodes.length; i < il; i++) {
        const entityNode = entityNodes[i];
        entityNode.setPosition(UtilsEngine.transformBoardToTileMap(entityNode.getBoardPosition()));
      }
    }
  },

  onRollBack() {
    // rebind to game session is safest method to reposition all entities
    this.bindToGameSession();
    this.getEventBus().trigger(EVENTS.show_rollback, { type: EVENTS.show_rollback });
  },

  onInvalidAction(event) {
    const { action } = event;
    const { validatorType } = event;
    const { validationMessage } = event;
    var { validationMessagePosition } = event;
    const myPlayer = this.getMyPlayer();
    const sourceCard = action.getSource();

    // only show invalidation notification if we have a message for a non-implicit action
    if (validationMessage && !action.getIsImplicit() && action.getOwnerId() === myPlayer.getPlayerId()) {
      if (action instanceof SDK.DrawStartingHandAction) {
        // show message centered above cards for mulligan
        const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
        const cardsStartPosition = cc.p(winCenterPosition.x, winCenterPosition.y + CONFIG.HAND_CARD_SIZE * 0.5);
        this.showInstructionAtPosition(cardsStartPosition, validationMessage);
      } else if (action instanceof SDK.ReplaceCardFromHandAction) {
        this.showInstructionAtPosition(this.bottomDeckLayer.getReplaceNode().getPosition(), validationMessage);
      } else if (validationMessagePosition) {
        // show message at position
        var validationMessagePosition = validationMessagePosition;
        const entityNode = this.getEntityNodeAtBoardPosition(validationMessagePosition.x, validationMessagePosition.y, true, true);
        if (entityNode) {
          this.showInstructionForSdkNode(entityNode, validationMessage);
        } else {
          this.showInstructionOverTile(validationMessagePosition, validationMessage);
        }
      } else {
        // find source node and show text above it
        const sourceNode = sourceCard instanceof SDK.Entity && this.getNodeForSdkCard(sourceCard);
        if (sourceNode instanceof UnitNode) {
          this.showInstructionForSdkNode(sourceNode, validationMessage);
        } else {
          this.showInstructionForPlayer(this.getMyPlayer(), validationMessage);
        }
      }

      // error sound
      audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_error.audio, CONFIG.ERROR_SFX_PRIORITY);

      // rebind hand in case this action modified the hand
      // only allow binding when the player has no followup card
      const playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
      if (!playerActor.getHasCardsWithFollowup()) {
        if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.ReplaceCardFromHandAction) {
          this.bottomDeckLayer.bindHand();
        } else if (action instanceof SDK.PlaySignatureCardAction) {
          this.getMyPlayerLayer().bindAndResetSignatureCard();
        }
      }

      // // special case for invalid actions
      // var showRangedProvokers;
      // if (validatorType === SDK.ModifierProvoke.type || validatorType === SDK.ModifierProvoked.type) {
      //   // notify of unit that is attempting to act
      //   var unitNode = this.getNodeForSdkCard(sourceCard);
      //   if (unitNode) {
      //     var unitPosition = unitNode.getPosition();
      //     this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
      //   }

      //   // find each provoking unit around the source of the action and notify
      //   var sourceBoardPosition = action.getSourcePosition();
      //   var sdkUnits = SDK.GameSession.getInstance().getBoard().getCardsAroundPosition(sourceBoardPosition, SDK.CardType.Unit, 1);
      //   for (var i = 0, il = sdkUnits.length; i < il; i++) {
      //     var sdkCard = sdkUnits[i];
      //     if (sdkCard && sdkCard.getOwnerId() !== action.getOwnerId() && sdkCard.getModifierByClass(SDK.ModifierProvoke)) {
      //       var unitNode = this.getNodeForSdkCard(sdkCard);
      //       if (unitNode) {
      //         var unitPosition = unitNode.getPosition();
      //         this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
      //       }
      //     }
      //   }
      //   // action is an attack and source is a ranged unit, check for ranged provoke also
      //   if (action instanceof SDK.AttackAction) {
      //     var sourceSdkCard = SDK.GameSession.getInstance().getBoard().getEntityAtPosition(sourceBoardPosition);
      //     if (sourceSdkCard && sourceSdkCard.getModifierByClass(SDK.ModifierRanged)) {
      //       showRangedProvokers = true;
      //     }
      //   }
      // }

      // if (validatorType === SDK.ModifierRangedProvoke.type || showRangedProvokers) {
      //   // notify of unit that is attempting to act
      //   var unitNode = this.getNodeForSdkCard(sourceCard);
      //   if (unitNode) {
      //     var unitPosition = unitNode.getPosition();
      //     this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
      //   }

      //   // find each ranged provoking unit and flash an instructional arrow
      //   for (var i = 0, il = this._unitNodes.length; i < il; i++) {
      //     var unitNode = this._unitNodes[i];
      //     var sdkCard = unitNode.getSdkCard();
      //     if (sdkCard && sdkCard.getOwnerId() !== action.getOwnerId() && sdkCard.getModifierByClass(SDK.ModifierRangedProvoke)) {
      //       var unitPosition = unitNode.getPosition();
      //       this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
      //     }
      //   }
      // }
    }
  },

  onStep(event) {
    const sdkStep = event.step;
    const sdkStepIndex = sdkStep.getIndex();
    const action = sdkStep.getAction();
    const myAction = action.getOwnerId() === this._player.getPlayerId();
    const sdkStepInterface = this._stepInterfacesByIndex[sdkStepIndex] = new SdkStepInterface(sdkStep);

    // flatten and rearrange step action graph
    this._parseStepActionGraph(sdkStepInterface);

    // load step resources
    this._loadStepResources(sdkStepInterface);

    // always remove one followup from _opponent's stack
    // we don't need to check if the step is a followup because followups are always in order
    if (!myAction) {
      this._opponent.popCurrentCardWithFollowup();
    }

    if (action instanceof SDK.ResignAction && !SDK.GameSession.getInstance().getIsSpectateMode()) {
      // resign actions should immediately reset the step replay system and show themselves
      this.resetStepQueue();
    } else if (myAction && (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.ReplaceCardFromHandAction)) {
      // remove card played or replaced from hand
      this.bottomDeckLayer.unbindCardNodeAtIndex(action.getIndexOfCardInHand());
    } else if (action instanceof SDK.PlaySignatureCardAction) {
      // rebind signature card played
      this.getPlayerLayerByPlayerId(action.getOwnerId()).bindAndResetSignatureCard();
    }

    // update the usability of all cards
    if (myAction) {
      this.bottomDeckLayer.bindHandUsability();
    }

    // update signature card usability
    this.player1Layer.getSignatureCardNode().updateUsability();
    this.player2Layer.getSignatureCardNode().updateUsability();

    // update replace active state
    this.bottomDeckLayer.getReplaceNode().setActive(this._player.getIsCurrentPlayer() && this._player.getSdkPlayer().getDeck().getCanReplaceCardThisTurn());

    // add all applied units as placeholders immediately
    for (let i = 0, il = sdkStepInterface.actionInterfaceSequence.length; i < il; i++) {
      const sdkActionInterface = sdkStepInterface.actionInterfaceSequence[i];
      const sequenceAction = sdkActionInterface.getSdkAction();
      if (sequenceAction instanceof SDK.ApplyCardToBoardAction && sequenceAction.getIsValidApplication()) {
        var card = sequenceAction.getCard();
        if (card instanceof SDK.Entity) {
          // create node for card
          const node = this.addNodeForSdkCard(card, sequenceAction.getTargetPosition());
          if (node instanceof EntityNode) {
            // show placeholder until node shows spawn
            node.showPlaceholder();
          }
        }
      }
    }

    // certain steps can be ignored by the step replay system
    // either they don't do anything visually or they bypass the system entirely
    const canReplayStep = !(action instanceof SDK.RollbackToSnapshotAction);
    if (canReplayStep) {
      // check followups when is a play card action
      // this needs to be done immediately instead of within the step visual sequence
      // otherwise the followup flow will not have the right feeling
      if (!action.getIsImplicit()) {
        if (action instanceof SDK.PlayCardAction) {
          var card = action.getCard();
          if (card && card.getCurrentFollowupCard()) {
            if (myAction) {
              if (SDK.GameSession.getInstance().getIsSpectateMode()) {
                this._altPlayer.pushCardWithFollowup(card);
              } else {
                this._player.pushCardWithFollowup(card);
              }
            } else {
              this._opponent.pushCardWithFollowup(card);
            }
          }
        }

        // stop any mouse down/over and try to show followup
        if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
          this.stopMouseDown();
        }
        this.showPlayerNextFollowupCard();

        // try to reselect a unit that just moved if that unit is ready
        if (!SDK.GameSession.getInstance().getIsSpectateMode()
          && (action instanceof SDK.MoveAction || action instanceof SDK.AttackAction)
          && this._player.getCurrentCardWithFollowup() == null) {
          const stickyTargetNode = this._player.getStickyTargetNode();
          this._player.setStickyTargetNode(null);
          if (CONFIG.stickyTargeting && stickyTargetNode && myAction && this.getIsMyTurn() && this._player.getSelectedEntityNode() == null && stickyTargetNode.getIsReadyAtAction()) {
            // reselect sticky target
            this._mouseSelectEntity(stickyTargetNode);
          }
        }
      }

      if (myAction) {
        // show my step in battle log immediately
        this._battleLog.showEntry(sdkStep);

        // show my played card when step is done loading
        // but not if in spectate mode, as the played card will be instead shown in sequence
        if (!SDK.GameSession.getInstance().getIsSpectateMode()
          && (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction)
          && action.getCard().getHasFollowups()) {
          sdkStepInterface.loadPromise.then(() => {
            this.showPlayCard(action, CONFIG.MY_PLAYED_CARD_TRANSITION_DURATION, CONFIG.MY_PLAYED_CARD_SHOW_DURATION, true);
          });
        }
      }

      // add step to queue for display
      this._stepQueue.push(sdkStepInterface);

      // show next step if none is in progress
      // defer is necessary in case this step was added as a result of a previous step
      _.defer(() => {
        if (this._currentSdkStepInterface == null && this._waitingToShowStep == null) {
          this.showNextStep();
        }
      });
    }
  },

  /* endregion EVENT HANDLERS */

  /* region MULLIGAN */

  /**
   * Shows the hand to choose for the starting hand for my player.
   * @returns {Promise}
   */
  showChooseHand() {
    return this.whenStatus(GameLayer.STATUS.NEW).then(() => {
      Logger.module('ENGINE').log('GameLayer.showChooseHand');
      // bind players and change status
      this.bindSdkPlayers();
      this.setStatus(GameLayer.STATUS.TRANSITIONING_TO_CHOOSE_HAND);

      // highlight only my general after highlighting both
      this.whenHighlightedGeneralsAsync().then(() => {
        if (SDK.GameSession.getInstance().isNew()) {
          this._highlightOnlyMyGeneral();
        }
      });

      // show choose
      const showChooseHandPromise = this.bottomDeckLayer.showChooseHand().then(() => {
        this.setStatus(GameLayer.STATUS.CHOOSE_HAND);
      });

      return showChooseHandPromise;
    });
  },

  /**
   * Returns an array of indices chosen by the player to be mulliganed.
   * @returns {Array}
   */
  getMulliganIndices() {
    const mulliganIndices = [];
    if (this.getIsChooseHand()) {
      const cardNodes = this.getBottomDeckLayer().getCardNodes();

      // get mulligan indices from selected cards
      for (let i = 0, il = cardNodes.length; i < il; i++) {
        const cardNode = cardNodes[i];
        const cardIndex = cardNode.getHandIndex();
        if (cardIndex != null && cardNode.getSelected()) {
          mulliganIndices.push(cardIndex);
        }
      }
    }

    return mulliganIndices;
  },

  /**
   * Shows that the starting hand for my player has been submitted.
   * @returns {Promise}
   */
  showSubmitChosenHand() {
    return Promise.all([
      this.whenStatus(GameLayer.STATUS.NEW),
      this.whenStatus(GameLayer.STATUS.CHOOSE_HAND),
    ]).then(() => {
      Logger.module('ENGINE').log('GameLayer.showSubmitChosenHand');
      // bind players and change status
      this.bindSdkPlayers();
      this.setStatus(GameLayer.STATUS.SUBMIT_HAND);
    });
  },

  /**
   * Shows drawing of starting hand for my player.
   * @returns {Promise}
   */
  showDrawStartingHand(mulliganIndices) {
    return Promise.all([
      this.whenStatus(GameLayer.STATUS.NEW),
      this.whenStatus(GameLayer.STATUS.CHOOSE_HAND),
    ]).then(() => {
      Logger.module('ENGINE').log('GameLayer.showDrawStartingHand');
      // bind players and change status
      this.bindSdkPlayers();
      this.setStatus(GameLayer.STATUS.TRANSITIONING_TO_DRAW_HAND);

      // highlight only my general after highlighting both
      this.whenHighlightedGeneralsAsync().then(() => {
        if (SDK.GameSession.getInstance().isNew()) {
          this._highlightOnlyMyGeneral();
        }
      });

      // show draw
      return this.bottomDeckLayer.showDrawStartingHand(mulliganIndices).then(() => {
        this.setStatus(GameLayer.STATUS.DRAW_HAND);
      });
    });
  },

  /**
   * Shows the starting hand for my player.
   * @returns {Promise}
   */
  showStartingHand() {
    return this.whenStatus(GameLayer.STATUS.NEW).then(() => {
      Logger.module('ENGINE').log('GameLayer.showStartingHand');
      // bind players and change status
      this.bindSdkPlayers();
      this.setStatus(GameLayer.STATUS.STARTING_HAND);

      // highlight only my general after highlighting both
      this.whenHighlightedGeneralsAsync().then(() => {
        if (SDK.GameSession.getInstance().isNew()) {
          this._highlightOnlyMyGeneral();
        }
      });

      // show starting hand
      this.bottomDeckLayer.showStartingHand();
    });
  },

  /**
   * Returns a promise for when the status is set to a status that can transition into an active game.
   * @returns {Promise}
   */
  whenIsStatusForActiveGame() {
    if (this.getIsSubmitHand() || this.getIsTransitioningToDrawHand()) {
      // when we've submitted the starting hand or are in the process of drawing our starting hand
      // wait for draw hand to complete before switching to active game
      Logger.module('ENGINE').log('GameLayer.showActiveGame -> waiting for draw');
      return this.whenStatus(GameLayer.STATUS.DRAW_HAND);
    }
    Logger.module('ENGINE').log('GameLayer.showActiveGame -> waiting for new');
    return this.whenStatus(GameLayer.STATUS.NEW);
  },

  /**
   * Shows the active game state when the status is set to a status that can transition into an active game.
   * @returns {Promise}
   */
  showActiveGame() {
    if (this._showActiveGamePromise == null) {
      this._showActiveGamePromise = new Promise((resolve, reject) => {
        this.whenIsStatusForActiveGame().then(() => {
          Logger.module('ENGINE').log('GameLayer.showActiveGame');
          // bind players and change status
          this.bindSdkPlayers();
          this.setStatus(GameLayer.STATUS.TRANSITIONING_TO_ACTIVE);

          // transition to active hand
          this.bottomDeckLayer.showActiveHand();
          this.whenHighlightedGeneralsAsync().then(() => {
            // unhighlight generals
            this._player.unhighlightGeneral();
            this._opponent.unhighlightGeneral();

            // clear mouse
            this.stopMouseDown();

            // show battlelog
            if (CONFIG.showBattleLog) {
              this._battleLog.setOpacity(0.0);
              this._battleLog.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
              this._battleLog.setVisible(true);
            }

            // activate battle
            this._battleMap.activate();
            return this._battleMap.whenStatus(BattleMap.STATUS.ACTIVE).then(() => {
              Logger.module('ENGINE').log('GameLayer set active game');

              // set as active
              this.setStatus(GameLayer.STATUS.ACTIVE);

              // show modifiers
              this.bindAppliedModifiers(CONFIG.FADE_SLOW_DURATION);

              // show players
              this.player1Layer.showActiveGame();
              this.player2Layer.showActiveGame();

              // show start turn
              this.showStartTurn();
              this.updateEntityNodeOwnerSprites();
              this.updateShowingSdkNodeStats();
              this.bottomDeckLayer.bindHandUsability();

              this.getEventBus().trigger(EVENTS.show_active_game, { type: EVENTS.show_active_game });

              resolve();
            });
          });
        });
      });
    }

    return this._showActiveGamePromise;
  },

  /* endregion MULLIGAN */

  /* region GAME STATE */

  resetActiveState() {
    Logger.module('ENGINE').log('GameLayer.resetActiveState');
    this.removeUnusedEntitiesTags();
    if (!SDK.GameSession.current().getIsSpectateMode() && (this.getIsMyTurn() || !SDK.GameSession.getInstance().isActive())) {
      this.stopMouseOverForPlayer(this._opponent);
      this.stopMouseDownForPlayer(this._opponent);
    }
    this.stopMouseDown();
    this.removePlayerFollowupCardUI();
    this._player.clearCardsWithFollowup();
    this._battleLog.setMouseOverBattleLogNode(null);
    this._player.resetMouseState();
    this._player.setIntentType(SDK.IntentType.NeutralIntent);
    this.skipShowActionCardSequence();
    this.stopShowingInspectCard();
    this.updateReadinessTagForAllEntities();
    SDK.NetworkManager.getInstance().broadcastGameEvent({ type: EVENTS.network_game_mouse_clear, timestamp: Date.now() });
  },

  updateCurrentPlayer() {
    this.bindSdkPlayers();
    this._player.setIsCurrentPlayer(this._player.getSdkPlayer().getIsCurrentPlayer());
    this._opponent.setIsCurrentPlayer(this._opponent.getSdkPlayer().getIsCurrentPlayer());
  },

  bindSdkPlayers() {
    const gameSession = SDK.GameSession.getInstance();
    const myPlayerId = gameSession.getMyPlayerId();
    const opponentPlayerId = gameSession.getOpponentPlayerId();
    this._player.setPlayerId(myPlayerId);
    this._player.setIsMyPlayer(true);
    this._opponent.setPlayerId(opponentPlayerId);
    this._altPlayer.setPlayerId(myPlayerId);
    this._altPlayer.setIsAltPlayer(true);
  },

  bindToGameSession() {
    if (SDK.GameSession.getInstance().getIsMyFollowupActiveAndCancellable()) {
      // cancel out of active followup (rollback will trigger this method)
      SDK.GameSession.getInstance().submitExplicitAction(SDK.GameSession.getInstance().actionRollbackSnapshot());
    } else {
      // check if this is binding for new game
      const forNewGame = !this.getIsActive();

      // clear step queue
      this.resetStepQueue();

      // reset interface maps
      this._stepInterfacesByIndex = {};
      this._actionInterfacesByIndex = {};

      // reset the visual state
      this.resetActiveState();

      // remove all existing entity nodes
      this.removeNodes(this._entityNodes);

      // bind players
      this.bindSdkPlayers();

      // bind battle log
      this._battleLog.bindToGameSession();

      // bind player layers
      this.player1Layer.bindToGameSession();
      this.player2Layer.bindToGameSession();

      // add all cards
      const board = SDK.GameSession.getInstance().getBoard();
      const allCardTypes = null;
      const allowUntargetable = true;
      this.addNodesForSdkCards(board.getCards(allCardTypes, allowUntargetable));

      // set all units as spawned and in their base state
      const entityNodes = this._entityNodes;
      for (var i = 0, il = entityNodes.length; i < il; i++) {
        const entityNode = entityNodes[i];
        entityNode.showSpawned();
      }

      // updates when game is already active
      if (!forNewGame) {
        // show modifiers only when game is already active
        // do not set async promise callback or else modifiers may be shown twice
        this.bindAppliedModifiers();

        this.updateCurrentPlayer();
        this.updateReadinessTagForAllEntities();

        // bind cards and force a usability update to ensure all cards show correct usability state
        this.bottomDeckLayer.bindHand();
        this.bottomDeckLayer.bindHandUsability();

        // bind signature cards
        this.player1Layer.bindAndResetSignatureCard(0.0);
        this.player2Layer.bindAndResetSignatureCard(0.0);

        // reset last shown action
        this._lastShownSdkStateRecordingAction = null;

        // find last shown action if any exist
        const actions = SDK.GameSession.getInstance().getActions();
        if (actions.length > 0) {
          for (var i = actions.length - 1; i >= 0; i--) {
            const action = actions[i];
            if (action != null && !(action instanceof SDK.ApplyModifierAction) && !(action instanceof SDK.RemoveModifierAction)) {
              this._lastShownSdkStateRecordingAction = action;
              break;
            }
          }
        }

        // force update of showing stats
        this.updateShowingSdkNodeStats(true);
      }
    }
  },

  bindAppliedModifiers(modifierFadeDuration) {
    const entityNodes = this._entityNodes;
    for (let i = 0; i < entityNodes.length; i++) {
      this.bindAppliedModifiersForEntityNode(entityNodes[i], modifierFadeDuration);
    }
  },

  bindAppliedModifiersForEntityNode(entityNode, modifierFadeDuration) {
    const sdkCard = entityNode.getSdkCard();
    const modifiers = sdkCard.getModifiers();
    if (modifiers.length > 0) {
      for (let j = 0, jl = modifiers.length; j < jl; j++) {
        const modifier = modifiers[j];
        if (modifier instanceof SDK.Modifier) {
          entityNode.showAppliedModifier(modifier, null, true);
          if (modifier.getIsActive()) {
            entityNode.showActivatedModifier(modifier, null, true, modifierFadeDuration);
          }
        }
      }
    }
  },

  showGameOver() {
    const winningSdkPlayer = SDK.GameSession.getInstance().getWinner();
    Logger.module('ENGINE').log('GameLayer.showGameOver -> winningPlayer', winningSdkPlayer);
    // this event is pretty useful for notifying other parts of the engine/ui to fade out since game over animations are about to play
    this.getEventBus().trigger(EVENTS.before_show_game_over, { type: EVENTS.before_show_game_over });

    // immediately prep for terminate on non-active games
    if (!this.getIsActive() && !this.getIsTransitioningToActive()) {
      this._prepareForTerminate();
    } else {
      // disable any active state
      this.resetActiveState();

      // stop showing tooltip
      this.stopShowingTooltip();
    }

    // change status
    this.setStatus(GameLayer.STATUS.SHOW_GAME_OVER);

    // get winning player for showing victory fx
    if (winningSdkPlayer == null) {
      // no winning player so match must have been a draw
      this.runAction(
        cc.sequence(
          cc.delayTime(0.5),
          cc.callFunc(() => {
            this._showGameOverComplete();
          }),
        ),
      );
    } else {
      let victoryFXDelay = 0.0;
      const winningGeneral = SDK.GameSession.current().getGeneralForPlayerId(winningSdkPlayer.playerId);
      const losingSdkPlayer = SDK.GameSession.getInstance().getLoser();
      const losingPlayerId = losingSdkPlayer.getPlayerId();
      const losingPlayer = this.getPlayerById(losingPlayerId);
      const losingGeneral = SDK.GameSession.getInstance().getGeneralForPlayerId(losingPlayerId);

      // when final step is resign, show speech from resigning player
      if (SDK.GameSession.getInstance().getGameEndingStep().getAction() instanceof SDK.ResignAction) {
        const losingPlayerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(losingPlayer.getPlayerId());
        const losingFactionId = losingPlayerSetupData.factionId;
        const losingFaction = SDK.FactionFactory.factionForIdentifier(losingFactionId);
        victoryFXDelay += this.showSpeechForPlayer(losingPlayer, losingFaction.resignStatement, null, CONFIG.DIALOGUE_RESIGN_DURATION, false, 0.6);
      }

      // show victory fx over winning general
      const victorySprite = GlowSprite.create({
        spriteIdentifier: RSX.fx_winner.name,
        antiAlias: false,
        needsDepthDraw: true,
        scale: CONFIG.SCALE,
      });
      const position = UtilsEngine.transformBoardToTileMap(winningGeneral.getPosition());
      victorySprite.setPosition(cc.p(position.x, position.y + 150));

      // set up fireworks particles
      const particles = BaseParticleSystem.create({
        plistFile: RSX.ptcl_victory_decal_fireworks.plist,
        affectedByWind: true,
      });
      particles.setPosition(victorySprite.getPosition());

      // add lights
      const lights = [];
      const winnerLight = Light.create();
      winnerLight.setRadius(CONFIG.TILESIZE * 3.0);
      winnerLight.setFadeInDuration(0.5);
      winnerLight.setIntensity(CONFIG.LIGHT_HIGH_INTENSITY);
      const winnerLightScreenPosition = UtilsEngine.transformBoardToTileMap(winningGeneral.getPosition());
      winnerLightScreenPosition.y += -CONFIG.TILESIZE * 0.35;
      winnerLight.setPosition(winnerLightScreenPosition);
      lights.push(winnerLight);

      if (losingGeneral != null) {
        const loserLight = Light.create();
        loserLight.setRadius(CONFIG.TILESIZE * 3.0);
        loserLight.setFadeInDuration(0.5);
        loserLight.setIntensity(CONFIG.LIGHT_HIGH_INTENSITY);
        const loserLightScreenPosition = UtilsEngine.transformBoardToTileMap(losingGeneral.getPosition());
        loserLightScreenPosition.y += -CONFIG.TILESIZE * 0.35;
        loserLight.setPosition(loserLightScreenPosition);
        lights.push(loserLight);
      }

      this.addNodes(lights);

      // show victory fx animation
      victorySprite.runAction(
        cc.sequence(
          cc.delayTime(victoryFXDelay),
          cc.callFunc(() => {
            audio_engine.current().play_effect(RSX.sfx_victory_crest.audio);
          }),
          UtilsEngine.getAnimationAction(RSX.fx_winner.name),
          cc.delayTime(-0.5),
          cc.callFunc(() => {
            // add particles
            this.addNodes(particles);
            // additive blending
            victorySprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
            // tint to white but start at 0 alpha tint
            victorySprite.setTint(cc.color(255, 255, 255, 0));
          }),
          cc.actionTween(CONFIG.FADE_FAST_DURATION, TweenTypes.TINT_FADE, 0.0, 255.0),
          cc.actionTween(CONFIG.FADE_FAST_DURATION, TweenTypes.TINT_FADE, 255.0, 0.0),
          cc.fadeTo(CONFIG.FADE_FAST_DURATION, 0.0),
          cc.callFunc(() => {
            // finish game over
            this._showGameOverComplete();
          }),
        ),
      );
      this.uiLayer.addChild(victorySprite, -9999);
    }
  },

  _showGameOverComplete() {
    Logger.module('ENGINE').log('GameLayer._showGameOverComplete');
    // prep for terminate
    this._prepareForTerminate();

    // notify
    this.getEventBus().trigger(EVENTS.show_game_over, { type: EVENTS.show_game_over });
  },

  getIsShowingEndTurn() {
    return this._showingEndTurn;
  },

  getIsShowingStartTurn() {
    return this._showingStartTurn;
  },

  whenStartTurnShown() {
    return this._showStartTurnPromise || Promise.resolve();
  },

  showEndTurn(action) {
    const showDuration = 0.0;

    if (!this._showingEndTurn) {
      Logger.module('ENGINE').log('GameLayer.showEndTurn');
      // finish previous
      this._cleanupShowingEndTurn();
      this._setupStartTurnPromises();
      this._showingEndTurn = true;

      // lock down ui until turn change is completed
      this.requestPlayerSelectionLocked('turn_change');

      // reset last card with automatic action for end turn
      this._lastCardWithAutomaticAction = null;

      // emit event that end turn is showing
      this.getEventBus().trigger(EVENTS.show_end_turn, { type: EVENTS.show_end_turn });

      // finish showing end turn
      this._cleanupShowingEndTurn();
    }

    return showDuration;
  },

  _cleanupShowingEndTurn() {
  },

  afterShowEndTurn() {
    if (this._showingEndTurn) {
      Logger.module('ENGINE').log('GameLayer.afterShowEndTurn');
      this._showingEndTurn = false;
      if (SDK.GameSession.getInstance().getIsSpectateMode()) {
        this.updateReadinessTagForAllEntities();
      } else {
        this.resetActiveState();
      }
      this.getEventBus().trigger(EVENTS.after_show_end_turn, { type: EVENTS.after_show_end_turn });
    }
  },

  showStartTurn(delay) {
    let showDuration = 0.0;

    if (!this._showingStartTurn) {
      Logger.module('ENGINE').log('GameLayer.showStartTurn');
      if (delay == null) { delay = 0.0; }

      this._setupStartTurnPromises();
      this._showingStartTurn = true;

      // reset last card with automatic action for start turn
      this._lastCardWithAutomaticAction = null;

      // update players
      this.updateCurrentPlayer();

      // update replace active state
      this.bottomDeckLayer.getReplaceNode().setActive(this._player.getIsCurrentPlayer() && this._player.getSdkPlayer().getDeck().getCanReplaceCardThisTurn());

      // when my player is switched
      if (SDK.GameSession.getInstance().isSandbox()) {
        // rebind hand
        this.bottomDeckLayer.bindHand();

        // update battlelog nodes
        const battleLogNodes = this._battleLog.getBattleLogNodesInUse();
        for (var i = 0, il = battleLogNodes.length; i < il; i++) {
          battleLogNodes[i].updateSpritesForOwner();
        }

        // update entity nodes
        const entityNodes = this._entityNodes;
        for (var i = 0, il = entityNodes.length; i < il; i++) {
          entityNodes[i].updateSpritesForOwner();
        }
      }

      // update show duration
      const signatureCardCooldownDuration = CONFIG.ANIMATE_MEDIUM_DURATION;
      showDuration += CONFIG.NOTIFICATION_DURATION + CONFIG.NOTIFICATION_TRANSITION_DURATION + signatureCardCooldownDuration;

      // play sound of turn change
      audio_engine.current().play_effect(RSX.sfx_ui_yourturn.audio, false);

      // show notification for start turn
      const currentStep = this._currentSdkStepInterface && this._currentSdkStepInterface.getSdkStep();
      const currentAction = currentStep && currentStep.getAction();
      const myPlayerIsCurrent = this.getMyPlayer() === this.getCurrentPlayer();
      this._showingStartTurnWithAutomaticActions = myPlayerIsCurrent && currentAction instanceof SDK.StartTurnAction && currentStep.getChildStepIndex() != null;
      if (this._showingStartTurnWithAutomaticActions) {
        this._notificationStartTurnSprite = this._notificationGoSprite;
      } else if (myPlayerIsCurrent) {
        this._notificationStartTurnSprite = this._notificationYourTurnSprite;
      } else {
        this._notificationStartTurnSprite = this._notificationEnemyTurnSprite;
      }

      this._notificationStartTurnSprite.setVisible(true);
      this._notificationStartTurnSprite.setPosition(UtilsEngine.getGSIWinCenterPosition());
      this._notificationStartTurnSprite.setScale(0.0);
      this._notificationStartTurnSprite.setOpacity(255.0);
      this._startTurnNotificationAction = this._notificationStartTurnSprite.runAction(cc.sequence(
        cc.scaleTo(CONFIG.NOTIFICATION_TRANSITION_DURATION, 1.0).easing(cc.easeExponentialOut()),
        cc.delayTime(CONFIG.NOTIFICATION_DURATION * (this._showingStartTurnWithAutomaticActions ? 0.75 : 1.0)),
        cc.callFunc(() => {
          // show signature card cooldown
          this.player1Layer.getSignatureCardNode().showCooldown(signatureCardCooldownDuration);
          this.player2Layer.getSignatureCardNode().showCooldown(signatureCardCooldownDuration);

          // resolve
          this._resolveBeginStartTurnPromise();

          // always try to execute after show start turn immediately
          // this will fail if there are any automatic actions showing
          if (this._showingStartTurn
            && (this._stepQueue.length === 0
            || currentAction == null
            || (this._stepQueue[0].getSdkStep().getAction() === currentAction
            && (this._stepQueue.length === 1 || !this._stepQueue[1].getSdkStep().getAction().getIsAutomatic())))) {
            this.afterShowStartTurn();
          }
        }),
        cc.spawn(
          cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, 30.0, 0.0).easing(cc.easeExponentialIn()),
          cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
        ),
        cc.callFunc(() => {
          this._cleanupShowingStartTurn();
        }),
      ));

      // trigger event
      this.getEventBus().trigger(EVENTS.show_start_turn, { type: EVENTS.show_start_turn, showDuration });
    }

    return showDuration;
  },

  _cleanupShowingStartTurn() {
    // remove start turn elements
    if (this._showStartTurnAction != null) {
      this.stopAction(this._showStartTurnAction);
      this._showStartTurnAction = null;
    }
    if (this._notificationStartTurnSprite != null) {
      if (this._startTurnNotificationAction != null) {
        this._notificationStartTurnSprite.stopAction(this._startTurnNotificationAction);
        this._startTurnNotificationAction = null;
      }
      if (!this._showingStartTurnWithAutomaticActions) {
        this._notificationStartTurnSprite.setVisible(false);
        this._notificationStartTurnSprite = null;
      }
    }
  },

  afterShowStartTurn() {
    if (this._showingStartTurn) {
      (this._beginShowStartTurnPromise || Promise.resolve())
        .then(() => {
          if (!this._showingStartTurn) return; // no longer showing start turn
          this._showingStartTurn = false;
          Logger.module('ENGINE').log('GameLayer.afterShowStartTurn');

          // reset last card with automatic action for turn
          this._lastCardWithAutomaticAction = null;

          // when showing start turn with automatic actions (ex: battle pets)
          // we notify player first that automatic actions are occurring
          // now notify player they can start playing their turn
          if (this._showingStartTurnWithAutomaticActions) {
            const myPlayerIsCurrent = this.getMyPlayer() === this.getCurrentPlayer();
            if (myPlayerIsCurrent) {
              this._notificationStartTurnSprite = this._notificationYourTurnSprite;
            } else {
              this._notificationStartTurnSprite = this._notificationEnemyTurnSprite;
            }
            this._notificationStartTurnSprite.setVisible(true);
            this._notificationStartTurnSprite.setPosition(UtilsEngine.getGSIWinCenterPosition());
            this._notificationStartTurnSprite.setScale(0.0);
            this._notificationStartTurnSprite.setOpacity(255.0);
            this._startTurnAfterAutomaticNotificationAction = this._notificationStartTurnSprite.runAction(cc.sequence(
              cc.scaleTo(CONFIG.NOTIFICATION_TRANSITION_DURATION, 1.0).easing(cc.easeExponentialOut()),
              cc.delayTime(CONFIG.NOTIFICATION_DURATION * 0.75),
              cc.spawn(
                cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, 30.0, 0.0).easing(cc.easeExponentialIn()),
                cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
              ),
              cc.callFunc(() => {
                this._finishShowingAfterStartTurn();
              }),
            ));
          }

          // unlock ui
          if (this.getPlayerSelectionLocked()) {
            this.requestPlayerSelectionUnlocked('turn_change');
          } else {
            this._updateGameForPlayerSelectionLockedChange();
          }

          this.getEventBus().trigger(EVENTS.after_show_start_turn, { type: EVENTS.after_show_start_turn });

          // resolve
          this._resolveAfterStartTurnPromise();
        })
        .catch((error) => {
          EventBus.getInstance().trigger(EVENTS.error, error);
        });
    }
  },

  _finishShowingAfterStartTurn() {
    if (this._notificationStartTurnSprite != null) {
      if (this._startTurnAfterAutomaticNotificationAction != null) {
        this._notificationStartTurnSprite.stopAction(this._startTurnAfterAutomaticNotificationAction);
        this._startTurnAfterAutomaticNotificationAction = null;
      }
      if (this._showingStartTurnWithAutomaticActions) {
        this._notificationStartTurnSprite.setVisible(false);
        this._notificationStartTurnSprite = null;
      }
    }
  },

  _resolveBeginStartTurnPromise() {
    if (this._beginShowStartTurnPromiseResolve != null) {
      this._beginShowStartTurnPromiseResolve();
      this._beginShowStartTurnPromiseResolve = null;
    }
  },

  _resolveAfterStartTurnPromise() {
    if (this._afterShowStartTurnPromiseResolve != null) {
      this._afterShowStartTurnPromiseResolve();
      this._afterShowStartTurnPromiseResolve = null;
    }
  },

  _setupStartTurnPromises() {
    // create promise for when start turn is beginning to show
    if (this._beginShowStartTurnPromise == null) {
      this._beginShowStartTurnPromise = new Promise((resolve) => {
        // store resolve so we can resolve even if showing start of turn is interrupted
        this._beginShowStartTurnPromiseResolve = resolve;
      })
        .then(() => {
          this._beginShowStartTurnPromise = null;
        });
    }

    // create promise for after start turn shows
    if (this._afterShowStartTurnPromise == null) {
      this._afterShowStartTurnPromise = new Promise((resolve) => {
        // store resolve so we can resolve even if showing start of turn is interrupted
        this._afterShowStartTurnPromiseResolve = resolve;
      })
        .then(() => {
          this._afterShowStartTurnPromise = null;
        });
    }

    // create promise for when start turn is completely shown
    if (this._showStartTurnPromise == null) {
      this._showStartTurnPromise = Promise.all([
        this._beginShowStartTurnPromise,
        this._afterShowStartTurnPromise,
      ])
        .then(() => {
          this._showStartTurnPromise = null;
        })
        .catch((error) => {
          EventBus.getInstance().trigger(EVENTS.error, error);
        });
    }
  },

  _stopShowingChangeTurn() {
    this._showingEndTurn = false;
    this._showingStartTurn = false;
    this._cleanupShowingEndTurn();
    this._cleanupShowingStartTurn();
    this._finishShowingAfterStartTurn();
    this._resolveBeginStartTurnPromise();
    this._resolveAfterStartTurnPromise();
    this.requestPlayerSelectionUnlocked('turn_change');
  },

  /* endregion GAME STATE */

  /* region STEPS */

  resetStepQueue() {
    this._resetCurrentAction();
    this._resetCurrentStep();
    this._stopShowingChangeTurn();
    this._stopCurrentActionSequences();
    this._setCurrentStepRootActionInterface(null);
    this._waitingToShowStep = null;

    // clear queue
    const stepQueue = this._stepQueue;
    this._stepQueue = [];

    // unload all steps that were in queue
    _.each(stepQueue, (sdkStepInterface) => {
      PackageManager.getInstance().unloadMajorMinorPackages(sdkStepInterface.resourcePackageIds);
    });
  },

  _resetCurrentStep() {
    if (this._currentSdkStepInterface != null) {
      // null step ref
      const sdkStepInterface = this._currentSdkStepInterface;
      this._currentSdkStepInterface = null;

      // unload step resources
      PackageManager.getInstance().unloadMajorMinorPackages(sdkStepInterface.resourcePackageIds);

      // reset step secondary properties
      // TODO: cache as properties on sdkStepInterface
      this._currentStepTargetingMap = [];
      this._currentActionSequence = [];
      this._nextActionIndex = 0;
      this._setCurrentSequenceRootSdkActionInterface(null);
    }
  },

  _resetCurrentAction() {
    this._stopShowActionSequences();
    this._currentSdkActionInterface = null;
    this._currentActionSourceSdkCard = null;
    this._currentActionSourceNode = null;
    this._currentActionTargetSdkCard = null;
    this._currentActionTargetNode = null;
  },

  _stopShowActionSequences() {
    // action sequences used to advance showing the action graph
    this._stopShowActionCardSequence();
    this._stopSetupActionForShowSequence();
    this._stopNextActionSequence();
  },

  _stopCurrentActionSequences() {
    // action sequences used to show parts of the current action
    if (this._showCurrentActionForSourceSequence != null) {
      this.stopAction(this._showCurrentActionForSourceSequence);
      this._showCurrentActionForSourceSequence = null;
    }
    if (this._showCurrentActionForGameSequence != null) {
      this.stopAction(this._showCurrentActionForGameSequence);
      this._showCurrentActionForGameSequence = null;
    }
    if (this._showCurrentActionForTargetSequence != null) {
      this.stopAction(this._showCurrentActionForTargetSequence);
      this._showCurrentActionForTargetSequence = null;
    }
  },

  _stopShowActionCardSequence() {
    if (this._showActionCardSequence != null) {
      this.stopAction(this._showActionCardSequence);
      this._showActionCardSequence = null;
      this._showActionCardSequenceCompletedCallback = null;
    }
  },

  _getShowActionCardSequenceCompletedCallback() {
    let callback = this._showActionCardSequenceCompletedCallback;
    if (callback == null) {
      callback = this.showNextAction.bind(this);
    }
    return callback;
  },

  skipShowActionCardSequence() {
    // skip showing card for action sequence
    if (this._showActionCardSequence != null) {
      const showActionCardSequenceCompletedCallback = this._getShowActionCardSequenceCompletedCallback();
      this._stopShowActionCardSequence();
      this.stopShowingPlayCard();
      showActionCardSequenceCompletedCallback();
    }
  },

  getIsShowingActionCardSequence() {
    return this._showActionCardSequence != null;
  },

  _stopSetupActionForShowSequence() {
    if (this._setupActionForShowSequence) {
      this.stopAction(this._setupActionForShowSequence);
      this._setupActionForShowSequence = null;
    }
  },

  _stopNextActionSequence() {
    if (this._nextActionSequence) {
      this.stopAction(this._nextActionSequence);
      this._nextActionSequence = null;
    }
  },

  _setCurrentStepRootActionInterface(actionInterface) {
    if (this._currentStepRootActionInterface !== actionInterface) {
      this._currentStepRootActionInterface = actionInterface;
      this._hasShownPlayCardActionSetup = false;
      this._removeActionAutoFX();
    }
  },

  _setCurrentSequenceRootSdkActionInterface(sdkActionInterface) {
    if (this._currentSequenceRootSdkActionInterface !== sdkActionInterface) {
      this._currentSequenceRootSdkActionInterface = sdkActionInterface;
      this._currentSequenceMaxDelay = this._currentSequenceMaxTargetReactionDelay = 0.0;
    }
  },

  showNextStep() {
    // reset
    const sdkStepInterface = this._currentSdkStepInterface;
    this._resetCurrentStep();

    // when we have a step currently
    if (sdkStepInterface) {
      // remove current from queue
      if (this._stepQueue.length > 0 && this._stepQueue[0] === sdkStepInterface) {
        this._stepQueue.shift();
      }

      // finish showing step
      this._afterShowStep(sdkStepInterface);
    }

    let currentSdkStepInterface;
    if (this._stepQueue.length > 0) {
      // get next from queue
      currentSdkStepInterface = this._stepQueue[0];
    }

    if (currentSdkStepInterface == null) {
      // clear root action
      this._setCurrentStepRootActionInterface(null);

      // update readiness
      this.updateReadinessTagForAllEntities();
    } else if ((this._showingEndTurn || this._showingStartTurn) && currentSdkStepInterface.getSdkStep().getAction() instanceof SDK.EndTurnAction) {
      if (this._waitingToShowStep == null) {
        // always wait for turn change to finish showing
        this._waitingToShowStep = currentSdkStepInterface;
        this.whenStartTurnShown().then(() => {
          if (this._currentSdkStepInterface == null && this._waitingToShowStep == currentSdkStepInterface) {
            this._waitingToShowStep = null;
            this.showNextStep();
          }
        });
      }
    } else if (this._waitingToShowStep == null) {
      this._currentSdkStepInterface = currentSdkStepInterface;
      // when step is done loading
      currentSdkStepInterface.loadPromise.then(() => {
        // make sure this is still the current step after loading
        if (currentSdkStepInterface === this._currentSdkStepInterface) {
          // check first action of step
          const currentSdkStep = currentSdkStepInterface.getSdkStep();
          const currentAction = currentSdkStep.getAction();
          const currentSdkActionInterface = this._actionInterfacesByIndex[currentAction.getIndex()];

          // set new step root action
          this._setCurrentStepRootActionInterface(currentSdkActionInterface);

          // update readiness
          this.updateReadinessTagForAllEntities();

          // set current step/action properties
          this._currentActionSequence = currentSdkStepInterface.actionInterfaceSequence;
          this._currentStepTargetingMap = [];
          this._nextActionIndex = 0;

          // emit event that we're going to show this step
          this.getEventBus().trigger(EVENTS.before_show_step, { type: EVENTS.before_show_step, step: currentSdkStep });
          Logger.module('ENGINE').log(' -> showNextStep interface', currentSdkStepInterface, 'with action', currentAction);

          // show general cast after explicit apply card to board as long as followup is complete
          let generalCastDelay = 0.0;
          if (currentAction instanceof SDK.ApplyCardToBoardAction && !currentAction.getIsImplicit()) {
            const owner = this.getPlayerById(currentAction.getOwnerId());
            const playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
            if ((owner === this._player && !playerActor.getHasCardsWithFollowup()) || (owner === this._opponent && (currentAction instanceof SDK.PlayCardFromHandAction || currentAction instanceof SDK.PlaySignatureCardAction))) {
              const general = SDK.GameSession.getInstance().getGeneralForPlayerId(currentAction.getOwnerId());
              const generalNode = general && this.getNodeForSdkCard(general);
              if (generalNode != null) {
                generalCastDelay = generalNode.showCastState();
              }
            }
          }

          // start showing actions
          if (generalCastDelay > 0.0) {
            this._setupActionForShowSequence = this.runAction(cc.sequence(
              cc.delayTime(generalCastDelay),
              cc.callFunc(function () {
                this._setupActionForShowSequence = null;
                this.showNextAction();
              }, this),
            ));
          } else {
            this.showNextAction();
          }
        }
      });
    }
  },

  _afterShowStep(sdkStepInterface) {
    const sdkStep = sdkStepInterface != null && sdkStepInterface.getSdkStep();
    const action = sdkStep != null && sdkStep.getAction();
    const myAction = action.getOwnerId() === SDK.GameSession.getInstance().getMyPlayerId();

    // finish showing end/start turn
    if (this._showingEndTurn) {
      this.afterShowEndTurn();
    }
    if (this._showingStartTurn
      && (this._stepQueue.length === 0
      || action == null
      || (!this._stepQueue[0].getSdkStep().getAction().getIsAutomatic()))) {
      this.afterShowStartTurn();
    }

    // show opponent step in battle log after step
    if (!myAction) {
      this._battleLog.showEntry(sdkStep);
    }

    // update stats
    this.updateShowingSdkNodeStats();

    if (myAction
      && (action instanceof SDK.MoveAction
        || action instanceof SDK.AttackAction
        || (action instanceof SDK.ApplyCardToBoardAction && !action.getIsImplicit()))) {
      // reset last mouse over immediately after move/attack/card
      this._resetLastMouseOverPropertiesForAction();
    }

    // emit event
    this.getEventBus().trigger(EVENTS.after_show_step, { type: EVENTS.after_show_step, step: sdkStep });

    // show game over after showing game ending step
    const gameEndingSdkStep = SDK.GameSession.getInstance().getGameEndingStep();
    if (sdkStep != null && gameEndingSdkStep != null && sdkStep.getIndex() === gameEndingSdkStep.getIndex()) {
      this.showGameOver();
    }
  },

  /* endregion STEPS */

  /* region ACTIONS */

  /**
   * Loads all resources required to show a step by traversing that step's flattened action graph.
   * NOTE: the step's load promise can be found at "sdkStepInterface.loadPromise"
   * @param {SdkStepInterface} sdkStepInterface
   * @returns {Promise}
   * @private
   */
  _loadStepResources(sdkStepInterface) {
    // traverse step action graph to determine all package ids that need to be loaded for this step
    const resource_package_ids_seen = {};
    const unique_resource_package_ids = [];
    const load_promises = [];
    const loadActionResourcePackage = function (id) {
      if (id != null && resource_package_ids_seen[id] == null) {
        resource_package_ids_seen[id] = true;
        const pkg = PKGS.getPkgForIdentifier(id);
        if (pkg != null && pkg.length > 0) {
          // load resources with a unique package identifier
          // so we can release this package as needed
          // but anything else using this same package will be preserved
          const unique_resource_package_id = `${id}_${UtilsJavascript.generateIncrementalId()}`;
          unique_resource_package_ids.push(unique_resource_package_id);
          load_promises.push(PackageManager.getInstance().loadMinorPackage(unique_resource_package_id, pkg, 'game'));
        }
      }
    };
    for (let i = 0, il = sdkStepInterface.actionInterfaceSequence.length; i < il; i++) {
      const sdkActionInterface = sdkStepInterface.actionInterfaceSequence[i];
      const sequenceAction = sdkActionInterface.getSdkAction();

      // get resources for source
      const source = sequenceAction.getSource();
      if (source != null) {
        loadActionResourcePackage(PKGS.getCardGamePkgIdentifier(source.getId()));
      }

      // get resources for target
      const target = sequenceAction.getTarget();
      if (target != null) {
        loadActionResourcePackage(PKGS.getCardGamePkgIdentifier(target.getId()));
      }

      // get resources for modifier
      if (sequenceAction instanceof ModifierAction || sequenceAction instanceof SDK.ApplyModifierAction || sequenceAction instanceof SDK.RemoveModifierAction) {
        const modifier = sequenceAction.getModifier();
        if (modifier instanceof SDK.Modifier) {
          loadActionResourcePackage(modifier.getType());
        }
      }
    }

    sdkStepInterface.resourcePackageIds = unique_resource_package_ids;
    sdkStepInterface.loadPromise = Promise.all(load_promises);

    return sdkStepInterface.loadPromise;
  },

  /**
   * Converts a step's action graph into a sequence by generating pseudo-actions for modifiers and rearranging for visual clarity.
   * NOTE: the step's action sequence can be found at "sdkStepInterface.actionInterfaceSequence"
   * @param {SdkStepInterface} sdkStepInterface
   * @private
   */
  _parseStepActionGraph(sdkStepInterface) {
    // get root action for step
    const sdkStep = sdkStepInterface.getSdkStep();
    const rootAction = sdkStep.getAction();
    const rootActionIndex = rootAction.getIndex();

    // check if the first sequence of this step should show all together
    let stepFirstSequenceShowsAllAtOnce = false;
    if (rootAction instanceof SDK.ApplyCardToBoardAction && !rootAction.getIsImplicit()) {
      const card = rootAction.getCard();
      if (card instanceof SDK.Spell) {
        // spells should always sequence as one
        stepFirstSequenceShowsAllAtOnce = true;
      }
    }

    // flatten depth first actions into mix of breadth first and depth first
    let currentActionsFlattening = [rootAction];
    let currentActionsToFlatten = [];
    let nonModifierActionInterfaces = [];
    let modifierActionInterfaces = [];
    while (currentActionsFlattening.length > 0) {
      // shift current action from the list
      var currentAction = currentActionsFlattening.shift();
      const currentActionIndex = currentAction.getIndex();

      // only process actions we've not yet processed
      // skip actions with no sub actions when they are targeting cards in deck
      var sdkActionInterface = this._actionInterfacesByIndex[currentActionIndex];
      if (sdkActionInterface == null && (currentActionIndex === rootActionIndex || !this._getIsActionSkippable(currentAction))) {
        // create action interface for action and map to step
        sdkActionInterface = this._actionInterfacesByIndex[currentActionIndex] = new SdkActionInterface(currentAction);
        sdkActionInterface.setSdkStepInterface(sdkStepInterface);

        // get sub actions, but not resolve sub actions
        // we want to make sure that all actions get shown
        // and there are cases where resolve sub actions are tied to a previous step (ex: followups)
        const subActions = currentAction.getSubActions().slice(0);

        // convert and cache all modifier apply/remove/trigger to their own actions
        this._createModifierActionInterfacesForActionInterface(sdkActionInterface);

        // add current action
        if (currentAction.getCreatedByTriggeringModifier() || currentAction instanceof SDK.ApplyModifierAction || currentAction instanceof SDK.RemoveModifierAction) {
          // action is a modifier action when created by a triggering modifier and not forced to be in the first sequence of actions
          modifierActionInterfaces.push(sdkActionInterface);
        } else {
          // action is created by another action not related to modifiers
          nonModifierActionInterfaces.push(sdkActionInterface);
        }

        // add current action triggered modifier actions
        if (sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces.length > 0) {
          modifierActionInterfaces = modifierActionInterfaces.concat(sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces);
        }

        // cache resolve sub actions and filter
        const resolveSubActions = currentAction.getResolveSubActions();
        if (currentAction instanceof SDK.StopBufferingEventsAction) {
          sdkActionInterface.cachedResolveSubActions = _.union(subActions, _.filter(resolveSubActions, (resolveSubAction) => !this._getIsActionSkippable(resolveSubAction)));
        } else {
          sdkActionInterface.cachedResolveSubActions = [];
          for (var i = 0, il = resolveSubActions.length; i < il; i++) {
            const resolveSubAction = resolveSubActions[i];
            if (!this._getIsActionSkippable(resolveSubAction)) {
              var parentAction = resolveSubAction.getParentAction();
              // don't allow sub actions that belong to an end followup action
              if (!(parentAction instanceof SDK.StopBufferingEventsAction)) {
                sdkActionInterface.cachedResolveSubActions.push(resolveSubAction);
              }
            }
          }
        }

        // find all depth first actions
        for (var i = subActions.length - 1; i >= 0; i--) {
          const subAction = subActions[i];
          if (subAction.getIsDepthFirst()) {
            // add to depth first actions
            currentActionsFlattening.unshift(subAction);

            // remove from sub actions
            subActions.splice(i, 1);
          }
        }

        // add any remaining sub actions for breadth first replay
        if (subActions.length > 0) {
          currentActionsToFlatten = currentActionsToFlatten.concat(subActions);
        }
      }

      if (currentActionsFlattening.length === 0) {
        currentActionsFlattening = currentActionsToFlatten;
        currentActionsToFlatten = [];
      }
    }

    // gather all first sequence actions
    // an action is in the first sequence if it is either the root or one of the root's sub actions
    let firstSequenceActionInterfaces = [];
    for (var i = 0, il = nonModifierActionInterfaces.length; i < il; i++) {
      var currentActionInterface = nonModifierActionInterfaces[i];
      currentActionInterface.isFirstSequence = true;
      firstSequenceActionInterfaces.push(currentActionInterface);
    }

    // set root as root of first sequence
    const rootActionInterface = this._actionInterfacesByIndex[rootActionIndex];
    rootActionInterface.isFirstSequenceRoot = true;
    rootActionInterface.isSequenceRoot = true;
    rootActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(rootAction);
    rootActionInterface.isSequenceSequencedAsOne = rootActionInterface.isSequencedAsOne;

    // force some flattened actions to be the root of a new sequence
    // unless the first sequence is showing all at once
    if (stepFirstSequenceShowsAllAtOnce) {
      for (var i = 0, il = nonModifierActionInterfaces.length; i < il; i++) {
        var currentActionInterface = nonModifierActionInterfaces[i];
        if (currentActionInterface.isFirstSequence) {
          currentActionInterface.isFirstSequenceAndSequencedAsOne = true;
        }
      }
    }

    // setup sequence roots and rearrange modifier actions
    for (var i = 0, il = modifierActionInterfaces.length; i < il; i++) {
      var sdkActionInterface = modifierActionInterfaces[i];
      var currentAction = sdkActionInterface.getSdkAction();
      var parentAction = currentAction.getParentAction();
      var resolveParentAction = parentAction instanceof SDK.StopBufferingEventsAction ? parentAction : currentAction.getResolveParentAction();
      if (resolveParentAction != null) {
        var resolveParentActionInterface = this._actionInterfacesByIndex[resolveParentAction.getIndex()];
        if (resolveParentActionInterface != null
          && resolveParentActionInterface.rearrangedActionInterfaces == null && !resolveParentActionInterface.rearranging
          && ((resolveParentActionInterface.cachedResolveTriggeredModifierActionInterfaces && resolveParentActionInterface.cachedResolveTriggeredModifierActionInterfaces.length > 0)
            || currentAction instanceof SDK.ApplyModifierAction || currentAction instanceof SDK.RemoveModifierAction)) {
          // when the parent action triggers modifiers, get all of its actions depth first
          var rearrangedActionInterfaces = this._getActionInterfacesDepthFirstForTriggeringSequence(resolveParentActionInterface);

          // make parent action a new sequence root
          var sequenceRootSdkActionInterface;
          if (resolveParentAction.getTriggeringModifier() instanceof SDK.ModifierStrikeback) {
            sequenceRootSdkActionInterface = rearrangedActionInterfaces.shift();
          } else {
            sequenceRootSdkActionInterface = resolveParentActionInterface;
          }
          const sequenceRootAction = sequenceRootSdkActionInterface.getSdkAction();
          sequenceRootSdkActionInterface.rearrangedActionInterfaces = rearrangedActionInterfaces;
          sequenceRootSdkActionInterface.isSequenceRoot = true;
          sequenceRootSdkActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(sequenceRootAction);
          sequenceRootSdkActionInterface.isSequenceSequencedAsOne = true;

          if (resolveParentActionInterface.isFirstSequenceAndSequencedAsOne
            && this.getIsActionRemoval(resolveParentAction)) {
            // parent action is part of first sequence as one and it is a removal action
            // remove parent action and any rearranged actions from flattened actions and first sequence actions
            // and move everything to the end of the first sequence
            nonModifierActionInterfaces = _.difference(nonModifierActionInterfaces, rearrangedActionInterfaces);
            nonModifierActionInterfaces = _.without(nonModifierActionInterfaces, resolveParentActionInterface);
            firstSequenceActionInterfaces = _.difference(firstSequenceActionInterfaces, rearrangedActionInterfaces);
            firstSequenceActionInterfaces = _.without(firstSequenceActionInterfaces, resolveParentActionInterface);
            nonModifierActionInterfaces.push(sequenceRootSdkActionInterface);
            firstSequenceActionInterfaces.push(sequenceRootSdkActionInterface);
          }

          // check that sequence root is valid
          if (sequenceRootSdkActionInterface != null && !sequenceRootSdkActionInterface.isFirstSequenceRoot) {
            let isInvalidSequenceRoot = false;
            if (sequenceRootAction.getTriggeringModifierIndex() != null) {
              // actions created by a triggering modifier are not valid sequence roots
              isInvalidSequenceRoot = true;
            } else if (sequenceRootAction instanceof SDK.ApplyCardToBoardAction && sequenceRootAction.getIsValidApplication()) {
              // apply card to board actions that only trigger first blood are invalid sequence roots
              let hasValidTriggeringModifier = false;
              for (var j = 0, jl = rearrangedActionInterfaces.length; j < jl; j++) {
                const rearrangedActionInterface = rearrangedActionInterfaces[j];
                const rearrangedAction = rearrangedActionInterface.getSdkAction();
                if (rearrangedAction instanceof ModifierTriggeredAction && !(rearrangedAction.getModifier() instanceof SDK.ModifierFirstBlood)) {
                  hasValidTriggeringModifier = true;
                  break;
                }
              }
              isInvalidSequenceRoot = !hasValidTriggeringModifier;
            }

            if (isInvalidSequenceRoot) {
              sequenceRootSdkActionInterface.isSequenceRoot = sequenceRootSdkActionInterface.isSequencedAsOne = sequenceRootSdkActionInterface.isSequenceSequencedAsOne = false;
            }
          }
        } else if (!sdkActionInterface.rearranging) {
          // this modifier action has not yet been rearranged
          // if parent is rearranging, get root rearranged action
          if (resolveParentActionInterface.rearranging) {
            resolveParentActionInterface = this._getRootDepthFirstRearrangedActionInterface(resolveParentActionInterface);
          }

          // add actions to the flattened actions (it must not exist there yet)
          if (resolveParentActionInterface.isFirstSequenceAndSequencedAsOne && sdkActionInterface.isSequenceRoot) {
            // parent is a part of the first sequence, add this new sequence to the end of first sequence
            nonModifierActionInterfaces.splice(_.indexOf(nonModifierActionInterfaces, firstSequenceActionInterfaces[firstSequenceActionInterfaces.length - 1]) + 1, 0, sdkActionInterface);
            firstSequenceActionInterfaces.push(sdkActionInterface);
          } else {
            const index = _.indexOf(nonModifierActionInterfaces, resolveParentActionInterface);
            if (index !== -1) {
              nonModifierActionInterfaces.splice(index + 1, 0, sdkActionInterface);
            } else {
              nonModifierActionInterfaces.push(sdkActionInterface);
            }
          }
        }
      }
    }

    // add all sequences
    // order is reversed so the smaller sequences (more accurate) can be added first
    let actionInterfaceSequence = [];
    var addSequencedActions = function (actionInterfaces, rearranged) {
      for (let i = actionInterfaces.length - 1; i >= 0; i--) {
        const sdkActionInterface = actionInterfaces[i];
        const { rearrangedActionInterfaces } = sdkActionInterface;
        if ((!sdkActionInterface.rearranging || rearranged || (rearrangedActionInterfaces != null && rearrangedActionInterfaces.length > 0)) && !_.contains(actionInterfaceSequence, sdkActionInterface)) {
          if (rearrangedActionInterfaces != null) {
            addSequencedActions(rearrangedActionInterfaces, true);
          }
          actionInterfaceSequence.unshift(sdkActionInterface);
        }
      }
    };
    addSequencedActions(nonModifierActionInterfaces);

    // handle triggering modifier actions
    for (var i = actionInterfaceSequence.length - 1; i >= 0; i--) {
      var sdkActionInterface = actionInterfaceSequence[i];
      var currentAction = sdkActionInterface.getSdkAction();
      if (currentAction instanceof ModifierTriggeredAction) {
        const modifier = currentAction.getModifier();
        if (modifier instanceof SDK.Modifier) {
          var resolveParentAction = currentAction.getResolveParentAction();
          var resolveParentActionInterface = this._actionInterfacesByIndex[resolveParentAction.getIndex()];
          let nextActionAfterTriggeringGroupIsSequenceRoot = false;

          // some triggering modifiers must always be followed by a new sequence
          if (resolveParentAction instanceof SDK.AttackAction
            || resolveParentAction instanceof SDK.DamageAsAttackAction
            || (resolveParentActionInterface === rootActionInterface && resolveParentActionInterface.isFirstSequenceAndSequencedAsOne)) {
            nextActionAfterTriggeringGroupIsSequenceRoot = true;
          }

          // some triggering modifiers must always be the root of a new sequence
          if ((resolveParentAction instanceof SDK.AttackAction || resolveParentAction instanceof SDK.DamageAsAttackAction)
            && !(modifier instanceof SDK.ModifierFrenzy || modifier instanceof SDK.ModifierBlastAttack)) {
            sdkActionInterface.isSequenceRoot = true;
            sdkActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(currentAction);
            sdkActionInterface.isSequenceSequencedAsOne = true;
          }

          // in some cases the the next action following trigger actions should be a sequence root
          if (nextActionAfterTriggeringGroupIsSequenceRoot) {
            // find next action that is not a modifier action or has a triggering modifier index
            for (var j = i, jl = actionInterfaceSequence.length; j < jl; j++) {
              var nextActionInterface = actionInterfaceSequence[j];
              var nextAction = nextActionInterface.getSdkAction();
              let nextActionRootAction = nextAction;
              let nextActionResolveParentAction = nextAction.getResolveParentAction();
              while (nextActionResolveParentAction != null && nextActionResolveParentAction != resolveParentAction) {
                nextActionRootAction = nextActionResolveParentAction;
                nextActionResolveParentAction = nextActionResolveParentAction.getResolveParentAction();
              }
              if (!(nextActionRootAction instanceof ModifierAction) && nextActionRootAction.getTriggeringModifierIndex() == null) {
                nextActionInterface.isSequenceRoot = true;
                nextActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(nextAction);
                nextActionInterface.isSequenceSequencedAsOne = true;
                break;
              }
            }
          }
        }
      }
    }

    // ensure certain actions directly follow their parent action
    for (var i = 0, il = actionInterfaceSequence.length; i < il; i++) {
      var sdkActionInterface = actionInterfaceSequence[i];
      var currentAction = sdkActionInterface.getSdkAction();

      if (this._getActionAlwaysFollowsParent(currentAction)) {
        var resolveParentAction = currentAction.getResolveParentAction();
        if (resolveParentAction != null) {
          var resolveParentActionInterface = this._actionInterfacesByIndex[resolveParentAction.getIndex()];
          const indexOfResolveParentAction = _.indexOf(actionInterfaceSequence, resolveParentActionInterface);
          if (i > indexOfResolveParentAction + 1) {
            actionInterfaceSequence.splice(i, 1);
            actionInterfaceSequence.splice(indexOfResolveParentAction + 1, 0, sdkActionInterface);
          }

          // don't allow this action to be a sequence root
          sdkActionInterface.isSequenceRoot = sdkActionInterface.isSequencedAsOne = sdkActionInterface.isSequenceSequencedAsOne = false;
          sdkActionInterface.isFirstSequence = sdkActionInterface.isFirstSequenceAndSequencedAsOne = false;

          // resolve parent action should always be a sequence root
          if (!resolveParentActionInterface.isSequenceRoot) {
            resolveParentActionInterface.isSequenceRoot = true;
            resolveParentActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(resolveParentAction);
            resolveParentActionInterface.isSequenceSequencedAsOne = true;
          }
        }
      }
    }

    // check that all sequences are followed correctly by a sequence root
    // do this backwards so we aren't causing new sequence root checks
    for (var i = actionInterfaceSequence.length - 1; i >= 0; i--) {
      var sdkActionInterface = actionInterfaceSequence[i];
      var { rearrangedActionInterfaces } = sdkActionInterface;

      // check following sequence root
      if (sdkActionInterface.isSequenceRoot && rearrangedActionInterfaces != null && rearrangedActionInterfaces.length > 0) {
        const nextSequenceRootIndex = i + rearrangedActionInterfaces.length + 1;
        const nextSequenceRootActionInterface = actionInterfaceSequence[nextSequenceRootIndex];
        if (nextSequenceRootActionInterface && !nextSequenceRootActionInterface.isSequenceRoot) {
          nextSequenceRootActionInterface.isSequenceRoot = true;
          nextSequenceRootActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(nextSequenceRootActionInterface.getSdkAction());
          nextSequenceRootActionInterface.isSequenceSequencedAsOne = true;
        }
      }
    }

    // when this step ends the game, cache all actions that end the game
    const isGameEndingStep = sdkStep === SDK.GameSession.getInstance().getGameEndingStep();
    if (isGameEndingStep) {
      sdkStepInterface.actionsEndingGame = [];
    }

    // ensure certain actions are always sequence roots
    // this is done before sequence sorting to ensure correct ordering
    const followupTriggerActionMap = {};
    for (var i = 0, il = actionInterfaceSequence.length; i < il; i++) {
      var sdkActionInterface = actionInterfaceSequence[i];
      var currentAction = sdkActionInterface.getSdkAction();
      var sequenceRootSdkActionInterface = null;
      var resolveParentAction = null;
      if (this._getActionIsAlwaysSequenceRoot(currentAction)) {
        sequenceRootSdkActionInterface = sdkActionInterface;

        // both triggering modifier action and this action should be sequence roots
        const { rearrangingParentActionInterface } = sdkActionInterface;
        const rearrangingParentAction = rearrangingParentActionInterface && rearrangingParentActionInterface.getSdkAction();
        if (rearrangingParentAction instanceof ModifierTriggeredAction && !rearrangingParentActionInterface.isSequenceRoot) {
          rearrangingParentActionInterface.isSequenceRoot = true;
          rearrangingParentActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(rearrangingParentAction);
          rearrangingParentActionInterface.isSequenceSequencedAsOne = true;
        }

        // when revealing a hidden card, the action following this one should be a sequence root
        if (currentAction instanceof SDK.RevealHiddenCardAction && actionInterfaceSequence.length > i + 1) {
          var nextActionInterface = actionInterfaceSequence[i + 1];
          var nextAction = nextActionInterface.getSdkAction();
          nextActionInterface.isSequenceRoot = true;
          nextActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(nextAction);
          nextActionInterface.isSequenceSequencedAsOne = true;
        }
      } else if (currentAction.getParentAction() instanceof SDK.StopBufferingEventsAction) {
        const resolveParentActionIndex = currentAction.getResolveParentActionIndex();
        if (followupTriggerActionMap[resolveParentActionIndex] == null) {
          followupTriggerActionMap[resolveParentActionIndex] = true;
          sequenceRootSdkActionInterface = sdkActionInterface;
        }
      }

      // search for actions that end the game
      // these actions should be cached and forced into sequence roots
      if (isGameEndingStep) {
        if (currentAction instanceof SDK.RemoveAction) {
          const target = currentAction.getTarget();
          // cache actions that are killing current or previous generals
          // in the case that generals were swapped during this step, visually we need to show them all dying
          if (target instanceof SDK.Entity && (target.getIsGeneral() || target.getWasGeneral())) {
            sdkStepInterface.actionsEndingGame.unshift(currentAction);
            sequenceRootSdkActionInterface = sdkActionInterface;
          }
        }
      }

      if (sequenceRootSdkActionInterface != null && !sequenceRootSdkActionInterface.isSequenceRoot) {
        sequenceRootSdkActionInterface.isSequenceRoot = true;
        sequenceRootSdkActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(sequenceRootSdkActionInterface.getSdkAction());
        sequenceRootSdkActionInterface.isSequenceSequencedAsOne = true;
      }
    }

    // cross-link all sequences
    let forcedSortIndex = null;
    let sortedActionInterfaces = [];
    let currentSequenceRootSdkActionInterface;
    let currentSequenceActionInterfaces;
    for (var i = 0, il = actionInterfaceSequence.length; i < il; i++) {
      var sdkActionInterface = actionInterfaceSequence[i];
      var currentAction = sdkActionInterface.getSdkAction();
      if (sdkActionInterface.isSequenceRoot) {
        sortedActionInterfaces.push(sdkActionInterface);
        currentSequenceRootSdkActionInterface = sdkActionInterface;
        currentSequenceActionInterfaces = sdkActionInterface.sequenceActionInterfaces = [];

        // force sort index of sequence roots to be right before parent action when overwatch triggers
        // unless overwatch was triggered by a played card
        if (currentAction instanceof ModifierTriggeredAction
            && currentAction.getModifier() instanceof SDK.ModifierOverwatch
            && !(currentAction.getResolveParentAction() instanceof SDK.ApplyCardToBoardAction)) {
          sdkActionInterface.forcedSortIndex = forcedSortIndex = currentAction.getParentActionIndex() - 0.1;
        } else if (forcedSortIndex != null) {
          sdkActionInterface.forcedSortIndex = forcedSortIndex;
        }
      } else {
        // reset forced sort index when done buffering events
        if (currentAction instanceof SDK.StopBufferingEventsAction) {
          forcedSortIndex = null;
        }

        if (currentAction instanceof ModifierAction
          || currentAction instanceof SDK.ApplyModifierAction
          || currentAction instanceof SDK.RemoveModifierAction) {
          let parentSdkActionInterface = sdkActionInterface;
          var parentAction = currentAction;
          while (parentAction instanceof ModifierAction
          || parentAction instanceof SDK.ApplyModifierAction
          || parentAction instanceof SDK.RemoveModifierAction) {
            const parentOfParentAction = parentAction.getParentAction();
            const resolveParentOfParentAction = parentOfParentAction instanceof SDK.StopBufferingEventsAction ? parentOfParentAction : parentAction.getResolveParentAction();
            parentSdkActionInterface = this._actionInterfacesByIndex[resolveParentOfParentAction.getIndex()];
            parentAction = parentSdkActionInterface && parentSdkActionInterface.getSdkAction();
          }
          if (parentSdkActionInterface != null && parentSdkActionInterface != sdkActionInterface) {
            sdkActionInterface.sequenceRootSdkActionInterface = parentSdkActionInterface;
            if (parentSdkActionInterface.sequenceActionInterfaces == null) {
              parentSdkActionInterface.sequenceActionInterfaces = [];
            }
            parentSdkActionInterface.sequenceActionInterfaces.push(sdkActionInterface);
          } else {
            sdkActionInterface.sequenceRootSdkActionInterface = currentSequenceRootSdkActionInterface;
            currentSequenceActionInterfaces.push(sdkActionInterface);
          }
        } else {
          currentSequenceRootSdkActionInterface.sequenceActionInterfacesAreOnlyForModifiers = false;
          sdkActionInterface.sequenceRootSdkActionInterface = currentSequenceRootSdkActionInterface;
          currentSequenceActionInterfaces.push(sdkActionInterface);
        }
      }
    }

    // sort all sequence roots by index
    sortedActionInterfaces = _.sortBy(sortedActionInterfaces, (sdkActionInterface) => {
      const { forcedSortIndex } = sdkActionInterface;
      if (forcedSortIndex != null) {
        return forcedSortIndex;
      }
      const currentAction = sdkActionInterface.getSdkAction();
      if (currentAction instanceof ModifierAction) {
        // use parent action index plus 0.5 as the minimum possible for the next action would be plus 1.0
        // and we want all modifier pseudo-actions to directly follow their parent actions
        return currentAction.getParentActionIndex() + 0.1;
      }
      return currentAction.getIndex();
    });

    // reset actionInterfaceSequence
    actionInterfaceSequence = [];

    // add all sorted sequences
    var addSortedSequence = function (sdkActionInterface) {
      actionInterfaceSequence.push(sdkActionInterface);
      const { sequenceActionInterfaces } = sdkActionInterface;
      if (sequenceActionInterfaces != null && sequenceActionInterfaces.length > 0) {
        for (let i = 0, il = sequenceActionInterfaces.length; i < il; i++) {
          addSortedSequence(sequenceActionInterfaces[i]);
        }
      }
    };
    for (var i = 0, il = sortedActionInterfaces.length; i < il; i++) {
      addSortedSequence(sortedActionInterfaces[i]);
    }

    // complete flattening
    for (var i = actionInterfaceSequence.length - 1; i >= 0; i--) {
      var sdkActionInterface = actionInterfaceSequence[i];
      var currentAction = sdkActionInterface.getSdkAction();

      // add all modifiers that were deactivated/activated just after the action they were removed/added by
      let afterActionModifierActionInterfaces = [];
      if (sdkActionInterface.cachedResolveDeactivatedModifierActionInterfaces != null && sdkActionInterface.cachedResolveDeactivatedModifierActionInterfaces.length > 0) {
        afterActionModifierActionInterfaces = afterActionModifierActionInterfaces.concat(sdkActionInterface.cachedResolveDeactivatedModifierActionInterfaces);
      }
      if (sdkActionInterface.cachedResolveActivatedModifierActionInterfaces != null && sdkActionInterface.cachedResolveActivatedModifierActionInterfaces.length > 0) {
        afterActionModifierActionInterfaces = afterActionModifierActionInterfaces.concat(sdkActionInterface.cachedResolveActivatedModifierActionInterfaces);
      }
      if (afterActionModifierActionInterfaces.length > 0) {
        Array.prototype.splice.apply(actionInterfaceSequence, [i + 1, 0].concat(afterActionModifierActionInterfaces));
      }

      // add all modifiers that changed an action just before the action they changed
      const triggeredModifierActionInterfacesForChanges = sdkActionInterface.cachedTriggeredModifierActionInterfacesForChanges;
      if (triggeredModifierActionInterfacesForChanges && triggeredModifierActionInterfacesForChanges.length > 0) {
        Array.prototype.splice.apply(actionInterfaceSequence, [i, 0].concat(triggeredModifierActionInterfacesForChanges));

        // setup sequencing
        const firstChangeActionInterface = triggeredModifierActionInterfacesForChanges[0];
        firstChangeActionInterface.isSequenceRoot = firstChangeActionInterface.isSequencedAsOne = firstChangeActionInterface.isSequenceSequencedAsOne = sdkActionInterface.isSequenceRoot;
      }

      // ensure some actions are never sequence roots
      // unless action caused modifiers to trigger
      // this is done after all sequence sorting to ensure correct ordering
      if (sdkActionInterface.isSequenceRoot
        && (!this._getActionIsAlwaysSequenceRoot(currentAction)
          || this._getActionIsExceptionToSequenceRoot(currentAction))
        && (sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces == null
          || sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces.length === 0
          || sdkActionInterface.sequenceActionInterfaces == null
          || sdkActionInterface.sequenceActionInterfaces.length === 0
          || sdkActionInterface.sequenceActionInterfacesAreOnlyForModifiers)) {
        var resolveParentAction = currentAction.getResolveParentAction();
        if (resolveParentAction != null) {
          // when current action has more than 1 sibling of the same class
          // and current action is not the first
          var { siblingActions } = sdkActionInterface;
          if (siblingActions == null) {
            // calculate sibling actions
            siblingActions = [currentAction];
            var currentActionType = currentAction.getType();
            const findSiblingsFromActions = function (actions) {
              for (let j = 0, jl = actions.length; j < jl; j++) {
                const action = actions[j];
                if (action.getType() === currentActionType && !_.contains(siblingActions, action)) {
                  // add matching action as sibling
                  siblingActions.push(action);
                }

                // look through sub actions for sibling actions
                const subActions = action.getResolveSubActions();
                for (let k = 0, kl = subActions.length; k < kl; k++) {
                  const subAction = subActions[k];
                  if (subAction.getType() === currentActionType && !_.contains(siblingActions, subAction)) {
                    siblingActions.push(subAction);
                  }
                }
              }
            };
            findSiblingsFromActions(currentAction.getResolveSiblingActions());
            findSiblingsFromActions(resolveParentAction.getResolveSiblingActions());

            // sort siblings by index
            siblingActions = _.sortBy(siblingActions, 'index');

            // cache results with each sibling action
            for (var j = 0, jl = siblingActions.length; j < jl; j++) {
              const siblingAction = siblingActions[j];
              const siblingActionInterface = this._actionInterfacesByIndex[siblingAction.getIndex()];
              // sibling action may not have action interface if it is a skippable action
              if (siblingActionInterface != null) {
                siblingActionInterface.siblingActions = siblingActions;
              }
            }
          }

          // if this action has more than 1 sibling
          if (siblingActions.length > 1) {
            const indexInSiblings = _.indexOf(siblingActions, currentAction);
            if (indexInSiblings === -1) {
              // don't allow this action to be a root if not in sibling actions
              sdkActionInterface.isSequenceRoot = sdkActionInterface.isSequencedAsOne = sdkActionInterface.isSequenceSequencedAsOne = false;
            } else if (siblingActions[0] === currentAction) {
              // don't allow this action to be a root if it is first and did not cause modifiers to trigger, unless it was caused by an attack
              if ((sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces == null
                || sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces.length === 0)
                && !(resolveParentAction instanceof SDK.AttackAction || resolveParentAction instanceof SDK.DamageAsAttackAction)) {
                sdkActionInterface.isSequenceRoot = sdkActionInterface.isSequencedAsOne = sdkActionInterface.isSequenceSequencedAsOne = false;
              }
            } else {
              // don't allow this action to be a root unless previous caused modifiers to trigger
              const previousSiblingAction = siblingActions[indexInSiblings - 1];
              const previousSiblingActionInterface = this._actionInterfacesByIndex[previousSiblingAction.getIndex()];
              if (previousSiblingActionInterface != null
                && (previousSiblingActionInterface.cachedResolveTriggeredModifierActionInterfaces == null
                  || previousSiblingActionInterface.cachedResolveTriggeredModifierActionInterfaces.length === 0
                  || previousSiblingActionInterface.sequenceActionInterfaces == null
                  || previousSiblingActionInterface.sequenceActionInterfaces.length === 0
                  || previousSiblingActionInterface.sequenceActionInterfacesAreOnlyForModifiers)) {
                sdkActionInterface.isSequenceRoot = sdkActionInterface.isSequencedAsOne = sdkActionInterface.isSequenceSequencedAsOne = false;
              }
            }
          }
        }
      }
    }

    // ensure if first action is play card from hand that next action is root of new sequence
    const firstActionInterface = actionInterfaceSequence[0];
    const firstAction = firstActionInterface.getSdkAction();
    if (firstAction instanceof SDK.PlayCardFromHandAction || firstAction instanceof SDK.PlaySignatureCardAction) {
      const secondActionInterface = actionInterfaceSequence[1];
      if (secondActionInterface != null && !secondActionInterface.isSequenceRoot) {
        secondActionInterface.isSequenceRoot = true;
        secondActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(secondActionInterface.getSdkAction());
        secondActionInterface.isSequenceSequencedAsOne = true;
      }
    }

    sdkStepInterface.actionInterfaceSequence = actionInterfaceSequence;
  },

  _logActionInterfaceSequenceHierarchy(actionInterfaceSequence) {
    for (let i = 0; i < actionInterfaceSequence.length; i++) {
      const interf = actionInterfaceSequence[i];
      if (interf.isSequenceRoot) {
        console.log('action', interf.getSdkAction().getLogName());
      } else {
        console.log(' > ', interf.getSdkAction().getLogName());
      }
    }
  },

  _getIsActionSkippable(action) {
    const index = action.getIndex();

    // use cached
    let skippable = this._skippableActionsByIndex[index];
    if (skippable != null) {
      return skippable;
    }
    // assume not skippable
    skippable = false;

    // skip modifier actions that are targeting cards in deck
    if ((action instanceof SDK.ApplyModifierAction || action instanceof SDK.RemoveModifierAction)
        && (action.getTarget() == null || (action.getTarget().getIsLocatedInDeck() && this.getNodeForSdkCard(action.getTarget()) == null))) {
      const subActions = [].concat(action.getSubActions(), action.getResolveSubActions());
      const unskippableSubAction = _.find(subActions, (subAction) => !this._getIsActionSkippable(subAction));
      if (unskippableSubAction == null) {
        skippable = true;
      }
    }

    // cache result
    this._skippableActionsByIndex[index] = skippable;

    return skippable;
  },

  _getActionIsAlwaysSequenceRoot(action) {
    return (action instanceof SDK.PutCardInHandAction && (action instanceof SDK.ReplaceCardFromHandAction || action.getOwnerId() === this.getMyPlayerId()))
      || action instanceof SDK.BurnCardAction
      || action instanceof SDK.PutCardInDeckAction
      || action instanceof SDK.GenerateSignatureCardAction
      || action instanceof SDK.RemoveCardFromHandAction
      || action instanceof SDK.EndTurnAction
      || action instanceof SDK.StartTurnAction
      || action instanceof SDK.MoveAction
      || (action instanceof SDK.TeleportAction && action.getIsValidTeleport())
      || action instanceof SDK.SwapUnitsAction
      || action instanceof SDK.BonusManaAction
      || action instanceof SDK.DamageAsAttackAction
      || action instanceof SDK.DieAction
      || action instanceof SDK.RevealHiddenCardAction;
  },

  _getActionIsExceptionToSequenceRoot(action) {
    return action instanceof SDK.DieAction
      || (action instanceof SDK.TeleportAction && action.getIsValidTeleport())
      || action instanceof SDK.SwapUnitsAction;
  },

  _getActionAlwaysFollowsParent(action) {
    return action instanceof SDK.HurtingDamageAction;
  },

  _getIsActionSequencedAsOne(action) {
    return !(action instanceof SDK.MoveAction);
  },

  _getRootDepthFirstRearrangedActionInterface(actionInterface) {
    if (actionInterface.rearrangingParentActionInterface) {
      return this._getRootDepthFirstRearrangedActionInterface(actionInterface.rearrangingParentActionInterface);
    }
    return actionInterface;
  },

  _getActionInterfacesDepthFirstForTriggeringSequence(sdkActionInterface, depthFirstActionInterfaces) {
    if (depthFirstActionInterfaces == null) { depthFirstActionInterfaces = []; }
    if (sdkActionInterface == null) {
      return depthFirstActionInterfaces;
    }

    const triggeredModifierActionInterfaces = sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces;

    // trigger modifier actions
    if (triggeredModifierActionInterfaces != null && triggeredModifierActionInterfaces.length > 0) {
      // add all triggered modifier actions and their direct sub-actions
      for (var i = 0, il = triggeredModifierActionInterfaces.length; i < il; i++) {
        const triggeredModifierActionInterface = triggeredModifierActionInterfaces[i];
        const triggeredModifierAction = triggeredModifierActionInterface.getSdkAction();
        const modifier = triggeredModifierAction.getModifier();
        if (modifier instanceof SDK.Modifier) {
          // cache actions caused by triggered modifier
          let { cachedResolveTriggerActionInterfaces } = triggeredModifierActionInterface;
          if (cachedResolveTriggerActionInterfaces == null) {
            cachedResolveTriggerActionInterfaces = triggeredModifierActionInterface.cachedResolveTriggerActionInterfaces = [];
            const triggerActions = modifier.getTriggerActionsForActionAndResolveActionIndices(triggeredModifierAction.getParentActionIndex(), triggeredModifierAction.getResolveParentActionIndex());
            for (var j = 0, jl = triggerActions.length; j < jl; j++) {
              var triggerAction = triggerActions[j];
              if (!this._getIsActionSkippable(triggerAction)) {
                var triggerActionInterface = this._actionInterfacesByIndex[triggerAction.getIndex()];
                cachedResolveTriggerActionInterfaces.push(triggerActionInterface);
              }
            }
          }

          // cache depth first trigger actions
          let { cachedResolveDepthFirstTriggerActionInterfaces } = triggeredModifierActionInterface;
          if (cachedResolveDepthFirstTriggerActionInterfaces == null) {
            cachedResolveDepthFirstTriggerActionInterfaces = triggeredModifierActionInterface.cachedResolveDepthFirstTriggerActionInterfaces = [];
            for (var j = 0, jl = cachedResolveTriggerActionInterfaces.length; j < jl; j++) {
              var triggerActionInterface = cachedResolveTriggerActionInterfaces[j];
              var triggerAction = triggerActionInterface.getSdkAction();
              if (triggerAction.getIsDepthFirst()) {
                cachedResolveDepthFirstTriggerActionInterfaces.push(triggerActionInterface);
              }
            }
          }

          // add triggered modifier action
          this._addActionInterfaceToDepthFirstForTriggeringSequence(triggeredModifierActionInterface, sdkActionInterface, depthFirstActionInterfaces);

          // add depth first trigger actions
          for (var j = 0, jl = cachedResolveDepthFirstTriggerActionInterfaces.length; j < jl; j++) {
            var triggerActionInterface = cachedResolveDepthFirstTriggerActionInterfaces[j];
            this._addActionInterfaceToDepthFirstForTriggeringSequence(triggerActionInterface, triggeredModifierActionInterface, depthFirstActionInterfaces);
            this._getActionInterfacesDepthFirstForTriggeringSequence(triggerActionInterface, depthFirstActionInterfaces);
          }

          // remove depth first from trigger actions
          const cachedResolveTriggerActionInterfacesWithoutDepthFirst = _.difference(cachedResolveTriggerActionInterfaces, cachedResolveDepthFirstTriggerActionInterfaces);

          // add actions caused by triggered modifier
          for (var j = 0, jl = cachedResolveTriggerActionInterfacesWithoutDepthFirst.length; j < jl; j++) {
            var triggerActionInterface = cachedResolveTriggerActionInterfacesWithoutDepthFirst[j];
            this._addActionInterfaceToDepthFirstForTriggeringSequence(triggerActionInterface, triggeredModifierActionInterface, depthFirstActionInterfaces);
          }

          // continue depth first
          for (var j = 0, jl = cachedResolveTriggerActionInterfacesWithoutDepthFirst.length; j < jl; j++) {
            var triggerActionInterface = cachedResolveTriggerActionInterfacesWithoutDepthFirst[j];
            this._getActionInterfacesDepthFirstForTriggeringSequence(triggerActionInterface, depthFirstActionInterfaces);
          }
        }
      }
    }

    // sub actions
    const subActions = sdkActionInterface.cachedResolveSubActions;
    if (subActions != null && subActions.length > 0) {
      for (var i = 0, il = subActions.length; i < il; i++) {
        const subAction = subActions[i];
        const subActionInterface = this._actionInterfacesByIndex[subAction.getIndex()];

        // add the action itself
        this._addActionInterfaceToDepthFirstForTriggeringSequence(subActionInterface, sdkActionInterface, depthFirstActionInterfaces);

        // add the action's sub actions
        this._getActionInterfacesDepthFirstForTriggeringSequence(subActionInterface, depthFirstActionInterfaces);
      }
    }

    return depthFirstActionInterfaces;
  },

  _addActionInterfaceToDepthFirstForTriggeringSequence(actionInterface, rearrangingParentActionInterface, depthFirstActionInterfaces) {
    // only add this action interface once to the list of actions
    if (actionInterface && !_.contains(depthFirstActionInterfaces, actionInterface)) {
      actionInterface.rearranging = true;
      actionInterface.rearrangingParentActionInterface = rearrangingParentActionInterface;
      actionInterface.isSequenceRoot = false;
      actionInterface.isSequencedAsOne = false;
      actionInterface.isSequenceSequencedAsOne = false;
      depthFirstActionInterfaces.push(actionInterface);
    }
  },

  /**
   * Shows the next action in the list of current actions, starting an automatic sequence of showing each action until no more are left to show.
   */
  showNextAction() {
    let actionShowDelay = 0;

    // clean up existing action
    let sdkActionInterface = this._currentSdkActionInterface;
    if (sdkActionInterface != null) {
      var action = sdkActionInterface.getSdkAction();

      // keep a record of the most recent non modifier action we've shown with the highest index (later in the game state)
      if ((!this._lastShownSdkStateRecordingAction || action.getIndex() > this._lastShownSdkStateRecordingAction.getIndex())
        && !(action instanceof ModifierAction) && !(action instanceof SDK.ApplyModifierAction) && !(action instanceof SDK.RemoveModifierAction)) {
        this._lastShownSdkStateRecordingAction = action;
        this.updateShowingSdkNodeStats();
      }

      this.getEventBus().trigger(EVENTS.after_show_action, {
        type: EVENTS.after_show_action,
        action,
        sourceSdkCard: this._currentActionSourceSdkCard,
        sourceNode: this._currentActionSourceNode,
        targetSdkCard: this._currentActionTargetSdkCard,
        targetNode: this._currentActionTargetNode,
      });

      this._resetCurrentAction();

      // only show actions until we've shown all the actions that end the game
      if (this._currentSdkStepInterface.getSdkStep() === SDK.GameSession.getInstance().getGameEndingStep()) {
        if (this._currentSdkStepInterface.actionsEndingGame != null) {
          this._currentSdkStepInterface.actionsEndingGame = _.without(this._currentSdkStepInterface.actionsEndingGame, action);
          if (this._currentSdkStepInterface.actionsEndingGame.length === 0) {
            this._currentActionSequence = [];
          }
        }
      }
    }

    const numActions = this._currentActionSequence.length;
    if (numActions > 0 && this._nextActionIndex < numActions) {
      // get next action and advance action index
      sdkActionInterface = this._currentSdkActionInterface = this._currentActionSequence[this._nextActionIndex];
      this._nextActionIndex++;
    } else {
      sdkActionInterface = null;
    }

    // update the pseudo-action sequence
    if (sdkActionInterface == null || sdkActionInterface.isSequenceRoot) {
      this._setCurrentSequenceRootSdkActionInterface(sdkActionInterface);
    }

    if (sdkActionInterface != null) {
      var action = sdkActionInterface.getSdkAction();

      // delay showing action
      if (action instanceof SDK.EndTurnAction) {
        actionShowDelay += this.showEndTurn(action);
      } else if (action instanceof SDK.StartTurnAction) {
        actionShowDelay += this.showStartTurn(action);
      } else if (action.getIsAutomatic()) {
        // automatic action emphasis
        const card = action.getSource();
        if (card instanceof SDK.Unit && this._lastCardWithAutomaticAction !== card) {
          this._lastCardWithAutomaticAction = card;
          if (action instanceof SDK.MoveAction) {
            // show emphasis moving with card node
            actionShowDelay += this._showEmphasisSprite(EmphasisTriggeredSprite.create(), this.getNodeForSdkCard(card));
          } else {
            // show emphasis at location of action
            const boardPosition = action.getSourcePosition();
            const tilePosition = UtilsEngine.transformBoardToTileMap(boardPosition);
            tilePosition.y += CONFIG.TILESIZE * 0.75;
            actionShowDelay += this._showEmphasisSprite(EmphasisTriggeredSprite.create(), tilePosition);
          }
        }
      }
    }

    // rebind usability
    this.bottomDeckLayer.bindHandUsability();
    this.player1Layer.getSignatureCardNode().updateUsability();
    this.player2Layer.getSignatureCardNode().updateUsability();

    // show the current action
    if (sdkActionInterface != null) {
      var action = sdkActionInterface.getSdkAction();
      const myAction = action.getOwnerId() === this._player.getPlayerId();

      // show explicit play card and delay showing of action
      if (!action.getIsImplicit()
        && (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction)
        && (SDK.GameSession.getInstance().getIsSpectateMode() || !myAction)) {
        let animateDuration;
        let showDuration;
        if (SDK.GameSession.getInstance().getIsSpectateMode()) {
          animateDuration = CONFIG.REPLAY_PLAYED_CARD_TRANSITION_DURATION;
          showDuration = CONFIG.REPLAY_PLAYED_CARD_SHOW_DURATION;
          actionShowDelay += CONFIG.REPLAY_PLAYED_CARD_DELAY;
        } else if (!myAction) {
          animateDuration = CONFIG.OPPONENT_PLAYED_CARD_TRANSITION_DURATION;
          showDuration = CONFIG.OPPONENT_PLAYED_CARD_SHOW_DURATION;
          actionShowDelay += CONFIG.OPPONENT_PLAYED_CARD_DELAY;
        }

        // show skippable play card
        this.showSkippablePlayCard(action, animateDuration, showDuration, actionShowDelay, () => {
          this._showAction(sdkActionInterface);
        });
      } else if (actionShowDelay > 0.0) {
        this._setupActionForShowSequence = this.runAction(cc.sequence(
          cc.delayTime(actionShowDelay),
          cc.callFunc(function () {
            this._setupActionForShowSequence = null;
            this._showAction(sdkActionInterface);
          }, this),
        ));
      } else {
        // show action immediately
        this._showAction(sdkActionInterface);
      }
    } else {
      this.showNextStep();
    }
  },

  /**
   * Shows a visual representation of an action and when done shows the next action in the list of current actions.
   * @param {SdkActionInterface} sdkActionInterface
   * @private
   */
  _showAction(sdkActionInterface) {
    if (sdkActionInterface) {
      this._stopShowActionSequences();

      const action = sdkActionInterface.getSdkAction();
      const resolveParentAction = action.getResolveParentAction();
      if (!this._hasShownPlayCardActionSetup && resolveParentAction instanceof SDK.ApplyCardToBoardAction && !resolveParentAction.getIsImplicit() && action.getIsImplicit()) {
        // when the first sub-action of an explicit apply card to board action attempts to show
        // first show explicit apply card to board setup then shown this action
        this._hasShownPlayCardActionSetup = true;

        // show instructional arrow as needed
        const instructionalArrowDelay = this._showApplyCardInstructionalArrow(resolveParentAction);
        this._setupActionForShowSequence = this.runAction(cc.sequence(
          cc.delayTime(instructionalArrowDelay),
          cc.callFunc(() => {
            this._setupActionForShowSequence = null;
            // show automatic fx
            const autoFXDelay = this._showActionAutoFX(resolveParentAction);
            const applyCardTargetFXDelay = this._showApplyCardTargetFX(resolveParentAction);
            const maxFXDelay = Math.max(autoFXDelay, applyCardTargetFXDelay);
            const maxFXDelayCorrection = Math.min(maxFXDelay * 0.25, 1.0);
            const delayBeforeShowingActions = maxFXDelay - maxFXDelayCorrection;
            this._setupActionForShowSequence = this.runAction(cc.sequence(
              cc.delayTime(delayBeforeShowingActions),
              cc.callFunc(() => {
                this._setupActionForShowSequence = null;
                // show action
                this._showAction(sdkActionInterface);
              }),
            ));
          }),
        ));
      } else if (action instanceof SDK.RevealHiddenCardAction) {
        if (action.getIsValidReveal()) {
          // reset the card if it is showing in the battle log
          const revealedCard = action.getCard();
          const battleLogNodes = this._battleLog.getBattleLogNodesInUse();
          for (let i = 0, il = battleLogNodes.length; i < il; i++) {
            const battleLogNode = battleLogNodes[i];
            const battleLogSdkCard = battleLogNode.getSdkCard();
            if (battleLogSdkCard != null
              && battleLogSdkCard.getIndex() === revealedCard.getIndex()
              && battleLogSdkCard.getId() !== revealedCard.getId()) {
              battleLogNode.setSdkCard(revealedCard);
              break;
            }
          }
        }

        // reveal hidden card by showing it as a played card
        this.showPlayCard(action, CONFIG.REVEAL_HIDDEN_CARD_TRANSITION_DURATION, CONFIG.REVEAL_HIDDEN_CARD_SHOW_DURATION, false);

        // setup sequence to show next action after reveal hidden card delay
        // this allows a user to skip the reveal if they wish
        const onShown = function () {
          this._showActionCardSequence = null;
          this.showNextAction();
        }.bind(this);
        this._showActionCardSequenceCompletedCallback = onShown;
        this._showActionCardSequence = this.runAction(cc.sequence(
          cc.delayTime(CONFIG.REVEAL_HIDDEN_CARD_DELAY),
          cc.callFunc(onShown),
        ));
      } else {
        const myAction = action.getOwnerId() === this._player.getPlayerId();
        let actionDelay = 0.0;
        let nextActionDelay = 0.0;
        let showDelay = 0.0;
        let impactDelay = 0.0;
        const sourceBoardPosition = action.getSourcePosition();
        const targetBoardPosition = action.getTargetPosition();
        const sequenceRootSdkActionInterface = this._currentSequenceRootSdkActionInterface;
        const isSequencedAsOne = sdkActionInterface === sequenceRootSdkActionInterface ? sdkActionInterface.isSequencedAsOne : sequenceRootSdkActionInterface.isSequenceSequencedAsOne;
        let isSequenced = !isSequencedAsOne;
        this._lastActionTime = this._actionTime || Date.now();
        this._actionTime = Date.now();
        // Logger.module("ENGINE").log("GameLayer._showAction -> delta time", (this._actionTime - this._lastActionTime) / 1000.0, " is ", action.getLogName(), "root?", sdkActionInterface.isSequenceRoot);
        // show action for game
        nextActionDelay = Math.max(nextActionDelay, this._showActionForGame(action));

        /*
         // show modifier emphasis
         if (action instanceof ModifierAction || action instanceof SDK.ApplyModifierAction || action instanceof SDK.RemoveModifierAction) {
         nextActionDelay = Math.max(nextActionDelay, this._showModifierEmphasis(action));
         }
         */

        // show action for modifier
        nextActionDelay = Math.max(nextActionDelay, this._showActionForModifier(action));

        // wait to trigger before show action until just after action starts to show
        // this way, if the action created new nodes, they can be included in the event
        const _currentActionSourceSdkCard = this._currentActionSourceSdkCard = action.getSource();
        const _currentActionSourceNode = this._currentActionSourceNode = this.getNodeForSdkCard(_currentActionSourceSdkCard);
        const _currentActionTargetSdkCard = this._currentActionTargetSdkCard = action.getTarget();
        const _currentActionTargetNode = this._currentActionTargetNode = this.getNodeForSdkCard(_currentActionTargetSdkCard);
        this.getEventBus().trigger(EVENTS.before_show_action, {
          type: EVENTS.before_show_action,
          action,
          sourceSdkCard: _currentActionSourceSdkCard,
          sourceNode: _currentActionSourceNode,
          targetSdkCard: _currentActionTargetSdkCard,
          targetNode: _currentActionTargetNode,
        });

        // get game fx board positions
        let gameFXSourceBoardPosition;
        let gameFXTargetBoardPosition;
        if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication()) {
          const card = action.getCard();
          if (card instanceof SDK.Spell) {
            gameFXSourceBoardPosition = gameFXTargetBoardPosition = card.getCenterPositionOfAppliedEffects();
          } else if (card instanceof SDK.Artifact) {
            const general = SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId());
            if (general != null) {
              gameFXSourceBoardPosition = gameFXTargetBoardPosition = general.getPosition();
            }
          }
        }

        if (gameFXSourceBoardPosition == null) {
          gameFXSourceBoardPosition = sourceBoardPosition;
        }
        if (gameFXTargetBoardPosition == null) {
          gameFXTargetBoardPosition = targetBoardPosition;
        }

        // show special apply card fx
        actionDelay = Math.max(actionDelay, this._showActionForApplyCard(action, gameFXTargetBoardPosition));

        // source reaction and fx when there is a source entity
        if (_currentActionSourceNode) {
          const sourceFX = this._getActionFXData(action, SDK.FXType.SourceFX);
          const sourceFXSprites = NodeFactory.createFX(sourceFX);
          const sourceFXDelays = UtilsEngine.getDelaysFromFXSprites(sourceFXSprites);
          showDelay = Math.max(showDelay, sourceFXDelays.showDelay);
          this._showCurrentActionForSourceSequence = this.runAction(cc.sequence(
            cc.delayTime(actionDelay),
            cc.callFunc(() => {
              this._showCurrentActionForSourceSequence = null;
              this._showActionForSource(action, _currentActionSourceSdkCard, _currentActionSourceNode, sourceFXSprites);
            }),
          ));

          // add attack delay from source
          if ((action instanceof SDK.AttackAction || action instanceof SDK.DamageAsAttackAction)
            && _currentActionSourceNode != null && _currentActionSourceNode.getAnimResource() != null) {
            const attackDelay = (_currentActionSourceNode.getAnimResource().attackDelay || 0.0) * CONFIG.ENTITY_ATTACK_DURATION_MODIFIER;
            actionDelay += attackDelay;
            nextActionDelay = Math.max(nextActionDelay, attackDelay);
          }
        }

        // game fx
        // shown at the center of the application pattern when possible
        const gameFX = this._getActionFXData(action, SDK.FXType.GameFX);
        const gameFXEvent = {
          sourceBoardPosition: gameFXSourceBoardPosition,
          targetBoardPosition: gameFXTargetBoardPosition,
          offset: { x: 0.0, y: CONFIG.TILESIZE * 0.5 },
          forAutoFX: true,
        };
        const gameFXSprites = NodeFactory.createFX(gameFX, gameFXEvent);
        const gameFXDelays = UtilsEngine.getDelaysFromFXSprites(gameFXSprites);
        showDelay = Math.max(showDelay, gameFXDelays.showDelay);
        impactDelay = Math.max(impactDelay, gameFXDelays.impactDelay);
        this._showCurrentActionForGameSequence = this.runAction(cc.sequence(
          cc.delayTime(actionDelay),
          cc.callFunc(function () {
            this._showCurrentActionForGameSequence = null;
            this.addNodes(gameFXSprites, gameFXEvent);
          }, this),
        ));

        // target reaction and fx when there is a target entity
        const targetReactionDelay = actionDelay + impactDelay;
        this._currentSequenceMaxTargetReactionDelay = Math.max(this._currentSequenceMaxTargetReactionDelay, targetReactionDelay);
        let targetDelays = 0.0;
        if (_currentActionTargetNode) {
          const targetFX = this._getActionFXData(action, SDK.FXType.TargetFX);
          const targetFXSprites = NodeFactory.createFX(targetFX);
          const targetFXDelays = UtilsEngine.getDelaysFromFXSprites(targetFXSprites);
          targetDelays = targetFXDelays.showDelay;
          this._showCurrentActionForTargetSequence = this.runAction(cc.sequence(
            cc.delayTime(isSequencedAsOne ? this._currentSequenceMaxTargetReactionDelay : targetReactionDelay),
            cc.callFunc(function () {
              this._showCurrentActionForTargetSequence = null;
              this._showActionForTarget(action, _currentActionTargetSdkCard, _currentActionTargetNode, targetFXSprites);
            }, this),
          ));
        }

        // show action for artifact
        nextActionDelay = Math.max(nextActionDelay, this.player1Layer.showActionForArtifact(action, this._currentSequenceMaxTargetReactionDelay));
        nextActionDelay = Math.max(nextActionDelay, this.player2Layer.showActionForArtifact(action, this._currentSequenceMaxTargetReactionDelay));

        // special cases show delay
        if (action instanceof SDK.DieAction && _currentActionTargetNode != null && _currentActionTargetNode.getAnimResource() != null) {
          // special case for die actions
          showDelay = this.getDelayFromAnim(_currentActionTargetNode.getAnimResource().death);
        } else if (this.getIsActionSpawn(action) || action instanceof SDK.RemoveAction) {
          // special case for apply entity actions
          showDelay = CONFIG.ACTION_DELAY;
        } else {
          // simple show delay
          showDelay = Math.max(showDelay, targetDelays);
        }

        // check sequencing
        if (!isSequenced) {
          const nextActionInterface = this.getNextActionInterfaceInActionSequence(true);
          // sequence the last action in the sequence and use the max delay
          if (this._nextActionIndex === this._currentActionSequence.length || (nextActionInterface && nextActionInterface.isSequenceRoot)) {
            isSequenced = true;
            showDelay = Math.max(showDelay, this._currentSequenceMaxDelay);
            this._currentSequenceMaxDelay = 0.0;
          }
        }

        // apply show delay
        nextActionDelay = Math.max(nextActionDelay, showDelay);
        // nextActionDelay += showDelay;
        // Logger.module("ENGINE").log( " > _showAction finish", action.getLogName(), "isSequenced", isSequenced, "nextActionDelay", nextActionDelay, "showDelay", showDelay, "targetDelays", targetDelays, "actionDelay", actionDelay)

        // record max target delays of each action
        this._currentSequenceMaxDelay = Math.max(nextActionDelay, this._currentSequenceMaxDelay);

        // set delays to skip
        if (!isSequenced) {
          nextActionDelay = 0;
        }

        // reset max delays after root when root is not sequenced as one
        if (sdkActionInterface === sequenceRootSdkActionInterface && !sdkActionInterface.isSequencedAsOne) {
          this._currentSequenceMaxDelay = this._currentSequenceMaxTargetReactionDelay = 0.0;
        }

        // special fx for non-implicit actions
        this._showActionSpecialFX(action, nextActionDelay, targetReactionDelay);

        // next action
        if (nextActionDelay > 0) {
          this._nextActionSequence = cc.sequence(
            cc.delayTime(nextActionDelay),
            cc.callFunc(() => {
              this._nextActionSequence = null;
              this.showNextAction();
            }),
          );
          this.runAction(this._nextActionSequence);
        } else {
          this.showNextAction();
        }
      }
    }
  },

  _getCanShowActionForNode(node) {
    return node != null && node.isRunning();
  },

  _getIsActionShowingAttackState(action) {
    if (action instanceof SDK.AttackAction || action instanceof SDK.DamageAsAttackAction) {
      return true;
    } if (action.getTriggeringModifierIndex() != null && action.getTargetPosition() != null
      && (action instanceof SDK.DamageAction
        || action instanceof SDK.KillAction
        || (action instanceof SDK.ApplyCardToBoardAction && !(action.getTriggeringModifier() instanceof SDK.GameSessionModifier) && action.getIsValidApplication()))) {
      const resolveParentAction = action.getResolveParentAction();
      if (!(resolveParentAction instanceof SDK.AttackAction || resolveParentAction instanceof SDK.DamageAsAttackAction) || resolveParentAction.getSource() !== action.getSource()) {
        return true;
      }
    }
    return false;
  },

  _showActionForGame(action) {
    let showDuration = 0.0;
    if (action) {
      const source = action.getSource();
      const target = action.getTarget();
      let node;

      // handle action by type
      if (action instanceof SDK.ApplyCardToBoardAction) {
        // search for card in hand and unbind if found
        if (target instanceof SDK.Card) {
          const cardNodes = this.bottomDeckLayer.getCardNodes();
          for (let i = 0, il = cardNodes.length; i < il; i++) {
            const cardNode = cardNodes[i];
            const cardInHand = cardNode.getSdkCard();
            if (target === cardInHand) {
              showDuration = Math.max(showDuration, this.bottomDeckLayer.showRemoveCard(i));
              break;
            }
          }

          if (action.getIsValidApplication()) {
            if (target instanceof SDK.Entity) {
              // show node spawning
              node = this.getNodeForSdkCard(target);
              if (node instanceof EntityNode) {
                node.showSpawn();
              }
            } else {
              // play apply sound
              const soundResource = target.getSoundResource();
              const sfx_apply = soundResource && soundResource.apply;
              if (sfx_apply != null) {
                audio_engine.current().play_effect(sfx_apply, false);
              }
            }
          }
        }
      } else if (action.type === SDK.MoveAction.type) {
        node = this.getNodeForSdkCard(source);
        if (this._getCanShowActionForNode(node)) {
          showDuration += node.showMove(action, action.getSourcePosition(), action.getTargetPosition());
        }
      } else if (action instanceof SDK.DieAction) {

      } else if (action instanceof SDK.TeleportAction && action.getIsValidTeleport()) {
        node = this.getNodeForSdkCard(source);
        if (this._getCanShowActionForNode(node)) {
          showDuration += node.showTeleport(action, action.getTargetPosition());
        }
      } else if (action.type === SDK.SwapUnitsAction.type) {
        if (source) {
          node = this.getNodeForSdkCard(source);
          if (this._getCanShowActionForNode(node)) {
            showDuration = Math.max(showDuration, node.showTeleport(action, action.getTargetPosition()));
          }
        }

        if (target) {
          node = this.getNodeForSdkCard(target);
          if (this._getCanShowActionForNode(node)) {
            showDuration = Math.max(showDuration, node.showTeleport(action, action.getSourcePosition()));
          }
        }
      } else if (action instanceof SDK.PutCardInHandAction) {
        var playerId = action.getOwnerId();
        if (action instanceof SDK.DrawCardAction && action.getIsDrawFromEmptyDeck()) {
          // show player out of cards dialogue
          if (!_.contains(this._currentSdkStepInterface.hasShownOutOfCardsForPlayerIds, playerId)) {
            this._currentSdkStepInterface.hasShownOutOfCardsForPlayerIds.push(playerId);
            showDuration = Math.max(showDuration, this.showSpeechForPlayer(this.getPlayerById(playerId), i18next.t('game_ui.out_of_cards_message'), null, CONFIG.DIALOGUE_OUT_OF_CARDS_DURATION, false, 0.3));
          }
        } else if (action.getIsBurnedCard()) {
          if (action.getOwner().getDeck().getCardsInHandExcludingMissing().length == CONFIG.MAX_HAND_SIZE) {
            // show hand too full dialogue
            var dialogDuration = 0.0;
            if (!_.contains(this._currentSdkStepInterface.hasShownHandFullForPlayerIds, playerId)) {
              this._currentSdkStepInterface.hasShownHandFullForPlayerIds.push(playerId);
              dialogDuration = this.showSpeechForPlayer(this.getPlayerById(playerId), i18next.t('game_ui.hand_is_full_message'), null, CONFIG.DIALOGUE_HAND_FULL_DURATION, false, 0.3);
            }
          }

          // show burned card
          const burnShowDuration = CONFIG.BURN_CARD_SHOW_DURATION;
          const dissolveDelay = CONFIG.BURN_CARD_DELAY;
          const dissolveDuration = CONFIG.BURN_CARD_DISSOLVE_DURATION;
          if (dialogDuration == undefined) {
            dialogDuration = 0.0;
          }
          this.showBurnCard(action, dialogDuration * 0.1, burnShowDuration, dissolveDelay, dissolveDuration);

          // set show duration
          if (playerId === this.getMyPlayerId()) {
            showDuration = Math.max(showDuration, dialogDuration * 0.1 + burnShowDuration + dissolveDelay + dissolveDuration);
          }
        } else {
          // show replace indicator over general
          if (action instanceof SDK.ReplaceCardFromHandAction) {
            const replaceIndicatorSprite = new BaseSprite(RSX.replace_indicator.img);
            replaceIndicatorSprite.setOpacity(0.0);

            const generalSdkCard = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId);
            const generalNode = this.getNodeForSdkCard(generalSdkCard);
            const generalNodePosition = generalNode.getPosition();
            replaceIndicatorSprite.setPosition(generalNodePosition.x, generalNodePosition.y + CONFIG.TILESIZE * 0.75);

            this.uiLayer.addChild(replaceIndicatorSprite, this._ui_z_order_indicators);

            // animate
            const showAction = cc.sequence(
              cc.spawn(
                cc.fadeIn(CONFIG.FADE_FAST_DURATION).easing(cc.easeExponentialOut()),
                cc.moveBy(CONFIG.MOVE_MEDIUM_DURATION, 0, 20.0).easing(cc.easeExponentialOut()),
              ),
              cc.delayTime(0.2),
              cc.spawn(
                cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION).easing(cc.easeExponentialIn()),
                cc.moveBy(CONFIG.FADE_MEDIUM_DURATION, 0, 20.0).easing(cc.easeExponentialIn()),
              ),
              cc.removeSelf(),
            );
            replaceIndicatorSprite.runAction(showAction);
            showDuration = Math.max(showDuration, CONFIG.MOVE_MEDIUM_DURATION * 2.0);
          }

          // show drawing of card
          showDuration = Math.max(showDuration, this.bottomDeckLayer.showDrawCard(action) * 0.5);
        }
      } else if (action instanceof SDK.RemoveCardFromHandAction) {
        if (action.getOwnerId() === this.getMyPlayerId()) {
          showDuration = Math.max(showDuration, this.bottomDeckLayer.showRemoveCard(action.getIndexOfCardInHand()));
        }
      } else if (action instanceof SDK.PutCardInDeckAction) {
        var playerId = action.getOwnerId();
        this._currentSdkStepInterface.hasShownOutOfCardsForPlayerIds = _.without(this._currentSdkStepInterface.hasShownOutOfCardsForPlayerIds, playerId);
      } else if (action instanceof SDK.GenerateSignatureCardAction) {
        if (action.getOwnerId() === SDK.GameSession.getInstance().getPlayer2Id()) {
          showDuration = Math.max(showDuration, this.player2Layer.showGenerateSignatureCard(action) * 0.5);
        } else {
          showDuration = Math.max(showDuration, this.player1Layer.showGenerateSignatureCard(action) * 0.5);
        }
      } else if (action instanceof SDK.ActivateSignatureCardAction) {
        if (action.getOwnerId() === SDK.GameSession.getInstance().getPlayer2Id()) {
          showDuration = Math.max(showDuration, this.player2Layer.showActivateSignatureCard(action) * 0.5);
        } else {
          showDuration = Math.max(showDuration, this.player1Layer.showActivateSignatureCard(action) * 0.5);
        }
      }

      this.getEventBus().trigger(EVENTS.show_action_for_game, { type: EVENTS.show_action_for_game, action });
    }

    return showDuration;
  },

  /*
  _showModifierEmphasis: function(action, duration, delay) {
    var showDuration = 0.0;
    var modifier = action.getModifier();
    var boardPosition = action.getTargetPosition();
    var tilePosition = UtilsEngine.transformBoardToTileMap(boardPosition);
    tilePosition.y += CONFIG.TILESIZE * 0.75;

    if (!(modifier instanceof SDK.ModifierStrikeback
      || modifier instanceof SDK.ModifierCollectableBonusMana
      || modifier instanceof SDK.ModifierFirstBlood)) {
      // find sprite identifier
      var spriteIdentifier;
      if (action instanceof SDK.RemoveModifierAction || action instanceof ModifierDeactivatedAction) {
        // modifier getting removed
        if (modifier instanceof SDK.PlayerModifierManaModifier) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_lose_mana.img), tilePosition, duration, delay));
        }
      } else if (action instanceof SDK.ApplyModifierAction || action instanceof ModifierActivatedAction) {
        // modifier getting applied
        if (modifier instanceof SDK.ModifierProvoked || modifier instanceof SDK.ModifierRangedProvoked) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_lose_mana.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.PlayerModifierManaModifier) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_gain_mana.img), tilePosition, duration, delay));
        }
      } else if (!(modifier instanceof SDK.PlayerModifierManaModifier)) {
        // modifier getting triggered
        if (modifier instanceof SDK.ModifierBanding) {
          // zeal add/remove
          if (modifier.getTriggerRemovedModifiersForAction(action).length > 0) {
            showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_unzealed.img), tilePosition, duration, delay));
          } else if (modifier.getTriggerAppliedModifiersForAction(action).length > 0) {
            showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_zealed.img), tilePosition, duration, delay));
          }
        } else if (modifier instanceof SDK.ModifierBanded) {
          // zealed
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_zealed.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierInfiltrate) {
          // infiltrate add/remove
          if (modifier.getTriggerRemovedModifiersForAction(action).length > 0) {
            showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_uninfiltrated.img), tilePosition, duration, delay));
          } else if (modifier.getTriggerAppliedModifiersForAction(action).length > 0) {
            showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_infiltrated.img), tilePosition, duration, delay));
          }
        } else if (modifier instanceof SDK.ModifierRebirth || modifier instanceof SDK.ModifierEgg) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_rebirth.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierGrow) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_grow.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierProvoke || modifier instanceof SDK.ModifierRangedProvoke) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_provoked.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierStackingShadows) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_shadow_creep.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierEphemeral) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_ephemeral.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierFrenzy) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_frenzy.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierDeathWatch) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_death_watch.img), tilePosition, duration, delay));
        } else if (modifier instanceof SDK.ModifierDyingWish) {
          showDuration = Math.max(showDuration, this._showEmphasisSprite(BaseSprite.create(RSX.modifier_dying_wish.img), tilePosition, duration, delay));
        } else {
          // default triggered modifiers sprite
          showDuration = Math.max(showDuration, this._showEmphasisSprite(EmphasisTriggeredSprite.create(), tilePosition, duration, delay));
        }
      }
    }

    return showDuration;
  },
  */
  _showEmphasisSprite(emphasisSprite, positionOrCardNode, duration, delay) {
    // set durations
    if (delay == null) {
      delay = 0;
    }
    if (duration == null) {
      duration = CONFIG.ACTION_EXCLAMATION_MARK_DURATION;
    }
    const showDuration = duration * CONFIG.ACTION_EXCLAMATION_MARK_SHOW_PERCENT;

    // add emphasis
    emphasisSprite.setOpacity(0.0);
    emphasisSprite.runAction(
      cc.sequence(
        cc.delayTime(delay),
        cc.fadeIn(0.2),
        cc.sequence(
          cc.moveBy(0.3, cc.p(0, 10)).easing(cc.easeSineInOut()),
          cc.moveBy(0.3, cc.p(0, -10)).easing(cc.easeSineInOut()),
        ).repeat(Math.ceil(duration / 0.6)),
        cc.callFunc(() => {
          emphasisSprite.destroy(0.2);
        }),
      ),
    );
    if (positionOrCardNode instanceof EntityNode) {
      const position = positionOrCardNode.getCenterPosition();
      emphasisSprite.setPosition(position.x, position.y + CONFIG.TILESIZE * 0.25);
      positionOrCardNode.addChild(emphasisSprite);
    } else {
      emphasisSprite.setPosition(positionOrCardNode);
      this.uiLayer.addChild(emphasisSprite, this._ui_z_order_instructional_nodes);
    }

    return showDuration;
  },

  _showActionForApplyCard(action, targetBoardPosition) {
    let showDuration = 0.0;

    if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication()) {
      const card = action.getCard();

      // legendary
      if (card.getRarityId() === SDK.Rarity.Legendary) {
        const specialFXData = DATA.dataForIdentifiers('FX.Game.CardLegendaryPlayFX');
        const specialFXOptions = {
          sourceBoardPosition: targetBoardPosition,
          targetBoardPosition,
          offset: { x: 0.0, y: CONFIG.TILESIZE * 0.5 },
          forAutoFX: true,
        };
        const actionSpecialFXSprites = NodeFactory.createFX(specialFXData, specialFXOptions);
        const actionSpecialFXDelays = UtilsEngine.getDelaysFromFXSprites(actionSpecialFXSprites);
        this.addNodes(actionSpecialFXSprites, specialFXOptions);
        showDuration = Math.max(showDuration, actionSpecialFXDelays.showDelay * 0.5);
      }

      // prismatic
      if (SDK.Cards.getIsPrismaticCardId(card.getId())) {
        const prismaticPlayCardNode = PrismaticPlayCardNode.create();
        const prismaticNodeScreenPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
        prismaticPlayCardNode.setPosition(prismaticNodeScreenPosition);
        this.addNode(prismaticPlayCardNode);
        showDuration = Math.max(showDuration, prismaticPlayCardNode.getShowDelay());
      }
    }

    return showDuration;
  },

  _showActionForSource(action, sourceSdkCard, sourceNode, fxSprites) {
    if (action && sourceSdkCard != null && this._getCanShowActionForNode(sourceNode)) {
      // handle action by type
      if (sourceSdkCard instanceof SDK.Entity) {
        if (action.type === SDK.HealAction.type) {
          // only show healer state when same team as target
          const target = action.getTarget(true);
          if (!target || sourceSdkCard.getIsSameTeamAs(target)) {
            sourceNode.showHealerState(action);
          }
        } else if (this._getIsActionShowingAttackState(action)) {
          sourceNode.showAttackState(action);
        }
      } else if (sourceSdkCard instanceof SDK.Spell) {
        // nothing yet
      }

      // create fx
      sourceNode.showFX(fxSprites);

      this.getEventBus().trigger(EVENTS.show_action_for_source, {
        type: EVENTS.show_action_for_source, action, sdkCard: sourceSdkCard, node: sourceNode,
      });
    }
  },

  _showActionForTarget(action, targetSdkCard, targetNode, fxSprites) {
    if (action && targetSdkCard != null && this._getCanShowActionForNode(targetNode)) {
      // handle action by type
      if (targetSdkCard instanceof SDK.Entity) {
        if (action instanceof SDK.DamageAction) {
          if (CONFIG.razerChromaEnabled) {
            Chroma.flashActionThrottled(new Chroma.Color('FF0000'), 100, action.getTotalDamageAmount())
              .then(() => {
                if (this.getIsMyTurn()) {
                  Chroma.setAll(CONFIG.razerChromaIdleColor);
                } else {
                  Chroma.setAll(new Chroma.Color('FFFFFF'));
                }
              });
          }
          targetNode.showAttackedState(action);
        } else if (action instanceof SDK.DieAction) {
          if (CONFIG.razerChromaEnabled) {
            Chroma.flashActionThrottled(new Chroma.Color('FF0000'), 1000, 1)
              .then(() => {
                if (this.getIsMyTurn()) {
                  Chroma.setAll(CONFIG.razerChromaIdleColor);
                } else {
                  Chroma.setAll(new Chroma.Color('FFFFFF'));
                }
              });
          }
          targetNode.showDeathState(action);
        } else if (action.type === SDK.HealAction.type) {
          if (CONFIG.razerChromaEnabled) {
            Chroma.flashActionThrottled(new Chroma.Color('00FF00'), 100, action.getTotalHealAmount())
              .then(() => {
                if (this.getIsMyTurn()) {
                  Chroma.setAll(CONFIG.razerChromaIdleColor);
                } else {
                  Chroma.setAll(new Chroma.Color('FFFFFF'));
                }
              });
          }
          targetNode.showHealedState(action);
        } else if (action instanceof SDK.RemoveAction) {
          targetNode.showDisappearState(action);
        } else if (action instanceof SDK.KillAction) {
          if (CONFIG.razerChromaEnabled) {
            Chroma.flashActionThrottled(new Chroma.Color('FF0000'), 1000, 1)
              .then(() => {
                if (this.getIsMyTurn()) {
                  Chroma.setAll(CONFIG.razerChromaIdleColor);
                } else {
                  Chroma.setAll(new Chroma.Color('FFFFFF'));
                }
              });
          }
          targetNode.showDestroyedState(action);
        } else if (action.type === SDK.RefreshExhaustionAction.type) {
          targetNode.showRefreshExhaustionState(action);
        } else if (action.type === SDK.SwapUnitAllegianceAction.type) {
          targetNode.showSwapAllegianceState(action);
        }
      } else if (targetSdkCard instanceof SDK.Spell) {
        // nothing yet
      } else if (targetSdkCard instanceof SDK.Artifact) {
        // nothing yet
      }

      // create fx
      targetNode.showFX(fxSprites);

      this.getEventBus().trigger(EVENTS.show_action_for_target, {
        type: EVENTS.show_action_for_target, action, sdkCard: targetSdkCard, node: targetNode,
      });
    }
  },

  /* endregion ACTIONS */

  /* region ACTION AUTO FX */

  _getActionFXData(action, fxType, rootAction) {
    let fxData = [];
    if (action && fxType != null) {
      const fxResource = action.getFXResource();

      // get the fx for this type from the action
      fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResource, fxType));

      // root action gives us the behavior switch
      rootAction || (rootAction = action);
      const source = action.getSource();
      const target = action.getTarget();

      // get action fx data for known behavior
      if (rootAction instanceof SDK.ApplyCardToBoardAction && rootAction.getIsValidApplication()) {
        // apply card to board
        const card = rootAction.getCard();
        if (card instanceof SDK.Spell) {
          // spells
          if (fxType === SDK.FXType.GameFX) {
            fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, card.getFXResource()), SDK.FXType.SpellCastFX));
          } else if (fxType === SDK.FXType.TargetFX) {
            // spell target fx is trickier so we need to composite it from many sources
            var fxResources = _.union(fxResource, card.getFXResource());
            // always add applied fx
            fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.SpellAppliedFX));
            /* // fx by target team
            if (card.getIsSameTeamAs(target)) {
              fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.SpellAppliedFriendFX));
            } else {
              fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.SpellAppliedEnemyFX));
            }
            // fx by action type
            if (action instanceof SDK.DamageAction || action instanceof SDK.KillAction) {
              fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.SpellDamagedFX));
            } else if (action instanceof SDK.HealAction) {
              fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.SpellHealedFX));
            } */
          }
        } else if (card instanceof SDK.Entity) {
          // entities
          if (fxType === SDK.FXType.GameFX) {
            fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, card.getFXResource()), SDK.FXType.UnitSpawnFX));
          }
        }
      } else if (rootAction instanceof SDK.AttackAction || rootAction instanceof SDK.DamageAsAttackAction) {
        // attacks
        if (source && fxType === SDK.FXType.GameFX) {
          var fxResources = _.union(fxResource, source.getFXResource());
          fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.UnitAttackedFX));
          // show extra primary attacked fx for the explicit attack
          if (!rootAction.getIsImplicit()) {
            fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.UnitPrimaryAttackedFX));
          }
        } else if (target && fxType === SDK.FXType.TargetFX) {
          fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, target.getFXResource()), SDK.FXType.UnitDamagedFX));
        }
      } else if (rootAction instanceof SDK.DamageAction || rootAction instanceof SDK.KillAction) {
        // damage
        if (target && fxType === SDK.FXType.TargetFX) {
          fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, target.getFXResource()), SDK.FXType.UnitDamagedFX));
        }
      } else if (rootAction instanceof SDK.DieAction) {
        // death
        if (target && target.getType() != SDK.CardType.Tile && fxType === SDK.FXType.GameFX) {
          fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, target.getFXResource()), SDK.FXType.UnitDiedFX));
        }
      } else if (rootAction instanceof SDK.HealAction) {
        // heal
        if (target && fxType === SDK.FXType.TargetFX) {
          fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, target.getFXResource()), SDK.FXType.UnitHealedFX));
        }
      }

      if (!(action instanceof SDK.RemoveModifierAction) && (!(action instanceof SDK.ApplyModifierAction) || !action.getModifier().getIsHiddenToUI())) {
        const triggeringModifier = action.getTriggeringModifier();
        if (triggeringModifier && target) {
          fxData = this._getActionModifierFXData(triggeringModifier, fxType, fxData);
        }

        const changedByModifiers = action.getChangedByModifiers();
        for (let i = 0, il = changedByModifiers.length; i < il; i++) {
          fxData = this._getActionModifierFXData(changedByModifiers[i], fxType, fxData);
        }
      }
    }
    return fxData;
  },

  _getActionModifierFXData(modifier, fxType, fxData) {
    if (fxType === SDK.FXType.GameFX) {
      fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierTriggeredFX));
    } else if (fxType === SDK.FXType.SourceFX) {
      fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierTriggeredSourceFX));
    } else if (fxType === SDK.FXType.TargetFX) {
      fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierTriggeredTargetFX));
    }

    return fxData;
  },

  _showActionAutoFX(action) {
    let showDuration = 0.0;
    if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction) {
      const card = action.getCard();

      // get applied effect positions
      let applyEffectPosition;
      let applyEffectPositions;
      if (card instanceof SDK.Spell) {
        applyEffectPosition = card.getCenterPositionOfAppliedEffects();
        applyEffectPositions = card.getApplyEffectPositions();
      } else if (card instanceof SDK.Artifact) {
        const general = SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId());
        if (general != null) {
          applyEffectPosition = general.getPosition();
        }
      } else {
        applyEffectPosition = action.getTargetPosition();
      }

      if (applyEffectPositions == null || applyEffectPositions.length === 0) {
        applyEffectPositions = [applyEffectPosition];
      }

      // use automatic action fx when playing spells
      if (card instanceof SDK.Spell) {
        this._currentSequenceNeedsAutoFX = true;

        // show auto fx at all apply effect positions
        if (applyEffectPositions && applyEffectPositions.length > 0) {
          let needsDelays = true;
          const factionId = card.getFactionId();
          const faction = SDK.FactionFactory.factionForIdentifier(factionId);
          const factionSpellAutoFX = DATA.dataForIdentifiersWithFilter(faction.fxResource, SDK.FXType.SpellAutoFX);
          const columnCount = SDK.GameSession.getInstance().getBoard().getColumnCount();
          for (let i = 0, il = applyEffectPositions.length; i < il; i++) {
            const boardPosition = applyEffectPositions[i];
            const fxMapIndex = UtilsPosition.getMapIndexFromPosition(columnCount, boardPosition.x, boardPosition.y);
            if (this._currentStepAutoFXMap[fxMapIndex] == null) {
              const autoFXOptions = {
                targetBoardPosition: boardPosition,
                forAutoFX: true,
              };
              const actionAutoFXSprites = NodeFactory.createFX(factionSpellAutoFX, autoFXOptions);

              // delays only need to be calculated once
              if (needsDelays) {
                needsDelays = false;
                const actionAutoFXDelays = UtilsEngine.getDelaysFromFXSprites(actionAutoFXSprites);
                showDuration = actionAutoFXDelays.showDelay;
              }

              this.addNodes(actionAutoFXSprites, autoFXOptions);
            }
          }
        }
      }
    }

    return showDuration;
  },

  _removeActionAutoFX() {
    if (this._currentStepAutoFXMap && this._currentStepAutoFXMap.length > 0) {
      for (let i = 0, il = this._currentStepAutoFXMap.length; i < il; i++) {
        const fxSprites = this._currentStepAutoFXMap[i];
        if (fxSprites && fxSprites.length > 0) {
          for (let j = 0, jl = fxSprites.length; j < jl; j++) {
            fxSprites[j].destroy(CONFIG.PLAYED_SPELL_FX_FADE_OUT_DURATION);
          }
        }
      }
    }

    this._currentStepAutoFXMap = [];
    this._currentSequenceNeedsAutoFX = false;
  },

  _showApplyCardTargetFX(action) {
    let showDuration = 0.0;
    if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication() && !action.getCreatedByTriggeringModifier() && (!(action instanceof ModifierAction) || (!(action instanceof ModifierTriggeredAction) && !action.getModifierParent()))) {
      const card = action.getCard();
      if (card instanceof SDK.Spell) {
        // create target fx at each applied effect position
        const applyEffectPositions = card.getApplyEffectPositions();
        if (applyEffectPositions && applyEffectPositions.length > 0) {
          // get fx options
          var applyFX = this._getActionFXData(action, SDK.FXType.TargetFX);
          if (applyFX && applyFX.length > 0) {
            let needsDelays = true;
            for (let i = 0, il = applyEffectPositions.length; i < il; i++) {
              var boardPosition = applyEffectPositions[i];
              var applyFXOptions = {
                targetBoardPosition: boardPosition,
                offset: { x: 0.0, y: CONFIG.TILESIZE * 0.5 },
              };
              var applyFXSprites = NodeFactory.createFX(applyFX, applyFXOptions);

              // delays only need to be calculated once
              if (needsDelays) {
                needsDelays = false;
                var applyFXDelays = UtilsEngine.getDelaysFromFXSprites(applyFXSprites);
                showDuration = applyFXDelays.showDelay;
              }

              this.addNodes(applyFXSprites, applyFXOptions);
            }
          }
        }
      } else if (card instanceof SDK.Artifact) {
        const general = SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId());
        if (general != null) {
          var boardPosition = general.getPosition();
          var applyFX = DATA.dataForIdentifiersWithFilter(card.getFXResource(), SDK.FXType.ArtifactAppliedFX);
          var applyFXOptions = {
            targetBoardPosition: boardPosition,
            offset: { x: 0.0, y: CONFIG.TILESIZE * 0.5 },
          };
          var applyFXSprites = NodeFactory.createFX(applyFX, applyFXOptions);
          var applyFXDelays = UtilsEngine.getDelaysFromFXSprites(applyFXSprites);
          showDuration = applyFXDelays.showDelay;
          this.addNodes(applyFXSprites, applyFXOptions);
        }
      }
    }

    return showDuration;
  },

  _showApplyCardInstructionalArrow(action) {
    let showDuration = 0.0;
    let myAction = action && action.getOwnerId() === this._player.getPlayerId();
    myAction = myAction && !SDK.GameSession.current().getIsSpectateMode();
    if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication() && !myAction && !action.getCreatedByTriggeringModifier() && (!(action instanceof ModifierAction) || (!(action instanceof ModifierTriggeredAction) && !action.getModifierParent()))) {
      const card = action.getCard();
      if (card instanceof SDK.Spell) {
        const applyEffectPositions = card.getApplyEffectPositions();
        const columnCount = SDK.GameSession.getInstance().getBoard().getColumnCount();
        for (let i = 0, il = applyEffectPositions.length; i < il; i++) {
          const boardPosition = applyEffectPositions[i];
          const mapIndex = UtilsPosition.getMapIndexFromPosition(columnCount, boardPosition.x, boardPosition.y);
          if (this._currentStepTargetingMap[mapIndex] == null) {
            // mark location as used so we only show targeting arrow fx once at any position in a sequence
            this._currentStepTargetingMap[mapIndex] = action;
            const arrowPosition = UtilsEngine.transformBoardToTileMap(boardPosition);
            const randomDelay = il > 2 ? Math.random() * 0.15 : 0.0;
            showDuration = Math.max(showDuration, this._showInstructionalArrow(cc.p(arrowPosition.x, arrowPosition.y + CONFIG.TILESIZE * 0.75), randomDelay));
          }
        }
      }
    }

    return showDuration;
  },

  showInstructionalArrowForEntityNode(entityNode, delay, duration) {
    const arrowPosition = entityNode.getPosition();
    this._showInstructionalArrow(cc.p(arrowPosition.x, arrowPosition.y + entityNode.entitySprite.height * 0.9));
  },

  showInstructionalArrowForBoardPosition(boardPosition, delay, duration) {
    const arrowPosition = UtilsEngine.transformBoardToScreen(boardPosition);
    return this._showInstructionalArrow(cc.p(arrowPosition.x, arrowPosition.y + CONFIG.TILESIZE * 0.25), delay, duration);
  },

  _showInstructionalArrow(position, delay, duration) {
    if (delay == null) { delay = 0; }
    if (duration == null) { duration = CONFIG.ACTION_INSTRUCTIONAL_ARROW_DURATION; }
    const showDuration = (delay + duration) * CONFIG.ACTION_INSTRUCTIONAL_ARROW_SHOW_PERCENT;

    // the instructional arrow focuses on units that your opponent is applying spells to
    const instructionalArrowSprite = InstructionalArrowSprite.create();
    instructionalArrowSprite.setPosition(cc.p(position.x, position.y + 400));
    instructionalArrowSprite.setOpacity(0.0);
    instructionalArrowSprite.runAction(
      cc.sequence(
        cc.delayTime(delay),
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
        cc.moveTo(duration * 0.6, cc.p(position.x, position.y + 10)).easing(cc.easeExponentialOut()),
        cc.delayTime(duration * 0.5),
        cc.callFunc(() => {
          instructionalArrowSprite.destroy(CONFIG.FADE_FAST_DURATION);
        }),
      ),
    );

    this.uiLayer.addChild(instructionalArrowSprite, this._ui_z_order_instructional_nodes);

    return showDuration;
  },

  showPersistentInstructionalArrow(position, delay, duration) {
    // returns instructional arrow
    if (delay == null) { delay = 0; }
    if (duration == null) { duration = CONFIG.ACTION_INSTRUCTIONAL_ARROW_DURATION; }

    // TODO: The following code is being commented/uncommented to reenable glows for tutorial because we need them
    // - but these should be done better, details are documented here:
    // https://trello.com/c/debKE11n/633-persistent-instructional-arrows-need-to-be-created-and-used-efficiently
    // var instructionalArrowSprite = InstructionalArrowSprite.create();
    /// *
    const instructionalArrowSprite = GlowSprite.create({
      spriteIdentifier: RSX.instructional_arrow.img,
      antiAlias: false,
      needsDepthDraw: true,
      scale: CONFIG.SCALE * 0.5, // TODO: Default scale makes this huge
    });
    instructionalArrowSprite.setGlowing(true);
    instructionalArrowSprite.setGlowNoiseExpandModifier(100);
    instructionalArrowSprite.setGlowThickness(1);
    instructionalArrowSprite.setGlowMinAlpha(0);
    instructionalArrowSprite.setGlowMaxAlpha(75);
    instructionalArrowSprite.setGlowFrequency(CONFIG.INSTRUCTIONAL_CARROT_GLOW_FREQUENCY);
    //* /
    instructionalArrowSprite.setPosition(cc.p(position.x, position.y + 400));
    instructionalArrowSprite.setOpacity(0.0);
    instructionalArrowSprite.runAction(
      cc.sequence(
        cc.delayTime(delay),
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
        cc.moveTo(duration * 0.6, cc.p(position.x, position.y + 10)).easing(cc.easeExponentialOut()),
      ),
    );

    this.uiLayer.addChild(instructionalArrowSprite, this._ui_z_order_instructional_nodes);

    return instructionalArrowSprite;
  },

  _showActionSpecialFX(action, nextActionDelay, targetReactionDelay) {
    let needsScreenFocus;
    let sfDurationIn;
    let sfDelay;
    let sfDurationOut;
    let shakeDuration;
    let shakeStrength;
    let radialBlurSpread;
    let radialBlurDeadZone;
    let radialBlurStrength;

    if ((action instanceof SDK.AttackAction || action instanceof SDK.DamageAsAttackAction)
      && action.getTotalDamageAmount() >= CONFIG.HIGH_DAMAGE) {
      // high damage attack
      needsScreenFocus = true;
      sfDurationIn = CONFIG.HIGH_DAMAGE_SCREEN_FOCUS_IN_DURATION;
      sfDelay = CONFIG.HIGH_DAMAGE_SCREEN_FOCUS_DELAY;
      sfDurationOut = CONFIG.HIGH_DAMAGE_SCREEN_FOCUS_OUT_DURATION;
      shakeDuration = CONFIG.HIGH_DAMAGE_SCREEN_SHAKE_DURATION;
      shakeStrength = CONFIG.HIGH_DAMAGE_SCREEN_SHAKE_STRENGTH;
      radialBlurSpread = CONFIG.HIGH_DAMAGE_RADIAL_BLUR_SPREAD;
      radialBlurDeadZone = CONFIG.HIGH_DAMAGE_RADIAL_BLUR_DEAD_ZONE;
      radialBlurStrength = CONFIG.HIGH_DAMAGE_RADIAL_BLUR_STRENGTH;
    } else if (this.getIsActionSpawn(action) && action.getCard().getBaseManaCost() >= CONFIG.HIGH_COST) {
      // high mana cost entity
      needsScreenFocus = true;
      sfDurationIn = CONFIG.HIGH_COST_SCREEN_FOCUS_IN_DURATION;
      sfDelay = CONFIG.HIGH_COST_SCREEN_FOCUS_DELAY;
      sfDurationOut = CONFIG.HIGH_COST_SCREEN_FOCUS_OUT_DURATION;
      shakeDuration = CONFIG.HIGH_COST_SCREEN_SHAKE_DURATION;
      shakeStrength = CONFIG.HIGH_COST_SCREEN_SHAKE_STRENGTH;
      radialBlurSpread = CONFIG.HIGH_COST_RADIAL_BLUR_SPREAD;
      radialBlurDeadZone = CONFIG.HIGH_COST_RADIAL_BLUR_DEAD_ZONE;
      radialBlurStrength = CONFIG.HIGH_COST_RADIAL_BLUR_STRENGTH;
    }

    if (needsScreenFocus) {
      const sfDurationTotal = sfDurationIn + sfDelay + sfDurationOut;
      const safeDuration = Math.max(nextActionDelay - targetReactionDelay, sfDurationTotal);

      // run radial blur on scene as it is modifying global state
      const scene = this.getScene();
      scene.stopActionByTag(CONFIG.FOCUS_TAG);

      const screenFocusPosition = UtilsEngine.transformBoardToTileMap(action.getTargetPosition());
      sfDurationIn = Math.min(sfDurationIn, sfDurationIn / sfDurationTotal * safeDuration);
      sfDelay = Math.min(sfDelay, sfDelay / sfDurationTotal * safeDuration);
      sfDurationOut = Math.min(sfDurationOut, sfDurationTotal / sfDurationTotal * safeDuration);

      const screenFocusAction = cc.sequence(
        cc.delayTime(targetReactionDelay),
        cc.EaseExponentialOut.create(RadialBlurTo.create(sfDurationIn, screenFocusPosition, radialBlurSpread, radialBlurDeadZone, radialBlurStrength)),
        cc.delayTime(sfDelay),
        cc.EaseExponentialIn.create(RadialBlurTo.create(sfDurationOut, screenFocusPosition, 0.0, radialBlurDeadZone, radialBlurStrength)),
      );
      screenFocusAction.setTag(CONFIG.FOCUS_TAG);
      scene.runAction(screenFocusAction);

      // shake screen
      const shakeOffset = Math.min(0.1, sfDurationIn * 0.5);
      this.getFXLayer().runAction(cc.sequence(
        cc.delayTime(targetReactionDelay + shakeOffset),
        Shake.create(shakeDuration, shakeStrength, cc.p(0, 0)),
      ));
    }
  },

  /* endregion ACTION AUTO FX */

  /* region MODIFIERS */

  _createModifierActionInterfacesForActionInterface(sdkActionInterface) {
    const gameSession = SDK.GameSession.getInstance();
    const action = sdkActionInterface.getSdkAction();
    const actionIndex = action.getIndex();
    const deactivatedModifierActionInterfaces = [];
    let resolveDeactivatedModifierActionInterfaces = [];
    const activatedModifierActionInterfaces = [];
    let resolveActivatedModifierActionInterfaces = [];
    let triggeredModifierActionInterfaces = [];
    let resolveTriggeredModifierActionInterfaces = [];
    const triggeredModifierActionInterfacesForChanges = [];

    // deactivated modifiers
    const deactivatedModifiersData = action.getDeactivatedModifiersData();
    var lastDataModifierIndex = null;
    var lastDataActionIndex = null;
    var lastDataResolveActionIndex = null;
    for (var i = 0, il = deactivatedModifiersData.length; i < il; i += 3) {
      var dataModifierIndex = deactivatedModifiersData[i];
      var dataActionIndex = deactivatedModifiersData[i + 1];
      var dataResolveActionIndex = deactivatedModifiersData[i + 2];
      if (dataModifierIndex !== lastDataModifierIndex || dataActionIndex !== lastDataActionIndex || dataResolveActionIndex !== lastDataResolveActionIndex) {
        var parentAction = gameSession.getActionByIndex(dataActionIndex);
        if (!(parentAction instanceof SDK.StopBufferingEventsAction) || action instanceof SDK.StopBufferingEventsAction) {
          var resolveParentAction = gameSession.getActionByIndex(dataResolveActionIndex);
          var modifier = gameSession.getModifierByIndex(dataModifierIndex);
          if (modifier != null && (!modifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(modifier.getCardAffected()) != null)) {
            var modifierActionInterface = this._createActionInterfaceForDeactivatedModifier(modifier, parentAction, resolveParentAction, sdkActionInterface);
            if (actionIndex === dataActionIndex && actionIndex === dataResolveActionIndex) {
              deactivatedModifierActionInterfaces.push(modifierActionInterface);
              resolveDeactivatedModifierActionInterfaces.push(modifierActionInterface);
            } else {
              if (actionIndex === dataActionIndex) {
                deactivatedModifierActionInterfaces.push(modifierActionInterface);
              }
              if (actionIndex === dataResolveActionIndex) {
                resolveDeactivatedModifierActionInterfaces.push(modifierActionInterface);
              }
            }
          }
        }
      }

      lastDataModifierIndex = dataModifierIndex;
      lastDataActionIndex = dataActionIndex;
      lastDataResolveActionIndex = dataResolveActionIndex;
    }

    // activated modifiers
    const activatedModifiersData = action.getActivatedModifiersData();
    var lastDataModifierIndex = null;
    var lastDataActionIndex = null;
    var lastDataResolveActionIndex = null;
    for (var i = 0, il = activatedModifiersData.length; i < il; i += 3) {
      var dataModifierIndex = activatedModifiersData[i];
      var dataActionIndex = activatedModifiersData[i + 1];
      var dataResolveActionIndex = activatedModifiersData[i + 2];
      if (dataModifierIndex !== lastDataModifierIndex || dataActionIndex !== lastDataActionIndex || dataResolveActionIndex !== lastDataResolveActionIndex) {
        var parentAction = gameSession.getActionByIndex(dataActionIndex);
        if (!(parentAction instanceof SDK.StopBufferingEventsAction) || action instanceof SDK.StopBufferingEventsAction) {
          var resolveParentAction = gameSession.getActionByIndex(dataResolveActionIndex);
          var modifier = gameSession.getModifierByIndex(dataModifierIndex);
          if (modifier != null && (!modifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(modifier.getCardAffected()) != null)) {
            var modifierActionInterface = this._createActionInterfaceForActivatedModifier(modifier, parentAction, resolveParentAction, sdkActionInterface);
            if (actionIndex === dataActionIndex && actionIndex === dataResolveActionIndex) {
              activatedModifierActionInterfaces.push(modifierActionInterface);
              resolveActivatedModifierActionInterfaces.push(modifierActionInterface);
            } else {
              if (actionIndex === dataActionIndex) {
                activatedModifierActionInterfaces.push(modifierActionInterface);
              }
              if (actionIndex === dataResolveActionIndex) {
                resolveActivatedModifierActionInterfaces.push(modifierActionInterface);
              }
            }
          }
        }
      }
      lastDataModifierIndex = dataModifierIndex;
      lastDataActionIndex = dataActionIndex;
      lastDataResolveActionIndex = dataResolveActionIndex;
    }

    // triggered modifiers
    const triggeredModifiersData = action.getTriggeredModifiersData();
    var lastDataModifierIndex = null;
    var lastDataActionIndex = null;
    var lastDataResolveActionIndex = null;
    const changedByModifiers = action.getChangedByModifiers();
    for (var i = 0, il = triggeredModifiersData.length; i < il; i += 3) {
      var dataModifierIndex = triggeredModifiersData[i];
      var dataActionIndex = triggeredModifiersData[i + 1];
      var dataResolveActionIndex = triggeredModifiersData[i + 2];
      if (dataModifierIndex !== lastDataModifierIndex || dataActionIndex !== lastDataActionIndex || dataResolveActionIndex !== lastDataResolveActionIndex) {
        var parentAction = gameSession.getActionByIndex(dataActionIndex);
        if (!(parentAction instanceof SDK.StopBufferingEventsAction) || action instanceof SDK.StopBufferingEventsAction) {
          var resolveParentAction = gameSession.getActionByIndex(dataResolveActionIndex);
          var modifier = gameSession.getModifierByIndex(dataModifierIndex);
          if (modifier != null && (!modifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(modifier.getCardAffected()) != null)) {
            var modifierActionInterface = this._createActionInterfaceForTriggeredModifier(modifier, parentAction, resolveParentAction, sdkActionInterface);
            if (this._getIsActionChangingTriggeringModifier(modifier, changedByModifiers)) {
              triggeredModifierActionInterfacesForChanges.push(modifierActionInterface);
            } else {
              const modifierActionInterfaces = this._createTriggerModifierActionInterfacesForTriggeringModifier(modifier, parentAction, resolveParentAction, sdkActionInterface);
              if (actionIndex === dataActionIndex && actionIndex === dataResolveActionIndex) {
                triggeredModifierActionInterfaces.push(modifierActionInterface);
                resolveTriggeredModifierActionInterfaces.push(modifierActionInterface);
                triggeredModifierActionInterfaces = triggeredModifierActionInterfaces.concat(modifierActionInterfaces);
                resolveTriggeredModifierActionInterfaces = resolveTriggeredModifierActionInterfaces.concat(modifierActionInterfaces);
              } else {
                if (actionIndex === dataActionIndex) {
                  triggeredModifierActionInterfaces.push(modifierActionInterface);
                  triggeredModifierActionInterfaces = triggeredModifierActionInterfaces.concat(modifierActionInterfaces);
                }
                if (actionIndex === dataResolveActionIndex) {
                  resolveTriggeredModifierActionInterfaces.push(modifierActionInterface);
                  resolveTriggeredModifierActionInterfaces = resolveTriggeredModifierActionInterfaces.concat(modifierActionInterfaces);
                }
              }
            }
          }
        }
      }
      lastDataModifierIndex = dataModifierIndex;
      lastDataActionIndex = dataActionIndex;
      lastDataResolveActionIndex = dataResolveActionIndex;
    }

    // special case for stop buffering events actions: copy non resolve actions into resolve actions
    if (action instanceof SDK.StopBufferingEventsAction) {
      resolveDeactivatedModifierActionInterfaces = _.union(deactivatedModifierActionInterfaces, resolveDeactivatedModifierActionInterfaces);
      resolveActivatedModifierActionInterfaces = _.union(activatedModifierActionInterfaces, resolveActivatedModifierActionInterfaces);
      resolveTriggeredModifierActionInterfaces = _.union(triggeredModifierActionInterfaces, resolveTriggeredModifierActionInterfaces);
    }

    sdkActionInterface.cachedResolveDeactivatedModifierActionInterfaces = resolveDeactivatedModifierActionInterfaces;
    sdkActionInterface.cachedResolveActivatedModifierActionInterfaces = resolveActivatedModifierActionInterfaces;
    sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces = resolveTriggeredModifierActionInterfaces;
    sdkActionInterface.cachedTriggeredModifierActionInterfacesForChanges = triggeredModifierActionInterfacesForChanges;
  },

  _getIsActionChangingTriggeringModifier(modifier, actionChangedByModifiers) {
    let changedAction = false;
    for (let j = 0, jl = actionChangedByModifiers.length; j < jl; j++) {
      const changedByModifier = actionChangedByModifiers[j];
      if (changedByModifier === modifier) {
        changedAction = true;
        break;
      }
    }
    return changedAction;
  },

  _createTriggerModifierActionInterfacesForTriggeringModifier(modifier, parentAction, resolveParentAction, sdkActionInterface) {
    const modifierActionInterfaces = [];

    // trigger deactivated modifiers
    const deactivatedModifiers = modifier.getTriggerDeactivatedModifiersForActionAndResolveAction(parentAction, resolveParentAction);
    for (var i = 0, il = deactivatedModifiers.length; i < il; i++) {
      const deactivatedModifier = deactivatedModifiers[i];
      if (deactivatedModifier != null && (!deactivatedModifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(deactivatedModifier.getCardAffected()) != null)) {
        var modifierActionInterface = this._createActionInterfaceForDeactivatedModifier(deactivatedModifier, parentAction, resolveParentAction, sdkActionInterface);
        var modifierAction = modifierActionInterface.getSdkAction();
        modifierAction.setParentModifier(modifier);
        modifierActionInterfaces.push(modifierActionInterface);
      }
    }

    // trigger activated self
    const activatedModifiers = modifier.getTriggerActivatedModifiersForActionAndResolveAction(parentAction, resolveParentAction);
    for (var i = 0, il = activatedModifiers.length; i < il; i++) {
      var activatedModifier = activatedModifiers[i];
      if (activatedModifier === modifier && (!activatedModifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(activatedModifier.getCardAffected()) != null)) {
        var modifierActionInterface = this._createActionInterfaceForActivatedModifier(activatedModifier, parentAction, resolveParentAction, sdkActionInterface);
        var modifierAction = modifierActionInterface.getSdkAction();
        modifierAction.setParentModifier(modifier);
        modifierActionInterfaces.push(modifierActionInterface);
      }
    }

    // trigger activated modifiers
    for (var i = 0, il = activatedModifiers.length; i < il; i++) {
      var activatedModifier = activatedModifiers[i];
      if (activatedModifier !== modifier && (!activatedModifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(activatedModifier.getCardAffected()) != null)) {
        var modifierActionInterface = this._createActionInterfaceForActivatedModifier(activatedModifier, parentAction, resolveParentAction, sdkActionInterface);
        var modifierAction = modifierActionInterface.getSdkAction();
        modifierAction.setParentModifier(modifier);
        modifierActionInterfaces.push(modifierActionInterface);
      }
    }

    return modifierActionInterfaces;
  },

  _createActionInterfaceForDeactivatedModifier(modifier, parentAction, resolveParentAction, sdkActionInterface) {
    const modifierIndex = modifier.getIndex();
    const parentActionIndex = parentAction.getIndex();
    const resolveParentActionIndex = resolveParentAction.getIndex();
    const modifierActionIndex = `${modifierIndex}_${parentActionIndex}_${resolveParentActionIndex}_deactivated`;
    const sdkStepInterface = sdkActionInterface.getSdkStepInterface();
    let modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex];
    if (modifierActionInterface == null) {
      const modifierAction = new ModifierDeactivatedAction(SDK.GameSession.getInstance(), modifier);
      modifierAction.setIndex(modifierActionIndex);
      modifierAction.setParentAction(parentAction);
      modifierAction.setResolveParentAction(resolveParentAction);
      modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex] = new SdkActionInterface(modifierAction);
      modifierActionInterface.setSdkStepInterface(sdkStepInterface);
      modifierActionInterface.isSequencedAsOne = true;
    }
    return modifierActionInterface;
  },

  _createActionInterfaceForActivatedModifier(modifier, parentAction, resolveParentAction, sdkActionInterface) {
    const modifierIndex = modifier.getIndex();
    const parentActionIndex = parentAction.getIndex();
    const resolveParentActionIndex = resolveParentAction.getIndex();
    const modifierActionIndex = `${modifierIndex}_${parentActionIndex}_${resolveParentActionIndex}_activated`;
    const sdkStepInterface = sdkActionInterface.getSdkStepInterface();
    let modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex];
    if (modifierActionInterface == null) {
      const modifierAction = new ModifierActivatedAction(SDK.GameSession.getInstance(), modifier);
      modifierAction.setIndex(modifierActionIndex);
      modifierAction.setParentAction(parentAction);
      modifierAction.setResolveParentAction(resolveParentAction);
      modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex] = new SdkActionInterface(modifierAction);
      modifierActionInterface.setSdkStepInterface(sdkStepInterface);
      modifierActionInterface.isSequencedAsOne = true;
    }
    return modifierActionInterface;
  },

  _createActionInterfaceForTriggeredModifier(modifier, parentAction, resolveParentAction, sdkActionInterface) {
    const modifierIndex = modifier.getIndex();
    const parentActionIndex = parentAction.getIndex();
    const resolveParentActionIndex = resolveParentAction.getIndex();
    const modifierActionIndex = `${modifierIndex}_${parentActionIndex}_${resolveParentActionIndex}_triggered`;
    const sdkStepInterface = sdkActionInterface.getSdkStepInterface();
    let modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex];
    if (modifierActionInterface == null) {
      const modifierAction = new ModifierTriggeredAction(SDK.GameSession.getInstance(), modifier);
      modifierAction.setIndex(modifierActionIndex);
      modifierAction.setParentAction(parentAction);
      modifierAction.setResolveParentAction(resolveParentAction);
      modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex] = new SdkActionInterface(modifierAction);
      modifierActionInterface.setSdkStepInterface(sdkStepInterface);
      modifierActionInterface.isSequencedAsOne = true;
    }
    return modifierActionInterface;
  },

  _showActionForModifier(action) {
    let showDuration = 0.0;
    if (action instanceof SDK.ApplyModifierAction || action instanceof SDK.RemoveModifierAction || action instanceof ModifierAction) {
      // show modifier
      const modifier = action.getModifier();
      if (modifier instanceof SDK.Modifier) {
        // don't show modifier unless in hand or on board
        const sdkCard = modifier.getCardAffected();
        const node = this.getNodeForSdkCard(sdkCard);
        if (node != null) {
          if (action instanceof ModifierTriggeredAction) {
            showDuration = Math.max(showDuration, node.showTriggeredModifier(modifier, action));
          } else if (action instanceof SDK.ApplyModifierAction) {
            showDuration = Math.max(showDuration, node.showAppliedModifier(modifier, action));
          } else if (action instanceof ModifierActivatedAction) {
            showDuration = Math.max(showDuration, node.showActivatedModifier(modifier, action));
          } else if (action instanceof ModifierDeactivatedAction) {
            showDuration = Math.max(showDuration, node.showDeactivatedModifier(modifier, action));
          } else if (action instanceof SDK.RemoveModifierAction) {
            showDuration = Math.max(showDuration, node.showRemovedModifier(modifier, action));
          }
        }
      }
    }

    return showDuration;
  },

  /* endregion MODIFIERS */

  /* region FOLLOWUPS */

  onGameFollowupCardStart() {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      // hide battle log
      if (CONFIG.showBattleLog) {
        this._battleLog.fadeToInvisible();
      }

      // hide player layers
      this.player1Layer.fadeToInvisible();
      this.player2Layer.fadeToInvisible();
    }
  },

  onGameFollowupCardStop() {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      // show battle log
      if (CONFIG.showBattleLog) {
        this._battleLog.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
      }

      // show player layers
      this.player1Layer.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
      this.player2Layer.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
    }
  },

  showPlayerNextFollowupCard() {
    // get the current card from the stack
    const playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
    const card = playerActor.getCurrentCardWithFollowup();
    if (card) {
      const followupCard = card.getCurrentFollowupCard();
      if (followupCard) {
        // clear out ui from last
        this.removePlayerFollowupCardUI();

        // store the card triggering the action with the player
        playerActor.setFollowupCard(followupCard);

        // highlight entities that may be targeted by followup
        this.showPlayerFollowupCardUI();
      } else {
        // remove current followup from stack
        this.removePlayerCurrentCardWithFollowup();

        // move up stack
        this.showPlayerNextFollowupCard();
      }
    } else {
      // no more followups
      this.removePlayerCurrentCardWithFollowup();
    }
  },

  removePlayerCurrentCardWithFollowup() {
    this.removePlayerFollowupCardUI();

    const playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
    playerActor.popCurrentCardWithFollowup();
    playerActor.setFollowupCard(null);
  },

  showPlayerFollowupCardUI() {
    /*
    var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
    var followupCard = playerActor.getFollowupCard();
    */
  },

  removePlayerFollowupCardUI() {

  },

  /* endregion FOLLOWUPS */

  /* region NODES */

  /**
   * Shows nodes/sprites (note: does not create them, use NodeFactory to handle that!).
   * @param {Object|Array} nodes a single or array of nodes/sprites
   * @param {Object} [options] options object, 1 for all nodes
   */
  addNodes(nodes, options) {
    if (nodes) {
      // fx delay and sequence
      let sequenceSteps;
      let delay;
      if (options && !options.instant) {
        if (typeof options.delay !== 'undefined') {
          delay = options.delay;
        }
        if (delay) {
          sequenceSteps = [cc.delayTime(delay)];
        }
      }

      if (_.isArray(nodes)) {
        for (let i = 0, il = nodes.length; i < il; i++) {
          this.addNode(nodes[i], options, sequenceSteps);
        }
      } else {
        this.addNode(nodes, options, sequenceSteps);
      }

      if (sequenceSteps && sequenceSteps.length > 1) {
        this.runAction(cc.sequence(sequenceSteps));
      }
    }
  },
  addNode(node, options, sequenceSteps) {
    if (node instanceof cc.Node) {
      let action;
      let { layerName } = node;
      let { destinationLayerName } = node;
      let zOrder = node._zOrder;
      let forAutoFX;

      if (options) {
        action = options.action;
        // options layers
        if (_.isString(options.layerName) && this[options.layerName]) {
          layerName = options.layerName;
        }
        if (_.isString(options.destinationLayerName) && this[options.destinationLayerName]) {
          destinationLayerName = options.destinationLayerName;
        }
        // options z order
        if (_.isNumber(options.zOrder)) {
          zOrder = options.zOrder;
        }
        // flip based on start/end difference
        if (options.sourceBoardPosition && options.targetBoardPosition && options.targetBoardPosition.x - options.sourceBoardPosition.x < 0 && node.setFlippedX && node.isFlippedX) {
          node.setFlippedX(!node.isFlippedX());
        }
        // auto fx
        forAutoFX = this._currentSequenceNeedsAutoFX && options.forAutoFX;
      }

      // force the z order to max when depth test needed
      if (node.needsDepthTest) {
        zOrder = 9999;
        node.setAutoZOrder(false);
      } else if (node.getAutoZOrder()) {
        zOrder = node.getAutoZOrderValue();
      }

      let layer = this[layerName];
      const destinationLayer = this[destinationLayerName];

      // defaults
      if (node instanceof FXShockwaveSprite) {
        layer || (layer = this.backgroundLayer);
      } else if (node instanceof FXFlockSprite) {
        let source;
        let target;
        if (action) {
          source = action.getSource();
          target = action.getTarget();
        }

        const obstacles = [];
        const allNodes = this.middlegroundLayer.getChildren();
        for (let i = 0; i < allNodes.length; i++) {
          const obstacleNode = allNodes[i];
          if (obstacleNode instanceof UnitNode && obstacleNode.sdkCard !== source && obstacleNode.sdkCard !== target) {
            obstacles.push(obstacleNode);
          }
        }
        node.setObstacles(obstacles);
      } else if (node instanceof FXDecalSprite) {
        layer || (layer = this.backgroundLayer);
        // destinationLayer || (destinationLayer = this.backgroundLayer);
      }

      if (destinationLayer) {
        node.setDestinationParent(destinationLayer);
      }

      // fallback to middleground layer
      layer || (layer = this.middlegroundLayer);

      // update auto fx
      if (forAutoFX) {
        const autoFXPosition = options.targetBoardPosition || options.sourceBoardPosition || UtilsEngine.transformTileMapToBoardIndex(node.getPosition());
        const fxMapIndex = UtilsPosition.getMapIndexFromPosition(SDK.GameSession.getInstance().getBoard().getColumnCount(), autoFXPosition.x, autoFXPosition.y);
        let fxNodes = this._currentStepAutoFXMap[fxMapIndex];

        if (!fxNodes) {
          fxNodes = this._currentStepAutoFXMap[fxMapIndex] = [];
        }

        if (node instanceof Light) {
          // don't allow multiple lights at the same auto fx position
          const existingLight = _.find(fxNodes, (existingNode) => existingNode instanceof Light);
          if (existingLight) {
            existingLight.destroy(CONFIG.PLAYED_SPELL_FX_FADE_IN_DURATION);
            fxNodes.splice(_.indexOf(fxNodes, existingLight), 1);
          }

          // remove all durations that would automatically fade out
          // as we'll remove it manually
          node.setDuration(0.0);
          node.setFadeOutDuration(0.0);
          node.setFadeOutDurationPct(0.0);
        }

        fxNodes.push(node);
      }

      if (sequenceSteps) {
        sequenceSteps.push(cc.callFunc(function () {
          if (layer === this.tileLayer) {
            layer.addTile(node, zOrder);
          } else {
            layer.addChild(node, zOrder);
          }
        }, this));
      } else if (layer === this.tileLayer) {
        layer.addTile(node, zOrder);
      } else {
        layer.addChild(node, zOrder);
      }
    }
  },

  /**
   * Removes nodes/sprites (note: does not create them, use NodeFactory to handle that!).
   * @param {Object|Array} nodes a single or array of nodes/sprites
   * @param {Object} [duration=0.0] duration of remove
   */
  removeNodes(nodes, duration) {
    if (nodes) {
      if (_.isArray(nodes)) {
        for (let i = 0, il = nodes.length; i < il; i++) {
          this.removeNode(nodes[i], duration);
        }
      } else {
        this.removeNode(nodes, duration);
      }
    }
  },
  removeNode(node, duration) {
    if (node instanceof EntityNode) {
      this._entityNodes = _.without(this._entityNodes, node);

      if (node instanceof UnitNode) {
        this._unitNodes = _.without(this._unitNodes, node);
      } else if (node instanceof TileNode) {
        this._tileNodes = _.without(this._tileNodes, node);
      }

      // destroy entity speech node
      const speechNode = this.getSpeechNodeForEntityNode(node);
      if (speechNode != null) {
        speechNode.destroyWhenDoneShowingText();
      }
    } else if (node instanceof SpeechNode) {
      const speechKeys = Object.keys(this._speechNodes);
      for (let i = 0, il = speechKeys.length; i < il; i++) {
        const speechKey = speechKeys[i];
        if (this._speechNodes[speechKey] === node) {
          delete this._speechNodes[speechKey];
          break;
        }
      }
    }

    if (node.isRunning()) {
      node.destroy(duration);
    }
  },

  addNodesForSdkCards(sdkCards) {
    if (sdkCards) {
      if (_.isArray(sdkCards)) {
        for (let i = 0, il = sdkCards.length; i < il; i++) {
          const sdkCard = sdkCards[i];
          this.addNodeForSdkCard(sdkCard, sdkCard.getPosition());
        }
      } else {
        this.addNodeForSdkCard(sdkCards, sdkCards.getPosition());
      }
    }
  },

  addNodeForSdkCard(sdkCard, position) {
    if (sdkCard instanceof SDK.Entity) {
      let entityNode;

      if (sdkCard instanceof SDK.Unit) {
        entityNode = this.addUnitNodeForSdkUnit(sdkCard, position);
      } else if (sdkCard instanceof SDK.Tile) {
        entityNode = this.addTileNodeForSdkTile(sdkCard, position);
      }

      this._entityNodes.push(entityNode);

      // add entity support nodes
      const statsNode = entityNode.getStatsNode();
      if (statsNode != null) {
        this.uiLayer.addChild(statsNode, this._ui_z_order_low_priority_support_nodes);
      }
      const statsChangeNode = entityNode.getStatsChangeNode();
      if (statsChangeNode != null) {
        this.uiLayer.addChild(statsChangeNode, this._ui_z_order_medium_priority_support_nodes);
      }
      const ownerIndicatorSprite = entityNode.getOwnerIndicatorSprite();
      if (ownerIndicatorSprite != null) {
        this.tileLayer.addBoardBatchedTile(ownerIndicatorSprite, 1);
      }
      entityNode.updateSupportNodePositions();

      return entityNode;
    } if (sdkCard instanceof SDK.Spell) {
      // for now don't add spells
    }
  },

  addUnitNodeForSdkUnit(sdkUnit, position) {
    const unitNode = UnitNode.create(sdkUnit);
    unitNode.setPosition(UtilsEngine.transformBoardToTileMap(position));

    this._unitNodes.push(unitNode);
    this.addNode(unitNode);

    return unitNode;
  },

  addTileNodeForSdkTile(sdkTile, position) {
    const tileNode = TileNode.create(sdkTile);

    if (!tileNode.layerName) {
      // usually tile nodes should be added to the tile layer
      tileNode.layerName = 'tileLayer';
      tileNode.setPosition(UtilsEngine.transformBoardToScreen(position));
    } else {
      // transform position to tile map when tile node is not being added to tile layer
      tileNode.setPosition(UtilsEngine.transformBoardToTileMap(position));
    }

    this._tileNodes.push(tileNode);
    this.addNode(tileNode);

    return tileNode;
  },

  /* endregion NODES */

  /* region NODE VISUALS */

  addTagWithIdToAllEntities(injectedTag, tagId) {
    const entities = SDK.GameSession.getInstance().getBoard().getEntities(true);
    for (let i = 0; i < entities.length; i++) {
      const entityNode = this.getNodeForSdkCard(entities[i]);
      if (entityNode) {
        entityNode.addInjectedVisualStateTagWithId(injectedTag, tagId);
      }
    }
  },

  // Removes given tag from all entities on board
  removeTagWithIdFromAllEntities(tagIdToRemove) {
    const entities = SDK.GameSession.getInstance().getBoard().getEntities(true);
    for (let i = 0; i < entities.length; i++) {
      const entityNode = this.getNodeForSdkCard(entities[i]);
      if (entityNode) {
        entityNode.removeInjectedVisualStateTagById(tagIdToRemove);
      }
    }
  },

  updateReadinessTagForAllEntities() {
    for (let i = 0, il = this._entityNodes.length; i < il; i++) {
      this._entityNodes[i].updateReadinessVisualTag();
    }
  },

  removeReadinessForEntities() {
    for (let i = 0, il = this._entityNodes.length; i < il; i++) {
      this._entityNodes[i].removeReadinessVisualTag();
    }
  },

  // Id to be used for unused entity tags
  _unusedEntityTagId: 'UnusedEntityTagId',
  // Injects tags for entities that have actions remaining
  tagUnusedEntities() {
    if (!this.getIsPlayerSelectionLocked()) {
      const readyEntityNodes = this.getReadyEntityNodes();
      for (let i = 0, il = readyEntityNodes.length; i < il; i++) {
        const entityNode = readyEntityNodes[i];
        entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowHoverForPlayerTag(), this._unusedEntityTagId);
      }
    }
  },

  removeUnusedEntitiesTags() {
    for (let i = 0, il = this._entityNodes.length; i < il; i++) {
      const entityNode = this._entityNodes[i];
      entityNode.removeInjectedVisualStateTagById(this._unusedEntityTagId);
    }
  },

  getReadyEntityNodes() {
    const readyEntityNodes = [];
    for (let i = 0, il = this._entityNodes.length; i < il; i++) {
      const entityNode = this._entityNodes[i];
      // my entity that is ready is also unused
      if (entityNode.getIsReadyAtAction()) {
        readyEntityNodes.push(entityNode);
      }
    }
    return readyEntityNodes;
  },

  displaySelectEntityParticles(boardX, boardY) {
    const pEmitter = BaseParticleSystem.create({ plistFile: RSX.ptcl_dot_square_select.plist, pixelGridAligned: true });
    const emitterPosition = UtilsEngine.transformBoardToTileMap(cc.p(boardX, boardY));
    pEmitter.setPosition(emitterPosition);
    pEmitter.setScale(0.8);
    pEmitter.update(0.3);
    this.middlegroundLayer.addChild(pEmitter);
    this._particleContainer.push(pEmitter);
  },

  addEntityNodeHighlightTagsAtLocs(locs, color, freq, minAlpha, maxAlpha, tagId) {
    for (let i = 0; i < locs.length; i++) {
      this.addEntityNodeHighlightTagsAtBoardPosition(locs[i].x, locs[i].y, color, freq, minAlpha, maxAlpha, tagId);
    }
  },

  _targetableTagId: 'TargetableTagId',
  showTargetableEmphasisForEntities(sdkEntities) {
    for (let i = 0; i < sdkEntities.length; i++) {
      const entityNode = this.getNodeForSdkCard(sdkEntities[i]);
      if (entityNode && entityNode.getIsTargetable()) {
        entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowTargetableTag(), this._targetableTagId);
      }
    }
  },
  showUntargetableDemphasisForEntities(sdkEntities) {
    // Applies deemphasis tag to corresponding nodes for an array of entities
    for (let i = 0; i < sdkEntities.length; i++) {
      const entityNode = this.getNodeForSdkCard(sdkEntities[i]);
      if (entityNode && entityNode.getIsTargetable()) {
        entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowDeemphasisTag(), this._targetableTagId);
      }
    }
  },

  updateEntityNodeOwnerSprites() {
    for (let i = 0, il = this._entityNodes.length; i < il; i++) {
      const entityNode = this._entityNodes[i];
      entityNode.updateOwnerSprites();
    }
  },

  addEntityNodeHighlightTagsAtBoardPosition(boardX, boardY, color, freq, minAlpha, maxAlpha, tagId) {
    const entityNode = this.getEntityNodeAtBoardPosition(boardX, boardY, true, true);
    if (entityNode) {
      entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createHighlightTag(true, 0, color, freq, minAlpha, maxAlpha), tagId);
    }
  },

  removeEntityNodeHighlights() {

  },

  stopParticles() {
    for (let i = 0; i < this._particleContainer.length; i++) {
      this._particleContainer[i].stopSystem();
    }
  },

  /* endregion NODE VISUALS */

  /* region NODE STATS */

  /**
   * Shows and updates or hides sdk node stats as needed.
   * @param {Boolean} [force=false] whether to force an update
   */
  updateShowingSdkNodeStats(force) {
    // show stats over units
    if (this.getIsActive()
      && ((CONFIG.alwaysShowStats && (this._currentSdkStepInterface == null || CONFIG.OVERLAY_STATS_DURING_STEPS))
      || (this._player.getIsTakingInspectAction() && CONFIG.OVERLAY_STATS_DURING_HOVER)
      || (this._player.getIsTakingSelectionAction() && CONFIG.OVERLAY_STATS_DURING_SELECT))) {
      const lastSdkStateRecordingAction = this._lastShownSdkStateRecordingAction;
      const actionEventType = this._currentSdkStepInterface == null ? EVENTS.update_cache_step : EVENTS.update_cache_action;
      if (!this._showingStats
        || this._showingStatsForSdkStateRecordingAction !== lastSdkStateRecordingAction
        || this._showingStatsForSdkStateRecordingActionEventType !== actionEventType
        || force) {
        this._showingStats = true;
        this._showingStatsForSdkStateRecordingAction = lastSdkStateRecordingAction;
        this._showingStatsForSdkStateRecordingActionEventType = actionEventType;
        const entityNodes = this._entityNodes;
        for (let i = 0, il = entityNodes.length; i < il; i++) {
          const entityNode = entityNodes[i];
          const statsNode = entityNodes[i].getStatsNode();
          if (statsNode) {
            if (entityNode.getIsSpawned()) {
              // update stats to last action
              statsNode.showStatsAsOfAction(lastSdkStateRecordingAction, actionEventType);
            } else {
              statsNode.stopShowing();
            }
          }
        }
      }
    } else {
      this.stopShowingSdkNodeStats();
    }
  },

  stopShowingSdkNodeStats() {
    if (this._showingStats) {
      this._showingStats = false;
      this._showingStatsForSdkStateRecordingAction = null;
      this._showingStatsForSdkStateRecordingActionEventType = null;
      for (let i = 0, il = this._entityNodes.length; i < il; i++) {
        const statsNode = this._entityNodes[i].getStatsNode();
        if (statsNode) {
          statsNode.stopShowing();
        }
      }
    }
  },

  showEntitiesKilledByAttack(attackingSdkEntity, defendingSdkEntity) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()
      && attackingSdkEntity != null && defendingSdkEntity != null
      && (attackingSdkEntity !== this._showingAttackSourceSdkEntity || defendingSdkEntity !== this._showingAttackTargetSdkEntity)) {
      // get entities killed
      const sdkEntitiesKilledByAttack = attackingSdkEntity.getEntitiesKilledByAttackOn(defendingSdkEntity);

      // stop previous
      this.stopShowingEntitiesKilledByAttack();

      // show new
      if (sdkEntitiesKilledByAttack.length > 0) {
        // store showing properties
        this._showingAttackSourceSdkEntity = attackingSdkEntity;
        this._showingAttackTargetSdkEntity = attackingSdkEntity;
        this._showingAttackKilledEntityNodes = [];

        // show kill visuals
        for (let i = 0, il = sdkEntitiesKilledByAttack.length; i < il; i++) {
          const entityNode = this.getNodeForSdkCard(sdkEntitiesKilledByAttack[i]);
          if (entityNode != null) {
            const killPreviewNode = entityNode.getOrCreateKillPreviewNode();
            if (killPreviewNode != null) {
              // add symbol to ui layer
              if (killPreviewNode.getParent() != this.uiLayer) {
                this.uiLayer.addChild(killPreviewNode, this._ui_z_order_high_priority_support_nodes);
                entityNode.updateSupportNodePositions();
              }

              // animate kill preview in
              if (killPreviewNode._showAction != null) {
                killPreviewNode.stopAction(killPreviewNode._showAction);
              }
              killPreviewNode.setVisible(true);
              killPreviewNode.setScale(0.0);
              killPreviewNode._showAction = cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeBackOut());
              killPreviewNode.runAction(killPreviewNode._showAction);

              // store entity as showing kill symbol
              this._showingAttackKilledEntityNodes.push(entityNode);
            }
          }
        }
      }
    }
  },

  stopShowingEntitiesKilledByAttack() {
    if (this._showingAttackKilledEntityNodes != null) {
      const showingAttackKilledEntityNodes = this._showingAttackKilledEntityNodes;
      this._showingAttackKilledEntityNodes = null;
      this._showingAttackSourceSdkEntity = null;
      this._showingAttackTargetSdkEntity = null;
      for (let i = 0, il = showingAttackKilledEntityNodes.length; i < il; i++) {
        const entityNode = showingAttackKilledEntityNodes[i];
        if (entityNode != null) {
          const killPreviewNode = entityNode.getKillPreviewNode();
          if (killPreviewNode != null) {
            if (killPreviewNode._showAction != null) {
              killPreviewNode.stopAction(killPreviewNode._showAction);
              killPreviewNode._showAction = null;
              killPreviewNode.setVisible(false);
            }
          }
        }
      }
    }
  },

  /* endregion NODE STATS */

  /* region CARDS */

  /**
   * Returns whether or not we are currently showing card instructional text on inspection
   * @return {Boolean} Whether to show card instructionals right now
   */
  getShouldShowCardInstructionals() {
    const gameSession = SDK.GameSession.getInstance();

    const challenge = gameSession.getChallenge();
    if (challenge && challenge.showCardInstructionalTextForTurns) {
      if (gameSession.getNumberOfTurns() <= challenge.showCardInstructionalTextForTurns) {
        return true;
      }
    }

    return false;
  },

  /**
   * Starts inspecting a card
   * @param {SDK.Card} sdkCard card to show
   * @param {Node} node node to show card over
   */
  showInspectCard(sdkCard, node) {
    const currentSdkCard = this._inspectCardNode.getSdkCard();
    if (!this._player.getFollowupCard() && (currentSdkCard == null || currentSdkCard !== sdkCard)) {
      // stop showing previous
      this.stopShowingInspectCard(currentSdkCard);

      // show new
      if (sdkCard != null) {
        const isInspectingNode = node instanceof cc.Node;
        const isInspectingEntityNode = isInspectingNode && node instanceof EntityNode;
        const isInspectingBottomDeckCardNode = isInspectingNode && node instanceof BottomDeckCardNode;
        const isInspectingArtifactNode = isInspectingNode && node instanceof ArtifactNode;
        const isInspectingBattleLogNode = isInspectingNode && node instanceof BattleLogNode;
        const isInspectingSignatureCardNode = isInspectingNode && node instanceof SignatureCardNode;
        let showBaseState = false;
        let actionToShowStateFor;
        let actionEventTypeToShowStateFor;
        if (isInspectingArtifactNode) {
          // always show artifact nodes in base state
          // this is because the artifact's modifiers are active
          // but the artifact itself is not
          // so the state will always be as of when the artifact is played
          // which we don't want for inspecting artifact nodes
          showBaseState = true;
        } else if (isInspectingBattleLogNode) {
          if (!sdkCard.getActionStateRecord().getHasRecordedStateForActions()) {
            // on reconnect, action state record gets reset
            // battle log nodes should just show base state in this case
            showBaseState = true;
          } else {
            // show battle log node state at the action it was entered
            actionToShowStateFor = node.getAction();
            actionEventTypeToShowStateFor = EVENTS.update_cache_action;
          }
        }
        let showAsIfOwnedByPlayer2 = sdkCard.isOwnedByPlayer2();
        if (!showAsIfOwnedByPlayer2 && sdkCard.isOwnedByGameSession()) {
          // when owned by game session, inspect should always be on side of my player
          if (this.getMyPlayer() === this.getPlayer2()) {
            showAsIfOwnedByPlayer2 = true;
          }
        }

        // show inspect
        // inspect triggers rebuild so it must be done before using content size
        this._inspectCardNode.showInspect(sdkCard, showBaseState, actionToShowStateFor, actionEventTypeToShowStateFor, showAsIfOwnedByPlayer2, null, this.getShouldShowCardInstructionals());
        if (sdkCard.getReferencedCardData()) {
          referencedCard = SDK.GameSession.getInstance().createCardForIdentifier(sdkCard.getReferencedCardData().id);
          referencedCard.setOwner(sdkCard.getOwner());
          this._referencedCardNode.showInspect(referencedCard, true, actionToShowStateFor, actionEventTypeToShowStateFor, showAsIfOwnedByPlayer2, null, this.getShouldShowCardInstructionals());
        }

        const cardContentSize = this._inspectCardNode.getCardContentSize();

        // calculate base position
        let baseInspectPosition;
        if (isInspectingBottomDeckCardNode) {
          // position at a node in hand
          baseInspectPosition = UtilsEngine.getGSINodeCenterScreenPosition(node);
          baseInspectPosition.y += CONFIG.TILESIZE * 0.25;
        } else if (isInspectingArtifactNode) {
          // position at off board inspect location
          if (showAsIfOwnedByPlayer2) {
            // player 2
            baseInspectPosition = UtilsEngine.getPlayer2InspectOffBoardCardPosition();
          } else {
            // player 1
            baseInspectPosition = UtilsEngine.getPlayer1InspectOffBoardCardPosition();
          }
        } else if (isInspectingBattleLogNode) {
          // position at battle log node using current stack matrix
          baseInspectPosition = UtilsEngine.getGSINodeCenterScreenPosition(node);
          baseInspectPosition.x += CONFIG.BATTLELOG_ENTRY_SIZE * 0.5;
        } else {
          // position in fixed player inspect locations
          if (showAsIfOwnedByPlayer2) {
            // player 2
            baseInspectPosition = UtilsEngine.getPlayer2InspectCardPosition();
          } else {
            // player 1
            baseInspectPosition = UtilsEngine.getPlayer1InspectCardPosition();
          }
          if (isInspectingSignatureCardNode) {
            // position below signature card node
            baseInspectPosition.y -= node.getContentSize().height * 0.72;
          }
        }

        let inspectX;
        let inspectY;

        // inspect positions
        if (isInspectingBottomDeckCardNode) {
          // position at a node in hand
          const modifiersContentSize = this._inspectCardNode.getModifiersContentSize();
          inspectX = baseInspectPosition.x;
          inspectY = baseInspectPosition.y + cardContentSize.height * 0.5 + modifiersContentSize.height;
        } else if (isInspectingBattleLogNode) {
          // position at battle log node
          inspectX = baseInspectPosition.x + cardContentSize.width * 0.5;
          // TODO: remove this top/bottom code when player frames are migrated into engine
          inspectY = Math.min(this._battleLog.getBattleLogTop() - cardContentSize.height * 0.5, Math.max(this._battleLog.getBattleLogBottom() + cardContentSize.height * 0.5, baseInspectPosition.y));
        } else {
          // position in fixed player inspect locations
          if (showAsIfOwnedByPlayer2) {
            // player 2
            inspectX = baseInspectPosition.x - cardContentSize.width * 0.5;
            inspectY = baseInspectPosition.y - cardContentSize.height * 0.5;
          } else {
            // player 1
            inspectX = baseInspectPosition.x + cardContentSize.width * 0.5;
            inspectY = baseInspectPosition.y - cardContentSize.height * 0.5;
          }
        }

        // ensure card itself doesn't go outside screen
        inspectX = Math.max(Math.min(inspectX, UtilsEngine.getGSIWinRight() - cardContentSize.width * 0.5), UtilsEngine.getGSIWinLeft() + cardContentSize.width * 0.5);
        inspectY = Math.max(Math.min(inspectY, UtilsEngine.getGSIWinTop() - cardContentSize.height * 0.5), UtilsEngine.getGSIWinBottom() + cardContentSize.height * 0.5);

        // ensure meta content doesn't go outside screen
        if (this._inspectCardNode.getKeywordsShowing() && this._inspectCardNode.getHasKeywords()) {
          // keywords
          const cardKeywordsContentSize = this._inspectCardNode.getKeywordsContentSize();
          if (this._inspectCardNode.getKeywordsShowingOnLeft()) {
            if (inspectX - cardContentSize.width * 0.5 - cardKeywordsContentSize.width < UtilsEngine.getGSIWinLeft()) {
              // show to the right
              this._inspectCardNode.showKeywordsOnRight();
            }
          } else if (inspectX + cardContentSize.width * 0.5 + cardKeywordsContentSize.width > UtilsEngine.getGSIWinRight()) {
            // show to the left
            this._inspectCardNode.showKeywordsOnLeft();
          }
        }

        // set final inspect position
        this._inspectCardNode.setPosition(inspectX, inspectY);

        const spacing = this._inspectCardNode.getCardContentSize().width * 1.5;
        if (inspectX + spacing < UtilsEngine.getGSIWinRight()) {
          this._referencedCardNode.setPosition(inspectX + spacing, inspectY);
        } else {
          this._referencedCardNode.setPosition(inspectX - spacing, inspectY);
        }

        this.getEventBus().trigger(EVENTS.inspect_card_start, { type: EVENTS.inspect_card_start, card: sdkCard });
      }
    }
  },

  /**
   * Stops inspecting the card being inspected, or optionally only stop inspecting if the card being inspected is the card passed in.
   * @param {SDK.Card} [sdkCard=currently shown card]
   */
  stopShowingInspectCard(sdkCard) {
    const currentSdkCard = this._inspectCardNode.getSdkCard();
    sdkCard || (sdkCard = currentSdkCard);
    if (currentSdkCard != null && currentSdkCard === sdkCard) {
      this._inspectCardNode.stopShowingInspectAndClear();
      this._referencedCardNode.stopShowingInspectAndClear();

      this.getEventBus().trigger(EVENTS.inspect_card_stop, { type: EVENTS.inspect_card_stop, card: sdkCard });
    }
  },

  /**
   * Starts showing a played card
   * @param {SDK.Action} action action that played card to show
   * @param {Number} animateDuration duration of animation in seconds
   * @param {Number} showDuration duration to show card in seconds
   * @param {Boolean} [noFlip=false] whether to skip flip animation
   */
  showPlayCard(action, animateDuration, showDuration, noFlip) {
    const sdkCard = action.getCard();
    const currentSdkCard = this._playCardNode.getSdkCard();
    if (currentSdkCard == null || currentSdkCard !== sdkCard) {
      // stop showing previous
      this.stopShowingPlayCard(currentSdkCard);

      // set sdk card to trigger rebuild
      this._playCardNode.setSdkCard(sdkCard, action);
      const cardContentSize = this._playCardNode.getCardContentSize();
      const ownerId = action.getOwnerId();
      const isOwnedByPlayer2 = ownerId === SDK.GameSession.getInstance().getPlayer2Id();
      const isOwnedByMyPlayer = !SDK.GameSession.getInstance().getIsSpectateMode()
        && ownerId === SDK.GameSession.getInstance().getMyPlayerId()
        && !(action instanceof SDK.RevealHiddenCardAction);

      // calculate positions
      let sourceScreenPosition;
      let targetScreenPosition;

      // start position from general
      if (isOwnedByPlayer2) {
        sourceScreenPosition = this.getGeneralNodeForPlayer2().getPosition();
      } else {
        sourceScreenPosition = this.getGeneralNodeForPlayer1().getPosition();
      }
      sourceScreenPosition.y += cardContentSize.height * 0.5;

      if (isOwnedByMyPlayer) {
        // target position in fixed my play card location
        if (isOwnedByPlayer2) {
          targetScreenPosition = UtilsEngine.getPlayer2InspectOffBoardCardPosition();
          targetScreenPosition.y -= cardContentSize.height * 0.5;
        } else {
          targetScreenPosition = UtilsEngine.getPlayer1InspectOffBoardCardPosition();
          targetScreenPosition.y -= cardContentSize.height * 0.5;
        }
      } else {
        // target position is center of screen for opponent
        targetScreenPosition = UtilsEngine.getGSIWinCenterPosition();
      }

      // ensure card itself doesn't go outside screen
      targetScreenPosition.x = Math.max(Math.min(targetScreenPosition.x, UtilsEngine.getGSIWinRight() - cardContentSize.width * 0.5), UtilsEngine.getGSIWinLeft() + cardContentSize.width * 0.5);
      targetScreenPosition.y = Math.max(Math.min(targetScreenPosition.y, UtilsEngine.getGSIWinTop() - cardContentSize.height * 0.5), UtilsEngine.getGSIWinBottom() + cardContentSize.height * 0.5);

      // show play
      this._playCardNode.showPlay(null, action, EVENTS.update_cache_action, sourceScreenPosition, targetScreenPosition, animateDuration, showDuration, noFlip, this.getShouldShowCardInstructionals())
        .then(() => {
          const playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
          if (!isOwnedByMyPlayer || !playerActor.getHasCardsWithFollowup()) {
            this.stopShowingPlayCard(sdkCard, CONFIG.ANIMATE_MEDIUM_DURATION);
          }
        });

      this.getEventBus().trigger(EVENTS.play_card_start, { type: EVENTS.play_card_start, card: sdkCard });
    }
  },

  /**
   * Stops showing the card being played, or optionally only stop showing if the card being played is the card passed in.
   * @param {SDK.Card} [sdkCard=currently shown card]
   * @param {Number} animateDuration duration of animation in seconds
   */
  stopShowingPlayCard(sdkCard, animateDuration) {
    const currentSdkCard = this._playCardNode.getSdkCard();
    sdkCard || (sdkCard = currentSdkCard);
    if (currentSdkCard != null && currentSdkCard === sdkCard) {
      this._playCardNode.stopShowingPlay(animateDuration);

      this.getEventBus().trigger(EVENTS.play_card_stop, { type: EVENTS.play_card_stop, card: sdkCard });
    }
  },

  /**
   * Starts showing a played card and makes the show skippable by the player.
   * @param {SDK.Action} action action that played card to show
   * @param {Number} animateDuration duration of animation in seconds
   * @param {Number} showDuration duration to show card in seconds
   * @param {Number} nextActionShowDelay duration to delay before showing next action
   * @param {Function} [onCardShown=show current action] method to call when showing play card is completed or skipped by the user
   */
  showSkippablePlayCard(action, animateDuration, showDuration, nextActionShowDelay, onCardShown) {
    // stop any previous
    this._stopShowActionCardSequence();

    // show played card
    this.showPlayCard(action, animateDuration, showDuration, false);

    // setup action to delay for showing played card and then show next action
    this._showActionCardSequenceCompletedCallback = onCardShown;
    this._showActionCardSequence = this.runAction(cc.sequence(
      cc.delayTime(nextActionShowDelay),
      cc.callFunc(() => {
        const showActionCardSequenceCompletedCallback = this._getShowActionCardSequenceCompletedCallback();
        this._showActionCardSequence = null;
        this._showActionCardSequenceCompletedCallback = null;
        showActionCardSequenceCompletedCallback();
      }, this),
    ));
  },

  /**
   * Starts showing a burned card.
   * @param {SDK.Action} action action that burned card
   * @param {Number} startDelay delay before burn is shown in seconds
   * @param {Number} burnShowDuration duration of movement animation in seconds
   * @param {Number} dissolveDelay duration before showing dissolve in seconds
   * @param {Number} dissolveDuration duration to show card dissolving in seconds
   */
  showBurnCard(action, startDelay, burnShowDuration, dissolveDelay, dissolveDuration) {
    const sdkCard = action.getCard();
    const currentSdkCard = this._burnCardNode.getSdkCard();
    if (currentSdkCard == null || currentSdkCard !== sdkCard) {
      // set sdk card to trigger rebuild
      this._burnCardNode.setSdkCard(sdkCard, action);
      const cardContentSize = this._burnCardNode.getCardContentSize();
      const ownerId = action.getOwnerId();
      const isOwnedByPlayer2 = ownerId === SDK.GameSession.getInstance().getPlayer2Id();
      const isOwnedByMyPlayer = ownerId === SDK.GameSession.getInstance().getMyPlayerId();

      // calculate positions
      let sourceScreenPosition;
      let targetScreenPosition;

      // source position
      if (isOwnedByPlayer2) {
        sourceScreenPosition = this.getGeneralNodeForPlayer2().getPosition();
      } else {
        sourceScreenPosition = this.getGeneralNodeForPlayer1().getPosition();
      }

      // target position in fixed my play card location
      if (isOwnedByPlayer2) {
        targetScreenPosition = UtilsEngine.getPlayer2InspectOffBoardCardPosition();
        targetScreenPosition.y -= cardContentSize.height * 0.5;
      } else {
        targetScreenPosition = UtilsEngine.getPlayer1InspectOffBoardCardPosition();
        targetScreenPosition.y -= cardContentSize.height * 0.5;
      }

      // ensure card itself doesn't go outside screen
      targetScreenPosition.x = Math.max(Math.min(targetScreenPosition.x, cc.winSize.width - cardContentSize.width * 0.5), cardContentSize.width * 0.5);
      targetScreenPosition.y = Math.max(Math.min(targetScreenPosition.y, cc.winSize.height - cardContentSize.height * 0.5), cardContentSize.height * 0.5);

      // show burn
      this._burnCardNode.showBurn(null, startDelay, burnShowDuration, dissolveDelay, dissolveDuration, sourceScreenPosition, targetScreenPosition);
    }
  },

  /* endregion CARDS */

  /* region GENERAL HIGHLIGHTS */

  /**
   * Returns a promise when both generals have been highlighted. This is useful when you don't want to explicitly highlight generals, but want to do something IF the generals are highlighted.
   * @returns {Promise}
   */
  whenHighlightedGeneralsAsync(callback) {
    if (this._highlightedGeneralsPromise == null) {
      this._highlightedGeneralsPromise = new Promise((resolve, reject) => {
        this.whenStatus(GameLayer.STATUS.NEW).then(() => {
          if (this._highlightingGeneralsPromise != null) {
            // use the highlighting generals promise
            this._highlightingGeneralsPromise.then(resolve);
          } else {
            resolve();
          }
        });
      });
    }

    this._highlightedGeneralsPromise.nodeify(callback);

    return this._highlightedGeneralsPromise;
  },

  /**
   * Highlights generals starting with my player general and then opponent player general.
   * @returns {Promise}
   */
  highlightGenerals() {
    return this.whenStatus(GameLayer.STATUS.NEW).then(() => {
      if (this._highlightingGeneralsPromise == null && !SDK.GameSession.getInstance().isChallenge()) {
        this._highlightingGeneralsPromise = new Promise((resolve, reject) => {
          this.bindSdkPlayers();

          // my player data
          let myPlayerTaunted = false;
          const myPlayer = this._player;
          const myPlayerId = myPlayer.getPlayerId();
          const myGeneralCard = SDK.GameSession.getInstance().getGeneralForPlayerId(myPlayerId);
          const myGeneralId = myGeneralCard.getId();
          const myGeneralNode = this.getNodeForSdkCard(myGeneralCard);
          const myFaction = SDK.FactionFactory.factionForIdentifier(myGeneralCard.getFactionId());

          // opponent player data
          let opponentPlayerTaunted = false;
          const opponentPlayer = this._opponent;
          const opponentPlayerId = opponentPlayer.getPlayerId();
          const opponentGeneralCard = SDK.GameSession.getInstance().getGeneralForPlayerId(opponentPlayerId);
          const opponentGeneralId = opponentGeneralCard.getId();
          const opponentGeneralNode = this.getNodeForSdkCard(opponentGeneralCard);
          const opponentFaction = SDK.FactionFactory.factionForIdentifier(opponentGeneralCard.getFactionId());

          // taunts
          const myTauntText = SDK.FactionFactory.getTauntCallout(myGeneralId, opponentGeneralId);
          const opponentTauntText = SDK.FactionFactory.getTauntResponse(opponentGeneralId, myGeneralId);

          const tryToResolve = function () {
            if (myPlayerTaunted && opponentPlayerTaunted) {
              resolve();
            }
          };

          // start by unhighlighting generals
          myPlayer.unhighlightGeneral();
          opponentPlayer.unhighlightGeneral();

          // create sequence to show generals
          this.runAction(cc.sequence(
            cc.delayTime(CONFIG.HIGHLIGHT_MY_GENERAL_TAUNT_DELAY),
            cc.callFunc(() => {
              // show my general taunting
              myPlayer.highlightGeneral(myGeneralNode);
              this.showSpeechForEntityNode(myGeneralNode, myTauntText, null, CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION, true, 0.275);
            }),
            cc.delayTime(CONFIG.DIALOGUE_ENTER_DURATION + CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION),
            cc.callFunc(() => {
              // finish my general taunting
              myPlayer.unhighlightGeneral();
            }),
            cc.delayTime(CONFIG.GENERAL_FX_FADE_DURATION),
            cc.callFunc(() => {
              // delay to let fx fade out, then try to resolve
              myPlayerTaunted = true;
              tryToResolve();
            }),
          ));

          this.runAction(cc.sequence(
            cc.delayTime(CONFIG.HIGHLIGHT_OPPONENT_GENERAL_TAUNT_DELAY),
            cc.callFunc(() => {
              // show opponent general taunting
              opponentPlayer.highlightGeneral(opponentGeneralNode);
              this.showSpeechForEntityNode(opponentGeneralNode, opponentTauntText, null, CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION, true, 0.275);
            }),
            cc.delayTime(CONFIG.DIALOGUE_ENTER_DURATION + CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION),
            cc.callFunc(() => {
              // finish opponent general taunting
              opponentPlayer.unhighlightGeneral();
            }),
            cc.delayTime(CONFIG.GENERAL_FX_FADE_DURATION),
            cc.callFunc(() => {
              // delay to let fx fade out, then try to resolve
              opponentPlayerTaunted = true;
              tryToResolve();
            }),
          ));
        });
      }
      return this._highlightingGeneralsPromise;
    });
  },

  _highlightOnlyMyGeneral() {
    this.bindSdkPlayers();

    this._opponent.unhighlightGeneral();

    const myPlayerId = this._player.getPlayerId();
    const myGeneralCard = SDK.GameSession.getInstance().getGeneralForPlayerId(myPlayerId);
    const myGeneralNode = this.getNodeForSdkCard(myGeneralCard);
    this._player.highlightGeneral(myGeneralNode);
  },

  /* endregion GENERAL HIGHLIGHTS */

  /* region UNIT SPEECH */

  // TODO: Place in more organized section of code
  /**
   * Shows a speech node over a tile in the game
   * @param {object} tileIndices - object with x and y properties representing tile indices
   * @param {string} text - string of text to show
   * @param {string} sound - resource string for sound to player
   * @param {number} duration - how long to show the speech node
   * @returns {SpeechNode} - SpeechNode being added to screen
   */
  showSpeechOverTile(tileIndices, text, sound, duration) {
    return this.showSpeechAtPosition(UtilsEngine.transformBoardToTileMap(tileIndices), text, sound, duration);
  },

  // TODO: Place in more organized section of code
  /**
   * Shows a speech node over a tile in the game
   * @param {object} position - object with x and y properties representing tile indices
   * @param {string} text - string of text to show
   * @param {string} sound - resource string for sound to player
   * @param {number} duration - how long to show the speech node
   * @param {Boolean} isNotDismissable - whether speech is not dismissable
   * @returns {SpeechNode} - SpeechNode being added to screen
   */
  showSpeechAtPosition(position, text, sound, duration, isNotDismissable) {
    let showDuration = 0.0;
    const speechNode = SpeechNode.create();
    speechNode.setPosition(position);
    this.uiLayer.addChild(speechNode, this._ui_z_order_speech_nodes);
    showDuration = speechNode.showTextWithSoundForDuration(text, sound, duration, true, isNotDismissable);
    return showDuration;
  },

  /**
   * Returns a cached speech node by entity node if one exists.
   * @param entityNode
   * @returns {SpeechNode|null}
   */
  getSpeechNodeForEntityNode(entityNode) {
    return this.getSpeechNodeForSdkCard(entityNode.getSdkCard());
  },

  /**
   * Returns a cached speech node by sdk card index if one exists.
   * @param sdkCard
   * @returns {SpeechNode|null}
   */
  getSpeechNodeForSdkCard(sdkCard) {
    if (sdkCard != null) {
      return this._speechNodes[sdkCard.getIndex()];
    }
  },

  /**
   * Returns a cached speech node by entity node if one exists, or creates a new one as needed.
   * @param entityNode
   * @returns {SpeechNode}
   */
  getOrCreateSpeechNodeForEntityNode(entityNode) {
    return this.getOrCreateSpeechNodeForSdkCard(entityNode.getSdkCard());
  },

  getOrCreateSpeechNodeForSdkCard(sdkCard) {
    let speechNode = this.getSpeechNodeForSdkCard(sdkCard);
    if (speechNode == null) {
      if (sdkCard.getIsGeneral()) {
        speechNode = GeneralSpeechNode.create(sdkCard.getOwner());
      } else {
        speechNode = SpeechNode.create();
      }
      this._speechNodes[sdkCard.getIndex()] = speechNode;
    }
    if (speechNode.getParent() == null) {
      this.uiLayer.addChild(speechNode, this._ui_z_order_speech_nodes);
    }
    return speechNode;
  },

  showSpeechForEntityNode(entityNode, text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
    let showDuration = 0.0;
    if (entityNode instanceof EntityNode) {
      const speechNode = this.getOrCreateSpeechNodeForEntityNode(entityNode);
      showDuration = speechNode.showTextWithSoundForDuration(text, sound, duration, true, isNotDismissable, speechYPosition, withProceedCarrot);
    }
    return showDuration;
  },

  showSpeechForPlayer(player, text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
    let showDuration = 0.0;
    if (player instanceof Player) {
      const playerId = player.getPlayerId();
      const generalCard = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId);
      const generalNode = this.getNodeForSdkCard(generalCard);
      showDuration = this.showSpeechForEntityNode(generalNode, text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot);
    }
    return showDuration;
  },

  showSpeechForPlayer1(text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
    return this.showSpeechForPlayer(this.getPlayer1(), text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot);
  },

  showSpeechForPlayer2(text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
    return this.showSpeechForPlayer(this.getPlayer2(), text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot);
  },

  /* endregion UNIT SPEECH */

  /* region TOOLTIPS */

  getOrCreateTooltipNode() {
    // node that displays tooltips
    if (this._tooltipNode == null) {
      this._tooltipNode = new TooltipNode();
    }
    return this._tooltipNode;
  },

  getTooltipNode() {
    return this._tooltipNode;
  },

  showTooltipForSdkNode(sdkNode, text, carrotDirection) {
    if (sdkNode instanceof SdkNode) {
      const position = sdkNode.getCenterPositionForExternal();
      let offset;
      if (sdkNode instanceof SignatureCardNode) {
        offset = CONFIG.TILESIZE * 0.75;
      } else {
        offset = CONFIG.TILESIZE * 0.5;
      }
      if (carrotDirection === TooltipNode.DIRECTION_LEFT) {
        position.x += offset;
        if (sdkNode instanceof EntityNode) {
          position.y -= offset * 0.25;
        }
      } else if (carrotDirection === TooltipNode.DIRECTION_RIGHT) {
        position.x -= offset;
        if (sdkNode instanceof EntityNode) {
          position.y -= offset * 0.25;
        }
      } else if (carrotDirection === TooltipNode.DIRECTION_UP) {
        position.y -= offset;
      } else {
        position.y += offset;
      }
      return this.showTooltipAtPosition(position, text, carrotDirection);
    }
  },

  showTooltipAtPosition(screenPosition, text, carrotDirection) {
    if (!this.getIsDisabled() && !this.getIsShowGameOver()) {
      const tooltipNode = this.getOrCreateTooltipNode();
      if (tooltipNode != null) {
        // show tooltip
        tooltipNode.showText(text, carrotDirection);
        tooltipNode.setPosition(screenPosition);

        // add tooltip to scene as needed
        if (tooltipNode.getParent() != this.uiLayer) {
          this.uiLayer.addChild(tooltipNode, this._ui_z_order_instructional_nodes);
        }

        return tooltipNode;
      }
    }
  },

  stopShowingTooltip() {
    const tooltipNode = this.getTooltipNode();
    if (tooltipNode != null) {
      tooltipNode.stopShowing();
    }
  },

  /* endregion TOOLTIPS */

  /* region INSTRUCTION */

  /**
   * Shows an instruction node at a screen position
   * @param {Vec2} screenPosition
   * @param {string} text - string of text to show
   * @param {string} sound - resource string for sound to player
   * @param {number} duration - how long to show the instruction node
   * @param {Boolean} isNotDismissable - whether speech is not dismissable
   * @param {String} carrotDirection
   * @returns {InstructionNode} - InstructionNode being added to screen
   */
  showInstructionAtPosition(screenPosition, text, sound, duration, isNotDismissable, carrotDirection) {
    if (!this.getIsDisabled() && !this.getIsShowGameOver()) {
      const instructionNode = InstructionNode.create();

      instructionNode.showTextWithSoundForDuration(text, sound, duration, true, isNotDismissable, carrotDirection);
      instructionNode.setPosition(screenPosition);

      this.uiLayer.addChild(instructionNode, this._ui_z_order_instructional_nodes);

      return instructionNode;
    }
  },

  showInstructionOverTile(boardPosition, text, sound, duration, isNotDismissable, carrotDirection) {
    const position = UtilsEngine.transformBoardToTileMap(boardPosition);
    return this.showInstructionAtPosition(position, text, sound, duration, isNotDismissable, carrotDirection);
  },

  /**
   * Shows an instruction node at an sdk node.
   * @param {SdkNode} sdkNode
   * @param {string} text - string of text to show
   * @param {string} sound - resource string for sound to player
   * @param {number} duration - how long to show the instruction node
   * @param {Boolean} isNotDismissable - whether speech is not dismissable
   * @param {String} carrotDirection
   * @returns {InstructionNode} - InstructionNode being added to screen
   */
  showInstructionForSdkNode(sdkNode, text, sound, duration, isNotDismissable, carrotDirection) {
    if (!this.getIsDisabled() && !this.getIsShowGameOver() && sdkNode instanceof SdkNode) {
      const instructionNode = sdkNode.getOrCreateInstructionNode();
      if (instructionNode != null) {
        // show instruction
        instructionNode.showTextWithSoundForDuration(text, sound, duration, false, isNotDismissable, carrotDirection);

        // add instruction to scene as needed
        if (instructionNode.getParent() != this.uiLayer) {
          this.uiLayer.addChild(instructionNode, this._ui_z_order_instructional_nodes);
        }
        sdkNode.updateSupportNodePositions();

        return instructionNode;
      }
    }
  },

  showInstructionForPlayer(player, text, sound, duration, isNotDismissable, carrotDirection) {
    if (player instanceof Player) {
      const playerId = player.getPlayerId();
      const generalCard = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId);
      const generalNode = this.getNodeForSdkCard(generalCard);
      return this.showInstructionForSdkNode(generalNode, text, sound, duration, isNotDismissable, carrotDirection);
    }
  },

  showInstructionForPlayer1(text, sound, duration, isNotDismissable, carrotDirection) {
    return this.showInstructionForPlayer(this.getPlayer1(), text, sound, duration, isNotDismissable, carrotDirection);
  },

  showInstructionForPlayer2(text, sound, duration, isNotDismissable, carrotDirection) {
    return this.showInstructionForPlayer(this.getPlayer2(), text, sound, duration, isNotDismissable, carrotDirection);
  },

  /* endregion INSTRUCTION */

  /* region MOUSE */

  updateMouseCursor(changed) {
    if (this.getIsGameOver() || SDK.GameSession.current().getIsSpectateMode()) {
      // mouse should always be auto when game over or spectating
      return this.updateMouseCursorByState('auto');
    } if (this.getPlayerSelectionLocked()) {
      // mouse should always be disabled when player selection is locked
      return this.updateMouseCursorByState('disabled');
    }
    // if player is hovering board, only update cursor if hover has changed
    const player = this._player;
    if (player != null && (!player.getIsMouseOnBoard() || player.getHoverChanged() || changed)) {
      const mouseBoardPosition = player.getMouseBoardPosition();
      // check for bottom deck card
      if (this.getIsActive() && player.getSelectedCard() && !player.getMouseOverSdkCard()) {
        return this.updateMouseCursorByState('card');
      }

      const mouseOverSdkEntity = player.getMouseOverSdkEntity();

      // followup and mouse over a valid target entity
      const followupCard = player.getFollowupCard();
      if (followupCard != null && mouseOverSdkEntity != null && mouseOverSdkEntity.getIsActive()) {
        const followupBoardPositions = followupCard.getValidTargetPositions();
        if (followupBoardPositions && UtilsPosition.getIsPositionInPositions(followupBoardPositions, mouseOverSdkEntity.getPosition())) {
          return this.updateMouseCursorByState('card');
        }
      }

      // bottom deck
      const mouseOverSdkCard = player.getMouseOverSdkCard();
      if (mouseOverSdkCard != null) {
        if (!player.getMouseDragging()) {
          return this.updateMouseCursorByState('select');
        }
      } else if (player.getMouseOverArtifactNode() == null
          && player.getMouseOverReplaceNode() == null
          && this._battleLog.getMouseOverBattleLogNode() == null) {
        // check for selected entity actions
        const selectedSdkEntity = player.getSelectedSdkEntity();
        if (selectedSdkEntity != null) {
          if (mouseOverSdkEntity && mouseOverSdkEntity.getIsActive() && selectedSdkEntity !== mouseOverSdkEntity) {
            if (!selectedSdkEntity.getIsSameTeamAs(mouseOverSdkEntity) && selectedSdkEntity.getAttackRange().getIsValidTarget(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseOverSdkEntity)) {
              return this.updateMouseCursorByState('attack');
            }
          } else if (selectedSdkEntity.getCanMove() && selectedSdkEntity.getMovementRange().getIsPositionValid(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseBoardPosition)) {
            return this.updateMouseCursorByState('move');
          }
        }

        // mouse over a entity
        if (mouseOverSdkEntity != null && !player.getMouseDragging() && mouseOverSdkEntity.isOwnedByMyPlayer() && mouseOverSdkEntity.getCanAct()) {
          return this.updateMouseCursorByState('select');
        }
      }

      return this.updateMouseCursorByState('auto');
    }
  },

  updateMouseCursorByState(state) {
    if (this._mouseState !== state) {
      this._mouseState = state;
      this.getEventBus().trigger(EVENTS.canvas_mouse_state, { type: EVENTS.canvas_mouse_state, state: this._mouseState });
    }
  },

  stopMouseOverButNotPlayer() {
    this._player.setMouseOverCard(null);
    this._player.setMouseOverArtifact(null);
    this._player.setMouseOverReplaceNode(null);
    this.updateMouseCursor();
  },

  // TODO: needs comment
  stopMouseOver() {
    this._player.setMouseOverEntityNode(null);
    this._player.removeHover();
    this.stopMouseOverButNotPlayer();
  },

  // TODO: needs comment
  // Cleans up mouse down state values
  stopMouseDown() {
    this.removeEntityNodeHighlights();
    this.stopParticles();

    // reset player intent
    this._player.setIntentType(SDK.IntentType.NeutralIntent);

    // deselect previous selection
    this._player.setSelectedEntityNode(null);
    const selectedCard = this._player.getSelectedCard();
    const selectedCardIndexInHand = this._player.getSelectedCardIndexInHand();
    this._player.setSelectedCard(null);
    if (selectedCard != null) {
      if (selectedCardIndexInHand != null) {
        this.bottomDeckLayer.bindHandUsabilityHighlightSelection();
      } else {
        this.getCurrentPlayerLayer().getSignatureCardNode().resetHighlightAndSelection();
      }
    }

    this.stopMouseOver();
    this.updateShowingSdkNodeStats();
  },

  stopMouseDownForPlayer(player) {
    player.setSelectedEntityNode(null);
    player.setSelectedCard(null);
    player.clearCardsWithFollowup();
    player.setIntentType(SDK.IntentType.NeutralIntent);
    player.removeHover();
  },

  stopMouseOverForPlayer(player) {
    player.setMouseOverCard(null);
    player.setMouseOverEntityNode(null);
    player.setMouseOverArtifact(null);
    player.setMouseOverReplaceNode(null);
    player.removeHover();
  },

  onPointerMove(event) {
    // don't interact when disabled
    if (this.getIsGameOver() || event == null || event.isStopped) {
      return;
    }

    let mouseOverActive;
    const location = event.getLocation();
    this._handlingMouseMove = true;

    const mouseWasDragging = this._player.getMouseDragging();
    const isActive = this.getIsActive();
    const isPregame = this.getIsChooseHand() || this.getIsSubmitHand() || this.getIsStartingHand();

    // update mouse position and potentially trigger drag to start
    const mouseBoardPositionLast = this._player.getMouseBoardPosition();
    this._player.setMouseScreenPosition(location);
    const mouseScreenPosition = this._player.getMouseScreenPosition();
    var mouseBoardPosition = this._player.getMouseBoardPosition();

    // when just starting drag, do mouse select from down position
    if (this.getIsGameActive() && this._player.getMouseDragging() && mouseWasDragging !== this._player.getMouseDragging()) {
      this._mouseSelectAtBoardOrScreenPosition(this._player.getMouseBoardUnroundedDownPosition(), this._player.getMouseScreenDownPosition());
    }

    // hover replace node
    let mouseOverReplaceNode;
    if (this._player.getSelectedCardIndexInHand() != null) {
      // hover replace
      const replaceNode = this.getNodeUnderMouse(this.bottomDeckLayer.getReplaceNode(), mouseScreenPosition.x, mouseScreenPosition.y);
      if (replaceNode != null && !replaceNode.getIsDisabled()) {
        event.stopPropagation();
        mouseOverActive = true;
        mouseOverReplaceNode = replaceNode;
      }
    }
    this._player.setMouseOverReplaceNode(mouseOverReplaceNode);

    // hover a card
    var mouseOverCard;
    if ((isActive || isPregame) && !event.isStopped && !this._player.getFollowupCard()) {
      let cardNodes;
      if (isPregame) {
        // get cards nodes in hand
        cardNodes = this.bottomDeckLayer.getCardNodes();
      } else {
        // get signature card nodes and card nodes in hand
        cardNodes = [].concat(this.bottomDeckLayer.getCardNodes());
        const player1SignatureCardNode = this.getPlayer1Layer().getSignatureCardNode();
        if (player1SignatureCardNode != null && !player1SignatureCardNode.getIsDisabled() && player1SignatureCardNode.getSdkCard() != null) {
          cardNodes.push(player1SignatureCardNode);
        }
        const player2SignatureCardNode = this.getPlayer2Layer().getSignatureCardNode();
        if (player2SignatureCardNode != null && !player2SignatureCardNode.getIsDisabled() && player2SignatureCardNode.getSdkCard() != null) {
          cardNodes.push(player2SignatureCardNode);
        }
      }

      const cardNode = this.getNodeUnderMouse(cardNodes, mouseScreenPosition.x, mouseScreenPosition.y);
      const selectedCard = this._player.getSelectedCard();
      if (cardNode != null && (selectedCard == null || (cardNode.getSdkCard() != null && cardNode.getSdkCard().getIndex() !== selectedCard.getIndex()))) {
        event.stopPropagation();
        mouseOverActive = true;
        mouseOverCard = cardNode;
      }
    }
    this._player.setMouseOverCard(mouseOverCard);

    // hover artifact cards
    let mouseOverArtifact;
    if (isActive && !event.isStopped && !this._player.getFollowupCard()) {
      const artifactNode = this.getNodeUnderMouse(this.player1Layer.getArtifactNodes(), mouseScreenPosition.x, mouseScreenPosition.y) || this.getNodeUnderMouse(this.player2Layer.getArtifactNodes(), mouseScreenPosition.x, mouseScreenPosition.y);
      if (artifactNode != null) {
        event.stopPropagation();
        mouseOverActive = true;
        mouseOverArtifact = artifactNode;
      }
    }
    this._player.setMouseOverArtifact(mouseOverArtifact);

    // hover entity
    if (isActive && !event.isStopped) {
      // check mouse board position against last played entity board positions
      // only allow hover on position if we've hovered a different position than any played entity position
      const lastPlayedEntityBoardPosition = _.find(this._lastPlayedCardBoardPositions, (cardBoardPosition) => cardBoardPosition.x === mouseBoardPosition.x && cardBoardPosition.y === mouseBoardPosition.y);
      if (lastPlayedEntityBoardPosition == null) {
        // if player is in a tutorial and is selecting an entity or has no selection
        // use rounded board index to make targeting easier
        // otherwise use approximate board position
        var mouseBoardPosition;
        if (SDK.GameSession.getInstance().isTutorial()
          && (!this._player.getIsTakingSelectionAction()
              || (this._player.getSelectedSdkEntity() != null
                && (SDK.GameSession.getInstance().getChallenge().getCurrentInstruction() == null
                  || SDK.GameSession.getInstance().getChallenge().getCurrentInstruction().expectedActionType === SDK.AttackAction.type))
              || (this._player.getSelectedCard() instanceof SDK.Spell
                && !this._player.getSelectedCard().getTargetsAnywhere())
          )
        ) {
          mouseBoardPosition = this._player.getMouseBoardUnroundedPosition();
        } else {
          mouseBoardPosition = this._player.getMouseBoardPosition();
        }
        // try to always get entity at the board position
        let entityNode = this.getEntityNodeAtBoardPosition(mouseBoardPosition.x, mouseBoardPosition.y, true, true);
        if (entityNode == null && !this._player.getIsTakingSelectionAction()) {
          // allow selection of a moving unit intersected by mouse as long as nothing else is selected
          entityNode = this.getMovingUnitNodeUnderMouse(mouseScreenPosition.x, mouseScreenPosition.y, true, true);
        }
        if (entityNode && entityNode.getIsSpawned()) {
          const selectedEntityNode = this._player.getSelectedEntityNode();
          if (!selectedEntityNode || selectedEntityNode !== entityNode) {
            event.stopPropagation();
            mouseOverActive = true;

            // no current entity or new and not same as last during selected action
            const mouseOverEntityNode = this._player.getMouseOverEntityNode();
            if ((!mouseOverEntityNode || mouseOverEntityNode !== entityNode)
              && (!this._lastSelectedEntityNodeForAction || entityNode !== this._lastSelectedEntityNodeForAction)
              && (!this._lastMouseOverEntityNodesForAction || !_.contains(this._lastMouseOverEntityNodesForAction, entityNode))
            ) {
              this.stopMouseOverButNotPlayer();

              // own mouse overrides _opponent's on our screen unless _opponent has selection intent
              if (this._opponent.getMouseOverEntityNode() === entityNode && !this._opponent.getIntentTypeIsSelection()) {
                this._opponent.removeHover();
                this._opponent.setMouseOverEntityNode(null);
              }

              this._player.setMouseOverEntityNode(entityNode);
            }
          }
        }
      }
    } else {
      // clear out hover on entity
      this._player.setMouseOverEntityNode(null);
    }

    // cleanup
    if (!mouseOverActive) {
      this.stopMouseOverButNotPlayer();
      this._player.setMouseOverEntityNode(null);
      // this.updateOpponentMouseOver();
    }

    // update state
    this.updateMouseCursor();
    this.updateShowingSdkNodeStats();
    if (this.getIsGameActive()) {
      // check if mouse board position needs to be forced
      this._updateMouseBoardPositionByCurrentHover(mouseBoardPositionLast);

      // broadcast hover position
      if (this._player.getHoverDirty()) {
        const hoverEventData = {
          type: EVENTS.network_game_hover,
          timestamp: Date.now(),
          boardPosition: this._player.getMouseBoardPosition(),
          handIndex: this._player.getMouseOverHandIndex(),
          cardIndex: this._player.getMouseOverSdkEntityIndex(),
          intentType: this._player.getIntentType(),
        };
        var mouseOverCard = this._player.getMouseOverSdkCard();
        if (mouseOverCard && mouseOverCard.isSignatureCard()) {
          if (mouseOverCard.isOwnedByPlayer2()) {
            hoverEventData.player2SignatureCard = true;
          } else {
            hoverEventData.player1SignatureCard = true;
          }
        }
        SDK.NetworkManager.getInstance().broadcastGameEvent(hoverEventData);
      }

      // show hover as needed
      this._player.showHover();
    }

    this._handlingMouseMove = false;
  },

  _updateMouseBoardPositionByCurrentHover(mouseBoardPositionLast) {
    if (this._player.getMouseOverCardNode() != null
      || this._player.getMouseOverArtifactNode() != null
      || this._player.getMouseOverReplaceNode() != null
      || this._battleLog.getMouseOverBattleLogNode() != null) {
      // force mouse board position off board when hovering any cards outside board
      var forcedBoardPosition = { x: -1, y: -1 };
      this._player.setMouseBoardPosition(forcedBoardPosition);
      if (UtilsPosition.getPositionsAreEqual(mouseBoardPositionLast, forcedBoardPosition)) {
        this._player.setHoverDirty(false);
      }
    } else {
      const mouseOverSdkEntity = this._player.getMouseOverSdkEntity();
      if (mouseOverSdkEntity != null) {
        // move mouse board position when hovering a unit on board
        var forcedBoardPosition = mouseOverSdkEntity.getPosition();
        this._player.setMouseBoardPosition(forcedBoardPosition);
        if (UtilsPosition.getPositionsAreEqual(mouseBoardPositionLast, forcedBoardPosition)) {
          this._player.setHoverDirty(false);
        }
      }
    }
  },

  onPointerDown(event) {
    // don't interact when disabled
    if (SDK.GameSession.current().getIsSpectateMode() || this.getIsGameOver() || event == null || event.isStopped) {
      return;
    }

    const location = event.getLocation();

    // set player stored mouse position
    this._player.setMouseScreenDownPosition(location);
    this._player.setMouseScreenPosition(location);
  },

  onPointerUp(event) {
    // Handles the pointer being released to handle mulligan selections, select cards on board,
    // select cards in hand, and perform secondary actions

    // don't interact when disabled
    if (this.getIsGameOver() || event == null || event.isStopped) {
      return;
    }

    if (SDK.GameSession.getInstance().getIsSpectateMode()) {
      // skip showing play card
      this.skipShowActionCardSequence();

      // don't allow any other interactions
      return;
    }

    // always make click sound
    audio_engine.current().play_effect_for_interaction(RSX.sfx_pointdrop.audio);

    const location = event.getLocation();
    const player = this._player;

    // Set the mouse's screen position
    const mouseBoardPositionLast = player.getMouseBoardPosition();
    player.setMouseScreenPosition(location);
    const mouseDragging = player.getMouseDragging();
    player.setMouseScreenUpPosition(location);
    const mouseScreenPosition = player.getMouseScreenPosition();

    // skip showing play card
    this.skipShowActionCardSequence();

    // handle pointer by button
    if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
      // Trigger a cancel if performing a cancellable followup or have a selection
      if (SDK.GameSession.getInstance().getIsMyFollowupActiveAndCancellable() || !!(this._player.getSelectedCard() || this._player.getSelectedEntityNode())) {
        NavigationManager.getInstance().requestUserTriggeredCancel();
      }
    } else if (this.getIsChooseHand()) {
      // toggle cards to be mulliganed from starting hand
      const cardNode = this.getNodeUnderMouse(this.bottomDeckLayer.getCardNodes(), mouseScreenPosition.x, mouseScreenPosition.y);
      if (cardNode) {
        // stop inspect of card
        this.stopShowingInspectCard(cardNode.getSdkCard());

        const wasSelected = cardNode.getSelected();
        let selectionChanged;
        if (wasSelected) {
          selectionChanged = true;
          cardNode.setSelected(false);
        } else {
          const mulliganIndices = this.getMulliganIndices();
          if (mulliganIndices.length < CONFIG.STARTING_HAND_REPLACE_COUNT) {
            selectionChanged = true;
            cardNode.setSelected(true);
          } else {
            // show reminder of max mulligan count centered above card we're trying to mulligan
            const cardNodePosition = cardNode.getPosition();
            const reminderPosition = cc.p(cardNodePosition.x, cardNodePosition.y + CONFIG.HAND_CARD_SIZE * 0.5);
            const reminderMessage = i18next.t('game_ui.out_of_mulligan_message', { count: CONFIG.STARTING_HAND_REPLACE_COUNT });
            this.showInstructionAtPosition(reminderPosition, reminderMessage);
          }
        }

        if (selectionChanged) {
          // broadcast the selection during mulligan
          SDK.NetworkManager.getInstance().broadcastGameEvent({
            type: EVENTS.network_game_select,
            timestamp: Date.now(),
            handIndex: cardNode.getHandIndex(),
          });

          if (cardNode.getSelected()) {
            this.getEventBus().trigger(EVENTS.mulligan_card_selected, {
              type: EVENTS.mulligan_card_selected,
              handIndex: cardNode.getHandIndex(),
            });
          } else {
            this.getEventBus().trigger(EVENTS.mulligan_card_deselected, {
              type: EVENTS.mulligan_card_deselected,
              handIndex: cardNode.getHandIndex(),
            });
          }
        }
      }
    } else if (this.getIsActive()) {
      // active game
      if (!this.getIsPlayerSelectionLocked()) {
        const followupCard = player.getFollowupCard();

        // check if mouse board position needs to be forced
        this._updateMouseBoardPositionByCurrentHover(mouseBoardPositionLast);

        const mouseBoardPosition = this._player.getMouseBoardPosition();
        if (followupCard == null || !SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition) || followupCard.getIsPositionValidTarget(mouseBoardPosition)) {
          // get player state
          const sdkPlayer = this._player.getSdkPlayer();
          const selectedSdkCard = player.getSelectedCard();
          const mouseOverSdkCard = player.getMouseOverSdkCard();
          const selectedHandIndex = player.getSelectedCardIndexInHand();
          const selectedEntityNode = player.getSelectedEntityNode();
          const mouseOverEntityNode = player.getMouseOverEntityNode();
          const wasTakingSelectionAction = player.getIsTakingSelectionAction();

          // stop mouse down before attempting to do anything else
          // this way we've cleared the UI before changing state
          if (wasTakingSelectionAction) {
            this.stopMouseDown();
          }

          // player currently has something selected and is clicking to perform an action with it
          let actionToExecute;
          if (sdkPlayer != null) {
            if (followupCard != null) {
              actionToExecute = this._actionSelectedFollowupCard(followupCard);
            } else if (selectedHandIndex != null) {
              actionToExecute = this._actionSelectedCardFromHand(selectedHandIndex);
            } else if (selectedSdkCard != null && selectedSdkCard.isSignatureCard()) {
              actionToExecute = this._actionSelectedSignatureCard(sdkPlayer.getCurrentSignatureCard());
            } else if (selectedEntityNode != null) {
              actionToExecute = this._actionSelectedCardOnBoard(selectedEntityNode, mouseOverEntityNode);
            }
          }

          // check if we should reselect this same entity after executing the action
          // do not do this when user was dragging and dropping as it does not feel right
          if (CONFIG.stickyTargeting
              && !mouseDragging
              && (actionToExecute instanceof SDK.MoveAction || actionToExecute instanceof SDK.AttackAction)) {
            this._player.setStickyTargetNode(selectedEntityNode);
          }

          if (actionToExecute) {
            // attempt to execute the action from the activation
            const submitted = SDK.GameSession.getInstance().submitExplicitAction(actionToExecute);

            if (submitted && !SDK.GameSession.getInstance().getIsRunningAsAuthoritative()) {
              if (actionToExecute instanceof SDK.PlayCardFromHandAction || actionToExecute instanceof SDK.ReplaceCardFromHandAction) {
                // client prediction: unbind ui for played/replaced card from hand
                this.bottomDeckLayer.unbindCardNodeAtIndex(actionToExecute.getIndexOfCardInHand());
              } else if (actionToExecute instanceof SDK.PlaySignatureCardAction) {
                // client prediction: rebind ui for played signature card
                this.getMyPlayerLayer().bindAndResetSignatureCard();
              }
            }

            // set player hover as not dirty
            // this way the player won't immediately re-hover the same space
            this._player.setHoverDirty(false);
          } else if (!mouseDragging) {
            // select a new thing at this position
            // check against entity/card node currently under mouse
            // node hovering may be blocked when the selected node is the same as the node being hovered
            const mouseBoardUnroundedUpPosition = this._player.getMouseBoardUnroundedUpPosition();
            const mouseScreenUpPosition = this._player.getMouseScreenUpPosition();
            const entityNodeUnderMouse = this.getEntityNodeAtBoardPosition(mouseBoardUnroundedUpPosition.x, mouseBoardUnroundedUpPosition.y, true, true);
            const cardNodeUnderMouse = this.getNodeUnderMouse(this.bottomDeckLayer.getCardNodes(), mouseScreenUpPosition.x, mouseScreenUpPosition.y);
            if ((!selectedEntityNode || !entityNodeUnderMouse || selectedEntityNode !== entityNodeUnderMouse) && (!selectedSdkCard || !cardNodeUnderMouse || selectedSdkCard !== cardNodeUnderMouse.getSdkCard())) {
              this._mouseSelectAtBoardOrScreenPosition(mouseBoardUnroundedUpPosition, mouseScreenUpPosition);
            }
          }

          // store reference to selected/hovered/played so that we don't immediately mouse over this same entity node
          if (mouseOverEntityNode != null) {
            this._lastMouseOverEntityNodesForAction.push(mouseOverEntityNode);
          }
          if (selectedEntityNode != null) {
            this._lastSelectedEntityNodeForAction = selectedEntityNode;
          }
          if (actionToExecute instanceof SDK.ApplyCardToBoardAction) {
            const targetPosition = actionToExecute.getTargetPosition();
            if (targetPosition != null) {
              this._lastPlayedCardBoardPositions.push(targetPosition);
            }
          }

          // move mouse board position when selected a unit on board
          const selectedSdkEntity = this._player.getSelectedSdkEntity();
          if (selectedSdkEntity != null) {
            const entityBoardPosition = selectedSdkEntity.getPosition();
            this._player.setMouseBoardPosition(entityBoardPosition);
            if (UtilsPosition.getPositionsAreEqual(mouseBoardPositionLast, entityBoardPosition)) {
              this._player.setHoverDirty(false);
            }
          }
        }
      }

      // update stats
      this.updateShowingSdkNodeStats();

      // broadcast hover position
      if (this._player.getHoverDirty()) {
        SDK.NetworkManager.getInstance().broadcastGameEvent({
          type: EVENTS.network_game_hover,
          timestamp: Date.now(),
          boardPosition: this._player.getMouseBoardPosition(),
          intentType: this._player.getIntentType(),
        });
      }
    }
  },

  onHoverChanged() {
    // reset last mouse over
    this._resetLastMouseOverPropertiesForAction();
  },

  onSelectionChanged() {
    // reset last mouse over
    this._resetLastMouseOverPropertiesForAction();
  },

  _resetLastMouseOverPropertiesForAction() {
    // only reset when no followup is active
    const followupCard = this._player.getFollowupCard();
    if (followupCard == null) {
      this._lastMouseOverEntityNodesForAction = [];
      this._lastSelectedEntityNodeForAction = null;
      this._lastPlayedCardBoardPositions = [];
    }
  },

  _mouseSelectAtBoardOrScreenPosition(boardPosition, screenPosition) {
    if (!this.getIsPlayerSelectionLocked()) {
      // try to select a card outside board
      this._mouseSelectNewCardOffBoardAtScreenPosition(screenPosition);
      if (!this._player.getSelectedCard()) {
        // try to select a card from board
        this._mouseSelectNewCardFromBoardAtBoardOrScreenPosition(boardPosition, screenPosition);
      }
    }
  },

  _mouseSelectNewCardOffBoardAtScreenPosition(screenPosition) {
    // get signature card node and card nodes in hand
    const cardNodes = [].concat(this.bottomDeckLayer.getCardNodes());
    const signatureCardNode = this.getMyPlayerLayer().getSignatureCardNode();
    const sdkPlayer = this._player.getSdkPlayer();
    if (!signatureCardNode.getIsDisabled() && sdkPlayer != null && sdkPlayer.getCurrentSignatureCard() != null && sdkPlayer.getIsSignatureCardActive()) {
      cardNodes.push(signatureCardNode);
    }

    // try to select a card under mouse
    const cardNode = this.getNodeUnderMouse(cardNodes, screenPosition.x, screenPosition.y);
    if (cardNode) {
      const sdkCard = cardNode.getSdkCard();
      if (sdkCard) {
        // do not allow card and entity to be selected at same time
        this._player.setSelectedEntityNode(null);

        // select card
        this._player.setSelectedCard(cardNode);
      }
    }
  },

  _mouseSelectNewCardFromBoardAtBoardOrScreenPosition(boardPosition, screenPosition) {
    // try to always get entity at the board position first, then a moving unit intersected by mouse
    this._mouseSelectEntity(this.getEntityNodeAtBoardPosition(boardPosition.x, boardPosition.y) || this.getMovingUnitNodeUnderMouse(screenPosition.x, screenPosition.y));
  },

  _mouseSelectEntity(entityNode) {
    if (entityNode) {
      const sdkEntity = entityNode.getSdkCard();
      if (sdkEntity.isOwnedByMyPlayer()) {
        if (sdkEntity.hasActiveModifierClass(SDK.ModifierStunned)) {
          this.showInstructionForSdkNode(entityNode, i18next.t('game_ui.stunned_message'));
        } else if (sdkEntity.getIsUncontrollableBattlePet()) {
          this.showInstructionForSdkNode(entityNode, i18next.t('game_ui.battlepet_message'));
        } else if (sdkEntity.getIsExhausted()) {
          this.showInstructionForSdkNode(entityNode, i18next.t('game_ui.exhausted_message'));
        } else if (sdkEntity.getCanAct()) {
          // do not allow card and entity to be selected at same time
          this._player.setSelectedCard(null);

          // select entity
          this._player.setSelectedEntityNode(entityNode);
          const selectedSdkEntity = this._player.getSelectedSdkEntity();

          this.displaySelectEntityParticles(selectedSdkEntity.position.x, selectedSdkEntity.position.y);

          this.stopMouseOverButNotPlayer();
          this._player.removeHover();
        }
      }
    }
  },

  _actionSelectedFollowupCard(followupCard) {
    let actionToExecute;

    // create the followup action
    const mouseBoardPosition = this._player.getMouseBoardPosition();
    if (followupCard != null && SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition)) {
      actionToExecute = this._player.getSdkPlayer().actionPlayFollowup(followupCard, mouseBoardPosition.x, mouseBoardPosition.y);
    } else if (SDK.GameSession.getInstance().getIsMyFollowupActiveAndCancellable()) {
      NavigationManager.getInstance().requestUserTriggeredCancel();
    }

    return actionToExecute;
  },

  _actionSelectedSignatureCard(signatureCard) {
    let actionToExecute;

    if (signatureCard != null) {
      const mouseBoardPosition = this._player.getMouseBoardPosition();
      if (SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition)) {
        // create play card action
        actionToExecute = this._player.getSdkPlayer().actionPlaySignatureCard(mouseBoardPosition.x, mouseBoardPosition.y);
      } else {
        const mouseScreenPosition = this._player.getMouseScreenPosition();
        const replaceNode = this.getNodeUnderMouse(this.bottomDeckLayer.getReplaceNode(), mouseScreenPosition.x, mouseScreenPosition.y);
        if (replaceNode != null) {
          // remind player that signature card cannot be replaced
          this.showInstructionAtPosition(this.bottomDeckLayer.getReplaceNode().getPosition(), i18next.t('game_ui.replace_bloodborn_message'));
        }
      }
    }

    return actionToExecute;
  },

  _actionSelectedCardFromHand(selectedHandIndex) {
    let actionToExecute;

    if (selectedHandIndex != null) {
      const mouseBoardPosition = this._player.getMouseBoardPosition();
      if (SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition)) {
        // create play card action
        actionToExecute = this._player.getSdkPlayer().actionPlayCardFromHand(selectedHandIndex, mouseBoardPosition.x, mouseBoardPosition.y);
      } else {
        const mouseScreenPosition = this._player.getMouseScreenPosition();
        const replaceNode = this.getNodeUnderMouse(this.bottomDeckLayer.getReplaceNode(), mouseScreenPosition.x, mouseScreenPosition.y);
        if (replaceNode && !replaceNode.getIsDisabled()) {
          // create replace action
          actionToExecute = this._player.getSdkPlayer().actionReplaceCardFromHand(selectedHandIndex);
        }
      }
    }

    return actionToExecute;
  },

  _actionSelectedCardOnBoard(selectedEntityNode, mouseOverEntityNode) {
    let actionToExecute;

    if (selectedEntityNode) {
      const mouseBoardPosition = this._player.getMouseBoardPosition();
      const selectedSdkEntity = selectedEntityNode.getSdkCard();
      const mouseOverSdkEntity = mouseOverEntityNode && mouseOverEntityNode.getSdkCard();

      // entity node exists, try to do action on Board
      if (mouseOverSdkEntity && !mouseOverSdkEntity.getIsSameTeamAs(selectedSdkEntity) && selectedSdkEntity.getAttackRange().getIsValidTarget(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseOverSdkEntity)) {
        // attack an enemy
        actionToExecute = selectedSdkEntity.actionAttack(mouseOverSdkEntity);
      } else if (selectedSdkEntity.getCanMove() && selectedSdkEntity.getMovementRange().getIsPositionValid(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseBoardPosition)) {
        // move to location
        actionToExecute = selectedSdkEntity.actionMove({ x: mouseBoardPosition.x, y: mouseBoardPosition.y });
      }
    }

    return actionToExecute;
  },

  onMouseExited(event) {
    this.stopMouseOver();
  },

  /* endregion MOUSE */

  /* region NETWORK UI EVENTS */

  onNetworkMouseClear(eventData) {
    if (eventData != null) {
      let playerActor = this._opponent;
      // if we're spectating and have a playerId on the event
      // use current player to show ui data
      if (SDK.GameSession.current().getIsSpectateMode() && eventData.playerId === this._player.getPlayerId()) {
        playerActor = this._altPlayer;
      }
      this.stopMouseOverForPlayer(playerActor);
      this.stopMouseDownForPlayer(playerActor);
    }
  },

  onNetworkHover(eventData) {
    if (eventData != null) {
      // if we're spectating and have a playerId on the event
      // use current player to show ui data
      const { playerId } = eventData;
      let playerActor;
      let canShowInHand;
      if (SDK.GameSession.current().getIsSpectateMode() && playerId === this._player.getPlayerId()) {
        playerActor = this._altPlayer;
        canShowInHand = true;
      } else {
        playerActor = this._opponent;
        canShowInHand = false;
      }

      // if we're in mulligan
      if (SDK.GameSession.current().getIsSpectateMode() && this.getIsSubmitHand()) {
        if (canShowInHand) {
          playerActor.setMouseOverCard(this.bottomDeckLayer.getCardNodeByHandIndex(eventData.handIndex));
        }
      } else if ((this.getIsGameActive() || this.getIsChooseHand()) && (!this.getIsMyTurn() || SDK.GameSession.current().getIsSpectateMode())) {
        // allow start/stop hover during opponent turn or spectate mode

        // hover over card off board
        if (eventData.handIndex != null) {
          if (canShowInHand) {
            playerActor.setMouseOverCard(this.bottomDeckLayer.getCardNodeByHandIndex(eventData.handIndex));
          } else {
            playerActor.setMouseOverCard(eventData.handIndex);
          }
        } else if (eventData.player1SignatureCard) {
          playerActor.setMouseOverCard(this.getPlayer1Layer().getSignatureCardNode());
        } else if (eventData.player2SignatureCard) {
          playerActor.setMouseOverCard(this.getPlayer2Layer().getSignatureCardNode());
        } else {
          playerActor.setMouseOverCard(null);
        }

        // hover over unit in play
        if (eventData.cardIndex != null) {
          const entityNode = _.find(this._unitNodes, (n) => n.getSdkCard().getIndex() === eventData.cardIndex);
          if (entityNode) {
            playerActor.setMouseOverEntityNode(entityNode);
          }
        } else {
          playerActor.setMouseOverEntityNode(null);
        }

        // set intent last to ensure it does not get overwritten
        if (eventData.intentType != null) {
          playerActor.setIntentType(eventData.intentType);
        }

        // hover over board
        if (eventData.boardPosition != null) {
          playerActor.setMouseScreenPositionFromBoardLocation(eventData.boardPosition);
          playerActor.showHover();
        }
      } else {
        // otherwise stop hover
        this.stopMouseOverForPlayer(playerActor);
      }
    }
  },
  onNetworkSelect(eventData) {
    if (eventData != null) {
      // if we're spectating and have a playerId on the event
      // use current player to show ui data
      const { playerId } = eventData;
      let playerActor;
      let canShowInHand;
      if (SDK.GameSession.current().getIsSpectateMode() && playerId === this._player.getPlayerId()) {
        playerActor = this._altPlayer;
        canShowInHand = true;
      } else {
        playerActor = this._opponent;
        canShowInHand = false;
      }

      if (SDK.GameSession.current().getIsSpectateMode() && this.getIsSubmitHand()) {
        // during mulligan spectate
        if (canShowInHand && eventData.handIndex != null) {
          const cardNode = this.bottomDeckLayer.getCardNodeByHandIndex(eventData.handIndex);
          cardNode.setSelected(!cardNode.getSelected());
        }
      } else if (this.getIsGameActive() && (!this.getIsMyTurn() || SDK.GameSession.current().getIsSpectateMode())) {
        // allow start/stop select during opponent turn or while spectating

        // select card in hand
        if (eventData.handIndex != null) {
          if (canShowInHand) {
            playerActor.setSelectedCard(this.bottomDeckLayer.getCardNodeByHandIndex(eventData.handIndex));
          } else {
            playerActor.setSelectedCard(eventData.handIndex);
          }
        } else if (eventData.player1SignatureCard) {
          playerActor.setSelectedCard(this.getPlayer1Layer().getSignatureCardNode());
        } else if (eventData.player2SignatureCard) {
          playerActor.setSelectedCard(this.getPlayer2Layer().getSignatureCardNode());
        } else {
          playerActor.setSelectedCard(null);
          playerActor.removeHover();
        }

        // select unit in play
        if (eventData.cardIndex != null) {
          const entityNode = _.find(this._unitNodes, (n) => n.getSdkCard().getIndex() === eventData.cardIndex);
          if (entityNode != null) {
            playerActor.setSelectedEntityNode(entityNode);
          } else {
            playerActor.setSelectedEntityNode(null);
            playerActor.removeHover();
          }
        } else {
          playerActor.setSelectedEntityNode(null);
          playerActor.removeHover();
        }

        // set intent last to ensure it does not get overwritten
        if (eventData.intentType != null) {
          playerActor.setIntentType(eventData.intentType);
        }
      } else {
        // otherwise stop select
        this.stopMouseDownForPlayer(playerActor);
      }
    }
  },
  /* endregion NETWORK UI EVENTS */
});

GameLayer.STATUS = {
  NEW: 1,
  TRANSITIONING_TO_CHOOSE_HAND: 200,
  CHOOSE_HAND: 201,
  SUBMIT_HAND: 300,
  TRANSITIONING_TO_DRAW_HAND: 400,
  DRAW_HAND: 401,
  STARTING_HAND: 500,
  TRANSITIONING_TO_ACTIVE: 600,
  ACTIVE: 601,
  SHOW_GAME_OVER: 700,
  DISABLED: 9999,
};

GameLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new GameLayer());
};

module.exports = GameLayer;
