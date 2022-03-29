//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveStartSprite
var TileMapPathMoveStartSprite = TileMapScaledSprite
TileMapPathMoveStartSprite.create()
 ****************************************************************************/

var TileMapPathMoveStartSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_start.frame);
	}
});

TileMapPathMoveStartSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveStartSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveStartSprite;
