CONFIG =     require 'app/common/config'
Logger =     require 'app/common/logger'
PlayCardAction =     require './playCardAction'

class PlaySignatureCardAction extends PlayCardAction

  @type:"PlaySignatureCardAction"

  constructor: () ->
    @type ?= PlaySignatureCardAction.type
    super

  getManaCost: () ->
    card = @getCard()
    if card? then card.getManaCost() else super()

  _execute: () ->
    super()

    owner = @getCard()?.getOwner()
    if owner?
      # set signature card as inactive
      owner.setIsSignatureCardActive(false)

      # generate new signature card
      @getGameSession().executeAction(owner.actionGenerateSignatureCard())

module.exports = PlaySignatureCardAction
