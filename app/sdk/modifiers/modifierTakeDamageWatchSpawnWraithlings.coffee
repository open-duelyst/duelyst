CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Races = require 'app/sdk/cards/racesLookup'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'

class ModifierTakeDamageWatchSpawnWraithlings extends ModifierTakeDamageWatch

  type:"ModifierTakeDamageWatchSpawnWraithlings"
  @type:"ModifierTakeDamageWatchSpawnWraithlings"

  @modifierName:"Take Damage Watch"
  @description:"When this takes damage, summon that many wraithlings"

  fxResource: ["FX.Modifiers.ModifierTakeDamageWatch", "FX.Modifiers.ModifierGenericSpawn"]

  onDamageTaken: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), @getCard().getPosition(), CONFIG.PATTERN_3x3, @getCard())
      cardDataOrIndexToSpawn = {id: Cards.Faction4.Wraithling}
      for i in [0...action.getTotalDamageAmount()]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        spawnAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)


module.exports = ModifierTakeDamageWatchSpawnWraithlings
