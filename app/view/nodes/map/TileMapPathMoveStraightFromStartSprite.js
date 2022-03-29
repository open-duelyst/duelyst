//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveStraightFromStartSprite
var TileMapPathMoveStraightFromStartSprite = TileMapScaledSprite
TileMapPathMoveStraightFromStartSprite.create()
 ****************************************************************************/

var TileMapPathMoveStraightFromStartSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_straight_from_start.frame);
	}
});

TileMapPathMoveStraightFromStartSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveStraightFromStartSprite) || TileMapScaledSprite.create(new TileMapPathMoveStraightFromStartSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveStraightFromStartSprite;
