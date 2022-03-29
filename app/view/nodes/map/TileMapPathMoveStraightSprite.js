//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapPathMoveStraightSprite
var TileMapPathMoveStraightSprite = TileMapScaledSprite
TileMapPathMoveStraightSprite.create()
 ****************************************************************************/

var TileMapPathMoveStraightSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_path_move_straight.frame);
	}
});

TileMapPathMoveStraightSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapPathMoveStraightSprite) || TileMapScaledSprite.create(new TileMapPathMoveStraightSprite());
	}
	return sprite;
};

module.exports = TileMapPathMoveStraightSprite;
