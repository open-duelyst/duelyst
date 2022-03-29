//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedLarge013Sprite
var TileMapMergedLarge013Sprite = TileMapScaledSprite
TileMapMergedLarge013Sprite.create()
 ****************************************************************************/

var TileMapMergedLarge013Sprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_large_013.frame);
	}
});

TileMapMergedLarge013Sprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedLarge013Sprite) || TileMapScaledSprite.create(new TileMapMergedLarge013Sprite());
	}
	return sprite;
};

module.exports = TileMapMergedLarge013Sprite;
