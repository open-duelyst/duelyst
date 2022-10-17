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
CardSet = require 'app/sdk/cards/cardSetLookup'

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellApplyModifiersSummonTile = require 'app/sdk/spells/spellApplyModifiersSummonTile'
SpellWrathOfGod = require 'app/sdk/spells/spellWrathOfGod'
SpellHealGeneralForEachFriendlyMinion = require 'app/sdk/spells/spellHealGeneralForEachFriendlyMinion'
SpellSummonDeadMinionOnHallowedGround = require 'app/sdk/spells/spellSummonDeadMinionOnHallowedGround'
SpellFortifiedAssault = require 'app/sdk/spells/spellFortifiedAssault'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierEnemySpellWatchBuffSelf = require 'app/sdk/modifiers/modifierEnemySpellWatchBuffSelf'
ModifierBandingRanged = require 'app/sdk/modifiers/modifierBandingRanged'
ModifierSummonWatchIfLowAttackSummonedBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchIfLowAttackSummonedBuffSelf'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierImmuneToSpellsByEnemy = require 'app/sdk/modifiers/modifierImmuneToSpellsByEnemy'
ModifierHallowedGround = require 'app/sdk/modifiers/modifierHallowedGround'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierOpeningGambitAlabasterTitan = require 'app/sdk/modifiers/modifierOpeningGambitAlabasterTitan'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Faction1

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.PurebladeEnforcer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_pureblade_enforcer_name")
      card.setDescription(i18next.t("cards.faction_1_unit_pureblade_enforcer_desc"))
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
        breathing : RSX.f1SpellbladeAdeptBreathing.name
        idle : RSX.f1SpellbladeAdeptIdle.name
        walk : RSX.f1SpellbladeAdeptRun.name
        attack : RSX.f1SpellbladeAdeptAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f1SpellbladeAdeptHit.name
        death : RSX.f1SpellbladeAdeptDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierEnemySpellWatchBuffSelf.createContextObject(1, 1, i18next.t("modifiers.faction_1_pureblade_enforcer_applied_name"))])

    if (identifier == Cards.Faction1.SunriseCleric)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sunrise_cleric_name")
      card.setDescription(i18next.t("cards.faction_1_unit_sunrise_cleric_desc"))
      card.setFXResource(["FX.Cards.Neutral.DayWatcher"])
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1ArchdeaconBreathing.name
        idle : RSX.f1ArchdeaconIdle.name
        walk : RSX.f1ArchdeaconRun.name
        attack : RSX.f1ArchdeaconAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f1ArchdeaconHit.name
        death : RSX.f1ArchdeaconDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setFollowups([
        {
          id: Cards.Spell.SpawnEntity
          cardDataOrIndexToSpawn: {id: Cards.Tile.Hallowed}
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])
      card.addKeywordClassToInclude(ModifierHallowedGround)
      card.addKeywordClassToInclude(ModifierOpeningGambit)

    if (identifier == Cards.Faction1.Solpiercer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_solpiercer_name")
      card.setDescription(i18next.t("cards.faction_1_unit_solpiercer_desc"))
      card.setFXResource(["FX.Cards.Neutral.Solpiercer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gambitgirl_hit.audio
        attackDamage : RSX.sfx_neutral_swornavenger_attack_impact.audio
        death : RSX.sfx_f6_icedryad_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1BacklineArcherBreathing.name
        idle : RSX.f1BacklineArcherIdle.name
        walk : RSX.f1BacklineArcherRun.name
        attack : RSX.f1BacklineArcherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1BacklineArcherHit.name
        death : RSX.f1BacklineArcherDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierBandingRanged.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierRanged)

    if (identifier == Cards.Faction1.Auroara)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_auroara_name")
      card.setDescription(i18next.t("cards.faction_1_unit_auroara_desc"))
      card.setFXResource(["FX.Cards.Neutral.Tethermancer"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1AuroraLionessBreathing.name
        idle : RSX.f1AuroraLionessIdle.name
        walk : RSX.f1AuroraLionessRun.name
        attack : RSX.f1AuroraLionessAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1AuroraLionessHit.name
        death : RSX.f1AuroraLionessDeath.name
      )
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchIfLowAttackSummonedBuffSelf.createContextObject(2,0,2,i18next.t("modifiers.faction_1_aurora_applied_name"))
      ])

    if (identifier == Cards.Faction1.WarJudicator)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_war_judicator_name")
      card.setDescription(i18next.t("cards.faction_1_unit_war_judicator_desc"))
      card.setFXResource(["FX.Cards.Neutral.GoldenJusticar"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_f5_vindicator_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1Peacekeeper2Breathing.name
        idle : RSX.f1Peacekeeper2Idle.name
        walk : RSX.f1Peacekeeper2Run.name
        attack : RSX.f1Peacekeeper2Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f1Peacekeeper2Hit.name
        death : RSX.f1Peacekeeper2Death.name
      )
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      shieldContextObject = ModifierImmuneToSpellsByEnemy.createContextObject()
      shieldContextObject.appliedName = i18next.t("modifiers.faction_1_war_judicator_applied_name")
      card.setInherentModifiersContextObjects([Modifier.createContextObjectWithAuraForNearbyAllies([shieldContextObject],null,null,null,i18next.t("cards.faction_1_unit_war_judicator_desc"))])

    if (identifier == Cards.Artifact.HaloBulwark)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.HaloBulwark
      card.name = i18next.t("cards.faction_1_artifact_halo_bulwark_name")
      card.setDescription(i18next.t("cards.faction_1_artifact_halo_bulwark_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAuraForNearbyAllies(
          [ModifierForcefield.createContextObject()], null, null, null, i18next.t("cards.faction_1_artifact_halo_bulwark_desc")
        )
      ])
      card.setFXResource(["FX.Cards.Artifact.HaloBulwark"])
      card.setBaseAnimResource(
        idle: RSX.iconHaloBulwarkIdle.name
        active: RSX.iconHaloBulwarkActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )
      card.addKeywordClassToInclude(ModifierForcefield)

    if (identifier == Cards.Faction1.AlabasterTitan)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_alabaster_titan_name")
      card.setDescription(i18next.t("cards.faction_1_unit_alabaster_titan_desc"))
      card.setFXResource(["FX.Cards.Neutral.BloodTaura"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_rook_hit.audio
        attack : RSX.sfx_neutral_khymera_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_khymera_hit.audio
        attackDamage : RSX.sfx_neutral_khymera_impact.audio
        death : RSX.sfx_neutral_khymera_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1GroundbreakerBreathing.name
        idle : RSX.f1GroundbreakerIdle.name
        walk : RSX.f1GroundbreakerRun.name
        attack : RSX.f1GroundbreakerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1GroundbreakerHit.name
        death : RSX.f1GroundbreakerDeath.name
      )
      card.atk = 5
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitAlabasterTitan.createContextObject()
      ])

    if (identifier == Cards.Spell.Congregation)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.Congregation
      card.name = i18next.t("cards.faction_1_spell_empyreal_congregation_name")
      card.setDescription(i18next.t("cards.faction_1_spell_empyreal_congregation_desc"))
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2,2)
      statContextObject.appliedName = i18next.t("modifiers.faction_1_spell_empyreal_congregation_1")
      card.setTargetModifiersContextObjects([
        statContextObject
      ])
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.setFXResource(["FX.Cards.Spell.Congregation"])
      card.setBaseAnimResource(
        idle: RSX.iconEmpyrealCongregationIdle.name
        active: RSX.iconEmpyrealCongregationActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    if (identifier == Cards.Spell.Sanctify)
      card = new SpellApplyModifiersSummonTile(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.Sanctify
      card.name = i18next.t("cards.faction_1_spell_sanctify_name")
      card.setDescription(i18next.t("cards.faction_1_spell_sanctify_desc"))
      card.addKeywordClassToInclude(ModifierHallowedGround)
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Tile.Hallowed}
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statContextObject.appliedName = i18next.t("modifiers.faction_1_spell_sanctify_1")
      card.setTargetModifiersContextObjects([
        statContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Sanctify"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_sunbloom.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSanctifyIdle.name
        active : RSX.iconSanctifyActive.name
      )

    if (identifier == Cards.Spell.ChanneledBreath)
      card = new SpellHealGeneralForEachFriendlyMinion(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.ChanneledBreath
      card.name = i18next.t("cards.faction_1_spell_channeled_breath_name")
      card.setDescription(i18next.t("cards.faction_1_spell_channeled_breath_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.None
      card.healAmountPerMinion = 2
      card.setFXResource(["FX.Cards.Spell.ChanneledBreath"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_lionheartblessing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconChanneledBreathIdle.name
        active : RSX.iconChanneledBreathActive.name
      )

    if (identifier == Cards.Spell.AperionsClaim)
      card = new SpellWrathOfGod(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.AperionsClaim
      card.name = i18next.t("cards.faction_1_spell_aperions_claim_name")
      card.setDescription(i18next.t("cards.faction_1_spell_aperions_claim_desc"))
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setAffectPattern(CONFIG.PATTERN_3x3_INCLUDING_CENTER)
      card.spellFilterType = SpellFilterType.None
      card.applyToAllies = true
      card.addKeywordClassToInclude(ModifierHallowedGround)
      card.setFXResource(["FX.Cards.Spell.AperionsClaim"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGreaterGoodIdle.name
        active : RSX.iconGreaterGoodActive.name
      )

    if (identifier == Cards.Spell.ValeAscension)
      card = new SpellSummonDeadMinionOnHallowedGround(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.ValeAscension
      card.name = i18next.t("cards.faction_1_spell_vale_ascension_name")
      card.setDescription(i18next.t("cards.faction_1_spell_vale_ascension_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.None
      card.addKeywordClassToInclude(ModifierHallowedGround)
      card.setFXResource(["FX.Cards.Spell.ValeAscension"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconValeAscensionIdle.name
        active : RSX.iconValeAscensionActive.name
      )

    if (identifier == Cards.Spell.FortifiedAssault)
      card = new SpellFortifiedAssault(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.FortifiedAssault
      card.name = i18next.t("cards.faction_1_spell_fortified_assault_name")
      card.setDescription(i18next.t("cards.faction_1_spell_fortified_assault_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.addKeywordClassToInclude(ModifierHallowedGround)
      card.setFXResource(["FX.Cards.Spell.FortifiedAssault"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_truestrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFortifiedAssaultIdle.name
        active : RSX.iconFortifiedAssaultActive.name
      )

    return card

module.exports = CardFactory_FirstWatchSet_Faction1
