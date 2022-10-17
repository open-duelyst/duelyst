ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
CONFIG = require 'app/common/config'


class ModifierOpeningGambitDamageBothGenerals extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageBothGenerals"
  @type: "ModifierOpeningGambitDamageBothGenerals"

  @modifierName: "Opening Gambit"
  @description: "Deal %X damage to BOTH Generals"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericDamageFire"]

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

    enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())

    enemyDamageAction = new DamageAction(this.getGameSession())
    enemyDamageAction.setOwnerId(@getCard().getOwnerId())
    enemyDamageAction.setSource(@getCard())
    enemyDamageAction.setTarget(enemyGeneral)
    enemyDamageAction.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(enemyDamageAction)

module.exports = ModifierOpeningGambitDamageBothGenerals
