CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
Cards = require 'app/sdk/cards/cardsLookup'
Spell = require './spell'

class SpellWhisperOfTheSands extends Spell

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    super(board, x, y, sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      ownerId = @getOwnerId()

      # find cached copy of card to spawn
      cardToSpawn = @getGameSession().getCardCaches().getCardById(Cards.Faction3.Dervish)
      cardDataToSpawn = cardToSpawn.createNewCardData()

      # gather all of player's obelysks
      obelysks = []
      obelyskPositions = []
      for unit in @getGameSession().getBoard().getUnits()
        if unit.getOwnerId() is ownerId and @isObelysk(unit)
          obelysks.push(unit)
          obelyskPositions.push(unit.getPosition())

      # coordinate spawning near all obelysks
      # this will generate spawn positions without conflicts whenever possible
      spawnPositionsWithSource = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsFromPatterns(@getGameSession(), obelyskPositions, CONFIG.PATTERN_3x3, cardToSpawn, obelysks)

      for spawnData in spawnPositionsWithSource
        spawnPositions = spawnData.spawnPositions
        if spawnPositions.length > 0
          spawnPosition = spawnPositions[0]
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataToSpawn)
          spawnAction.setSource(@)
          @getGameSession().executeAction(spawnAction)

  isObelysk: (unit) ->
    unitId = unit.getBaseCardId()
    return unitId is Cards.Faction3.BrazierRedSand or
        unitId is Cards.Faction3.BrazierGoldenFlame or
        unitId is Cards.Faction3.BrazierDuskWind or
        unitId is Cards.Faction3.SoulburnObelysk or
        unitId is Cards.Faction3.TrygonObelysk or
        unitId is Cards.Faction3.LavastormObelysk or
        unitId is Cards.Faction3.DuplicatorObelysk or
        unitId is Cards.Faction3.SimulacraObelysk

module.exports = SpellWhisperOfTheSands
