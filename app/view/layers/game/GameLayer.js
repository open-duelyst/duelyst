//pragma PKGS: game
var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var DATA = require('app/data');
var Promise = require("bluebird");
var _ = require("underscore");
var UtilsJavascript = require('app/common/utils/utils_javascript');
var UtilsEngine = require('app/common/utils/utils_engine');
var UtilsPosition = require('app/common/utils/utils_position');
var NodeFactory = require('app/view/helpers/NodeFactory');
var TweenTypes = require('app/view/actions/TweenTypes');
var Player = require('app/view/Player');
var BaseLayer = require('app/view/layers/BaseLayer');
var ShadowCastingLayer = require('app/view/layers/ShadowCastingLayer');
var FXCompositeLayer = require('app/view/layers/FXCompositeLayer');
var TileLayer = require('./TileLayer');
var BottomDeckLayer = require('./BottomDeckLayer');
var Player1Layer = require('./Player1Layer');
var Player2Layer = require('./Player2Layer');
var BaseSprite = require('app/view/nodes/BaseSprite');
var GlowSprite = require('app/view/nodes/GlowSprite');
var FXSprite = require('app/view/nodes/fx/FXSprite');
var FXDecalSprite = require('app/view/nodes/fx/FXDecalSprite');
var FXShockwaveSprite = require('app/view/nodes/fx/FXShockwaveSprite');
var FXFlockSprite = require('app/view/nodes/fx/FXFlockSprite');
var FXLensFlareSprite = require('app/view/nodes/fx/FXLensFlareSprite');
var Light = require('app/view/nodes/fx/Light');
var BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
var SdkNode = require('app/view/nodes/cards/SdkNode');
var EntityNode = require('app/view/nodes/cards/EntityNode');
var EntityNodeVisualStateTag = require('app/view/nodes/visualStateTags/EntityNodeVisualStateTag')
var UnitNode = require('app/view/nodes/cards/UnitNode');
var BottomDeckCardNode = require('app/view/nodes/cards/BottomDeckCardNode');
var TileNode = require('app/view/nodes/cards/TileNode');
var TooltipNode = require('app/view/nodes/cards/TooltipNode');
var BattleMap = require('./BattleMap');
var Shake = require('app/view/actions/Shake');
var RadialBlurTo = require('app/view/actions/RadialBlurTo');
var CardNode = require('app/view/nodes/cards/CardNode');
var ArtifactNode = require('app/view/nodes/cards/ArtifactNode');
var SdkStepInterface = require('app/view/helpers/SdkStepInterface');
var SdkActionInterface = require('app/view/helpers/SdkActionInterface');
var ModifierAction = require('app/view/helpers/modifierAction');
var ModifierActivatedAction = require('app/view/helpers/modifierActivatedAction');
var ModifierDeactivatedAction = require('app/view/helpers/modifierDeactivatedAction');
var ModifierTriggeredAction = require('app/view/helpers/modifierTriggeredAction');
var SpeechNode = require('app/view/nodes/cards/SpeechNode');
var InstructionNode = require('app/view/nodes/cards/InstructionNode');
var GeneralSpeechNode = require('app/view/nodes/cards/GeneralSpeechNode');
var BattleLogNode = require('app/view/nodes/cards/BattleLogNode');
var SignatureCardNode = require('app/view/nodes/cards/SignatureCardNode');
var PrismaticPlayCardNode = require('app/view/nodes/fx/PrismaticPlayCardNode');
var InstructionalArrowSprite = require('app/view/nodes/map/InstructionalArrowSprite');
var EmphasisTriggeredSprite = require('app/view/nodes/emphasis/EmphasisTriggeredSprite');
var BattleLog = require ('./BattleLog');
var audio_engine = require("app/audio/audio_engine");
var PackageManager = require('app/ui/managers/package_manager');
var NavigationManager = require('app/ui/managers/navigation_manager');
var i18next = require('i18next');
const Chroma = require('app/common/chroma')

// custom UI modules
//var TimeMaelstromUIModule = require('app/view/ui_modules/TimeMaelstromUIModule');

/**
 * GameLayer - controller for all visuals in a game.
 */
