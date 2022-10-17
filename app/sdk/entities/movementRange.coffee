CONFIG = require 'app/common/config'
UtilsPosition = require 'app/common/utils/utils_position'
Range = require './range'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'

class MovementRange extends Range

  # movement has a different pattern step than the default
  # so movement range needs a separate cache for patterns
  @patternsByDistance: {}
  @patternMapsByDistance: {}

  _pathsToPositionsByIndex: null

  flushCachedState: () ->
    super()
    @_pathsToPositionsByIndex = null

  getValidPositions: (board, entity) ->
    if !@_validPositions?
      entityPosition = entity.getPosition()
      entityMovementPatternMap = entity.getMovementPatternMap()
      speed = entity.getSpeed()
      step = CONFIG.MOVE_PATTERN_STEP

      validPositions = @_validPositions = []

      rowCount = board.getRowCount()
      columnCount = board.getColumnCount()
      bufferSize = rowCount * columnCount * Uint8Array.BYTES_PER_ELEMENT
      buffer = new ArrayBuffer(bufferSize)
      bufferInterface = new Uint8Array(buffer)

      originNode = {x: 0, y: 0, speed: 0}
      nodesToProcess = [originNode]

      # breadth first traversal so we always find the shortest path
      # but never allow paths longer than entity's speed
      while nodesToProcess.length > 0
        node = nodesToProcess.shift()
        for offset in step
          # calculate distance and current speed required to get to this node
          distance = Math.sqrt(offset.x * offset.x + offset.y * offset.y)
          nextSpeed = node.speed + distance
          # skip this node if it is too far away
          if nextSpeed > speed
            continue

          nextNode = {x: node.x + offset.x, y: node.y + offset.y, speed: nextSpeed}
          movePosition = {x: entityPosition.x + nextNode.x, y: entityPosition.y + nextNode.y}
          index = UtilsPosition.getMapIndexFromPosition(columnCount, movePosition.x, movePosition.y)
          # skip this node if we already have a shorter path to this position
          # or if the node is off the board or not within pattern
          if bufferInterface[index] == 1 or !board.isOnBoard(movePosition) or !@getIsPositionInPatternMap(board, entityMovementPatternMap, nextNode)
            continue

          # mark position as tested
          bufferInterface[index] = 1

          obstructionAtPosition = board.getObstructionAtPositionForEntity(movePosition, entity)

          # valid node to path through if unoccupied, occupant is same team, or moving entity is flying
          if !obstructionAtPosition or entity.getIsSameTeamAs(obstructionAtPosition) or entity.hasActiveModifierClass(ModifierFlying)
            nextNode.parent = node
            nodesToProcess.push(nextNode)

          # valid node to move to only if nothing is there
          if !obstructionAtPosition
            path = [movePosition]
            parent = nextNode.parent
            while parent?
              path.unshift({x: entityPosition.x + parent.x, y: entityPosition.y + parent.y})
              parent = parent.parent
            validPositions.push(path)

    return @_validPositions

  getPathTo: (board, entity, position) ->
    if board.isOnBoard(position)
      # if we've already tested this position, return previous result
      index = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), position.x, position.y)
      if !@_pathsToPositionsByIndex? then @_pathsToPositionsByIndex = {}
      path = @_pathsToPositionsByIndex[index]
      if path?
        return path
      else
        moves = @getValidPositions(board,entity)
        for path in moves
          realEnd = path[path.length - 1]
          if realEnd.x == position.x and realEnd.y == position.y
            # valid path found
            return @_pathsToPositionsByIndex[index] = path

        # no valid path found
        @_pathsToPositionsByIndex[index] = []
    return []

  getValidPosition: (board, entity, position) ->
    if @getPathTo(board, entity, position).length > 0
      return position
    return null

  class _MoveNode
    constructor: (@_position, parent) ->
      @pathTo = if parent? then parent.pathTo[..] else []
      @pathTo.push(@_position)

  getPatternByDistance: (board, distance) ->
    pattern = MovementRange.patternsByDistance[distance]
    if !pattern?
      Range._generateAndCachePatternAndMap(board, distance, CONFIG.MOVE_PATTERN_STEP, MovementRange.patternsByDistance, MovementRange.patternMapsByDistance)
      pattern = MovementRange.patternsByDistance[distance]
    return pattern

  getPatternMapByDistance: (board, distance) ->
    patternMap = MovementRange.patternMapsByDistance[distance]
    if !patternMap?
      Range._generateAndCachePatternAndMap(board, distance, CONFIG.MOVE_PATTERN_STEP, MovementRange.patternsByDistance, MovementRange.patternMapsByDistance)
      patternMap = MovementRange.patternMapsByDistance[distance]
    return patternMap

module.exports = MovementRange
