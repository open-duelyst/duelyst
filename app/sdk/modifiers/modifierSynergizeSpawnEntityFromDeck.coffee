CONFIG = require 'app/common/config'
Modifier = require './modifier'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'
PlaySignatureCardAction = require 'app/sdk/actions/playSignatureCardAction'

class ModifierSynergizeSpawnEntityFromDeck extends Modifier

  type:"ModifierSynergizeSpawnEntityFromDeck"
  @type:"ModifierSynergizeSpawnEntityFromDeck"

  activeInHand: false
  activeInDeck: true
  activeInSignatureCards: false
  activeOnBoard: false

  maxStacks: 1
  cardDataOrIndexToSpawn: null
  spawnLocation: null

  @createContextObject: (cardDataOrIndexToSpawn, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    return contextObject

  onAfterCleanupAction: (e) ->
    super(e)

    action = e.action

    # watch for a spell being cast from Signature Card slot by player who owns this entity
    if (action instanceof PlaySignatureCardAction) and action.getOwnerId() is @getCard().getOwnerId() and action.getCard()?.type is CardType.Spell
      @onSynergize(action)

  onSynergize: (action) ->

    console.log("hsdflkjsdflksdjfsdlkfj MAKING IT HERE")

    deck = @getOwner().getDeck()
    drawPile = deck.getDrawPile()
    indexesOfMinions = []
    for cardIndex, i in drawPile
      card = @getGameSession().getCardByIndex(cardIndex)
      if card? and card.getType() == CardType.Unit and card.getBaseCardId() == @cardDataOrIndexToSpawn.id
        indexesOfMinions.push(i)

    console.log("indexesOfMinions = ", indexesOfMinions)

    if indexesOfMinions.length > 0
      indexOfCardInDeck = indexesOfMinions[@getGameSession().getRandomIntegerForExecution(indexesOfMinions.length)]
      cardIndexToDraw = drawPile[indexOfCardInDeck]
      card = @getGameSession().getCardByIndex(cardIndexToDraw)
      general = @getCard().getGameSession().getGeneralForPlayerId(@getCard().getOwnerId())

      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), general.getPosition(), CONFIG.PATTERN_3x3, card)
      if validSpawnLocations?.length > 0
        spawnLocation = validSpawnLocations[@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length)]

        if spawnLocation?
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnLocation.x, spawnLocation.y, card)
          playCardAction.setSource(@getCard())
          @getGameSession().executeAction(playCardAction)

module.exports = ModifierSynergizeSpawnEntityFromDeck
