Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
KillAction = require 'app/sdk/actions/killAction'
PlayerModifierManaModifierSingleUse = require 'app/sdk/playerModifiers/playerModifierManaModifierSingleUse'

class SpellSoulclamp extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyDirect
  canTargetGeneral: false

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)

    #kill the target entity
    killAction = new KillAction(@getGameSession())
    killAction.setOwnerId(@getOwnerId())
    killAction.setTarget(entity)
    @getGameSession().executeAction(killAction)

    return true


module.exports = SpellSoulclamp
