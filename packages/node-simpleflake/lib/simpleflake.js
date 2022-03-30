var simpleflakes = require('simpleflakes')

var opt = {
  epoch: Date.UTC(2000, 0, 1),
  timebits: 41,
};


module.exports = simpleflakes;
module.exports.parse = simpleflakes.parseSimpleflake;
module.exports.options = opt;
