Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierEnemyAttackWatch extends Modifier

  type:"ModifierEnemyAttackWatch"
  @type:"ModifierEnemyAttackWatch"

  @modifierName:"ModifierEnemyAttackWatch"
  @description:"Whenever an enemy attacks..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()
    if action instanceof AttackAction and source.getOwner() isnt @getCard().getOwner() and !action.getIsImplicit()
      @onEnemyAttackWatch(action)

  onEnemyAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyAttackWatch
