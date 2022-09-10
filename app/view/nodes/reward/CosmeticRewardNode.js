// pragma PKGS: cosmetic_reward
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const FigureEight = require('app/view/actions/FigureEight');
const Promise = require('bluebird');
const i18next = require('i18next');
const RewardNode = require('./RewardNode');
const BaseSprite = require('../BaseSprite');
const BaseParticleSystem = require('../BaseParticleSystem');

/** **************************************************************************
 CosmeticRewardNode
 *************************************************************************** */

const CosmeticRewardNode = RewardNode.extend({

  _cosmeticId: null,

  ctor(cosmeticId) {
    if (cosmeticId == null) {
      throw new Error('Cosmetic reward node must be initialized with a cosmetic id!');
    }
    this._cosmeticId = cosmeticId;

    this._super();
  },

  getCosmeticId() {
    return this._cosmeticId;
  },

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    const cosmeticRewardResources = PKGS.getPkgForIdentifier('cosmetic_reward');
    const cosmeticResources = this._cosmeticId != null ? SDK.CosmeticsFactory.cosmeticResourcesForIdentifier(this._cosmeticId) : [];
    return this._super().concat(cosmeticResources, cosmeticRewardResources);
  },

  /* endregion RESOURCES */

  /* region ANIMATION */

  getRewardAnimationPromise(looping, showLabel, maskWithCircle) {
    return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
      .then(() => new Promise((resolve) => {
        // cosmetic data
        const cosmeticData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._cosmeticId);

        // cosmetic sprite
        const cosmeticScale = 0.75;
        const cosmeticSprite = BaseSprite.create(cosmeticData.img);
        if (maskWithCircle) {
          cosmeticSprite.setMask(RSX.mask_circle.img);
        }
        cosmeticSprite.setScale(cosmeticScale);
        cosmeticSprite.setVisible(false);
        this.addChild(cosmeticSprite, 1);

        if (showLabel) {
          // primary label
          const labelText = _.isString(showLabel) ? showLabel : 'COSMETIC';
          var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          label.setPosition(0, -120);
          label.setOpacity(0);
          this.addChild(label, 1);

          // secondary label
          const { rarityId } = cosmeticData;
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

        // show cosmetic
        this.runAction(cc.sequence(
          cc.targetedAction(cosmeticSprite, cc.sequence(
            cc.show(),
            cc.scaleTo(0.0, 0.0),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, cosmeticScale).easing(cc.easeBackOut()),
            cc.callFunc(() => {
              // show labels
              if (label != null) {
                label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
              }
              if (sublabel != null) {
                sublabel.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
              }
            }),
          )),
          cc.callFunc(() => {
            // float sprite to make it appear more dynamic
            if (!looping) {
              cosmeticSprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, cosmeticSprite.getPosition()).repeatForever());
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

CosmeticRewardNode.create = function (options, node) {
  return RewardNode.create(options, node || new CosmeticRewardNode(options));
};

module.exports = CosmeticRewardNode;
