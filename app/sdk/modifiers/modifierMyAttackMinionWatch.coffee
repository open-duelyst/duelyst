Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyAttackMinionWatch extends Modifier

  type:"ModifierMyAttackMinionWatch"
  @type:"ModifierMyAttackMinionWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if action instanceof AttackAction and action.getSource() == @getCard() and (!action.getIsImplicit() or action.getIsAutomatic()) and !action.getTarget().getIsGeneral()
      @onMyAttackMinionWatch(action)

  onMyAttackMinionWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyAttackMinionWatch
