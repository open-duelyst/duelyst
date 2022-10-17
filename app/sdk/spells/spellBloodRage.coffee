SpellApplyModifiers = require './spellApplyModifiers'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
Modifier = require 'app/sdk/modifiers/modifier'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class SpellBloodRage extends SpellApplyModifiers

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->

    position = {x: x, y: y}
    entity = board.getCardAtPosition(position, @targetType)
    damageCount = 0

    # calculate number of damage actions this turn
    actions = []
    for step in @getGameSession().getCurrentTurn().getSteps()
      actions = actions.concat(step.getAction().getFlattenedActionTree())
    for action in actions
      if action instanceof DamageAction and action.getTotalDamageAmount() > 0
        damageCount++

    if damageCount > 0
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(damageCount, damageCount)
      statContextObject.appliedName = "Enraged"
      this.setTargetModifiersContextObjects([
        statContextObject
      ])

      super(board,x,y,sourceAction) # apply buff

module.exports = SpellBloodRage
