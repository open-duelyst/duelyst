/**
 * Animates the screen space tonal curve.
 * NOTE: only run this action on the scene, as it affects global state and the scene is the only guaranteed persistent node.
 * @function
 * @param {Number} duration
 * @param {Number} toneCurveAmountFrom
 * @param {Number} toneCurveAmountTo
 * @return {ToneCurve}
 */
var ToneCurve = cc.ActionInterval.extend({

  _toneCurveAmountTo: 0.0,
  _toneCurveAmountFrom: 0.0,

  ctor(duration, toneCurveAmountFrom, toneCurveAmountTo) {
    cc.ActionInterval.prototype.ctor.call(this);
    this.initWithDuration(duration, toneCurveAmountFrom, toneCurveAmountTo);
  },

  initWithDuration(duration, toneCurveAmountFrom, toneCurveAmountTo) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._toneCurveAmountFrom = toneCurveAmountFrom == null ? this._toneCurveAmountFrom : toneCurveAmountFrom;
      this._toneCurveAmountTo = toneCurveAmountTo == null ? this._toneCurveAmountTo : toneCurveAmountTo;
      return true;
    }
    return false;
  },

  update(timePct) {
    this.getFX().setToneCurveAmount(this._toneCurveAmountFrom * (1.0 - timePct) + this._toneCurveAmountTo * timePct);
  },

  reverse() {
    return ToneCurve.create(this._duration, this._toneCurveAmountTo, this._toneCurveAmountFrom);
  },

  clone() {
    const action = new ToneCurve();
    action.initWithDuration(this._duration, this._toneCurveAmountFrom, this._toneCurveAmountTo);
    return action;
  },
});

/**
 * Animates the screen space tonal curve.
 * NOTE: only run this action on the scene, as it affects global state and the scene is the only guaranteed persistent node.
 * @function
 * @param {Number} duration
 * @param {Number} toneCurveAmountFrom
 * @param {Number} toneCurveAmountTo
 * @return {ToneCurve}
 */
ToneCurve.create = function (duration, toneCurveAmountFrom, toneCurveAmountTo) {
  return new ToneCurve(duration, toneCurveAmountFrom, toneCurveAmountTo);
};

module.exports = ToneCurve;
