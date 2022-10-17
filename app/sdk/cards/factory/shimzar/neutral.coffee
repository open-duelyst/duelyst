# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardSet = require 'app/sdk/cards/cardSetLookup'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'

SpellFilterType = require 'app/sdk/spells/spellFilterType'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierImmuneToDamageByGeneral = require 'app/sdk/modifiers/modifierImmuneToDamageByGeneral'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierDoubleDamageToGenerals = require 'app/sdk/modifiers/modifierDoubleDamageToGenerals'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierCannotMove = require 'app/sdk/modifiers/modifierCannotMove'
ModifierOpeningGambitDrawRandomBattlePet = require 'app/sdk/modifiers/modifierOpeningGambitDrawRandomBattlePet'
ModifierDyingWishDamageNearbyEnemies = require 'app/sdk/modifiers/modifierDyingWishDamageNearbyEnemies'
ModifierDealDamageWatchKillNeutralTarget = require 'app/sdk/modifiers/modifierDealDamageWatchKillNeutralTarget'
ModifierTakeDamageWatchSpawnRandomBattlePet = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnRandomBattlePet'
ModifierDyingWishDrawMechazorCard = require 'app/sdk/modifiers/modifierDyingWishDrawMechazorCard'
ModifierDyingWishDrawRandomBattlePet = require 'app/sdk/modifiers/modifierDyingWishDrawRandomBattlePet'
ModifierInquisitorKron = require 'app/sdk/modifiers/modifierInquisitorKron'
ModifierOpeningGambitBuffSelfByBattlePetsHandStats = require 'app/sdk/modifiers/modifierOpeningGambitBuffSelfByBattlePetsHandStats'
ModifierTamedBattlePet = require 'app/sdk/modifiers/modifierTamedBattlePet'
ModifierFriendlyDeathWatchForBattlePetDrawCard = require 'app/sdk/modifiers/modifierFriendlyDeathWatchForBattlePetDrawCard'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Fog)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_fog_name")
      card.setDescription(i18next.t("cards.neutral_fog_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Fog"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_valehunter_attack_impact.audio
        attack : RSX.sfx_neutral_fog_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_fog_hit.audio
        attackDamage : RSX.sfx_neutral_fog_attack_impact.audio
        death : RSX.sfx_neutral_fog_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralFogBreathing.name
        idle : RSX.neutralFogIdle.name
        walk : RSX.neutralFogRun.name
        attack : RSX.neutralFogAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralFogHit.name
        death : RSX.neutralFogDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierDyingWishDrawRandomBattlePet.createContextObject(), ModifierBattlePet.createContextObject(0)])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Ubo)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_ubo_name")
      card.setDescription(i18next.t("cards.neutral_ubo_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Ubo"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_ubo_hit.audio
        walk : RSX.sfx_spell_tranquility.audio
        attack : RSX.sfx_neutral_ubo_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_ubo_hit.audio
        attackDamage : RSX.sfx_neutral_ubo_attack_impact.audio
        death : RSX.sfx_neutral_ubo_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralUboBreathing.name
        idle : RSX.neutralUboIdle.name
        walk : RSX.neutralUboRun.name
        attack : RSX.neutralUboAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.neutralUboHit.name
        death : RSX.neutralUboDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierFlying.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Nip)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_dex_name")
      card.setDescription(i18next.t("cards.neutral_dex_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Nip"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_mirkblooddevourer_attack_swing.audio
        attack : RSX.sfx_f6_ghostwolf_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_f6_ghostwolf_attack_impact.audio
        death : RSX.sfx_f6_ghostwolf_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralNipBreathing.name
        idle : RSX.neutralNipIdle.name
        walk : RSX.neutralNipRun.name
        attack : RSX.neutralNipAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralNipHit.name
        death : RSX.neutralNipDeath.name
      )
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierTranscendance.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Yun)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_yun_name")
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Yun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_neutral_yun_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_yun_hit.audio
        attackDamage : RSX.sfx_neutral_yun_attack_impact.audio
        death : RSX.sfx_neutral_yun_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralYunBreathing.name
        idle : RSX.neutralYunIdle.name
        walk : RSX.neutralYunRun.name
        attack : RSX.neutralYunAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralYunHit.name
        death : RSX.neutralYunDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 3
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.Amu)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.raceId = Races.BattlePet
      card.setIsHiddenInCollection(false)
      card.name = i18next.t("cards.neutral_amu_name")
      card.setFXResource(["FX.Cards.Neutral.Amu"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_amu_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_amu_hit.audio
        attackDamage : RSX.sfx_neutral_amu_attack_impact.audio
        death : RSX.sfx_neutral_amu_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAmuBreathing.name
        idle : RSX.neutralAmuIdle.name
        walk : RSX.neutralAmuRun.name
        attack : RSX.neutralAmuAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralAmuHit.name
        death : RSX.neutralAmuDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])

    if (identifier == Cards.Neutral.Rok)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_rok_name")
      card.setDescription(i18next.t("cards.neutral_rok_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.DiamondGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRokBreathing.name
        idle : RSX.neutralRokIdle.name
        walk : RSX.neutralRokRun.name
        attack : RSX.neutralRokAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralRokHit.name
        death : RSX.neutralRokDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierCannotMove.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Ion)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(false)
      card.name = i18next.t("cards.neutral_ion_name")
      card.setDescription(i18next.t("cards.neutral_ion_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionZap"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_swordmechaz0r_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralIonBreathing.name
        idle : RSX.neutralIonIdle.name
        walk : RSX.neutralIonRun.name
        attack : RSX.neutralIonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralIonHit.name
        death : RSX.neutralIonDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierDoubleDamageToGenerals.createContextObject(), ModifierRanged.createContextObject()])

    if (identifier == Cards.Neutral.Hydrax)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_hydrax_name")
      card.setDescription(i18next.t("cards.neutral_hydrax_desc"))
      card.setFXResource(["FX.Cards.Neutral.BlisteringSkorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_dragonlark_death.audio
        attack : RSX.sfx_neutral_dragonlark_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_neutral_serpenti_attack_impact.audio
        death : RSX.sfx_neutral_serpenti_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralHydraxBreathing.name
        idle : RSX.neutralHydraxIdle.name
        walk : RSX.neutralHydraxRun.name
        attack : RSX.neutralHydraxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralHydraxHit.name
        death : RSX.neutralHydraxDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierFriendlyDeathWatchForBattlePetDrawCard.createContextObject(1)])


    if (identifier == Cards.Neutral.Koi)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.raceId = Races.BattlePet
      card.name = i18next.t("cards.neutral_koi_name")
      card.setDescription(i18next.t("cards.neutral_koi_desc"))
      card.setFXResource(["FX.Cards.Neutral.Spelljammer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_neutral_fog_attack_impact.audio
        death : RSX.sfx_neutral_fog_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralKoiBreathing.name
        idle : RSX.neutralKoiIdle.name
        walk : RSX.neutralKoiRun.name
        attack : RSX.neutralKoiAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralKoiHit.name
        death : RSX.neutralKoiDeath.name
      )
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierImmuneToDamageByGeneral.createContextObject()])

    if (identifier == Cards.Neutral.Beastmaster)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_beastmaster_name")
      card.setDescription(i18next.t("cards.neutral_beastmaster_desc"))
      card.setFXResource(["FX.Cards.Neutral.Chakkram"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_f1_oserix_death.audio
        attack : RSX.sfx_neutral_serpenti_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_neutral_serpenti_attack_impact.audio
        death : RSX.sfx_neutral_serpenti_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastmasterBreathing.name
        idle : RSX.neutralBeastmasterIdle.name
        walk : RSX.neutralBeastmasterRun.name
        attack : RSX.neutralBeastmasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBeastmasterHit.name
        death : RSX.neutralBeastmasterDeath.name
      )
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierFrenzy.createContextObject(), ModifierTranscendance.createContextObject()])

    if (identifier == Cards.Neutral.Silverbeak)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_silverbeak_name")
      card.setFXResource(["FX.Cards.Neutral.Unseven"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_spell_blindscorch.audio
        receiveDamage : RSX.sfx_f1_oserix_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSilverbeakBreathing.name
        idle : RSX.neutralSilverbeakIdle.name
        walk : RSX.neutralSilverbeakRun.name
        attack : RSX.neutralSilverbeakAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSilverbeakHit.name
        death : RSX.neutralSilverbeakDeath.name
      )
      card.atk = 6
      card.maxHP = 9
      card.manaCost = 6
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.GoldenMantella)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_golden_mantella_name")
      card.setDescription(i18next.t("cards.neutral_golden_mantella_desc"))
      card.setFXResource(["FX.Cards.Neutral.GoldenJusticar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_fog_attack_swing.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGoldenMantellaBreathing.name
        idle : RSX.neutralGoldenMantellaIdle.name
        walk : RSX.neutralGoldenMantellaRun.name
        attack : RSX.neutralGoldenMantellaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralGoldenMantellaHit.name
        death : RSX.neutralGoldenMantellaDeath.name
      )
      card.atk = 4
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDrawRandomBattlePet.createContextObject()])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.Gnasher)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_gnasher_name")
      card.setDescription(i18next.t("cards.neutral_gnasher_desc"))
      card.setFXResource(["FX.Cards.Neutral.Bonereaper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGnasherBreathing.name
        idle : RSX.neutralGnasherIdle.name
        walk : RSX.neutralGnasherRun.name
        attack : RSX.neutralGnasherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.neutralGnasherHit.name
        death : RSX.neutralGnasherDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierDyingWishDamageNearbyEnemies.createContextObject(3)])

    if (identifier == Cards.Neutral.Soboro)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_soboro_name")
      card.setDescription(i18next.t("cards.neutral_soboro_desc"))
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_komodocharger_hit.audio
        attack : RSX.sfx_neutral_sunelemental_death.audio
        receiveDamage : RSX.sfx_neutral_swornavenger_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSoboroBreathing.name
        idle : RSX.neutralSoboroIdle.name
        walk : RSX.neutralSoboroRun.name
        attack : RSX.neutralSoboroAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSoboroHit.name
        death : RSX.neutralSoboroDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierDealDamageWatchKillNeutralTarget.createContextObject()])

    if (identifier == Cards.Neutral.Zukong)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_zukong_name")
      card.setDescription(i18next.t("cards.neutral_zukong_desc"))
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_f1_oserix_death.audio
        attack : RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_death.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralZukongBreathing.name
        idle : RSX.neutralZukongIdle.name
        walk : RSX.neutralZukongRun.name
        attack : RSX.neutralZukongAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralZukongHit.name
        death : RSX.neutralZukongDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.setInherentModifiersContextObjects([
        Modifier.createContextObjectWithAuraForAllAllies([ModifierTamedBattlePet.createContextObject()], [Races.BattlePet], null, null, "You control your Battle Pets")
      ])
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.Rawr)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.raceId = Races.BattlePet
      card.name = i18next.t("cards.neutral_rawr_name")
      card.setDescription(i18next.t("cards.neutral_rawr_desc"))
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_beastsaberspinetiger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_beastsaberspinetiger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRawrBreathing.name
        idle : RSX.neutralRawrIdle.name
        walk : RSX.neutralRawrRun.name
        attack : RSX.neutralRawrAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralRawrHit.name
        death : RSX.neutralRawrDeath.name
      )
      card.atk = 3
      card.maxHP = 7
      card.manaCost = 5
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierTakeDamageWatchSpawnRandomBattlePet.createContextObject()])
      card.rarityId = Rarity.Legendary
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.Z0r)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.raceId = Races.BattlePet
      card.name = i18next.t("cards.neutral_z0r_name")
      card.setDescription(i18next.t("cards.neutral_z0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rHelm"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_wingsmechaz0r_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsmechaz0r_hit.audio
        attackDamage : RSX.sfx_neutral_wingsmechaz0r_impact.audio
        death : RSX.sfx_neutral_wingsmechaz0r_hit.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralZ0rBreathing.name
        idle : RSX.neutralZ0rIdle.name
        walk : RSX.neutralZ0rRun.name
        attack : RSX.neutralZ0rAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralZ0rHit.name
        death : RSX.neutralZ0rDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierBattlePet.createContextObject(),
        ModifierDyingWishDrawMechazorCard.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.Sai)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sai_name")
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Sai"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sai_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_sai_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSaiBreathing.name
        idle : RSX.neutralSaiIdle.name
        walk : RSX.neutralSaiRun.name
        attack : RSX.neutralSaiAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralSaiHit.name
        death : RSX.neutralSaiDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Sol)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sol_name")
      card.setDescription(i18next.t("cards.neutral_sol_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Sol"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        attack : RSX.sfx_neutral_spelljammer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_f6_voiceofthewind_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSolBreathing.name
        idle : RSX.neutralSolIdle.name
        walk : RSX.neutralSolRun.name
        attack : RSX.neutralSolAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.neutralSolHit.name
        death : RSX.neutralSolDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setFollowups([
        {
          id: Cards.Spell.FollowupActivateBattlepet
          filterRaceIds: [Races.BattlePet]
          spellFilterType: SpellFilterType.AllyDirect
        }
      ])
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])

    if (identifier == Cards.Neutral.InquisitorKron)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_inquisitor_kron_name")
      card.setDescription(i18next.t("cards.neutral_inquisitor_kron_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_windstopper_attack_impact.audio
        attack : RSX.sfx_neutral_crossbones_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_mirkblooddevourer_hit.audio
        attackDamage : RSX.sfx_neutral_mirkblooddevourer_attack_impact.audio
        death : RSX.sfx_neutral_mirkblooddevourer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralInquisitorKronBreathing.name
        idle : RSX.neutralInquisitorKronIdle.name
        walk : RSX.neutralInquisitorKronRun.name
        attack : RSX.neutralInquisitorKronAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralInquisitorKronHit.name
        death : RSX.neutralInquisitorKronDeath.name
      )
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject(),ModifierInquisitorKron.createContextObject({id: Cards.Neutral.Prisoner1}, "2/2 Prisoner with a random ability", 1, CONFIG.PATTERN_3x3)])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.Prisoner1)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_dispirited_prisoner_name")
      card.setDescription(i18next.t("cards.neutral_dispirited_prisoner_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralTribalMelee3Breathing.name
        idle : RSX.neutralTribalMelee3Idle.name
        walk : RSX.neutralTribalMelee3Run.name
        attack : RSX.neutralTribalMelee3Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralTribalMelee3Hit.name
        death : RSX.neutralTribalMelee3Death.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierFrenzy.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Prisoner2)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_broken_captive_name")
      card.setDescription(i18next.t("cards.neutral_broken_captive_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(

        breathing : RSX.neutralTribalMelee2Breathing.name
        idle : RSX.neutralTribalMelee2Idle.name
        walk : RSX.neutralTribalMelee2Run.name
        attack : RSX.neutralTribalMelee2Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralTribalMelee2Hit.name
        death : RSX.neutralTribalMelee2Death.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierFirstBlood.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Prisoner3)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_ruined_slave_name")
      card.setDescription(i18next.t("cards.neutral_ruined_slave_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMercMelee02Breathing.name
        idle : RSX.neutralMercMelee02Idle.name
        walk : RSX.neutralMercMelee02Run.name
        attack : RSX.neutralMercMelee02Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralMercMelee02Damage.name
        death : RSX.neutralMercMelee02Death.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Prisoner5)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_drudging_servant_name")
      card.setDescription(i18next.t("cards.neutral_drudging_servant_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralShadowCasterBreathing.name
        idle : RSX.neutralShadowCasterIdle.name
        walk : RSX.neutralShadowCasterRun.name
        attack : RSX.neutralShadowCasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralShadowCasterDamage.name
        death : RSX.neutralShadowCasterDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)


    if (identifier == Cards.Neutral.Prisoner6)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_toiling_vassal_name")
      card.setDescription(i18next.t("cards.neutral_toiling_vassal_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMercCaster01Breathing.name
        idle : RSX.neutralMercCaster01Idle.name
        walk : RSX.neutralMercCaster01Run.name
        attack : RSX.neutralMercCaster01Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralMercCaster01Damage.name
        death : RSX.neutralMercCaster01Death.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.Calculator)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_calculator_name")
      card.setDescription(i18next.t("cards.neutral_calculator_desc"))
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCalculatorBreathing.name
        idle : RSX.neutralCalculatorIdle.name
        walk : RSX.neutralCalculatorRun.name
        attack : RSX.neutralCalculatorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralCalculatorHit.name
        death : RSX.neutralCalculatorDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierOpeningGambitBuffSelfByBattlePetsHandStats.createContextObject()])

    if (identifier == Cards.Neutral.Oni)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.raceId = Races.BattlePet
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_oni_name")
      card.setDescription(i18next.t("cards.neutral_oni_desc"))
      card.setFXResource(["FX.Cards.Neutral.Oni"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_luxignis_death.audio
        walk : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        attack : RSX.sfx_neutral_spelljammer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_f6_voiceofthewind_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralOniBreathing.name
        idle : RSX.neutralOniIdle.name
        walk : RSX.neutralOniRun.name
        attack : RSX.neutralOniAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralOniHit.name
        death : RSX.neutralOniDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierForcefield.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    return card

module.exports = CardFactory_ShimzarSet_Neutral
