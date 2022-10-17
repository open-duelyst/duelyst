SpellIntensify = require './spellIntensify'
Modifier = require 'app/sdk/modifiers/modifier'
CardType = require 'app/sdk/cards/cardType'

class SpellIntensifyIncreasingDominance extends SpellIntensify

  modifierAppliedName: null

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    buffAmount = @getIntensifyAmount() * 2

    statContextObject = Modifier.createContextObjectWithAttributeBuffs(0,buffAmount)
    statContextObject.appliedName = @modifierAppliedName

    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if myGeneral?
      for entity in board.getFriendlyEntitiesForEntity(myGeneral, CardType.Unit)
        if entity?
          @getGameSession().applyModifierContextObject(statContextObject, entity)

module.exports = SpellIntensifyIncreasingDominance
