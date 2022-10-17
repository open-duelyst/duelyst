# Prints stack traces with the pretty-error library.
# Sets some out of the box values and exports the pe object, which can be used
# to further customize the config.
PrettyError = require 'pretty-error'
config = require '../../config/config.js'

pe = new PrettyError()

# Don't print stack frames from inside Node.js source code.
pe.skipNodeFiles()
pe.skipPath('node:internal/main/run_main_module')
pe.skipPath('node:internal/modules/cjs/helpers')
pe.skipPath('node:internal/modules/cjs/loader')
pe.skipPath('node:internal/modules/run_main')

# Don't print stack frames from CoffeeScript translation.
pe.skipPackage('coffee-script')

# Don't print stack frames from inside Express.js source code.
pe.skipPackage('express')

# Disable colors outside of local development.
# Avoids '[0m' spam in CloudWatch Logs.
if config.get('env') != 'development'
  pe.withoutColors()

# Set style config to make the logs more compact.
#
# Each stack frame prints three lines:
# - A header: stack_logger.coffee:30 Object.<anonymous>
# - A footer: /app/server/lib/stack_logger.coffee:30:11
# - An empty line
#
# The appendStyle() call below hides the header.
# Hiding the header omits the function name, but this isn't strictly necessary
# since we can reference the path and line number from the footer to find that
# information.
#
# The empty line cannot be removed until these PRs are merged and released:
# - https://github.com/AriaMinaei/RenderKid/pull/30
# - https://github.com/AriaMinaei/pretty-error/pull/68
pe.appendStyle({
  'pretty-error > trace > item > header': { display: 'none' },
})

# Usage:
# StackLogger = require 'stack_logger.coffee'
# StackLogger.render(Error)
module.exports.StackLogger = pe
