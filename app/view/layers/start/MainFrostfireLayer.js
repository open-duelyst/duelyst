//pragma PKGS: FrostfireMainMenu

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
 MainFrostfireLayer
 ****************************************************************************/

var MainFrostfireLayer = FXCompositeLayer.extend({

	/* region INITIALIZE */

	ctor:function () {
		// initialize properties that may be required in init
		this.parallaxLayer = ParallaxLayer.create();

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// scene elements
			this.bg = BaseSprite.create(RSX.scene_frostfire_background.img);
			this.pillar1 = BaseSprite.create(RSX.scene_frostfire_pillars_far.img);
			this.pillar2 = BaseSprite.create(RSX.scene_frostfire_pillars_near.img);
			this.fg = BaseSprite.create(RSX.scene_frostfire_foreground.img);
			this.vignette = BaseSprite.create(RSX.scene_frostfire_vignette.img);
			this.vignette.setAnchorPoint(0.0, 0.5);

			this.lanternsSmall1 = new BaseParticleSystem({
				plistFile: RSX.scene_frostfire_lantern_small_particles.plist,
				fadeInAtLifePct:0.05,
				fadeOutAtLifePct:0.95,
				parallaxMode: true
			})
			this.lanternsSmall2 = new BaseParticleSystem({
				plistFile: RSX.scene_frostfire_lantern_small_particles.plist,
				fadeInAtLifePct:0.05,
				fadeOutAtLifePct:0.95,
				parallaxMode: true
			})
			this.lanternsLarge1 = new BaseParticleSystem({
				plistFile: RSX.scene_frostfire_lantern_large_1_particles.plist,
				fadeInAtLifePct:0.05,
				fadeOutAtLifePct:0.95,
				parallaxMode: true
			})
			this.lanternsLarge2 = new BaseParticleSystem({
				plistFile: RSX.scene_frostfire_lantern_large_2_particles.plist,
				fadeInAtLifePct:0.05,
				fadeOutAtLifePct:0.95,
				parallaxMode: true
			})
			this.lanternsLarge3 = new BaseParticleSystem({
				plistFile: RSX.scene_frostfire_lantern_large_3_particles.plist,
				fadeInAtLifePct:0.05,
				fadeOutAtLifePct:0.95,
				parallaxMode: true
			})

			this.stars = new BaseParticleSystem({
				plistFile: RSX.scene_frostfire_stars_particles.plist,
				fadeInAtLifePct:0.10,
				fadeOutAtLifePct:0.90
			})

			// cloud elements
			var cloudOptions = {
				angled: true,
				liveForDistance: true,
				parallaxMode: true,
				fadeInAtLifePct:0.05
			};

			var cloudColor = cc.color(99,64,116)
			var cloudEndColor = cc.color(51,125,195)

			cloudOptions.plistFile = RSX.ptcl_cloud_001.plist;
			this.clouds1 = BaseParticleSystem.create(cloudOptions);
			this.clouds1.setStartColor(cc.color(49,117,187))
			this.clouds1.setEndColor(cloudEndColor)
			this.clouds1.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			cloudOptions.plistFile = RSX.ptcl_cloud_002.plist;
			this.clouds2 = BaseParticleSystem.create(cloudOptions);
			this.clouds2.setStartColor(cc.color(49,117,187))
			this.clouds2.setEndColor(cloudEndColor)
			this.clouds2.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			cloudOptions.plistFile = RSX.ptcl_cloud_004.plist;
			this.clouds3 = BaseParticleSystem.create(cloudOptions);
			this.clouds3.setStartColor(cloudColor)
			this.clouds3.setEndColor(cloudEndColor)
			this.clouds3.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			cloudOptions.plistFile = RSX.ptcl_cloud_007.plist;
			this.clouds4 = BaseParticleSystem.create(cloudOptions);
			this.clouds4.setStartColor(cloudColor)
			this.clouds4.setEndColor(cloudEndColor)
			this.clouds4.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)

			this.getFXLayer().addChild(this.vignette, 2)

		}.bind(this));

		// do super ctor
		this._super();

		// setup scene
		this.getFXLayer().addChild(this.parallaxLayer, 0);
	},

	/* endregion INITIALIZE */

	/* region RESOURCES */

	getRequiredResources: function () {
		return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("FrostfireMainMenu"));
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
			// this.vignette.setScaleX(winWidth / this.vignette.getContentSize().width);
			this.vignette.setScaleY(winHeight / this.vignette.getContentSize().height);
			this.vignette.setPosition(-winWidth * 0.6,0)

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

			// middleground 1
			this.pillar1.setScale(parallaxScale);
			this.pillar1.setAnchorPoint(0,0.5)
			ratio = cc.p(0.0025, 0.0025);
			offset = cc.p(-winWidth * 0.55, -winHeight * 0.5 + this.pillar1.getContentSize().height * (0.475 - ratio.y) * this.pillar1.getScale());
			this.parallaxLayer.addOrUpdateParallaxedNode(this.pillar1, 2, ratio, offset);

			// middleground 2
			this.pillar2.setScale(parallaxScale);
			this.pillar2.setAnchorPoint(0,0.5)
			ratio = cc.p(0.0045, 0.00125);
			offset = cc.p(-winWidth * 0.55, -winHeight * 0.5 + this.pillar2.getContentSize().height * (0.475 - ratio.y) * this.pillar2.getScale());
			this.parallaxLayer.addOrUpdateParallaxedNode(this.pillar2, 2, ratio, offset);

			//
			this.parallaxLayer.addOrUpdateParallaxedNode(this.stars, 0, cc.p(), cc.p(winWidth/3, winHeight * 0.3))

			// lanterns
			this.parallaxLayer.addOrUpdateParallaxedNode(this.lanternsSmall1, 1, cc.p(), cc.p(0,winHeight * 0.3))
			this.parallaxLayer.addOrUpdateParallaxedNode(this.lanternsSmall2, 1, cc.p(), cc.p(200,winHeight * 0.3 - 50))
			this.parallaxLayer.addOrUpdateParallaxedNode(this.lanternsLarge1, 1, cc.p(), cc.p(0,winHeight * 0.3))
			this.parallaxLayer.addOrUpdateParallaxedNode(this.lanternsLarge2, 1, cc.p(), cc.p(-200,winHeight * 0.3 + 50))
			this.parallaxLayer.addOrUpdateParallaxedNode(this.lanternsLarge3, 1, cc.p(), cc.p(100,winHeight * 0.3))

			// clouds
			this.clouds1.setSourceScreenPosition(cc.p(winWidth * 0.1, -winHeight * 0.4));
			this.clouds1.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds1, 3, cc.p(), this.clouds1.getSourceScreenOffsetPosition());

			this.clouds2.setSourceScreenPosition(cc.p(winWidth * 0.1, -winHeight * 0.4));
			this.clouds2.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds2, 3, cc.p(), this.clouds2.getSourceScreenOffsetPosition());

			this.clouds3.setSourceScreenPosition(cc.p(winWidth * 0.1, -winHeight * 0.4));
			this.clouds3.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds3, 3, cc.p(), this.clouds3.getSourceScreenOffsetPosition());

			this.clouds4.setSourceScreenPosition(cc.p(winWidth * 0.1, -winHeight * 0.4));
			this.clouds4.setTargetScreenPosition(cc.p(-winWidth * 0.5, -winHeight * 0.45));
			this.parallaxLayer.addOrUpdateParallaxedNode(this.clouds4, 3, cc.p(), this.clouds4.getSourceScreenOffsetPosition());

			// foreground
			this.fg.setScale(parallaxScale);
			this.fg.setAnchorPoint(1.0,0.5)
			ratio = cc.p(0.02, 0.01);
			offset = cc.p(winWidth * 0.55, -winHeight * 0.55 + this.fg.getContentSize().height * (0.5 - ratio.y) * this.fg.getScale());
			this.parallaxLayer.addOrUpdateParallaxedNode(this.fg, 4, ratio, offset);

			// reset parallax
			this.parallaxLayer.resetParallax();
		}.bind(this));
	},

	/* endregion LAYOUT */

	playMusic: function () {
		audio_engine.current().play_music(RSX.music_ageofdisjunction.audio);
	}
});

MainFrostfireLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new MainFrostfireLayer());
};

module.exports = MainFrostfireLayer;
