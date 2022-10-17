CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Races = require 'app/sdk/cards/racesLookup'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
GameFormat = require 'app/sdk/gameFormat'

class ModifierTakeDamageWatchJuggernaut extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchJuggernaut"
  @type:"ModifierTakeDamageWatchJuggernaut"

  @modifierName:"Take Damage Watch"
  @description:"When this takes damage, summon that many random Golem eggs"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericSpawn"]

  onDamageTaken: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, @getCard())
      for i in [0...action.getTotalDamageAmount()]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      golemCards = []
      if @getGameSession().getGameFormat() is GameFormat.Standard
        golemCards = @getGameSession().getCardCaches().getIsLegacy(false).getRace(Races.Golem).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()
      else
        golemCards = @getGameSession().getCardCaches().getRace(Races.Golem).getIsHiddenInCollection(false).getIsToken(false).getIsPrismatic(false).getIsSkinned(false).getCards()

      if golemCards.length > 0
        for position in spawnLocations
          cardDataOrIndexToSpawn = {id: Cards.Faction5.Egg}
          # add modifiers to card data
          card = golemCards[@getGameSession().getRandomIntegerForExecution(golemCards.length)]
          cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects ?= []
          cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects.push(ModifierEgg.createContextObject(card.createNewCardData(), card.getName()))
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardDataOrIndexToSpawn)
          spawnAction.setSource(@getCard())
          @getGameSession().executeAction(spawnAction)


module.exports = ModifierTakeDamageWatchJuggernaut
