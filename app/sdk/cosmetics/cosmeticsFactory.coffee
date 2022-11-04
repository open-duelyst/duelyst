# do not add this file to any resource package
# it is handled by special processing
_ = require 'underscore'
moment = require 'moment'
RSX = require('app/data/resources')
CosmeticsLookup = require './cosmeticsLookup'
CosmeticsTypeLookup = require './cosmeticsTypeLookup'
CosmeticsChestTypeLookup = require './cosmeticsChestTypeLookup'
EmoteCategory = require './emoteCategory'
Factions = require 'app/sdk/cards/factionsLookup'
Rarity = require 'app/sdk/cards/rarityLookup'
RarityFactory = require 'app/sdk/cards/rarityFactory'
Cards = require 'app/sdk/cards/cardsLookup'
i18next = require 'i18next'

class CosmeticsFactory

  @_cosmeticsById: {}

  @cosmeticForIdentifier: (identifier) ->
    cosmeticData = @_cosmeticsById[identifier]
    if cosmeticData
      return cosmeticData

  @cosmeticForSku: (sku) ->
    cosmeticId = parseInt(sku.slice(sku.lastIndexOf("-")+1))
    return @cosmeticForIdentifier(cosmeticId)

  @_cachedCosmetics: null
  @getAllCosmetics: () ->
    return @_cachedCosmetics

  @_cachedCosmeticsForType: null
  @cosmeticsForType: (cosmeticType) ->
    return @_cachedCosmeticsForType[cosmeticType]

  @_cachedCosmeticsForTypeAndFaction: null
  @cosmeticsForTypeAndFaction: (cosmeticType, factionId) ->
    return @_cachedCosmeticsForTypeAndFaction[cosmeticType][factionId]

  @_cachedCosmeticsForTypeAndRarity: null
  @cosmeticsForTypeAndRarity: (cosmeticType, rarityId) ->
    return @_cachedCosmeticsForTypeAndRarity[cosmeticType][rarityId]

  @_cachedCosmeticsForTypeAndFactionAndRarity: null
  @cosmeticsForTypeAndFactionAndRarity: (cosmeticType, factionId, rarityId) ->
    return @_cachedCosmeticsForTypeAndFactionAndRarity[cosmeticType][factionId][rarityId]

  @_cachedCosmeticsForFaction: null
  @cosmeticsForFaction: (factionId) ->
    return @_cachedCosmeticsForFaction[factionId]

  @_cachedCosmeticsForRarity: null
  @cosmeticsForRarity: (rarityId) ->
    return @_cachedCosmeticsForRarity[rarityId]

  @_cachedCosmeticsForChestType: null
  @cosmeticsForChestType: (chestType) ->
    return @_cachedCosmeticsForChestType[chestType]

  @_cachedCosmeticSubTypesByType: null
  @visibleCosmeticSubTypesForType: (cosmeticType) ->
    orderedSubTypes = []
    # To do any manual ordering add a subtype to the if/else below, anything not in list will be appended
    if cosmeticType == CosmeticsTypeLookup.Emote
      orderedSubTypes = ["Lyonar","Songhai","Vetruvian","Abyssian","Magmar","Vanar","Neutral"]
    else if cosmeticType == CosmeticsTypeLookup.CardBack
      orderedSubTypes = []
    else if cosmeticType == CosmeticsTypeLookup.ProfileIcon
      orderedSubTypes = ["Lyonar","Songhai","Vetruvian","Abyssian","Magmar","Vanar","Neutral"]
    else if cosmeticType == CosmeticsTypeLookup.Scene
      orderedSubTypes = []

    # To hide a subtype, _.without it here

    # Append any subtypes that are not in the above list
    allSubtypesForType = @_cachedCosmeticSubTypesByType[cosmeticType]
    subTypesNotInOrderedList = _.difference(allSubtypesForType,orderedSubTypes)

    # Combine ordered and any missing subtypes
    visibleSubTypes = orderedSubTypes.concat(subTypesNotInOrderedList)

    return visibleSubTypes

  @_cachedLocalizedSubTypeTitles: null
  @localizedSubTypeTitle: (subTypeId) ->
    if not @_cachedLocalizedSubTypeTitles?
      @_cachedLocalizedSubTypeTitles = {}
      @_cachedLocalizedSubTypeTitles["all"] = i18next.t("shop.all_subcategories_title")
      @_cachedLocalizedSubTypeTitles["Lyonar"] = i18next.t("factions.faction_1_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Songhai"] = i18next.t("factions.faction_2_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Vetruvian"] = i18next.t("factions.faction_3_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Abyssian"] = i18next.t("factions.faction_4_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Magmar"] = i18next.t("factions.faction_5_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Vanar"] = i18next.t("factions.faction_6_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Neutral"] = i18next.t("factions.faction_neutral_abbreviated_name")
      @_cachedLocalizedSubTypeTitles["Emotes"] = i18next.t("shop.category_emotes_name")

    if @_cachedLocalizedSubTypeTitles[subTypeId]?
      return @_cachedLocalizedSubTypeTitles[subTypeId]
    else
#      console.warn "No localized string for subtype: " + subTypeId
      return subTypeId

  @_cachedCosmeticsForTypeAndSubType: null
  @cosmeticsForTypeAndSubtype: (type,subType) ->
    return @_cachedCosmeticsForTypeAndSubType[type][subType]

  @profileIconForIdentifier: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    if cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.ProfileIcon
      return cosmeticData
    else
      # return default profile icon
      return @cosmeticForIdentifier(@getDefaultProfileIconIdentifier())

  @isIdentifierForProfileIcon: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    return cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.ProfileIcon

  @getDefaultProfileIconIdentifier: () ->
    return CosmeticsLookup.ProfileIcon.Tree

  @cardBackForIdentifier: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    if cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.CardBack
      return cosmeticData
    else
      # return default card back
      return @cosmeticForIdentifier(@getDefaultCardBackIdentifier())

  @isIdentifierForCardBack: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    return cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.CardBack

  @getDefaultCardBackIdentifier: () ->
    return CosmeticsLookup.CardBack.Normal

  @sceneForIdentifier: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    if cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.Scene
      return cosmeticData
    else
      # return default card back
      return @cosmeticForIdentifier(@getDefaultSceneIdentifier())

  @isIdentifierForScene: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    return cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.Scene

  @getDefaultSceneIdentifier: () ->
    return CosmeticsLookup.Scene.Frostfire

  @_cachedCardSkinsForCardId: null
  @cardSkinsForCard: (cardId) ->
    return @_cachedCardSkinsForCardId[cardId] || []

  @_cachedCardSkinIdsForCardId: null
  @cardSkinIdsForCard: (cardId) ->
    return @_cachedCardSkinIdsForCardId[cardId] || []

  @isIdentifierForCardSkin: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    return cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.CardSkin

  @injectSkinPropertiesIntoCard: (card, identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    if cosmeticData? and cosmeticData.typeId == CosmeticsTypeLookup.CardSkin
      # anim resource
      animResource = cosmeticData.animResource
      if animResource? then card.setBaseAnimResource(animResource)

  @cosmeticProductDataForIdentifier: (identifier) ->
    cosmeticData = @cosmeticForIdentifier(identifier)
    if cosmeticData?
      return @_mapCosmeticDataToProductData(cosmeticData)

  @cosmeticProductDataForType: (cosmeticType,cosmeticSubType) ->
    cosmeticDatas = null
    if cosmeticType? and not cosmeticSubType?
      cosmeticDatas = CosmeticsFactory.cosmeticsForType(cosmeticType)
    else if cosmeticType? and cosmeticSubType?
      cosmeticDatas = CosmeticsFactory.cosmeticsForTypeAndSubtype(cosmeticType,cosmeticSubType)
    else
      console.warn "No cosmetic type provided to CosmeticsFactory.cosmeticModelsForType"
      return []

    cosmeticDatas = _.filter cosmeticDatas, (c)-> return c.purchasable && c.rarityId

    return _.map(cosmeticDatas,(cosmeticData) =>
      return @_mapCosmeticDataToProductData(cosmeticData)
    )

  @_mapCosmeticDataToProductData: (cosmeticData)->
    rarityData = RarityFactory.rarityForIdentifier(cosmeticData.rarityId)
    cosmeticRSX = cosmeticData.rsx || {}
    cosmeticCoverRSX = cosmeticData.coverRSX || RSX.challenge_gate_010
    cosmeticAnimResource = cosmeticData.animResource || {}
    return {
      id: cosmeticData.id
      sku: cosmeticData.sku
      name: cosmeticData.name
      price: rarityData.cosmeticHardPrice
      rarity_id: cosmeticData.rarityId || Rarity.Common
      anim_resource: cosmeticAnimResource
      icon_image_url: cosmeticData.img
      icon_image_resource_name: cosmeticRSX.name
      cover_image_url: cosmeticCoverRSX.img
      cover_image_resource_name: cosmeticCoverRSX.name
      description: cosmeticData.shopDescription
      category_name: CosmeticsTypeLookup[cosmeticData.typeId] # TODO: player visible name
      category_id: cosmeticData.typeId
      sub_category_name: cosmeticData.subTypeId
      type: "cosmetic"
      faction_id: if !cosmeticData.factionId? or cosmeticData.factionId == Factions.Neutral then 0 else cosmeticData.factionId
      general_id: cosmeticData.generalId || 0
    }

  @cosmeticResourcesForIdentifier: (identifier) ->
    resources = []

    cosmeticData = @.cosmeticForIdentifier(identifier)
    if cosmeticData?
      if cosmeticData.rsx? then resources.push(cosmeticData.rsx)
      if cosmeticData.coverRSX? then resources.push(cosmeticData.coverRSX)
      if cosmeticData.glowOutlineRSX? then resources.push(cosmeticData.glowOutlineRSX)
      if cosmeticData.animResource?
        for animResourceKey in Object.keys(cosmeticData.animResource)
          animResourceName = cosmeticData.animResource[animResourceKey]
          if _.isString(animResourceName)
            rsx = RSX[animResourceName]
            if rsx? then resources.push(rsx)

    return resources

  @cosmeticProductAttrsForIdentifier: (identifier)->
    cosmeticData = @.cosmeticForIdentifier(identifier)
    if cosmeticData
      return @._mapCosmeticDataToProductData(cosmeticData)
    else
      return null

  @cosmeticProductAttrsForSKU: (sku)->
    cosmeticData = @.cosmeticForSku(sku)
    if cosmeticData
      return @._mapCosmeticDataToProductData(cosmeticData)
    else
      return null

  @nameForCosmeticTypeId: (cosmeticTypeId)->
    if cosmeticTypeId == CosmeticsTypeLookup.Emote
      return "Emote"
    else if cosmeticTypeId == CosmeticsTypeLookup.CardBack
      return "Card Back"
    else if cosmeticTypeId == CosmeticsTypeLookup.ProfileIcon
      return "Profile Icon"
    else if cosmeticTypeId == CosmeticsTypeLookup.CardSkin
      return "Card Skin"
    else if cosmeticTypeId == CosmeticsTypeLookup.Scene
      return "Scene"
    else if cosmeticTypeId == CosmeticsTypeLookup.BattleMap
      return "Battle Map"
    else
      return null

  @nameForCosmeticChestType: (cosmeticCrateType)->
    if cosmeticCrateType == CosmeticsChestTypeLookup.Common
      return i18next.t("rarity.rarity_common")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Rare
      return i18next.t("rarity.rarity_rare")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Epic
      return i18next.t("rarity.rarity_epic")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Boss
      return i18next.t("mystery_crates.boss_crate_adjective")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Frostfire
      return i18next.t("mystery_crates.frostfire_adjective")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.FrostfirePremium
      return i18next.t("mystery_crates.frostfire_premium_adjective")
    else
      return i18next.t("mystery_crates.gift_crate_adjective")

  @keySKUForCosmeticChestType: (cosmeticCrateType)->
    if cosmeticCrateType == CosmeticsChestTypeLookup.Common
      return "Common_Chest_Key"
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Rare
      return "Rare_Chest_Key"
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Epic
      return "Epic_Chest_Key"
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Boss
      return "Boss_Chest_Key"
    else
      console.warn "Invalid cosmetic chest type provided to CosmeticsFactory.keySKUForCosmeticChestType"
      return "Invalid_Chest_Key"

  @descriptionForCosmeticChestType: (cosmeticCrateType)->
    if cosmeticCrateType == CosmeticsChestTypeLookup.Common
      return [
        i18next.t("cosmetics.common_mystery_crate_1"),
        i18next.t("cosmetics.common_mystery_crate_2")
      ].join("\n")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Rare
      return [
        i18next.t("cosmetics.rare_mystery_crate_1"),
        i18next.t("cosmetics.rare_mystery_crate_2")
      ].join("\n")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Epic
      return [
        i18next.t("cosmetics.epic_mystery_crate_1"),
        i18next.t("cosmetics.epic_mystery_crate_2")
      ].join("\n")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Boss
      return [
        i18next.t("cosmetics.boss_crate_1"),
        i18next.t("cosmetics.boss_crate_2"),
        i18next.t("cosmetics.boss_crate_3"),
        i18next.t("cosmetics.boss_crate_4")
      ].join("\n")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.Frostfire
      return i18next.t("cosmetics.frostfire_crate")
    else if cosmeticCrateType == CosmeticsChestTypeLookup.FrostfirePremium
      return i18next.t("cosmetics.frostfire_premium_crate")
    else
      return i18next.t("cosmetics.generic_mystery_crate")

# setup emote data
cos = CosmeticsFactory._cosmeticsById

###
EXAMPLE:

cos[CosmeticsLookup.CardBacks.Shiny] = {
  id: CosmeticsLookup.CardBacks.Shiny # id of cosmetic that maps to cosmetics lookup
  enabled: true # whether cosmetic is enabled globally
  alwaysVisible: true # whether cosmetic is always visible to the user, whether they own it or not
  availableAt: moment.utc("2016-12-25").valueOf() # Optional
  factionId: Factions.Faction1 # if this cosmetic is limited to a faction # Optional
  generalId: Cards.Faction1.AltGeneral
  img: RSX.emote_basic_happy.img # img to use for showing emote
  label: "Hello" # text to use for text only emotes
  order: 0 # sorting order of cosmetic (shows in ascending order, i.e. all 0s, then all 1s)
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  subType: "Shiny" # Any string identifier, shown as the sub category in shop
  sku: "emote-200" # This is autogenerated, ctrl f: "Generate skus procedurally"
  chestType: CosmeticsChestTypeLookup.Common # TODO: is chest it unlocks in == rarity?
  rarityId: Rarity.Common
  rewardOrder: 0 # Rewards of a lower number (within a rarity) are always rewarded first from loot crates, defaults to 0
}
###

# region COSMETICS ORDERING

ORDER_EMOTES = 0
ORDER_CARD_BACKS = 1
ORDER_PROFILE_ICONS = 0
ORDER_MAIN_MENU_PLATES = 1
ORDER_CARD_SKINS = 2
ORDER_SCENES = 0

# endregion COSMETICS ORDERING

# region EMOTE ORDERING

EMOTE_ORDER_HAPPY = 0
EMOTE_ORDER_ANGRY = 1
EMOTE_ORDER_CONFUSED = 2
EMOTE_ORDER_SAD = 3
EMOTE_ORDER_TAUNT = 4 # wink
EMOTE_ORDER_KISS = 5 # love
EMOTE_ORDER_FRUSTRATED = 6
EMOTE_ORDER_SURPRISED = 7
EMOTE_ORDER_BOW = 8
EMOTE_ORDER_SLEEP = 9
EMOTE_ORDER_SUNGLASSES = 10
EMOTE_ORDER_CUSTOM = 11

# endregion EMOTE ORDERING

# region Cosmetics datas

# Shorthand the cosmetics lookups
cl = CosmeticsLookup
CardBack = cl.CardBack
Emote = cl.Emote
ProfileIcon = cl.ProfileIcon
CardSkin = cl.CardSkin
Scene = cl.Scene
BattleMap = cl.BattleMap

# region Scenes

cos[Scene.MagaariEmberHighlands] = {
  id: Scene.MagaariEmberHighlands
  typeId: CosmeticsTypeLookup.Scene
  name: i18next.t("cosmetics.scene_magaari_name")
  shopDescription: i18next.t("cosmetics.scene_magaari_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Fixed
  pkgId: "MagaariEmberHighlands"
  img: null # TODO
  rsx: null # TODO
  unlockable: false
  purchasable: false
}

cos[Scene.ObsidianWoods] = {
  id: Scene.ObsidianWoods
  typeId: CosmeticsTypeLookup.Scene
  name: i18next.t("cosmetics.scene_obsidian_woods_name")
  shopDescription: i18next.t("cosmetics.scene_obsidian_woods_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Fixed
  pkgId: "ObsidianWoods"
  img: null # TODO
  rsx: null # TODO
  unlockable: false
  purchasable: false
}

cos[Scene.Frostfire] = {
  id: Scene.Frostfire
  typeId: CosmeticsTypeLookup.Scene
  name: i18next.t("cosmetics.scene_frostfire_festival_name")
  shopDescription: i18next.t("cosmetics.scene_frostfire_festival_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Fixed
  pkgId: "FrostfireMainMenu"
  img: null # TODO
  rsx: null # TODO
  unlockable: false
  purchasable: false
}

cos[Scene.Vetruvian] = {
  id: Scene.Vetruvian
  typeId: CosmeticsTypeLookup.Scene
  name: i18next.t("cosmetics.scene_city_of_kaero_name")
  shopDescription: i18next.t("cosmetics.scene_city_of_kaero_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Fixed
  pkgId: "VetruvianMainMenu"
  img: null # TODO
  rsx: null # TODO
  unlockable: false
  purchasable: false
}

cos[Scene.Shimzar] = {
  id: Scene.Shimzar
  typeId: CosmeticsTypeLookup.Scene
  name: i18next.t("cosmetics.scene_unearthed_prophecy_name")
  shopDescription: i18next.t("cosmetics.scene_unearthed_prophecy_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Fixed
  pkgId: "ShimzarMainMenu"
  img: null # TODO
  rsx: null # TODO
  unlockable: false
  purchasable: false
}

# endregion Scenes

# region Card Skins

cos[CardSkin.Faction1GeneralTier2] = {
  id: CardSkin.Faction1GeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_argeon_m2_name")
  shopDescription: i18next.t("cosmetics.skin_argeon_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f1GeneralTier2GIF.img
  rsx: RSX.f1GeneralTier2GIF
  factionId: Factions.Faction1
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction1.General
  skinNum: 1
  animResource: {
    breathing: RSX.f1GeneralTier2Breathing.name
    idle: RSX.f1GeneralTier2Idle.name
    walk: RSX.f1GeneralTier2Run.name
    attack: RSX.f1GeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.5
    damage: RSX.f1GeneralTier2Damage.name
    death: RSX.f1GeneralTier2Death.name
    castStart: RSX.f1GeneralTier2CastStart.name
    castEnd: RSX.f1GeneralTier2CastEnd.name
    castLoop: RSX.f1GeneralTier2CastLoop.name
    cast: RSX.f1GeneralTier2Cast.name
  }
}

cos[CardSkin.Faction1GeneralRogueLegacy] = {
  id: CardSkin.Faction1GeneralRogueLegacy
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_rogue_legacy_name")
  shopDescription: i18next.t("cosmetics.skin_rogue_legacy_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  img: RSX.f1GeneralRogueLegacyGIF.img
  rsx: RSX.f1GeneralRogueLegacyGIF
  factionId: Factions.Faction1
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Faction1.General
  skinNum: 2
  animResource: {
    breathing: RSX.f1GeneralRogueLegacyBreathing.name
    idle: RSX.f1GeneralRogueLegacyIdle.name
    walk: RSX.f1GeneralRogueLegacyRun.name
    attack: RSX.f1GeneralRogueLegacyAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.5
    damage: RSX.f1GeneralRogueLegacyDamage.name
    death: RSX.f1GeneralRogueLegacyDeath.name
    castStart: RSX.f1GeneralRogueLegacyCastStart.name
    castEnd: RSX.f1GeneralRogueLegacyCastEnd.name
    castLoop: RSX.f1GeneralRogueLegacyCastLoop.name
    cast: RSX.f1GeneralRogueLegacyCast.name
  }
}

cos[CardSkin.Faction1AltGeneralTier2] = {
  id: CardSkin.Faction1AltGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_ziran_m2_name")
  shopDescription: i18next.t("cosmetics.skin_ziran_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f1AltGeneralTier2GIF.img
  rsx: RSX.f1AltGeneralTier2GIF
  factionId: Factions.Faction1
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction1.AltGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f1AltGeneralTier2Breathing.name
    idle : RSX.f1AltGeneralTier2Idle.name
    walk : RSX.f1AltGeneralTier2Run.name
    attack : RSX.f1AltGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.5
    damage : RSX.f1AltGeneralTier2Hit.name
    death : RSX.f1AltGeneralTier2Death.name
    castStart : RSX.f1AltGeneralTier2CastStart.name
    castEnd : RSX.f1AltGeneralTier2CastEnd.name
    castLoop : RSX.f1AltGeneralTier2CastLoop.name
    cast : RSX.f1AltGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction1IVGeneralTier2] = {
  id: CardSkin.Faction1IVGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_brome_m2_name")
  shopDescription: i18next.t("cosmetics.skin_brome_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f1IVGeneralTier2GIF.img
  rsx: RSX.f1IVGeneralTier2GIF
  factionId: Factions.Faction1
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction1.ThirdGeneral
  skinNum: 1
  animResource: {
    breathing: RSX.f1IVGeneralTier2Breathing.name
    idle: RSX.f1IVGeneralTier2Idle.name
    walk: RSX.f1IVGeneralTier2Run.name
    attack: RSX.f1IVGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.5
    damage: RSX.f1IVGeneralTier2Damage.name
    death: RSX.f1IVGeneralTier2Death.name
    castStart: RSX.f1IVGeneralTier2CastStart.name
    castEnd: RSX.f1IVGeneralTier2CastEnd.name
    castLoop: RSX.f1IVGeneralTier2CastLoop.name
    cast: RSX.f1IVGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction2GeneralTier2] = {
  id: CardSkin.Faction2GeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_kaleos_m2_name")
  shopDescription: i18next.t("cosmetics.skin_kaleos_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f2GeneralTier2GIF.img
  rsx: RSX.f2GeneralTier2GIF
  factionId: Factions.Faction2
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction2.General
  skinNum: 1
  animResource: {
    breathing : RSX.f2GeneralTier2Breathing.name
    idle : RSX.f2GeneralTier2Idle.name
    walk : RSX.f2GeneralTier2Run.name
    attack : RSX.f2GeneralTier2Attack.name
    attackReleaseDelay: 0.2
    attackDelay: 0.5
    damage : RSX.f2GeneralTier2Damage.name
    death : RSX.f2GeneralTier2Death.name
    castStart : RSX.f2GeneralTier2CastStart.name
    castEnd : RSX.f2GeneralTier2CastEnd.name
    castLoop : RSX.f2GeneralTier2CastLoop.name
    cast : RSX.f2GeneralTier2Cast.name
  }
}

cos[CardSkin.Faction2GeneralDogehai] = {
  id: CardSkin.Faction2GeneralDogehai
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_dogehai_name")
  shopDescription: i18next.t("cosmetics.skin_dogehai_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  img: RSX.f2GeneralDogehaiGIF.img
  rsx: RSX.f2GeneralDogehaiGIF
  factionId: Factions.Faction2
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Faction2.General
  skinNum: 2
  animResource: {
    breathing : RSX.f2GeneralDogehaiBreathing.name
    idle : RSX.f2GeneralDogehaiIdle.name
    walk : RSX.f2GeneralDogehaiRun.name
    attack : RSX.f2GeneralDogehaiAttack.name
    attackReleaseDelay: 0.2
    attackDelay: 0.5
    damage : RSX.f2GeneralDogehaiDamage.name
    death : RSX.f2GeneralDogehaiDeath.name
    castStart : RSX.f2GeneralDogehaiCastStart.name
    castEnd : RSX.f2GeneralDogehaiCastEnd.name
    castLoop : RSX.f2GeneralDogehaiCastLoop.name
    cast : RSX.f2GeneralDogehaiCast.name
  }
}

cos[CardSkin.Faction2AltGeneralTier2] = {
  id: CardSkin.Faction2AltGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_reva_m2_name")
  shopDescription: i18next.t("cosmetics.skin_reva_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f2AltGeneralTier2GIF.img
  rsx: RSX.f2AltGeneralTier2GIF
  factionId: Factions.Faction2
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction2.AltGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f2AltGeneralTier2Breathing.name
    idle : RSX.f2AltGeneralTier2Idle.name
    walk : RSX.f2AltGeneralTier2Run.name
    attack : RSX.f2AltGeneralTier2Attack.name
    attackReleaseDelay: 0.2
    attackDelay: 1.0
    damage : RSX.f2AltGeneralTier2Hit.name
    death : RSX.f2AltGeneralTier2Death.name
    castStart : RSX.f2AltGeneralTier2CastStart.name
    castEnd : RSX.f2AltGeneralTier2CastEnd.name
    castLoop : RSX.f2AltGeneralTier2CastLoop.name
    cast : RSX.f2AltGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction2IVGeneralTier2] = {
  id: CardSkin.Faction2IVGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_shidai_m2_name")
  shopDescription: i18next.t("cosmetics.skin_shidai_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f2IVGeneralTier2GIF.img
  rsx: RSX.f2IVGeneralTier2GIF
  factionId: Factions.Faction2
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction2.ThirdGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f2IVGeneralTier2Breathing.name
    idle : RSX.f2IVGeneralTier2Idle.name
    walk : RSX.f2IVGeneralTier2Run.name
    attack : RSX.f2IVGeneralTier2Attack.name
    attackReleaseDelay: 0.2
    attackDelay: 0.5
    damage : RSX.f2IVGeneralTier2Damage.name
    death : RSX.f2IVGeneralTier2Death.name
    castStart : RSX.f2IVGeneralTier2CastStart.name
    castEnd : RSX.f2IVGeneralTier2CastEnd.name
    castLoop : RSX.f2IVGeneralTier2CastLoop.name
    cast : RSX.f2IVGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction3GeneralTier2] = {
  id: CardSkin.Faction3GeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_zirix_m2_name")
  shopDescription: i18next.t("cosmetics.skin_zirix_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f3GeneralTier2GIF.img
  rsx: RSX.f3GeneralTier2GIF
  factionId: Factions.Faction3
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction3.General
  skinNum: 1
  animResource: {
    breathing : RSX.f3GeneralTier2Breathing.name
    idle : RSX.f3GeneralTier2Idle.name
    walk : RSX.f3GeneralTier2Run.name
    attack : RSX.f3GeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.2
    damage : RSX.f3GeneralTier2Damage.name
    death : RSX.f3GeneralTier2Death.name
    castStart : RSX.f3GeneralTier2CastStart.name
    castEnd : RSX.f3GeneralTier2CastEnd.name
    castLoop : RSX.f3GeneralTier2CastLoop.name
    cast : RSX.f3GeneralTier2Cast.name
  }
}

cos[CardSkin.Faction3GeneralFestive] = {
  id: CardSkin.Faction3GeneralFestive
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_zirix_festive_name")
  shopDescription: i18next.t("cosmetics.skin_zirix_festive_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Festive"
  img: RSX.f3GeneralFestiveGIF.img
  rsx: RSX.f3GeneralFestiveGIF
  factionId: Factions.Faction3
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: true
  cardId: Cards.Faction3.General
  skinNum: 2
  animResource: {
    breathing : RSX.f3GeneralFestiveBreathing.name
    idle : RSX.f3GeneralFestiveIdle.name
    walk : RSX.f3GeneralFestiveRun.name
    attack : RSX.f3GeneralFestiveAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.2
    damage : RSX.f3GeneralFestiveDamage.name
    death : RSX.f3GeneralFestiveDeath.name
    castStart : RSX.f3GeneralFestiveCastStart.name
    castEnd : RSX.f3GeneralFestiveCastEnd.name
    castLoop : RSX.f3GeneralFestiveCastLoop.name
    cast : RSX.f3GeneralFestiveCast.name
  }
}

cos[CardSkin.Faction3AltGeneralTier2] = {
  id: CardSkin.Faction3AltGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_sajj_m2_name")
  shopDescription: i18next.t("cosmetics.skin_sajj_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f3AltGeneralTier2GIF.img
  rsx: RSX.f3AltGeneralTier2GIF
  factionId: Factions.Faction3
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction3.AltGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f3AltGeneralTier2Breathing.name
    idle : RSX.f3AltGeneralTier2Idle.name
    walk : RSX.f3AltGeneralTier2Run.name
    attack : RSX.f3AltGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.0
    damage : RSX.f3AltGeneralTier2Hit.name
    death : RSX.f3AltGeneralTier2Death.name
    castStart : RSX.f3AltGeneralTier2CastStart.name
    castEnd : RSX.f3AltGeneralTier2CastEnd.name
    castLoop : RSX.f3AltGeneralTier2CastLoop.name
    cast : RSX.f3AltGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction3IVGeneralTier2] = {
  id: CardSkin.Faction3IVGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_ciphyron_m2_name")
  shopDescription: i18next.t("cosmetics.skin_ciphyron_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f3IVGeneralTier2GIF.img
  rsx: RSX.f3IVGeneralTier2GIF
  factionId: Factions.Faction3
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction3.ThirdGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f3IVGeneralTier2Breathing.name
    idle : RSX.f3IVGeneralTier2Idle.name
    walk : RSX.f3IVGeneralTier2Run.name
    attack : RSX.f3IVGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.2
    damage : RSX.f3IVGeneralTier2Damage.name
    death : RSX.f3IVGeneralTier2Death.name
    castStart : RSX.f3IVGeneralTier2CastStart.name
    castEnd : RSX.f3IVGeneralTier2CastEnd.name
    castLoop : RSX.f3IVGeneralTier2CastLoop.name
    cast : RSX.f3IVGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction4GeneralTier2] = {
  id: CardSkin.Faction4GeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_lilithe_m2_name")
  shopDescription: i18next.t("cosmetics.skin_lilithe_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f4GeneralTier2GIF.img
  rsx: RSX.f4GeneralTier2GIF
  factionId: Factions.Faction4
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction4.General
  skinNum: 1
  animResource: {
    breathing : RSX.f4GeneralTier2Breathing.name
    idle : RSX.f4GeneralTier2Idle.name
    walk : RSX.f4GeneralTier2Run.name
    attack : RSX.f4GeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.5
    damage : RSX.f4GeneralTier2Damage.name
    death : RSX.f4GeneralTier2Death.name
    castStart : RSX.f4GeneralTier2CastStart.name
    castEnd : RSX.f4GeneralTier2CastEnd.name
    castLoop : RSX.f4GeneralTier2CastLoop.name
    cast : RSX.f4GeneralTier2Cast.name
  }
}

cos[CardSkin.Faction4AltGeneralTier2] = {
  id: CardSkin.Faction4AltGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_cassyva_m2_name")
  shopDescription: i18next.t("cosmetics.skin_cassyva_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f4AltGeneralTier2GIF.img
  rsx: RSX.f4AltGeneralTier2GIF
  factionId: Factions.Faction4
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction4.AltGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f4AltGeneralTier2Breathing.name
    idle : RSX.f4AltGeneralTier2Idle.name
    walk : RSX.f4AltGeneralTier2Run.name
    attack : RSX.f4AltGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.5
    damage : RSX.f4AltGeneralTier2Hit.name
    death : RSX.f4AltGeneralTier2Death.name
    castStart : RSX.f4AltGeneralTier2CastStart.name
    castEnd : RSX.f4AltGeneralTier2CastEnd.name
    castLoop : RSX.f4AltGeneralTier2CastLoop.name
    cast : RSX.f4AltGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction4IVGeneralTier2] = {
  id: CardSkin.Faction4IVGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_maehv_m2_name")
  shopDescription: i18next.t("cosmetics.skin_maehv_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f4IVGeneralTier2GIF.img
  rsx: RSX.f4IVGeneralTier2GIF
  factionId: Factions.Faction4
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction4.ThirdGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f4IVGeneralTier2Breathing.name
    idle : RSX.f4IVGeneralTier2Idle.name
    walk : RSX.f4IVGeneralTier2Run.name
    attack : RSX.f4IVGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.5
    damage : RSX.f4IVGeneralTier2Damage.name
    death : RSX.f4IVGeneralTier2Death.name
    castStart : RSX.f4IVGeneralTier2CastStart.name
    castEnd : RSX.f4IVGeneralTier2CastEnd.name
    castLoop : RSX.f4IVGeneralTier2CastLoop.name
    cast : RSX.f4IVGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction5GeneralTier2] = {
  id: CardSkin.Faction5GeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_vaath_m2_name")
  shopDescription: i18next.t("cosmetics.skin_vaath_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f5GeneralTier2GIF.img
  rsx: RSX.f5GeneralTier2GIF
  factionId: Factions.Faction5
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction5.General
  skinNum: 1
  animResource: {
    breathing : RSX.f5GeneralTier2Breathing.name
    idle : RSX.f5GeneralTier2Idle.name
    walk : RSX.f5GeneralTier2Run.name
    attack : RSX.f5GeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.65
    damage : RSX.f5GeneralTier2Damage.name
    death : RSX.f5GeneralTier2Death.name
    castStart : RSX.f5GeneralTier2CastStart.name
    castEnd : RSX.f5GeneralTier2CastEnd.name
    castLoop : RSX.f5GeneralTier2CastLoop.name
    cast : RSX.f5GeneralTier2Cast.name
  }
}

cos[CardSkin.Faction5AltGeneralTier2] = {
  id: CardSkin.Faction5AltGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_starhorn_m2_name")
  shopDescription: i18next.t("cosmetics.skin_starhorn_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f5AltGeneralTier2GIF.img
  rsx: RSX.f5AltGeneralTier2GIF
  factionId: Factions.Faction5
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction5.AltGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f5AltGeneralTier2Breathing.name
    idle : RSX.f5AltGeneralTier2Idle.name
    walk : RSX.f5AltGeneralTier2Run.name
    attack : RSX.f5AltGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.0
    damage : RSX.f5AltGeneralTier2Hit.name
    death : RSX.f5AltGeneralTier2Death.name
    castStart : RSX.f5AltGeneralTier2CastStart.name
    castEnd : RSX.f5AltGeneralTier2CastEnd.name
    castLoop : RSX.f5AltGeneralTier2CastLoop.name
    cast : RSX.f5AltGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction5IVGeneralTier2] = {
  id: CardSkin.Faction5IVGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_ragnora_m2_name")
  shopDescription: i18next.t("cosmetics.skin_ragnora_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f5IVGeneralTier2GIF.img
  rsx: RSX.f5IVGeneralTier2GIF
  factionId: Factions.Faction5
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction5.ThirdGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f5IVGeneralTier2Breathing.name
    idle : RSX.f5IVGeneralTier2Idle.name
    walk : RSX.f5IVGeneralTier2Run.name
    attack : RSX.f5IVGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.65
    damage : RSX.f5IVGeneralTier2Damage.name
    death : RSX.f5IVGeneralTier2Death.name
    castStart : RSX.f5IVGeneralTier2CastStart.name
    castEnd : RSX.f5IVGeneralTier2CastEnd.name
    castLoop : RSX.f5IVGeneralTier2CastLoop.name
    cast : RSX.f5IVGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction6GeneralTier2] = {
  id: CardSkin.Faction6GeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_faie_m2_name")
  shopDescription: i18next.t("cosmetics.skin_faie_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f6GeneralTier2GIF.img
  rsx: RSX.f6GeneralTier2GIF
  factionId: Factions.Faction6
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction6.General
  skinNum: 1
  animResource: {
    breathing : RSX.f6GeneralTier2Breathing.name
    idle : RSX.f6GeneralTier2Idle.name
    walk : RSX.f6GeneralTier2Run.name
    attack : RSX.f6GeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.65
    damage : RSX.f6GeneralTier2Damage.name
    death : RSX.f6GeneralTier2Death.name
    castStart : RSX.f6GeneralTier2CastStart.name
    castEnd : RSX.f6GeneralTier2CastEnd.name
    castLoop : RSX.f6GeneralTier2CastLoop.name
    cast : RSX.f6GeneralTier2Cast.name
  }
}

cos[CardSkin.Faction6GeneralFestive] = {
  id: CardSkin.Faction6GeneralFestive
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_faie_festive_name")
  shopDescription: i18next.t("cosmetics.skin_faie_festive_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Festive"
  img: RSX.f6GeneralFestiveGIF.img
  rsx: RSX.f6GeneralFestiveGIF
  factionId: Factions.Faction6
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: true
  cardId: Cards.Faction6.General
  skinNum: 2
  animResource: {
    breathing : RSX.f6GeneralFestiveBreathing.name
    idle : RSX.f6GeneralFestiveIdle.name
    walk : RSX.f6GeneralFestiveRun.name
    attack : RSX.f6GeneralFestiveAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.65
    damage : RSX.f6GeneralFestiveDamage.name
    death : RSX.f6GeneralFestiveDeath.name
    castStart : RSX.f6GeneralFestiveCastStart.name
    castEnd : RSX.f6GeneralFestiveCastEnd.name
    castLoop : RSX.f6GeneralFestiveCastLoop.name
    cast : RSX.f6GeneralFestiveCast.name
  }
}

cos[CardSkin.Faction6AltGeneralTier2] = {
  id: CardSkin.Faction6AltGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_kara_m2_name")
  shopDescription: i18next.t("cosmetics.skin_kara_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f6AltGeneralTier2GIF.img
  rsx: RSX.f6AltGeneralTier2GIF
  factionId: Factions.Faction6
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction6.AltGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f6AltGeneralTier2Breathing.name
    idle : RSX.f6AltGeneralTier2Idle.name
    walk : RSX.f6AltGeneralTier2Run.name
    attack : RSX.f6AltGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.2
    damage : RSX.f6AltGeneralTier2Hit.name
    death : RSX.f6AltGeneralTier2Death.name
    castStart : RSX.f6AltGeneralTier2CastStart.name
    castEnd : RSX.f6AltGeneralTier2CastEnd.name
    castLoop : RSX.f6AltGeneralTier2CastLoop.name
    cast : RSX.f6AltGeneralTier2Cast.name
  }
}

cos[CardSkin.Faction6IVGeneralTier2] = {
  id: CardSkin.Faction6IVGeneralTier2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_ilena_m2_name")
  shopDescription: i18next.t("cosmetics.skin_ilena_m2_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "MK2 Generals"
  img: RSX.f6IVGeneralTier2GIF.img
  rsx: RSX.f6IVGeneralTier2GIF
  factionId: Factions.Faction6
  rarityId: Rarity.Legendary
  unlockable: false
  purchasable: true
  cardId: Cards.Faction6.ThirdGeneral
  skinNum: 1
  animResource: {
    breathing : RSX.f6IVGeneralTier2Breathing.name
    idle : RSX.f6IVGeneralTier2Idle.name
    walk : RSX.f6IVGeneralTier2Run.name
    attack : RSX.f6IVGeneralTier2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.65
    damage : RSX.f6IVGeneralTier2Damage.name
    death : RSX.f6IVGeneralTier2Death.name
    castStart : RSX.f6IVGeneralTier2CastStart.name
    castEnd : RSX.f6IVGeneralTier2CastEnd.name
    castLoop : RSX.f6IVGeneralTier2CastLoop.name
    cast : RSX.f6IVGeneralTier2Cast.name
  }
}

cos[CardSkin.SarlacPrime] = {
  id: CardSkin.SarlacPrime
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_sarlac_prime_name")
  shopDescription: i18next.t("cosmetics.skin_sarlac_prime_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Neutral.SarlacTheEternal
  skinNum: 1
  animResource: {
    breathing : RSX.neutralSarlacPrimeBreathing.name
    idle : RSX.neutralSarlacPrimeIdle.name
    walk : RSX.neutralSarlacPrimeRun.name
    attack : RSX.neutralSarlacPrimeAttack.name
    attackReleaseDelay: 0.0
    attackDelay: .25
    damage : RSX.neutralSarlacPrimeHit.name
    death : RSX.neutralSarlacPrimeDeath.name
  }
}

cos[CardSkin.KeeperOfTheValue] = {
  id: CardSkin.KeeperOfTheValue
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_keeper_name")
  shopDescription: i18next.t("cosmetics.skin_keeper_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Neutral.KeeperOfTheVale
  skinNum: 1
  animResource: {
    breathing : RSX.neutralKeeperOfTheValueBreathing.name
    idle : RSX.neutralKeeperOfTheValueIdle.name
    walk : RSX.neutralKeeperOfTheValueRun.name
    attack : RSX.neutralKeeperOfTheValueAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.0
    damage : RSX.neutralKeeperOfTheValueHit.name
    death : RSX.neutralKeeperOfTheValueDeath.name
  }
}

cos[CardSkin.Darkjammer] = {
  id: CardSkin.Darkjammer
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_darkjammer_name")
  shopDescription: i18next.t("cosmetics.skin_darkjammer_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Neutral.Spelljammer
  skinNum: 1
  animResource: {
    breathing : RSX.neutralDarkjammerBreathing.name
    idle : RSX.neutralDarkjammerIdle.name
    walk : RSX.neutralDarkjammerRun.name
    attack : RSX.neutralDarkjammerAttack.name
    attackReleaseDelay: 0.0
    attackDelay: .9
    damage : RSX.neutralDarkjammerHit.name
    death : RSX.neutralDarkjammerDeath.name
  }
}

cos[CardSkin.FrostfireTiger] = {
  id: CardSkin.FrostfireTiger
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_frostfire_tiger_name")
  shopDescription: i18next.t("cosmetics.skin_frostfire_tiger_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Festive"
  img: RSX.neutralFrostfireTigerGIF.img
  rsx: RSX.neutralFrostfireTigerGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.SaberspineTiger
  skinNum: 1
  animResource: {
    breathing : RSX.neutralFrostfireTigerBreathing.name
    idle : RSX.neutralFrostfireTigerIdle.name
    walk : RSX.neutralFrostfireTigerRun.name
    attack : RSX.neutralFrostfireTigerAttack.name
    attackReleaseDelay: 0.0
    attackDelay: .4
    damage : RSX.neutralFrostfireTigerHit.name
    death : RSX.neutralFrostfireTigerDeath.name
  }
}

cos[CardSkin.FestiveSnowchaser] = {
  id: CardSkin.FestiveSnowchaser
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_festive_snowchaser_name")
  shopDescription: i18next.t("cosmetics.skin_festive_snowchaser_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Festive"
  img: RSX.f6FestiveSnowchaserGIF.img
  rsx: RSX.f6FestiveSnowchaserGIF
  factionId: Factions.Faction6
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: true
  cardId: Cards.Faction6.WyrBeast
  skinNum: 1
  animResource: {
    breathing : RSX.f6FestiveSnowchaserBreathing.name
    idle : RSX.f6FestiveSnowchaserIdle.name
    walk : RSX.f6FestiveSnowchaserRun.name
    attack : RSX.f6FestiveSnowchaserAttack.name
    attackReleaseDelay: 0.0
    attackDelay: .3
    damage : RSX.f6FestiveSnowchaserDamage.name
    death : RSX.f6FestiveSnowchaserDeath.name
  }
}

cos[CardSkin.ElyxMK2] = {
  id: CardSkin.ElyxMK2
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Elyx Stormblade MK2"
  shopDescription: "Elyx Stormblade MK2"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  factionId: Factions.Faction1
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Faction1.ElyxStormblade
  skinNum: 1
  animResource: {
    breathing : RSX.f1ElyxStormbladeMK2Breathing.name
    idle : RSX.f1ElyxStormbladeMK2Idle.name
    walk : RSX.f1ElyxStormbladeMK2Run.name
    attack : RSX.f1ElyxStormbladeMK2Attack.name
    attackReleaseDelay: 0.0
    attackDelay: .3
    damage : RSX.f1ElyxStormbladeMK2Hit.name
    death : RSX.f1ElyxStormbladeMK2Death.name
  }
}

cos[CardSkin.HealingMysticBN] = {
  id: CardSkin.HealingMysticBN
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Healing Mystic Bandai Namco"
  shopDescription: "Healing Mystic Bandai Namco"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Neutral.HealingMystic
  skinNum: 1
  animResource: {
    breathing : RSX.neutralHealingMysticBNBreathing.name
    idle : RSX.neutralHealingMysticBNIdle.name
    walk : RSX.neutralHealingMysticBNRun.name
    attack : RSX.neutralHealingMysticBNAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.9
    damage : RSX.neutralHealingMysticBNHit.name
    death : RSX.neutralHealingMysticBNDeath.name
  }
}

cos[CardSkin.HealingMysticTwitch] = {
  id: CardSkin.HealingMysticTwitch
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Healing Mystic Twitch"
  shopDescription: "Healing Mystic Twitch"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: false
  cardId: Cards.Neutral.HealingMystic
  skinNum: 2
  animResource: {
    breathing : RSX.neutralhealingMysticTwitchBreathing.name
    idle : RSX.neutralhealingMysticTwitchIdle.name
    walk : RSX.neutralhealingMysticTwitchRun.name
    attack : RSX.neutralhealingMysticTwitchAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 0.9
    damage : RSX.neutralhealingMysticTwitchHit.name
    death : RSX.neutralhealingMysticTwitchDeath.name
  }
}

cos[CardSkin.FestiveZyx] = {
  id: CardSkin.FestiveZyx
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: i18next.t("cosmetics.skin_zyx_festive_name")
  shopDescription: i18next.t("cosmetics.skin_zyx_festive_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Festive"
  img: RSX.neutralZyxFestiveGIF.img
  rsx: RSX.neutralZyxFestiveGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Legendary
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Zyx
  skinNum: 1
  animResource: {
    breathing : RSX.neutralZyxFestiveBreathing.name
    idle : RSX.neutralZyxFestiveIdle.name
    walk : RSX.neutralZyxFestiveRun.name
    attack : RSX.neutralZyxFestiveAttack.name
    attackReleaseDelay: 0.0
    attackDelay: .4
    damage : RSX.neutralZyxFestiveHit.name
    death : RSX.neutralZyxFestiveDeath.name
  }
}

cos[CardSkin.MirkbloodDevourerBoss] = {
  id: CardSkin.MirkbloodDevourerBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Mirkblood Devourer"
  shopDescription: "This skin was used in the Umbra boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.mirkbloodDevourerBossGIF.img
  rsx: RSX.mirkbloodDevourerBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.MirkbloodDevourer
  skinNum: 1
  animResource: {
    breathing : RSX.bossUmbraBreathing.name
    idle : RSX.bossUmbraIdle.name
    walk : RSX.bossUmbraRun.name
    attack : RSX.bossUmbraAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossUmbraHit.name
    death : RSX.bossUmbraDeath.name
  }
}

cos[CardSkin.DreadnoughtBoss] = {
  id: CardSkin.DreadnoughtBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Dreadnought"
  shopDescription: "This skin was used in the Boreal Juggernaut boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.dreadnoughtBossGIF.img
  rsx: RSX.dreadnoughtBossGIF
  factionId: Factions.Magmar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction5.Dreadnaught
  skinNum: 1
  animResource: {
    breathing : RSX.bossBorealJuggernautBreathing.name
    idle : RSX.bossBorealJuggernautIdle.name
    walk : RSX.bossBorealJuggernautRun.name
    attack : RSX.bossBorealJuggernautAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossBorealJuggernautHit.name
    death : RSX.bossBorealJuggernautDeath.name
  }
}

cos[CardSkin.IroncladBoss] = {
  id: CardSkin.IroncladBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Ironclad"
  shopDescription: "This skin was used in the Cade the Desolator boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.ironcladBossGIF.img
  rsx: RSX.ironcladBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Ironclad
  skinNum: 1
  animResource: {
    breathing : RSX.bossChaosKnightBreathing.name
    idle : RSX.bossChaosKnightIdle.name
    walk : RSX.bossChaosKnightRun.name
    attack : RSX.bossChaosKnightAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossChaosKnightHit.name
    death : RSX.bossChaosKnightDeath.name
  }
}

cos[CardSkin.ZendoBoss] = {
  id: CardSkin.ZendoBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Grandmaster Zendo"
  shopDescription: "This skin was used in the Shinkage Zendo boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.zendoBossGIF.img
  rsx: RSX.zendoBossGIF
  factionId: Factions.Songhai
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction2.GrandmasterZendo
  skinNum: 1
  animResource: {
    breathing : RSX.bossShinkageZendoBreathing.name
    idle : RSX.bossShinkageZendoIdle.name
    walk : RSX.bossShinkageZendoRun.name
    attack : RSX.bossShinkageZendoAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossShinkageZendoHit.name
    death : RSX.bossShinkageZendoDeath.name
  }
}

cos[CardSkin.Z0rBoss] = {
  id: CardSkin.Z0rBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Z0r"
  shopDescription: "This skin was used in the D3cepticle boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.z0rBossGIF.img
  rsx: RSX.z0rBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Z0r
  skinNum: 1
  animResource: {
    breathing : RSX.bossDecepticleBreathing.name
    idle : RSX.bossDecepticleIdle.name
    walk : RSX.bossDecepticleRun.name
    attack : RSX.bossDecepticleAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossDecepticleHit.name
    death : RSX.bossDecepticleDeath.name
  }
}

cos[CardSkin.Mechaz0rChassisBoss] = {
  id: CardSkin.Mechaz0rChassisBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Chassis of Mechaz0r"
  shopDescription: "This skin was used in the D3cepticle boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.mechaz0rChassisBossGIF.img
  rsx: RSX.mechaz0rChassisBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Mechaz0rChassis
  skinNum: 1
  animResource: {
    breathing : RSX.bossDecepticleChassisBreathing.name
    idle : RSX.bossDecepticleChassisIdle.name
    walk : RSX.bossDecepticleChassisRun.name
    attack : RSX.bossDecepticleChassisAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossDecepticleChassisHit.name
    death : RSX.bossDecepticleChassisDeath.name
  }
}

cos[CardSkin.Mechaz0rHelmBoss] = {
  id: CardSkin.Mechaz0rHelmBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Helm of Mechaz0r"
  shopDescription: "This skin was used in the D3cepticle boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.mechaz0rHelmBossGIF.img
  rsx: RSX.mechaz0rHelmBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Mechaz0rHelm
  skinNum: 1
  animResource: {
    breathing : RSX.bossDecepticleHelmBreathing.name
    idle : RSX.bossDecepticleHelmIdle.name
    walk : RSX.bossDecepticleHelmRun.name
    attack : RSX.bossDecepticleHelmAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossDecepticleHelmHit.name
    death : RSX.bossDecepticleHelmDeath.name
  }
}

cos[CardSkin.AlterRexxBoss] = {
  id: CardSkin.AlterRexxBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Alter Rexx"
  shopDescription: "This skin was used in the D3cepticle boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.alterRexxBossGIF.img
  rsx: RSX.alterRexxBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.AlterRexx
  skinNum: 1
  animResource: {
    breathing : RSX.bossDecepticlePrimeBreathing.name
    idle : RSX.bossDecepticlePrimeIdle.name
    walk : RSX.bossDecepticlePrimeRun.name
    attack : RSX.bossDecepticlePrimeAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossDecepticlePrimeHit.name
    death : RSX.bossDecepticlePrimeDeath.name
  }
}

cos[CardSkin.Mechaz0rSwordBoss] = {
  id: CardSkin.Mechaz0rSwordBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Sword of Mechaz0r"
  shopDescription: "This skin was used in the D3cepticle boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.mechaz0rSwordBossGIF.img
  rsx: RSX.mechaz0rSwordBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Mechaz0rSword
  skinNum: 1
  animResource: {
    breathing : RSX.bossDecepticleSwordBreathing.name
    idle : RSX.bossDecepticleSwordIdle.name
    walk : RSX.bossDecepticleSwordRun.name
    attack : RSX.bossDecepticleSwordAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossDecepticleSwordHit.name
    death : RSX.bossDecepticleSwordDeath.name
  }
}

cos[CardSkin.Mechaz0rWingsBoss] = {
  id: CardSkin.Mechaz0rWingsBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Wings of Mechaz0r"
  shopDescription: "This skin was used in the D3cepticle boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.mechaz0rWingsBossGIF.img
  rsx: RSX.mechaz0rWingsBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Mechaz0rWings
  skinNum: 1
  animResource: {
    breathing : RSX.bossDecepticleWingsBreathing.name
    idle : RSX.bossDecepticleWingsIdle.name
    walk : RSX.bossDecepticleWingsRun.name
    attack : RSX.bossDecepticleWingsAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossDecepticleWingsHit.name
    death : RSX.bossDecepticleWingsDeath.name
  }
}

cos[CardSkin.ZukongBoss] = {
  id: CardSkin.ZukongBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Zukong"
  shopDescription: "This skin was used in the Wu'jin the Trickster boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.zukongBossGIF.img
  rsx: RSX.zukongBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Zukong
  skinNum: 1
  animResource: {
    breathing : RSX.bossWujinBreathing.name
    idle : RSX.bossWujinIdle.name
    walk : RSX.bossWujinRun.name
    attack : RSX.bossWujinAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossWujinHit.name
    death : RSX.bossWujinDeath.name
  }
}

cos[CardSkin.WartalonBoss] = {
  id: CardSkin.WartalonBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "War Talon"
  shopDescription: "This skin was used in the Solfist boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.wartalonBossGIF.img
  rsx: RSX.wartalonBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.WarTalon
  skinNum: 1
  animResource: {
    breathing : RSX.bossSolfistBreathing.name
    idle : RSX.bossSolfistIdle.name
    walk : RSX.bossSolfistRun.name
    attack : RSX.bossSolfistAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSolfistHit.name
    death : RSX.bossSolfistDeath.name
  }
}

cos[CardSkin.EMPBoss] = {
  id: CardSkin.EMPBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "EMP"
  shopDescription: "This skin was used in the Automaton 8 boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.empBossGIF.img
  rsx: RSX.empBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.EMP
  skinNum: 1
  animResource: {
    breathing : RSX.bossEMPBreathing.name
    idle : RSX.bossEMPIdle.name
    walk : RSX.bossEMPRun.name
    attack : RSX.bossEMPAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossEMPHit.name
    death : RSX.bossEMPDeath.name
  }
}

cos[CardSkin.ArchonBoss] = {
  id: CardSkin.ArchonBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Archon Spellbinder"
  shopDescription: "This skin was used in the Orias the Heretic boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.archonBossGIF.img
  rsx: RSX.archonBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.ArchonSpellbinder
  skinNum: 1
  animResource: {
    breathing : RSX.bossOriasBreathing.name
    idle : RSX.bossOriasIdle.name
    walk : RSX.bossOriasRun.name
    attack : RSX.bossOriasAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossOriasHit.name
    death : RSX.bossOriasDeath.name
  }
}

cos[CardSkin.BastionBoss] = {
  id: CardSkin.BastionBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Bastion"
  shopDescription: "This skin was used in the Orias the Heretic boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.bastionBossGIF.img
  rsx: RSX.bastionBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Bastion
  skinNum: 1
  animResource: {
    breathing : RSX.bossOriasIdolBreathing.name
    idle : RSX.bossOriasIdolIdle.name
    walk : RSX.bossOriasIdolRun.name
    attack : RSX.bossOriasIdolAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossOriasIdolHit.name
    death : RSX.bossOriasIdolDeath.name
  }
}

cos[CardSkin.HighHandBoss] = {
  id: CardSkin.HighHandBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "The High Hand"
  shopDescription: "This skin was used in the Malyk boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.highHandBossGIF.img
  rsx: RSX.highHandBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.TheHighHand
  skinNum: 1
  animResource: {
    breathing : RSX.bossMalykBreathing.name
    idle : RSX.bossMalykIdle.name
    walk : RSX.bossMalykRun.name
    attack : RSX.bossMalykAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossMalykHit.name
    death : RSX.bossMalykDeath.name
  }
}

cos[CardSkin.BlackSolusBoss] = {
  id: CardSkin.BlackSolusBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Black solus"
  shopDescription: "This skin was used in the Archonis boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.blackSolusBossGIF.img
  rsx: RSX.blackSolusBossGIF
  factionId: Factions.Abyssian
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction4.BlackSolus
  skinNum: 1
  animResource: {
    breathing : RSX.bossManaManBreathing.name
    idle : RSX.bossManaManIdle.name
    walk : RSX.bossManaManRun.name
    attack : RSX.bossManaManAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossManaManDamage.name
    death : RSX.bossManaManDeath.name
  }
}

cos[CardSkin.CalculatorBoss] = {
  id: CardSkin.CalculatorBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Calculator"
  shopDescription: "This skin was used in the Paragon of Light boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.calculatorBossGIF.img
  rsx: RSX.calculatorBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Calculator
  skinNum: 1
  animResource: {
    breathing : RSX.bossParagonBreathing.name
    idle : RSX.bossParagonIdle.name
    walk : RSX.bossParagonRun.name
    attack : RSX.bossParagonAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossParagonHit.name
    death : RSX.bossParagonDeath.name
  }
}

cos[CardSkin.ChakkramBoss] = {
  id: CardSkin.ChakkramBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Chakkram"
  shopDescription: "This skin was used in the Scion of the Void boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.chakkramBossGIF.img
  rsx: RSX.chakkramBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Chakkram
  skinNum: 1
  animResource: {
    breathing : RSX.bossVampireBreathing.name
    idle : RSX.bossVampireIdle.name
    walk : RSX.bossVampireRun.name
    attack : RSX.bossVampireAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossVampireHit.name
    death : RSX.bossVampireDeath.name
  }
}

cos[CardSkin.KronBoss] = {
  id: CardSkin.KronBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Inquisitor Kron"
  shopDescription: "This skin was used in the High Templar Kron boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.kronBossGIF.img
  rsx: RSX.kronBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.InquisitorKron
  skinNum: 1
  animResource: {
    breathing : RSX.bossKronBreathing.name
    idle : RSX.bossKronIdle.name
    walk : RSX.bossKronRun.name
    attack : RSX.bossKronAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossKronHit.name
    death : RSX.bossKronDeath.name
  }
}

cos[CardSkin.MeltdownBoss] = {
  id: CardSkin.MeltdownBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Meltdown"
  shopDescription: "This skin was used in the Megapenti boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.meltdownBossGIF.img
  rsx: RSX.meltdownBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Meltdown
  skinNum: 1
  animResource: {
    breathing : RSX.bossSerpentiBreathing.name
    idle : RSX.bossSerpentiIdle.name
    walk : RSX.bossSerpentiRun.name
    attack : RSX.bossSerpentiAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSerpentiHit.name
    death : RSX.bossSerpentiDeath.name
  }
}

cos[CardSkin.ArcaneDevourerBoss] = {
  id: CardSkin.ArcaneDevourerBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Arcane Devourer"
  shopDescription: "This skin was used in the Rin the Shadowsworn boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.arcaneDevourerBossGIF.img
  rsx: RSX.arcaneDevourerBossGIF
  factionId: Factions.Faction4
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction4.ArcaneDevourer
  skinNum: 1
  animResource: {
    breathing : RSX.bossWraithBreathing.name
    idle : RSX.bossWraithIdle.name
    walk : RSX.bossWraithRun.name
    attack : RSX.bossWraithAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossWraithHit.name
    death : RSX.bossWraithDeath.name
  }
}

cos[CardSkin.TrinityWingBoss] = {
  id: CardSkin.TrinityWingBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Trinity Wing"
  shopDescription: "This skin was used in the Skfall Tyrant boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.trinityWingBossGIF.img
  rsx: RSX.trinityWingBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.TrinityWing
  skinNum: 1
  animResource: {
    breathing : RSX.bossSkyfallTyrantBreathing.name
    idle : RSX.bossSkyfallTyrantIdle.name
    walk : RSX.bossSkyfallTyrantRun.name
    attack : RSX.bossSkyfallTyrantAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSkyfallTyrantHit.name
    death : RSX.bossSkyfallTyrantDeath.name
  }
}

cos[CardSkin.FuriosaBoss] = {
  id: CardSkin.FuriosaBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Furiosa"
  shopDescription: "This skin was used in the Cindera boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.furiosaBossGIF.img
  rsx: RSX.furiosaBossGIF
  factionId: Factions.Abyssian
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction4.Furosa
  skinNum: 1
  animResource: {
    breathing : RSX.bossCinderaBreathing.name
    idle : RSX.bossCinderaIdle.name
    walk : RSX.bossCinderaRun.name
    attack : RSX.bossCinderaAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossCinderaHit.name
    death : RSX.bossCinderaDeath.name
  }
}

cos[CardSkin.ArclyteSentinelBoss] = {
  id: CardSkin.ArclyteSentinelBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Arclyte Sentinel"
  shopDescription: "This skin was used in the Crystalline Champion boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.arclyteSentinelBossGIF.img
  rsx: RSX.arclyteSentinelBossGIF
  factionId: Factions.Lyonar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction1.ArclyteSentinel
  skinNum: 1
  animResource: {
    breathing : RSX.bossCrystalBreathing.name
    idle : RSX.bossCrystalIdle.name
    walk : RSX.bossCrystalRun.name
    attack : RSX.bossCrystalAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossCrystalDamage.name
    death : RSX.bossCrystalDeath.name
  }
}

cos[CardSkin.RancourBoss] = {
  id: CardSkin.RancourBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Rancour"
  shopDescription: "This skin was used in the Xel boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.rancourBossGIF.img
  rsx: RSX.rancourBossGIF
  factionId: Factions.Magmar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction5.Rancour
  skinNum: 1
  animResource: {
    breathing : RSX.bossAntiswarmBreathing.name
    idle : RSX.bossAntiswarmIdle.name
    walk : RSX.bossAntiswarmRun.name
    attack : RSX.bossAntiswarmAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossAntiswarmHit.name
    death : RSX.bossAntiswarmDeath.name
  }
}

cos[CardSkin.SwornAvengerBoss] = {
  id: CardSkin.SwornAvengerBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Sworn Avenger"
  shopDescription: "This skin was used in the Skurge boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.swornAvengerBossGIF.img
  rsx: RSX.swornAvengerBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.SwornAvenger
  skinNum: 1
  animResource: {
    breathing : RSX.bossSkurgeBreathing.name
    idle : RSX.bossSkurgeIdle.name
    walk : RSX.bossSkurgeRun.name
    attack : RSX.bossSkurgeAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSkurgeHit.name
    death : RSX.bossSkurgeDeath.name
  }
}

cos[CardSkin.SwornDefenderBoss] = {
  id: CardSkin.SwornDefenderBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Sworn Defender"
  shopDescription: "This skin was used in the Skurge boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.swornDefenderBossGIF.img
  rsx: RSX.swornDefenderBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.SwornDefender
  skinNum: 1
  animResource: {
    breathing : RSX.bossValiantBreathing.name
    idle : RSX.bossValiantIdle.name
    walk : RSX.bossValiantRun.name
    attack : RSX.bossValiantAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossValiantHit.name
    death : RSX.bossValiantDeath.name
  }
}

cos[CardSkin.QuartermasterGaujBoss] = {
  id: CardSkin.QuartermasterGaujBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Quartermaster Gauj"
  shopDescription: "This skin was used in the Shadow Lord boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.quartermasterGaujBossGIF.img
  rsx: RSX.quartermasterGaujBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.QuartermasterGauj
  skinNum: 1
  animResource: {
    breathing : RSX.bossShadowLordBreathing.name
    idle : RSX.bossShadowLordIdle.name
    walk : RSX.bossShadowLordRun.name
    attack : RSX.bossShadowLordAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossShadowLordHit.name
    death : RSX.bossShadowLordDeath.name
  }
}

cos[CardSkin.AlabasterTitanBoss] = {
  id: CardSkin.AlabasterTitanBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Alabaster Titan"
  shopDescription: "This skin was used in the Archmagus Vol boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.alabasterTitanBossGIF.img
  rsx: RSX.alabasterTitanBossGIF
  factionId: Factions.Lyonar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction1.AlabasterTitan
  skinNum: 1
  animResource: {
    breathing : RSX.bossGolBreathing.name
    idle : RSX.bossGolIdle.name
    walk : RSX.bossGolRun.name
    attack : RSX.bossGolAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossGolHit.name
    death : RSX.bossGolDeath.name
  }
}

cos[CardSkin.RadiantDragoonBoss] = {
  id: CardSkin.RadiantDragoonBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Radiant Dragoon"
  shopDescription: "This skin was used in the Archmagus Vol boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.radiantDragoonBossGIF.img
  rsx: RSX.radiantDragoonBossGIF
  factionId: Factions.Lyonar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction1.RadiantDragoon
  skinNum: 1
  animResource: {
    breathing : RSX.bossKaneBreathing.name
    idle : RSX.bossKaneIdle.name
    walk : RSX.bossKaneRun.name
    attack : RSX.bossKaneAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossKaneHit.name
    death : RSX.bossKaneDeath.name
  }
}

cos[CardSkin.TethermancerBoss] = {
  id: CardSkin.TethermancerBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Tethermancer"
  shopDescription: "This skin was used in the Taskmaster Beatrix boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.tethermancerBossGIF.img
  rsx: RSX.tethermancerBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Tethermancer
  skinNum: 1
  animResource: {
    breathing : RSX.bossTaskmasterBreathing.name
    idle : RSX.bossTaskmasterIdle.name
    walk : RSX.bossTaskmasterRun.name
    attack : RSX.bossTaskmasterAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossTaskmasterHit.name
    death : RSX.bossTaskmasterDeath.name
  }
}

cos[CardSkin.DrogonBoss] = {
  id: CardSkin.DrogonBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Drogon"
  shopDescription: "This skin was used in the Grym the Vengeful boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.drogonBossGIF.img
  rsx: RSX.drogonBossGIF
  factionId: Factions.Magmar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction5.Drogon
  skinNum: 1
  animResource: {
    breathing : RSX.bossGrymBreathing.name
    idle : RSX.bossGrymIdle.name
    walk : RSX.bossGrymRun.name
    attack : RSX.bossGrymAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossGrymHit.name
    death : RSX.bossGrymDeath.name
  }
}

cos[CardSkin.PantheranBoss] = {
  id: CardSkin.PantheranBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Pantheran"
  shopDescription: "This skin was used in the Nahlgol boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.pantheranBossGIF.img
  rsx: RSX.pantheranBossGIF
  factionId: Factions.Vetruvian
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction3.Pantheran
  skinNum: 1
  animResource: {
    breathing : RSX.bossSandPantherBreathing.name
    idle : RSX.bossSandPantherIdle.name
    walk : RSX.bossSandPantherRun.name
    attack : RSX.bossSandPantherAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSandPantherDamage.name
    death : RSX.bossSandPantherDeath.name
  }
}

cos[CardSkin.LysianBrawlerBoss] = {
  id: CardSkin.LysianBrawlerBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Lysian Brawler"
  shopDescription: "This skin was used in the Wolfpunch boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.lysianBrawlerBossGIF.img
  rsx: RSX.lysianBrawlerBossGIF
  factionId: Factions.Lyonar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction1.LysianBrawler
  skinNum: 1
  animResource: {
    breathing : RSX.bossWolfpunchBreathing.name
    idle : RSX.bossWolfpunchIdle.name
    walk : RSX.bossWolfpunchRun.name
    attack : RSX.bossWolfpunchAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossWolfpunchDamage.name
    death : RSX.bossWolfpunchDeath.name
  }
}

cos[CardSkin.DeathKnellBoss] = {
  id: CardSkin.DeathKnellBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Death Knell"
  shopDescription: "This skin was used in the Unhallowed boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.deathKnellBossGIF.img
  rsx: RSX.deathKnellBossGIF
  factionId: Factions.Abyssian
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction4.DeathKnell
  skinNum: 1
  animResource: {
    breathing : RSX.bossUnhallowedBreathing.name
    idle : RSX.bossUnhallowedIdle.name
    walk : RSX.bossUnhallowedRun.name
    attack : RSX.bossUnhallowedAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossUnhallowedHit.name
    death : RSX.bossUnhallowedDeath.name
  }
}

cos[CardSkin.DraugerLordBoss] = {
  id: CardSkin.DraugerLordBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Draugar Lord"
  shopDescription: "This skin was used in the Santaur the Terrible boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.draugerLordBossGIF.img
  rsx: RSX.draugerLordBossGIF
  factionId: Factions.Vanar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction6.PrismaticGiant
  skinNum: 1
  animResource: {
    breathing : RSX.bossChristmasBreathing.name
    idle : RSX.bossChristmasIdle.name
    walk : RSX.bossChristmasRun.name
    attack : RSX.bossChristmasAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossChristmasDamage.name
    death : RSX.bossChristmasDeath.name
  }
}

cos[CardSkin.NightWatcherBoss] = {
  id: CardSkin.NightWatcherBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Night Watcher"
  shopDescription: "This skin was used in the Legion boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.nightWatcherBossGIF.img
  rsx: RSX.nightWatcherBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.NightWatcher
  skinNum: 1
  animResource: {
    breathing : RSX.bossLegionBreathing.name
    idle : RSX.bossLegionIdle.name
    walk : RSX.bossLegionRun.name
    attack : RSX.bossLegionAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossLegionHit.name
    death : RSX.bossLegionDeath.name
  }
}

cos[CardSkin.CalligrapherBoss] = {
  id: CardSkin.CalligrapherBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Calligrapher"
  shopDescription: "This skin was used in the Harmony boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.calligrapherBossGIF.img
  rsx: RSX.calligrapherBossGIF
  factionId: Factions.Songhai
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction2.Calligrapher
  skinNum: 1
  animResource: {
    breathing : RSX.bossHarmonyBreathing.name
    idle : RSX.bossHarmonyIdle.name
    walk : RSX.bossHarmonyRun.name
    attack : RSX.bossHarmonyAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossHarmonyHit.name
    death : RSX.bossHarmonyDeath.name
  }
}

cos[CardSkin.PandoraBoss] = {
  id: CardSkin.PandoraBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Pandora"
  shopDescription: "This skin was used in the Andromeda boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.pandoraBossGIF.img
  rsx: RSX.pandoraBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Pandora
  skinNum: 1
  animResource: {
    breathing : RSX.bossAndromedaBreathing.name
    idle : RSX.bossAndromedaIdle.name
    walk : RSX.bossAndromedaRun.name
    attack : RSX.bossAndromedaAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossAndromedaHit.name
    death : RSX.bossAndromedaDeath.name
  }
}

cos[CardSkin.GrandmasterNoshRakBoss] = {
  id: CardSkin.GrandmasterNoshRakBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Grandmaster Nosh-Rak"
  shopDescription: "This skin was used in the Invader boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.grandmasterNoshRakBossGIF.img
  rsx: RSX.grandmasterNoshRakBossGIF
  factionId: Factions.Vetruvian
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction3.GrandmasterNoshRak
  skinNum: 1
  animResource: {
    breathing : RSX.bossInvaderBreathing.name
    idle : RSX.bossInvaderIdle.name
    walk : RSX.bossInvaderRun.name
    attack : RSX.bossInvaderAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossInvaderHit.name
    death : RSX.bossInvaderDeath.name
  }
}

cos[CardSkin.IroncliffeGuardianBoss] = {
  id: CardSkin.IroncliffeGuardianBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Ironcliffe Guardian"
  shopDescription: "This skin was used in the Invader boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.ironcliffeGuardianBossGIF.img
  rsx: RSX.ironcliffeGuardianBossGIF
  factionId: Factions.Lyonar
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction1.IroncliffeGuardian
  skinNum: 1
  animResource: {
    breathing : RSX.bossProtectorBreathing.name
    idle : RSX.bossProtectorIdle.name
    walk : RSX.bossProtectorRun.name
    attack : RSX.bossProtectorAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossProtectorDamage.name
    death : RSX.bossProtectorDeath.name
  }
}

cos[CardSkin.CelestialPhantomBoss] = {
  id: CardSkin.CelestialPhantomBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Celestial Phantom"
  shopDescription: "This skin was used in the Soulstealer boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.celestialPhantomBossGIF.img
  rsx: RSX.celestialPhantomBossGIF
  factionId: Factions.Songhai
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Faction2.CelestialPhantom
  skinNum: 1
  animResource: {
    breathing : RSX.bossSoulstealerBreathing.name
    idle : RSX.bossSoulstealerIdle.name
    walk : RSX.bossSoulstealerRun.name
    attack : RSX.bossSoulstealerAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSoulstealerDamage.name
    death : RSX.bossSoulstealerDeath.name
  }
}

cos[CardSkin.GrailmasterBoss] = {
  id: CardSkin.GrailmasterBoss
  typeId: CosmeticsTypeLookup.CardSkin # category of cosmetic
  name: "Grailmaster"
  shopDescription: "This skin was used in the Kahlmar the Spell Eater boss battle"
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_SKINS
  subTypeId: "Boss"
  img: RSX.grailmasterBossGIF.img
  rsx: RSX.grailmasterBossGIF
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  unlockable: true
  purchasable: true
  cardId: Cards.Neutral.Grailmaster
  skinNum: 1
  animResource: {
    breathing : RSX.bossSpelleaterBreathing.name
    idle : RSX.bossSpelleaterIdle.name
    walk : RSX.bossSpelleaterRun.name
    attack : RSX.bossSpelleaterAttack.name
    attackReleaseDelay: 0.0
    attackDelay: 1.25
    damage : RSX.bossSpelleaterHit.name
    death : RSX.bossSpelleaterDeath.name
  }
}

# endregion Card Skins

# region Card Backs

cos[CardBack.Normal] = {
  id: CardBack.Normal
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_classic_name")
  shopDescription: i18next.t("cosmetics.cardback_classic_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Common
  img: RSX.card_back.img
  rsx: RSX.card_back
  glowOutlineRSX: RSX.card_back_glow_outline
  unlockable: false
  purchasable: false
}

cos[CardBack.Agenor] = {
  id: CardBack.Agenor
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_redstark_name")
  shopDescription: i18next.t("cosmetics.cardback_redstark_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_agenor.img
  rsx: RSX.card_back_agenor
  glowOutlineRSX: RSX.card_back_agenor_glow_outline
  unlockable: false
  purchasable: true
}

cos[CardBack.Gauntlet] = {
  id: CardBack.Gauntlet
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_sienna_name")
  shopDescription: i18next.t("cosmetics.cardback_sienna_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_gauntlet.img
  rsx: RSX.card_back_gauntlet
  glowOutlineRSX: RSX.card_back_gauntlet_glow_outline
  unlockable: false
  purchasable: true
}

cos[CardBack.Magma] = {
  id: CardBack.Magma
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_dance_of_dreams_name")
  shopDescription: i18next.t("cosmetics.cardback_dance_of_dreams_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_magma.img
  rsx: RSX.card_back_magma
  glowOutlineRSX: RSX.card_back_magma_glow_outline
  unlockable: false
  purchasable: true
}

cos[CardBack.Shimzar] = {
  id: CardBack.Shimzar
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_shimzar_name")
  shopDescription: i18next.t("cosmetics.cardback_shimzar_desc")
  enabled: true
  alwaysVisible: false
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_shimzar.img
  rsx: RSX.card_back_shimzar
  glowOutlineRSX: RSX.card_back_shimzar_glow_outline
  unlockable: true
  purchasable: true
}

cos[CardBack.LyonarGears] = {
  id: CardBack.LyonarGears
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_azurite_name")
  shopDescription: i18next.t("cosmetics.cardback_azurite_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_lyonar_gears.img
  rsx: RSX.card_back_lyonar_gears
  glowOutlineRSX: RSX.card_back_lyonar_gears_glow_outline
  unlockable: false
  purchasable: true
}

cos[CardBack.HumbleBundle] = {
  id: CardBack.HumbleBundle
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_humble_bundle_name")
  shopDescription: i18next.t("cosmetics.cardback_humble_bundle_desc")
  enabled: true
  alwaysVisible: false
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_humblebundle.img
  rsx: RSX.card_back_humblebundle
  glowOutlineRSX: RSX.card_back_humblebundle_glow_outline
  unlockable: true
  purchasable: false
}

cos[CardBack.DawnDuelysts] = {
  id: CardBack.DawnDuelysts
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_dawn_of_duelysts_name")
  shopDescription: i18next.t("cosmetics.cardback_dawn_of_duelysts_desc")
  enabled: true
  alwaysVisible: false
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_dawnduelysts.img
  rsx: RSX.card_back_dawnduelysts
  glowOutlineRSX: RSX.card_back_dawnduelysts_glow_outline
  unlockable: true
  purchasable: false
}

cos[CardBack.Snowchaser] = {
  id: CardBack.Snowchaser
  typeId: CosmeticsTypeLookup.CardBack # category of cosmetic
  name: i18next.t("cosmetics.cardback_snowchaser_cup_name")
  shopDescription: i18next.t("cosmetics.cardback_snowchaser_cup_desc")
  enabled: true
  alwaysVisible: false
  order: ORDER_CARD_BACKS
  rarityId: Rarity.Epic
  img: RSX.card_back_snowchaser.img
  rsx: RSX.card_back_snowchaser
  glowOutlineRSX: RSX.card_back_snowchaser_glow_outline
  unlockable: true
  purchasable: true
}

# endregion Card Backs

# region Profile Icons

cos[ProfileIcon.Tree] = {
  id: ProfileIcon.Tree
  typeId: CosmeticsTypeLookup.ProfileIcon
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_tree_of_eyos_name")
  order: ORDER_PROFILE_ICONS
  enabled: true
  alwaysVisible: true
  rarityId: Rarity.Fixed
  img: RSX.portrait_tree.img
  rsx: RSX.portrait_tree
  unlockable: false
  purchasable: false
}

cos[ProfileIcon.abyssian_abyssalcrawler] = {
  id: ProfileIcon.abyssian_abyssalcrawler
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_abyssal_crawler_name")
  shopDescription: i18next.t("cosmetics.icon_abyssal_crawler_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_abyssian_abyssalcrawler.img
  rsx: RSX.portrait_abyssian_abyssalcrawler
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_cassyvasoulreaper1] = {
  id: ProfileIcon.abyssian_cassyvasoulreaper1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_cassyva_name")
  shopDescription: i18next.t("cosmetics.icon_cassyva_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_abyssian_cassyvasoulreaper1.img
  rsx: RSX.portrait_abyssian_cassyvasoulreaper1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_maehv1] = {
  id: ProfileIcon.abyssian_maehv1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_maehv_name")
  shopDescription: i18next.t("cosmetics.icon_maehv_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_abyssian_maehv1.img
  rsx: RSX.portrait_abyssian_maehv1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_crest] = {
  id: ProfileIcon.abyssian_crest
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_abyssian_crest_name")
  shopDescription: i18next.t("cosmetics.icon_abyssian_crest_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_abyssian_crest.img
  rsx: RSX.portrait_abyssian_crest
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_gloomchaser] = {
  id: ProfileIcon.abyssian_gloomchaser
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_gloomchaser_name")
  shopDescription: i18next.t("cosmetics.icon_gloomchaser_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_abyssian_gloomchaser.img
  rsx: RSX.portrait_abyssian_gloomchaser
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_kelainosister] = {
  id: ProfileIcon.abyssian_kelainosister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_shadow_sister_name")
  shopDescription: i18next.t("cosmetics.icon_shadow_sister_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_abyssian_kelainosister.img
  rsx: RSX.portrait_abyssian_kelainosister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_lilithe1] = {
  id: ProfileIcon.abyssian_lilithe1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_lilithe_name")
  shopDescription: i18next.t("cosmetics.icon_lilithe_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_abyssian_lilithe1.img
  rsx: RSX.portrait_abyssian_lilithe1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_lilithe2] = {
  id: ProfileIcon.abyssian_lilithe2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_lilithe_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_lilithe_mk2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_abyssian_lilithe2.img
  rsx: RSX.portrait_abyssian_lilithe2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_vorpalreaver] = {
  id: ProfileIcon.abyssian_vorpalreaver
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_vorpal_reaver_name")
  shopDescription: i18next.t("cosmetics.icon_vorpal_reaver_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_abyssian_vorpalreaver.img
  rsx: RSX.portrait_abyssian_vorpalreaver
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.abyssian_wraithling] = {
  id: ProfileIcon.abyssian_wraithling
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  factionId: Factions.Faction4
  enabled: true
  name: i18next.t("cosmetics.icon_wraithling_name")
  shopDescription: i18next.t("cosmetics.icon_wraithling_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_abyssian_wraithling.img
  rsx: RSX.portrait_abyssian_wraithling
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.frostfire] = {
  id: ProfileIcon.frostfire
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_frostfire_2015_name")
  shopDescription: i18next.t("cosmetics.icon_frostfire_2015_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_frostfire.img
  rsx: RSX.portrait_frostfire
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_arclytesentinel] = {
  id: ProfileIcon.lyonar_arclytesentinel
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_arclyte_sentinel_name")
  shopDescription: i18next.t("cosmetics.icon_arclyte_sentinel_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_lyonar_arclytesentinel.img
  rsx: RSX.portrait_lyonar_arclytesentinel
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_argeonhighmayne1] = {
  id: ProfileIcon.lyonar_argeonhighmayne1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_argeon_name")
  shopDescription: i18next.t("cosmetics.icon_argeon_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_lyonar_argeonhighmayne1.img
  rsx: RSX.portrait_lyonar_argeonhighmayne1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_argeonhighmayne2] = {
  id: ProfileIcon.lyonar_argeonhighmayne2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_argeon_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_argeon_mk2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_lyonar_argeonhighmayne2.img
  rsx: RSX.portrait_lyonar_argeonhighmayne2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_crest] = {
  id: ProfileIcon.lyonar_crest
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_lyonar_crest_name")
  shopDescription: i18next.t("cosmetics.icon_lyonar_crest_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_lyonar_crest.img
  rsx: RSX.portrait_lyonar_crest
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_lightchaser] = {
  id: ProfileIcon.lyonar_lightchaser
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_lightchaser_name")
  shopDescription: i18next.t("cosmetics.icon_lightchaser_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_lyonar_lightchaser.img
  rsx: RSX.portrait_lyonar_lightchaser
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_silverguardknight] = {
  id: ProfileIcon.lyonar_silverguardknight
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_silverguard_knight_name")
  shopDescription: i18next.t("cosmetics.icon_silverguard_knight_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_lyonar_silverguardknight.img
  rsx: RSX.portrait_lyonar_silverguardknight
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_steropesister] = {
  id: ProfileIcon.lyonar_steropesister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_sun_sister_name")
  shopDescription: i18next.t("cosmetics.icon_sun_sister_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_lyonar_steropesister.img
  rsx: RSX.portrait_lyonar_steropesister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_suntidemaiden] = {
  id: ProfileIcon.lyonar_suntidemaiden
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_suntide_maiden_name")
  shopDescription: i18next.t("cosmetics.icon_suntide_maiden_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_lyonar_suntidemaiden.img
  rsx: RSX.portrait_lyonar_suntidemaiden
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_windbladeadept] = {
  id: ProfileIcon.lyonar_windbladeadept
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_windblade_adept_name")
  shopDescription: i18next.t("cosmetics.icon_windblade_adept_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_lyonar_windbladeadept.img
  rsx: RSX.portrait_lyonar_windbladeadept
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_ziransunforge1] = {
  id: ProfileIcon.lyonar_ziransunforge1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_ziran_name")
  shopDescription: i18next.t("cosmetics.icon_ziran_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_lyonar_ziransunforge1.img
  rsx: RSX.portrait_lyonar_ziransunforge1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.lyonar_brome1] = {
  id: ProfileIcon.lyonar_brome1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  factionId: Factions.Faction1
  enabled: true
  name: i18next.t("cosmetics.icon_brome_name")
  shopDescription: i18next.t("cosmetics.icon_brome_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_lyonar_brome1.img
  rsx: RSX.portrait_lyonar_brome1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_crest] = {
  id: ProfileIcon.magmar_crest
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_magmar_crest_name")
  shopDescription: i18next.t("cosmetics.icon_magmar_crest_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_crest.img
  rsx: RSX.portrait_magmar_crest
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_dreadnought] = {
  id: ProfileIcon.magmar_dreadnought
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_dreadnought_name")
  shopDescription: i18next.t("cosmetics.icon_dreadnought_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_dreadnought.img
  rsx: RSX.portrait_magmar_dreadnought
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_elucidator] = {
  id: ProfileIcon.magmar_elucidator
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_elucidator_name")
  shopDescription: i18next.t("cosmetics.icon_elucidator_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_elucidator.img
  rsx: RSX.portrait_magmar_elucidator
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_makantorwarbeast] = {
  id: ProfileIcon.magmar_makantorwarbeast
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_makantor_name")
  shopDescription: i18next.t("cosmetics.icon_makantor_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_makantorwarbeast.img
  rsx: RSX.portrait_magmar_makantorwarbeast
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_phalanxar] = {
  id: ProfileIcon.magmar_phalanxar
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_phalanxar_name")
  shopDescription: i18next.t("cosmetics.icon_phalanxar_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_phalanxar.img
  rsx: RSX.portrait_magmar_phalanxar
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_silitharelder] = {
  id: ProfileIcon.magmar_silitharelder
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_silithar_elder_name")
  shopDescription: i18next.t("cosmetics.icon_silithar_elder_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_silitharelder.img
  rsx: RSX.portrait_magmar_silitharelder
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_starhorn1] = {
  id: ProfileIcon.magmar_starhorn1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_starhorn_1_name")
  shopDescription: i18next.t("cosmetics.icon_starhorn_1_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_starhorn1.img
  rsx: RSX.portrait_magmar_starhorn1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_starhorn2] = {
  id: ProfileIcon.magmar_starhorn2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_starhorn_2_name")
  shopDescription: i18next.t("cosmetics.icon_starhorn_2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_starhorn2.img
  rsx: RSX.portrait_magmar_starhorn2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_ragnora1] = {
  id: ProfileIcon.magmar_ragnora1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_ragnora_name")
  shopDescription: i18next.t("cosmetics.icon_ragnora_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_ragnora1.img
  rsx: RSX.portrait_magmar_ragnora1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_taygetesister] = {
  id: ProfileIcon.magmar_taygetesister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_taygete_name")
  shopDescription: i18next.t("cosmetics.icon_taygete_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_taygetesister.img
  rsx: RSX.portrait_magmar_taygetesister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_vaath1] = {
  id: ProfileIcon.magmar_vaath1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_vaath_name")
  shopDescription: i18next.t("cosmetics.icon_vaath_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_vaath1.img
  rsx: RSX.portrait_magmar_vaath1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_vaath2] = {
  id: ProfileIcon.magmar_vaath2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_vaath_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_vaath_mk2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_magmar_vaath2.img
  rsx: RSX.portrait_magmar_vaath2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_veteransilithar] = {
  id: ProfileIcon.magmar_veteransilithar
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_veteran_silithar_name")
  shopDescription: i18next.t("cosmetics.icon_veteran_silithar_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_veteransilithar.img
  rsx: RSX.portrait_magmar_veteransilithar
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.magmar_youngsilithar] = {
  id: ProfileIcon.magmar_youngsilithar
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Magmar"
  factionId: Factions.Faction5
  enabled: true
  name: i18next.t("cosmetics.icon_young_silithar_name")
  shopDescription: i18next.t("cosmetics.icon_young_silithar_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_magmar_youngsilithar.img
  rsx: RSX.portrait_magmar_youngsilithar
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_beastmaster] = {
  id: ProfileIcon.neutral_beastmaster
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_beastmaster_name")
  shopDescription: i18next.t("cosmetics.icon_beastmaster_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_neutral_beastmaster.img
  rsx: RSX.portrait_neutral_beastmaster
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_cannonofmechaz0r] = {
  id: ProfileIcon.neutral_cannonofmechaz0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_cannon_mech_name")
  shopDescription: i18next.t("cosmetics.icon_cannon_mech_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_cannonofmechaz0r.img
  rsx: RSX.portrait_neutral_cannonofmechaz0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_chassisofmechaz0r] = {
  id: ProfileIcon.neutral_chassisofmechaz0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_chassis_mech_name")
  shopDescription: i18next.t("cosmetics.icon_chassis_mech_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_chassisofmechaz0r.img
  rsx: RSX.portrait_neutral_chassisofmechaz0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_gnasher] = {
  id: ProfileIcon.neutral_gnasher
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_gnasher_name")
  shopDescription: i18next.t("cosmetics.icon_gnasher_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_neutral_gnasher.img
  rsx: RSX.portrait_neutral_gnasher
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_goldenmantella] = {
  id: ProfileIcon.neutral_goldenmantella
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_golden_mantella_name")
  shopDescription: i18next.t("cosmetics.icon_golden_mantella_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_neutral_goldenmantella.img
  rsx: RSX.portrait_neutral_goldenmantella
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_grincher] = {
  id: ProfileIcon.neutral_grincher
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_grincher_name")
  shopDescription: i18next.t("cosmetics.icon_grincher_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_grincher.img
  rsx: RSX.portrait_neutral_grincher
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_helmofmechaz0r] = {
  id: ProfileIcon.neutral_helmofmechaz0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_helm_mech_name")
  shopDescription: i18next.t("cosmetics.icon_helm_mech_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_helmofmechaz0r.img
  rsx: RSX.portrait_neutral_helmofmechaz0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_hydrax1] = {
  id: ProfileIcon.neutral_hydrax1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_hydrax_name")
  shopDescription: i18next.t("cosmetics.icon_hydrax_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_hydrax1.img
  rsx: RSX.portrait_neutral_hydrax1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_hydrax2] = {
  id: ProfileIcon.neutral_hydrax2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_hydrax_2_name")
  shopDescription: i18next.t("cosmetics.icon_hydrax_2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_hydrax2.img
  rsx: RSX.portrait_neutral_hydrax2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_ion] = {
  id: ProfileIcon.neutral_ion
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_ion_name")
  shopDescription: i18next.t("cosmetics.icon_ion_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_ion.img
  rsx: RSX.portrait_neutral_ion
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_ladylocke] = {
  id: ProfileIcon.neutral_ladylocke
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_lady_locke_name")
  shopDescription: i18next.t("cosmetics.icon_lady_locke_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_ladylocke.img
  rsx: RSX.portrait_neutral_ladylocke
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_lkiansister] = {
  id: ProfileIcon.neutral_lkiansister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_sworn_sister_name")
  shopDescription: i18next.t("cosmetics.icon_sworn_sister_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_lkiansister.img
  rsx: RSX.portrait_neutral_lkiansister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_mechaz0r] = {
  id: ProfileIcon.neutral_mechaz0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_mechaz0r_name")
  shopDescription: i18next.t("cosmetics.icon_mechaz0r_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_mechaz0r.img
  rsx: RSX.portrait_neutral_mechaz0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_nip] = {
  id: ProfileIcon.neutral_nip
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_dex_name")
  shopDescription: i18next.t("cosmetics.icon_dex_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_nip.img
  rsx: RSX.portrait_neutral_nip
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_rawr] = {
  id: ProfileIcon.neutral_rawr
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_rawr_name")
  shopDescription: i18next.t("cosmetics.icon_rawr_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_rawr.img
  rsx: RSX.portrait_neutral_rawr
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_rok] = {
  id: ProfileIcon.neutral_rok
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_rok_name")
  shopDescription: i18next.t("cosmetics.icon_rok_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_rok.img
  rsx: RSX.portrait_neutral_rok
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_rook] = {
  id: ProfileIcon.neutral_rook
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_rook_name")
  shopDescription: i18next.t("cosmetics.icon_rook_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_rook.img
  rsx: RSX.portrait_neutral_rook
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_silverbeak] = {
  id: ProfileIcon.neutral_silverbeak
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_silverbeak_name")
  shopDescription: i18next.t("cosmetics.icon_silverbeak_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_neutral_silverbeak.img
  rsx: RSX.portrait_neutral_silverbeak
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_soboro] = {
  id: ProfileIcon.neutral_soboro
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_soboro_name")
  shopDescription: i18next.t("cosmetics.icon_soboro_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_soboro.img
  rsx: RSX.portrait_neutral_soboro
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_swordofmechaz0r] = {
  id: ProfileIcon.neutral_swordofmechaz0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_sword_mech_name")
  shopDescription: i18next.t("cosmetics.icon_sword_mech_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_swordofmechaz0r.img
  rsx: RSX.portrait_neutral_swordofmechaz0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_wingsofmechaz0r] = {
  id: ProfileIcon.neutral_wingsofmechaz0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_wings_mech_name")
  shopDescription: i18next.t("cosmetics.icon_wings_mech_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_wingsofmechaz0r.img
  rsx: RSX.portrait_neutral_wingsofmechaz0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_z0r] = {
  id: ProfileIcon.neutral_z0r
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_z0r_name")
  shopDescription: i18next.t("cosmetics.icon_z0r_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_z0r.img
  rsx: RSX.portrait_neutral_z0r
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.neutral_zukong] = {
  id: ProfileIcon.neutral_zukong
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_zukong_name")
  shopDescription: i18next.t("cosmetics.icon_zukong_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_neutral_zukong.img
  rsx: RSX.portrait_neutral_zukong
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_alkyonesister] = {
  id: ProfileIcon.songhai_alkyonesister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_storm_sister_name")
  shopDescription: i18next.t("cosmetics.icon_storm_sister_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_songhai_alkyonesister.img
  rsx: RSX.portrait_songhai_alkyonesister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_crest] = {
  id: ProfileIcon.songhai_crest
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_songhai_crest_name")
  shopDescription: i18next.t("cosmetics.icon_songhai_crest_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_songhai_crest.img
  rsx: RSX.portrait_songhai_crest
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_gorehorn] = {
  id: ProfileIcon.songhai_gorehorn
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_gorehorn_name")
  shopDescription: i18next.t("cosmetics.icon_gorehorn_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_gorehorn.img
  rsx: RSX.portrait_songhai_gorehorn
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_grandmasterzendo] = {
  id: ProfileIcon.songhai_grandmasterzendo
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_zendo_name")
  shopDescription: i18next.t("cosmetics.icon_zendo_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_songhai_grandmasterzendo.img
  rsx: RSX.portrait_songhai_grandmasterzendo
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_heartseeker] = {
  id: ProfileIcon.songhai_heartseeker
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_heartseeker_name")
  shopDescription: i18next.t("cosmetics.icon_heartseeker_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_heartseeker.img
  rsx: RSX.portrait_songhai_heartseeker
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_kaidoassassin] = {
  id: ProfileIcon.songhai_kaidoassassin
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_kaido_assassin_name")
  shopDescription: i18next.t("cosmetics.icon_kaido_assassin_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_kaidoassassin.img
  rsx: RSX.portrait_songhai_kaidoassassin
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_kaleosxaan1] = {
  id: ProfileIcon.songhai_kaleosxaan1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_kaleos_name")
  shopDescription: i18next.t("cosmetics.icon_kaleos_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_kaleosxaan1.img
  rsx: RSX.portrait_songhai_kaleosxaan1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_revaeventide1] = {
  id: ProfileIcon.songhai_revaeventide1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_reva_name")
  shopDescription: i18next.t("cosmetics.icon_reva_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_revaeventide1.img
  rsx: RSX.portrait_songhai_revaeventide1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_revaeventide2] = {
  id: ProfileIcon.songhai_revaeventide2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_reva_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_reva_mk2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_songhai_revaeventide2.img
  rsx: RSX.portrait_songhai_revaeventide2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_shidai1] = {
  id: ProfileIcon.songhai_shidai1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_shidai_name")
  shopDescription: i18next.t("cosmetics.icon_shidai_name")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_shidai1.img
  rsx: RSX.portrait_songhai_shidai1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_scarletviper] = {
  id: ProfileIcon.songhai_scarletviper
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_scarlet_viper_name")
  shopDescription: i18next.t("cosmetics.icon_scarlet_viper_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_scarletviper.img
  rsx: RSX.portrait_songhai_scarletviper
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_tuskboar] = {
  id: ProfileIcon.songhai_tuskboar
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_tusk_boar_name")
  shopDescription: i18next.t("cosmetics.icon_tusk_boar_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_songhai_tuskboar.img
  rsx: RSX.portrait_songhai_tuskboar
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.songhai_widowmaker] = {
  id: ProfileIcon.songhai_widowmaker
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  factionId: Factions.Faction2
  enabled: true
  name: i18next.t("cosmetics.icon_widowmaker_name")
  shopDescription: i18next.t("cosmetics.icon_widowmaker_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_songhai_widowmaker.img
  rsx: RSX.portrait_songhai_widowmaker
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_arcticdisplacer] = {
  id: ProfileIcon.vanar_arcticdisplacer
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_arctic_displacer_name")
  shopDescription: i18next.t("cosmetics.icon_arctic_displacer_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_arcticdisplacer.img
  rsx: RSX.portrait_vanar_arcticdisplacer
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_crest] = {
  id: ProfileIcon.vanar_crest
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_vanar_crest_name")
  shopDescription: i18next.t("cosmetics.icon_vanar_crest_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_crest.img
  rsx: RSX.portrait_vanar_crest
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_draugarlord] = {
  id: ProfileIcon.vanar_draugarlord
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_draugar_lord_name")
  shopDescription: i18next.t("cosmetics.icon_draugar_lord_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_draugarlord.img
  rsx: RSX.portrait_vanar_draugarlord
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_faiebloodwing_warbird] = {
  id: ProfileIcon.vanar_faiebloodwing_warbird
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_warbird_name")
  shopDescription: i18next.t("cosmetics.icon_warbird_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_faiebloodwing_warbird.img
  rsx: RSX.portrait_vanar_faiebloodwing_warbird
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_faiebloodwing1] = {
  id: ProfileIcon.vanar_faiebloodwing1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_faie_name")
  shopDescription: i18next.t("cosmetics.icon_faie_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_faiebloodwing1.img
  rsx: RSX.portrait_vanar_faiebloodwing1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_faiebloodwing2] = {
  id: ProfileIcon.vanar_faiebloodwing2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_faie_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_faie_mk2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_faiebloodwing2.img
  rsx: RSX.portrait_vanar_faiebloodwing2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_glacialelemental] = {
  id: ProfileIcon.vanar_glacialelemental
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_glacial_elemental_name")
  shopDescription: i18next.t("cosmetics.icon_glacial_elemental_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_glacialelemental.img
  rsx: RSX.portrait_vanar_glacialelemental
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_hearthsister] = {
  id: ProfileIcon.vanar_hearthsister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_hearth_sister_name")
  shopDescription: i18next.t("cosmetics.icon_hearth_sister_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_hearthsister.img
  rsx: RSX.portrait_vanar_hearthsister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_icebladedryad] = {
  id: ProfileIcon.vanar_icebladedryad
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_iceblade_dryad_name")
  shopDescription: i18next.t("cosmetics.icon_iceblade_dryad_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_icebladedryad.img
  rsx: RSX.portrait_vanar_icebladedryad
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_karawinterblade1] = {
  id: ProfileIcon.vanar_karawinterblade1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_kara_name")
  shopDescription: i18next.t("cosmetics.icon_kara_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_karawinterblade1.img
  rsx: RSX.portrait_vanar_karawinterblade1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_karawinterblade2] = {
  id: ProfileIcon.vanar_karawinterblade2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_kara_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_kara_mk2_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_karawinterblade2.img
  rsx: RSX.portrait_vanar_karawinterblade2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_ilena1] = {
  id: ProfileIcon.vanar_ilena1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_ilena_name")
  shopDescription: i18next.t("cosmetics.icon_ilena_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_ilena1.img
  rsx: RSX.portrait_vanar_ilena1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_maiasister] = {
  id: ProfileIcon.vanar_maiasister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_wind_sister_name")
  shopDescription: i18next.t("cosmetics.icon_wind_sister_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_maiasister.img
  rsx: RSX.portrait_vanar_maiasister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_razorback] = {
  id: ProfileIcon.vanar_razorback
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_razorback_name")
  shopDescription: i18next.t("cosmetics.icon_razorback_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_razorback.img
  rsx: RSX.portrait_vanar_razorback
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_snowchaser] = {
  id: ProfileIcon.vanar_snowchaser
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_snowchaser_name")
  shopDescription: i18next.t("cosmetics.icon_snowchaser_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vanar_snowchaser.img
  rsx: RSX.portrait_vanar_snowchaser
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vanar_wolfraven] = {
  id: ProfileIcon.vanar_wolfraven
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  factionId: Factions.Faction6
  enabled: true
  name: i18next.t("cosmetics.icon_wolfraven_name")
  shopDescription: i18next.t("cosmetics.icon_wolfraven_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vanar_wolfraven.img
  rsx: RSX.portrait_vanar_wolfraven
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_crest] = {
  id: ProfileIcon.vetruvian_crest
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_vetruvian_crest_name")
  shopDescription: i18next.t("cosmetics.icon_vetruvian_crest_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vetruvian_crest.img
  rsx: RSX.portrait_vetruvian_crest
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_miragemaster] = {
  id: ProfileIcon.vetruvian_miragemaster
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_mirage_master_name")
  shopDescription: i18next.t("cosmetics.icon_mirage_master_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_miragemaster.img
  rsx: RSX.portrait_vetruvian_miragemaster
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_pax] = {
  id: ProfileIcon.vetruvian_pax
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_pax_name")
  shopDescription: i18next.t("cosmetics.icon_pax_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vetruvian_pax.img
  rsx: RSX.portrait_vetruvian_pax
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_pyromancer] = {
  id: ProfileIcon.vetruvian_pyromancer
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_pyromancer_name")
  shopDescription: i18next.t("cosmetics.icon_pyromancer_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_pyromancer.img
  rsx: RSX.portrait_vetruvian_pyromancer
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_rae] = {
  id: ProfileIcon.vetruvian_rae
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_rae_name")
  shopDescription: i18next.t("cosmetics.icon_rae_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vetruvian_rae.img
  rsx: RSX.portrait_vetruvian_rae
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_saonsister] = {
  id: ProfileIcon.vetruvian_saonsister
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_sand_sister_name")
  shopDescription: i18next.t("cosmetics.icon_sand_sister_desc")
  rarityId: Rarity.Rare
  alwaysVisible: true
  img: RSX.portrait_vetruvian_saonsister.img
  rsx: RSX.portrait_vetruvian_saonsister
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_scionesssajj1] = {
  id: ProfileIcon.vetruvian_scionesssajj1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_sajj_name")
  shopDescription: i18next.t("cosmetics.icon_sajj_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_scionesssajj1.img
  rsx: RSX.portrait_vetruvian_scionesssajj1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_ciphyron1] = {
  id: ProfileIcon.vetruvian_ciphyron1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_ciphyron_name")
  shopDescription: i18next.t("cosmetics.icon_ciphyron_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_ciphyron1.img
  rsx: RSX.portrait_vetruvian_ciphyron1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_starfirescarab] = {
  id: ProfileIcon.vetruvian_starfirescarab
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_starfire_scarab_name")
  shopDescription: i18next.t("cosmetics.icon_starfire_scarab_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_starfirescarab.img
  rsx: RSX.portrait_vetruvian_starfirescarab
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_windshrike] = {
  id: ProfileIcon.vetruvian_windshrike
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_windshrike_name")
  shopDescription: i18next.t("cosmetics.icon_windshrike_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_windshrike.img
  rsx: RSX.portrait_vetruvian_windshrike
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_zirixstarstrider1] = {
  id: ProfileIcon.vetruvian_zirixstarstrider1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_zirix_name")
  shopDescription: i18next.t("cosmetics.icon_zirix_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_zirixstarstrider1.img
  rsx: RSX.portrait_vetruvian_zirixstarstrider1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.vetruvian_zirixstarstrider2] = {
  id: ProfileIcon.vetruvian_zirixstarstrider2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  factionId: Factions.Faction3
  enabled: true
  name: i18next.t("cosmetics.icon_zirix_mk2_name")
  shopDescription: i18next.t("cosmetics.icon_zirix_mk2_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_vetruvian_zirixstarstrider2.img
  rsx: RSX.portrait_vetruvian_zirixstarstrider2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.Bloodmoon] = {
  id: ProfileIcon.Bloodmoon
  typeId: CosmeticsTypeLookup.ProfileIcon
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_bloodmoon_ruins_name")
  shopDescription: i18next.t("cosmetics.icon_bloodmoon_ruins_desc")
  order: ORDER_PROFILE_ICONS
  enabled: true
  alwaysVisible: true
  rarityId: Rarity.Common
  img: RSX.portrait_bloodmoon.img
  rsx: RSX.portrait_bloodmoon
  unlockable: false
  purchasable: false
}
cos[ProfileIcon.CrystalCaverns] = {
  id: ProfileIcon.CrystalCaverns
  typeId: CosmeticsTypeLookup.ProfileIcon
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_crystal_caverns_name")
  shopDescription: i18next.t("cosmetics.icon_crystal_caverns_desc")
  order: ORDER_PROFILE_ICONS
  enabled: true
  alwaysVisible: true
  rarityId: Rarity.Common
  img: RSX.portrait_crystal_caverns.img
  rsx: RSX.portrait_crystal_caverns
  unlockable: false
  purchasable: false
}
cos[ProfileIcon.Kaero] = {
  id: ProfileIcon.Kaero
  typeId: CosmeticsTypeLookup.ProfileIcon
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_kaero_name")
  shopDescription: i18next.t("cosmetics.icon_kaero_desc")
  order: ORDER_PROFILE_ICONS
  enabled: true
  alwaysVisible: true
  rarityId: Rarity.Common
  img: RSX.portrait_kaero.img
  rsx: RSX.portrait_kaero
  unlockable: false
  purchasable: false
}
cos[ProfileIcon.WhistlingBlade] = {
  id: ProfileIcon.WhistlingBlade
  typeId: CosmeticsTypeLookup.ProfileIcon
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_whistling_blades_name")
  shopDescription: i18next.t("cosmetics.icon_whistling_blades_desc")
  order: ORDER_PROFILE_ICONS
  enabled: true
  alwaysVisible: true
  rarityId: Rarity.Common
  img: RSX.portrait_whistling_blade.img
  rsx: RSX.portrait_whistling_blade
  unlockable: false
  purchasable: false
}

cos[ProfileIcon.obsidian_woods] = {
  id: ProfileIcon.obsidian_woods
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  enabled: true
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_obsidian_woods_name")
  shopDescription: i18next.t("cosmetics.icon_obsidian_woods_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_obsidian_woods.img
  rsx: RSX.portrait_obsidian_woods
  unlockable: false
  purchasable: false
}

cos[ProfileIcon.rashas_tomb] = {
  id: ProfileIcon.rashas_tomb
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  enabled: true
  subTypeId: "Neutral"
  name: i18next.t("cosmetics.icon_rashas_tomb_name")
  shopDescription: i18next.t("cosmetics.icon_rashas_tomb_desc")
  rarityId: Rarity.Common
  alwaysVisible: true
  img: RSX.portrait_rashas_tomb.img
  rsx: RSX.portrait_rashas_tomb
  unlockable: false
  purchasable: false
}

cos[ProfileIcon.grandmaster_icon] = {
  id: ProfileIcon.grandmaster_icon
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: i18next.t("cosmetics.icon_grandmaster_name")
  shopDescription: i18next.t("cosmetics.icon_grandmaster_desc")
  rarityId: Rarity.Common
  alwaysVisible: false
  img: RSX.portrait_grandmaster_portrait.img
  rsx: RSX.portrait_grandmaster_portrait
  unlockable: true
  purchasable: false
}

cos[ProfileIcon.tournament_dawnofduelysts1] = {
  id: ProfileIcon.tournament_dawnofduelysts1
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "Emperor Sargos"
  shopDescription: "Emperor Sargos"
  rarityId: Rarity.Common
  alwaysVisible: false
  img: RSX.portrait_tournament_dawnofduelysts1.img
  rsx: RSX.portrait_tournament_dawnofduelysts1
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.tournament_dawnofduelysts2] = {
  id: ProfileIcon.tournament_dawnofduelysts2
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "The Coming of Rasha"
  shopDescription: "The Coming of Rasha"
  rarityId: Rarity.Common
  alwaysVisible: false
  img: RSX.portrait_tournament_dawnofduelysts2.img
  rsx: RSX.portrait_tournament_dawnofduelysts2
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.aer] = {
  id: ProfileIcon.aer
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "Aer Pridebeak"
  shopDescription: "Aer Pridebeak"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_aer.img
  rsx: RSX.portrait_aer
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.frizzing_mystic] = {
  id: ProfileIcon.frizzing_mystic
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "Frizzing Mystic"
  shopDescription: "Frizzing Mystic"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_frizzing_mystic.img
  rsx: RSX.portrait_frizzing_mystic
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.gibbet] = {
  id: ProfileIcon.gibbet
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  enabled: true
  name: "Gibbet"
  shopDescription: "Gibbet"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_gibbet.img
  rsx: RSX.portrait_gibbet
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.orbo] = {
  id: ProfileIcon.orbo
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "Orbo the Ostentatious"
  shopDescription: "Orbo the Ostentatious"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_orbo.img
  rsx: RSX.portrait_orbo
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.canopic] = {
  id: ProfileIcon.canopic
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vetruvian"
  enabled: true
  name: "Fifth Canopic"
  shopDescription: "Fifth Canopic"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_canopic.img
  rsx: RSX.portrait_canopic
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.veracity] = {
  id: ProfileIcon.veracity
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Vanar"
  enabled: true
  name: "Yggdra's Voracity"
  shopDescription: "Yggdra's Voracity"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_veracity.img
  rsx: RSX.portrait_veracity
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.indominus] = {
  id: ProfileIcon.indominus
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Lyonar"
  enabled: true
  name: "Indominus"
  shopDescription: "Indominus"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_indominus.img
  rsx: RSX.portrait_indominus
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.spriggen] = {
  id: ProfileIcon.spriggen
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "Spriggen"
  shopDescription: "Spriggen"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_spriggen.img
  rsx: RSX.portrait_spriggen
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.eternityPainter] = {
  id: ProfileIcon.eternityPainter
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Songhai"
  enabled: true
  name: "Eternity Painter"
  shopDescription: "Eternity Painter"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_eternityPainter.img
  rsx: RSX.portrait_eternityPainter
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.skullProphet] = {
  id: ProfileIcon.skullProphet
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Abyssian"
  enabled: true
  name: "Skull Prophet"
  shopDescription: "Skull Prophet"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_skullProphet.img
  rsx: RSX.portrait_skullProphet
  unlockable: false
  purchasable: true
}

cos[ProfileIcon.sinisterSilhouette] = {
  id: ProfileIcon.sinisterSilhouette
  typeId: CosmeticsTypeLookup.ProfileIcon
  order: ORDER_PROFILE_ICONS
  subTypeId: "Neutral"
  enabled: true
  name: "Sinister Silhouette"
  shopDescription: "Sinister Silhouette"
  rarityId: Rarity.Rare
  alwaysVisible: false
  img: RSX.portrait_sinisterSilhouette.img
  rsx: RSX.portrait_sinisterSilhouette
  unlockable: false
  purchasable: true
}

# endregion Profile Icons

# region emotes

# Emotes were converted from prior format (from EmoteFactory) to this by executing these regex replaces:
# https://gist.github.com/RobotRocker/13b08cd699b2a0242d9ae770dcdcb7a6

# region TEXT

cos[Emote.TextHello] = {
  id: Emote.TextHello
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Other"
  enabled: true
  alwaysVisible: true
  img: null
  rsx: null
  title: i18next.t("cosmetics.emote_hello_name")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Default
  rarityId: Rarity.Fixed
  unlockable: false
  purchasable: false
}
cos[Emote.TextGLHF] = {
  id: Emote.TextGLHF
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Other"
  enabled: true
  alwaysVisible: true
  img: null
  rsx: null
  title: i18next.t("cosmetics.emote_glhf_name")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Default
  rarityId: Rarity.Fixed
  unlockable: false
  purchasable: false
}
cos[Emote.TextGG] = {
  id: Emote.TextGG
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Other"
  enabled: true
  alwaysVisible: true
  img: null
  rsx: null
  title: i18next.t("cosmetics.emote_well_played_name")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Default
  rarityId: Rarity.Fixed
  unlockable: false
  purchasable: false
}
cos[Emote.TextOops] = {
  id: Emote.TextOops
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Other"
  enabled: true
  alwaysVisible: true
  img: null
  rsx: null
  title: i18next.t("cosmetics.emote_oops_name")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Default
  rarityId: Rarity.Fixed
  unlockable: false
  purchasable: false
}

# endregion TEXT

# region HEALING MYSTIC

cos[Emote.HealingMysticHappy] = {
  id: Emote.HealingMysticHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_healing_mystic_happy.img
  rsx: RSX.emote_healing_mystic_happy
  title: "So Happy!"
  name: i18next.t("cosmetics.emote_hm_happy_name")
  shopDescription: i18next.t("cosmetics.emote_hm_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  unlockable: false
  purchasable: true
}
cos[Emote.HealingMysticSad] = {
  id: Emote.HealingMysticSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_healing_mystic_sad.img
  rsx: RSX.emote_healing_mystic_sad
  title: "So Sad!"
  name: i18next.t("cosmetics.emote_hm_sad_name")
  shopDescription: i18next.t("cosmetics.emote_hm_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  unlockable: false
  purchasable: true
}
cos[Emote.HealingMysticThumbsUp] = {
  id: Emote.HealingMysticThumbsUp
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_healing_mystic_thumbs_up.img
  rsx: RSX.emote_healing_mystic_thumbs_up
  title: "Yay!"
  name: i18next.t("cosmetics.emote_hm_thumbs_up_name")
  shopDescription: i18next.t("cosmetics.emote_hm_thumbs_up_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  unlockable: false
  purchasable: true
}
cos[Emote.HealingMysticConfused] = {
  id: Emote.HealingMysticConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_healing_mystic_confused.img
  rsx: RSX.emote_healing_mystic_confused
  title: "Huh!?"
  name: i18next.t("cosmetics.emote_hm_surprise_name")
  shopDescription: i18next.t("cosmetics.emote_hm_surprise_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  unlockable: false
  purchasable: true
}
cos[Emote.HealingMysticBlink] = {
  id: Emote.HealingMysticBlink
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_healing_mystic_blink.img
  rsx: RSX.emote_healing_mystic_blink
  title: "Blink"
  name: i18next.t("cosmetics.emote_hm_blink_name")
  shopDescription: i18next.t("cosmetics.emote_hm_blink_desc")
  emoteOrder: EMOTE_ORDER_BOW
  factionId: Factions.Neutral
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  unlockable: false
  purchasable: true
}

# endregion HEALING MYSTIC

# region ALPHA

cos[Emote.OtherIcebladeDryad] = {
  id: Emote.OtherIcebladeDryad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Alpha"
  enabled: false
  alwaysVisible: false
  img: RSX.emote_alpha_iceblade_dryad.img
  rsx: RSX.emote_alpha_iceblade_dryad
  title: "Peace!"
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.OtherRook] = {
  id: Emote.OtherRook
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Alpha"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_alpha_rook.img
  rsx: RSX.emote_alpha_rook
  title: "Yeah Baby!"
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.OtherLightchaser] = {
  id: Emote.OtherLightchaser
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Alpha"
  enabled: false
  alwaysVisible: false
  img: RSX.emote_alpha_lightchaser.img
  rsx: RSX.emote_alpha_lightchaser
  title: "Blargh!"
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.OtherSnowChaserHoliday2015] = {
  id: Emote.OtherSnowChaserHoliday2015
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_neutral_snowchaser_holiday_2015.img
  rsx: RSX.emote_neutral_snowchaser_holiday_2015
  title: "Happy Holidays!"
  name: i18next.t("cosmetics.emote_holiday_snowchaser_name")
  shopDescription: i18next.t("cosmetics.emote_holiday_snowchaser_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: true
}
# endregion ALPHA

# region NEUTRAL

cos[Emote.emote_mechaz0r_cannon_confused] = {
  id: Emote.emote_mechaz0r_cannon_confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_mechaz0r_cannon_confused.img
  rsx: RSX.emote_mechaz0r_cannon_confused
  name: i18next.t("cosmetics.emote_cannon_mech_name")
  shopDescription: i18next.t("cosmetics.emote_cannon_mech_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_mechaz0r_chassis_angry] = {
  id: Emote.emote_mechaz0r_chassis_angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_mechaz0r_chassis_angry.img
  rsx: RSX.emote_mechaz0r_chassis_angry
  name: i18next.t("cosmetics.emote_chassis_mech_name")
  shopDescription: i18next.t("cosmetics.emote_chassis_mech_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_mechaz0r_helm_taunt] = {
  id: Emote.emote_mechaz0r_helm_taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_mechaz0r_helm_taunt.img
  rsx: RSX.emote_mechaz0r_helm_taunt
  name: i18next.t("cosmetics.emote_helm_mech_name")
  shopDescription: i18next.t("cosmetics.emote_helm_mech_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_mechaz0r_sad] = {
  id: Emote.emote_mechaz0r_sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_mechaz0r_sad.img
  rsx: RSX.emote_mechaz0r_sad
  name: i18next.t("cosmetics.emote_mechaz0r_name")
  shopDescription: i18next.t("cosmetics.emote_mechaz0r_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_mechaz0r_sword_frustrated] = {
  id: Emote.emote_mechaz0r_sword_frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_mechaz0r_sword_frustrated.img
  rsx: RSX.emote_mechaz0r_sword_frustrated
  name: i18next.t("cosmetics.emote_sword_mech_name")
  shopDescription: i18next.t("cosmetics.emote_sword_mech_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_mechaz0r_wings_happy] = {
  id: Emote.emote_mechaz0r_wings_happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_mechaz0r_wings_happy.img
  rsx: RSX.emote_mechaz0r_wings_happy
  name: i18next.t("cosmetics.emote_wings_mech_name")
  shopDescription: i18next.t("cosmetics.emote_wings_mech_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}

cos[Emote.emote_ladylocke] = {
  id: Emote.emote_ladylocke
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_ladylocke.img
  rsx: RSX.emote_ladylocke
  name: i18next.t("cosmetics.emote_lady_locke_name")
  shopDescription: i18next.t("cosmetics.emote_lady_locke_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_phalanxar_thumbsdown] = {
  id: Emote.emote_phalanxar_thumbsdown
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_phalanxar_thumbsdown.img
  rsx: RSX.emote_phalanxar_thumbsdown
  name: i18next.t("cosmetics.emote_phalanxar_name")
  shopDescription: i18next.t("cosmetics.emote_phalanxar_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Epic
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_snowchaser_bow] = {
  id: Emote.emote_snowchaser_bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_snowchaser_bow.img
  rsx: RSX.emote_snowchaser_bow
  name: i18next.t("cosmetics.emote_snowchaser_bow_name")
  shopDescription: i18next.t("cosmetics.emote_snowchaser_bow_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  rarityId: Rarity.Rare
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: false
  purchasable: true
}
cos[Emote.emote_hollowgrovekeeper] = {
  id: Emote.emote_hollowgrovekeeper
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_hollowgrovekeeper.img
  rsx: RSX.emote_hollowgrovekeeper
  name: i18next.t("cosmetics.emote_hollow_grovekeeper_name")
  shopDescription: i18next.t("cosmetics.emote_hollow_grovekeeper_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_lightbender] = {
  id: Emote.emote_lightbender
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_lightbender.img
  rsx: RSX.emote_lightbender
  name: i18next.t("cosmetics.emote_lightbender_name")
  shopDescription: i18next.t("cosmetics.emote_lightbender_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_primusfist] = {
  id: Emote.emote_primusfist
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_primusfist.img
  rsx: RSX.emote_primusfist
  name: i18next.t("cosmetics.emote_primus_fist_name")
  shopDescription: i18next.t("cosmetics.emote_primus_fist_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_zenrui] = {
  id: Emote.emote_zenrui
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_zenrui.img
  rsx: RSX.emote_zenrui
  name: i18next.t("cosmetics.emote_zenrui_name")
  shopDescription: i18next.t("cosmetics.emote_zenrui_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_bow] = {
  id: Emote.emote_fog_bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_bow.img
  rsx: RSX.emote_fog_bow
  name: i18next.t("cosmetics.emote_fog_bow_name")
  shopDescription: i18next.t("cosmetics.emote_fog_bow_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_confused] = {
  id: Emote.emote_fog_confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_confused.img
  rsx: RSX.emote_fog_confused
  name: i18next.t("cosmetics.emote_fog_confused_name")
  shopDescription: i18next.t("cosmetics.emote_fog_confused_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_dead] = {
  id: Emote.emote_fog_dead
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_dead.img
  rsx: RSX.emote_fog_dead
  name: i18next.t("cosmetics.emote_fog_gg_name")
  shopDescription: i18next.t("cosmetics.emote_fog_gg_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_frustrated] = {
  id: Emote.emote_fog_frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_frustrated.img
  rsx: RSX.emote_fog_frustrated
  name: i18next.t("cosmetics.emote_fog_sweat_name")
  shopDescription: i18next.t("cosmetics.emote_fog_sweat_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_happy] = {
  id: Emote.emote_fog_happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_happy.img
  rsx: RSX.emote_fog_happy
  name: i18next.t("cosmetics.emote_fog_happy_name")
  shopDescription: i18next.t("cosmetics.emote_fog_happy_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_sad] = {
  id: Emote.emote_fog_sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_sad.img
  rsx: RSX.emote_fog_sad
  name: i18next.t("cosmetics.emote_fog_cry_name")
  shopDescription: i18next.t("cosmetics.emote_fog_cry_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_sleep] = {
  id: Emote.emote_fog_sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_sleep.img
  rsx: RSX.emote_fog_sleep
  name: i18next.t("cosmetics.emote_fog_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_fog_sleep_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_sunglasses] = {
  id: Emote.emote_fog_sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_sunglasses.img
  rsx: RSX.emote_fog_sunglasses
  name: i18next.t("cosmetics.emote_fog_smile_name")
  shopDescription: i18next.t("cosmetics.emote_fog_smile_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_surprised] = {
  id: Emote.emote_fog_surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_surprised.img
  rsx: RSX.emote_fog_surprised
  name: i18next.t("cosmetics.emote_fog_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_fog_surprised_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_taunt_alt] = {
  id: Emote.emote_fog_taunt_alt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_taunt_alt.img
  rsx: RSX.emote_fog_taunt_alt
  name: i18next.t("cosmetics.emote_fog_kiss_name")
  shopDescription: i18next.t("cosmetics.emote_fog_kiss_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}
cos[Emote.emote_fog_taunt] = {
  id: Emote.emote_fog_taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Neutral"
  enabled: true
  alwaysVisible: false
  img: RSX.emote_fog_taunt.img
  rsx: RSX.emote_fog_taunt
  name: i18next.t("cosmetics.emote_fog_wink_name")
  shopDescription: i18next.t("cosmetics.emote_fog_wink_desc")
  emoteOrder: EMOTE_ORDER_CUSTOM
  category: EmoteCategory.Other
  factionId: Factions.Neutral
  unlockable: true
  purchasable: false
}


# endregion NEUTRAL


# region FACTION 1

cos[Emote.Faction1Taunt] = {
  id: Emote.Faction1Taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_taunt.img
  rsx: RSX.emote_f1_taunt
  title: "Taunt"
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Angry] = {
  id: Emote.Faction1Angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_angry.img
  rsx: RSX.emote_f1_angry
  title: "Angry"
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Confused] = {
  id: Emote.Faction1Confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_confused.img
  rsx: RSX.emote_f1_confused
  title: "Confused"
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Sad] = {
  id: Emote.Faction1Sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_sad.img
  rsx: RSX.emote_f1_sad
  title: "Sad"
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Frustrated] = {
  id: Emote.Faction1Frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_frustrated.img
  rsx: RSX.emote_f1_frustrated
  title: "Frustrated"
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Surprised] = {
  id: Emote.Faction1Surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_surprised.img
  rsx: RSX.emote_f1_surprised
  title: "Surprised"
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Bow] = {
  id: Emote.Faction1Bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_bow.img
  rsx: RSX.emote_f1_bow
  title: "Bow"
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Sleep] = {
  id: Emote.Faction1Sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_sleep.img
  rsx: RSX.emote_f1_sleep
  title: "Sleep"
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Sunglasses] = {
  id: Emote.Faction1Sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_sunglasses.img
  rsx: RSX.emote_f1_sunglasses
  title: "Sunglasses"
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1Happy] = {
  id: Emote.Faction1Happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_basic_happy.img
  rsx: RSX.emote_basic_happy
  title: "Happy"
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: false
}
cos[Emote.Faction1Kiss] = {
  id: Emote.Faction1Kiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_kiss.img
  rsx: RSX.emote_f1_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_argeon_love_name")
  shopDescription: i18next.t("cosmetics.emote_argeon_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.General
  unlockable: false
  purchasable: true
}

# endregion FACTION 1

# region FACTION 2

cos[Emote.Faction2Taunt] = {
  id: Emote.Faction2Taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_taunt.img
  rsx: RSX.emote_f2_taunt
  title: "Taunt"
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Happy] = {
  id: Emote.Faction2Happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_happy.img
  rsx: RSX.emote_f2_happy
  title: "Happy"
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Confused] = {
  id: Emote.Faction2Confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_confused.img
  rsx: RSX.emote_f2_confused
  title: "Confused"
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Sad] = {
  id: Emote.Faction2Sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_sad.img
  rsx: RSX.emote_f2_sad
  title: "Sad"
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Frustrated] = {
  id: Emote.Faction2Frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_frustrated.img
  rsx: RSX.emote_f2_frustrated
  title: "Frustrated"
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Surprised] = {
  id: Emote.Faction2Surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_surprised.img
  rsx: RSX.emote_f2_surprised
  title: "Surprised"
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Bow] = {
  id: Emote.Faction2Bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_bow.img
  rsx: RSX.emote_f2_bow
  title: "Bow"
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Sleep] = {
  id: Emote.Faction2Sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_sleep.img
  rsx: RSX.emote_f2_sleep
  title: "Sleep"
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Sunglasses] = {
  id: Emote.Faction2Sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_sunglasses.img
  rsx: RSX.emote_f2_sunglasses
  title: "Sunglasses"
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2Angry] = {
  id: Emote.Faction2Angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_basic_angry.img
  rsx: RSX.emote_basic_angry
  title: "Angry"
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: false
}
cos[Emote.Faction2Kiss] = {
  id: Emote.Faction2Kiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_kiss.img
  rsx: RSX.emote_f2_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_kaleos_love_name")
  shopDescription: i18next.t("cosmetics.emote_kaleos_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.General
  unlockable: false
  purchasable: true
}

# endregion FACTION 2

# region FACTION 3

cos[Emote.Faction3Taunt] = {
  id: Emote.Faction3Taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_taunt.img
  rsx: RSX.emote_f3_taunt
  title: "Taunt"
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Happy] = {
  id: Emote.Faction3Happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_happy.img
  rsx: RSX.emote_f3_happy
  title: "Happy"
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Angry] = {
  id: Emote.Faction3Angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_angry.img
  rsx: RSX.emote_f3_angry
  title: "Angry"
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Sad] = {
  id: Emote.Faction3Sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_sad.img
  rsx: RSX.emote_f3_sad
  title: "Sad"
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Frustrated] = {
  id: Emote.Faction3Frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_frustrated.img
  rsx: RSX.emote_f3_frustrated
  title: "Frustrated"
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Surprised] = {
  id: Emote.Faction3Surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_surprised.img
  rsx: RSX.emote_f3_surprised
  title: "Surprised"
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Bow] = {
  id: Emote.Faction3Bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_bow.img
  rsx: RSX.emote_f3_bow
  title: "Bow"
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Sleep] = {
  id: Emote.Faction3Sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_sleep.img
  rsx: RSX.emote_f3_sleep
  title: "Sleep"
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Sunglasses] = {
  id: Emote.Faction3Sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_sunglasses.img
  rsx: RSX.emote_f3_sunglasses
  title: "Sunglasses"
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3Confused] = {
  id: Emote.Faction3Confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_basic_confused.img
  rsx: RSX.emote_basic_confused
  title: "Confused"
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: false
}
cos[Emote.Faction3Kiss] = {
  id: Emote.Faction3Kiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_kiss.img
  rsx: RSX.emote_f3_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_zirix_love_name")
  shopDescription: i18next.t("cosmetics.emote_zirix_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.General
  unlockable: false
  purchasable: true
}

# endregion FACTION 3

# region FACTION 4

cos[Emote.Faction4Taunt] = {
  id: Emote.Faction4Taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_taunt.img
  rsx: RSX.emote_f4_teal_taunt
  title: "Taunt"
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Happy] = {
  id: Emote.Faction4Happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_happy.img
  rsx: RSX.emote_f4_teal_happy
  title: "Happy"
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Angry] = {
  id: Emote.Faction4Angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_angry.img
  rsx: RSX.emote_f4_teal_angry
  title: "Angry"
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Confused] = {
  id: Emote.Faction4Confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_confused.img
  rsx: RSX.emote_f4_teal_confused
  title: "Confused"
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Sad] = {
  id: Emote.Faction4Sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_sad.img
  rsx: RSX.emote_f4_teal_sad
  title: "Sad"
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Surprised] = {
  id: Emote.Faction4Surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_surprised.img
  rsx: RSX.emote_f4_teal_surprised
  title: "Surprised"
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Bow] = {
  id: Emote.Faction4Bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_bow.img
  rsx: RSX.emote_f4_teal_bow
  title: "Bow"
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Sleep] = {
  id: Emote.Faction4Sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_sleep.img
  rsx: RSX.emote_f4_teal_sleep
  title: "Sleep"
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Sunglasses] = {
  id: Emote.Faction4Sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_sunglasses.img
  rsx: RSX.emote_f4_teal_sunglasses
  title: "Sunglasses"
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4Frustrated] = {
  id: Emote.Faction4Frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_frustrated.img
  rsx: RSX.emote_f4_teal_frustrated
  title: "Frustrated"
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: false
}
cos[Emote.Faction4Kiss] = {
  id: Emote.Faction4Kiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_teal_kiss.img
  rsx: RSX.emote_f4_teal_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_lilithe_love_name")
  shopDescription: i18next.t("cosmetics.emote_lilithe_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.General
  unlockable: false
  purchasable: true
}

# endregion FACTION 4

# region FACTION 5

cos[Emote.Faction5Taunt] = {
  id: Emote.Faction5Taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_taunt.img
  rsx: RSX.emote_f5_taunt
  title: "Taunt"
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Happy] = {
  id: Emote.Faction5Happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_happy.img
  rsx: RSX.emote_f5_happy
  title: "Happy"
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Angry] = {
  id: Emote.Faction5Angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_angry.img
  rsx: RSX.emote_f5_angry
  title: "Angry"
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Confused] = {
  id: Emote.Faction5Confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_confused.img
  rsx: RSX.emote_f5_confused
  title: "Confused"
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Frustrated] = {
  id: Emote.Faction5Frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_frustrated.img
  rsx: RSX.emote_f5_frustrated
  title: "Frustrated"
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Surprised] = {
  id: Emote.Faction5Surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_surprised.img
  rsx: RSX.emote_f5_surprised
  title: "Surprised"
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Bow] = {
  id: Emote.Faction5Bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_bow.img
  rsx: RSX.emote_f5_bow
  title: "Bow"
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Sleep] = {
  id: Emote.Faction5Sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_sleep.img
  rsx: RSX.emote_f5_sleep
  title: "Sleep"
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Sunglasses] = {
  id: Emote.Faction5Sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_sunglasses.img
  rsx: RSX.emote_f5_sunglasses
  title: "Sunglasses"
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5Sad] = {
  id: Emote.Faction5Sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_basic_sad.img
  rsx: RSX.emote_basic_sad
  title: "Sad"
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: false
}
cos[Emote.Faction5Kiss] = {
  id: Emote.Faction5Kiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_kiss.img
  rsx: RSX.emote_f5_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_vaath_love_name")
  shopDescription: i18next.t("cosmetics.emote_vaath_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.General
  unlockable: false
  purchasable: true
}

# endregion FACTION 5

# region FACTION 6

cos[Emote.Faction6Frustrated] = {
  id: Emote.Faction6Frustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_frustrated.img
  rsx: RSX.emote_f6_frustrated
  title: "Frustrated"
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Happy] = {
  id: Emote.Faction6Happy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_happy.img
  rsx: RSX.emote_f6_happy
  title: "Happy"
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Angry] = {
  id: Emote.Faction6Angry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_angry.img
  rsx: RSX.emote_f6_angry
  title: "Angry"
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Confused] = {
  id: Emote.Faction6Confused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_confused.img
  rsx: RSX.emote_f6_confused
  title: "Confused"
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Sad] = {
  id: Emote.Faction6Sad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_sad.img
  rsx: RSX.emote_f6_sad
  title: "Sad"
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Surprised] = {
  id: Emote.Faction6Surprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_surprised.img
  rsx: RSX.emote_f6_surprised
  title: "Surprised"
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Bow] = {
  id: Emote.Faction6Bow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_bow.img
  rsx: RSX.emote_f6_bow
  title: "Bow"
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Sleep] = {
  id: Emote.Faction6Sleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_sleep.img
  rsx: RSX.emote_f6_sleep
  title: "Sleep"
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Sunglasses] = {
  id: Emote.Faction6Sunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_sunglasses.img
  rsx: RSX.emote_f6_sunglasses
  title: "Sunglasses"
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Taunt] = {
  id: Emote.Faction6Taunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_taunt.img
  rsx: RSX.emote_f6_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_faie_love_name")
  shopDescription: i18next.t("cosmetics.emote_faie_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6Kiss] = {
  id: Emote.Faction6Kiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_basic_kiss.img
  rsx: RSX.emote_basic_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_faie_kiss_name")
  shopDescription: i18next.t("cosmetics.emote_faie_kiss_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.General
  unlockable: false
  purchasable: false
}

# endregion FACTION 6

# region ALT GENERALS

# region FACTION 1 ALT

cos[Emote.Faction1AltTaunt] = {
  id: Emote.Faction1AltTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_taunt.img
  rsx: RSX.emote_f1_alt_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_ziran_wink_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltAngry] = {
  id: Emote.Faction1AltAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_angry.img
  rsx: RSX.emote_f1_alt_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_ziran_angry_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltConfused] = {
  id: Emote.Faction1AltConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_confused.img
  rsx: RSX.emote_f1_alt_confused
  name: i18next.t("cosmetics.emote_ziran_confused_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltSad] = {
  id: Emote.Faction1AltSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_sad.img
  rsx: RSX.emote_f1_alt_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_ziran_crying_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_crying_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltFrustrated] = {
  id: Emote.Faction1AltFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_frustrated.img
  rsx: RSX.emote_f1_alt_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_ziran_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltSurprised] = {
  id: Emote.Faction1AltSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_surprised.img
  rsx: RSX.emote_f1_alt_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_ziran_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltBow] = {
  id: Emote.Faction1AltBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_bow.img
  rsx: RSX.emote_f1_alt_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_ziran_bow_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltSleep] = {
  id: Emote.Faction1AltSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_sleep.img
  rsx: RSX.emote_f1_alt_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_ziran_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltSunglasses] = {
  id: Emote.Faction1AltSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_sunglasses.img
  rsx: RSX.emote_f1_alt_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_ziran_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltHappy] = {
  id: Emote.Faction1AltHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_happy.img
  rsx: RSX.emote_f1_alt_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_ziran_happy_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1AltKiss] = {
  id: Emote.Faction1AltKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_alt_kiss.img
  rsx: RSX.emote_f1_alt_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_ziran_love_name")
  shopDescription: i18next.t("cosmetics.emote_ziran_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.AltGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 1 ALT

# region FACTION 2 ALT

cos[Emote.Faction2AltTaunt] = {
  id: Emote.Faction2AltTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_taunt.img
  rsx: RSX.emote_f2_alt_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_reva_wink_name")
  shopDescription: i18next.t("cosmetics.emote_reva_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltHappy] = {
  id: Emote.Faction2AltHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_happy.img
  rsx: RSX.emote_f2_alt_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_reva_happy_name")
  shopDescription: i18next.t("cosmetics.emote_reva_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltConfused] = {
  id: Emote.Faction2AltConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_confused.img
  rsx: RSX.emote_f2_alt_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_reva_confused_name")
  shopDescription: i18next.t("cosmetics.emote_reva_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltSad] = {
  id: Emote.Faction2AltSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_sad.img
  rsx: RSX.emote_f2_alt_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_reva_sad_name")
  shopDescription: i18next.t("cosmetics.emote_reva_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltFrustrated] = {
  id: Emote.Faction2AltFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_frustrated.img
  rsx: RSX.emote_f2_alt_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_reva_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_reva_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltSurprised] = {
  id: Emote.Faction2AltSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_surprised.img
  rsx: RSX.emote_f2_alt_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_reva_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_reva_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltBow] = {
  id: Emote.Faction2AltBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_bow.img
  rsx: RSX.emote_f2_alt_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_reva_bow_name")
  shopDescription: i18next.t("cosmetics.emote_reva_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltSleep] = {
  id: Emote.Faction2AltSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_sleep.img
  rsx: RSX.emote_f2_alt_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_reva_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_reva_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltSunglasses] = {
  id: Emote.Faction2AltSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_sunglasses.img
  rsx: RSX.emote_f2_alt_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_reva_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_reva_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltAngry] = {
  id: Emote.Faction2AltAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_angry.img
  rsx: RSX.emote_f2_alt_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_reva_angry_name")
  shopDescription: i18next.t("cosmetics.emote_reva_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2AltKiss] = {
  id: Emote.Faction2AltKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_alt_kiss.img
  rsx: RSX.emote_f2_alt_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_reva_love_name")
  shopDescription: i18next.t("cosmetics.emote_reva_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.AltGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 2 ALT

# region FACTION 3 ALT

cos[Emote.Faction3AltTaunt] = {
  id: Emote.Faction3AltTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_taunt.img
  rsx: RSX.emote_f3_alt_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_sajj_wink_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltHappy] = {
  id: Emote.Faction3AltHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_happy.img
  rsx: RSX.emote_f3_alt_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_sajj_happy_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltAngry] = {
  id: Emote.Faction3AltAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_angry.img
  rsx: RSX.emote_f3_alt_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_sajj_angry_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltSad] = {
  id: Emote.Faction3AltSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_sad.img
  rsx: RSX.emote_f3_alt_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_sajj_sad_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltFrustrated] = {
  id: Emote.Faction3AltFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_frustrated.img
  rsx: RSX.emote_f3_alt_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_sajj_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltSurprised] = {
  id: Emote.Faction3AltSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_surprised.img
  rsx: RSX.emote_f3_alt_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_sajj_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltBow] = {
  id: Emote.Faction3AltBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_bow.img
  rsx: RSX.emote_f3_alt_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_sajj_bow_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltSleep] = {
  id: Emote.Faction3AltSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_sleep.img
  rsx: RSX.emote_f3_alt_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_sajj_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltSunglasses] = {
  id: Emote.Faction3AltSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_sunglasses.img
  rsx: RSX.emote_f3_alt_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_sajj_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltConfused] = {
  id: Emote.Faction3AltConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_confused.img
  rsx: RSX.emote_f3_alt_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_sajj_confused_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3AltKiss] = {
  id: Emote.Faction3AltKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_alt_kiss.img
  rsx: RSX.emote_f3_alt_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_sajj_love_name")
  shopDescription: i18next.t("cosmetics.emote_sajj_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.AltGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 3 ALT

# region FACTION 4 ALT

cos[Emote.Faction4AltTaunt] = {
  id: Emote.Faction4AltTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_taunt.img
  rsx: RSX.emote_f4_alt_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_cassyva_wink_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltHappy] = {
  id: Emote.Faction4AltHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_happy.img
  rsx: RSX.emote_f4_alt_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_cassyva_happy_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltAngry] = {
  id: Emote.Faction4AltAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_angry.img
  rsx: RSX.emote_f4_alt_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_cassyva_angry_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltConfused] = {
  id: Emote.Faction4AltConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_confused.img
  rsx: RSX.emote_f4_alt_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_cassyva_confused_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltSad] = {
  id: Emote.Faction4AltSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_sad.img
  rsx: RSX.emote_f4_alt_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_cassyva_sad_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltSurprised] = {
  id: Emote.Faction4AltSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_surprised.img
  rsx: RSX.emote_f4_alt_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_cassyva_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltBow] = {
  id: Emote.Faction4AltBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_bow.img
  rsx: RSX.emote_f4_alt_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_cassyva_bow_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltSleep] = {
  id: Emote.Faction4AltSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_sleep.img
  rsx: RSX.emote_f4_alt_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_cassyva_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltSunglasses] = {
  id: Emote.Faction4AltSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_sunglasses.img
  rsx: RSX.emote_f4_alt_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_cassyva_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltFrustrated] = {
  id: Emote.Faction4AltFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_frustrated.img
  rsx: RSX.emote_f4_alt_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_cassyva_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4AltKiss] = {
  id: Emote.Faction4AltKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_alt_kiss.img
  rsx: RSX.emote_f4_alt_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_cassyva_love_name")
  shopDescription: i18next.t("cosmetics.emote_cassyva_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.AltGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 4 ALT

# region FACTION 5 ALT

cos[Emote.Faction5AltTaunt] = {
  id: Emote.Faction5AltTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_taunt.img
  rsx: RSX.emote_f5_alt_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_starhorn_wink_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltHappy] = {
  id: Emote.Faction5AltHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_happy.img
  rsx: RSX.emote_f5_alt_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_starhorn_happy_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltAngry] = {
  id: Emote.Faction5AltAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_angry.img
  rsx: RSX.emote_f5_alt_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_starhorn_angry_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltConfused] = {
  id: Emote.Faction5AltConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_confused.img
  rsx: RSX.emote_f5_alt_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_starhorn_confused_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltFrustrated] = {
  id: Emote.Faction5AltFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_frustrated.img
  rsx: RSX.emote_f5_alt_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_starhorn_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltSurprised] = {
  id: Emote.Faction5AltSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_surprised.img
  rsx: RSX.emote_f5_alt_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_starhorn_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltBow] = {
  id: Emote.Faction5AltBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_bow.img
  rsx: RSX.emote_f5_alt_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_starhorn_bow_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltSleep] = {
  id: Emote.Faction5AltSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_sleep.img
  rsx: RSX.emote_f5_alt_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_starhorn_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltSunglasses] = {
  id: Emote.Faction5AltSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_sunglasses.img
  rsx: RSX.emote_f5_alt_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_starhorn_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltSad] = {
  id: Emote.Faction5AltSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_sad.img
  rsx: RSX.emote_f5_alt_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_starhorn_sad_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5AltKiss] = {
  id: Emote.Faction5AltKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_alt_kiss.img
  rsx: RSX.emote_f5_alt_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_starhorn_love_name")
  shopDescription: i18next.t("cosmetics.emote_starhorn_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.AltGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 5 ALT

# region FACTION 6 ALT

cos[Emote.Faction6AltFrustrated] = {
  id: Emote.Faction6AltFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_frustrated.img
  rsx: RSX.emote_f6_alt_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_kara_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_kara_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltHappy] = {
  id: Emote.Faction6AltHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_happy.img
  rsx: RSX.emote_f6_alt_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_kara_happy_name")
  shopDescription: i18next.t("cosmetics.emote_kara_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltAngry] = {
  id: Emote.Faction6AltAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_angry.img
  rsx: RSX.emote_f6_alt_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_kara_angry_name")
  shopDescription: i18next.t("cosmetics.emote_kara_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltConfused] = {
  id: Emote.Faction6AltConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_confused.img
  rsx: RSX.emote_f6_alt_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_kara_confused_name")
  shopDescription: i18next.t("cosmetics.emote_kara_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltSad] = {
  id: Emote.Faction6AltSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_sad.img
  rsx: RSX.emote_f6_alt_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_kara_sad_name")
  shopDescription: i18next.t("cosmetics.emote_kara_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltSurprised] = {
  id: Emote.Faction6AltSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_surprised.img
  rsx: RSX.emote_f6_alt_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_kara_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_kara_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltBow] = {
  id: Emote.Faction6AltBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_bow.img
  rsx: RSX.emote_f6_alt_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_kara_bow_name")
  shopDescription: i18next.t("cosmetics.emote_kara_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltSleep] = {
  id: Emote.Faction6AltSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_sleep.img
  rsx: RSX.emote_f6_alt_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_kara_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_kara_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltSunglasses] = {
  id: Emote.Faction6AltSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_sunglasses.img
  rsx: RSX.emote_f6_alt_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_kara_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_kara_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltTaunt] = {
  id: Emote.Faction6AltTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_taunt.img
  rsx: RSX.emote_f6_alt_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_kara_wink_name")
  shopDescription: i18next.t("cosmetics.emote_kara_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6AltKiss] = {
  id: Emote.Faction6AltKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_alt_kiss.img
  rsx: RSX.emote_f6_alt_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_kara_love_name")
  shopDescription: i18next.t("cosmetics.emote_kara_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.AltGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 6 ALT

# endregion ALT GENERALS

# region THIRD GENERALS

# region FACTION 1 THIRD

cos[Emote.Faction1ThirdTaunt] = {
  id: Emote.Faction1ThirdTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_taunt.img
  rsx: RSX.emote_f1_third_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_brome_wink_name")
  shopDescription: i18next.t("cosmetics.emote_brome_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdAngry] = {
  id: Emote.Faction1ThirdAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_angry.img
  rsx: RSX.emote_f1_third_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_brome_angry_name")
  shopDescription: i18next.t("cosmetics.emote_brome_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdConfused] = {
  id: Emote.Faction1ThirdConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_confused.img
  rsx: RSX.emote_f1_third_confused
  name: i18next.t("cosmetics.emote_brome_confused_name")
  shopDescription: i18next.t("cosmetics.emote_brome_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdSad] = {
  id: Emote.Faction1ThirdSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_sad.img
  rsx: RSX.emote_f1_third_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_brome_crying_name")
  shopDescription: i18next.t("cosmetics.emote_brome_crying_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdFrustrated] = {
  id: Emote.Faction1ThirdFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_frustrated.img
  rsx: RSX.emote_f1_third_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_brome_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_brome_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdSurprised] = {
  id: Emote.Faction1ThirdSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_surprised.img
  rsx: RSX.emote_f1_third_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_brome_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_brome_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdBow] = {
  id: Emote.Faction1ThirdBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_bow.img
  rsx: RSX.emote_f1_third_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_brome_bow_name")
  shopDescription: i18next.t("cosmetics.emote_brome_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdSleep] = {
  id: Emote.Faction1ThirdSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_sleep.img
  rsx: RSX.emote_f1_third_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_brome_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_brome_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdSunglasses] = {
  id: Emote.Faction1ThirdSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_sunglasses.img
  rsx: RSX.emote_f1_third_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_brome_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_brome_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdHappy] = {
  id: Emote.Faction1ThirdHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_happy.img
  rsx: RSX.emote_f1_third_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_brome_happy_name")
  shopDescription: i18next.t("cosmetics.emote_brome_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction1ThirdKiss] = {
  id: Emote.Faction1ThirdKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Lyonar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f1_third_kiss.img
  rsx: RSX.emote_f1_third_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_brome_love_name")
  shopDescription: i18next.t("cosmetics.emote_brome_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction1
  generalId: Cards.Faction1.ThirdGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 1 THIRD

# region FACTION 2 THIRD

cos[Emote.Faction2ThirdTaunt] = {
  id: Emote.Faction2ThirdTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_taunt.img
  rsx: RSX.emote_f2_third_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_shidai_wink_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdHappy] = {
  id: Emote.Faction2ThirdHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_happy.img
  rsx: RSX.emote_f2_third_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_shidai_happy_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdConfused] = {
  id: Emote.Faction2ThirdConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_confused.img
  rsx: RSX.emote_f2_third_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_shidai_confused_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdSad] = {
  id: Emote.Faction2ThirdSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_sad.img
  rsx: RSX.emote_f2_third_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_shidai_sad_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdFrustrated] = {
  id: Emote.Faction2ThirdFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_frustrated.img
  rsx: RSX.emote_f2_third_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_shidai_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdSurprised] = {
  id: Emote.Faction2ThirdSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_surprised.img
  rsx: RSX.emote_f2_third_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_shidai_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdBow] = {
  id: Emote.Faction2ThirdBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_bow.img
  rsx: RSX.emote_f2_third_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_shidai_bow_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdSleep] = {
  id: Emote.Faction2ThirdSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_sleep.img
  rsx: RSX.emote_f2_third_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_shidai_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdSunglasses] = {
  id: Emote.Faction2ThirdSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_sunglasses.img
  rsx: RSX.emote_f2_third_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_shidai_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdAngry] = {
  id: Emote.Faction2ThirdAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_angry.img
  rsx: RSX.emote_f2_third_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_shidai_angry_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction2ThirdKiss] = {
  id: Emote.Faction2ThirdKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Songhai"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f2_third_kiss.img
  rsx: RSX.emote_f2_third_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_shidai_love_name")
  shopDescription: i18next.t("cosmetics.emote_shidai_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction2
  generalId: Cards.Faction2.ThirdGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 2 THIRD

# region FACTION 3 THIRD

cos[Emote.Faction3ThirdTaunt] = {
  id: Emote.Faction3ThirdTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_taunt.img
  rsx: RSX.emote_f3_third_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_ciphyron_wink_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdHappy] = {
  id: Emote.Faction3ThirdHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_happy.img
  rsx: RSX.emote_f3_third_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_ciphyron_happy_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdAngry] = {
  id: Emote.Faction3ThirdAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_angry.img
  rsx: RSX.emote_f3_third_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_ciphyron_angry_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdSad] = {
  id: Emote.Faction3ThirdSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_sad.img
  rsx: RSX.emote_f3_third_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_ciphyron_sad_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdFrustrated] = {
  id: Emote.Faction3ThirdFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_frustrated.img
  rsx: RSX.emote_f3_third_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_ciphyron_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdSurprised] = {
  id: Emote.Faction3ThirdSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_surprised.img
  rsx: RSX.emote_f3_third_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_ciphyron_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdBow] = {
  id: Emote.Faction3ThirdBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_bow.img
  rsx: RSX.emote_f3_third_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_ciphyron_bow_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdSleep] = {
  id: Emote.Faction3ThirdSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_sleep.img
  rsx: RSX.emote_f3_third_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_ciphyron_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdSunglasses] = {
  id: Emote.Faction3ThirdSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_sunglasses.img
  rsx: RSX.emote_f3_third_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_ciphyron_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdConfused] = {
  id: Emote.Faction3ThirdConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_confused.img
  rsx: RSX.emote_f3_third_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_ciphyron_confused_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction3ThirdKiss] = {
  id: Emote.Faction3ThirdKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vetruvian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f3_third_kiss.img
  rsx: RSX.emote_f3_third_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_ciphyron_love_name")
  shopDescription: i18next.t("cosmetics.emote_ciphyron_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction3
  generalId: Cards.Faction3.ThirdGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 3 THIRD

# region FACTION 4 THIRD

cos[Emote.Faction4ThirdTaunt] = {
  id: Emote.Faction4ThirdTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_taunt.img
  rsx: RSX.emote_f4_third_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_maehv_wink_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdHappy] = {
  id: Emote.Faction4ThirdHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_happy.img
  rsx: RSX.emote_f4_third_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_maehv_happy_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdAngry] = {
  id: Emote.Faction4ThirdAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_angry.img
  rsx: RSX.emote_f4_third_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_maehv_angry_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdConfused] = {
  id: Emote.Faction4ThirdConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_confused.img
  rsx: RSX.emote_f4_third_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_maehv_confused_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdSad] = {
  id: Emote.Faction4ThirdSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_sad.img
  rsx: RSX.emote_f4_third_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_maehv_sad_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdSurprised] = {
  id: Emote.Faction4ThirdSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_surprised.img
  rsx: RSX.emote_f4_third_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_maehv_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdBow] = {
  id: Emote.Faction4ThirdBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_bow.img
  rsx: RSX.emote_f4_third_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_maehv_bow_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdSleep] = {
  id: Emote.Faction4ThirdSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_sleep.img
  rsx: RSX.emote_f4_third_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_maehv_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdSunglasses] = {
  id: Emote.Faction4ThirdSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_sunglasses.img
  rsx: RSX.emote_f4_third_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_maehv_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdFrustrated] = {
  id: Emote.Faction4ThirdFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_frustrated.img
  rsx: RSX.emote_f4_third_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_maehv_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction4ThirdKiss] = {
  id: Emote.Faction4ThirdKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Abyssian"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f4_third_kiss.img
  rsx: RSX.emote_f4_third_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_maehv_love_name")
  shopDescription: i18next.t("cosmetics.emote_maehv_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction4
  generalId: Cards.Faction4.ThirdGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 4 THIRD

# region FACTION 5 THIRD

cos[Emote.Faction5ThirdTaunt] = {
  id: Emote.Faction5ThirdTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_taunt.img
  rsx: RSX.emote_f5_third_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_ragnora_wink_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdHappy] = {
  id: Emote.Faction5ThirdHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_happy.img
  rsx: RSX.emote_f5_third_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_ragnora_happy_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdAngry] = {
  id: Emote.Faction5ThirdAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_angry.img
  rsx: RSX.emote_f5_third_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_ragnora_angry_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdConfused] = {
  id: Emote.Faction5ThirdConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_confused.img
  rsx: RSX.emote_f5_third_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_ragnora_confused_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdFrustrated] = {
  id: Emote.Faction5ThirdFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_frustrated.img
  rsx: RSX.emote_f5_third_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_ragnora_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdSurprised] = {
  id: Emote.Faction5ThirdSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_surprised.img
  rsx: RSX.emote_f5_third_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_ragnora_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdBow] = {
  id: Emote.Faction5ThirdBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_bow.img
  rsx: RSX.emote_f5_third_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_ragnora_bow_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdSleep] = {
  id: Emote.Faction5ThirdSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_sleep.img
  rsx: RSX.emote_f5_third_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_ragnora_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdSunglasses] = {
  id: Emote.Faction5ThirdSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_sunglasses.img
  rsx: RSX.emote_f5_third_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_ragnora_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdSad] = {
  id: Emote.Faction5ThirdSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_sad.img
  rsx: RSX.emote_f5_third_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_ragnora_sad_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction5ThirdKiss] = {
  id: Emote.Faction5ThirdKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Magmar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f5_third_kiss.img
  rsx: RSX.emote_f5_third_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_ragnora_love_name")
  shopDescription: i18next.t("cosmetics.emote_ragnora_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction5
  generalId: Cards.Faction5.ThirdGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 5 THIRD

# region FACTION 6 THIRD

cos[Emote.Faction6ThirdFrustrated] = {
  id: Emote.Faction6ThirdFrustrated
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_frustrated.img
  rsx: RSX.emote_f6_third_frustrated
  title: "Frustrated"
  name: i18next.t("cosmetics.emote_ilena_frustrated_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_frustrated_desc")
  emoteOrder: EMOTE_ORDER_FRUSTRATED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdHappy] = {
  id: Emote.Faction6ThirdHappy
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_happy.img
  rsx: RSX.emote_f6_third_happy
  title: "Happy"
  name: i18next.t("cosmetics.emote_ilena_happy_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_happy_desc")
  emoteOrder: EMOTE_ORDER_HAPPY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdAngry] = {
  id: Emote.Faction6ThirdAngry
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_angry.img
  rsx: RSX.emote_f6_third_angry
  title: "Angry"
  name: i18next.t("cosmetics.emote_ilena_angry_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_angry_desc")
  emoteOrder: EMOTE_ORDER_ANGRY
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdConfused] = {
  id: Emote.Faction6ThirdConfused
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_confused.img
  rsx: RSX.emote_f6_third_confused
  title: "Confused"
  name: i18next.t("cosmetics.emote_ilena_confused_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_confused_desc")
  emoteOrder: EMOTE_ORDER_CONFUSED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdSad] = {
  id: Emote.Faction6ThirdSad
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_sad.img
  rsx: RSX.emote_f6_third_sad
  title: "Sad"
  name: i18next.t("cosmetics.emote_ilena_sad_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_sad_desc")
  emoteOrder: EMOTE_ORDER_SAD
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdSurprised] = {
  id: Emote.Faction6ThirdSurprised
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_surprised.img
  rsx: RSX.emote_f6_third_surprised
  title: "Surprised"
  name: i18next.t("cosmetics.emote_ilena_surprised_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_surprised_desc")
  emoteOrder: EMOTE_ORDER_SURPRISED
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdBow] = {
  id: Emote.Faction6ThirdBow
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_bow.img
  rsx: RSX.emote_f6_third_bow
  title: "Bow"
  name: i18next.t("cosmetics.emote_ilena_bow_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_bow_desc")
  emoteOrder: EMOTE_ORDER_BOW
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdSleep] = {
  id: Emote.Faction6ThirdSleep
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_sleep.img
  rsx: RSX.emote_f6_third_sleep
  title: "Sleep"
  name: i18next.t("cosmetics.emote_ilena_sleep_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_sleep_desc")
  emoteOrder: EMOTE_ORDER_SLEEP
  rarityId: Rarity.Rare
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdSunglasses] = {
  id: Emote.Faction6ThirdSunglasses
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_sunglasses.img
  rsx: RSX.emote_f6_third_sunglasses
  title: "Sunglasses"
  name: i18next.t("cosmetics.emote_ilena_sunglasses_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_sunglasses_desc")
  emoteOrder: EMOTE_ORDER_SUNGLASSES
  rarityId: Rarity.Epic
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdTaunt] = {
  id: Emote.Faction6ThirdTaunt
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_taunt.img
  rsx: RSX.emote_f6_third_taunt
  title: "Taunt"
  name: i18next.t("cosmetics.emote_ilena_wink_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_wink_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}
cos[Emote.Faction6ThirdKiss] = {
  id: Emote.Faction6ThirdKiss
  typeId: CosmeticsTypeLookup.Emote
  subTypeId: "Vanar"
  enabled: true
  alwaysVisible: true
  img: RSX.emote_f6_third_kiss.img
  rsx: RSX.emote_f6_third_kiss
  title: "Kiss"
  name: i18next.t("cosmetics.emote_ilena_love_name")
  shopDescription: i18next.t("cosmetics.emote_ilena_love_desc")
  emoteOrder: EMOTE_ORDER_TAUNT
  rarityId: Rarity.Common
  category: EmoteCategory.Faction
  factionId: Factions.Faction6
  generalId: Cards.Faction6.ThirdGeneral
  unlockable: false
  purchasable: true
}

# endregion FACTION 6 THIRD

# endregion THIRD GENERALS

# endregion emotes

# region Battlemaps

cos[BattleMap.Magmar] = {
  id: BattleMap.Magmar
  typeId: CosmeticsTypeLookup.BattleMap
  name: i18next.t("cosmetics.battlemap_magmar_name")
  shopDescription: i18next.t("cosmetics.battlemap_magmar_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Legendary
  img: RSX.shop_battle_map_magmar.img
  rsx: RSX.shop_battle_map_magmar
  unlockable: false
  purchasable: true
  battleMapTemplateIndex: 7
}
cos[BattleMap.Abyssian] = {
  id: BattleMap.Abyssian
  typeId: CosmeticsTypeLookup.BattleMap
  name: i18next.t("cosmetics.battlemap_abyssian_name")
  shopDescription: i18next.t("cosmetics.battlemap_abyssian_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Legendary
  img: RSX.shop_battle_map_abyssian.img
  rsx: RSX.shop_battle_map_abyssian
  unlockable: false
  purchasable: true
  battleMapTemplateIndex: 8
}
cos[BattleMap.Redrock] = {
  id: BattleMap.Redrock
  typeId: CosmeticsTypeLookup.BattleMap
  name: i18next.t("cosmetics.battlemap_redrock_name")
  shopDescription: i18next.t("cosmetics.battlemap_redrock_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Legendary
  img: RSX.shop_battle_map_redrock.img
  rsx: RSX.shop_battle_map_redrock
  unlockable: false
  purchasable: true
  battleMapTemplateIndex: 9
}
cos[BattleMap.Vanar] = {
  id: BattleMap.Vanar
  typeId: CosmeticsTypeLookup.BattleMap
  name: i18next.t("cosmetics.battlemap_vanar_name")
  shopDescription: i18next.t("cosmetics.battlemap_vanar_desc")
  enabled: true
  alwaysVisible: true
  order: ORDER_SCENES
  rarityId: Rarity.Legendary
  img: RSX.shop_battle_map_vanar.img
  rsx: RSX.shop_battle_map_vanar
  unlockable: false
  purchasable: true
  battleMapTemplateIndex: 10
}

# endregion Battlemaps

# endregion Cosmetics datas



# Generate skus procedurally
for cosmeticTypeKey,cosmeticsOfType of CosmeticsLookup
  if not cosmeticsOfType? or !_.isObject(cosmeticsOfType)
    continue
  cosmeticTypeId = CosmeticsTypeLookup[cosmeticTypeKey]
  if not cosmeticTypeId?
    continue
  for cosmeticKey,cosmeticId of cosmeticsOfType
    cosmeticData = cos[cosmeticId]
    if not cosmeticData?
      continue
    cosmeticData.sku = cosmeticTypeId + "-" + cosmeticKey + "-" + cosmeticId

## Generate default subTypes
#for cosId,cosForSubtype of cos
#  if cosForSubtype.subType?
#    continue
#  if cosForSubtype.typeId == CosmeticsTypeLookup.Emote && cosForSubtype.factionId?
#    subType = "n/a"
#    if subType?
#      cosForSubtype.subType = subType
#
#  cosForSubtype.subTypeId ?= "n/a"

# setup caches
CosmeticsFactory._cachedCosmetics = []
CosmeticsFactory._cachedCosmeticsForType = {}
CosmeticsFactory._cachedCosmeticsForTypeAndFaction = {}
CosmeticsFactory._cachedCosmeticsForTypeAndRarity = {}
CosmeticsFactory._cachedCosmeticsForTypeAndFactionAndRarity = {}
CosmeticsFactory._cachedCosmeticsForFaction = {}
CosmeticsFactory._cachedCosmeticsForRarity = {}
CosmeticsFactory._cachedCosmeticsForChestType = {}
CosmeticsFactory._cachedCosmeticsForTypeAndSubType = {}
CosmeticsFactory._cachedCosmeticSubTypesByType = {}
CosmeticsFactory._cachedCardSkinsForCardId = {}
CosmeticsFactory._cachedCardSkinIdsForCardId = {}

# ensure that all cosmetic types, rarities, factions, and chest types have at least an empty array
cosmeticTypes = Object.keys(CosmeticsTypeLookup)
cosmeticChestTypes = Object.keys(CosmeticsChestTypeLookup)
factionIds = Object.keys(Factions)
rarityIds = Object.keys(Rarity)

for cosmeticTypeKey in cosmeticTypes
  type = CosmeticsTypeLookup[cosmeticTypeKey]
  CosmeticsFactory._cachedCosmeticsForType[type] ?= []
  CosmeticsFactory._cachedCosmeticSubTypesByType[type] ?= []

  for factionIdKey in factionIds
    factionId = Factions[factionIdKey]
    CosmeticsFactory._cachedCosmeticsForTypeAndFaction[type] ?= []
    CosmeticsFactory._cachedCosmeticsForTypeAndFaction[type][factionId] ?= []

    for rarityIdKey in rarityIds
      rarityId = Rarity[rarityIdKey]
      CosmeticsFactory._cachedCosmeticsForTypeAndFactionAndRarity[type] ?= []
      CosmeticsFactory._cachedCosmeticsForTypeAndFactionAndRarity[type][factionId] ?= []
      CosmeticsFactory._cachedCosmeticsForTypeAndFactionAndRarity[type][factionId][rarityId] ?= []

  for rarityIdKey in rarityIds
    rarityId = Rarity[rarityIdKey]
    CosmeticsFactory._cachedCosmeticsForTypeAndRarity[type] ?= []
    CosmeticsFactory._cachedCosmeticsForTypeAndRarity[type][rarityId] ?= []

  CosmeticsFactory._cachedCosmeticsForTypeAndSubType[type] ?= {}

for factionIdKey in factionIds
  factionId = Factions[factionIdKey]
  CosmeticsFactory._cachedCosmeticsForFaction[factionId] ?= []

for rarityIdKey in rarityIds
  rarityId = Rarity[rarityIdKey]
  CosmeticsFactory._cachedCosmeticsForRarity[rarityId] ?= []

for cosmeticChestTypeKey in cosmeticChestTypes
  chestType = CosmeticsChestTypeLookup[cosmeticChestTypeKey]
  CosmeticsFactory._cachedCosmeticsForChestType[chestType] ?= []


# add all cosmetics to caches
cosmeticIdKeys = Object.keys(CosmeticsFactory._cosmeticsById)
for cosmeticIdKey of cosmeticIdKeys
  cosmeticId = cosmeticIdKeys[cosmeticIdKey]
  cosmeticData = CosmeticsFactory._cosmeticsById[cosmeticId]
  type = cosmeticData.typeId
  factionId = cosmeticData.factionId
  rarityId = cosmeticData.rarityId
  chestType = cosmeticData.chestType
  subType = cosmeticData.subTypeId

  CosmeticsFactory._cachedCosmetics.push(cosmeticData)

  if type?
    CosmeticsFactory._cachedCosmeticsForType[type].push(cosmeticData)

    if factionId?
      CosmeticsFactory._cachedCosmeticsForTypeAndFaction[type][factionId].push(cosmeticData)

    if rarityId?
      CosmeticsFactory._cachedCosmeticsForTypeAndRarity[type][rarityId].push(cosmeticData)

    if factionId? and rarityId?
      CosmeticsFactory._cachedCosmeticsForTypeAndFactionAndRarity[type][factionId][rarityId].push(cosmeticData)

    if subType?
      CosmeticsFactory._cachedCosmeticsForTypeAndSubType[type][subType] ?= []
      CosmeticsFactory._cachedCosmeticsForTypeAndSubType[type][subType].push(cosmeticData)

      if not _.contains(CosmeticsFactory._cachedCosmeticSubTypesByType[type],subType)
        CosmeticsFactory._cachedCosmeticSubTypesByType[type].push(subType)

    if type == CosmeticsTypeLookup.CardSkin
      cardId = cosmeticData.cardId
      if cardId?
        CosmeticsFactory._cachedCardSkinsForCardId[cardId] ?= []
        CosmeticsFactory._cachedCardSkinsForCardId[cardId].push(cosmeticData)
        CosmeticsFactory._cachedCardSkinIdsForCardId[cardId] ?= []
        CosmeticsFactory._cachedCardSkinIdsForCardId[cardId].push(cosmeticData.id)

  if factionId?
    CosmeticsFactory._cachedCosmeticsForFaction[factionId].push(cosmeticData)

  if rarityId?
    CosmeticsFactory._cachedCosmeticsForRarity[rarityId].push(cosmeticData)

  if chestType?
    CosmeticsFactory._cachedCosmeticsForChestType[chestType].push(cosmeticData)

# Generate default descriptions
# TODO: Better language for shop descriptors
_getEmotionDescriptor = (emoteOrder) ->
  if emoteOrder == EMOTE_ORDER_ANGRY
    return i18next.t("cosmetics.emote_anger")
  else if emoteOrder == EMOTE_ORDER_BOW
    return i18next.t("cosmetics.emote_respect")
  else if emoteOrder == EMOTE_ORDER_CONFUSED
    return i18next.t("cosmetics.emote_confusion")
  else if emoteOrder == EMOTE_ORDER_FRUSTRATED
    return i18next.t("cosmetics.emote_frustration")
  else if emoteOrder == EMOTE_ORDER_HAPPY
    return i18next.t("cosmetics.emote_happiness")
  else if emoteOrder == EMOTE_ORDER_SAD
    return i18next.t("cosmetics.emote_sadness")
  else if emoteOrder == EMOTE_ORDER_SLEEP
    return i18next.t("cosmetics.emote_impatience")
  else if emoteOrder == EMOTE_ORDER_SUNGLASSES
    return i18next.t("cosmetics.emote_style")
  else if emoteOrder == EMOTE_ORDER_SURPRISED
    return i18next.t("cosmetics.emote_surprise")
  else if emoteOrder == EMOTE_ORDER_TAUNT
    return i18next.t("cosmetics.emote_confidence")
  else if emoteOrder == EMOTE_ORDER_KISS
    return i18next.t("cosmetics.emote_love")
  else
    return i18next.t("cosmetics.emote_emotion")
allCosForDesc = CosmeticsFactory.getAllCosmetics()
for cosForDesc in allCosForDesc
  if cosForDesc.shopDescription?
    continue
  if cosForDesc.typeId == CosmeticsTypeLookup.CardBack
    cosForDesc.shopDescription = i18next.t("cosmetics.cardback_desc")
  else if cosForDesc.typeId == CosmeticsTypeLookup.Scene
    cosForDesc.shopDescription = i18next.t("cosmetics.scene_desc")
  else if cosForDesc.typeId == CosmeticsTypeLookup.ProfileIcon
    cosForDesc.shopDescription = i18next.t("cosmetics.icon_desc")
  else if cosForDesc.typeId == CosmeticsTypeLookup.Emote
    generalDescriptor = ""
    if cosForDesc.generalId?
      if cosForDesc.generalId == Cards.Faction1.General then generalDescriptor = i18next.t("cosmetics.shop_emote_argeon")
      if cosForDesc.generalId == Cards.Faction1.AltGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_ziran")
      if cosForDesc.generalId == Cards.Faction1.ThirdGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_brome")
      if cosForDesc.generalId == Cards.Faction2.General then generalDescriptor = i18next.t("cosmetics.shop_emote_kaleos")
      if cosForDesc.generalId == Cards.Faction2.AltGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_reva")
      if cosForDesc.generalId == Cards.Faction2.ThirdGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_shidai")
      if cosForDesc.generalId == Cards.Faction3.General then generalDescriptor = i18next.t("cosmetics.shop_emote_zirix")
      if cosForDesc.generalId == Cards.Faction3.AltGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_sajj")
      if cosForDesc.generalId == Cards.Faction3.ThirdGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_ciphyron")
      if cosForDesc.generalId == Cards.Faction4.General then generalDescriptor = i18next.t("cosmetics.shop_emote_lilithe")
      if cosForDesc.generalId == Cards.Faction4.AltGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_cassyva")
      if cosForDesc.generalId == Cards.Faction4.ThirdGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_maehv")
      if cosForDesc.generalId == Cards.Faction5.General then generalDescriptor = i18next.t("cosmetics.shop_emote_vaath")
      if cosForDesc.generalId == Cards.Faction5.AltGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_starhorn")
      if cosForDesc.generalId == Cards.Faction5.ThirdGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_ragnora")
      if cosForDesc.generalId == Cards.Faction6.General then generalDescriptor = i18next.t("cosmetics.shop_emote_faie")
      if cosForDesc.generalId == Cards.Faction6.AltGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_kara")
      if cosForDesc.generalId == Cards.Faction6.ThirdGeneral then generalDescriptor = i18next.t("cosmetics.shop_emote_ilena")
    cosForDesc.shopDescription = i18next.t("cosmetics.shop_emote",{emote:_getEmotionDescriptor(cosForDesc.emoteOrder)},{general:generalDescriptor})
    #cosForDesc.shopDescription = "Express your #{_getEmotionDescriptor(cosForDesc.emoteOrder)} in game#{generalDescriptor}"
# Set default reward orders
allCosForRewardOrder = CosmeticsFactory.getAllCosmetics()
for cosForOrder in allCosForRewardOrder
  if not cosForOrder.rewardOrder?
    cosForOrder.rewardOrder = 0

module.exports = CosmeticsFactory
