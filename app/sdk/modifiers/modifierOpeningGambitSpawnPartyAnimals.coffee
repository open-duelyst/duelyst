CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit = require './modifierOpeningGambit'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOpeningGambitSpawnPartyAnimals extends ModifierOpeningGambit

  type:"ModifierOpeningGambitSpawnPartyAnimals"
  @type:"ModifierOpeningGambitSpawnPartyAnimals"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  onOpeningGambit: () ->
    super()

    possibleAnimals = [
      {id: Cards.Neutral.PartyAnimal1},
      {id: Cards.Neutral.PartyAnimal2},
      {id: Cards.Neutral.PartyAnimal3},
      {id: Cards.Neutral.PartyAnimal4}
    ]

    if @getGameSession().getIsRunningAsAuthoritative()

      animalToSpawn = possibleAnimals.splice(@getGameSession().getRandomIntegerForExecution(possibleAnimals.length), 1)[0]
      animalCard = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(animalToSpawn)
      ownerId = @getOwnerId()
      validSpawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForPlayerId(ownerId).getPosition(), CONFIG.PATTERN_3x3, animalCard, @getCard(), 8)
      @summonAnimals(animalToSpawn, ownerId, validSpawnLocations)

      enemyAnimalToSpawn = possibleAnimals.splice(@getGameSession().getRandomIntegerForExecution(possibleAnimals.length), 1)[0]
      enemyAnimalCard = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(enemyAnimalToSpawn)
      opponentId = @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getOwnerId()
      enemyValidSpawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), @getGameSession().getGeneralForOpponentOfPlayerId(@getCard().getOwnerId()).getPosition(), CONFIG.PATTERN_3x3, enemyAnimalCard, @getCard(), 8)
      @summonAnimals(enemyAnimalToSpawn, opponentId, enemyValidSpawnLocations)

  summonAnimals: (animal, playerId, validSpawnLocations) ->

    spawnLocations = []

    for i in [0...3]
      if validSpawnLocations.length > 0
        spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

    for position in spawnLocations
      playCardAction = new PlayCardSilentlyAction(@getGameSession(), playerId, position.x, position.y, animal)
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitSpawnPartyAnimals