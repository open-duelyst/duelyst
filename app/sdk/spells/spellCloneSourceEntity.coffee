CONFIG = require 'app/common/config'
SpellApplyEntityToBoard =   require('./spellApplyEntityToBoard')
CloneEntityAction = require 'app/sdk/actions/cloneEntityAction'

###
  Spawns a new entity as clone of another entity.
###
class SpellCloneSourceEntity extends SpellApplyEntityToBoard

  canBeAppliedAnywhere: false

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.followupSourcePattern = CONFIG.PATTERN_3x3 # only allow spawns within a 3x3 area of source position

    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    spawnAction = @getSpawnAction(x, y)
    if spawnAction?
      @getGameSession().executeAction(spawnAction)

  getSpawnAction: (x, y) ->
    targetPosition = {x: x, y: y}
    cloningEntity = @getEntityToSpawn()
    if cloningEntity? and !@getGameSession().getBoard().getObstructionAtPositionForEntity(targetPosition, cloningEntity)
      spawnEntityAction = new CloneEntityAction(@getGameSession(), @getOwnerId(), x, y)
      spawnEntityAction.setOwnerId(@getOwnerId())
      spawnEntityAction.setSource(cloningEntity)
      return spawnEntityAction

  getEntityToSpawn: () ->
    sourcePosition = @getFollowupSourcePosition()
    if sourcePosition?
      return @getGameSession().getBoard().getCardAtPosition(sourcePosition, @targetType)

module.exports = SpellCloneSourceEntity
