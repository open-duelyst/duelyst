PlayerModifierEmblemSummonWatch = require './playerModifierEmblemSummonWatch'
RandomDamageAction = require 'app/sdk/actions/randomDamageAction'

class PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest extends PlayerModifierEmblemSummonWatch

  type:"PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest"
  @type:"PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest"

  maxStacks: 1

  onSummonWatch: (action) ->

    unit = action.getTarget()
    if unit? and unit.getManaCost() > 0
      randomDamageAction = new RandomDamageAction(@getGameSession())
      randomDamageAction.setOwnerId(@getCard().getOwnerId())
      randomDamageAction.setSource(unit)
      randomDamageAction.setDamageAmount(unit.getManaCost())
      randomDamageAction.canTargetGenerals = true
      @getGameSession().executeAction(randomDamageAction)

module.exports = PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest
