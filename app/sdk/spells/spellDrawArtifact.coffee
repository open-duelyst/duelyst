Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'

class SpellDrawArtifact extends Spell

  numArtifacts: 1

  _findApplyEffectPositions: (position, sourceAction) ->
    return [@getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()]

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # find all spells in the deck
    cardIndicesToDraw = []
    drawPile = @getOwner().getDeck().getDrawPile()
    indexOfArtifacts = []
    for cardIndex, i in drawPile
      if @getGameSession().getCardByIndex(cardIndex)?.getType() == CardType.Artifact
        indexOfArtifacts.push(i)

    # find X random artifacts
    for [0...@numArtifacts]
      if indexOfArtifacts.length > 0
        artifactIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexOfArtifacts.length)
        indexOfCardInDeck = indexOfArtifacts[artifactIndexToRemove]
        indexOfArtifacts.splice(artifactIndexToRemove,1)
        cardIndicesToDraw.push(drawPile[indexOfCardInDeck])

    # create put card in hand action
    if cardIndicesToDraw and cardIndicesToDraw.length > 0
      for cardIndex in cardIndicesToDraw
        drawCardAction =  @getGameSession().getPlayerById(@getOwner().getPlayerId()).getDeck().actionDrawCard(cardIndex)
        @getGameSession().executeAction(drawCardAction)

module.exports = SpellDrawArtifact
