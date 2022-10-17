ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
CONFIG = require 'app/common/config'


class ModifierOpeningGambitDamageMyGeneral extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageMyGeneral"
  @type: "ModifierOpeningGambitDamageMyGeneral"

  @modifierName: "Opening Gambit"
  @description: "Deal %X damage to your General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericChainLightning"]

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

    damageAction = new DamageAction(this.getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(general)
    damageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitDamageMyGeneral
