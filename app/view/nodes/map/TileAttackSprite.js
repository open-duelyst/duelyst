//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileAttackSprite
var TileAttackSprite = BaseSprite
TileAttackSprite.create()
 ****************************************************************************/

var TileAttackSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_attack.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileAttackSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileAttackSprite) || BaseSprite.create(null, new TileAttackSprite());
	}
	return sprite;
};

module.exports = TileAttackSprite;
