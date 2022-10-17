Modifier = require './modifier'
ModifierFirstBlood = require './modifierFirstBlood'
RefreshExhaustionAction = require 'app/sdk/actions/refreshExhaustionAction'

class ModifierInvalidateRush extends Modifier

  type:"ModifierInvalidateRush"
  @type:"ModifierInvalidateRush"

  @modifierName:"ModifierInvalidateRush"
  @description: "Whenever ANY player summons a minion with Rush, exhaust it"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierInvalidateRush"]


  onValidateAction:(actionEvent) ->
    super(actionEvent)

    action = actionEvent.action
    # block refresh exhaustion actions triggered by a Rush modifier
    # note: we have to check against gamesession triggering modifier here since this is pre-validation, triggering modifier relationship is not yet set
    if action instanceof RefreshExhaustionAction and !action.getTarget()?.getIsGeneral() and @getGameSession().getTriggeringModifier() instanceof ModifierFirstBlood
      @invalidateAction(action)

module.exports = ModifierInvalidateRush
