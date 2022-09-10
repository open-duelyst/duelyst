// pragma PKGS: rift
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const EVENTS = require('../../../common/event_types');
const BaseLayer = require('../BaseLayer');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const ArenaDeckCardNode = require('../../nodes/cards/ArenaDeckCardNode');
const CardNode = require('../../nodes/cards/CardNode');
const ZodiacNode = require('../../nodes/draw/Zodiac');
const TweenTypes = require('../../actions/TweenTypes');
const ToneCurve = require('../../actions/ToneCurve');
const Shake = require('../../actions/Shake');
const audio_engine = require('../../../audio/audio_engine');
const UnitNode = require('../../nodes/cards/UnitNode');

/** **************************************************************************
 DeckLayer
 *************************************************************************** */

const DeckLayer = BaseLayer.extend({

  cards: null,
  cardCounts: null,
  _cardNodes: null,
  _cardNodesTotalHeight: 0,
  cardNodesSpacing: 5,
  _cardNodesOffsetMin: 0,
  _cardNodesOffsetMax: 0,
  _cardNodesOffset: 0,

  delegate: null,
  _currentlyHighlightedCardNode: null,
  _cardPreviewNode: null,

  /* region INITIALIZE */

  ctor() {
    this.cards = [];
    this.cardCounts = {};
    this._cardNodes = [];

    this._cardPreviewNode = new CardNode();
    this._cardPreviewNode.setVisible(false);
    this._cardPreviewNode.setAnchorPoint(0, 0.5);
    this._cardPreviewNode.setPosition(-280, 0);

    // do super ctor
    this._super();

    this.addChild(this._cardPreviewNode);
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    BaseLayer.prototype.onResize.apply(this, arguments);

    this.repositionCardNodes();

    this._cardPreviewNode.setVisible(false);
  },

  repositionCardNodes(duration) {
    this._updateCardNodesScrollRange();
    return this._updateCardNodesPositions(duration);
  },

  _updateCardNodesScrollRange() {
    // determine scroll range
    const globalScaleInvertedWinSize = UtilsEngine.getGSIWinSize();
    const verticalSize = globalScaleInvertedWinSize.height - this.cardNodesSpacing;
    this._cardNodesOffsetMin = verticalSize;
    this._cardNodesOffsetMax = this._cardNodesOffsetMin;
    if (this._cardNodesTotalHeight > verticalSize) {
      // can scroll
      this._cardNodesOffsetMax += (this._cardNodesTotalHeight - verticalSize);
    }

    // clamp offset as needed
    this._cardNodesOffset = Math.min(this._cardNodesOffsetMax, Math.max(this._cardNodesOffsetMin, this._cardNodesOffset));
  },

  _updateCardNodesPositions(duration) {
    let offset = this._cardNodesOffset;
    const actions = [];
    for (let i = 0, il = this._cardNodes.length; i < il; i++) {
      const cardNode = this._cardNodes[i];
      if (duration) {
        if (cardNode.getPosition().y != offset) {
          actions.push(cc.targetedAction(cardNode, cc.moveTo(duration, cc.p(0, offset))));
        }
      } else {
        cardNode.setPosition(0, offset);
      }
      offset -= cardNode.getContentSize().height + this.cardNodesSpacing;
    }

    if (this._cardNodes.length && duration) {
      return new Promise((resolve) => {
        this.runAction(cc.sequence(
          cc.spawn(actions),
          cc.callFunc(() => {
            resolve();
          }),
        ));
      });
    }
    return Promise.resolve();
  },

  /* endregion LAYOUT */

  /* region EVENTS */

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().on(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().on(EVENTS.pointer_wheel, this.onPointerWheel, this);
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().off(EVENTS.pointer_wheel, this.onPointerWheel, this);
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  onPointerWheel(event) {
    if (event && event.isStopped) {
      return;
    }
    const delta = event && event.getWheelDeltaY();
    if (delta) {
      this._cardNodesOffset = Math.min(this._cardNodesOffsetMax, Math.max(this._cardNodesOffsetMin, this._cardNodesOffset + delta));
      this._updateCardNodesPositions();
    }
  },

  onPointerMove(event) {
    if (event && event.isStopped) {
      return;
    }

    // intersect nodes
    let mouseOverCardNode;
    const location = event && event.getLocation();
    if (location) {
      for (let i = 0; i < this._cardNodes.length; i++) {
        const cardNode = this._cardNodes[i];
        if (UtilsEngine.getNodeUnderMouse(cardNode, location.x, location.y)) {
          mouseOverCardNode = cardNode;
          event.stopPropagation();
          break;
        }
      }
    }
    this.highlightCardNode(mouseOverCardNode);
  },

  onPointerUp(event) {
    if (event && event.isStopped) {
      return;
    }

    // intersect nodes
    let mouseOverCardNode;
    const location = event && event.getLocation();
    if (location) {
      for (let i = 0; i < this._cardNodes.length; i++) {
        const cardNode = this._cardNodes[i];
        if (UtilsEngine.getNodeUnderMouse(cardNode, location.x, location.y)) {
          mouseOverCardNode = cardNode;
          event.stopPropagation();
          break;
        }
      }
    }
    if (mouseOverCardNode) {
      const mouseOverSdkCard = mouseOverCardNode.sdkCard;
      if (mouseOverSdkCard != null) {
        const isGeneralCard = SDK.CardType.getIsEntityCardType(mouseOverSdkCard.getType()) && mouseOverSdkCard.getIsGeneral();
        if (!isGeneralCard) {
          this.delegate.selectCardFromDeck(mouseOverCardNode.sdkCard);
        }
      }
    }
  },

  highlightCardNode(cardNode) {
    if (this._currentlyHighlightedCardNode != cardNode) {
      if (this._currentlyHighlightedCardNode) {
        this._currentlyHighlightedCardNode.background.stopAllActions();
        this._currentlyHighlightedCardNode.background.runAction(cc.tintTo(0.1, 255, 255, 255));
      }

      // set card node
      this._currentlyHighlightedCardNode = cardNode;

      // update preview
      if (this._currentlyHighlightedCardNode == null) {
        // no card, just hide preview
        const fadeAction = cc.sequence(
          cc.delayTime(0.1),
          cc.fadeOut(0.1),
          cc.hide(),
        );
        this._cardPreviewNode.addAnimationAction(fadeAction);
        this._cardPreviewNode.runAction(fadeAction);
      } else {
        // show card preview
        const sdkCard = this._currentlyHighlightedCardNode.getSdkCard();
        this._currentlyHighlightedCardNode.background.stopAllActions();
        this._currentlyHighlightedCardNode.background.runAction(cc.tintTo(0.1, 100, 100, 100));
        this._cardPreviewNode.showInspect(sdkCard, true, null, null, true, false);
        this._cardPreviewNode.setOpacity(255);
        this._cardPreviewNode.setVisible(true);

        // set y position
        const cardContentSize = this._cardPreviewNode.getCardContentSize();
        const y = UtilsEngine.getGSINodeScreenPosition(this._currentlyHighlightedCardNode).y + this._currentlyHighlightedCardNode.getContentSize().height * 0.5 - this.getPositionY();

        // make sure card doesn't go outside screen
        const top = UtilsEngine.getGSIWinHeight() - cardContentSize.height * 0.5;
        const bottom = cardContentSize.height * 0.5;

        this._cardPreviewNode.setPositionY(Math.min(top, Math.max(bottom, y)));
      }
    }
  },

  /* endregion EVENTS */

  /* region DECK STATE */

  showDeck() {
    this.setVisible(true);
  },

  hideDeck() {
    this.setVisible(false);
  },

  getCardCountById(cardId) {
    return (this.cardCounts && this.cardCounts[cardId]) || 1;
  },

  bindCards(cardIds) {
    Logger.module('ENGINE').log('DeckLayer -> bindCards', cardIds);

    this.cardCounts = _.countBy(cardIds, (cardId) => cardId);

    // map card counts to cards
    const cardsPrev = this.cards || [];
    this.cards = _.map(_.keys(this.cardCounts), (cardId) => {
      cardId = parseInt(cardId);
      let card = _.find(cardsPrev, (cardPrev) => cardPrev.getId() == cardId);
      if (card == null) {
        card = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
      }
      return card;
    });

    // reset total card nodes height
    this._cardNodesTotalHeight = this.cardNodesSpacing;

    // get all card nodes
    // preserve previous when they match
    const cardNodesPrev = this._cardNodes || [];
    this._cardNodes = _.map(this.cards, (sdkCard) => {
      // try to reuse previous card
      let cardNode = _.find(cardNodesPrev, (cardNodePrev) => cardNodePrev.getSdkCard() == sdkCard);
      const count = this.cardCounts[sdkCard.getId()];
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
    });

    // destroy any old unused card nodes
    const cardNodesUnused = _.difference(cardNodesPrev, this._cardNodes);
    _.each(cardNodesUnused, (cardNode) => {
      cardNode.destroy();
    });

    // sort card nodes by card mana cost
    this._cardNodes = _.sortBy(this._cardNodes, (cardNode) => {
      if (cardNode.getSdkCard().isGeneral) {
        // Put generals first
        return -1;
      }
      return cardNode.getSdkCard().getManaCost();
    });

    // update card nodes layout
    this.repositionCardNodes();
  },

  addCard(cardId) {
    Logger.module('ENGINE').log('DeckLayer -> addCard', cardId);

    // update count
    const count = this.cardCounts[cardId] = (this.cardCounts[cardId] || 0) + 1;

    // try to find card node
    let cardNode = _.find(this._cardNodes, (cardNode) => {
      const sdkCard = cardNode.getSdkCard();
      if (sdkCard != null) {
        return sdkCard.getId() === cardId;
      }
    });

    if (cardNode == null) {
      // create card
      const sdkCard = SDK.CardFactory.cardForIdentifier(cardId, SDK.GameSession.getInstance());
      this.cards.push(sdkCard);

      // create card node
      cardNode = ArenaDeckCardNode.create(sdkCard, count);
      cardNode.setAnchorPoint(0, 1);
      this.addChild(cardNode);

      // store card node
      this._cardNodes.push(cardNode);

      // sort card nodes by card mana cost
      this._cardNodes = _.sortBy(this._cardNodes, (cardNode) => {
        if (cardNode.getSdkCard().isGeneral) {
          // Put generals first
          return -1;
        }
        return cardNode.getSdkCard().getManaCost();
      });

      // update total height
      this._cardNodesTotalHeight += cardNode.getContentSize().height + this.cardNodesSpacing;

      // make node invisible
      cardNode.setOpacity(0);

      // update card nodes layout
      this.repositionCardNodes(0.2).then(() =>
        // show card inserting into deck
        cardNode.showInsert());
    } else {
      // update count of existing
      cardNode.setCount(count);
      return Promise.resolve();
    }
  },

  removeCard(cardId) {
    Logger.module('ENGINE').log('DeckLayer -> removeCard', cardId);

    // update count
    const count = this.cardCounts[cardId] = (this.cardCounts[cardId] - 1 || 0);

    // try to find card node
    const cardNode = _.find(this._cardNodes, (cardNode) => {
      const sdkCard = cardNode.getSdkCard();
      if (sdkCard != null) {
        return sdkCard.getId() === cardId;
      }
    });

    if (cardNode && count == 0) {
      // store card node
      this._cardNodes = _.without(this._cardNodes, cardNode);

      // show card removeing from deck
      return cardNode.showRemove().then(() => {
        // update total height
        this._cardNodesTotalHeight -= cardNode.getContentSize().height + this.cardNodesSpacing;
        // update card nodes layout
        return this.repositionCardNodes(0.2);
      });
    }
    // update count of existing
    cardNode.setCount(count);
    return Promise.resolve();
  },

  /* endregion DECK STATE */

});

DeckLayer.create = function (layer) {
  return BaseLayer.create(layer || new DeckLayer());
};

module.exports = DeckLayer;
