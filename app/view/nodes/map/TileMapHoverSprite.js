//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var TileMapScaledSprite = require('./TileMapScaledSprite');

/****************************************************************************
TileMapHoverSprite
var TileMapHoverSprite = TileMapScaledSprite
TileMapHoverSprite.create()
 ****************************************************************************/

var TileMapHoverSprite = TileMapScaledSprite.extend({

	ctor: function () {
		this._super(RSX.tile_hover.frame);
	}
});

TileMapHoverSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapHoverSprite) || TileMapScaledSprite.create(new TileMapHoverSprite());
	}
	return sprite;
};

module.exports = TileMapHoverSprite;
