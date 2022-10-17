Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierAnySummonWatch extends Modifier

  type:"ModifierAnySummonWatch"
  @type:"ModifierAnySummonWatch"

  @modifierName:"Any Summon Watch"
  @description: "Any Summon Watch"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierAnySummonWatch"]

  onAction: (e) ->
    super(e)

    action = e.action

    if @getIsActionRelevant(action)
      @onSummonWatch(action)

  getIsActionRelevant: (a) ->
    # watch for a unit being summoned by any player (but not this card itself)
    if a instanceof PlayCardAction
      card = a.getCard()
      return card? and card.type is CardType.Unit and card != @getCard()

  onSummonWatch: (action) ->
    # override me in sub classes to implement special behavior

  onActivate: () ->
    # special check on activation in case this card is created mid-game
    # need to check all actions that occured this gamesession for triggers
    summonActions = @getGameSession().filterActions(@getIsActionRelevant.bind(@))
    for action in summonActions
      @onSummonWatch(action)

module.exports = ModifierAnySummonWatch
