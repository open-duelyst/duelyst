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
MovementRange = require 'app/sdk/entities/movementRange'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellDamage = require 'app/sdk/spells/spellDamage'
SpellBuffAttributeByOtherAttribute = require 'app/sdk/spells/spellBuffAttributeByOtherAttribute'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellHeal = require 'app/sdk/spells/spellHeal'
SpellSilence = require 'app/sdk/spells/spellSilence'
SpellHolyImmolation = require 'app/sdk/spells/spellHolyImmolation'
SpellMartyrdom = require 'app/sdk/spells/spellMartyrdom'
SpellApplyPlayerModifiers = require 'app/sdk/spells/spellApplyPlayerModifiers'
SpellLifeSurge = require 'app/sdk/spells/spellLifeSurge'
SpellDecimate = require 'app/sdk/spells/spellDecimate'
SpellKneel = require 'app/sdk/spells/spellKneel'
SpellSpawnEntityInFrontOfGeneral = require 'app/sdk/spells/spellSpawnEntityInFrontOfGeneral'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierImmuneToSpellsByEnemy = require 'app/sdk/modifiers/modifierImmuneToSpellsByEnemy'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierBanding = require 'app/sdk/modifiers/modifierBanding'
ModifierBandingAttack = require 'app/sdk/modifiers/modifierBandingAttack'
ModifierBandingHeal = require 'app/sdk/modifiers/modifierBandingHeal'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierDispelOnAttack = require 'app/sdk/modifiers/modifierDispelOnAttack'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierBackupGeneral = require 'app/sdk/modifiers/modifierBackupGeneral'
ModifierAbsorbDamage = require 'app/sdk/modifiers/modifierAbsorbDamage'
ModifierBandingDealDamageWatchDrawCard = require 'app/sdk/modifiers/modifierBandingDealDamageWatchDrawCard'
ModifierHealWatchBuffSelf = require 'app/sdk/modifiers/modifierHealWatchBuffSelf'
ModifierHealWatchDamageNearbyEnemies = require 'app/sdk/modifiers/modifierHealWatchDamageNearbyEnemies'
ModifierBandingProvoke = require 'app/sdk/modifiers/modifierBandingProvoke'
ModifierToken = require 'app/sdk/modifiers/modifierToken'

PlayerModiferCanSummonAnywhere = require 'app/sdk/playerModifiers/playerModiferCanSummonAnywhere'


WartechGeneralFaction1Achievement = require 'app/sdk/achievements/wartechAchievements/wartechGeneralFaction1Achievement'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreSet_Faction1

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.General)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_argeon_name")
      card.manaCost = 0
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(90)
      card.setPortraitResource(RSX.general_portrait_image_f1)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f1)
      card.setSpeechResource(RSX.speech_portrait_lyonar_side)
      card.setConceptResource(RSX.general_f1)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Faction1.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1_general_attack_swing.audio
        receiveDamage :  RSX.sfx_f1_general_hit.audio
        attackDamage : RSX.sfx_f6_draugarlord_attack_impact.audio
        death : RSX.sfx_f1general_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1GeneralBreathing.name
        idle : RSX.f1GeneralIdle.name
        walk : RSX.f1GeneralRun.name
        attack : RSX.f1GeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f1GeneralDamage.name
        death : RSX.f1GeneralDeath.name
        castStart : RSX.f1GeneralCastStart.name
        castEnd : RSX.f1GeneralCastEnd.name
        castLoop : RSX.f1GeneralCastLoop.name
        cast : RSX.f1GeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.Roar}
      card.setDescription(i18next.t("cards.faction_1_unit_argeon_desc"))

    if (identifier == Cards.Faction1.AltGeneral)
      card = new Unit(gameSession)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_ziran_name")
      card.manaCost = 0
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(100)
      card.setPortraitResource(RSX.general_portrait_image_f1alt)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f1Alt1)
      card.setSpeechResource(RSX.speech_portrait_lyonaralt)
      card.setConceptResource(RSX.general_f1alt)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Faction1.ZiranSunforge"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_gambitgirl_attack_swing.audio
        receiveDamage : RSX.sfx_f1elyxstormblade_hit.audio
        attackDamage : RSX.sfx_neutral_jaxtruesight_death.audio
        death : RSX.sfx_neutral_pandora_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1AltGeneralBreathing.name
        idle : RSX.f1AltGeneralIdle.name
        walk : RSX.f1AltGeneralRun.name
        attack : RSX.f1AltGeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.5
        damage : RSX.f1AltGeneralHit.name
        death : RSX.f1AltGeneralDeath.name
        castStart : RSX.f1AltGeneralCastStart.name
        castEnd : RSX.f1AltGeneralCastEnd.name
        castLoop : RSX.f1AltGeneralCastLoop.name
        cast : RSX.f1AltGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.Afterglow}
      card.setDescription(i18next.t("cards.faction_1_unit_ziran_desc"))

    if (identifier == Cards.Faction1.ThirdGeneral)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableWithAchievement(true)
        card.setIsUnlockedWithAchievementId(WartechGeneralFaction1Achievement.id)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_brome_name")
      card.setDescription(i18next.t("cards.faction_1_unit_brome_desc"))
      card.manaCost = 0
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(100)
      card.setPortraitResource(RSX.general_portrait_image_f1alt)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f1Third)
      card.setSpeechResource(RSX.speech_portrait_lyonarthird)
      card.setConceptResource(RSX.general_f1third)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Faction1.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f2_chakriavatar_attack_swing.audio
        receiveDamage :  RSX.sfx_f1_general_hit.audio
        attackDamage : RSX.sfx_f6_draugarlord_attack_impact.audio
        death : RSX.sfx_f1general_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1ThirdGeneralBreathing.name
        idle : RSX.f1ThirdGeneralIdle.name
        walk : RSX.f1ThirdGeneralRun.name
        attack : RSX.f1ThirdGeneralAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.5
        damage : RSX.f1ThirdGeneralHit.name
        death : RSX.f1ThirdGeneralDeath.name
        castStart : RSX.f1ThirdGeneralCastStart.name
        castEnd : RSX.f1ThirdGeneralCastEnd.name
        castLoop : RSX.f1ThirdGeneralCastLoop.name
        cast : RSX.f1ThirdGeneralCast.name
      )
      card.atk = 2
      card.maxHP = 25
      card.signatureCardData = {id: Cards.Spell.KingsGuardBBS}
      card.addKeywordClassToInclude(ModifierBanding)
      card.addKeywordClassToInclude(ModifierProvoke)

    if (identifier == Cards.Faction1.SilverguardSquire)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_silverguard_squire_name")
      card.setFXResource(["FX.Cards.Faction1.SilverguardSquire"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SilverguardSquireBreathing.name
        idle : RSX.f1SilverguardSquireIdle.name
        walk : RSX.f1SilverguardSquireRun.name
        attack : RSX.f1SilverguardSquireAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1SilverguardSquireDamage.name
        death : RSX.f1SilverguardSquireDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 1
      card.rarityId = Rarity.Common

    if (identifier == Cards.Faction1.WindbladeAdept)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_windblade_adept_name")
      card.setFXResource(["FX.Cards.Faction1.WindbladeAdept"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2melee_attack_swing.audio
        receiveDamage : RSX.sfx_f2melee_hit.audio
        attackDamage : RSX.sfx_f2melee_attack_impact.audio
        death : RSX.sfx_f2melee_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1MeleeBreathing.name
        idle : RSX.f1MeleeIdle.name
        walk : RSX.f1MeleeRun.name
        attack : RSX.f1MeleeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1MeleeDamage.name
        death : RSX.f1MeleeDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierBandingAttack.createContextObject(1)])
      card.setDescription(i18next.t("cards.faction_1_unit_windblade_adept_desc"))

    if (identifier == Cards.Faction1.SuntideMaiden)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_suntide_maiden_name")
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction1.SuntideMaiden"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_gambitgirl_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_luxignis_hit.audio
        attackDamage : RSX.sfx_neutral_jaxtruesight_death.audio
        death : RSX.sfx_neutral_pandora_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SupportBreathing.name
        idle : RSX.f1SupportIdle.name
        walk : RSX.f1SupportRun.name
        attack : RSX.f1SupportAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.f1SupportDamage.name
        death : RSX.f1SupportDeath.name
      )
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setDescription(i18next.t("cards.faction_1_unit_suntide_maiden_desc"))
      card.setInherentModifiersContextObjects([ModifierBandingHeal.createContextObject()])

    if (identifier == Cards.Faction1.SilverguardKnight)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.name = i18next.t("cards.faction_1_unit_silverguard_knight_name")
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(80)
      card.setFXResource(["FX.Cards.Faction1.SilverguardKnight"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1tank_attack_swing.audio
        receiveDamage : RSX.sfx_f1tank_hit.audio
        attackDamage : RSX.sfx_f1tank_attack_impact.audio
        death : RSX.sfx_f1tank_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1TankBreathing.name
        idle : RSX.f1TankIdle.name
        walk : RSX.f1TankRun.name
        attack : RSX.f1TankAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f1TankDamage.name
        death : RSX.f1TankDeath.name
      )
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      bandingAttackBuff = 2
      card.setDescription(i18next.t("cards.faction_1_unit_silverguard_knight_desc"))
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject(),
        ModifierBandingAttack.createContextObject(bandingAttackBuff)
      ])

    if (identifier == Cards.Faction1.ArclyteSentinel)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_arclyte_sentinel_name")
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(80)
      card.setFXResource(["FX.Cards.Faction1.ArclyteSentinel"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f2stormkage_attack_swing.audio
        receiveDamage :  RSX.sfx_f2stormkage_hit.audio
        attackDamage : RSX.sfx_f2stormkage_attack_impact.audio
        death : RSX.sfx_f2stormkage_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SpecialBreathing.name
        idle : RSX.f1SpecialIdle.name
        walk : RSX.f1SpecialRun.name
        attack : RSX.f1SpecialAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f1SpecialDamage.name
        death : RSX.f1SpecialDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setDescription(i18next.t("cards.faction_1_unit_arclyte_sentinel_desc"))
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      followUpAttackBuff = 2
      followUpMaxHPBuff = -2
      followupModifierContextObject = Modifier.createContextObjectWithAttributeBuffs(followUpAttackBuff,followUpMaxHPBuff)
      followupModifierContextObject.appliedName = i18next.t("modifiers.faction_1_arclyte_buff_applied_name")
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          targetModifiersContextObjects: [
            followupModifierContextObject
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Faction1.WindbladeCommander)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_second_sun_name")
      card.setFXResource(["FX.Cards.Faction1.WindbladeCommander"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1windbladecommander_attack_swing.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f1windbladecommanderattack_impact.audio
        death : RSX.sfx_f1windbladecommander_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1WindbladeCommanderBreathing.name
        idle : RSX.f1WindbladeCommanderIdle.name
        walk : RSX.f1WindbladeCommanderRun.name
        attack : RSX.f1WindbladeCommanderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f1WindbladeCommanderDamage.name
        death : RSX.f1WindbladeCommanderDeath.name
      )
      card.atk = 0
      card.maxHP = 8
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setDescription(i18next.t("cards.faction_1_unit_second_sun_desc"))
      card.setInherentModifiersContextObjects([ModifierBandingAttack.createContextObject(8)])

    if (identifier == Cards.Faction1.LysianBrawler)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_lysian_brawler_name")
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setFXResource(["FX.Cards.Faction1.LysianBrawler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1lysianbrawler_attack_swing.audio
        receiveDamage : RSX.sfx_f1lysianbrawler_hit.audio
        attackDamage : RSX.sfx_f1lysianbrawler_attack_impact.audio
        death : RSX.sfx_f1lysianbrawler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SilvermaneVanguardBreathing.name
        idle : RSX.f1SilvermaneVanguardIdle.name
        walk : RSX.f1SilvermaneVanguardRun.name
        attack : RSX.f1SilvermaneVanguardAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f1SilvermaneVanguardDamage.name
        death : RSX.f1SilvermaneVanguardDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Fixed
      card.setDescription(i18next.t("cards.faction_1_unit_lysian_brawler_desc"))
      card.addKeywordClassToInclude(ModifierTranscendance)
      card.setInherentModifiersContextObjects([ModifierTranscendance.createContextObject()])

    if (identifier == Cards.Faction1.Lightchaser)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_lightchaser_name")
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction1.Lightchaser"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_spell_lastingjudgement.audio
        receiveDamage : RSX.sfx_f1lysianbrawler_hit.audio
        attackDamage : RSX.sfx_f1lysianbrawler_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1CasterBreathing.name
        idle : RSX.f1CasterIdle.name
        walk : RSX.f1CasterRun.name
        attack : RSX.f1CasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.1
        damage : RSX.f1CasterDamage.name
        death : RSX.f1CasterDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setDescription(i18next.t("cards.faction_1_unit_lightchaser_desc"))
      card.setInherentModifiersContextObjects([ModifierHealWatchBuffSelf.createContextObject(1,1)])

    if (identifier == Cards.Faction1.SunstoneTemplar)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sunstone_templar_name")
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction1.SunstoneTemplar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2stormkage_attack_swing.audio
        receiveDamage :  RSX.sfx_f2stormkage_hit.audio
        attackDamage : RSX.sfx_f2stormkage_attack_impact.audio
        death : RSX.sfx_f2stormkage_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SunstoneTemplarBreathing.name
        idle : RSX.f1SunstoneTemplarIdle.name
        walk : RSX.f1SunstoneTemplarRun.name
        attack : RSX.f1SunstoneTemplarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1SunstoneTemplarDamage.name
        death : RSX.f1SunstoneTemplarDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.setDescription(i18next.t("cards.faction_1_unit_sunstone_templar_desc"))
      card.setInherentModifiersContextObjects([ModifierDispelOnAttack.createContextObject()])

    if (identifier == Cards.Faction1.IroncliffeGuardian)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_ironcliffe_guardian_name")
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction1.IroncliffeGuardian"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1IroncliffeGuardianBreathing.name
        idle : RSX.f1IroncliffeGuardianIdle.name
        walk : RSX.f1IroncliffeGuardianRun.name
        attack : RSX.f1IroncliffeGuardianAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.7
        damage : RSX.f1IroncliffeGuardianDamage.name
        death : RSX.f1IroncliffeGuardianDeath.name
      )
      card.atk = 3
      card.maxHP = 10
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setDescription(i18next.t("cards.faction_1_unit_ironcliffe_guardian_desc"))
      card.addKeywordClassToInclude(ModifierAirdrop)
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setInherentModifiersContextObjects([ModifierAirdrop.createContextObject(), ModifierProvoke.createContextObject()])

    if (identifier == Cards.Faction1.ElyxStormblade)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_elyx_name")
      card.setFXResource(["FX.Cards.Faction1.ElyxStormblade"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1elyxstormblade_attack_swing.audio
        receiveDamage : RSX.sfx_f1elyxstormblade_hit.audio
        attackDamage : RSX.sfx_f1elyxstormblade_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1ElyxStormbladeBreathing.name
        idle : RSX.f1ElyxStormbladeIdle.name
        walk : RSX.f1ElyxStormbladeRun.name
        attack : RSX.f1ElyxStormbladeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1ElyxStormbladeDamage.name
        death : RSX.f1ElyxStormbladeDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 1}
      speedBuffContextObject.appliedName = i18next.t("modifiers.faction_1_elyx_buff_applied_name")
      speedBuffContextObject.appliedDescription = i18next.t("modifiers.faction_1_elyx_buff_applied_desc")
      card.setDescription(i18next.t("cards.faction_1_unit_elyx_desc"))
      card.addKeywordClassToInclude(ModifierProvoke)
      card.setInherentModifiersContextObjects([
        Modifier.createContextObjectWithAuraForAllAlliesAndSelfAndGeneral([speedBuffContextObject]),
        ModifierProvoke.createContextObject()
      ])

    if (identifier == Cards.Faction1.Sunriser)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sunriser_name")
      card.setFXResource(["FX.Cards.Faction1.Sunriser"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_f1_sunriser_death_alt.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SunriserBreathing.name
        idle : RSX.f1SunriserIdle.name
        walk : RSX.f1SunriserRun.name
        attack : RSX.f1SunriserAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1SunriserDamage.name
        death : RSX.f1SunriserDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setDescription(i18next.t("cards.faction_1_unit_sunriser_desc"))
      card.setInherentModifiersContextObjects([ModifierHealWatchDamageNearbyEnemies.createContextObject(2)])

    if (identifier == Cards.Faction1.GrandmasterZir)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_grandmaster_zir_name")
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(95)
      card.setFXResource(["FX.Cards.Faction1.GrandmasterZir"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_grandmasterzir_attack_swing.audio
        receiveDamage :  RSX.sfx_f1_grandmasterzir_hit.audio
        attackDamage : RSX.sfx_f1_grandmasterzir_attack_impact.audio
        death : RSX.sfx_f1_grandmasterzir_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1GrandmasterZirBreathing.name
        idle : RSX.f1GrandmasterZirIdle.name
        walk : RSX.f1GrandmasterZirRun.name
        attack : RSX.f1GrandmasterZirAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1GrandmasterZirDamage.name
        death : RSX.f1GrandmasterZirDeath.name
      )
      card.atk = 5
      card.maxHP = 12
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setDescription(i18next.t("cards.faction_1_unit_grandmaster_zir_desc"))
      contextObject = ModifierBackupGeneral.createContextObject()
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([contextObject])

    if (identifier == Cards.Faction1.AzuriteLion)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_azurite_lion_name")
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(60)
      card.setFXResource(["FX.Cards.Faction1.AzuriteLion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_beastsaberspinetiger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_beastsaberspinetiger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1AzuriteLionBreathing.name
        idle : RSX.f1AzuriteLionIdle.name
        walk : RSX.f1AzuriteLionRun.name
        attack : RSX.f1AzuriteLionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1AzuriteLionDamage.name
        death : RSX.f1AzuriteLionDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.setDescription(i18next.t("cards.faction_1_unit_azurite_lion_desc"))
      card.addKeywordClassToInclude(ModifierTranscendance)
      card.setInherentModifiersContextObjects([ModifierTranscendance.createContextObject()])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Spell.Roar)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Roar
      card.name = i18next.t("cards.faction_1_spell_roar_name")
      card.setDescription(i18next.t("cards.faction_1_spell_roar_description"))
      card.spellFilterType = SpellFilterType.AllyDirect
      card.filterNearGeneral = true
      card.manaCost = 1
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2)
      buffContextObject.appliedName = i18next.t("modifiers.faction_1_spell_roar_1")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Roar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_arakiheadhunter_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconRoarIdle.name
        active : RSX.iconRoarActive.name
      )

    if (identifier == Cards.Spell.Afterglow)
      card = new SpellHeal(gameSession)
      card.factionId = Factions.Faction1
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Afterglow
      card.name = i18next.t("cards.faction_1_spell_afterglow_name")
      card.setDescription(i18next.t("cards.faction_1_spell_afterglow_description"))
      card.manaCost = 1
      card.healModifier = 3
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.Afterglow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_loot_crate_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAfterglowIdle.name
        active : RSX.iconAfterglowActive.name
      )

    if (identifier == Cards.Spell.KingsGuardBBS)
      card = new SpellSpawnEntityInFrontOfGeneral(gameSession)
      card.factionId = Factions.Faction1
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.GuardBBS
      card.name = i18next.t("cards.faction_1_spell_conscript_name")
      card.setDescription(i18next.t("cards.faction_1_spell_conscript_desc"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.None
      card.cardDataOrIndexToSpawn = {id: Cards.Faction1.KingsGuard}
      card.spawnSilently = false
      card.setFXResource(["FX.Cards.Spell.Conscript"])
      card.setBaseSoundResource(
        apply : RSX.sfx_loot_crate_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconConscriptIdle.name
        active : RSX.iconConscriptActive.name
      )
      card.addKeywordClassToInclude(ModifierBanding)
      card.addKeywordClassToInclude(ModifierProvoke)

    if (identifier == Cards.Faction1.KingsGuard)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_crestfallen_name")
      card.setDescription(i18next.t("cards.faction_1_unit_crestfallen_desc"))
      card.setIsHiddenInCollection(true)
      card.rarityId = Rarity.TokenUnit
      card.setFXResource(["FX.Cards.Faction1.SilverguardSquire"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1CrestfallenBreathing.name
        idle : RSX.f1CrestfallenIdle.name
        walk : RSX.f1CrestfallenRun.name
        attack : RSX.f1CrestfallenAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1CrestfallenHit.name
        death : RSX.f1CrestfallenDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 1
      card.setInherentModifiersContextObjects([
        ModifierBandingProvoke.createContextObject(),
      ])
      card.addKeywordClassToInclude(ModifierProvoke)
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Spell.SundropElixir)
      card = new SpellHeal(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.SundropElixir
      card.name = i18next.t("cards.faction_1_spell_sundrop_elixir_name")
      card.setDescription(i18next.t("cards.faction_1_spell_sundrop_elixir_description"))
      card.manaCost = 1
      card.healModifier = 5
      card.canTargetGeneral = true
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.SundropElixir"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_lionheartblessing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSundropElixirIdle.name
        active : RSX.iconSundropElixirActive.name
      )

    if (identifier == Cards.Spell.Tempest)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction1
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.Tempest
      card.name = i18next.t("cards.faction_1_spell_tempest_name")
      card.setDescription(i18next.t("cards.faction_1_spell_tempest_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.damageAmount = 2
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.Tempest"])
      card.setBaseAnimResource(
        idle : RSX.iconTempestIdle.name
        active : RSX.iconTempestActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_heavenstrike.audio
      )

    if (identifier == Cards.Spell.Decimate)
      card = new SpellDecimate(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.Decimate
      card.name = i18next.t("cards.faction_1_spell_decimate_name")
      card.setDescription(i18next.t("cards.faction_1_spell_decimate_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.setFXResource(["FX.Cards.Spell.Decimate"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_heavenstrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDecimateIdle.name
        active : RSX.iconDecimateActive.name
      )

    if (identifier == Cards.Spell.AurynNexus)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_spell_auryn_nexus_name")
      card.setDescription(i18next.t("cards.faction_1_spell_auryn_nexus_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      healthBuff = Modifier.createContextObjectWithAttributeBuffs(0,3)
      healthBuff.appliedName = i18next.t("modifiers.faction_1_spell_auryn_nexus_1")
      card.setTargetModifiersContextObjects([
        healthBuff
      ])
      card.setFXResource(["FX.Cards.Spell.AurynNexus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAurynNexusIdle.name
        active : RSX.iconAurynNexusActive.name
      )

    if (identifier == Cards.Spell.LastingJudgement)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.LastingJudgement
      card.name = i18next.t("cards.faction_1_spell_lasting_judgement_name")
      card.setDescription(i18next.t("cards.faction_1_spell_lasting_judgement_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      statModifierContextObject = Modifier.createContextObjectWithAttributeBuffs(3,-3)
      statModifierContextObject.appliedName = i18next.t("modifiers.faction_1_spell_lasting_judgement_1")
      card.setTargetModifiersContextObjects([
        statModifierContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.LastingJudgement"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_lastingjudgement.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLastingJudgementIdle.name
        active : RSX.iconLastingJudgementActive.name
      )

    if (identifier == Cards.Spell.Martyrdom)
      card = new SpellMartyrdom(gameSession)
      card.factionId = Factions.Faction1
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.Martyrdom
      card.name = i18next.t("cards.faction_1_spell_martyrdom_name")
      card.setDescription(i18next.t("cards.faction_1_spell_martyrdom_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setFXResource(["FX.Cards.Spell.Martyrdom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_martyrdom.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMartyrdomIdle.name
        active : RSX.iconMartyrdomActive.name
      )

    if (identifier == Cards.Spell.WarSurge)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.WarSurge
      card.name = i18next.t("cards.faction_1_spell_war_surge_name")
      card.setDescription(i18next.t("cards.faction_1_spell_war_surge_description"))
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      buffContextObject.appliedName = i18next.t("modifiers.faction_1_spell_war_surge_1")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.WarSurge"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_warsurge.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconWarSurgeIdle.name
        active : RSX.iconWarSurgeActive.name
      )

    if (identifier == Cards.Spell.LionheartBlessing)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.LionheartBlessing
      card.name = i18next.t("cards.faction_1_spell_lionheart_blessing_name")
      card.setDescription(i18next.t("cards.faction_1_spell_lionheart_blessing_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.setTargetModifiersContextObjects([ModifierBandingDealDamageWatchDrawCard.createContextObject()])
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.LionheartBlessing"])
      card.setBaseAnimResource(
        idle : RSX.iconLionheartBlessingIdle.name
        active : RSX.iconLionheartBlessingActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_lionheartblessing.audio
      )

    if (identifier == Cards.Spell.SunBloom)
      card = new SpellSilence(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.SunBloom
      card.name = i18next.t("cards.faction_1_spell_sun_bloom_name")
      card.setDescription(i18next.t("cards.faction_1_spell_sun_bloom_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.SunBloom"])
      card.setBaseAnimResource(
        idle : RSX.iconSunBloomIdle.name
        active : RSX.iconSunBloomActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_sunbloom.audio
      )

    if (identifier == Cards.Spell.TrueStrike)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.TrueStrike
      card.name = i18next.t("cards.faction_1_spell_true_strike_name")
      card.setDescription(i18next.t("cards.faction_1_spell_true_strike_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.damageAmount = 2
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.TrueStrike"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTrueStrikeIdle.name
        active : RSX.iconTrueStrikeActive.name
      )

    if (identifier == Cards.Spell.CircleLife)
      card = new SpellLifeSurge(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.CircleLife
      card.name = i18next.t("cards.faction_1_spell_circle_of_life_name")
      card.setDescription(i18next.t("cards.faction_1_spell_circle_of_life_description"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.damageAmount = 5
      card.healAmount = 5
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setFXResource(["FX.Cards.Spell.CircleLife"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_spelljammer_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCircleofLifeIdle.name
        active : RSX.iconCircleofLifeActive.name
      )

    if (identifier == Cards.Spell.BeamShock)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.BeamShock
      card.name = i18next.t("cards.faction_1_spell_beam_shock_name")
      card.setDescription(i18next.t("cards.faction_1_spell_beam_shock_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = true
      card.addKeywordClassToInclude(ModifierStun)
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setTargetModifiersContextObjects([ModifierStunned.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.BeamShock"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBeamShockIdle.name
        active : RSX.iconBeamShockActive.name
      )

    if (identifier == Cards.Spell.HolyImmolation)
      card = new SpellHolyImmolation(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.HolyImmolation
      card.name = i18next.t("cards.faction_1_spell_holy_immolation_name")
      card.setDescription(i18next.t("cards.faction_1_spell_holy_immolation_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.healAmount = 4
      card.damageAmount = 4
      card.setFXResource(["FX.Cards.Spell.HolyImmolation"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f2_jadeogre_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconHolyImmolationIdle.name
        active : RSX.iconHolyImmolationActive.name
      )

    if (identifier == Cards.Spell.DivineBond)
      card = new SpellBuffAttributeByOtherAttribute(gameSession)
      card.factionId = Factions.Faction1
      if !config.get('allCardsAvailable')?
        card.setIsUnlockableBasic(true)
      card.id = Cards.Spell.DivineBond
      card.name = i18next.t("cards.faction_1_spell_divine_bond_name")
      card.setDescription(i18next.t("cards.faction_1_spell_divine_bond_description"))
      card.appliedName = i18next.t("modifiers.faction_1_spell_divine_bond_1")
      card.appliedDescription = i18next.t("modifiers.faction_1_spell_divine_bond_2")
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.attributeTarget = "atk"
      card.attributeSource = "hp"
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.DivineBond"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDivineBondIdle.name
        active : RSX.iconDivineBondActive.name
      )

    if (identifier == Cards.Spell.AegisBarrier)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.AegisBarrier
      card.name = i18next.t("cards.faction_1_spell_aegis_barrier_name")
      card.setDescription(i18next.t("cards.faction_1_spell_aegis_barrier_description"))
      card.manaCost = 1
      card.drawCardsPostPlay = 1
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setTargetModifiersContextObjects([
        ModifierImmuneToSpellsByEnemy.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Spell.AegisBarrier"])
      card.setBaseAnimResource(
        idle : RSX.iconAegisBarrierIdle.name
        active : RSX.iconAegisBarrierActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )

    if (identifier == Cards.Spell.AerialRift)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.AerialRift
      card.name = i18next.t("cards.faction_1_spell_aerial_rift_name")
      card.setDescription(i18next.t("cards.faction_1_spell_aerial_rift_description"))
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.drawCardsPostPlay = 1
      card.rarityId = Rarity.Epic
      card.applyToOwnGeneral = true
      customContextObject = PlayerModiferCanSummonAnywhere.createContextObject()
      customContextObject.durationEndTurn = 1
      card.setTargetModifiersContextObjects([customContextObject])
      card.addKeywordClassToInclude(ModifierAirdrop)
      card.setFXResource(["FX.Cards.Spell.AerialRift"])
      card.setBaseAnimResource(
        idle: RSX.iconAerialRiftIdle.name
        active: RSX.iconAerialRiftActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.Magnetize)
      card = new SpellKneel(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Spell.Magnetize
      card.name = i18next.t("cards.faction_1_spell_magnetize_name")
      card.setDescription(i18next.t("cards.faction_1_spell_magnetize_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.setFXResource(["FX.Cards.Spell.Magnetize"])
      card.setBaseAnimResource(
        idle: RSX.iconMagnetizeIdle.name
        active: RSX.iconMagnetizeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Artifact.IndomitableWill)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.IndomitableWill
      card.name = i18next.t("cards.faction_1_artifact_skywind_glaives_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_skywind_glaives_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.durability = 3
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(2,0)
      attackBuffContextObject.appliedName = i18next.t("cards.faction_1_artifact_skywind_glaives_name")
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAuraForNearbyAllies([attackBuffContextObject], null, null, null, i18next.t("modifiers.faction_1_artifact_skywind_glaives_1"))
      ])
      card.setFXResource(["FX.Cards.Artifact.IndomitableWill"])
      card.setBaseAnimResource(
        idle: RSX.iconSkywindGlaivesIdle.name
        active: RSX.iconSkywindGlaivesActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.SunstoneBracers)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.SunstoneBracers
      card.name = i18next.t("cards.faction_1_artifact_sunstone_bracers_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_sunstone_bracers_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Fixed
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,undefined, {
          name: i18next.t("modifiers.faction_1_artifact_sunstone_bracers_1")
          description: i18next.t("modifiers.plus_attack_key",{amount:1})
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.SunstoneBracers"])
      card.setBaseAnimResource(
        idle: RSX.iconSunstoneBracersIdle.name
        active: RSX.iconSunstoneBracersActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.ArclyteRegalia)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.ArclyteRegalia
      card.name = i18next.t("cards.faction_1_artifact_arclyte_regalia_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_arclyte_regalia_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(2,undefined, {
          name: i18next.t("cards.faction_1_artifact_arclyte_regalia_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:2})
        }),
        ModifierAbsorbDamage.createContextObject(2, {
          name: i18next.t("cards.faction_1_artifact_arclyte_regalia_name")
          description: i18next.t("modifiers.faction_1_artifact_arclyte_regalia_2")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.ArclyteRegalia"])
      card.setBaseAnimResource(
        idle: RSX.iconArclyteRegaliaIdle.name
        active: RSX.iconArclyteRegaliaActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_CoreSet_Faction1
