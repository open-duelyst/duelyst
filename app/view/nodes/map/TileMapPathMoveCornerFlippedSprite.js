//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveCornerFlippedSprite
var TileMapPathMoveCornerFlippedSprite = TileMapScaledSprite
TileMapPathMoveCornerFlippedSprite.create()
 ****************************************************************************/

var TileMapPathMoveCornerFlippedSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_corner.frame);
		this.setFlippedY(true);
	}
});

TileMapPathMoveCornerFlippedSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveCornerFlippedSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerFlippedSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveCornerFlippedSprite;
