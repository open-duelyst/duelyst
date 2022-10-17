CONFIG = require 'app/common/config'
ModifierSummonWatch = require './modifierSummonWatch'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
SwapGeneralAction = require 'app/sdk/actions/swapGeneralAction'

class ModifierOpponentSummonWatchSwapGeneral extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchSwapGeneral"
  @type:"ModifierOpponentSummonWatchSwapGeneral"

  @modifierName:"Opponent Summon Watch"
  @description:"Whenever an enemy summons a minion, it becomes their new General"

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (options) ->
    contextObject = super(options)

    return contextObject

  onSummonWatch: (action) ->
    super(action)

    general = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
    newMinion = action.getTarget()

    # turn the new unit into your general
    if general?
      swapGeneralAction = new SwapGeneralAction(@getGameSession())
      swapGeneralAction.setIsDepthFirst(false)
      swapGeneralAction.setSource(general)
      swapGeneralAction.setTarget(newMinion)
      @getGameSession().executeAction(swapGeneralAction)

module.exports = ModifierOpponentSummonWatchSwapGeneral
