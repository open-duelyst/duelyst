ModifierDealDamageWatch = require './modifierDealDamageWatch'
CardType = require 'app/sdk/cards/cardType'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierDealDamageWatchDrawCard extends ModifierDealDamageWatch

  type:"ModifierDealDamageWatchDrawCard"
  @type:"ModifierDealDamageWatchDrawCard"

  @modifierName:"Deal Damage and draw card"
  @description:"Whenever this minion deals damage, draw a card"

  onDealDamage: (action) ->
    a = new DrawCardAction(this.getGameSession(), @getCard().getOwnerId())
    this.getGameSession().executeAction(a)

module.exports = ModifierDealDamageWatchDrawCard
