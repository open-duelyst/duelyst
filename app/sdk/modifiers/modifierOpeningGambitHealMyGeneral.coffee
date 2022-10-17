ModifierOpeningGambit = require './modifierOpeningGambit'
HealAction = require 'app/sdk/actions/healAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
CONFIG = require 'app/common/config'


class ModifierOpeningGambitHealMyGeneral extends ModifierOpeningGambit

  type: "ModifierOpeningGambitHealMyGeneral"
  @type: "ModifierOpeningGambitHealMyGeneral"

  @modifierName: "Opening Gambit"
  @description: "Restore %X Health to your General"

  healAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount, options) ->
    contextObject = super()
    contextObject.healAmount = healAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

  onOpeningGambit: () ->
    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    healAction = new HealAction(this.getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction)

module.exports = ModifierOpeningGambitHealMyGeneral
