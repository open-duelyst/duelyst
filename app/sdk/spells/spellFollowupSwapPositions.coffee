Logger = require 'app/common/logger'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
SwapUnitsAction = require 'app/sdk/actions/swapUnitsAction'
FXType = require 'app/sdk/helpers/fxType'
_ = require 'underscore'

class SpellFollowupSwapPositions extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.None

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellFollowupSwapPositions::onApplyEffectToBoardTile "
    applyEffectPosition = {x: x, y: y}

    source = board.getCardAtPosition(@getFollowupSourcePosition(), @targetType)
    target = board.getCardAtPosition(applyEffectPosition, @targetType)

    swapAction = new SwapUnitsAction(@getGameSession())
    swapAction.setOwnerId(@getOwnerId())
    swapAction.setSource(source)
    swapAction.setTarget(target)
    swapAction.setFXResource(_.union(swapAction.getFXResource(), @getFXResource()))
    @getGameSession().executeAction(swapAction)

module.exports = SpellFollowupSwapPositions
