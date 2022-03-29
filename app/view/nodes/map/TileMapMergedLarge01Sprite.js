//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedLarge01Sprite
var TileMapMergedLarge01Sprite = TileMapScaledSprite
TileMapMergedLarge01Sprite.create()
 ****************************************************************************/

var TileMapMergedLarge01Sprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_large_01.frame);
	}
});

TileMapMergedLarge01Sprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedLarge01Sprite) || TileMapScaledSprite.create(new TileMapMergedLarge01Sprite());
	}
	return sprite;
};

module.exports = TileMapMergedLarge01Sprite;
