Modifier = require './modifier'
ModifierHealWatch = require './modifierHealWatch'
CardType = require 'app/sdk/cards/cardType'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'

class ModifierHealWatchDamageRandomEnemy extends ModifierHealWatch

  type:"ModifierHealWatchDamageRandomEnemy"
  @type:"ModifierHealWatchDamageRandomEnemy"

  @modifierName:"Heal Watch Damage Random Enemy for X"
  @description: "Whenever anything is healed, a random enemy takes damage"

  fxResource: ["FX.Modifiers.ModifierHealWatch", "FX.Modifiers.ModifierGenericDamageSmall"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  onHealWatch: (action) ->
    if !@damageAmount
      damageAmount = action.getTotalHealApplied()
    else
      damageAmount = @damageAmount

    if damageAmount > 0
      randomDamageAction = new RandomDamageAction(@getGameSession())
      randomDamageAction.setOwnerId(@getCard().getOwnerId())
      randomDamageAction.setSource(@getCard())
      randomDamageAction.setDamageAmount(damageAmount)
      randomDamageAction.canTargetGenerals = true
      @getGameSession().executeAction(randomDamageAction)

module.exports = ModifierHealWatchDamageRandomEnemy
