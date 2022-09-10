/**
 * Animates the xyz rotation in degrees of a CardNode.
 * @function
 * @param {Number} duration
 * @param {Number} rotateX
 * @param {Number} rotateY
 * @param {Number} rotateZ
 * @return {SecondaryXYZRotateBy}
 * @example
 * // example
 * var action = SecondaryXYZRotateBy.create(2, 180, 180, 180);
 */
var SecondaryXYZRotateBy = cc.ActionInterval.extend({

  _originalRotation: null,
  _rotateBy: null,
  _rotation: null,

  ctor(duration, rotateX, rotateY, rotateZ) {
    cc.ActionInterval.prototype.ctor.call(this);
    this._rotateBy = new cc.kmVec3();
    this._rotation = new cc.kmVec3();
    this.initWithDuration(duration, rotateX, rotateY, rotateZ);
  },

  initWithDuration(duration, rotateX, rotateY, rotateZ) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._rotateBy.x = rotateX || 0.0;
      this._rotateBy.y = rotateY || 0.0;
      this._rotateBy.z = rotateZ || 0.0;
      return true;
    }
    return false;
  },

  update(time) {
    time = this._computeEaseTime(time);
    this._rotation.x = this._originalRotation.x + this._rotateBy.x * time;
    this._rotation.y = this._originalRotation.y + this._rotateBy.y * time;
    this._rotation.z = this._originalRotation.z + this._rotateBy.z * time;
    this.target.setSecondaryXYZRotation(this._rotation);
  },

  reverse() {
    return SecondaryXYZRotateBy.create(this._duration, -this._rotateBy.x, -this._rotateBy.y, -this._rotateBy.z);
  },

  clone() {
    const action = new SecondaryXYZRotateBy();
    action.initWithDuration(this._duration, this._rotateBy.x, this._rotateBy.y, this._rotateBy.z);
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
 * @return {SecondaryXYZRotateBy}
 * @example
 * // example
 * var action = SecondaryXYZRotateBy.create(2, 180, 180, 180);
 */
SecondaryXYZRotateBy.create = function (duration, rotateX, rotateY, rotateZ) {
  return new SecondaryXYZRotateBy(duration, rotateX, rotateY, rotateZ);
};

module.exports = SecondaryXYZRotateBy;
