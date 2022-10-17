Modifier = require './modifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'

class ModifierApplyMinionToBoardWatch extends Modifier

  type:"ModifierApplyMinionToBoardWatch"
  @type:"ModifierApplyMinionToBoardWatch"

  @modifierName:"Any ApplyToBoard Watch"
  @description: "Any ApplyToBoard Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierApplyMinionToBoardWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    # watch for a unit being applied to board in any way by any player (except transforms)
    if action instanceof ApplyCardToBoardAction and action.getCard()?.type is CardType.Unit and action.getCard() isnt @getCard()
      if !(action instanceof PlayCardAsTransformAction)
        @onApplyToBoardWatch(action)

  onApplyToBoardWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierApplyMinionToBoardWatch
