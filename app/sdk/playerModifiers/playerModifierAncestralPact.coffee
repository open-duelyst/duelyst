PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
CardType = require 'app/sdk/cards/cardType'

class PlayerModifierAncestralPact extends PlayerModifier

  type:"PlayerModifierAncestralPact"
  @type:"PlayerModifierAncestralPact"

  @createContextObject: (duration=1, options) ->
    contextObject = super(options)
    contextObject.durationEndTurn = duration
    return contextObject

  onAction: (e) ->
    super(e)

    action = e.action
    # watch for this player playing a unit from hand
    if action instanceof PlayCardFromHandAction and action.getOwnerId() is @getPlayerId() and action.getCard()?.type is CardType.Unit
      # draw a card
      deck = @getGameSession().getPlayerById(@getPlayerId()).getDeck()
      @getGameSession().executeAction(deck.actionDrawCard())

module.exports = PlayerModifierAncestralPact
