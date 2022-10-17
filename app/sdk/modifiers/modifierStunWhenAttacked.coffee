Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
ModifierStunnedVanar = require './modifierStunnedVanar'

class ModifierStunWhenAttacked extends Modifier

  type:"ModifierStunWhenAttacked"
  @type:"ModifierStunWhenAttacked"

  @modifierName:"Stunner"
  @description:"Minions next to this minion that attack it are Stunned"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  onAction: (actionEvent) ->
    super(actionEvent)
    a = actionEvent.action
    # when this wall is directly attacked
    if a instanceof AttackAction and a.getTarget() == @getCard() and !a.getIsImplicit()
      # by a nearby minion
      if !a.getSource().getIsGeneral() and a.getSource() in @getCard().getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
        # stun the attacker
        @getGameSession().applyModifierContextObject(ModifierStunnedVanar.createContextObject(), a.getSource())

module.exports = ModifierStunWhenAttacked
