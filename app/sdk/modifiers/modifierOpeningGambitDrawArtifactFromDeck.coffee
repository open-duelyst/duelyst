CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit = require './modifierOpeningGambit'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitDrawArtifactFromDeck extends ModifierOpeningGambit

  type:"ModifierOpeningGambitDrawArtifactFromDeck"
  @type:"ModifierOpeningGambitDrawArtifactFromDeck"

  @description: "Draw %X from your deck"

  @createContextObject: (numArtifacts=1) ->
    contextObject = super()
    contextObject.numArtifacts = numArtifacts
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.numArtifacts <= 1
        return @description.replace /%X/, "a random artifact"
      else
        return @description.replace /%X/, "up to "+modifierContextObject.numArtifacts+" Artifacts"
    else
      return @description

  onOpeningGambit: () ->
    super()

    gameSession = @getGameSession()
    if gameSession.getIsRunningAsAuthoritative()
      # calculate artifacts to draw on the server, since only the server knows contents of both decks
      if !cardIndicesToDraw
        cardIndicesToDraw = []

        # find indices of artifacts
        drawPile = @getCard().getOwner().getDeck().getDrawPile()
        indexOfArtifacts = []
        for cardIndex, i in drawPile
          if gameSession.getCardByIndex(cardIndex)?.getType() == CardType.Artifact
            indexOfArtifacts.push(i)

        # find X random artifacts
        for [0...@numArtifacts]
          if indexOfArtifacts.length > 0
            artifactIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexOfArtifacts.length)
            indexOfCardInDeck = indexOfArtifacts[artifactIndexToRemove]
            indexOfArtifacts.splice(artifactIndexToRemove,1)
            cardIndicesToDraw.push(drawPile[indexOfCardInDeck])

      # put the random artifacts from deck into hand
      if cardIndicesToDraw and cardIndicesToDraw.length > 0
        for cardIndex in cardIndicesToDraw
          drawCardAction =  @getGameSession().getPlayerById(@getCard().getOwnerId()).getDeck().actionDrawCard(cardIndex)
          @getGameSession().executeAction(drawCardAction)

module.exports = ModifierOpeningGambitDrawArtifactFromDeck
