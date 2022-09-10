/**
 * Animates the screen space gradient color map.
 * NOTE: only run this action on the scene, as it affects global state and the scene is the only guaranteed persistent node.
 * @function
 * @param {Number} duration
 * @param {Color}  colorFromWhite
 * @param {Color}  colorFromMid
 * @param {Color}  colorFromBlack
 * @param {Color}  colorToWhite
 * @param {Color}  colorToMid
 * @param {Color}  colorToBlack
 */
var GradientColorMap = cc.ActionInterval.extend({

  _colorFromWhite: cc.color(0.0, 0.0, 0.0, 0.0),
  _colorFromMid: cc.color(0.0, 0.0, 0.0, 0.0),
  _colorFromBlack: cc.color(0.0, 0.0, 0.0, 0.0),
  _colorToWhite: cc.color(0.0, 0.0, 0.0, 0.0),
  _colorToMid: cc.color(0.0, 0.0, 0.0, 0.0),
  _colorToBlack: cc.color(0.0, 0.0, 0.0, 0.0),

  ctor(duration, colorFromWhite, colorFromMid, colorFromBlack, colorToWhite, colorToMid, colorToBlack) {
    cc.ActionInterval.prototype.ctor.call(this);
    this.initWithDuration(duration, colorFromWhite, colorFromMid, colorFromBlack, colorToWhite, colorToMid, colorToBlack);
  },

  initWithDuration(duration, colorFromWhite, colorFromMid, colorFromBlack, colorToWhite, colorToMid, colorToBlack) {
    if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
      this._colorFromWhite = colorFromWhite == null ? this._colorFromWhite : colorFromWhite;
      this._colorFromMid = colorFromMid == null ? this._colorFromMid : colorFromMid;
      this._colorFromBlack = colorFromBlack == null ? this._colorFromBlack : colorFromBlack;
      this._colorToWhite = colorToWhite == null ? this._colorToWhite : colorToWhite;
      this._colorToMid = colorToMid == null ? this._colorToMid : colorToMid;
      this._colorToBlack = colorToBlack == null ? this._colorToBlack : colorToBlack;

      return true;
    }
    return false;
  },

  startWithTarget(target) {
    cc.ActionInterval.prototype.startWithTarget.call(this, target);
    this.getFX().setFromGradientColorMapWhiteColor(this._colorFromWhite);
    this.getFX().setFromGradientColorMapMidColor(this._colorFromMid);
    this.getFX().setFromGradientColorMapBlackColor(this._colorFromBlack);
    this.getFX().setToGradientColorMapWhiteColor(this._colorToWhite);
    this.getFX().setToGradientColorMapMidColor(this._colorToMid);
    this.getFX().setToGradientColorMapBlackColor(this._colorToBlack);
    this.getFX().setGradientMapTransitionPhase(0.0);
  },

  update(timePct) {
    this.getFX().setGradientMapTransitionPhase(timePct);
  },

  reverse() {
    return GradientColorMap.create(this._duration, this._colorToWhite, this._colorToMid, this._colorToBlack, this._colorFromWhite, this._colorFromMid, this._colorFromBlack);
  },

  clone() {
    const action = new ToneCurve();
    action.initWithDuration(this._duration, this._colorFromWhite, this._colorFromMid, this._colorFromBlack, this._colorToWhite, this._colorToMid, this._colorToBlack);
    return action;
  },
});

/**
  * Animates the screen space gradient color map.
  * NOTE: only run this action on the scene, as it affects global state and the scene is the only guaranteed persistent node.
  * @function
  * @param {Number} duration
  * @param {Color}  colorFromWhite
  * @param {Color}  colorFromMid
  * @param {Color}  colorFromBlack
  * @param {Color}  colorToWhite
  * @param {Color}  colorToMid
  * @param {Color}  colorToBlack
  * @return {GradientColorMap}
  */
GradientColorMap.create = function (duration, colorFromWhite, colorFromMid, colorFromBlack, colorToWhite, colorToMid, colorToBlack) {
  return new GradientColorMap(duration, colorFromWhite, colorFromMid, colorFromBlack, colorToWhite, colorToMid, colorToBlack);
};

module.exports = GradientColorMap;
