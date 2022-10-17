Logger = require 'app/common/logger'
Spell =             require('./spell')
IntentType =           require('app/sdk/intentType')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
SwapUnitAllegianceAction =     require('app/sdk/actions/swapUnitAllegianceAction')

class SpellEnslave extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.EnemyDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellEnslave::onApplyEffectToBoardTile"

    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)
    a = new SwapUnitAllegianceAction(@getGameSession())
    a.setTarget(entity)
    @getGameSession().executeAction(a)

module.exports = SpellEnslave
