PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'

class PlayerModifierMyDeathwatchDrawCard extends PlayerModifier

  type:"PlayerModifierMyDeathwatchDrawCard"
  @type:"PlayerModifierMyDeathwatchDrawCard"

  @createContextObject: (duration=1, options) ->
    contextObject = super(options)
    contextObject.durationEndTurn = duration
    return contextObject

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action
    target = action.getTarget()
    # watch for a friendly unit dying
    if action instanceof DieAction and target?.type is CardType.Unit and target?.getOwnerId() is @getPlayerId() and target != @getCard()
      # draw a card
      deck = @getGameSession().getPlayerById(@getPlayerId()).getDeck()
      @getGameSession().executeAction(deck.actionDrawCard())


module.exports = PlayerModifierMyDeathwatchDrawCard
