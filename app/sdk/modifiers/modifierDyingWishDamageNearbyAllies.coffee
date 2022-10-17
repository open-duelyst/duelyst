CONFIG = require 'app/common/config'
ModifierDyingWish = require './modifierDyingWish'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDyingWishDamageNearbyAllies extends ModifierDyingWish

  type:"ModifierDyingWishDamageNearbyAllies"
  @type:"ModifierDyingWishDamageNearbyAllies"

  @modifierName:"Curse of Agony"
  @keyworded: false
  @description: "When this minion dies, deal %X damage to all nearby friendly minions and General"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierDyingWishDamageNearbyAllies", "FX.Modifiers.ModifierGenericDamageNearbyShadow"]

  @createContextObject: (damageAmount, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.damageAmount
    else
      return @description

  onDyingWish: () ->
    validEntities = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)

    for entity in validEntities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierDyingWishDamageNearbyAllies
