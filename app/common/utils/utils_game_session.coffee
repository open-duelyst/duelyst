###
  UtilsGameSession - game session utility methods.
###

UtilsGameSession = {}
module.exports = UtilsGameSession

CONFIG = require('app/common/config')
UtilsPosition = require('./utils_position')
UtilsJavascript = require('./utils_javascript')
CardType = require('app/sdk/cards/cardType')
GameType = require('app/sdk/gameType')
_ = require 'underscore'

UtilsGameSession.getWinningPlayerId = (gameSessionData) ->
  # Returns the winning player's id, or undefined if neither is the winner yet
  if gameSessionData.players[0].isWinner
    return gameSessionData.players[0].playerId
  else if gameSessionData.players[1].isWinner
    return gameSessionData.players[1].playerId
  else
    return undefined

UtilsGameSession.getOpponentIdToPlayerId = (gameSessionData,playerId) ->
  for playerData in gameSessionData.players
    if playerData.playerId != playerId
      return playerData.playerId
  return undefined

UtilsGameSession.getPlayerDataForId = (gameSessionData,playerId) ->
  for playerData in gameSessionData.players
    if playerData.playerId == playerId
      return playerData
  return undefined

UtilsGameSession.getPlayerSetupDataForPlayerId = (gameSessionData,playerId) ->
  gameSetupData = gameSessionData.gameSetupData
  for playerData, i in gameSessionData.players
    if playerData.playerId == playerId
      return gameSetupData.players[i]
  return undefined

UtilsGameSession.groupModifiersBySourceCard = (modifiers) ->
  # hash modifiers by the index of the action that played their source card
  modifiersBySourceCardActionIndex = {}
  for m in modifiers
    sourceCard = m.getSourceCard()
    if sourceCard? then sourceCardActionIndex = sourceCard.getAppliedToBoardByActionIndex() else sourceCardActionIndex = -1
    if !modifiersBySourceCardActionIndex[sourceCardActionIndex]? then modifiersBySourceCardActionIndex[sourceCardActionIndex] = []
    modifiersBySourceCardActionIndex[sourceCardActionIndex].push(m)

  # create list of modifiers by source card in order of when the cards were played
  modifiersGroupedBySourceCard = []
  sourceCardActionIndices = Object.keys(modifiersBySourceCardActionIndex).sort((a,b) -> return parseInt(a) - parseInt(b))
  for index in sourceCardActionIndices
    modifiersGroupedBySourceCard.push(modifiersBySourceCardActionIndex[index])
  return modifiersGroupedBySourceCard

UtilsGameSession.getValidBoardPositionsFromPattern = (board, boardPosition, pattern, allowObstructions=true) ->
  if UtilsPosition.getArrayOfPositionsContainsArrayOfPositions(pattern, CONFIG.PATTERN_WHOLE_BOARD)
    # special case: entire board
    if allowObstructions
      return board.getPositions()
    else
      return board.getUnobstructedPositions()
  else
    boardPositions = []

    if UtilsPosition.getArrayOfPositionsContainsMultipleArrayOfPositions(pattern, CONFIG.PATTERN_WHOLE_COLUMN)
      # special case: entire column(s)
      bpx = boardPosition.x
      bpy = Math.floor(CONFIG.BOARDROW * 0.5)
    else if UtilsPosition.getArrayOfPositionsContainsMultipleArrayOfPositions(pattern, CONFIG.PATTERN_WHOLE_ROW)
      # special case: entire row(s)
      bpx = Math.floor(CONFIG.BOARDCOL * 0.5)
      bpy = boardPosition.y
    else
      if !pattern? then pattern = CONFIG.PATTERN_1x1
      bpx = boardPosition.x
      bpy = boardPosition.y

    for offset in pattern
      patternPosition = {x: offset.x + bpx, y: offset.y + bpy}
      if board.isOnBoard(patternPosition) and (allowObstructions or !board.getObstructionAtPosition(patternPosition))
        boardPositions.push(patternPosition)

    return boardPositions

###
* Gets a list of valid spawn positions, accounting for existing and queued obstructions.
* @param {GameSession} gameSession
* @param {Vec2} sourcePosition
* @param {Array} pattern
* @param {Card} cardToSpawn
* @returns {Array} a list of all valid spawn positions
###
UtilsGameSession.getSmartSpawnPositionsFromPattern = (gameSession, sourcePosition, pattern, cardToSpawn) ->
  board = gameSession.getBoard()
  spawnPositions = []
  if !pattern? then pattern = CONFIG.PATTERN_1x1

  for offset in pattern
    # make sure the potential spawn location is on the board and spawn only when not obstructing or position is unobstructed
    spawnPosition = {x: sourcePosition.x + offset.x, y: sourcePosition.y + offset.y}
    if board.isOnBoard(spawnPosition) and !board.getObstructionAtPositionForEntity(spawnPosition, cardToSpawn)
      spawnPositions.push(spawnPosition)

  return spawnPositions

###
* Gets a list of random valid spawn positions, accounting for existing and queued obstructions.
* @param {GameSession} gameSession
* @param {Vec2} sourcePosition
* @param {Array} pattern
* @param {Card} cardToSpawn
* @param {Card|Modifier} source
* @param {Number} [spawnCount=1] spawnCount
* @returns {Array} a list randomly chosen spawn positions
###
UtilsGameSession.getRandomSmartSpawnPositionsFromPattern = (gameSession, sourcePosition, pattern, cardToSpawn, source, spawnCount=1) ->
  spawnPositions = []

  validSpawnPositions = UtilsGameSession.getSmartSpawnPositionsFromPattern(gameSession, sourcePosition, pattern, cardToSpawn)

  # never randomly overwrite friendly tiles
  if cardToSpawn.getType() == CardType.Tile
    for spawnPosition, i in validSpawnPositions by -1
      targetTile = gameSession.getBoard().getTileAtPosition(spawnPosition, true, true)
      if targetTile and targetTile.getOwner() is source.getOwner()
        validSpawnPositions.splice(i, 1)

  # pick random spawn positions
  for i in [0...spawnCount]
    if validSpawnPositions.length > 0
      spawnPositions.push(validSpawnPositions.splice(gameSession.getRandomIntegerForExecution(validSpawnPositions.length), 1)[0])
    else
      break

  return spawnPositions

###
* Coordinates valid spawn positions between a list of sources with spawn patterns.
* @param {GameSession} gameSession
* @param {Array} sourcePositions
* @param {Array} patternOrPatterns list of patterns or single pattern
* @param {Array} cardOrCardsToSpawn list of cards or single card to spawn
* @param {Array} sourceOrSources list of sources or single source
* @param {Array} [spawnCountOrCounts=1] list of number of spawns or single number of spawns
* @returns {Array} a list of spawn data objects with "source" and "spawnPositions" properties.
###
UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsFromPatterns = (gameSession, sourcePositions, patternOrPatterns, cardOrCardsToSpawn, sourceOrSources, spawnCountOrCounts) ->
  spawnPositionsWithSource = []

  if sourcePositions.length == 1
    # special case: only a single source so no conflicts are possible
    sourcePosition = sourcePositions[0]
    pattern = if _.isArray(patternOrPatterns) and _.isArray(patternOrPatterns[0]) then patternOrPatterns[0] else patternOrPatterns
    cardToSpawn = if _.isArray(cardOrCardsToSpawn) then cardOrCardsToSpawn[0] else cardOrCardsToSpawn
    source = if _.isArray(sourceOrSources) then sourceOrSources[0] else sourceOrSources
    spawnCount = if _.isArray(spawnCountOrCounts) then spawnCountOrCounts[0] else spawnCountOrCounts
    if !_.isNumber(spawnCount) or isNaN(spawnCount) or spawnCount <= 0 then spawnCount = 1
    validSpawnPositions = UtilsGameSession.getSmartSpawnPositionsFromPattern(gameSession, sourcePosition, pattern, cardToSpawn)

    # never randomly overwrite friendly tiles
    if cardToSpawn.getType() == CardType.Tile
      for spawnPosition, i in validSpawnPositions by -1
        targetTile = gameSession.getBoard().getTileAtPosition(spawnPosition, true, true)
        if targetTile and targetTile.getOwner() is source.getOwner()
          validSpawnPositions.splice(i, 1)

    spawnPositionsWithSource.push({
      source: source,
      cardToSpawn: cardToSpawn,
      spawnCount: spawnCount,
      sourcePosition: sourcePosition,
      spawnPositions: [],
      validSpawnPositions: validSpawnPositions
    })
  else
    getAppliedByActionIndexFromSource = (source) ->
      return source.getAppliedByActionIndex?() || source.getAppliedToBoardByActionIndex?()

    comparatorMethod = (a, b) ->
      indexA = getAppliedByActionIndexFromSource(a.source)
      indexB = getAppliedByActionIndexFromSource(b.source)
      if indexA >= 0
        if indexB >= 0 then return indexA - indexB else return 1
      else if indexB >= 0 then return -1
      else return a.source.getIndex() - b.source.getIndex()

    # find valid spawn positions
    for sourcePosition, i in sourcePositions
      pattern = if _.isArray(patternOrPatterns) and _.isArray(patternOrPatterns[i]) then patternOrPatterns[i] else patternOrPatterns
      cardToSpawn = if _.isArray(cardOrCardsToSpawn) then cardOrCardsToSpawn[i] else cardOrCardsToSpawn
      source = if _.isArray(sourceOrSources) then sourceOrSources[i] else sourceOrSources
      spawnCount = if _.isArray(spawnCountOrCounts) then spawnCountOrCounts[i] else spawnCountOrCounts
      if !_.isNumber(spawnCount) or isNaN(spawnCount) or spawnCount <= 0 then spawnCount = 1

      validSpawnPositions = UtilsGameSession.getSmartSpawnPositionsFromPattern(gameSession, sourcePosition, pattern, cardToSpawn)

      # never randomly overwrite friendly tiles
      if cardToSpawn.getType() == CardType.Tile
        for spawnPosition, i in validSpawnPositions by -1
          targetTile = gameSession.getBoard().getTileAtPosition(spawnPosition, true, true)
          if targetTile and targetTile.getOwner() is source.getOwner()
            validSpawnPositions.splice(i, 1)

      spawnData = {
        source: source,
        cardToSpawn: cardToSpawn,
        spawnCount: spawnCount,
        sourcePosition: sourcePosition,
        spawnPositions: [],
        conflicts: [],
        nonConflictingPositions: [],
        validSpawnPositions: validSpawnPositions
      }

      # sort by number of available spawn locations and then by applied index
      UtilsJavascript.arraySortedInsertAscendingByComparator(spawnPositionsWithSource, spawnData, comparatorMethod)

    # find conflicts
    numConflicts = 0
    conflictScoringMethod = (conflictDataForPosition) -> return conflictDataForPosition.conflicts.length
    for spawnData in spawnPositionsWithSource
      validSpawnPositions = spawnData.validSpawnPositions
      conflicts = spawnData.conflicts
      nonConflictingPositions = spawnData.nonConflictingPositions
      numConflictsForSpawnData = 0
      for position in validSpawnPositions
        x = position.x
        y = position.y
        conflictDataForPosition = null
        for otherSpawnData in spawnPositionsWithSource
          if otherSpawnData != spawnData
            otherSpawnPositions = otherSpawnData.validSpawnPositions
            for otherPosition, otherIndex in otherSpawnPositions
              if x == otherPosition.x and y == otherPosition.y
                if !conflictDataForPosition? then conflictDataForPosition = {position: position, conflicts: []}
                conflictDataForPosition.conflicts.push(otherSpawnData)
                break

        if conflictDataForPosition? and conflictDataForPosition.conflicts.length  > 0
          numConflictsForSpawnData++
          UtilsJavascript.arraySortedInsertByScore(conflicts, conflictDataForPosition, conflictScoringMethod)
        else
          nonConflictingPositions.push(position)

      if numConflictsForSpawnData > 0 && nonConflictingPositions.length == 0
        numConflicts += numConflictsForSpawnData

    # resolve conflicts
    spawnDataIndex = 0
    numSpawnData = spawnPositionsWithSource.length
    while numConflicts > 0
      spawnData = spawnPositionsWithSource[spawnDataIndex]
      spawnDataIndex = (spawnDataIndex + 1) % numSpawnData
      conflicts = spawnData.conflicts
      nonConflictingPositions = spawnData.nonConflictingPositions
      if conflicts? and conflicts.length > 0 and nonConflictingPositions.length == 0
        validSpawnPositions = spawnData.validSpawnPositions
        source = spawnData.source
        conflictDataForPosition = conflicts.pop()
        numConflicts--
        conflictedPosition = conflictDataForPosition.position
        if !UtilsPosition.getIsPositionInPositions(validSpawnPositions, conflictedPosition)
          # this conflicted position has been resolved by another source, try again with same source
          if spawnDataIndex == 0 then spawnDataIndex = numSpawnData - 1 else spawnDataIndex--
        else
          # resolve conflicted position for this source
          resolvedConflict = false
          for conflictingSpawnData in conflictDataForPosition.conflicts
            conflictingSpawnPositions = conflictingSpawnData.validSpawnPositions
            numSpawnPositions = conflictingSpawnPositions.length
            if numSpawnPositions > 1
              UtilsPosition.removePositionFromPositions(conflictedPosition, conflictingSpawnPositions)
              resolvedConflict = true
            else if numSpawnPositions > 0
              appliedIndex = getAppliedByActionIndexFromSource(source)
              conflictingAppliedIndex = getAppliedByActionIndexFromSource(conflictingSpawnData.source)
              if appliedIndex < conflictingAppliedIndex or (appliedIndex == -1 and conflictingAppliedIndex == -1 and source.getIndex() < conflictingSpawnData.source.getIndex())
                UtilsPosition.removePositionFromPositions(conflictedPosition, conflictingSpawnPositions)
                resolvedConflict = true
              else
                resolvedConflict = false
                break
            else
              resolvedConflict = false
              break

          if !resolvedConflict
            UtilsPosition.removePositionFromPositions(conflictedPosition, validSpawnPositions)

  # pick random spawn positions for all sources that have valid spawn positions
  for spawnData in spawnPositionsWithSource
    validSpawnPositions = spawnData.validSpawnPositions
    spawnPositions = spawnData.spawnPositions
    spawnCount = spawnData.spawnCount
    for i in [0...spawnCount]
      if validSpawnPositions.length > 0
        spawnPositions.push(validSpawnPositions.splice(gameSession.getRandomIntegerForExecution(validSpawnPositions.length), 1)[0])
      else
        break

  return spawnPositionsWithSource

###
* Coordinates valid spawn positions for a modifier with all other modifiers that will act the same.
* NOTE: modifier must implement "getCardDataOrIndexToSpawn" method and "spawnPattern" and "spawnCount" properties
* @param {Modifier} modifier
* @param {Modifier} [modifierClass=modifier class]
* @returns {Array} a list of random valid spawn positions.
###
UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsForModifier = (modifier, modifierClass) ->
  # coordinate spawning with all other spawns after this modifier
  gameSession = modifier.getGameSession()
  modifiersToCoordinateWith = modifier.getModifiersToCoordinateWith(modifierClass)
  modifiersToCoordinateWith.unshift(modifier)
  positions = []
  patterns = []
  cardsToSpawn = []
  spawnCounts = []
  for coordinatingModifier in modifiersToCoordinateWith
    card = coordinatingModifier.getCard()
    positions.push(card.getPosition())
    patterns.push(coordinatingModifier.spawnPattern)
    cardsToSpawn.push(gameSession.getExistingCardFromIndexOrCachedCardFromData(coordinatingModifier.getCardDataOrIndexToSpawn()))
    spawnCounts.push(coordinatingModifier.spawnCount)

  # spawn position for this modifier should always be the first
  spawnPositionsWithSource = UtilsGameSession.getRandomNonConflictingSmartSpawnPositionsFromPatterns(gameSession, positions, patterns, cardsToSpawn, modifiersToCoordinateWith, spawnCounts)
  return spawnPositionsWithSource[0].spawnPositions

