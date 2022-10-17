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

Modifier =           require 'app/sdk/modifiers/modifier'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierProvoke =       require 'app/sdk/modifiers/modifierProvoke'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierUnseven = require 'app/sdk/modifiers/modifierUnseven'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M7_Warmasters

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.ArrowWhistler)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1462060800000)
      card.name = i18next.t("cards.neutral_arrow_whistler_name")
      card.setDescription(i18next.t("cards.neutral_arrow_whistler_desc"))
      card.setFXResource(["FX.Cards.Neutral.ArrowWhistler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_firestarter_impact.audio
        attack : RSX.sfx_neutral_firespitter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firespitter_hit.audio
        attackDamage : RSX.sfx_neutral_firespitter_attack_impact.audio
        death : RSX.sfx_neutral_firespitter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralArrowWhistlerBreathing.name
        idle : RSX.neutralArrowWhistlerIdle.name
        walk : RSX.neutralArrowWhistlerRun.name
        attack : RSX.neutralArrowWhistlerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralArrowWhistlerHit.name
        death : RSX.neutralArrowWhistlerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Common
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,0)
      attackBuffContextObject.appliedName = i18next.t("modifiers.neutral_arrow_whistler_modifier")
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), Modifier.createContextObjectWithAuraForAllAllies([attackBuffContextObject], null, null, [ModifierRanged.type], "Your other minions with Ranged have +1 Attack")])

    if (identifier == Cards.Neutral.GoldenJusticar)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1462060800000)
      card.name = i18next.t("cards.neutral_golden_justicar_name")
      card.setDescription(i18next.t("cards.neutral_golden_justicar_desc"))
      card.setFXResource(["FX.Cards.Neutral.GoldenJusticar"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_f5_vindicator_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGoldenjusticarBreathing.name
        idle : RSX.neutralGoldenjusticarIdle.name
        walk : RSX.neutralGoldenjusticarRun.name
        attack : RSX.neutralGoldenjusticarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralGoldenjusticarHit.name
        death : RSX.neutralGoldenjusticarDeath.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 2}
      speedBuffContextObject.appliedName = i18next.t("modifiers.neutral_golden_justicar_modifier")
      speedBuffContextObject.appliedDescription = i18next.t("modifiers.neutral_golden_justicar_modifier_2")
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject(), Modifier.createContextObjectWithAuraForAllAllies([speedBuffContextObject], null, null, [ModifierProvoke.type], "Your other minions with Provoke can move two additional spaces")])

    if (identifier == Cards.Neutral.Skywing)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1462060800000)
      card.name = i18next.t("cards.neutral_skywing_name")
      card.setDescription(i18next.t("cards.neutral_skywing_desc"))
      card.setFXResource(["FX.Cards.Neutral.Skywing"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_spell_blindscorch.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSkywingBreathing.name
        idle : RSX.neutralSkywingIdle.name
        walk : RSX.neutralSkywingRun.name
        attack : RSX.neutralSkywingAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralSkywingHit.name
        death : RSX.neutralSkywingDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      costChangeContextObject = ModifierManaCostChange.createContextObject(-1)
      costChangeContextObject.appliedName = i18next.t("modifiers.neutral_skywing_modifier")
      handAura = Modifier.createContextObjectWithAura([costChangeContextObject], false, true, false, false, 1, null, null, [ModifierFlying.type], "Your other minions with Flying cost 1 less")
      handAura.auraIncludeHand = true
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject(), handAura])

    if (identifier == Cards.Neutral.Unseven)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1462060800000)
      card.name = i18next.t("cards.neutral_unseven_name")
      card.setDescription(i18next.t("cards.neutral_unseven_desc"))
      card.setFXResource(["FX.Cards.Neutral.Unseven"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f2_chakriavatar_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attackDamage : RSX.sfx_neutral_arakiheadhunter_impact.audio
        death : RSX.sfx_f2mage4winds_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralUnsevenBreathing.name
        idle : RSX.neutralUnsevenIdle.name
        walk : RSX.neutralUnsevenRun.name
        attack : RSX.neutralUnsevenAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.6
        damage : RSX.neutralUnsevenHit.name
        death : RSX.neutralUnsevenDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierUnseven.createContextObject()])
      card.rarityId = Rarity.Legendary

    return card

module.exports = CardFactory_Monthly_M7_Warmasters
