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
SpellBetrayal = require 'app/sdk/spells/spellBetrayal'
SpellDamageAndApplyModifiers = require 'app/sdk/spells/spellDamageAndApplyModifiers'
SpellVellumscry = require 'app/sdk/spells/spellVellumscry'
SpellAbhorrentUnbirth = require 'app/sdk/spells/spellAbhorrentUnbirth'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierDeathWatch = require 'app/sdk/modifiers/modifierDeathWatch'
ModifierDeathWatchBuffMinionsInHand = require 'app/sdk/modifiers/modifierDeathWatchBuffMinionsInHand'
ModifierDyingWishDestroyRandomEnemyNearby = require 'app/sdk/modifiers/modifierDyingWishDestroyRandomEnemyNearby'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierDyingWishAddCardToDeck = require 'app/sdk/modifiers/modifierDyingWishAddCardToDeck'
ModifierOnDyingInfest = require 'app/sdk/modifiers/modifierOnDyingInfest'
ModifierSynergizeSummonMinionNearby = require 'app/sdk/modifiers/modifierSynergizeSummonMinionNearby'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierEternalHeart = require 'app/sdk/modifiers/modifierEternalHeart'
ModifierDeathWatchSpawnRandomDemon = require 'app/sdk/modifiers/modifierDeathWatchSpawnRandomDemon'
ModifierWhenAttackedDestroyThis = require 'app/sdk/modifiers/modifierWhenAttackedDestroyThis'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierInvulnerable = require 'app/sdk/modifiers/modifierInvulnerable'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Faction4

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction4.Cacophynos)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_cacophynos_name")
      card.setDescription(i18next.t("cards.faction_4_unit_cacophynos_desc"))
      card.atk = 6
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierDyingWishDestroyRandomEnemyNearby.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.FirstSwordofAkrane"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4LimboDwellerBreathing.name
        idle : RSX.f4LimboDwellerIdle.name
        walk : RSX.f4LimboDwellerRun.name
        attack : RSX.f4LimboDwellerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f4LimboDwellerHit.name
        death : RSX.f4LimboDwellerDeath.name
      )

    if (identifier == Cards.Faction4.StygianObserver)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_stygian_observer_name")
      card.setDescription(i18next.t("cards.faction_4_unit_stygian_observer_desc"))
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      statsBuff = Modifier.createContextObjectWithAttributeBuffs(2,2)
      statsBuff.appliedName = i18next.t("modifiers.faction_4_stygian_observer")
      card.setInherentModifiersContextObjects([
        ModifierDeathWatchBuffMinionsInHand.createContextObject([statsBuff])
      ])
      card.setFXResource(["FX.Cards.Neutral.DarkNemesis"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f6_waterelemental_death.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4StygianObserverBreathing.name
        idle : RSX.f4StygianObserverIdle.name
        walk : RSX.f4StygianObserverRun.name
        attack : RSX.f4StygianObserverAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f4StygianObserverHit.name
        death : RSX.f4StygianObserverDeath.name
      )

    if (identifier == Cards.Faction4.VoidTalonBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
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
        breathing : RSX.f4BuildMinionBreathing.name
        idle : RSX.f4BuildMinionIdle.name
        walk : RSX.f4BuildMinionIdle.name
        attack : RSX.f4BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4BuildMinionHit.name
        death : RSX.f4BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction4.GateBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
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
        breathing : RSX.f4BuildMinionBreathing.name
        idle : RSX.f4BuildMinionIdle.name
        walk : RSX.f4BuildMinionIdle.name
        attack : RSX.f4BuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4BuildMinionHit.name
        death : RSX.f4BuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction4.VoidTalon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_void_talon_name")
      card.setDescription(i18next.t("cards.faction_4_unit_void_talon_desc"))
      card.atk = 6
      card.maxHP = 1
      card.manaCost = 3
      card.rarityId = Rarity.Common
      buildData = {id: Cards.Faction4.VoidTalonBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Void Talon after 1 turn (this cannot be dispelled).", {id: Cards.Faction4.VoidTalon}, 1))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.BluetipScorpion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4VoidTalonBreathing.name
        idle : RSX.f4VoidTalonIdle.name
        walk : RSX.f4VoidTalonRun.name
        attack : RSX.f4VoidTalonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f4VoidTalonHit.name
        death : RSX.f4VoidTalonDeath.name
      )

    if (identifier == Cards.Faction4.NightmareOperant)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_nightmare_operant_name")
      card.setDescription(i18next.t("cards.faction_4_unit_nightmare_operant_desc"))
      card.raceId = Races.Mech
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierDyingWishAddCardToDeck.createContextObject({id: Cards.Neutral.Mechaz0r})
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.Amu"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_f2melee_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_f2melee_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4MechBreathing.name
        idle : RSX.f4MechIdle.name
        walk : RSX.f4MechRun.name
        attack : RSX.f4MechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f4MechHit.name
        death : RSX.f4MechDeath.name
      )

    if (identifier == Cards.Spell.Infest)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.Infest
      card.name = i18next.t("cards.faction_4_spell_infest_name")
      card.setDescription(i18next.t("cards.faction_4_spell_infest_desc"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      infestModifier = ModifierOnDyingInfest.createContextObject()
      infestModifier.appliedName = i18next.t("modifiers.faction_4_spell_infest_1")
      infestModifier.appliedDescription = i18next.t("modifiers.faction_4_spell_infest_2")
      card.setTargetModifiersContextObjects([
        infestModifier
      ])
      card.setFXResource(["FX.Cards.Spell.Infest"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconInfestIdle.name
        active : RSX.iconInfestActive.name
      )


    if (identifier == Cards.Faction4.Moonrider)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_moonrider_name")
      card.setDescription(i18next.t("cards.faction_4_unit_moonrider_desc"))
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizeSummonMinionNearby.createContextObject({id: Cards.Faction4.Fiend})
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.ArchonSpellbinder"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_archonspellbinder_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_archonspellbinder_hit.audio
        attackDamage : RSX.sfx_neutral_archonspellbinder_attack_impact.audio
        death : RSX.sfx_neutral_archonspellbinder_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4MoonriderBreathing.name
        idle : RSX.f4MoonriderIdle.name
        walk : RSX.f4MoonriderRun.name
        attack : RSX.f4MoonriderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4MoonriderHit.name
        death : RSX.f4MoonriderDeath.name
      )

    if (identifier == Cards.Faction4.GateToUndervault)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_gate_to_the_undervault_name")
      card.setDescription(i18next.t("cards.faction_4_unit_gate_to_the_undervault_desc"))
      card.raceId = Races.Structure
      card.atk = 0
      card.maxHP = 0
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      buildData = {id: Cards.Faction4.GateBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Gate to the Undervault after 3 turns (this cannot be dispelled).", {id: Cards.Faction4.GateToUndervault}, 3))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData),
        ModifierPortal.createContextObject(),
        ModifierInvulnerable.createContextObject(),
        ModifierDeathWatchSpawnRandomDemon.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Faction3.BrazierDuskWind"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_f1_general_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4ShadowPortalBreathing.name
        idle : RSX.f4ShadowPortalIdle.name
        walk : RSX.f4ShadowPortalIdle.name
        attack : RSX.f4ShadowPortalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f4ShadowPortalHit.name
        death : RSX.f4ShadowPortalDeath.name
      )

    if (identifier == Cards.Spell.Betrayal)
      card = new SpellBetrayal(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.Betrayal
      card.name = i18next.t("cards.faction_4_spell_betrayal_name")
      card.setDescription(i18next.t("cards.faction_4_spell_betrayal_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 6
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.Betrayal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_windstopper_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBetrayalIdle.name
        active : RSX.iconBetrayalActive.name
      )

    if (identifier == Cards.Spell.Deathmark)
      card = new SpellDamageAndApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.Deathmark
      card.name = i18next.t("cards.faction_4_spell_deathmark_name")
      card.setDescription(i18next.t("cards.faction_4_spell_deathmark_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.damageAmount = 1
      card.applyToEnemy = true
      whenAttackedModifier = ModifierWhenAttackedDestroyThis.createContextObject()
      whenAttackedModifier.durationEndTurn = 1
      whenAttackedModifier.isRemovable = false
      whenAttackedModifier.appliedName = i18next.t("modifiers.faction_4_spell_deathmark_1")
      whenAttackedModifier.appliedDescription = i18next.t("modifiers.faction_4_spell_deathmark_2")
      card.setTargetModifiersContextObjects([
        whenAttackedModifier
      ])
      card.setFXResource(["FX.Cards.Spell.Deathmark"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manavortex.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDeathmarkIdle.name
        active : RSX.iconDeathmarkActive.name
      )

    if (identifier == Cards.Spell.Vellumscry)
      card = new SpellVellumscry(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.Vellumscry
      card.name = i18next.t("cards.faction_4_spell_vellumscry_name")
      card.setDescription(i18next.t("cards.faction_4_spell_vellumscry_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 4
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = false
      card.drawCardsPostPlay = 3
      card.setFXResource(["FX.Cards.Spell.Vellumscry"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse02.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconVellumscryIdle.name
        active : RSX.iconVellumscryActive.name
      )

    if (identifier == Cards.Artifact.FurorChakram)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Artifact.FurorChakram
      card.name = i18next.t("cards.faction_4_artifact_furor_chakram_name")
      card.setDescription(i18next.t("cards.faction_4_artifact_furor_chakram_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.durability = 3
      attackModifier = Modifier.createContextObjectWithAttributeBuffs(2,0)
      attackModifier.appliedName = i18next.t("modifiers.faction_4_artifact_furor_chakram_1")
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAuraForAllAllies(
          [ModifierFrenzy.createContextObject(), attackModifier], null, null, null, i18next.t("modifiers.faction_4_artifact_furor_chakram_2")
        )
      ])
      card.setFXResource(["FX.Cards.Artifact.FurorChakram"])
      card.setBaseAnimResource(
        idle: RSX.iconRageChakramIdle.name
        active: RSX.iconRageChakramActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )
      card.addKeywordClassToInclude(ModifierFrenzy)

    if (identifier == Cards.Spell.HorrificVisage)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.HorrificVisage
      card.name = i18next.t("cards.faction_4_spell_horrific_visage_name")
      card.setDescription(i18next.t("cards.faction_4_spell_horrific_visage_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.EnemyIndirect
      customContextObject = Modifier.createContextObjectWithAttributeBuffs(-4,0)
      customContextObject.durationEndTurn = 2
      customContextObject.appliedName = i18next.t("modifiers.faction_4_spell_horrific_visage")
      card.setTargetModifiersContextObjects([customContextObject])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.setFXResource(["FX.Cards.Spell.HorrificVisage"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpookemIdle.name
        active : RSX.iconSpookemActive.name
      )

    if (identifier == Cards.Spell.AbhorrentUnbirth)
      card = new SpellAbhorrentUnbirth(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.AbhorrentUnbirth
      card.name = i18next.t("cards.faction_4_spell_abhorrent_unbirth_name")
      card.setDescription(i18next.t("cards.faction_4_spell_abhorrent_unbirth_desc"))
      card.rarityId = Rarity.Epic
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.SpawnSource
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Abomination}
      card.appliedName = i18next.t("modifiers.faction_4_spell_abhorrent_unbirth")
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.AbhorrentUnbirth"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_nethersummoning.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAbominationIdle.name
        active : RSX.iconAbominationActive.name
      )

    if (identifier == Cards.Faction4.Abomination)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_4_unit_abomination_name")
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)
      card.setBoundingBoxWidth(120)
      card.setBoundingBoxHeight(120)
      card.setFXResource(["FX.Cards.Faction4.Abomination"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_rook_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_rook_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4AbominationBreathing.name
        idle : RSX.f4AbominationIdle.name
        walk : RSX.f4AbominationRun.name
        attack : RSX.f4AbominationAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f4AbominationHit.name
        death : RSX.f4AbominationDeath.name
      )


    return card

module.exports = CardFactory_WartechSet_Faction4
