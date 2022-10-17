CONFIG = require 'app/common/config'
ModifierBanded = require './modifierBanded'
HealAction =     require "app/sdk/actions/healAction"

i18next = require('i18next')

class ModifierBandedHeal extends ModifierBanded

  type: "ModifierBandedHeal"
  @type: "ModifierBandedHeal"

  @modifierName: i18next.t("modifiers.banded_heal_name")
  @description: i18next.t("modifiers.banded_heal_desc")

  fxResource: ["FX.Modifiers.ModifierZealed", "FX.Modifiers.ModifierZealedHeal"]

  onEndTurn:() ->
    super()

    if @getGameSession().getCurrentPlayer() is @getCard().getOwner() and @getCard().getHP() < @getCard().getMaxHP()
      healAction = @getCard().getGameSession().createActionForType(HealAction.type)
      healAction.setTarget(@getCard())
      healAction.setHealAmount(@getCard().getMaxHP() - @getCard().getHP())
      @getCard().getGameSession().executeAction(healAction)

module.exports = ModifierBandedHeal
