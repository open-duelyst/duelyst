CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOnOpponentDeathWatch = require './modifierOnOpponentDeathWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'

class ModifierOnOpponentDeathWatchSpawnEntityOnSpace extends ModifierOnOpponentDeathWatch

  type:"ModifierOnOpponentDeathWatchSpawnEntityOnSpace"
  @type:"ModifierOnOpponentDeathWatchSpawnEntityOnSpace"

  @modifierName:"Deathwatch"
  @description:"Whenever an enemy minion dies, summon a %X"

  cardDataOrIndexToSpawn: null
  spawnCount: 1
  spawnSilently: true # most reactive spawns should be silent, i.e. no followups and no opening gambits
  spawnPattern: CONFIG.PATTERN_1x1
  prisonerList: [{id: Cards.Neutral.Prisoner1}, {id: Cards.Neutral.Prisoner2}, {id: Cards.Neutral.Prisoner3}, {id: Cards.Neutral.Prisoner4}, {id: Cards.Neutral.Prisoner5}, {id: Cards.Neutral.Prisoner6}]

  fxResource: ["FX.Modifiers.ModifierDeathWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription="prisoner",spawnCount=1, spawnPattern=CONFIG.PATTERN_1x1, spawnSilently=true,options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.spawnDescription
    else
      return @description

  onDeathWatch: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      #if there's no defined card to summon, instead spawn a random prisoner
      if !@cardDataOrIndexToSpawn? or @cardDataOrIndexToSpawn in @prisonerList
        @cardDataOrIndexToSpawn = @prisonerList[@getGameSession().getRandomIntegerForExecution(@prisonerList.length)]

      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), action.getTargetPosition(), @spawnPattern, card, @getCard(), 1)
      for position in spawnLocations
        if !@spawnSilently
          playCardAction = new PlayCardAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
        else
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierOnOpponentDeathWatchSpawnEntityOnSpace
