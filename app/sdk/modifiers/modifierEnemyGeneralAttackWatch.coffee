Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierEnemyGeneralAttackWatch extends Modifier

  type:"ModifierEnemyGeneralAttackWatch"
  @type:"ModifierEnemyGeneralAttackWatch"

  @modifierName:"ModifierEnemyGeneralAttackWatch"
  @description:"Whenever the enemy General attacks..."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierEnemyMinionAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()
    if action instanceof AttackAction and source.getOwner() isnt @getCard().getOwner() and source.getIsGeneral() and !action.getIsImplicit()
      @onEnemyGeneralAttackWatch(action)

  onEnemyGeneralAttackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyGeneralAttackWatch
