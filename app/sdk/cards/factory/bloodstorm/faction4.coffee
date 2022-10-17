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
SpellLifeDrain = require 'app/sdk/spells/spellLifeDrain'
SpellFollowupHeal = require 'app/sdk/spells/spellFollowupHeal'
SpellWraithstorm = require 'app/sdk/spells/spellWraithstorm'
SpellSpawnEntityOnShadowCreep = require 'app/sdk/spells/spellSpawnEntityOnShadowCreep'
SpellFuriousLings = require 'app/sdk/spells/spellFuriousLings'
SpellKillDamagedMinion = require 'app/sdk/spells/spellKillDamagedMinion'
SpellSummonHusks = require 'app/sdk/spells/spellSummonHusks'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierAttacksDealNoDamage = require 'app/sdk/modifiers/modifierAttacksDealNoDamage'
ModifierStackingShadows = require 'app/sdk/modifiers/modifierStackingShadows'
ModifierOpeningGambitGrandmasterVariax = require 'app/sdk/modifiers/modifierOpeningGambitGrandmasterVariax'
ModifierSynergizeApplyModifiersToWraithlings = require 'app/sdk/modifiers/modifierSynergizeApplyModifiersToWraithlings'
ModifierDyingWishTransformRandomMinion = require 'app/sdk/modifiers/modifierDyingWishTransformRandomMinion'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'

class CardFactory_BloodstormSet_Faction4

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction4.Furosa)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_furosa_name")
      card.setDescription(i18next.t("cards.faction_4_unit_furosa_desc"))
      card.setFXResource(["FX.Cards.Faction4.AbyssalCrawler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f3_aymarahealer_attack_swing.audio
        receiveDamage : RSX.sfx_f3_aymarahealer_hit.audio
        attackDamage : RSX.sfx_f3_aymarahealer_impact.audio
        death : RSX.sfx_f3_aymarahealer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4FurosaBreathing.name
        idle : RSX.f4FurosaIdle.name
        walk : RSX.f4FurosaRun.name
        attack : RSX.f4FurosaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f4FurosaHit.name
        death : RSX.f4FurosaDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.Common
      contextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      contextObject.appliedName = i18next.t("modifiers.faction_4_furosa")
      card.setInherentModifiersContextObjects([
        ModifierSynergizeApplyModifiersToWraithlings.createContextObject([contextObject], CONFIG.WHOLE_BOARD_RADIUS, "Friendly Wraithlings gain +1/+1")
      ])

    if (identifier == Cards.Faction4.GrandmasterVariax)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Core)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_grandmaster_variax_name")
      card.setDescription(i18next.t("cards.faction_4_unit_grandmaster_variax_desc"))
      card.setBoundingBoxWidth(35)
      card.setBoundingBoxHeight(75)
      card.setFXResource(["FX.Cards.Faction4.SharianShadowdancer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f1windbladecommander_attack_swing.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f1windbladecommanderattack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4GrandmasterVariaxBreathing.name
        idle : RSX.f4GrandmasterVariaxIdle.name
        walk : RSX.f4GrandmasterVariaxRun.name
        attack : RSX.f4GrandmasterVariaxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.f4GrandmasterVariaxHit.name
        death : RSX.f4GrandmasterVariaxDeath.name
      )
      card.atk = 8
      card.maxHP = 8
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitGrandmasterVariax.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction4.Fiend)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_4_unit_fiend_name")
      card.setFXResource(["FX.Cards.Faction4.DarkspineElemental"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(60)
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_repulsionbeast_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_repulsionbeast_hit.audio
        attackDamage : RSX.sfx_neutral_repulsionbeast_attack_impact.audio
        death : RSX.sfx_neutral_repulsionbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4FiendBreathing.name
        idle : RSX.f4FiendIdle.name
        walk : RSX.f4FiendRun.name
        attack : RSX.f4FiendAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f4FiendHit.name
        death : RSX.f4FiendDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Spell.SummonFiends)
      card = new SpellSpawnEntityOnShadowCreep(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SummonFiends
      card.name = i18next.t("cards.faction_4_spell_abyssal_scar_name")
      card.setDescription(i18next.t("cards.faction_4_spell_abyssal_scar_modified_description"))
      card.rarityId = Rarity.Legendary
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Fiend}
      card.addKeywordClassToInclude(ModifierStackingShadows)
      card.manaCost = 3
      card.setFXResource(["FX.Cards.Spell.AbyssalScar"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_shadowreflection.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSuperTaintIdle.name
        active : RSX.iconSuperTaintActive.name
      )

    if (identifier == Cards.Spell.FuriousLings)
      card = new SpellFuriousLings(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FuriousLings
      card.name = i18next.t("cards.faction_4_spell_shadowspawn_name")
      card.setDescription(i18next.t("cards.faction_4_spell_shadowspawn_modified_description"))
      card.rarityId = Rarity.Legendary
      card.manaCost = 3
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Wraithling}
      card.setFXResource(["FX.Cards.Spell.Shadowspawn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSuperShadowspawnIdle.name
        active : RSX.iconSuperShadowspawnActive.name
      )

    if (identifier == Cards.Spell.SummonHusks)
      card = new SpellSummonHusks(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SummonHusks
      card.name = "Malice"
      card.setDescription("Destroy a friendly minion to summon 4/4 Husks equal to its Attack nearby.")
      card.rarityId = Rarity.Legendary
      card.manaCost = 3
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.Malice"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconSuperMaliceIdle.name
        active : RSX.iconSuperMaliceActive.name
      )

    if (identifier == Cards.Spell.AphoticDrain)
      card = new SpellLifeDrain(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.DarkSacrifice
      card.name = i18next.t("cards.faction_4_spell_aphotic_drain_name")
      card.setDescription(i18next.t("cards.faction_4_spell_aphotic_drain_desc"))
      card.rarityId = Rarity.Common
      card.manaCost = 1
      card.healAmount = 5
      card.spellFilterType = SpellFilterType.AllyDirect
      card.setFXResource(["FX.Cards.Spell.CurseOfAgony"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAphoticDrainIdle.name
        active : RSX.iconAphoticDrainActive.name
      )


    if (identifier == Cards.Spell.NecroticSphere)
      card = new SpellWraithstorm(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.NecroticSphere
      card.name = i18next.t("cards.faction_4_spell_necrotic_sphere_name")
      card.setDescription(i18next.t("cards.faction_4_spell_necrotic_sphere_desc"))
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Wraithling}
      card.spellFilterType = SpellFilterType.NeutralIndirect
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Spell.NecroticSphere"])
      card.setBaseAnimResource(
        idle: RSX.iconNecroticSphereIdle.name
        active: RSX.iconNecroticSphereActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darktransformation.audio
      )

    if (identifier == Cards.Spell.Punish)
      card = new SpellKillDamagedMinion(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.id = Cards.Spell.Punish
      card.name = i18next.t("cards.faction_4_spell_punish_name")
      card.setDescription(i18next.t("cards.faction_4_spell_punish_desc"))
      card.rarityId = Rarity.Rare
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.Punish"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconPunishIdle.name
        active : RSX.iconPunishActive.name
      )

    if (identifier == Cards.Faction4.HorrorBurster)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_horror_burster_name")
      card.setDescription(i18next.t("cards.faction_4_unit_horror_burster_desc"))
      card.setFXResource(["FX.Cards.Faction4.HorrorBurster"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(60)
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4HorrorBursterBreathing.name
        idle : RSX.f4HorrorBursterIdle.name
        walk : RSX.f4HorrorBursterRun.name
        attack : RSX.f4HorrorBursterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.f4HorrorBursterHit.name
        death : RSX.f4HorrorBursterDeath.name
      )
      card.atk = 4
      card.maxHP = 1
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierDyingWishTransformRandomMinion.createContextObject({id: Cards.Faction4.Horror}, true, false)])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction4.Horror)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction4
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.faction_4_unit_horror_name")
      card.setFXResource(["FX.Cards.Faction4.Horror"])
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(45)
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_death.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f4_juggernaut_attack_swing.audio
        receiveDamage : RSX.sfx_f4_juggernaut_hit.audio
        attackDamage : RSX.sfx_f4_juggernaut_attack_impact.audio
        death : RSX.sfx_f4_juggernaut_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4HorrorBreathing.name
        idle : RSX.f4HorrorIdle.name
        walk : RSX.f4HorrorRun.name
        attack : RSX.f4HorrorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.f4HorrorHit.name
        death : RSX.f4HorrorDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    return card

module.exports = CardFactory_BloodstormSet_Faction4
