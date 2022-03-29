//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileBoxSprite
var TileBoxSprite = BaseSprite
TileBoxSprite.create()
 ****************************************************************************/

var TileBoxSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.tile_box.frame);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileBoxSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileBoxSprite) || BaseSprite.create(null, new TileBoxSprite());
	}
	return sprite;
};

module.exports = TileBoxSprite;
