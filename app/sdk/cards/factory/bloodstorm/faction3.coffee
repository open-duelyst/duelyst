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
SpellEquipVetArtifacts = require 'app/sdk/spells/spellEquipVetArtifacts'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierSynergizeApplyModifiersToGeneral = require 'app/sdk/modifiers/modifierSynergizeApplyModifiersToGeneral'
ModifierTakesDoubleDamage = require 'app/sdk/modifiers/modifierTakesDoubleDamage'
ModifierOpeningGambitChangeSignatureCard = require 'app/sdk/modifiers/modifierOpeningGambitChangeSignatureCard'
ModifierBackupGeneral = require 'app/sdk/modifiers/modifierBackupGeneral'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'
ModifierToggleStructure = require 'app/sdk/modifiers/modifierToggleStructure'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'

i18next = require 'i18next'

class CardFactory_BloodstormSet_Faction3

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction3.Zephyr)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_zephyr_name")
      card.setDescription(i18next.t("cards.faction_3_unit_zephyr_desc"))
      card.setFXResource(["FX.Cards.Faction3.OrbWeaver"])
      card.setBoundingBoxWidth(40)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f3_orbweaver_attack_swing.audio
        receiveDamage : RSX.sfx_f3_orbweaver_hit.audio
        attackDamage : RSX.sfx_f3_orbweaver_impact.audio
        death : RSX.sfx_f3_orbweaver_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3BBZephyrBreathing.name
        idle : RSX.f3BBZephyrIdle.name
        walk : RSX.f3BBZephyrRun.name
        attack : RSX.f3BBZephyrAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f3BBZephyrHit.name
        death : RSX.f3BBZephyrDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      frenzyModifierContextObject = ModifierFrenzy.createContextObject()
      frenzyModifierContextObject.durationEndTurn = 1
      card.setInherentModifiersContextObjects([ModifierSynergizeApplyModifiersToGeneral.createContextObject([frenzyModifierContextObject], true, false, "Your General gains Frenzy this turn")])
      card.addKeywordClassToInclude(ModifierFrenzy)

    if (identifier == Cards.Faction3.Incinera)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_incinera_name")
      card.setDescription(i18next.t("cards.faction_3_unit_incinera_desc"))
      card.setFXResource(["FX.Cards.Faction3.StarfireScarab"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_spell_blaststarfire.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_spell_immolation_a.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3IncineraBreathing.name
        idle : RSX.f3IncineraIdle.name
        walk : RSX.f3IncineraRun.name
        attack : RSX.f3IncineraAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.f3IncineraHit.name
        death : RSX.f3IncineraDeath.name
      )
      card.atk = 5
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 2}
      speedBuffContextObject.appliedName = i18next.t("modifiers.faction_3_incinera_1")
      speedBuffContextObject.appliedDescription = i18next.t("modifiers.faction_3_incinera_2")
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([speedBuffContextObject], "Your General may move 2 additional spaces")
      ])

    if (identifier == Cards.Spell.DivineSpark)
      card = new Spell(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.DivineSpark
      card.name = i18next.t("cards.faction_3_spell_divine_spark_name")
      card.setDescription(i18next.t("cards.faction_3_spell_divine_spark_desc"))
      card.manaCost = 3
      card.setFXResource(["FX.Cards.Spell.DivineSpark"])
      card.spellFilterType = SpellFilterType.None
      card.drawCardsPostPlay = 2
      card.rarityId = Rarity.Common
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconDivineSparkIdle.name
        active : RSX.iconDivineSparkActive.name
      )

    if (identifier == Cards.Spell.EquipVetArtifacts)
      card = new SpellEquipVetArtifacts(gameSession)
      card.factionId = Factions.Faction3
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.EquipVetArtifacts
      card.name = i18next.t("cards.faction_3_spell_autarchs_gifts_name")
      card.setDescription(i18next.t("cards.faction_3_spell_autarchs_gifts_desc"))
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setFXResource(["FX.Cards.Spell.AutarchsGifts"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAutarchsGiftIdle.name
        active : RSX.iconAutarchsGiftActive.name
      )

    if (identifier == Cards.Faction3.GrandmasterNoshRak)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_grandmaster_noshrak_name")
      card.setDescription(i18next.t("cards.faction_3_unit_grandmaster_noshrak_desc"))
      card.setFXResource(["FX.Cards.Faction3.GrandmasterNoshRak"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_neutral_silitharveteran_death.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3NoshRakBreathing.name
        idle : RSX.f3NoshRakIdle.name
        walk : RSX.f3NoshRakRun.name
        attack : RSX.f3NoshRakAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.f3NoshRakHit.name
        death : RSX.f3NoshRakDeath.name
      )
      card.atk = 4
      card.maxHP = 8
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      customContextObject = ModifierTakesDoubleDamage.createContextObjectOnBoard()
      customContextObject.appliedName = i18next.t("modifiers.faction_3_grandmaster_noshrak")
      card.setInherentModifiersContextObjects([
        ModifierFlying.createContextObject(),
        ModifierBlastAttack.createContextObject(),
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([customContextObject], "The enemy General takes double damage")
      ])

    if (identifier == Cards.Spell.StoneToSpears)
      card = new SpellApplyModifiers(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction3
      card.id = Cards.Spell.StoneToSpears
      card.name = i18next.t("cards.faction_3_spell_stone_to_spears_name")
      card.setDescription(i18next.t("cards.faction_3_spell_stone_to_spears_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.spellFilterType = SpellFilterType.AllyDirect
      card.filterCardIds = [
        Cards.Faction3.BrazierRedSand,
        Cards.Faction3.BrazierGoldenFlame,
        Cards.Faction3.BrazierDuskWind,
        Cards.Faction3.SoulburnObelysk,
        Cards.Faction3.LavastormObelysk,
        Cards.Faction3.TrygonObelysk,
        Cards.Faction3.SimulacraObelysk
      ]
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(3)
      attackBuffContextObject.durationEndTurn = 1
      attackBuffContextObject.appliedName = i18next.t("modifiers.faction_3_stone_to_spears_1")
      toggleStructureContextObject =  ModifierToggleStructure.createContextObject()
      toggleStructureContextObject.durationEndTurn = 1
      toggleStructureContextObject.appliedName = i18next.t("modifiers.faction_3_stone_to_spears_2")
      card.setTargetModifiersContextObjects([
        attackBuffContextObject, toggleStructureContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.StoneToSpears"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_starsfury.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconStonesToSpearsIdle.name
        active : RSX.iconStonesToSpearsActive.name
      )

    return card

module.exports = CardFactory_BloodstormSet_Faction3
