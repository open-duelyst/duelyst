/** **************************************************************************
  UtilsAudio - audio utility methods
 *************************************************************************** */
const UtilsAudio = {};
module.exports = UtilsAudio;

const _ = require('underscore');

/**
 * Returns a valid volume value from any input value.
 * @param {*} val
 * @returns {Number}
 */
UtilsAudio.getValidVolume = function (val) {
  val = parseFloat(val);
  if (Number.isNaN(val) || !_.isNumber(val)) {
    return 1.0;
  }

  return Math.max(Math.min(val, 1.0), 0.0);
};
