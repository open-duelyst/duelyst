// pragma PKGS: gauntlet rift
const CONFIG = require('app/common/config');
const SDK = require('app/sdk');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const SdkNode = require('./SdkNode');
const BaseSprite = require('../BaseSprite');

/** **************************************************************************
 ArenaDeckCardNode
 var ArenaDeckCardNode = SdkNode
 ArenaDeckCardNode.create()
 - node used to display cards in arena deck
 *************************************************************************** */

const ArenaDeckCardNode = SdkNode.extend({

  background: null,
  cardSprite: null,
  titleLabel: null,
  manaCostLabel: null,
  count: 1,
  _ui_z_order_card_sprite: 1,
  _ui_z_order_labels: 2,

  /* region INITIALIZE */

  ctor(sdkCard, count) {
    // initialize properties that may be required in init

    // background
    const bgSpriteIdentifier = SDK.Cards.getIsPrismaticCardId(sdkCard.getId()) ? RSX.deck_builder_prismatic_card_bg.img : RSX.deck_builder_card_bg.img;
    this.background = new BaseSprite(bgSpriteIdentifier);
    this.background.setAnchorPoint(0, 0);
    const contentSize = this.background.getContentSize();

    // title
    this.titleLabel = new cc.LabelTTF('', RSX.font_light.name, 14, cc.size(500, 30), cc.TEXT_ALIGNMENT_LEFT);
    this.titleLabel.setAnchorPoint(0, 0);

    // mana cost
    this.manaCostLabel = new cc.LabelTTF('', RSX.font_bold.name, 14, cc.size(500, 28), cc.TEXT_ALIGNMENT_LEFT);
    this.manaCostLabel.setAnchorPoint(0, 0);
    this.manaCostLabel.setFontFillColor({ r: 0, g: 33, b: 159 });

    // do super ctor
    this._super(sdkCard);

    // set content size
    // this must be done after the cocos/super ctor
    this.setContentSize(contentSize);

    // add nodes
    // this must be done after the cocos/super ctor
    this.addChild(this.background);
    this.addChild(this.titleLabel, this._ui_z_order_labels);
    this.addChild(this.manaCostLabel, this._ui_z_order_labels);

    this.setCount(count);
  },

  /* endregion INITIALIZE */

  /* region GETTERS / SETTERS */

  /**
   * Arena deck card nodes should always use card inspect resource packages.
   * @see SdkNode.getCardResourcePackageId
   */
  getCardResourcePackageId(sdkCard) {
    return PKGS.getCardInspectPkgIdentifier(sdkCard.getId());
  },

  setSdkCard(sdkCard, count) {
    // update card if different
    const lastSdkCard = this.sdkCard;
    if (lastSdkCard != sdkCard) {
      // reset last
      if (lastSdkCard != null) {
        if (this.cardSprite != null) {
          this.cardSprite.destroy();
          this.cardSprite = null;
        }

        if (sdkCard != null) {
          this.manaCostLabel.setString('');
          this.titleLabel.setString('');
        }
      }

      // update card always after resetting last and before showing new
      this._super(sdkCard);

      // create new
      if (this.sdkCard != null) {
        const contentSize = this.getContentSize();

        // card options
        const cardOptions = _.extend({}, sdkCard.getCardOptions());
        cardOptions.spriteIdentifier = sdkCard.getBaseAnimResource() && (sdkCard.getBaseAnimResource().breathing || sdkCard.getBaseAnimResource().idle);
        cardOptions.antiAlias = false;
        if (cardOptions.scale == null) { cardOptions.scale = 1.0; }

        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed

          // card sprite
          this.cardSprite = BaseSprite.create(cardOptions);

          // position card sprite
          const cardSpritePosition = this.cardSprite.getPosition();
          const cardSpriteOffset = cardOptions.offset;
          if (cardSpriteOffset != null) {
            cardSpritePosition.x += cardSpriteOffset.x;
            cardSpritePosition.y += cardSpriteOffset.y;
          }

          cardSpritePosition.x += 230;
          if (sdkCard instanceof SDK.Unit) {
            this.cardSprite.setFlippedX(true);
            this.cardSprite.setAnchorPoint(0.5, 0.0);
            cardSpritePosition.y += -10;
          } else {
            this.cardSprite.setAnchorPoint(0.5, 0.5);
            cardSpritePosition.y += 22;
          }
          this.cardSprite.setPosition(cardSpritePosition);

          // add card sprite
          this.addChild(this.cardSprite, this._ui_z_order_card_sprite);

          // run idle animation if available
          let animAction = UtilsEngine.getAnimationAction(this.cardSprite.getSpriteIdentifier());
          if (animAction) {
            if (animAction.getDuration() > 0) {
              animAction = animAction.repeatForever();
            }
            this.cardSprite.runAction(animAction);
          }
        });

        // background
        this.background.setPosition(0, 0);

        // mana cost
        this.manaCostLabel.setString(`${this.sdkCard.manaCost}`);
        this.manaCostLabel.setPosition(15, 0);

        // reset count
        this.count = 1;

        // title
        this.titleLabel.setString(this.sdkCard.name + (this.count > 1 ? `  X${this.count}` : ''));
        this.titleLabel.setPosition(50, 0);
      }
    }

    // update counts
    this.setCount(count);
  },

  setCount(count) {
    // check count
    if (count == null) { count = 1; }
    if (this.count !== count) {
      this.count = count;
      if (this.sdkCard != null) {
        this.titleLabel.setString(this.sdkCard.name + (this.count > 1 ? `  X${this.count}` : ''));
      }
    }
  },

  /* endregion GETTERS / SETTERS */

  /* region ANIMATION */

  /**
   * Shows a card being inserted into deck.
   * @param sdkCard
   * @returns {Promise}
   */
  showInsert(sdkCard) {
    // reset
    if (sdkCard != null) {
      this.setSdkCard(sdkCard);
    }

    if (this.sdkCard != null) {
      return new Promise((resolve, reject) => {
        // hide self
        this.setOpacity(0);

        this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
          if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
          // move card into position
          const moveAmount = 30.0;

          const bgPosition = this.background.getPosition();
          this.background.setPosition(bgPosition.x + moveAmount, bgPosition.y);
          var moveAction = cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut());
          this.addAnimationAction(moveAction);
          this.background.runAction(moveAction);

          const titlePosition = this.titleLabel.getPosition();
          this.titleLabel.setPosition(titlePosition.x + moveAmount, titlePosition.y);
          var moveAction = cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut());
          this.addAnimationAction(moveAction);
          this.titleLabel.runAction(moveAction);

          const manaCostPosition = this.manaCostLabel.getPosition();
          this.manaCostLabel.setPosition(manaCostPosition.x + moveAmount, manaCostPosition.y);
          var moveAction = cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut());
          this.addAnimationAction(moveAction);
          this.manaCostLabel.runAction(moveAction);

          const cardPosition = this.cardSprite.getPosition();
          this.cardSprite.setPosition(cardPosition.x + moveAmount, cardPosition.y);
          var moveAction = cc.sequence(
            cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut()),
            cc.callFunc(() => {
              resolve();
            }),
          );
          this.addAnimationAction(moveAction);
          this.cardSprite.runAction(moveAction);

          // fade self in
          const insertCardAction = cc.fadeIn(0.1);
          this.addAnimationAction(insertCardAction);
          this.runAction(insertCardAction);
        });
      });
    }
    return Promise.resolve();
  },

  showRemove() {
    return new Promise((resolve, reject) => {
      this.whenResourcesReady(this.getCardResourceRequestId()).then((cardResourceRequestId) => {
        if (!this.getAreResourcesValid(cardResourceRequestId)) return; // card has changed
        // move card into position
        const moveAmount = -30.0;

        const bgPosition = this.background.getPosition();
        this.background.setPosition(bgPosition.x + moveAmount, bgPosition.y);
        var moveAction = cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut());
        this.addAnimationAction(moveAction);
        this.background.runAction(moveAction);

        const titlePosition = this.titleLabel.getPosition();
        this.titleLabel.setPosition(titlePosition.x + moveAmount, titlePosition.y);
        var moveAction = cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut());
        this.addAnimationAction(moveAction);
        this.titleLabel.runAction(moveAction);

        const manaCostPosition = this.manaCostLabel.getPosition();
        this.manaCostLabel.setPosition(manaCostPosition.x + moveAmount, manaCostPosition.y);
        var moveAction = cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut());
        this.addAnimationAction(moveAction);
        this.manaCostLabel.runAction(moveAction);

        const cardPosition = this.cardSprite.getPosition();
        this.cardSprite.setPosition(cardPosition.x + moveAmount, cardPosition.y);
        var moveAction = cc.sequence(
          cc.moveBy(CONFIG.ANIMATE_FAST_DURATION, -moveAmount, 0.0).easing(cc.easeExponentialOut()),
          cc.callFunc(() => {
            resolve();
          }),
        );
        this.addAnimationAction(moveAction);
        this.cardSprite.runAction(moveAction);

        // fade self in
        const insertCardAction = cc.fadeOut(0.1);
        this.addAnimationAction(insertCardAction);
        this.runAction(insertCardAction);
      });
    });
  },

  /* endregion ANIMATION */

});

ArenaDeckCardNode.create = function (sdkCard, count, node) {
  return SdkNode.create(sdkCard, node || new ArenaDeckCardNode(sdkCard, count));
};

module.exports = ArenaDeckCardNode;
