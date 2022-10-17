Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
SpellSpawnEntity = require './spellSpawnEntity'
CardType = require 'app/sdk/cards/cardType'
Rarity = require 'app/sdk/cards/rarityLookup'
Cards = require 'app/sdk/cards/cardsLookupComplete'
DieAction = require 'app/sdk/actions/dieAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'
_ = require 'underscore'

class SpellNetherSummoning extends SpellSpawnEntity

  targetType: CardType.Unit
  spawnSilently: true
  numUnits: 2
  cardDataOrIndexToSpawn: {id: Cards.Faction4.Wraithling} # use Wraithling as default unit for checking spawn positions, etc

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
    numberOfApplyPositions = @numUnits
    if numberOfApplyPositions > @getDeadUnits().length
      numberOfApplyPositions = @getDeadUnits().length

    if numberOfApplyPositions > 0
      applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, card, @, numberOfApplyPositions)
    else
      applyEffectPositions = []

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

  getDeadUnits: () ->
    if !@_private.deadUnits?
      @_private.deadUnits = @getGameSession().getDeadUnits(null, @getOwnerId())
    return @_private.deadUnits

  # nether summmoning picks its apply locations by itself, so don't set limits on where it can be cast
  _postFilterPlayPositions: (validPositions) ->
    return validPositions

module.exports = SpellNetherSummoning
