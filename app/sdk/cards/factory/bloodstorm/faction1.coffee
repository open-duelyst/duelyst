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

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellDamageMinionAndGeneral = require 'app/sdk/spells/spellDamageMinionAndGeneral'
SpellHealYourGeneral = require 'app/sdk/spells/spellHealYourGeneral'
SpellDamage = require 'app/sdk/spells/spellDamage'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
ModifierOpeningGambitDestroyNearbyMinions = require 'app/sdk/modifiers/modifierOpeningGambitDestroyNearbyMinions'
ModifierSynergizeHealMyGeneral = require 'app/sdk/modifiers/modifierSynergizeHealMyGeneral'
ModifierMyHealWatchAnywhereBuffSelf = require 'app/sdk/modifiers/modifierMyHealWatchAnywhereBuffSelf'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'

PlayerModifierChangeSignatureCard = require 'app/sdk/playerModifiers/playerModifierChangeSignatureCard'
i18next = require 'i18next'


class CardFactory_BloodstormSet_Faction1

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.Sunbreaker)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sunbreaker_name")
      card.setDescription(i18next.t("cards.faction_1_unit_sunbreaker_desc"))
      card.setFXResource(["FX.Cards.Faction1.Sunriser"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_f1_sunriser_death_alt.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SunBreakerBreathing.name
        idle : RSX.f1SunBreakerIdle.name
        walk : RSX.f1SunBreakerRun.name
        attack : RSX.f1SunBreakerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1SunBreakerHit.name
        death : RSX.f1SunBreakerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      contextObject = PlayerModifierChangeSignatureCard.createContextObject({id: Cards.Spell.TempestBBS})
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierForcefield.createContextObject(),
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "Your Bloodbound Spell is Tempest")
      ])

    if (identifier == Cards.Faction1.Scintilla)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_scintilla_name")
      card.setDescription(i18next.t("cards.faction_1_unit_scintilla_desc"))
      card.setFXResource(["FX.Cards.Faction1.Scintilla"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_redsynja_attack_swing.audio
        receiveDamage : RSX.sfx_f2melee_hit.audio
        attackDamage : RSX.sfx_f2melee_attack_impact.audio
        death : RSX.sfx_f2melee_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1ScintillaBreathing.name
        idle : RSX.f1ScintillaIdle.name
        walk : RSX.f1ScintillaRun.name
        attack : RSX.f1ScintillaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f1ScintillaHit.name
        death : RSX.f1ScintillaDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierSynergizeHealMyGeneral.createContextObject(3)])

    if (identifier == Cards.Faction1.Excelsious)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_excelsious_name")
      card.setDescription(i18next.t("cards.faction_1_unit_excelsious_desc"))
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction1.IroncliffeGuardian"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1ExcelsiousBreathing.name
        idle : RSX.f1ExcelsiousIdle.name
        walk : RSX.f1ExcelsiousRun.name
        attack : RSX.f1ExcelsiousAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.7
        damage : RSX.f1ExcelsiousHit.name
        death : RSX.f1ExcelsiousDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierMyHealWatchAnywhereBuffSelf.createContextObject(1,1),
        ModifierProvoke.createContextObject(),
        ModifierTranscendance.createContextObject()
      ])

    if (identifier == Cards.Spell.TrinityOath)
      card = new SpellHealYourGeneral(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.TrinityOath
      card.name = i18next.t("cards.faction_1_spell_trinity_oath_name")
      card.setDescription(i18next.t("cards.faction_1_spell_trinity_oath_desc"))
      card.manaCost = 4
      card.healModifier = 3
      card.rarityId = Rarity.Epic
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.canTargetGeneral = true
      card.drawCardsPostPlay = 3
      card.setFXResource(["FX.Cards.Spell.LastingJudgement"])
      card.setBaseAnimResource(
        idle : RSX.iconTrinityOathIdle.name
        active : RSX.iconTrinityOathActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )

    if (identifier == Cards.Spell.DrainingWave)
      card = new SpellDamageMinionAndGeneral(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.DrainingWave
      card.name = i18next.t("cards.faction_1_spell_draining_wave_name")
      card.setDescription(i18next.t("cards.faction_1_spell_draining_wave_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.damageAmount = 4
      card.setFXResource(["FX.Cards.Spell.DrainingWave"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDrainingWaveIdle.name
        active : RSX.iconDrainingWaveActive.name
      )

    if (identifier == Cards.Spell.PrismBarrier)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Faction1
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.PrismBarrier
      card.name = i18next.t("cards.faction_1_spell_prism_barrier_name")
      card.setDescription(i18next.t("cards.faction_1_spell_prism_barrier_desc"))
      card.addKeywordClassToInclude(ModifierForcefield)
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setTargetModifiersContextObjects([
        ModifierForcefield.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Spell.AurynNexus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPrismBarrierIdle.name
        active : RSX.iconPrismBarrierActive.name
      )

    # tempest as a bloodborn spell when given by Sunbreaker
    if (identifier == Cards.Spell.TempestBBS)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction1
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.TempestBBS
      card.name = i18next.t("cards.faction_1_spell_tempest_name")
      card.setDescription(i18next.t("cards.faction_1_spell_tempest_description"))
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.damageAmount = 2
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.Tempest"])
      card.setBaseAnimResource(
        idle : RSX.iconBBSTempestIdle.name
        active : RSX.iconBBSTempestActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_heavenstrike.audio
      )

    return card

module.exports = CardFactory_BloodstormSet_Faction1
