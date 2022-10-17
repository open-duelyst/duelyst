CONFIG = require 'app/common/config'
UtilsPosition = require 'app/common/utils/utils_position'
SpellRemoveAndReplaceEntity =   require('./spellRemoveAndReplaceEntity')
CloneEntityAsTransformAction = require 'app/sdk/actions/cloneEntityAsTransformAction'
_ = require 'underscore'

###
  Transforms an entity already on the board into a clone of another entity.
###
class SpellCloneTargetEntity extends SpellRemoveAndReplaceEntity

  getRemovePosition: (applyEffectPosition) ->
    return @getFollowupSourcePosition()

  getSpawnAction: (x, y) ->
    # clone should be taken from target location
    cloningEntity = @getEntityToSpawn(x, y)
    if cloningEntity?
      spawnEntityAction = new CloneEntityAsTransformAction(@getGameSession(), @getOwnerId(), x, y)
      spawnEntityAction.targetPosition = @getFollowupSourcePosition()
      spawnEntityAction.setOwnerId(@getOwnerId())
      spawnEntityAction.setSource(cloningEntity)
    return spawnEntityAction

  getEntityToSpawn: (x, y) ->
    return @getGameSession().getBoard().getCardAtPosition({x: x, y: y}, @targetType)

  getValidTargetPositions: () ->
    if !@_private.cachedValidTargetPositions?
      # use original spell targeting
      validPositions = super()
      # filter source position out as we shouldn't be copying ourselves
      sourcePosition = @getFollowupSourcePosition()
      if sourcePosition
        @_private.cachedValidTargetPositions = _.reject(validPositions, (position) -> UtilsPosition.getPositionsAreEqual(position, sourcePosition))
    return @_private.cachedValidTargetPositions

module.exports = SpellCloneTargetEntity
