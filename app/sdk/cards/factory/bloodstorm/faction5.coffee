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

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellTectonicSpikes = require 'app/sdk/spells/spellTectonicSpikes'
SpellDamageEnemyGeneralBothDrawCard = require 'app/sdk/spells/spellDamageEnemyGeneralBothDrawCard'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierSynergizeApplyModifiersToGeneral = require 'app/sdk/modifiers/modifierSynergizeApplyModifiersToGeneral'
ModifierDoubleAttackStat = require 'app/sdk/modifiers/modifierDoubleAttackStat'
ModifierSynergizeApplyModifiers = require 'app/sdk/modifiers/modifierSynergizeApplyModifiers'
ModifierMyGeneralDamagedWatchBuffSelfAttackForSame = require 'app/sdk/modifiers/modifierMyGeneralDamagedWatchBuffSelfAttackForSame'
ModifierOnSpawnCopyMyGeneral = require 'app/sdk/modifiers/modifierOnSpawnCopyMyGeneral'
ModifierEgg = require 'app/sdk/modifiers/modifierEgg'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'

class CardFactory_BloodstormSet_Faction5

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction5.Drogon)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_drogon_name")
      card.setDescription(i18next.t("cards.faction_5_unit_drogon_desc"))
      card.setFXResource(["FX.Cards.Faction5.EarthWalker"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_earthwalker_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_earthwalker_hit.audio
        attackDamage : RSX.sfx_neutral_earthwalker_attack_impact.audio
        death : RSX.sfx_neutral_earthwalker_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5DrogonBreathing.name
        idle : RSX.f5DrogonIdle.name
        walk : RSX.f5DrogonRun.name
        attack : RSX.f5DrogonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f5DrogonHit.name
        death : RSX.f5DrogonDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      doubleAttackModifierContextObject = ModifierDoubleAttackStat.createContextObject()
      doubleAttackModifierContextObject.durationEndTurn = 1
      doubleAttackModifierContextObject.appliedName = i18next.t("modifiers.faction_5_drogon_buff_name")
      card.setInherentModifiersContextObjects([ModifierSynergizeApplyModifiersToGeneral.createContextObject([doubleAttackModifierContextObject], true, false, "Double your General\'s Attack this turn")])

    if (identifier == Cards.Faction5.Thraex)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_thraex_name")
      card.setDescription(i18next.t("cards.faction_5_unit_thraex_desc"))
      card.setFXResource(["FX.Cards.Neutral.Thraex"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_death.audio
        attackDamage : RSX.sfx_f1windbladecommanderattack_impact.audio
        death : RSX.sfx_f6_waterelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ThraexBreathing.name
        idle : RSX.f5ThraexIdle.name
        walk : RSX.f5ThraexRun.name
        attack : RSX.f5ThraexAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.f5ThraexHit.name
        death : RSX.f5ThraexDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1)
      buffContextObject.appliedName = i18next.t("modifiers.faction_5_thraex_buff_name")
      card.setInherentModifiersContextObjects([
        ModifierSynergizeApplyModifiers.createContextObjectForAllAlliesAndSelf([buffContextObject], false, "All friendly minions gain +1 Attack (including itself)")
      ])

    if (identifier == Cards.Faction5.Rancour)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_rancour_name")
      card.setDescription(i18next.t("cards.faction_5_unit_rancour_desc"))
      card.setFXResource(["FX.Cards.Faction5.PrimordialGazer"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_primordialgazer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_primordialgazer_hit.audio
        attackDamage : RSX.sfx_neutral_primordialgazer_attack_impact.audio
        death : RSX.sfx_neutral_primordialgazer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5RancourBreathing.name
        idle : RSX.f5RancourIdle.name
        walk : RSX.f5RancourRun.name
        attack : RSX.f5RancourAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5RancourHit.name
        death : RSX.f5RancourDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierMyGeneralDamagedWatchBuffSelfAttackForSame.createContextObject("Rancour\'s Rage")])
      #card.setInherentModifiersContextObjects([ModifierMyGeneralDamagedWatchBuffSelfAttackForSame.createContextObject(i18next.t("modifiers.faction_5_rancour_buff_name"))])

    if (identifier == Cards.Spell.TectonicSpikes)
      card = new SpellTectonicSpikes(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.TectonicSpikes
      card.name = i18next.t("cards.faction_5_spell_tectonic_spikes_name")
      card.setDescription(i18next.t("cards.faction_5_spell_tectonic_spikes_desc"))
      card.manaCost = 3
      card.damageAmount = 3
      card.cardsToDraw = 3
      card.rarityId = Rarity.Rare
      card.setFXResource(["FX.Cards.Spell.TectonicSpikes"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_flashreincarnation.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTectonicSpikesIdle.name
        active : RSX.iconTectonicSpikesActive.name
      )

    if (identifier == Cards.Spell.EntropicGaze)
      card = new SpellDamageEnemyGeneralBothDrawCard(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.EntropicGaze
      card.name = i18next.t("cards.faction_5_spell_entropic_gaze_name")
      card.setDescription(i18next.t("cards.faction_5_spell_entropic_gaze_desc"))
      card.id = Cards.Spell.EntropicGaze
      card.manaCost = 2
      card.damageAmount = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.EntropicGaze"])
      card.setBaseAnimResource(
        idle : RSX.iconEntropicGazeIdle.name
        active : RSX.iconEntropicGazeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_spelljammer_attack_swing.audio
      )

    if (identifier == Cards.Faction5.SpiritOfValknu)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_valknu_spirit_name")
      card.setFXResource(["FX.Cards.Faction5.SpiritOfValknu"])
      card.setBoundingBoxWidth(115)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_jaxtruesight_attack_impact.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_unstableleviathan_attack_swing.audio
        receiveDamage : RSX.sfx_f5_unstableleviathan_hit.audio
        attackDamage : RSX.sfx_f5_unstableleviathan_attack_impact.audio
        death : RSX.sfx_f5_unstableleviathan_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5ValknuSpiritBreathing.name
        idle : RSX.f5ValknuSpiritIdle.name
        walk : RSX.f5ValknuSpiritRun.name
        attack : RSX.f5ValknuSpiritAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f5ValknuSpiritHit.name
        death : RSX.f5ValknuSpiritDeath.name
      )
      card.atk = 2
      card.maxHP = 25
      card.manaCost = 6
      card.setInherentModifiersContextObjects([ModifierOnSpawnCopyMyGeneral.createContextObject()])
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Spell.ValknusSeal)
      card = new SpellSpawnEntity(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction5
      card.id = Cards.Spell.ValknusSeal
      card.name = i18next.t("cards.faction_5_spell_valknus_seal_name")
      card.setDescription(i18next.t("cards.faction_5_spell_valknus_seal_desc"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.cardDataOrIndexToSpawn = {id: Cards.Faction5.Egg}
      card.cardDataOrIndexToSpawn.additionalInherentModifiersContextObjects = [ModifierEgg.createContextObject({id: Cards.Faction5.SpiritOfValknu}, "copy of your General")]
      card.spellFilterType = SpellFilterType.SpawnSource
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.MindSteal"])
      card.setBaseAnimResource(
        idle : RSX.iconValknuSealIdle.name
        active : RSX.iconValknuSealActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_death.audio
      )

    return card

module.exports = CardFactory_BloodstormSet_Faction5
