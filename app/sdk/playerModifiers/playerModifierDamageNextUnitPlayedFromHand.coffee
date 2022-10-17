PlayerModifier = require './playerModifier'
CardType = require 'app/sdk/cards/cardType'
PlayCardFromHandAction = require 'app/sdk/actions/playCardFromHandAction'
DamageAction = require 'app/sdk/actions/damageAction'

class PlayerModifierDamageNextUnitPlayedFromHand extends PlayerModifier

  type:"PlayerModifierDamageNextUnitPlayedFromHand"
  @type:"PlayerModifierDamageNextUnitPlayedFromHand"

  @createContextObject: (damageAmount, duration=0, options) ->
    contextObject = super(options)
    contextObject.damageAmount = damageAmount
    contextObject.durationEndTurn = duration
    return contextObject

  onAction: (e) ->
    super(e)

    action = e.action
    # watch for this player playing a card from hand
    if action instanceof PlayCardFromHandAction
      if action.getOwnerId() is @getPlayerId() and action.getCard()?.type is CardType.Unit
        # damage that unit
        unitToDamage = action.getTarget()
        if unitToDamage?
          damageAction = new DamageAction(@getGameSession())
          damageAction.setOwnerId(@getCard().getOwnerId())
          appliedByAction = @getAppliedByAction()
          if appliedByAction?
            damageAction.setSource(appliedByAction.getRootAction().getCard?().getRootCard())
          damageAction.setTarget(unitToDamage)
          damageAction.setDamageAmount(@damageAmount)
          @getGameSession().executeAction(damageAction)

      # single use, so remove this modifier after a card is played
      @getGameSession().removeModifier(@)


module.exports = PlayerModifierDamageNextUnitPlayedFromHand
