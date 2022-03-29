//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapLargeSprite
var TileMapLargeSprite = TileMapScaledSprite
TileMapLargeSprite.create()
 ****************************************************************************/

var TileMapLargeSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_large.frame);
	}
});

TileMapLargeSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapLargeSprite) || TileMapScaledSprite.create(new TileMapLargeSprite());
	}
	return sprite;
};

module.exports = TileMapLargeSprite;
