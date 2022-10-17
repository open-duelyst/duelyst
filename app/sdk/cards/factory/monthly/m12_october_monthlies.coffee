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

ModifierMyMinionAttackWatchHealGeneral = require 'app/sdk/modifiers/modifierMyMinionAttackWatchHealGeneral'
ModifierInvalidateRush = require 'app/sdk/modifiers/modifierInvalidateRush'
ModifierImmuneToDamageFromMinionsAndGenerals = require 'app/sdk/modifiers/modifierImmuneToDamageFromMinionsAndGenerals'
ModifierOpeningGambitDamageInFrontRow = require 'app/sdk/modifiers/modifierOpeningGambitDamageInFrontRow'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M12_OctoberMonthlies

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.DayWatcher)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1475280000000)
      card.name = i18next.t("cards.neutral_day_watcher_name")
      card.setDescription(i18next.t("cards.neutral_day_watcher_desc"))
      card.setFXResource(["FX.Cards.Neutral.DayWatcher"])
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDayWatcherBreathing.name
        idle : RSX.neutralDayWatcherIdle.name
        walk : RSX.neutralDayWatcherRun.name
        attack : RSX.neutralDayWatcherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralDayWatcherHit.name
        death : RSX.neutralDayWatcherDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ ModifierMyMinionAttackWatchHealGeneral.createContextObject(1) ])

    if (identifier == Cards.Neutral.NightWatcher)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1475280000000)
      card.name = i18next.t("cards.neutral_night_watcher_name")
      card.setDescription(i18next.t("cards.neutral_night_watcher_desc"))
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralNightWatcherBreathing.name
        idle : RSX.neutralNightWatcherIdle.name
        walk : RSX.neutralNightWatcherRun.name
        attack : RSX.neutralNightWatcherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralNightWatcherHit.name
        death : RSX.neutralNightWatcherDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierForcefield.createContextObject(), ModifierInvalidateRush.createContextObject()])
      card.addKeywordClassToInclude(ModifierFirstBlood)

    if (identifier == Cards.Neutral.QuartermasterGauj)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1475280000000)
      card.name = i18next.t("cards.neutral_quartermaster_gauj_name")
      card.setDescription(i18next.t("cards.neutral_quartermaster_gauj_desc"))
      card.setFXResource(["FX.Cards.Neutral.QuartermasterGauj"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_neutral_monsterdreamoracle_attack_impact.audio
        death : RSX.sfx_neutral_monsterdreamoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralQuartermasterGaujBreathing.name
        idle : RSX.neutralQuartermasterGaujIdle.name
        walk : RSX.neutralQuartermasterGaujRun.name
        attack : RSX.neutralQuartermasterGaujAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralQuartermasterGaujHit.name
        death : RSX.neutralQuartermasterGaujDeath.name
      )
      card.atk = 5
      card.maxHP = 2
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierImmuneToDamageFromMinionsAndGenerals.createContextObject(1)])

    if (identifier == Cards.Neutral.DustWailer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1475280000000)
      card.name = i18next.t("cards.neutral_dust_wailer_name")
      card.setDescription(i18next.t("cards.neutral_dust_wailer_desc"))
      card.setFXResource(["FX.Cards.Neutral.DustWailer"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_dragonlark_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dragonlark_hit.audio
        attackDamage : RSX.sfx_neutral_dragonlark_attack_impact.audio
        death : RSX.sfx_neutral_dragonlark_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDustWailerBreathing.name
        idle : RSX.neutralDustWailerIdle.name
        walk : RSX.neutralDustWailerRun.name
        attack : RSX.neutralDustWailerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralDustWailerHit.name
        death : RSX.neutralDustWailerDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageInFrontRow.createContextObject(3), ModifierFlying.createContextObject()])

    return card

module.exports = CardFactory_Monthly_M12_OctoberMonthlies
