CONFIG = require 'app/common/config'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
DamageAction = require 'app/sdk/actions/damageAction'
_ = require 'underscore'

class SpellRainOfSpikes extends Spell

  spellFilterType: SpellFilterType.NeutralIndirect

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    # draw cards
    for i in [1..@cardsToDraw]
      player = @getGameSession().getPlayerById(@getOwnerId())
      action1 = player.getDeck().actionDrawCard()
      @getGameSession().executeAction(action1)

      player = @getGameSession().getOpponentPlayerOfPlayerId(@getOwnerId())
      action2 = player.getDeck().actionDrawCard()
      @getGameSession().executeAction(action2)

    # deal damage
    enemyGeneral = @getGameSession().getGeneralForOpponentOfPlayerId(@getOwnerId())
    damageAction1 = new DamageAction(@getGameSession())
    damageAction1.setOwnerId(@getOwnerId())
    damageAction1.setTarget(enemyGeneral)
    damageAction1.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction1)

    myGeneral = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    damageAction2 = new DamageAction(@getGameSession())
    damageAction2.setOwnerId(@getOwnerId())
    damageAction2.setTarget(myGeneral)
    damageAction2.setDamageAmount(@damageAmount)
    @getGameSession().executeAction(damageAction2)

module.exports = SpellRainOfSpikes
