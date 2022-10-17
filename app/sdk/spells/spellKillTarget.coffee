Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
KillAction = require 'app/sdk/actions/killAction'

class SpellKillTarget extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    target = board.getCardAtPosition({x:x, y:y}, @targetType)
    if target?
      #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellKillTarget::onApplyEffectToBoardTile -> kill #{target.getName()} at #{x}, #{y}"

      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getOwnerId())
      killAction.setTarget(target)
      @getGameSession().executeAction(killAction)

module.exports = SpellKillTarget
