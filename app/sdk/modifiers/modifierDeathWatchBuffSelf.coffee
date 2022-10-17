Modifier = require './modifier'
ModifierDeathWatch = require './modifierDeathWatch'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

i18next = require('i18next')

class ModifierDeathWatchBuffSelf extends ModifierDeathWatch

  type:"ModifierDeathWatchBuffSelf"
  @type:"ModifierDeathWatchBuffSelf"

  @isKeyworded: true
  @keywordDefinition: i18next.t("modifiers.deathwatch_def")

  @modifierName:i18next.t("modifiers.deathwatch_name")
  @description: "Gains %X"

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
        modifierName:@modifierName,
        appliedName:i18next.t("modifiers.deathwatch_buff_applied_name"),
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

  onDeathWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierDeathWatchBuffSelf
