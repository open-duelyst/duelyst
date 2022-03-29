//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileOpponentSprite
var TileOpponentSprite = BaseSprite
TileOpponentSprite.create()
 ****************************************************************************/

var TileOpponentSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_opponent.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileOpponentSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileOpponentSprite) || BaseSprite.create(null, new TileOpponentSprite());
	}
	return sprite;
};

module.exports = TileOpponentSprite;
