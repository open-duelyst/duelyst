Logger = require 'app/common/logger'
Spell = require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
RefreshExhaustionAction =  require 'app/sdk/actions/refreshExhaustionAction'

class SpellRefreshExhaustion extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellRefreshExhaustion::onApplyEffectToBoardTile"
    refreshExhaustionAction = new RefreshExhaustionAction(@getGameSession())
    refreshExhaustionAction.setTarget(target)
    @getGameSession().executeAction(refreshExhaustionAction)

module.exports = SpellRefreshExhaustion
