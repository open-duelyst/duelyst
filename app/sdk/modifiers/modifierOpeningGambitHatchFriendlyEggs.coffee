ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'

class ModifierOpeningGambitHatchFriendlyEggs extends ModifierOpeningGambit

  type: "ModifierOpeningGambitHatchFriendlyEggs"
  @type: "ModifierOpeningGambitHatchFriendlyEggs"

  @description: "Hatch all friendly eggs"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit"]

  onOpeningGambit: () ->
    for entity in @getCard().getGameSession().getBoard().getUnits()
      if entity?.getOwnerId() is @getCard().getOwnerId() and entity.hasModifierClass(ModifierEgg)
        eggModifier = entity.getModifierByType(ModifierEgg.type)
        @getGameSession().pushTriggeringModifierOntoStack(eggModifier)
        eggModifier.removeAndReplace()
        @getGameSession().popTriggeringModifierFromStack()


module.exports = ModifierOpeningGambitHatchFriendlyEggs
