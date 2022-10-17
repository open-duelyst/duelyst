Modifier = require './modifier'
CardType = require 'app/sdk/cards/cardType'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'

class ModifierAnySummonWatchFromActionBar extends Modifier

  type:"ModifierAnySummonWatchFromActionBar"
  @type:"ModifierAnySummonWatchFromActionBar"

  @modifierName:"Any Summon Watch From Action Bar"
  @description: "Any Summon Watch From Action Bar"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  fxResource: ["FX.Modifiers.ModifierAnySummonWatchFromActionBar"]

  onAction: (e) ->
    super(e)

    action = e.action

    if @getIsActionRelevant(action)
      @onSummonWatch(action)

  getIsActionRelevant: (a) ->
    # watch for a unit being summoned from action bar by any player (except self)
    if a instanceof PlayCardFromHandAction
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

module.exports = ModifierAnySummonWatchFromActionBar
