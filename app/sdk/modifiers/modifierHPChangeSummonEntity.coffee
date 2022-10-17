CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'
UtilsPosition = require 'app/common/utils/utils_position'
ModifierHPChange = require 'app/sdk/modifiers/modifierHPChange'
_ = require 'underscore'

class ModifierHPChangeSummonEntity extends ModifierHPChange

  type:"ModifierHPChangeSummonEntity"
  @type:"ModifierHPChangeSummonEntity"

  @modifierName:"Modifier HP Change Summon Entity"
  @description: "When this falls below %X health, summon %Y on a random space"

  fxResource: ["FX.Modifiers.ModifierBuffSelfOnReplace"]

  @createContextObject: (cardDataOrIndexToSpawn,healthThreshold,spawnDescription,spawnCount=1, spawnSilently=true,options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.healthThreshold = healthThreshold
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      descriptionText = @description.replace /%Y/, modifierContextObject.spawnDescription
      return descriptionText.replace /%X/, modifierContextObject.healthThreshold
    else
      return @description

  onHPChange: (action) ->
    super(action)

    hp = @getCard().getHP()

    if hp <= @healthThreshold
      if @getGameSession().getIsRunningAsAuthoritative()
        ownerId = @getSpawnOwnerId(action)
        wholeBoardPattern = CONFIG.ALL_BOARD_POSITIONS
        card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData(@cardDataOrIndexToSpawn)
        thisEntityPosition = @getCard().getPosition()
        validPositions = _.reject(wholeBoardPattern, (position) -> UtilsPosition.getPositionsAreEqual(position, thisEntityPosition))
        spawnLocations = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, validPositions, card, @getCard(), @spawnCount)

        for position in spawnLocations
          if !@spawnSilently
            playCardAction = new PlayCardAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
          else
            playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @cardDataOrIndexToSpawn)
          playCardAction.setSource(@getCard())
          @getGameSession().executeAction(playCardAction)
        # remove modifier so it doesn't trigger again
        @getGameSession().removeModifier(@)

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierHPChangeSummonEntity
