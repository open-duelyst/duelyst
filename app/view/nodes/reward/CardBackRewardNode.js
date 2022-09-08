// pragma PKGS: card_back_reward
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const FigureEight = require('app/view/actions/FigureEight');
const TweenTypes = require('app/view/actions/TweenTypes');
const Promise = require('bluebird');
const i18next = require('i18next');
const RewardNode = require('./RewardNode');
const BaseSprite = require('../BaseSprite');
const BaseParticleSystem = require('../BaseParticleSystem');
const GlowSprite = require('../GlowSprite');

/** **************************************************************************
 CardBackRewardNode
 *************************************************************************** */

const CardBackRewardNode = RewardNode.extend({

  _cardBackId: null,

  ctor(cardBackId) {
    if (cardBackId == null) {
      throw new Error('Card Back reward node must be initialized with a card back id!');
    }
    this._cardBackId = cardBackId;

    this._super();
  },

  getCardBackId() {
    return this._cardBackId;
  },

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    let requiredResources = RewardNode.prototype.getRequiredResources.call(this);
    requiredResources = requiredResources.concat(PKGS.getPkgForIdentifier('card_back_reward'));
    if (this._cardBackId != null) {
      const cardBackPkgId = PKGS.getCardBackPkgIdentifier(this._cardBackId);
      requiredResources = requiredResources.concat(PKGS.getPkgForIdentifier(cardBackPkgId));
    }
    return requiredResources;
  },

  /* endregion RESOURCES */

  /* region ANIMATION */

  getRewardAnimationPromise(looping, showLabel) {
    return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
      .then(() => new Promise((resolve) => {
        // card back data
        const cardBackData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._cardBackId);

        // card container node
        const cardContainerNode = new cc.Node();
        cardContainerNode.setAnchorPoint(0.5, 0.5);
        this.addChild(cardContainerNode, 1);

        // card back sprite
        const cardBackSprite = GlowSprite.create(cardBackData.img);
        cardContainerNode.addChild(cardBackSprite, 1);
        const cardBackgroundContentSize = cardBackSprite.getContentSize();

        // card back glow outline sprite
        const cardBackGlowOutlineSprite = BaseSprite.create(cardBackData.glowOutlineRSX.img);
        cardBackGlowOutlineSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        cardContainerNode.addChild(cardBackGlowOutlineSprite, 2);

        // bg shadow
        const cardShadow = new BaseSprite(RSX.card_shadow_map.img);
        cardShadow.setOpacity(0.0);
        cardShadow.setVisible(false);
        cardContainerNode.addChild(cardShadow, -9999);

        if (showLabel) {
          // primary label
          const labelText = _.isString(showLabel) ? showLabel : i18next.t('cosmetics.cosmetic_type_card_back').toLocaleUpperCase();
          var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          label.setPosition(0, -200);
          label.setOpacity(0.0);
          this.addChild(label, 3);

          // secondary label
          const { rarityId } = cardBackData;
          if (rarityId != null) {
            const rarityData = SDK.RarityFactory.rarityForIdentifier(rarityId);
            var sublabel = new cc.LabelTTF(rarityData.name.toLocaleUpperCase(), RSX.font_regular.name, 16, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
            sublabel.setFontFillColor(rarityData.color);
            sublabel.setPosition(0, -180);
            sublabel.setOpacity(0.0);
            this.addChild(sublabel, 3);
          }
        }

        // tint and highlight
        cardBackSprite.setLeveled(true);
        cardBackSprite.setLevelsInWhite(180);
        cardBackSprite.setLevelsInBlack(30);
        cardBackSprite.setHighlighted(true);
        cardBackSprite.setTint(new cc.Color(255, 255, 255, 255));
        cardBackSprite.setScale(0.0);
        cardBackSprite.setOpacity(255.0);
        cardBackSprite.setVisible(true);
        cardBackGlowOutlineSprite.setScale(0.0);
        cardBackGlowOutlineSprite.setOpacity(255.0);
        cardBackGlowOutlineSprite.setVisible(true);

        // show card back
        this.runAction(cc.sequence(
          cc.targetedAction(cardBackSprite, cc.sequence(
            cc.spawn(
              cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeExponentialOut()),
              cc.actionTween(CONFIG.ANIMATE_MEDIUM_DURATION, TweenTypes.TINT_FADE, 255.0, 0.0).easing(cc.easeOut(2.0)),
              cc.targetedAction(cardBackGlowOutlineSprite, cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeExponentialOut())),
            ),
            cc.spawn(
              cc.callFunc(() => {
                const particles = new BaseParticleSystem(RSX.ptcl_card_appear.plist);
                particles.setPosVar(cc.p(cardBackgroundContentSize.width * 0.5, cardBackgroundContentSize.height * 0.5));
                particles.setAnchorPoint(0.5, 0.5);
                particles.setAutoRemoveOnFinish(true);
                this.addChild(particles, 1);

                cardBackSprite.fadeOutHighlight(CONFIG.ANIMATE_FAST_DURATION);
              }),
              cc.actionTween(CONFIG.ANIMATE_FAST_DURATION, 'levelsInWhite', 180.0, 255.0),
              cc.actionTween(CONFIG.ANIMATE_FAST_DURATION, 'levelsInBlack', 30.0, 0.0),
              cc.targetedAction(cardShadow, cc.spawn(
                cc.show(),
                cc.fadeTo(CONFIG.FADE_FAST_DURATION, 150.0),
              )),
              cc.targetedAction(cardBackGlowOutlineSprite, cc.sequence(
                cc.delayTime(CONFIG.ANIMATE_FAST_DURATION),
                cc.fadeOut(CONFIG.ANIMATE_FAST_DURATION),
                cc.hide(),
              )),
            ),
          )),
          cc.callFunc(() => {
            // show labels
            if (label != null) {
              label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
            }
            if (sublabel != null) {
              sublabel.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
            }

            // float card to make it appear more dynamic
            if (!looping) {
              cardContainerNode.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, cardContainerNode.getPosition()).repeatForever());
            }

            // finish
            resolve();
          }),
        ));
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); }));
  },

  /* endregion ANIMATION */

});

CardBackRewardNode.create = function (options, node) {
  return RewardNode.create(options, node || new CardBackRewardNode(options));
};

module.exports = CardBackRewardNode;
