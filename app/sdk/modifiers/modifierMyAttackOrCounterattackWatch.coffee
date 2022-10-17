Modifier = require './modifier'
AttackAction = require 'app/sdk/actions/attackAction'
ForcedAttackAction = require 'app/sdk/actions/forcedAttackAction'
ModifierStrikeback = require 'app/sdk/modifiers/modifierStrikeback'

class ModifierMyAttackOrCounterattackWatch extends Modifier

  type:"ModifierMyAttackOrCounterattackWatch"
  @type:"ModifierMyAttackOrCounterattackWatch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierMyAttackWatch"]

  onAction: (event) ->
    super(event)
    action = event.action
    if action.getSource() == @getCard() and ( action instanceof AttackAction and (!action.getIsImplicit() or action.getTriggeringModifier() instanceof ModifierStrikeback) or action instanceof ForcedAttackAction)
      @onMyAttackOrCounterattackWatch(action)

  onMyAttackOrCounterattackWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierMyAttackOrCounterattackWatch
