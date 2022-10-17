Modifier = require './modifier'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'

class ModifierIntensify extends Modifier

  type:"ModifierIntensify"
  @type:"ModifierIntensify"

  @isKeyworded: true
  @modifierName: "Intensify"
  @description: null
  @keywordDefinition: "Effect is boosted each time you play it."

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  getIsActionRelevant: (action) ->
    # watch for instances of playing this card
    if action instanceof ApplyCardToBoardAction and action.getOwnerId() is @getOwnerId() and action.getCard().getBaseCardId() is @getCard().getBaseCardId()
      return true
    else
      return false

  getIntensifyAmount: () ->
    amount = 0
    relevantActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    if relevantActions?
      amount = relevantActions.length
    return amount

  onActivate: () ->
    super()
    @onIntensify()

  onIntensify: () ->
    # override me in sub classes to implement special behavior

module.exports = ModifierIntensify
