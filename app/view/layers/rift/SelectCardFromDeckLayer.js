// pragma PKGS: rift
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const i18next = require('i18next');
const EVENTS = require('../../../common/event_types');
const BaseLayer = require('../BaseLayer');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BaseSprite = require('../../nodes/BaseSprite');
const BottomDeckCardNode = require('../../nodes/cards/BottomDeckCardNode');
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

const SelectCardFromDeckLayer = BaseLayer.extend({

  cards: null,
  cardCounts: null,
  _cardNodes: null,
  _cardNodesTotalHeight: 0,
  cardNodesSpacing: 5,
  _cardNodesOffsetMin: 0,
  _cardNodesOffsetMax: 0,
  _cardNodesOffsetY: 200,
  _cardNodesOffsetX: 200,

  delegate: null,
  _currentlyHighlightedCardNode: null,
  _cardPreviewNode: null,

  titleLabel: null,

  /* region INITIALIZE */

  ctor() {
    this.cards = [];
    this.cardCounts = {};
    this._cardNodes = [];

    this._cardPreviewNode = new CardNode();
    this._cardPreviewNode.setVisible(false);
    this._cardPreviewNode.setAnchorPoint(0, 0.5);
    this._cardPreviewNode.setPosition(-280, 0);

    const winSize = UtilsEngine.getGSIWinSize();
    this.titleLabel = new cc.LabelTTF(i18next.t('rift.select_card_to_upgrade_message'), RSX.font_bold.name, 20, cc.size(winSize.width, 32), cc.TEXT_ALIGNMENT_CENTER);
    this.titleLabel.setPosition(0, -50);
    this.titleLabel.setFontFillColor(cc.color(255, 255, 255));

    // do super ctor
    this._super();

    this.addChild(this._cardPreviewNode, 1);
    this.addChild(this.titleLabel);
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    BaseLayer.prototype.onResize.apply(this, arguments);
    const winSize = UtilsEngine.getGSIWinSize();
    this.titleLabel.setPosition(0, 50);

    this.repositionCardNodes();
    this._cardPreviewNode.setVisible(false);
  },

  repositionCardNodes(duration) {
    return this._updateCardNodesPositions(duration);
  },

  _updateCardNodesPositions(duration) {
    let offsetY = -this._cardNodesOffsetY;
    let offsetX = this._cardNodesOffsetX;
    const actions = [];
    const winSize = UtilsEngine.getGSIWinSize();

    for (let i = 0, il = this._cardNodes.length; i < il; i++) {
      const cardNode = this._cardNodes[i];
      if (duration) {
        if (cardNode.getPosition().y != offsetY) {
          actions.push(cc.targetedAction(cardNode, cc.moveTo(duration, cc.p(offsetX, offsetY))));
        }
      } else {
        cardNode.setPosition(offsetX, offsetY);
      }
      offsetX += cardNode.getContentSize().width + this.cardNodesSpacing;
      if (offsetX + cardNode.getContentSize().width / 2 + this._cardNodesOffsetX > winSize.width) {
        offsetX = this._cardNodesOffsetX;
        offsetY -= cardNode.getContentSize().height + this.cardNodesSpacing;
      }
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
      scene.getEventBus().on(EVENTS.pointer_up, this.onPointerUp, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    if (scene != null) {
      scene.getEventBus().off(EVENTS.pointer_move, this.onPointerMove, this);
      scene.getEventBus().off(EVENTS.pointer_up, this.onPointerUp, this);
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
      this.delegate.selectCardFromDeck(mouseOverCardNode.sdkCard);
    }
  },

  highlightCardNode(cardNode) {
    if (this._currentlyHighlightedCardNode != cardNode) {
      // set card node
      if (this._currentlyHighlightedCardNode) {
        this._currentlyHighlightedCardNode.setHighlighted(false);
      }
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
        this._currentlyHighlightedCardNode.setHighlighted(true);
        const sdkCard = this._currentlyHighlightedCardNode.getSdkCard();
        this._cardPreviewNode.showInspect(sdkCard, true, null, null, true, false);
        this._cardPreviewNode.setOpacity(255);
        this._cardPreviewNode.setVisible(true);

        // set y position
        const cardContentSize = this._cardPreviewNode.getCardContentSize();
        const y = UtilsEngine.getGSINodeScreenPosition(this._currentlyHighlightedCardNode).y + this._currentlyHighlightedCardNode.getContentSize().height * 0.5 - this.getPositionY();

        // make sure card doesn't go outside screen
        const top = UtilsEngine.getGSIWinHeight() - cardContentSize.height * 0.5;
        const bottom = cardContentSize.height * 0.5;

        // Math.min(top, Math.max(bottom, y))
        this._cardPreviewNode.setPosition(this._currentlyHighlightedCardNode.getPosition().x + 50, y);
      }
    }
  },

  /* endregion EVENTS */

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
        cardNode = BottomDeckCardNode.create();
        cardNode.setSdkCard(sdkCard);
        // cardNode.setAnchorPoint(0, 1);
        this.addChild(cardNode, 0);
      } else {
        // update counts of existing
        // cardNode.setCount(count);
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

  /* region TRANSITION */

  transitionIn() {
    return new Promise((resolve, reject) => {
      this.setOpacity(0.0);
      this.runAction(cc.sequence(
        cc.fadeIn(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  transitionOut() {
    return new Promise((resolve, reject) => {
      this.runAction(cc.sequence(
        cc.fadeOut(CONFIG.FADE_FAST_DURATION),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /* endregion TRANSITION */

});

SelectCardFromDeckLayer.create = function (layer) {
  return BaseLayer.create(layer || new SelectCardFromDeckLayer());
};

module.exports = SelectCardFromDeckLayer;
