// pragma PKGS: card_skin_reward
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const UtilsEngine = require('app/common/utils/utils_engine');
const Promise = require('bluebird');
const i18next = require('i18next');
const RewardNode = require('./RewardNode');
const BaseSprite = require('../BaseSprite');
const BaseParticleSystem = require('../BaseParticleSystem');

/** **************************************************************************
 CardSkinRewardNode
 *************************************************************************** */

const CardSkinRewardNode = RewardNode.extend({

  _cardSkinId: null,

  ctor(cardSkinId) {
    if (cardSkinId == null) {
      throw new Error('Card Skin reward node must be initialized with a card skin id!');
    }
    this._cardSkinId = cardSkinId;

    this._super();
  },

  getCardSkinId() {
    return this._cardSkinId;
  },

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    const cardSkinRewardResources = PKGS.getPkgForIdentifier('card_skin_reward');
    const cardSkinResources = this._cardSkinId != null ? SDK.CosmeticsFactory.cosmeticResourcesForIdentifier(this._cardSkinId) : [];
    return this._super().concat(cardSkinResources, cardSkinRewardResources);
  },

  /* endregion RESOURCES */

  /* region ANIMATION */

  getRewardAnimationPromise(looping, showLabel) {
    return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
      .then(() => new Promise((resolve) => {
        // card skin data
        const cardSkinData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._cardSkinId);
        const { animResource } = cardSkinData;
        const animName = animResource.breathing || animResource.idle;
        const animStartName = animResource.attack || animName;

        // card skin sprite
        const cardSkinScale = CONFIG.SCALE;
        const cardSkinSprite = BaseSprite.create(animName);
        cardSkinSprite.setPosition(0.0, -80.0);
        cardSkinSprite.setAnchorPoint(0.5, 0.0);
        cardSkinSprite.getTexture().setAliasTexParametersWhenSafeScale();
        cardSkinSprite.setScale(0.0);
        cardSkinSprite.setVisible(false);
        this.addChild(cardSkinSprite, 1);

        // shadow
        const shadowSprite = BaseSprite.create(RSX.unit_shadow.img);
        shadowSprite.setPosition(0.0, -40.0);
        shadowSprite.setOpacity(0);
        shadowSprite.setVisible(false);
        this.addChild(shadowSprite);

        if (showLabel) {
          // primary label
          const labelText = _.isString(showLabel) ? showLabel : i18next.t('cosmetics.cosmetic_type_card_skin').toLocaleUpperCase();
          var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          label.setPosition(0, -120);
          label.setOpacity(0);
          this.addChild(label, 1);

          // secondary label
          const { rarityId } = cardSkinData;
          if (rarityId != null) {
            const rarityData = SDK.RarityFactory.rarityForIdentifier(rarityId);
            var sublabel = new cc.LabelTTF(rarityData.name.toLocaleUpperCase(), RSX.font_regular.name, 16, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
            sublabel.setFontFillColor(rarityData.color);
            sublabel.setPosition(0, -100);
            sublabel.setOpacity(0);
            this.addChild(sublabel, 1);
          }
        }

        // show wipe flare
        this.showRewardWipeFlare();

        // loop animation
        const animationLoopingAction = UtilsEngine.getAnimationAction(animName, true);
        const animationStartAction = UtilsEngine.getAnimationAction(animStartName);
        cardSkinSprite.runAction(animationLoopingAction);

        // show card skin
        this.runAction(cc.sequence(
          cc.spawn(
            cc.targetedAction(cardSkinSprite, cc.sequence(
              cc.show(),
              cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, cardSkinScale).easing(cc.easeBackOut()),
            )),
            cc.targetedAction(shadowSprite, cc.sequence(
              cc.show(),
              cc.fadeTo(CONFIG.ANIMATE_MEDIUM_DURATION, 125.0),
            )),
          ),
          cc.callFunc(() => {
            // show labels
            if (label != null) {
              label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
            }
            if (sublabel != null) {
              sublabel.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
            }
          }),
          cc.spawn(
            cc.callFunc(() => {
              // show start action and then loop idle animation
              cardSkinSprite.stopAction(animationLoopingAction);
              cardSkinSprite.runAction(cc.sequence(
                animationStartAction,
                cc.callFunc(() => {
                  cardSkinSprite.runAction(animationLoopingAction);
                }),
              ));
            }),
            cc.sequence(
              cc.delayTime(animationStartAction.getDuration() * 0.5),
              cc.callFunc(() => {
                // finish
                resolve();
              }),
            ),
          ),
        ));
      })
        .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); }));
  },

  /* endregion ANIMATION */

});

CardSkinRewardNode.create = function (options, node) {
  return RewardNode.create(options, node || new CardSkinRewardNode(options));
};

module.exports = CardSkinRewardNode;
