//pragma PKGS: game
var RSX = require('app/data/resources');
var FXRaySprite = require('./FXRaySprite');

/****************************************************************************
 FXRay002Sprite
 var FXRay002Sprite = FXRaySprite
 FXRay002Sprite.create()
 ****************************************************************************/

var FXRay002Sprite = FXRaySprite.extend({
	ctor: function () {
		this._super(RSX.ray_002.frame);
	}
});

FXRay002Sprite.create = function (options, sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(FXRay002Sprite, options) || FXRaySprite.create(options, new FXRay002Sprite(options));
	}
	return sprite;
};

module.exports = FXRay002Sprite;
