Modifier = require './modifier'
ReplaceCardFromHandAction = require 'app/sdk/actions/replaceCardFromHandAction'
i18next = require 'i18next'

class ModifierBuffSelfOnReplace extends Modifier

  type:"ModifierBuffSelfOnReplace"
  @type:"ModifierBuffSelfOnReplace"

  @modifierName:"Buff Self On Replace"
  @description:i18next.t("modifiers.buff_self_on_replace_def")

  activeInHand: true
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: false

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, costChange=0, description, options=undefined) ->
    contextObject = super(options)
    statsBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statsBuff.appliedName = i18next.t("modifiers.buff_self_on_replace_name")
    statsBuff.attributeBuffs["manaCost"] = costChange
    contextObject.modifiersContextObjects = [statsBuff]
    contextObject.description = description
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return i18next.t("modifiers.buff_self_on_replace_def",{desc:@description})
      #return @description.replace /%X/, modifierContextObject.description
    else
      return @description

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for my player replacing THIS card
    if action instanceof ReplaceCardFromHandAction and action.getOwnerId() is @getCard().getOwnerId()
      replacedCard = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(action.replacedCardIndex)
      if replacedCard is @getCard()
        @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierBuffSelfOnReplace
