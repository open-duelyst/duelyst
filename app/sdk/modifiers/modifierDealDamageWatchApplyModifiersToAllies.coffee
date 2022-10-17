ModifierDealDamageWatch = require './modifierDealDamageWatch'

class ModifierDealDamageWatchApplyModifiersToAllies extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchApplyModifiersToAllies"
  @type:"ModifierDealDamageWatchApplyModifiersToAllies"

  modifierContextObjects: null
  includeGeneral: false

  @createContextObject: (modifiers, includeGeneral, options) ->
    contextObject = super(options)
    contextObject.modifierContextObjects = modifiers
    contextObject.includeGeneral = includeGeneral
    return contextObject

  onAfterDealDamage: (action) ->

    #apply to self if not a General
    if !@getCard().getIsGeneral()
      for modifier in @modifierContextObjects
        @getGameSession().applyModifierContextObject(modifier, @getCard())

    #apply to friendly minions and General
    friendlyEntities = @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
    for entity in friendlyEntities
      if !entity.getIsGeneral() or @includeGeneral
        for modifier in @modifierContextObjects
          @getGameSession().applyModifierContextObject(modifier, entity)

module.exports = ModifierDealDamageWatchApplyModifiersToAllies
