//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveCornerFromStartFlippedSprite
var TileMapPathMoveCornerFromStartFlippedSprite = TileMapScaledSprite
TileMapPathMoveCornerFromStartFlippedSprite.create()
 ****************************************************************************/

var TileMapPathMoveCornerFromStartFlippedSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_corner_from_start.frame);
		this.setFlippedY(true);
	}
});

TileMapPathMoveCornerFromStartFlippedSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveCornerFromStartFlippedSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerFromStartFlippedSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveCornerFromStartFlippedSprite;
