CardType = require 'app/sdk/cards/cardType'
Modifier = require './modifier'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'

class ModifierOpponentSummonWatchDamageBuffMinionInHand extends ModifierOpponentSummonWatch

  type:"ModifierOpponentSummonWatchDamageBuffMinionInHand"
  @type:"ModifierOpponentSummonWatchDamageBuffMinionInHand"

  @modifierName:"Opponent Summon Watch Buff Minion in Hand"
  @description: "Whenever your opponent summons a minion, buff a minion in hand"

  fxResource: ["FX.Modifiers.ModifierOpponentSummonWatch"]

  statsBuff: null

  @createContextObject: (attackBuff=0, maxHPBuff=0, buffName, options) ->
    contextObject = super(options)
    contextObject.statsBuff = Modifier.createContextObjectWithAttributeBuffs(attackBuff, maxHPBuff, { modifierName: buffName })
    return contextObject

  onSummonWatch: (action) ->
    if @getGameSession().getIsRunningAsAuthoritative()
      deck = @getOwner().getDeck()
      cards = deck.getCardsInHand()
      possibleCards = []
      for card in cards
        if card? and card.getType() == CardType.Unit
          possibleCards = possibleCards.concat(card)

      if possibleCards.length > 0
        cardToBuff = possibleCards[@getGameSession().getRandomIntegerForExecution(possibleCards.length)]
        @getGameSession().applyModifierContextObject(@statsBuff, cardToBuff)

module.exports = ModifierOpponentSummonWatchDamageBuffMinionInHand
