/**
 * Animates a cc.node as if it was shaking randomly.
 * @function
 * @param {Number} duration
 * @param {Number} xStrength - how far out in the x direction object will travel in BOTH directions
 * @param {Number} yStrength
 * @param {Vec2} originalPosition
 * @return {FigureEight}
 */
var FigureEight = cc.ActionInterval.extend({

  _strength: null,
  _originalPosition: null,
  _inverseDuration: undefined,

  ctor(duration, xStrength, yStrength, originalPosition) {
    cc.ActionInterval.prototype.ctor.call(this);
    this.initWithDuration(duration, xStrength, yStrength, originalPosition);
  },

  initWithDuration(duration, xStrength, yStrength, originalPosition) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._xStrength = xStrength;
      this._yStrength = yStrength;
      this._originalPosition = originalPosition || cc.p(0, 0);
      this._inverseDuration = 1.0 / duration;
      return true;
    }
    return false;
  },

  update(time) {
    const delta = this._getDelta();

    if (delta === 0.0) {
      this.target.setPosition(this._originalPosition);
    } else if (delta < 0.5) {
      // Left circle
      var x = this._originalPosition.x + (1.0 + Math.cos(Math.PI - delta * 4 * Math.PI)) * this._xStrength;
      var y = this._originalPosition.y + Math.sin(Math.PI - delta * 4 * Math.PI) * this._yStrength;
      this.target.setPosition(x, y);
    } else {
      // Right circle
      const subDelta = delta - 0.5;
      var x = this._originalPosition.x + (-1.0 + Math.cos(subDelta * 4 * Math.PI)) * this._xStrength;
      var y = this._originalPosition.y + Math.sin(subDelta * 4 * Math.PI) * this._yStrength;
      this.target.setPosition(x, y);
    }
  },

  _getDelta() {
    return this.getElapsed() * this._inverseDuration;
  },

  setDuration(duration) {
    const previousDelta = this._getDelta();

    this._duration = duration;
    this._inverseDuration = 1.0 / duration;

    // Set the current state of elapsed to be in the context of new duration
    this._elapsed = previousDelta * this._duration;

    return this;
  },

  activate() {
    cc.ActionInterval.prototype.activate.call(this);
    this.target.addActionUsingSubPixelPosition();
  },

  deactivate() {
    cc.ActionInterval.prototype.deactivate.call(this);
    this.getOriginalTarget().removeActionUsingSubPixelPosition();
  },

  reverse() {
    return FigureEight.create(this._duration, this._strength);
  },

  clone() {
    const action = new FigureEight();
    action.initWithDuration(this._duration);
    return action;
  },
});

/**
 * Animates a cc.node as if it was shaking randomly.
 * @function
 * @param {Number} duration
 * @param {Number} strength
 * @param {Vec2} originalPosition
 * @return {FigureEight}
 */
FigureEight.create = function (duration, xStrength, yStrength, originalPosition) {
  return new FigureEight(duration, xStrength, yStrength, originalPosition);
};

module.exports = FigureEight;
