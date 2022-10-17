Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
UtilsGameSession = require 'app/common/utils/utils_game_session'

class SpellBoneSwarm extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyIndirect
  damageAmount: 0

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    general = board.getCardAtPosition(applyEffectPosition, @targetType)

    if general? and general.getIsGeneral()
      # damage enemy general
      damageAction = new DamageAction(@getGameSession())
      damageAction.setOwnerId(@getOwnerId())
      damageAction.setTarget(general)
      damageAction.setDamageAmount(@damageAmount)
      @getGameSession().executeAction(damageAction)

      # damage all enemy nearby minions around General (friendly to the General you are targeting)
      for entity in board.getFriendlyEntitiesAroundEntity(general, CardType.Unit, 1)
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@ownerId)
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # only affects enemy General
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if enemyGeneral? then applyEffectPositions.push(enemyGeneral.getPosition())

    return applyEffectPositions

  getAppliesSameEffectToMultipleTargets: () ->
    return true

module.exports = SpellBoneSwarm
