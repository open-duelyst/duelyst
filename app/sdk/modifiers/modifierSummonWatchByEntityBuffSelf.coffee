ModifierSummonWatch = require './modifierSummonWatch'
Modifier = require './modifier'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSummonWatchByEntityBuffSelf extends ModifierSummonWatch

  type:"ModifierSummonWatchByEntityBuffSelf"
  @type:"ModifierSummonWatchByEntityBuffSelf"

  @modifierName:"Summon Watch (buff by entity)"
  @description: "Whenever you summon a %X, this gains %Y"

  cardName: null

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, @targetEntityId, cardName, options) ->
    contextObject = super(options)
    contextObject.targetEntityId = @targetEntityId
    contextObject.cardName = cardName
    statBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff)
    statBuff.appliedName = "Overseer\'s Growth"
    contextObject.modifiersContextObjects = [statBuff]

    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      replaceText = @description.replace /%Y/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
      return replaceText.replace /%X/, modifierContextObject.cardName
    else
      return @description

  onSummonWatch: (action) ->
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

  getIsCardRelevantToWatcher: (card) ->
    return card.getBaseCardId() is @targetEntityId


module.exports = ModifierSummonWatchByEntityBuffSelf
