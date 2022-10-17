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
SpellToothAndTrial = require 'app/sdk/spells/spellToothAndTrial'
SpellVaathsSpirit = require 'app/sdk/spells/spellVaathsSpirit'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'
SpellDinoParty = require 'app/sdk/spells/spellDinoParty'
SpellMassMojo = require 'app/sdk/spells/spellMassMojo'
SpellBloodRage = require 'app/sdk/spells/spellBloodRage'

ModifierOpponentSummonWatchSummonEgg = require 'app/sdk/modifiers/modifierOpponentSummonWatchSummonEgg'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierImmuneToSpellsByEnemy = require 'app/sdk/modifiers/modifierImmuneToSpellsByEnemy'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierSpellWatchDamageAllMinions = require 'app/sdk/modifiers/modifierSpellWatchDamageAllMinions'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierPrimalTile = require 'app/sdk/modifiers/modifierPrimalTile'
ModifierEternalHeart = require 'app/sdk/modifiers/modifierEternalHeart'
ModifierGrow = require 'app/sdk/modifiers/modifierGrow'
ModifierGrowPermanent = require 'app/sdk/modifiers/modifierGrowPermanent'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Faction5

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction5.Rizen)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_rizen_name")
      card.setDescription(i18next.t("cards.faction_5_unit_rizen_desc"))
      card.setFXResource(["FX.Cards.Neutral.ThornNeedler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5GenesisBreathing.name
        idle : RSX.f5GenesisIdle.name
        walk : RSX.f5GenesisRun.name
        attack : RSX.f5GenesisAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f5GenesisHit.name
        death : RSX.f5GenesisDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierOpponentSummonWatchSummonEgg.createContextObject({id: Cards.Faction5.Rizen}, "Rizen")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction5.Quillbeast)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_catalyst_quillbeast_name")
      card.setDescription(i18next.t("cards.faction_5_unit_catalyst_quillbeast_desc"))
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierSpellWatchDamageAllMinions.createContextObject(1)])
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
        breathing : RSX.f5QuillbeastBreathing.name
        idle : RSX.f5QuillbeastIdle.name
        walk : RSX.f5QuillbeastRun.name
        attack : RSX.f5QuillbeastAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5QuillbeastHit.name
        death : RSX.f5QuillbeastDeath.name
      )

    if (identifier == Cards.Faction5.Terradon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_terradon_name")
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
        breathing : RSX.f5FlumposaurBreathing.name
        idle : RSX.f5FlumposaurIdle.name
        walk : RSX.f5FlumposaurRun.name
        attack : RSX.f5FlumposaurAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5FlumposaurHit.name
        death : RSX.f5FlumposaurDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.manaCost = 3
      card.rarityId = Rarity.Common

    if (identifier == Cards.Faction5.Warpup)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_warpup_name")
      card.setDescription(i18next.t("cards.faction_5_unit_warpup_desc"))
      card.setFXResource(["FX.Cards.Neutral.KomodoCharger"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(40)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_komodocharger_hit.audio
        attackDamage : RSX.sfx_neutral_komodocharger_attack_impact.audio
        death : RSX.sfx_neutral_komodocharger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5MiniBeastBreathing.name
        idle : RSX.f5MiniBeastIdle.name
        walk : RSX.f5MiniBeastRun.name
        attack : RSX.f5MiniBeastAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.45
        damage : RSX.f5MiniBeastHit.name
        death : RSX.f5MiniBeastDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierForcefield.createContextObject(), ModifierFrenzy.createContextObject()])

    if (identifier == Cards.Faction5.GrandmasterKraigon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_grandmaster_kraigon_name")
      card.setDescription(i18next.t("cards.faction_5_unit_grandmaster_kraigon_desc"))
      card.setFXResource(["FX.Cards.Neutral.Paddo"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_f5_unstableleviathan_hit.audio
        attackDamage : RSX.sfx_f5_unstableleviathan_attack_impact.audio
        death : RSX.sfx_f5_unstableleviathan_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5GrandmasterKraigonBreathing.name
        idle : RSX.f5GrandmasterKraigonIdle.name
        walk : RSX.f5GrandmasterKraigonRun.name
        attack : RSX.f5GrandmasterKraigonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.6
        damage : RSX.f5GrandmasterKraigonHit.name
        death : RSX.f5GrandmasterKraigonDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 9
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierForcefield.createContextObject(),
        ModifierGrow.createContextObject(7),
        ModifierFrenzy.createContextObject(),
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([
          ModifierForcefield.createContextObject(),
          ModifierGrowPermanent.createContextObject(7),
          ModifierFrenzy.createContextObject()
        ], "Your General has: Forcefield, Frenzy, Grow: +7/+7.")
      ])

    if (identifier == Cards.Faction5.Omniseer)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.faction_5_unit_omniseer_name")
      card.setDescription(i18next.t("cards.faction_5_unit_omniseer_desc"))
      card.setFXResource(["FX.Cards.Faction5.Omniseer"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_silitharveteran_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5OmniseerBreathing.name
        idle : RSX.f5OmniseerIdle.name
        walk : RSX.f5OmniseerRun.name
        attack : RSX.f5OmniseerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5OmniseerHit.name
        death : RSX.f5OmniseerDeath.name
      )
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.addKeywordClassToInclude(ModifierPrimalTile)
      card.setFollowups([
        {
          id: Cards.Spell.SpawnEntity
          cardDataOrIndexToSpawn: {id: Cards.Tile.PrimalMojo}
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Spell.PrimalBallast)
      card = new SpellToothAndTrial(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.ToothAndTrial
      card.name = i18next.t("cards.faction_5_spell_primal_ballast_name")
      card.setDescription(i18next.t("cards.faction_5_spell_primal_ballast_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.PrimalBallast"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPrimalBallastIdle.name
        active : RSX.iconPrimalBallastActive.name
      )

    if (identifier == Cards.Spell.VaathsBrutality)
      card = new SpellVaathsSpirit(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.VaathsBrutality
      card.name = i18next.t("cards.faction_5_spell_vaaths_brutality_name")
      card.setDescription(i18next.t("cards.faction_5_spell_vaaths_brutality_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.addKeywordClassToInclude(ModifierStun)
      card.setTargetModifiersContextObjects([ModifierStunned.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.VaathsBrutality"])
      card.setBaseSoundResource(
        apply : RSX.sfx_division_crest_outline_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpiritOfVaathIdle.name
        active : RSX.iconSpiritOfVaathActive.name
      )

    if (identifier == Cards.Spell.EndureTheBeastlands)
      card = new SpellSpawnEntity(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.EndureTheBeastlands
      card.name = i18next.t("cards.faction_5_spell_endure_the_beastlands_name")
      card.setDescription(i18next.t("cards.faction_5_spell_endure_the_beastlands_desc"))
      card.rarityId = Rarity.Epic
      card.addKeywordClassToInclude(ModifierPrimalTile)
      card.manaCost = 3
      card.cardDataOrIndexToSpawn = {id: Cards.Tile.PrimalMojo}
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      card.setFXResource(["FX.Cards.Spell.EndureTheBeastlands"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEndureTheBeastlandsIdle.name
        active : RSX.iconEndureTheBeastlandsActive.name
      )

    if (identifier == Cards.Spell.EvolutionaryApex)
      card = new SpellDinoParty(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.EvolutionaryApex
      card.name = i18next.t("cards.faction_5_spell_evolutionary_apex_name")
      card.setDescription(i18next.t("cards.faction_5_spell_evolutionary_apex_desc"))
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setFXResource(["FX.Cards.Spell.EvolutionaryApex"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f2tank_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEvolutionaryApexIdle.name
        active : RSX.iconEvolutionaryApexActive.name
      )

    if (identifier == Cards.Spell.VerdentFulmination)
      card = new SpellMassMojo(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.VerdentFulmination
      card.name = i18next.t("cards.faction_5_spell_verdant_fulmination_name")
      card.setDescription(i18next.t("cards.faction_5_spell_verdant_fulmination_desc"))
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.addKeywordClassToInclude(ModifierPrimalTile)
      card.setFXResource(["FX.Cards.Spell.VerdentFulmination"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconVerdentFulminationIdle.name
        active : RSX.iconVerdentFulminationActive.name
      )

    if (identifier == Cards.Spell.BloodRage)
      card = new SpellBloodRage(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.BloodRage
      card.name = i18next.t("cards.faction_5_spell_blood_rage_name")
      card.setDescription(i18next.t("cards.faction_5_spell_blood_rage_desc"))
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.BloodRage"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_chaoselemental_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBloodrageIdle.name
        active : RSX.iconBloodrageActive.name
      )

    if (identifier == Cards.Artifact.EternalHeart)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction5
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Artifact.EternalHeart
      card.name = i18next.t("cards.faction_5_artifact_eternal_heart_name")
      card.setDescription(i18next.t("cards.faction_5_artifact_eternal_heart_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierEternalHeart.createContextObject({
          type: "ModifierEternal"
          name: i18next.t("cards.faction_5_artifact_eternal_heart_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.EternalHeart"])
      card.setBaseAnimResource(
        idle: RSX.iconEternalHeartIdle.name
        active: RSX.iconEternalHeartActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_artifact_equip.audio
      )

    return card

module.exports = CardFactory_FirstWatchSet_Faction5
