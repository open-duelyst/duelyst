//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedHover0123Sprite
var TileMapMergedHover0123Sprite = TileMapScaledSprite
TileMapMergedHover0123Sprite.create()
 ****************************************************************************/

var TileMapMergedHover0123Sprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_hover_0123.frame);
	}
});

TileMapMergedHover0123Sprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedHover0123Sprite) || TileMapScaledSprite.create(new TileMapMergedHover0123Sprite());
	}
	return sprite;
};

module.exports = TileMapMergedHover0123Sprite;
