
var CONFIG = require('app/common/config');
var _ = require('underscore');
var UtilsEngine = require('app/common/utils/utils_engine');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
TileMapScaledSprite
var TileMapScaledSprite = BaseSprite
TileMapScaledSprite.create()
 ****************************************************************************/

var TileMapScaledSprite = BaseSprite.extend({
	antiAlias: false,
	ctor: function (options) {
		this._super(options);

		// force scale to match tilesize
		this.setScale(CONFIG.TILESIZE / this.getContentSize().width);
	},

	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

TileMapScaledSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(TileMapScaledSprite) || BaseSprite.create(null, new TileMapScaledSprite(options));
	}
	return sprite;
};

module.exports = TileMapScaledSprite;
