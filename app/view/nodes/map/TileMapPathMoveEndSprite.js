//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveEndSprite
var TileMapPathMoveEndSprite = TileMapScaledSprite
TileMapPathMoveEndSprite.create()
 ****************************************************************************/

var TileMapPathMoveEndSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_end.frame);
	}
});

TileMapPathMoveEndSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveEndSprite) || TileMapScaledSprite.create(new TileMapPathMoveEndSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveEndSprite;
