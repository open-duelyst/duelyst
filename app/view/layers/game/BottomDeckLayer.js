//pragma PKGS: game
var RSX = require('app/data/resources');
var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var SDK = require('app/sdk');
var Promise = require("bluebird");
var UtilsEngine = require('app/common/utils/utils_engine');
var BaseLayer = require('./../BaseLayer');
var BaseSprite = require('./../../nodes/BaseSprite');
var ReplaceNode = require('./../../nodes/cards/ReplaceNode');
var BaseParticleSystem = require('./../../nodes/BaseParticleSystem');
var BottomDeckCardNode = require('./../../nodes/cards/BottomDeckCardNode');
var CardNode = require('./../../nodes/cards/CardNode');

/****************************************************************************
 BottomDeckLayer
 ****************************************************************************/

var BottomDeckLayer = BaseLayer.extend({

	_backgroundFrameSprite:null,
	_replaceNode: null,
	_status: null,
	_statusPromises: null,
	_waitingForStatus: null,

	cardNodes: null,

	/* region INITIALIZE */

	ctor: function () {

		// initialize properties that may be required in init
		this.cardNodes = [];
		this._waitingForStatus = {};

		// layer for cards in hand
		this._handLayer = BaseLayer.create();

		// node used to replace cards
		this._replaceNode = ReplaceNode.create();
		this._replaceNode.setOpacity(0.0);

		// background behind cards
		this._backgroundFrameSprite = BaseSprite.create(RSX.img_bottom_deck_panel_background.img);
		this._backgroundFrameSprite.setOpacity(200);
		this._backgroundFrameSprite.setAnchorPoint(cc.p(0.5, 0.0));

		// create card nodes
		for(var i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
			var cardNode = BottomDeckCardNode.create();
			this.cardNodes.push(cardNode);
		}

		// do super ctor
		this._super();

		// add nodes
		this.addChild(this._backgroundFrameSprite, -1);
		this.addChild(this._handLayer);
		this._handLayer.addChild(this._replaceNode);
	},

	terminate: function () {
		this.setStatus(BottomDeckLayer.STATUS.DISABLED);
		BaseLayer.prototype.terminate.call(this);
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
		var winRect = UtilsEngine.getGSIWinRect();
		var cardsStartPosition = UtilsEngine.getCardsInHandStartPosition();

		// background
		if (this._backgroundFrameSprite != null) {
			this._backgroundFrameSprite.setScale(UtilsEngine.getWindowWidthRelativeNodeScale(this._backgroundFrameSprite));
			this._backgroundFrameSprite.setPosition(winCenterPosition.x, winRect.y);
		}

		// replace node
		if (this._replaceNode != null) {
			var replacePosition = cc.p(cardsStartPosition.x - CONFIG.HAND_CARD_SIZE - 15.0, cardsStartPosition.y + 15.0);
			this._replaceNode.setPosition(replacePosition);
		}

		// card nodes
		if (SDK.GameSession.getInstance().isNew()) {
			this._updateCardsLayoutForStartingHand();
		} else {
			this._updateCardsLayoutForActiveGame();
		}
	},

	_updateCardsLayoutForStartingHand: function () {
		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
		var cardNodes = this.getCardNodes();
		var numCards = CONFIG.STARTING_HAND_SIZE;
		var cardsStartPosition = cc.p(winCenterPosition.x - (CONFIG.HAND_CARD_SIZE * (numCards - 1)) * 0.5, winCenterPosition.y);
		for(var i = 0; i < numCards; i++) {
			var cardNode = cardNodes[i];
			if (cardNode != null) {
				var cardPosition = cc.p(cardsStartPosition.x + CONFIG.HAND_CARD_SIZE * i, cardsStartPosition.y);
				cardNode.stopActionByTag(CONFIG.CARD_TAG);
				cardNode.setOpacity(255.0);
				cardNode.setPosition(cardPosition);
			}
		}
	},

	_updateCardsLayoutForActiveGame: function () {
		var cardNodes = this.getCardNodes();
		var numCards = CONFIG.MAX_HAND_SIZE;
		var cardsStartPosition = UtilsEngine.getCardsInHandStartPosition();
		var cardsEndPosition = UtilsEngine.getCardsInHandEndPosition();
		var dx = (cardsEndPosition.x - cardsStartPosition.x) / (numCards - 0.25);
		for(var i = 0; i < numCards; i++) {
			var cardNode = cardNodes[i];
			if (cardNode != null) {
				var cardPosition = cc.p(cardsStartPosition.x + CONFIG.HAND_CARD_SIZE * 0.125 + dx * i, cardsStartPosition.y);
				cardNode.stopActionByTag(CONFIG.CARD_TAG);
				cardNode.setOpacity(255.0);
				cardNode.setPosition(cardPosition);
			}
		}
	},

	/* endregion LAYOUT */

	/* region GETTERS / SETTERS */

	getCardNodes: function () {
		return this.cardNodes;
	},

	getCardNodeByHandIndex: function (indexInHand) {
		return this.cardNodes[indexInHand];
	},

	getReplaceNode: function () {
		return this._replaceNode;
	},

	/* endregion GETTERS / SETTERS */

	/* region EVENTS */

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer) {
			gameLayer.getEventBus().on(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
			gameLayer.getEventBus().on(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		var gameLayer = scene && scene.getGameLayer();
		if (gameLayer) {
			gameLayer.getEventBus().off(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
			gameLayer.getEventBus().off(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);
		}
	},

	/* endregion EVENTS  */

	/* region STATUS */

	/**
	 * Sets status, but only if the new status is an advancement over the last.
	 * @param {Int} status
	 * @see BottomDeckLayer.STATUS
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

	getStatus: function() {
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

	getIsActive: function () {
		return this._status === BottomDeckLayer.STATUS.ACTIVE;
	},

	getIsDisabled: function () {
		return this._status == null || this._status === BottomDeckLayer.STATUS.DISABLED;
	},

	/* endregion STATUS  */

	/* region MULLIGAN */

	showHandLayer: function (animationDuration) {
		this._handLayer.fadeTo(animationDuration, 255);
	},

	hideHandLayer: function (animationDuration) {
		this._handLayer.fadeToInvisible(animationDuration);
	},

	/**
	 * Helper function to make sure all card nodes are added to the hand layer and positioned on screen.
	 */
	_prepareCardsForStartingHand: function () {
		this.showHandLayer();

		// ensure card is added
		var cardNodes = this.getCardNodes();
		var numCards = CONFIG.STARTING_HAND_SIZE;
		for(var i = 0; i < numCards; i++) {
			var cardNode = cardNodes[i];
			if(!cardNode.isRunning()) {
				this._handLayer.addChild(cardNode, 1);
			}
		}

		this._updateCardsLayoutForStartingHand();
	},

	/***
	 * Shows the choices for the starting hand and mulligan.
	 */
	showChooseHand: function () {
		return new Promise(function (resolve, reject) {
			this._prepareCardsForStartingHand();

			// show cards
			var cardNodes = this.getCardNodes();
			var numCards = CONFIG.STARTING_HAND_SIZE;
			var showDelay = 0.0;
			for(var i = 0; i < numCards; i++) {
				var cardNode = cardNodes[i];
				cardNode.setSdkCardFromHandIndex(i);
				cardNode.stopAnimations();

				showDelay += CONFIG.STAGGER_MEDIUM_DELAY;

				// fade in after delay
				cardNode.setOpacity(0.0);
				var fadeAction = cc.sequence(
					cc.delayTime(showDelay),
					cc.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255).easing(cc.easeExponentialIn())
				);
				cardNode.addAnimationAction(fadeAction);
				cardNode.runAction(fadeAction);
			}

			// delay and then resolve
			this.runAction(cc.sequence(
				cc.delayTime(showDelay + 0.5),
				cc.callFunc(function () {
					resolve();
				})
			));
		}.bind(this));
	},

	/***
	 * Shows the starting hand being drawn.
	 */
	showDrawStartingHand: function(mulliganIndices) {
		return new Promise(function (resolve, reject) {
			this._prepareCardsForStartingHand();

			var showDelay = 0.0;
			var cardNodes = this.getCardNodes();
			var mulliganedCardNodes = [];
			for(var i = 0, il = mulliganIndices.length; i < il; i++) {
				var cardIndex = mulliganIndices[i];
				var cardNode = cardNodes[cardIndex];
				if (cardNode != null) {
					// show card being drawn
					cardNode.setOpacity(255.0);
					showDelay += cardNode.showDraw(cardIndex, showDelay) * 0.5;

					// remember card
					mulliganedCardNodes.push(cardNode);
				}
			}

			// reset all kept cards
			var keepCardNodes = _.difference(cardNodes, mulliganedCardNodes);
			for(var i = 0, il = keepCardNodes.length; i < il; i++) {
				var cardNode = keepCardNodes[i];
				cardNode.resetHighlightAndSelection();
			}

			// delay and then resolve
			this.runAction(cc.sequence(
				cc.delayTime(showDelay),
				cc.callFunc(function () {
					resolve();
				})
			));
		}.bind(this));
	},

	/***
	 * Shows the starting hand without any draw card animations.
	 */
	showStartingHand: function () {
		this._prepareCardsForStartingHand();
		this.bindHand();

		// force usability/highlight/selection reset
		this.bindHandUsabilityHighlightSelection();
	},

	/***
	 * Shows the current active hand after drawing the starting hand.
	 */
	showActiveHand: function () {
		var cardNodes = this.getCardNodes();
		var numCards = cardNodes.length;
		// card spacing assumes # cards + discard node + end turn
		var cardsStartPosition = UtilsEngine.getCardsInHandStartPosition();
		var cardsEndPosition = UtilsEngine.getCardsInHandEndPosition();
		var dx = (cardsEndPosition.x - cardsStartPosition.x) / (numCards - 0.25);

		// card nodes
		var showDelay = 0.0;
		for(var i = 0; i < numCards; i++) {
			var cardPosition = cc.p(cardsStartPosition.x + CONFIG.HAND_CARD_SIZE * 0.125 + dx * i, cardsStartPosition.y);
			showDelay += CONFIG.STAGGER_MEDIUM_DELAY;
			this._showActiveCard(i, cardPosition, showDelay)
		}

		// delay a little extra then set as active
		if (SDK.GameSession.getInstance().getIsDeveloperMode()) {
			showDelay = 0.0;
		} else {
			showDelay += CONFIG.MOVE_SLOW_DURATION * 0.5;
		}
		this.runAction(cc.sequence(
			cc.delayTime(showDelay),
			cc.callFunc(function () {
				// replace node
				if (!this._replaceNode.getIsDisabled()) {
					this._replaceNode.setOpacity(0.0);
					this._replaceNode.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
				}

				// set active
				this.setStatus(BottomDeckLayer.STATUS.ACTIVE);
			}.bind(this))
		));
	},

	_showActiveCard: function (i, cardPosition, showDelay) {
		var cardNode = this.getCardNodes()[i];
		if (cardNode) {
			cardNode.setSdkCardFromHandIndex(i);
			cardNode.stopAnimations();

			if(!cardNode.isRunning()) {
				// if cards haven't been added
				// set position immediately
				cardNode.setPosition(cardPosition);
				this._handLayer.addChild(cardNode, 1);
				if (SDK.GameSession.getInstance().getIsDeveloperMode()) {
					// fade in immediately
					cardNode.setOpacity(255.0);
				} else {
					// fade in after delay
					cardNode.setOpacity(0.0);
					var showActiveCardAction = cc.sequence(
						cc.delayTime((showDelay || 0) + CONFIG.MOVE_SLOW_DURATION * 0.25),
						cc.fadeTo(CONFIG.FADE_SLOW_DURATION, 255.0)
					);
					cardNode.addAnimationAction(showActiveCardAction);
					cardNode.runAction(showActiveCardAction);
				}
			} else {
				cardNode.setOpacity(255.0);
				// move cards to active position
			  var showActiveCardAction = cc.sequence(
				  cc.delayTime(showDelay || 0),
				  cc.moveTo(CONFIG.MOVE_SLOW_DURATION, cardPosition).easing(cc.easeExponentialOut())
			  );
				cardNode.addAnimationAction(showActiveCardAction);
				cardNode.runAction(showActiveCardAction);
			}
		}
	},

	/* endregion MULLIGAN */

	/* region DRAW */

	/***
	 * Shows a card being drawn into hand based on an action.
	 * @param {SDK.PutCardInHandAction} action
	 */
	showDrawCard: function (action) {
		var showDuration = 0.0;

		if (action instanceof SDK.PutCardInHandAction) {
			// show card actions for my player only
			var scene = this.getScene();
			var gameLayer = scene && scene.getGameLayer();
			if (gameLayer != null && gameLayer.getMyPlayerId() === action.getOwnerId()) {
				var indexOfCardInHand = action.getIndexOfCardInHand();
				var cardNode = this.cardNodes[indexOfCardInHand];
				if (cardNode instanceof BottomDeckCardNode) {
					showDuration = cardNode.showDraw(indexOfCardInHand);
				}
			}
		}

		return showDuration;
	},

	/***
	 * Shows animation for a card being removed from hand at index.
	 * @param {Number} indexOfCardInHand
	 */
	showRemoveCard: function (indexOfCardInHand) {
		var showDuration = 0.0;

		if (indexOfCardInHand != null) {
			var cardNode = this.cardNodes[indexOfCardInHand];
			if (cardNode instanceof BottomDeckCardNode && cardNode.getSdkCard() != null) {
				showDuration = cardNode.showRemove();
			}
		}

		return showDuration;
	},

	/* endregion DRAW */

	/* region EVENTS */

	onGameFollowupCardStart: function (event) {
		if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
			this.unbindHand();
			this.hideHandLayer();
		}
	},

	onGameFollowupCardStop: function (event) {
		if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
			this.bindHand();
			this.showHandLayer(CONFIG.VIEW_TRANSITION_DURATION);
		}
	},

	/* endregion EVENTS */

	/* region BINDING */

	/***
	 * Binds this view to the current deck as set in the model (SDK layer). Immediately will update all card slots to show the current state.
	 */
	bindHand:function (cardFadeDuration) {
		var cardNodes = this.getCardNodes();
		for(var i = 0, il = cardNodes.length; i < il; i++ ) {
			this.bindCardNodeAtIndex(i, cardFadeDuration);
		}
	},

	/***
	 * Unbinds this view from the current deck as set in the model (SDK layer). Immediately will update all card slots to show as empty.
	 */
	unbindHand: function () {
		var cardNodes = this.getCardNodes();
		for(var i = 0, il = cardNodes.length; i < il; i++ ) {
			this.unbindCardNodeAtIndex(i);
		}
	},

	/***
	 * Binds a card slot from the current deck as set in the model (SDK layer). Immediately will update card slot to show current state.
	 */
	bindCardNodeAtIndex: function (i, cardFadeDuration) {
		var cardNode = this.getCardNodes()[i];
		if (cardNode && !cardNode.getActionByTag(CONFIG.CARD_TAG)) {
			cardNode.setSdkCardFromHandIndex(i, cardFadeDuration);
		}
	},

	/***
	 * Unbinds a card slot from the current deck as set in the model (SDK layer). Immediately will update card slot to show as empty.
	 */
	unbindCardNodeAtIndex:function (i) {
		var cardNode = this.getCardNodes()[i];
		if (cardNode) {
			cardNode.setSdkCardFromHandIndex(null);
		}
	},

	/***
	 * Binds the usability of the hand from the current deck as set in the model (SDK layer). Immediately will update all cards to show mana cost and whether can be used.
	 */
	bindHandUsability:function() {
		var cardNodes = this.getCardNodes();
		for(var i = 0, il = cardNodes.length; i < il; i++ ) {
			cardNodes[i].updateUsability();
		}
	},

	/***
	 * Binds the usability, highlight, and selection states of the hand from the current deck as set in the model (SDK layer). Immediately will reset all cards and remove highlights/selections.
	 */
	bindHandUsabilityHighlightSelection:function() {
		var cardNodes = this.getCardNodes();
		for(var i = 0, il = cardNodes.length; i < il; i++ ) {
			cardNodes[i].resetHighlightAndSelection();
		}
	}

	/* endregion BINDING */

});

BottomDeckLayer.STATUS = {
	ACTIVE: 1,
	DISABLED: 2
};

BottomDeckLayer.create = function(layer) {
	return BaseLayer.create(layer || new BottomDeckLayer());
};


module.exports = BottomDeckLayer;
