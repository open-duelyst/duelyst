//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveCornerFromStartSprite
var TileMapPathMoveCornerFromStartSprite = TileMapScaledSprite
TileMapPathMoveCornerFromStartSprite.create()
 ****************************************************************************/

var TileMapPathMoveCornerFromStartSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_corner_from_start.frame);
	}
});

TileMapPathMoveCornerFromStartSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveCornerFromStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerFromStartSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveCornerFromStartSprite;
