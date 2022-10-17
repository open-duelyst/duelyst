CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit = require './modifierOpeningGambit'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup.coffee'

class ModifierOpeningGambitSpawnVanarTokensAroundGeneral extends ModifierOpeningGambit

  type:"ModifierOpeningGambitSpawnVanarTokensAroundGeneral"
  @type:"ModifierOpeningGambitSpawnVanarTokensAroundGeneral"

  @description:"Surround the enemy General with random Walls"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericSpawn"]

  onOpeningGambit: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getPosition(), CONFIG.PATTERN_3x3, @getCard(), @getCard(), 8)

      for position in spawnLocations
        possibleTokens = [
          {id: Cards.Faction6.BlazingSpines},
          {id: Cards.Faction6.BonechillBarrier},
          {id: Cards.Faction6.GravityWell},
          {id: Cards.Faction6.FrostBomb}
        ]
        card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(possibleTokens[@getGameSession().getRandomIntegerForExecution(possibleTokens.length)])
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, card.createNewCardData())
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitSpawnVanarTokensAroundGeneral
