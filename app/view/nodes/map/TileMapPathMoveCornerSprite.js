//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveCornerSprite
var TileMapPathMoveCornerSprite = TileMapScaledSprite
TileMapPathMoveCornerSprite.create()
 ****************************************************************************/

var TileMapPathMoveCornerSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_corner.frame);
	}
});

TileMapPathMoveCornerSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveCornerSprite) || TileMapScaledSprite.create(new TileMapPathMoveCornerSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveCornerSprite;
