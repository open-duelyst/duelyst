const path = require('path')
require('app-module-path').addPath(path.join(__dirname, '..'))
require('coffee-script/register')
const Logger = require('app/common/logger')
Logger.enabled = false

// these ./rest tests are not working anymore
// module.exports = require('require-dir')('./rest')

module.exports = require('require-dir')('./unit/sdk')
module.exports = require('require-dir')('./unit/misc')
module.exports = require('require-dir')('./unit/data_access')
module.exports = require('require-dir')('./unit/achievements')
