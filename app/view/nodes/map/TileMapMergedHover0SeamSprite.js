//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedHover0SeamSprite
var TileMapMergedHover0SeamSprite = TileMapScaledSprite
TileMapMergedHover0SeamSprite.create()
 ****************************************************************************/

var TileMapMergedHover0SeamSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_hover_0_seam.frame);
	}
});

TileMapMergedHover0SeamSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedHover0SeamSprite) || TileMapScaledSprite.create(new TileMapMergedHover0SeamSprite());
	}
	return sprite;
};

module.exports = TileMapMergedHover0SeamSprite;
