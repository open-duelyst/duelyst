CONFIG = require 'app/common/config'
Modifier = require './modifier'
ModifierBond = require './modifierBond'
UtilsGameSession = require 'app/common/utils/utils_game_session'
CardType = require 'app/sdk/cards/cardType'
HealAction = require 'app/sdk/actions/healAction'
_ = require 'underscore'

class ModifierBondHealMyGeneral extends ModifierBond

  type:"ModifierBondHealMyGeneral"
  @type:"ModifierBondHealMyGeneral"

  @description: "Heal your General"

  fxResource: ["FX.Modifiers.ModifierBond"]

  healAmount: 0

  @createContextObject: (healAmount) ->
    contextObject = super()
    contextObject.healAmount = healAmount
    return contextObject

  onBond: () ->

    healAction = new HealAction(@getGameSession())
    healAction.setOwnerId(@getCard().getOwnerId())
    healAction.setTarget(@getGameSession().getGeneralForPlayerId(@getCard().getOwnerId()))
    healAction.setHealAmount(@healAmount)

    @getGameSession().executeAction(healAction)

module.exports = ModifierBondHealMyGeneral