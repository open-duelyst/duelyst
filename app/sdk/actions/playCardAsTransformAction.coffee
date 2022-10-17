Logger =     require 'app/common/logger'
PlayCardSilentlyAction =     require './playCardSilentlyAction'
_ = require 'underscore'

###
  Play a card to board as a transform.
###

class PlayCardAsTransformAction extends PlayCardSilentlyAction

  @type:"PlayCardAsTransformAction"

  constructor: () ->
    @type ?= PlayCardAsTransformAction.type
    super

module.exports = PlayCardAsTransformAction
