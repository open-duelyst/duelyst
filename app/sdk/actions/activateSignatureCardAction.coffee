Action = require './action'

###
Action that activates a player's signature card.
###

class ActivateSignatureCardAction extends Action

  @type:"ActivateSignatureCardAction"

  targetPlayerId: null

  constructor: (gameSession, targetPlayerId) ->
    @type ?= ActivateSignatureCardAction.type
    super(gameSession)
    if targetPlayerId?
      @targetPlayerId = targetPlayerId
    else
      @targetPlayerId = @getOwnerId()

  isRemovableDuringScrubbing: () ->
    return false

  getTargetPlayer: () ->
    return @getGameSession().getPlayerById(@getTargetPlayerId())

  getTargetPlayerId: () ->
    return @targetPlayerId

  _execute: () ->
    super()

    @getTargetPlayer().setIsSignatureCardActive(true)

module.exports = ActivateSignatureCardAction
