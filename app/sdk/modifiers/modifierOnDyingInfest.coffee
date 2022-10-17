ModifierOnDying = require './modifierOnDying'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class ModifierOnDyingInfest extends ModifierOnDying

  type:"ModifierOnDyingInfest"
  @type:"ModifierOnDyingInfest"

  fxResource: ["FX.Modifiers.ModifierInfest", "FX.Modifiers.ModifierGenericChain"]

  onDying: () ->

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
        deathPlagueModifier = ModifierOnDyingInfest.createContextObject()
        deathPlagueModifier.appliedName = @appliedName
        deathPlagueModifier.appliedDescription = @appliedDescription
        @getGameSession().applyModifierContextObject(deathPlagueModifier, entity)

module.exports = ModifierOnDyingInfest
