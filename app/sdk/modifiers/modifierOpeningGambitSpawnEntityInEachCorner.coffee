CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit =   require './modifierOpeningGambit'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
CardType = require 'app/sdk/cards/cardType'

class ModifierOpeningGambitSpawnEntityInEachCorner extends ModifierOpeningGambit

  type:"ModifierOpeningGambitSpawnEntityInEachCorner"
  @type:"ModifierOpeningGambitSpawnEntityInEachCorner"

  @description: "Summon %X"

  cardDataOrIndexToSpawn: null

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription = "", options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.spawnDescription+" in each corner"
    else
      return @description

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
      spawnLocations = []
      validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.PATTERN_CORNERS, card)
      for i in [0...4]
        if validSpawnLocations.length > 0
          spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitSpawnEntityInEachCorner
