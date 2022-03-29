// push_id_as_integer
var getPushIdAsInteger = (function getPushIdAsInteger() {
  var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

  return function getIntegers(id) {
    var integer = 0;

    for (var i = 0; i < id.length; i++) {
      integer = integer * 64 + PUSH_CHARS.indexOf(id[i]);
    }

    return integer;
  }
})();

module.exports = getPushIdAsInteger;