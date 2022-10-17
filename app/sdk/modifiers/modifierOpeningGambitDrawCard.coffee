DrawCardAction = require 'app/sdk/actions/drawCardAction'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'

class ModifierOpeningGambitDrawCard extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDrawCard"
  @type: "ModifierOpeningGambitDrawCard"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  numCards: 1

  @createContextObject: (numCards=1, options) ->
    contextObject = super(options)
    contextObject.numCards = numCards
    return contextObject

  onOpeningGambit: () ->
    for [0...@numCards]
      @getGameSession().executeAction(new DrawCardAction(@getGameSession(), @getCard().getOwnerId()))

module.exports = ModifierOpeningGambitDrawCard
