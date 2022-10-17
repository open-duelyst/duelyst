Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
TeleportAction = require('app/sdk/actions/teleportAction')
_ = require 'underscore'

class SpellFollowupTeleport extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    applyEffectPosition = {x: x, y: y}

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellFollowupTeleport::onApplyEffectToBoardTile "
    source = board.getCardAtPosition(@getTeleportSourcePosition(applyEffectPosition), @targetType)

    teleAction = new TeleportAction(@getGameSession())
    teleAction.setOwnerId(@getOwnerId())
    teleAction.setSource(source)
    teleAction.setTargetPosition(@getTeleportTargetPosition(applyEffectPosition))
    teleAction.setFXResource(_.union(teleAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(teleAction)

  getTeleportSourcePosition: (applyEffectPosition) ->
    # override in sub class to provide custom source position
    return @getFollowupSourcePosition()

  getTeleportSource: (applyEffectPosition) ->
    return @getGameSession().getBoard().getCardAtPosition(@getTeleportSourcePosition(applyEffectPosition), @targetType)

  getTeleportTargetPosition: (applyEffectPosition) ->
    # override in sub class to provide custom target position
    return applyEffectPosition

  getTeleportTarget: (applyEffectPosition) ->
    return @getGameSession().getBoard().getCardAtPosition(@getTeleportTargetPosition(applyEffectPosition), @targetType)

  _postFilterPlayPositions: (spellPositions) ->
    # make sure that there is something to teleport at the source position
    if @getTeleportSource(@getApplyEffectPosition())?
      validPositions = []

      for position in spellPositions
        # make sure that there is nothing at the target position
        if !@getGameSession().getBoard().getCardAtPosition(position, @targetType)
          validPositions.push(position)

      return validPositions
    else
      return []

  _postFilterApplyPositions: @::_postFilterPlayPositions

  @followupConditionTargetToTeleport: (cardWithFollowup, followupCard) ->
    # make sure that there is something to teleport at the source position
    return followupCard.getTeleportSource(followupCard.getApplyEffectPosition())

module.exports = SpellFollowupTeleport
