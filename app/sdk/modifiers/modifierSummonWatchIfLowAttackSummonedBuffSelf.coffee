ModifierSummonWatch = require './modifierSummonWatch'
Modifier = require './modifier'
Stringifiers = require 'app/sdk/helpers/stringifiers'

class ModifierSummonWatchIfLowAttackSummonedBuffSelf extends ModifierSummonWatch

  type:"ModifierSummonWatchIfLowAttackSummonedBuffSelf"
  @type:"ModifierSummonWatchIfLowAttackSummonedBuffSelf"

  @modifierName:"Summon Watch"
  @description: "Whenever you summon a minion with low attack, this minion gains a buff"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]

  @maxAttackTrigger: 0

  @createContextObject: (attackBuff=0, maxHPBuff=0, maxAttackTrigger=0, appliedModifierName=null, options) ->
    contextObject = super(options)
    contextObject.modifiersContextObjects = [
      Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPBuff, {
        modifierName:@modifierName,
        description:Stringifiers.stringifyAttackHealthBuff(attackBuff,maxHPBuff),
        appliedName:appliedModifierName
      })
    ]
    contextObject.maxAttackTrigger = maxAttackTrigger
    return contextObject

  onSummonWatch: (action) ->

    entity = action.getTarget()
    if entity?
      if entity.getBaseATK() <= @maxAttackTrigger
        @applyManagedModifiersFromModifiersContextObjects(@modifiersContextObjects, @getCard())

module.exports = ModifierSummonWatchIfLowAttackSummonedBuffSelf
