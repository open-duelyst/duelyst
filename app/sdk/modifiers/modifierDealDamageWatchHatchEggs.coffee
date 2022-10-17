ModifierDealDamageWatch = require './modifierDealDamageWatch'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'

class ModifierDealDamageWatchHatchEggs extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchHatchEggs"
  @type:"ModifierDealDamageWatchHatchEggs"

  @modifierName:"Deal Damage and hatch eggs"
  @description:"Whenever this deals damage, hatch all friendly eggs"

  onDealDamage: (action) ->
    for entity in @getCard().getGameSession().getBoard().getUnits()
      if entity?.getOwnerId() is @getCard().getOwnerId() and entity.hasModifierClass(ModifierEgg)
        eggModifier = entity.getModifierByType(ModifierEgg.type)
        @getGameSession().pushTriggeringModifierOntoStack(eggModifier)
        eggModifier.removeAndReplace()
        @getGameSession().popTriggeringModifierFromStack()

module.exports = ModifierDealDamageWatchHatchEggs
