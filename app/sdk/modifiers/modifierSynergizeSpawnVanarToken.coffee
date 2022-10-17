CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierSynergize = require './modifierSynergize'
CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'

class ModifierSynergizeSpawnVanarToken extends ModifierSynergize

  type:"ModifierSynergizeSpawnVanarToken"
  @type:"ModifierSynergizeSpawnVanarToken"

  @description:"Summon a random Wall nearby"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierSpellWatch", "FX.Modifiers.ModifierGenericSpawn"]

  onSynergize: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      possibleTokens = [
        {id: Cards.Faction6.BlazingSpines},
        {id: Cards.Faction6.BonechillBarrier},
        {id: Cards.Faction6.GravityWell},
        {id: Cards.Faction6.FrostBomb}
      ]
      card = @getGameSession().getExistingCardFromIndexOrCreateCardFromData(possibleTokens[@getGameSession().getRandomIntegerForExecution(possibleTokens.length)])
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, card, @getCard(), 1)

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, card.createNewCardData())
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierSynergizeSpawnVanarToken
