/**
 * Animates the screen space radial blur.
 * NOTE: only run this action on the scene, as it affects global state and the scene is the only guaranteed persistent node.
 * @param {Number} duration
 * @param {Vec2} position
 * @param {Number} radialBlurSpread
 * @param {Number} radialBlurDeadZone
 * @param {Number} radialBlurStrength
 * @return {RadialBlurTo}
 */
var RadialBlurTo = cc.ActionInterval.extend({

  _position: null,
  _radialBlurSpread: 0.25,
  _radialBlurDeadZone: 0.1,
  _radialBlurStrength: 1.0,

  ctor(duration, position, radialBlurSpread, radialBlurDeadZone, radialBlurStrength) {
    cc.ActionInterval.prototype.ctor.call(this);
    this.initWithDuration(duration, position, radialBlurSpread, radialBlurDeadZone, radialBlurStrength);
  },

  initWithDuration(duration, position, radialBlurSpread, radialBlurDeadZone, radialBlurStrength) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._position = position;
      this._radialBlurSpread = radialBlurSpread == null ? this._radialBlurSpread : radialBlurSpread;
      this._radialBlurDeadZone = radialBlurDeadZone == null ? this._radialBlurDeadZone : radialBlurDeadZone;
      this._radialBlurStrength = radialBlurStrength == null ? this._radialBlurStrength : radialBlurStrength;
      return true;
    }
    return false;
  },

  update(timePct) {
    this.getFX().setRadialBlurSpread(this._originalRadialBlurSpread * (1.0 - timePct) + this._radialBlurSpread * timePct);

    if (timePct === 1.0) {
      this.getFX().setRadialBlurStrength(this._originalRadialBlurStrength);
      this.getFX().setRadialBlurDeadZone(this._originalRadialBlurDeadZone);
    }
  },

  reverse() {
    return RadialBlurTo.create(this._duration, this._position, this._radialBlurSpread, this._radialBlurDeadZone, this._radialBlurStrength);
  },

  clone() {
    const action = new RadialBlurTo();
    action.initWithDuration(this._duration, this._position, this._radialBlurSpread, this._radialBlurDeadZone, this._radialBlurStrength);
    return action;
  },

  startWithTarget(target) {
    cc.ActionInterval.prototype.startWithTarget.call(this, target);
    this._originalRadialBlurSpread = this.getFX().getRadialBlurSpread();
    this._originalRadialBlurDeadZone = this.getFX().getRadialBlurDeadZone();
    this._originalRadialBlurStrength = this.getFX().getRadialBlurStrength();
    this.getFX().setRadialBlurStrength(this._radialBlurStrength);
    this.getFX().setRadialBlurDeadZone(this._radialBlurDeadZone);
    this.getFX().setRadialBlurPosition(this._position);
  },
});

/**
 * Animates the screen space radial blur.
 * NOTE: only run this action on the scene, as it affects global state and the scene is the only guaranteed persistent node.
 * @param {Number} duration
 * @param {Vec2} position
 * @param {Number} radialBlurSpread
 * @param {Number} radialBlurDeadZone
 * @param {Number} radialBlurStrength
 * @return {RadialBlurTo}
 */
RadialBlurTo.create = function (duration, position, radialBlurSpread, radialBlurDeadZone, radialBlurStrength) {
  return new RadialBlurTo(duration, position, radialBlurSpread, radialBlurDeadZone, radialBlurStrength);
};

module.exports = RadialBlurTo;
