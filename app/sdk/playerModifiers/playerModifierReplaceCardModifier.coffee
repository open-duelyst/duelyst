PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
CardType = require 'app/sdk/cards/cardType'

class PlayerModifierReplaceCardModifier extends PlayerModifier

  type:"PlayerModifierReplaceCardModifier"
  @type:"PlayerModifierReplaceCardModifier"

  @createContextObject: (replaceCardChange, duration=0, options) ->
    contextObject = super(options)
    contextObject.replaceCardChange = replaceCardChange
    contextObject.durationEndTurn = duration
    return contextObject

  getReplaceCardChange: () ->
    if @getIsActive()
      return @replaceCardChange
    else
      return 0

module.exports = PlayerModifierReplaceCardModifier
