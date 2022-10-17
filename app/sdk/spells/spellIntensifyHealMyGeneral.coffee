SpellIntensify = require './spellIntensify'
HealAction = require 'app/sdk/actions/healAction'

class SpellIntensifyHealMyGeneral extends SpellIntensify

  healAmount: 0

  _findApplyEffectPositions: (position, sourceAction) ->
    return [@getGameSession().getGeneralForPlayerId(@getOwnerId()).getPosition()]

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    totalHealAmount = @healAmount * @getIntensifyAmount()

    general = @getGameSession().getGeneralForPlayerId(@getOwnerId())
    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@getOwnerId())
    healAction.setTarget(general)
    healAction.setHealAmount(totalHealAmount)
    @getGameSession().executeAction(healAction)

module.exports = SpellIntensifyHealMyGeneral
