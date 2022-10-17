Logger = require 'app/common/logger'
CONFIG = require 'app/common/config'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
HealAction = require 'app/sdk/actions/healAction'

class SpellVoidPulse extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None
  damageAmount: 2
  healAmount: 3

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    position = {x: x, y: y}
    entity = board.getCardAtPosition(position, @targetType)

    if entity? and entity.getIsGeneral()
      if entity.getOwnerId() == @getOwnerId()
        # heal my general
        healAction = new HealAction(@getGameSession())
        healAction.setOwnerId(@getOwnerId())
        healAction.setTarget(entity)
        healAction.setHealAmount(@healAmount)
        @getGameSession().executeAction(healAction)
      else
        # damage enemy general
        damageAction = new DamageAction(@getGameSession())
        damageAction.setOwnerId(@getOwnerId())
        damageAction.setTarget(entity)
        damageAction.setDamageAmount(@damageAmount)
        @getGameSession().executeAction(damageAction)

  _findApplyEffectPositions: (position, sourceAction) ->
    applyEffectPositions = []

    # only affects generals
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    if enemyGeneral? then applyEffectPositions.push(enemyGeneral.getPosition())
    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    if myGeneral? then applyEffectPositions.push(myGeneral.getPosition())

    return applyEffectPositions

module.exports = SpellVoidPulse
