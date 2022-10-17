CardType = require 'app/sdk/cards/cardType'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
PlayCardSilentlyAction = require 'app/sdk/actions/playCardSilentlyAction'

class ModifierUnseven   extends ModifierDyingWish

  type:"ModifierUnseven"
  @type:"ModifierUnseven"

  @description: "Summon a minion with Dying Wish from your action bar"

  activeInDeck: false
  activeInHand: false

  onDyingWish: (action) ->
    super(action)

    if @getGameSession().getIsRunningAsAuthoritative()
      cardsInHand = @getCard().getOwner().getDeck().getCardsInHandExcludingMissing()
      possibleCardsToSummon = []
      for card in cardsInHand
        # search for keyword class Dying Wish AND Dying Wish modifier
        # searching by keyword class because some units have "dying wishes" that are not specified as Dying Wish keyword
        # (ex - Snow Chaser 'replicate')
        # but don't want to catch minions that grant others Dying Wish (ex - Ancient Grove)
        for kwClass in card.getKeywordClasses()
          if (kwClass.belongsToKeywordClass(ModifierDyingWish)) and (card.hasModifierClass(ModifierDyingWish))
            # if we find an "Dying Wish"
            possibleCardsToSummon.push(card)

      if possibleCardsToSummon.length > 0
        cardToSummon = possibleCardsToSummon.splice(@getGameSession().getRandomIntegerForExecution(possibleCardsToSummon.length), 1)[0]
        playCardAction = new PlayCardSilentlyAction(@getGameSession(), @getCard().getOwnerId(), @getCard().getPositionX(), @getCard().getPositionY(), cardToSummon.getIndex())
        playCardAction.setSource(@getCard())
        @getGameSession().executeAction(playCardAction)

module.exports = ModifierUnseven
