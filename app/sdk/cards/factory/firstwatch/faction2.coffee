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
SpellGotatsu = require 'app/sdk/spells/spellGotatsu'
SpellRefreshFriendlyRanged = require 'app/sdk/spells/spellRefreshFriendlyRanged'
SpellTeleportGeneralBehindEnemy = require 'app/sdk/spells/spellTeleportGeneralBehindEnemy'
SpellZodiacTriad = require 'app/sdk/spells/spellZodiacTriad'
SpellFirestormOfAgony = require 'app/sdk/spells/spellFirestormOfAgony'
SpellSpiralCounter = require 'app/sdk/spells/spellSpiralCounter'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierEndTurnWatchTransformNearbyEnemies = require 'app/sdk/modifiers/modifierEndTurnWatchTransformNearbyEnemies'
ModifierBackstabWatchStealSpellFromDeck = require 'app/sdk/modifiers/modifierBackstabWatchStealSpellFromDeck'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierSentinelSetup = require 'app/sdk/modifiers/modifierSentinelSetup'
ModifierSentinelOpponentSummonDamageIt = require 'app/sdk/modifiers/modifierSentinelOpponentSummonDamageIt'
ModifierSentinelOpponentGeneralAttack = require 'app/sdk/modifiers/modifierSentinelOpponentGeneralAttack'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierSentinelOpponentSpellCast = require 'app/sdk/modifiers/modifierSentinelOpponentSpellCast'
ModifierEnemySpellWatchCopySpell = require 'app/sdk/modifiers/modifierEnemySpellWatchCopySpell'
ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions = require 'app/sdk/modifiers/modifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierSentinel = require 'app/sdk/modifiers/modifierSentinel'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_FirstWatchSet_Faction2

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction2.Flamewreath)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_flamewreath_name")
      card.setDescription(i18next.t("cards.faction_2_unit_flamewreath_desc"))
      card.setFXResource(["FX.Cards.Faction4.DarkSiren"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_f3_aymarahealer_impact.audio
        attack : RSX.sfx_f3_anubis_attack_impact.audio
        receiveDamage : RSX.sfx_f3_anubis_hit.audio
        attackDamage : RSX.sfx_f4_siren_attack_impact.audio
        death : RSX.sfx_f3_anubis_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2FireWyrmBreathing.name
        idle : RSX.f2FireWyrmIdle.name
        walk : RSX.f2FireWyrmRun.name
        attack : RSX.f2FireWyrmAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f2FireWyrmHit.name
        death : RSX.f2FireWyrmDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions.createContextObject(2)])

    if (identifier == Cards.Faction2.ScrollBandit)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_scroll_bandit_name")
      card.setDescription(i18next.t("cards.faction_2_unit_scroll_bandit_desc"))
      card.setFXResource(["FX.Cards.Neutral.ProphetWhitePalm"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(115)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_ubo_attack_swing.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_impact.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SpellThiefBreathing.name
        idle : RSX.f2SpellThiefIdle.name
        walk : RSX.f2SpellThiefRun.name
        attack : RSX.f2SpellThiefAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f2SpellThiefHit.name
        death : RSX.f2SpellThiefDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.raceId = Races.Arcanyst
      card.setInherentModifiersContextObjects([ModifierBackstab.createContextObject(1), ModifierBackstabWatchStealSpellFromDeck.createContextObject()])

    if (identifier == Cards.Faction2.EternityPainter)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_eternity_painter_name")
      card.setDescription(i18next.t("cards.faction_2_unit_eternity_painter_desc"))
      card.setFXResource(["FX.Cards.Neutral.AstralCrusader"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gro_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_yun_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2EternityPainterBreathing.name
        idle : RSX.f2EternityPainterIdle.name
        walk : RSX.f2EternityPainterRun.name
        attack : RSX.f2EternityPainterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2EternityPainterHit.name
        death : RSX.f2EternityPainterDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierEndTurnWatchTransformNearbyEnemies.createContextObject({id: Cards.Faction2.OnyxBear})])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Artifact.EnergyAmulet)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.EnergyAmulet
      card.name = i18next.t("cards.faction_2_artifact_unbounded_energy_amulet_name")
      card.setDescription(i18next.t("cards.faction_2_artifact_unbounded_energy_amulet_desc"))
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.durability = 3
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 1}
      speedBuffContextObject.appliedName = i18next.t("cards.faction_2_artifact_unbounded_energy_amulet_name")
      speedBuffContextObject.appliedDescription = i18next.t("modifiers.faction_2_artifact_unbounded_energy_amulet_1")
      card.setTargetModifiersContextObjects([
        Modifier.createContextObjectWithAttributeBuffs(1, undefined, {
          name: i18next.t("cards.faction_2_artifact_unbounded_energy_amulet_name")
          description: i18next.t("modifiers.plus_attack_key",{amount:1})
        }),
        speedBuffContextObject
      ])
      card.setFXResource(["FX.Cards.Artifact.EnergyAmulet"])
      card.setBaseAnimResource(
        idle: RSX.iconEnergyAmuletIdle.name
        active: RSX.iconEnergyAmuletActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Spell.Gotatsu)
      card = new SpellGotatsu(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Gotatsu
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.faction_2_spell_gotatsu_name")
      card.setDescription(i18next.t("cards.faction_2_spell_gotatsu_desc"))
      card.manaCost = 1
      card.damageAmount = 1
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = false
      card.setFXResource(["FX.Cards.Spell.Gotatsu"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconGotatsuIdle.name
        active : RSX.iconGotatsuActive.name
      )

    if (identifier == Cards.Faction2.SonghaiSentinel)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_2_unit_watchful_sentinel_name")
      card.setDescription(i18next.t("cards.faction_2_unit_watchful_sentinel_desc"))
      card.setFXResource(["FX.Cards.Faction2.KaidoAssassin"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_f2_kaidoassassin_attack_swing.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_f2_kaidoassassin_attack_impact.audio
        death : RSX.sfx_f2_kaidoassassin_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SonghaiSentinelBreathing.name
        idle : RSX.f2SonghaiSentinelIdle.name
        walk : RSX.f2SonghaiSentinelRun.name
        attack : RSX.f2SonghaiSentinelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f2SonghaiSentinelHit.name
        death : RSX.f2SonghaiSentinelDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Faction2.HundredHand)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_hundred_hand_name")
      card.setDescription(i18next.t("cards.faction_2_unit_hundred_hand_desc"))
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
        breathing : RSX.f2HundredHandBreathing.name
        idle : RSX.f2HundredHandIdle.name
        walk : RSX.f2HundredHandRun.name
        attack : RSX.f2HundredHandAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.f2HundredHandHit.name
        death : RSX.f2HundredHandDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      sentinelData = {id: Cards.Faction2.SonghaiSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSummonDamageIt.createContextObject("transform and deal 2 damage to the minion that transformed it.", {id: Cards.Faction2.HundredHand}, 2))
      card.setInherentModifiersContextObjects([ ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction2.Mizuchi)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_mizuchi_name")
      card.setDescription(i18next.t("cards.faction_2_unit_mizuchi_desc"))
      card.setFXResource(["FX.Cards.Neutral.SpottedDragonlark"])
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
        breathing : RSX.f2MasterTaiKwaiBreathing.name
        idle : RSX.f2MasterTaiKwaiIdle.name
        walk : RSX.f2MasterTaiKwaiRun.name
        attack : RSX.f2MasterTaiKwaiAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2MasterTaiKwaiHit.name
        death : RSX.f2MasterTaiKwaiDeath.name
      )
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      sentinelData = {id: Cards.Faction2.SonghaiSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentGeneralAttack.createContextObject("transform.", {id: Cards.Faction2.Mizuchi}))
      card.setInherentModifiersContextObjects([ModifierBackstab.createContextObject(2), ModifierFlying.createContextObject(), ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction2.MindCageOni)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.FirstWatch)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_mind_cage_oni_name")
      card.setDescription(i18next.t("cards.faction_2_unit_mind_cage_oni_desc"))
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
        breathing : RSX.f2DemonOniBreathing.name
        idle : RSX.f2DemonOniIdle.name
        walk : RSX.f2DemonOniRun.name
        attack : RSX.f2DemonOniAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f2DemonOniHit.name
        death : RSX.f2DemonOniDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      sentinelData = {id: Cards.Faction2.SonghaiSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSpellCast.createContextObject("transform.", {id: Cards.Faction2.MindCageOni}))
      card.setInherentModifiersContextObjects([ModifierEnemySpellWatchCopySpell.createContextObject(), ModifierSentinelSetup.createContextObject(sentinelData) ])
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierSentinel)
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Spell.Flicker)
      card = new SpellTeleportGeneralBehindEnemy(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Flicker
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.faction_2_spell_flicker_name")
      card.setDescription(i18next.t("cards.faction_2_spell_flicker_desc"))
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.Flicker"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_run_magical_4.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFlickerIdle.name
        active : RSX.iconFlickerActive.name
      )

    if (identifier == Cards.Spell.TwilightReiki)
      card = new SpellZodiacTriad(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.TwilightReiki
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.faction_2_spell_twilight_reiki_name")
      card.setDescription(i18next.t("cards.faction_2_spell_twilight_reiki_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setFXResource(["FX.Cards.Spell.TwilightReiki"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_a.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTwilightReikiIdle.name
        active : RSX.iconTwilightReikiActive.name
      )

    if (identifier == Cards.Spell.FirestormMantra)
      card = new SpellFirestormOfAgony(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.FirestormMantra
      card.setCardSetId(CardSet.FirstWatch)
      card.name = i18next.t("cards.faction_2_spell_firestorm_mantra_name")
      card.setDescription(i18next.t("cards.faction_2_spell_firestorm_mantra_desc"))
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.FirestormMantra"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse02.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFirestormMantraIdle.name
        active : RSX.iconFirestormMantraActive.name
      )

    if (identifier == Cards.Spell.SpiralCounter)
      card = new SpellSpiralCounter(gameSession)
      card.factionId = Factions.Faction2
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.SpiralCounter
      card.name = i18next.t("cards.faction_2_spell_spiral_counter_name")
      card.setDescription(i18next.t("cards.faction_2_spell_spiral_counter_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.damageAmount = 8
      card.setFXResource(["FX.Cards.Spell.SpiralCounter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_spiraltechnique.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSpiralCounterIdle.name
        active : RSX.iconSpiralCounterActive.name
      )

    if (identifier == Cards.Spell.Bombard)
      card = new SpellRefreshFriendlyRanged(gameSession)
      card.factionId = Factions.Faction2
      card.setCardSetId(CardSet.FirstWatch)
      card.id = Cards.Spell.Bombard
      card.name = i18next.t("cards.faction_2_spell_bombard_name")
      card.setDescription(i18next.t("cards.faction_2_spell_bombard_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.setFXResource(["FX.Cards.Spell.Bombard"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darktransformation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBombardIdle.name
        active : RSX.iconBombardActive.name
      )
      card.addKeywordClassToInclude(ModifierRanged)

    return card

module.exports = CardFactory_FirstWatchSet_Faction2
