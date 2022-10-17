SpellSpawnEntity = require './spellSpawnEntity'

class SpellSpawnEntityAndApplyPlayerModifiers extends SpellSpawnEntity

  applyToOwnGeneral: false
  applyToOpponentGeneral: false

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @targetModifiersContextObjects?
      ownerId = @getOwnerId()

      if @applyToOwnGeneral
        # cast on own General
        ownGeneral = @getGameSession().getGeneralForPlayerId(ownerId)
        for modifierContextObject in @targetModifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, ownGeneral)

      if @applyToOpponentGeneral
        # cast on opponent's General
        opponentGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(ownerId)
        for modifierContextObject in @targetModifiersContextObjects
          @getGameSession().applyModifierContextObject(modifierContextObject, opponentGeneral)

module.exports = SpellSpawnEntityAndApplyPlayerModifiers
