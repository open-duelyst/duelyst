Modifier =   require './modifier'
HealAction = require 'app/sdk/actions/healAction'

class ModifierEnemyCannotHeal extends Modifier

  type:"ModifierEnemyCannotHeal"
  @type:"ModifierEnemyCannotHeal"

  @modifierName:"ModifierEnemyCannotHeal"
  @description: "Enemy minions and Generals cannot heal"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierEnemyCannotHeal"]

  # watch for enemy heals, and turn them into 0s
  onModifyActionForExecution: (e) ->
    super(e)

    action = e.action
    if action instanceof HealAction and action.getTarget()?.getOwnerId() isnt @getCard().getOwnerId()
      action.setChangedByModifier(@)
      action.setHealMultiplier(0)

module.exports = ModifierEnemyCannotHeal
