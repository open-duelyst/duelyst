Action = require './action'
GenerateSignatureCardAction = require './generateSignatureCardAction'

###
Action that forces signature card data to be refreshed for player
Generates a new signature card if signature card slot was active when this action executes
###

class UpdateSignatureCardAction extends Action

  @type:"UpdateSignatureCardAction"

  targetPlayerId: null

  constructor: (gameSession, targetPlayerId) ->
    @type ?= UpdateSignatureCardAction.type
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

    activeSignatureCard = @getTargetPlayer().getCurrentSignatureCard()
    if activeSignatureCard
      @getGameSession().executeAction(@getTargetPlayer().actionGenerateSignatureCard())
    else
      @getTargetPlayer().flushCachedReferenceSignatureCard()
      @getGameSession().getGeneralForPlayerId(@getTargetPlayerId()).flushCachedReferenceSignatureCard()

module.exports = UpdateSignatureCardAction
