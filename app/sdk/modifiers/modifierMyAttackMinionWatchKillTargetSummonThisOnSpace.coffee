ModifierMyAttackMinionWatch = require './modifierMyAttackMinionWatch'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'
KillAction = require 'app/sdk/actions/killAction'

class ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace extends ModifierMyAttackMinionWatch

  type:"ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace"
  @type:"ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace"

  fxResource: ["FX.Modifiers.ModifierGenericKill"]

  maxStacks: 1

  onMyAttackMinionWatch: (action) ->
    target = action.getTarget()
    if target?
      killAction = new KillAction(@getGameSession())
      killAction.setOwnerId(@getCard().getOwnerId())
      killAction.setSource(@getCard())
      killAction.setTarget(target)
      @getGameSession().executeAction(killAction)

      position = target.getPosition()
      playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), position.x, position.y, @getCard().createNewCardData())
      playCardAction.setSource(@getCard())
      @getGameSession().executeAction(playCardAction)

module.exports = ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace
