Modifier = require './modifier'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierHPChange extends Modifier

  type:"ModifierHPChange"
  @type:"ModifierHPChange"

  @modifierName:"Modifier HP Change"
  @description: "Whenever this card's HP changes"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]
  onAction: (e) ->
    super(e)

    action = e.action

    if action.getTarget() == @getCard() and ((action instanceof HealAction and action.getTotalHealApplied() > 0) or (action instanceof DamageAction and action.getTotalDamageAmount() > 0))
      @onHPChange(action)

  onHPChange: (e) ->
    # override in sub-class
module.exports = ModifierHPChange
