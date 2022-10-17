ModifierDeathWatch = require './modifierDeathWatch'
SwapUnitAllegianceAction =     require('app/sdk/actions/swapUnitAllegianceAction')

class ModifierDeathWatchFriendlyMinionSwapAllegiance extends ModifierDeathWatch

  type:"ModifierDeathWatchFriendlyMinionSwapAllegiance"
  @type:"ModifierDeathWatchFriendlyMinionSwapAllegiance"

  @modifierName:"Deathwatch"
  @description:"Whenever a friendly minion is destroyed, your opponent gains control of this minion."

  fxResource: ["FX.Modifiers.ModifierDeathwatch", "FX.Modifiers.ModifierGenericChain"]

  onDeathWatch: (action) ->
    #if the target is a friendly minion
    if action.getTarget().getOwnerId() is @getCard().getOwnerId()
      a = new SwapUnitAllegianceAction(@getGameSession())
      a.setTarget(@getCard())
      @getGameSession().executeAction(a)

module.exports = ModifierDeathWatchFriendlyMinionSwapAllegiance
