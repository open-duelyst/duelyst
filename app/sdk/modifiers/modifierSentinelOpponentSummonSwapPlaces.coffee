ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierSentinelOpponentSummon = require './modifierSentinelOpponentSummon'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'
FXType = require 'app/sdk/helpers/fxType'
CardType = require 'app/sdk/cards/cardType'
_ = require 'underscore'

class ModifierSentinelOpponentSummonSwapPlaces extends ModifierSentinelOpponentSummon

  type:"ModifierSentinelOpponentSummonSwapPlaces"
  @type:"ModifierSentinelOpponentSummonSwapPlaces"

  onOverwatch: (action) ->
    # damage unit that was just summoned by enemy
    transformedUnit = super(action) # transform unit
    if action.getTarget()? and @getGameSession().getCanCardBeScheduledForRemoval(transformedUnit, true)
      swapAction = new SwapUnitsAction(@getGameSession())
      swapAction.setOwnerId(@getOwnerId())
      swapAction.setSource(transformedUnit)
      swapAction.setTarget(action.getTarget())
      swapAction.setFXResource(_.union(swapAction.getFXResource(), @getFXResource()))
      @getGameSession().executeAction(swapAction)

module.exports = ModifierSentinelOpponentSummonSwapPlaces
