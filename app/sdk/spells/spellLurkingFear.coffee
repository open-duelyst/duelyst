UtilsGameSession = require 'app/common/utils/utils_game_session'
Spell = require './spell'
CardType = require 'app/sdk/cards/cardType'
SpellFilterType =  require './spellFilterType'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
_ = require 'underscore'

class SpellLurkingFear extends Spell

  targetType: CardType.Unit
  spellFilterType: SpellFilterType.NeutralIndirect
  cardTypeToTarget: CardType.Unit # type of card to target

  onApplyOneEffectToBoard: (board,x,y,sourceAction) ->
    super(board,x,y,sourceAction)

    if @getGameSession().getIsRunningAsAuthoritative()
      cards = []
      deck = @getOwner().getDeck()
      cards = cards.concat(deck.getCardsInHandExcludingMissing(), deck.getCardsInDrawPile())
      for card in cards
        # search for Dying Wish modifier and keyword class Dying Wish
        # searching by keyword class because some units have "dying wishes" that are not specified as Dying Wish keyword
        # (ex - Snow Chaser 'replicate')
        # but don't want to catch minions that grant others Dying Wish (ex - Ancient Grove)
        if card.hasModifierClass(ModifierDyingWish)
          for kwClass in card.getKeywordClasses()
            if kwClass.belongsToKeywordClass(ModifierDyingWish)
              manaModifier = ModifierManaCostChange.createContextObject(@costChange)
              @getGameSession().applyModifierContextObject(manaModifier, card)
              break

module.exports = SpellLurkingFear
