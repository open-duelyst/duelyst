ModifierSummonWatch = require './modifierSummonWatch'
Modifier = require './modifier'

class ModifierSummonWatchByRaceBuffSelf extends ModifierSummonWatch

  type:"ModifierSummonWatchByRaceBuffSelf"
  @type:"ModifierSummonWatchByRaceBuffSelf"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, targetRaceId, buffAppliedName, options) ->
    contextObject = super(options)
    contextObject.targetRaceId = targetRaceId
    contextObject.modifiersContextObjects = [Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff, {appliedName: buffAppliedName})]
    return contextObject

  onSummonWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

  getIsCardRelevantToWatcher: (card) ->
    return card.getBelongsToTribe(@targetRaceId)

module.exports = ModifierSummonWatchByRaceBuffSelf
