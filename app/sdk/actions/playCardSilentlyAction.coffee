Logger =     require 'app/common/logger'
ApplyCardToBoardAction =     require './applyCardToBoardAction'
ModifierOpeningGambit =     require 'app/sdk/modifiers/modifierOpeningGambit'
_ = require 'underscore'

###
Play a card on the board and bypass the active card flow (i.e. followups and opening gambits are disabled)
###

class PlayCardSilentlyAction extends ApplyCardToBoardAction

  @type:"PlayCardSilentlyAction"

  constructor: () ->
    @type ?= PlayCardSilentlyAction.type
    super

  getCard: () ->
    if !@_private.cachedCard?
      # create and cache card
      super()

      if @_private.cachedCard?
        # clear the card's followups
        @_private.cachedCard.clearFollowups()

    return @_private.cachedCard

module.exports = PlayCardSilentlyAction
