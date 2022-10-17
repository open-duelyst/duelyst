Modifier = require './modifier'
ModifierDrawCardWatch = require './modifierDrawCardWatch'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'
i18next = require 'i18next'

class ModifierDrawCardWatchBuffSelf extends ModifierDrawCardWatch

  type:"ModifierDrawCardWatchBuffSelf"
  @type:"ModifierDrawCardWatchBuffSelf"

  @modifierName:"Draw Card Watch"
  @description:i18next.t("modifiers.draw_card_watch_buff_self_def")

  fxResource: ["FX.Modifiers.ModifierDrawCardWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0,options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
        modifierName:@modifierName,
        appliedName:i18next.t("modifiers.draw_card_watch_buff_self_name")
        description:Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff),
      })
    ]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return i18next.t("modifiers.draw_card_watch_buff_self_def",{buff:Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)})
      #return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onDrawCardWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierDrawCardWatchBuffSelf
