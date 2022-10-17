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
SpellApplyModifiersToUnitAndGeneral = require 'app/sdk/spells/spellApplyModifiersToUnitAndGeneral'
SpellDamageUnitAndGeneral = require 'app/sdk/spells/spellDamageUnitAndGeneral'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellDamage = require 'app/sdk/spells/spellDamage'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierOpeningGambitChangeSignatureCard = require 'app/sdk/modifiers/modifierOpeningGambitChangeSignatureCard'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierSynergizeDamageEnemyGeneral = require 'app/sdk/modifiers/modifierSynergizeDamageEnemyGeneral'
ModifierSynergizeTeleportRandomEnemy = require 'app/sdk/modifiers/modifierSynergizeTeleportRandomEnemy'

i18next = require 'i18next'

class CardFactory_BloodstormSet_Faction2

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction2.TwilightFox)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_twilight_fox_name")
      card.setDescription(i18next.t("cards.faction_2_unit_twilight_fox_desc"))
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(55)
      card.setFXResource(["FX.Cards.Faction2.LanternFox"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2lanternfox_attack_swing.audio
        receiveDamage : RSX.sfx_f2lanternfox_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2TwilightFoxBreathing.name
        idle : RSX.f2TwilightFoxIdle.name
        walk : RSX.f2TwilightFoxRun.name
        attack : RSX.f2TwilightFoxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2TwilightFoxHit.name
        death : RSX.f2TwilightFoxDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierSynergizeTeleportRandomEnemy.createContextObject()])

    if (identifier == Cards.Faction2.Geomancer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_geomancer_name")
      card.setDescription(i18next.t("cards.faction_2_unit_geomancer_desc"))
      card.setFXResource(["FX.Cards.Faction2.MageOfFourWinds"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2mage4winds_attack_swing.audio
        receiveDamage : RSX.sfx_f2mage4winds_hit.audio
        attackDamage : RSX.sfx_f2mage4winds_attack_impact.audio
        death : RSX.sfx_f2mage4winds_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2GeomancerBreathing.name
        idle : RSX.f2GeomancerIdle.name
        walk : RSX.f2GeomancerRun.name
        attack : RSX.f2GeomancerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f2GeomancerHit.name
        death : RSX.f2GeomancerDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 5
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitChangeSignatureCard.createContextObject({id: Cards.Spell.PhoenixFireBBS}, "Phoenix Fire")
      ])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Faction2.Whiplash)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_whiplash_name")
      card.setDescription(i18next.t("cards.faction_2_unit_whiplash_desc"))
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
        breathing : RSX.f2WhiplashBreathing.name
        idle : RSX.f2WhiplashIdle.name
        walk : RSX.f2WhiplashRun.name
        attack : RSX.f2WhiplashAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f2WhiplashHit.name
        death : RSX.f2WhiplashDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierSynergizeDamageEnemyGeneral.createContextObject(2)])

    if (identifier == Cards.Spell.EtherealBlades)
      card = new SpellApplyModifiersToUnitAndGeneral(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Bloodstab
      card.name = i18next.t("cards.faction_2_spell_ethereal_blades_name")
      card.setDescription(i18next.t("cards.faction_2_spell_ethereal_blades_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.AllyDirect
      card.applyToOwnGeneral = true
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2)
      buffContextObject.durationEndTurn = 1
      buffContextObject.appliedName = i18next.t("modifiers.faction_2_spell_ethereal_blades_1")
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.EtherealBlades"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_twinstrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEtherealBladesIdle.name
        active : RSX.iconEtherealBladesActive.name
      )

    if (identifier == Cards.Spell.CobraStrike)
      card = new SpellDamageUnitAndGeneral(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.CobraStrike
      card.name = i18next.t("cards.faction_2_spell_cobra_strike_name")
      card.setDescription(i18next.t("cards.faction_2_spell_cobra_strike_desc"))
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.damageAmount = 3
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setFXResource(["FX.Cards.Spell.CobraStrike"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_twinstrike.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCobraStrikeIdle.name
        active : RSX.iconCobraStrikeActive.name
      )

    if (identifier == Cards.Spell.Backstabbery)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.Backstabbery
      card.name = i18next.t("cards.faction_2_spell_obscuring_blow_name")
      card.setDescription(i18next.t("cards.faction_2_spell_obscuring_blow_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.AllyDirect
      card.canTargetGeneral = true
      card.addKeywordClassToInclude(ModifierBackstab)
      card.setTargetModifiersContextObjects([
        ModifierBackstab.createContextObject(2)
      ])
      card.setFXResource(["FX.Cards.Spell.ObscuringBlow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_khymera_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconObscuringBlowIdle.name
        active : RSX.iconObscuringBlowActive.name
      )

    if (identifier == Cards.Spell.PhoenixFireBBS)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Faction2
      card.id = Cards.Spell.PhoenixFireBBS
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_2_spell_phoenix_fire_name")
      card.setDescription(i18next.t("cards.faction_2_spell_phoenix_fire_description"))
      card.manaCost = 2
      card.damageAmount = 3
      card.rarityId = Rarity.Fixed
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.PhoenixFire"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconBBSPhoenixFireIdle.name
        active : RSX.iconBBSPhoenixFireActive.name
      )

    return card

module.exports = CardFactory_BloodstormSet_Faction2
