//pragma PKGS: preloader

var Logger = require('app/common/logger');
var CONFIG = require('app/common/config');
var RSX = require("app/data/resources");
var UtilsEngine = require("./../../../common/utils/utils_engine");
var FXCompositeLayer = require("./../FXCompositeLayer");
var ParallaxLayer = require("./../ParallaxLayer");
var BaseSprite = require("./../../nodes/BaseSprite");
var BaseParticleSystem = require("./../../nodes/BaseParticleSystem");

var PILLAR_RESOURCES_BY_SIDE = {
	left: [
		RSX.scene_load_pillar_left_001,
		RSX.scene_load_pillar_left_002,
		RSX.scene_load_pillar_left_003,
		RSX.scene_load_pillar_left_004,
		RSX.scene_load_pillar_left_005,
		RSX.scene_load_pillar_left_006,
		RSX.scene_load_pillar_left_007,
		RSX.scene_load_pillar_left_008
	],
	right: [
		RSX.scene_load_pillar_right_001,
		RSX.scene_load_pillar_right_002,
		RSX.scene_load_pillar_right_003,
		RSX.scene_load_pillar_right_004,
		RSX.scene_load_pillar_right_005,
		RSX.scene_load_pillar_right_006,
		RSX.scene_load_pillar_right_007,
		RSX.scene_load_pillar_right_008
	]
};

/****************************************************************************
 LoadLayer
 ****************************************************************************/

