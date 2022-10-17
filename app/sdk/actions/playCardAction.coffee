CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
ApplyCardToBoardAction =     require './applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

###
Play a card to board and allow it to enact the full play card flow (followups, spawn effects, etc)
###

class PlayCardAction extends ApplyCardToBoardAction

  @type:"PlayCardAction"

  constructor: () ->
    @type ?= PlayCardAction.type
    super

module.exports = PlayCardAction
