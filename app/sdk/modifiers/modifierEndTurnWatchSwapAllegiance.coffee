ModifierEndTurnWatch = require './modifierEndTurnWatch.coffee'
SwapUnitAllegianceAction = require 'app/sdk/actions/swapUnitAllegianceAction.coffee'

class ModifierEndTurnWatchSwapAllegiance extends ModifierEndTurnWatch

  type:"ModifierEndTurnWatchSwapAllegiance"
  @type:"ModifierEndTurnWatchSwapAllegiance"

  @modifierName:"Turn Watch"
  @description:"At the end of your turn, swap owner"

  isHiddenToUI: true # don't show this modifier by default

  fxResource: ["FX.Modifiers.ModifierEndTurnWatch"]

  onTurnWatch: (action) ->
    super(action)

    a = new SwapUnitAllegianceAction(@getCard().getGameSession())
    a.setTarget(@getCard())
    this.getGameSession().executeAction(a)

module.exports = ModifierEndTurnWatchSwapAllegiance
