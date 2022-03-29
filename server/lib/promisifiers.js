// For functions that don't provide an error in their callback signature
module.exports.noErrorPromsifier = function(originalMethod) {
  var promisified;
  return promisified = function() {
    var args, self;
    args = [].slice.call(arguments);
    self = this;
    return new Promise(function(resolve, reject) {
      args.push(resolve);
      originalMethod.apply(self, args);
    });
  };
};