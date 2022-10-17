Spell = require './spell'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellEquipBossArtifacts extends Spell

  _filterApplyPositions: (validPositions) ->
    finalPositions = []
    ownGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    finalPositions.push(ownGeneral.getPosition())

    return finalPositions

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    gameSession = @getGameSession()

    bossArtifacts = [
      {id: Cards.BossArtifact.FlyingBells},
      {id: Cards.BossArtifact.Coal},
      {id: Cards.BossArtifact.CostReducer},
      {id: Cards.BossArtifact.Snowball}
    ]
    artifactData = []
    for artifact in bossArtifacts
      artifactData.push(artifact)

    cardDataToPlay = []
    artifact1 = artifactData.splice(@getGameSession().getRandomIntegerForExecution(artifactData.length),1)[0] # random artifact
    cardDataToPlay.push(artifact1)

    # equip the random artifact
    if cardDataToPlay? and cardDataToPlay.length > 0
      for cardData in cardDataToPlay
        playCardAction = new PlayCardSilentlyAction(gameSession, @getOwnerId(), x, y, cardData)
        playCardAction.setSource(@)
        gameSession.executeAction(playCardAction)

module.exports = SpellEquipBossArtifacts
