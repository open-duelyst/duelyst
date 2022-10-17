ModifierOnDying = require './modifierOnDying'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
UtilsPosition = require 'app/common/utils/utils_position'
_ = require 'underscore'

class ModifierOnDyingResummonAnywhere extends ModifierOnDying

  type:"ModifierOnDyingResummonAnywhere"
  @type:"ModifierOnDyingResummonAnywhere"

  onDying: () ->

    if @getGameSession().getIsRunningAsAuthoritative()
      wholeBoardPattern = CONFIG.ALL_BOARD_POSITIONS
      cardData = @getCard().createNewCardData()
      thisEntityPosition = @getCard().getPosition()
      validPositions = _.reject(wholeBoardPattern, (position) -> UtilsPosition.getPositionsAreEqual(position, thisEntityPosition))
      spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, validPositions, @getCard(), @getCard(), 1)

      for position in spawnLocations
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, cardData)
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierOnDyingResummonAnywhere
