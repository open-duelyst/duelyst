UtilsPosition = require 'app/common/utils/utils_position'
Range = require './range'
_ = require 'underscore'

class AttackRange extends Range

  _attackAtlasesByIndex: null
  _targetsTestedForValidByIndex: null

  flushCachedState: () ->
    super()
    @_attackAtlasesByIndex = null
    @_targetsTestedForValidByIndex = null

  #Returns list of tile grid positions where attacks are valid (excluding locations with friendly targets)
  getValidPositions: ( board, entity, fromPositions) ->
    attackAtlas = @getAttackAtlas(board, entity, fromPositions)
    return attackAtlas.getValidPositions()

  getValidPosition: (board, entity, position, attackAtlas) ->
    if board.isOnBoard(position)
      # if we've already tested this position, return previous result
      columnCount = board.getColumnCount()
      index = UtilsPosition.getMapIndexFromPosition(columnCount, position.x, position.y)
      if !@_positionsTestedForValidByIndex? then @_positionsTestedForValidByIndex = {}
      isValid = @_positionsTestedForValidByIndex[index]
      if isValid?
        if isValid then return position
      else
        if entity.getAttackNeedsLOS()
          if not attackAtlas?
            attackAtlas = @getAttackAtlas(board, entity)

          if attackAtlas.hasLineOfSight(position.x, position.y)
            # valid position found
            @_positionsTestedForValidByIndex[index] = true
            return position
        else
          entityPosition = entity.getPosition()
          attackPatternMap = entity.getAttackPatternMap()
          attackPatternPosition = {x: position.x - entityPosition.x, y: position.y - entityPosition.y}

          if @getIsPositionInPatternMap(board, attackPatternMap, attackPatternPosition)
            # valid position found
            @_positionsTestedForValidByIndex[index] = true
            return position
          else
            # no valid position found
            @_positionsTestedForValidByIndex[index] = false

    return null

  getValidTargets: (board, entity, fromPositions) ->
    attackAtlas = @getAttackAtlas(board, entity, fromPositions)
    return attackAtlas.getValidTargets()

  getIsValidTarget: (board, entity, targetEntity) ->
    index = targetEntity.getIndex()
    if !@_targetsTestedForValidByIndex? then @_targetsTestedForValidByIndex = {}
    isValid = @_targetsTestedForValidByIndex[index]
    if isValid?
      return isValid
    else
      return @_targetsTestedForValidByIndex[index] = targetEntity in @getValidTargets(board, entity)

  getAttackAtlas: (board, entity, fromPositions) ->
    if !@_attackAtlasesByIndex? then @_attackAtlasesByIndex = {}
    # ensure from positions is an array
    if !fromPositions?
      fromPositions = [entity.getPosition()]
    else if !_.isArray(fromPositions)
      fromPositions = [fromPositions]

    # calculate valid from positions and index of atlas based on positions
    # ideally, we'd sort the indices and then merge but the positions are unlikely to change order
    validFromPositions = []
    index = "m"
    columnCount = board.getColumnCount()
    for position in fromPositions
      if board.isOnBoard(position)
        index += "_" + UtilsPosition.getMapIndexFromPosition(columnCount, position.x, position.y)
        validFromPositions.push(position)

    attackAtlas = @_attackAtlasesByIndex[index]
    if attackAtlas?
      # use existing atlas
      return attackAtlas
    else
      # create new atlas and cache
      return @_attackAtlasesByIndex[index] = new AttackAtlas(board, entity, validFromPositions)

  # collections of attack maps for a entity and any number of potential attack positions
  class AttackAtlas
    board: null
    entity: null
    positions: null
    validNodes: null
    validNodesByPosition: null
    maps: null

    constructor: (board, entity, positions) ->
      @board = board
      @entity = entity
      @positions = positions

      @validNodes = []
      @validNodesByPosition = {}
      @maps = []

      rowCount = board.getRowCount()
      columnCount = board.getColumnCount()
      bufferSize = rowCount * columnCount * Uint8Array.BYTES_PER_ELEMENT
      buffer = new ArrayBuffer(bufferSize)
      bufferInterface = new Uint8Array(buffer)

      if !@entity.getAttackNeedsLOS() and @getReachesEntireMap()
        # create a single map when entity reach runs from map edge to edge
        map = new AttackMap(@, @entity.getPosition())
        @maps.push(map)
      else
        # create a map for each position and do not allow duplicates
        for position in positions
          mapIndex = UtilsPosition.getMapIndexFromPosition(columnCount, position.x, position.y)
          if bufferInterface[mapIndex] != 1
            bufferInterface[mapIndex] = 1
            map = new AttackMap(@, position)
            @maps.push(map)

      # build all lines of sight
      if @entity.getAttackNeedsLOS()
        @buildLinesOfSight()

    buildLinesOfSight: () ->
      @validNodes = []
      @validNodesByPosition = {}
      for map in @maps
        map.buildLinesOfSight()

    hasLineOfSight: (x, y) ->
      if !@_losByIndex? then @_losByIndex = {}
      index = UtilsPosition.getMapIndexFromPosition(@board.getColumnCount(), x, y)
      result = @_losByIndex[index]
      if result?
        return result
      else
        for map in @maps
          if map.hasLineOfSight(x, y)
            return @_losByIndex[index] = true

        return @_losByIndex[index] = false

    getReachesEntireMap: () ->
      # check entity attack pattern for full board range
      board = @board
      entityPosition = @entity.getPosition()
      attackPattern = @entity.getAttackPattern()
      columnCount = board.getColumnCount()
      rowCount = board.getRowCount()
      minRangeX = columnCount
      maxRangeX = 0
      minRangeY = rowCount
      maxRangeY = 0
      testPosition = {x: 0, y: 0}
      for attackOffset in attackPattern
        testPosition.x = entityPosition.x + attackOffset.x
        testPosition.y = entityPosition.y + attackOffset.y
        if board.isOnBoard(testPosition)
          # get attack range
          if testPosition.x < minRangeX then minRangeX = testPosition.x
          if testPosition.x > maxRangeX then maxRangeX = testPosition.x
          if testPosition.y < minRangeY then minRangeY = testPosition.y
          if testPosition.y > maxRangeY then maxRangeY = testPosition.y

      # range runs from edge to edge
      if minRangeX == 0 and minRangeY == 0 and maxRangeX == columnCount - 1 and maxRangeY == rowCount - 1
        return true

      return false

    getValidPositions: () ->
      return @validNodes.slice(0)

    getValidTargets: () ->
      if !@_validTargetEntities?
        # search board for valid target entities
        validTargetEntities = @_validTargetEntities = []
        for validNode in @validNodes
          for targetEntity in validNode.entities
            # this really gets all POTENTIAL valid targets for attack
            # attacks may still be invalidated on action validation step (common example: provoke)
            if targetEntity and targetEntity.getIsActive() and targetEntity.getIsTargetable() and !targetEntity.getIsSameTeamAs(@entity)
              validTargetEntities.push(targetEntity)

      return @_validTargetEntities

  # internal map of locations that a entity can attack from a given position
  class AttackMap
    atlas: null
    position: null
    nodes: null
    _minRangeX: 0
    _minRangeY: 0
    _maxRangeX: 0
    _maxRangeY: 0

    constructor: (@atlas, @position) ->
      @nodes = {}

      board = @getBoard()
      columnCount = board.getColumnCount()
      rowCount = board.getRowCount()
      entity = @getEntity()

      # add entity node
      entityNode = new AttackNode(@, @position.x, @position.y)
      @nodes[UtilsPosition.getMapIndexFromPosition(columnCount, @position.x, @position.y)] = entityNode
      # when entity does not need line of sight, any nodes in pattern are valid
      if not entity.getAttackNeedsLOS()
        row = @atlas.validNodesByPosition[@position.y] || (@atlas.validNodesByPosition[@position.y] = {})
        if not row[@position.x]?
          row[@position.x] = entityNode
          @atlas.validNodes.push(entityNode)

      # reset attack range
      @_minRangeX = columnCount
      @_maxRangeX = 0
      @_minRangeY = rowCount
      @_maxRangeY = 0

      # setup base nodes and range based on attack pattern
      attackPattern = entity.getAttackPattern()
      for attackOffset in attackPattern
        x = @position.x + attackOffset.x
        y = @position.y + attackOffset.y
        if board.isOnBoard({x: x, y: y})
          # get attack range
          if x < @_minRangeX then @_minRangeX = x
          if x > @_maxRangeX then @_maxRangeX = x
          if y < @_minRangeY then @_minRangeY = y
          if y > @_maxRangeY then @_maxRangeY = y

          # add pattern nodes
          node = new AttackNode(@, x, y)
          @nodes[UtilsPosition.getMapIndexFromPosition(columnCount, x, y)] = node

          # when entity does not need line of sight, any nodes in pattern are valid
          # add node to atlas's valid nodes, unless there is already a valid node at the location
          if not entity.getAttackNeedsLOS() and (@position.x != x or @position.y != y)
            row = @atlas.validNodesByPosition[y] || (@atlas.validNodesByPosition[y] = {})
            if not row[x]?
              row[x] = node
              @atlas.validNodes.push(node)

      # assign all enemy board entities to nodes if within range
      entities = board.getEntities()
      for otherEntity in entities
        x = otherEntity.position.x
        y = otherEntity.position.y
        if otherEntity.getIsActive() and otherEntity.getIsTargetable() and !entity.getIsSameTeamAs(otherEntity) and @getIsWithinRange(x, y)
          entityNodeIndex = UtilsPosition.getMapIndexFromPosition(columnCount, x, y)
          node = @nodes[entityNodeIndex]
          # create new nodes to record entities, for obstruction
          if not node?
            node = @nodes[entityNodeIndex] = new AttackNode(@, x, y)
            node.withinPattern = false
          node.entities.push(otherEntity)

    buildLinesOfSight: () ->
      board = @getBoard()
      columnCount = board.getColumnCount()
      entity = @getEntity()
      atlasValidNodes = @atlas.validNodes
      atlasValidNodesByPosition = @atlas.validNodesByPosition

      # origin is always safe
      fromPosition = @position
      fromNode = @getNodeAt(fromPosition.x, fromPosition.y)

      # fill in map based on attack range
      # this ensures we'll step to all nodes even if they aren't connected to each other
      for x in [(@_minRangeX + 1)...@_maxRangeX]
        for y in [(@_minRangeY + 1)...@_maxRangeY]
          fillIndex = UtilsPosition.getMapIndexFromPosition(columnCount, x, y)
          node = @nodes[fillIndex]
          if not node?
            node = @nodes[fillIndex] = new AttackNode(@, x, y)
            node.withinPattern = false

      # outward ring steps
      step = [
        {x: -1, y: 0}
        {x: 0, y: 1}
        {x: 1, y: 0}
        {x: 0, y: -1}
      ]

      nodesToProcess = [fromNode]
      nodesToProcessNext = []

      loop
        node = nodesToProcess.shift()
        for offset in step
          # get node at test location
          nextNode = @getNodeAt(node.x + offset.x, node.y + offset.y)

          # test but don't retest
          if !nextNode || nextNode.tested
            continue
          nextNode.testNodeVisibility(fromNode)

          # record valid nodes
          if nextNode.withinPattern and nextNode.visible and (@position.x != nextNode.x or @position.y != nextNode.y)
            # add node to atlas's valid nodes, unless there is already a valid node at the location
            row = atlasValidNodesByPosition[nextNode.y] || (atlasValidNodesByPosition[nextNode.y] = {})
            if not row[nextNode.x]?
              row[nextNode.x] = nextNode
              atlasValidNodes.push(nextNode)

          nodesToProcessNext.push(nextNode)

        if nodesToProcess.length == 0
          if nodesToProcessNext.length > 0
            nodesToProcess = nodesToProcessNext
            nodesToProcessNext = []
          else
            return

    hasLineOfSight: (x, y) ->
      attackNode = @getNodeAt(x, y)
      return attackNode? and attackNode.visible and attackNode.withinPattern

    getIsWithinRange: (x, y) ->
      return x >= @_minRangeX and x <= @_maxRangeX and y >= @_minRangeY and y <= @_maxRangeY

    getNodeAt: (x, y) ->
      board = @getBoard()
      if board.isOnBoard({x: x, y: y})
        return @nodes[UtilsPosition.getMapIndexFromPosition(board.getColumnCount(), x, y)]

    getEntity: () ->
      return @atlas.entity

    getBoard: () ->
      return @atlas.board

  class AttackNode

    map: null
    entities: null
    x: 0
    y: 0
    visible: true
    tested: false
    withinPattern: true
    _diagonalMinThreshold: 30.0 * (Math.PI / 180.0)
    _diagonalMaxThreshold: 60.0 * (Math.PI / 180.0)

    constructor: (map, x, y) ->
      @entities = []
      @map = map
      @x = x
      @y = y

    testNodeVisibility: (atNode) ->
      @tested = true

      dx = atNode.x - @x
      dy = atNode.y - @y
      # check adjacent nodes towards origin
      if dx != 0 and dy != 0
        # threshold diagonal check
        angle = Math.abs(Math.atan2(dy, dx)) % (Math.PI * 0.5)
        if angle <= @_diagonalMaxThreshold and angle >= @_diagonalMinThreshold
          if dx > 0 then sx = 1 else sx = -1
          if dy > 0 then sy = 1 else sy = -1
          return @visible = @isAdjacentNodeVisibleForEntity(sx, sy) and (@isAdjacentNodeVisibleForEntity(sx, 0) or @isAdjacentNodeVisibleForEntity(0, sy))

        # force ignore of one direction for test
        if angle > @_diagonalMaxThreshold then dy = 0 else dx = 0

      if dx != 0
        if dx > 0
          return @visible = @isAdjacentNodeVisibleForEntity(1, 0)
        else
          return @visible = @isAdjacentNodeVisibleForEntity(-1, 0)

      if dy != 0
        if dy > 0
          return @visible = @isAdjacentNodeVisibleForEntity(0, 1)
        else
          return @visible = @isAdjacentNodeVisibleForEntity(0, -1)

    isAdjacentNodeVisibleForEntity: (offsetX, offsetY) ->
      adjacentNode = @map.getNodeAt(@x + offsetX, @y + offsetY)
      if adjacentNode?
        # check visibility
        if !adjacentNode.visible
          return false

        # check blocking entities
        for entity in adjacentNode.entities
          if !@map.atlas.entity.getIsSameTeamAs(entity) and entity.getIsObstructing()
            return false

        return true
      else
        return false

module.exports = AttackRange
