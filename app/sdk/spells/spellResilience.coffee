Spell = require './spell'
HealAction = require 'app/sdk/actions/healAction'

class SpellResilience extends Spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x: x, y: y}
    unit = board.getUnitAtPosition(position)
    if unit.getDamage() > 0
      healAction = new HealAction(@getGameSession())
      healAction.setOwnerId(@getOwnerId())
      healAction.setTarget(unit)
      healAction.setHealAmount(unit.getDamage())
      @getGameSession().executeAction(healAction)

    drawPile = @getOwner().getDeck().getDrawPile()
    indexOfCard = -1
    cardFound = false

    for cardIndex, i in drawPile
      cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
      if cardAtIndex?.getBaseCardId() == unit.getBaseCardId()
        indexOfCard = i
        cardFound = true
        break

    if cardFound
      cardIndexToDraw = drawPile[indexOfCard]
      if cardIndexToDraw?
        card = @getGameSession().getCardByIndex(cardIndexToDraw)
        drawCardAction = @getGameSession().getPlayerById(@getOwner().getPlayerId()).getDeck().actionDrawCard(cardIndexToDraw)
        @getGameSession().executeAction(drawCardAction)

module.exports = SpellResilience
