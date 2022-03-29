
var FXSprite = require('./FXSprite');

/****************************************************************************
FXDecalSprite
var FXDecalSprite = FXSprite
FXDecalSprite.create()
 ****************************************************************************/

var FXDecalSprite = FXSprite.extend({
	looping: false,
	removeOnEnd: false,
	duration: 1.0,
	fadeOutDuration: 14.0,
	_setup: function () {
		FXSprite.prototype._setup.call(this);
		this.getFX().addDecal(this);
	},
	_teardown: function () {
		this.getFX().removeDecal(this);
		FXSprite.prototype._teardown.call(this);
	}
});

FXDecalSprite.create = function(options, sprite) {
	return FXSprite.create(options, sprite || new FXDecalSprite(options));
};

module.exports = FXDecalSprite;
