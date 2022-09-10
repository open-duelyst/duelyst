// pragma PKGS: core_gem_node

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const SDK = require('app/sdk');
const audio_engine = require('app/audio/audio_engine');
const BaseSprite = require('app/view/nodes/BaseSprite');
const CoreGemSprite = require('app/view/nodes/gem/CoreGemSprite');
const FXFbmPolarFlareSprite = require('app/view/nodes/fx/FXFbmPolarFlareSprite');

/** **************************************************************************
 CoreGemNode
 *************************************************************************** */

const CoreGemNode = cc.Node.extend({

  gemSprite: null,
  polarFlare: null,
  innerDarkRingSprite: null,
  innerRingSprite: null,
  outerRingSprite: null,
  dotsRingSprite: null,
  reticleAlphaStrong: 170,
  reticleAlphaWeak: 90,
  particles: null,
  _cardId: null,
  _selected: false,

  ctor(cardId) {
    this._super();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      // core gem
      this.gemSprite = new CoreGemSprite();
      this.addChild(this.gemSprite);
      // dark inner ring
      this.innerDarkRingSprite = new BaseSprite(RSX.core_gem_ring_inner_dark.img);
      this.addChild(this.innerDarkRingSprite, -2);
      // inner animated ring
      this.innerRingSprite = new BaseSprite(RSX.core_gem_ring_inner_light.img);
      this.innerRingSprite.setOpacity(this.reticleAlphaWeak);
      this.innerRingSprite.startRotating(16.0, 360);
      this.addChild(this.innerRingSprite);
      // outer animated ring
      this.outerRingSprite = new BaseSprite(RSX.core_gem_ring_outer_light.img);
      this.outerRingSprite.setOpacity(this.reticleAlphaWeak);
      this.outerRingSprite.startRotating(30.0, -360);
      this.addChild(this.outerRingSprite);
      // animated ring dots
      this.dotsRingSprite = new BaseSprite(RSX.core_gem_ring_inner_dots.img);
      this.dotsRingSprite.setOpacity(this.reticleAlphaWeak);
      this.dotsRingSprite.startRotating(50.0);
      this.addChild(this.dotsRingSprite);
      // polar flare
      this.polarFlare = FXFbmPolarFlareSprite.create();
      this.polarFlare.phase = 1.0;
      this.polarFlare.timeScale = 0.25;
      this.polarFlare.setScale(0.25);
      this.polarFlare.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.polarFlare.setTextureRect(cc.rect(0, 0, 512, 640));
      this.polarFlare.setAnchorPoint(0.5, 0.5);
      this.addChild(this.polarFlare, -1);

      // explosion particles
      this.particles = cc.ParticleSystem.create(RSX.core_gem_particles.plist);
      this.particles.stopSystem();
      this.addChild(this.particles, -2);
    });

    this.setColor(cc.color(221, 0, 131));

    if (cardId) {
      this.setCardId(cardId);
    }
  },

  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('core_gem_node'));
  },

  setColor(color) {
    cc.Node.prototype.setColor.call(this, color);

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.polarFlare.flareColor = color;
      this.gemSprite.midColor = color;
      this.gemSprite.blackColor = cc.color(
        color.r * 0.05,
        color.g * 0.05,
        color.b * 0.05,
      );

      const brighterColor = cc.color(
        Math.min(255, color.r + 100),
        Math.min(255, color.g + 100),
        Math.min(255, color.b + 100),
      );

      this.innerRingSprite.setColor(brighterColor);
      this.dotsRingSprite.setColor(brighterColor);
      this.outerRingSprite.setColor(brighterColor);

      this.particles.setStartColor(color);
      this.particles.setEndColor(color);
    });
  },

  transitionIn() {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.gemSprite.setOpacity(0);
      this.gemSprite.setScale(0.5);

      audio_engine.current().play_effect(RSX.sfx_loot_crate_reward_disappear.audio, false);

      this.polarFlare.runAction(cc.actionTween(1.0, 'phase', 0.01, 1.0).easing(cc.easeBackOut()));
      this.gemSprite.runAction(cc.spawn(
        cc.fadeIn(0.05),
        cc.scaleTo(0.2, 1.0).easing(cc.easeBackOut()),
      ));

      // start particles
      this.particles.resetSystem();
    });
  },

  setSelected(value) {
    this._selected = value;

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.dotsRingSprite.stopRotating();
      if (this._selected) {
        this.outerRingSprite.runAction(cc.fadeTo(0.1, this.reticleAlphaStrong));
        this.innerRingSprite.runAction(cc.fadeTo(0.1, this.reticleAlphaStrong));
        this.dotsRingSprite.runAction(cc.fadeTo(0.1, this.reticleAlphaStrong));
        this.dotsRingSprite.startRotating(20.0);
      } else {
        this.outerRingSprite.runAction(cc.fadeTo(0.1, this.reticleAlphaWeak));
        this.innerRingSprite.runAction(cc.fadeTo(0.1, this.reticleAlphaWeak));
        this.dotsRingSprite.runAction(cc.fadeTo(0.1, this.reticleAlphaWeak));
        this.dotsRingSprite.startRotating(40.0);
      }
    });
  },

  setCardId(val) {
    this._cardId = val;

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      const rarityId = SDK.CardFactory.cardForIdentifier(this._cardId, SDK.GameSession.current()).getRarityId();
      if (rarityId == SDK.Rarity.Common) {
        this.setColor(cc.color(150, 150, 150));
        this.polarFlare.setOpacity(200);
        this.polarFlare.setScale(0.2);
        this.reticleAlphaWeak = 80;
        this.reticleAlphaStrong = 140;
      } else {
        // grab rarity color
        const { color } = SDK.RarityFactory.rarityForIdentifier(rarityId);
        this.setColor(color);
        this.polarFlare.setOpacity(255);
        this.polarFlare.setScale(0.25);
      }
    });
  },

  getCardId() {
    return this._cardId;
  },

  fadeOutReticle(duration) {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      if (duration > 0) {
        this.innerRingSprite.runAction(cc.fadeOut(duration));
        this.dotsRingSprite.runAction(cc.fadeOut(duration));
        this.outerRingSprite.runAction(cc.fadeOut(duration));
      } else {
        this.innerRingSprite.setOpacity(0);
        this.dotsRingSprite.setOpacity(0);
        this.outerRingSprite.setOpacity(0);
      }
    });
  },

  fadeInReticle(duration) {
    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources invalidated/unloaded

      this.innerDarkRingSprite.setOpacity(0);
      this.innerDarkRingSprite.setScale(0.5);

      this.innerRingSprite.setOpacity(0);
      this.innerRingSprite.setScale(0.5);

      this.outerRingSprite.setOpacity(0);
      this.outerRingSprite.setScale(0.5);

      this.dotsRingSprite.setOpacity(0);
      this.dotsRingSprite.setScale(0.5);

      this.innerRingSprite.runAction(cc.sequence(
        cc.delayTime(0.1),
        cc.spawn(
          cc.fadeIn(duration * 0.6),
          cc.scaleTo(duration * 0.6, 1.0).easing(cc.easeBackOut()),
        ),
        cc.fadeTo(duration * 0.4, this.reticleAlphaWeak),
      ));

      this.dotsRingSprite.runAction(cc.sequence(
        cc.delayTime(0.2),
        cc.spawn(
          cc.fadeIn(duration * 0.6),
          cc.scaleTo(duration * 0.6, 1.0).easing(cc.easeBackOut()),
        ),
        cc.fadeTo(duration * 0.4, this.reticleAlphaWeak),
      ));

      this.outerRingSprite.runAction(cc.sequence(
        cc.delayTime(0.3),
        cc.spawn(
          cc.fadeIn(duration * 0.6),
          cc.scaleTo(duration * 0.6, 1.0).easing(cc.easeBackOut()),
        ),
        cc.fadeTo(duration * 0.4, this.reticleAlphaWeak),
      ));

      this.innerDarkRingSprite.runAction(cc.sequence(
        cc.delayTime(0.4),
        cc.spawn(
          cc.fadeIn(duration * 2.0),
          cc.scaleTo(duration * 2.0, 1.0).easing(cc.easeBackOut()),
        ),
      ));
    });
  },

});

CoreGemNode.create = function (cardId, node) {
  return node || new CoreGemNode(cardId);
};

module.exports = CoreGemNode;
