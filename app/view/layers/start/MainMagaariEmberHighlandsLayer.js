// pragma PKGS: MagaariEmberHighlands

const RSX = require('app/data/resources');
const PKGS = require('app/data/packages');
const Logger = require('app/common/logger');
const UtilsEngine = require('app/common/utils/utils_engine');
const audio_engine = require('app/audio/audio_engine');
const _ = require('underscore');
const FXCompositeLayer = require('../FXCompositeLayer');
const ParallaxLayer = require('../ParallaxLayer');
const BaseSprite = require('../../nodes/BaseSprite');
const BaseParticleSystem = require('../../nodes/BaseParticleSystem');
const FXFlockSprite = require('../../nodes/fx/FXFlockSprite');

/** **************************************************************************
 MainMagaariEmberHighlandsLayer
 *************************************************************************** */

const MainMagaariEmberHighlandsLayer = FXCompositeLayer.extend({

  /* region INITIALIZE */

  ctor() {
    // initialize properties that may be required in init
    this.parallaxLayer = ParallaxLayer.create();

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      // scene elements
      this.bg = BaseSprite.create(RSX.scene_magaari_ember_highlands_background.img);
      this.mg = BaseSprite.create(RSX.scene_magaari_ember_highlands_middleground.img);
      this.fg = BaseSprite.create(RSX.scene_magaari_ember_highlands_foreground.img);
      this.trees001 = BaseSprite.create(RSX.scene_magaari_ember_highlands_trees_001.img);
      this.trees002 = BaseSprite.create(RSX.scene_magaari_ember_highlands_trees_002.img);
      this.lightRay001 = BaseSprite.create(RSX.scene_magaari_ember_highlands_light_ray.img);
      this.lightRay002 = BaseSprite.create(RSX.scene_magaari_ember_highlands_light_ray.img);
      this.lightRay003 = BaseSprite.create(RSX.scene_magaari_ember_highlands_light_ray.img);
      this.vignette = BaseSprite.create(RSX.scene_magaari_ember_highlands_vignette.img);
      this.vignette.setAnchorPoint(1.0, 0.5);

      // additive blend the light ray
      this.lightRay001.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.lightRay002.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
      this.lightRay003.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

      // bird elements
      const birdOptions = {
        antiAlias: true,
        parallaxMode: true,
        boidFX: {
          antiAlias: true,
          spriteIdentifier: [
            RSX.ptcl_bird_001.img,
            RSX.ptcl_bird_002.img,
            RSX.ptcl_bird_003.img,
            RSX.ptcl_bird_004.img,
            RSX.ptcl_bird_005.img,
            RSX.ptcl_bird_006.img,
          ],
          type: 'Boid',
          scale: 0.2,
          blendSrc: 'SRC_ALPHA',
          blendDst: 'ONE',
        },
        moveDuration: 0.0,
        randomWeight: 0.15,
        steeringSpeed: 0.0025,
        speed: 30.0,
        minSpeed: 10.0,
        flockSpread: 20.0,
        flockRadius: 60.0,
      };

      birdOptions.numBoids = 20;
      this.birds1 = FXFlockSprite.create(birdOptions);

      birdOptions.numBoids = 6;
      this.birds2 = FXFlockSprite.create(birdOptions);

      // cloud elements
      const cloudOptions = {
        angled: true,
        liveForDistance: true,
        parallaxMode: true,
      };

      let cloudColor = cc.color(200, 200, 200);

      cloudOptions.plistFile = RSX.ptcl_cloud_001.plist;
      this.clouds1 = BaseParticleSystem.create(cloudOptions);
      this.clouds1.setStartColor(cloudColor);
      this.clouds1.setEndColor(cloudColor);
      this.clouds1.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

      cloudOptions.plistFile = RSX.ptcl_cloud_002.plist;
      this.clouds2 = BaseParticleSystem.create(cloudOptions);
      this.clouds2.setStartColor(cloudColor);
      this.clouds2.setEndColor(cloudColor);
      this.clouds2.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

      cloudColor = cc.color(150, 232, 255);

      cloudOptions.plistFile = RSX.ptcl_cloud_004.plist;
      this.clouds3 = BaseParticleSystem.create(cloudOptions);
      this.clouds3.setStartColor(cloudColor);
      this.clouds3.setEndColor(cloudColor);
      this.clouds3.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);

      // cloudColor = cc.color(50, 230, 255);

      cloudOptions.plistFile = RSX.ptcl_cloud_007.plist;
      this.clouds4 = BaseParticleSystem.create(cloudOptions);
      this.clouds4.setStartColor(cloudColor);
      this.clouds4.setEndColor(cloudColor);
      this.clouds4.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);

      this.getFXLayer().addChild(this.vignette, 1);
    });

    // do super ctor
    this._super();

    // setup scene
    this.getFXLayer().addChild(this.parallaxLayer, 0);
  },

  /* endregion INITIALIZE */

  /* region RESOURCES */

  getRequiredResources() {
    return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier('MagaariEmberHighlands'));
  },

  /* endregion RESOURCES */

  /* region SCENE */

  onEnter() {
    this._super();

    // set bloom
    const fx = this.getFX();
    this._lastBloomThreshold = fx.getBloomThreshold();
    this._bloomThreshold = 0.65;
    fx.setBloomThreshold(this._bloomThreshold);
    this._lastBloomIntensity = fx.getBloomIntensity();
    this._bloomIntensity = 1.25;
    fx.setBloomIntensity(this._bloomIntensity);
  },

  onExit() {
    this._super();

    // restore bloom
    const fx = this.getFX();
    if (this._lastBloomThreshold != null && fx.getBloomThreshold() === this._bloomThreshold) {
      fx.setBloomThreshold(this._lastBloomThreshold);
    }
    if (this._lastBloomIntensity != null && fx.getBloomThreshold() === this._bloomIntensity) {
      fx.setBloomThreshold(this._lastBloomIntensity);
    }
  },

  /* endregion SCENE */

  /* region LAYOUT */

  onResize() {
    this._super();

    // set self to middle of screen
    this.setPosition(UtilsEngine.getGSIWinCenterPosition());

    this.whenRequiredResourcesReady().then((requestId) => {
      if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

      const winWidth = UtilsEngine.getGSIWinWidth();
      const winHeight = UtilsEngine.getGSIWinHeight();
      let ratio;
      let offset;

      // vignette sizing
      this.vignette.setScale(Math.max(winWidth / this.vignette.getContentSize().width, winHeight / this.vignette.getContentSize().height));
      this.vignette.setPosition(winWidth * 0.5, 0.0);

      // background
      this.parallaxLayer.setParallaxScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.bg));
      const parallaxScale = this.parallaxLayer.getParallaxScale();
      const contentSize = this.bg.getContentSize();

      // bg
      this.bg.setScale(parallaxScale);
      ratio = cc.p(0.00, 0.00);
      offset = cc.p(0.0, 0.0);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.bg, 0, ratio, offset);

      // middleground 1
      this.mg.setScale(parallaxScale);
      ratio = cc.p(0.002, 0.001);
      offset = cc.p(winWidth * 0.235, winHeight * 0.52 - this.mg.getContentSize().height * (0.5 - ratio.y) * parallaxScale);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.mg, 0, ratio, offset);

      // light rays
      this.lightRay001.setScale(parallaxScale);
      ratio = cc.p(0.00, 0.00);
      offset = cc.p(winWidth * 0.235, winHeight * 0.52);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.lightRay001, 0, ratio, offset);
      this.lightRay001.stopAllActions();
      this.lightRay001.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(15.0), cc.fadeIn(15.0))));

      this.lightRay002.setScale(parallaxScale);
      ratio = cc.p(0.00, 0.00);
      offset = cc.p(0.0, winHeight * 0.52 - this.lightRay002.getContentSize().height * 0.1 * parallaxScale);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.lightRay002, 0, ratio, offset);
      this.lightRay002.stopAllActions();
      this.lightRay002.stopAllActions();
      this.lightRay002.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(10.0), cc.fadeIn(10.0))));

      this.lightRay003.setScale(parallaxScale);
      ratio = cc.p(0.00, 0.00);
      offset = cc.p(-winWidth * 0.15, winHeight * 0.52 + this.lightRay002.getContentSize().height * 0.05 * parallaxScale);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.lightRay003, 0, ratio, offset);
      this.lightRay003.setOpacity(0.0);
      this.lightRay003.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(17.0), cc.fadeOut(17.0))));

      // birds
      const birds1SourceScreenPosition = cc.p(winWidth * 0.1, -winHeight * 0.0);
      const birds1TargetScreenPosition = cc.p(winWidth * 0.1, -winHeight * 0.1);
      this.birds1.setSourceScreenPosition(birds1SourceScreenPosition);
      this.birds1.setTargetScreenPosition(birds1TargetScreenPosition);
      this.birds1.setRandomRange(cc.p(winWidth * 0.1, winHeight * 0.05));
      this.parallaxLayer.addOrUpdateParallaxedNode(
        this.birds1,
        0,
        cc.p(),
        cc.p(
          birds1SourceScreenPosition.x + (birds1TargetScreenPosition.x - birds1SourceScreenPosition.x) * 0.5,
          birds1SourceScreenPosition.y + (birds1TargetScreenPosition.y - birds1SourceScreenPosition.y) * 0.5,
        ),
      );

      const birds2SourceScreenPosition = cc.p(winWidth * 0.2, -winHeight * 0.0);
      const birds2TargetScreenPosition = cc.p(winWidth * 0.2, -winHeight * 0.2);
      this.birds2.setSourceScreenPosition(birds2SourceScreenPosition);
      this.birds2.setTargetScreenPosition(birds2TargetScreenPosition);
      this.birds2.setRandomRange(cc.p(winWidth * 0.1, winHeight * 0.05));
      this.parallaxLayer.addOrUpdateParallaxedNode(
        this.birds2,
        0,
        cc.p(),
        cc.p(
          birds2SourceScreenPosition.x + (birds2TargetScreenPosition.x - birds2SourceScreenPosition.x) * 0.5,
          birds2SourceScreenPosition.y + (birds2TargetScreenPosition.y - birds2SourceScreenPosition.y) * 0.5,
        ),
      );

      // trees
      this.trees001.setScale(parallaxScale);
      ratio = cc.p(0.0025, 0.00125);
      offset = cc.p(-winWidth * 0.45 + this.trees001.getContentSize().width * (0.5 - ratio.x) * parallaxScale, -winHeight * 0.61 + this.trees001.getContentSize().height * (0.5 - ratio.y) * parallaxScale);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.trees001, 0, ratio, offset);

      this.trees002.setScale(parallaxScale);
      ratio = cc.p(0.0075, 0.005);
      offset = cc.p(winWidth * 0.5 - this.fg.getContentSize().width * 0.4 * parallaxScale + this.trees002.getContentSize().width * (1.0 - ratio.x) * parallaxScale, -winHeight * 0.52 + this.trees002.getContentSize().height * (0.5 - ratio.y) * parallaxScale);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.trees002, 0, ratio, offset);

      // clouds
      this.clouds1.setSourceScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.55));
      this.clouds1.setTargetScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
      this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds1, 0, cc.p(), this.clouds1.getSourceScreenOffsetPosition());

      this.clouds2.setSourceScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.55));
      this.clouds2.setTargetScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
      this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds2, 0, cc.p(), this.clouds2.getSourceScreenOffsetPosition());

      this.clouds3.setSourceScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.55));
      this.clouds3.setTargetScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
      this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds3, 0, cc.p(), this.clouds3.getSourceScreenOffsetPosition());

      this.clouds4.setSourceScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.55));
      this.clouds4.setTargetScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
      this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds4, 0, cc.p(), this.clouds4.getSourceScreenOffsetPosition());

      // foreground
      this.fg.setScale(parallaxScale);
      ratio = cc.p(0.02, 0.01);
      offset = cc.p(winWidth * 0.5 - this.fg.getContentSize().width * (0.5 - ratio.x) * parallaxScale, -winHeight * 0.52 + this.fg.getContentSize().height * (0.5 - ratio.y) * parallaxScale);
      this.parallaxLayer.addOrUpdateParallaxedNode(this.fg, 0, ratio, offset);

      // reset parallax
      this.parallaxLayer.resetParallax();
    });
  },

  /* endregion LAYOUT */

  playMusic() {
    audio_engine.current().play_music(RSX.music_ageofdisjunction.audio);
  },
});

MainMagaariEmberHighlandsLayer.create = function (layer) {
  return FXCompositeLayer.create(layer || new MainMagaariEmberHighlandsLayer());
};

module.exports = MainMagaariEmberHighlandsLayer;
