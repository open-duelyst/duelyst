ModifierEnemyTeamMoveWatch = require './modifierEnemyTeamMoveWatch'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
CardType = require 'app/sdk/cards/cardType'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
PlayCardAction = require 'app/sdk/actions/playCardAction'

class ModifierEnemyTeamMoveWatchSummonEntityBehind extends ModifierEnemyTeamMoveWatch

  type:"ModifierEnemyTeamMoveWatchSummonEntityBehind"
  @type:"ModifierEnemyTeamMoveWatchSummonEntityBehind"

  @modifierName:"Enemy Team Move Watch Buff Target"
  @description: "Whenever an enemy minion is moved for any reason, summon %X"

  fxResource: ["FX.Modifiers.ModifierMyTeamMoveWatch", "FX.Modifiers.ModifierGenericBuff"]

  @createContextObject: (cardDataOrIndexToSpawn, spawnDescription="", spawnCount=1, spawnSilently=false, options) ->
    contextObject = super(options)
    contextObject.cardDataOrIndexToSpawn = cardDataOrIndexToSpawn
    contextObject.spawnDescription = spawnDescription
    contextObject.spawnCount = spawnCount
    contextObject.spawnSilently = spawnSilently
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      replaceText = "a "+modifierContextObject.spawnDescription+" behind them"
      return @description.replace /%X/, replaceText
    else
      return @description

  onEnemyTeamMoveWatch: (action, movingTarget) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      behindPosition = @getSpaceBehindMovingUnit(movingTarget)
      board = @getGameSession().getBoard()
      unitInBehindPosition = board.getUnitAtPosition(behindPosition)
      # check to see if there's anything behind the unit (where we want to summon).  if there's not, summon the unit there
      if(!unitInBehindPosition)
        ownerId = @getSpawnOwnerId(action)
        cardDataOrIndexToSpawn = @getCardDataOrIndexToSpawn()
        if @spawnSilently
          spawnAction = new PlayCardSilentlyAction(@getGameSession(), ownerId, behindPosition.x, behindPosition.y, cardDataOrIndexToSpawn)
        else
          spawnAction = new PlayCardAction(@getGameSession(), ownerId, behindPosition.x, behindPosition.y, cardDataOrIndexToSpawn)
        spawnAction.setSource(@getCard())
        @getGameSession().executeAction(spawnAction)

  getCardDataOrIndexToSpawn: () ->
    return @cardDataOrIndexToSpawn

  getSpaceBehindMovingUnit: (behindUnit) ->
    if behindUnit?
      position = behindUnit.getPosition()
      position.x += if behindUnit.isOwnedByPlayer1() then -1 else 1

      return position

  getSpawnOwnerId: (action) ->
    return @getCard().getOwnerId()

module.exports = ModifierEnemyTeamMoveWatchSummonEntityBehind
