Spell = require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class SpellDropLift extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralIndirect
  canTargetGeneral: true

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())

    if enemyGeneral and myGeneral
      modifiersByArtifact = enemyGeneral.getArtifactModifiersGroupedByArtifactCard()
      if modifiersByArtifact.length > 0
        # pick an artifact to remove (modifiers grouped by artifact card)
        modifiersToRemove = modifiersByArtifact[@getGameSession().getRandomIntegerForExecution(modifiersByArtifact.length)]
        artifactCard = modifiersToRemove[0].getSourceCard() # store original artifact card
        # remove modifiers from artifact on enemy
        for modifier in modifiersToRemove by -1
          @getGameSession().removeModifier(modifier)

        newArtifactCardData = artifactCard.createNewCardData()

        # copy over any custom artifact data
        if artifactCard.targetModifiersContextObjects?
          newArtifactCardData.targetModifiersContextObjects = artifactCard.targetModifiersContextObjects
        if artifactCard.modifiersContextObjects
          for contextObject in artifactCard.modifiersContextObjects
            if contextObject.isAdditionalInherent
              newArtifactCardData.additionalInherentModifiersContextObjects ?= []
              newArtifactCardData.additionalInherentModifiersContextObjects.push(contextObject)

        # apply artifact to my general
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getOwnerId(), myGeneral.getPosition().x, myGeneral.getPosition().y, newArtifactCardData)
        playCardAction.setSource(@)
        @getGameSession().executeAction(playCardAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # only affects generals
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if enemyGeneral? then applyEffectPositions.push(enemyGeneral.getPosition())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if myGeneral? then applyEffectPositions.push(myGeneral.getPosition())

    return applyEffectPositions

module.exports = SpellDropLift
