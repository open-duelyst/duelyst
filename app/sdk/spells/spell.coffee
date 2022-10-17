CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
UtilsPosition = require 'app/common/utils/utils_position'
Card = require 'app/sdk/cards/card'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
_ = require 'underscore'

class Spell extends Card

  type: CardType.Spell
  @type: CardType.Spell
  name: "Spell"

  canBeAppliedAnywhere: true # spells can usually be targetted anywhere
  targetType: CardType.Entity
  spellFilterType: SpellFilterType.None
  filterCardIds: null # array of card ids to filter for
  filterRaceIds: null # array of race ids to filter for
  filterNearGeneral: false # whether to only allow targets near general
  canTargetGeneral: false
  radius: 0 # when multi-target, if radius > 0 it will get all targets in a radius around target position
  drawCardsPostPlay: 0 # if non-zero, will immediately draw X cards for the player who played this spell (cantrips)
  targetModifiersContextObjects: null # just like entity modifier contexts objects, but used to create modifiers that are added to target of spell
  applyEffectPosition: null # last position spell effect was applied at, used for followup source positions
  applyEffectPositions: null # positions spell effect is being applied at
  applyEffectPositionsCardIndices: null # indices of cards that were at apply effect positions when spell was cast

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.effectCenterPosition = null # absolute center position spell effect is being applied at (ex: CONFIG.BOARDCENTER)
    p.canConvertCardToPrismatic = true # whether this spell can convert cards played by it into prismatics
    p.canConvertCardToSkinned = true # whether this spell can convert cards played by it into skinned versions

    return p

  updateCardDataPostApply: (cardData) ->
    cardData = super(cardData)

    if @applyEffectPositions? then cardData.applyEffectPositions = @applyEffectPositions
    if @applyEffectPositionsCardIndices? then cardData.applyEffectPositionsCardIndices = @applyEffectPositionsCardIndices
    if @applyEffectPosition? then cardData.applyEffectPosition = @applyEffectPosition

    return cardData

  # region ### GETTERS / SETTERS ###

  setTargetModifiersContextObjects: (targetModifiersContextObjects) ->
    @targetModifiersContextObjects = targetModifiersContextObjects

  getTargetModifiersContextObjects: () ->
    return @targetModifiersContextObjects

  getCanConvertCardToPrismatic: () ->
    return @_private.canConvertCardToPrismatic

  getCanConvertCardToSkinned: () ->
    return @_private.canConvertCardToSkinned

  # region ### GETTERS / SETTERS ###

  # region ### APPLY ###

  onApplyToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      # force reset of apply effect positions
      # in case they have been requested before the spell is played
      @applyEffectPosition = @getPosition()
      @applyEffectPositions = @_findApplyEffectPositions(@applyEffectPosition, sourceAction)

      # remove all duplicate positions
      @applyEffectPositions = UtilsPosition.getUniquePositions(@applyEffectPositions)

      @applyEffectPositionsCardIndices = []
      for applyEffectPosition in @applyEffectPositions
        # always store the last position applied at
        @applyEffectPosition = applyEffectPosition

        applyingToUnit = board.getCardAtPosition(applyEffectPosition, CardType.Unit)
        if applyingToUnit?
          @applyEffectPositionsCardIndices.push(applyingToUnit.getIndex())

        # apply spell at each effect position
        @onApplyEffectToBoardTile(board, applyEffectPosition.x, applyEffectPosition.y, sourceAction)

      # handle apply cases that only need to act once
      # instead of at every applied effect position
      @onApplyOneEffectToBoard(board,x,y,sourceAction)

      # after spell is done applying its effects, draw cards if requested
      if @drawCardsPostPlay > 0
        for i in [0...@drawCardsPostPlay]
          deck = @getGameSession().getPlayerById(@getOwnerId()).getDeck()
          @getGameSession().executeAction(deck.actionDrawCard())

  onApplyOneEffectToBoard: (board, x, y, sourceAction) ->
    # override in spell class to do custom behavior once for this spell

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # override in spell class to do custom behavior at each location spell is applied

  setApplyEffectPosition: (val) ->
    @applyEffectPosition = val

  getApplyEffectPosition: () ->
    return @applyEffectPosition

  getPositionForFollowupSourcePosition: () ->
    return @getApplyEffectPosition()

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []
    board = @getGameSession().getBoard()
    affectPattern = @getAffectPattern()

    if affectPattern? and affectPattern.length > 0
      applyEffectPositions = @getAffectPositionsFromPattern(position)
    else if @radius > 0
      startX = Math.max(0,position.x-@radius)
      endX = Math.min(board.columnCount-1,position.x+@radius)
      startY = Math.max(0,position.y-@radius)
      endY = Math.min(board.rowCount-1,position.y+@radius)
      for nx in [startX..endX]
        for ny in [startY..endY]
          nextPosition = {x:nx, y:ny}
          if board.isOnBoard(nextPosition)
            applyEffectPositions.push(nextPosition)

    # add base position to apply
    applyEffectPositions.push(position)

    # filter positions
    applyEffectPositions = @_filterApplyPositions(applyEffectPositions)

    return applyEffectPositions

  getApplyEffectPositions: () ->
    return @applyEffectPositions || []

  getApplyEffectPositionsCardIndices: () ->
    return @applyEffectPositionsCardIndices || []

  getAppliesSameEffectToMultipleTargets: () ->
    # should return true only if spell attempts to apply the same affect to multiple targets
    # ex: return true for a spell that deals 1 damage to all units
    # ex: return false for a spell that deals damage to one unit and heals another unit
    affectPattern = @getAffectPattern()
    if affectPattern?
      return affectPattern.length > 1
    else
      return @radius > 0

  getCenterPositionOfAppliedEffects: () ->
    # should return the absolute center position of the applied effects
    # if absolute center position is already set, it will use the existing value instead of calculating
    if !@_private.effectCenterPosition?
      # default center is spell position
      @_private.effectCenterPosition = @getPosition()

      # for area effect spells try to find center of affect pattern
      affectPattern = @getAffectPattern()
      if affectPattern? and affectPattern.length > 0
        if UtilsPosition.getArrayOfPositionsContainsMultipleArrayOfPositions(affectPattern, CONFIG.PATTERN_WHOLE_ROW)
          @_private.effectCenterPosition = {x: Math.floor(CONFIG.BOARDCOL * 0.5), y: @getPosition().y}
        else if UtilsPosition.getArrayOfPositionsContainsMultipleArrayOfPositions(affectPattern, CONFIG.PATTERN_WHOLE_COLUMN)
          @_private.effectCenterPosition = {x: @getPosition().x, y: Math.floor(CONFIG.BOARDCOL * 0.5)}
        else
          patternCenter = {x: 0, y: 0}
          boardPosition = {x: 0, y: 0}
          numLocationsOnBoard = 0
          board = @getGameSession().getBoard()
          for position in affectPattern
            boardPosition.x = @_private.effectCenterPosition.x + position.x
            boardPosition.y = @_private.effectCenterPosition.y + position.y
            if board.isOnBoard(boardPosition)
              patternCenter.x += position.x
              patternCenter.y += position.y
              numLocationsOnBoard++
          if numLocationsOnBoard > 0
            @_private.effectCenterPosition.x += patternCenter.x / numLocationsOnBoard
            @_private.effectCenterPosition.y += patternCenter.y / numLocationsOnBoard
      else if @radius >= CONFIG.WHOLE_BOARD_RADIUS || (@getCanBeAppliedAnywhere() and @getTargetsAnywhere())
        @_private.effectCenterPosition = CONFIG.BOARDCENTER

    return @_private.effectCenterPosition

  # endregion ### APPLY ###

  # region ### VALID POSITIONS ###

  getCanBeAppliedAnywhere: () ->
    return super() and !@getCanBeAppliedAsFollowup()

  getCanBeAppliedAsFollowup: () ->
    followupSourcePattern = @getFollowupSourcePattern()
    return @getIsFollowup() and followupSourcePattern? and followupSourcePattern.length > 0

  getValidTargetPositions: () ->
    # returns a list of valid target positions
    # it is recommended that spells do not override this method directly
    if !@_private.cachedValidTargetPositions?
      validPositions = @_getPrefilteredValidTargetPositions()

      if @getIsFollowup()
        parentCard = @getParentCard()
        previouslyAppliedPositions = []
        while parentCard
          previouslyAppliedPositions.push(parentCard.getPosition())
          parentCard = parentCard.getParentCard()

        filteredValidPositions = []
        for position in validPositions
          stillValid = true
          for pos in previouslyAppliedPositions
            if pos.x == position.x and pos.y == position.y
              stillValid = false
              break
          if stillValid
            filteredValidPositions.push(position)
        validPositions = filteredValidPositions

      # filter positions for play
      validPositions = @_filterPlayPositions(validPositions)

      # always guarantee at least an empty array
      @_private.cachedValidTargetPositions = validPositions || []

    return @_private.cachedValidTargetPositions

  _getPrefilteredValidTargetPositions: () ->
    if @getCanBeAppliedAnywhere()
      # some cards can be applied anywhere on board
      return @_getValidApplyAnywherePositions()
    else if @getCanBeAppliedAsFollowup()
      # followups should provide a source pattern for specific playable locations
      # otherwise it is assumed they can be played anywhere on board
      return @_getValidFollowupPositions()
    else
      return @getGameSession().getBoard().getPositions()

  _getValidFollowupPositions: () ->
    return UtilsGameSession.getValidBoardPositionsFromPattern(@getGameSession().getBoard(), @getFollowupSourcePosition(), @getFollowupSourcePattern())

  _getValidApplyAnywherePositions: () ->
    return @getGameSession().getBoard().getPositions()

  # endregion ### VALID POSITIONS ###

  # region ### FILTERS ###

  _filterPlayPositions: (spellPositions) ->
    # filter positions that the spell will be first played at
    validPositions = []
    gameSession = @getGameSession()

    if gameSession?
      # run positions through primary filter
      if @spellFilterType == SpellFilterType.AllyDirect
        for entity in @_getEntitiesForFilter()
          if entity.getOwnerId() == @getOwnerId() and @_entityPassesFilter(spellPositions, entity)
            validPositions.push(entity.getPosition())

      else if @spellFilterType == SpellFilterType.EnemyDirect
        for entity in @_getEntitiesForFilter()
          if entity.ownerId != @getOwnerId() and @_entityPassesFilter(spellPositions, entity)
            validPositions.push(entity.getPosition())

      else if @spellFilterType == SpellFilterType.NeutralDirect
        for entity in @_getEntitiesForFilter()
          if @_entityPassesFilter(spellPositions, entity)
            validPositions.push(entity.getPosition())

      else if @spellFilterType == SpellFilterType.SpawnSource
        validPositions = @getGameSession().getBoard().getValidSpawnPositions(@)

      else if @getTargetsAnywhere()
        validPositions = spellPositions

      # run secondary filter
      validPositions = @_postFilterPlayPositions(validPositions)

    return validPositions

  _postFilterPlayPositions: (validPositions) ->
    # override to run a custom filter on play positions after they've run through primary filter
    return validPositions

  _filterApplyPositions: (spellPositions) ->
    # filter positions that the spell will actually be applied at
    validPositions = []
    gameSession = @getGameSession()

    if gameSession?
      # run positions through primary filter
      if @getTargetsAllies()
        for entity in @_getEntitiesForFilter()
          if entity.getOwnerId() == @getOwnerId() and @_entityPassesFilter(spellPositions, entity)
            validPositions.push(entity.getPosition())

      else if @getTargetsEnemies()
        for entity in @_getEntitiesForFilter()
          if entity.ownerId != @getOwnerId() and @_entityPassesFilter(spellPositions, entity)
            validPositions.push(entity.getPosition())

      else if @getTargetsNeutral()
        for entity in @_getEntitiesForFilter()
          if @_entityPassesFilter(spellPositions, entity)
            validPositions.push(entity.getPosition())

      else if @spellFilterType == SpellFilterType.SpawnSource
        validPositions = spellPositions

      else if @spellFilterType == SpellFilterType.None
        validPositions = spellPositions

      # run secondary filter
      validPositions = @_postFilterApplyPositions(validPositions)

    return validPositions

  _postFilterApplyPositions: (validPositions) ->
    # override to run a custom filter on apply positions after they've run through primary filter
    return validPositions

  _getEntitiesForFilter: (allowUntargetable=false) ->
    board = @getGameSession().getBoard()
    if @filterNearGeneral
      general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
      if @spellFilterType == SpellFilterType.AllyDirect
        return board.getEntitiesAroundEntity(general, @targetType, 1)
      else if @spellFilterType == SpellFilterType.EnemyDirect
        return board.getEntitiesAroundEntity(general, @targetType, 1)
      else if @spellFilterType == SpellFilterType.NeutralDirect
        return board.getEntitiesAroundEntity(general, @targetType, 1)
    else
      return board.getCards(@targetType, allowUntargetable)

  _entityPassesFilter: (spellPositions, entity) ->
    if entity.getIsGeneral() and !@canTargetGeneral then return false
    if @filterCardIds and !(entity.getBaseCardId() in @filterCardIds) then return false
    if @filterRaceIds
      passesRaceFilter = false
      for raceId in @filterRaceIds
        if (entity.getBelongsToTribe(raceId))
          passesRaceFilter = true
          break
      if !passesRaceFilter then return false
    if !UtilsPosition.getIsPositionInPositions(spellPositions, entity.getPosition()) then return false
    return true

  getTargetsAllies: () ->
    return @spellFilterType == SpellFilterType.AllyDirect || @spellFilterType == SpellFilterType.AllyIndirect

  getTargetsEnemies: () ->
    return @spellFilterType == SpellFilterType.EnemyDirect || @spellFilterType == SpellFilterType.EnemyIndirect

  getTargetsNeutral: () ->
    return @spellFilterType == SpellFilterType.NeutralDirect || @spellFilterType == SpellFilterType.NeutralIndirect

  getTargetsAnywhere: () ->
    return @spellFilterType == SpellFilterType.None || @spellFilterType == SpellFilterType.NeutralIndirect || @spellFilterType == SpellFilterType.EnemyIndirect || @spellFilterType == SpellFilterType.AllyIndirect

  getTargetsSpace: () ->
    return super() || @getTargetsAnywhere()

  # endregion ### FILTERS ###

module.exports = Spell
