Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'

class SpellApplyModifiers extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect
  numModifiersToApply: 0 # when 0 applies all targetModifiersContextObjects, when > 0 this is the number of random modifiers to apply

  setNumModifiersToApply: (val) ->
    @numModifiersToApply = val

  getNumModifiersToApply: () ->
    return @numModifiersToApply

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    if entity?
      for modifierContextObject in @getAppliedTargetModifiersContextObjects()
        @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  getAppliedTargetModifiersContextObjects: () ->
    appliedModifiersContextObjects = @getTargetModifiersContextObjects()
    numModifiersToPick = @numModifiersToApply
    if numModifiersToPick > 0 and numModifiersToPick < appliedModifiersContextObjects.length
      # pick modifiers at random
      modifierContextObjectsToPickFrom = appliedModifiersContextObjects.slice(0)
      appliedModifiersContextObjects = []
      while numModifiersToPick > 0
        # pick a modifier and remove it from the list to avoid picking duplicates
        modifierContextObject = modifierContextObjectsToPickFrom.splice(@getGameSession().getRandomIntegerForExecution(modifierContextObjectsToPickFrom.length), 1)[0]
        appliedModifiersContextObjects.push(modifierContextObject)
        numModifiersToPick--

    return appliedModifiersContextObjects

module.exports = SpellApplyModifiers
