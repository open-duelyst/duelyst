PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'

class PlayerModifierChangeSignatureCard extends PlayerModifier

  type:"PlayerModifierChangeSignatureCard"
  @type:"PlayerModifierChangeSignatureCard"

  @createContextObject: (cardDataOrIndex, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndex = cardDataOrIndex
    return contextObject

  getSignatureCardData: () ->
    return @cardDataOrIndex

  onActivate: ()  ->
    super()

    @getGameSession().executeAction(@getPlayer().actionGenerateSignatureCard())

  onDeactivate: ()  ->
    super()

    @getGameSession().executeAction(@getPlayer().actionGenerateSignatureCard())

module.exports = PlayerModifierChangeSignatureCard
