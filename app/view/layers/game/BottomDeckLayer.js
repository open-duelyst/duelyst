// pragma PKGS: game
const RSX = require('app/data/resources');
const Logger = require('app/common/logger');
const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const SDK = require('app/sdk');
const Promise = require('bluebird');
const UtilsEngine = require('app/common/utils/utils_engine');
const BaseLayer = require('../BaseLayer');
const BaseSprite = require('../../nodes/BaseSprite');
const ReplaceNode = require('../../nodes/cards/ReplaceNode');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const BottomDeckCardNode = require('../../nodes/cards/BottomDeckCardNode');
const CardNode = require('../../nodes/cards/CardNode');

/** **************************************************************************
 BottomDeckLayer
 *************************************************************************** */

var BottomDeckLayer = BaseLayer.extend({

  _backgroundFrameSprite: null,
  _replaceNode: null,
  _status: null,
  _statusPromises: null,
  _waitingForStatus: null,

  cardNodes: null,

  /* region INITIALIZE */

  ctor() {
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
    for (let i = 0; i < CONFIG.MAX_HAND_SIZE; i++) {
      const cardNode = BottomDeckCardNode.create();
      this.cardNodes.push(cardNode);
    }

    // do super ctor
    this._super();

    // add nodes
    this.addChild(this._backgroundFrameSprite, -1);
    this.addChild(this._handLayer);
    this._handLayer.addChild(this._replaceNode);
  },

  terminate() {
    this.setStatus(BottomDeckLayer.STATUS.DISABLED);
    BaseLayer.prototype.terminate.call(this);
  },

  /* endregion INITIALIZE */

  /* region LAYOUT */

  onResize() {
    this._super();

    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
    const winRect = UtilsEngine.getGSIWinRect();
    const cardsStartPosition = UtilsEngine.getCardsInHandStartPosition();

    // background
    if (this._backgroundFrameSprite != null) {
      this._backgroundFrameSprite.setScale(UtilsEngine.getWindowWidthRelativeNodeScale(this._backgroundFrameSprite));
      this._backgroundFrameSprite.setPosition(winCenterPosition.x, winRect.y);
    }

    // replace node
    if (this._replaceNode != null) {
      const replacePosition = cc.p(cardsStartPosition.x - CONFIG.HAND_CARD_SIZE - 15.0, cardsStartPosition.y + 15.0);
      this._replaceNode.setPosition(replacePosition);
    }

    // card nodes
    if (SDK.GameSession.getInstance().isNew()) {
      this._updateCardsLayoutForStartingHand();
    } else {
      this._updateCardsLayoutForActiveGame();
    }
  },

  _updateCardsLayoutForStartingHand() {
    const winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
    const cardNodes = this.getCardNodes();
    const numCards = CONFIG.STARTING_HAND_SIZE;
    const cardsStartPosition = cc.p(winCenterPosition.x - (CONFIG.HAND_CARD_SIZE * (numCards - 1)) * 0.5, winCenterPosition.y);
    for (let i = 0; i < numCards; i++) {
      const cardNode = cardNodes[i];
      if (cardNode != null) {
        const cardPosition = cc.p(cardsStartPosition.x + CONFIG.HAND_CARD_SIZE * i, cardsStartPosition.y);
        cardNode.stopActionByTag(CONFIG.CARD_TAG);
        cardNode.setOpacity(255.0);
        cardNode.setPosition(cardPosition);
      }
    }
  },

  _updateCardsLayoutForActiveGame() {
    const cardNodes = this.getCardNodes();
    const numCards = CONFIG.MAX_HAND_SIZE;
    const cardsStartPosition = UtilsEngine.getCardsInHandStartPosition();
    const cardsEndPosition = UtilsEngine.getCardsInHandEndPosition();
    const dx = (cardsEndPosition.x - cardsStartPosition.x) / (numCards - 0.25);
    for (let i = 0; i < numCards; i++) {
      const cardNode = cardNodes[i];
      if (cardNode != null) {
        const cardPosition = cc.p(cardsStartPosition.x + CONFIG.HAND_CARD_SIZE * 0.125 + dx * i, cardsStartPosition.y);
        cardNode.stopActionByTag(CONFIG.CARD_TAG);
        cardNode.setOpacity(255.0);
        cardNode.setPosition(cardPosition);
      }
    }
  },

  /* endregion LAYOUT */

  /* region GETTERS / SETTERS */

  getCardNodes() {
    return this.cardNodes;
  },

  getCardNodeByHandIndex(indexInHand) {
    return this.cardNodes[indexInHand];
  },

  getReplaceNode() {
    return this._replaceNode;
  },

  /* endregion GETTERS / SETTERS */

  /* region EVENTS */

  _startListeningToEvents() {
    this._super();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
    if (gameLayer) {
      gameLayer.getEventBus().on(EVENTS.followup_card_start, this.onGameFollowupCardStart, this);
      gameLayer.getEventBus().on(EVENTS.followup_card_stop, this.onGameFollowupCardStop, this);
    }
  },

  _stopListeningToEvents() {
    this._super();

    const scene = this.getScene();
    const gameLayer = scene && scene.getGameLayer();
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

  getIsActive() {
    return this._status === BottomDeckLayer.STATUS.ACTIVE;
  },

  getIsDisabled() {
    return this._status == null || this._status === BottomDeckLayer.STATUS.DISABLED;
  },

  /* endregion STATUS  */

  /* region MULLIGAN */

  showHandLayer(animationDuration) {
    this._handLayer.fadeTo(animationDuration, 255);
  },

  hideHandLayer(animationDuration) {
    this._handLayer.fadeToInvisible(animationDuration);
  },

  /**
   * Helper function to make sure all card nodes are added to the hand layer and positioned on screen.
   */
  _prepareCardsForStartingHand() {
    this.showHandLayer();

    // ensure card is added
    const cardNodes = this.getCardNodes();
    const numCards = CONFIG.STARTING_HAND_SIZE;
    for (let i = 0; i < numCards; i++) {
      const cardNode = cardNodes[i];
      if (!cardNode.isRunning()) {
        this._handLayer.addChild(cardNode, 1);
      }
    }

    this._updateCardsLayoutForStartingHand();
  },

  /** *
   * Shows the choices for the starting hand and mulligan.
   */
  showChooseHand() {
    return new Promise((resolve, reject) => {
      this._prepareCardsForStartingHand();

      // show cards
      const cardNodes = this.getCardNodes();
      const numCards = CONFIG.STARTING_HAND_SIZE;
      let showDelay = 0.0;
      for (let i = 0; i < numCards; i++) {
        const cardNode = cardNodes[i];
        cardNode.setSdkCardFromHandIndex(i);
        cardNode.stopAnimations();

        showDelay += CONFIG.STAGGER_MEDIUM_DELAY;

        // fade in after delay
        cardNode.setOpacity(0.0);
        const fadeAction = cc.sequence(
          cc.delayTime(showDelay),
          cc.fadeTo(CONFIG.FADE_MEDIUM_DURATION, 255).easing(cc.easeExponentialIn()),
        );
        cardNode.addAnimationAction(fadeAction);
        cardNode.runAction(fadeAction);
      }

      // delay and then resolve
      this.runAction(cc.sequence(
        cc.delayTime(showDelay + 0.5),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /** *
   * Shows the starting hand being drawn.
   */
  showDrawStartingHand(mulliganIndices) {
    return new Promise((resolve, reject) => {
      this._prepareCardsForStartingHand();

      let showDelay = 0.0;
      const cardNodes = this.getCardNodes();
      const mulliganedCardNodes = [];
      for (var i = 0, il = mulliganIndices.length; i < il; i++) {
        const cardIndex = mulliganIndices[i];
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
      const keepCardNodes = _.difference(cardNodes, mulliganedCardNodes);
      for (var i = 0, il = keepCardNodes.length; i < il; i++) {
        var cardNode = keepCardNodes[i];
        cardNode.resetHighlightAndSelection();
      }

      // delay and then resolve
      this.runAction(cc.sequence(
        cc.delayTime(showDelay),
        cc.callFunc(() => {
          resolve();
        }),
      ));
    });
  },

  /** *
   * Shows the starting hand without any draw card animations.
   */
  showStartingHand() {
    this._prepareCardsForStartingHand();
    this.bindHand();

    // force usability/highlight/selection reset
    this.bindHandUsabilityHighlightSelection();
  },

  /** *
   * Shows the current active hand after drawing the starting hand.
   */
  showActiveHand() {
    const cardNodes = this.getCardNodes();
    const numCards = cardNodes.length;
    // card spacing assumes # cards + discard node + end turn
    const cardsStartPosition = UtilsEngine.getCardsInHandStartPosition();
    const cardsEndPosition = UtilsEngine.getCardsInHandEndPosition();
    const dx = (cardsEndPosition.x - cardsStartPosition.x) / (numCards - 0.25);

    // card nodes
    let showDelay = 0.0;
    for (let i = 0; i < numCards; i++) {
      const cardPosition = cc.p(cardsStartPosition.x + CONFIG.HAND_CARD_SIZE * 0.125 + dx * i, cardsStartPosition.y);
      showDelay += CONFIG.STAGGER_MEDIUM_DELAY;
      this._showActiveCard(i, cardPosition, showDelay);
    }

    // delay a little extra then set as active
    if (SDK.GameSession.getInstance().getIsDeveloperMode()) {
      showDelay = 0.0;
    } else {
      showDelay += CONFIG.MOVE_SLOW_DURATION * 0.5;
    }
    this.runAction(cc.sequence(
      cc.delayTime(showDelay),
      cc.callFunc(() => {
        // replace node
        if (!this._replaceNode.getIsDisabled()) {
          this._replaceNode.setOpacity(0.0);
          this._replaceNode.fadeTo(CONFIG.FADE_FAST_DURATION, 255.0);
        }

        // set active
        this.setStatus(BottomDeckLayer.STATUS.ACTIVE);
      }),
    ));
  },

  _showActiveCard(i, cardPosition, showDelay) {
    const cardNode = this.getCardNodes()[i];
    if (cardNode) {
      cardNode.setSdkCardFromHandIndex(i);
      cardNode.stopAnimations();

      if (!cardNode.isRunning()) {
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
            cc.fadeTo(CONFIG.FADE_SLOW_DURATION, 255.0),
          );
          cardNode.addAnimationAction(showActiveCardAction);
          cardNode.runAction(showActiveCardAction);
        }
      } else {
        cardNode.setOpacity(255.0);
        // move cards to active position
        var showActiveCardAction = cc.sequence(
          cc.delayTime(showDelay || 0),
          cc.moveTo(CONFIG.MOVE_SLOW_DURATION, cardPosition).easing(cc.easeExponentialOut()),
        );
        cardNode.addAnimationAction(showActiveCardAction);
        cardNode.runAction(showActiveCardAction);
      }
    }
  },

  /* endregion MULLIGAN */

  /* region DRAW */

  /** *
   * Shows a card being drawn into hand based on an action.
   * @param {SDK.PutCardInHandAction} action
   */
  showDrawCard(action) {
    let showDuration = 0.0;

    if (action instanceof SDK.PutCardInHandAction) {
      // show card actions for my player only
      const scene = this.getScene();
      const gameLayer = scene && scene.getGameLayer();
      if (gameLayer != null && gameLayer.getMyPlayerId() === action.getOwnerId()) {
        const indexOfCardInHand = action.getIndexOfCardInHand();
        const cardNode = this.cardNodes[indexOfCardInHand];
        if (cardNode instanceof BottomDeckCardNode) {
          showDuration = cardNode.showDraw(indexOfCardInHand);
        }
      }
    }

    return showDuration;
  },

  /** *
   * Shows animation for a card being removed from hand at index.
   * @param {Number} indexOfCardInHand
   */
  showRemoveCard(indexOfCardInHand) {
    let showDuration = 0.0;

    if (indexOfCardInHand != null) {
      const cardNode = this.cardNodes[indexOfCardInHand];
      if (cardNode instanceof BottomDeckCardNode && cardNode.getSdkCard() != null) {
        showDuration = cardNode.showRemove();
      }
    }

    return showDuration;
  },

  /* endregion DRAW */

  /* region EVENTS */

  onGameFollowupCardStart(event) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      this.unbindHand();
      this.hideHandLayer();
    }
  },

  onGameFollowupCardStop(event) {
    if (!SDK.GameSession.getInstance().getIsSpectateMode()) {
      this.bindHand();
      this.showHandLayer(CONFIG.VIEW_TRANSITION_DURATION);
    }
  },

  /* endregion EVENTS */

  /* region BINDING */

  /** *
   * Binds this view to the current deck as set in the model (SDK layer). Immediately will update all card slots to show the current state.
   */
  bindHand(cardFadeDuration) {
    const cardNodes = this.getCardNodes();
    for (let i = 0, il = cardNodes.length; i < il; i++) {
      this.bindCardNodeAtIndex(i, cardFadeDuration);
    }
  },

  /** *
   * Unbinds this view from the current deck as set in the model (SDK layer). Immediately will update all card slots to show as empty.
   */
  unbindHand() {
    const cardNodes = this.getCardNodes();
    for (let i = 0, il = cardNodes.length; i < il; i++) {
      this.unbindCardNodeAtIndex(i);
    }
  },

  /** *
   * Binds a card slot from the current deck as set in the model (SDK layer). Immediately will update card slot to show current state.
   */
  bindCardNodeAtIndex(i, cardFadeDuration) {
    const cardNode = this.getCardNodes()[i];
    if (cardNode && !cardNode.getActionByTag(CONFIG.CARD_TAG)) {
      cardNode.setSdkCardFromHandIndex(i, cardFadeDuration);
    }
  },

  /** *
   * Unbinds a card slot from the current deck as set in the model (SDK layer). Immediately will update card slot to show as empty.
   */
  unbindCardNodeAtIndex(i) {
    const cardNode = this.getCardNodes()[i];
    if (cardNode) {
      cardNode.setSdkCardFromHandIndex(null);
    }
  },

  /** *
   * Binds the usability of the hand from the current deck as set in the model (SDK layer). Immediately will update all cards to show mana cost and whether can be used.
   */
  bindHandUsability() {
    const cardNodes = this.getCardNodes();
    for (let i = 0, il = cardNodes.length; i < il; i++) {
      cardNodes[i].updateUsability();
    }
  },

  /** *
   * Binds the usability, highlight, and selection states of the hand from the current deck as set in the model (SDK layer). Immediately will reset all cards and remove highlights/selections.
   */
  bindHandUsabilityHighlightSelection() {
    const cardNodes = this.getCardNodes();
    for (let i = 0, il = cardNodes.length; i < il; i++) {
      cardNodes[i].resetHighlightAndSelection();
    }
  },

  /* endregion BINDING */

});

BottomDeckLayer.STATUS = {
  ACTIVE: 1,
  DISABLED: 2,
};

BottomDeckLayer.create = function (layer) {
  return BaseLayer.create(layer || new BottomDeckLayer());
};

module.exports = BottomDeckLayer;
