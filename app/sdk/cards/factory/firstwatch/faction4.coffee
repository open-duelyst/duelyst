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
SpellInklingSurge = require 'app/sdk/spells/spellInklingSurge'
SpellShadows = require 'app/sdk/spells/spellShadows'
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'
SpellRequireUnoccupiedFriendlyCreep = require 'app/sdk/spells/spellRequireUnoccupiedFriendlyCreep'
SpellKillEnemyOnFriendlyCreep = require 'app/sdk/spells/spellKillEnemyOnFriendlyCreep'
SpellCurseOfShadows = require 'app/sdk/spells/spellCurseOfShadows'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpponentSummonWatchBuffMinionInHand = require 'app/sdk/modifiers/modifierOpponentSummonWatchBuffMinionInHand'
ModifierDyingWishDrawMinionsWithDyingWish = require 'app/sdk/modifiers/modifierDyingWishDrawMinionsWithDyingWish'
ModifierDealDamageWatchControlEnemyMinionUntilEOT = require 'app/sdk/modifiers/modifierDealDamageWatchControlEnemyMinionUntilEOT'
ModifierOpeningGambitStealEnemyGeneralHealth = require 'app/sdk/modifiers/modifierOpeningGambitStealEnemyGeneralHealth'
ModifierDoomed3 = require 'app/sdk/modifiers/modifierDoomed3'
ModifierSentinelSetup = require 'app/sdk/modifiers/modifierSentinelSetup'
ModifierSentinelOpponentGeneralAttack = require 'app/sdk/modifiers/modifierSentinelOpponentGeneralAttack'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierSentinelOpponentSummonCopyIt = require 'app/sdk/modifiers/modifierSentinelOpponentSummonCopyIt'
ModifierSentinelOpponentSpellCast = require 'app/sdk/modifiers/modifierSentinelOpponentSpellCast'
ModifierEnemySpellWatchPutCardInHand = require 'app/sdk/modifiers/modifierEnemySpellWatchPutCardInHand'
ModifierDyingWishPutCardInHand = require 'app/sdk/modifiers/modifierDyingWishPutCardInHand'
ModifierSentinel = require 'app/sdk/modifiers/modifierSentinel'
ModifierStackingShadows = require 'app/sdk/modifiers/modifierStackingShadows'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Faction4

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction4.Phantasm)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_phantasm_name")
      card.setDescription(i18next.t("cards.faction_4_unit_phantasm_desc"))
      card.setFXResource(["FX.Cards.Faction4.DarkSiren"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f4_siren_attack_swing.audio
        receiveDamage : RSX.sfx_f4_siren_hit.audio
        attackDamage : RSX.sfx_f4_siren_attack_impact.audio
        death : RSX.sfx_f4_siren_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4PhantasmBreathing.name
        idle : RSX.f4PhantasmIdle.name
        walk : RSX.f4PhantasmRun.name
        attack : RSX.f4PhantasmAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f4PhantasmHit.name
        death : RSX.f4PhantasmDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpponentSummonWatchBuffMinionInHand.createContextObject(1,0,i18next.t("modifiers.faction_4_phantasm"))])

    if (identifier == Cards.Faction4.Nekomata)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_nekomata_name")
      card.setDescription(i18next.t("cards.faction_4_unit_nekomata_desc"))
      card.setFXResource(["FX.Cards.Neutral.PutridMindflayer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_daemondeep_attack_swing.audio
        receiveDamage : RSX.sfx_f4_daemondeep_hit.audio
        attackDamage : RSX.sfx_f4_daemondeep_attack_impact.audio
        death : RSX.sfx_f4_daemondeep_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4ArachneBreathing.name
        idle : RSX.f4ArachneIdle.name
        walk : RSX.f4ArachneRun.name
        attack : RSX.f4ArachneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f4ArachneHit.name
        death : RSX.f4ArachneDeath.name
      )
      card.atk = 4
      card.maxHP = 2
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierDyingWishDrawMinionsWithDyingWish.createContextObject(2)])

    if (identifier == Cards.Spell.InklingSurge)
      card = new SpellInklingSurge(gameSession)
      card.factionId = Factions.Faction4
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.InklingSurge
      card.name = i18next.t("cards.faction_4_spell_inkling_surge_name")
      card.setDescription(i18next.t("cards.faction_4_spell_inkling_surge_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Wraithling}
      card.spellFilterType = SpellFilterType.SpawnSource
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.InklingSurge"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconInklingSurgeIdle.name
        active : RSX.iconInklingSurgeActive.name
      )

    if (identifier == Cards.Spell.Shadowstalk)
      card = new SpellShadows(gameSession)
      card.factionId = Factions.Faction4
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.Shadowstalk
      card.name = i18next.t("cards.faction_4_spell_shadowstalk_name")
      card.setDescription(i18next.t("cards.faction_4_spell_shadowstalk_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.Shadowstalk"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_starsfury.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconShadowstalkIdle.name
        active : RSX.iconShadowstalkActive.name
      )

    if (identifier == Cards.Artifact.Mindlathe)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.id = Cards.Artifact.Mindlathe
      card.name = i18next.t("cards.faction_4_artifact_mindlathe_name")
      card.setDescription(i18next.t("cards.faction_4_artifact_mindlathe_desc"))
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierDealDamageWatchControlEnemyMinionUntilEOT.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Artifact.Mindlathe"])
      card.setBaseAnimResource(
        idle: RSX.iconMindlatheIdle.name
        active: RSX.iconMindlatheActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Faction4.Desolator)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_desolator_name")
      card.setDescription(i18next.t("cards.faction_4_unit_desolator_desc"))
      card.setFXResource(["FX.Cards.Neutral.Moebius"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_spell_entropicdecay.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4DesolaterBreathing.name
        idle : RSX.f4DesolaterIdle.name
        walk : RSX.f4DesolaterRun.name
        attack : RSX.f4DesolaterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4DesolaterHit.name
        death : RSX.f4DesolaterDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitStealEnemyGeneralHealth.createContextObject(2),
        ModifierDyingWishPutCardInHand.createContextObject({id: Cards.Faction4.Desolator}, "Desolator")
      ])

    if (identifier == Cards.Spell.Doom)
      card = new SpellApplyModifiersToGeneral(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.Doom
      card.name = i18next.t("cards.faction_4_spell_doom_name")
      card.setDescription(i18next.t("cards.faction_4_spell_doom_desc"))
      card.manaCost = 9
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.None
      card.applyToOpponentGeneral = true
      doomedContextObject = ModifierDoomed3.createContextObject()
      doomedContextObject.appliedName = i18next.t("modifiers.faction_4_spell_doom_1")
      card.setTargetModifiersContextObjects([
        doomedContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Doom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDoomIdle.name
        active : RSX.iconDoomActive.name
      )

    if (identifier == Cards.Faction4.AbyssSentinel)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_4_unit_watchful_sentinel_name")
      card.setDescription(i18next.t("cards.faction_4_unit_watchful_sentinel_desc"))
      card.setFXResource(["FX.Cards.Faction4.ShadowWatcher"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4AbyssianSentinelBreathing.name
        idle : RSX.f4AbyssianSentinelIdle.name
        walk : RSX.f4AbyssianSentinelRun.name
        attack : RSX.f4AbyssianSentinelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f4AbyssianSentinelHit.name
        death : RSX.f4AbyssianSentinelDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction4.SkullProphet)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_skullprophet_name")
      card.setDescription(i18next.t("cards.faction_4_unit_skullprophet_desc"))
      card.setFXResource(["FX.Cards.Faction4.SkullCaster"])
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
        breathing : RSX.f4SkullcasterBreathing.name
        idle : RSX.f4SkullcasterIdle.name
        walk : RSX.f4SkullcasterRun.name
        attack : RSX.f4SkullcasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f4SkullcasterHit.name
        death : RSX.f4SkullcasterDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      sentinelData = {id: Cards.Faction4.AbyssSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentGeneralAttack.createContextObject("transform.", {id: Cards.Faction4.SkullProphet}))
      contextObject = Modifier.createContextObjectWithAttributeBuffs(-1)
      contextObject.appliedName = i18next.t("modifiers.faction_4_skullprophet")
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([contextObject], "The enemy General has -1 Attack"),
        ModifierSentinelSetup.createContextObject(sentinelData)
      ])
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction4.BoundTormentor)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_bound_tormentor_name")
      card.setDescription(i18next.t("cards.faction_4_unit_bound_tormentor_desc"))
      card.setFXResource(["FX.Cards.Faction2.JadeOgre"])
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
        breathing : RSX.f4MistressOfCommandsBreathing.name
        idle : RSX.f4MistressOfCommandsIdle.name
        walk : RSX.f4MistressOfCommandsRun.name
        attack : RSX.f4MistressOfCommandsAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f4MistressOfCommandsHit.name
        death : RSX.f4MistressOfCommandsDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      sentinelData = {id: Cards.Faction4.AbyssSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSummonCopyIt.createContextObject("transform.", {id: Cards.Faction4.BoundTormentor}))
      card.setInherentModifiersContextObjects([ ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction4.Xerroloth)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_xerroloth_name")
      card.setDescription(i18next.t("cards.faction_4_unit_xerroloth_desc"))
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
        breathing : RSX.f4MegaFiendBreathing.name
        idle : RSX.f4MegaFiendIdle.name
        walk : RSX.f4MegaFiendRun.name
        attack : RSX.f4MegaFiendAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f4MegaFiendHit.name
        death : RSX.f4MegaFiendDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      sentinelData = {id: Cards.Faction4.AbyssSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSpellCast.createContextObject("transform.", {id: Cards.Faction4.Xerroloth}))
      card.setInherentModifiersContextObjects([ModifierEnemySpellWatchPutCardInHand.createContextObject({id: Cards.Faction4.Fiend}), ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Spell.Nethermeld)
      card = new SpellRequireUnoccupiedFriendlyCreep(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.CreepMeld
      card.name = i18next.t("cards.faction_4_spell_nethermeld_name")
      card.setDescription(i18next.t("cards.faction_4_spell_nethermeld_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.setFollowups([{
        id: Cards.Spell.FollowupTeleportToFriendlyCreep
      }])
      card.setFXResource(["FX.Cards.Spell.Nethermeld"])
      card.setBaseAnimResource(
        idle: RSX.iconNethermeldIdle.name
        active: RSX.iconNethermeldActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.ChokingTendrils)
      card = new SpellKillEnemyOnFriendlyCreep(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.CreepingTendrils
      card.name = i18next.t("cards.faction_4_spell_choking_tendrils_name")
      card.setDescription(i18next.t("cards.faction_4_spell_choking_tendrils_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.setFXResource(["FX.Cards.Spell.ChokingTendrils"])
      card.setBaseAnimResource(
        idle: RSX.iconCreepingTendrilsIdle.name
        active: RSX.iconCreepingTendrilsActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.CorporealCadence)
      card = new SpellCurseOfShadows(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.CurseOfShadows
      card.name = i18next.t("cards.faction_4_spell_corporeal_cadence_name")
      card.setDescription(i18next.t("cards.faction_4_spell_corporeal_cadence_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.CorporealCadence"])
      card.setBaseAnimResource(
        idle: RSX.iconCorporealCadenceIdle.name
        active: RSX.iconCorporealCadenceActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darkfiresacrifice.audio
      )

    return card

module.exports = CardFactory_FirstWatchSet_Faction4
