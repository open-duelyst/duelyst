UtilsGameSession = require 'app/common/utils/utils_game_session'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
_ = require 'underscore'

class SpellApplyModifiersToGeneral extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  applyToOwnGeneral: false
  applyToOpponentGeneral: false

  _filterApplyPositions: (validPositions) ->
    finalPositions = []
    ownGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    opponentGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if @applyToOwnGeneral
      finalPositions.push(ownGeneral.getPosition())
    if @applyToOpponentGeneral
      finalPositions.push(opponentGeneral.getPosition())

    return finalPositions

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @targetModifiersContextObjects?
      ownerId = @getOwnerId()
      ownGeneral = @getGameSession().getGeneralForPlayerId(ownerId)
      opponentGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(ownerId)
      target = board.getUnitAtPosition(x:x, y:y)

      # check for apply on own General
      if target?.getOwnerId() == ownerId and @applyToOwnGeneral
        for modifierContextObject in @targetModifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, target)

      # check for apply on opponent General
      if target?.getOwnerId() != ownerId and @applyToOpponentGeneral
        for modifierContextObject in @targetModifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, target)

module.exports = SpellApplyModifiersToGeneral
