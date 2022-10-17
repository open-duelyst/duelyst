# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

CONFIG = require('app/common/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
Factions = require 'app/sdk/cards/factionsLookup'
Rarity = require 'app/sdk/cards/rarityLookup'
Unit = require 'app/sdk/entities/unit'
CardSet = require 'app/sdk/cards/cardSetLookup'
Races = require 'app/sdk/cards/racesLookup'
Artifact = require 'app/sdk/artifacts/artifact'

ModifierOverwatch = require 'app/sdk/modifiers/modifierOverwatch'
ModifierDyingWishDamageNearbyEnemies = require 'app/sdk/modifiers/modifierDyingWishDamageNearbyEnemies'
ModifierWall = require 'app/sdk/modifiers/modifierWall'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierInfiltrate = require 'app/sdk/modifiers/modifierInfiltrate'
ModifierMyAttackWatchBonusManaCrystal = require 'app/sdk/modifiers/modifierMyAttackWatchBonusManaCrystal'
ModifierDealDamageWatchTeleportEnemyToYourSide = require 'app/sdk/modifiers/modifierDealDamageWatchTeleportEnemyToYourSide'
ModifierSentinelSetup = require 'app/sdk/modifiers/modifierSentinelSetup'
ModifierSentinelOpponentSummonSwapPlaces = require 'app/sdk/modifiers/modifierSentinelOpponentSummonSwapPlaces'
ModifierSentinelOpponentGeneralAttack = require 'app/sdk/modifiers/modifierSentinelOpponentGeneralAttack'
ModifierSentinelOpponentSpellCast = require 'app/sdk/modifiers/modifierSentinelOpponentSpellCast'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierEnemySpellWatchBuffSelf = require 'app/sdk/modifiers/modifierEnemySpellWatchBuffSelf'
ModifierMyAttackWatchSpawnMinionNearby = require 'app/sdk/modifiers/modifierMyAttackWatchSpawnMinionNearby'
ModifierEndTurnWatchGainTempBuff = require 'app/sdk/modifiers/modifierEndTurnWatchGainTempBuff'
ModifierImmuneToAttacksByMinions = require 'app/sdk/modifiers/modifierImmuneToAttacksByMinions'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierSentinel = require 'app/sdk/modifiers/modifierSentinel'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'
SpellDamageCenterColumn = require 'app/sdk/spells/spellDamageCenterColumn'
SpellMightOfVespyr = require 'app/sdk/spells/spellMightOfVespyr'
SpellIllusoryIce = require 'app/sdk/spells/spellIllusoryIce'
SpellAmbush = require 'app/sdk/spells/spellAmbush'
SpellDamageAndApplyModifiers = require 'app/sdk/spells/spellDamageAndApplyModifiers'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.MatronElveiti)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_matron_elveiti_name")
      card.setDescription(i18next.t("cards.faction_6_unit_matron_elveiti_desc"))
      card.atk = 7
      card.maxHP = 5
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([ModifierImmuneToAttacksByMinions.createContextObject()], i18next.t("modifiers.faction_6_matron_elveiti"))
      ])
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_arakiheadhunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attackDamage : RSX.sfx_neutral_arakiheadhunter_impact.audio
        death : RSX.sfx_neutral_arakiheadhunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6PerfectReflectionBreathing.name
        idle : RSX.f6PerfectReflectionIdle.name
        walk : RSX.f6PerfectReflectionRun.name
        attack : RSX.f6PerfectReflectionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.f6PerfectReflectionHit.name
        death : RSX.f6PerfectReflectionDeath.name
      )

    if (identifier == Cards.Spell.LuminousCharge)
      card = new SpellSpawnEntity(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.LuminousCharge
      card.name = i18next.t("cards.faction_6_spell_luminous_charge_name")
      card.setDescription(i18next.t("cards.faction_6_spell_luminous_charge_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.FrostBomb}
      card.addKeywordClassToInclude(ModifierDyingWish)
      card.spellFilterType = SpellFilterType.SpawnSource
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.LuminousCharge"])
      card.setBaseAnimResource(
        idle: RSX.iconLuminousChargeIdle.name
        active: RSX.iconLuminousChargeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity4X
      }])

    if (identifier == Cards.Faction6.FrostBomb)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_luminous_charge_name")
      card.setDescription(i18next.t("cards.faction_6_unit_luminous_charge_desc"))
      card.setFXResource(["FX.Cards.Neutral.VineEntangler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ancientgrove_hit.audio
        attackDamage : RSX.sfx_f6_ancientgrove_attack_impact.audio
        death : RSX.sfx_f6_ancientgrove_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6ExplodingWallBreathing.name
        idle : RSX.f6ExplodingWallIdle.name
        walk : RSX.f6ExplodingWallIdle.name
        attack : RSX.f6ExplodingWallAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6ExplodingWallHit.name
        death : RSX.f6ExplodingWallDeath.name
      )
      card.atk = 0
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierWall.createContextObject(), ModifierDyingWishDamageNearbyEnemies.createContextObject(2)])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.Shivers)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_shivers_name")
      card.setDescription(i18next.t("cards.faction_6_unit_shivers_desc"))
      card.setFXResource(["FX.Cards.Neutral.SpottedDragonlark"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_dragonlark_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dragonlark_hit.audio
        attackDamage : RSX.sfx_neutral_dragonlark_attack_impact.audio
        death : RSX.sfx_neutral_dragonlark_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6IceHornetBreathing.name
        idle : RSX.f6IceHornetIdle.name
        walk : RSX.f6IceHornetRun.name
        attack : RSX.f6IceHornetAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f6IceHornetHit.name
        death : RSX.f6IceHornetDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.raceId = Races.Vespyr
      gainManaContextObject = ModifierMyAttackWatchBonusManaCrystal.createContextObject()
      gainManaContextObject.appliedName = i18next.t("modifiers.faction_6_shivers")
      card.setInherentModifiersContextObjects([
        ModifierFlying.createContextObject(),
        ModifierInfiltrate.createContextObject([gainManaContextObject])
      ])

    if (identifier == Cards.Artifact.TheDredger)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.TheDredger
      card.name = i18next.t("cards.faction_6_artifact_the_dredger_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_the_dredger_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierDealDamageWatchTeleportEnemyToYourSide.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Artifact.TheDredger"])
      card.setBaseAnimResource(
        idle: RSX.iconTheDredgerIdle.name
        active: RSX.iconTheDredgerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.GlacialFissure)
      card = new SpellDamageCenterColumn(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.GlacialFissure
      card.name = i18next.t("cards.faction_6_spell_glacial_fissure_name")
      card.setDescription(i18next.t("cards.faction_6_spell_glacial_fissure_desc"))
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.manaCost = 3
      card.damageAmount = 8
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.GlacialFissure"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_disintegrate.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGlacialFissureIdle.name
        active : RSX.iconGlacialFissureActive.name
      )

    if (identifier == Cards.Faction6.VanarSentinel)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_watchful_sentinel_name")
      card.setDescription(i18next.t("cards.faction_6_unit_watchful_sentinel_desc"))
      card.setFXResource(["FX.Cards.Faction6.VanarSentinel"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_fenrirwarmaster_attack_swing.audio
        receiveDamage : RSX.sfx_f6_fenrirwarmaster_hit.audio
        attackDamage : RSX.sfx_f6_fenrirwarmaster_attack_impact.audio
        death : RSX.sfx_f6_fenrirwarmaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6VanarSentinelBreathing.name
        idle : RSX.f6VanarSentinelIdle.name
        walk : RSX.f6VanarSentinelRun.name
        attack : RSX.f6VanarSentinelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6VanarSentinelHit.name
        death : RSX.f6VanarSentinelDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.Freeblade)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_freeblade_name")
      card.setDescription(i18next.t("cards.faction_6_unit_freeblade_desc"))
      card.setFXResource(["FX.Cards.Faction6.Freeblade"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2_jadeogre_attack_impact.audio
        death : RSX.sfx_f2_jadeogre_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6FreebladeBreathing.name
        idle : RSX.f6FreebladeIdle.name
        walk : RSX.f6FreebladeRun.name
        attack : RSX.f6FreebladeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f6FreebladeHit.name
        death : RSX.f6FreebladeDeath.name
      )
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Common
      sentinelData = {id: Cards.Faction6.VanarSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSummonSwapPlaces.createContextObject("transform.", {id: Cards.Faction6.Freeblade}))
      card.setInherentModifiersContextObjects([ ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.DrakeDowager)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_drake_dowager_name")
      card.setDescription(i18next.t("cards.faction_6_unit_drake_dowager_desc"))
      card.setFXResource(["FX.Cards.Neutral.DrakeDowager"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_dragonlark_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dragonlark_hit.audio
        attackDamage : RSX.sfx_neutral_dragonlark_attack_impact.audio
        death : RSX.sfx_neutral_dragonlark_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6MotherOfDrakesBreathing.name
        idle : RSX.f6MotherOfDrakesIdle.name
        walk : RSX.f6MotherOfDrakesRun.name
        attack : RSX.f6MotherOfDrakesAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6MotherOfDrakesHit.name
        death : RSX.f6MotherOfDrakesDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      sentinelData = {id: Cards.Faction6.VanarSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentGeneralAttack.createContextObject("transform.", {id: Cards.Faction6.DrakeDowager}))
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), ModifierMyAttackWatchSpawnMinionNearby.createContextObject({id: Cards.Faction6.AzureDrake}), ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.MoonlitBasilysk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_moonlit_basilysk_name")
      card.setDescription(i18next.t("cards.faction_6_unit_moonlit_basilysk_desc"))
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage :  RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6GreatWhiteNorthBreathing.name
        idle : RSX.f6GreatWhiteNorthIdle.name
        walk : RSX.f6GreatWhiteNorthRun.name
        attack : RSX.f6GreatWhiteNorthAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6GreatWhiteNorthHit.name
        death : RSX.f6GreatWhiteNorthDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      sentinelData = {id: Cards.Faction6.VanarSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSpellCast.createContextObject("transform.", {id: Cards.Faction6.MoonlitBasilysk}))
      card.setInherentModifiersContextObjects([ModifierEnemySpellWatchBuffSelf.createContextObject(3, 3, i18next.t("modifiers.faction_6_moonlit_basilysk")), ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Spell.VespyrianMight)
      card = new SpellMightOfVespyr(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.VespyrianMight
      card.name = i18next.t("cards.faction_6_spell_vespyrian_might_name")
      card.setDescription(i18next.t("cards.faction_6_spell_vespyrian_might_desc"))
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.manaCost = 5
      card.filterRaceIds = [Races.Vespyr]
      card.rarityId = Rarity.Common
      card.setFXResource(["FX.Cards.Spell.VespyrianMight"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_firestarter_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconVespyrMightIdle.name
        active : RSX.iconVespyrMightActive.name
      )

    if (identifier == Cards.Faction6.CrystalArbiter)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_crystal_arbiter_name")
      card.setDescription(i18next.t("cards.faction_6_unit_crystal_arbiter_desc"))
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.raceId = Races.Vespyr
      card.setInherentModifiersContextObjects([
        ModifierEndTurnWatchGainTempBuff.createContextObject(3,0,i18next.t("modifiers.faction_6_crystal_arbiter"))
      ])
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
        breathing : RSX.f6AuroraGuardianBreathing.name
        idle : RSX.f6AuroraGuardianIdle.name
        walk : RSX.f6AuroraGuardianRun.name
        attack : RSX.f6AuroraGuardianAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f6AuroraGuardianHit.name
        death : RSX.f6AuroraGuardianDeath.name
      )

    if (identifier == Cards.Spell.FlawlessReflection)
      card = new SpellIllusoryIce(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.FlawlessReflection
      card.name = i18next.t("cards.faction_6_spell_flawless_reflection_name")
      card.setDescription(i18next.t("cards.faction_6_spell_flawless_reflection_desc"))
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setFXResource(["FX.Spell.FireTornado","FX.Cards.Spell.FlawlessReflection"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFlaswlessReflectionIdle.name
        active : RSX.iconFlaswlessReflectionActive.name
      )

    if (identifier == Cards.Spell.SnowPatrol)
      card = new SpellAmbush(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.SnowPatrol
      card.name = i18next.t("cards.faction_6_spell_icebreak_ambush_name")
      card.setDescription(i18next.t("cards.faction_6_spell_icebreak_ambush_desc"))
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.SnowPatrol"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAmbushIdle.name
        active : RSX.iconAmbushActive.name
      )
      card.addKeywordClassToInclude(ModifierInfiltrate)

    if (identifier == Cards.Spell.BlindingSnowstorm)
      card = new SpellDamageAndApplyModifiers(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.BlindingSnowstorm
      card.name = i18next.t("cards.faction_6_spell_blinding_snowstorm_name")
      card.setDescription(i18next.t("cards.faction_6_spell_blinding_snowstorm_desc"))
      card.manaCost = 4
      card.damageAmount = 1
      card.rarityId = Rarity.Common
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.canTargetGeneral = true
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 1}
      speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
      speedBuffContextObject.attributeBuffsFixed = ["speed"]
      speedBuffContextObject.durationEndTurn = 2
      speedBuffContextObject.appliedName = i18next.t("modifiers.faction_6_spell_blinding_snowstorm_1")
      card.setTargetModifiersContextObjects([speedBuffContextObject])
      card.applyToEnemy = true
      card.setFXResource(["FX.Cards.Spell.BlindingSnowstorm"])
      card.setBaseAnimResource(
        idle: RSX.iconSnowstormIdle.name
        active: RSX.iconSnowstormActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    return card

module.exports = CardFactory_FirstWatchSet_Faction6
