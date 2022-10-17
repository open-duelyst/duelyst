ModifierOpeningGambit = require './modifierOpeningGambit'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
CONFIG = require 'app/common/config'


class ModifierOpeningGambitDrawCardBothPlayers extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDrawCardBothPlayers"
  @type: "ModifierOpeningGambitDrawCardBothPlayers"

  @modifierName: "Opening Gambit"
  @description: "Both players draw a card"


  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onOpeningGambit: () ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())
    @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), general.getOwnerId()))

    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))

module.exports = ModifierOpeningGambitDrawCardBothPlayers
