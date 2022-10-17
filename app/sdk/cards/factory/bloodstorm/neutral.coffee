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

Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpeningGambitRefreshSignatureCard = require 'app/sdk/modifiers/modifierOpeningGambitRefreshSignatureCard'
ModifierSynergizeDamageEnemy = require 'app/sdk/modifiers/modifierSynergizeDamageEnemy'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'

PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'

i18next = require 'i18next'

class CardFactory_BloodstormSet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Cryptographer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_cryptographer_name")
      card.setDescription(i18next.t("cards.neutral_cryptographer_desc"))
      card.setFXResource(["FX.Cards.Neutral.AlcuinLoremaster"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_alcuinloremaster_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_alcuinloremaster_hit.audio
        attackDamage : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCryptographerBreathing.name
        idle : RSX.neutralCryptographerIdle.name
        walk : RSX.neutralCryptographerRun.name
        attack : RSX.neutralCryptographerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralCryptographerHit.name
        death : RSX.neutralCryptographerDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.setInherentModifiersContextObjects([ModifierOpeningGambitRefreshSignatureCard.createContextObject()])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.Sanguinar)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sanguinar_name")
      card.setDescription(i18next.t("cards.neutral_sanguinar_desc"))
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
        breathing : RSX.neutralSanguinarBreathing.name
        idle : RSX.neutralSanguinarIdle.name
        walk : RSX.neutralSanguinarRun.name
        attack : RSX.neutralSanguinarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralSanguinarHit.name
        death : RSX.neutralSanguinarDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      # contextObject = PlayerModifierManaModifier.createCostChangeContextObject(-1, CardType.Spell)
      customContextObject = PlayerModifierManaModifier.createCostChangeContextObject(0, CardType.Spell)
      # because this modifier is setting cost change TO 0 (absolute) we need to set these values manually
      # by default 0 cost change mana modifiers would normally be affecting other things about mana (like adding bonus mana)
      customContextObject.isAura = true
      customContextObject.auraFilterByCardType = CardType.Spell
      customContextObject.modifiersContextObjects = [ModifierManaCostChange.createContextObject(0)]
      # end of custom overridden properties
      customContextObject.modifiersContextObjects[0].attributeBuffsAbsolute = ["manaCost"]
      customContextObject.modifiersContextObjects[0].attributeBuffsFixed = ["manaCost"]
      customContextObject.activeInHand = customContextObject.activeInDeck = customContextObject.activeInSignatureCards = false
      customContextObject.activeOnBoard = true
      customContextObject.auraIncludeHand = false
      customContextObject.auraIncludeSignatureCards = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([customContextObject], "Your Bloodbound Spell costs 0")
      ])

    if (identifier == Cards.Neutral.Meltdown)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_meltdown_name")
      card.setDescription(i18next.t("cards.neutral_meltdown_desc"))
      card.setFXResource(["FX.Cards.Neutral.DarkNemesis"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_f6_draugarlord_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMeltdownBreathing.name
        idle : RSX.neutralMeltdownIdle.name
        walk : RSX.neutralMeltdownRun.name
        attack : RSX.neutralMeltdownAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralMeltdownHit.name
        death : RSX.neutralMeltdownDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 8
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierSynergizeDamageEnemy.createContextObject(6)])

    return card

module.exports = CardFactory_BloodstormSet_Neutral
