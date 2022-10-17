Logger = require 'app/common/logger'
SpellFollowupTeleport = require('./spellFollowupTeleport')
SpellFilterType = require './spellFilterType'

class SpellFollowupTeleportToMe extends SpellFollowupTeleport

  getTeleportSourcePosition: (applyEffectPosition) ->
    return applyEffectPosition

  getTeleportTargetPosition: (applyEffectPosition) ->
    source = @getTeleportSource(@getFollowupSourcePosition())
    if source?
      # set x offset based on which direction the source unit faces
      sourcePosition = source.getPosition()
      if source.isOwnedByPlayer1() then offset = 1 else offset = -1
      return {x: sourcePosition.x + offset, y: sourcePosition.y}

  _postFilterPlayPositions: (spellPositions) ->
    # make sure that there is nothing at the target position
    if !@getTeleportTarget(@getApplyEffectPosition())?
      validPositions = []

      for position in spellPositions
        # make sure that there is something to teleport at the source position
        if @getGameSession().getBoard().getCardAtPosition(position, @targetType)?
          validPositions.push(position)

      return validPositions
    else
      return []

  _postFilterApplyPositions: @::_postFilterPlayPositions

  @followupConditionCanTeleportToMe: (cardWithFollowup, followupCard) ->
    # make sure that there is nothing at in front of the target
    return !followupCard.getTeleportTarget(followupCard.getApplyEffectPosition())

module.exports = SpellFollowupTeleportToMe
