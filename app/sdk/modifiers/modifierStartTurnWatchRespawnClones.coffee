CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierStartTurnWatch = require './modifierStartTurnWatch'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierStartTurnWatchRespawnClones extends ModifierStartTurnWatch

  type:"ModifierStartTurnWatchRespawnClones"
  @type:"ModifierStartTurnWatchRespawnClones"

  @modifierName:"Turn Watch"
  @description:"At the start of your turn, resummon fallen Legion in random corners."

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierStartTurnWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (spawnSilently=false, options) ->
    contextObject = super(options)
    contextObject.spawnSilently = spawnSilently
    return contextObject

  onTurnWatch: (action) ->
    super(action)

    legion = [
      {id: Cards.Boss.Boss33_1},
      {id: Cards.Boss.Boss33_2},
      {id: Cards.Boss.Boss33_3},
      {id: Cards.Boss.Boss33_4}
    ]

    if @getCard().getIsGeneral() and @getGameSession().getIsRunningAsAuthoritative() #to run more efficiently, only let the current general spawn the clones
      cornerSpawnPattern = [{x: 0, y: 0}, {x: 0, y: CONFIG.BOARDROW-1}, {x: CONFIG.BOARDCOL-1, y: 0}, {x: CONFIG.BOARDCOL-1, y: CONFIG.BOARDROW-1}]
      while legion.length > 0
        randomIndex = @getGameSession().getRandomIntegerForExecution(legion.length)
        skipIndex = false
        skipSpawn = false
        for existingUnit in @getGameSession().getBoard().getCards(CardType.Unit)
          if legion.length > 0
            if existingUnit.getBaseCardId() is legion[randomIndex].id # if we already have that particular clone on board...
              legion.splice(randomIndex, 1) #  ... then we can remove it from our array
              skipIndex = true
              break
        if skipIndex is false
          if legion[randomIndex].id is Cards.Boss.Boss33_1 # if it's the clone of the original general
            for existingUnits in @getGameSession().getBoard().getCards(CardType.Unit) # then check to see if original general is still on board
              if legion.length > 0 and existingUnits.getBaseCardId() is Cards.Boss.Boss33 # if it is still on board...
                legion.splice(randomIndex, 1) # then we don't want to add it on the board while the original general still lives
                skipSpawn = true  # so we skip the spawning phase
                break
          if skipSpawn is false
            @cardDataOrIndexToSpawn = legion[randomIndex] # if clone isn't on board, we have something we can spawn
            card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
            spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, cornerSpawnPattern, card, @getCard(), 1)

            if spawnLocations.length is 0 # if there's no available respawn positions break this loop
              break
            randomSpawnPositionIndex = @getGameSession().getRandomIntegerForExecution(spawnLocations.length)
            randomSpawnPosition = spawnLocations[randomSpawnPositionIndex]
            playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), randomSpawnPosition.x, randomSpawnPosition.y, @cardDataOrIndexToSpawn)
            playCardAction.setSource(@getCard())
            @getGameSession().executeAction(playCardAction)
            legion.splice(randomIndex, 1) # now that the card has been played, remove it from the array

module.exports = ModifierStartTurnWatchRespawnClones
