Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'

class ModifierEnemyGeneralAttackedWatch extends Modifier

  type:"ModifierEnemyGeneralAttackedWatch"
  @type:"ModifierEnemyGeneralAttackedWatch"

  activeInHand: true
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: false

  fxResource: ["FX.Modifiers.ModifierEnemyMinionAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    source = action.getSource()
    if action instanceof AttackAction and action.getTarget().getOwner() isnt @getCard().getOwner() and action.getTarget().getIsGeneral() and !action.getIsImplicit()
      @onEnemyGeneralAttackedWatch(action)

  onEnemyGeneralAttackedWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierEnemyGeneralAttackedWatch
