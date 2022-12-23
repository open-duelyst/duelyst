Logger = require 'app/common/logger'

# regex requires into cache generation code with the following
# find: ([A-z]+) = ([ \S])*[\n]*
# subs: @_achievementsCache[$1.id] = new $1()\n

# Armory
NamasteAchievement = require './armoryBasedAchievements/namasteAchievement'
BronzeStarterBundleAchievement = require './armoryBasedAchievements/bronzeStarterBundleAchievement'
SilverStarterBundleAchievement = require './armoryBasedAchievements/silverStarterBundleAchievement'
GoldStarterBundleAchievement = require './armoryBasedAchievements/goldStarterBundleAchievement'

# Referral
FirstReferralPurchase = require './referralBasedAchievements/firstReferralPurchaseAchievement'

# Crafting
WelcomeToCraftingAchievement = require './craftingBasedAchievements/welcomeToCraftingAchievement'

# Game based
BestOfFriendsAchievement = require './gameBasedAchievements/bestOfFriendsAchievement'
EnteringGauntletAchievement = require './gameBasedAchievements/enteringGauntletAchievement'
HelpingHandAchievement = require './gameBasedAchievements/helpingHandAchievement'
TheArtOfWarAchievement = require './gameBasedAchievements/theArtOfWarAchievement'
HomeTurfAchievement = require './gameBasedAchievements/homeTurfAchievement'

# faction progress based
BloodbornAchievement = require './factionProgressBasedAchievements/bloodbornAchievement'
WorldExplorerAchievement = require './factionProgressBasedAchievements/worldExplorerAchievement'

# inventory based
CollectorSupremeAchievement = require './inventoryBasedAchievements/collectorSupremeAchievement'
SwornSisterAchievement = require './inventoryBasedAchievements/swornSisterAchievement'
SunSisterAchievement = require './inventoryBasedAchievements/sunSisterAchievement'
LightningSisterAchievement = require './inventoryBasedAchievements/lightningSisterAchievement'
SandSisterAchievement = require './inventoryBasedAchievements/sandSisterAchievement'
ShadowSisterAchievement = require './inventoryBasedAchievements/shadowSisterAchievement'
EarthSisterAchievement = require './inventoryBasedAchievements/earthSisterAchievement'
WindSisterAchievement = require './inventoryBasedAchievements/windSisterAchievement'
FirstLootCrateAchievement = require './inventoryBasedAchievements/firstLootCrateAchievement.coffee'

# quest based
EpicQuestorAchievement = require './questBasedAchievements/epicQuestorAchievement'
IndomitableSpiritAchievement = require './questBasedAchievements/indomitableSpiritAchievement'
LegendaryQuestorAchievement = require './questBasedAchievements/legendaryQuestorAchievement'
JourneymanQuestorAchievement = require './questBasedAchievements/journeymanQuestorAchievement'

# rank based
SilverDivisionAchievement = require './rankBasedAchievements/silverDivisionAchievement'

# login based
BNPromoAchievement = require './loginBasedAchievements/bnPromoAchievement'
MidAugLoginAchievement = require './loginBasedAchievements/midAugLoginAchievement'
MidNov2017LoginAchievement = require './loginBasedAchievements/midNov2017LoginAchievement'
FrostfirePurchasable2017 = require './loginBasedAchievements/frostfire2017LoginAchievement.coffee'
FrostfireBonus2017 = require './loginBasedAchievements/frostfire2017BonusLoginAchievement.coffee'
EarlyFeb2018LoginAchievement = require './loginBasedAchievements/earlyFeb2018LoginAchievement.coffee'
CoreshatterLoginAchievement = require './loginBasedAchievements/coreshatterLoginAchievement.coffee'
MemorialDayLoginAchievement = require './loginBasedAchievements/memorialDayLoginAchievement.coffee'
FathersDayLoginAchievement = require './loginBasedAchievements/fathersDayLoginAchievement.coffee'
FourthOfJulyLoginAchievement = require './loginBasedAchievements/fourthOfJulyLoginAchievement.coffee'
SummerLoginAchievement = require './loginBasedAchievements/summerLoginAchievement.coffee'
LaborDayLoginAchievement = require './loginBasedAchievements/laborDayLoginAchievement.coffee'
HalloweenLoginAchievement = require './loginBasedAchievements/halloweenLoginAchievement.coffee'
ThanksgivingLoginAchievement = require './loginBasedAchievements/thanksgivingLoginAchievement.coffee'
ChristmasLoginAchievement = require './loginBasedAchievements/christmasLoginAchievement.coffee'
NewPlayerGoldLoginAchievement = require './loginBasedAchievements/newPlayerGoldLoginAchievement.coffee'
NewPlayerSpiritLoginAchievement = require './loginBasedAchievements/newPlayerSpiritLoginAchievement.coffee'

