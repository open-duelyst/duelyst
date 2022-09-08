/**
 * Animates the ambient light color of a cc.Node that occludes.
 * @extends cc.ActionInterval
 * @param {Number} duration
 * @param {Number} red
 * @param {Number} green
 * @param {Number} blue
 * @example
 * var action = AmbientLightColorTo.create(2, 255, 0, 255);
 */
var AmbientLightColorTo = cc.ActionInterval.extend({
  _to: null,
  _from: null,

  /**
   * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
   * @param {Number} duration
   * @param {Number} red
   * @param {Number} green
   * @param {Number} blue
   */
  ctor(duration, red, green, blue) {
    cc.ActionInterval.prototype.ctor.call(this);
    // use a plain object so that the values can go negative
    // cocos doesn't allow negative color values
    this._to = { r: 0, g: 0, b: 0 };
    this._from = { r: 0, g: 0, b: 0 };

    blue !== undefined && this.initWithDuration(duration, red, green, blue);
  },

  /**
   * Initializes the action.
   * @param {Number} duration
   * @param {Number} red
   * @param {Number} green 0-255
   * @param {Number} blue
   * @return {Boolean}
   */
  initWithDuration(duration, red, green, blue) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._to = { r: red, g: green, b: blue };
      return true;
    }
    return false;
  },

  /**
   * returns a new clone of the action
   * @returns {AmbientLightColorTo}
   */
  clone() {
    const action = new AmbientLightColorTo.create();
    this._cloneDecoration(action);
    const locTo = this._to;
    action.initWithDuration(this._duration, locTo.r, locTo.g, locTo.b);
    return action;
  },

  /**
   * Start the action with target.
   * @param {cc.Node} target
   */
  startWithTarget(target) {
    cc.ActionInterval.prototype.startWithTarget.call(this, target);

    this._from = this.target.getAmbientLightColor();
  },

  /**
   * Called once per frame. Time is the number of seconds of a frame interval.
   * @param {Number} dt time in seconds
   */
  update(dt) {
    dt = this._computeEaseTime(dt);
    const locFrom = this._from; const
      locTo = this._to;
    if (locFrom) {
      this.target.setAmbientLightColor({
        r: locFrom.r + (locTo.r - locFrom.r) * dt,
        g: locFrom.g + (locTo.g - locFrom.g) * dt,
        b: locFrom.b + (locTo.b - locFrom.b) * dt,
      });
    }
  },
});

/**
 * Animates the ambient light color of a cc.Node that occludes.
 * @param {Number} duration
 * @param {Number} red
 * @param {Number} green
 * @param {Number} blue
 * @return {AmbientLightColorTo}
 * @example
 * // example
 * var action = AmbientLightColorTo.create(1, 120, 120, 120);
 */
AmbientLightColorTo.create = function (duration, red, green, blue) {
  return new AmbientLightColorTo(duration, red, green, blue);
};

module.exports = AmbientLightColorTo;
