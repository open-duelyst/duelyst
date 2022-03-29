//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedHover03Sprite
var TileMapMergedHover03Sprite = TileMapScaledSprite
TileMapMergedHover03Sprite.create()
 ****************************************************************************/

var TileMapMergedHover03Sprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_hover_03.frame);
	}
});

TileMapMergedHover03Sprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedHover03Sprite) || TileMapScaledSprite.create(new TileMapMergedHover03Sprite());
	}
	return sprite;
};

module.exports = TileMapMergedHover03Sprite;
