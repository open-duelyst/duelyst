Logger = require 'app/common/logger'
SpellSpawnEntity = require './spellSpawnEntity.coffee'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
Cards = require 'app/sdk/cards/cardsLookupComplete'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
CONFIG = require 'app/common/config'

class SpellDamageAndSpawnEntitiesNearbyGeneral extends SpellSpawnEntity

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyDirect
  damageAmount: 2
  spawnSilently: true
  numUnits: 2
  cardDataOrIndexToSpawn: {id: Cards.Neutral.Spellspark} # spawns wraithlings

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, @targetType)

    if target? and target.getOwnerId() != @getOwnerId()
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@ownerId)
      damageAction.setTarget(target)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    generalPosition = @getGameSession().getGeneralForPlayerId(@ownerId).getPosition()
    numberOfApplyPositions = @numUnits

    if numberOfApplyPositions > 0
      applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, card, @, numberOfApplyPositions)
    else
      applyEffectPositions = []

    applyEffectPositions.push(position)

    return applyEffectPositions

  # Wind Shroud picks its apply location by itself, so don't set limits on where it can be cast
  _postFilterPlayPositions: (validPositions) ->
    return validPositions

module.exports = SpellDamageAndSpawnEntitiesNearbyGeneral
