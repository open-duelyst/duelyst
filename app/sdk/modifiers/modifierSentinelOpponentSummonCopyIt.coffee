ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierSentinelOpponentSummon = require './modifierSentinelOpponentSummon'
PutCardInHandAction = require 'app/sdk/actions/putCardInHandAction'

class ModifierSentinelOpponentSummonCopyIt extends ModifierSentinelOpponentSummon

  type:"ModifierSentinelOpponentSummonCopyIt"
  @type:"ModifierSentinelOpponentSummonCopyIt"

  onOverwatch: (action) ->
    super(action) # transform unit
    # damage unit that was just summoned by enemy
    if action.getTarget()?
      costChangeModifer = ModifierManaCostChange.createContextObject(-2)
      costChangeModifer.appliedName = "Tormented Loyalty"
      newCardData = action.getTarget().createNewCardData()
      newCardData.additionalModifiersContextObjects = [costChangeModifer]
      putCardInHandAction = new PutCardInHandAction(@getGameSession(), @getCard().getOwnerId(), newCardData)
      @getGameSession().executeAction(putCardInHandAction)

module.exports = ModifierSentinelOpponentSummonCopyIt
