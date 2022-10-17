CONFIG =       require 'app/common/config'
ModifierBanding =   require './modifierBanding'
ModifierEndTurnWatchHealSelfAndGeneral =   require './modifierEndTurnWatchHealSelfAndGeneral'
UtilsGameSession = require 'app/common/utils/utils_game_session'
i18next = require 'i18next'

class ModifierBandingHealSelfAndGeneral extends ModifierBanding

  type:"ModifierBandingHealSelfAndGeneral"
  @type:"ModifierBandingHealSelfAndGeneral"

  @description: ""

  fxResource: ["FX.Modifiers.ModifierZeal", "FX.Modifiers.ModifierZealHeal"]

  @createContextObject: (healAmount=0, options) ->
    contextObject = super(options)
    contextObject.appliedName = i18next.t("modifiers.banding_heal_self_and_general_name")
    contextObject.healAmount = healAmount
    bandedContextObject = ModifierEndTurnWatchHealSelfAndGeneral.createContextObject(healAmount)
    bandedContextObject.appliedName = i18next.t("modifiers.banding_heal_self_and_general_name")
    contextObject.modifiersContextObjects = [bandedContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    if modifierContextObject
      return @description.replace /%X/, modifierContextObject.healAmount
    else
      return @description

module.exports = ModifierBandingHealSelfAndGeneral
