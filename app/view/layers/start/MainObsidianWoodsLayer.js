//pragma PKGS: ObsidianWoods

var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var Logger = require('app/common/logger');
var UtilsEngine = require("app/common/utils/utils_engine");
var audio_engine = require("app/audio/audio_engine");
var FXCompositeLayer = require("./../FXCompositeLayer");
var ParallaxLayer = require("./../ParallaxLayer");
var BaseSprite = require("./../../nodes/BaseSprite");
var BaseParticleSystem = require("./../../nodes/BaseParticleSystem");
var FXFlockSprite = require("./../../nodes/fx/FXFlockSprite");

var _ = require("underscore");

/****************************************************************************
 MainObsidianWoodsLayer
 ****************************************************************************/

var MainObsidianWoodsLayer = FXCompositeLayer.extend({

	/* region INITIALIZE */

	ctor:function () {
		// initialize properties that may be required in init
		this.parallaxLayer = ParallaxLayer.create();

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// scene elements
			this.bg = BaseSprite.create(RSX.scene_obsidian_woods_background.img);
			this.lightRay = BaseSprite.create(RSX.obsidian_woods_light_ray.img);
			this.pillar = BaseSprite.create(RSX.obsidian_woods_pillar.img);
			this.fg = BaseSprite.create(RSX.obsidian_woods_cliff.img);
			this.vignette = BaseSprite.create(RSX.obsidian_woods_vignette.img);

			// additive blend the light ray
			this.lightRay.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

			// bird elements
			var birdOptions = {
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
						RSX.ptcl_bird_006.img
					],
					type: "Boid",
					scale: 0.2,
					blendSrc: "SRC_ALPHA",
					blendDst: "ONE"
				},
				moveDuration: 0.0,
				randomWeight: 0.15,
				steeringSpeed: 0.0025,
				speed: 30.0,
				minSpeed: 10.0,
				flockSpread: 20.0,
				flockRadius: 60.0
			};

			birdOptions.numBoids = 20;
			this.birds1 = FXFlockSprite.create(birdOptions);

			birdOptions.numBoids = 6;
			this.birds2 = FXFlockSprite.create(birdOptions);

			// cloud elements
			var cloudOptions = {
				angled: true,
				liveForDistance: true,
				parallaxMode: true
			};

			var cloudColor = cc.color(40,192,198);

			cloudOptions.plistFile = RSX.ptcl_cloud_001.plist;
			this.clouds1 = BaseParticleSystem.create(cloudOptions);
			this.clouds1.setStartColor(cloudColor)
			this.clouds1.setEndColor(cloudColor)
			this.clouds1.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			cloudOptions.plistFile = RSX.ptcl_cloud_002.plist;
			this.clouds2 = BaseParticleSystem.create(cloudOptions);
			this.clouds2.setStartColor(cloudColor)
			this.clouds2.setEndColor(cloudColor)
			this.clouds2.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			cloudOptions.plistFile = RSX.ptcl_cloud_004.plist;
			this.clouds3 = BaseParticleSystem.create(cloudOptions);
			this.clouds3.setStartColor(cloudColor)
			this.clouds3.setEndColor(cloudColor)
			this.clouds3.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			cloudOptions.plistFile = RSX.ptcl_cloud_007.plist;
			this.clouds4 = BaseParticleSystem.create(cloudOptions);
			this.clouds4.setStartColor(cloudColor)
			this.clouds4.setEndColor(cloudColor)
			this.clouds4.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			this.getFXLayer().addChild(this.vignette, 1)
		}.bind(this));

		// do super ctor
		this._super();

		// setup scene
		this.getFXLayer().addChild(this.parallaxLayer, 0);
	},

	/* endregion INITIALIZE */

	/* region RESOURCES */

	getRequiredResources: function () {
		return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("ObsidianWoods"));
	},

	/* endregion RESOURCES */

	/* region SCENE */

	onEnter: function () {
		this._super();

		// set bloom
		var fx = this.getFX();
		this._lastBloomThreshold = fx.getBloomThreshold();
		this._bloomThreshold = 0.65;
		fx.setBloomThreshold(this._bloomThreshold);
		this._lastBloomIntensity = fx.getBloomIntensity();
		this._bloomIntensity = 1.25;
		fx.setBloomIntensity(this._bloomIntensity);
	},

	onExit: function () {
		this._super();

		// restore bloom
		var fx = this.getFX();
		if (this._lastBloomThreshold != null && fx.getBloomThreshold() === this._bloomThreshold) {
			fx.setBloomThreshold(this._lastBloomThreshold);
		}
		if (this._lastBloomIntensity != null && fx.getBloomThreshold() === this._bloomIntensity) {
			fx.setBloomThreshold(this._lastBloomIntensity);
		}
	},

	/* endregion SCENE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		// set self to middle of screen
		this.setPosition(UtilsEngine.getGSIWinCenterPosition());

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			var winWidth = UtilsEngine.getGSIWinWidth();
			var winHeight = UtilsEngine.getGSIWinHeight();
			var ratio;
			var offset;
			var shiftX;

			// vignette sizing
			this.vignette.setScaleX(winWidth / this.vignette.getContentSize().width);
			this.vignette.setScaleY(winHeight / this.vignette.getContentSize().height);

			// background
			this.parallaxLayer.setParallaxScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.bg));
			var parallaxScale = this.parallaxLayer.getParallaxScale();
			var contentSize = this.bg.getContentSize();
			shiftX = (winWidth - contentSize.width * parallaxScale) * 0.5;

			// bg
			this.bg.setScale(parallaxScale);
			ratio = cc.p(0.00, 0.00);
			offset = cc.p(0.0, 0.0);
			this.parallaxLayer.addOrUpdateParallaxedNode(this.bg, 0, ratio, offset);

			// light ray
			this.lightRay.setScale(parallaxScale);
			ratio = cc.p(0.00, 0.00);
			offset = cc.p(this.lightRay.getContentSize().width / 7, this.lightRay.getContentSize().height / 3 * this.lightRay.getScale());
			this.parallaxLayer.addOrUpdateParallaxedNode(this.lightRay, 0, ratio, offset);

			this.lightRay.stopAllActions()
			this.lightRay.runAction(cc.repeatForever(
				cc.sequence(
					cc.fadeOut(10.0),
					cc.fadeIn(10.0)
				)
			))

			// middleground 1
			this.pillar.setScale(parallaxScale);
			ratio = cc.p(0.0025, 0.00125);
			offset = cc.p(winWidth / 2 * 0.9, -winHeight * 0.4 + this.pillar.getContentSize().height * (0.475 - ratio.y) * this.pillar.getScale());
			this.parallaxLayer.addOrUpdateParallaxedNode(this.pillar, 0, ratio, offset);

			// birds
			var birds1SourceScreenPosition = cc.p(winWidth * 0.1, -winHeight * 0.0);
			var birds1TargetScreenPosition = cc.p(winWidth * 0.1, -winHeight * 0.1);
			this.birds1.setSourceScreenPosition(birds1SourceScreenPosition);
			this.birds1.setTargetScreenPosition(birds1TargetScreenPosition);
			this.birds1.setRandomRange(cc.p(winWidth * 0.1, winHeight * 0.05));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.birds1, 0, cc.p(),
				cc.p(
					birds1SourceScreenPosition.x + (birds1TargetScreenPosition.x - birds1SourceScreenPosition.x) * 0.5,
					birds1SourceScreenPosition.y + (birds1TargetScreenPosition.y - birds1SourceScreenPosition.y) * 0.5
				)
			);

			var birds2SourceScreenPosition = cc.p(winWidth * 0.2, -winHeight * 0.0);
			var birds2TargetScreenPosition = cc.p(winWidth * 0.2, -winHeight * 0.2);
			this.birds2.setSourceScreenPosition(birds2SourceScreenPosition);
			this.birds2.setTargetScreenPosition(birds2TargetScreenPosition);
			this.birds2.setRandomRange(cc.p(winWidth * 0.1, winHeight * 0.05));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.birds2, 0, cc.p(),
				cc.p(
					birds2SourceScreenPosition.x + (birds2TargetScreenPosition.x - birds2SourceScreenPosition.x) * 0.5,
					birds2SourceScreenPosition.y + (birds2TargetScreenPosition.y - birds2SourceScreenPosition.y) * 0.5
				)
			);

			// clouds
			this.clouds1.setSourceScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
			this.clouds1.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds1, 0, cc.p(), this.clouds1.getSourceScreenOffsetPosition());

			this.clouds2.setSourceScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
			this.clouds2.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds2, 0, cc.p(), this.clouds2.getSourceScreenOffsetPosition());

			this.clouds3.setSourceScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
			this.clouds3.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds3, 0, cc.p(), this.clouds3.getSourceScreenOffsetPosition());

			this.clouds4.setSourceScreenPosition(cc.p(winWidth * 0.5, -winHeight * 0.25));
			this.clouds4.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds4, 0, cc.p(), this.clouds4.getSourceScreenOffsetPosition());

			// foreground
			this.fg.setScale(parallaxScale);
			ratio = cc.p(0.02, 0.01);
			offset = cc.p(-winWidth * 0.65 + this.fg.getContentSize().width * (0.65 - ratio.x) * this.fg.getScale(), -winHeight * 0.55 + this.fg.getContentSize().height * (0.5 - ratio.y) * this.fg.getScale());
			this.parallaxLayer.addOrUpdateParallaxedNode(this.fg, 0, ratio, offset);

			// reset parallax
			this.parallaxLayer.resetParallax();
		}.bind(this));
	},

	/* endregion LAYOUT */

	playMusic: function () {
		audio_engine.current().play_music(RSX.music_ageofdisjunction.audio);
	}
});

MainObsidianWoodsLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new MainObsidianWoodsLayer());
};

module.exports = MainObsidianWoodsLayer;
