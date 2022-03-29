var BaseSprite = require('./../BaseSprite');

/****************************************************************************
FXRaySprite
var FXRaySprite = BaseSprite
FXRaySprite.create()
 ****************************************************************************/

var FXRaySprite = BaseSprite.extend({

	ctor: function (options) {
		this._super(options);
		this.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

FXRaySprite.create = function (options, sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(FXRaySprite, options) || BaseSprite.create(options, new FXRaySprite(options));
	}
	return sprite;
};

module.exports = FXRaySprite;
