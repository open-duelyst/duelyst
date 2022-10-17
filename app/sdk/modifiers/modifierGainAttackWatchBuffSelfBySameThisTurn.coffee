Modifier = require './modifier'
ModifierGainAttackWatch = require './modifierGainAttackWatch'
i18next = require 'i18next'

class ModifierGainAttackWatchBuffSelfBySameThisTurn extends ModifierGainAttackWatch

  type:"ModifierGainAttackWatchBuffSelfBySameThisTurn"
  @type:"ModifierGainAttackWatchBuffSelfBySameThisTurn"

  @modifierName:"Gain Attack Watch"
  @description:i18next.t("modifiers.gain_attack_watch_buff_self_by_same_this_turn_def")

  fxResource: ["FX.Modifiers.ModifierDrawCardWatch", "FX.Modifiers.ModifierGenericBuff"]

  onGainAttackWatch: (action) ->
    attackBuff = action.getModifier().attributeBuffs["atk"]
    modifierContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff)
    modifierContextObject.appliedName = i18next.t("modifiers.gain_attack_watch_buff_self_by_same_this_turn_name")
    modifierContextObject.durationEndTurn = 1
    @getGameSession().applyModifierContextObject(modifierContextObject, @getCard(), @)

module.exports = ModifierGainAttackWatchBuffSelfBySameThisTurn
