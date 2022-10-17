ModifierDyingWish = require './modifierDyingWish'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
_ = require 'underscore'

class ModifierDyingWishReduceManaCostOfDyingWish extends ModifierDyingWish

  type:"ModifierDyingWishReduceManaCostOfDyingWish"
  @type:"ModifierDyingWishReduceManaCostOfDyingWish"

  fxResource: ["FX.Modifiers.ModifierDyingWish"]

  reduceAmount: 0

  @createContextObject: (reduceAmount, options) ->
    contextObject = super(options)
    contextObject.reduceAmount = reduceAmount
    return contextObject

  onDyingWish: () ->
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
              manaModifier = ModifierManaCostChange.createContextObject(@reduceAmount * -1)
              @getGameSession().applyModifierContextObject(manaModifier, card)
              break

module.exports = ModifierDyingWishReduceManaCostOfDyingWish
