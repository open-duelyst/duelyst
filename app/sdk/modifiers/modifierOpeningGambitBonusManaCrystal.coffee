ModifierOpeningGambit =  require './modifierOpeningGambit'
BonusManaCoreAction = require 'app/sdk/actions/bonusManaCoreAction'

class ModifierOpeningGambitBonusManaCrystal extends ModifierOpeningGambit

  type:"ModifierOpeningGambitBonusManaCrystal"
  @type:"ModifierOpeningGambitBonusManaCrystal"

  giveToOwner: true # if false, will give mana to OPPONENT of entity
  amountToGive: 1

  @createContextObject: (giveToOwner=true, amountToGive=1, options) ->
    contextObject = super(options)
    contextObject.amountToGive = amountToGive
    contextObject.giveToOwner = giveToOwner
    return contextObject

  onOpeningGambit: () ->
    super()
    if @amountToGive > 0
      for [0...@amountToGive]
        bonusManaCoreAction = new BonusManaCoreAction(@getGameSession())
        bonusManaCoreAction.setSource(@getCard())
        if @giveToOwner
          bonusManaCoreAction.setOwnerId(@getCard().getOwnerId())
        else
          bonusManaCoreAction.setOwnerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))
        @getGameSession().executeAction(bonusManaCoreAction)

module.exports = ModifierOpeningGambitBonusManaCrystal
