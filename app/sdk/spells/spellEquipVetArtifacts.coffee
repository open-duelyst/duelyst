Spell = require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
GameFormat = require 'app/sdk/gameFormat'

class SpellEquipVetArtifacts extends Spell

  _filterApplyPositions: (validPositions) ->
    finalPositions = []
    ownGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    finalPositions.push(ownGeneral.getPosition())

    return finalPositions

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    gameSession = @getGameSession()

    vetArtifacts = []
    if @getGameSession().getGameFormat() is GameFormat.Standard
      vetArtifacts = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(Factions.Faction3).getType(CardType.Artifact).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
    else
      vetArtifacts = @getGameSession().getCardCaches().getFaction(Factions.Faction3).getType(CardType.Artifact).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()

    if vetArtifacts.length > 0
      artifactData = []
      for artifact in vetArtifacts
        artifactData.push(artifact)

      cardDataToPlay = []
      artifact1 = artifactData.splice(@getGameSession().getRandomIntegerForExecution(artifactData.length),1)[0] # random artifact
      artifact2 = artifactData.splice(@getGameSession().getRandomIntegerForExecution(artifactData.length),1)[0] # random artifact
      cardDataToPlay.push(artifact1)
      cardDataToPlay.push(artifact2)

      # equip the random artifacts
      if cardDataToPlay? and cardDataToPlay.length > 0
        for cardData in cardDataToPlay
          playCardAction = new PlayCardSilentlyAction(gameSession, @getOwnerId(), x, y, cardData.createNewCardData())
          playCardAction.setSource(@)
          gameSession.executeAction(playCardAction)

module.exports = SpellEquipVetArtifacts
