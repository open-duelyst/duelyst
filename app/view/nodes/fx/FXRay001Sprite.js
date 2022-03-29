//pragma PKGS: game
var RSX = require('app/data/resources');
var FXRaySprite = require('./FXRaySprite');

/****************************************************************************
FXRay001Sprite
var FXRay001Sprite = FXRaySprite
FXRay001Sprite.create()
 ****************************************************************************/

var FXRay001Sprite = FXRaySprite.extend({
	ctor: function () {
		this._super(RSX.ray_001.frame);
	}
});

FXRay001Sprite.create = function (options, sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(FXRay001Sprite, options) || FXRaySprite.create(options, new FXRay001Sprite(options));
	}
	return sprite;
};

module.exports = FXRay001Sprite;
