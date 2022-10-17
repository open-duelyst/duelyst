CONFIG = require 'app/common/config'
ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'

class ModifierOpeningGambitDamageNearbyMinions extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageNearbyMinions"
  @type: "ModifierOpeningGambitDamageNearbyMinions"

  @modifierName: "Opening Gambit"
  @description: "Deal %X damage to"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericChainLightningRed"]

  @createContextObject: (damageAmount, includeAllies=true, options) ->
    contextObject = super()
    contextObject.damageAmount = damageAmount
    contextObject.includeAllies = includeAllies
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = @description
      if modifierContextObject.includeAllies
        replaceText += " ALL minions around it"
      else
        replaceText += " all enemy minions around it"
      return replaceText.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onOpeningGambit: () ->
    if @includeAllies
      entities = @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    else
      entities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)

    for entity in entities
      if !entity.getIsGeneral() # this ability only damages minions, not Generals
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        damageAction.setSource(@getCard())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitDamageNearbyMinions
