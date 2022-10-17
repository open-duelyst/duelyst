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
SpellKillTargetSpawnEntity = require 'app/sdk/spells/spellKillTargetSpawnEntity'
SpellSpawnTilesInCenterColumn = require 'app/sdk/spells/spellSpawnTilesInCenterColumn'
SpellBounceToActionbarApplyModifiers = require 'app/sdk/spells/spellBounceToActionBarApplyModifiers'
SpellApplyPlayerModifiers = require 'app/sdk/spells/spellApplyPlayerModifiers'
SpellMirage = require 'app/sdk/spells/spellMirage'
SpellDropLift = require 'app/sdk/spells/spellDropLift'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpponentDrawCardWatchGainKeyword = require 'app/sdk/modifiers/modifierOpponentDrawCardWatchGainKeyword'
ModifierStartTurnWatchSummonDervish = require 'app/sdk/modifiers/modifierStartTurnWatchSummonDervish'
ModifierStartTurnWatchDamageEnemiesInRow = require 'app/sdk/modifiers/modifierStartTurnWatchDamageEnemiesInRow'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierStartTurnWatchDestroySelfAndEnemies = require 'app/sdk/modifiers/modifierStartTurnWatchDestroySelfAndEnemies'
ModifierSandPortal = require 'app/sdk/modifiers/modifierSandPortal'
ModifierDyingWish = require 'app/sdk/modifiers/modifierDyingWish'
ModifierDyingWishDrawWishCard = require 'app/sdk/modifiers/modifierDyingWishDrawWishCard'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierKillWatchSpawnEntity = require 'app/sdk/modifiers/modifierKillWatchSpawnEntity'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierSummonWatchIfFlyingDrawFlyingMinion = require 'app/sdk/playerModifiers/playerModifierSummonWatchIfFlyingDrawFlyingMinion'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Faction3

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction3.FateWatcher)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_fate_watcher_name")
      card.setDescription(i18next.t("cards.faction_3_unit_fate_watcher_desc"))
      card.setFXResource(["FX.Cards.Neutral.Necroseer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bloodtearalchemist_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bloodtearalchemist_hit.audio
        attackDamage : RSX.sfx_neutral_bloodtearalchemist_attack_impact.audio
        death : RSX.sfx_neutral_bloodtearalchemist_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3InsightCasterBreathing.name
        idle : RSX.f3InsightCasterIdle.name
        walk : RSX.f3InsightCasterRun.name
        attack : RSX.f3InsightCasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f3InsightCasterHit.name
        death : RSX.f3InsightCasterDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpponentDrawCardWatchGainKeyword.createContextObject()])

    if (identifier == Cards.Faction3.TrygonObelysk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_trygon_obelysk_name")
      card.setDescription(i18next.t("cards.faction_3_unit_trygon_obelysk_desc"))
      card.raceId = Races.Structure
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
        breathing : RSX.f3ObeliskTrifectaBreathing.name
        idle : RSX.f3ObeliskTrifectaIdle.name
        walk : RSX.f3ObeliskTrifectaIdle.name
        attack : RSX.f3ObeliskTrifectaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f3ObeliskTrifectaDamage.name
        death : RSX.f3ObeliskTrifectaDeath.name
      )
      card.atk = 0
      card.maxHP = 9
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierStartTurnWatchSummonDervish.createContextObject(),
        ModifierStartTurnWatchSummonDervish.createContextObject(),
        ModifierStartTurnWatchSummonDervish.createContextObject(),
        ModifierPortal.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction3.LavastormObelysk)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_lavastorm_obelysk_name")
      card.setDescription(i18next.t("cards.faction_3_unit_lavastorm_obelysk_desc"))
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
        breathing : RSX.f3LavaObelyskBreathing.name
        idle : RSX.f3LavaObelyskIdle.name
        walk : RSX.f3LavaObelyskIdle.name
        attack : RSX.f3LavaObelyskAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3LavaObelyskHit.name
        death : RSX.f3LavaObelyskDeath.name
      )
      card.atk = 0
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierStartTurnWatchSummonDervish.createContextObject(),
        ModifierStartTurnWatchDamageEnemiesInRow.createContextObject(6, false),
        ModifierPortal.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction3.WastelandWraith)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_wasteland_wraith_name")
      card.setDescription(i18next.t("cards.faction_3_unit_wasteland_wraith_desc"))
      card.setFXResource(["FX.Cards.Neutral.BlackSandBurrower"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_frostwyvern_death.audio
        receiveDamage : RSX.sfx_f4_daemondeep_hit.audio
        attackDamage : RSX.sfx_f4_daemondeep_attack_impact.audio
        death : RSX.sfx_f4_daemondeep_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3DesertSpiritBreathing.name
        idle : RSX.f3DesertSpiritIdle.name
        walk : RSX.f3DesertSpiritRun.name
        attack : RSX.f3DesertSpiritAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f3DesertSpiritHit.name
        death : RSX.f3DesertSpiritDeath.name
      )
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierStartTurnWatchDestroySelfAndEnemies.createContextObject()
      ])

    if (identifier == Cards.Faction3.Duskweaver)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_duskweaver_name")
      card.setDescription(i18next.t("cards.faction_3_unit_duskweaver_desc"))
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.raceId = Races.Dervish
      card.setInherentModifiersContextObjects([
        ModifierDyingWishDrawWishCard.createContextObject()
      ])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(80)
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar_melt.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_f6_seismicelemental_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3DuskWeaverBreathing.name
        idle : RSX.f3DuskWeaverIdle.name
        walk : RSX.f3DuskWeaverRun.name
        attack : RSX.f3DuskWeaverAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3DuskWeaverHit.name
        death : RSX.f3DuskWeaverDeath.name
      )

    if (identifier == Cards.Spell.AridUnmaking)
      card = new SpellKillTargetSpawnEntity(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.AridUnmaking
      card.name = i18next.t("cards.faction_3_spell_arid_unmaking_name")
      card.setDescription(i18next.t("cards.faction_3_spell_arid_unmaking_desc"))
      card.addKeywordClassToInclude(ModifierSandPortal)
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.cardDataOrIndexToSpawn = {id: Cards.Tile.SandPortal}
      card.setFXResource(["FX.Cards.Spell.AridUnmaking"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAridUnmakingIdle.name
        active : RSX.iconAridUnmakingActive.name
      )

    if (identifier == Cards.Spell.CataclysmicFault)
      card = new SpellSpawnTilesInCenterColumn(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.CataclysmicFault
      card.name = i18next.t("cards.faction_3_spell_cataclysmic_fault_name")
      card.setDescription(i18next.t("cards.faction_3_spell_cataclysmic_fault_desc"))
      card.addKeywordClassToInclude(ModifierSandPortal)
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.None
      card.cardDataOrIndexToSpawn = {id: Cards.Tile.SandPortal}
      card.setFXResource(["FX.Cards.Spell.CataclysmicFault"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCataclysmicFaultIdle.name
        active : RSX.iconCataclysmicFaultActive.name
      )

    if (identifier == Cards.Faction3.SandswirlReader)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_sandswirl_reader_name")
      card.setDescription(i18next.t("cards.faction_3_unit_sandswirl_reader_desc"))
      card.setFXResource(["FX.Cards.Neutral.Spelljammer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_neutral_fog_attack_impact.audio
        death : RSX.sfx_neutral_fog_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3BobbleBreathing.name
        idle : RSX.f3BobbleIdle.name
        walk : RSX.f3BobbleRun.name
        attack : RSX.f3BobbleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3BobbleHit.name
        death : RSX.f3BobbleDeath.name
      )
      card.addKeywordClassToInclude(ModifierSandPortal)
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setFollowups([
        {
          id: Cards.Spell.BounceMinionSpawnEntity
          cardDataOrIndexToSpawn: {id: Cards.Tile.SandPortal}
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Spell.Reassemble)
      card = new SpellBounceToActionbarApplyModifiers(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.Reassemble
      card.name = i18next.t("cards.faction_3_spell_reassemble_name")
      card.setDescription(i18next.t("cards.faction_3_spell_reassemble_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.drawCardsPostPlay = 1
      card.filterCardIds = [
        Cards.Faction3.BrazierRedSand,
        Cards.Faction3.BrazierGoldenFlame,
        Cards.Faction3.BrazierDuskWind,
        Cards.Faction3.SoulburnObelysk,
        Cards.Faction3.LavastormObelysk,
        Cards.Faction3.TrygonObelysk,
        Cards.Faction3.SimulacraObelysk
      ]
      manaChangeContextObject = ModifierManaCostChange.createContextObject(0)
      manaChangeContextObject.attributeBuffsAbsolute = ["manaCost"]
      manaChangeContextObject.attributeBuffsFixed = ["manaCost"]
      card.setTargetModifiersContextObjects([
        manaChangeContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.Reassemble"])
      card.setBaseAnimResource(
        idle: RSX.iconReassembleIdle.name
        active: RSX.iconReassembleActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.AzureSummoning)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.AzureSummoning
      card.name = i18next.t("cards.faction_3_spell_azure_summoning_name")
      card.setDescription(i18next.t("cards.faction_3_spell_azure_summoning_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      card.addKeywordClassToInclude(ModifierFlying)
      drawFlyingMinionsModifier = PlayerModifierSummonWatchIfFlyingDrawFlyingMinion.createContextObject()
      drawFlyingMinionsModifier.durationEndTurn = 1
      card.setTargetModifiersContextObjects([drawFlyingMinionsModifier])
      card.setFXResource(["FX.Cards.Spell.AzureSummoning"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAzureSummoningIdle.name
        active : RSX.iconAzureSummoningActive.name
      )

    if (identifier == Cards.Artifact.OblivionSickle)
      card = new Artifact(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Artifact.OblivionSickle
      card.name = i18next.t("cards.faction_3_artifact_oblivion_sickle_name")
      card.setDescription(i18next.t("cards.faction_3_artifact_oblivion_sickle_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Legendary
      card.durability = 3
      card.addKeywordClassToInclude(ModifierSandPortal)
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setTargetModifiersContextObjects([
        ModifierKillWatchSpawnEntity.createContextObject({id: Cards.Tile.SandPortal}, false, true)
      ])
      card.setFXResource(["FX.Cards.Artifact.OblivionSickle"])
      card.setBaseAnimResource(
        idle: RSX.iconOblivionSickleIdle.name
        active: RSX.iconOblivionSickleActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.SuperiorMirage)
      card = new SpellMirage(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.SuperiorMirage
      card.name = i18next.t("cards.faction_3_spell_superior_mirage_name")
      card.setDescription(i18next.t("cards.faction_3_spell_superior_mirage_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.SuperiorMirage"])
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSuperiorMirageIdle.name
        active : RSX.iconSuperiorMirageActive.name
      )

    if (identifier == Cards.Spell.DropLift)
      card = new SpellDropLift(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.DropLift
      card.name = i18next.t("cards.faction_3_spell_droplift_name")
      card.setDescription(i18next.t("cards.faction_3_spell_droplift_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.setFXResource(["FX.Cards.Spell.DropLift"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDropliftIdle.name
        active : RSX.iconDropliftActive.name
      )

    return card

module.exports = CardFactory_FirstWatchSet_Faction3
