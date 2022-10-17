ModifierDyingWishPutCardInHand =  require './modifierDyingWishPutCardInHand'
i18next = require('i18next')

class ModifierDyingWishPutCardInHandClean extends ModifierDyingWishPutCardInHand

  type:"ModifierDyingWishPutCardInHandClean"
  @type:"ModifierDyingWishPutCardInHandClean"

  @isKeyworded: false
  @modifierName: undefined
  @description:i18next.t("modifiers.faction_6_infiltrated_replicate_buff_desc")

  @getDescription: (modifierContextObject) ->
    return @description

module.exports = ModifierDyingWishPutCardInHandClean
