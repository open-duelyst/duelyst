Logger = require 'app/common/logger'
SpellKillTarget = require './spellKillTarget'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'

class SpellFollowupHollowGroveKeeper extends SpellKillTarget

  _postFilterPlayPositions: (validPositions) ->
    # use super filter play positions
    validPositions = super(validPositions)
    filteredValidPositions = []

    for position in validPositions
      unit = @getGameSession().getBoard().getUnitAtPosition(position)
      # kill a target with provoke or frenzy
      if unit? and (unit.hasModifierClass(ModifierProvoke) or unit.hasModifierClass(ModifierFrenzy))
        filteredValidPositions.push(position)

    return filteredValidPositions

  # if the spell was able to be applied (if player targeted an appropriate minion)
  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    # apply frenzy and provoke to source unit
    sourceUnit = @getGameSession().getBoard().getUnitAtPosition(@getFollowupSourcePosition())
    @getGameSession().applyModifierContextObject(ModifierProvoke.createContextObject(), sourceUnit)
    @getGameSession().applyModifierContextObject(ModifierFrenzy.createContextObject(), sourceUnit)

module.exports = SpellFollowupHollowGroveKeeper
