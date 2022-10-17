ModifierMyAttackWatch =  require './modifierMyAttackWatch'
BonusManaCoreAction = require 'app/sdk/actions/bonusManaCoreAction'
i18next = require('i18next')

class ModifierMyAttackWatchBonusManaCrystal extends ModifierMyAttackWatch

  type:"ModifierMyAttackWatchBonusManaCrystal"
  @type:"ModifierMyAttackWatchBonusManaCrystal"

  @description:i18next.t("modifiers.faction_6_shivers_buff_desc")

  giveToOwner: true # if false, will give mana to OPPONENT of attacking entity

  @createContextObject: (giveToOwner=true, options) ->
    contextObject = super(options)
    contextObject.giveToOwner = giveToOwner
    return contextObject

  onMyAttackWatch: (action) ->

    bonusManaCoreAction = new BonusManaCoreAction(@getGameSession())
    bonusManaCoreAction.setSource(@getCard())
    if @giveToOwner
      bonusManaCoreAction.setOwnerId(@getCard().getOwnerId())
    else
      bonusManaCoreAction.setOwnerId(@getGameSession().getOpponentPlayerIdOfPlayerId(@getCard().getOwnerId()))
    @getGameSession().executeAction(bonusManaCoreAction)

module.exports = ModifierMyAttackWatchBonusManaCrystal
