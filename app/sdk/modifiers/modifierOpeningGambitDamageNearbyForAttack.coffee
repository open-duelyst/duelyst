ModifierOpeningGambit = require './modifierOpeningGambit'
DamageAction = require 'app/sdk/actions/damageAction'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'

class ModifierOpeningGambitDamageNearbyForAttack extends ModifierOpeningGambit

  type: "ModifierOpeningGambitDamageNearbyForAttack"
  @type: "ModifierOpeningGambitDamageNearbyForAttack"

  @modifierName: "Opening Gambit"
  @description: "ALL nearby minions deal damage to themselves equal to their Attack"

  targetType: CardType.Unit

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericDamageNearby"]


  onOpeningGambit: () ->

    for entity in @getGameSession().getBoard().getEntitiesAroundEntity(@getCard(), CardType.Unit, 1)
      if !entity.getIsGeneral() # this ability only damages minions, not Generals
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getCard().getOwnerId())
        # source and target are same because minion deals damage to itself
        damageAction.setSource(entity)
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(entity.getATK())
        @getGameSession().executeAction(damageAction)

module.exports = ModifierOpeningGambitDamageNearbyForAttack
