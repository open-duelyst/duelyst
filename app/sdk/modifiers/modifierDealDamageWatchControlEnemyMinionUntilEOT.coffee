ModifierDealDamageWatch = require './modifierDealDamageWatch'
CardType = require 'app/sdk/cards/cardType'
SwapUnitAllegianceAction = require 'app/sdk/actions/swapUnitAllegianceAction.coffee'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction.coffee'
ModifierEndTurnWatchSwapAllegiance = require 'app/sdk/modifiers/modifierEndTurnWatchSwapAllegiance'

class ModifierDealDamageWatchControlEnemyMinionUntilEOT extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchControlEnemyMinionUntilEOT"
  @type:"ModifierDealDamageWatchControlEnemyMinionUntilEOT"

  @modifierName:"Deal Damage to a minion and take control of it"
  @description:"Whenever this minion deals damage to a minion, take control of it until end of turn"

  onDealDamage: (action) ->

    target = action.getTarget()

    if target?.type == CardType.Unit and !target.getIsGeneral()

      endTurnDuration = 1
      if !@getCard().isOwnersTurn()
        endTurnDuration = 2

      a = new SwapUnitAllegianceAction(@getGameSession())
      a.setTarget(target)
      @getGameSession().executeAction(a)

      # activate immediately
      refreshExhaustionAction = new RefreshExhaustionAction(@getGameSession())
      refreshExhaustionAction.setTarget(target)
      @getGameSession().executeAction(refreshExhaustionAction)

      # give back at end of turn
      swapAllegianceContextObject = ModifierEndTurnWatchSwapAllegiance.createContextObject()
      swapAllegianceContextObject.durationEndTurn = endTurnDuration
      swapAllegianceContextObject.isRemovable = false
      @getGameSession().applyModifierContextObject(swapAllegianceContextObject, target)

module.exports = ModifierDealDamageWatchControlEnemyMinionUntilEOT
