ModifierMyAttackWatch = require './modifierMyAttackWatch'

class ModifierMyAttackWatchApplyModifiersToAllies extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchApplyModifiersToAllies"
  @type:"ModifierMyAttackWatchApplyModifiersToAllies"

  modifierContextObjects: null
  includeGeneral: false

  fxResource: ["FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (modifiers, includeGeneral, options) ->
    contextObject = super(options)
    contextObject.modifierContextObjects = modifiers
    contextObject.includeGeneral = includeGeneral
    return contextObject

  onMyAttackWatch: (action) ->

    friendlyEntities = @getGameSession().getBoard().getFriendlyEntitiesForEntity(@getCard())
    for entity in friendlyEntities
      if !entity.getIsGeneral() or @includeGeneral
        for modifier in @modifierContextObjects
          @getGameSession().applyModifierContextObject(modifier, entity)

module.exports = ModifierMyAttackWatchApplyModifiersToAllies
