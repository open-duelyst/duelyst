var Base64 = require('js-base64').Base64;

exports.pathName = function(ref) {
	var p = ref.parent().name();
	return (p? p+'/' : '')+ref.name();
};

exports.getNumChildren = function(ref, callback) {
  ref.once('value', function (snapshot) {
    callback(snapshot.numChildren());
  }, callback);
}