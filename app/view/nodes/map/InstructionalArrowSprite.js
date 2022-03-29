//pragma PKGS: game
var _ = require('underscore');
var RSX = require('app/data/resources');
var BaseSprite = require('./../BaseSprite');

/****************************************************************************
InstructionalArrowSprite
var InstructionalArrowSprite = BaseSprite
InstructionalArrowSprite.create()
 ****************************************************************************/

var InstructionalArrowSprite = BaseSprite.extend({

	antiAlias: false,
	needsDepthDraw: true,

	ctor: function () {
		this._super(RSX.instructional_arrow.img);
	},
	onExit: function () {
		this._super();
		cc.pool.putInPool(this);
	},
	setDefaultOptions: function () {
		this.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
	}
});

InstructionalArrowSprite.create = function (sprite) {
	if (sprite == null) {
		sprite = cc.pool.getFromPool(InstructionalArrowSprite) || BaseSprite.create(null, new InstructionalArrowSprite());
	}
	return sprite;
};

module.exports = InstructionalArrowSprite;
