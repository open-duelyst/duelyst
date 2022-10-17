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

ModifierOpeningGambitHealMyGeneral = require 'app/sdk/modifiers/modifierOpeningGambitHealMyGeneral'
ModifierOpeningGambitSpawnCopiesOfEntityNearby = require 'app/sdk/modifiers/modifierOpeningGambitSpawnCopiesOfEntityNearby'
ModifierDyingWishDispelAllEnemyMinions = require 'app/sdk/modifiers/modifierDyingWishDispelAllEnemyMinions'
ModifierOpponentDrawCardWatchDamageEnemyGeneral = require 'app/sdk/modifiers/modifierOpponentDrawCardWatchDamageEnemyGeneral'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M13_NovemberMonthlies

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Zyx)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1477958400000)
      card.name = i18next.t("cards.neutral_zyx_name")
      card.setDescription(i18next.t("cards.neutral_zyx_desc"))
      card.setFXResource(["FX.Cards.Neutral.Zyx"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_artifacthunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_artifacthunter_hit.audio
        attackDamage : RSX.sfx_neutral_artifacthunter_attack_impact.audio
        death : RSX.sfx_neutral_artifacthunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralZyxBreathing.name
        idle : RSX.neutralZyxIdle.name
        walk : RSX.neutralZyxRun.name
        attack : RSX.neutralZyxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralZyxHit.name
        death : RSX.neutralZyxDeath.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierOpeningGambitSpawnCopiesOfEntityNearby.createContextObject("a copy of this minion", 1)])

    if (identifier == Cards.Neutral.AzureHerald)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1477958400000)
      card.name = i18next.t("cards.neutral_azure_herald_name")
      card.setDescription(i18next.t("cards.neutral_azure_herald_desc"))
      card.setFXResource(["FX.Cards.Neutral.AzureHerald"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAzureHeraldBreathing.name
        idle : RSX.neutralAzureHeraldIdle.name
        walk : RSX.neutralAzureHeraldRun.name
        attack : RSX.neutralAzureHeraldAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralAzureHeraldHit.name
        death : RSX.neutralAzureHeraldDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitHealMyGeneral.createContextObject(3)])

    if (identifier == Cards.Neutral.Ironclad)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1477958400000)
      card.name = i18next.t("cards.neutral_ironclad_name")
      card.setDescription(i18next.t("cards.neutral_ironclad_desc"))
      card.setFXResource(["FX.Cards.Neutral.Ironclad"])
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
        breathing : RSX.neutralIroncladBreathing.name
        idle : RSX.neutralIroncladIdle.name
        walk : RSX.neutralIroncladRun.name
        attack : RSX.neutralIroncladAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.neutralIroncladHit.name
        death : RSX.neutralIroncladDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 5
      card.setInherentModifiersContextObjects([ModifierDyingWishDispelAllEnemyMinions.createContextObject()])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Neutral.Decimus)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1477958400000)
      card.name = i18next.t("cards.neutral_decimus_name")
      card.setDescription(i18next.t("cards.neutral_decimus_desc"))
      card.setFXResource(["FX.Cards.Neutral.Decimus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDecimusBreathing.name
        idle : RSX.neutralDecimusIdle.name
        walk : RSX.neutralDecimusRun.name
        attack : RSX.neutralDecimusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralDecimusHit.name
        death : RSX.neutralDecimusDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpponentDrawCardWatchDamageEnemyGeneral.createContextObject(2)])


    return card

module.exports = CardFactory_Monthly_M13_NovemberMonthlies
