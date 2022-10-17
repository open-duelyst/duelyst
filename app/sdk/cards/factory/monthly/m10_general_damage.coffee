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

Modifier = require 'app/sdk/modifiers/modifier'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierOpeningGambitDamageEverything = require 'app/sdk/modifiers/modifierOpeningGambitDamageEverything'
ModifierCostChangeIfMyGeneralDamagedLastTurn = require 'app/sdk/modifiers/modifierCostChangeIfMyGeneralDamagedLastTurn'
ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard = require 'app/sdk/modifiers/modifierMyGeneralDamagedWatchBuffSelfAndDrawACard'
ModifierCostEqualGeneralHealth = require 'app/sdk/modifiers/modifierCostEqualGeneralHealth'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M10_GeneralDamage

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.RubyRifter)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1470009600000)
      card.name = i18next.t("cards.neutral_ruby_rifter_name")
      card.setDescription(i18next.t("cards.neutral_ruby_rifter_desc"))
      card.setFXResource(["FX.Cards.Neutral.RubyRifter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_spell_entropicdecay.audio
        receiveDamage : RSX.sfx_f1elyxstormblade_hit.audio
        attackDamage : RSX.sfx_f1elyxstormblade_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRubyRifterBreathing.name
        idle : RSX.neutralRubyRifterIdle.name
        walk : RSX.neutralRubyRifterRun.name
        attack : RSX.neutralRubyRifterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralRubyRifterHit.name
        death : RSX.neutralRubyRifterDeath.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2)
      buffContextObject.appliedName = i18next.t("modifiers.neutral_ruby_rifter_modifier")
      card.setInherentModifiersContextObjects([ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard.createContextObject([buffContextObject], "+2 Attack")])

    if (identifier == Cards.Neutral.BloodTaura)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1470009600000)
      card.name = i18next.t("cards.neutral_blood_taura_name")
      card.setDescription(i18next.t("cards.neutral_blood_taura_desc"))
      card.setFXResource(["FX.Cards.Neutral.BloodTaura"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_rook_hit.audio
        attack : RSX.sfx_neutral_khymera_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_khymera_hit.audio
        attackDamage : RSX.sfx_neutral_khymera_impact.audio
        death : RSX.sfx_neutral_khymera_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBloodTauraBreathing.name
        idle : RSX.neutralBloodTauraIdle.name
        walk : RSX.neutralBloodTauraRun.name
        attack : RSX.neutralBloodTauraAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBloodTauraHit.name
        death : RSX.neutralBloodTauraDeath.name
      )
      card.atk = 12
      card.maxHP = 12
      card.manaCost = 25
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject(), ModifierCostEqualGeneralHealth.createContextObject()])

    if (identifier == Cards.Neutral.BlisteringSkorn)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1470009600000)
      card.name = i18next.t("cards.neutral_blistering_skorn_name")
      card.setDescription(i18next.t("cards.neutral_blistering_skorn_desc"))
      card.setFXResource(["FX.Cards.Neutral.BlisteringSkorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_firestarter_impact.audio
        attack :  RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firestarter_hit.audio
        attackDamage : RSX.sfx_neutral_firestarter_impact.audio
        death : RSX.sfx_neutral_firestarter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBlisteringSkornBreathing.name
        idle : RSX.neutralBlisteringSkornIdle.name
        walk : RSX.neutralBlisteringSkornRun.name
        attack : RSX.neutralBlisteringSkornAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBlisteringSkornHit.name
        death : RSX.neutralBlisteringSkornDeath.name
      )
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageEverything.createContextObject(1, true)])

    if (identifier == Cards.Neutral.Chakkram)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1470009600000)
      card.name = i18next.t("cards.neutral_chakkram_name")
      card.setDescription(i18next.t("cards.neutral_chakkram_desc"))
      card.setFXResource(["FX.Cards.Neutral.Chakkram"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_prophetofthewhite_hit.audio
        walk : RSX.sfx_neutral_firestarter_impact.audio
        attack :  RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firestarter_hit.audio
        attackDamage : RSX.sfx_neutral_firestarter_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralChakkramBreathing.name
        idle : RSX.neutralChakkramIdle.name
        walk : RSX.neutralChakkramRun.name
        attack : RSX.neutralChakkramAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.5
        damage : RSX.neutralChakkramHit.name
        death : RSX.neutralChakkramDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierCostChangeIfMyGeneralDamagedLastTurn.createContextObject(-2, i18next.t("modifiers.cost_change_if_my_general_damaged_last_turn_name_mod"))])

    return card

module.exports = CardFactory_Monthly_M10_GeneralDamage
