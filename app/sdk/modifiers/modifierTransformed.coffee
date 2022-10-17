Modifier = require './modifier'
SetExhaustionAction =  require 'app/sdk/actions/setExhaustionAction'

class ModifierTransformed extends Modifier

  type:"ModifierTransformed"
  @type:"ModifierTransformed"

  maxStacks: 1

  @modifierName:"Transformed"
  @description: "Transformed"

  @isHiddenToUI: true
  isRemovable: false
  isInherent: true # transform should show description in card text
  activeInDeck: false
  activeInHand: false
  activeInSignatureCards: false
  isCloneable: false

  fxResource: ["FX.Modifiers.ModifierTransformed"]

  @createContextObject: (exhausted, movesMade, attacksMade, options) ->
    contextObject = super(options)
    contextObject.exhausted = exhausted
    contextObject.movesMade = movesMade
    contextObject.attacksMade = attacksMade
    return contextObject

  onApplyToCard: (card)  ->
    super(card)

    # update exhaustion state of transformed card
    # only do this when this modifier is initially applied to the card
    if @_private.cachedIsActive
      setExhaustionAction = @getGameSession().createActionForType(SetExhaustionAction.type)
      setExhaustionAction.setExhausted(@exhausted)
      setExhaustionAction.setMovesMade(@movesMade)
      setExhaustionAction.setAttacksMade(@attacksMade)
      setExhaustionAction.setSource(@getCard())
      setExhaustionAction.setTarget(@getCard())
      @getCard().getGameSession().executeAction(setExhaustionAction)

module.exports = ModifierTransformed
