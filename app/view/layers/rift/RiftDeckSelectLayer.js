//pragma PKGS: play
var RSX = require('app/data/resources');
var PKGS = require('app/data/packages');
var Logger = require('app/common/logger');
var UtilsEngine = require("./../../../common/utils/utils_engine");
var FXCompositeLayer = require("./../FXCompositeLayer");
var BaseSprite = require("./../../nodes/BaseSprite");
var FXRiftFireSprite = require('app/view/nodes/fx/FXRiftFireSprite')

/****************************************************************************
 RiftDeckSelectLayer
 ****************************************************************************/

var RiftDeckSelectLayer = FXCompositeLayer.extend({

	_bg: null,

	/* region INITIALIZE */

	ctor:function () {
		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// scene elements
			this._bg = BaseSprite.create(RSX.play_background.img);

			//
			this.riftFire = new FXRiftFireSprite()
			this.riftFire.setPosition(0,0);
			this.riftFire.setBlendFunc(cc.SRC_ALPHA, cc.ONE);

			var winSize = UtilsEngine.getGSIWinSize()
			this.riftFire.setPosition(0,-winSize.height/2)
			this.riftFire.setScale(
				winSize.width/this.riftFire.getTextureRect().width,
				(winSize.height*0.75)/this.riftFire.getTextureRect().height
			)

			// setup scene
			this.getFXLayer().addChild(this._bg);
			this.getNoFXLayer().addChild(this.riftFire);
		}.bind(this));

		// do super ctor
		this._super();
	},

	getRequiredResources: function () {
		return FXCompositeLayer.prototype.getRequiredResources.call(this).concat(PKGS.getPkgForIdentifier("play"));
	},

	/* endregion INITIALIZE */

	/* region LAYOUT */

	onResize: function () {
		this._super();

		var winCenterPosition = UtilsEngine.getGSIWinCenterPosition();

		// set self to middle of screen
		this.setPosition(winCenterPosition);

		this.whenRequiredResourcesReady().then(function (requestId) {
			if (!this.getAreResourcesValid(requestId)) return; // load invalidated or resources changed

			// background
			this._bg.setScale(UtilsEngine.getWindowSizeRelativeNodeScale(this._bg));
		}.bind(this));
	}

	/* endregion LAYOUT */

});

RiftDeckSelectLayer.create = function(layer) {
	return FXCompositeLayer.create(layer || new RiftDeckSelectLayer());
};

module.exports = RiftDeckSelectLayer;
