//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveEndFromStartSprite
var TileMapPathMoveEndFromStartSprite = TileMapScaledSprite
TileMapPathMoveEndFromStartSprite.create()
 ****************************************************************************/

var TileMapPathMoveEndFromStartSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_end_from_start.frame);
	}
});

TileMapPathMoveEndFromStartSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveEndFromStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveEndFromStartSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveEndFromStartSprite;
