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
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierEndTurnWatchApplyModifiers = require 'app/sdk/modifiers/modifierEndTurnWatchApplyModifiers'
ModifierOpeningGambitApplyModifiersToHand = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersToHand'
ModifierMechazorWatchPutMechazorInHand = require 'app/sdk/modifiers/modifierMechazorWatchPutMechazorInHand'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M8_Rexx

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.DiamondGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1464739200000)
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_diamond_golem_name")
      card.setFXResource(["FX.Cards.Neutral.DiamondGolem"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDiamondGolemBreathing.name
        idle : RSX.neutralDiamondGolemIdle.name
        walk : RSX.neutralDiamondGolemRun.name
        attack : RSX.neutralDiamondGolemAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.8
        damage : RSX.neutralDiamondGolemHit.name
        death : RSX.neutralDiamondGolemDeath.name
      )
      card.atk = 5
      card.maxHP = 11
      card.manaCost = 6
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.Bastion)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1464739200000)
      card.name = i18next.t("cards.neutral_bastion_name")
      card.setDescription(i18next.t("cards.neutral_bastion_desc"))
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Neutral.Bastion"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(125)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBastionBreathing.name
        idle : RSX.neutralBastionIdle.name
        walk : RSX.neutralBastionIdle.name
        attack : RSX.neutralBastionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBastionHit.name
        death : RSX.neutralBastionDeath.name
      )
      card.atk = 0
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(0,1)
      buffContextObject.appliedName = i18next.t("modifiers.neutral_bastion_modifier")
      card.setInherentModifiersContextObjects([
        ModifierEndTurnWatchApplyModifiers.createContextObject([buffContextObject], false, true, false, CONFIG.WHOLE_BOARD_RADIUS, false, "give other friendly minions +1 Health"),
        ModifierPortal.createContextObject()
      ])

    if (identifier == Cards.Neutral.Abjudicator)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1464739200000)
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_abjudicator_name")
      card.setDescription(i18next.t("cards.neutral_abjudicator_desc"))
      card.setFXResource(["FX.Cards.Neutral.Abjudicator"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(115)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_fog_attack_swing.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_impact.audio
        death : RSX.sfx_neutral_sunelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAbjudicatorBreathing.name
        idle : RSX.neutralAbjudicatorIdle.name
        walk : RSX.neutralAbjudicatorRun.name
        attack : RSX.neutralAbjudicatorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralAbjudicatorHit.name
        death : RSX.neutralAbjudicatorDeath.name
      )
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 3
      contextObject = ModifierManaCostChange.createContextObject(-1)
      card.setInherentModifiersContextObjects([ModifierOpeningGambitApplyModifiersToHand.createContextObjectToTargetOwnPlayer([contextObject], false, CardType.Spell, null, "Lower the cost of all spells in your action bar by 1")])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.AlterRexx)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1464739200000)
      card.raceId = Races.Mech
      card.name = i18next.t("cards.neutral_alter_rexx_name")
      card.setDescription(i18next.t("cards.neutral_alter_rexx_desc"))
      card.setFXResource(["FX.Cards.Neutral.AlterRexx"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_neutral_wingsofparadise_attack_swing.audio
        receiveDamage : RSX.sfx_f1_oserix_hit.audio
        attackDamage : RSX.sfx_f1_oserix_attack_impact.audio
        death : RSX.sfx_neutral_sunelemental_attack_swing.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAlterRexxBreathing.name
        idle : RSX.neutralAlterRexxIdle.name
        walk : RSX.neutralAlterRexxRun.name
        attack : RSX.neutralAlterRexxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralAlterRexxHit.name
        death : RSX.neutralAlterRexxDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierMechazorWatchPutMechazorInHand.createContextObject()])

    return card

module.exports = CardFactory_Monthly_M8_Rexx
