// push_id_as_integer
const getPushIdAsInteger = (function getPushIdAsInteger() {
  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

  return function getIntegers(id) {
    let integer = 0;

    for (let i = 0; i < id.length; i++) {
      integer = integer * 64 + PUSH_CHARS.indexOf(id[i]);
    }

    return integer;
  };
}());

module.exports = getPushIdAsInteger;