# Wartech general achievements
WartechGeneralFaction1Achievement = require './wartechAchievements/wartechGeneralFaction1Achievement'
WartechGeneralFaction2Achievement = require './wartechAchievements/wartechGeneralFaction2Achievement'
WartechGeneralFaction3Achievement = require './wartechAchievements/wartechGeneralFaction3Achievement'
WartechGeneralFaction4Achievement = require './wartechAchievements/wartechGeneralFaction4Achievement'
WartechGeneralFaction5Achievement = require './wartechAchievements/wartechGeneralFaction5Achievement'
WartechGeneralFaction6Achievement = require './wartechAchievements/wartechGeneralFaction6Achievement'

# Orb opening achievements
MythronOrb1Achievement = require './orbOpeningAchievements/mythronOrb1Achievement'
MythronOrb2Achievement = require './orbOpeningAchievements/mythronOrb2Achievement'
MythronOrb3Achievement = require './orbOpeningAchievements/mythronOrb3Achievement'
MythronOrb4Achievement = require './orbOpeningAchievements/mythronOrb4Achievement'
MythronOrb5Achievement = require './orbOpeningAchievements/mythronOrb5Achievement'
MythronOrb6Achievement = require './orbOpeningAchievements/mythronOrb6Achievement'
MythronOrb7Achievement = require './orbOpeningAchievements/mythronOrb7Achievement'

_ = require 'underscore'

