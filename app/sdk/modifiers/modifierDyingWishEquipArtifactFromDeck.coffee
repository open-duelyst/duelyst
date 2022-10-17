CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDyingWish = require './modifierDyingWish'
DieAction = require 'app/sdk/actions/dieAction'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDyingWishEquipArtifactFromDeck extends ModifierDyingWish

  type:"ModifierDyingWishEquipArtifactFromDeck"
  @type:"ModifierDyingWishEquipArtifactFromDeck"
  @description: "Equip %X from your deck"

  @createContextObject: (numArtifacts=1) ->
    contextObject = super()
    contextObject.numArtifacts = numArtifacts
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.numArtifacts <= 1
        return @description.replace /%X/, "a random artifact"
      else
        return @description.replace /%X/, ""+modifierContextObject.numArtifacts+" random artifacts"
    else
      return @description

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.canConvertCardToPrismatic = false # equiping an actual card, so don't convert to prismatic based on this card

    return p

  onDyingWish: (action) ->
    super(action)

    gameSession = @getGameSession()
    if gameSession.getIsRunningAsAuthoritative()
      cardIndicesToPlay = []

      # find indices of artifacts
      drawPile = @getCard().getOwner().getDeck().getDrawPile()
      indexOfArtifacts = []
      for cardIndex, i in drawPile
        if gameSession.getCardByIndex(cardIndex)?.getType() == CardType.Artifact
          indexOfArtifacts.push(i)

      # find all artifacts on the General
      general = gameSession.getGeneralForPlayerId(@getCard().getOwnerId())
      modifiersByArtifact = general.getArtifactModifiersGroupedByArtifactCard()

      # make sure we don't try to equip more than 3 artifacts
      numArtifactsToEquip = @numArtifacts
      if modifiersByArtifact.length + numArtifactsToEquip > CONFIG.MAX_ARTIFACTS
        numArtifactsToEquip = CONFIG.MAX_ARTIFACTS - modifiersByArtifact.length

      # find X random artifacts
      for [0...numArtifactsToEquip]
        if indexOfArtifacts.length > 0
          artifactIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexOfArtifacts.length)
          indexOfCardInDeck = indexOfArtifacts[artifactIndexToRemove]
          indexOfArtifacts.splice(artifactIndexToRemove,1)
          cardIndicesToPlay.push(drawPile[indexOfCardInDeck])

      # equip the random artifacts from deck
      if cardIndicesToPlay? and cardIndicesToPlay.length > 0
        for cardIndex in cardIndicesToPlay
          playCardAction = new PlayCardSilentlyAction(gameSession, @getCard().getOwnerId(), @getCard().getPosition().x, @getCard().getPosition().y, cardIndex)
          playCardAction.setSource(@getCard())
          gameSession.executeAction(playCardAction)

module.exports = ModifierDyingWishEquipArtifactFromDeck
