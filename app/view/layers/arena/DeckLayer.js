//pragma PKGS: gauntlet
var CONFIG = require('app/common/config');
var EVENTS = require("./../../../common/event_types");
var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var RSX = require("app/data/resources");
var UtilsEngine = require('app/common/utils/utils_engine');
var BaseLayer = require("./../BaseLayer");
var BaseParticleSystem = require("./../../nodes/BaseParticleSystem");
var BaseSprite = require('./../../nodes/BaseSprite');
var ArenaDeckCardNode = require('./../../nodes/cards/ArenaDeckCardNode');
var CardNode = require('./../../nodes/cards/CardNode');
var ZodiacNode = require('./../../nodes/draw/Zodiac');
var TweenTypes = require('./../../actions/TweenTypes');
var ToneCurve = require('./../../actions/ToneCurve');
var Shake = require('./../../actions/Shake');
var audio_engine = require("./../../../audio/audio_engine");
var Promise = require("bluebird");
var UnitNode = require("./../../nodes/cards/UnitNode");

/****************************************************************************
 DeckLayer
 ****************************************************************************/

var DeckLayer = BaseLayer.extend({

	cards:null,
	cardCounts:null,
	_cardNodes: null,
	_cardNodesTotalHeight: 0,
	cardNodesSpacing: 5,
	_cardNodesOffsetMin: 0,
	_cardNodesOffsetMax: 0,
	_cardNodesOffset: 0,

	delegate:null,
	_currentlyHighlightedCardNode:null,
	_cardPreviewNode:null,

	/* region INITIALIZE */

	ctor:function () {
		this.cards = [];
		this.cardCounts = {};
		this._cardNodes = [];

		this._cardPreviewNode = new CardNode();
		this._cardPreviewNode.setVisible(false);
		this._cardPreviewNode.setAnchorPoint(0, 0.5);
		this._cardPreviewNode.setPosition(-280,0);

		// do super ctor
		this._super();

		this.addChild(this._cardPreviewNode);
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		BaseLayer.prototype.onResize.apply(this, arguments);

		this.repositionCardNodes();

		this._cardPreviewNode.setVisible(false);
	},

	repositionCardNodes: function () {
		this._updateCardNodesScrollRange();
		this._updateCardNodesPositions();
	},

	_updateCardNodesScrollRange: function () {
		// determine scroll range
		var globalScaleInvertedWinSize = UtilsEngine.getGSIWinSize();
		var verticalSize = globalScaleInvertedWinSize.height - this.cardNodesSpacing;
		this._cardNodesOffsetMin = verticalSize;
		this._cardNodesOffsetMax = this._cardNodesOffsetMin;
		if (this._cardNodesTotalHeight > verticalSize) {
			// can scroll
			this._cardNodesOffsetMax += (this._cardNodesTotalHeight - verticalSize);
		}

		// clamp offset as needed
		this._cardNodesOffset = Math.min(this._cardNodesOffsetMax, Math.max(this._cardNodesOffsetMin, this._cardNodesOffset));
	},

	_updateCardNodesPositions: function () {
		var offset = this._cardNodesOffset;
		for (var i = 0, il = this._cardNodes.length; i < il; i++) {
			var cardNode = this._cardNodes[i];
			cardNode.setPosition(0, offset);
			offset -= cardNode.getContentSize().height + this.cardNodesSpacing;
		}
	},

	/* endregion LAYOUT */

	/* region EVENTS */

	_startListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().on(EVENTS.pointer_wheel, this.onPointerWheel, this);
		}
	},

	_stopListeningToEvents: function () {
		this._super();

		var scene = this.getScene();
		if (scene != null) {
			scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
			scene.getEventBus().off(EVENTS.pointer_wheel, this.onPointerWheel, this);
		}
	},

	onPointerWheel: function(event) {
		if (event && event.isStopped) {
			return;
		}
		var delta = event && event.getWheelDeltaY();
		if (delta) {
			this._cardNodesOffset = Math.min(this._cardNodesOffsetMax, Math.max(this._cardNodesOffsetMin, this._cardNodesOffset + delta));
			this._updateCardNodesPositions();
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

	highlightCardNode: function (cardNode) {
		if (this._currentlyHighlightedCardNode != cardNode) {
			// set card node
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

				this._cardPreviewNode.setPositionY(Math.min(top, Math.max(bottom, y)));
			}
		}
	},

	/* endregion EVENTS */

	/* region DECK STATE */

	showDeck: function () {
		this.setVisible(true);
	},

	hideDeck: function () {
		this.setVisible(false);
	},

	getCardCountById: function (cardId) {
		return (this.cardCounts && this.cardCounts[cardId]) || 1;
	},

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
				cardNode = ArenaDeckCardNode.create(sdkCard, count);
				cardNode.setAnchorPoint(0, 1);
				this.addChild(cardNode);
			} else {
				// update counts of existing
				cardNode.setCount(count);
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

	addCard: function(cardId) {
		Logger.module("ENGINE").log("DeckLayer -> addCard", cardId);

		// update count
		var count = this.cardCounts[cardId] = (this.cardCounts[cardId] || 0) + 1;

		// try to find card node
		var cardNode = _.find(this._cardNodes, function(cardNode) {
			var sdkCard = cardNode.getSdkCard();
			if (sdkCard != null) {
				return sdkCard.getId() === cardId;
			}
		});

		if (cardNode == null) {
			// create card
			var sdkCard = SDK.CardFactory.cardForIdentifier(cardId,SDK.GameSession.getInstance());
			this.cards.push(sdkCard);

			// create card node
			cardNode = ArenaDeckCardNode.create(sdkCard, count);
			cardNode.setAnchorPoint(0, 1);
			this.addChild(cardNode);

			// store card node
			this._cardNodes.push(cardNode);

			// sort card nodes by card mana cost
			this._cardNodes = _.sortBy(this._cardNodes, function(cardNode) {
				if (cardNode.getSdkCard().isGeneral) {
					// Put generals first
					return -1;
				}
				return cardNode.getSdkCard().getManaCost();
			});

			// update total height
			this._cardNodesTotalHeight += cardNode.getContentSize().height + this.cardNodesSpacing;

			// update card nodes layout
			this.repositionCardNodes();

			// show card inserting into deck
			cardNode.showInsert();
		} else {
			// update count of existing
			cardNode.setCount(count);
		}
	}

	/* endregion DECK STATE */

});

DeckLayer.create = function(layer) {
	return BaseLayer.create(layer || new DeckLayer());
};

module.exports = DeckLayer;
