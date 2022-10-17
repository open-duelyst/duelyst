SDKObject = require './object'
CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
Card =             require './cards/card'
CardType =             require './cards/cardType'
Entity =     require './entities/entity'
ApplyCardToBoardAction =     require './actions/applyCardToBoardAction'
_ = require 'underscore'

class Board extends SDKObject

  cardIndices: null
  columnCount: CONFIG.BOARDCOL
  rowCount: CONFIG.BOARDROW

  constructor: (gameSession, columnCount, rowCount) ->
    super(gameSession)

    # define public properties here that must be always be serialized
    # do not define properties here that should only serialize if different from the default
    @columnCount = columnCount
    @rowCount = rowCount
    @cardIndices = []

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)
    p.units = []
    p.tiles = []
    p.spells = []
    return p

  getCardIndices: () ->
    return @cardIndices

  getColumnCount: () ->
    return @columnCount

  getRowCount: () ->
    return @rowCount

  getPositions: () ->
    positions = []
    for x in [0...@columnCount]
      for y in [0...@rowCount]
        positions.push({x:x,y:y})
    return positions

  getUnobstructedPositions: () ->
    positions = []
    for x in [0...@columnCount]
      for y in [0...@rowCount]
        position = {x:x,y:y}
        if !@getObstructionAtPosition(position)
          positions.push(position)
    return positions

  getUnobstructedPositionsForEntity: (entity) ->
    positions = []
    for x in [0...@columnCount]
      for y in [0...@rowCount]
        position = {x:x,y:y}
        if !@getObstructionAtPositionForEntity(position, entity)
          positions.push(position)
    return positions

  getUnobstructedPositionsForEntityAroundEntity: (entity, aroundEntity, radius=1) ->
    positions = []
    position = aroundEntity.getPosition()
    positionX = position.x
    positionY = position.y
    startX = Math.max(0,positionX-radius)
    endX = Math.min(@columnCount-1,positionX+radius)
    startY = Math.max(0,positionY-radius)
    endY = Math.min(@rowCount-1,positionY+radius)

    for x in [startX..endX]
      for y in [startY..endY]
        if x != positionX or y != positionY
          position = {x:x,y:y}
          if !@getObstructionAtPositionForEntity(position, entity)
            positions.push(position)

    return positions

  isOnBoard: (position) ->
    return position? and position.x >= 0 and position.y >= 0 and position.x < @columnCount and position.y < @rowCount

  addCard: (card) ->
    if card?
      # track index of card while on board
      # so we know what cards are actually on the board
      cardIndex = card.getIndex()
      if !_.contains(@cardIndices, cardIndex) then @cardIndices.push(cardIndex)

      # add card to board
      cardType = card.getType()
      if cardType is CardType.Unit
        @addUnit(card)
      else if cardType is CardType.Tile
        @addTile(card)
      else if cardType is CardType.Spell
        @addSpell(card)

  removeCard: (card) ->
    if card?
      # stop tracking index of card
      cardIndex = card.getIndex()
      index = _.indexOf(@cardIndices, cardIndex)
      if index != -1 then @cardIndices.splice(index, 1)

      # remove card from board
      cardType = card.getType()
      if cardType == CardType.Unit
        @removeUnit(card)
      else if cardType == CardType.Tile
        @removeTile(card)
      else if cardType is CardType.Spell
        @removeSpell(card)

  addUnit: (unit) ->
    index = _.indexOf(@_private.units, unit)
    if index == -1
      @_private.units.push(unit)

  removeUnit:(unit) ->
    index = _.indexOf(@_private.units, unit)
    if index != -1
      @_private.units.splice(index, 1)

  addTile:(tile) ->
    index = _.indexOf(@_private.tiles, tile)
    if index == -1
      @_private.tiles.push(tile)

  removeTile:(tile) ->
    index = _.indexOf(@_private.tiles, tile)
    if index != -1
      @_private.tiles.splice(index, 1)

  addSpell: (spell) ->
    index = _.indexOf(@_private.spells, spell)
    if index == -1
      @_private.spells.push(spell)

  removeSpell:(spell) ->
    index = _.indexOf(@_private.spells, spell)
    if index != -1
      @_private.spells.splice(index, 1)

  getCards: (type, allowUntargetable, allowQueued) ->
    if type?
      # selective card find
      if type is CardType.Entity
        return @getEntities(allowUntargetable, allowQueued)
      else if type is CardType.Unit
        return @getUnits(allowUntargetable, allowQueued)
      else if type is CardType.Tile
        return @getTiles(allowUntargetable, allowQueued)
      else if type is CardType.Spell
        return @getSpells(allowQueued)
    else
      # all card find
      cards = []
      cards = cards.concat(@getUnits(allowUntargetable, allowQueued))
      cards = cards.concat(@getTiles(allowUntargetable, allowQueued))
      cards = cards.concat(@getSpells(allowQueued))
      return cards

  getEntities: (allowUntargetable, allowQueued) ->
    cards = []
    cards = cards.concat(@getUnits(allowUntargetable, allowQueued))
    cards = cards.concat(@getTiles(allowUntargetable, allowQueued))
    return cards

  getUnits: (allowUntargetable=false, allowQueued=false) ->
    units = []

    for unit in @_private.units
      if unit.getIsActive() and (allowUntargetable or unit.getIsTargetable())
        units.push unit

    return units

  getTiles: (allowUntargetable=false, allowQueued=false) ->
    tiles = []

    for tile in @_private.tiles
      if tile.getIsActive() and (allowUntargetable or tile.getIsTargetable())
        tiles.push tile

    return tiles

  getSpells: (allowQueued=false) ->
    spells = []

    for spell in @_private.spells
      if spell.getIsActive()
        spells.push spell

    return spells

  getCardAtPosition: (pos, type, allowUntargetable=false, allowQueued=false) ->
    if pos?
      numRemovalInQueue = 0
      # get search list by type
      if !type?
        return @getEntityAtPosition(pos, allowUntargetable, allowQueued) or @getSpellAtPosition(pos, allowQueued)
      else if type is CardType.Entity
        return @getEntityAtPosition(pos, allowUntargetable, allowQueued)
      else if type is CardType.Unit
        cards = @_private.units
        numRemovalInQueue = @getGameSession().getRemovalActionsInQueue(pos, CardType.Unit).length
      else if type is CardType.Tile
        cards = @_private.tiles
        numRemovalInQueue = @getGameSession().getRemovalActionsInQueue(pos, CardType.Tile).length
      else if type is CardType.Spell
        cards = @_private.spells

      # get card at position
      for c in cards
        if c.getIsActive() and UtilsPosition.getPositionsAreEqual(pos, c.position) and (allowUntargetable or c.getIsTargetable())
          # each time we find an active card on this space, count it towards the number of cards queued up to be removed
          if numRemovalInQueue > 0
            numRemovalInQueue--
          else if numRemovalInQueue == 0
            # when getting active cards, always return the first
            return c

      # check all cards in queue
      if allowQueued
        return @getQueuedCardAtPosition(pos, type, allowUntargetable)

  getCardsAtPosition: (pos, type, allowUntargetable, allowQueued) ->
    cards = []
    if !type?
      unit = @getUnitAtPosition(pos, allowUntargetable, allowQueued)
      if unit? then cards.push(unit)
      tile = @getTileAtPosition(pos, allowUntargetable, allowQueued)
      if tile? then cards.push(tile)
      spell = @getSpellAtPosition(pos, allowQueued)
      if spell? then cards.push(spell)
    else
      card = @getCardAtPosition(pos, type, allowUntargetable, allowQueued)
      if card? then cards.push(card)
    return cards

  getEntityAtPosition: (pos, allowUntargetable, allowQueued) ->
    # getting an entity at a position uses a priority list instead of getting first in entity list
    return @getUnitAtPosition(pos, allowUntargetable, allowQueued) or @getTileAtPosition(pos, allowUntargetable, allowQueued)

  getEntitiesAtPosition: (pos, allowUntargetable, allowQueued) ->
    entities = []
    unit = @getUnitAtPosition(pos, allowUntargetable, allowQueued)
    if unit? then entities.push(unit)
    tile = @getTileAtPosition(pos, allowUntargetable, allowQueued)
    if tile? then entities.push(tile)
    return entities

  getUnitAtPosition: (pos, allowUntargetable, allowQueued) ->
    return @getCardAtPosition(pos, CardType.Unit, allowUntargetable, allowQueued)

  getTileAtPosition: (pos, allowUntargetable, allowQueued) ->
    return @getCardAtPosition(pos, CardType.Tile, allowUntargetable, allowQueued)

  getSpellAtPosition: (pos, allowQueued) ->
    return @getCardAtPosition(pos, CardType.Spell, allowQueued)

  getObstructionAtPosition: (pos, allowUntargetable=true, allowQueued=true) ->
    entityAtPosition = @getEntityAtPosition(pos, allowUntargetable, allowQueued)
    if entityAtPosition and entityAtPosition.getIsObstructing()
      return entityAtPosition

  getObstructionAtPositionForEntity: (pos, entity, allowUntargetable=true, allowQueued=true) ->
    entityAtPosition = @getEntityAtPosition(pos, allowUntargetable, allowQueued)
    if entityAtPosition and entityAtPosition.getObstructsEntity(entity)
      return entityAtPosition

  getQueuedCardAtPosition: (pos, type, allowUntargetable=false) ->
    # there might be a card in the action queue to be played at this position
    # search the game session's action queue for all actions that may apply a card to board
    # return the first of those cards matching the target type
    for action in @getGameSession().getActionsOfClassInQueue(ApplyCardToBoardAction, pos)
      card = action.getCard()
      if card? and card.getType() == type and (allowUntargetable || card.getIsTargetable())
        return card

  getValidPositionsForModifierSourceType: (card, modifierSourceType) ->
    playerId = card.getOwnerId()
    # check all entities for the ModifierSource type
    validMap = []
    for entity in @getEntities()
      modifierSource = entity.getModifierByType(modifierSourceType)
      if entity.getOwnerId() == playerId and modifierSource?
        # add only valid positions from where entity is now
        sourceValidPositions = modifierSource.getValidPositions(card)
        for validPosition in sourceValidPositions
          validMap[UtilsPosition.getMapIndexFromPosition(@columnCount, validPosition.x, validPosition.y)] = validPosition

    return UtilsPosition.getPositionsFromMap(validMap)

  getValidSpawnPositions: (card) ->
    playerId = card.getOwnerId()
    validMap = []
    for entity in @getUnits(true) # can spawn around any allied units (including untargetable allies)
      if entity.getOwnerId() == playerId
        position = entity.getPosition()
        pattern = CONFIG.SPAWN_PATTERN_STEP
        validPositions = UtilsGameSession.getValidBoardPositionsFromPattern(@, position, pattern, false)
        # add own position if not obstructed
        if !@.getObstructionAtPosition(position)
          validPositions.push(position)

        for validPosition in validPositions
          validMap[UtilsPosition.getMapIndexFromPosition(@columnCount, validPosition.x, validPosition.y)] = validPosition

    return UtilsPosition.getPositionsFromMap(validMap)

  getCardsWithinRadiusOfPosition: (position, type, radius=1, allowCardAtPosition=true, allowUntargetable, allowQueued) ->

    cardsWithinRadius = []

    if position?

      if radius <= 0
        # special case: zero radius
        cardsWithinRadius = cardsWithinRadius.concat(@getCardsAtPosition(position, type, allowUntargetable, allowQueued))
      else
        positionX = position.x
        positionY = position.y
        startX = Math.max(0,positionX-radius)
        endX = Math.min(@columnCount-1,positionX+radius)
        startY = Math.max(0,positionY-radius)
        endY = Math.min(@rowCount-1,positionY+radius)

        if !type? or type == CardType.Entity
          for x in [startX..endX]
            for y in [startY..endY]
              if allowCardAtPosition or x != positionX or y != positionY
                if type == CardType.Entity
                  cardsWithinRadius = cardsWithinRadius.concat(@getEntitiesAtPosition({x:x,y:y}, allowUntargetable, allowQueued))
                else
                  cardsWithinRadius = cardsWithinRadius.concat(@getCardsAtPosition({x:x,y:y}, type, allowUntargetable, allowQueued))
        else
          for x in [startX..endX]
            for y in [startY..endY]
              if allowCardAtPosition or x != positionX or y != positionY
                cardsWithinRadius = cardsWithinRadius.concat(@getCardsAtPosition({x:x,y:y}, type, allowUntargetable, allowQueued))

    return cardsWithinRadius

  getCardsOutsideRadiusOfPosition: (position, type, radius=1, allowUntargetable, allowQueued) ->

    cardsOutsideRadius = []

    if position?
      allCards = @getCards(type, allowUntargetable, allowQueued)

      if radius <= 0
        # special case: zero radius
        cardsOutsideRadius = cardsOutsideRadius.concat(allCards)
      else
        positionX = position.x
        positionY = position.y
        startX = Math.max(0,positionX-radius)
        endX = Math.min(@columnCount-1,positionX+radius)
        startY = Math.max(0,positionY-radius)
        endY = Math.min(@rowCount-1,positionY+radius)

        for card in allCards
          cardPosition = card.getPosition()
          cardPositionX = cardPosition.x
          cardPositionY = cardPosition.y
          if cardPositionX < startX || cardPositionX > endX || cardPositionY < startY || cardPositionY > endY
            cardsOutsideRadius.push(card)

    return cardsOutsideRadius

  getCardsAroundPosition: (position, type, radius, allowUntargetable, allowQueued) ->
    return @getCardsWithinRadiusOfPosition(position, type, radius, false, allowUntargetable, allowQueued)

  getCardsNotAroundPosition: (position, type, radius, allowUntargetable, allowQueued) ->
    return @getCardsOutsideRadiusOfPosition(position, type, radius, allowUntargetable, allowQueued)

  getCardsFromPattern: (position, type, pattern, allowUntargetable, allowQueued) ->
    cards = []
    if !pattern? then pattern = CONFIG.PATTERN_1x1

    for offset in pattern
      cards = cards.concat(@getCardsAtPosition({x: offset.x + position.x, y: offset.y + position.y}, type, allowUntargetable, allowQueued))

    return cards

  getEntitiesAroundEntity: (entity, type=CardType.Entity, radius, allowUntargetable, allowQueued) ->
    return @getCardsAroundPosition(entity.getPosition(), type, radius, allowUntargetable, allowQueued)

  getEntitiesNotAroundEntity: (entity, type=CardType.Entity, radius, allowUntargetable, allowQueued) ->
    return @getCardsNotAroundPosition(entity.getPosition(), type, radius, allowUntargetable, allowQueued)

  getEnemyEntitiesAroundEntity: (entity, type, radius, allowUntargetable, allowQueued) ->

    nearbyEntities = []
    for nearby in @getEntitiesAroundEntity(entity, type, radius, allowUntargetable, allowQueued)
      if !entity.getIsSameTeamAs(nearby)
        nearbyEntities.push(nearby)

    return nearbyEntities

  getEnemyEntitiesNotAroundEntity: (entity, type, radius, allowUntargetable, allowQueued) ->

    notNearbyEntities = []
    for notNearby in @getEntitiesNotAroundEntity(entity, type, radius, allowUntargetable, allowQueued)
      if !entity.getIsSameTeamAs(notNearby)
        notNearbyEntities.push(notNearby)

    return notNearbyEntities

  getFriendlyEntitiesAroundEntity: (entity, type, radius, allowUntargetable, allowQueued) ->

    nearbyEntities = []
    for nearby in @getEntitiesAroundEntity(entity, type, radius, allowUntargetable, allowQueued)
      if entity.getIsSameTeamAs(nearby)
        nearbyEntities.push(nearby)

    return nearbyEntities

  getFriendlyEntitiesNotAroundEntity: (entity, type, radius, allowUntargetable, allowQueued) ->

    notNearbyEntities = []
    for notNearby in @getEntitiesNotAroundEntity(entity, type, radius, allowUntargetable, allowQueued)
      if entity.getIsSameTeamAs(notNearby)
        notNearbyEntities.push(notNearby)

    return notNearbyEntities

  getEnemyEntitiesForEntity: (entity, type=CardType.Entity, allowUntargetable, allowQueued) ->

    enemyEntities = []
    entities = @getCards(type, allowUntargetable, allowQueued)
    for otherEntity in entities
      if otherEntity != entity and !entity.getIsSameTeamAs(otherEntity)
        enemyEntities.push(otherEntity)

    return enemyEntities

  getFriendlyEntitiesForEntity: (entity, type=CardType.Entity, allowUntargetable, allowQueued) ->

    friendlyEntities = []
    entities = @getCards(type, allowUntargetable, allowQueued)
    for otherEntity in entities
      if otherEntity != entity and entity.getIsSameTeamAs(otherEntity)
        friendlyEntities.push(otherEntity)

    return friendlyEntities


  getEntitiesInColumn: (col, type=CardType.Entity, allowUntargetable, allowQueued) ->

    entitiesInCol = []
    entities = @getCards(type, allowUntargetable, allowQueued)

    for entity in entities
      if entity.getPosition().x is col
        entitiesInCol.push(entity)

    return entitiesInCol


  getEntitiesInRow: (row, type=CardType.Entity, allowUntargetable, allowQueued) ->

    entitiesInRow = []
    entities = @getCards(type, allowUntargetable, allowQueued)

    for entity in entities
      if entity.getPosition().y is row
        entitiesInRow.push(entity)

    return entitiesInRow

  getEntitiesInfrontOf: (entity, type=CardType.Entity, allowUntargetable, allowQueued) ->

    entitiesInfront = []
    entities = @getCards(type, allowUntargetable, allowQueued)
    row = entity.getPosition().y

    for otherEntity in entities
      otherPosition = otherEntity.getPosition()
      if otherPosition.y is row and @getIsPositionInfrontOfEntity(entity, otherPosition)
        entitiesInfront.push(otherEntity)

    return entitiesInfront

  getFriendlyEntitiesInfrontOfEntity: (entity, type, allowUntargetable, allowQueued) ->

    friendsInfront = []
    entitiesInfront = @getEntitiesInfrontOf(entity, type, allowUntargetable, allowQueued)

    for otherEntity in entitiesInfront
      if otherEntity.getIsSameTeamAs(entity) then friendsInfront.push(otherEntity)

    return friendsInfront

  getEnemyEntitiesInfrontOfEntity: (entity, type, allowUntargetable, allowQueued) ->

    enemiesInfront = []
    entitiesInfront = @getEntitiesInfrontOf(entity, type, allowUntargetable, allowQueued)

    for otherEntity in entitiesInfront
      if !otherEntity.getIsSameTeamAs(entity) then enemiesInfront.push(otherEntity)

    return enemiesInfront

  getIsPositionInfrontOfEntity: (entity, targetPosition, maxDistanceX=CONFIG.INFINITY, maxDistanceY=CONFIG.INFINITY) ->
    position = entity.getPosition()
    deltaX = targetPosition.x - position.x
    deltaY = targetPosition.y - position.y
    return Math.abs(deltaX) <= maxDistanceX and Math.abs(deltaY) <= maxDistanceY and ((entity.isOwnedByPlayer1() and deltaX > 0) or (entity.isOwnedByPlayer2() and deltaX < 0))

  getIsPositionBehindEntity: (entity, targetPosition, maxDistanceX=CONFIG.INFINITY, maxDistanceY=CONFIG.INFINITY) ->
    position = entity.getPosition()
    deltaX = targetPosition.x - position.x
    deltaY = targetPosition.y - position.y
    return Math.abs(deltaX) <= maxDistanceX and Math.abs(deltaY) <= maxDistanceY and ((entity.isOwnedByPlayer1() and deltaX < 0) or (entity.isOwnedByPlayer2() and deltaX > 0))

  getEntitiesOnCardinalAxisFromEntityToPosition: (entity, targetPosition, type=CardType.Entity, allowUntargetable, allowQueued) ->

    entitiesOnAxis = []
    position = entity.getPosition()
    x = position.x
    y = position.y
    targetCol = targetPosition.x
    targetRow = targetPosition.y
    if x == targetCol
      # along same column
      north = targetRow - y > 0
      for otherEntity in @getCards(type, allowUntargetable, allowQueued)
        otherPosition = otherEntity.getPosition()
        if otherPosition.x is targetCol and ((north and otherPosition.y > y) or (!north and otherPosition.y < y))
          entitiesOnAxis.push(otherEntity)
    else if y == targetRow
      # along same row
      east = targetCol - x > 0
      for otherEntity in @getCards(type, allowUntargetable, allowQueued)
        otherPosition = otherEntity.getPosition()
        if otherPosition.y is targetRow and ((east and otherPosition.x > x) or (!east and otherPosition.x < x))
          entitiesOnAxis.push(otherEntity)

    return entitiesOnAxis

  getFriendlyEntitiesOnCardinalAxisFromEntityToPosition: (entity, targetPosition, type, allowUntargetable, allowQueued) ->

    friendsOnAxis = []

    for otherEntity in @getEntitiesOnCardinalAxisFromEntityToPosition(entity, targetPosition, type, allowUntargetable, allowQueued)
      if otherEntity.getIsSameTeamAs(entity) then friendsOnAxis.push(otherEntity)

    return friendsOnAxis

  getEnemyEntitiesOnCardinalAxisFromEntityToPosition: (entity, targetPosition, type, allowUntargetable, allowQueued) ->

    enemiesOnAxis = []

    for otherEntity in @getEntitiesOnCardinalAxisFromEntityToPosition(entity, targetPosition, type, allowUntargetable, allowQueued)
      if !otherEntity.getIsSameTeamAs(entity) then enemiesOnAxis.push(otherEntity)

    return enemiesOnAxis

  getEntitiesOnEntityStartingSide: (entity, type=CardType.Entity, allowUntargetable, allowQueued) ->

    entities = []
    allCards = @getCards(type, allowUntargetable, allowQueued)

    sideStartX = 0
    sideEndX = CONFIG.BOARDCOL
    if entity.isOwnedByPlayer1()
      sideEndX = Math.floor((sideEndX - sideStartX) * 0.5 - 1)
    else if entity.isOwnedByPlayer2()
      sideStartX = Math.floor((sideEndX - sideStartX) * 0.5 + 1)

    for card in allCards
      cardPosition = card.getPosition()
      cardPositionX = cardPosition.x
      if cardPositionX >= sideStartX and cardPositionX <= sideEndX
        entities.push(card)

    return entities

  getFriendlyEntitiesOnEntityStartingSide: (entity, type, allowUntargetable, allowQueued) ->
    entities = []

    for otherEntity in @getEntitiesOnEntityStartingSide(entity, type, allowUntargetable, allowQueued)
      if entity.getIsSameTeamAs(otherEntity) then entities.push(otherEntity)

    return entities

  getEnemyEntitiesOnEntityStartingSide: (entity, type, allowUntargetable, allowQueued) ->
    entities = []

    for otherEntity in @getEntitiesOnEntityStartingSide(entity, type, allowUntargetable, allowQueued)
      if !entity.getIsSameTeamAs(otherEntity) then entities.push(otherEntity)

    return entities


module.exports = Board
