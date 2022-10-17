Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class SpellCopyMinionToHand extends Spell

  resetDamage: true # normally this spell will reset damage on the copied minion (but retain other buffs)

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    entity = board.getCardAtPosition({x: x, y: y}, CardType.Unit)
    newCardData = entity.createCloneCardData()
    if @resetDamage
      newCardData.damage = 0

    putCardInHandAction = new PutCardInHandAction(@getGameSession(), entity.getOwnerId(), newCardData)
    @getGameSession().executeAction(putCardInHandAction)

module.exports = SpellCopyMinionToHand
