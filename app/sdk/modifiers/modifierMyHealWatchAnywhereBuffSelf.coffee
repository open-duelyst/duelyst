Modifier = require './modifier'
ModifierMyHealWatchAnywhere = require './modifierMyHealWatchAnywhere'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierMyHealWatchAnywhereBuffSelf extends ModifierMyHealWatchAnywhere

  type:"ModifierMyHealWatchAnywhereBuffSelf"
  @type:"ModifierMyHealWatchAnywhereBuffSelf"

  @modifierName:"My Heal Watch Anywhere Buff Self"
  @description:"This minion gains %X for each time you healed anything this game"

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statContextObject.appliedName = "Excelsior!"
    contextObject.modifiersContextObjects = [statContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onHealWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierMyHealWatchAnywhereBuffSelf
