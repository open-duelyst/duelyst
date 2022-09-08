// pragma PKGS: prismatic_play_card

const CONFIG = require('app/common/config');
const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const BaseSprite = require('../BaseSprite');
const BaseParticleSystem = require('../BaseParticleSystem');
const VoronoiPrismaticSprite = require('./VoronoiPrismaticSprite');

/** **************************************************************************
PrismaticPlayCardNode
var PrismaticPlayCardNode = cc.Node
PrismaticPlayCardNode.create()
 *************************************************************************** */

const PrismaticPlayCardNode = cc.Node.extend({

  _animationDuration: 0.5,
  _gradientFloorSprite: null,
  _particles: null,
  _rayHardRedSprite: null,
  _rayHardGreenSprite: null,
  _rayHardBlueSprite: null,
  _rayOpacity: 127.0,
  _rayScale: 0.5,
  _raySoftRedSprite: null,
  _raySoftGreenSprite: null,
  _raySoftBlueSprite: null,
  _voronoiPrismaticSprite: null,

  /* region INITIALIZE */

  ctor() {
    // do super constructor
    this._super();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

      this._gradientFloorSprite = new BaseSprite(RSX.prismatic_gradients.img);
      this._gradientFloorSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._gradientFloorSprite.setXYZRotation(CONFIG.ENTITY_XYZ_ROTATION);
      this._gradientFloorSprite.setScale(0.65);
      this._gradientFloorSprite.setVisible(false);

      // voronoi
      this._voronoiPrismaticSprite = new VoronoiPrismaticSprite();
      this._voronoiPrismaticSprite.setXYZRotation(CONFIG.ENTITY_XYZ_ROTATION);
      this._voronoiPrismaticSprite.setTextureRect(this._gradientFloorSprite._rect);
      this._voronoiPrismaticSprite.setScale(0.5);
      this._voronoiPrismaticSprite.setVisible(false);

      // soft rays
      this._raySoftRedSprite = new BaseSprite(RSX.prismatic_ray_soft_red.img);
      this._raySoftRedSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._raySoftRedSprite.setAnchorPoint(0.5, 0.0);
      this._raySoftRedSprite.setOpacity(this._rayOpacity);
      this._raySoftRedSprite.setScale(this._rayScale);
      this._raySoftRedSprite.setVisible(false);
      this._raySoftGreenSprite = new BaseSprite(RSX.prismatic_ray_soft_green.img);
      this._raySoftGreenSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._raySoftGreenSprite.setAnchorPoint(0.5, 0.0);
      this._raySoftGreenSprite.setOpacity(this._rayOpacity);
      this._raySoftGreenSprite.setScale(this._rayScale);
      this._raySoftGreenSprite.setVisible(false);
      this._raySoftBlueSprite = new BaseSprite(RSX.prismatic_ray_soft_blue.img);
      this._raySoftBlueSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._raySoftBlueSprite.setAnchorPoint(0.5, 0.0);
      this._raySoftBlueSprite.setOpacity(this._rayOpacity);
      this._raySoftBlueSprite.setScale(this._rayScale);
      this._raySoftBlueSprite.setVisible(false);

      // hard rays
      this._rayHardRedSprite = new BaseSprite(RSX.prismatic_ray_hard_red.img);
      this._rayHardRedSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._rayHardRedSprite.setAnchorPoint(0.5, 0.0);
      this._rayHardRedSprite.setOpacity(this._rayOpacity);
      this._rayHardRedSprite.setScale(this._rayScale);
      this._rayHardRedSprite.setVisible(false);
      this._rayHardGreenSprite = new BaseSprite(RSX.prismatic_ray_hard_green.img);
      this._rayHardGreenSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._rayHardGreenSprite.setAnchorPoint(0.5, 0.0);
      this._rayHardGreenSprite.setOpacity(this._rayOpacity);
      this._rayHardGreenSprite.setScale(this._rayScale);
      this._rayHardGreenSprite.setVisible(false);
      this._rayHardBlueSprite = new BaseSprite(RSX.prismatic_ray_hard_blue.img);
      this._rayHardBlueSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this._rayHardBlueSprite.setAnchorPoint(0.5, 0.0);
      this._rayHardBlueSprite.setOpacity(this._rayOpacity);
      this._rayHardBlueSprite.setScale(this._rayScale);
      this._rayHardBlueSprite.setVisible(false);

      // particles
      const randomRangeX = CONFIG.TILESIZE * 0.25;
      const randomRangeY = CONFIG.TILESIZE * 0.25;
      this._particles = BaseParticleSystem.create(RSX.prismatic_card_particles.plist);
      this._particles.setFadeInAtLifePct(0.1);
      this._particles.setPosition(0.0, randomRangeY * 2.0);
      this._particles.setPosVar(cc.p(randomRangeX * 2.0, randomRangeY));
      this._particles.stopSystem();

      this.addChild(this._gradientFloorSprite);
      this.addChild(this._voronoiPrismaticSprite);
      this.addChild(this._raySoftRedSprite);
      this.addChild(this._raySoftGreenSprite);
      this.addChild(this._raySoftBlueSprite);
      this.addChild(this._rayHardRedSprite);
      this.addChild(this._rayHardGreenSprite);
      this.addChild(this._rayHardBlueSprite);
      this.addChild(this._particles);
    });
  },

  getRequiredResources() {
    return cc.Node.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('prismatic_play_card'));
  },

  onEnter() {
    this._super();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // resources have been invalidated

      // animate
      this._showFloorGradient(this._animationDuration, 0.0);
      this._showSoftRays(this._animationDuration, 0.0);
      this._showHardRays(this._animationDuration, 0.1);
    });
  },
  onExit() {
    this._super();
    cc.pool.putInPool(this);
  },

  /* endregion INITIALIZE */

  /* region ANIMATION */

  getLifeDuration() {
    return this._animationDuration;
  },
  getShowDelay() {
    return this._animationDuration;
  },
  getImpactDelay() {
    return 0.0;
  },

  _showFloorGradient(duration, delay) {
    this._gradientFloorSprite.setVisible(false);
    this._gradientFloorSprite.setOpacity(0.0);
    this._gradientFloorSprite.runAction(cc.sequence(
      cc.delayTime(delay),
      cc.show(),
      cc.fadeTo(duration, 255.0).easing(cc.easeCubicActionOut()),
      cc.fadeTo(duration, 0.0).easing(cc.easeCubicActionIn()),
      cc.hide(),
    ));

    // start voronoi at half phase to show it exploding out
    const voronoiPhase = 0.5;
    this._voronoiPrismaticSprite.setPhase(voronoiPhase);
    this._voronoiPrismaticSprite.runAction(cc.sequence(
      cc.delayTime(delay),
      cc.show(),
      cc.spawn(
        cc.fadeTo(duration * 0.5, 255.0).easing(cc.easeCubicActionOut()),
        cc.actionTween(duration, 'phase', voronoiPhase, 1.0),
      ),
      cc.hide(),
    ));
  },

  _showSoftRays(duration, delay) {
    this._showSoftRay(this._raySoftRedSprite, duration, delay + 0.05, cc.p(-40.0, 0.0), 80.0);
    this._showSoftRay(this._raySoftGreenSprite, duration, delay + 0.075, cc.p(0.0, 10.0), 100.0);
    this._showSoftRay(this._raySoftBlueSprite, duration, delay + 0.1, cc.p(40.0, 0.0), 90.0);
  },

  _showSoftRay(sprite, duration, delay, basePosition, rayOffset) {
    const rayOpacity = this._rayOpacity;
    const rayScale = this._rayScale;
    sprite.setVisible(false);
    sprite.runAction(cc.sequence(
      cc.delayTime(delay),
      cc.callFunc(() => {
        sprite.setPosition(basePosition.x, basePosition.y - rayOffset);
        sprite.setOpacity(0.0);
        sprite.setScale(rayScale);
        sprite.setScaleY(rayScale * 0.75);
        sprite.setVisible(true);
      }),
      cc.spawn(
        cc.fadeTo(duration, rayOpacity),
        cc.scaleTo(duration, rayScale, rayScale).easing(cc.easeCubicActionOut()),
        cc.moveBy(duration, 0.0, rayOffset).easing(cc.easeOut(2.0)),
        cc.sequence(
          cc.delayTime(duration * 0.5),
          cc.fadeTo(duration * 0.5, 0.0).easing(cc.easeCubicActionIn()),
        ),
      ),
      cc.hide(),
    ));
  },

  _showHardRays(duration, delay) {
    this._showHardRay(this._rayHardRedSprite, duration, delay + 0.05, cc.p(10.0, 0.0), 250.0);
    this._showHardRay(this._rayHardGreenSprite, duration, delay + 0.075, cc.p(30.0, 0.0), 160.0);
    this._showHardRay(this._rayHardBlueSprite, duration, delay + 0.1, cc.p(-35.0, 0.0), 200.0);

    const particles = this._particles;
    particles.stopSystem();
    particles.runAction(cc.sequence(
      cc.delayTime(delay),
      cc.callFunc(() => {
        particles.resetSystem();
      }),
      cc.delayTime(duration),
      cc.callFunc(() => {
        particles.stopSystem();
      }),
    ));
  },

  _showHardRay(sprite, duration, delay, basePosition, rayOffset) {
    const rayOpacity = this._rayOpacity;
    const rayScale = this._rayScale;
    sprite.setVisible(false);
    sprite.runAction(cc.sequence(
      cc.delayTime(delay),
      cc.callFunc(() => {
        sprite.setPosition(basePosition.x, basePosition.y - rayOffset * 0.2);
        sprite.setOpacity(rayOpacity);
        sprite.setScale(rayScale);
        sprite.setScaleY(rayScale * 0.5);
        sprite.setVisible(true);
      }),
      cc.spawn(
        cc.scaleTo(duration, rayScale, rayScale).easing(cc.easeExponentialOut()),
        cc.moveBy(duration, 0.0, rayOffset).easing(cc.easeCubicActionIn()),
        cc.sequence(
          cc.delayTime(duration * 0.5),
          cc.fadeTo(duration * 0.4, 0.0).easing(cc.easeCubicActionOut()),
        ),
      ),
      cc.hide(),
    ));
  },

  /* endregion ANIMATION */

});

PrismaticPlayCardNode.create = function (node) {
  if (node == null) {
    node = cc.pool.getFromPool(PrismaticPlayCardNode) || new PrismaticPlayCardNode();
  }
  return node;
};

module.exports = PrismaticPlayCardNode;
