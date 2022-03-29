//pragma PKGS: rift
var CONFIG = require('app/common/config');
var EVENTS = require("./../../../common/event_types");
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var RSX = require("app/data/resources");
var UtilsEngine = require('app/common/utils/utils_engine');
var BaseLayer = require("./../BaseLayer");
var BaseParticleSystem = require("./../../nodes/BaseParticleSystem");
var BaseSprite = require('./../../nodes/BaseSprite');
var BottomDeckCardNode = require('./../../nodes/cards/BottomDeckCardNode');
var CardNode = require('./../../nodes/cards/CardNode');
var ZodiacNode = require('./../../nodes/draw/Zodiac');
var TweenTypes = require('./../../actions/TweenTypes');
var ToneCurve = require('./../../actions/ToneCurve');
var Shake = require('./../../actions/Shake');
var audio_engine = require("./../../../audio/audio_engine");
var Promise = require("bluebird");
var UnitNode = require("./../../nodes/cards/UnitNode");
var i18next = require("i18next");

/****************************************************************************
 DeckLayer
 ****************************************************************************/

var SelectCardFromDeckLayer = BaseLayer.extend({

	cards:null,
	cardCounts:null,
	_cardNodes: null,
	_cardNodesTotalHeight: 0,
	cardNodesSpacing: 5,
	_cardNodesOffsetMin: 0,
	_cardNodesOffsetMax: 0,
	_cardNodesOffsetY: 200,
	_cardNodesOffsetX: 200,

	delegate:null,
	_currentlyHighlightedCardNode:null,
	_cardPreviewNode:null,

	titleLabel:null,

	/* region INITIALIZE */

	ctor:function () {
		this.cards = [];
		this.cardCounts = {};
		this._cardNodes = [];

		this._cardPreviewNode = new CardNode();
		this._cardPreviewNode.setVisible(false);
		this._cardPreviewNode.setAnchorPoint(0, 0.5);
		this._cardPreviewNode.setPosition(-280,0);

		var winSize = UtilsEngine.getGSIWinSize()
		this.titleLabel = new cc.LabelTTF(i18next.t("rift.select_card_to_upgrade_message"), RSX.font_bold.name, 20, cc.size(winSize.width,32), cc.TEXT_ALIGNMENT_CENTER);
		this.titleLabel.setPosition(0,-50);
		this.titleLabel.setFontFillColor(cc.color(255, 255, 255));

		// do super ctor
		this._super();

		this.addChild(this._cardPreviewNode,1);
		this.addChild(this.titleLabel);
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		BaseLayer.prototype.onResize.apply(this, arguments);
		var winSize = UtilsEngine.getGSIWinSize()
		this.titleLabel.setPosition(0,50);

		this.repositionCardNodes();
		this._cardPreviewNode.setVisible(false);
	},

	repositionCardNodes: function (duration) {
		return this._updateCardNodesPositions(duration);
	},

	_updateCardNodesPositions: function (duration) {
		var offsetY = -this._cardNodesOffsetY;
		var offsetX = this._cardNodesOffsetX;
		var actions = []
		var winSize = UtilsEngine.getGSIWinSize()

		for (var i = 0, il = this._cardNodes.length; i < il; i++) {
			var cardNode = this._cardNodes[i];
			if (duration) {
				if (cardNode.getPosition().y != offsetY) {
					actions.push(cc.targetedAction(cardNode,cc.moveTo(duration,cc.p(offsetX,offsetY))))
				}
			} else {
				cardNode.setPosition(offsetX, offsetY);
			}
			offsetX += cardNode.getContentSize().width + this.cardNodesSpacing;
			if (offsetX + cardNode.getContentSize().width/2 + this._cardNodesOffsetX > winSize.width) {
				offsetX = this._cardNodesOffsetX;
				offsetY -= cardNode.getContentSize().height + this.cardNodesSpacing;
			}
		}

		if (this._cardNodes.length && duration) {
			return new Promise(function(resolve){
				this.runAction(cc.sequence(
					cc.spawn(actions),
					cc.callFunc(function(){
						resolve()
					})
				))
			}.bind(this))
		} else {
			return Promise.resolve()
		}
	},

	/* endregion LAYOUT */

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

	onPointerMove: function(event){
		if (event && event.isStopped) {
			return;
		}

		// intersect nodes
		var mouseOverCardNode;
		var location = event && event.getLocation();
		if (location) {
			for (var i = 0; i < this._cardNodes.length; i++) {
				var cardNode = this._cardNodes[i];
				if (UtilsEngine.getNodeUnderMouse(cardNode, location.x, location.y)) {
					mouseOverCardNode = cardNode;
					event.stopPropagation();
					break;
				}
			}
		}
		this.highlightCardNode(mouseOverCardNode);
	},

	onPointerUp: function(event){
		if (event && event.isStopped) {
			return;
		}

		// intersect nodes
		var mouseOverCardNode;
		var location = event && event.getLocation();
		if (location) {
			for (var i = 0; i < this._cardNodes.length; i++) {
				var cardNode = this._cardNodes[i];
				if (UtilsEngine.getNodeUnderMouse(cardNode, location.x, location.y)) {
					mouseOverCardNode = cardNode;
					event.stopPropagation();
					break;
				}
			}
		}
		if (mouseOverCardNode) {
			this.delegate.selectCardFromDeck(mouseOverCardNode.sdkCard);
		}
	},

	highlightCardNode: function (cardNode) {
		if (this._currentlyHighlightedCardNode != cardNode) {
			// set card node
			if (this._currentlyHighlightedCardNode) {
				this._currentlyHighlightedCardNode.setHighlighted(false)
			}
			this._currentlyHighlightedCardNode = cardNode;

			// update preview
			if (this._currentlyHighlightedCardNode == null) {
				// no card, just hide preview
				var fadeAction = cc.sequence(
					cc.delayTime(0.1),
					cc.fadeOut(0.1),
					cc.hide()
				);
				this._cardPreviewNode.addAnimationAction(fadeAction);
				this._cardPreviewNode.runAction(fadeAction);
			} else {
				// show card preview
				this._currentlyHighlightedCardNode.setHighlighted(true)
				var sdkCard = this._currentlyHighlightedCardNode.getSdkCard();
				this._cardPreviewNode.showInspect(sdkCard, true, null, null, true, false);
				this._cardPreviewNode.setOpacity(255);
				this._cardPreviewNode.setVisible(true);

				// set y position
				var cardContentSize = this._cardPreviewNode.getCardContentSize();
				var y = UtilsEngine.getGSINodeScreenPosition(this._currentlyHighlightedCardNode).y + this._currentlyHighlightedCardNode.getContentSize().height * 0.5 - this.getPositionY();

				// make sure card doesn't go outside screen
				var top = UtilsEngine.getGSIWinHeight() - cardContentSize.height * 0.5;
				var bottom = cardContentSize.height * 0.5;

				// Math.min(top, Math.max(bottom, y))
				this._cardPreviewNode.setPosition(this._currentlyHighlightedCardNode.getPosition().x + 50,y);
			}
		}
	},

	/* endregion EVENTS */

	bindCards: function(cardIds) {
		Logger.module("ENGINE").log("DeckLayer -> bindCards", cardIds);

		this.cardCounts = _.countBy(cardIds,function(cardId) { return cardId; });

		// map card counts to cards
		var cardsPrev = this.cards || [];
		this.cards = _.map(_.keys(this.cardCounts),function(cardId) {
			cardId = parseInt(cardId);
			var card = _.find(cardsPrev,function(cardPrev) {
				return cardPrev.getId() == cardId;
			});
			if (card == null) {
				card = SDK.CardFactory.cardForIdentifier(cardId,SDK.GameSession.getInstance());
			}
			return card;
		}.bind(this));

		// reset total card nodes height
		this._cardNodesTotalHeight = this.cardNodesSpacing;

		// get all card nodes
		// preserve previous when they match
		var cardNodesPrev = this._cardNodes || [];
		this._cardNodes = _.map(this.cards, function (sdkCard) {
			// try to reuse previous card
			var cardNode = _.find(cardNodesPrev,function(cardNodePrev) {
				return cardNodePrev.getSdkCard() == sdkCard;
			});
			var count = this.cardCounts[sdkCard.getId()];
			if (cardNode == null) {
				// no match exists, create new
				cardNode = BottomDeckCardNode.create();
				cardNode.setSdkCard(sdkCard);
				// cardNode.setAnchorPoint(0, 1);
				this.addChild(cardNode,0);
			} else {
				// update counts of existing
				// cardNode.setCount(count);
			}

			// update total height
			this._cardNodesTotalHeight += cardNode.getContentSize().height + this.cardNodesSpacing;

			return cardNode;
		}.bind(this));

		// destroy any old unused card nodes
		var cardNodesUnused = _.difference(cardNodesPrev, this._cardNodes);
		_.each(cardNodesUnused, function (cardNode) {
			cardNode.destroy();
		});

		// sort card nodes by card mana cost
		this._cardNodes = _.sortBy(this._cardNodes, function(cardNode) {
			if (cardNode.getSdkCard().isGeneral) {
				// Put generals first
				return -1;
			}
			return cardNode.getSdkCard().getManaCost();
		});

		// update card nodes layout
		this.repositionCardNodes();
	},

	/* region TRANSITION */

	transitionIn: function() {
		return new Promise(function(resolve,reject){
			this.setOpacity(0.0);
			this.runAction(cc.sequence(
				cc.fadeIn(CONFIG.FADE_FAST_DURATION),
				cc.callFunc(function(){
					resolve();
				})
			));
		}.bind(this));
	},

	transitionOut: function() {
		return new Promise(function(resolve,reject){
			this.runAction(cc.sequence(
				cc.fadeOut(CONFIG.FADE_FAST_DURATION),
				cc.callFunc(function(){
					resolve();
				})
			));
		}.bind(this));
	}

	/* endregion TRANSITION */

});

SelectCardFromDeckLayer.create = function(layer) {
	return BaseLayer.create(layer || new SelectCardFromDeckLayer());
};

module.exports = SelectCardFromDeckLayer;
