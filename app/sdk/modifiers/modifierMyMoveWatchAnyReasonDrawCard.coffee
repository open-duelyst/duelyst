ModifierMyMoveWatchAnyReason = require './modifierMyMoveWatchAnyReason'
CardType = require 'app/sdk/cards/cardType'

class ModifierMyMoveWatchAnyReasonDrawCard extends ModifierMyMoveWatchAnyReason

  type:"ModifierMyMoveWatchAnyReasonDrawCard"
  @type:"ModifierMyMoveWatchAnyReasonDrawCard"

  fxResource: ["FX.Modifiers.ModifierMyMoveWatch"]

  drawAmount: 1

  @createContextObject: (drawAmount=1, options) ->
    contextObject = super()
    contextObject.drawAmount = drawAmount
    return contextObject

  onMyMoveWatchAnyReason: (action) ->

    for i in [0...@drawAmount]
      deck = @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck()
      @getCard().getGameSession().executeAction(deck.actionDrawCard())

module.exports = ModifierMyMoveWatchAnyReasonDrawCard
