CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierDyingWish = require './modifierDyingWish'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
UtilsPosition = require 'app/common/utils/utils_position'
_ = require 'underscore'

class ModifierDyingWishReSpawnEntityAnywhere extends ModifierDyingWish

  type:"ModifierDyingWishReSpawnEntityAnywhere"
  @type:"ModifierDyingWishReSpawnEntityAnywhere"

  fxResource: ["FX.Modifiers.ModifierDyingWish", "FX.Modifiers.ModifierGenericSpawn"]

  spawnCount: 1
  spawnSilently: true

  @createContextObject: (spawnCount=1, spawnSilently=true, options) ->
    contextObject = super(options)
    contextObject.spawnCount = spawnCount
    contextObject.spawnSilently = spawnSilently
    return contextObject

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      wholeBoardPattern = CONFIG.ALL_BOARD_POSITIONS
      cardData = @getCard().createNewCardData()
      thisEntityPosition = @getCard().getPosition()
      validPositions = _.reject(wholeBoardPattern, (position) -> UtilsPosition.getPositionsAreEqual(position, thisEntityPosition))
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, validPositions, @getCard(), @getCard(), @spawnCount)

      for position in spawnLocations
        if !@spawnSilently
          playCardAction = new PlayCardAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardData)
        else
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardData)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierDyingWishReSpawnEntityAnywhere
