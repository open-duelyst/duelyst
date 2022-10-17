PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
CardType = require 'app/sdk/cards/cardType'

class PlayerModifierCardDrawModifier extends PlayerModifier

  type:"PlayerModifierCardDrawModifier"
  @type:"PlayerModifierCardDrawModifier"

  @createContextObject: (cardDrawChange, duration=0, options) ->
    contextObject = super(options)
    contextObject.cardDrawChange = cardDrawChange
    contextObject.durationStartTurn = duration
    return contextObject

  getCardDrawChange: () ->
    if @getIsActive()
      return @cardDrawChange
    else
      return 0

module.exports = PlayerModifierCardDrawModifier
