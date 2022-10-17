Logger = require 'app/common/logger'
Spell = require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
HealAction = require 'app/sdk/actions/healAction'

class SpellRestoringLight extends Spell

  targetType: CardType.Unit
  healModifier: 3

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    friendlyMinions = board.getFriendlyEntitiesForEntity(general)

    healAction = new HealAction(@getGameSession())
    healAction.manaCost = 0
    healAction.setOwnerId(@ownerId)
    healAction.setTarget(general)
    healAction.setHealAmount(@healModifier)
    @getGameSession().executeAction(healAction)

    for entity in friendlyMinions
      for modifierContextObject in @getAppliedTargetModifiersContextObjects()
        @getGameSession().applyModifierContextObject(modifierContextObject, entity)

  setNumModifiersToApply: (val) ->
    @numModifiersToApply = val

  getNumModifiersToApply: () ->
    return @numModifiersToApply

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

module.exports = SpellRestoringLight
