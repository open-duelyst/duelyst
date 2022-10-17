Modifier = require './modifier'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierSurviveDamageWatch extends Modifier

  type:"ModifierSurviveDamageWatch"
  @type:"ModifierSurviveDamageWatch"


  @modifierName:"Survive Damage Watch"
  @description: "Survive Damage"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSurviveDamageWatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    # watch for this card taking damage > 0 AND surviving the damage
    if action instanceof DamageAction and action.getTarget() is @getCard() and action.getTotalDamageAmount() > 0
      @onSurviveDamage(action)

  onSurviveDamage: (action) ->
    # override me in sub classes to implement special behavior


module.exports = ModifierSurviveDamageWatch
