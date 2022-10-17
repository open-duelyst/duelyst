ModifierDyingWish = require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierDyingWishInfest extends ModifierDyingWish

  type:"ModifierDyingWishInfest"
  @type:"ModifierDyingWishInfest"

  fxResource: ["FX.Modifiers.ModifierInfest", "FX.Modifiers.ModifierGenericChain"]

  onDyingWish: () ->

    general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

    damageAction = new DamageAction(@getGameSession())
    damageAction.setOwnerId(@getCard().getOwnerId())
    damageAction.setSource(@getCard())
    damageAction.setTarget(general)
    damageAction.setDamageAmount(2)
    @getGameSession().executeAction(damageAction)

    nearbyAllies = @getGameSession().getBoard().getFriendlyEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
    for entity in nearbyAllies
      if entity? and !entity.getIsGeneral()
        deathPlagueModifier = ModifierDyingWishInfest.createContextObject()
        deathPlagueModifier.appliedName = "Death Plague"
        deathPlagueModifier.appliedDescription = "When this dies, deals 2 damage to your General, then spreads to nearby friendly minions."
        @getGameSession().applyModifierContextObject(deathPlagueModifier, entity)

module.exports = ModifierDyingWishInfest
