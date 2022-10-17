# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
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
SpellDamage = require 'app/sdk/spells/spellDamage'

Modifier =           require 'app/sdk/modifiers/modifier'
ModifierFirstBlood =     require 'app/sdk/modifiers/modifierFirstBlood'
ModifierProvoke =       require 'app/sdk/modifiers/modifierProvoke'
ModifierOpeningGambit =     require 'app/sdk/modifiers/modifierOpeningGambit'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Tutorial

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Tutorial.TutorialGeneral)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.setIsGeneral(true)
      card.name = i18next.t("cards.faction_1_unit_argeon_name")
      card.manaCost = 0
      card.setPortraitResource(RSX.general_portrait_image_f1)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f1)
      card.setSpeechResource(RSX.speech_portrait_lyonar_side)
      card.setConceptResource(RSX.general_f1)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Faction1.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
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
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialSignatureGeneral)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.setIsGeneral(true)
      card.name = i18next.t("cards.faction_1_unit_argeon_name")
      card.manaCost = 0
      card.setPortraitResource(RSX.general_portrait_image_f1)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_f1)
      card.setSpeechResource(RSX.speech_portrait_lyonar_side)
      card.setConceptResource(RSX.general_f1)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Faction1.General"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
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
      card.rarityId = Rarity.Fixed
      card.setDescription(i18next.t("cards.faction_1_unit_argeon_desc"))
      card.signatureCardData = {id: Cards.Spell.Roar}

    if (identifier == Cards.Tutorial.TutorialDragoneboneGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_dragonbone_golem_name")
      card.setFXResource(["FX.Cards.Neutral.DragoneboneGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_golemdragonbone_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemDragonboneBreathing.name
        idle : RSX.neutralGolemDragonboneIdle.name
        walk : RSX.neutralGolemDragonboneRun.name
        attack : RSX.neutralGolemDragonboneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGolemDragonboneHit.name
        death : RSX.neutralGolemDragonboneDeath.name
      )
      card.atk = 10
      card.maxHP = 10
      card.manaCost = 7
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialSaberspineTiger)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.neutral_saberspine_tiger_name")
      card.setFXResource(["FX.Cards.Neutral.SaberspineTiger"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_beastsaberspinetiger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_beastsaberspinetiger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastSaberspineTigerBreathing.name
        idle : RSX.neutralBeastSaberspineTigerIdle.name
        walk : RSX.neutralBeastSaberspineTigerRun.name
        attack : RSX.neutralBeastSaberspineTigerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralBeastSaberspineTigerHit.name
        death : RSX.neutralBeastSaberspineTigerDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierFirstBlood.createContextObject()])
      card.setDescription(i18next.t("cards.neutral_saberspine_tiger_desc"))

    if (identifier == Cards.Tutorial.TutorialRookie)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.neutral_rook_name")
      card.setFXResource(["FX.Cards.Neutral.Rook"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_rook_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_rook_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRookBreathing.name
        idle : RSX.neutralRookIdle.name
        walk : RSX.neutralRookRun.name
        attack : RSX.neutralRookAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralRookHit.name
        death : RSX.neutralRookDeath.name
      )
      card.atk = 5
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])
      card.setDescription(i18next.t("cards.neutral_primus_shieldmaster_desc"))

    if (identifier == Cards.Tutorial.TutorialThornNeedler)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.neutral_thorn_needler_name")
      card.setFXResource(["FX.Cards.Neutral.ThornNeedler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralNeedlerBreathing.name
        idle : RSX.neutralNeedlerIdle.name
        walk : RSX.neutralNeedlerRun.name
        attack : RSX.neutralNeedlerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralNeedlerHit.name
        death : RSX.neutralNeedlerDeath.name
      )
      card.atk = 6
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialSkyrockGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.neutral_skyrock_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.SkyrockGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemRunesandBreathing.name
        idle : RSX.neutralGolemRunesandIdle.name
        walk : RSX.neutralGolemRunesandRun.name
        attack : RSX.neutralGolemRunesandAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralGolemRunesandHit.name
        death : RSX.neutralGolemRunesandDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialIceGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_hailstone_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.HailstoneHowler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_seismicelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_f6_seismicelemental_attack_impact.audio
        death : RSX.sfx_f6_seismicelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemIceBreathing.name
        idle : RSX.neutralGolemIceIdle.name
        walk : RSX.neutralGolemIceRun.name
        attack : RSX.neutralGolemIceAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralGolemIceDamage.name
        death : RSX.neutralGolemIceDeath.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialBloodshardGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_bloodshard_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.BloodshardGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemBloodshardBreathing.name
        idle : RSX.neutralGolemBloodshardIdle.name
        walk : RSX.neutralGolemBloodshardRun.name
        attack : RSX.neutralGolemBloodshardAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralGolemBloodshardHit.name
        death : RSX.neutralGolemBloodshardDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialBrightmossGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_brightmoss_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.BrightmossGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_brightmossgolem_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_brightmossgolem_hit.audio
        attackDamage : RSX.sfx_neutral_brightmossgolem_attack_impact.audio
        death : RSX.sfx_neutral_brightmossgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemNatureBreathing.name
        idle : RSX.neutralGolemNatureIdle.name
        walk : RSX.neutralGolemNatureRun.name
        attack : RSX.neutralGolemNatureAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralGolemNatureHit.name
        death : RSX.neutralGolemNatureDeath.name
      )
      card.atk = 5
      card.maxHP = 9
      card.manaCost = 5
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialStormmetalGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_stormmetal_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.StormmetalGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormmetalgolem_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_stormmetalgolem_hit.audio
        attackDamage : RSX.sfx_neutral_stormmetalgolem_attack_impact.audio
        death : RSX.sfx_neutral_stormmetalgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemStormmetalBreathing.name
        idle : RSX.neutralGolemStormmetalIdle.name
        walk : RSX.neutralGolemStormmetalRun.name
        attack : RSX.neutralGolemStormmetalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGolemStormmetalHit.name
        death : RSX.neutralGolemStormmetalDeath.name
      )
      card.atk = 8
      card.maxHP = 8
      card.manaCost = 6
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialOpponentGeneral1)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("boss_battles.boss_3_name")
      card.manaCost = 0
      card.setPortraitResource(RSX.general_portrait_image_opponent1)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_opponent1)
      card.setSpeechResource(RSX.speech_portrait_calibero)
      card.setConceptResource(RSX.general_f1)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Faction1.CaliberO"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_neutral_chaoselemental_attack_impact.audio
        death : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1CaliberOBreathing.name
        idle : RSX.f1CaliberOIdle.name
        walk : RSX.f1CaliberORun.name
        attack : RSX.f1CaliberOAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.4
        damage : RSX.f1CaliberODamage.name
        death : RSX.f1CaliberODeath.name
      )
      card.atk = 2
      card.maxHP = 25

    if (identifier == Cards.Tutorial.TutorialOpponentGeneral2)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.setIsGeneral(true)
      card.name = i18next.t("cards.neutral_rook_name")
      card.setPortraitResource(RSX.general_portrait_image_opponent2)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_opponent2)
      card.setSpeechResource(RSX.speech_portrait_rook)
      card.setConceptResource(RSX.general_f2)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_lyonar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_lyonar_2nd)
      card.setFXResource(["FX.Cards.Neutral.Rook"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_rook_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_rook_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRookBreathing.name
        idle : RSX.neutralRookIdle.name
        walk : RSX.neutralRookRun.name
        attack : RSX.neutralRookAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralRookHit.name
        death : RSX.neutralRookDeath.name
      )
      card.atk = 2
      card.maxHP = 25
      card.manaCost = 0
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Tutorial.TutorialOpponentGeneral4)
      card = new Unit(gameSession)
      card.setIsGeneral(true)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.faction_6_unit_draugar_lord_name")
      card.manaCost = 0
      card.setPortraitResource(RSX.general_portrait_image_opponent4)
      card.setPortraitHexResource(RSX.general_portrait_image_hex_opponent4)
      card.setSpeechResource(RSX.speech_portrait_draugar)
      card.setConceptResource(RSX.general_f4)
      card.setAnnouncerFirstResource(RSX.sfx_announcer_vanar_1st)
      card.setAnnouncerSecondResource(RSX.sfx_announcer_vanar_2nd)
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
      card.atk = 2
      card.maxHP = 25

    if (identifier == Cards.Tutorial.TutorialLion)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.faction_1_unit_azurite_lion_name")
      card.setFXResource(["FX.Cards.Faction1.AzuriteLion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
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
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Tutorial.TutorialAdept)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
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
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialGuardian)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.faction_1_unit_ironcliffe_guardian_name")
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
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common

    if (identifier == Cards.Tutorial.TutorialBrawler)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.faction_1_unit_lysian_brawler_name")
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
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common

    if (identifier == Cards.Tutorial.TutorialKolossus)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.neutral_primus_shieldmaster_name")
      card.setFXResource(["FX.Cards.Neutral.PrimusShieldmaster"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPrimusShieldmasterBreathing.name
        idle : RSX.neutralPrimusShieldmasterIdle.name
        walk : RSX.neutralPrimusShieldmasterRun.name
        attack : RSX.neutralPrimusShieldmasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralPrimusShieldmasterHit.name
        death : RSX.neutralPrimusShieldmasterDeath.name
      )
      card.atk = 2
      card.maxHP = 9
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])
      card.setDescription(i18next.t("cards.neutral_primus_shieldmaster_desc"))

    if (identifier == Cards.Tutorial.TutorialRepulsor)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("neutral_repulsor_beast_name")
      card.setFXResource(["FX.Cards.Neutral.RepulsionBeast"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_repulsionbeast_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_repulsionbeast_hit.audio
        attackDamage : RSX.sfx_neutral_repulsionbeast_attack_impact.audio
        death : RSX.sfx_neutral_repulsionbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastRepulsionBreathing.name
        idle : RSX.neutralBeastRepulsionIdle.name
        walk : RSX.neutralBeastRepulsionRun.name
        attack : RSX.neutralBeastRepulsionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralBeastRepulsionHit.name
        death : RSX.neutralBeastRepulsionDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.Repulsion
          spellFilterType: SpellFilterType.EnemyDirect
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])
      card.setDescription(i18next.t("cards.neutral_repulsor_beast_desc"))

    if (identifier == Cards.Tutorial.TutorialVox)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = "Vox"
      card.setFXResource(["FX.Cards.Neutral.Vex"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_luxignis_death.audio
        walk : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        attack : RSX.sfx_neutral_spelljammer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_f6_voiceofthewind_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralVexBreathing.name
        idle : RSX.neutralVexIdle.name
        walk : RSX.neutralVexRun.name
        attack : RSX.neutralVexAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralVexHit.name
        death : RSX.neutralVexDeath.name
      )
      card.atk = 4
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Tutorial.TutorialGro)
      card = new Unit(gameSession)
      card.factionId = Factions.Tutorial
      card.name = i18next.t("cards.faction_5_unit_gro_name")
      card.setFXResource(["FX.Cards.Neutral.Gro"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_earthwalker_death.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack :  RSX.sfx_neutral_gro_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gro_hit.audio
        attackDamage : RSX.sfx_neutral_gro_attack_impact.audio
        death : RSX.sfx_neutral_gro_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGroBreathing.name
        idle : RSX.neutralGroIdle.name
        walk : RSX.neutralGroRun.name
        attack : RSX.neutralGroAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralGroHit.name
        death : RSX.neutralGroDeath.name
      )
      card.atk = 4
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.Fixed

    ### Tutorial SPELLS ###

    if (identifier == Cards.TutorialSpell.TutorialFrozenFinisher)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Tutorial
      card.id = Cards.TutorialSpell.TutorialFanTheFlames
      card.name = i18next.t("tutorial.tutorial_card_freezing_orb_name")
      card.setDescription(i18next.t("tutorial.tutorial_card_freezing_orb_desc"))
      card.manaCost = 0
      card.damageAmount = 25
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.FreezingOrb"])
      card.setBaseAnimResource(
        idle : RSX.iconAurorasTearIdle.name
        active : RSX.iconAurorasTearActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_attack_swing.audio
      )

    if (identifier == Cards.TutorialSpell.TutorialFireOrb)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Tutorial
      card.id = Cards.TutorialSpell.TutorialFireOrb
      card.name = i18next.t("tutorial.tutorial_card_blazing_orb_name")
      card.setDescription(i18next.t("tutorial.tutorial_card_blazing_orb_desc"))
      card.manaCost = 0
      card.damageAmount = 25
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.FireOrb"])
      card.setBaseAnimResource(
        idle : RSX.iconAurorasTearIdle.name
        active : RSX.iconAurorasTearActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )

    if (identifier == Cards.TutorialSpell.TutorialPlayerTrueStrike)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Tutorial
      card.id = Cards.TutorialSpell.TutorialPlayerTrueStrike
      card.name = i18next.t("cards.faction_1_spell_true_strike_name")
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.damageAmount = 2
      card.setDescription(i18next.t("cards.faction_1_spell_true_strike_description"))
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.TrueStrike"])
      card.setBaseAnimResource(
        idle : RSX.iconTrueStrikeIdle.name
        active : RSX.iconTrueStrikeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )

    if (identifier == Cards.TutorialArtifact.TutorialSunstoneBracers)
      card = new Artifact(gameSession)
      card.factionId = Factions.Tutorial
      card.id = Cards.TutorialArtifact.TutorialSunstoneBracers
      card.name = i18next.t("cards.faction_1_artifact_sunstone_bracers_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_sunstone_bracers_description"))
      card.manaCost = 0
      card.rarityId = Rarity.Fixed
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,undefined, {
          name: "Ironcliffe Cestus"
          description: "+1 Attack."
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

    return card

module.exports = CardFactory_Tutorial
