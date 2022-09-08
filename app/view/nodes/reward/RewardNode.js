// pragma PKGS: reward
const CONFIG = require('app/common/config');
const Logger = require('app/common/logger');
const EventBus = require('app/common/eventbus');
const EVENTS = require('app/common/event_types');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Promise = require('bluebird');
const BaseSprite = require('../BaseSprite');
const BaseParticleSystem = require('../BaseParticleSystem');
const FXFbmPolarFlareSprite = require('../fx/FXFbmPolarFlareSprite');
const FXFbmPolarFlareWipeSprite = require('../fx/FXFbmPolarFlareWipeSprite');

/** **************************************************************************
 RewardNode
 *************************************************************************** */

const RewardNode = cc.Node.extend({

  /* region RESOURCES */

  /**
   * Returns a list of resource objects this node uses.
   * @returns {Array}
   */
  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('reward'));
  },

  /* region ANIMATION */

  animateReward() {
    const animateArgs = arguments;
    return this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed
      return this.getRewardAnimationPromise.apply(this, animateArgs);
    });
  },

  getRewardAnimationPromise() {
    // override in subclass to return a promise that resolves when reward animations complete
    return Promise.resolve();
  },

  showRewardWipeFlare() {
    return new Promise((resolve) => {
      const wipeFlare = FXFbmPolarFlareWipeSprite.create();
      wipeFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      wipeFlare.setTextureRect(cc.rect(0, 0, 512, 512));
      wipeFlare.setAnchorPoint(cc.p(0.5, 0.5));
      wipeFlare.setColor(cc.color(165, 233, 255));
      wipeFlare.setPosition(0, 0);
      this.addChild(wipeFlare, 1);

      wipeFlare.runAction(cc.sequence(
        cc.fadeIn(0.01),
        cc.actionTween(0.25, 'phase', 0.0, 0.5),
        cc.actionTween(0.75, 'phase', 0.5, 1.5),
        cc.callFunc(() => {
          wipeFlare.destroy(0.1);

          // finish
          resolve();
        }),
      ));
    })
      .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
  },

  showRewardFlare() {
    return new Promise((resolve) => {
      const polarFlare = FXFbmPolarFlareSprite.create();
      polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
      polarFlare.setAnchorPoint(0.5, 0.5);
      this.addChild(polarFlare, -1);

      const particlesAssemble = BaseParticleSystem.create(RSX.ptcl_spiral_assemble_for_card_reward.plist);
      particlesAssemble.setAnchorPoint(0.5, 0.5);
      this.addChild(particlesAssemble, 1);

      polarFlare.runAction(cc.sequence(
        cc.actionTween(1.0, 'phase', 0.01, 1.0),
        cc.delayTime(0.25),
        cc.callFunc(() => {
          // finish
          resolve();
        }),
        cc.fadeTo(1.0, 0.0),
      ));
    })
      .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
  },

  showLoopingRewardFlare() {
    return new Promise((resolve) => {
      const polarFlare = FXFbmPolarFlareSprite.create();
      polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
      polarFlare.setAnchorPoint(0.5, 0.5);
      this.addChild(polarFlare, -1);

      const particlesAssemble = BaseParticleSystem.create(RSX.ptcl_spiral_assemble_for_card_reward.plist);
      particlesAssemble.setAnchorPoint(0.5, 0.5);
      this.addChild(particlesAssemble, 1);

      polarFlare.runAction(cc.sequence(
        cc.actionTween(1.0, 'phase', 0.01, 1.0),
        cc.delayTime(0.5),
        cc.callFunc(() => {
          // finish
          resolve();
        }),
        cc.actionTween(1.0, 'phase', 1.0, 0.5),
      ));
    })
      .catch((error) => { EventBus.getInstance().trigger(EVENTS.error, error); });
  },

  showLoopingRewardBubbles() {
    const particlesBubble = BaseParticleSystem.create(RSX.ptcl_bubble_constant.plist);
    particlesBubble.setFriction(0.98);
    particlesBubble.setAnchorPoint(0.5, 0.5);
    this.addChild(particlesBubble, -1);

    return Promise.resolve();
  },

  /* endregion ANIMATION */

});

RewardNode.create = function (options, node) {
  return node || new RewardNode(options);
};

module.exports = RewardNode;
