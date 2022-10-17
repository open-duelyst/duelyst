Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
KillAction = require 'app/sdk/actions/killAction'

class SpellFollowupKillTarget extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralDirect

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    applyEffectPosition = {x: x, y: y}
    target = board.getCardAtPosition(applyEffectPosition, @targetType)

    killAction = new KillAction(@getGameSession())
    killAction.setOwnerId(@ownerId)
    killAction.setTarget(target)
    @getGameSession().executeAction(killAction)

module.exports = SpellFollowupKillTarget
