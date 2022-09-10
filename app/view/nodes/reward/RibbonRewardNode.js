// pragma PKGS: ribbon_reward
const SDK = require('app/sdk');
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const FigureEight = require('app/view/actions/FigureEight');
const Promise = require('bluebird');
const RewardNode = require('./RewardNode');
const GlowSprite = require('../GlowSprite');
const BaseParticleSystem = require('../BaseParticleSystem');

/** **************************************************************************
 RibbonRewardNode
 *************************************************************************** */

const RibbonRewardNode = RewardNode.extend({

  _ribbonId: null,

  ctor(ribbonId) {
    if (ribbonId == null) {
      throw new Error('Ribbon reward node must be initialized with a ribbon id!');
    }
    this._ribbonId = ribbonId;

    this._super();
  },

  getRibbonId() {
    return this._ribbonId;
  },

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    const ribbonRewardResources = PKGS.getPkgForIdentifier('ribbon_reward');
    const ribbonData = SDK.RibbonFactory.ribbonForIdentifier(this._ribbonId);
    return this._super().concat(ribbonRewardResources, ribbonData.rsx);
  },

  /* endregion RESOURCES */

  /* region ANIMATION */

  getRewardAnimationPromise(looping, showLabel) {
    return (looping ? this.showLoopingRewardFlare() : this.showRewardFlare())
      .then(() => new Promise((resolve) => {
        // ribbon data
        const ribbonData = SDK.RibbonFactory.ribbonForIdentifier(this._ribbonId);

        // ribbon sprite
        const ribbonSprite = new GlowSprite(ribbonData.rsx.img);
        ribbonSprite.setVisible(false);
        ribbonSprite.setHighlighted(true);
        ribbonSprite.setPosition(0.0, 0.0);
        this.addChild(ribbonSprite, 1);

        if (showLabel) {
          // primary label
          const labelText = _.isString(showLabel) ? showLabel : 'BATTLE RIBBON';
          var label = new cc.LabelTTF(labelText, RSX.font_regular.name, 22, cc.size(200, 24), cc.TEXT_ALIGNMENT_CENTER);
          label.setPosition(0, -120);
          label.setOpacity(0);
          this.addChild(label, 1);
        }

        // show wipe flare
        this.showRewardWipeFlare();

        // show profile icon
        this.runAction(cc.sequence(
          cc.targetedAction(ribbonSprite, cc.sequence(
            cc.callFunc(() => {
              ribbonSprite.setVisible(true);
              ribbonSprite.fadeInHighlight(CONFIG.ANIMATE_MEDIUM_DURATION);
            }),
            cc.scaleTo(0.0, 0.0),
            cc.scaleTo(CONFIG.ANIMATE_MEDIUM_DURATION, 1.0).easing(cc.easeBackOut()),
            cc.callFunc(() => {
              // show labels
              if (label != null) {
                label.fadeTo(CONFIG.ANIMATE_FAST_DURATION, 255.0);
              }
            }),
          )),
          cc.callFunc(() => {
            ribbonSprite.fadeOutHighlight(0.5);

            // float sprite to make it appear more dynamic
            if (!looping) {
              ribbonSprite.runAction(FigureEight.create(4.0 + Math.random(), 2, 5, ribbonSprite.getPosition()).repeatForever());
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

RibbonRewardNode.create = function (options, node) {
  return RewardNode.create(options, node || new RibbonRewardNode(options));
};

module.exports = RibbonRewardNode;
