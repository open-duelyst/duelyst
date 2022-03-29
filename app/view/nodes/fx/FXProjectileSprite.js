
var CONFIG = require('app/common/config');
var FXSprite = require('./FXSprite');

/****************************************************************************
FXProjectileSprite
var FXProjectileSprite = FXSprite
FXProjectileSprite.create()
 ****************************************************************************/

var FXProjectileSprite = FXSprite.extend({
	looping: true,
	// handles own impact
	impactAtStart: false,
	impactAtEnd: true,
	// duration of movement, in seconds
	moveDuration: 0.25,
	// easing function to use when projectile moves
	easing: cc.EaseSineIn,

	ctor: function (options) {
		options || (options = {});
		if (options.looping == null) options.looping = true;
		this._super(options);
	},

	setOptions: function (options) {
		this._super(options);
		if(options.moveDuration != null) this.setMoveDuration(options.moveDuration);
		if(options.easing && cc["Ease" + options.easing]) this.setEasing(cc["Ease" + options.easing]);
	},

	getShowDelay: function () {
		return this.moveDuration + this.getImpactFXShowDelay();
	},
	getImpactDelay: function () {
		return this.moveDuration;
	},
	setEasing: function ( easing ) {
		this.easing = easing;
	},
	setMoveDuration: function ( moveDuration ) {
		this.moveDuration = moveDuration;
	},
	startTransform: function () {
		FXSprite.prototype.startTransform.call(this);

		var sourceScreenPosition = this.getSourceOffsetScreenPosition();
		var targetScreenPosition = this.getTargetOffsetScreenPosition();

		// reset to source position
		if(sourceScreenPosition && targetScreenPosition) {
			this.setPosition(sourceScreenPosition);
			this.setRotation( -Math.atan2(targetScreenPosition.y - sourceScreenPosition.y, targetScreenPosition.x - sourceScreenPosition.x) * 180 / Math.PI );
			// handles own facing
			this.setFlippedX(false);
		}

		if(this.moveDuration && targetScreenPosition) {
			var movement = cc.MoveTo.create(this.moveDuration, targetScreenPosition );
			if ( this.easing ) {
				movement = this.easing.create(movement);
			}

			this.runAction(cc.sequence(
				movement,
				cc.callFunc(this.end, this)
			));
		}
	},
	startEvents: function () {
		// skip impact check on start
	},
	end: function () {
		this.impact();

		this.runAction(cc.sequence(
			cc.FadeOut.create(CONFIG.FADE_MEDIUM_DURATION),
			cc.callFunc(this.destroy, this)
		));
	}
});

FXProjectileSprite.create = function(options, sprite) {
	return FXSprite.create.call(this, options, sprite || new FXProjectileSprite(options));
};

module.exports = FXProjectileSprite;
