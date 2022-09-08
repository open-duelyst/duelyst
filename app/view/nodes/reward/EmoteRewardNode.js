// pragma PKGS: emote_reward
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
 EmoteRewardNode
 *************************************************************************** */

const EmoteRewardNode = RewardNode.extend({

  _emoteId: null,

  ctor(emoteId) {
    if (emoteId == null) {
      throw new Error('Emote reward node must be initialized with a emote id!');
    }
    this._emoteId = emoteId;

    this._super();
  },

  getEmoteId() {
    return this._emoteId;
  },

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    const emoteRewardResources = PKGS.getPkgForIdentifier('emote_reward');
    const emoteResources = this._emoteId != null ? SDK.CosmeticsFactory.cosmeticResourcesForIdentifier(this._emoteId) : [];
    return this._super().concat(emoteResources, emoteRewardResources);
  },

  /* endregion RESOURCES */

  /* region ANIMATION */

  getRewardAnimationPromise(looping, showLabel) {
    return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
      .then(() => new Promise((resolve) => {
        // emote data
        const emoteData = SDK.CosmeticsFactory.cosmeticForIdentifier(this._emoteId);

        // emote sprite
        const emoteSprite = BaseSprite.create(emoteData.img);
        emoteSprite.setVisible(false);
        this.addChild(emoteSprite, 1);

        if (showLabel) {
          // primary label
          const labelText = _.isString(showLabel) ? showLabel : i18next.t('cosmetics.cosmetic_type_emote').toLocaleUpperCase();
          var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          label.setPosition(0, -120);
          label.setOpacity(0);
          this.addChild(label, 1);

          // secondary label
          const { rarityId } = emoteData;
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

        // show bubbles
        if (looping) {
          this.showLoopingRewardBubbles();
        }

        // show emote
        this.runAction(cc.sequence(
          cc.targetedAction(emoteSprite, cc.sequence(
            cc.show(),
            cc.scaleTo(0.0, 0.0),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.25).easing(cc.easeBackOut()),
            cc.callFunc(() => {
              if (looping) {
                // bounce
                emoteSprite.runAction(cc.sequence(
                  cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.0).easing(cc.easeInOut(2.0)),
                  cc.scaleTo(CONFIG.ANIMATE_FAST_DURATION, 1.25).easing(cc.easeInOut(2.0)),
                ).repeatForever());

                // rotate
                emoteSprite.runAction(cc.sequence(
                  cc.rotateTo(CONFIG.ANIMATE_FAST_DURATION * 2.0, 5.0).easing(cc.easeInOut(2.0)),
                  cc.rotateTo(CONFIG.ANIMATE_FAST_DURATION * 2.0, -5.0).easing(cc.easeInOut(2.0)),
                ).repeatForever());
              }

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
              emoteSprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, emoteSprite.getPosition()).repeatForever());
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

EmoteRewardNode.create = function (options, node) {
  return RewardNode.create(options, node || new EmoteRewardNode(options));
};

module.exports = EmoteRewardNode;
