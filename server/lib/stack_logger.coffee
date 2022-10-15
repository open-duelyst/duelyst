# Prints stack traces with the pretty-error library.
# Sets some out of the box values and exports the pe object, which can be used
# to further customize the config.
PrettyError = require 'pretty-error'

pe = new PrettyError()
pe.skipNodeFiles()
pe.withoutColors()
pe.appendStyle({
	'pretty-error > trace > item > footer': { display: 'none' },
})

# Usage:
# StackLogger = require 'stack_logger.coffee'
# StackLogger.render(Error)
module.exports.StackLogger = pe
