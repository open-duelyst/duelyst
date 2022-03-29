/**
 * Animates a cc.node as if it was shaking randomly.
 * @function
 * @param {Number} duration
 * @param {Number} strength
 * @param {Vec2} originalPosition
 * @return {Shake}
 */
var Shake = cc.ActionInterval.extend({

	_strength: null,
	_originalPosition: null,

	ctor:function (duration, strength, originalPosition) {
		cc.ActionInterval.prototype.ctor.call(this);
		this.initWithDuration(duration, strength, originalPosition);
	},

	initWithDuration:function (duration, strength, originalPosition) {
		if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
			this._strength = strength;
			this._originalPosition = originalPosition || cc.p(0, 0);
			return true;
		}
		return false;
	},

	update:function (time) {
		if (time === 1.0) {
			this.target.setPosition(this._originalPosition);
		} else {
			var x = this._originalPosition.x + (Math.random() * (this._strength * 2.0) - this._strength) * (1.0 - time);
			var y = this._originalPosition.y + (Math.random() * (this._strength * 2.0) - this._strength) * (1.0 - time);
			this.target.setPosition(x, y);
		}
	},

	activate:function () {
		cc.ActionInterval.prototype.activate.call(this);
		this.target.addActionUsingSubPixelPosition();
	},

	deactivate:function () {
		cc.ActionInterval.prototype.deactivate.call(this);
		this.getOriginalTarget().removeActionUsingSubPixelPosition();
	},

	reverse:function () {
		return Shake.create(this._duration, this._strength)
	},

	clone:function () {
		var action = new Shake();
		action.initWithDuration(this._duration);
		return action;
	}
});

/**
 * Animates a cc.node as if it was shaking randomly.
 * @function
 * @param {Number} duration
 * @param {Number} strength
 * @param {Vec2} originalPosition
 * @return {Shake}
 */
Shake.create = function (duration, strength, originalPosition) {
	return new Shake(duration, strength, originalPosition);
};

module.exports = Shake;
