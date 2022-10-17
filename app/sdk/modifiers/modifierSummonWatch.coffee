Modifier = require './modifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
PlayCardAsTransformAction = require 'app/sdk/actions/playCardAsTransformAction'
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'

class ModifierSummonWatch extends Modifier

  type:"ModifierSummonWatch"
  @type:"ModifierSummonWatch"

  @modifierName:"Summon Watch"
  @description: "Summon Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierSummonWatch"]

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action

    # watch for a unit being summoned in any way by the player who owns this entity, but don't react to transforms
    if @getIsActionRelevant(action) and @getIsCardRelevantToWatcher(action.getCard())
      @onSummonWatch(action)

  getIsActionRelevant: (action) ->
    return action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Unit and action.getCard() isnt @getCard() and !(action instanceof PlayCardAsTransformAction or action instanceof CloneEntityAsTransformAction)

  onSummonWatch: (action) ->
    # override me in sub classes to implement special behavior

  getIsCardRelevantToWatcher: (card) ->
    return true # override me in sub classes to implement special behavior


module.exports = ModifierSummonWatch
