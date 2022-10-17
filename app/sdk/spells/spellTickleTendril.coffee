Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
Spell = require './spell'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

class SpellTickleTendril extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x: x, y: y}
    entity = board.getUnitAtPosition(position)

    if entity?
      maxDamageAmount = 0
      for card in @getGameSession().getBoard().getCards(CardType.Tile, true)
        if card.getBaseCardId() is Cards.Tile.Shadow and card.isOwnedBy(@getOwner())
          maxDamageAmount++ #increase damage of spell

      if maxDamageAmount > 0
        finalDamageAmount = 0
        if maxDamageAmount < entity.getHP()
          finalDamageAmount = maxDamageAmount
        else
          finalDamageAmount = entity.getHP()

        # heal my general
        myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getOwnerId())
        healAction.setTarget(myGeneral)
        healAction.setHealAmount(finalDamageAmount)
        @getGameSession().executeAction(healAction)

        # damage enemy minion
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getOwnerId())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(finalDamageAmount)
        @getGameSession().executeAction(damageAction)

module.exports = SpellTickleTendril
