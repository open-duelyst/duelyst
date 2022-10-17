Modifier = require './modifier'
ApplyModifierAction = require 'app/sdk/actions/applyModifierAction'

class ModifierGainAttackWatch extends Modifier

  type:"ModifierGainAttackWatch"
  @type:"ModifierGainAttackWatch"

  @modifierName:"GainAttackWatch"
  @description: "GainAttackWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierGainAttackWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for any of my minions gaining Attack
    if action instanceof ApplyModifierAction and action.getTarget().getOwnerId() is @getCard().getOwnerId() and action.getModifier().getBuffsAttribute("atk") and !action.getTarget().getIsGeneral?()
      modifier = action.getModifier()
      if modifier.getBuffsAttribute("atk") and modifier.attributeBuffs["atk"] > 0 and !modifier.getRebasesAttribute("atk") and !modifier.getBuffsAttributeAbsolutely("atk")
        @onGainAttackWatch(action)

  onGainAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierGainAttackWatch
