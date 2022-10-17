Modifier = require './modifier'
ModifierReplaceWatch = require './modifierReplaceWatch'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierReplaceWatchBuffSelf extends ModifierReplaceWatch

  type:"ModifierReplaceWatchBuffSelf"
  @type:"ModifierReplaceWatchBuffSelf"

  @modifierName:"Replace Watch"
  @description: "Whenever you replace a card, this minion gains %X"

  fxResource: ["FX.Modifiers.ModifierReplaceWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, buffDescription=undefined, options=undefined) ->
    contextObject = super(options)
    statsBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    if buffDescription?
      contextObject.buffDescription = buffDescription
    contextObject.modifiersContextObjects = [statsBuff]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject.buffDescription?
      return @description.replace /%X/, modifierContextObject.buffDescription
    else
      if modifierContextObject
        subContextObject = modifierContextObject.modifiersContextObjects[0]
        return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
      else
        return @description

  onReplaceWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierReplaceWatchBuffSelf
