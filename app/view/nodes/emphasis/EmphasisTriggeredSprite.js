//pragma PKGS: game
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
EmphasisTriggeredSprite
var EmphasisTriggeredSprite = BaseSprite
EmphasisTriggeredSprite.create()
 ****************************************************************************/

var EmphasisTriggeredSprite = BaseSprite.extend({
	ctor: function () {
		this._super(RSX.modifier_triggered.img);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	}
});

EmphasisTriggeredSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(EmphasisTriggeredSprite) || BaseSprite.create(null, new EmphasisTriggeredSprite());
	}
	return sprite;
};

module.exports = EmphasisTriggeredSprite;
