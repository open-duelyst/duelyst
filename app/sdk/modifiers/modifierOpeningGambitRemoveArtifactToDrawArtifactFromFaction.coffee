ModifierOpeningGambit = require './modifierOpeningGambit'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
RemoveRandomArtifactAction = require 'app/sdk/actions/removeRandomArtifactAction'
CardType = require 'app/sdk/cards/cardType'
GameFormat = require 'app/sdk/gameFormat'

class ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction extends ModifierOpeningGambit

  type: "ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction"
  @type: "ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction"

  @modifierName: "Opening Gambit"
  @description: "Destroy a random enemy artifact to draw a random in-faction artifact"

  onOpeningGambit: () ->

    if @getGameSession().getIsRunningAsAuthoritative()

      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      modifiersByArtifact = enemyGeneral.getArtifactModifiersGroupedByArtifactCard()

      # if enemy General has at least one artifact on
      if modifiersByArtifact.length > 0
        #remove 1 artifact at random
        removeArtifactAction = new RemoveRandomArtifactAction(@getGameSession())
        removeArtifactAction.setTarget(enemyGeneral)
        @getGameSession().executeAction(removeArtifactAction)

        #add random in-faction artifact to action bar
        factionId = @getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()).getFactionId()
        factionArtifacts = []
        if @getGameSession().getGameFormat() is GameFormat.Standard
          factionArtifacts = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(factionId).getType(CardType.Artifact).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
        else
          factionArtifacts = @getGameSession().getCardCaches().getFaction(factionId).getType(CardType.Artifact).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()

        if factionArtifacts.length > 0
          cardToPutInHand = factionArtifacts[@getGameSession().getRandomIntegerForExecution(factionArtifacts.length)]
          a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardToPutInHand.createNewCardData())
          @getGameSession().executeAction(a)

module.exports = ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction
