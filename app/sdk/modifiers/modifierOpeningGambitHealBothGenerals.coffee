ModifierOpeningGambit = require './modifierOpeningGambit'
HealAction = require 'app/sdk/actions/healAction'

class ModifierOpeningGambitHealBothGenerals extends ModifierOpeningGambit

  type: "ModifierOpeningGambitHealBothGenerals"
  @type: "ModifierOpeningGambitHealBothGenerals"

  @modifierName: "Opening Gambit"
  @description: "Restore %X Health to BOTH Generals"

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

    enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))

    healAction2 = new HealAction(this.getGameSession())
    healAction2.setOwnerId(@getCard().getOwnerId())
    healAction2.setTarget(enemyGeneral)
    healAction2.setHealAmount(@healAmount)
    @getGameSession().executeAction(healAction2)

module.exports = ModifierOpeningGambitHealBothGenerals
