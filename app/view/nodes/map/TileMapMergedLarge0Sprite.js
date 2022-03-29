//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedLarge0Sprite
var TileMapMergedLarge0Sprite = TileMapScaledSprite
TileMapMergedLarge0Sprite.create()
 ****************************************************************************/

var TileMapMergedLarge0Sprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_large_0.frame);
	}
});

TileMapMergedLarge0Sprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedLarge0Sprite) || TileMapScaledSprite.create(new TileMapMergedLarge0Sprite());
	}
	return sprite;
};

module.exports = TileMapMergedLarge0Sprite;
