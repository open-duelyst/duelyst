CONFIG = require 'app/common/config'
ModifierDyingWish = require './modifierDyingWish'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDyingWishDamageNearbyEnemies extends ModifierDyingWish

  type:"ModifierDyingWishDamageNearbyEnemies"
  @type:"ModifierDyingWishDamageNearbyEnemies"

  @description: "This minion deals %X damage to all enemies around it"

  damageAmount: 0

  fxResource: ["FX.Modifiers.ModifierDyingWishDamageNearbyAllies", "FX.Modifiers.ModifierGenericDamage"]

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
    validEntities = @getGameSession().getBoard().getEnemyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)

    for entity in validEntities
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getCard().getOwnerId())
      damageAction.setSource(@getCard())
      damageAction.setTarget(entity)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

module.exports = ModifierDyingWishDamageNearbyEnemies
