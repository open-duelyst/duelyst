//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileSpellSprite
var TileSpellSprite = BaseSprite
TileSpellSprite.create()
 ****************************************************************************/

var TileSpellSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_spell.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileSpellSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileSpellSprite) || BaseSprite.create(null, new TileSpellSprite());
	}
	return sprite;
};

module.exports = TileSpellSprite;
