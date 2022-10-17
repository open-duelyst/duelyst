CONFIG = require 'app/common/config'
ModifierBanding = require './modifierBanding'
ModifierDealDamageWatchDrawCard =  require './modifierDealDamageWatchDrawCard'
i18next = require 'i18next'

class ModifierBandingDealDamageWatchDrawCard extends ModifierBanding

  type:"ModifierBandingDealDamageWatchDrawCard"
  @type:"ModifierBandingDealDamageWatchDrawCard"

  #maxStacks: 1
  @description: ""

  fxResource: ["FX.Modifiers.ModifierZeal"]

  @createContextObject: (options = undefined) ->
    contextObject = super(options)
    contextObject.appliedName = i18next.t("modifiers.banding_deal_damage_watch_draw_card_name")
    bandedContextObject = ModifierDealDamageWatchDrawCard.createContextObject()
    bandedContextObject.appliedName = i18next.t("modifiers.banding_deal_damage_watch_draw_card_name")
    contextObject.modifiersContextObjects = [bandedContextObject]
    return contextObject

  @getDescription: (modifierContextObject) ->
    return @description

module.exports = ModifierBandingDealDamageWatchDrawCard
