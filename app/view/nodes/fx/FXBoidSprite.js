
var CONFIG = require('app/common/config');
var FXSprite = require('./FXSprite');

/****************************************************************************
 FXBoidSprite
 var FXBoidSprite = FXSprite
 FXBoidSprite.create()
 - this is (more or less) a puppet sprite that the flock sprite controls
 ****************************************************************************/
var FXBoidSprite = FXSprite.extend({
	usesSubPixelPosition: true,
	// boids can impact at end
	impactAtStart: false,
	impactAtEnd: true,
	// boids loop until removed by flock
	looping: true,
	// velocity
	velocity: null,
	targetVelocity: null,

	ctor: function (options) {
		this.velocity = cc.p();
		this.targetVelocity = cc.p();
		this._super(options);
	},

	getLifeDuration: function () {
		return 0.0;
	},
	getShowDelay: function () {
		return 0.0;
	},
	getImpactDelay: function () {
		return 0.0;
	},
	end: function () {
		this.impact();

		this.runAction(cc.sequence(
			cc.FadeOut.create(CONFIG.FADE_MEDIUM_DURATION),
			cc.callFunc(this.destroy, this)
		));
	}
});

FXBoidSprite.create = function(options, sprite) {
	return FXSprite.create(options, sprite || new FXBoidSprite(options));
};

module.exports = FXBoidSprite;
