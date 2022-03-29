//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedHover01Sprite
var TileMapMergedHover01Sprite = TileMapScaledSprite
TileMapMergedHover01Sprite.create()
 ****************************************************************************/

var TileMapMergedHover01Sprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_hover_01.frame);
	}
});

TileMapMergedHover01Sprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedHover01Sprite) || TileMapScaledSprite.create(new TileMapMergedHover01Sprite());
	}
	return sprite;
};

module.exports = TileMapMergedHover01Sprite;
