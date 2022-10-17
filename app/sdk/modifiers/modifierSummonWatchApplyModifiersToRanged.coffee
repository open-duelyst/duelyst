Modifier = require './modifier'
ModifierSummonWatchApplyModifiers = require './modifierSummonWatchApplyModifiers'
ModifierRanged = require './modifierRanged'

class ModifierSummonWatchApplyModifiersToRanged extends ModifierSummonWatchApplyModifiers

  type:"ModifierSummonWatchApplyModifiersToRanged"
  @type:"ModifierSummonWatchApplyModifiersToRanged"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericBuff"]


  getIsCardRelevantToWatcher: (card) ->
    return card.hasActiveModifierClass(ModifierRanged)

module.exports = ModifierSummonWatchApplyModifiersToRanged
