CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierOpeningGambit = require './modifierOpeningGambit'
Races = require 'app/sdk/cards/racesLookup'
_ = require 'underscore'

class ModifierOpeningGambitDeathKnell extends ModifierOpeningGambit

  type:"ModifierOpeningGambitDeathKnell"
  @type:"ModifierOpeningGambitDeathKnell"

  @description: "Resummon all friendly Arcanysts destroyed this game nearby"

  fxResource: ["FX.Modifiers.ModifierOpeningGambitDeathKnell"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.deadUnits = null

    return p

  getDeadUnits: () ->
    if !@_private.deadUnits?
      @_private.deadUnits = @getGameSession().getDeadUnits(@getOwnerId())
    return @_private.deadUnits

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      deadArcanystIds = []
      for unit in @getDeadUnits()
        if unit.getBelongsToTribe(Races.Arcanyst)
          deadArcanystIds.push(unit.getId())

      if deadArcanystIds.length > 0
        card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData({id: @getCard().getId()})
        spawnLocations = []
        _.shuffle(deadArcanystIds)
        validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, @getCard())
        for i in [0...deadArcanystIds.length]
          if validSpawnLocations.length > 0
            spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])
          else
            break

        for position, i in spawnLocations
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, {id: deadArcanystIds[i]})
          playCardAction.setSource(@getCard())
          @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitDeathKnell
