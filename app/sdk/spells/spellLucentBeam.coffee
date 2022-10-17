SpellDamage = require './spellDamage'
HealAction = require 'app/sdk/actions/healAction'

class SpellLucentBeam extends SpellDamage

  baseDamage: 2
  bonusDamage: 4

  onApplyEffectToBoardTile: (board,x,y,sourceAction) ->
    if @getWasAnythingHealed()
      @damageAmount = @bonusDamage
    else
      @damageAmount = @baseDamage
    super(board,x,y,sourceAction)

  getAllActionsFromParentAction: (action) ->
    actions = [action]

    subActions = action.getSubActions()
    if subActions? and subActions.length > 0
      for action, i in subActions
        actions = actions.concat(@getAllActionsFromParentAction(subActions[i]))
    return actions

  getWasAnythingHealed: () ->
    wasAnythingHealed = false
    turnsToCheck = []
    turnsToCheck.push(@getGameSession().getCurrentTurn()) # check current turn
    actions = []
    for turn in turnsToCheck
      for step in turn.steps
        actions = actions.concat(@getAllActionsFromParentAction(step.getAction()))

    for action in actions
      if action.type is HealAction.type and action.getTotalHealApplied() > 0
        wasAnythingHealed = true
        break

    return wasAnythingHealed

module.exports = SpellLucentBeam
