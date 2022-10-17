Logger = require 'app/common/logger'
HealAction = require 'app/sdk/actions/healAction'
SpellKillTarget = require './spellKillTarget'

class SpellMartyrdom extends SpellKillTarget

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)
    hpToHeal = target.getHP() #keep track of how much HP target had before it was killed
    general = @getGameSession().getGeneralForPlayerId(target.getOwnerId())

    super(board,x,y,sourceAction) #kill the target unit

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellMartyrdom::onApplyEffectToBoardTile -> heal General for #{general.getOwnerId()}"

    #heal the General of the killed unit by that unit's current health (before the unit was killed)
    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@ownerId)
    healAction.setTarget(general)
    healAction.setHealAmount(hpToHeal)
    @getGameSession().executeAction(healAction)

module.exports = SpellMartyrdom
