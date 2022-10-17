Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
CardType = require 'app/sdk/cards/cardType'
ModifierSilence = require './modifierSilence'
i18next = require('i18next')

###
This is purposely not a subclass of myAttackWatch, because this dispel should occur
on beforeAction, rather than onAction
###

class ModifierDispelOnAttack extends Modifier

  type:"ModifierDispelOnAttack"
  @type:"ModifierDispelOnAttack"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  maxStacks: 1

  onBeforeAction: (actionEvent) ->
    super(actionEvent)
    # dispel target before attack action so that it cannot do onAttack actions
    # example: this dispel disables strikeback before it can counter attack
    a = actionEvent.action
    if a instanceof AttackAction and a.getSource() == @getCard()
      @getGameSession().applyModifierContextObject(ModifierSilence.createContextObject(), a.getTarget())

module.exports = ModifierDispelOnAttack
