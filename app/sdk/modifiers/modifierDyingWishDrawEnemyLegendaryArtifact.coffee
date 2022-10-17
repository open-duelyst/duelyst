ModifierDyingWish = require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'
GameFormat = require 'app/sdk/gameFormat'

class ModifierDyingWishDrawEnemyLegendaryArtifact extends ModifierDyingWish

  type:"ModifierDyingWishDrawEnemyLegendaryArtifact"
  @type:"ModifierDyingWishDrawEnemyLegendaryArtifact"

  onDyingWish: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()

      enemyGeneral = @getCard().getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId())
      factionId = enemyGeneral.getFactionId()

      factionArtifacts = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        factionArtifacts = @getGameSession().getCardCaches().getIsLegacy(false).getFaction(factionId).getType(CardType.Artifact).getRarity(Rarity.Legendary).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        factionArtifacts = @getGameSession().getCardCaches().getFaction(factionId).getType(CardType.Artifact).getRarity(Rarity.Legendary).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      if factionArtifacts.length > 0
        cardToPutInHand = factionArtifacts[@getGameSession().getRandomIntegerForExecution(factionArtifacts.length)]
        a = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), cardToPutInHand.createNewCardData())
        @getGameSession().executeAction(a)

module.exports = ModifierDyingWishDrawEnemyLegendaryArtifact
