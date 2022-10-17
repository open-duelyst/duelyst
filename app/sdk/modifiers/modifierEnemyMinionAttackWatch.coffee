Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierEnemyMinionAttackWatch extends Modifier

  type:"ModifierEnemyMinionAttackWatch"
  @type:"ModifierEnemyMinionAttackWatch"

  @modifierName:"ModifierEnemyMinionAttackWatch"
  @description:"Whenever an enemy minion attacks..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierEnemyMinionAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()
    if action instanceof AttackAction and source.getOwner() isnt @getCard().getOwner() and !source.getIsGeneral() and !action.getIsImplicit()
      @onEnemyMinionAttackWatch(action)

  onEnemyMinionAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyMinionAttackWatch
