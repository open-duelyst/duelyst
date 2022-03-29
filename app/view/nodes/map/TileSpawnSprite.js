//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileSpawnSprite
var TileSpawnSprite = BaseSprite
TileSpawnSprite.create()
 ****************************************************************************/

var TileSpawnSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_spawn.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileSpawnSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileSpawnSprite) || BaseSprite.create(null, new TileSpawnSprite());
	}
	return sprite;
};

module.exports = TileSpawnSprite;