class AchievementsFactory

  # global cache for quick access
  @_achievementsCache:null
  @_enabledAchievementsCache:null

  # TODO: Could be more performant by separating achievements by what they respond to in bucketed caches

  @_generateCache:()->
    Logger.module("SDK").debug("AchievementsFactory::_generateCache - starting")

    @_achievementsCache = {}

    # armory based
    @_achievementsCache[NamasteAchievement.id] = NamasteAchievement
    @_achievementsCache[BronzeStarterBundleAchievement.id] = BronzeStarterBundleAchievement
    @_achievementsCache[SilverStarterBundleAchievement.id] = SilverStarterBundleAchievement
    @_achievementsCache[GoldStarterBundleAchievement.id] = GoldStarterBundleAchievement
    # Referral based
    @_achievementsCache[FirstReferralPurchase.id] = FirstReferralPurchase
    # Crafting
    @_achievementsCache[WelcomeToCraftingAchievement.id] = WelcomeToCraftingAchievement
    # Game based
    @_achievementsCache[BestOfFriendsAchievement.id] = BestOfFriendsAchievement
    @_achievementsCache[EnteringGauntletAchievement.id] = EnteringGauntletAchievement
    @_achievementsCache[HelpingHandAchievement.id] = HelpingHandAchievement
    @_achievementsCache[TheArtOfWarAchievement.id] = TheArtOfWarAchievement
    @_achievementsCache[HomeTurfAchievement.id] = HomeTurfAchievement
    # faction progress based
    @_achievementsCache[BloodbornAchievement.id] = BloodbornAchievement
    @_achievementsCache[WorldExplorerAchievement.id] = WorldExplorerAchievement
    # inventory based
    @_achievementsCache[CollectorSupremeAchievement.id] = CollectorSupremeAchievement
    @_achievementsCache[SwornSisterAchievement.id] = SwornSisterAchievement
    @_achievementsCache[SunSisterAchievement.id] = SunSisterAchievement
    @_achievementsCache[LightningSisterAchievement.id] = LightningSisterAchievement
    @_achievementsCache[SandSisterAchievement.id] = SandSisterAchievement
    @_achievementsCache[ShadowSisterAchievement.id] = ShadowSisterAchievement
    @_achievementsCache[EarthSisterAchievement.id] = EarthSisterAchievement
    @_achievementsCache[WindSisterAchievement.id] = WindSisterAchievement
    #@_achievementsCache[FirstLootCrateAchievement.id] = FirstLootCrateAchievement
    # quest based
    @_achievementsCache[EpicQuestorAchievement.id] = EpicQuestorAchievement
    @_achievementsCache[IndomitableSpiritAchievement.id] = IndomitableSpiritAchievement
    @_achievementsCache[LegendaryQuestorAchievement.id] = LegendaryQuestorAchievement
    @_achievementsCache[JourneymanQuestorAchievement.id] = JourneymanQuestorAchievement
    # rank based
    @_achievementsCache[SilverDivisionAchievement.id] = SilverDivisionAchievement
    # login based
    @_achievementsCache[BNPromoAchievement.id] = BNPromoAchievement
    @_achievementsCache[MidAugLoginAchievement.id] = MidAugLoginAchievement
    @_achievementsCache[MidNov2017LoginAchievement.id] = MidNov2017LoginAchievement
    @_achievementsCache[EarlyFeb2018LoginAchievement.id] = EarlyFeb2018LoginAchievement
    @_achievementsCache[FrostfirePurchasable2017.id] = FrostfirePurchasable2017
    @_achievementsCache[FrostfireBonus2017.id] = FrostfireBonus2017
    @_achievementsCache[CoreshatterLoginAchievement.id] = CoreshatterLoginAchievement
    @_achievementsCache[MemorialDayLoginAchievement.id] = MemorialDayLoginAchievement
    @_achievementsCache[FathersDayLoginAchievement.id] = FathersDayLoginAchievement
    @_achievementsCache[FourthOfJulyLoginAchievement.id] = FourthOfJulyLoginAchievement
    @_achievementsCache[SummerLoginAchievement.id] = SummerLoginAchievement
    @_achievementsCache[LaborDayLoginAchievement.id] = LaborDayLoginAchievement
    @_achievementsCache[HalloweenLoginAchievement.id] = HalloweenLoginAchievement
    @_achievementsCache[ThanksgivingLoginAchievement.id] = ThanksgivingLoginAchievement
    @_achievementsCache[ChristmasLoginAchievement.id] = ChristmasLoginAchievement
    @_achievementsCache[NewPlayerGoldLoginAchievement.id] = NewPlayerGoldLoginAchievement
    @_achievementsCache[NewPlayerSpiritLoginAchievement.id] = NewPlayerSpiritLoginAchievement
    # wartech
    @_achievementsCache[WartechGeneralFaction1Achievement.id] = WartechGeneralFaction1Achievement
    @_achievementsCache[WartechGeneralFaction2Achievement.id] = WartechGeneralFaction2Achievement
    @_achievementsCache[WartechGeneralFaction3Achievement.id] = WartechGeneralFaction3Achievement
    @_achievementsCache[WartechGeneralFaction4Achievement.id] = WartechGeneralFaction4Achievement
    @_achievementsCache[WartechGeneralFaction5Achievement.id] = WartechGeneralFaction5Achievement
    @_achievementsCache[WartechGeneralFaction6Achievement.id] = WartechGeneralFaction6Achievement
    # orb opening
    @_achievementsCache[MythronOrb1Achievement.id] = MythronOrb1Achievement
    @_achievementsCache[MythronOrb2Achievement.id] = MythronOrb2Achievement
    @_achievementsCache[MythronOrb3Achievement.id] = MythronOrb3Achievement
    @_achievementsCache[MythronOrb4Achievement.id] = MythronOrb4Achievement
    @_achievementsCache[MythronOrb5Achievement.id] = MythronOrb5Achievement
    @_achievementsCache[MythronOrb6Achievement.id] = MythronOrb6Achievement
    @_achievementsCache[MythronOrb7Achievement.id] = MythronOrb7Achievement

    # store the enabled achievements
    @_enabledAchievementsCache = {}
    for k,v of @_achievementsCache
      if v.enabled
        @_enabledAchievementsCache[k] = v


  @achievementForIdentifier: (identifier) ->
    if !@_achievementsCache
      @_generateCache()

    return @_achievementsCache[identifier]

  @getEnabledAchievementsMap: () ->
    if !@_enabledAchievementsCache
      @_generateCache()

    return @_enabledAchievementsCache


module.exports = AchievementsFactory
