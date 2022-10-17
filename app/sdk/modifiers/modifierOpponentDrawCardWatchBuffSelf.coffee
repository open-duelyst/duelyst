ModifierOpponentDrawCardWatch = require './modifierOpponentDrawCardWatch'
Modifier = require './modifier'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierOpponentDrawCardWatchBuffSelf extends ModifierOpponentDrawCardWatch

  type:"ModifierOpponentDrawCardWatchBuffSelf"
  @type:"ModifierOpponentDrawCardWatchBuffSelf"

  @modifierName:"ModifierOpponentDrawCardWatchBuffSelf"
  @description: "Whenever your opponent draws a card, this minion gains %X"

  fxResource: ["FX.Modifiers.ModifierOpponentDrawCardWatchBuffSelf", "FX.Modifiers.ModifierGenericDamage"]

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
        modifierName:@modifierName,
        appliedName:"Vindicated!"
        description:Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff),
      })
    ]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onDrawCardWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierOpponentDrawCardWatchBuffSelf
