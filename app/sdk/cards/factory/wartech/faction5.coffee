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
CardSet = require 'app/sdk/cards/cardSetLookup'
Artifact = require 'app/sdk/artifacts/artifact'

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellEggGrenade = require 'app/sdk/spells/spellEggGrenade'
SpellEmbryoticInsight = require 'app/sdk/spells/spellEmbryoticInsight'
SpellUpperHand = require 'app/sdk/spells/spellUpperHand'
SpellSaurianFinality = require 'app/sdk/spells/spellSaurianFinality'
SpellHomeostaticRebuke = require 'app/sdk/spells/spellHomeostaticRebuke'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellEffulgentInfusion = require 'app/sdk/spells/spellEffulgentInfusion'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpeningGambitProgenitor = require 'app/sdk/modifiers/modifierOpeningGambitProgenitor'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierMyAttackWatchApplyModifiersToAllies = require 'app/sdk/modifiers/modifierMyAttackWatchApplyModifiersToAllies'
ModifierSummonWatchFromActionBarByRaceBothPlayersDraw = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarByRaceBothPlayersDraw'
ModifierSynergizeDamageClosestEnemy = require 'app/sdk/modifiers/modifierSynergizeDamageClosestEnemy'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierMyAttackOrCounterattackWatchTransformIntoEgg = require 'app/sdk/modifiers/modifierMyAttackOrCounterattackWatchTransformIntoEgg'
ModifierKillWatchSpawnEgg = require 'app/sdk/modifiers/modifierKillWatchSpawnEgg'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Faction5

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Spell.EggGrenade)
      card = new SpellEggGrenade(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.EggGrenade
      card.name = i18next.t("cards.faction_5_spell_pupabomb_name")
      card.setDescription(i18next.t("cards.faction_5_spell_pupabomb_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.Pupabomb"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f2_jadeogre_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEggGrenadeIdle.name
        active : RSX.iconEggGrenadeActive.name
      )

    if (identifier == Cards.Spell.EmbryoticInsight)
      card = new SpellEmbryoticInsight(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.EmbryoticInsight
      card.name = i18next.t("cards.faction_5_spell_embryotic_insight_name")
      card.setDescription(i18next.t("cards.faction_5_spell_embryotic_insight_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 2
      card.setFXResource(["FX.Cards.Spell.EmbryoticInsight"])
      card.setBaseAnimResource(
        idle : RSX.iconEggzactlyIdle.name
        active : RSX.iconEggzactlyActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )

    if (identifier == Cards.Faction5.Progenitor)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_progenitor_name")
      card.setDescription(i18next.t("cards.faction_5_unit_progenitor_desc"))
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitProgenitor.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.Progenitor"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ProgenitorBreathing.name
        idle : RSX.f5ProgenitorIdle.name
        walk : RSX.f5ProgenitorRun.name
        attack : RSX.f5ProgenitorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5ProgenitorHit.name
        death : RSX.f5ProgenitorDeath.name
      )

    if (identifier == Cards.Faction5.HulkBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.building_name")
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Neutral.Bastion"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(125)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5BuildMinionBreathing.name
        idle : RSX.f5BuildMinionIdle.name
        walk : RSX.f5BuildMinionIdle.name
        attack : RSX.f5BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5BuildMinionHit.name
        death : RSX.f5BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction5.GigalothBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.building_name")
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Neutral.Bastion"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(125)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5BuildMinionBreathing.name
        idle : RSX.f5BuildMinionIdle.name
        walk : RSX.f5BuildMinionIdle.name
        attack : RSX.f5BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5BuildMinionHit.name
        death : RSX.f5BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction5.BioHulk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_biomimetic_hulk_name")
      card.setDescription(i18next.t("cards.faction_5_unit_biomimetic_hulk_desc"))
      card.atk = 10
      card.maxHP = 10
      card.manaCost = 2
      card.rarityId = Rarity.Common
      buildData = {id: Cards.Faction5.HulkBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Biomimetic Hulk after 3 turns (this cannot be dispelled).", {id: Cards.Faction5.BioHulk}, 3))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.WhistlingBlade"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5BioHulkBreathing.name
        idle : RSX.f5BioHulkIdle.name
        walk : RSX.f5BioHulkRun.name
        attack : RSX.f5BioHulkAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f5BioHulkHit.name
        death : RSX.f5BioHulkDeath.name
      )

    if (identifier == Cards.Faction5.Gigaloth)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_gigaloth_name")
      card.setDescription(i18next.t("cards.faction_5_unit_gigaloth_desc"))
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      buildData = {id: Cards.Faction5.GigalothBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Gigaloth after 2 turns (this cannot be dispelled).", {id: Cards.Faction5.Gigaloth}, 2))
      statsBuff = Modifier.createContextObjectWithAttributeBuffs(3,3)
      statsBuff.appliedName = i18next.t("modifiers.faction_5_gigaloth_buff")
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData),
        ModifierMyAttackWatchApplyModifiersToAllies.createContextObject([statsBuff], false)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.WarTalon"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_neutral_redsynja_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_redsynja_hit.audio
        attackDamage : RSX.sfx_neutral_redsynja_attack_impact.audio
        death : RSX.sfx_neutral_cannonmechaz0r_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5GigalothBreathing.name
        idle : RSX.f5GigalothIdle.name
        walk : RSX.f5GigalothRun.name
        attack : RSX.f5GigalothAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5GigalothHit.name
        death : RSX.f5GigalothDeath.name
      )

    if (identifier == Cards.Faction5.Seismoid)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.raceId = Races.Mech
      card.name = i18next.t("cards.faction_5_unit_seismoid_name")
      card.setDescription(i18next.t("cards.faction_5_unit_seismoid_desc"))
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchFromActionBarByRaceBothPlayersDraw.createContextObject(Races.Mech, 1)
      ])
      card.setFXResource(["FX.Cards.Neutral.Xho"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack : RSX.sfx_neutral_xho_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_xho_hit.audio
        attackDamage : RSX.sfx_neutral_xho_attack_impact.audio
        death : RSX.sfx_neutral_xho_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MechBreathing.name
        idle : RSX.f5MechIdle.name
        walk : RSX.f5MechRun.name
        attack : RSX.f5MechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f5MechHit.name
        death : RSX.f5MechDeath.name
      )

    if (identifier == Cards.Faction5.Armada)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_armada_name")
      card.setDescription(i18next.t("cards.faction_5_unit_armada_desc"))
      card.atk = 5
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizeDamageClosestEnemy.createContextObject(5)
      ])
      card.setFXResource(["FX.Cards.Neutral.Quahog"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_daemongate_attack_swing.audio
        receiveDamage : RSX.sfx_f4_daemongate_hit.audio
        attackDamage : RSX.sfx_f4_daemongate_attack_impact.audio
        death : RSX.sfx_f4_daemongate_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ArmadaBreathing.name
        idle : RSX.f5ArmadaIdle.name
        walk : RSX.f5ArmadaRun.name
        attack : RSX.f5ArmadaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.f5ArmadaHit.name
        death : RSX.f5ArmadaDeath.name
      )

    if (identifier == Cards.Spell.UpperHand)
      card = new SpellUpperHand(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.UpperHand
      card.name = i18next.t("cards.faction_5_spell_upper_hand_name")
      card.setDescription(i18next.t("cards.faction_5_spell_upper_hand_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.UpperHand"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse02.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSmashemIdle.name
        active : RSX.iconSmashemActive.name
      )

    if (identifier == Cards.Spell.SaurianFinality)
      card = new SpellSaurianFinality(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.SaurianFinality
      card.name = i18next.t("cards.faction_5_spell_saurian_finality_name")
      card.setDescription(i18next.t("cards.faction_5_spell_saurian_finality_desc"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 8
      card.spellFilterType = SpellFilterType.None
      card.addKeywordClassToInclude(ModifierStun)
      card.appliedName = i18next.t("modifiers.faction_5_spell_saurian_finality_1")
      card.setFXResource(["FX.Cards.Spell.SaurianFinality"])
      card.setBaseAnimResource(
        idle: RSX.iconSaurianFinalityIdle.name
        active: RSX.iconSaurianFinalityActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boundedlifeforce.audio
      )

    if (identifier == Cards.Spell.HomeostaticRebuke)
      card = new SpellHomeostaticRebuke(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.HomeostaticRebuke
      card.name = i18next.t("cards.faction_5_spell_homeostatic_rebuke_name")
      card.setDescription(i18next.t("cards.faction_5_spell_homeostatic_rebuke_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.HomeostaticRebuke"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconHomeostaticRebukeIdle.name
        active : RSX.iconHomeostaticRebukeActive.name
      )

    if (identifier == Cards.Faction5.ErraticRaptyr)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_erratic_raptyr_name")
      card.setDescription(i18next.t("cards.faction_5_unit_erratic_raptyr_desc"))
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierRebirth.createContextObject(),
        ModifierMyAttackOrCounterattackWatchTransformIntoEgg.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.TheHighHand"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ErraticRaptyrBreathing.name
        idle : RSX.f5ErraticRaptyrIdle.name
        walk : RSX.f5ErraticRaptyrRun.name
        attack : RSX.f5ErraticRaptyrAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.95
        damage : RSX.f5ErraticRaptyrHit.name
        death : RSX.f5ErraticRaptyrDeath.name
      )

    if (identifier == Cards.Spell.EffulgentInfusion)
      card = new SpellEffulgentInfusion(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_spell_effulgent_infusion_name")
      card.setDescription(i18next.t("cards.faction_5_spell_effulgent_infusion_desc"))
      card.id = Cards.Spell.EffulgentInfusion
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.appliedName = i18next.t("modifiers.faction_5_spell_effulgent_infusion_1")
      card.setFXResource(["FX.Cards.Spell.EffulgentInfusion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEffulgentInfusionIdle.name
        active : RSX.iconEffulgentInfusionActive.name
      )

    if (identifier == Cards.Artifact.RageReactor)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.RageReactor
      card.name = i18next.t("cards.faction_5_artifact_rage_reactor_name")
      card.setDescription(i18next.t("cards.faction_5_artifact_rage_reactor_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1,0,{
          name: i18next.t("cards.faction_5_artifact_rage_reactor_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:1})
        }),
        ModifierKillWatchSpawnEgg.createContextObject(false, true, {id: Cards.Faction5.Gibblegup}, "Ripper", 1, CONFIG.PATTERN_1x1)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Artifact.RageReactor"])
      card.setBaseAnimResource(
        idle: RSX.iconRageReactorIdle.name
        active: RSX.iconRageReactorActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_WartechSet_Faction5
