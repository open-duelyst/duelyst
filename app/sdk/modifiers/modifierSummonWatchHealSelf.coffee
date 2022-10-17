ModifierSummonWatch = require './modifierSummonWatch'
HealAction =  require 'app/sdk/actions/healAction'
CardType = require 'app/sdk/cards/cardType'
CONFIG = require 'app/common/config'

class ModifierSummonWatchHealSelf extends ModifierSummonWatch

  type:"ModifierSummonWatchHealSelf"
  @type:"ModifierSummonWatchHealSelf"

  name:"Summon Watch Heal Self"
  description: "Whenever you summon a minion, heal this unit"

  healAmount: 0

  fxResource: ["FX.Modifiers.ModifierSummonWatch", "FX.Modifiers.ModifierGenericHeal"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.healAmount = healAmount
    return contextObject

  onSummonWatch: (action) ->
    healAction = new HealAction(@getCard().getGameSession())
    healAction.setHealAmount(@healAmount)
    healAction.setSource(@getCard())
    healAction.setTarget(@getCard())
    @getCard().getGameSession().executeAction(healAction)

  getIsCardRelevantToWatcher: (card) ->
    return card.getDamage() > 0 #only heal if unit is currently damaged

module.exports = ModifierSummonWatchHealSelf
