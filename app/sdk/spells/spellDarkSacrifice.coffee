Logger = require 'app/common/logger'
Spell =   require('./spell')
CardType = require 'app/sdk/cards/cardType'
SpellFilterType = require './spellFilterType'
KillAction = require 'app/sdk/actions/killAction'
PlayerModifierManaModifierSingleUse = require 'app/sdk/playerModifiers/playerModifierManaModifierSingleUse'

class SpellDarkSacrifice extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.AllyDirect
  canTargetGeneral: false
  costChange: -3

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)
    applyEffectPosition = {x: x, y: y}
    entity = board.getCardAtPosition(applyEffectPosition, @targetType)

    #Logger.module("SDK").debug "[G:#{@.getGameSession().gameId}]", "SpellDarkSacrifice::onApplyEffectToBoardTile -> explode #{entity.name}"

    #kill the target entity
    killAction = new KillAction(@getGameSession())
    killAction.setOwnerId(@getOwnerId())
    killAction.setTarget(entity)
    @getGameSession().executeAction(killAction)

    # add cost reduction for next unit card
    @getGameSession().applyModifierContextObject(PlayerModifierManaModifierSingleUse.createCostChangeContextObject(@costChange, CardType.Unit), @getGameSession().getGeneralForPlayerId(@getOwnerId()))

    return true


module.exports = SpellDarkSacrifice
