// pragma PKGS: key_reward
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const FigureEight = require('app/view/actions/FigureEight');
const BaseSprite = require('app/view/nodes/BaseSprite');
const BaseParticleSystem = require('app/view/nodes/BaseParticleSystem');
const Promise = require('bluebird');
const RewardNode = require('./RewardNode');

/** **************************************************************************
 KeyRewardNode
 *************************************************************************** */

const KeyRewardNode = RewardNode.extend({

  _keyType: null,

  ctor(keyType) {
    if (keyType == null) {
      throw new Error('Key reward node must be initialized with a key type!');
    }
    this._keyType = keyType;

    this._super();
  },

  getKeyType() {
    return this._keyType;
  },

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    return this._super().concat(PKGS.getPkgForIdentifier('key_reward'));
  },

  /* endregion RESOURCES */

  /* region ANIMATION */

  getRewardAnimationPromise(looping, showLabel) {
    return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
      .then(() => new Promise((resolve) => {
        // key sprite
        let spriteIdentifier;
        let chestType;
        if (this._keyType === SDK.CosmeticsChestTypeLookup.Epic) {
          spriteIdentifier = RSX.mystery_t3_loot_crate_key.img;
          chestType = 'Epic Crate';
        } else if (this._keyType === SDK.CosmeticsChestTypeLookup.Rare) {
          spriteIdentifier = RSX.mystery_t2_loot_crate_key.img;
          chestType = 'Rare Crate';
        } else {
          spriteIdentifier = RSX.mystery_t1_loot_crate_key.img;
          chestType = 'Common Crate';
        }
        const keyScale = 1.0;
        const keySprite = BaseSprite.create(spriteIdentifier);
        keySprite.setVisible(false);
        keySprite.setRotation(90.0);
        keySprite.setScale(keyScale);
        this.addChild(keySprite, 1);

        if (showLabel) {
          // primary label
          const labelText = _.isString(showLabel) ? showLabel : 'KEY';
          var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          label.setPosition(0, -120);
          label.setOpacity(0);
          this.addChild(label, 1);

          // secondary label
          var sublabel = new cc.LabelTTF(chestType.toLocaleUpperCase(), RSX.font_regular.name, 16, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          sublabel.setFontFillColor({ r: 220, g: 220, b: 220 });
          sublabel.setPosition(0, -100);
          sublabel.setOpacity(0);
          this.addChild(sublabel, 1);
        }

        // show wipe flare
        this.showRewardWipeFlare();

        // show key
        this.runAction(cc.sequence(
          cc.targetedAction(keySprite, cc.sequence(
            cc.show(),
            cc.scaleTo(0.0, 0.0),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, keyScale).easing(cc.easeBackOut()),
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
              keySprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, keySprite.getPosition()).repeatForever());
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

KeyRewardNode.create = function (options, node) {
  return RewardNode.create(options, node || new KeyRewardNode(options));
};

module.exports = KeyRewardNode;
