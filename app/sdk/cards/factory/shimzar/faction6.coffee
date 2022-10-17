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
SpellDamage = require 'app/sdk/spells/spellDamage'
SpellWailingOverdrive = require 'app/sdk/spells/spellWailingOverdrive'
SpellVespyricCall = require 'app/sdk/spells/spellVespyricCall'
SpellLightningBlitz = require 'app/sdk/spells/spellLightningBlitz'
SpellWintersWake = require 'app/sdk/spells/spellWintersWake'
SpellAlteredBeast = require 'app/sdk/spells/spellAlteredBeast'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierKillWatchSpawnEntity = require 'app/sdk/modifiers/modifierKillWatchSpawnEntity'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierOpeningGambitApplyModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiers'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierInfiltrate = require 'app/sdk/modifiers/modifierInfiltrate'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierSnowRippler = require 'app/sdk/modifiers/modifierSnowRippler'
ModifierSurviveDamageWatchBur = require 'app/sdk/modifiers/modifierSurviveDamageWatchBur'
ModifierMyAttackOrAttackedWatchSpawnMinionNearby = require 'app/sdk/modifiers/modifierMyAttackOrAttackedWatchSpawnMinionNearby'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_ShimzarSet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.IceDryad)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_iceblade_dryad_name")
      card.setDescription(i18next.t("cards.faction_6_unit_iceblade_dryad_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.IceDryad"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icedryad_attack_swing.audio
        receiveDamage : RSX.sfx_f6_icedryad_attack_impact.audio
        attackDamage : RSX.sfx_f6_icedryad_hit.audio
        death : RSX.sfx_f6_icedryad_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6IceDryadBreathing.name
        idle : RSX.f6IceDryadIdle.name
        walk : RSX.f6IceDryadRun.name
        attack : RSX.f6IceDryadAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f6IceDryadDamage.name
        death : RSX.f6IceDryadDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.addKeywordClassToInclude(ModifierFlying)
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statContextObject.appliedName = i18next.t("modifiers.faction_6_followup_iceblade_dryad_2")
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          filterRaceIds: [Races.Vespyr]
          spellFilterType: SpellFilterType.AllyDirect
          targetModifiersContextObjects: [
            ModifierFlying.createContextObject(),statContextObject
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_WHOLE_BOARD
          }
        }
      ])

    if (identifier == Cards.Faction6.SnowRippler)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_snow_rippler_name")
      card.setDescription(i18next.t("cards.faction_6_unit_snow_rippler_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.SnowRippler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_artifacthunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_artifacthunter_hit.audio
        attackDamage : RSX.sfx_neutral_artifacthunter_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SnowRipplerBreathing.name
        idle : RSX.f6SnowRipplerIdle.name
        walk : RSX.f6SnowRipplerRun.name
        attack : RSX.f6SnowRipplerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f6SnowRipplerHit.name
        death : RSX.f6SnowRipplerDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierInfiltrate.createContextObject([ModifierSnowRippler.createContextObject()], "Whenever this minion damages a General, put a random Battle Pet into your action bar")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.Icy)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_icy_name")
      card.setDescription(i18next.t("cards.faction_6_unit_icy_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Icy"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sai_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_sai_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6IcyBreathing.name
        idle : RSX.f6IcyIdle.name
        walk : RSX.f6IcyRun.name
        attack : RSX.f6IcyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f6IcyHit.name
        death : RSX.f6IcyDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.addKeywordClassToInclude(ModifierStun)
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          spellFilterType: SpellFilterType.EnemyDirect
          canTargetGeneral: true
          targetModifiersContextObjects: [
            ModifierStunnedVanar.createContextObject()
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject()])

    if (identifier == Cards.Faction6.Bur)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_bur_name")
      card.setDescription(i18next.t("cards.faction_6_unit_bur_desc"))
      card.raceId = Races.BattlePet
      card.setFXResource(["FX.Cards.Neutral.Nip"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_spell_polymorph.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sai_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_sai_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6BurBreathing.name
        idle : RSX.f6BurIdle.name
        walk : RSX.f6BurRun.name
        attack : RSX.f6BurAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f6BurHit.name
        death : RSX.f6BurDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), ModifierSurviveDamageWatchBur.createContextObject()])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.Huldra)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_huldra_name")
      card.setDescription(i18next.t("cards.faction_6_unit_huldra_desc"))
      card.setFXResource(["FX.Cards.Faction6.Huldra"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_icedryad_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6HuldraBreathing.name
        idle : RSX.f6HuldraIdle.name
        walk : RSX.f6HuldraRun.name
        attack : RSX.f6HuldraAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6HuldraHit.name
        death : RSX.f6HuldraDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.addKeywordClassToInclude(ModifierTranscendance)
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          filterRaceIds: [Races.Vespyr]
          spellFilterType: SpellFilterType.AllyDirect
          targetModifiersContextObjects: [
            ModifierTranscendance.createContextObject()
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_WHOLE_BOARD
          }
        }
      ])

    if (identifier == Cards.Faction6.Frostiva)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_frostiva_name")
      card.setDescription(i18next.t("cards.faction_6_unit_frostiva_desc"))
      card.setFXResource(["FX.Cards.Faction6.WolfAspect"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_primordialgazer_attack_impact.audio
        attack : RSX.sfx_f3_anubis_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_spell_icepillar.audio
        death : RSX.sfx_f3_anubis_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6FrostivaBreathing.name
        idle : RSX.f6FrostivaIdle.name
        walk : RSX.f6FrostivaRun.name
        attack : RSX.f6FrostivaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f6FrostivaHit.name
        death : RSX.f6FrostivaDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierForcefield.createContextObject(), ModifierMyAttackOrAttackedWatchSpawnMinionNearby.createContextObject({id: Cards.Faction6.ShadowVespyr}, "a 3/3 Vespyr Night Howler")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.ShadowVespyr)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.raceId = Races.Vespyr
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_6_unit_night_howler_name")
      card.setFXResource(["FX.Cards.Faction6.WaterBear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_f6_waterelemental_attack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6ShadowVespyrBreathing.name
        idle : RSX.f6ShadowVespyrIdle.name
        walk : RSX.f6ShadowVespyrRun.name
        attack : RSX.f6ShadowVespyrAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f6ShadowVespyrHit.name
        death : RSX.f6ShadowVespyrDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Spell.Frostburn)
      card = new SpellDamage(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Frostburn
      card.name = i18next.t("cards.faction_6_spell_frostburn_name")
      card.setDescription(i18next.t("cards.faction_6_spell_frostburn_description"))
      card.manaCost = 6
      card.rarityId = Rarity.Rare
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.spellFilterType = SpellFilterType.EnemyIndirect
      card.damageAmount = 3
      card.setFXResource(["FX.Cards.Spell.Frostburn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFrostburnIdle.name
        active : RSX.iconFrostburnActive.name
      )

    if (identifier == Cards.Spell.WailingOverdrive)
      card = new SpellWailingOverdrive(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.WailingOverdrive
      card.name = i18next.t("cards.faction_6_spell_wailing_overdrive_name")
      card.setDescription(i18next.t("cards.faction_6_spell_wailing_overdrive_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(5,5)
      buffContextObject.appliedName = i18next.t("cards.faction_6_spell_wailing_overdrive_name")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Mesmerize"])
      card.setBaseAnimResource(
        idle: RSX.iconWailingOverdriveIdle.name
        active: RSX.iconWailingOverdriveActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.VespyricCall)
      card = new SpellVespyricCall(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.VespyricCall
      card.name = i18next.t("cards.faction_6_spell_vespyric_call_name")
      card.setDescription(i18next.t("cards.faction_6_spell_vespyric_call_description"))
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.Cryogenesis"])
      card.setBaseAnimResource(
        idle: RSX.iconVespyricCallIdle.name
        active: RSX.iconVespyricCallActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.LightningBlitz)
      card = new SpellLightningBlitz(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.LightningBlitz
      card.name = i18next.t("cards.faction_6_spell_lightning_blitz_name")
      card.setDescription(i18next.t("cards.faction_6_spell_lightning_blitz_description"))
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      buffContextObject.appliedName = i18next.t("modifiers.faction_6_spell_lightning_blitz_1")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card._fxResource = ["FX.Cards.Spell.LightningBlitz"]
      card.setBaseAnimResource(
        idle: RSX.iconLightningBlitzIdle.name
        active: RSX.iconLightningBlitzActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.WintersWake)
      card = new SpellWintersWake(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.WintersWake
      card.name = i18next.t("cards.faction_6_spell_winters_wake_name")
      card.setDescription(i18next.t("cards.faction_6_spell_winters_wake_description"))
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      wintersWakeModContextObject = Modifier.createContextObjectWithAttributeBuffs(4,4)
      wintersWakeModContextObject.appliedName =  i18next.t("modifiers.faction_6_spell_winters_wake_1")
      wintersWakeModContextObject.appliedDescription = i18next.t("modifiers.faction_6_spell_winters_wake_2")
      card.setTargetModifiersContextObjects([wintersWakeModContextObject])
      card.setFXResource(["FX.Cards.Spell.WintersWake"])
      card.setBaseAnimResource(
        idle: RSX.iconWintersWakeIdle.name
        active: RSX.iconWintersWakeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_kineticequilibrium.audio
      )

    if (identifier == Cards.Spell.AlteredBeast)
      card = new SpellAlteredBeast(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.AlteredBeast
      card.name = i18next.t("cards.faction_6_spell_altered_beast_name")
      card.setDescription(i18next.t("cards.faction_6_spell_altered_beast_description"))
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.AlteredBeast"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ghostwolf_attack_swing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAlteredBeastIdle.name
        active : RSX.iconAlteredBeastActive.name
      )

    if (identifier == Cards.Artifact.WhiteAsp)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Shimzar)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.WhiteAsp
      card.name = i18next.t("cards.faction_6_artifact_white_asp_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_white_asp_description"))
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(3,0,{
          name: i18next.t("cards.faction_6_artifact_white_asp_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:3})
        }),
        ModifierKillWatchSpawnEntity.createContextObject({id: Cards.Faction6.BlazingSpines}, true, false, 1, CONFIG.PATTERN_1x1, true,{
          name: i18next.t("cards.faction_6_artifact_white_asp_name")
          description: i18next.t("modifiers.faction_6_artifact_white_asp_2")
        })
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Artifact.WhiteAsp"])
      card.setBaseAnimResource(
        idle: RSX.iconWhiteAspIdle.name
        active: RSX.iconWhiteAspActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_ShimzarSet_Faction6
