ModifierSentinel = require './modifierSentinel'
ApplyCardToBoardAction = require 'app/sdk/actions/applyCardToBoardAction'
CardType = require 'app/sdk/cards/cardType'
BonusManaAction =   require 'app/sdk/actions/bonusManaAction'
DrawCardAction = require 'app/sdk/actions/drawCardAction'
i18next = require('i18next')

class ModifierSentinelOpponentSpellCastRefundManaDrawCard extends ModifierSentinel

  type:"ModifierSentinelOpponentSpellCastRefundManaDrawCard"
  @type:"ModifierSentinelOpponentSpellCastRefundManaDrawCard"

  @description: i18next.t("modifiers.sentinel_spell_cast")

  @getDescription: (modifierContextObject) ->
    if modifierContextObject?
      return @description
    else
      return super()

  getIsActionRelevant: (action) ->
    if action.getOwner() is @getGameSession().getOpponentPlayerOfPlayerId(@getCard().getOwnerId()) and action instanceof ApplyCardToBoardAction and action.getIsValid()
      card = action.getCard()
      # watch for a spell being cast, but ignore followups! (like opening gambits)
      if card? and card.getRootCard()?.type is CardType.Spell
        return true
    return false

  onOverwatch: (action) ->
    super(action) # transform unit
    card = action.getCard().getRootCard()
    enemyGeneral = @getCard().getGameSession().getGeneralForPlayerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))

    if card?
      action = @getGameSession().createActionForType(BonusManaAction.type)
      action.setTarget(enemyGeneral)
      action.bonusMana = card.getManaCost()
      action.bonusDuration = 1
      @getGameSession().executeAction(action)

    @getGameSession().executeAction(new DrawCardAction(this.getGameSession(), enemyGeneral.getOwnerId()))

module.exports = ModifierSentinelOpponentSpellCastRefundManaDrawCard
