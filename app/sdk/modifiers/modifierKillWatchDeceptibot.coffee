CONFIG = require 'app/common/config'
ModifierKillWatch = require './modifierKillWatch'
Races = require 'app/sdk/cards/racesLookup'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierKillWatchDeceptibot extends ModifierKillWatch

  type:"ModifierKillWatchDeceptibot"
  @type:"ModifierKillWatchDeceptibot"

  fxResource: ["FX.Modifiers.ModifierKillWatch"]

  onKillWatch: (action) ->

    if @getGameSession().getIsRunningAsAuthoritative()

      # find all mechs in the deck
      drawPile = @getOwner().getDeck().getDrawPile()
      indexesOfMechs = []
      for cardIndex, i in drawPile
        cardAtIndex = @getGameSession().getCardByIndex(cardIndex)
        if cardAtIndex?.getType() == CardType.Unit and cardAtIndex.getRaceId() == Races.Mech and cardAtIndex.getBaseCardId() != Cards.Neutral.Deceptibot
          indexesOfMechs.push(i)

      if indexesOfMechs.length > 0
        minionIndexToRemove = @getGameSession().getRandomIntegerForExecution(indexesOfMechs.length)
        indexOfCardInDeck = indexesOfMechs[minionIndexToRemove]
        cardIndexToDraw = drawPile[indexOfCardInDeck]

        card = @getGameSession().getCardByIndex(cardIndexToDraw)

        spawnLocation = null
        validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, card)
        if validSpawnLocations?.length > 0
          spawnLocation = validSpawnLocations[@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length)]

          if spawnLocation?
            playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), spawnLocation.x, spawnLocation.y, card)
            playCardAction.setSource(@getCard())
            @getGameSession().executeAction(playCardAction)

module.exports = ModifierKillWatchDeceptibot
