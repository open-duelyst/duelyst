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

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Gauntlet_Specials

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Fortuneshaper)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_gauntletspecial_fortuneshaper_name")
      card.setIsHiddenInCollection(true)
      card.setCardSetId(CardSet.GauntletSpecial)
      card.setFXResource(["FX.Cards.Neutral.Fortuneshaper"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralXyle3Breathing.name
        idle : RSX.neutralXyle3Idle.name
        walk : RSX.neutralXyle3Run.name
        attack : RSX.neutralXyle3Attack.name
        attackReleaseDelay: 0.0
        attackDelay: .6
        damage : RSX.neutralXyle3Damage.name
        death : RSX.neutralXyle3Death.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare

      card.setDescription(i18next.t("cards.neutral_gauntletspecial_fortuneshaper_desc"))
      card.setModifiedGauntletRarities([Rarity.Epic,Rarity.Epic,Rarity.Epic])

    if (identifier == Cards.Neutral.Futureshaker)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_gauntletspecial_futureshaker_name")
      card.setIsHiddenInCollection(true)
      card.setCardSetId(CardSet.GauntletSpecial)
      card.setFXResource(["FX.Cards.Neutral.Futureshaker"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralXyle2Breathing.name
        idle : RSX.neutralXyle2Idle.name
        walk : RSX.neutralXyle2Run.name
        attack : RSX.neutralXyle2Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralXyle2Damage.name
        death : RSX.neutralXyle2Death.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare

      card.setDescription(i18next.t("cards.neutral_gauntletspecial_futureshaker_desc"))
      card.setModifiedGauntletRarities([Rarity.Legendary,Rarity.Legendary,Rarity.Legendary])
      card.setModifiedGauntletFactions([Factions.Neutral,Factions.Neutral,Factions.Neutral])

    if (identifier == Cards.Neutral.Fatesealer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_gauntletspecial_fatesealer_name")
      card.setIsHiddenInCollection(true)
      card.setCardSetId(CardSet.GauntletSpecial)
      card.setFXResource(["FX.Cards.Neutral.Fatesealer"])
      card.setBoundingBoxWidth(130)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1silverguardsquire_attack_swing.audio
        receiveDamage : RSX.sfx_f1silverguardsquire_hit.audio
        attackDamage : RSX.sfx_f1silverguardsquire_attack_impact.audio
        death : RSX.sfx_f1silverguardsquire_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralXyle1Breathing.name
        idle : RSX.neutralXyle1Idle.name
        walk : RSX.neutralXyle1Run.name
        attack : RSX.neutralXyle1Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralXyle1Damage.name
        death : RSX.neutralXyle1Death.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare

      card.setDescription(i18next.t("cards.neutral_gauntletspecial_fatesealer_desc"))
      card.setModifiedGauntletRarities([Rarity.Legendary,Rarity.Legendary,Rarity.Legendary])
      card.setModifiedGauntletOwnFactionFilter(true)


    return card

module.exports = CardFactory_Gauntlet_Specials
