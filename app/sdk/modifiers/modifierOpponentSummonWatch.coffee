Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'

class ModifierOpponentSummonWatch extends Modifier

  type:"ModifierOpponentSummonWatch"
  @type:"ModifierOpponentSummonWatch"

  @modifierName:"Opponent Summon Watch"
  @description: "Opponent Summon Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierOpponentSummonWatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action

    # watch for a unit being summoned in any way by the opponent of player who owns this entity
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() isnt @getCard().getOwnerId() and action.getCard()?.type is CardType.Unit and action.getCard() isnt @getCard()
      # don't react to transforms
      if !(action instanceof PlayCardAsTransformAction or action instanceof CloneEntityAsTransformAction)
        @onSummonWatch(action)

  onSummonWatch: (action) ->
    # override me in sub classes to implement special behavior

module.exports = ModifierOpponentSummonWatch
