//pragma PKGS: game
var RSX = require('app/data/resources');
var FXRaySprite = require('./FXRaySprite');

/****************************************************************************
 FXRay003Sprite
 var FXRay003Sprite = FXRaySprite
 FXRay003Sprite.create()
 ****************************************************************************/

var FXRay003Sprite = FXRaySprite.extend({
	ctor: function () {
		this._super(RSX.ray_003.frame);
	}
});

FXRay003Sprite.create = function (options, sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(FXRay003Sprite, options) || FXRaySprite.create(options, new FXRay003Sprite(options));
	}
	return sprite;
};

module.exports = FXRay003Sprite;
