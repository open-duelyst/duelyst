CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDealDamageWatch = require './modifierDealDamageWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierDealDamageWatchSpawnEntity extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchSpawnEntity"
  @type:"ModifierDealDamageWatchSpawnEntity"

  @modifierName:"Deal Damage Watch"
  @description:"Whenever this minion damages an enemy, summon %X"

  fxResource: ["FX.Modifiers.ModifierDealDamageWatch", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription="", spawnCount=1, spawnPattern=CONFIG.PATTERN_3x3, spawnSilently=true, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnPattern = spawnPattern
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = ""
      if modifierContextObject.spawnCount == 1
        replaceText = "a "+modifierContextObject.spawnDescription+" into a nearby space"
      else if modifierContextObject.spawnCount == 8
        replaceText = ""+modifierContextObject.spawnDescription+"s in all nearby spaces"
      else
        replaceText = ""+modifierContextObject.spawnDescription+"s into "+modifierContextObject.spawnCount+" nearby spaces"
      return @description.replace /%X/, replaceText
    else
      return @description

  onDealDamage: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      ownerId = @getSpawnOwnerId(action)
      spawnPositions = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier(@, ModifierDealDamageWatchSpawnEntity)
      for spawnPosition in spawnPositions
        cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn()
        if @spawnSilently
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        else
          spawnAction = new PlayCardAction(@getGameSession(), ownerId, spawnPosition.x, spawnPosition.y, cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierDealDamageWatchSpawnEntity
