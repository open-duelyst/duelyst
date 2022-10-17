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
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellGodMulligan = require 'app/sdk/spells/spellGodMulligan'
SpellSetHealthEqualToAttack = require 'app/sdk/spells/spellSetHealthEqualToAttack'
SpellDamageOwnGeneral = require 'app/sdk/spells/spellDamageOwnGeneral'
SpellLostInTheDesert = require 'app/sdk/spells/spellLostInTheDesert'
SpellNeurolink = require 'app/sdk/spells/spellNeurolink'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierSynergizeSummonMinionNearby = require 'app/sdk/modifiers/modifierSynergizeSummonMinionNearby'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierOpeningGambitApplyMechazorPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyMechazorPlayerModifiers'
ModifierDyingWishDrawEnemyLegendaryArtifact = require 'app/sdk/modifiers/modifierDyingWishDrawEnemyLegendaryArtifact'
ModifierOpeningGambitSniperZen = require 'app/sdk/modifiers/modifierOpeningGambitSniperZen'
ModifierStartTurnWatchSummonDervish = require 'app/sdk/modifiers/modifierStartTurnWatchSummonDervish'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierBuildCompleteReplicateAndSummonDervish = require 'app/sdk/modifiers/modifierBuildCompleteReplicateAndSummonDervish'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierStartTurnWatchApplyTempArtifactModifier = require 'app/sdk/modifiers/modifierStartTurnWatchApplyTempArtifactModifier'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Faction3

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction3.Gust)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_gust_name")
      card.setDescription(i18next.t("cards.faction_3_unit_gust_desc"))
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizeSummonMinionNearby.createContextObject({id: Cards.Faction3.Dervish}, 2)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.Zephyr"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_voiceofthewind_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_impact.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2GustBreathing.name
        idle : RSX.f2GustIdle.name
        walk : RSX.f2GustRun.name
        attack : RSX.f2GustAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2GustHit.name
        death : RSX.f2GustDeath.name
      )

    if (identifier == Cards.Spell.KinematicProjection)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.KinematicProjection
      card.name = i18next.t("cards.faction_3_spell_kinematic_projection_name")
      card.setDescription(i18next.t("cards.faction_3_spell_kinematic_projection_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.NeutralDirect
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 0}
      speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
      speedBuffContextObject.attributeBuffsFixed = ["speed"]
      speedBuffContextObject.appliedName = i18next.t("modifiers.faction_3_kinematic_projection_1")
      speedBuffContextObject.appliedDescription = i18next.t("modifiers.faction_3_kinematic_projection_2")
      card.setTargetModifiersContextObjects([
        ModifierBlastAttack.createContextObject(),
        speedBuffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.KinematicProjection"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_firestarter_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMagitekUpgradeIdle.name
        active : RSX.iconMagitekUpgradeActive.name
      )

    if (identifier == Cards.Faction3.ShrikeBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
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
        breathing : RSX.f3BuildMinionBreathing.name
        idle : RSX.f3BuildMinionIdle.name
        walk : RSX.f3BuildMinionIdle.name
        attack : RSX.f3BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3BuildMinionHit.name
        death : RSX.f3BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction3.SimulacraBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
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
        breathing : RSX.f3BuildMinionBreathing.name
        idle : RSX.f3BuildMinionIdle.name
        walk : RSX.f3BuildMinionIdle.name
        attack : RSX.f3BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3BuildMinionHit.name
        death : RSX.f3BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction3.BarrenShrike)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_barren_shrike_name")
      card.setDescription(i18next.t("cards.faction_3_unit_barren_shrike_desc"))
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Common
      buildData = {id: Cards.Faction3.ShrikeBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Barren Shrike after 2 turns (this cannot be dispelled).", {id: Cards.Faction3.BarrenShrike}, 2))
      card.setInherentModifiersContextObjects([
        ModifierBlastAttack.createContextObject(),
        ModifierBuild.createContextObject(buildData)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.LightningBeetle"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(65)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormatha_attack_swing.audio
        receiveDamage :  RSX.sfx_neutral_stormatha_hit.audio
        attackDamage : RSX.sfx_neutral_stormatha_attack_impact.audio
        death : RSX.sfx_neutral_stormatha_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3MechanaShrikeBreathing.name
        idle : RSX.f3MechanaShrikeIdle.name
        walk : RSX.f3MechanaShrikeRun.name
        attack : RSX.f3MechanaShrikeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3MechanaShrikeHit.name
        death : RSX.f3MechanaShrikeDeath.name
      )

    if (identifier == Cards.Faction3.SilicaWeaver)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_silica_weaver_name")
      card.setDescription(i18next.t("cards.faction_3_unit_silica_weaver_desc"))
      card.raceId = Races.Mech
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject(2)
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([
        { id: Cards.Spell.DeployMechaz0r }
      ])
      card.setFXResource(["FX.Cards.Neutral.SilicaWeaver"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_shieldoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_shieldoracle_hit.audio
        attackDamage : RSX.sfx_neutral_shieldoracle_attack_impact.audio
        death : RSX.sfx_neutral_shieldoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3MechBreathing.name
        idle : RSX.f3MechIdle.name
        walk : RSX.f3MechRun.name
        attack : RSX.f3MechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f3MechHit.name
        death : RSX.f3MechDeath.name
      )

    if (identifier == Cards.Spell.MonolithicVision)
      card = new SpellGodMulligan(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.MonolithicVision
      card.name = i18next.t("cards.faction_3_spell_monolithic_vision_name")
      card.setDescription(i18next.t("cards.faction_3_spell_monolithic_vision_desc"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 9
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.MonolithicVision"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMonolithicVisionIdle.name
        active : RSX.iconMonolithicVisionActive.name
      )

    if (identifier == Cards.Faction3.Skyppy)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_skyppy_name")
      card.setDescription(i18next.t("cards.faction_3_unit_skyppy_desc"))
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierDyingWishDrawEnemyLegendaryArtifact.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.Bonereaper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_frostwyvern_attack_swing.audio
        receiveDamage : RSX.sfx_f6_frostwyvern_hit.audio
        attackDamage : RSX.sfx_f6_frostwyvern_attack_impact.audio
        death : RSX.sfx_f6_frostwyvern_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3SkyppyBreathing.name
        idle : RSX.f3SkyppyIdle.name
        walk : RSX.f3SkyppyRun.name
        attack : RSX.f3SkyppyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3SkyppyHit.name
        death : RSX.f3SkyppyDeath.name
      )

    if (identifier == Cards.Spell.BurdenOfKnowledge)
      card = new SpellDamageOwnGeneral(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.BurdenOfKnowledge
      card.name = i18next.t("cards.faction_3_spell_burden_of_knowledge_name")
      card.setDescription(i18next.t("cards.faction_3_spell_burden_of_knowledge_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 0
      card.damageAmount = 3
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.drawCardsPostPlay = 1
      card.setFXResource(["FX.Cards.Spell.BurdenOfKnowledge"])
      card.setBaseAnimResource(
        idle: RSX.iconGlimpseIdle.name
        active: RSX.iconGlimpseActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_run_magical_4.audio
      )

    if (identifier == Cards.Spell.EqualityConstraint)
      card = new SpellSetHealthEqualToAttack(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.EqualityConstraint
      card.name = i18next.t("cards.faction_3_spell_equality_constraint_name")
      card.setDescription(i18next.t("cards.faction_3_spell_equality_constraint_desc"))
      card.appliedName = i18next.t("modifiers.faction_3_equality_constraint_1")
      card.appliedDescription = i18next.t("modifiers.faction_3_equality_constraint_2")
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.EqualityConstraint"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconMatchTwoIdle.name
        active : RSX.iconMatchTwoActive.name
      )

    if (identifier == Cards.Faction3.SniperZen)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_grapnel_paradigm_name")
      card.setDescription(i18next.t("cards.faction_3_unit_grapnel_paradigm_desc"))
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitSniperZen.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.AzureHornShaman"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3GrapnelBreathing.name
        idle : RSX.f3GrapnelIdle.name
        walk : RSX.f3GrapnelRun.name
        attack : RSX.f3GrapnelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f3GrapnelHit.name
        death : RSX.f3GrapnelDeath.name
      )

    if (identifier == Cards.Spell.LostInTheDesert)
      card = new SpellLostInTheDesert(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.LostInTheDesert
      card.name = i18next.t("cards.faction_3_spell_lost_in_the_desert_name")
      card.setDescription(i18next.t("cards.faction_3_spell_lost_in_the_desert_desc"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.damageAmount = 5
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.setFXResource(["FX.Cards.Spell.LostInTheDesert"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLostInDesertIdle.name
        active : RSX.iconLostInDesertActive.name
      )

    if (identifier == Cards.Artifact.IrisBarrier)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Artifact.IrisBarrier
      card.name = i18next.t("cards.faction_3_artifact_iris_barrier_name")
      card.setDescription(i18next.t("cards.faction_3_artifact_iris_barrier_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.durability = 3
      damageImmuneModifier = ModifierImmuneToDamage.createContextObject()
      card.setTargetModifiersContextObjects([
        ModifierStartTurnWatchApplyTempArtifactModifier.createContextObject(damageImmuneModifier)
      ])
      card.setFXResource(["FX.Cards.Artifact.IrisBarrier"])
      card.setBaseAnimResource(
        idle: RSX.iconIrisBarrierIdle.name
        active: RSX.iconIrisBarrierActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Faction3.SimulacraObelysk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_simulacra_obelysk_name")
      card.setDescription(i18next.t("cards.faction_3_unit_simulacra_obelysk_desc"))
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Faction3.BrazierRedSand"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_f1_general_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3DuplicatorObelyskBreathing.name
        idle : RSX.f3DuplicatorObelyskIdle.name
        walk : RSX.f3DuplicatorObelyskIdle.name
        attack : RSX.f3DuplicatorObelyskAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f3DuplicatorObelyskHit.name
        death : RSX.f3DuplicatorObelyskDeath.name
      )
      card.atk = 0
      card.maxHP = 7
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      buildingModifier = ModifierBuildCompleteReplicateAndSummonDervish.createContextObject("Builds into Simulacra Obelysk after 2 turns (this cannot be dispelled).", {id: Cards.Faction3.SimulacraObelysk}, 2)
      buildingModifier.buildingMinion = {id: Cards.Faction3.SimulacraBuilding}
      buildData = {id: Cards.Faction3.SimulacraBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(buildingModifier)
      card.setInherentModifiersContextObjects([
        ModifierStartTurnWatchSummonDervish.createContextObject(),
        ModifierPortal.createContextObject(),
        ModifierBuild.createContextObject(buildData)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Spell.Neurolink)
      card = new SpellNeurolink(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.Neurolink
      card.name = i18next.t("cards.faction_3_spell_neurolink_name")
      card.setDescription(i18next.t("cards.faction_3_spell_neurolink_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.Neurolink"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boundedlifeforce.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconNeurolinkIdle.name
        active : RSX.iconNeurolinkActive.name
      )

    return card

module.exports = CardFactory_WartechSet_Faction3