var LoadLayer = FXCompositeLayer.extend({

	maxParallaxRatio: null,
	numPillarsPerSide: 8,
	pillars: null,

	/* region INITIALIZE */

	ctor:function () {
		// initialize properties that may be required in init
		this.pillars = [];
		this.maxParallaxRatio = cc.p(0.2, 0.08);
		this.parallaxLayer = ParallaxLayer.create();

		// scene elements
		this.bg = BaseSprite.create(RSX.scene_load_background.img);
		this.platform = BaseSprite.create(RSX.scene_load_platform.img);

		// loading progress label
		this.progress_label = new cc.LabelTTF("0%", RSX.font_light.name, 24, cc.size(100, 40), cc.TEXT_ALIGNMENT_RIGHT);
		this.progress_label.setFontFillColor({r: 255, g: 255, b: 255});

		// pillars
		var totalNumPillars = this.numPillarsPerSide * 2;
		for (var i = 1; i <= totalNumPillars; i += 2) {
			var index = Math.ceil(i / 2) - 1;

			// left
			var pillarSprite = BaseSprite.create(PILLAR_RESOURCES_BY_SIDE.left[index].img);
			pillarSprite.setVisible(false);
			pillarSprite.setOpacity(0.0);
			this.pillars[i - 1] = pillarSprite;

			// right
			pillarSprite = BaseSprite.create(PILLAR_RESOURCES_BY_SIDE.right[index].img);
			pillarSprite.setVisible(false);
			pillarSprite.setOpacity(0.0);
			this.pillars[i] = pillarSprite;
		}

		// birds flying to platform
		var birdToOptions = {
			angled: true,
			directionAligned: true,
			parallaxMode: true,
			fadeInAtLifePct: 0.25,
			friction: cc.p(1.0075, 1.0075)
		};

		birdToOptions.plistFile = RSX.ptcl_bird_003.plist;
		this.birds3 = BaseParticleSystem.create(birdToOptions);

		birdToOptions.plistFile = RSX.ptcl_bird_004.plist;
		this.birds4 = BaseParticleSystem.create(birdToOptions);

		// birds flying up
		var birdUpOptions = {
			angled: true,
			directionAligned: true,
			liveForDistance: true,
			parallaxMode: true
		};
		birdUpOptions.plistFile = RSX.ptcl_bird_001.plist;
		this.birds1 = BaseParticleSystem.create(birdUpOptions);

		birdUpOptions.plistFile = RSX.ptcl_bird_002.plist;
		this.birds2 = BaseParticleSystem.create(birdUpOptions);

		// do super ctor
		this._super();

		// setup scene
		this.getFXLayer().addChild(this.parallaxLayer);
		this.getNoFXLayer().addChild(this.progress_label);
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		var parallaxNode = this.parallaxLayer.parallaxNode;
		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();
		var winWidth = UtilsEngine.getGSIWinWidth();
		var winHeight = UtilsEngine.getGSIWinHeight();
		var ratio;
		var offset;

		// set self to middle of screen
		this.setPosition(winCenterPosition);

		// background
		this.parallaxLayer.setParallaxScale(UtilsEngine.getWindowSizeRelativeNodeScale(this.bg));
		var parallaxScale = this.parallaxLayer.getParallaxScale();
		this.bg.setScale(parallaxScale);
		ratio = cc.p(0.00, 0.00);
		offset = cc.p(0.0, 0.0);
		this.parallaxLayer.addOrUpdateParallaxedNode(this.bg, 0, ratio, offset);

		// pillars
		var totalNumPillars = this.numPillarsPerSide * 2;
		for (var i = 1; i <= totalNumPillars; i += 2) {
			// left
			var sprite = this.pillars[i - 1];
			sprite.setScale(parallaxScale);
			var pillarPct = i / totalNumPillars;
			var pillarPctSmoothed = Math.pow(pillarPct, 3.0);
			var ratioPct = Math.pow(pillarPct, 8.0) * 0.75;
			ratio = cc.p(this.maxParallaxRatio.x * ratioPct, this.maxParallaxRatio.y * ratioPct);
			offset = cc.p(winWidth * (0.1 - ratioPct * 0.15 - pillarPctSmoothed * 0.575), winHeight * (-0.2 + pillarPctSmoothed * 0.25));
			this.parallaxLayer.addOrUpdateParallaxedNode(sprite, i, ratio, offset);

			// right
			sprite = this.pillars[i];
			pillarPct = (i + 1) / totalNumPillars;
			pillarPctSmoothed = Math.pow(pillarPct, 2.0);
			ratioPct = Math.pow(pillarPct, 8.0) * 0.75;
			ratio = cc.p(this.maxParallaxRatio.x * ratioPct, this.maxParallaxRatio.y * ratioPct);
			offset = cc.p(winWidth * (0.2 + ratioPct * 0.15 + pillarPctSmoothed * 0.2), winHeight * (-0.2 + pillarPctSmoothed * 0.2));
			sprite.setScale(parallaxScale + Math.max(ratio.x, ratio.y) * 0.5);
			this.parallaxLayer.addOrUpdateParallaxedNode(sprite, i, ratio, offset);
		}

		// birds flying to platform
		this.birds3.setSourceScreenPosition(cc.p(winWidth * 0.15, -winHeight * 0.25));
		this.birds3.setTargetScreenPosition(cc.p(-winWidth * 0.05, -winHeight * 0.75));
		this.parallaxLayer.addOrUpdateParallaxedNode(this.birds3, totalNumPillars - 3, cc.p(), this.birds3.getSourceScreenOffsetPosition());

		this.birds4.setSourceScreenPosition(cc.p(winWidth * 0.15, -winHeight * 0.25));
		this.birds4.setTargetScreenPosition(cc.p(-winWidth * 0.05, -winHeight * 0.75));
		this.parallaxLayer.addOrUpdateParallaxedNode(this.birds4, totalNumPillars - 3, cc.p(), this.birds4.getSourceScreenOffsetPosition());

		// birds flying up
		this.birds1.setSourceScreenPosition(cc.p(-winWidth * 0.1, -winHeight));
		this.birds1.setTargetScreenPosition(cc.p(-winWidth * 0.1, winHeight));
		if (this.birds1.getParent() != parallaxNode) {
			if (this._birds1Action == null) {
				this._birds1Action = this.runAction(cc.sequence(
					cc.delayTime(6.0),
					cc.callFunc(function () {
						parallaxNode.addChild(this.birds1, totalNumPillars - 2.5, cc.p(), this.birds1.getSourceScreenOffsetPosition());
						this.parallaxLayer.forceParallaxUpdate();
					}, this)
				));
			}
		} else {
			parallaxNode.setChildParallaxRatioAndOffset(this.birds1, cc.p(), this.birds1.getSourceScreenOffsetPosition());
		}

		this.birds2.setSourceScreenPosition(cc.p(-winWidth * 0.1, -winHeight));
		this.birds2.setTargetScreenPosition(cc.p(-winWidth * 0.1, winHeight));
		if (this.birds2.getParent() != parallaxNode) {
			if (this._birds2Action == null) {
				this._birds2Action = this.runAction(cc.sequence(
					cc.delayTime(6.0),
					cc.callFunc(function () {
						parallaxNode.addChild(this.birds2, totalNumPillars - 2.5, cc.p(), this.birds2.getSourceScreenOffsetPosition());
						this.parallaxLayer.forceParallaxUpdate();
					}, this)
				));
			}
		} else {
			parallaxNode.setChildParallaxRatioAndOffset(this.birds2, cc.p(), this.birds2.getSourceScreenOffsetPosition());
		}

		// foreground
		this.platform.setScale(parallaxScale);
		ratio = cc.p(this.maxParallaxRatio.x * 0.2, this.maxParallaxRatio.y * 0.2);
		offset = cc.p(-winWidth * 0.5 + this.platform.getContentSize().width * (0.5 - ratio.x) * this.platform.getScale(), -winHeight * 0.5 + this.platform.getContentSize().height * (0.5 - ratio.y * 2.0) * this.platform.getScale());
		this.parallaxLayer.addOrUpdateParallaxedNode(this.platform, totalNumPillars - 2, ratio, offset);

		// progress label
		this.progress_label.setPosition(-20.0, -50.0);

		// start parallax
		this.parallaxLayer.resetParallax();
	},

	/* endregion LAYOUT */

	/* region GETTERS / SETTERS */

	showLoadProgress: function (progress) {
		// reveal pillars with progress
		var maxPillarIndex = Math.round((this.numPillarsPerSide * 2 - 1) * progress) + 1;
		for (var i = 0; i < maxPillarIndex; i++) {
			var pillarSprite = this.pillars[i];
			if (!pillarSprite.isVisible()) {
				pillarSprite.setVisible(true);
				pillarSprite.runAction(cc.fadeIn(CONFIG.FADE_MEDIUM_DURATION));
			}
		}

		// show progress as a percentage
		var currentString = this.progress_label.getString();
		var progressString = Math.round(progress * 100.0) + "%";
		if (progressString != currentString) {
			this.progress_label.setString(progressString);
		}
	}

	/* endregion GETTERS / SETTERS */

});

LoadLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new LoadLayer());
};


module.exports = LoadLayer;
