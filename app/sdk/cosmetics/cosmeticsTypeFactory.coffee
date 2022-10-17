
CosmeticsTypeLookup = require './cosmeticsTypeLookup.coffee'
i18next = require 'i18next'

class CosmeticsTypeFactory
  @cosmeticsTypeForIdentifier: (identifier) ->
    typeData = null

    if identifier == CosmeticsTypeLookup.Emote
      typeData =
        id: CosmeticsTypeLookup.Emote
        name: i18next.t("cosmetics.cosmetic_type_emote")

    if identifier == CosmeticsTypeLookup.CardBack
      typeData =
        id: CosmeticsTypeLookup.CardBack
        name: i18next.t("cosmetics.cosmetic_type_card_back")

    if identifier == CosmeticsTypeLookup.ProfileIcon
      typeData =
        id: CosmeticsTypeLookup.ProfileIcon
        name: i18next.t("cosmetics.cosmetic_type_profile_icon")

    if identifier == CosmeticsTypeLookup.Scene
      typeData =
        id: CosmeticsTypeLookup.Scene
        name: i18next.t("cosmetics.cosmetic_type_scene")

    if identifier == CosmeticsTypeLookup.BattleMap
      typeData =
        id: CosmeticsTypeLookup.BattleMap
        name: i18next.t("cosmetics.cosmetic_type_battle_map")

    if identifier == CosmeticsTypeLookup.CardSkin
      typeData =
        id: CosmeticsTypeLookup.CardSkin
        name: i18next.t("cosmetics.cosmetic_type_card_skin")

    if typeData
      return typeData
    else
      console.error "CosmeticsTypeFactory.cosmeticsTypeForIdentifier - Unknown cosmestics type identifier: #{identifier}".red

  @getAllCosmeticsTypes: () ->
    types = []
    for typeKey of CosmeticsTypeLookup
      identifier = CosmeticsTypeLookup[typeKey]
      typeData = @.cosmeticsTypeForIdentifier(identifier)
      if typeData?
        types.push(typeData)

    return types

module.exports = CosmeticsTypeFactory
