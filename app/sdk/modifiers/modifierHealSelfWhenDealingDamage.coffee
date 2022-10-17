Logger = require 'app/common/logger'
HealAction = require 'app/sdk/actions/healAction'
DamageAction = require 'app/sdk/actions/damageAction'
Modifier = require './modifier'

class ModifierHealSelfWhenDealingDamage extends Modifier

  type:"ModifierHealSelfWhenDealingDamage"
  @type:"ModifierHealSelfWhenDealingDamage"

  @description:"Whenever this deals damage, restore that much Health to it"

  activeInHand: false
  activeInDeck: false
  activeInSignatureCards: false
  activeOnBoard: true

  onBeforeAction: (event) ->
    super(event)
    action = event.action
    if action instanceof DamageAction and action.getSource() == @getCard()
      if @getCard().getHP() < @getCard().getMaxHP()
        healAction = @getCard().getGameSession().createActionForType(HealAction.type)
        healAction.setTarget(@getCard())
        damageToHeal = action.getTotalDamageAmount()
        if damageToHeal > @getCard().getDamage()
          damageToHeal = @getCard().getDamage()
        healAction.setHealAmount(damageToHeal)
        @getCard().getGameSession().executeAction(healAction)

module.exports = ModifierHealSelfWhenDealingDamage
