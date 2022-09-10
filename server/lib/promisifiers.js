// For functions that don't provide an error in their callback signature
module.exports.noErrorPromsifier = function (originalMethod) {
  const promisified = function () {
    const args = [].slice.call(...args);
    const self = this;
    return new Promise((resolve, reject) => {
      args.push(resolve);
      originalMethod.apply(self, args);
    });
  };
  return promisified;
};
