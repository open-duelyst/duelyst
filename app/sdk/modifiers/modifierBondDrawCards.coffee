CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierBond = require './modifierBond'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierBondDrawCards extends ModifierBond

  type:"ModifierBondDrawCards"
  @type:"ModifierBondDrawCards"

  @description: "Draw some cards from the deck"

  fxResource: ["FX.Modifiers.ModifierBond"]

  @createContextObject: (numCards) ->
    contextObject = super()
    contextObject.numCards = numCards
    return contextObject

  onBond: () ->

    for i in [0...@numCards]
      deck = @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck()
      @getCard().getGameSession().executeAction(deck.actionDrawCard())

module.exports = ModifierBondDrawCards