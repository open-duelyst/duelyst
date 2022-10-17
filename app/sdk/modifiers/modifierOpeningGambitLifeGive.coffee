CONFIG = require 'app/common/config'
UtilsGameSession = require 'app/common/utils/utils_game_session'
ModifierOpeningGambit = require './modifierOpeningGambit'
DieAction = require 'app/sdk/actions/dieAction'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'
UtilsGameSession = require 'app/common/utils/utils_game_session'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
_ = require 'underscore'

class ModifierOpeningGambitLifeGive extends ModifierOpeningGambit

  type:"ModifierOpeningGambitLifeGive"
  @type:"ModifierOpeningGambitLifeGive"

  @modifierName:"Opening Gambit"
  @description: "Summon all friendly non-token minions destroyed on your opponent\'s last turn on random spaces"

  fxResource: ["FX.Modifiers.ModifierOpeningGambit", "FX.Modifiers.ModifierGenericSpawn"]

  getPrivateDefaults: (gameSession) ->
    p = super(gameSession)

    p.deadUnitIds = null

    return p

  getAllActionsFromParentAction: (action) ->
    actions = [action]

    subActions = action.getSubActions()
    if subActions? and subActions.length > 0
      for action, i in subActions
        actions = actions.concat(@getAllActionsFromParentAction(subActions[i]))
    return actions

  getdeadUnitIds: () ->
    if !@_private.deadUnitIds?
      deadUnitIds = []
      turnsToCheck = []
      # find opponent's last turn
      for turn in @getGameSession().getTurns() by -1
        if turn.playerId isnt @getCard().getOwnerId()
          turnsToCheck.push(turn)
          break

      actions = []
      for turn in turnsToCheck
        for step in turn.steps
          actions = actions.concat(@getAllActionsFromParentAction(step.getAction()))

      for action in actions
        if action.type is DieAction.type
          card = action.getTarget()
          # find all friendly non-token units that died
          if card?.getOwnerId() is @getCard().getOwnerId() and card?.getType() is CardType.Unit and card.getIsRemoved() and !(card.getRarityId() is Rarity.TokenUnit) and !card.getWasGeneral()
            deadUnitIds.push(card.getId())
      @_private.deadUnitIds = deadUnitIds
      return deadUnitIds
    else
      return @_private.deadUnitIds

  onOpeningGambit: () ->
    super()

    if @getGameSession().getIsRunningAsAuthoritative()
      deadUnitIds = @getdeadUnitIds()
      if deadUnitIds.length > 0
        wholeBoardPattern = CONFIG.ALL_BOARD_POSITIONS
        # use first dead unit as entity to test valid positions for spawns
        cardId = deadUnitIds[0]

        # create one random spawn location per dead unit
        spawnLocations = []
        card = @getGameSession().getExistingCardFromIndexOrCachedCardFromData({id: @getCard().getId()})
        validSpawnLocations = UtilsGameSession.getSmartSpawnPositionsFromPattern(@getGameSession(), {x:0, y:0}, wholeBoardPattern, card)
        _.shuffle(deadUnitIds)
        for i in [0...deadUnitIds.length]
          if validSpawnLocations.length > 0
            spawnLocations.push(validSpawnLocations.splice(@getGameSession().getRandomIntegerForExecution(validSpawnLocations.length), 1)[0])

        for position, i in spawnLocations
          # respawn each dead unit as a fresh copy
          playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, {id: deadUnitIds[i]})
          playCardAction.setSource(@getCard())
          @getGameSession().executeAction(playCardAction)

module.exports = ModifierOpeningGambitLifeGive
