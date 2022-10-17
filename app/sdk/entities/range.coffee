CONFIG = require 'app/common/config'
UtilsPosition = require 'app/common/utils/utils_position'

class Range

  # shared pool of patterns and maps by distance
  # if the range sub class's pattern step changes, override "getPatternByDistance" and "getPatternMapByDistance"
  @patternsByDistance: {}
  @patternMapsByDistance: {}

  # the pattern step used to auto generate the final range pattern
  # think of it like a stamp that fills out the final pattern until it reaches the max distance

  # cached valid positions
  _validPositions: null
  _positionsTestedForValidByIndex: null

  constructor: (gameSession) ->
    @_gameSession = gameSession

  getGameSession: () ->
    return @_gameSession

  # flushed out any cached state so that the next call to use it will regenerate
  flushCachedState: () ->
    @_validPositions = null
    @_positionsTestedForValidByIndex = null

  getValidPositions: (board, entity) ->
    if !@_validPositions?
      entityPosition = entity.getPosition()
      pattern = entity.getPattern()

      validPositions = @_validPositions = []

      for node in pattern
        testPosition = {x: entityPosition.x + node.x, y: entityPosition.y + node.y}
        if board.isOnBoard( testPosition ) && !(entityPosition.x == testPosition.x && entityPosition.y == testPosition.y)
          entityAtTarget = board.getCardAtPosition( testPosition, entity.getType() )
          if !entityAtTarget
            validPositions.push( testPosition )

    return @_validPositions

  getIsPositionValid: (board, entity, position) ->
    return @getValidPosition(board, entity, position)?

  getValidPosition: (board, entity, position) ->
    if board.isOnBoard(position)
      # if we've already tested this position, return previous result
      index = UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), position.x, position.y)
      if !@_positionsTestedForValidByIndex? then @_positionsTestedForValidByIndex = {}
      isValid = @_positionsTestedForValidByIndex[index]
      if isValid?
        if isValid then return position
      else
        pattern = @getValidPositions(board,entity)
        for patternPosition in pattern
          if patternPosition.x == position.x and patternPosition.y == position.y
            # position is valid
            @_positionsTestedForValidByIndex[index] = true
            return position

        # position is not valid
        @_positionsTestedForValidByIndex[index] = false
    return null

  getIsPositionInPatternMap: (board, patternMap, position) ->
    rowCount = board.getRowCount()
    columnCount = board.getColumnCount()
    mapX = position.x + (columnCount - 1)
    mapY = position.y + (rowCount - 1)
    if mapX >= 0 && mapX < columnCount * 2 - 1 && mapY >= 0 && mapY < rowCount * 2 - 1
      return patternMap[mapX][mapY]?

  getPatternByDistance: (board, distance) ->
    pattern = Range.patternsByDistance[distance]
    if !pattern?
      Range._generateAndCachePatternAndMap(board, distance, CONFIG.RANGE_PATTERN_STEP, Range.patternsByDistance, Range.patternMapsByDistance)
      pattern = Range.patternsByDistance[distance]
    return pattern

  getPatternMapByDistance: (board, distance) ->
    patternMap = Range.patternMapsByDistance[distance]
    if !patternMap?
      Range._generateAndCachePatternAndMap(board, distance, CONFIG.RANGE_PATTERN_STEP, Range.patternsByDistance, Range.patternMapsByDistance)
      patternMap = Range.patternMapsByDistance[distance]
    return patternMap

  getPatternMapFromPattern: (board, pattern) ->
    rowCount = board.getRowCount()
    rowCount2 = rowCount * 2 - 1
    rowOffset = rowCount - 1
    columnCount = board.getColumnCount()
    columnCount2 = columnCount * 2 - 1
    columnOffset = columnCount - 1
    patternMap = []
    for i in [0...columnCount2]
      patternMap[i] = []
      patternMap[i].length = rowCount2

    for node in pattern
      mapX = node.x + columnOffset
      mapY = node.y + rowOffset
      if mapX >= 0 && mapX < columnCount2 && mapY >= 0 && mapY < rowCount2 and !patternMap[mapX][mapY]?
        patternMap[mapX][mapY] = node

    return patternMap

  @_generateAndCachePatternAndMap: (board, distance, step, patternCache, patternMapCache) ->
    originNode = {x: 0, y: 0}
    rowCount = board.getRowCount()
    rowCount2 = rowCount * 2 - 1
    rowOffset = rowCount - 1
    columnCount = board.getColumnCount()
    columnCount2 = columnCount * 2 - 1
    columnOffset = columnCount - 1
    pattern = patternCache[distance] = []
    patternMap = patternMapCache[distance] = []
    for i in [0...columnCount2]
      patternMap[i] = []
      patternMap[i].length = rowCount2
    patternMap[columnOffset][rowOffset] = originNode
    nodesToProcess = [originNode]
    nodesToProcessNext = []
    currentDistance = 1

    while nodesToProcess.length > 0
      node = nodesToProcess.shift()
      for offset in step
        nextNodeX = node.x + offset.x
        nextNodeY = node.y + offset.y
        nextNode = {x: nextNodeX, y: nextNodeY}

        # node must be within distance and not a duplicate
        if currentDistance <= distance
          mapX = nextNodeX + columnOffset
          mapY = nextNodeY + rowOffset
          if mapX >= 0 && mapX < columnCount2 && mapY >= 0 && mapY < rowCount2 and !patternMap[mapX][mapY]?
            patternMap[mapX][mapY] = nextNode
            pattern.push(nextNode)
            nodesToProcessNext.push(nextNode)

      if nodesToProcess.length == 0
        currentDistance++
        if nodesToProcessNext.length > 0
          nodesToProcess = nodesToProcessNext
          nodesToProcessNext = []

module.exports = Range
