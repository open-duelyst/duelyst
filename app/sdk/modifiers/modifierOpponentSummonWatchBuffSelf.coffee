Modifier = require './modifier'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
applyCardToBoardAction =     require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierOpponentSummonWatchBuffSelf extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchBuffSelf"
  @type:"ModifierOpponentSummonWatchBuffSelf"

  @modifierName:"Opponent Summon Watch"
  @description: "Whenever opponent summons a minion, this minion gains %X"

  fxResource: ["FX.Modifiers.ModifierOpponentSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (attackBuff=0, maxHPBuff=0, options) ->
    contextObject = super(options)
    statContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff,{
      modifierName:@modifierName,
      description:Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff),
    })
    statContextObject.appliedName = "Overseer's Growth"
    contextObject.modifiersContextObjects = [
      statContextObject
    ]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      subContextObject = modifierContextObject.modifiersContextObjects[0]
      return @description.replace /%X/, Stringifiers.stringifyAttackHealthBuff(subContextObject.attributeBuffs.atk,subContextObject.attributeBuffs.maxHP)
    else
      return @description

  onSummonWatch: (action) ->
    # override me in sub classes to implement special behavior
    @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierOpponentSummonWatchBuffSelf
