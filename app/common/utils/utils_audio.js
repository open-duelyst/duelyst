/****************************************************************************
  UtilsAudio - audio utility methods
 ****************************************************************************/
var UtilsAudio = {};
module.exports = UtilsAudio;

var _ = require("underscore");

/**
 * Returns a valid volume value from any input value.
 * @param {*} val
 * @returns {Number}
 */
UtilsAudio.getValidVolume = function (val) {
	val = parseFloat(val);
	if (isNaN(val) || !_.isNumber(val)) {
		return 1.0; }
	else {
		return Math.max(Math.min(val, 1.0), 0.0);
	}
};
