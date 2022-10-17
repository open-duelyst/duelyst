SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'

class SpellApplyModifiersToGeneralAndNearbyAllies extends SpellApplyModifiers

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []
    board = @getGameSession().getBoard()

    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if myGeneral?
      applyEffectPositions.push(myGeneral.getPosition())
      for entity in board.getFriendlyEntitiesAroundEntity(myGeneral, CardType.Unit, 1)
        if entity?
          applyEffectPositions.push(entity.getPosition())

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellApplyModifiersToGeneralAndNearbyAllies
