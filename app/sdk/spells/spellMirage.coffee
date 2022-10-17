CONFIG = require 'app/common/config'
SpellApplyEntityToBoard =  require './spellApplyEntityToBoard'
CardType = require 'app/sdk/cards/cardType'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CloneEntityAction = require 'app/sdk/actions/cloneEntityAction'
ModifierMirage = require 'app/sdk/modifiers/modifierMirage'

class SpellMirage extends SpellApplyEntityToBoard

  targetType: CardType.Entity

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    card = @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, @targetType)
    targetSpawnPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:x, y:y}, CONFIG.PATTERN_3x3, card, @, 3)
    if targetSpawnPositions.length > 0
      for position in targetSpawnPositions
        spawnAction = @getSpawnAction(x, y, position)
        if spawnAction?
          @getGameSession().executeAction(spawnAction)
          @getGameSession().applyModifierContextObject(ModifierMirage.createContextObject(), spawnAction.getCard())

  getSpawnAction: (x, y, targetSpawnPosition) ->
    cloningEntity = @getGameSession().getBoard().getCardAtPosition({x:x, y:y}, @targetType)
    if cloningEntity? and !@getGameSession().getBoard().getObstructionAtPositionForEntity(targetSpawnPosition, cloningEntity)
      spawnEntityAction = new CloneEntityAction(@getGameSession(), @getOwnerId(), targetSpawnPosition.x, targetSpawnPosition.y)
      spawnEntityAction.setOwnerId(@getOwnerId())
      spawnEntityAction.setSource(cloningEntity)
      return spawnEntityAction

module.exports = SpellMirage
