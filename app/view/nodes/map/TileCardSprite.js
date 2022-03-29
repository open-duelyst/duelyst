//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileCardSprite
var TileCardSprite = BaseSprite
TileCardSprite.create()
 ****************************************************************************/

var TileCardSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_card.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileCardSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileCardSprite) || BaseSprite.create(null, new TileCardSprite());
	}
	return sprite;
};

module.exports = TileCardSprite;
