ModifierDyingWish =  require './modifierDyingWish'
CardType = require 'app/sdk/cards/cardType'
BonusManaCoreAction = require 'app/sdk/actions/bonusManaCoreAction'

class ModifierDyingWishBonusManaCrystal extends ModifierDyingWish

  type:"ModifierDyingWishBonusManaCrystal"
  @type:"ModifierDyingWishBonusManaCrystal"

  @description:"Permanently gain 1 mana crystal"

  giveToOwner: true # if false, will give mana to OPPONENT of dying entity
  amountToGain: 1

  @createContextObject: (giveToOwner=true, amountToGain=1, options) ->
    contextObject = super(options)
    contextObject.giveToOwner = giveToOwner
    contextObject.amountToGain = amountToGain
    return contextObject

  onDyingWish: () ->
    super()
    if @amountToGain > 0
      for [0...1]
        bonusManaCoreAction = new BonusManaCoreAction(@getGameSession())
        bonusManaCoreAction.setSource(@getCard())
        if @giveToOwner
          bonusManaCoreAction.setOwnerId(@getCard().getOwnerId())
        else
          bonusManaCoreAction.setOwnerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))
        @getGameSession().executeAction(bonusManaCoreAction)

module.exports = ModifierDyingWishBonusManaCrystal
