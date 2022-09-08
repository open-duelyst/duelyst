/**
 * Animates the xyz rotation in degrees of a CardNode.
 * @function
 * @param {Number} duration
 * @param {Number} rotateX
 * @param {Number} rotateY
 * @param {Number} rotateZ
 * @return {SecondaryXYZRotateTo}
 * @example
 * // example
 * var action = SecondaryXYZRotateTo.create(2, 180, 180, 180);
 */
var SecondaryXYZRotateTo = cc.ActionInterval.extend({

  _originalRotation: null,
  _rotateTo: null,
  _rotation: null,

  ctor(duration, rotateX, rotateY, rotateZ) {
    cc.ActionInterval.prototype.ctor.call(this);
    this._rotateTo = new cc.kmVec3();
    this._rotation = new cc.kmVec3();
    this.initWithDuration(duration, rotateX, rotateY, rotateZ);
  },

  initWithDuration(duration, rotateX, rotateY, rotateZ) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._rotateTo.x = rotateX || 0.0;
      this._rotateTo.y = rotateY || 0.0;
      this._rotateTo.z = rotateZ || 0.0;
      return true;
    }
    return false;
  },

  update(time) {
    time = this._computeEaseTime(time);
    const invTime = 1.0 - time;
    this._rotation.x = this._originalRotation.x * invTime + this._rotateTo.x * time;
    this._rotation.y = this._originalRotation.y * invTime + this._rotateTo.y * time;
    this._rotation.z = this._originalRotation.z * invTime + this._rotateTo.z * time;
    this.target.setSecondaryXYZRotation(this._rotation);
  },

  reverse() {
    return SecondaryXYZRotateTo.create(this._duration, -this._rotateTo.x, -this._rotateTo.y, -this._rotateTo.z);
  },

  clone() {
    const action = new SecondaryXYZRotateTo();
    action.initWithDuration(this._duration, this._rotateTo.x, this._rotateTo.y, this._rotateTo.z);
    return action;
  },

  startWithTarget(target) {
    cc.ActionInterval.prototype.startWithTarget.call(this, target);
    this._originalRotation = target.getSecondaryXYZRotation();
  },
});

/**
 * Animates the xyz rotation in degrees of a CardNode.
 * @function
 * @param {Number} duration
 * @param {Number} rotateX
 * @param {Number} rotateY
 * @param {Number} rotateZ
 * @return {SecondaryXYZRotateTo}
 * @example
 * // example
 * var action = SecondaryXYZRotateTo.create(2, 180, 180, 180);
 */
SecondaryXYZRotateTo.create = function (duration, rotateX, rotateY, rotateZ) {
  return new SecondaryXYZRotateTo(duration, rotateX, rotateY, rotateZ);
};

module.exports = SecondaryXYZRotateTo;
