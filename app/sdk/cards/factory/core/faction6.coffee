# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
config = require('config/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'
SpellSwapStats = require 'app/sdk/spells/spellSwapStats'
SpellChromaticCold = require 'app/sdk/spells/spellChromaticCold'
SpellStunAndDamage = require 'app/sdk/spells/spellStunAndDamage'
SpellPermafrostShield = require 'app/sdk/spells/spellPermafrostShield'
SpellAvalanche = require 'app/sdk/spells/spellAvalanche'
SpellAspectBase = require 'app/sdk/spells/spellAspectBase'
SpellAspectOfTheDrake = require 'app/sdk/spells/spellAspectOfTheDrake'
SpellAspectOfTheMountains = require 'app/sdk/spells/spellAspectOfTheMountains'
SpellBounceToActionbar = require 'app/sdk/spells/spellBounceToActionbar'
SpellSpiritAnimalBlessing = require 'app/sdk/spells/spellSpiritAnimalBlessing'
SpellCryogenesis = require 'app/sdk/spells/spellCryogenesis'
SpellApplyModifiersToUnitsInHand = require 'app/sdk/spells/spellApplyModifiersToUnitsInHand'
SpellWarbird = require 'app/sdk/spells/spellWarbird'
SpellKineticSurge = require 'app/sdk/spells/spellKineticSurge'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierDyingWishSpawnEntity = require 'app/sdk/modifiers/modifierDyingWishSpawnEntity'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierDealDamageWatchModifyTarget = require 'app/sdk/modifiers/modifierDealDamageWatchModifyTarget'
ModifierOpeningGambitApplyModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiers'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierInfiltrate = require 'app/sdk/modifiers/modifierInfiltrate'
ModifierCannotAttackGeneral = require 'app/sdk/modifiers/modifierCannotAttackGeneral'
ModifierSummonWatchByRaceBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchByRaceBuffSelf'
ModifierSummonWatchByRaceDamageEnemyMinion = require 'app/sdk/modifiers/modifierSummonWatchByRaceDamageEnemyMinion'
ModifierEndTurnWatchDamageNearbyEnemy = require 'app/sdk/modifiers/modifierEndTurnWatchDamageNearbyEnemy'
ModifierStunWhenAttacked = require 'app/sdk/modifiers/modifierStunWhenAttacked'
ModifierWall = require 'app/sdk/modifiers/modifierWall'
ModifierDyingWishBonusManaCrystal = require 'app/sdk/modifiers/modifierDyingWishBonusManaCrystal'
ModifierSummonWatchFromActionBarSpawnEntity = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarSpawnEntity'
ModifierDyingWishPutCardInHandClean = require 'app/sdk/modifiers/modifierDyingWishPutCardInHandClean'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierSummonWatchApplyModifiers = require 'app/sdk/playerModifiers/playerModifierSummonWatchApplyModifiers'

WartechGeneralFaction6Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction6Achievement'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreSet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.General)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_faie_name")
      card.setDescription(i18next.t("cards.faction_6_unit_faie_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(95)
      card.setPortraitResource(RSX.general_portrait_image_f6)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f6)
      card.setSpeechResource(RSX.speech_portrait_vanar)
      card.setConceptResource(RSX.general_f6)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_vanar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_vanar_2nd)
      card.setFXResource(["FX.Cards.Faction6.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_valehunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gambitgirl_hit.audio
        attackDamage : RSX.sfx_neutral_gambitgirl_attack_impact.audio
        death : RSX.sfx_neutral_gambitgirl_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6GeneralBreathing.name
        idle : RSX.f6GeneralIdle.name
        walk : RSX.f6GeneralRun.name
        attack : RSX.f6GeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.65
        damage : RSX.f6GeneralDamage.name
        death : RSX.f6GeneralDeath.name
        castStart : RSX.f6GeneralCastStart.name
        castEnd : RSX.f6GeneralCastEnd.name
        castLoop : RSX.f6GeneralCastLoop.name
        cast : RSX.f6GeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.Warbird}

    if (identifier == Cards.Faction6.AltGeneral)
      card = new Unit(gameSession)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_kara_name")
      card.setDescription(i18next.t("cards.faction_6_unit_kara_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(115)
      card.setBoundingBoxHeight(115)
      card.setPortraitResource(RSX.general_portrait_image_f6alt)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f6Alt1)
      card.setSpeechResource(RSX.speech_portrait_vanaralt)
      card.setConceptResource(RSX.general_f6alt)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_vanar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_vanar_2nd)
      card.setFXResource(["FX.Cards.Faction6.KaraWinterblade"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_sunelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunelemental_hit.audio
        attackDamage : RSX.sfx_neutral_sunelemental_impact.audio
        death : RSX.sfx_neutral_gambitgirl_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6AltGeneralBreathing.name
        idle : RSX.f6AltGeneralIdle.name
        walk : RSX.f6AltGeneralRun.name
        attack : RSX.f6AltGeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6AltGeneralHit.name
        death : RSX.f6AltGeneralDeath.name
        castStart : RSX.f6AltGeneralCastStart.name
        castEnd : RSX.f6AltGeneralCastEnd.name
        castLoop : RSX.f6AltGeneralCastLoop.name
        cast : RSX.f6AltGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.KineticSurge}

    if (identifier == Cards.Faction6.ThirdGeneral)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableWithAchievement(true)
        card.setIsUnlockedWithAchievementId(WartechGeneralFaction6Achievement.id)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_ilena_name")
      card.setDescription(i18next.t("cards.faction_6_unit_ilena_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(115)
      card.setBoundingBoxHeight(115)
      card.setPortraitResource(RSX.general_portrait_image_f6alt)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f6Third)
      card.setSpeechResource(RSX.speech_portrait_vanarthird)
      card.setConceptResource(RSX.general_f6third)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_vanar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_vanar_2nd)
      card.setFXResource(["FX.Cards.Faction6.KaraWinterblade"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_sunelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunelemental_hit.audio
        attackDamage : RSX.sfx_neutral_ladylocke_attack_swing.audio
        death : RSX.sfx_neutral_gambitgirl_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6ThirdGeneralBreathing.name
        idle : RSX.f6ThirdGeneralIdle.name
        walk : RSX.f6ThirdGeneralRun.name
        attack : RSX.f6ThirdGeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6ThirdGeneralHit.name
        death : RSX.f6ThirdGeneralDeath.name
        castStart : RSX.f6ThirdGeneralCastStart.name
        castEnd : RSX.f6ThirdGeneralCastEnd.name
        castLoop : RSX.f6ThirdGeneralCastLoop.name
        cast : RSX.f6ThirdGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.StunBBS}
      card.addKeywordClassToInclude(ModifierStun)

    if (identifier == Cards.Faction6.FenrirWarmaster)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.name = i18next.t("cards.faction_6_unit_fenrir_warmaster_name")
      card.setDescription(i18next.t("cards.faction_6_unit_fenrir_warmaster_desc"))
      card.setFXResource(["FX.Cards.Faction6.FenrirWarmaster"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_fenrirwarmaster_attack_swing.audio
        receiveDamage : RSX.sfx_f6_fenrirwarmaster_hit.audio
        attackDamage : RSX.sfx_f6_fenrirwarmaster_attack_impact.audio
        death : RSX.sfx_f6_fenrirwarmaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6FenrirWarmasterBreathing.name
        idle : RSX.f6FenrirWarmasterIdle.name
        walk : RSX.f6FenrirWarmasterRun.name
        attack : RSX.f6FenrirWarmasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6FenrirWarmasterDamage.name
        death : RSX.f6FenrirWarmasterDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ ModifierDyingWishSpawnEntity.createContextObject({id: Cards.Faction6.GhostWolf}, "3/2 Ghost Wolf") ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.GhostWolf)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_ghost_wolf_name")
      card.setFXResource(["FX.Cards.Faction6.GhostWolf"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(60)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_ghostwolf_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_f6_ghostwolf_attack_impact.audio
        death : RSX.sfx_f6_ghostwolf_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6GhostwolfBreathing.name
        idle : RSX.f6GhostwolfIdle.name
        walk : RSX.f6GhostwolfRun.name
        attack : RSX.f6GhostwolfAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f6GhostwolfDamage.name
        death : RSX.f6GhostwolfDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.CrystalCloaker)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_crystal_cloaker_name")
      card.setDescription(i18next.t("cards.faction_6_unit_crystal_cloaker_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.CrystalCloaker"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(50)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_swing.audio
        receiveDamage : RSX.sfx_f6_icebeetle_hit.audio
        attackDamage : RSX.sfx_f6_icebeetle_attack_impact.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6CrystalBeetleBreathing.name
        idle : RSX.f6CrystalBeetleIdle.name
        walk : RSX.f6CrystalBeetleRun.name
        attack : RSX.f6CrystalBeetleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6CrystalBeetleDamage.name
        death : RSX.f6CrystalBeetleDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(2)
      attackBuffContextObject.appliedName = i18next.t("modifiers.faction_6_infiltrated_attack_buff_name")
      card.setInherentModifiersContextObjects([ ModifierInfiltrate.createContextObject([attackBuffContextObject], "Gains +2 Attack") ])

    if (identifier == Cards.Faction6.ArcticDisplacer)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_arctic_displacer_name")
      card.setDescription(i18next.t("cards.faction_6_unit_arctic_displacer_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.ArcticDisplacer"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_frostwyvern_attack_swing.audio
        receiveDamage : RSX.sfx_f6_frostwyvern_hit.audio
        attackDamage : RSX.sfx_f6_frostwyvern_attack_impact.audio
        death : RSX.sfx_f6_frostwyvern_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SnowWyvernBreathing.name
        idle : RSX.f6SnowWyvernIdle.name
        walk : RSX.f6SnowWyvernRun.name
        attack : RSX.f6SnowWyvernAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6SnowWyvernDamage.name
        death : RSX.f6SnowWyvernDeath.name
      )
      card.atk = 10
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierAirdrop.createContextObject()])

    if (identifier == Cards.Faction6.ArcticRhyno)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_frosthorn_rhyno_name")
      card.setDescription(i18next.t("cards.faction_6_unit_frosthorn_rhyno_desc"))
      card.setFXResource(["FX.Cards.Faction6.ArcticRhyno"])
      card.setBoundingBoxWidth(110)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6ArcticRhynoBreathing.name
        idle : RSX.f6ArcticRhynoIdle.name
        walk : RSX.f6ArcticRhynoRun.name
        attack : RSX.f6ArcticRhynoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6ArcticRhynoDamage.name
        death : RSX.f6ArcticRhynoDeath.name
      )
      card.atk = 6
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1)
      attackBuffContextObject.appliedName = i18next.t("modifiers.faction_6_infiltrated_attack_buff_name")
      celerityContextObject = ModifierTranscendance.createContextObject()
      celerityContextObject.appliedName = i18next.t("modifiers.faction_6_infiltrated_celerity_buff_name")
      card.setInherentModifiersContextObjects([
        ModifierInfiltrate.createContextObject([attackBuffContextObject, celerityContextObject], "Gains +1 Attack and Celerity")
      ])
      card.addKeywordClassToInclude(ModifierTranscendance)

    if (identifier == Cards.Faction6.PrismaticGiant)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_draugar_lord_name")
      card.setDescription(i18next.t("cards.faction_6_unit_draugar_lord_desc"))
      card.raceId = Races.Vespyr
      card.setBoundingBoxWidth(120)
      card.setBoundingBoxHeight(95)
      card.setFXResource(["FX.Cards.Faction6.PrismaticGiant"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_f6_draugarlord_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6DraugarLordBreathing.name
        idle : RSX.f6DraugarLordIdle.name
        walk : RSX.f6DraugarLordRun.name
        attack : RSX.f6DraugarLordAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f6DraugarLordDamage.name
        death : RSX.f6DraugarLordDeath.name
      )
      card.atk = 4
      card.maxHP = 8
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierDyingWishSpawnEntity.createContextObject({id: Cards.Faction6.IceDrake},"4/8 Ice Drake")
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.IceDrake)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_ice_drake_name")
      card.setFXResource(["FX.Cards.Neutral.IceDrake"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_earthwalker_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_earthwalker_hit.audio
        attackDamage : RSX.sfx_neutral_earthwalker_attack_impact.audio
        death : RSX.sfx_neutral_earthwalker_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6FrostdrakeBreathing.name
        idle : RSX.f6FrostdrakeIdle.name
        walk : RSX.f6FrostdrakeRun.name
        attack : RSX.f6FrostdrakeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f6FrostdrakeDamage.name
        death : RSX.f6FrostdrakeDeath.name
      )
      card.atk = 4
      card.maxHP = 8
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.WyrBeast)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_snow_chaser_name")
      card.setDescription(i18next.t("cards.faction_6_unit_snow_chaser_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.WyrBeast"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_artifacthunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_artifacthunter_hit.audio
        attackDamage : RSX.sfx_neutral_artifacthunter_attack_impact.audio
        death : RSX.sfx_neutral_artifacthunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SnowchaserBreathing.name
        idle : RSX.f6SnowchaserIdle.name
        walk : RSX.f6SnowchaserRun.name
        attack : RSX.f6SnowchaserAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f6SnowchaserDamage.name
        death : RSX.f6SnowchaserDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      returnContextObject = ModifierDyingWishPutCardInHandClean.createContextObject({id: Cards.Faction6.WyrBeast}, "a Snow Chaser")
      returnContextObject.appliedName = i18next.t("modifiers.faction_6_infiltrated_replicate_buff_name")
      card.setInherentModifiersContextObjects([ModifierInfiltrate.createContextObject([returnContextObject], "When this minion dies, return it to your action bar")])

    if (identifier == Cards.Faction6.WolfRaven)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_wolfraven_name")
      card.setDescription(i18next.t("cards.faction_6_unit_wolfraven_desc"))
      card.setFXResource(["FX.Cards.Faction6.WolfRaven"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_dragonlark_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dragonlark_hit.audio
        attackDamage : RSX.sfx_neutral_dragonlark_attack_impact.audio
        death : RSX.sfx_neutral_dragonlark_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6WolfravenBreathing.name
        idle : RSX.f6WolfravenIdle.name
        walk : RSX.f6WolfravenRun.name
        attack : RSX.f6WolfravenAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f6WolfravenDamage.name
        death : RSX.f6WolfravenDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(3)
      attackBuffContextObject.appliedName = i18next.t("modifiers.faction_6_infiltrated_attack_buff_name")
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject(), ModifierInfiltrate.createContextObject([attackBuffContextObject], "Gains +3 Attack")])

    if (identifier == Cards.Faction6.BoreanBear)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_borean_bear_name")
      card.setDescription(i18next.t("cards.faction_6_unit_borean_bear_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.BoreanBear"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6WaterBearBreathing.name
        idle : RSX.f6WaterBearIdle.name
        walk : RSX.f6WaterBearRun.name
        attack : RSX.f6WaterBearAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6WaterBearDamage.name
        death : RSX.f6WaterBearDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.setInherentModifiersContextObjects([ModifierSummonWatchByRaceBuffSelf.createContextObject(1,0,Races.Vespyr,"Gathering Courage")])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Faction6.HearthSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_hearth_sister_name")
      card.setDescription(i18next.t("cards.faction_6_unit_hearth_sister_desc"))
      card.setFXResource(["FX.Cards.Faction6.HearthSister"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6JusticeBreathing.name
        idle : RSX.f6JusticeIdle.name
        walk : RSX.f6JusticeRun.name
        attack : RSX.f6JusticeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6JusticeDamage.name
        death : RSX.f6JusticeDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([{
        id: Cards.Spell.FollowupSwapPositions
      }])

    if (identifier == Cards.Faction6.Razorback)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_razorback_name")
      card.setDescription(i18next.t("cards.faction_6_unit_razorback_desc"))
      card.setFXResource(["FX.Cards.Faction6.Razorback"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SentinelBreathing.name
        idle : RSX.f6SentinelIdle.name
        walk : RSX.f6SentinelRun.name
        attack : RSX.f6SentinelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6SentinelDamage.name
        death : RSX.f6SentinelDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2)
      statContextObject.durationEndTurn = 1
      statContextObject.appliedName = i18next.t("modifiers.faction_6_razorback_buff_name")
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitApplyModifiers.createContextObjectForAllies([statContextObject], false, CONFIG.WHOLE_BOARD_RADIUS, "Give all friendly minions +2 Attack this turn")
      ])

    if (identifier == Cards.Faction6.AncientGrove)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_ancient_grove_name")
      card.setDescription(i18next.t("cards.faction_6_unit_ancient_grove_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.AncientGrove"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_ancientgrove_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ancientgrove_hit.audio
        attackDamage : RSX.sfx_f6_ancientgrove_attack_impact.audio
        death : RSX.sfx_f6_ancientgrove_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6TreantBreathing.name
        idle : RSX.f6TreantIdle.name
        walk : RSX.f6TreantRun.name
        attack : RSX.f6TreantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f6TreantDamage.name
        death : RSX.f6TreantDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 7
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject(),
        ModifierOpeningGambitApplyModifiers.createContextObjectForAllAllies(
          [ModifierDyingWishSpawnEntity.createContextObject({id: Cards.Faction6.Treant}, "1/1 Treant with Provoke")],
          false, "Your minions gain \"Dying Wish: Summon a 1/1 Treant with Provoke\""
        )
      ])
      card.addKeywordClassToInclude(ModifierDyingWishSpawnEntity)
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Faction6.Treant)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_treant_name")
      card.setDescription(i18next.t("cards.faction_6_unit_treant_desc"))
      card.setFXResource(["FX.Cards.Faction6.Treant"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_f6_ancientgrove_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6MiniTreantBreathing.name
        idle : RSX.f6MiniTreantIdle.name
        walk : RSX.f6MiniTreantRun.name
        attack : RSX.f6MiniTreantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6MiniTreantDamage.name
        death : RSX.f6MiniTreantDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject()
      ])
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.VoiceoftheWind)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_voice_of_the_wind_name")
      card.setDescription(i18next.t("cards.faction_6_unit_voice_of_the_wind_desc"))
      card.setFXResource(["FX.Cards.Faction6.VoiceoftheWind"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        receiveDamage : RSX.sfx_f6_voiceofthewind_attack_impact.audio
        attackDamage : RSX.sfx_f6_voiceofthewind_hit.audio
        death : RSX.sfx_f6_voiceofthewind_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6VoiceoftheWindBreathing.name
        idle : RSX.f6VoiceoftheWindIdle.name
        walk : RSX.f6VoiceoftheWindRun.name
        attack : RSX.f6VoiceoftheWindAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f6VoiceoftheWindDamage.name
        death : RSX.f6VoiceoftheWindDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierSummonWatchFromActionBarSpawnEntity.createContextObject({id: Cards.Faction6.WaterBear}, "2/2 Vespyr Winter Maerid")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.WaterBear)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.raceId = Races.Vespyr
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_winter_maerid_name")
      card.setFXResource(["FX.Cards.Faction6.WaterBear"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6WaterElementalBreathing.name
        idle : RSX.f6WaterElementalIdle.name
        walk : RSX.f6WaterElementalRun.name
        attack : RSX.f6WaterElementalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6WaterElementalDamage.name
        death : RSX.f6WaterElementalDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.SnowElemental)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.raceId = Races.Vespyr
      card.name = i18next.t("cards.faction_6_unit_glacial_elemental_name")
      card.setDescription(i18next.t("cards.faction_6_unit_glacial_elemental_desc"))
      card.setFXResource(["FX.Cards.Faction6.SnowElemental"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_snowelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_snowelemental_attack_impact.audio
        attackDamage : RSX.sfx_f6_snowelemental_hit.audio
        death : RSX.sfx_f6_snowelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SnowElementalBreathing.name
        idle : RSX.f6SnowElementalIdle.name
        walk : RSX.f6SnowElementalRun.name
        attack : RSX.f6SnowElementalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f6SnowElementalDamage.name
        death : RSX.f6SnowElementalDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierSummonWatchByRaceDamageEnemyMinion.createContextObject(2, Races.Vespyr, "a Vespyr minion")])

    if (identifier == Cards.Faction6.WolfAspect)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_fox_ravager_name")
      card.setFXResource(["FX.Cards.Faction6.WolfAspect"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_ghostwolf_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_f6_ghostwolf_attack_impact.audio
        death : RSX.sfx_f6_ghostwolf_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6RavagerBreathing.name
        idle : RSX.f6RavagerIdle.name
        walk : RSX.f6RavagerRun.name
        attack : RSX.f6RavagerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f6RavagerDamage.name
        death : RSX.f6RavagerDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.AzureDrake)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_whyte_drake_name")
      card.setDescription(i18next.t("cards.faction_6_unit_whyte_drake_desc"))
      card.setFXResource(["FX.Cards.Faction6.AzureDrake"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_earthwalker_hit.audio
        attackDamage : RSX.sfx_neutral_earthwalker_attack_impact.audio
        death : RSX.sfx_neutral_serpenti_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6WhiteWyvernBreathing.name
        idle : RSX.f6WhiteWyvernIdle.name
        walk : RSX.f6WhiteWyvernRun.name
        attack : RSX.f6WhiteWyvernAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6WhiteWyvernDamage.name
        death : RSX.f6WhiteWyvernDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.SeismicElemental)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_seismic_elemental_name")
      card.setFXResource(["FX.Cards.Faction6.SeismicElemental"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_seismicelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_seismicelemental_hit.audio
        attackDamage : RSX.sfx_f6_seismicelemental_attack_impact.audio
        death : RSX.sfx_f6_seismicelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SeismicElementalBreathing.name
        idle : RSX.f6SeismicElementalIdle.name
        walk : RSX.f6SeismicElementalRun.name
        attack : RSX.f6SeismicElementalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6SeismicElementalDamage.name
        death : RSX.f6SeismicElementalDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.GravityWell)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_gravity_well_name")
      card.setDescription(i18next.t("cards.faction_6_unit_gravity_well_desc"))
      card.setFXResource(["FX.Cards.Faction6.GravityWell"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6GravityWellBreathing.name
        idle : RSX.f6GravityWellIdle.name
        walk : RSX.f6GravityWellIdle.name
        attack : RSX.f6GravityWellDamage.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f6GravityWellDamage.name
        death : RSX.f6GravityWellDeath.name
      )
      card.atk = 0
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierWall.createContextObject(), ModifierProvoke.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.BlazingSpines)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_blazing_spines_name")
      card.setDescription(i18next.t("cards.faction_6_unit_blazing_spines_desc"))
      card.setFXResource(["FX.Cards.Faction6.BlazingSpines"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ancientgrove_attack_impact.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_f6_draugarlord_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6BlazingSpinesBreathing.name
        idle : RSX.f6BlazingSpinesIdle.name
        walk : RSX.f6BlazingSpinesIdle.name
        attack : RSX.f6BlazingSpinesAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f6BlazingSpinesDamage.name
        death : RSX.f6BlazingSpinesDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierWall.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.BonechillBarrier)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_bonechill_barrier_name")
      card.setDescription(i18next.t("cards.faction_6_unit_bonechill_barrier_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.BonechillBarrier"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ancientgrove_attack_impact.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6BonechillBarrierBreathing.name
        idle : RSX.f6BonechillBarrierIdle.name
        walk : RSX.f6BonechillBarrierIdle.name
        attack : RSX.f6BonechillBarrierAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f6BonechillBarrierDamage.name
        death : RSX.f6BonechillBarrierDeath.name
      )
      card.atk = 0
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierWall.createContextObject(), ModifierStunWhenAttacked.createContextObject()])
      card.addKeywordClassToInclude(ModifierStunned)
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.CrystalWisp)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_crystal_wisp_name")
      card.setDescription(i18next.t("cards.faction_6_unit_crystal_wisp_desc"))
      card.setFXResource(["FX.Cards.Faction6.CrystalWisp"])
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(70)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f6_voiceofthewind_death.audio
        receiveDamage : RSX.sfx_neutral_shieldoracle_hit.audio
        attackDamage : RSX.sfx_neutral_shieldoracle_attack_impact.audio
        death : RSX.sfx_neutral_shieldoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCrystalWispBreathing.name
        idle : RSX.neutralCrystalWispIdle.name
        walk : RSX.neutralCrystalWispRun.name
        attack : RSX.neutralCrystalWispAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.35
        damage : RSX.neutralCrystalWispHit.name
        death : RSX.neutralCrystalWispDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierDyingWishBonusManaCrystal.createContextObject()])

    if (identifier == Cards.Spell.KineticSurge)
      card = new SpellKineticSurge(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.KineticSurge
      card.name = i18next.t("cards.faction_6_spell_kinetic_surge_name")
      card.setDescription(i18next.t("cards.faction_6_spell_kinetic_surge_description"))
      card.manaCost = 1
      card.applyToOwnGeneral = true
      card.spellFilterType = SpellFilterType.None
      attackBuff = Modifier.createContextObjectWithAttributeBuffs(1,1)
      attackBuff.appliedName = i18next.t("modifiers.faction_6_spell_kinetic_surge_1")
      customContextObject = PlayerModifierSummonWatchApplyModifiers.createContextObject([attackBuff], i18next.t("modifiers.faction_6_spell_kinetic_surge_2"))
      customContextObject.durationEndTurn = 1
      card.setTargetModifiersContextObjects([customContextObject])
      card.setFXResource(["FX.Cards.Spell.KineticSurge"])
      card.setBaseSoundResource(
        apply : RSX.sfx_loot_crate_card_reward_reveal_0.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconKineticCoilIdle.name
        active : RSX.iconKineticCoilActive.name
      )

    if (identifier == Cards.Spell.Warbird)
      card = new SpellWarbird(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Warbird
      card.name = i18next.t("cards.faction_6_spell_warbird_name")
      card.setDescription(i18next.t("cards.faction_6_spell_warbird_description"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.None
      card.canTargetGeneral = true
      card.damageAmount = 2
      card.setFXResource(["FX.Cards.Spell.Warbird"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconWarbirdIdle.name
        active : RSX.iconWarbirdActive.name
      )

    if (identifier == Cards.Spell.StunBBS)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.StunBBS
      card.name = i18next.t("cards.faction_6_spell_crystallize_name")
      card.setDescription(i18next.t("cards.faction_6_spell_crystallize_desc"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.filterNearGeneral = true
      card.setTargetModifiersContextObjects([ModifierStunnedVanar.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.Crystallize"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCrystallizeIdle.name
        active : RSX.iconCrystallizeActive.name
      )
      card.addKeywordClassToInclude(ModifierStun)

    if (identifier == Cards.Spell.GravityWell)
      card = new SpellSpawnEntity(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.GravityWell
      card.name = i18next.t("cards.faction_6_spell_gravity_well_name")
      card.setDescription(i18next.t("cards.faction_6_spell_gravity_well_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Legendary
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.GravityWell}
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setFXResource(["FX.Spell.FireTornado","FX.Cards.Spell.GravityWell"])
      card.spellFilterType = SpellFilterType.SpawnSource
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity3X
      }])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGravityWellIdle.name
        active : RSX.iconGravityWellActive.name
      )

    if (identifier == Cards.Spell.BonechillBarrier)
      card = new SpellSpawnEntity(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.BonechillBarrier
      card.name = i18next.t("cards.faction_6_spell_bonechill_barrier_name")
      card.setDescription(i18next.t("cards.faction_6_spell_bonechill_barrier_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.BonechillBarrier}
      card.setFXResource(["FX.Spell.FireTornado","FX.Cards.Spell.BonechillBarrier"])
      card.spellFilterType = SpellFilterType.SpawnSource
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity2X
      }])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_spelljammer_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBonechillBarrierIdle.name
        active : RSX.iconBonechillBarrierActive.name
      )

    if (identifier == Cards.Spell.BlazingSpines)
      card = new SpellSpawnEntity(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.BlazingSpines
      card.name = i18next.t("cards.faction_6_spell_blazing_spines_name")
      card.setDescription(i18next.t("cards.faction_6_spell_blazing_spines_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.BlazingSpines}
      card.setFXResource(["FX.Spell.FireTornado","FX.Cards.Spell.BlazingSpines"])
      card.spellFilterType = SpellFilterType.SpawnSource
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity
      }])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ancientgrove_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBlazingSpinesIdle.name
        active : RSX.iconBlazingSpinesActive.name
      )

    if (identifier == Cards.Spell.ChromaticCold)
      card = new SpellChromaticCold(gameSession)
      card.factionId = Factions.Faction6
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.ChromaticCold
      card.name = i18next.t("cards.faction_6_spell_chromatic_cold_name")
      card.setDescription(i18next.t("cards.faction_6_spell_chromatic_cold_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.damageAmount = 1
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.ChromaticCold"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconChromaticColdIdle.name
        active : RSX.iconChromaticColdActive.name
      )

    if (identifier == Cards.Spell.FlashFreeze)
      card = new SpellStunAndDamage(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.FlashFreeze
      card.name = i18next.t("cards.faction_6_spell_flash_freeze_name")
      card.setDescription(i18next.t("cards.faction_6_spell_flash_freeze_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.damageAmount = 1
      card.setTargetModifiersContextObjects([ModifierStunnedVanar.createContextObject()])
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Spell.FlashFreeze"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFlashFreezeIdle.name
        active : RSX.iconFlashFreezeActive.name
      )

    if (identifier == Cards.Spell.PermafrostShield)
      card = new SpellPermafrostShield(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.SpellPermafrostShield
      card.name = i18next.t("cards.faction_6_spell_frostfire_name")
      card.setDescription(i18next.t("cards.faction_6_spell_frostfire_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.AllyDirect
      card.attackBuff = 3
      card.healthBuff = 3
      card.setFXResource(["FX.Cards.Spell.IceCage"])
      card.setBaseAnimResource(
        idle: RSX.iconFrostfireIdle.name
        active: RSX.iconFrostfireActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.Avalanche)
      card = new SpellAvalanche(gameSession)
      card.factionId = Factions.Faction6
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.Avalanche
      card.name = i18next.t("cards.faction_6_spell_avalanche_name")
      card.setDescription(i18next.t("cards.faction_6_spell_avalanche_description"))
      card.manaCost = 4
      card.damageAmount = 4
      card.rarityId = Rarity.Fixed
      card.canTargetGeneral = true
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setTargetModifiersContextObjects([ModifierStunnedVanar.createContextObject()])
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Spell.Avalanche"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_hit.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAvalancheIdle.name
        active : RSX.iconAvalancheActive.name
      )

    if (identifier == Cards.Spell.ElementalFury)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.ElementalFury
      card.name = i18next.t("cards.faction_6_spell_boundless_courage_name")
      card.setDescription(i18next.t("cards.faction_6_spell_boundless_courage_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.AllyDirect
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2,0)
      statContextObject.appliedName = i18next.t("modifiers.faction_6_spell_boundless_courage_1")
      immunityContextObject = ModifierImmuneToDamage.createContextObject()
      immunityContextObject.durationEndTurn = 1
      card.setTargetModifiersContextObjects([
        statContextObject, immunityContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.ElementalFury"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconUnstoppableForceIdle.name
        active : RSX.iconUnstoppableForceActive.name
      )

    if (identifier == Cards.Spell.Numb)
      card = new Spell(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Numb
      card.name = i18next.t("cards.faction_6_spell_mesmerize_name")
      card.setDescription(i18next.t("cards.faction_6_spell_mesmerize_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.Mesmerize"])
      card.setFollowups([
        {
          id: Cards.Spell.FollowupTeleport
          _private: {
            followupSourcePattern: CONFIG.PATTERN_1SPACE
          }
        }
      ])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMesmerizeIdle.name
        active : RSX.iconMesmerizeActive.name
      )

    if (identifier == Cards.Spell.MarkOfSolitude)
      card = new SpellApplyModifiers(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.MarkOfSolitude
      card.name = i18next.t("cards.faction_6_spell_mark_of_solitude_name")
      card.setDescription(i18next.t("cards.faction_6_spell_mark_of_solitude_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.NeutralDirect
      customContextObject = Modifier.createContextObjectWithAttributeBuffs(5,5)
      customContextObject.attributeBuffsAbsolute = ["atk", "maxHP"]
      customContextObject.resetsDamage = true
      customContextObject.isRemovable = false
      customContextObject.appliedName = i18next.t("modifiers.faction_6_spell_mark_of_solitude_1")
      customContextObject.appliedDescription = i18next.t("modifiers.faction_6_spell_mark_of_solitude_2")
      card.setTargetModifiersContextObjects([  customContextObject, ModifierCannotAttackGeneral.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.MarkOfSolitude"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMarkOfSolitudeIdle.name
        active : RSX.iconMarkOfSolitudeActive.name
      )

    if (identifier == Cards.Spell.AspectOfTheWolf)
      card = new SpellAspectBase(gameSession)
      card.factionId = Factions.Faction6
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.AspectOfTheWolf
      card.name = i18next.t("cards.faction_6_spell_aspect_of_the_fox_name")
      card.setDescription(i18next.t("cards.faction_6_spell_aspect_of_the_fox_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.WolfAspect}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.AspectOfTheWolf"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ghostwolf_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAspectFoxIdle.name
        active : RSX.iconAspectFoxActive.name
      )

    if (identifier == Cards.Spell.AspectOfTheDrake)
      card = new SpellAspectOfTheDrake(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.AspectOfTheDrake
      card.name = i18next.t("cards.faction_6_spell_aspect_of_the_drake_name")
      card.setDescription(i18next.t("cards.faction_6_spell_aspect_of_the_drake_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.AzureDrake}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.addKeywordClassToInclude(ModifierFlying)
      card.setFXResource(["FX.Cards.Spell.AspectOfTheDrake"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAspectDrakeIdle.name
        active : RSX.iconAspectDrakeActive.name
      )

    if (identifier == Cards.Spell.AspectOfTheMountains)
      card = new SpellAspectOfTheMountains(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.AspectOfTheMountains
      card.name = i18next.t("cards.faction_6_spell_aspect_of_the_mountains_name")
      card.setDescription(i18next.t("cards.faction_6_spell_aspect_of_the_mountains_description"))
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.damageAmount = 5
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.SeismicElemental}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.AspectOfTheDrake"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAspectMountainsIdle.name
        active : RSX.iconAspectMountainsActive.name
      )

    if (identifier == Cards.Spell.RitualOfTheWind)
      card = new SpellSwapStats(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.RitualOfTheWind
      card.name = i18next.t("cards.faction_6_spell_polarity_name")
      card.setDescription(i18next.t("cards.faction_6_spell_polarity_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.Polarity"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPolarityIdle.name
        active : RSX.iconPolarityActive.name
      )

    if (identifier == Cards.Spell.IceCage)
      card = new SpellBounceToActionbar(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.IceCage
      card.name = i18next.t("cards.faction_6_spell_hailstone_prison_name")
      card.setDescription(i18next.t("cards.faction_6_spell_hailstone_prison_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.HailstonePrison"])
      card.setBaseAnimResource(
        idle: RSX.iconHailstonePrisonIdle.name
        active: RSX.iconHailstonePrisonActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.SpiritoftheWild)
      card = new SpellSpiritAnimalBlessing(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.SpiritoftheWild
      card.name = i18next.t("cards.faction_6_spell_spirit_of_the_wild_name")
      card.setDescription(i18next.t("cards.faction_6_spell_spirit_of_the_wild_description"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.SpiritoftheWild"])
      card.setBaseAnimResource(
        idle: RSX.iconSpiritOfTheWildIdle.name
        active: RSX.iconSpiritOfTheWildActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.Cryogenesis)
      card = new SpellCryogenesis(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Cryogenesis
      card.name = i18next.t("cards.faction_6_spell_cryogenesis_name")
      card.setDescription(i18next.t("cards.faction_6_spell_cryogenesis_description"))
      card.manaCost = 4
      card.damageAmount = 4
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.Cryogenesis"])
      card.setBaseAnimResource(
        idle: RSX.iconCryogenesisIdle.name
        active: RSX.iconCryogenesisActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Artifact.Snowpiercer)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.Snowpiercer
      card.name = i18next.t("cards.faction_6_artifact_snowpiercer_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_snowpiercer_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(3,undefined, {
          name: i18next.t("cards.faction_6_artifact_snowpiercer_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:3})
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.Snowpiercer"])
      card.setBaseAnimResource(
        idle: RSX.iconSnowpiercerIdle.name
        active: RSX.iconSnowpiercerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.Frostbiter)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.Frostbiter
      card.name = i18next.t("cards.faction_6_artifact_coldbiter_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_coldbiter_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierEndTurnWatchDamageNearbyEnemy.createContextObject(2,false,{
          type: "ModifierEndTurnWatchDamageNearbyEnemy"
          name: i18next.t("cards.faction_6_artifact_coldbiter_name")
          description: i18next.t("modifiers.faction_6_artifact_coldbiter_1")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.Frostbiter"])
      card.setBaseAnimResource(
        idle: RSX.iconColdbiterIdle.name
        active: RSX.iconColdbiterActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.Winterblade)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.Winterblade
      card.name = i18next.t("cards.faction_6_artifact_winterblade_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_winterblade_description"))
      card.addKeywordClassToInclude(ModifierStunned)
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(2,0,{
          name: i18next.t("cards.faction_6_artifact_winterblade_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:2})
        }),
        ModifierDealDamageWatchModifyTarget.createContextObject([ModifierStunnedVanar.createContextObject()], i18next.t("modifiers.faction_6_artifact_winterblade_2"),{
          name: i18next.t("cards.faction_6_artifact_winterblade_name")
          description: i18next.t("modifiers.faction_6_artifact_winterblade_1")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.Winterblade"])
      card.setBaseAnimResource(
        idle: RSX.iconWinterbladeIdle.name
        active: RSX.iconWinterbladeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_CoreSet_Faction6