###*
# Remove sensitive data like deck and card information from an game session for an opponent who might attempt to peek at the data to cheat.
# @public
# @param  {GameSession}  gameSession      The GameSession source of the data.
# @param  {Object}    gameSessionData    The GameSession data object we want to scrub.
# @param  {String}    scrubFromPerspectiveOfPlayerId  Player ID for who we want to scrub for (the player who should NOT see sensitive data).
# @param  {Boolean}    forSpectator            Should the scrubbing be done for someone watching the game? If so we usually want to blank out the deck since even if a buddy can see your hand, they shouldn't be able to deck snipe.
###
UtilsGameSession.scrubGameSessionData = (gameSession, gameSessionData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
  # for casual games, set game type to ranked if we're sending this data to a ranked player or spectator
  if gameSession.isCasual()
    player = gameSession.getPlayerById(scrubFromPerspectiveOfPlayerId)
    if forSpectator or player.getIsRanked()
      gameSessionData.gameType = GameType.Ranked

  # reset ai properties to default
  delete gameSessionData.aiPlayerId
  delete gameSessionData.aiDifficulty

  # scrub opponent game setup data
  UtilsGameSession.scrubGameSetupData(gameSession, gameSessionData.gameSetupData, scrubFromPerspectiveOfPlayerId, forSpectator)

  # scrub player data
  UtilsGameSession.scrubSensitivePlayerData(gameSession, gameSessionData.players, scrubFromPerspectiveOfPlayerId, forSpectator)

  # scrub opponent cards that aren't yet played and are not a signature card
  cardsIndices = Object.keys(gameSessionData.cardsByIndex)
  for index in cardsIndices
    card = gameSession.getCardByIndex(index)
    if !card? or card.isScrubbable(scrubFromPerspectiveOfPlayerId, forSpectator)
      delete gameSessionData.cardsByIndex[index]
    else if card.isHideable(scrubFromPerspectiveOfPlayerId, forSpectator)
      hiddenCard = card.createCardToHideAs()
      hiddenCardData = JSON.parse(gameSession.serializeToJSON(hiddenCard))
      gameSessionData.cardsByIndex[index] = hiddenCardData

  # scrub modifiers and context objects that are on cards that have been scrubbed
  modifierIndices = Object.keys(gameSessionData.modifiersByIndex)
  for index in modifierIndices
    modifierData = gameSessionData.modifiersByIndex[index]
    if modifierData.cardAffectedIndex? and !gameSessionData.cardsByIndex[modifierData.cardAffectedIndex]?
      delete gameSessionData.modifiersByIndex[index]
    else
      modifier = gameSession.getModifierByIndex(index)
      if modifier? and modifier.isHideable(scrubFromPerspectiveOfPlayerId, forSpectator)
        hiddenModifier = modifier.createModifierToHideAs()
        hiddenModifierData = JSON.parse(gameSession.serializeToJSON(hiddenModifier))
        gameSessionData.modifiersByIndex[index] = hiddenModifierData

  # scrub data from current step actions
  for step in gameSessionData.currentTurn.steps
    UtilsGameSession.scrubSensitiveActionData(gameSession, step.action, scrubFromPerspectiveOfPlayerId, forSpectator)

  # scrub data for step actions
  for turn in gameSessionData.turns
    for step in turn.steps
      UtilsGameSession.scrubSensitiveActionData(gameSession, step.action, scrubFromPerspectiveOfPlayerId, forSpectator)

  return gameSessionData

###
 * Resets/scrubs all cheat sensitive data in game setup data.
 * @param  {GameSession}  gameSession            The GameSession source of the data.
 * @param   {Object}   gameSetupData              Plain js object for game setup data.
 * @param   {String}   scrubFromPerspectiveOfPlayerId    The player for who we want to scrub. (The player that is not allowed to see the data).
 * @param   {Boolean}   forSpectator              Should the scrubbing be done for someone watching the game? If so we usually want to blank out the deck since even if a buddy can see your hand, they shouldn't be able to deck snipe.
 * @returns {Object}
 ###
UtilsGameSession.scrubGameSetupData = (gameSession, gameSetupData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
  for playerData, i in gameSetupData.players
    # reset isRanked to default so players don't know if matched vs ranked or casual player
    delete playerData.isRanked

    # scrub card ids and only retain card indices in deck if scrubbing for spectator or opponent's data
    if forSpectator or playerData.userId != scrubFromPerspectiveOfPlayerId
      playerData.deck = _.map(playerData.deck, (cardData) -> return {id:-1, index: cardData.index} )
      playerData.startingDrawPile = _.map(playerData.startingDrawPile, (cardData) -> return {id:-1, index: cardData.index} )
      # scrub the starting hand for opponent regardless if it's for the spectator or not
      if playerData.userId != scrubFromPerspectiveOfPlayerId
        playerData.startingHand = _.map(playerData.startingHand, (cardData) -> if cardData? then return {id:-1, index: cardData.index} else return null)

  return gameSetupData

###*
# Remove sensitive data from player so it's safe to send to an opponent who might attempt to peek at the data to cheat.
# @public
# @param  {GameSession}  gameSession            The GameSession source of the data.
# @param  {Object}    actionData            Plain JS object or Action object that we want to scrub.
# @param  {String}    scrubFromPerspectiveOfPlayerId  Player ID for who we want to scrub for (the player who should NOT see sensitive data).
# @param  {Boolean}    forSpectator            Should the scrubbing be done for someone watching the game? If so we usually want to blank out the deck since even if a buddy can see your hand, they shouldn't be able to deck snipe.
###
UtilsGameSession.scrubSensitivePlayerData = (gameSession, playersData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
  for playerData, i in playersData
    # reset isRanked to default so players don't know if matched vs ranked or casual player
    delete playerData.isRanked
    delete playerData.rank

###*
# Remove sensitive data like deck and card information from an action and it's sub-actions so it's safe to send to an opponent who might attempt to peek at the data to cheat.
# @public
# @param  {GameSession}  gameSession            The GameSession source of the data.
# @param  {Object}    actionData            Plain JS object or Action object that we want to scrub.
# @param  {String}    scrubFromPerspectiveOfPlayerId  Player ID for who we want to scrub for (the player who should NOT see sensitive data).
# @param  {Boolean}    forSpectator            Should the scrubbing be done for someone watching the game? If so we usually want to blank out the deck since even if a buddy can see your hand, they shouldn't be able to deck snipe.
###
UtilsGameSession.scrubSensitiveActionData = (gameSession, actionData, scrubFromPerspectiveOfPlayerId, forSpectator) ->
  # scrub action by creating an instance of the action
  # and using the action's scrub sensitive data method
  action = gameSession.getActionByIndex(actionData.index)
  if action?
    action.scrubSensitiveData(actionData, scrubFromPerspectiveOfPlayerId, forSpectator)

  # scrub resolve sub actions
  resolveSubActionIndices = actionData.resolveSubActionIndices
  if resolveSubActionIndices?
    for resolveSubActionIndex, i in resolveSubActionIndices by -1
      resolveSubAction = gameSession.getActionByIndex(resolveSubActionIndex)
      if !resolveSubAction?
        # delete resolve sub actions that don't exist
        resolveSubActionIndices.splice(i, 1)
      else
        target = resolveSubAction.getTarget()
        if resolveSubAction.isRemovableDuringScrubbing(scrubFromPerspectiveOfPlayerId, forSpectator) and target? and target.isScrubbable(scrubFromPerspectiveOfPlayerId, forSpectator)
          # delete sub actions acting on cards that don't exist or haven't been played yet
          resolveSubActionIndices.splice(i, 1)

  # scrub sub-actions
  subActionsOrderedByEventTypeData = actionData.subActionsOrderedByEventType
  if subActionsOrderedByEventTypeData?
    for subActionsByEventTypeData, i in subActionsOrderedByEventTypeData by -1
      subActionsData = subActionsByEventTypeData.actions
      for subActionData, j in subActionsData by -1
        subAction = gameSession.getActionByIndex(subActionData.index)
        if !subAction?
          # delete sub actions that don't exist
          subActionsData.splice(j, 1)
        else
          target = subAction.getTarget()
          if subAction.isRemovableDuringScrubbing(scrubFromPerspectiveOfPlayerId, forSpectator) and target? and target.isScrubbable(scrubFromPerspectiveOfPlayerId, forSpectator)
            # delete sub actions acting on cards that don't exist or haven't been played yet
            subActionsData.splice(j, 1)
          else
            # scrub sub action
            UtilsGameSession.scrubSensitiveActionData(gameSession, subActionData, scrubFromPerspectiveOfPlayerId, forSpectator)

      if subActionsData.length == 0
        # delete sub actions by event type data when no actions remain
        subActionsOrderedByEventTypeData.splice(i, 1)

  return actionData