var GameLayer = FXCompositeLayer.extend({

	_actionInterfacesByIndex: null,
	_afterShowStartTurnPromise: null,
	_afterShowStartTurnPromiseResolve: null,
	backgroundLayer: null,
	_battleMap: null,
	_battleLog:null,
	_beginShowStartTurnPromise: null,
	_beginShowStartTurnPromiseResolve: null,
	bottomDeckLayer:null,
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
	_mouseState: "",
	_nextActionIndex: 0,
	_opponent: null,
	_particleContainer: null,
	_playCardNode: null,
	_player: null,
	_playerSelectionLocked:false,
	_playerSelectionLockedId:-1,
	_playerSelectionLockedRequests:null,
	_referencedCardNode:null,
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

	ctor: function () {
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
		var label = new cc.LabelTTF(i18next.t("game_ui.label_your_turn"), RSX.font_bold.name, 66, cc.size(1280, 280), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		label.enableStroke(cc.color(0,0,0,0), 2)
		label.enableShadow(3, 0.5, 0.0)
		this._notificationYourTurnSprite.addChild(label,1);
		label.setAnchorPoint(cc.p(0.0,-0.05));
		this._notificationEnemyTurnSprite = new BaseSprite(RSX.notification_enemy_turn.img);
		this._notificationEnemyTurnSprite.setVisible(false);
		var label = new cc.LabelTTF(i18next.t("game_ui.label_enemy_turn"), RSX.font_bold.name, 66, cc.size(1280, 280), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		label.enableStroke(cc.color(0,0,0,0), 2)
		label.enableShadow(3, 0.5, 0.0)
		this._notificationEnemyTurnSprite.addChild(label,1);
		label.setAnchorPoint(cc.p(0.0,-0.05))
		this._notificationGoSprite = new BaseSprite(RSX.notification_go.img);
		this._notificationGoSprite.setVisible(false);
		var label = new cc.LabelTTF(i18next.t("game_ui.label_automatic_moves"), RSX.font_bold.name, 66, cc.size(1280, 280), cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		label.enableStroke(cc.color(0,0,0,0), 2)
		label.enableShadow(3, 0.5, 0.0)
		this._notificationGoSprite.addChild(label,1);
		label.setAnchorPoint(cc.p(0.0,-0.05))
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
		this.getFXLayer().addChild( this.backgroundLayer, 0);
		this.getFXLayer().addChild(this.tileLayer, 1);
		this.getFXLayer().addChild( this.middlegroundLayer, 2);
		this.getFXLayer().addChild( this.foregroundLayer, 3);
		this.getNoFXLayer().addChild(this.bottomDeckLayer, 0);
		this.getNoFXLayer().addChild(this.player1Layer, 0);
		this.getNoFXLayer().addChild(this.player2Layer, 0);
		this.getNoFXLayer().addChild(this.uiLayer, 1);
	},

	start: function () {
		FXCompositeLayer.prototype.start.call(this);

		// start and enable this game layer instance
		Logger.module("ENGINE").log("GameLayer.start");

		this._battleMap.whenStatus(BattleMap.STATUS.SETUP).then(function () {
			// cocos node properties
			this.scheduleUpdate();

			// set up custom UI modules
			this._customUIModules = [
				//new TimeMaelstromUIModule()
			];

			// start all UI modules
			for (var i = 0, il = this._customUIModules.length; i < il; i++) {
				this._customUIModules[i].start();
			}

			this.setStatus(GameLayer.STATUS.NEW);
		}.bind(this));
	},

	terminate: function () {
		Logger.module("ENGINE").log("GameLayer.terminate");
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

	_prepareForTerminate: function () {
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

	_startListeningToEvents: function () {
		this._super();

		// events
		this.getEventBus().on(EVENTS.game_hover_changed, this.onHoverChanged, this);
		this.getEventBus().on(EVENTS.game_selection_changed, this.onSelectionChanged, this);
		this.getEventBus().on(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
		this.getEventBus().on(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);

		// game session events
		var gameSession = SDK.GameSession.getInstance();
		if (gameSession != null) {
			gameSession.getEventBus().on(EVENTS.invalid_action, this.onInvalidAction, this);
			gameSession.getEventBus().on(EVENTS.step, this.onStep, this);
			gameSession.getEventBus().on(EVENTS.rollback_to_snapshot, this.onRollBack, this);
		}

		// pointer events
		var scene = this.getScene();
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

	_stopListeningToEvents: function () {
		this._super();

		// events
		this.getEventBus().off(EVENTS.game_hover_changed, this.onHoverChanged, this);
		this.getEventBus().off(EVENTS.game_selection_changed, this.onSelectionChanged, this);
		this.getEventBus().off(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
		this.getEventBus().off(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);

		// game session events
		var gameSession = SDK.GameSession.getInstance();
		if (gameSession != null) {
			gameSession.getEventBus().off(EVENTS.invalid_action, this.onInvalidAction, this);
			gameSession.getEventBus().off(EVENTS.step, this.onStep, this);
			gameSession.getEventBus().off(EVENTS.rollback_to_snapshot, this.onRollBack, this);
		}

		// pointer events
		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().off(EVENTS.pointer_down, this.onPointerDown, this);
			scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
		}
	},

	/* endregion INITIALIZE */

	/* region GETTERS / SETTERS */

	getEventBus: function () {
		return this._eventBus;
	},

	getBattleMap: function () {
		return this._battleMap;
	},

	getBattleLog: function () {
		return this._battleLog;
	},

	getBottomDeckLayer: function () {
		return this.bottomDeckLayer;
	},

	getPlayer1Layer: function () {
		return this.player1Layer;
	},

	getPlayer2Layer: function () {
		return this.player2Layer;
	},

	getMyPlayerLayer: function () {
		if (this.getMyPlayer() === this.getPlayer2()) {
			return this.getPlayer2Layer();
		} else {
			return this.getPlayer1Layer();
		}
	},

	getOpponentPlayerLayer: function () {
		if (this.getCurrentPlayer() === this.getPlayer2()) {
			return this.getPlayer2Layer();
		} else {
			return this.getPlayer1Layer();
		}
	},

	getCurrentPlayerLayer: function () {
		if (this.getCurrentPlayer() === this.getPlayer2()) {
			return this.getPlayer2Layer();
		} else {
			return this.getPlayer1Layer();
		}
	},

	getPlayerLayerByPlayerId: function (playerId) {
		if (playerId === SDK.GameSession.getInstance().getPlayer2Id()) {
			return this.getPlayer2Layer();
		} else {
			return this.getPlayer1Layer();
		}
	},

	getPlayer1ArtifactNodes: function () {
		return this.player1Layer.getArtifactNodes();
	},

	getPlayer2ArtifactNodes: function () {
		return this.player2Layer.getArtifactNodes();
	},

	getMyPlayerArtifactNodes: function () {
		if (this.getMyPlayer() === this.getPlayer2()) {
			return this.getPlayer2ArtifactNodes();
		} else {
			return this.getPlayer1ArtifactNodes();
		}
	},

	getOpponentPlayerArtifactNodes: function () {
		if (this.getOpponentPlayer() === this.getPlayer2()) {
			return this.getPlayer2ArtifactNodes();
		} else {
			return this.getPlayer1ArtifactNodes();
		}
	},

	getTileLayer: function () {
		return this.tileLayer;
	},

	/**
	 * Sets status, but only if the new status is an advancement over the last.
	 * @param {Int} status
	 * @see GameLayer.STATUS
	 */
	setStatus: function (status) {
		var lastStatus = this._status;
		if (status > lastStatus) {
			this._status = status;
			var waitingForStatus = this._waitingForStatus[status];
			if (waitingForStatus != null && waitingForStatus.length > 0) {
				this._waitingForStatus[status] = null;
				for (var i = 0, il = waitingForStatus.length; i < il; i++) {
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
	resetStatus: function (status) {
		if (status == null) { status = GameLayer.STATUS.NEW; }
		this._status = null;
		this.setStatus(status);
	},

	getStatus: function () {
		return this._status;
	},

	whenStatus: function (targetStatus, callback) {
		if (this._statusPromises == null) {
			this._statusPromises = {};
		}
		var statusPromise = this._statusPromises[targetStatus];
		if (statusPromise == null) {
			statusPromise = this._statusPromises[targetStatus] = new Promise(function(resolve,reject){
				if (this.getStatus() === targetStatus) {
					resolve();
				} else {
					if (this._waitingForStatus[targetStatus] == null) {
						this._waitingForStatus[targetStatus] = [];
					}
					this._waitingForStatus[targetStatus].push(resolve);
				}
			}.bind(this));
		}

		statusPromise.nodeify(callback);

		return statusPromise;
	},

	getIsNew: function () {
		return this._status === GameLayer.STATUS.NEW;
	},

	getIsTransitioningToChooseHand: function () {
		return this._status === GameLayer.STATUS.TRANSITIONING_TO_CHOOSE_HAND;
	},

	getIsChooseHand: function () {
		return this._status === GameLayer.STATUS.CHOOSE_HAND;
	},

	getIsSubmitHand: function () {
		return this._status === GameLayer.STATUS.SUBMIT_HAND;
	},

	getIsTransitioningToDrawHand: function () {
		return this._status === GameLayer.STATUS.TRANSITIONING_TO_DRAW_HAND;
	},

	getIsDrawHand: function () {
		return this._status === GameLayer.STATUS.DRAW_HAND;
	},

	getIsStartingHand: function () {
		return this._status === GameLayer.STATUS.STARTING_HAND;
	},

	getIsTransitioningToActive: function () {
		return this._status === GameLayer.STATUS.TRANSITIONING_TO_ACTIVE;
	},

	getIsActive: function () {
		return this._status === GameLayer.STATUS.ACTIVE;
	},

	getIsShowGameOver: function () {
		return this._status === GameLayer.STATUS.SHOW_GAME_OVER;
	},

	getIsDisabled: function () {
		return this._status == null || this._status === GameLayer.STATUS.DISABLED;
	},

	getIsGameOver: function () {
		return this.getIsShowGameOver() || this.getIsDisabled();
	},

	getIsGameActive: function () {
		return SDK.GameSession.getInstance().isActive() && this.getIsActive();
	},

	getIsTurnForPlayer: function (player) {
		return player && player.getIsCurrentPlayer();
	},

	getIsTurnForPlayerId: function (playerId) {
		var player = this.getPlayerById(playerId);
		return player && player.getIsCurrentPlayer();
	},

	getIsMyTurn: function () {
		return this.getIsTurnForPlayer(this._player);
	},

	getIsOpponentTurn: function () {
		return this.getIsTurnForPlayer(this._opponent);
	},

	getMyPlayer: function () {
		return this._player;
	},

	getMyPlayerId: function () {
		return this._player.getPlayerId();
	},

	getOpponentPlayer: function () {
		return this._opponent;
	},

	getOpponentPlayerId: function () {
		return this._opponent.getPlayerId();
	},

	getAltPlayer: function () {
		return this._altPlayer;
	},

	getCurrentPlayer: function () {
		return this._player.getIsCurrentPlayer() ? this._player : this._opponent;
	},

	getNonCurrentPlayer: function () {
		return !this._player.getIsCurrentPlayer() ? this._player : this._opponent;
	},

	getPlayer1: function () {
		return this.getPlayerById(SDK.GameSession.getInstance().getPlayer1Id());
	},

	getPlayer2: function () {
		return this.getPlayerById(SDK.GameSession.getInstance().getPlayer2Id());
	},

	getPlayerById: function (playerId) {
		if (this._player.getPlayerId() === playerId) {
			return this._player;
		} else if (this._opponent.getPlayerId() === playerId) {
			return this._opponent;
		}
	},

	getPlayerSelectionLocked: function () {
		return this._playerSelectionLocked;
	},

	setPlayerSelectionLocked: function (val) {
		if (this._playerSelectionLocked != val) {
			this._playerSelectionLocked = val;
			this._updateGameForPlayerSelectionLockedChange();
		}
	},

	_updateGameForPlayerSelectionLockedChange: function () {
		// rebind usability
		this.bottomDeckLayer.bindHandUsability();
		this.player1Layer.getSignatureCardNode().updateUsability();
		this.player2Layer.getSignatureCardNode().updateUsability();

		// update all entity nodes
		for (var i = 0, il = this._entityNodes.length; i < il; i++) {
			var entityNode = this._entityNodes[i];
			entityNode.updateReadinessVisualTag();
		}
	},

	requestPlayerSelectionLocked: function(id) {
		if (id == null) {
			id = this._playerSelectionLockedId;
		}
		if (!_.contains(this._playerSelectionLockedRequests, id)) {
			var numRequests = this._playerSelectionLockedRequests.length;
			this._playerSelectionLockedRequests.push(id);
			if (numRequests === 0 && this._playerSelectionLockedRequests.length === 1) {
				this.setPlayerSelectionLocked(true);
			}
		}
	},

	requestPlayerSelectionUnlocked: function(id) {
		if (id == null) {
			id = this._playerSelectionLockedId;
		}
		var indexOf = _.lastIndexOf(this._playerSelectionLockedRequests, id);
		if (indexOf !== -1) {
			var numRequests = this._playerSelectionLockedRequests.length;
			this._playerSelectionLockedRequests.splice(indexOf, 1);
			if (numRequests === 1 && this._playerSelectionLockedRequests.length === 0) {
				this.setPlayerSelectionLocked(false);
			}
		}
	},

	getIsPlayerSelectionLocked: function () {
		return !this.getIsGameActive() || !this._player.getIsCurrentPlayer() || this._playerSelectionLocked || SDK.GameSession.getInstance().getIsWaitingForSubmittedExplicitAction();
	},

	getCurrentSdkActionInterface: function () {
		return this._currentSdkActionInterface;
	},
	getLastShownSdkStateRecordingAction: function () {
		return this._lastShownSdkStateRecordingAction;
	},
	getCurrentSdkStepInterface: function () {
		return this._currentSdkStepInterface;
	},
	getIsShowingStep: function () {
		return this.getCurrentSdkStepInterface() != null;
	},

	getDelayFromAnim: function (animIdentifier) {
		if (animIdentifier != null) {
			var anim = cc.animationCache.getAnimation(animIdentifier);
			if (anim) {
				return anim.getDuration();
			}
		}
		return 0.0;
	},

	getNextActionInterfaceInActionSequence: function (allowModifierAction) {
		// from current step look until we find next action
		for (var i = this._nextActionIndex, il = this._currentActionSequence.length; i < il; i++) {
			var sdkActionInterface = this._currentActionSequence[i];
			var nextAction = sdkActionInterface.getSdkAction();
			if (allowModifierAction || !(nextAction instanceof ModifierAction)) {
				return sdkActionInterface;
			}
		}
	},

	getIsActionSpawn: function (action) {
		return action instanceof SDK.ApplyCardToBoardAction && action.getCard() instanceof SDK.Entity;
	},

	getIsActionSpell: function (action) {
		return action instanceof SDK.ApplyCardToBoardAction && action.getCard() instanceof SDK.Spell;
	},

	getIsActionRemoval: function (action) {
		return action instanceof SDK.RemoveAction || action instanceof SDK.KillAction;
	},

	getEntityNodes: function () {
		return this._entityNodes;
	},

	getUnitNodes: function () {
		return this._unitNodes;
	},

	getTileNodes: function () {
		return this._tileNodes;
	},

	getSpellNodes: function () {
		return this._spellNodes;
	},

	getMovingUnitNodeUnderMouse: function (screenX, screenY, allowInactive, allowUntargetable) {
		var unitNode = this.getUnitNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable);
		if (unitNode && unitNode.getIsMoving()) {
			return unitNode;
		}
	},

	getEntityNodeUnderMouse: function (screenX, screenY, allowInactive, allowUntargetable) {
		return this.getUnitNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable) || this.getTileNodeUnderMouse(screenX, screenY, allowInactive, allowUntargetable);
	},

	getUnitNodeUnderMouse: function (screenX, screenY, allowInactive, allowUntargetable) {
		return this.getNodeUnderMouse(this._unitNodes, screenX, screenY, allowInactive, allowUntargetable);
	},

	getTileNodeUnderMouse: function (screenX, screenY, allowInactive, allowUntargetable) {
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
	getNodeUnderMouse: function (nodes, screenX, screenY, allowInactive, allowUntargetable) {
		var inactiveNode;

		if (nodes) {
			if (!_.isArray(nodes)) {
				nodes = [nodes];
			}

			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if (node.isVisible() && node.getDisplayedOpacity() > 0.0 && (allowUntargetable || !(node instanceof EntityNode) || node.getIsTargetable()) && UtilsEngine.getNodeUnderMouse(node, screenX, screenY)) {
					// always return an active node first
					if (!(node instanceof EntityNode) || node.getIsActive()) {
						return node;
					} else if (inactiveNode == null) {
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

	getEntityNodeAtBoardPosition:function(boardX, boardY, allowInactive, allowUntargetable) {
		return this.getUnitNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable) || this.getTileNodeAtBoardPosition(boardX, boardY, allowInactive, allowUntargetable);
	},

	getUnitNodeAtBoardPosition:function(boardX, boardY, allowInactive, allowUntargetable) {
		return this.getNodeAtBoardPosition(this._unitNodes, boardX, boardY, allowInactive, allowUntargetable);
	},

	getTileNodeAtBoardPosition:function(boardX, boardY, allowInactive, allowUntargetable) {
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
	getNodeAtBoardPosition: function (nodes, boardX, boardY, allowInactive, allowUntargetable) {
		if (nodes) {
			if (!_.isArray(nodes)) {
				nodes = [nodes];
			}

			var activeApproximateNode;
			var activeExactNode;
			var inactiveApproximateNode;
			var inactiveExactNode;
			var approximate = boardY !== (boardY | 0);
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var nodeBoardPosition = node.getBoardPosition();
				var nodeBoardX = nodeBoardPosition.x;
				var nodeBoardY = nodeBoardPosition.y;
				var dx = boardX - nodeBoardX;
				var dy = boardY - nodeBoardY;
				var isExactX = dx <= 0.5 && dx >= -0.5;
				var isExactY = dy <= 0.5 && dy >= -0.5;
				var isExact = isExactX && isExactY;
				var isApproximate = approximate && isExactX && !isExactY && dy < 0.5 + CONFIG.TILE_TARGET_PCT && dy > 0.5;
				var isTargetable = !_.isFunction(node.getIsTargetable) || node.getIsTargetable();
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

	getNodeForSdkCard: function (sdkCard) {
		if (sdkCard != null) {
			function nodeHasSdkCard (node) { return node.getSdkCard() === sdkCard; }
			return _.find(this._unitNodes, nodeHasSdkCard) || _.find(this.bottomDeckLayer.getCardNodes(), nodeHasSdkCard) || _.find(this._tileNodes, nodeHasSdkCard) || _.find(this.player1Layer.getArtifactNodes(), nodeHasSdkCard) || _.find(this.player2Layer.getArtifactNodes(), nodeHasSdkCard);
		}
	},

	getGeneralNodeForPlayer1: function () {
		return this.getNodeForSdkCard(SDK.GameSession.getInstance().getGeneralForPlayer1());
	},

	getGeneralNodeForPlayer2: function () {
		return this.getNodeForSdkCard(SDK.GameSession.getInstance().getGeneralForPlayer2());
	},


	/* endregion GETTERS / SETTERS */

	/* region COCOS EVENTS */

	/* endregion COCOS EVENTS */

	/* region EVENT HANDLERS */

	onSetupTransitionIn: function () {
		FXCompositeLayer.prototype.onSetupTransitionIn.call(this);
		Logger.module("ENGINE").log("GameLayer.onSetupTransitionIn");

		// setup battle
		this._battleMap.setup();
		this._battleMap.whenStatus(BattleMap.STATUS.SETUP).then(function () {
			// bind to sdk events and put loaded units/spells into battle
			this.bindToGameSession();
		}.bind(this));
	},

	onTransitionIn: function () {
		FXCompositeLayer.prototype.onTransitionIn.call(this);
		Logger.module("ENGINE").log("GameLayer.onTransitionIn");
		this.start();
	},

	onResize: function () {
		this._super();

		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

		// notifications
		this._notificationYourTurnSprite.setPosition(winCenterPosition);
		this._notificationEnemyTurnSprite.setPosition(winCenterPosition);
		this._notificationGoSprite.setPosition(winCenterPosition);

		// game state
		if (this.getIsGameActive()) {
			var currentSdkStepInterface = this._currentSdkStepInterface;

			// rebind to game session is safest method to reposition all entities when game active
			this.bindToGameSession();

			// issue an after show step if one was cleared that would have played
			if (currentSdkStepInterface != null) {
				this._afterShowStep(currentSdkStepInterface);
			}
		} else {
			// when game is not active, no actions should be executing and it is safe to just reposition
			var entityNodes = this._entityNodes;
			for (var i = 0, il = entityNodes.length; i < il; i++) {
				var entityNode = entityNodes[i];
				entityNode.setPosition(UtilsEngine.transformBoardToTileMap(entityNode.getBoardPosition()));
			}
		}
	},

	onRollBack: function() {
		// rebind to game session is safest method to reposition all entities
		this.bindToGameSession();
		this.getEventBus().trigger(EVENTS.show_rollback, {type: EVENTS.show_rollback});
	},

	onInvalidAction: function (event) {
		var action = event.action;
		var validatorType = event.validatorType;
		var validationMessage = event.validationMessage;
		var validationMessagePosition = event.validationMessagePosition;
		var myPlayer = this.getMyPlayer();
		var sourceCard = action.getSource();

		// only show invalidation notification if we have a message for a non-implicit action
		if (validationMessage && !action.getIsImplicit() && action.getOwnerId() === myPlayer.getPlayerId()) {
			if (action instanceof SDK.DrawStartingHandAction) {
				// show message centered above cards for mulligan
				var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
				var cardsStartPosition = cc.p(winCenterPosition.x, winCenterPosition.y + CONFIG.HAND_CARD_SIZE * 0.5);
				this.showInstructionAtPosition(cardsStartPosition, validationMessage);
			} else if (action instanceof SDK.ReplaceCardFromHandAction) {
				this.showInstructionAtPosition(this.bottomDeckLayer.getReplaceNode().getPosition(), validationMessage);
			} else if (validationMessagePosition) {
				// show message at position
				var validationMessagePosition = validationMessagePosition;
				var entityNode = this.getEntityNodeAtBoardPosition(validationMessagePosition.x, validationMessagePosition.y, true, true);
				if (entityNode) {
					this.showInstructionForSdkNode(entityNode, validationMessage);
				} else {
					this.showInstructionOverTile(validationMessagePosition, validationMessage);
				}
			} else {
				// find source node and show text above it
				var sourceNode = sourceCard instanceof SDK.Entity && this.getNodeForSdkCard(sourceCard);
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
			var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
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
			// 	// notify of unit that is attempting to act
			// 	var unitNode = this.getNodeForSdkCard(sourceCard);
			// 	if (unitNode) {
			// 		var unitPosition = unitNode.getPosition();
			// 		this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
			// 	}

			// 	// find each provoking unit around the source of the action and notify
			// 	var sourceBoardPosition = action.getSourcePosition();
			// 	var sdkUnits = SDK.GameSession.getInstance().getBoard().getCardsAroundPosition(sourceBoardPosition, SDK.CardType.Unit, 1);
			// 	for (var i = 0, il = sdkUnits.length; i < il; i++) {
			// 		var sdkCard = sdkUnits[i];
			// 		if (sdkCard && sdkCard.getOwnerId() !== action.getOwnerId() && sdkCard.getModifierByClass(SDK.ModifierProvoke)) {
			// 			var unitNode = this.getNodeForSdkCard(sdkCard);
			// 			if (unitNode) {
			// 				var unitPosition = unitNode.getPosition();
			// 				this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
			// 			}
			// 		}
			// 	}
			// 	// action is an attack and source is a ranged unit, check for ranged provoke also
			// 	if (action instanceof SDK.AttackAction) {
			// 		var sourceSdkCard = SDK.GameSession.getInstance().getBoard().getEntityAtPosition(sourceBoardPosition);
			// 		if (sourceSdkCard && sourceSdkCard.getModifierByClass(SDK.ModifierRanged)) {
			// 			showRangedProvokers = true;
			// 		}
			// 	}
			// }

			// if (validatorType === SDK.ModifierRangedProvoke.type || showRangedProvokers) {
			// 	// notify of unit that is attempting to act
			// 	var unitNode = this.getNodeForSdkCard(sourceCard);
			// 	if (unitNode) {
			// 		var unitPosition = unitNode.getPosition();
			// 		this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
			// 	}

			// 	// find each ranged provoking unit and flash an instructional arrow
			// 	for (var i = 0, il = this._unitNodes.length; i < il; i++) {
			// 		var unitNode = this._unitNodes[i];
			// 		var sdkCard = unitNode.getSdkCard();
			// 		if (sdkCard && sdkCard.getOwnerId() !== action.getOwnerId() && sdkCard.getModifierByClass(SDK.ModifierRangedProvoke)) {
			// 			var unitPosition = unitNode.getPosition();
			// 			this._showEmphasisSprite(RSX.modifier_provoked.img, cc.p(unitPosition.x, unitPosition.y + CONFIG.TILESIZE * 0.75));
			// 		}
			// 	}
			// }
		}
	},

	onStep: function (event) {
		var sdkStep = event.step;
		var sdkStepIndex = sdkStep.getIndex();
		var action = sdkStep.getAction();
		var myAction = action.getOwnerId() === this._player.getPlayerId();
		var sdkStepInterface = this._stepInterfacesByIndex[sdkStepIndex] = new SdkStepInterface(sdkStep);

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
		for (var i = 0, il = sdkStepInterface.actionInterfaceSequence.length; i < il; i++) {
			var sdkActionInterface = sdkStepInterface.actionInterfaceSequence[i];
			var sequenceAction = sdkActionInterface.getSdkAction();
			if (sequenceAction instanceof SDK.ApplyCardToBoardAction && sequenceAction.getIsValidApplication()) {
				var card = sequenceAction.getCard();
				if (card instanceof SDK.Entity) {
					// create node for card
					var node = this.addNodeForSdkCard(card, sequenceAction.getTargetPosition());
					if (node instanceof EntityNode) {
						// show placeholder until node shows spawn
						node.showPlaceholder();
					}
				}
			}
		}

		// certain steps can be ignored by the step replay system
		// either they don't do anything visually or they bypass the system entirely
		var canReplayStep = !(action instanceof SDK.RollbackToSnapshotAction);
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
					var stickyTargetNode = this._player.getStickyTargetNode();
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
					sdkStepInterface.loadPromise.then(function () {
						this.showPlayCard(action, CONFIG.MY_PLAYED_CARD_TRANSITION_DURATION, CONFIG.MY_PLAYED_CARD_SHOW_DURATION, true);
					}.bind(this));
				}
			}

			// add step to queue for display
			this._stepQueue.push(sdkStepInterface);

			// show next step if none is in progress
			// defer is necessary in case this step was added as a result of a previous step
			_.defer(function () {
				if (this._currentSdkStepInterface == null && this._waitingToShowStep == null) {
					this.showNextStep();
				}
			}.bind(this));
		}
	},

	/* endregion EVENT HANDLERS */

	/* region MULLIGAN */

	/**
	 * Shows the hand to choose for the starting hand for my player.
	 * @returns {Promise}
	 */
	showChooseHand: function () {
		return this.whenStatus(GameLayer.STATUS.NEW).then(function () {
			Logger.module("ENGINE").log("GameLayer.showChooseHand");
			// bind players and change status
			this.bindSdkPlayers();
			this.setStatus(GameLayer.STATUS.TRANSITIONING_TO_CHOOSE_HAND);

			// highlight only my general after highlighting both
			this.whenHighlightedGeneralsAsync().then(function () {
				if (SDK.GameSession.getInstance().isNew()) {
					this._highlightOnlyMyGeneral();
				}
			}.bind(this));

			// show choose
			var showChooseHandPromise = this.bottomDeckLayer.showChooseHand().then(function () {
				this.setStatus(GameLayer.STATUS.CHOOSE_HAND);
			}.bind(this));

			return showChooseHandPromise;
		}.bind(this));
	},

	/**
	 * Returns an array of indices chosen by the player to be mulliganed.
	 * @returns {Array}
	 */
	getMulliganIndices: function () {
		var mulliganIndices = [];
		if (this.getIsChooseHand()) {
			var cardNodes = this.getBottomDeckLayer().getCardNodes();

			// get mulligan indices from selected cards
			for (var i = 0, il = cardNodes.length; i < il; i++) {
				var cardNode = cardNodes[i];
				var cardIndex = cardNode.getHandIndex();
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
	showSubmitChosenHand: function () {
		return Promise.all([
			this.whenStatus(GameLayer.STATUS.NEW),
			this.whenStatus(GameLayer.STATUS.CHOOSE_HAND)
		]).then(function () {
			Logger.module("ENGINE").log("GameLayer.showSubmitChosenHand");
			// bind players and change status
			this.bindSdkPlayers();
			this.setStatus(GameLayer.STATUS.SUBMIT_HAND);
		}.bind(this));
	},

	/**
	 * Shows drawing of starting hand for my player.
	 * @returns {Promise}
	 */
	showDrawStartingHand: function (mulliganIndices) {
		return Promise.all([
			this.whenStatus(GameLayer.STATUS.NEW),
			this.whenStatus(GameLayer.STATUS.CHOOSE_HAND)
		]).then(function () {
			Logger.module("ENGINE").log("GameLayer.showDrawStartingHand");
			// bind players and change status
			this.bindSdkPlayers();
			this.setStatus(GameLayer.STATUS.TRANSITIONING_TO_DRAW_HAND);

			// highlight only my general after highlighting both
			this.whenHighlightedGeneralsAsync().then(function () {
				if (SDK.GameSession.getInstance().isNew()) {
					this._highlightOnlyMyGeneral();
				}
			}.bind(this));

			// show draw
			return this.bottomDeckLayer.showDrawStartingHand(mulliganIndices).then(function () {
				this.setStatus(GameLayer.STATUS.DRAW_HAND);
			}.bind(this));
		}.bind(this));
	},

	/**
	 * Shows the starting hand for my player.
	 * @returns {Promise}
	 */
	showStartingHand: function () {
		return this.whenStatus(GameLayer.STATUS.NEW).then(function () {
			Logger.module("ENGINE").log("GameLayer.showStartingHand");
			// bind players and change status
			this.bindSdkPlayers();
			this.setStatus(GameLayer.STATUS.STARTING_HAND);

			// highlight only my general after highlighting both
			this.whenHighlightedGeneralsAsync().then(function () {
				if (SDK.GameSession.getInstance().isNew()) {
					this._highlightOnlyMyGeneral();
				}
			}.bind(this));

			// show starting hand
			this.bottomDeckLayer.showStartingHand();
		}.bind(this));
	},

	/**
	 * Returns a promise for when the status is set to a status that can transition into an active game.
	 * @returns {Promise}
	 */
	whenIsStatusForActiveGame: function () {
		if (this.getIsSubmitHand() || this.getIsTransitioningToDrawHand()) {
			// when we've submitted the starting hand or are in the process of drawing our starting hand
			// wait for draw hand to complete before switching to active game
			Logger.module("ENGINE").log("GameLayer.showActiveGame -> waiting for draw");
			return this.whenStatus(GameLayer.STATUS.DRAW_HAND);
		} else {
			Logger.module("ENGINE").log("GameLayer.showActiveGame -> waiting for new");
			return this.whenStatus(GameLayer.STATUS.NEW);
		}
	},

	/**
	 * Shows the active game state when the status is set to a status that can transition into an active game.
	 * @returns {Promise}
	 */
	showActiveGame: function () {
		if (this._showActiveGamePromise == null) {
			this._showActiveGamePromise = new Promise(function (resolve, reject) {
				this.whenIsStatusForActiveGame().then(function () {
					Logger.module("ENGINE").log("GameLayer.showActiveGame");
					// bind players and change status
					this.bindSdkPlayers();
					this.setStatus(GameLayer.STATUS.TRANSITIONING_TO_ACTIVE);

					// transition to active hand
					this.bottomDeckLayer.showActiveHand();
					this.whenHighlightedGeneralsAsync().then(function () {

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
						return this._battleMap.whenStatus(BattleMap.STATUS.ACTIVE).then(function () {
							Logger.module("ENGINE").log("GameLayer set active game");

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

							this.getEventBus().trigger(EVENTS.show_active_game, {type: EVENTS.show_active_game});

							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}

		return this._showActiveGamePromise;
	},

	/* endregion MULLIGAN */

	/* region GAME STATE */

	resetActiveState: function () {
		Logger.module("ENGINE").log("GameLayer.resetActiveState");
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
		SDK.NetworkManager.getInstance().broadcastGameEvent({type:EVENTS.network_game_mouse_clear, timestamp: Date.now()});
	},

	updateCurrentPlayer: function () {
		this.bindSdkPlayers();
		this._player.setIsCurrentPlayer(this._player.getSdkPlayer().getIsCurrentPlayer());
		this._opponent.setIsCurrentPlayer(this._opponent.getSdkPlayer().getIsCurrentPlayer());
	},

	bindSdkPlayers: function () {
		var gameSession = SDK.GameSession.getInstance();
		var myPlayerId = gameSession.getMyPlayerId();
		var opponentPlayerId = gameSession.getOpponentPlayerId();
		this._player.setPlayerId(myPlayerId);
		this._player.setIsMyPlayer(true);
		this._opponent.setPlayerId(opponentPlayerId);
		this._altPlayer.setPlayerId(myPlayerId);
		this._altPlayer.setIsAltPlayer(true);
	},

	bindToGameSession: function() {
		if (SDK.GameSession.getInstance().getIsMyFollowupActiveAndCancellable()) {
			// cancel out of active followup (rollback will trigger this method)
			SDK.GameSession.getInstance().submitExplicitAction(SDK.GameSession.getInstance().actionRollbackSnapshot())
		} else {
			// check if this is binding for new game
			var forNewGame = !this.getIsActive();

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
			var board = SDK.GameSession.getInstance().getBoard();
			var allCardTypes = null;
			var allowUntargetable = true;
			this.addNodesForSdkCards(board.getCards(allCardTypes, allowUntargetable));

			// set all units as spawned and in their base state
			var entityNodes = this._entityNodes;
			for (var i = 0, il = entityNodes.length; i < il; i++) {
				var entityNode = entityNodes[i];
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
				var actions = SDK.GameSession.getInstance().getActions();
				if (actions.length > 0) {
					for (var i = actions.length - 1; i >= 0; i--) {
						var action = actions[i];
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

	bindAppliedModifiers: function (modifierFadeDuration) {
		var entityNodes = this._entityNodes;
		for (var i = 0; i < entityNodes.length; i++) {
			this.bindAppliedModifiersForEntityNode(entityNodes[i], modifierFadeDuration);
		}
	},

	bindAppliedModifiersForEntityNode: function (entityNode, modifierFadeDuration) {
		var sdkCard = entityNode.getSdkCard();
		var modifiers = sdkCard.getModifiers();
		if (modifiers.length > 0) {
			for (var j = 0, jl = modifiers.length; j < jl; j++) {
				var modifier = modifiers[j];
				if (modifier instanceof SDK.Modifier) {
					entityNode.showAppliedModifier(modifier, null, true);
					if (modifier.getIsActive()) {
						entityNode.showActivatedModifier(modifier, null, true, modifierFadeDuration);
					}
				}
			}
		}
	},

	showGameOver: function () {

		var winningSdkPlayer = SDK.GameSession.getInstance().getWinner();
		Logger.module("ENGINE").log("GameLayer.showGameOver -> winningPlayer", winningSdkPlayer);
		// this event is pretty useful for notifying other parts of the engine/ui to fade out since game over animations are about to play
		this.getEventBus().trigger(EVENTS.before_show_game_over, {type: EVENTS.before_show_game_over});

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
					cc.callFunc(function () {
						this._showGameOverComplete();
					}.bind(this))
				)
			);
		} else {
			var victoryFXDelay = 0.0;
			var winningGeneral = SDK.GameSession.current().getGeneralForPlayerId(winningSdkPlayer.playerId);
			var losingSdkPlayer = SDK.GameSession.getInstance().getLoser();
			var losingPlayerId = losingSdkPlayer.getPlayerId();
			var losingPlayer = this.getPlayerById(losingPlayerId);
			var losingGeneral = SDK.GameSession.getInstance().getGeneralForPlayerId(losingPlayerId);

			// when final step is resign, show speech from resigning player
			if (SDK.GameSession.getInstance().getGameEndingStep().getAction() instanceof SDK.ResignAction) {
				var losingPlayerSetupData = SDK.GameSession.getInstance().getPlayerSetupDataForPlayerId(losingPlayer.getPlayerId());
				var losingFactionId = losingPlayerSetupData.factionId;
				var losingFaction = SDK.FactionFactory.factionForIdentifier(losingFactionId);
				victoryFXDelay += this.showSpeechForPlayer(losingPlayer, losingFaction.resignStatement, null, CONFIG.DIALOGUE_RESIGN_DURATION, false, 0.6);
			}

			// show victory fx over winning general
			var victorySprite = GlowSprite.create({
				spriteIdentifier: RSX.fx_winner.name,
				antiAlias: false,
				needsDepthDraw: true,
				scale: CONFIG.SCALE
			});
			var position = UtilsEngine.transformBoardToTileMap(winningGeneral.getPosition());
			victorySprite.setPosition(cc.p(position.x, position.y + 150));

			// set up fireworks particles
			var particles = BaseParticleSystem.create({
				plistFile: RSX.ptcl_victory_decal_fireworks.plist,
				affectedByWind: true
			});
			particles.setPosition(victorySprite.getPosition());

			// add lights
			var lights = [];
			var winnerLight = Light.create();
			winnerLight.setRadius(CONFIG.TILESIZE * 3.0);
			winnerLight.setFadeInDuration(0.5);
			winnerLight.setIntensity(CONFIG.LIGHT_HIGH_INTENSITY);
			var winnerLightScreenPosition = UtilsEngine.transformBoardToTileMap(winningGeneral.getPosition());
			winnerLightScreenPosition.y += -CONFIG.TILESIZE * 0.35;
			winnerLight.setPosition(winnerLightScreenPosition);
			lights.push(winnerLight);

			if (losingGeneral != null) {
				var loserLight = Light.create();
				loserLight.setRadius(CONFIG.TILESIZE * 3.0);
				loserLight.setFadeInDuration(0.5);
				loserLight.setIntensity(CONFIG.LIGHT_HIGH_INTENSITY);
				var loserLightScreenPosition = UtilsEngine.transformBoardToTileMap(losingGeneral.getPosition());
				loserLightScreenPosition.y += -CONFIG.TILESIZE * 0.35;
				loserLight.setPosition(loserLightScreenPosition);
				lights.push(loserLight);
			}

			this.addNodes(lights);

			// show victory fx animation
			victorySprite.runAction(
				cc.sequence(
					cc.delayTime(victoryFXDelay),
					cc.callFunc(function () {
						audio_engine.current().play_effect(RSX.sfx_victory_crest.audio);
					}.bind(this)),
					UtilsEngine.getAnimationAction(RSX.fx_winner.name),
					cc.delayTime(-0.5),
					cc.callFunc(function(){
						// add particles
						this.addNodes(particles);
						// additive blending
						victorySprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
						// tint to white but start at 0 alpha tint
						victorySprite.setTint(cc.color(255,255,255,0));
					}.bind(this)),
					cc.actionTween(CONFIG.FADE_FAST_DURATION, TweenTypes.TINT_FADE, 0.0, 255.0),
					cc.actionTween(CONFIG.FADE_FAST_DURATION, TweenTypes.TINT_FADE, 255.0, 0.0),
					cc.fadeTo(CONFIG.FADE_FAST_DURATION,0.0),
					cc.callFunc(function(){
						// finish game over
						this._showGameOverComplete();
					}.bind(this))
				)
			);
			this.uiLayer.addChild(victorySprite, -9999);
		}
	},

	_showGameOverComplete: function () {
		Logger.module("ENGINE").log("GameLayer._showGameOverComplete");
		// prep for terminate
		this._prepareForTerminate();

		// notify
		this.getEventBus().trigger(EVENTS.show_game_over, {type: EVENTS.show_game_over});
	},

	getIsShowingEndTurn: function () {
		return this._showingEndTurn;
	},

	getIsShowingStartTurn: function () {
		return this._showingStartTurn;
	},

	whenStartTurnShown: function () {
		return this._showStartTurnPromise || Promise.resolve();
	},

	showEndTurn: function (action) {
		var showDuration = 0.0;

		if (!this._showingEndTurn) {
			Logger.module("ENGINE").log("GameLayer.showEndTurn");
			// finish previous
			this._cleanupShowingEndTurn();
			this._setupStartTurnPromises();
			this._showingEndTurn = true;

			// lock down ui until turn change is completed
			this.requestPlayerSelectionLocked("turn_change");

			// reset last card with automatic action for end turn
			this._lastCardWithAutomaticAction = null;

			// emit event that end turn is showing
			this.getEventBus().trigger(EVENTS.show_end_turn, {type: EVENTS.show_end_turn});

			// finish showing end turn
			this._cleanupShowingEndTurn();
		}

		return showDuration;
	},

	_cleanupShowingEndTurn: function () {
	},

	afterShowEndTurn: function () {
		if (this._showingEndTurn) {
			Logger.module("ENGINE").log("GameLayer.afterShowEndTurn");
			this._showingEndTurn = false;
			if (SDK.GameSession.getInstance().getIsSpectateMode()) {
				this.updateReadinessTagForAllEntities();
			} else {
				this.resetActiveState();
			}
			this.getEventBus().trigger(EVENTS.after_show_end_turn, {type: EVENTS.after_show_end_turn});
		}
	},

	showStartTurn: function (delay) {
		var showDuration = 0.0;

		if (!this._showingStartTurn) {
			Logger.module("ENGINE").log("GameLayer.showStartTurn");
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
				var battleLogNodes = this._battleLog.getBattleLogNodesInUse();
				for (var i = 0, il = battleLogNodes.length; i < il; i++) {
					battleLogNodes[i].updateSpritesForOwner();
				}

				// update entity nodes
				var entityNodes = this._entityNodes;
				for (var i = 0, il = entityNodes.length; i < il; i++) {
					entityNodes[i].updateSpritesForOwner();
				}
			}

			// update show duration
			var signatureCardCooldownDuration = CONFIG.ANIMATE_MEDIUM_DURATION;
			showDuration += CONFIG.NOTIFICATION_DURATION + CONFIG.NOTIFICATION_TRANSITION_DURATION + signatureCardCooldownDuration;

			// play sound of turn change
			audio_engine.current().play_effect(RSX.sfx_ui_yourturn.audio, false);

			// show notification for start turn
			var currentStep = this._currentSdkStepInterface && this._currentSdkStepInterface.getSdkStep();
			var currentAction = currentStep && currentStep.getAction();
			var myPlayerIsCurrent = this.getMyPlayer() === this.getCurrentPlayer();
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
				cc.callFunc(function () {
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
				}.bind(this)),
				cc.spawn(
					cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, 30.0, 0.0).easing(cc.easeExponentialIn()),
					cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)
				),
				cc.callFunc(function () {
					this._cleanupShowingStartTurn();
				}.bind(this))
			));

			// trigger event
			this.getEventBus().trigger(EVENTS.show_start_turn, {type: EVENTS.show_start_turn, showDuration: showDuration});
		}

		return showDuration;
	},

	_cleanupShowingStartTurn: function () {
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

	afterShowStartTurn: function () {
		if (this._showingStartTurn) {
			(this._beginShowStartTurnPromise || Promise.resolve())
			.then(function () {
				if (!this._showingStartTurn) return; // no longer showing start turn
				this._showingStartTurn = false;
				Logger.module("ENGINE").log("GameLayer.afterShowStartTurn");

				// reset last card with automatic action for turn
				this._lastCardWithAutomaticAction = null;

				// when showing start turn with automatic actions (ex: battle pets)
				// we notify player first that automatic actions are occurring
				// now notify player they can start playing their turn
				if (this._showingStartTurnWithAutomaticActions) {
					var myPlayerIsCurrent = this.getMyPlayer() === this.getCurrentPlayer();
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
							cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION)
						),
						cc.callFunc(function () {
							this._finishShowingAfterStartTurn();
						}.bind(this))
					));
				}

				// unlock ui
				if (this.getPlayerSelectionLocked()) {
					this.requestPlayerSelectionUnlocked("turn_change");
				} else {
					this._updateGameForPlayerSelectionLockedChange();
				}

				this.getEventBus().trigger(EVENTS.after_show_start_turn, {type: EVENTS.after_show_start_turn});

				// resolve
				this._resolveAfterStartTurnPromise();
			}.bind(this))
			.catch(function (error) {
				EventBus.getInstance().trigger(EVENTS.error, error);
			});
		}
	},

	_finishShowingAfterStartTurn: function () {
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

	_resolveBeginStartTurnPromise: function () {
		if (this._beginShowStartTurnPromiseResolve != null) {
			this._beginShowStartTurnPromiseResolve();
			this._beginShowStartTurnPromiseResolve = null;
		}
	},

	_resolveAfterStartTurnPromise: function () {
		if (this._afterShowStartTurnPromiseResolve != null) {
			this._afterShowStartTurnPromiseResolve();
			this._afterShowStartTurnPromiseResolve = null;
		}
	},

	_setupStartTurnPromises: function () {
		// create promise for when start turn is beginning to show
		if (this._beginShowStartTurnPromise == null) {
			this._beginShowStartTurnPromise = new Promise(function (resolve) {
				// store resolve so we can resolve even if showing start of turn is interrupted
				this._beginShowStartTurnPromiseResolve = resolve;
			}.bind(this))
				.then(function () {
					this._beginShowStartTurnPromise = null;
				}.bind(this));
		}

		// create promise for after start turn shows
		if (this._afterShowStartTurnPromise == null) {
			this._afterShowStartTurnPromise = new Promise(function (resolve) {
				// store resolve so we can resolve even if showing start of turn is interrupted
				this._afterShowStartTurnPromiseResolve = resolve;
			}.bind(this))
				.then(function () {
					this._afterShowStartTurnPromise = null;
				}.bind(this));
		}

		// create promise for when start turn is completely shown
		if (this._showStartTurnPromise == null) {
			this._showStartTurnPromise = Promise.all([
				this._beginShowStartTurnPromise,
				this._afterShowStartTurnPromise
			])
				.then(function () {
					this._showStartTurnPromise = null;
				}.bind(this))
				.catch(function (error) {
					EventBus.getInstance().trigger(EVENTS.error, error);
				});
		}
	},

	_stopShowingChangeTurn: function () {
		this._showingEndTurn = false;
		this._showingStartTurn = false;
		this._cleanupShowingEndTurn();
		this._cleanupShowingStartTurn();
		this._finishShowingAfterStartTurn();
		this._resolveBeginStartTurnPromise();
		this._resolveAfterStartTurnPromise();
		this.requestPlayerSelectionUnlocked("turn_change");
	},

	/* endregion GAME STATE */

	/* region STEPS */

	resetStepQueue: function () {
		this._resetCurrentAction();
		this._resetCurrentStep();
		this._stopShowingChangeTurn();
		this._stopCurrentActionSequences();
		this._setCurrentStepRootActionInterface(null);
		this._waitingToShowStep = null;

		// clear queue
		var stepQueue = this._stepQueue;
		this._stepQueue = [];

		// unload all steps that were in queue
		_.each(stepQueue, function (sdkStepInterface) {
			PackageManager.getInstance().unloadMajorMinorPackages(sdkStepInterface.resourcePackageIds);
		});
	},

	_resetCurrentStep: function () {
		if (this._currentSdkStepInterface != null) {
			// null step ref
			var sdkStepInterface = this._currentSdkStepInterface;
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

	_resetCurrentAction: function () {
		this._stopShowActionSequences();
		this._currentSdkActionInterface = null;
		this._currentActionSourceSdkCard = null;
		this._currentActionSourceNode = null;
		this._currentActionTargetSdkCard = null;
		this._currentActionTargetNode = null;
	},

	_stopShowActionSequences: function () {
		// action sequences used to advance showing the action graph
		this._stopShowActionCardSequence();
		this._stopSetupActionForShowSequence();
		this._stopNextActionSequence();
	},

	_stopCurrentActionSequences: function () {
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

	_stopShowActionCardSequence: function () {
		if (this._showActionCardSequence != null) {
			this.stopAction(this._showActionCardSequence);
			this._showActionCardSequence = null;
			this._showActionCardSequenceCompletedCallback = null;
		}
	},

	_getShowActionCardSequenceCompletedCallback: function () {
		var callback = this._showActionCardSequenceCompletedCallback;
		if (callback == null) {
			callback = this.showNextAction.bind(this);
		}
		return callback
	},

	skipShowActionCardSequence: function () {
		// skip showing card for action sequence
		if (this._showActionCardSequence != null) {
			var showActionCardSequenceCompletedCallback = this._getShowActionCardSequenceCompletedCallback();
			this._stopShowActionCardSequence();
			this.stopShowingPlayCard();
			showActionCardSequenceCompletedCallback();
		}
	},

	getIsShowingActionCardSequence: function () {
		return this._showActionCardSequence != null;
	},

	_stopSetupActionForShowSequence: function () {
		if (this._setupActionForShowSequence) {
			this.stopAction(this._setupActionForShowSequence);
			this._setupActionForShowSequence = null;
		}
	},

	_stopNextActionSequence: function () {
		if (this._nextActionSequence) {
			this.stopAction(this._nextActionSequence);
			this._nextActionSequence = null;
		}
	},

	_setCurrentStepRootActionInterface: function (actionInterface) {
		if (this._currentStepRootActionInterface !== actionInterface) {
			this._currentStepRootActionInterface = actionInterface;
			this._hasShownPlayCardActionSetup = false;
			this._removeActionAutoFX();
		}
	},

	_setCurrentSequenceRootSdkActionInterface: function (sdkActionInterface) {
		if (this._currentSequenceRootSdkActionInterface !== sdkActionInterface) {
			this._currentSequenceRootSdkActionInterface = sdkActionInterface;
			this._currentSequenceMaxDelay = this._currentSequenceMaxTargetReactionDelay = 0.0;
		}
	},

	showNextStep: function () {
		// reset
		var sdkStepInterface = this._currentSdkStepInterface;
		this._resetCurrentStep();

		// when we have a step currently
		if(sdkStepInterface) {
			// remove current from queue
			if (this._stepQueue.length > 0 && this._stepQueue[0] === sdkStepInterface) {
				this._stepQueue.shift();
			}

			// finish showing step
			this._afterShowStep(sdkStepInterface);
		}

		var currentSdkStepInterface;
		if(this._stepQueue.length > 0) {
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
				this.whenStartTurnShown().then(function () {
					if (this._currentSdkStepInterface == null && this._waitingToShowStep == currentSdkStepInterface) {
						this._waitingToShowStep = null;
						this.showNextStep();
					}
				}.bind(this));
			}
		} else if (this._waitingToShowStep == null) {
			this._currentSdkStepInterface = currentSdkStepInterface;
			// when step is done loading
			currentSdkStepInterface.loadPromise.then(function () {
				// make sure this is still the current step after loading
				if (currentSdkStepInterface === this._currentSdkStepInterface) {
					// check first action of step
					var currentSdkStep = currentSdkStepInterface.getSdkStep();
					var currentAction = currentSdkStep.getAction();
					var currentSdkActionInterface = this._actionInterfacesByIndex[currentAction.getIndex()];

					// set new step root action
					this._setCurrentStepRootActionInterface(currentSdkActionInterface);

					// update readiness
					this.updateReadinessTagForAllEntities();

					// set current step/action properties
					this._currentActionSequence = currentSdkStepInterface.actionInterfaceSequence;
					this._currentStepTargetingMap = [];
					this._nextActionIndex = 0;

					// emit event that we're going to show this step
					this.getEventBus().trigger(EVENTS.before_show_step, {type: EVENTS.before_show_step, step: currentSdkStep});
					Logger.module("ENGINE").log(" -> showNextStep interface", currentSdkStepInterface, "with action", currentAction);

					// show general cast after explicit apply card to board as long as followup is complete
					var generalCastDelay = 0.0;
					if (currentAction instanceof SDK.ApplyCardToBoardAction && !currentAction.getIsImplicit()) {
						var owner = this.getPlayerById(currentAction.getOwnerId());
						var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
						if ((owner === this._player && !playerActor.getHasCardsWithFollowup()) || (owner === this._opponent && (currentAction instanceof SDK.PlayCardFromHandAction || currentAction instanceof SDK.PlaySignatureCardAction))) {
							var general = SDK.GameSession.getInstance().getGeneralForPlayerId(currentAction.getOwnerId());
							var generalNode = general && this.getNodeForSdkCard(general);
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
							}, this)
						));
					} else {
						this.showNextAction();
					}
				}
			}.bind(this));
		}
	},

	_afterShowStep: function (sdkStepInterface) {
		var sdkStep = sdkStepInterface != null && sdkStepInterface.getSdkStep();
		var action = sdkStep != null && sdkStep.getAction();
		var myAction = action.getOwnerId() === SDK.GameSession.getInstance().getMyPlayerId();

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
		this.getEventBus().trigger(EVENTS.after_show_step, {type: EVENTS.after_show_step, step: sdkStep});

		// show game over after showing game ending step
		var gameEndingSdkStep = SDK.GameSession.getInstance().getGameEndingStep();
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
	_loadStepResources: function (sdkStepInterface) {
		// traverse step action graph to determine all package ids that need to be loaded for this step
		var resource_package_ids_seen = {};
		var unique_resource_package_ids = [];
		var load_promises = [];
		var loadActionResourcePackage = function (id) {
			if (id != null && resource_package_ids_seen[id] == null) {
				resource_package_ids_seen[id] = true;
				var pkg = PKGS.getPkgForIdentifier(id);
				if (pkg != null && pkg.length > 0) {
					// load resources with a unique package identifier
					// so we can release this package as needed
					// but anything else using this same package will be preserved
					var unique_resource_package_id = id + "_" + UtilsJavascript.generateIncrementalId();
					unique_resource_package_ids.push(unique_resource_package_id);
					load_promises.push(PackageManager.getInstance().loadMinorPackage(unique_resource_package_id, pkg, "game"));
				}
			}
		};
		for (var i = 0, il = sdkStepInterface.actionInterfaceSequence.length; i < il; i++) {
			var sdkActionInterface = sdkStepInterface.actionInterfaceSequence[i];
			var sequenceAction = sdkActionInterface.getSdkAction();

			// get resources for source
			var source = sequenceAction.getSource();
			if (source != null) {
				loadActionResourcePackage(PKGS.getCardGamePkgIdentifier(source.getId()));
			}

			// get resources for target
			var target = sequenceAction.getTarget();
			if (target != null) {
				loadActionResourcePackage(PKGS.getCardGamePkgIdentifier(target.getId()));
			}

			// get resources for modifier
			if (sequenceAction instanceof ModifierAction || sequenceAction instanceof SDK.ApplyModifierAction || sequenceAction instanceof SDK.RemoveModifierAction) {
				var modifier = sequenceAction.getModifier();
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
	_parseStepActionGraph: function (sdkStepInterface) {
		// get root action for step
		var sdkStep = sdkStepInterface.getSdkStep();
		var rootAction = sdkStep.getAction();
		var rootActionIndex = rootAction.getIndex();

		// check if the first sequence of this step should show all together
		var stepFirstSequenceShowsAllAtOnce = false;
		if (rootAction instanceof SDK.ApplyCardToBoardAction && !rootAction.getIsImplicit()) {
			var card = rootAction.getCard();
			if (card instanceof SDK.Spell) {
				// spells should always sequence as one
				stepFirstSequenceShowsAllAtOnce = true;
			}
		}

		// flatten depth first actions into mix of breadth first and depth first
		var currentActionsFlattening = [rootAction];
		var currentActionsToFlatten = [];
		var nonModifierActionInterfaces = [];
		var modifierActionInterfaces = [];
		while (currentActionsFlattening.length > 0) {
			// shift current action from the list
			var currentAction = currentActionsFlattening.shift();
			var currentActionIndex = currentAction.getIndex();

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
				var subActions = currentAction.getSubActions().slice(0);

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
				var resolveSubActions = currentAction.getResolveSubActions();
				if (currentAction instanceof SDK.StopBufferingEventsAction) {
					sdkActionInterface.cachedResolveSubActions = _.union(subActions, _.filter(resolveSubActions, function (resolveSubAction) {
						return !this._getIsActionSkippable(resolveSubAction);
					}.bind(this)));
				} else {
					sdkActionInterface.cachedResolveSubActions = [];
					for (var i = 0, il = resolveSubActions.length; i < il; i++) {
						var resolveSubAction = resolveSubActions[i];
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
					var subAction = subActions[i];
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
		var firstSequenceActionInterfaces = [];
		for (var i = 0, il = nonModifierActionInterfaces.length; i < il; i++) {
			var currentActionInterface = nonModifierActionInterfaces[i];
			currentActionInterface.isFirstSequence = true;
			firstSequenceActionInterfaces.push(currentActionInterface);
		}

		// set root as root of first sequence
		var rootActionInterface = this._actionInterfacesByIndex[rootActionIndex];
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
				if (resolveParentActionInterface != null &&
					resolveParentActionInterface.rearrangedActionInterfaces == null && !resolveParentActionInterface.rearranging
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
					var sequenceRootAction = sequenceRootSdkActionInterface.getSdkAction();
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
						var isInvalidSequenceRoot = false;
						if (sequenceRootAction.getTriggeringModifierIndex() != null) {
							// actions created by a triggering modifier are not valid sequence roots
							isInvalidSequenceRoot = true;
						} else if (sequenceRootAction instanceof SDK.ApplyCardToBoardAction && sequenceRootAction.getIsValidApplication()) {
							// apply card to board actions that only trigger first blood are invalid sequence roots
							var hasValidTriggeringModifier = false;
							for (var j = 0, jl = rearrangedActionInterfaces.length; j < jl; j++) {
								var rearrangedActionInterface = rearrangedActionInterfaces[j];
								var rearrangedAction = rearrangedActionInterface.getSdkAction();
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
						var index = _.indexOf(nonModifierActionInterfaces, resolveParentActionInterface);
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
		var actionInterfaceSequence = [];
		var addSequencedActions = function (actionInterfaces, rearranged) {
			for (var i = actionInterfaces.length - 1; i >= 0; i--) {
				var sdkActionInterface = actionInterfaces[i];
				var rearrangedActionInterfaces = sdkActionInterface.rearrangedActionInterfaces;
				if ((!sdkActionInterface.rearranging || rearranged || (rearrangedActionInterfaces != null && rearrangedActionInterfaces.length > 0)) && !_.contains(actionInterfaceSequence, sdkActionInterface)) {
					if (rearrangedActionInterfaces != null) {
						addSequencedActions(rearrangedActionInterfaces, true);
					}
					actionInterfaceSequence.unshift(sdkActionInterface);
				}
			}
		}.bind(this);
		addSequencedActions(nonModifierActionInterfaces);

		// handle triggering modifier actions
		for (var i = actionInterfaceSequence.length - 1; i >= 0; i--) {
			var sdkActionInterface = actionInterfaceSequence[i];
			var currentAction = sdkActionInterface.getSdkAction();
			if (currentAction instanceof ModifierTriggeredAction) {
				var modifier = currentAction.getModifier();
				if (modifier instanceof SDK.Modifier) {
					var resolveParentAction = currentAction.getResolveParentAction();
					var resolveParentActionInterface = this._actionInterfacesByIndex[resolveParentAction.getIndex()];
					var nextActionAfterTriggeringGroupIsSequenceRoot = false;

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
							var nextActionRootAction = nextAction;
							var nextActionResolveParentAction = nextAction.getResolveParentAction();
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
					var indexOfResolveParentAction = _.indexOf(actionInterfaceSequence, resolveParentActionInterface);
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
			var rearrangedActionInterfaces = sdkActionInterface.rearrangedActionInterfaces;

			// check following sequence root
			if (sdkActionInterface.isSequenceRoot && rearrangedActionInterfaces != null && rearrangedActionInterfaces.length > 0) {
				var nextSequenceRootIndex = i + rearrangedActionInterfaces.length + 1;
				var nextSequenceRootActionInterface = actionInterfaceSequence[nextSequenceRootIndex];
				if (nextSequenceRootActionInterface && !nextSequenceRootActionInterface.isSequenceRoot) {
					nextSequenceRootActionInterface.isSequenceRoot = true;
					nextSequenceRootActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(nextSequenceRootActionInterface.getSdkAction());
					nextSequenceRootActionInterface.isSequenceSequencedAsOne = true;
				}
			}
		}

		// when this step ends the game, cache all actions that end the game
		var isGameEndingStep = sdkStep === SDK.GameSession.getInstance().getGameEndingStep();
		if (isGameEndingStep) {
			sdkStepInterface.actionsEndingGame = [];
		}

		// ensure certain actions are always sequence roots
		// this is done before sequence sorting to ensure correct ordering
		var followupTriggerActionMap = {};
		for (var i = 0, il = actionInterfaceSequence.length; i < il; i++) {
			var sdkActionInterface = actionInterfaceSequence[i];
			var currentAction = sdkActionInterface.getSdkAction();
			var sequenceRootSdkActionInterface = null;
			var resolveParentAction = null;
			if (this._getActionIsAlwaysSequenceRoot(currentAction)) {
				sequenceRootSdkActionInterface = sdkActionInterface;

				// both triggering modifier action and this action should be sequence roots
				var rearrangingParentActionInterface = sdkActionInterface.rearrangingParentActionInterface;
				var rearrangingParentAction = rearrangingParentActionInterface && rearrangingParentActionInterface.getSdkAction();
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
				var resolveParentActionIndex = currentAction.getResolveParentActionIndex();
				if (followupTriggerActionMap[resolveParentActionIndex] == null) {
					followupTriggerActionMap[resolveParentActionIndex] = true;
					sequenceRootSdkActionInterface = sdkActionInterface;
				}
			}

			// search for actions that end the game
			// these actions should be cached and forced into sequence roots
			if (isGameEndingStep) {
				if (currentAction instanceof SDK.RemoveAction) {
					var target = currentAction.getTarget();
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
		var forcedSortIndex = null;
		var sortedActionInterfaces = [];
		var currentSequenceRootSdkActionInterface;
		var currentSequenceActionInterfaces;
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
					var parentSdkActionInterface = sdkActionInterface;
					var parentAction = currentAction;
					while (parentAction instanceof ModifierAction
					|| parentAction instanceof SDK.ApplyModifierAction
					|| parentAction instanceof SDK.RemoveModifierAction) {
						var parentOfParentAction = parentAction.getParentAction();
						var resolveParentOfParentAction = parentOfParentAction instanceof SDK.StopBufferingEventsAction ? parentOfParentAction : parentAction.getResolveParentAction();
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
		sortedActionInterfaces = _.sortBy(sortedActionInterfaces, function (sdkActionInterface) {
			var forcedSortIndex = sdkActionInterface.forcedSortIndex;
			if (forcedSortIndex != null) {
				return forcedSortIndex;
			} else {
				var currentAction = sdkActionInterface.getSdkAction();
				if (currentAction instanceof ModifierAction) {
					// use parent action index plus 0.5 as the minimum possible for the next action would be plus 1.0
					// and we want all modifier pseudo-actions to directly follow their parent actions
					return currentAction.getParentActionIndex() + 0.1;
				} else {
					return currentAction.getIndex();
				}
			}
		});

		// reset actionInterfaceSequence
		actionInterfaceSequence = [];

		// add all sorted sequences
		var addSortedSequence = function (sdkActionInterface) {
			actionInterfaceSequence.push(sdkActionInterface);
			var sequenceActionInterfaces = sdkActionInterface.sequenceActionInterfaces;
			if (sequenceActionInterfaces != null && sequenceActionInterfaces.length > 0) {
				for (var i = 0, il = sequenceActionInterfaces.length; i < il; i++) {
					addSortedSequence(sequenceActionInterfaces[i])
				}
			}
		}
		for (var i = 0, il = sortedActionInterfaces.length; i < il; i++) {
			addSortedSequence(sortedActionInterfaces[i]);
		}

		// complete flattening
		for (var i = actionInterfaceSequence.length - 1; i >= 0; i--) {
			var sdkActionInterface = actionInterfaceSequence[i];
			var currentAction = sdkActionInterface.getSdkAction();

			// add all modifiers that were deactivated/activated just after the action they were removed/added by
			var afterActionModifierActionInterfaces = [];
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
			var triggeredModifierActionInterfacesForChanges = sdkActionInterface.cachedTriggeredModifierActionInterfacesForChanges;
			if (triggeredModifierActionInterfacesForChanges && triggeredModifierActionInterfacesForChanges.length > 0) {
				Array.prototype.splice.apply(actionInterfaceSequence, [i, 0].concat(triggeredModifierActionInterfacesForChanges));

				// setup sequencing
				var firstChangeActionInterface = triggeredModifierActionInterfacesForChanges[0];
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
					var siblingActions = sdkActionInterface.siblingActions;
					if (siblingActions == null) {
						// calculate sibling actions
						siblingActions = [currentAction];
						var currentActionType = currentAction.getType();
						var findSiblingsFromActions = function (actions) {
							for (var j = 0, jl = actions.length; j < jl; j++) {
								var action = actions[j];
								if (action.getType() === currentActionType && !_.contains(siblingActions, action)) {
									// add matching action as sibling
									siblingActions.push(action);
								}

								// look through sub actions for sibling actions
								var subActions = action.getResolveSubActions();
								for (var k = 0, kl = subActions.length; k < kl; k++) {
									var subAction = subActions[k];
									if (subAction.getType() === currentActionType && !_.contains(siblingActions, subAction)) {
										siblingActions.push(subAction);
									}
								}
							}
						};
						findSiblingsFromActions(currentAction.getResolveSiblingActions());
						findSiblingsFromActions(resolveParentAction.getResolveSiblingActions());

						// sort siblings by index
						siblingActions = _.sortBy(siblingActions, "index");

						// cache results with each sibling action
						for (var j = 0, jl = siblingActions.length; j < jl; j++) {
							var siblingAction = siblingActions[j];
							var siblingActionInterface = this._actionInterfacesByIndex[siblingAction.getIndex()];
							// sibling action may not have action interface if it is a skippable action
							if (siblingActionInterface != null) {
								siblingActionInterface.siblingActions = siblingActions;
							}
						}
					}

					// if this action has more than 1 sibling
					if (siblingActions.length > 1) {
						var indexInSiblings = _.indexOf(siblingActions, currentAction);
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
							var previousSiblingAction = siblingActions[indexInSiblings - 1];
							var previousSiblingActionInterface = this._actionInterfacesByIndex[previousSiblingAction.getIndex()];
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
		var firstActionInterface = actionInterfaceSequence[0];
		var firstAction = firstActionInterface.getSdkAction();
		if (firstAction instanceof SDK.PlayCardFromHandAction || firstAction instanceof SDK.PlaySignatureCardAction) {
			var secondActionInterface = actionInterfaceSequence[1];
			if (secondActionInterface != null && !secondActionInterface.isSequenceRoot) {
				secondActionInterface.isSequenceRoot = true;
				secondActionInterface.isSequencedAsOne = this._getIsActionSequencedAsOne(secondActionInterface.getSdkAction());
				secondActionInterface.isSequenceSequencedAsOne = true;
			}
		}

		sdkStepInterface.actionInterfaceSequence = actionInterfaceSequence;
	},

	_logActionInterfaceSequenceHierarchy: function (actionInterfaceSequence) {
		for (var i = 0; i < actionInterfaceSequence.length; i++) {
			var interf = actionInterfaceSequence[i];
			if (interf.isSequenceRoot) {
				console.log("action", interf.getSdkAction().getLogName());
			} else {
				console.log(" > ", interf.getSdkAction().getLogName());
			}
		}
	},

	_getIsActionSkippable: function (action) {
		var index = action.getIndex();

		// use cached
		var skippable = this._skippableActionsByIndex[index];
		if (skippable != null) {
			return skippable;
		} else {
			// assume not skippable
			skippable = false;

			// skip modifier actions that are targeting cards in deck
			if ((action instanceof SDK.ApplyModifierAction || action instanceof SDK.RemoveModifierAction)
				&& (action.getTarget() == null || (action.getTarget().getIsLocatedInDeck() && this.getNodeForSdkCard(action.getTarget()) == null))) {
				var subActions = [].concat(action.getSubActions(), action.getResolveSubActions());
				var unskippableSubAction = _.find(subActions, function (subAction) {
					return !this._getIsActionSkippable(subAction);
				}.bind(this));
				if (unskippableSubAction == null) {
					skippable = true;
				}
			}

			// cache result
			this._skippableActionsByIndex[index] = skippable;
		}

		return skippable;
	},

	_getActionIsAlwaysSequenceRoot: function (action) {
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

	_getActionIsExceptionToSequenceRoot: function (action) {
		return action instanceof SDK.DieAction
			|| (action instanceof SDK.TeleportAction && action.getIsValidTeleport())
			|| action instanceof SDK.SwapUnitsAction;
	},

	_getActionAlwaysFollowsParent: function (action) {
		return action instanceof SDK.HurtingDamageAction;
	},

	_getIsActionSequencedAsOne: function (action) {
		return !(action instanceof SDK.MoveAction);
	},

	_getRootDepthFirstRearrangedActionInterface: function (actionInterface) {
		if (actionInterface.rearrangingParentActionInterface) {
			return this._getRootDepthFirstRearrangedActionInterface(actionInterface.rearrangingParentActionInterface);
		} else {
			return actionInterface;
		}
	},

	_getActionInterfacesDepthFirstForTriggeringSequence: function (sdkActionInterface, depthFirstActionInterfaces) {
		if (depthFirstActionInterfaces == null) {depthFirstActionInterfaces = [];}
		if (sdkActionInterface == null) {
			return depthFirstActionInterfaces;
		}

		var triggeredModifierActionInterfaces = sdkActionInterface.cachedResolveTriggeredModifierActionInterfaces;

		// trigger modifier actions
		if (triggeredModifierActionInterfaces != null && triggeredModifierActionInterfaces.length > 0) {
			// add all triggered modifier actions and their direct sub-actions
			for (var i = 0, il = triggeredModifierActionInterfaces.length; i < il; i++) {
				var triggeredModifierActionInterface = triggeredModifierActionInterfaces[i];
				var triggeredModifierAction = triggeredModifierActionInterface.getSdkAction();
				var modifier = triggeredModifierAction.getModifier();
				if (modifier instanceof SDK.Modifier) {
					// cache actions caused by triggered modifier
					var cachedResolveTriggerActionInterfaces = triggeredModifierActionInterface.cachedResolveTriggerActionInterfaces;
					if (cachedResolveTriggerActionInterfaces == null) {
						cachedResolveTriggerActionInterfaces = triggeredModifierActionInterface.cachedResolveTriggerActionInterfaces = [];
						var triggerActions = modifier.getTriggerActionsForActionAndResolveActionIndices(triggeredModifierAction.getParentActionIndex(), triggeredModifierAction.getResolveParentActionIndex());
						for (var j = 0, jl = triggerActions.length; j < jl; j++) {
							var triggerAction = triggerActions[j];
							if (!this._getIsActionSkippable(triggerAction)) {
								var triggerActionInterface = this._actionInterfacesByIndex[triggerAction.getIndex()];
								cachedResolveTriggerActionInterfaces.push(triggerActionInterface);
							}
						}
					}

					// cache depth first trigger actions
					var cachedResolveDepthFirstTriggerActionInterfaces = triggeredModifierActionInterface.cachedResolveDepthFirstTriggerActionInterfaces;
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
					var cachedResolveTriggerActionInterfacesWithoutDepthFirst = _.difference(cachedResolveTriggerActionInterfaces, cachedResolveDepthFirstTriggerActionInterfaces);

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
		var subActions = sdkActionInterface.cachedResolveSubActions;
		if (subActions != null && subActions.length > 0) {
			for (var i = 0, il = subActions.length; i < il; i++) {
				var subAction = subActions[i];
				var subActionInterface = this._actionInterfacesByIndex[subAction.getIndex()];

				// add the action itself
				this._addActionInterfaceToDepthFirstForTriggeringSequence(subActionInterface, sdkActionInterface, depthFirstActionInterfaces);

				// add the action's sub actions
				this._getActionInterfacesDepthFirstForTriggeringSequence(subActionInterface, depthFirstActionInterfaces);
			}
		}

		return depthFirstActionInterfaces;
	},

	_addActionInterfaceToDepthFirstForTriggeringSequence: function (actionInterface, rearrangingParentActionInterface, depthFirstActionInterfaces) {
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
	showNextAction: function () {
		var actionShowDelay = 0;

		// clean up existing action
		var sdkActionInterface = this._currentSdkActionInterface;
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
				action: action,
				sourceSdkCard: this._currentActionSourceSdkCard,
				sourceNode: this._currentActionSourceNode,
				targetSdkCard: this._currentActionTargetSdkCard,
				targetNode: this._currentActionTargetNode
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

		var numActions = this._currentActionSequence.length;
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
				var card = action.getSource();
				if (card instanceof SDK.Unit && this._lastCardWithAutomaticAction !== card) {
					this._lastCardWithAutomaticAction = card;
					if (action instanceof SDK.MoveAction) {
						// show emphasis moving with card node
						actionShowDelay += this._showEmphasisSprite(EmphasisTriggeredSprite.create(), this.getNodeForSdkCard(card));
					} else {
						// show emphasis at location of action
						var boardPosition = action.getSourcePosition();
						var tilePosition = UtilsEngine.transformBoardToTileMap(boardPosition);
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
			var myAction = action.getOwnerId() === this._player.getPlayerId();

			// show explicit play card and delay showing of action
			if (!action.getIsImplicit()
				&& (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction)
				&& (SDK.GameSession.getInstance().getIsSpectateMode() || !myAction)) {
				var animateDuration;
				var showDuration;
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
				this.showSkippablePlayCard(action, animateDuration, showDuration, actionShowDelay, function () {
					this._showAction(sdkActionInterface);
				}.bind(this));
			} else if (actionShowDelay > 0.0) {
				this._setupActionForShowSequence = this.runAction(cc.sequence(
					cc.delayTime(actionShowDelay),
					cc.callFunc(function () {
						this._setupActionForShowSequence = null;
						this._showAction(sdkActionInterface);
					}, this)
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
	_showAction: function (sdkActionInterface) {
		if (sdkActionInterface) {
			this._stopShowActionSequences();

			var action = sdkActionInterface.getSdkAction();
			var resolveParentAction = action.getResolveParentAction();
			if (!this._hasShownPlayCardActionSetup && resolveParentAction instanceof SDK.ApplyCardToBoardAction && !resolveParentAction.getIsImplicit() && action.getIsImplicit()) {
				// when the first sub-action of an explicit apply card to board action attempts to show
				// first show explicit apply card to board setup then shown this action
				this._hasShownPlayCardActionSetup = true;

				// show instructional arrow as needed
				var instructionalArrowDelay = this._showApplyCardInstructionalArrow(resolveParentAction);
				this._setupActionForShowSequence = this.runAction(cc.sequence(
					cc.delayTime(instructionalArrowDelay),
					cc.callFunc(function () {
						this._setupActionForShowSequence = null;
						// show automatic fx
						var autoFXDelay = this._showActionAutoFX(resolveParentAction);
						var applyCardTargetFXDelay = this._showApplyCardTargetFX(resolveParentAction);
						var maxFXDelay = Math.max(autoFXDelay, applyCardTargetFXDelay);
						var maxFXDelayCorrection = Math.min(maxFXDelay * 0.25, 1.0);
						var delayBeforeShowingActions = maxFXDelay - maxFXDelayCorrection;
						this._setupActionForShowSequence = this.runAction(cc.sequence(
							cc.delayTime(delayBeforeShowingActions),
							cc.callFunc(function () {
								this._setupActionForShowSequence = null;
								// show action
								this._showAction(sdkActionInterface);
							}.bind(this))
						));
					}.bind(this))
				));
			} else if (action instanceof SDK.RevealHiddenCardAction) {
				if (action.getIsValidReveal()) {
					// reset the card if it is showing in the battle log
					var revealedCard = action.getCard();
					var battleLogNodes = this._battleLog.getBattleLogNodesInUse();
					for (var i = 0, il = battleLogNodes.length; i < il; i++) {
						var battleLogNode = battleLogNodes[i];
						var battleLogSdkCard = battleLogNode.getSdkCard();
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
				var onShown = function () {
					this._showActionCardSequence = null;
					this.showNextAction();
				}.bind(this);
				this._showActionCardSequenceCompletedCallback = onShown;
				this._showActionCardSequence = this.runAction(cc.sequence(
					cc.delayTime(CONFIG.REVEAL_HIDDEN_CARD_DELAY),
					cc.callFunc(onShown)
				));
			} else {
				var myAction = action.getOwnerId() === this._player.getPlayerId();
				var actionDelay = 0.0;
				var nextActionDelay = 0.0;
				var showDelay = 0.0;
				var impactDelay = 0.0;
				var sourceBoardPosition = action.getSourcePosition();
				var targetBoardPosition = action.getTargetPosition();
				var sequenceRootSdkActionInterface = this._currentSequenceRootSdkActionInterface;
				var isSequencedAsOne = sdkActionInterface === sequenceRootSdkActionInterface ? sdkActionInterface.isSequencedAsOne : sequenceRootSdkActionInterface.isSequenceSequencedAsOne;
				var isSequenced = !isSequencedAsOne;
				this._lastActionTime = this._actionTime || Date.now();
				this._actionTime = Date.now();
				//Logger.module("ENGINE").log("GameLayer._showAction -> delta time", (this._actionTime - this._lastActionTime) / 1000.0, " is ", action.getLogName(), "root?", sdkActionInterface.isSequenceRoot);
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
				var _currentActionSourceSdkCard = this._currentActionSourceSdkCard = action.getSource();
				var _currentActionSourceNode = this._currentActionSourceNode = this.getNodeForSdkCard(_currentActionSourceSdkCard);
				var _currentActionTargetSdkCard = this._currentActionTargetSdkCard = action.getTarget();
				var _currentActionTargetNode = this._currentActionTargetNode = this.getNodeForSdkCard(_currentActionTargetSdkCard);
				this.getEventBus().trigger(EVENTS.before_show_action, {
					type: EVENTS.before_show_action,
					action: action,
					sourceSdkCard: _currentActionSourceSdkCard,
					sourceNode: _currentActionSourceNode,
					targetSdkCard: _currentActionTargetSdkCard,
					targetNode: _currentActionTargetNode
				});

				// get game fx board positions
				var gameFXSourceBoardPosition;
				var gameFXTargetBoardPosition;
				if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication()) {
					var card = action.getCard();
					if (card instanceof SDK.Spell) {
						gameFXSourceBoardPosition = gameFXTargetBoardPosition = card.getCenterPositionOfAppliedEffects();
					} else if (card instanceof SDK.Artifact) {
						var general = SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId());
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
					var sourceFX = this._getActionFXData(action, SDK.FXType.SourceFX);
					var sourceFXSprites = NodeFactory.createFX(sourceFX);
					var sourceFXDelays = UtilsEngine.getDelaysFromFXSprites(sourceFXSprites);
					showDelay = Math.max(showDelay, sourceFXDelays.showDelay);
					this._showCurrentActionForSourceSequence = this.runAction(cc.sequence(
						cc.delayTime(actionDelay),
						cc.callFunc(function () {
							this._showCurrentActionForSourceSequence = null;
							this._showActionForSource(action, _currentActionSourceSdkCard, _currentActionSourceNode, sourceFXSprites);
						}.bind(this))
					));

					// add attack delay from source
					if ((action instanceof SDK.AttackAction || action instanceof SDK.DamageAsAttackAction)
						&& _currentActionSourceNode != null && _currentActionSourceNode.getAnimResource() != null) {
						var attackDelay = (_currentActionSourceNode.getAnimResource().attackDelay || 0.0) * CONFIG.ENTITY_ATTACK_DURATION_MODIFIER;
						actionDelay += attackDelay;
						nextActionDelay = Math.max(nextActionDelay, attackDelay);
					}
				}

				// game fx
				// shown at the center of the application pattern when possible
				var gameFX = this._getActionFXData(action, SDK.FXType.GameFX);
				var gameFXEvent = {
					sourceBoardPosition: gameFXSourceBoardPosition,
					targetBoardPosition: gameFXTargetBoardPosition,
					offset: {x: 0.0, y: CONFIG.TILESIZE * 0.5},
					forAutoFX: true
				};
				var gameFXSprites = NodeFactory.createFX(gameFX, gameFXEvent);
				var gameFXDelays = UtilsEngine.getDelaysFromFXSprites(gameFXSprites);
				showDelay = Math.max(showDelay, gameFXDelays.showDelay);
				impactDelay = Math.max(impactDelay, gameFXDelays.impactDelay);
				this._showCurrentActionForGameSequence = this.runAction(cc.sequence(
					cc.delayTime(actionDelay),
					cc.callFunc(function () {
						this._showCurrentActionForGameSequence = null;
						this.addNodes(gameFXSprites, gameFXEvent);
					}, this)
				));

				// target reaction and fx when there is a target entity
				var targetReactionDelay = actionDelay + impactDelay;
				this._currentSequenceMaxTargetReactionDelay = Math.max(this._currentSequenceMaxTargetReactionDelay, targetReactionDelay);
				var targetDelays = 0.0;
				if (_currentActionTargetNode) {
					var targetFX = this._getActionFXData(action, SDK.FXType.TargetFX);
					var targetFXSprites = NodeFactory.createFX(targetFX);
					var targetFXDelays = UtilsEngine.getDelaysFromFXSprites(targetFXSprites);
					targetDelays = targetFXDelays.showDelay;
					this._showCurrentActionForTargetSequence = this.runAction(cc.sequence(
						cc.delayTime(isSequencedAsOne ? this._currentSequenceMaxTargetReactionDelay : targetReactionDelay),
						cc.callFunc(function () {
							this._showCurrentActionForTargetSequence = null;
							this._showActionForTarget(action, _currentActionTargetSdkCard, _currentActionTargetNode, targetFXSprites);
						}, this)
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
					var nextActionInterface = this.getNextActionInterfaceInActionSequence(true);
					// sequence the last action in the sequence and use the max delay
					if (this._nextActionIndex === this._currentActionSequence.length || (nextActionInterface && nextActionInterface.isSequenceRoot)) {
						isSequenced = true;
						showDelay = Math.max(showDelay, this._currentSequenceMaxDelay);
						this._currentSequenceMaxDelay = 0.0;
					}
				}

				// apply show delay
				nextActionDelay = Math.max(nextActionDelay, showDelay);
				//nextActionDelay += showDelay;
				//Logger.module("ENGINE").log( " > _showAction finish", action.getLogName(), "isSequenced", isSequenced, "nextActionDelay", nextActionDelay, "showDelay", showDelay, "targetDelays", targetDelays, "actionDelay", actionDelay)

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
						cc.callFunc(function () {
							this._nextActionSequence = null;
							this.showNextAction();
						}.bind(this))
					);
					this.runAction(this._nextActionSequence);
				} else {
					this.showNextAction();
				}
			}
		}
	},

	_getCanShowActionForNode: function (node) {
		return node != null && node.isRunning();
	},

	_getIsActionShowingAttackState: function (action) {
		if (action instanceof SDK.AttackAction || action instanceof SDK.DamageAsAttackAction) {
			return true;
		} else if (action.getTriggeringModifierIndex() != null && action.getTargetPosition() != null
			&& (action instanceof SDK.DamageAction
				|| action instanceof SDK.KillAction
				|| (action instanceof SDK.ApplyCardToBoardAction && !(action.getTriggeringModifier() instanceof SDK.GameSessionModifier) && action.getIsValidApplication()))) {
			var resolveParentAction = action.getResolveParentAction();
			if (!(resolveParentAction instanceof SDK.AttackAction || resolveParentAction instanceof SDK.DamageAsAttackAction) || resolveParentAction.getSource() !== action.getSource()) {
				return true;
			}
		}
		return false;
	},

	_showActionForGame: function (action) {
		var showDuration = 0.0;
		if(action) {
			var source = action.getSource();
			var target = action.getTarget();
			var node;

			// handle action by type
			if (action instanceof SDK.ApplyCardToBoardAction) {
				// search for card in hand and unbind if found
				if (target instanceof SDK.Card) {
					var cardNodes = this.bottomDeckLayer.getCardNodes();
					for (var i = 0, il = cardNodes.length; i < il; i++) {
						var cardNode = cardNodes[i];
						var cardInHand = cardNode.getSdkCard();
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
							var soundResource = target.getSoundResource();
							var sfx_apply = soundResource && soundResource.apply;
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

				if(source) {
					node = this.getNodeForSdkCard(source);
					if (this._getCanShowActionForNode(node)) {
						showDuration = Math.max(showDuration, node.showTeleport(action, action.getTargetPosition()));
					}
				}

				if(target) {
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
						showDuration = Math.max(showDuration, this.showSpeechForPlayer(this.getPlayerById(playerId), i18next.t("game_ui.out_of_cards_message"), null, CONFIG.DIALOGUE_OUT_OF_CARDS_DURATION, false, 0.3));
					}
				} else if (action.getIsBurnedCard()) {
					if (action.getOwner().getDeck().getCardsInHandExcludingMissing().length == CONFIG.MAX_HAND_SIZE) {
						// show hand too full dialogue
						var dialogDuration = 0.0;
						if (!_.contains(this._currentSdkStepInterface.hasShownHandFullForPlayerIds, playerId)) {
							this._currentSdkStepInterface.hasShownHandFullForPlayerIds.push(playerId);
							dialogDuration = this.showSpeechForPlayer(this.getPlayerById(playerId), i18next.t("game_ui.hand_is_full_message"), null, CONFIG.DIALOGUE_HAND_FULL_DURATION, false, 0.3);
						}
					}

					// show burned card
					var burnShowDuration = CONFIG.BURN_CARD_SHOW_DURATION;
					var dissolveDelay = CONFIG.BURN_CARD_DELAY;
					var dissolveDuration = CONFIG.BURN_CARD_DISSOLVE_DURATION;
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
						var replaceIndicatorSprite = new BaseSprite(RSX.replace_indicator.img);
						replaceIndicatorSprite.setOpacity(0.0);

						var generalSdkCard = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId);
						var generalNode = this.getNodeForSdkCard(generalSdkCard);
						var generalNodePosition = generalNode.getPosition();
						replaceIndicatorSprite.setPosition(generalNodePosition.x, generalNodePosition.y + CONFIG.TILESIZE * 0.75);

						this.uiLayer.addChild(replaceIndicatorSprite, this._ui_z_order_indicators);

						// animate
						var showAction = cc.sequence(
							cc.spawn(
								cc.fadeIn(CONFIG.FADE_FAST_DURATION).easing(cc.easeExponentialOut()),
								cc.moveBy(CONFIG.MOVE_MEDIUM_DURATION, 0, 20.0).easing(cc.easeExponentialOut())
							),
							cc.delayTime(0.2),
							cc.spawn(
								cc.fadeOut(CONFIG.FADE_MEDIUM_DURATION).easing(cc.easeExponentialIn()),
								cc.moveBy(CONFIG.FADE_MEDIUM_DURATION, 0, 20.0).easing(cc.easeExponentialIn())
							),
							cc.removeSelf()
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

			this.getEventBus().trigger(EVENTS.show_action_for_game, {type: EVENTS.show_action_for_game, action: action});
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
	_showEmphasisSprite: function (emphasisSprite, positionOrCardNode, duration, delay) {
		// set durations
		if (delay == null) {
			delay = 0;
		}
		if (duration == null) {
			duration = CONFIG.ACTION_EXCLAMATION_MARK_DURATION;
		}
		var showDuration = duration * CONFIG.ACTION_EXCLAMATION_MARK_SHOW_PERCENT;

		// add emphasis
		emphasisSprite.setOpacity(0.0);
		emphasisSprite.runAction(
			cc.sequence(
				cc.delayTime(delay),
				cc.fadeIn(0.2),
				cc.sequence(
					cc.moveBy(0.3, cc.p(0, 10)).easing(cc.easeSineInOut()),
					cc.moveBy(0.3, cc.p(0, -10)).easing(cc.easeSineInOut())
				).repeat(Math.ceil(duration / 0.6)),
				cc.callFunc(function () {
					emphasisSprite.destroy(0.2);
				})
			)
		);
		if (positionOrCardNode instanceof EntityNode) {
			var position = positionOrCardNode.getCenterPosition();
			emphasisSprite.setPosition(position.x, position.y + CONFIG.TILESIZE * 0.25);
			positionOrCardNode.addChild(emphasisSprite);
		} else {
			emphasisSprite.setPosition(positionOrCardNode);
			this.uiLayer.addChild(emphasisSprite, this._ui_z_order_instructional_nodes);
		}

		return showDuration;
	},

	_showActionForApplyCard: function(action, targetBoardPosition) {
		var showDuration = 0.0;

		if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication()) {
			var card = action.getCard();

			// legendary
			if (card.getRarityId() === SDK.Rarity.Legendary) {
				var specialFXData = DATA.dataForIdentifiers("FX.Game.CardLegendaryPlayFX");
				var specialFXOptions = {
					sourceBoardPosition: targetBoardPosition,
					targetBoardPosition: targetBoardPosition,
					offset: {x: 0.0, y: CONFIG.TILESIZE * 0.5},
					forAutoFX: true
				};
				var actionSpecialFXSprites = NodeFactory.createFX(specialFXData, specialFXOptions);
				var actionSpecialFXDelays = UtilsEngine.getDelaysFromFXSprites(actionSpecialFXSprites);
				this.addNodes(actionSpecialFXSprites, specialFXOptions);
				showDuration = Math.max(showDuration, actionSpecialFXDelays.showDelay * 0.5);
			}

			// prismatic
			if (SDK.Cards.getIsPrismaticCardId(card.getId())) {
				var prismaticPlayCardNode = PrismaticPlayCardNode.create();
				var prismaticNodeScreenPosition = UtilsEngine.transformBoardToTileMap(targetBoardPosition);
				prismaticPlayCardNode.setPosition(prismaticNodeScreenPosition);
				this.addNode(prismaticPlayCardNode);
				showDuration = Math.max(showDuration, prismaticPlayCardNode.getShowDelay());
			}
		}

		return showDuration;
	},

	_showActionForSource: function(action, sourceSdkCard, sourceNode, fxSprites) {
		if (action && sourceSdkCard != null && this._getCanShowActionForNode(sourceNode)) {
			// handle action by type
			if (sourceSdkCard instanceof SDK.Entity) {
				if (action.type === SDK.HealAction.type) {

					// only show healer state when same team as target
					var target = action.getTarget(true);
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

			this.getEventBus().trigger(EVENTS.show_action_for_source, {type: EVENTS.show_action_for_source, action: action, sdkCard: sourceSdkCard, node: sourceNode});
		}
	},

	_showActionForTarget: function(action, targetSdkCard, targetNode, fxSprites) {
		if (action && targetSdkCard != null && this._getCanShowActionForNode(targetNode)) {
			// handle action by type
			if (targetSdkCard instanceof SDK.Entity) {

				if (action instanceof SDK.DamageAction) {
					if (CONFIG.razerChromaEnabled) {
						Chroma.flashActionThrottled(new Chroma.Color('FF0000'), 100, action.getTotalDamageAmount())
						.then(()=> {
							if (this.getIsMyTurn()) {
								Chroma.setAll(CONFIG.razerChromaIdleColor)
							}
							else {
								Chroma.setAll(new Chroma.Color('FFFFFF'))
							}
						})
					}
					targetNode.showAttackedState(action);
				} else if (action instanceof SDK.DieAction) {
					if (CONFIG.razerChromaEnabled) {
						Chroma.flashActionThrottled(new Chroma.Color('FF0000'), 1000, 1)
						.then(()=> {
							if (this.getIsMyTurn()) {
								Chroma.setAll(CONFIG.razerChromaIdleColor)
							}
							else {
								Chroma.setAll(new Chroma.Color('FFFFFF'))
							}
						})
					}
					targetNode.showDeathState(action);
				} else if (action.type === SDK.HealAction.type) {
					if (CONFIG.razerChromaEnabled) {
						Chroma.flashActionThrottled(new Chroma.Color('00FF00'), 100, action.getTotalHealAmount())
						.then(()=> {
							if (this.getIsMyTurn()) {
								Chroma.setAll(CONFIG.razerChromaIdleColor)
							}
							else {
								Chroma.setAll(new Chroma.Color('FFFFFF'))
							}
						})
					}
					targetNode.showHealedState(action);
				} else if (action instanceof SDK.RemoveAction) {
					targetNode.showDisappearState(action);
				} else if (action instanceof SDK.KillAction) {
					if (CONFIG.razerChromaEnabled) {
						Chroma.flashActionThrottled(new Chroma.Color('FF0000'), 1000, 1)
						.then(()=> {
							if (this.getIsMyTurn()) {
								Chroma.setAll(CONFIG.razerChromaIdleColor)
							}
							else {
								Chroma.setAll(new Chroma.Color('FFFFFF'))
							}
						})
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

			this.getEventBus().trigger(EVENTS.show_action_for_target, {type: EVENTS.show_action_for_target, action: action, sdkCard: targetSdkCard, node: targetNode});
		}
	},

	/* endregion ACTIONS */

	/* region ACTION AUTO FX */

	_getActionFXData: function (action, fxType, rootAction) {
		var fxData = [];
		if (action && fxType != null) {
			var fxResource = action.getFXResource();

			// get the fx for this type from the action
			fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResource, fxType));

			// root action gives us the behavior switch
			rootAction || (rootAction = action);
			var source = action.getSource();
			var target = action.getTarget();

			// get action fx data for known behavior
			if (rootAction instanceof SDK.ApplyCardToBoardAction && rootAction.getIsValidApplication()) {
				// apply card to board
				var card = rootAction.getCard();
				if (card instanceof SDK.Spell) {
					// spells
					if (fxType === SDK.FXType.GameFX) {
						fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(_.union(fxResource, card.getFXResource()), SDK.FXType.SpellCastFX));
					} else if (fxType === SDK.FXType.TargetFX) {
						// spell target fx is trickier so we need to composite it from many sources
						var fxResources = _.union(fxResource, card.getFXResource());
						// always add applied fx
						fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(fxResources, SDK.FXType.SpellAppliedFX));
						/*// fx by target team
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
						}*/
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
				var triggeringModifier = action.getTriggeringModifier();
				if (triggeringModifier && target) {
					fxData = this._getActionModifierFXData(triggeringModifier, fxType, fxData);
				}

				var changedByModifiers = action.getChangedByModifiers();
				for (var i = 0, il = changedByModifiers.length; i < il; i++) {
					fxData = this._getActionModifierFXData(changedByModifiers[i], fxType, fxData);
				}
			}
		}
		return fxData;
	},

	_getActionModifierFXData: function (modifier, fxType, fxData) {
		if (fxType === SDK.FXType.GameFX) {
			fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierTriggeredFX));
		} else if (fxType === SDK.FXType.SourceFX) {
			fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierTriggeredSourceFX));
		} else if (fxType === SDK.FXType.TargetFX) {
			fxData = fxData.concat(DATA.dataForIdentifiersWithFilter(modifier.getFXResource(), SDK.FXType.ModifierTriggeredTargetFX));
		}

		return fxData;
	},

	_showActionAutoFX: function (action) {
		var showDuration = 0.0;
		if (action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction) {
			var card = action.getCard();

			// get applied effect positions
			var applyEffectPosition;
			var applyEffectPositions;
			if (card instanceof SDK.Spell) {
				applyEffectPosition = card.getCenterPositionOfAppliedEffects();
				applyEffectPositions = card.getApplyEffectPositions();
			} else if (card instanceof SDK.Artifact) {
				var general = SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId());
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
					var needsDelays = true;
					var factionId = card.getFactionId();
					var faction = SDK.FactionFactory.factionForIdentifier(factionId);
					var factionSpellAutoFX = DATA.dataForIdentifiersWithFilter(faction.fxResource, SDK.FXType.SpellAutoFX);
					var columnCount = SDK.GameSession.getInstance().getBoard().getColumnCount();
					for (var i = 0, il = applyEffectPositions.length; i < il; i++) {
						var boardPosition = applyEffectPositions[i];
						var fxMapIndex = UtilsPosition.getMapIndexFromPosition(columnCount, boardPosition.x, boardPosition.y);
						if (this._currentStepAutoFXMap[fxMapIndex] == null) {
							var autoFXOptions = {
								targetBoardPosition: boardPosition,
								forAutoFX: true
							};
							var actionAutoFXSprites = NodeFactory.createFX(factionSpellAutoFX, autoFXOptions);

							// delays only need to be calculated once
							if (needsDelays) {
								needsDelays = false;
								var actionAutoFXDelays = UtilsEngine.getDelaysFromFXSprites(actionAutoFXSprites);
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

	_removeActionAutoFX: function () {
		if (this._currentStepAutoFXMap && this._currentStepAutoFXMap.length > 0) {
			for (var i = 0, il = this._currentStepAutoFXMap.length; i < il; i++) {
				var fxSprites = this._currentStepAutoFXMap[i];
				if (fxSprites && fxSprites.length > 0) {
					for (var j = 0, jl = fxSprites.length; j < jl; j++) {
						fxSprites[j].destroy(CONFIG.PLAYED_SPELL_FX_FADE_OUT_DURATION);
					}
				}
			}
		}

		this._currentStepAutoFXMap = [];
		this._currentSequenceNeedsAutoFX = false;
	},

	_showApplyCardTargetFX: function (action) {
		var showDuration = 0.0;
		if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication() && !action.getCreatedByTriggeringModifier() && (!(action instanceof ModifierAction) || (!(action instanceof ModifierTriggeredAction) && !action.getModifierParent()))) {
			var card = action.getCard();
			if (card instanceof SDK.Spell) {
				// create target fx at each applied effect position
				var applyEffectPositions = card.getApplyEffectPositions();
				if (applyEffectPositions && applyEffectPositions.length > 0) {
					// get fx options
					var applyFX = this._getActionFXData(action, SDK.FXType.TargetFX);
					if (applyFX && applyFX.length > 0) {
						var needsDelays = true;
						for (var i = 0, il = applyEffectPositions.length; i < il; i++) {
							var boardPosition = applyEffectPositions[i];
							var applyFXOptions = {
								targetBoardPosition: boardPosition,
								offset: {x: 0.0, y: CONFIG.TILESIZE * 0.5}
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
				var general = SDK.GameSession.getInstance().getGeneralForPlayerId(card.getOwnerId());
				if (general != null) {
					var boardPosition = general.getPosition();
					var applyFX = DATA.dataForIdentifiersWithFilter(card.getFXResource(), SDK.FXType.ArtifactAppliedFX);
					var applyFXOptions = {
						targetBoardPosition: boardPosition,
						offset: {x: 0.0, y: CONFIG.TILESIZE * 0.5}
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

	_showApplyCardInstructionalArrow: function (action) {
		var showDuration = 0.0;
		var myAction = action && action.getOwnerId() === this._player.getPlayerId();
		myAction = myAction && !SDK.GameSession.current().getIsSpectateMode()
		if (action instanceof SDK.ApplyCardToBoardAction && action.getIsValidApplication() && !myAction && !action.getCreatedByTriggeringModifier() && (!(action instanceof ModifierAction) || (!(action instanceof ModifierTriggeredAction) && !action.getModifierParent()))) {
			var card = action.getCard();
			if (card instanceof SDK.Spell) {
				var applyEffectPositions = card.getApplyEffectPositions();
				var columnCount = SDK.GameSession.getInstance().getBoard().getColumnCount();
				for (var i = 0, il = applyEffectPositions.length; i < il; i++) {
					var boardPosition = applyEffectPositions[i];
					var mapIndex = UtilsPosition.getMapIndexFromPosition(columnCount, boardPosition.x, boardPosition.y);
					if (this._currentStepTargetingMap[mapIndex] == null) {
						// mark location as used so we only show targeting arrow fx once at any position in a sequence
						this._currentStepTargetingMap[mapIndex] = action;
						var arrowPosition = UtilsEngine.transformBoardToTileMap(boardPosition);
						var randomDelay = il > 2 ? Math.random() * 0.15 : 0.0;
						showDuration = Math.max(showDuration, this._showInstructionalArrow(cc.p(arrowPosition.x, arrowPosition.y + CONFIG.TILESIZE * 0.75), randomDelay));
					}
				}
			}
		}

		return showDuration;
	},

	showInstructionalArrowForEntityNode: function(entityNode, delay, duration) {
		var arrowPosition = entityNode.getPosition();
		this._showInstructionalArrow(cc.p(arrowPosition.x, arrowPosition.y + entityNode.entitySprite.height *.9));
	},

	showInstructionalArrowForBoardPosition: function(boardPosition, delay, duration) {
		var arrowPosition = UtilsEngine.transformBoardToScreen(boardPosition);
		return this._showInstructionalArrow(cc.p(arrowPosition.x, arrowPosition.y + CONFIG.TILESIZE * 0.25),delay,duration);
	},

	_showInstructionalArrow: function(position, delay, duration) {
		if (delay == null) { delay = 0; }
		if (duration == null) { duration = CONFIG.ACTION_INSTRUCTIONAL_ARROW_DURATION; }
		var showDuration = (delay + duration) * CONFIG.ACTION_INSTRUCTIONAL_ARROW_SHOW_PERCENT;

		// the instructional arrow focuses on units that your opponent is applying spells to
		var instructionalArrowSprite = InstructionalArrowSprite.create();
		instructionalArrowSprite.setPosition(cc.p(position.x, position.y + 400));
		instructionalArrowSprite.setOpacity(0.0);
		instructionalArrowSprite.runAction(
			cc.sequence(
				cc.delayTime(delay),
				cc.fadeIn(CONFIG.FADE_FAST_DURATION),
				cc.moveTo(duration * 0.6, cc.p(position.x, position.y + 10)).easing(cc.easeExponentialOut()),
				cc.delayTime(duration * 0.5),
				cc.callFunc(function () {
					instructionalArrowSprite.destroy(CONFIG.FADE_FAST_DURATION);
				})
			)
		);

		this.uiLayer.addChild(instructionalArrowSprite, this._ui_z_order_instructional_nodes);

		return showDuration;
	},

	showPersistentInstructionalArrow: function(position, delay, duration) {
		// returns instructional arrow
		if (delay == null) { delay = 0; }
		if (duration == null) { duration = CONFIG.ACTION_INSTRUCTIONAL_ARROW_DURATION; }

		// TODO: The following code is being commented/uncommented to reenable glows for tutorial because we need them
		// - but these should be done better, details are documented here:
		// https://trello.com/c/debKE11n/633-persistent-instructional-arrows-need-to-be-created-and-used-efficiently
		//var instructionalArrowSprite = InstructionalArrowSprite.create();
		///*
		var instructionalArrowSprite = GlowSprite.create({
			spriteIdentifier: RSX.instructional_arrow.img,
			antiAlias: false,
			needsDepthDraw: true,
			scale: CONFIG.SCALE *.5 // TODO: Default scale makes this huge
	  });
		instructionalArrowSprite.setGlowing(true);
		instructionalArrowSprite.setGlowNoiseExpandModifier(100);
		instructionalArrowSprite.setGlowThickness(1);
		instructionalArrowSprite.setGlowMinAlpha(0);
		instructionalArrowSprite.setGlowMaxAlpha(75);
		instructionalArrowSprite.setGlowFrequency(CONFIG.INSTRUCTIONAL_CARROT_GLOW_FREQUENCY);
    //*/
		instructionalArrowSprite.setPosition(cc.p(position.x, position.y + 400));
		instructionalArrowSprite.setOpacity(0.0);
		instructionalArrowSprite.runAction(
			cc.sequence(
				cc.delayTime(delay),
				cc.fadeIn(CONFIG.FADE_FAST_DURATION),
				cc.moveTo(duration * 0.6, cc.p(position.x, position.y + 10)).easing(cc.easeExponentialOut())
			)
		);

		this.uiLayer.addChild(instructionalArrowSprite, this._ui_z_order_instructional_nodes);

		return instructionalArrowSprite;
	},

	_showActionSpecialFX: function (action, nextActionDelay, targetReactionDelay) {
		var needsScreenFocus;
		var sfDurationIn;
		var sfDelay;
		var sfDurationOut;
		var shakeDuration;
		var shakeStrength;
		var radialBlurSpread;
		var radialBlurDeadZone;
		var radialBlurStrength;

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
			var sfDurationTotal = sfDurationIn + sfDelay + sfDurationOut;
			var safeDuration = Math.max(nextActionDelay - targetReactionDelay, sfDurationTotal);

			// run radial blur on scene as it is modifying global state
			var scene = this.getScene();
			scene.stopActionByTag(CONFIG.FOCUS_TAG);

			var screenFocusPosition = UtilsEngine.transformBoardToTileMap(action.getTargetPosition());
			sfDurationIn = Math.min(sfDurationIn, sfDurationIn / sfDurationTotal * safeDuration);
			sfDelay = Math.min(sfDelay, sfDelay / sfDurationTotal * safeDuration);
			sfDurationOut = Math.min(sfDurationOut, sfDurationTotal / sfDurationTotal * safeDuration);

			var screenFocusAction = cc.sequence(
				cc.delayTime(targetReactionDelay),
				cc.EaseExponentialOut.create(RadialBlurTo.create(sfDurationIn, screenFocusPosition, radialBlurSpread, radialBlurDeadZone, radialBlurStrength)),
				cc.delayTime(sfDelay),
				cc.EaseExponentialIn.create(RadialBlurTo.create(sfDurationOut, screenFocusPosition, 0.0, radialBlurDeadZone, radialBlurStrength))
			);
			screenFocusAction.setTag(CONFIG.FOCUS_TAG);
			scene.runAction(screenFocusAction);

			// shake screen
			var shakeOffset = Math.min(0.1, sfDurationIn * 0.5);
			this.getFXLayer().runAction(cc.sequence(
				cc.delayTime(targetReactionDelay + shakeOffset),
				Shake.create(shakeDuration, shakeStrength, cc.p(0, 0))
			));
		}
	},

	/* endregion ACTION AUTO FX */

	/* region MODIFIERS */

	_createModifierActionInterfacesForActionInterface: function (sdkActionInterface) {
		var gameSession = SDK.GameSession.getInstance();
		var action = sdkActionInterface.getSdkAction();
		var actionIndex = action.getIndex();
		var deactivatedModifierActionInterfaces = [];
		var resolveDeactivatedModifierActionInterfaces = [];
		var activatedModifierActionInterfaces = [];
		var resolveActivatedModifierActionInterfaces = [];
		var triggeredModifierActionInterfaces = [];
		var resolveTriggeredModifierActionInterfaces = [];
		var triggeredModifierActionInterfacesForChanges = [];

		// deactivated modifiers
		var deactivatedModifiersData = action.getDeactivatedModifiersData();
		var lastDataModifierIndex = null;
		var lastDataActionIndex = null;
		var lastDataResolveActionIndex = null;
		for (var i = 0, il = deactivatedModifiersData.length; i < il; i += 3) {
			var dataModifierIndex = deactivatedModifiersData[i];
			var dataActionIndex = deactivatedModifiersData[i+1];
			var dataResolveActionIndex = deactivatedModifiersData[i+2];
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
		var activatedModifiersData = action.getActivatedModifiersData();
		var lastDataModifierIndex = null;
		var lastDataActionIndex = null;
		var lastDataResolveActionIndex = null;
		for (var i = 0, il = activatedModifiersData.length; i < il; i += 3) {
			var dataModifierIndex = activatedModifiersData[i];
			var dataActionIndex = activatedModifiersData[i+1];
			var dataResolveActionIndex = activatedModifiersData[i+2];
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
		var triggeredModifiersData = action.getTriggeredModifiersData();
		var lastDataModifierIndex = null;
		var lastDataActionIndex = null;
		var lastDataResolveActionIndex = null;
		var changedByModifiers = action.getChangedByModifiers();
		for (var i = 0, il = triggeredModifiersData.length; i < il; i += 3) {
			var dataModifierIndex = triggeredModifiersData[i];
			var dataActionIndex = triggeredModifiersData[i+1];
			var dataResolveActionIndex = triggeredModifiersData[i+2];
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
							var modifierActionInterfaces = this._createTriggerModifierActionInterfacesForTriggeringModifier(modifier, parentAction, resolveParentAction, sdkActionInterface);
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

	_getIsActionChangingTriggeringModifier: function (modifier, actionChangedByModifiers) {
		var changedAction = false;
		for (var j = 0, jl = actionChangedByModifiers.length; j < jl; j++) {
			var changedByModifier = actionChangedByModifiers[j];
			if (changedByModifier === modifier) {
				changedAction = true;
				break;
			}
		}
		return changedAction;
	},

	_createTriggerModifierActionInterfacesForTriggeringModifier: function (modifier, parentAction, resolveParentAction, sdkActionInterface) {
		var modifierActionInterfaces = [];

		// trigger deactivated modifiers
		var deactivatedModifiers = modifier.getTriggerDeactivatedModifiersForActionAndResolveAction(parentAction, resolveParentAction);
		for (var i = 0, il = deactivatedModifiers.length; i < il; i++) {
			var deactivatedModifier = deactivatedModifiers[i];
			if (deactivatedModifier != null && (!deactivatedModifier.getCardAffected().getIsLocatedInDeck() || this.getNodeForSdkCard(deactivatedModifier.getCardAffected()) != null)) {
				var modifierActionInterface = this._createActionInterfaceForDeactivatedModifier(deactivatedModifier, parentAction, resolveParentAction, sdkActionInterface);
				var modifierAction = modifierActionInterface.getSdkAction();
				modifierAction.setParentModifier(modifier);
				modifierActionInterfaces.push(modifierActionInterface);
			}
		}

		// trigger activated self
		var activatedModifiers = modifier.getTriggerActivatedModifiersForActionAndResolveAction(parentAction, resolveParentAction);
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

	_createActionInterfaceForDeactivatedModifier: function (modifier, parentAction, resolveParentAction, sdkActionInterface) {
		var modifierIndex = modifier.getIndex();
		var parentActionIndex = parentAction.getIndex();
		var resolveParentActionIndex = resolveParentAction.getIndex();
		var modifierActionIndex = modifierIndex + "_" + parentActionIndex + "_" + resolveParentActionIndex + "_deactivated";
		var sdkStepInterface = sdkActionInterface.getSdkStepInterface();
		var modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex];
		if (modifierActionInterface == null) {
			var modifierAction = new ModifierDeactivatedAction(SDK.GameSession.getInstance(), modifier);
			modifierAction.setIndex(modifierActionIndex);
			modifierAction.setParentAction(parentAction);
			modifierAction.setResolveParentAction(resolveParentAction);
			modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex] = new SdkActionInterface(modifierAction);
			modifierActionInterface.setSdkStepInterface(sdkStepInterface);
			modifierActionInterface.isSequencedAsOne = true;
		}
		return modifierActionInterface;
	},

	_createActionInterfaceForActivatedModifier: function (modifier, parentAction, resolveParentAction, sdkActionInterface) {
		var modifierIndex = modifier.getIndex();
		var parentActionIndex = parentAction.getIndex();
		var resolveParentActionIndex = resolveParentAction.getIndex();
		var modifierActionIndex = modifierIndex + "_" + parentActionIndex + "_" + resolveParentActionIndex + "_activated";
		var sdkStepInterface = sdkActionInterface.getSdkStepInterface();
		var modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex];
		if (modifierActionInterface == null) {
			var modifierAction = new ModifierActivatedAction(SDK.GameSession.getInstance(), modifier);
			modifierAction.setIndex(modifierActionIndex);
			modifierAction.setParentAction(parentAction);
			modifierAction.setResolveParentAction(resolveParentAction);
			modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex] = new SdkActionInterface(modifierAction);
			modifierActionInterface.setSdkStepInterface(sdkStepInterface);
			modifierActionInterface.isSequencedAsOne = true;
		}
		return modifierActionInterface;
	},

	_createActionInterfaceForTriggeredModifier: function (modifier, parentAction, resolveParentAction, sdkActionInterface) {
		var modifierIndex = modifier.getIndex();
		var parentActionIndex = parentAction.getIndex();
		var resolveParentActionIndex = resolveParentAction.getIndex();
		var modifierActionIndex = modifierIndex + "_" + parentActionIndex + "_" + resolveParentActionIndex + "_triggered";
		var sdkStepInterface = sdkActionInterface.getSdkStepInterface();
		var modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex];
		if (modifierActionInterface == null) {
			var modifierAction = new ModifierTriggeredAction(SDK.GameSession.getInstance(), modifier);
			modifierAction.setIndex(modifierActionIndex);
			modifierAction.setParentAction(parentAction);
			modifierAction.setResolveParentAction(resolveParentAction);
			modifierActionInterface = this._actionInterfacesByIndex[modifierActionIndex] = new SdkActionInterface(modifierAction);
			modifierActionInterface.setSdkStepInterface(sdkStepInterface);
			modifierActionInterface.isSequencedAsOne = true;
		}
		return modifierActionInterface;
	},

	_showActionForModifier: function (action) {
		var showDuration = 0.0;
		if (action instanceof SDK.ApplyModifierAction || action instanceof SDK.RemoveModifierAction || action instanceof ModifierAction) {
			// show modifier
			var modifier = action.getModifier();
			if (modifier instanceof SDK.Modifier) {
				// don't show modifier unless in hand or on board
				var sdkCard = modifier.getCardAffected();
				var node = this.getNodeForSdkCard(sdkCard);
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

	onGameFollowupCardStart: function () {
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

	onGameFollowupCardStop: function () {
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

	showPlayerNextFollowupCard: function () {
		// get the current card from the stack
		var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
		var card = playerActor.getCurrentCardWithFollowup();
		if (card) {
			var followupCard = card.getCurrentFollowupCard();
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

	removePlayerCurrentCardWithFollowup: function () {
		this.removePlayerFollowupCardUI();

		var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
		playerActor.popCurrentCardWithFollowup();
		playerActor.setFollowupCard(null);
	},

	showPlayerFollowupCardUI: function () {
		/*
		var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
		var followupCard = playerActor.getFollowupCard();
		*/
	},

	removePlayerFollowupCardUI: function () {

	},

	/* endregion FOLLOWUPS */

	/* region NODES */

	/**
	 * Shows nodes/sprites (note: does not create them, use NodeFactory to handle that!).
	 * @param {Object|Array} nodes a single or array of nodes/sprites
	 * @param {Object} [options] options object, 1 for all nodes
	 */
	addNodes: function (nodes, options) {
		if(nodes) {

			// fx delay and sequence
			var sequenceSteps;
			var delay;
			if(options && !options.instant) {
				if(typeof options.delay !== "undefined") {
					delay = options.delay;
				}
				if(delay) {
					sequenceSteps = [cc.delayTime(delay)];
				}
			}


			if (_.isArray(nodes)) {
				for(var i = 0, il = nodes.length; i < il; i++) {
					this.addNode(nodes[i], options, sequenceSteps);
				}
			} else {
				this.addNode(nodes, options, sequenceSteps);
			}

			if(sequenceSteps && sequenceSteps.length > 1) {
				this.runAction(cc.sequence(sequenceSteps));
			}
		}
	},
	addNode: function (node, options, sequenceSteps) {
		if (node instanceof cc.Node) {
			var action;
			var layerName = node.layerName;
			var destinationLayerName = node.destinationLayerName;
			var zOrder = node._zOrder;
			var forAutoFX;

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

			var layer = this[layerName];
			var destinationLayer = this[destinationLayerName];

			// defaults
			if (node instanceof FXShockwaveSprite) {
				layer || (layer = this.backgroundLayer);
			} else if (node instanceof FXFlockSprite) {
				var source;
				var target;
				if (action) {
					source = action.getSource();
					target = action.getTarget();
				}

				var obstacles = [];
				var allNodes = this.middlegroundLayer.getChildren();
				for (var i = 0; i < allNodes.length; i++) {
					var obstacleNode = allNodes[i];
					if (obstacleNode instanceof UnitNode && obstacleNode.sdkCard !== source && obstacleNode.sdkCard !== target) {
						obstacles.push(obstacleNode);
					}
				}
				node.setObstacles(obstacles);
			} else if (node instanceof FXDecalSprite) {
				layer || (layer = this.backgroundLayer);
				//destinationLayer || (destinationLayer = this.backgroundLayer);
			}

			if (destinationLayer) {
				node.setDestinationParent(destinationLayer);
			}

			// fallback to middleground layer
			layer || (layer = this.middlegroundLayer);

			// update auto fx
			if (forAutoFX) {
				var autoFXPosition = options.targetBoardPosition || options.sourceBoardPosition || UtilsEngine.transformTileMapToBoardIndex(node.getPosition());
				var fxMapIndex = UtilsPosition.getMapIndexFromPosition(SDK.GameSession.getInstance().getBoard().getColumnCount(), autoFXPosition.x, autoFXPosition.y);
				var fxNodes = this._currentStepAutoFXMap[fxMapIndex];

				if (!fxNodes) {
					fxNodes = this._currentStepAutoFXMap[fxMapIndex] = [];
				}

				if (node instanceof Light) {

					// don't allow multiple lights at the same auto fx position
					var existingLight = _.find(fxNodes, function (existingNode) {
						return existingNode instanceof Light;
					});
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
			} else {
				if (layer === this.tileLayer) {
					layer.addTile(node, zOrder);
				} else {
					layer.addChild(node, zOrder);
				}
			}
		}
	},

	/**
	 * Removes nodes/sprites (note: does not create them, use NodeFactory to handle that!).
	 * @param {Object|Array} nodes a single or array of nodes/sprites
	 * @param {Object} [duration=0.0] duration of remove
	 */
	removeNodes: function (nodes, duration) {
		if(nodes) {
			if (_.isArray(nodes)) {
				for(var i = 0, il = nodes.length; i < il; i++) {
					this.removeNode(nodes[i], duration);
				}
			} else {
				this.removeNode(nodes, duration);
			}
		}
	},
	removeNode: function (node, duration) {
		if (node instanceof EntityNode) {
			this._entityNodes = _.without(this._entityNodes, node);

			if (node instanceof UnitNode) {
				this._unitNodes = _.without(this._unitNodes, node);
			} else if (node instanceof TileNode) {
				this._tileNodes = _.without(this._tileNodes, node);
			}

			// destroy entity speech node
			var speechNode = this.getSpeechNodeForEntityNode(node);
			if (speechNode != null) {
				speechNode.destroyWhenDoneShowingText();
			}
		} else if (node instanceof SpeechNode) {
			var speechKeys = Object.keys(this._speechNodes);
			for (var i = 0, il = speechKeys.length; i < il; i++) {
				var speechKey = speechKeys[i];
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

	addNodesForSdkCards: function (sdkCards) {
		if(sdkCards) {
			if (_.isArray(sdkCards)) {
				for(var i = 0, il = sdkCards.length; i < il; i++) {
					var sdkCard = sdkCards[i];
					this.addNodeForSdkCard(sdkCard, sdkCard.getPosition());
				}
			} else {
				this.addNodeForSdkCard(sdkCards, sdkCards.getPosition());
			}
		}
	},

	addNodeForSdkCard: function (sdkCard, position) {
		if (sdkCard instanceof SDK.Entity) {
			var entityNode;

			if (sdkCard instanceof SDK.Unit) {
				entityNode = this.addUnitNodeForSdkUnit(sdkCard, position);
			} else if (sdkCard instanceof SDK.Tile) {
				entityNode = this.addTileNodeForSdkTile(sdkCard, position);
			}

			this._entityNodes.push(entityNode);

			// add entity support nodes
			var statsNode = entityNode.getStatsNode();
			if (statsNode != null) {
				this.uiLayer.addChild(statsNode,this._ui_z_order_low_priority_support_nodes);
			}
			var statsChangeNode = entityNode.getStatsChangeNode();
			if (statsChangeNode != null) {
				this.uiLayer.addChild(statsChangeNode,this._ui_z_order_medium_priority_support_nodes);
			}
			var ownerIndicatorSprite = entityNode.getOwnerIndicatorSprite();
			if (ownerIndicatorSprite != null) {
				this.tileLayer.addBoardBatchedTile(ownerIndicatorSprite, 1);
			}
			entityNode.updateSupportNodePositions();

			return entityNode;
		} else if (sdkCard instanceof SDK.Spell) {
			// for now don't add spells
		}
	},

	addUnitNodeForSdkUnit:function(sdkUnit,position) {
		var unitNode = UnitNode.create(sdkUnit);
		unitNode.setPosition(UtilsEngine.transformBoardToTileMap(position));

		this._unitNodes.push(unitNode);
		this.addNode(unitNode);

		return unitNode;
	},

	addTileNodeForSdkTile:function(sdkTile, position) {
		var tileNode = TileNode.create(sdkTile);

		if (!tileNode.layerName) {
			// usually tile nodes should be added to the tile layer
			tileNode.layerName = "tileLayer";
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

	addTagWithIdToAllEntities: function (injectedTag, tagId) {
		var entities = SDK.GameSession.getInstance().getBoard().getEntities(true);
		for (var i = 0; i < entities.length; i++) {
			var entityNode = this.getNodeForSdkCard(entities[i]);
			if(entityNode) {
				entityNode.addInjectedVisualStateTagWithId(injectedTag,tagId);
			}
		}
	},

	// Removes given tag from all entities on board
	removeTagWithIdFromAllEntities: function (tagIdToRemove) {
		var entities = SDK.GameSession.getInstance().getBoard().getEntities(true);
		for (var i = 0; i < entities.length; i++) {
			var entityNode = this.getNodeForSdkCard(entities[i]);
			if(entityNode) {
				entityNode.removeInjectedVisualStateTagById(tagIdToRemove)
			}
		}
	},

	updateReadinessTagForAllEntities: function () {
		for (var i = 0, il = this._entityNodes.length; i < il; i++) {
			this._entityNodes[i].updateReadinessVisualTag();
		}
	},

	removeReadinessForEntities: function () {
		for (var i = 0, il = this._entityNodes.length; i < il; i++) {
			this._entityNodes[i].removeReadinessVisualTag();
		}
	},

	// Id to be used for unused entity tags
	_unusedEntityTagId: "UnusedEntityTagId",
	// Injects tags for entities that have actions remaining
	tagUnusedEntities: function () {
		if (!this.getIsPlayerSelectionLocked()) {
			var readyEntityNodes = this.getReadyEntityNodes();
			for (var i = 0, il = readyEntityNodes.length; i < il; i++) {
				var entityNode = readyEntityNodes[i];
				entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowHoverForPlayerTag(),this._unusedEntityTagId);
			}
		}
	},

	removeUnusedEntitiesTags: function () {
		for (var i = 0, il = this._entityNodes.length; i < il; i++) {
			var entityNode = this._entityNodes[i];
			entityNode.removeInjectedVisualStateTagById(this._unusedEntityTagId);

		}
	},

	getReadyEntityNodes: function () {
		var readyEntityNodes = [];
		for (var i = 0, il = this._entityNodes.length; i < il; i++) {
			var entityNode = this._entityNodes[i];
			// my entity that is ready is also unused
			if (entityNode.getIsReadyAtAction()) {
				readyEntityNodes.push(entityNode);
			}
		}
		return readyEntityNodes;
	},

	displaySelectEntityParticles: function( boardX, boardY ) {
		var pEmitter = BaseParticleSystem.create( {plistFile: RSX.ptcl_dot_square_select.plist, pixelGridAligned: true} );
		var emitterPosition = UtilsEngine.transformBoardToTileMap(cc.p(boardX, boardY));
		pEmitter.setPosition(emitterPosition);
		pEmitter.setScale(0.8);
		pEmitter.update(0.3);
		this.middlegroundLayer.addChild( pEmitter );
		this._particleContainer.push( pEmitter );
	},

	addEntityNodeHighlightTagsAtLocs: function (locs, color, freq, minAlpha, maxAlpha, tagId) {
		for (var i = 0; i < locs.length; i++) {
			this.addEntityNodeHighlightTagsAtBoardPosition(locs[i].x, locs[i].y, color, freq, minAlpha, maxAlpha, tagId);
		}
	},

	_targetableTagId: "TargetableTagId",
	showTargetableEmphasisForEntities: function (sdkEntities) {
		for (var i = 0; i < sdkEntities.length; i++) {
			var entityNode = this.getNodeForSdkCard(sdkEntities[i]);
			if(entityNode && entityNode.getIsTargetable()) {
				entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowTargetableTag(),this._targetableTagId);
			}
		}
	},
	showUntargetableDemphasisForEntities: function (sdkEntities) {
		// Applies deemphasis tag to corresponding nodes for an array of entities
		for (var i = 0; i < sdkEntities.length; i++) {
			var entityNode = this.getNodeForSdkCard(sdkEntities[i]);
			if(entityNode && entityNode.getIsTargetable()) {
				entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createShowDeemphasisTag(),this._targetableTagId);
			}
		}
	},

	updateEntityNodeOwnerSprites: function () {
		for (var i = 0, il = this._entityNodes.length; i < il; i++) {
			var entityNode = this._entityNodes[i];
			entityNode.updateOwnerSprites();
		}
	},

	addEntityNodeHighlightTagsAtBoardPosition: function(boardX, boardY, color, freq, minAlpha, maxAlpha, tagId) {
		var entityNode = this.getEntityNodeAtBoardPosition(boardX, boardY, true, true);
		if(entityNode) {
			entityNode.addInjectedVisualStateTagWithId(EntityNodeVisualStateTag.createHighlightTag(true, 0, color, freq, minAlpha, maxAlpha),tagId);
		}
	},

	removeEntityNodeHighlights: function () {

	},

	stopParticles: function() {
		for (var i = 0; i < this._particleContainer.length; i++) {
			this._particleContainer[i].stopSystem();
		}
	},

	/* endregion NODE VISUALS */

	/* region NODE STATS */

	/**
	 * Shows and updates or hides sdk node stats as needed.
	 * @param {Boolean} [force=false] whether to force an update
	 */
	updateShowingSdkNodeStats: function (force) {
		// show stats over units
		if (this.getIsActive()
			&& ((CONFIG.alwaysShowStats && (this._currentSdkStepInterface == null || CONFIG.OVERLAY_STATS_DURING_STEPS))
			|| (this._player.getIsTakingInspectAction() && CONFIG.OVERLAY_STATS_DURING_HOVER)
			|| (this._player.getIsTakingSelectionAction() && CONFIG.OVERLAY_STATS_DURING_SELECT))) {
			var lastSdkStateRecordingAction = this._lastShownSdkStateRecordingAction;
			var actionEventType = this._currentSdkStepInterface == null ? EVENTS.update_cache_step : EVENTS.update_cache_action;
			if (!this._showingStats
				|| this._showingStatsForSdkStateRecordingAction !== lastSdkStateRecordingAction
				|| this._showingStatsForSdkStateRecordingActionEventType !== actionEventType
				|| force) {
				this._showingStats = true;
				this._showingStatsForSdkStateRecordingAction = lastSdkStateRecordingAction;
				this._showingStatsForSdkStateRecordingActionEventType = actionEventType;
				var entityNodes = this._entityNodes;
				for (var i = 0, il = entityNodes.length; i < il; i++) {
					var entityNode = entityNodes[i];
					var statsNode = entityNodes[i].getStatsNode();
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

	stopShowingSdkNodeStats: function() {
		if (this._showingStats) {
			this._showingStats = false;
			this._showingStatsForSdkStateRecordingAction = null;
			this._showingStatsForSdkStateRecordingActionEventType = null;
			for (var i = 0, il = this._entityNodes.length; i < il; i++) {
				var statsNode = this._entityNodes[i].getStatsNode();
				if (statsNode) {
					statsNode.stopShowing();
				}
			}
		}
	},

	showEntitiesKilledByAttack: function (attackingSdkEntity, defendingSdkEntity) {
		if (!SDK.GameSession.getInstance().getIsSpectateMode()
			&& attackingSdkEntity != null && defendingSdkEntity != null
			&& (attackingSdkEntity !== this._showingAttackSourceSdkEntity || defendingSdkEntity !== this._showingAttackTargetSdkEntity)) {
			// get entities killed
			var sdkEntitiesKilledByAttack = attackingSdkEntity.getEntitiesKilledByAttackOn(defendingSdkEntity);

			// stop previous
			this.stopShowingEntitiesKilledByAttack();

			// show new
			if (sdkEntitiesKilledByAttack.length > 0) {
				// store showing properties
				this._showingAttackSourceSdkEntity = attackingSdkEntity;
				this._showingAttackTargetSdkEntity = attackingSdkEntity;
				this._showingAttackKilledEntityNodes = [];

				// show kill visuals
				for (var i = 0, il = sdkEntitiesKilledByAttack.length; i < il; i++) {
					var entityNode = this.getNodeForSdkCard(sdkEntitiesKilledByAttack[i]);
					if (entityNode != null) {
						var killPreviewNode = entityNode.getOrCreateKillPreviewNode();
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

	stopShowingEntitiesKilledByAttack: function () {
		if (this._showingAttackKilledEntityNodes != null) {
			var showingAttackKilledEntityNodes = this._showingAttackKilledEntityNodes;
			this._showingAttackKilledEntityNodes = null;
			this._showingAttackSourceSdkEntity = null;
			this._showingAttackTargetSdkEntity = null;
			for (var i = 0, il = showingAttackKilledEntityNodes.length; i < il; i++) {
				var entityNode = showingAttackKilledEntityNodes[i];
				if (entityNode != null) {
					var killPreviewNode = entityNode.getKillPreviewNode();
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
	getShouldShowCardInstructionals: function () {
		var gameSession = SDK.GameSession.getInstance();

		var challenge = gameSession.getChallenge();
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
	showInspectCard: function (sdkCard, node) {
		var currentSdkCard = this._inspectCardNode.getSdkCard();
		if (!this._player.getFollowupCard() && (currentSdkCard == null || currentSdkCard !== sdkCard)) {
			// stop showing previous
			this.stopShowingInspectCard(currentSdkCard);

			// show new
			if (sdkCard != null) {
				var isInspectingNode = node instanceof cc.Node;
				var isInspectingEntityNode = isInspectingNode && node instanceof EntityNode;
				var isInspectingBottomDeckCardNode = isInspectingNode && node instanceof BottomDeckCardNode;
				var isInspectingArtifactNode = isInspectingNode && node instanceof ArtifactNode;
				var isInspectingBattleLogNode = isInspectingNode && node instanceof BattleLogNode;
				var isInspectingSignatureCardNode = isInspectingNode && node instanceof SignatureCardNode;
				var showBaseState = false;
				var actionToShowStateFor;
				var actionEventTypeToShowStateFor;
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
				var showAsIfOwnedByPlayer2 = sdkCard.isOwnedByPlayer2();
				if (!showAsIfOwnedByPlayer2 && sdkCard.isOwnedByGameSession()) {
					// when owned by game session, inspect should always be on side of my player
					if (this.getMyPlayer() === this.getPlayer2()) {
						showAsIfOwnedByPlayer2 = true;
					}
				}

				// show inspect
				// inspect triggers rebuild so it must be done before using content size
				this._inspectCardNode.showInspect(sdkCard, showBaseState, actionToShowStateFor, actionEventTypeToShowStateFor, showAsIfOwnedByPlayer2, null, this.getShouldShowCardInstructionals());
				if(sdkCard.getReferencedCardData()) {
					referencedCard = SDK.GameSession.getInstance().createCardForIdentifier(sdkCard.getReferencedCardData().id);
					referencedCard.setOwner(sdkCard.getOwner());
					this._referencedCardNode.showInspect(referencedCard, true, actionToShowStateFor, actionEventTypeToShowStateFor, showAsIfOwnedByPlayer2, null, this.getShouldShowCardInstructionals())
				}

				var cardContentSize = this._inspectCardNode.getCardContentSize();

				// calculate base position
				var baseInspectPosition;
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

				var inspectX;
				var inspectY;

				// inspect positions
				if (isInspectingBottomDeckCardNode) {
					// position at a node in hand
					var modifiersContentSize = this._inspectCardNode.getModifiersContentSize();
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
					var cardKeywordsContentSize = this._inspectCardNode.getKeywordsContentSize();
					if (this._inspectCardNode.getKeywordsShowingOnLeft()) {
						if (inspectX - cardContentSize.width * 0.5 - cardKeywordsContentSize.width < UtilsEngine.getGSIWinLeft()) {
							// show to the right
							this._inspectCardNode.showKeywordsOnRight();
						}
					} else {
						if (inspectX + cardContentSize.width * 0.5 + cardKeywordsContentSize.width > UtilsEngine.getGSIWinRight()) {
							// show to the left
							this._inspectCardNode.showKeywordsOnLeft();
						}
					}
				}

				// set final inspect position
				this._inspectCardNode.setPosition(inspectX, inspectY);

				var spacing = this._inspectCardNode.getCardContentSize().width * 1.5
				if (inspectX+spacing < UtilsEngine.getGSIWinRight()) {
					this._referencedCardNode.setPosition(inspectX+spacing, inspectY);
				}
				else {
					this._referencedCardNode.setPosition(inspectX-spacing, inspectY);
				}

				this.getEventBus().trigger(EVENTS.inspect_card_start, {type: EVENTS.inspect_card_start, card: sdkCard});
			}
		}
	},

	/**
	 * Stops inspecting the card being inspected, or optionally only stop inspecting if the card being inspected is the card passed in.
	 * @param {SDK.Card} [sdkCard=currently shown card]
	 */
	stopShowingInspectCard: function (sdkCard) {
		var currentSdkCard = this._inspectCardNode.getSdkCard();
		sdkCard || (sdkCard = currentSdkCard);
		if (currentSdkCard != null && currentSdkCard === sdkCard) {
			this._inspectCardNode.stopShowingInspectAndClear();
			this._referencedCardNode.stopShowingInspectAndClear();

			this.getEventBus().trigger(EVENTS.inspect_card_stop, {type: EVENTS.inspect_card_stop, card: sdkCard});
		}
	},

	/**
	 * Starts showing a played card
	 * @param {SDK.Action} action action that played card to show
	 * @param {Number} animateDuration duration of animation in seconds
	 * @param {Number} showDuration duration to show card in seconds
	 * @param {Boolean} [noFlip=false] whether to skip flip animation
	 */
	showPlayCard: function (action, animateDuration, showDuration, noFlip) {
		var sdkCard = action.getCard();
		var currentSdkCard = this._playCardNode.getSdkCard();
		if (currentSdkCard == null || currentSdkCard !== sdkCard) {
			// stop showing previous
			this.stopShowingPlayCard(currentSdkCard);

			// set sdk card to trigger rebuild
			this._playCardNode.setSdkCard(sdkCard, action);
			var cardContentSize = this._playCardNode.getCardContentSize();
			var ownerId = action.getOwnerId();
			var isOwnedByPlayer2 = ownerId === SDK.GameSession.getInstance().getPlayer2Id();
			var isOwnedByMyPlayer = !SDK.GameSession.getInstance().getIsSpectateMode()
				&& ownerId === SDK.GameSession.getInstance().getMyPlayerId()
				&& !(action instanceof SDK.RevealHiddenCardAction);

			// calculate positions
			var sourceScreenPosition;
			var targetScreenPosition;

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
			.then(function () {
				var playerActor = SDK.GameSession.getInstance().getIsSpectateMode() ? this._altPlayer : this._player;
				if (!isOwnedByMyPlayer || !playerActor.getHasCardsWithFollowup()) {
					this.stopShowingPlayCard(sdkCard, CONFIG.ANIMATE_MEDIUM_DURATION);
				}
			}.bind(this));

			this.getEventBus().trigger(EVENTS.play_card_start, {type: EVENTS.play_card_start, card: sdkCard});
		}
	},

	/**
	 * Stops showing the card being played, or optionally only stop showing if the card being played is the card passed in.
	 * @param {SDK.Card} [sdkCard=currently shown card]
	 * @param {Number} animateDuration duration of animation in seconds
	 */
	stopShowingPlayCard: function (sdkCard, animateDuration) {
		var currentSdkCard = this._playCardNode.getSdkCard();
		sdkCard || (sdkCard = currentSdkCard);
		if (currentSdkCard != null && currentSdkCard === sdkCard) {
			this._playCardNode.stopShowingPlay(animateDuration);

			this.getEventBus().trigger(EVENTS.play_card_stop, {type: EVENTS.play_card_stop, card: sdkCard});
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
	showSkippablePlayCard: function (action, animateDuration, showDuration, nextActionShowDelay, onCardShown) {
		// stop any previous
		this._stopShowActionCardSequence();

		// show played card
		this.showPlayCard(action, animateDuration, showDuration, false);

		// setup action to delay for showing played card and then show next action
		this._showActionCardSequenceCompletedCallback = onCardShown;
		this._showActionCardSequence = this.runAction(cc.sequence(
			cc.delayTime(nextActionShowDelay),
			cc.callFunc(function () {
				var showActionCardSequenceCompletedCallback = this._getShowActionCardSequenceCompletedCallback();
				this._showActionCardSequence = null;
				this._showActionCardSequenceCompletedCallback = null;
				showActionCardSequenceCompletedCallback();
			}.bind(this), this)
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
	showBurnCard: function (action, startDelay, burnShowDuration, dissolveDelay, dissolveDuration) {
		var sdkCard = action.getCard();
		var currentSdkCard = this._burnCardNode.getSdkCard();
		if (currentSdkCard == null || currentSdkCard !== sdkCard) {
			// set sdk card to trigger rebuild
			this._burnCardNode.setSdkCard(sdkCard, action);
			var cardContentSize = this._burnCardNode.getCardContentSize();
			var ownerId = action.getOwnerId();
			var isOwnedByPlayer2 = ownerId === SDK.GameSession.getInstance().getPlayer2Id();
			var isOwnedByMyPlayer = ownerId === SDK.GameSession.getInstance().getMyPlayerId();

			// calculate positions
			var sourceScreenPosition;
			var targetScreenPosition;

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
	whenHighlightedGeneralsAsync: function (callback) {
		if (this._highlightedGeneralsPromise == null) {
			this._highlightedGeneralsPromise = new Promise(function(resolve,reject){
				this.whenStatus(GameLayer.STATUS.NEW).then(function () {
					if (this._highlightingGeneralsPromise != null) {
						// use the highlighting generals promise
						this._highlightingGeneralsPromise.then(resolve);
					} else {
						resolve();
					}
				}.bind(this));
			}.bind(this));
		}

		this._highlightedGeneralsPromise.nodeify(callback);

		return this._highlightedGeneralsPromise;
	},

	/**
	 * Highlights generals starting with my player general and then opponent player general.
	 * @returns {Promise}
	 */
	highlightGenerals: function () {
		return this.whenStatus(GameLayer.STATUS.NEW).then(function () {
			if (this._highlightingGeneralsPromise == null && !SDK.GameSession.getInstance().isChallenge()) {
				this._highlightingGeneralsPromise = new Promise(function(resolve,reject){
					this.bindSdkPlayers();

					// my player data
					var myPlayerTaunted = false;
					var myPlayer = this._player;
					var myPlayerId = myPlayer.getPlayerId();
					var myGeneralCard = SDK.GameSession.getInstance().getGeneralForPlayerId(myPlayerId);
					var myGeneralId = myGeneralCard.getId();
					var myGeneralNode = this.getNodeForSdkCard(myGeneralCard);
					var myFaction = SDK.FactionFactory.factionForIdentifier(myGeneralCard.getFactionId());

					// opponent player data
					var opponentPlayerTaunted = false;
					var opponentPlayer = this._opponent;
					var opponentPlayerId = opponentPlayer.getPlayerId();
					var opponentGeneralCard = SDK.GameSession.getInstance().getGeneralForPlayerId(opponentPlayerId);
					var opponentGeneralId = opponentGeneralCard.getId();
					var opponentGeneralNode = this.getNodeForSdkCard(opponentGeneralCard);
					var opponentFaction = SDK.FactionFactory.factionForIdentifier(opponentGeneralCard.getFactionId());

					// taunts
					var myTauntText = SDK.FactionFactory.getTauntCallout(myGeneralId, opponentGeneralId);
					var opponentTauntText = SDK.FactionFactory.getTauntResponse(opponentGeneralId, myGeneralId);

					var tryToResolve = function () {
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
						cc.callFunc(function () {
							// show my general taunting
							myPlayer.highlightGeneral(myGeneralNode);
							this.showSpeechForEntityNode(myGeneralNode, myTauntText, null, CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION, true, 0.275);
						}.bind(this)),
						cc.delayTime(CONFIG.DIALOGUE_ENTER_DURATION + CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION),
						cc.callFunc(function () {
							// finish my general taunting
							myPlayer.unhighlightGeneral();
						}.bind(this)),
						cc.delayTime(CONFIG.GENERAL_FX_FADE_DURATION),
						cc.callFunc(function () {
							// delay to let fx fade out, then try to resolve
							myPlayerTaunted = true;
							tryToResolve();
						}.bind(this))
					));

					this.runAction(cc.sequence(
						cc.delayTime(CONFIG.HIGHLIGHT_OPPONENT_GENERAL_TAUNT_DELAY),
						cc.callFunc(function () {
							// show opponent general taunting
							opponentPlayer.highlightGeneral(opponentGeneralNode);
							this.showSpeechForEntityNode(opponentGeneralNode, opponentTauntText, null, CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION, true, 0.275);
						}.bind(this)),
						cc.delayTime(CONFIG.DIALOGUE_ENTER_DURATION + CONFIG.HIGHLIGHT_GENERAL_TAUNT_DURATION),
						cc.callFunc(function () {
							// finish opponent general taunting
							opponentPlayer.unhighlightGeneral();
						}.bind(this)),
						cc.delayTime(CONFIG.GENERAL_FX_FADE_DURATION),
						cc.callFunc(function () {
							// delay to let fx fade out, then try to resolve
							opponentPlayerTaunted = true;
							tryToResolve();
						}.bind(this))
					));
				}.bind(this));
			}
			return this._highlightingGeneralsPromise;
		}.bind(this));
	},

	_highlightOnlyMyGeneral: function () {
		this.bindSdkPlayers();

		this._opponent.unhighlightGeneral();

		var myPlayerId = this._player.getPlayerId();
		var myGeneralCard = SDK.GameSession.getInstance().getGeneralForPlayerId(myPlayerId);
		var myGeneralNode = this.getNodeForSdkCard(myGeneralCard);
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
	showSpeechOverTile: function(tileIndices, text, sound, duration) {
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
	showSpeechAtPosition: function(position, text, sound, duration, isNotDismissable) {
		var showDuration = 0.0;
		var speechNode = SpeechNode.create();
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
	getSpeechNodeForEntityNode: function (entityNode) {
		return this.getSpeechNodeForSdkCard(entityNode.getSdkCard());
	},

	/**
	 * Returns a cached speech node by sdk card index if one exists.
	 * @param sdkCard
	 * @returns {SpeechNode|null}
	 */
	getSpeechNodeForSdkCard: function (sdkCard) {
		if (sdkCard != null) {
			return this._speechNodes[sdkCard.getIndex()];
		}
	},

	/**
	 * Returns a cached speech node by entity node if one exists, or creates a new one as needed.
	 * @param entityNode
	 * @returns {SpeechNode}
	 */
	getOrCreateSpeechNodeForEntityNode: function (entityNode) {
		return this.getOrCreateSpeechNodeForSdkCard(entityNode.getSdkCard());
	},

	getOrCreateSpeechNodeForSdkCard: function (sdkCard) {
		var speechNode = this.getSpeechNodeForSdkCard(sdkCard);
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

	showSpeechForEntityNode: function (entityNode, text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
		var showDuration = 0.0;
		if (entityNode instanceof EntityNode) {
			var speechNode = this.getOrCreateSpeechNodeForEntityNode(entityNode);
			showDuration = speechNode.showTextWithSoundForDuration(text, sound, duration, true, isNotDismissable, speechYPosition, withProceedCarrot);
		}
		return showDuration;
	},

	showSpeechForPlayer: function (player, text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
		var showDuration = 0.0;
		if (player instanceof Player) {
			var playerId = player.getPlayerId();
			var generalCard = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId);
			var generalNode = this.getNodeForSdkCard(generalCard);
			showDuration = this.showSpeechForEntityNode(generalNode, text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot);
		}
		return showDuration;
	},

	showSpeechForPlayer1: function (text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
		return this.showSpeechForPlayer(this.getPlayer1(), text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot);
	},

	showSpeechForPlayer2: function (text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot) {
		return this.showSpeechForPlayer(this.getPlayer2(), text, sound, duration, isNotDismissable, speechYPosition, withProceedCarrot);
	},

	/* endregion UNIT SPEECH */

	/* region TOOLTIPS */

	getOrCreateTooltipNode: function () {
		// node that displays tooltips
		if (this._tooltipNode == null) {
			this._tooltipNode = new TooltipNode();
		}
		return this._tooltipNode;
	},

	getTooltipNode: function () {
		return this._tooltipNode;
	},

	showTooltipForSdkNode: function (sdkNode, text, carrotDirection) {
		if (sdkNode instanceof SdkNode) {
			var position = sdkNode.getCenterPositionForExternal();
			var offset;
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

	showTooltipAtPosition: function (screenPosition, text, carrotDirection) {
		if (!this.getIsDisabled() && !this.getIsShowGameOver()) {
			var tooltipNode = this.getOrCreateTooltipNode();
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

	stopShowingTooltip: function () {
		var tooltipNode = this.getTooltipNode();
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
	showInstructionAtPosition: function(screenPosition, text, sound, duration, isNotDismissable, carrotDirection) {
		if (!this.getIsDisabled() && !this.getIsShowGameOver()) {
			var instructionNode = InstructionNode.create();

			instructionNode.showTextWithSoundForDuration(text, sound, duration, true, isNotDismissable, carrotDirection);
			instructionNode.setPosition(screenPosition);

			this.uiLayer.addChild(instructionNode, this._ui_z_order_instructional_nodes);

			return instructionNode;
		}
	},

	showInstructionOverTile: function(boardPosition, text, sound, duration, isNotDismissable, carrotDirection) {
		var position = UtilsEngine.transformBoardToTileMap(boardPosition);
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
	showInstructionForSdkNode: function (sdkNode, text, sound, duration, isNotDismissable, carrotDirection) {
		if (!this.getIsDisabled() && !this.getIsShowGameOver() && sdkNode instanceof SdkNode) {
			var instructionNode = sdkNode.getOrCreateInstructionNode();
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

	showInstructionForPlayer: function (player, text, sound, duration, isNotDismissable, carrotDirection) {
		if (player instanceof Player) {
			var playerId = player.getPlayerId();
			var generalCard = SDK.GameSession.getInstance().getGeneralForPlayerId(playerId);
			var generalNode = this.getNodeForSdkCard(generalCard);
			return this.showInstructionForSdkNode(generalNode, text, sound, duration, isNotDismissable, carrotDirection);
		}
	},

	showInstructionForPlayer1: function (text, sound, duration, isNotDismissable, carrotDirection) {
		return this.showInstructionForPlayer(this.getPlayer1(), text, sound, duration, isNotDismissable, carrotDirection);
	},

	showInstructionForPlayer2: function (text, sound, duration, isNotDismissable, carrotDirection) {
		return this.showInstructionForPlayer(this.getPlayer2(), text, sound, duration, isNotDismissable, carrotDirection);
	},

	/* endregion INSTRUCTION */

	/* region MOUSE */

	updateMouseCursor: function (changed) {
		if (this.getIsGameOver() || SDK.GameSession.current().getIsSpectateMode()) {
			// mouse should always be auto when game over or spectating
			return this.updateMouseCursorByState("auto");
		} else if (this.getPlayerSelectionLocked()) {
			// mouse should always be disabled when player selection is locked
			return this.updateMouseCursorByState("disabled");
		} else {
			// if player is hovering board, only update cursor if hover has changed
			var player = this._player;
			if (player != null && (!player.getIsMouseOnBoard() || player.getHoverChanged() || changed)) {
				var mouseBoardPosition = player.getMouseBoardPosition();
				// check for bottom deck card
				if (this.getIsActive() && player.getSelectedCard() && !player.getMouseOverSdkCard()) {
					return this.updateMouseCursorByState("card");
				}

				var mouseOverSdkEntity = player.getMouseOverSdkEntity();

				// followup and mouse over a valid target entity
				var followupCard = player.getFollowupCard();
				if (followupCard != null && mouseOverSdkEntity != null && mouseOverSdkEntity.getIsActive()) {
					var followupBoardPositions = followupCard.getValidTargetPositions();
					if (followupBoardPositions && UtilsPosition.getIsPositionInPositions(followupBoardPositions, mouseOverSdkEntity.getPosition())) {
						return this.updateMouseCursorByState("card");
					}
				}

				// bottom deck
				var mouseOverSdkCard = player.getMouseOverSdkCard();
				if (mouseOverSdkCard != null) {
					if (!player.getMouseDragging()) {
						return this.updateMouseCursorByState("select");
					}
				} else if (player.getMouseOverArtifactNode() == null
					&& player.getMouseOverReplaceNode() == null
					&& this._battleLog.getMouseOverBattleLogNode() == null) {
					// check for selected entity actions
					var selectedSdkEntity = player.getSelectedSdkEntity();
					if (selectedSdkEntity != null) {
						if (mouseOverSdkEntity && mouseOverSdkEntity.getIsActive() && selectedSdkEntity !== mouseOverSdkEntity) {
							if (!selectedSdkEntity.getIsSameTeamAs(mouseOverSdkEntity) && selectedSdkEntity.getAttackRange().getIsValidTarget(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseOverSdkEntity)) {
								return this.updateMouseCursorByState("attack");
							}
						} else if (selectedSdkEntity.getCanMove() && selectedSdkEntity.getMovementRange().getIsPositionValid(SDK.GameSession.getInstance().getBoard(), selectedSdkEntity, mouseBoardPosition)) {
							return this.updateMouseCursorByState("move");
						}
					}

					// mouse over a entity
					if (mouseOverSdkEntity != null && !player.getMouseDragging() && mouseOverSdkEntity.isOwnedByMyPlayer() && mouseOverSdkEntity.getCanAct()) {
						return this.updateMouseCursorByState("select");
					}
				}

				return this.updateMouseCursorByState("auto");
			}
		}
	},

	updateMouseCursorByState: function (state) {
		if(this._mouseState !== state) {
			this._mouseState = state;
			this.getEventBus().trigger(EVENTS.canvas_mouse_state, {type: EVENTS.canvas_mouse_state, state: this._mouseState});
		}
	},

	stopMouseOverButNotPlayer: function () {
		this._player.setMouseOverCard(null);
		this._player.setMouseOverArtifact(null);
		this._player.setMouseOverReplaceNode(null);
		this.updateMouseCursor();
	},

	// TODO: needs comment
	stopMouseOver: function () {
		this._player.setMouseOverEntityNode(null);
		this._player.removeHover();
		this.stopMouseOverButNotPlayer();
	},

	// TODO: needs comment
	// Cleans up mouse down state values
	stopMouseDown: function () {
		this.removeEntityNodeHighlights();
		this.stopParticles();

		// reset player intent
		this._player.setIntentType(SDK.IntentType.NeutralIntent);

		// deselect previous selection
		this._player.setSelectedEntityNode(null);
		var selectedCard = this._player.getSelectedCard();
		var selectedCardIndexInHand = this._player.getSelectedCardIndexInHand();
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

	stopMouseDownForPlayer: function (player) {
		player.setSelectedEntityNode(null);
		player.setSelectedCard(null);
		player.clearCardsWithFollowup();
		player.setIntentType(SDK.IntentType.NeutralIntent);
		player.removeHover();
	},

	stopMouseOverForPlayer: function (player) {
		player.setMouseOverCard(null);
		player.setMouseOverEntityNode(null);
		player.setMouseOverArtifact(null);
		player.setMouseOverReplaceNode(null);
		player.removeHover();
	},

	onPointerMove: function(event) {
		// don't interact when disabled
		if (this.getIsGameOver() || event == null || event.isStopped) {
			return;
		}

		var mouseOverActive;
		var location = event.getLocation();
		this._handlingMouseMove = true;

		var mouseWasDragging = this._player.getMouseDragging();
		var isActive = this.getIsActive();
		var isPregame = this.getIsChooseHand() || this.getIsSubmitHand() || this.getIsStartingHand();

		// update mouse position and potentially trigger drag to start
		var mouseBoardPositionLast = this._player.getMouseBoardPosition();
		this._player.setMouseScreenPosition(location);
		var mouseScreenPosition = this._player.getMouseScreenPosition();
		var mouseBoardPosition = this._player.getMouseBoardPosition();

		// when just starting drag, do mouse select from down position
		if (this.getIsGameActive() && this._player.getMouseDragging() && mouseWasDragging !== this._player.getMouseDragging()) {
			this._mouseSelectAtBoardOrScreenPosition(this._player.getMouseBoardUnroundedDownPosition(), this._player.getMouseScreenDownPosition());
		}

		// hover replace node
		var mouseOverReplaceNode;
		if (this._player.getSelectedCardIndexInHand() != null) {
			// hover replace
			var replaceNode = this.getNodeUnderMouse(this.bottomDeckLayer.getReplaceNode(), mouseScreenPosition.x, mouseScreenPosition.y);
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
			var cardNodes;
			if (isPregame) {
				// get cards nodes in hand
				cardNodes = this.bottomDeckLayer.getCardNodes();
			} else {
				// get signature card nodes and card nodes in hand
				cardNodes = [].concat(this.bottomDeckLayer.getCardNodes());
				var player1SignatureCardNode = this.getPlayer1Layer().getSignatureCardNode();
				if (player1SignatureCardNode != null && !player1SignatureCardNode.getIsDisabled() && player1SignatureCardNode.getSdkCard() != null) {
					cardNodes.push(player1SignatureCardNode);
				}
				var player2SignatureCardNode = this.getPlayer2Layer().getSignatureCardNode();
				if (player2SignatureCardNode != null && !player2SignatureCardNode.getIsDisabled() && player2SignatureCardNode.getSdkCard() != null) {
					cardNodes.push(player2SignatureCardNode);
				}
			}

			var cardNode = this.getNodeUnderMouse(cardNodes, mouseScreenPosition.x, mouseScreenPosition.y);
			var selectedCard = this._player.getSelectedCard();
			if (cardNode != null && (selectedCard == null || (cardNode.getSdkCard() != null && cardNode.getSdkCard().getIndex() !== selectedCard.getIndex()))) {
				event.stopPropagation();
				mouseOverActive = true;
				mouseOverCard = cardNode;
			}
		}
		this._player.setMouseOverCard(mouseOverCard);

		// hover artifact cards
		var mouseOverArtifact;
		if (isActive && !event.isStopped && !this._player.getFollowupCard()) {
			var artifactNode = this.getNodeUnderMouse(this.player1Layer.getArtifactNodes(), mouseScreenPosition.x, mouseScreenPosition.y) || this.getNodeUnderMouse(this.player2Layer.getArtifactNodes(), mouseScreenPosition.x, mouseScreenPosition.y);
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
			var lastPlayedEntityBoardPosition = _.find(this._lastPlayedCardBoardPositions, function (cardBoardPosition) {
				return cardBoardPosition.x === mouseBoardPosition.x && cardBoardPosition.y === mouseBoardPosition.y;
			});
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
				var entityNode = this.getEntityNodeAtBoardPosition(mouseBoardPosition.x, mouseBoardPosition.y, true, true);
				if (entityNode == null && !this._player.getIsTakingSelectionAction()) {
					// allow selection of a moving unit intersected by mouse as long as nothing else is selected
					entityNode = this.getMovingUnitNodeUnderMouse(mouseScreenPosition.x, mouseScreenPosition.y, true, true);
				}
				if (entityNode && entityNode.getIsSpawned()) {
					var selectedEntityNode = this._player.getSelectedEntityNode();
					if (!selectedEntityNode || selectedEntityNode !== entityNode) {
						event.stopPropagation();
						mouseOverActive = true;

						// no current entity or new and not same as last during selected action
						var mouseOverEntityNode = this._player.getMouseOverEntityNode();
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
		if(!mouseOverActive) {
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
				var hoverEventData = {
					type: EVENTS.network_game_hover, timestamp: Date.now(),
					boardPosition: this._player.getMouseBoardPosition(),
					handIndex: this._player.getMouseOverHandIndex(),
					cardIndex: this._player.getMouseOverSdkEntityIndex(),
					intentType: this._player.getIntentType()
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

	_updateMouseBoardPositionByCurrentHover: function (mouseBoardPositionLast) {
		if (this._player.getMouseOverCardNode() != null
			|| this._player.getMouseOverArtifactNode() != null
			|| this._player.getMouseOverReplaceNode() != null
			|| this._battleLog.getMouseOverBattleLogNode() != null) {
			// force mouse board position off board when hovering any cards outside board
			var forcedBoardPosition = {x: -1, y: -1};
			this._player.setMouseBoardPosition(forcedBoardPosition);
			if (UtilsPosition.getPositionsAreEqual(mouseBoardPositionLast, forcedBoardPosition)) {
				this._player.setHoverDirty(false);
			}
		} else {
			var mouseOverSdkEntity = this._player.getMouseOverSdkEntity();
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

	onPointerDown: function(event) {
		// don't interact when disabled
		if (SDK.GameSession.current().getIsSpectateMode() || this.getIsGameOver() || event == null || event.isStopped) {
			return;
		}

		var location = event.getLocation();

		// set player stored mouse position
		this._player.setMouseScreenDownPosition(location);
		this._player.setMouseScreenPosition(location);
	},

	onPointerUp: function (event) {
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

		var location = event.getLocation();
		var player = this._player;

		// Set the mouse's screen position
		var mouseBoardPositionLast = player.getMouseBoardPosition();
		player.setMouseScreenPosition(location);
		var mouseDragging = player.getMouseDragging();
		player.setMouseScreenUpPosition(location);
		var mouseScreenPosition = player.getMouseScreenPosition();

		// skip showing play card
		this.skipShowActionCardSequence();

		// handle pointer by button
		if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
			// Trigger a cancel if performing a cancellable followup or have a selection
			if (SDK.GameSession.getInstance().getIsMyFollowupActiveAndCancellable() || !!(this._player.getSelectedCard() || this._player.getSelectedEntityNode())) {
				NavigationManager.getInstance().requestUserTriggeredCancel();
			}
		} else {
			if (this.getIsChooseHand()) {
				// toggle cards to be mulliganed from starting hand
				var cardNode = this.getNodeUnderMouse(this.bottomDeckLayer.getCardNodes(), mouseScreenPosition.x, mouseScreenPosition.y);
				if (cardNode) {
					// stop inspect of card
					this.stopShowingInspectCard(cardNode.getSdkCard());

					var wasSelected = cardNode.getSelected();
					var selectionChanged;
					if (wasSelected) {
						selectionChanged = true;
						cardNode.setSelected(false);
					} else {
						var mulliganIndices = this.getMulliganIndices();
						if (mulliganIndices.length < CONFIG.STARTING_HAND_REPLACE_COUNT) {
							selectionChanged = true;
							cardNode.setSelected(true);
						} else {
							// show reminder of max mulligan count centered above card we're trying to mulligan
							var cardNodePosition = cardNode.getPosition();
							var reminderPosition = cc.p(cardNodePosition.x, cardNodePosition.y + CONFIG.HAND_CARD_SIZE * 0.5);
							var reminderMessage = i18next.t("game_ui.out_of_mulligan_message",{count:CONFIG.STARTING_HAND_REPLACE_COUNT});
							this.showInstructionAtPosition(reminderPosition, reminderMessage);
						}
					}

					if (selectionChanged) {
						// broadcast the selection during mulligan
						SDK.NetworkManager.getInstance().broadcastGameEvent({
							type: EVENTS.network_game_select,
							timestamp: Date.now(),
							handIndex: cardNode.getHandIndex()
						})

						if (cardNode.getSelected()) {
							this.getEventBus().trigger(EVENTS.mulligan_card_selected, {
								type: EVENTS.mulligan_card_selected,
								handIndex: cardNode.getHandIndex()
							});
						} else {
							this.getEventBus().trigger(EVENTS.mulligan_card_deselected, {
								type: EVENTS.mulligan_card_deselected,
								handIndex: cardNode.getHandIndex()
							});
						}
					}
				}
			} else if (this.getIsActive()) {
				// active game
				if (!this.getIsPlayerSelectionLocked()) {
					var followupCard = player.getFollowupCard();

					// check if mouse board position needs to be forced
					this._updateMouseBoardPositionByCurrentHover(mouseBoardPositionLast);

					var mouseBoardPosition = this._player.getMouseBoardPosition();
					if (followupCard == null || !SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition) || followupCard.getIsPositionValidTarget(mouseBoardPosition)) {
						// get player state
						var sdkPlayer = this._player.getSdkPlayer();
						var selectedSdkCard = player.getSelectedCard();
						var mouseOverSdkCard = player.getMouseOverSdkCard();
						var selectedHandIndex = player.getSelectedCardIndexInHand();
						var selectedEntityNode = player.getSelectedEntityNode();
						var mouseOverEntityNode = player.getMouseOverEntityNode();
						var wasTakingSelectionAction = player.getIsTakingSelectionAction();

						// stop mouse down before attempting to do anything else
						// this way we've cleared the UI before changing state
						if (wasTakingSelectionAction) {
							this.stopMouseDown();
						}

						// player currently has something selected and is clicking to perform an action with it
						var actionToExecute;
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
							var submitted = SDK.GameSession.getInstance().submitExplicitAction(actionToExecute);

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
							var mouseBoardUnroundedUpPosition = this._player.getMouseBoardUnroundedUpPosition();
							var mouseScreenUpPosition = this._player.getMouseScreenUpPosition();
							var entityNodeUnderMouse = this.getEntityNodeAtBoardPosition(mouseBoardUnroundedUpPosition.x, mouseBoardUnroundedUpPosition.y, true, true);
							var cardNodeUnderMouse = this.getNodeUnderMouse(this.bottomDeckLayer.getCardNodes(), mouseScreenUpPosition.x, mouseScreenUpPosition.y);
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
							var targetPosition = actionToExecute.getTargetPosition();
							if (targetPosition != null) {
								this._lastPlayedCardBoardPositions.push(targetPosition);
							}
						}

						// move mouse board position when selected a unit on board
						var selectedSdkEntity = this._player.getSelectedSdkEntity();
						if (selectedSdkEntity != null) {
							var entityBoardPosition = selectedSdkEntity.getPosition();
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
						type: EVENTS.network_game_hover, timestamp: Date.now(),
						boardPosition: this._player.getMouseBoardPosition(),
						intentType: this._player.getIntentType()
					})
				}
			}
		}
	},

	onHoverChanged: function () {
		// reset last mouse over
		this._resetLastMouseOverPropertiesForAction();
	},

	onSelectionChanged: function () {
		// reset last mouse over
		this._resetLastMouseOverPropertiesForAction();
	},

	_resetLastMouseOverPropertiesForAction: function () {
		// only reset when no followup is active
		var followupCard = this._player.getFollowupCard();
		if (followupCard == null) {
			this._lastMouseOverEntityNodesForAction = [];
			this._lastSelectedEntityNodeForAction = null;
			this._lastPlayedCardBoardPositions = [];
		}
	},

	_mouseSelectAtBoardOrScreenPosition: function(boardPosition, screenPosition) {
		if (!this.getIsPlayerSelectionLocked()) {
			// try to select a card outside board
			this._mouseSelectNewCardOffBoardAtScreenPosition(screenPosition);
			if (!this._player.getSelectedCard()) {
				// try to select a card from board
				this._mouseSelectNewCardFromBoardAtBoardOrScreenPosition(boardPosition, screenPosition);
			}
		}
	},

	_mouseSelectNewCardOffBoardAtScreenPosition: function (screenPosition) {
		// get signature card node and card nodes in hand
		var cardNodes = [].concat(this.bottomDeckLayer.getCardNodes());
		var signatureCardNode = this.getMyPlayerLayer().getSignatureCardNode();
		var sdkPlayer = this._player.getSdkPlayer();
		if (!signatureCardNode.getIsDisabled() && sdkPlayer != null && sdkPlayer.getCurrentSignatureCard() != null && sdkPlayer.getIsSignatureCardActive()) {
			cardNodes.push(signatureCardNode);
		}

		// try to select a card under mouse
		var cardNode = this.getNodeUnderMouse(cardNodes, screenPosition.x, screenPosition.y);
		if (cardNode) {
			var sdkCard = cardNode.getSdkCard();
			if (sdkCard) {
				// do not allow card and entity to be selected at same time
				this._player.setSelectedEntityNode(null);

				// select card
				this._player.setSelectedCard(cardNode);
			}
		}
	},

	_mouseSelectNewCardFromBoardAtBoardOrScreenPosition: function (boardPosition, screenPosition) {
		// try to always get entity at the board position first, then a moving unit intersected by mouse
		this._mouseSelectEntity(this.getEntityNodeAtBoardPosition(boardPosition.x, boardPosition.y) || this.getMovingUnitNodeUnderMouse(screenPosition.x, screenPosition.y));
	},

	_mouseSelectEntity: function (entityNode) {
		if (entityNode) {
			var sdkEntity = entityNode.getSdkCard();
			if (sdkEntity.isOwnedByMyPlayer()) {
				if (sdkEntity.hasActiveModifierClass(SDK.ModifierStunned)) {
					this.showInstructionForSdkNode(entityNode,i18next.t("game_ui.stunned_message"));
				} else if (sdkEntity.getIsUncontrollableBattlePet()) {
					this.showInstructionForSdkNode(entityNode,i18next.t("game_ui.battlepet_message"));
				} else if (sdkEntity.getIsExhausted()) {
					this.showInstructionForSdkNode(entityNode,i18next.t("game_ui.exhausted_message"));
				} else if (sdkEntity.getCanAct()) {
					// do not allow card and entity to be selected at same time
					this._player.setSelectedCard(null);

					// select entity
					this._player.setSelectedEntityNode(entityNode);
					var selectedSdkEntity = this._player.getSelectedSdkEntity();

					this.displaySelectEntityParticles(selectedSdkEntity.position.x, selectedSdkEntity.position.y);

					this.stopMouseOverButNotPlayer();
					this._player.removeHover();
				}
			}
		}
	},

	_actionSelectedFollowupCard: function (followupCard) {
		var actionToExecute;

		// create the followup action
		var mouseBoardPosition = this._player.getMouseBoardPosition();
		if (followupCard != null && SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition)) {
			actionToExecute = this._player.getSdkPlayer().actionPlayFollowup(followupCard, mouseBoardPosition.x, mouseBoardPosition.y);
		} else if (SDK.GameSession.getInstance().getIsMyFollowupActiveAndCancellable()) {
			NavigationManager.getInstance().requestUserTriggeredCancel();
		}

		return actionToExecute;
	},

	_actionSelectedSignatureCard: function (signatureCard) {
		var actionToExecute;

		if (signatureCard != null) {
			var mouseBoardPosition = this._player.getMouseBoardPosition();
			if (SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition)) {
				// create play card action
				actionToExecute = this._player.getSdkPlayer().actionPlaySignatureCard(mouseBoardPosition.x, mouseBoardPosition.y);
			} else {
				var mouseScreenPosition = this._player.getMouseScreenPosition();
				var replaceNode = this.getNodeUnderMouse(this.bottomDeckLayer.getReplaceNode(), mouseScreenPosition.x, mouseScreenPosition.y);
				if (replaceNode != null) {
					// remind player that signature card cannot be replaced
					this.showInstructionAtPosition(this.bottomDeckLayer.getReplaceNode().getPosition(), i18next.t("game_ui.replace_bloodborn_message"));
				}
			}
		}

		return actionToExecute;
	},

	_actionSelectedCardFromHand: function (selectedHandIndex) {
		var actionToExecute;

		if (selectedHandIndex != null) {
			var mouseBoardPosition = this._player.getMouseBoardPosition();
			if (SDK.GameSession.getInstance().getBoard().isOnBoard(mouseBoardPosition)) {
				// create play card action
				actionToExecute = this._player.getSdkPlayer().actionPlayCardFromHand(selectedHandIndex, mouseBoardPosition.x, mouseBoardPosition.y);
			} else {
				var mouseScreenPosition = this._player.getMouseScreenPosition();
				var replaceNode = this.getNodeUnderMouse(this.bottomDeckLayer.getReplaceNode(), mouseScreenPosition.x, mouseScreenPosition.y);
				if (replaceNode && !replaceNode.getIsDisabled()) {
					// create replace action
					actionToExecute = this._player.getSdkPlayer().actionReplaceCardFromHand(selectedHandIndex);
				}
			}
		}

		return actionToExecute;
	},

	_actionSelectedCardOnBoard: function (selectedEntityNode, mouseOverEntityNode) {
		var actionToExecute;

		if (selectedEntityNode) {
			var mouseBoardPosition = this._player.getMouseBoardPosition();
			var selectedSdkEntity = selectedEntityNode.getSdkCard();
			var mouseOverSdkEntity = mouseOverEntityNode && mouseOverEntityNode.getSdkCard();

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

	onMouseExited: function (event) {
		this.stopMouseOver();
	},

	/* endregion MOUSE */

	/* region NETWORK UI EVENTS */

	onNetworkMouseClear: function(eventData) {
		if (eventData != null) {
			var playerActor = this._opponent;
			// if we're spectating and have a playerId on the event
			// use current player to show ui data
			if (SDK.GameSession.current().getIsSpectateMode() && eventData.playerId === this._player.getPlayerId()) {
				playerActor = this._altPlayer;
			}
			this.stopMouseOverForPlayer(playerActor);
			this.stopMouseDownForPlayer(playerActor);
		}
	},

	onNetworkHover: function(eventData) {
		if (eventData != null) {
			// if we're spectating and have a playerId on the event
			// use current player to show ui data
			var playerId = eventData.playerId;
			var playerActor;
			var canShowInHand;
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
				}  else if (eventData.player2SignatureCard) {
					playerActor.setMouseOverCard(this.getPlayer2Layer().getSignatureCardNode());
				} else {
					playerActor.setMouseOverCard(null)
				}

				// hover over unit in play
				if (eventData.cardIndex != null) {
					var entityNode = _.find(this._unitNodes, function (n) {
						return n.getSdkCard().getIndex() === eventData.cardIndex
					});
					if (entityNode) {
						playerActor.setMouseOverEntityNode(entityNode);
					}
				} else {
					playerActor.setMouseOverEntityNode(null)
				}

				// set intent last to ensure it does not get overwritten
				if (eventData.intentType != null) {
					playerActor.setIntentType(eventData.intentType)
				}

				// hover over board
				if (eventData.boardPosition != null) {
					playerActor.setMouseScreenPositionFromBoardLocation(eventData.boardPosition)
					playerActor.showHover()
				}
			} else {
				// otherwise stop hover
				this.stopMouseOverForPlayer(playerActor);
			}
		}
	},
	onNetworkSelect: function(eventData) {
		if (eventData != null) {
			// if we're spectating and have a playerId on the event
			// use current player to show ui data
			var playerId = eventData.playerId;
			var playerActor;
			var canShowInHand;
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
					var cardNode = this.bottomDeckLayer.getCardNodeByHandIndex(eventData.handIndex);
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
					var entityNode = _.find(this._unitNodes, function (n) {
						return n.getSdkCard().getIndex() === eventData.cardIndex
					})
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
					playerActor.setIntentType(eventData.intentType)
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
	DISABLED: 9999
};

GameLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new GameLayer());
};

module.exports = GameLayer;
