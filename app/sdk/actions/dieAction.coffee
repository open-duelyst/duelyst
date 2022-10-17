Logger =     require 'app/common/logger'
RemoveAction = require './removeAction'
CardType =       require 'app/sdk/cards/cardType'
_ = require 'underscore'

class DieAction extends RemoveAction

  @type:"DieAction"

  constructor: () ->
    @type ?= DieAction.type
    super

module.exports = DieAction
