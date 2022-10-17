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

ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierOpeningGambitDamageNearbyForAttack = require 'app/sdk/modifiers/modifierOpeningGambitDamageNearbyForAttack'
ModifierMyAttackOrAttackedWatchDrawCard = require 'app/sdk/modifiers/modifierMyAttackOrAttackedWatchDrawCard'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M6_Forcefield

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.SapphireSeer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1459468800000)
      card.name = i18next.t("cards.neutral_sapphire_seer_name")
      card.setDescription(i18next.t("cards.neutral_sapphire_seer_desc"))
      card.setFXResource(["FX.Cards.Neutral.SapphireSeer"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSapphireSeerBreathing.name
        idle : RSX.neutralSapphireSeerIdle.name
        walk : RSX.neutralSapphireSeerRun.name
        attack : RSX.neutralSapphireSeerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralSapphireSeerHit.name
        death : RSX.neutralSapphireSeerDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      card.setInherentModifiersContextObjects([ModifierForcefield.createContextObject()])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.SunsteelDefender)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1459468800000)
      card.name = i18next.t("cards.neutral_sunsteel_defender_name")
      card.setDescription(i18next.t("cards.neutral_sunsteel_defender_desc"))
      card.setFXResource(["FX.Cards.Neutral.SunsteelDefender"])
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
        breathing : RSX.neutralSunsteelDefenderBreathing.name
        idle : RSX.neutralSunsteelDefenderIdle.name
        walk : RSX.neutralSunsteelDefenderRun.name
        attack : RSX.neutralSunsteelDefenderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.neutralSunsteelDefenderHit.name
        death : RSX.neutralSunsteelDefenderDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierForcefield.createContextObject()])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.EXun)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1459468800000)
      card.name = i18next.t("cards.neutral_exun_name")
      card.setDescription(i18next.t("cards.neutral_exun_desc"))
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_arakiheadhunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attackDamage : RSX.sfx_neutral_arakiheadhunter_impact.audio
        death : RSX.sfx_neutral_arakiheadhunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralExunBreathing.name
        idle : RSX.neutralExunIdle.name
        walk : RSX.neutralExunRun.name
        attack : RSX.neutralExunAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralExunHit.name
        death : RSX.neutralExunDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 7
      statContextObject = ModifierForcefield.createContextObjectWithAttributeBuffs()
      card.setInherentModifiersContextObjects([
        ModifierForcefield.createContextObject(),
        ModifierMyAttackOrAttackedWatchDrawCard.createContextObject()
      ])
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.SunsetParagon)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1459468800000)
      card.name = i18next.t("cards.neutral_sunset_paragon_name")
      card.setDescription(i18next.t("cards.neutral_sunset_paragon_desc"))
      card.setFXResource(["FX.Cards.Neutral.SunsetParagon"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_neutral_keeperofthevale_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_keeperofthevale_hit.audio
        attackDamage : RSX.sfx_neutral_keeperofthevale_impact.audio
        death : RSX.sfx_neutral_firestarter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSunsetParagonBreathing.name
        idle : RSX.neutralSunsetParagonIdle.name
        walk : RSX.neutralSunsetParagonRun.name
        attack : RSX.neutralSunsetParagonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralSunsetParagonHit.name
        death : RSX.neutralSunsetParagonDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([  ModifierOpeningGambitDamageNearbyForAttack.createContextObject() ])

    return card

module.exports = CardFactory_Monthly_M6_Forcefield
