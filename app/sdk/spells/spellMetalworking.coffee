Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellMetalworking extends Spell

  numArtifacts: 1

  _findApplyEffectPositions: (position, sourceAction) ->
    return [@getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()]

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    potentialArtifacts = []
    artifactsPlayed = @getGameSession().getArtifactsPlayed(@getOwnerId())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    # check all played artifact cards
    for artifact in artifactsPlayed
      modifiersGroupedByArtifactCard = myGeneral.getArtifactModifiersGroupedByArtifactCard()
      # if no artifact modifiers are stil on the general, all played artifacts are valid to retrieve
      if modifiersGroupedByArtifactCard.length == 0
        potentialArtifacts.push(artifact)
      else
        skipThisArtifact = false
        # if general still has any artifacts, do NOT retrieve those exact artifacts
        for artifactMods in modifiersGroupedByArtifactCard
          # skip any played artifacts that are still active on the General
          if artifactMods[0].getSourceCard().getIndex() == artifact.getIndex()
            skipThisArtifact = true
            break
        if !skipThisArtifact
          potentialArtifacts.push(artifact)
    if potentialArtifacts.length > 0
      artifactToPlay = potentialArtifacts[@getGameSession().getRandomIntegerForExecution(potentialArtifacts.length)]

      if artifactToPlay?
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), x, y, artifactToPlay.createNewCardData())
        playCardAction.setSource(@)
        @getGameSession().executeAction(playCardAction)

module.exports = SpellMetalworking
