ModifierDealDamageWatch = require './modifierDealDamageWatch'
CardType = require 'app/sdk/cards/cardType'

class ModifierDealDamageWatchRefreshSignatureCard extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchRefreshSignatureCard"
  @type:"ModifierDealDamageWatchRefreshSignatureCard"

  @modifierName:"Deal Damage and refresh BBS"
  @description:"When this minion deals damage, refresh your Bloodbound Spell"

  onDealDamage: (action) ->
    @getGameSession().executeAction(@getOwner().actionActivateSignatureCard())

module.exports = ModifierDealDamageWatchRefreshSignatureCard
