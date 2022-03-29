//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileGlowSprite
var TileGlowSprite = BaseSprite
TileGlowSprite.create()
 ****************************************************************************/

var TileGlowSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_glow.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileGlowSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileGlowSprite) || BaseSprite.create(null, new TileGlowSprite());
	}
	return sprite;
};

module.exports = TileGlowSprite;
