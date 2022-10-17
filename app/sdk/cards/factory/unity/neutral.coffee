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
SpellApplyModifiersToGeneral = require 'app/sdk/spells/spellApplyModifiersToGeneral'
SpellDamage = require 'app/sdk/spells/spellDamage'
SpellHeal = require 'app/sdk/spells/spellHeal'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBelongsToAllRaces = require 'app/sdk/modifiers/modifierBelongsToAllRaces'
ModifierBondApplyModifiers = require 'app/sdk/modifiers/modifierBondApplyModifiers'
ModifierOpeningGambitGoleminate = require 'app/sdk/modifiers/modifierOpeningGambitGoleminate'
ModifierSpellWatchDrawRandomArcanyst = require 'app/sdk/modifiers/modifierSpellWatchDrawRandomArcanyst'
ModifierOpeningGambitSpawnTribal = require 'app/sdk/modifiers/modifierOpeningGambitSpawnTribal'
ModifierDyingWishSpawnTribal = require 'app/sdk/modifiers/modifierDyingWishSpawnTribal'
ModifierDrawCardWatchCopySpell = require 'app/sdk/modifiers/modifierDrawCardWatchCopySpell'
ModifierBondPutCardsInHand = require 'app/sdk/modifiers/modifierBondPutCardsInHand'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierBond = require 'app/sdk/modifiers/modifierBond'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierCannotStrikeback = require 'app/sdk/modifiers/modifierCannotStrikeback'
ModifierFeralu = require 'app/sdk/modifiers/modifierFeralu'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_UnitySet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Ghoulie)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_ghoulie_name")
      card.setDescription(i18next.t("cards.neutral_ghoulie_desc"))
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
        breathing : RSX.neutralGhoulieBreathing.name
        idle : RSX.neutralGhoulieIdle.name
        walk : RSX.neutralGhoulieRun.name
        attack : RSX.neutralGhoulieAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralGhoulieHit.name
        death : RSX.neutralGhoulieDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierBelongsToAllRaces.createContextObject()
      ])

    if (identifier == Cards.Neutral.Feralu)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.name = i18next.t("cards.neutral_feralu_name")
      card.setDescription(i18next.t("cards.neutral_feralu_desc"))
      card.setFXResource(["FX.Cards.Neutral.Feralu"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_golemdragonbone_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralFeraluBreathing.name
        idle : RSX.neutralFeraluIdle.name
        walk : RSX.neutralFeraluRun.name
        attack : RSX.neutralFeraluAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralFeraluHit.name
        death : RSX.neutralFeraluDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      buffContextObject.appliedName = i18next.t("modifiers.neutral_feralu_modifier")
      card.setInherentModifiersContextObjects([ModifierFeralu.createContextObjectWithAuraForAllAllies([buffContextObject],null,null,null,"Minions with a tribe have +1/+1")])

    if (identifier == Cards.Neutral.BoulderBreacher)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.name = i18next.t("cards.neutral_boulder_breacher_name")
      card.setDescription(i18next.t("cards.neutral_boulder_breacher_desc"))
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.BoulderBreacher"])
      card.setBoundingBoxWidth(130)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBoulderBreacherBreathing.name
        idle : RSX.neutralBoulderBreacherIdle.name
        walk : RSX.neutralBoulderBreacherRun.name
        attack : RSX.neutralBoulderBreacherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.neutralBoulderBreacherHit.name
        death : RSX.neutralBoulderBreacherDeath.name
      )
      card.manaCost = 5
      card.atk = 5
      card.maxHP = 5
      customContextObject = ModifierCannotStrikeback.createContextObject()
      customContextObject.durationEndTurn = 1
      customContextObject.appliedName = i18next.t("modifiers.neutral_boulder_breacher_modifier")
      customContextObject.appliedDescription = i18next.t("modifiers.neutral_boulder_breacher_modifier_2")
      card.setInherentModifiersContextObjects([
        ModifierBondApplyModifiers.createContextObjectForAllEnemyUnitsAndGenerals([customContextObject], false, "Enemies can't counterattack this turn")
      ])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.EMP)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.name = i18next.t("cards.neutral_emp_name")
      card.setDescription(i18next.t("cards.neutral_emp_desc"))
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.EMP"])
      card.setBoundingBoxWidth(130)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralEMPBreathing.name
        idle : RSX.neutralEMPIdle.name
        walk : RSX.neutralEMPRun.name
        attack : RSX.neutralEMPAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.neutralEMPHit.name
        death : RSX.neutralEMPDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 7
      card.setInherentModifiersContextObjects([ModifierOpeningGambitGoleminate.createContextObject()])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.BlueConjurer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_blue_conjurer_name")
      card.setDescription(i18next.t("cards.neutral_blue_conjurer_desc"))
      card.setFXResource(["FX.Cards.Neutral.AzureHornShaman"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_alcuinloremaster_hit.audio
        attackDamage : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBlueConjurerBreathing.name
        idle : RSX.neutralBlueConjurerIdle.name
        walk : RSX.neutralBlueConjurerRun.name
        attack : RSX.neutralBlueConjurerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBlueConjurerHit.name
        death : RSX.neutralBlueConjurerDeath.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierSpellWatchDrawRandomArcanyst.createContextObject()])

    if (identifier == Cards.Neutral.Grimes)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_grimes_name")
      card.setDescription(i18next.t("cards.neutral_grimes_desc"))
      card.setFXResource(["FX.Cards.Neutral.Grincher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_sai_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGrimesBreathing.name
        idle : RSX.neutralGrimesIdle.name
        walk : RSX.neutralGrimesRun.name
        attack : RSX.neutralGrimesAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralGrimesHit.name
        death : RSX.neutralGrimesDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 6
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierOpeningGambitSpawnTribal.createContextObject(), ModifierDyingWishSpawnTribal.createContextObject()])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.Duplicator)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_loreweaver_name")
      card.setDescription(i18next.t("cards.neutral_loreweaver_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mindwarper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralLoreWeaverBreathing.name
        idle : RSX.neutralLoreWeaverIdle.name
        walk : RSX.neutralLoreWeaverRun.name
        attack : RSX.neutralLoreWeaverAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralLoreWeaverHit.name
        death : RSX.neutralLoreWeaverDeath.name
      )
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierDrawCardWatchCopySpell.createContextObject()])

    if (identifier == Cards.Neutral.TrinityWing)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_trinity_wing_name")
      card.setDescription(i18next.t("cards.neutral_trinity_wing_desc"))
      card.setFXResource(["FX.Cards.Neutral.FlameWing"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_spell_blindscorch.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralTrinityWingBreathing.name
        idle : RSX.neutralTrinityWingIdle.name
        walk : RSX.neutralTrinityWingRun.name
        attack : RSX.neutralTrinityWingAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralTrinityWingHit.name
        death : RSX.neutralTrinityWingDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject(), ModifierBondPutCardsInHand.createContextObject([Cards.Spell.DragonBreath, Cards.Spell.DragonGrace, Cards.Spell.DragonHeart])])
      card.addKeywordClassToInclude(ModifierFlying)

    if (identifier == Cards.Spell.DragonBreath)
      card = new SpellDamage(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.DragonBreath
      card.name = i18next.t("cards.neutral_lesson_of_power_name")
      card.setDescription(i18next.t("cards.neutral_lesson_of_power_desc"))
      card.manaCost = 1
      card.damageAmount = 2
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.canTargetGeneral = true
      card.setFXResource(["FX.Cards.Spell.LessonOfPower"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTrinityPowerIdle.name
        active : RSX.iconTrinityPowerActive.name
      )

    if (identifier == Cards.Spell.DragonGrace)
      card = new SpellHeal(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.DragonGrace
      card.name = i18next.t("cards.neutral_lesson_of_wisdom_name")
      card.setDescription(i18next.t("cards.neutral_lesson_of_wisdom_desc"))
      card.manaCost = 1
      card.healModifier = 3
      card.canTargetGeneral = true
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.LessonOfWisdom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_lionheartblessing.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTrinityWisdomIdle.name
        active : RSX.iconTrinityWisdomActive.name
      )

    if (identifier == Cards.Spell.DragonHeart)
      card = new SpellApplyModifiersToGeneral(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.DragonHeart
      card.name = i18next.t("cards.neutral_lesson_of_courage_name")
      card.setDescription(i18next.t("cards.neutral_lesson_of_courage_desc"))
      card.manaCost = 1
      card.spellFilterType = SpellFilterType.None
      card.applyToOwnGeneral = true
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(1)
      statContextObject.appliedName = i18next.t("modifiers.neutral_lesson_of_courage_modifier")
      card.setTargetModifiersContextObjects([
        statContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.LessonOfCourage"])
      card.setBaseSoundResource(
        apply : RSX.sfx_division_crest_outline_reveal.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconTrinityCourageIdle.name
        active : RSX.iconTrinityCourageActive.name
      )

    if (identifier == Cards.Neutral.Celebrant)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_celebrant_name")
      card.setDescription(i18next.t("cards.neutral_celebrant_desc"))
      card.setFXResource(["FX.Cards.Neutral.BloodtearAlchemist"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bloodtearalchemist_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bloodtearalchemist_hit.audio
        attackDamage : RSX.sfx_neutral_bloodtearalchemist_attack_impact.audio
        death : RSX.sfx_neutral_bloodtearalchemist_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCelebrantBreathing.name
        idle : RSX.neutralCelebrantIdle.name
        walk : RSX.neutralCelebrantRun.name
        attack : RSX.neutralCelebrantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralCelebrantHit.name
        death : RSX.neutralCelebrantDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.SpawnNeutralEntity
          cardDataOrIndexToSpawn: {id: Cards.Tile.BonusMana}
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    return card

module.exports = CardFactory_UnitySet_Neutral
