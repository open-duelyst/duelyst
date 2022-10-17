Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
DamageAction = require 'app/sdk/actions/damageAction'

class SpellUpperHand extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    minion = board.getCardAtPosition(applyEffectPosition, CardType.Unit, false, false)
    hand = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId()).getDeck().getCardsInHandExcludingMissing()
    if hand? and minion? and hand.length > 0
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getOwnerId())
      damageAction.setSource(@)
      damageAction.setTarget(minion)
      damageAction.setDamageAmount(hand.length)
      @getGameSession().executeAction(damageAction)

module.exports = SpellUpperHand
