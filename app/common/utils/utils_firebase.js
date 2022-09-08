const { Base64 } = require('js-base64');

exports.pathName = function (ref) {
  const p = ref.parent().name();
  return (p ? `${p}/` : '') + ref.name();
};

exports.getNumChildren = function (ref, callback) {
  ref.once('value', (snapshot) => {
    callback(snapshot.numChildren());
  }, callback);
};
