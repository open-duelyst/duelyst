# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'

Logger = require 'app/common/logger'

CONFIG = require('app/common/config')
RSX = require('app/data/resources')

Card = require 'app/sdk/cards/card'
Cards = require 'app/sdk/cards/cardsLookupComplete'
CardSet = require 'app/sdk/cards/cardSetLookup'
CardType = require 'app/sdk/cards/cardType'
Factions = require 'app/sdk/cards/factionsLookup'
FactionFactory = require 'app/sdk/cards/factionFactory'
Races = require 'app/sdk/cards/racesLookup'
Rarity = require 'app/sdk/cards/rarityLookup'

Unit = require 'app/sdk/entities/unit'
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellRemoveTargetSpawnEntity = require 'app/sdk/spells/spellRemoveTargetSpawnEntity'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBond = require 'app/sdk/modifiers/modifierBond'
ModifierBondDrawCards = require 'app/sdk/modifiers/modifierBondDrawCards'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierOpeningGambitEquipArtifact = require 'app/sdk/modifiers/modifierOpeningGambitEquipArtifact'
ModifierOpeningGambitSirocco = require 'app/sdk/modifiers/modifierOpeningGambitSirocco'
ModifierKillWatchSpawnCopyNearby = require 'app/sdk/modifiers/modifierKillWatchSpawnCopyNearby'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_UnitySet_Faction3

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction3.Dreamcarver)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_dreamshaper_name")
      card.setDescription(i18next.t("cards.faction_3_unit_dreamshaper_desc"))
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.SkyrockGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3DreamshaperBreathing.name
        idle : RSX.f3DreamshaperIdle.name
        walk : RSX.f3DreamshaperRun.name
        attack : RSX.f3DreamshaperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f3DreamshaperHit.name
        death : RSX.f3DreamshaperDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBondDrawCards.createContextObject(2)])

    if (identifier == Cards.Spell.BloodOfAir)
      card = new SpellRemoveTargetSpawnEntity(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.BloodOfAir
      card.name = i18next.t("cards.faction_3_spell_blood_of_air_name")
      card.setDescription(i18next.t("cards.faction_3_spell_blood_of_air_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Faction3.Dervish}
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.BloodOfAir"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fountainofyouth.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBloodOfAirIdle.name
        active : RSX.iconBloodOfAirActive.name
      )

    if (identifier == Cards.Faction3.Windlark)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_wind_striker_name")
      card.setDescription(i18next.t("cards.faction_3_unit_wind_striker_desc"))
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Faction3.WindShrike"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_neutral_monsterdreamoracle_attack_impact.audio
        death : RSX.sfx_neutral_monsterdreamoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3WindstrikerBreathing.name
        idle : RSX.f3WindstrikerIdle.name
        walk : RSX.f3WindstrikerRun.name
        attack : RSX.f3WindstrikerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f3WindstrikerHit.name
        death : RSX.f3WindstrikerDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierFlying.createContextObject(),
        ModifierOpeningGambitEquipArtifact.createContextObject({id: Cards.Artifact.StaffOfYKir})
      ])

    if (identifier == Cards.Faction3.Sirocco)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.raceId = Races.Golem
      card.name = i18next.t("cards.faction_3_unit_sirocco_name")
      card.setDescription(i18next.t("cards.faction_3_unit_sirocco_desc"))
      card.setFXResource(["FX.Cards.Neutral.StormmetalGolem"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(70)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormmetalgolem_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_stormmetalgolem_hit.audio
        attackDamage : RSX.sfx_neutral_stormmetalgolem_attack_impact.audio
        death : RSX.sfx_neutral_stormmetalgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3SiroccoBreathing.name
        idle : RSX.f3SiroccoIdle.name
        walk : RSX.f3SiroccoRun.name
        attack : RSX.f3SiroccoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f3SiroccoHit.name
        death : RSX.f3SiroccoDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpeningGambitSirocco.createContextObject()])

    if (identifier == Cards.Artifact.Thunderclap)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Artifact.Thunderclap
      card.name = i18next.t("cards.faction_3_artifact_thunderclap_name")
      card.setDescription(i18next.t("cards.faction_3_artifact_thunderclap_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierKillWatchSpawnCopyNearby.createContextObject(true, false,
        {
          type: "ModifierKillWatchSpawnCopyNearby"
          name: i18next.t("cards.faction_3_artifact_thunderclap_name")
          description: i18next.t("cards.faction_3_artifact_thunderclap_description")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.HornOfTheForsaken"])
      card.setBaseAnimResource(
        idle: RSX.iconThunderclapIdle.name
        active: RSX.iconThunderclapActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_UnitySet_Faction3
