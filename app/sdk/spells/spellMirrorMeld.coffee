CONFIG = require 'app/common/config'
SpellApplyEntityToBoard =  require './spellApplyEntityToBoard'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CloneEntityAction = require 'app/sdk/actions/cloneEntityAction'
_ = require('underscore')

class SpellMirrorMeld extends SpellApplyEntityToBoard

  targetType: CardType.Entity

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    card = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, @targetType)
    targetSpawnPosition = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:x, y:y}, CONFIG.PATTERN_3x3, card, @, 1)[0]
    if targetSpawnPosition?
      spawnAction = @getSpawnAction(x, y, targetSpawnPosition)
      if spawnAction?
        @getGameSession().executeAction(spawnAction)

  getSpawnAction: (x, y, targetSpawnPosition) ->
    cloningEntity = @getGameSession().getBoard().getCardAtPosition({x:x, y:y}, @targetType)
    if cloningEntity? and !@getGameSession().getBoard().getObstructionAtPositionForEntity(targetSpawnPosition, cloningEntity)
      spawnEntityAction = new CloneEntityAction(@getGameSession(), @getOwnerId(), targetSpawnPosition.x, targetSpawnPosition.y)
      spawnEntityAction.setOwnerId(@getOwnerId())
      spawnEntityAction.setSource(cloningEntity)
      return spawnEntityAction

  _postFilterPlayPositions: (validPositions) ->
    filteredPositions = []

    if validPositions.length > 0
      # spell only applies to minions with 2 or less cost
      for position in validPositions
        if @getGameSession().getBoard().getUnitAtPosition(position).getManaCost() <= 2
          filteredPositions.push(position)

    return filteredPositions

module.exports = SpellMirrorMeld
