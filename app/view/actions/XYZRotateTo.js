/**
 * Animates the xyz rotation in degrees of a cc.Node.
 * @function
 * @param {Number} duration
 * @param {Number} rotateX
 * @param {Number} rotateY
 * @param {Number} rotateZ
 * @return {XYZRotateTo}
 * @example
 * // example
 * var action = XYZRotateTo.create(2, 180, 180, 180);
 */
var XYZRotateTo = cc.ActionInterval.extend({

	_originalRotation: null,
	_rotateTo: null,
	_rotation: null,

	ctor: function (duration, rotateX, rotateY, rotateZ) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._rotateTo = new cc.kmVec3();
		this._rotation = new cc.kmVec3();
		this.initWithDuration(duration, rotateX, rotateY, rotateZ);
	},

	initWithDuration:function (duration, rotateX, rotateY, rotateZ) {
		if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
			this._rotateTo.x = rotateX || 0.0;
			this._rotateTo.y = rotateY || 0.0;
			this._rotateTo.z = rotateZ || 0.0;
			return true;
		}
		return false;
	},

	update:function (time) {
		time = this._computeEaseTime(time);
		var invTime = 1.0 - time;
		this._rotation.x = this._originalRotation.x * invTime + this._rotateTo.x * time;
		this._rotation.y = this._originalRotation.y * invTime + this._rotateTo.y * time;
		this._rotation.z = this._originalRotation.z * invTime + this._rotateTo.z * time;
		this.target.setXYZRotation(this._rotation);
	},

	reverse:function () {
		return XYZRotateTo.create(this._duration, -this._rotateTo.x, -this._rotateTo.y, -this._rotateTo.z);
	},

	clone:function () {
		var action = new XYZRotateTo();
		action.initWithDuration(this._duration, this._rotateTo.x, this._rotateTo.y, this._rotateTo.z);
		return action;
	},

	startWithTarget:function (target) {
		cc.ActionInterval.prototype.startWithTarget.call(this, target);
		this._originalRotation = target.getXYZRotation();
	}
});

/**
 * Animates the xyz rotation in degrees of a cc.Node.
 * @function
 * @param {Number} duration
 * @param {Number} rotateX
 * @param {Number} rotateY
 * @param {Number} rotateZ
 * @return {XYZRotateTo}
 * @example
 * // example
 * var action = XYZRotateTo.create(2, 180, 180, 180);
 */
XYZRotateTo.create = function (duration, rotateX, rotateY, rotateZ) {
	return new XYZRotateTo(duration, rotateX, rotateY, rotateZ);
};

module.exports = XYZRotateTo;
