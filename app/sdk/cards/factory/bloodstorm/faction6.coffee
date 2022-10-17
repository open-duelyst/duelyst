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
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierSynergizeSpawnVanarToken = require 'app/sdk/modifiers/modifierSynergizeSpawnVanarToken'
ModifierKillWatchRefreshExhaustion = require 'app/sdk/modifiers/modifierKillWatchRefreshExhaustion'
ModifierDealDamageWatchRefreshSignatureCard = require 'app/sdk/modifiers/modifierDealDamageWatchRefreshSignatureCard'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierStun = require 'app/sdk/modifiers/modifierStun'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierOpeningGambitSpawnVanarTokensAroundGeneral = require 'app/sdk/modifiers/modifierOpeningGambitSpawnVanarTokensAroundGeneral'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'

class CardFactory_BloodstormSet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.Myriad)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.raceId = Races.Vespyr
      card.name = i18next.t("cards.faction_6_unit_myriad_name")
      card.setDescription(i18next.t("cards.faction_6_unit_myriad_desc"))
      card.setFXResource(["FX.Cards.Faction6.VoiceoftheWind"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        receiveDamage : RSX.sfx_f6_voiceofthewind_attack_impact.audio
        attackDamage : RSX.sfx_f6_voiceofthewind_hit.audio
        death : RSX.sfx_f6_voiceofthewind_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6MyriadBreathing.name
        idle : RSX.f6MyriadIdle.name
        walk : RSX.f6MyriadRun.name
        attack : RSX.f6MyriadAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f6MyriadHit.name
        death : RSX.f6MyriadDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierSynergizeSpawnVanarToken.createContextObject()])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.SleetDasher)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_sleet_dasher_name")
      card.setDescription(i18next.t("cards.faction_6_unit_sleet_dasher_desc"))
      card.setFXResource(["FX.Cards.Faction6.BoreanBear"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SleetDasherBreathing.name
        idle : RSX.f6SleetDasherIdle.name
        walk : RSX.f6SleetDasherRun.name
        attack : RSX.f6SleetDasherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6SleetDasherHit.name
        death : RSX.f6SleetDasherDeath.name
      )
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierKillWatchRefreshExhaustion.createContextObject(false, true)])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Spell.ConcealingShroud)
      card = new SpellApplyModifiersToGeneral(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.ConcealingShroud
      card.name = i18next.t("cards.faction_6_spell_concealing_shroud_name")
      card.setDescription(i18next.t("cards.faction_6_spell_concealing_shroud_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      immunityModifierContextObject = ModifierImmuneToDamage.createContextObject()
      immunityModifierContextObject.durationEndTurn = 2
      immunityModifierContextObject.appliedName = i18next.t("modifiers.faction_6_spell_concealing_shroud_1")
      card.setTargetModifiersContextObjects([
        immunityModifierContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.ElementalFury"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconConceilingShroudIdle.name
        active : RSX.iconConceilingShroudActive.name
      )

    if (identifier == Cards.Spell.Enfeeble)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.Enfeeble
      card.name = i18next.t("cards.faction_6_spell_enfeeble_name")
      card.setDescription(i18next.t("cards.faction_6_spell_enfeeble_desc"))
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      customContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      customContextObject.attributeBuffsAbsolute = ["atk", "maxHP"]
      customContextObject.resetsDamage = true
      customContextObject.isRemovable = false
      customContextObject.appliedName = i18next.t("modifiers.faction_6_spell_enfeeble_1")
      customContextObject.appliedDescription = i18next.t("modifiers.faction_6_spell_enfeeble_2_1")
      card.setTargetModifiersContextObjects([  customContextObject])
      card.setFXResource(["FX.Cards.Spell.Enfeeble"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_voiceofthewind_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEnfeebleIdle.name
        active : RSX.iconEnfeebleActive.name
      )

    if (identifier == Cards.Spell.FrigidCorona)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.id = Cards.Spell.FrigidCorona
      card.name = i18next.t("cards.faction_6_spell_frigid_corona_name")
      card.setDescription(i18next.t("cards.faction_6_spell_frigid_corona_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.canTargetGeneral = false
      card.drawCardsPostPlay = 1
      card.setTargetModifiersContextObjects([ModifierStunnedVanar.createContextObject()])
      card.addKeywordClassToInclude(ModifierStun)
      card.setFXResource(["FX.Cards.Spell.FrigidCorona"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconFrigidCoronaIdle.name
        active : RSX.iconFrigidCoronaActive.name
      )

    if (identifier == Cards.Faction6.GrandmasterEmbla)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_grandmaster_embla_name")
      card.setDescription(i18next.t("cards.faction_6_unit_grandmaster_embla_desc"))
      card.setFXResource(["FX.Cards.Faction6.GrandmasterEmbla"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6EmblaBreathing.name
        idle : RSX.f6EmblaIdle.name
        walk : RSX.f6EmblaRun.name
        attack : RSX.f6EmblaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f6EmblaHit.name
        death : RSX.f6EmblaDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpeningGambitSpawnVanarTokensAroundGeneral.createContextObject()])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    return card

module.exports = CardFactory_BloodstormSet_Faction6
