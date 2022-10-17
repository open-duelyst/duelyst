CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDyingWish =  require './modifierDyingWish'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierDyingWishSpawnEntityInCorner extends ModifierDyingWish

  type:"ModifierDyingWishSpawnEntityInCorner"
  @type:"ModifierDyingWishSpawnEntityInCorner"

  @description: "Summon %X"

  cardDataOrIndexToSpawn: null
  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription = "", spawnCount=1, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      if modifierContextObject.spawnCount == 4
        return @description.replace /%X/, modifierContextObject.spawnDescription+" in each unoccupied corner"
      else if modifierContextObject.spawnCount == 1
        if modifierContextObject.spawnDescription != "a copy of this minion"
          return @description.replace /%X/, modifierContextObject.spawnDescription+" in a random corner"
        else
          return "Re-summon this minion in a random corner"
      else
        return @description.replace /%X/, modifierContextObject.spawnDescription+" in "+modifierContextObject.spawnCount+" random corners"
    else
      return @description

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      cornerSpawnPattern = [{x: 0, y: 0}, {x: 0, y: CONFIG.BOARDROW-1}, {x: CONFIG.BOARDCOL-1, y: 0}, {x: CONFIG.BOARDCOL-1, y: CONFIG.BOARDROW-1}]
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, cornerSpawnPattern, card, @getCard(), @spawnCount)

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierDyingWishSpawnEntityInCorner
