//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapGridSprite
var TileMapGridSprite = TileMapScaledSprite
TileMapGridSprite.create()
 ****************************************************************************/

var TileMapGridSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_grid.frame);
	}
});

TileMapGridSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapGridSprite) || TileMapScaledSprite.create(new TileMapGridSprite());
	}
	return sprite;
};

module.exports = TileMapGridSprite;
