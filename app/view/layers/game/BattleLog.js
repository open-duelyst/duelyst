//pragma PKGS: game
var CONFIG = require('app/common/config');
var EVENTS = require("./../../../common/event_types");
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var Promise = require('bluebird');
var _ = require('underscore');
var RSX = require("app/data/resources");
var UtilsEngine = require('app/common/utils/utils_engine');
var audio_engine = require("./../../../audio/audio_engine");
var BaseLayer = require("./../BaseLayer");
var BaseSprite = require("./../../nodes/BaseSprite");
var BattleLogNode = require("./../../nodes/cards/BattleLogNode");

/****************************************************************************
 BattleLog
 ****************************************************************************/

var BattleLog = BaseLayer.extend({

	_battleLogEntriesContainer: null,

	_battleLogNodes:null,
	_battleLogNodesPool:null,
	_nextBattleLogNode: null,
	_battleLogNodesInUse:null,

	_battleLogNodePositions: null,

	_stepsProcessed:null,

	_button: null,
	_collapseButton: null,
	_expandButton: null,
	_expanded: false,

	_mouseOverBattleLogNode: null,

	/* region INITIALIZE */

	ctor:function () {
		// initialize properties that may be required in init
		this._stepsProcessed = [];
		this._battleLogNodes = [];
		this._battleLogNodesPool = [];
		this._battleLogNodesInUse = [];

		// battle log entries container
		this._battleLogEntriesContainer = new BaseSprite(RSX.battlelog_frame.img);
		this._battleLogEntriesContainer.setAnchorPoint(0, 0.5);

		// battle log buttons
		this._button = new cc.Node();
		this._button.setAnchorPoint(0.5, 0.5);
		this._button.setPosition(102 + CONFIG.BATTLELOG_OFFSET.x, 200 + CONFIG.BATTLELOG_OFFSET.y);

		this._collapseButton = new BaseSprite(RSX.battlelog_button_collapse.img);
		this._collapseButton.setVisible(false);
		this._button.addChild(this._collapseButton);

		this._expandButton = new BaseSprite(RSX.battlelog_button_expand.img);
		this._expandButton.setVisible(false);
		this._button.addChild(this._expandButton);

		// battle log node pool
		for(var i = 0; i < CONFIG.MAX_BATTLELOG_ENTRIES + 2; i++) {
			var battleLogNode = new BattleLogNode();
			battleLogNode.setVisible(false);
			this._battleLogNodes.push(battleLogNode);
			this._battleLogNodesPool.push(battleLogNode);
		}

		// do super ctor
		this._super();

		// add battle log elements
		this.addChild(this._battleLogEntriesContainer);
		this._battleLogEntriesContainer.addChild(this._button);

		// add battle log nodes to container
		for (var i = 0, il = this._battleLogNodes.length; i < il; i++) {
			this._battleLogEntriesContainer.addChild(this._battleLogNodes[i]);
		}

		// start collapsed
		this.collapse();
	},

	/* endregion INITIALIZE */

	/* region GETTERS / SETTERS */

	/**
	 * Returns the active battlelog button.
	 * @returns {cc.Node}
	 */
	getBattleLogButton: function () {
		return this._button;
	},

	/**
	 * Returns all battlelog nodes.
	 * @returns {Array}
	 */
	getBattleLogNodes: function () {
		return this._battleLogNodes;
	},

	/**
	 * Returns all battlelog nodes in use.
	 * @returns {Array}
	 */
	getBattleLogNodesInUse: function () {
		return this._battleLogNodesInUse;
	},

	/**
	 * Returns the x position of the battle log.
	 * @returns {Number}
	 */
	getBattleLogX: function () {
		return UtilsEngine.getGSIWinLeft() + (!this._expanded ? -87.0 : 0.0) + CONFIG.BATTLELOG_OFFSET.x;
	},

	/**
	 * Returns the y position of the battle log.
	 * @returns {Number}
	 */
	getBattleLogY: function () {
		return UtilsEngine.getGSIWinCenterY() + CONFIG.BATTLELOG_OFFSET.y;
	},

	/**
	 * Returns the bottom position of the battle log.
	 * @returns {Number}
	 */
	getBattleLogBottom: function () {
		// TODO: remove this top/bottom code when player frames are migrated into engine
		return this._battleLogEntriesContainer.getPositionY() - this._battleLogEntriesContainer._contentSize.height * 0.5;
	},

	/**
	 * Returns the top position of the battle log.
	 * @returns {Number}
	 */
	getBattleLogTop: function () {
		// TODO: remove this top/bottom code when player frames are migrated into engine
		return this._battleLogEntriesContainer.getPositionY() + this._battleLogEntriesContainer._contentSize.height * 0.5;
	},

	/**
	 * Returns whether a step is a valid entry to the battle log.
	 * @param step
	 * @returns {Boolean}
	 */
	getIsValidEntry: function (step) {
		if (step != null) {
			if (!_.contains(this._stepsProcessed, step)) {
				var action = step.getAction();
				return action instanceof SDK.PlayCardFromHandAction || action instanceof SDK.PlaySignatureCardAction;
			}
		}
		return false;
	},

	/* endregion GETTERS / SETTERS */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		// rebuild battle log positions
		var totalEntriesHeight = CONFIG.BATTLELOG_ENTRY_SIZE * CONFIG.MAX_BATTLELOG_ENTRIES;
		this._battleLogNodePositions = [];
		var y = totalEntriesHeight;
		for (var i = 0; i < CONFIG.MAX_BATTLELOG_ENTRIES; i++) {
			this._battleLogNodePositions[i] = cc.p(CONFIG.BATTLELOG_ENTRY_SIZE * 0.5 + CONFIG.BATTLELOG_ENTRY_OFFSET.x, y + CONFIG.BATTLELOG_ENTRY_OFFSET.y);
			y -= CONFIG.BATTLELOG_ENTRY_SIZE;
		}

		// reposition battle log frame
		this._battleLogEntriesContainer.setPosition(this.getBattleLogX(), this.getBattleLogY());

		// reposition battle log nodes
		this._updateBattleLogNodesPositions();
	},

	_updateBattleLogNodesPositions: function() {
		var battleLogNodes = this._battleLogNodesInUse;
		for(var i = 0, il = Math.min(battleLogNodes.length, CONFIG.MAX_BATTLELOG_ENTRIES); i < il; i++) {
			battleLogNodes[i].setPosition(this._battleLogNodePositions[i]);
		}
	},

	/* endregion LAYOUT */

	/* region EXPAND / COLLAPSE */

	collapse: function (animationDuration) {
		if (animationDuration == null || !this._expanded) { animationDuration = 0.0; }
		if (this._expanded) {
			audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_battlelog_close.audio, CONFIG.SELECT_SFX_PRIORITY);
		}
		this._expanded = false;

		// switch buttons
		this._expandButton.setVisible(true);
		this._collapseButton.setVisible(false);

		// get target position
		var targetPosition = cc.p(this.getBattleLogX(), this.getBattleLogY());

		// animate
		if (animationDuration > 0.0) {
			var moveAction = cc.moveTo(animationDuration, targetPosition).easing(cc.easeOut(3.0));
			moveAction.setTag(CONFIG.MOVE_TAG);
			this._battleLogEntriesContainer.runAction(moveAction);
		} else {
			this._battleLogEntriesContainer.setPosition(targetPosition);
		}
	},

	expand: function (animationDuration) {
		if (animationDuration == null || this._expanded) { animationDuration = 0.0; }
		if (!this._expanded) {
			audio_engine.current().play_effect_for_interaction(RSX.sfx_ui_battlelog_open.audio, CONFIG.SELECT_SFX_PRIORITY);
		}
		this._expanded = true;

		// switch buttons
		this._expandButton.setVisible(false);
		this._collapseButton.setVisible(true);

		// get target position
		var targetPosition = cc.p(this.getBattleLogX(), this.getBattleLogY());

		// set target position immediately
		this._battleLogEntriesContainer.setPosition(targetPosition);
	},

	toggle: function (animationDuration) {
		if (this._expanded) {
			this.collapse(animationDuration);
		} else {
			this.expand(animationDuration);
		}
	},

	/* endregion EXPAND / COLLAPSE */

	/* region STEPS */

	/**
	 * Binds the battle log instantly to the current game session state.
	 */
	bindToGameSession: function () {
		var gameSession = SDK.GameSession.getInstance();

		// clear queue
		this._stepsProcessed = [];

		// clear all nodes
		for (var i = 0, il = this._battleLogNodes.length; i < il; i++) {
			var battleLogNode = this._battleLogNodes[i];
			battleLogNode.setStep(null);
			battleLogNode.setVisible(false);
		}

		// return all nodes to pool
		this._battleLogNodesPool = this._battleLogNodes.slice(0);
		this._battleLogNodesInUse = [];

		// get max number of recent steps
		var stepsForLog = [];
		var turns = [].concat(gameSession.getTurns(), gameSession.getCurrentTurn());
		for (var i = turns.length - 1; i >= 0; i--) {
			var turn = turns[i];
			var steps = turn.getSteps();
			for (var j = steps.length - 1; j >= 0; j--) {
				var step = steps[j];
				// gather entries until max found
				if (this.getIsValidEntry(step)) {
					stepsForLog.unshift(step);
				}
				if (stepsForLog.length >= CONFIG.MAX_BATTLELOG_ENTRIES) { break; }
			}
			if (stepsForLog.length >= CONFIG.MAX_BATTLELOG_ENTRIES) { break; }
		}

		// add all steps as entries
		for (var i = 0, il = stepsForLog.length; i < il; i++) {
			this._addStep(stepsForLog[i]);
		}

		// update positions of all nodes
		this._updateBattleLogNodesPositions();
	},

	/**
	 * Shows an entry in the battle log from a step.
	 * @param step
	 */
	showEntry: function (step) {
		var showEntryPromise;

		if (this.getIsValidEntry(step)) {
			// record step as processed
			this._stepsProcessed.push(step);

			// show step
			showEntryPromise = new Promise(function (resolve, reject) {
				var battleLogNodes = this._battleLogNodesInUse;
				var battleLogNodesPositions = this._battleLogNodePositions;
				var animateNextPromises = [];
				// get next node
				var nextBattleLogNode = this._shiftToNextBattleLogNode();

				// animate oldest node out as needed
				var oldestBattleLogNode;
				if (battleLogNodes.length > CONFIG.MAX_BATTLELOG_ENTRIES) {
					oldestBattleLogNode = battleLogNodes[battleLogNodes.length - 1];
					if (oldestBattleLogNode != null && !oldestBattleLogNode.getIsEmpty()) {
						animateNextPromises.push(oldestBattleLogNode.showOut(battleLogNodesPositions[battleLogNodesPositions.length - 1]).then(function () {
							oldestBattleLogNode.setVisible(false);
						}.bind(this)))
					}
				}

				// store the step
				nextBattleLogNode.setStep(step);

				// animate next node in
				nextBattleLogNode.setVisible(true);
				animateNextPromises.push(nextBattleLogNode.showIn(battleLogNodesPositions[0]));

				// animate other nodes to next position
				for (var i = 1, il = battleLogNodes.length; i < il; i++) {
					var battleLogNode = battleLogNodes[i];
					if (battleLogNode !== nextBattleLogNode && battleLogNode !== oldestBattleLogNode) {
						animateNextPromises.push(battleLogNode.showMoveToNext(battleLogNodesPositions[i]));
					}
				}

				Promise.all(animateNextPromises).then(function () {
					// update positions
					this._updateBattleLogNodesPositions();

					resolve();
				}.bind(this));
			}.bind(this));
		}

		return showEntryPromise || Promise.resolve();
	},

	/**
	 * Adds an entry immediately to the battle log from a step.
	 */
	_addStep: function (step) {
		if (step != null) {
			// record step as procesed
			this._stepsProcessed.push(step);

			// add step to player's next node
			var nextBattleLogNode = this._shiftToNextBattleLogNode();
			if (nextBattleLogNode != null) {
				nextBattleLogNode.setStep(step);
				nextBattleLogNode.setVisible(true);
			}
		}
	},

	_shiftToNextBattleLogNode: function () {
		var nextBattleLogNode;
		if (this._battleLogNodesInUse.length < CONFIG.MAX_BATTLELOG_ENTRIES + 1) {
			// new node is next
			nextBattleLogNode = this._battleLogNodesPool.pop();
		} else {
			// oldest node is next
			nextBattleLogNode = this._battleLogNodesInUse.pop();
		}
		this._battleLogNodesInUse.unshift(nextBattleLogNode);
		return nextBattleLogNode;
	},

	/* endregion STEPS */

	/* region EVENTS */

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
		}
	},

	onPointerMove: function (event) {
		if (event && event.isStopped) {
			return;
		}

		var mouseOverBattleLogNode;
		if (CONFIG.showBattleLog && this.isVisible()) {
			var location = event && event.getLocation();
			if (location) {
				var scene = this.getScene();
				var gameLayer = scene != null && scene.getGameLayer();
				var myPlayer = gameLayer != null && gameLayer.getMyPlayer();
				if (myPlayer != null && !myPlayer.getFollowupCard()) {
					// hover self
					if (UtilsEngine.getNodeUnderMouse(this._battleLogEntriesContainer, location.x, location.y)) {
						// hover battle log nodes
						if (this._expanded) {
							for (var i = 0, il = this._battleLogNodes.length; i < il; i++) {
								var battleLogNode = this._battleLogNodes[i];
								if (UtilsEngine.getNodeUnderMouse(battleLogNode, location.x, location.y)) {
									mouseOverBattleLogNode = battleLogNode;
									event.stopPropagation();
									break;
								}
							}
						}
					}
				}
			}
		}

		this.setMouseOverBattleLogNode(mouseOverBattleLogNode);
	},

	getMouseOverBattleLogNode: function () {
		return this._mouseOverBattleLogNode;
	},

	setMouseOverBattleLogNode: function (battleLogNode) {
		var scene = this.getScene();
		var gameLayer = scene != null && scene.getGameLayer();
		if (gameLayer != null) {
			if (this._mouseOverBattleLogNode != battleLogNode) {
				if (this._mouseOverBattleLogNode != null) {
					this._mouseOverBattleLogNode.setHighlighted(false);
					this._mouseOverBattleLogNode = null;
					if (battleLogNode == null) {
						gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, {type: EVENTS.game_hover_changed, hover: null});
					}
				}

				if (battleLogNode != null) {
					this._mouseOverBattleLogNode = battleLogNode;

					// play sound
					audio_engine.current().play_effect(RSX.sfx_ui_in_game_hover.audio);

					// highlight
					this._mouseOverBattleLogNode.setHighlighted(true);

					gameLayer.getEventBus().trigger(EVENTS.game_hover_changed, {type: EVENTS.game_hover_changed, hover: this._mouseOverBattleLogNode});
				}
			}
		}
	},

	onPointerUp: function (event) {
		if (event && event.isStopped) {
			return;
		}

		if (CONFIG.showBattleLog && this.isVisible()) {
			var location = event && event.getLocation();
			if (location) {
				var scene = this.getScene();
				var gameLayer = scene != null && scene.getGameLayer();
				var myPlayer = gameLayer != null && gameLayer.getMyPlayer();
				if (myPlayer != null && !myPlayer.getIsTakingSelectionAction()) {
					// clear current mouse over
					this.setMouseOverBattleLogNode(null);

					// click self to toggle
					if (UtilsEngine.getNodeUnderMouse(this._battleLogEntriesContainer, location.x, location.y)) {
						this.toggle(CONFIG.ANIMATE_FAST_DURATION);
						event.stopPropagation();
					}
				}
			}
		}
	}

	/* endregion EVENTS */

});

BattleLog.create = function(layer) {
	return BaseLayer.create(layer || new BattleLog());
};

module.exports = BattleLog;
