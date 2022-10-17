ModifierMyAttackOrAttackedWatch = require './modifierMyAttackOrAttackedWatch'
CardType = require 'app/sdk/cards/cardType'
DrawCardAction = require 'app/sdk/actions/drawCardAction'

class ModifierMyAttackOrAttackedWatchDrawCard extends ModifierMyAttackOrAttackedWatch

  type:"ModifierMyAttackOrAttackedWatchDrawCard"
  @type:"ModifierMyAttackOrAttackedWatchDrawCard"

  @modifierName:"Attack or Attacked Watch and Draw Card"
  @description:"Whenever this minion attacks or is attacked, draw a card"

  onMyAttackOrAttackedWatch: (action) ->
    a = new DrawCardAction(this.getGameSession(), @getCard().getOwnerId())
    this.getGameSession().executeAction(a)

module.exports = ModifierMyAttackOrAttackedWatchDrawCard
