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
SpellAspectBase = require 'app/sdk/spells/spellAspectBase'
SpellEssenceSculpt = require 'app/sdk/spells/spellEssenceSculpt'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'
SpellKillTargetWithModifierStunned = require 'app/sdk/spells/spellKillTargetWithModifierStunned'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellDoubleAttributeBuffs = require 'app/sdk/spells/spellDoubleAttributeBuffs'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierCannotStrikeback = require 'app/sdk/modifiers/modifierCannotStrikeback'
ModifierSynergizeRazorArchitect = require 'app/sdk/modifiers/modifierSynergizeRazorArchitect'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
ModifierDoubleDamageToStunnedEnemies = require 'app/sdk/modifiers/modifierDoubleDamageToStunnedEnemies'
ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions = require 'app/sdk/modifiers/modifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
ModifierDyingWishRespawnEntity = require 'app/sdk/modifiers/modifierDyingWishRespawnEntity'
ModifierBuildingSlowEnemies = require 'app/sdk/modifiers/modifierBuildingSlowEnemies'
ModifierAlwaysInfiltrated = require 'app/sdk/modifiers/modifierAlwaysInfiltrated'
ModifierProvidesAlwaysInfiltrated = require 'app/sdk/modifiers/modifierProvidesAlwaysInfiltrated'
ModifierSummonWatchByRaceSummonCopy = require 'app/sdk/modifiers/modifierSummonWatchByRaceSummonCopy'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.ProtosensorBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
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
        breathing : RSX.f6BuildMinionBreathing.name
        idle : RSX.f6BuildMinionIdle.name
        walk : RSX.f6BuildMinionIdle.name
        attack : RSX.f6BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6BuildMinionHit.name
        death : RSX.f6BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.EyolithBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
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
        breathing : RSX.f6BuildMinionBreathing.name
        idle : RSX.f6BuildMinionIdle.name
        walk : RSX.f6BuildMinionIdle.name
        attack : RSX.f6BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6BuildMinionHit.name
        death : RSX.f6BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 6
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction6.EchoDeliverant)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_echo_deliverant_name")
      card.setDescription(i18next.t("cards.faction_6_unit_echo_deliverant_desc"))
      card.raceId = Races.Mech
      card.atk = 6
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchByRaceSummonCopy.createContextObject(Races.Mech)
      ])
      card.setFXResource(["FX.Cards.Neutral.SwornDefender"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6MechBreathing.name
        idle : RSX.f6MechIdle.name
        walk : RSX.f6MechRun.name
        attack : RSX.f6MechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.f6MechHit.name
        death : RSX.f6MechDeath.name
      )

    if (identifier == Cards.Spell.AspectOfBear)
      card = new SpellAspectBase(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.AspectOfBear
      card.name = i18next.t("cards.faction_6_spell_aspect_of_the_bear_name")
      card.setDescription(i18next.t("cards.faction_6_spell_aspect_of_the_bear_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.Ursaplomb}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.AspectOfBear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAspectOfBearIdle.name
        active : RSX.iconAspectOfBearActive.name
      )

    if (identifier == Cards.Faction6.Ursaplomb)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_ursaplomb_name")
      card.setDescription(i18next.t("cards.faction_6_unit_ursaplomb_desc"))
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierCannotStrikeback.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.Fireblazer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6DoofyBearBreathing.name
        idle : RSX.f6DoofyBearIdle.name
        walk : RSX.f6DoofyBearRun.name
        attack : RSX.f6DoofyBearAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6DoofyBearHit.name
        death : RSX.f6DoofyBearDeath.name
      )

    if (identifier == Cards.Spell.EssenceSculpt)
      card = new SpellEssenceSculpt(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.EssenceSculpt
      card.name = i18next.t("cards.faction_6_spell_essence_sculpt_name")
      card.setDescription(i18next.t("cards.faction_6_spell_essence_sculpt_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 0
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = false
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Spell.EssenceSculpt"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconIceSculptureIdle.name
        active : RSX.iconIceSculptureActive.name
      )

    if (identifier == Cards.Faction6.Hydrogarm)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_hydrogarm_name")
      card.setDescription(i18next.t("cards.faction_6_unit_hydrogarm_desc"))
      card.raceId = Races.Vespyr
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizeRazorArchitect.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Neutral.CrimsonOculus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_komodocharger_hit.audio
        attackDamage : RSX.sfx_neutral_komodocharger_attack_impact.audio
        death : RSX.sfx_neutral_komodocharger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6HydrogarmBreathing.name
        idle : RSX.f6HydrogarmIdle.name
        walk : RSX.f6HydrogarmRun.name
        attack : RSX.f6HydrogarmAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f6HydrogarmHit.name
        death : RSX.f6HydrogarmDeath.name
      )

    if (identifier == Cards.Spell.Wintertide)
      card = new SpellSpawnEntity(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Wintertide
      card.name = i18next.t("cards.faction_6_spell_wintertide_name")
      card.setDescription(i18next.t("cards.faction_6_spell_wintertide_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.None
      card.filterPlayPositionsForEntity = false
      card.setAffectPattern(CONFIG.PATTERN_1X3)
      card.cardDataOrIndexToSpawn = {id: Cards.Faction6.WaterBear}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.Wintertide"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconWinterTideIdle.name
        active : RSX.iconWinterTideActive.name
      )

    if (identifier == Cards.Spell.Shatter)
      card = new SpellKillTargetWithModifierStunned(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Shatter
      card.name = i18next.t("cards.faction_6_spell_shatter_name")
      card.setDescription(i18next.t("cards.faction_6_spell_shatter_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Spell.Shatter"])
      card.setBaseAnimResource(
        idle: RSX.iconShatterIdle.name
        active: RSX.iconShatterActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darktransformation.audio
      )

    if (identifier == Cards.Faction6.Protosensor)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_protosensor_name")
      card.setDescription(i18next.t("cards.faction_6_unit_protosensor_desc"))
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      buildData = {id: Cards.Faction6.ProtosensorBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Protosensor after 1 turn (this cannot be dispelled).", {id: Cards.Faction6.Protosensor}, 1))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData),
        ModifierAirdrop.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
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
        breathing : RSX.f6ProtosensorBreathing.name
        idle : RSX.f6ProtosensorIdle.name
        walk : RSX.f6ProtosensorRun.name
        attack : RSX.f6ProtosensorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6ProtosensorHit.name
        death : RSX.f6ProtosensorDeath.name
      )

    if (identifier == Cards.Faction6.FrostbladeFiend)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_cryoblade_name")
      card.setDescription(i18next.t("cards.faction_6_unit_cryoblade_desc"))
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierDoubleDamageToStunnedEnemies.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Neutral.Sojourner"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6CryobladeBreathing.name
        idle : RSX.f6CryobladeIdle.name
        walk : RSX.f6CryobladeRun.name
        attack : RSX.f6CryobladeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f6CryobladeHit.name
        death : RSX.f6CryobladeDeath.name
      )

    if (identifier == Cards.Artifact.AnimusPlate)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.AnimusPlate
      card.name = i18next.t("cards.faction_6_artifact_animus_plate_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_animus_plate_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.durability = 3
      minionBuff = Modifier.createContextObjectWithAttributeBuffs(2,2)
      minionBuff.appliedName = i18next.t("modifiers.faction_6_artifact_animus_plate_1")
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(2,0,{
          name: i18next.t("cards.faction_6_artifact_animus_plate_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:2})
        }),
        ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions.createContextObject([minionBuff], Races.Vespyr)
      ])
      card.setFXResource(["FX.Cards.Artifact.AnimusPlate"])
      card.setBaseAnimResource(
        idle: RSX.iconAnimusPlateIdle.name
        active: RSX.iconAnimusPlateActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.Auroraboros)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Auroraboros
      card.name = i18next.t("cards.faction_6_spell_auroraboros_name")
      card.setDescription(i18next.t("cards.faction_6_spell_auroraboros_desc"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 5
      card.spellFilterType = SpellFilterType.AllyIndirect
      customContextObject = ModifierDyingWishRespawnEntity.createContextObject()
      customContextObject.appliedName = i18next.t("modifiers.faction_6_spell_auroraboros_1")
      customContextObject.appliedDescription = i18next.t("modifiers.faction_6_spell_auroraboros_2")
      card.setTargetModifiersContextObjects([customContextObject])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.addKeywordClassToInclude(ModifierDyingWish)
      card.setFXResource(["FX.Cards.Spell.Auroraboros"])
      card.setBaseAnimResource(
        idle : RSX.iconAuroraborosIdle.name
        active : RSX.iconAuroraborosActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_nethersummoning.audio
      )

    if (identifier == Cards.Faction6.DraugarEyolith)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_draugar_eyolith_name")
      card.setDescription(i18next.t("cards.faction_6_unit_draugar_eyolith_desc"))
      card.atk = 7
      card.maxHP = 14
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      buildingContextObject = ModifierBuildingSlowEnemies.createContextObject("Builds into Draugar Eyolith after 2 turns (this cannot be dispelled).", {id: Cards.Faction6.DraugarEyolith}, 2)
      buildingContextObject.auraAppliedName = i18next.t("modifiers.faction_6_draugar_eyolith_1")
      buildingContextObject.auraAppliedDescription = i18next.t("modifiers.faction_6_draugar_eyolith_2")
      buildingContextObject.speedChangeAppliedName = i18next.t("modifiers.faction_6_draugar_eyolith_3")
      buildingContextObject.speedChangeAppliedDescription = i18next.t("modifiers.faction_6_draugar_eyolith_4")
      buildData = {id: Cards.Faction6.EyolithBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(buildingContextObject)
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 1}
      speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
      speedBuffContextObject.attributeBuffsFixed = ["speed"]
      speedBuffContextObject.appliedName = i18next.t("modifiers.faction_6_draugar_eyolith_3")
      speedBuffContextObject.appliedDescription = i18next.t("modifiers.faction_6_draugar_eyolith_4")
      auraContextObject = Modifier.createContextObjectWithOnBoardAuraForAllEnemies([speedBuffContextObject], null, null, null, "Enemies move 1 space.")
      auraContextObject.auraIncludeGeneral = true
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData),
        auraContextObject
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
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
        breathing : RSX.f6DraugerEyolithBreathing.name
        idle : RSX.f6DraugerEyolithIdle.name
        walk : RSX.f6DraugerEyolithRun.name
        attack : RSX.f6DraugerEyolithAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.f6DraugerEyolithHit.name
        death : RSX.f6DraugerEyolithDeath.name
      )

    if (identifier == Cards.Spell.CrystallineReinforcement)
      card = new SpellDoubleAttributeBuffs(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.CrystallineReinforcement
      card.name = i18next.t("cards.faction_6_spell_crystalline_reinforcement_name")
      card.setDescription(i18next.t("cards.faction_6_spell_crystalline_reinforcement_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.canTargetGeneral = false
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.appliedName = "Reinforced"
      card.setFXResource(["FX.Cards.Spell.CrystalReinforce"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconiconTwiceIceIdle.name
        active : RSX.iconiconTwiceIceActive.name
      )

    if (identifier == Cards.Faction6.InfiltrateMaster)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_denadoro_name")
      card.setDescription(i18next.t("cards.faction_6_unit_denadoro_desc"))
      card.setFXResource(["FX.Cards.Faction5.MolokiHuntress"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f2_celestialphantom_death.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6InfiltrateMasterBreathing.name
        idle : RSX.f6InfiltrateMasterIdle  .name
        walk : RSX.f6InfiltrateMasterRun.name
        attack : RSX.f6InfiltrateMasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6InfiltrateMasterHit.name
        death : RSX.f6InfiltrateMasterDeath.name
      )
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierProvidesAlwaysInfiltrated.createContextObjectWithAuraForAllAlliesAndSelf([ModifierAlwaysInfiltrated.createContextObject()], null, null, null, "Your minions are always infiltrated")])

    return card

module.exports = CardFactory_WartechSet_Faction6
