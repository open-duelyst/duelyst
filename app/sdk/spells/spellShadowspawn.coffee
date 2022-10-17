CONFIG = require '../../common/config'
SpellSpawnEntity = require './spellSpawnEntity.coffee'
CardType = require './../cards/cardType.coffee'
Cards = require '../cards/cardsLookupComplete.coffee'
UtilsGameSession = require '../../common/utils/utils_game_session.coffee'
_ = require 'underscore'

class SpellShadowspawn extends SpellSpawnEntity

  targetType: CardType.Unit
  spawnSilently: true
  numUnits: 2
  cardDataOrIndexToSpawn: {id: Cards.Faction4.Wraithling} # spawns wraithlings

  _findApplyEffectPositions: (position, sourceAction) ->
    card = @getEntityToSpawn()
    generalPosition = @getGameSession().getGeneralForPlayerId(@ownerId).getPosition()
    numberOfApplyPositions = @numUnits

    if numberOfApplyPositions > 0
      applyEffectPositions = UtilsGameSession.getRandomSmartSpawnPositionsFromPattern(@getGameSession(), generalPosition, CONFIG.PATTERN_3x3, card, @, numberOfApplyPositions)
    else
      applyEffectPositions = []

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

  # Shadowspawn picks its apply locations by itself, so don't set limits on where it can be cast
  _postFilterPlayPositions: (validPositions) ->
    return validPositions

module.exports = SpellShadowspawn
