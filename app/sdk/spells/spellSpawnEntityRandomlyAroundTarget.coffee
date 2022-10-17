CONFIG = require '../../common/config'
SpellSpawnEntity = require './spellSpawnEntity.coffee'
CardType = require './../cards/cardType.coffee'
Cards = require '../cards/cardsLookupComplete.coffee'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
_ = require 'underscore'

class SpellSpawnEntityRandomlyAroundTarget extends SpellSpawnEntity

  targetType: CardType.Unit
  spawnSilently: true
  cardDataOrIndexToSpawn: {id: Cards.Faction3.Dervish} # spawns dervishes

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    generalPosition = @getGameSession().getGeneralForPlayerId(@ownerId).getPosition()
    applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), position, CONFIG.PATTERN_3x3, card, @, 1)

    applyEffectPositions.push(position)

    return applyEffectPositions

  # Wind Shroud picks its apply location by itself, so don't set limits on where it can be cast
  _postFilterPlayPositions: (validPositions) ->
    return validPositions

module.exports = SpellSpawnEntityRandomlyAroundTarget
