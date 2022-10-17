Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'

class SpellHeavensEclipse extends Spell

  numSpells: 3

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # find all spells in the deck
    cardIndicesToDraw = []
    drawPile = @getOwner().getDeck().getDrawPile()
    indexOfSpells = []
    for cardIndex, i in drawPile
      if @getGameSession().getCardByIndex(cardIndex)?.getType() == CardType.Spell
        indexOfSpells.push(i)

    # find X random spells
    for [0...@numSpells]
      if indexOfSpells.length > 0
        spellIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexOfSpells.length)
        indexOfCardInDeck = indexOfSpells[spellIndexToRemove]
        indexOfSpells.splice(spellIndexToRemove,1)
        cardIndicesToDraw.push(drawPile[indexOfCardInDeck])

    # create put card in hand action
    if cardIndicesToDraw and cardIndicesToDraw.length > 0
      for cardIndex in cardIndicesToDraw
        drawCardAction =  @getGameSession().getPlayerById(@getOwner().getPlayerId()).getDeck().actionDrawCard(cardIndex)
        @getGameSession().executeAction(drawCardAction)

module.exports = SpellHeavensEclipse
