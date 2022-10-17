Logger =     require 'app/common/logger'
UtilsJavascript =     require 'app/common/utils/utils_javascript'
CloneEntityAction =     require './cloneEntityAction'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
Clone an entity on the board silently as a transform.
###

class CloneEntityAsTransformAction extends CloneEntityAction

  @type:"CloneEntityAsTransformAction"

  constructor: () ->
    @type ?= CloneEntityAsTransformAction.type
    super

module.exports = CloneEntityAsTransformAction
