Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
SpellSpawnEntity = require './spellSpawnEntity'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'
DieAction = require 'app/sdk/actions/dieAction'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
UtilsGameSession = require 'app/common/utils/utils_game_session'
_ = require 'underscore'

class SpellCorpseCombustion extends SpellSpawnEntity

  targetType: CardType.Unit
  spawnSilently: true
  cardDataOrIndexToSpawn: {id: Cards.Faction3.Dervish} # use Wind Dervish as default unit for checking spawn positions, etc

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.deadUnits = null

    return p

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    # find a random dead entity
    entities = @getDeadUnits()
    whichEntity = [@getGameSession().getRandomIntegerForExecution(entities.length)]
    entityToSpawn = entities[whichEntity]
    if entityToSpawn?
      @cardDataOrIndexToSpawn = entityToSpawn.createNewCardData()
      @_private.deadUnits.splice(whichEntity,1) # remove this unit from the list of dead units (don't summon the same one twice)
      super(board,x,y,sourceAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    generalPosition = @getGameSession().getGeneralForPlayerId(@ownerId).getPosition()
    numberOfApplyPositions = @getDeadUnits().length

    if numberOfApplyPositions > 0
      applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, CONFIG.PATTERN_WHOLE_BOARD, card, @, numberOfApplyPositions)
    else
      applyEffectPositions = []

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

  getAllActionsFromParentAction: (action) ->
    actions = [action]

    subActions = action.getSubActions()
    if subActions? and subActions.length > 0
      for action, i in subActions
        actions = actions.concat(@getAllActionsFromParentAction(subActions[i]))
    return actions

  getDeadUnits: () ->
    if !@_private.deadUnits?
      deadUnits = []
      turnsToCheck = []
      turnsToCheck.push(@getGameSession().getCurrentTurn()) # always check current turn
      # find all game turns that occured since my last turn and add them as well
      for turn in @getGameSession().getTurns() by -1
        if turn.playerId is @getOwnerId()
          break
        else
          turnsToCheck.push(turn)

      actions = []
      for turn in turnsToCheck
        for step in turn.steps
          actions = actions.concat(@getAllActionsFromParentAction(step.getAction()))

      # get friendly minions that died
      for action in actions
        if action.type is DieAction.type
          card = action.getTarget()
          if card?.getType() is CardType.Unit and card.getIsRemoved() and card.getOwnerId() is @getOwnerId() and !(card.getRarityId() is Rarity.TokenUnit) and !card.getWasGeneral()
            deadUnits.push(card)

      deadUnitsWithDyingWish = []
      # NOTE: since this is acting on dead units we can only check base on INHERENT modifiers, not added ones
      # check inherent modifiers for any dying wish modifier
      for deadUnit in deadUnits
        card = @getGameSession().getCardCaches().getCardById(deadUnit.getId())
        for modifierContextObject in card.getInherentModifiersContextObjects()
          if @getGameSession().createModifierForType(modifierContextObject.type) instanceof ModifierDyingWish
            # if we find a "Dying Wish"
            deadUnitsWithDyingWish.push(deadUnit)
      @_private.deadUnits = deadUnitsWithDyingWish
      return deadUnitsWithDyingWish
    else
      return @_private.deadUnits

  # corpse combustion picks its apply locations by itself, so don't set limits on where it can be cast
  _postFilterPlayPositions: (validPositions) ->
    return validPositions

module.exports = SpellCorpseCombustion
