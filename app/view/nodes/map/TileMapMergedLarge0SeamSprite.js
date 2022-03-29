//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapMergedLarge0SeamSprite
var TileMapMergedLarge0SeamSprite = TileMapScaledSprite
TileMapMergedLarge0SeamSprite.create()
 ****************************************************************************/

var TileMapMergedLarge0SeamSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_merged_large_0_seam.frame);
	}
});

TileMapMergedLarge0SeamSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapMergedLarge0SeamSprite) || TileMapScaledSprite.create(new TileMapMergedLarge0SeamSprite());
	}
	return sprite;
};

module.exports = TileMapMergedLarge0SeamSprite;
