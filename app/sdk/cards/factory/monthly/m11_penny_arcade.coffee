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

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellRiddle = require 'app/sdk/spells/spellRiddle'

ModifierProvoke =       require 'app/sdk/modifiers/modifierProvoke'
ModifierOpeningGambit =     require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierElkowl = require 'app/sdk/modifiers/modifierElkowl'
ModifierOpeningGambitPutCardInOpponentHand = require 'app/sdk/modifiers/modifierOpeningGambitPutCardInOpponentHand'
PlayerModifierCannotReplace = require 'app/sdk/playerModifiers/playerModifierCannotReplace'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M11_PennyArcade

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.WoodWen)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1472601600000)
      card.name = i18next.t("cards.neutral_woodwen_name")
      card.setDescription(i18next.t("cards.neutral_woodwen_desc"))
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(80)
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar_melt.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_f6_seismicelemental_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_death.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralWoodWenBreathing.name
        idle : RSX.neutralWoodWenIdle.name
        walk : RSX.neutralWoodWenRun.name
        attack : RSX.neutralWoodWenAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralWoodWenHit.name
        death : RSX.neutralWoodWenDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          spellFilterType: SpellFilterType.AllyDirect
          targetModifiersContextObjects: [
            ModifierProvoke.createContextObject()
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])
      card.addKeywordClassToInclude(ModifierOpeningGambit)

    if (identifier == Cards.Neutral.Elkowl)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1472601600000)
      card.name = i18next.t("cards.neutral_elkowl_name")
      card.setDescription(i18next.t("cards.neutral_elkowl_desc"))
      card.setFXResource(["FX.Cards.Neutral.Bonereaper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar_melt.audio
        walk : RSX.sfx_neutral_keeperofthevale_hit.audio
        attack : RSX.sfx_neutral_wingsofparadise_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsofparadise_hit.audio
        attackDamage : RSX.sfx_neutral_wingsofparadise_attack_impact.audio
        death : RSX.sfx_neutral_wingsofparadise_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralElkOwlBreathing.name
        idle : RSX.neutralElkOwlIdle.name
        walk : RSX.neutralElkOwlRun.name
        attack : RSX.neutralElkOwlAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralElkOwlHit.name
        death : RSX.neutralElkOwlDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierElkowl.createContextObject()])
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.GroveLion)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1472601600000)
      card.name = i18next.t("cards.neutral_grove_lion_name")
      card.setDescription(i18next.t("cards.neutral_grove_lion_desc"))
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(60)
      card.setFXResource(["FX.Cards.Neutral.BlisteringSkorn"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar_melt.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_neutral_pandora_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGroveLionBreathing.name
        idle : RSX.neutralGroveLionIdle.name
        walk : RSX.neutralGroveLionRun.name
        attack : RSX.neutralGroveLionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralGroveLionHit.name
        death : RSX.neutralGroveLionDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([ModifierForcefield.createContextObject()], "While this minion is on the battlefield, your General has Forcefield")
      ])
      card.addKeywordClassToInclude(ModifierForcefield)

    if (identifier == Cards.Neutral.Sphynx)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1472601600000)
      card.name = i18next.t("cards.neutral_sphynx_name")
      card.setDescription(i18next.t("cards.neutral_sphynx_desc"))
      card.setFXResource(["FX.Cards.Neutral.AstralCrusader"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_primordialgazer_death.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_makantorwarbeast_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSphynxBreathing.name
        idle : RSX.neutralSphynxIdle.name
        walk : RSX.neutralSphynxRun.name
        attack : RSX.neutralSphynxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSphynxHit.name
        death : RSX.neutralSphynxDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierOpeningGambitPutCardInOpponentHand.createContextObject({id: Cards.Spell.Riddle}, "a Riddle")])
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Spell.Riddle)
      card = new SpellRiddle(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_riddle_name")
      card.setDescription(i18next.t("cards.neutral_riddle_desc"))
      card.manaCost = 2
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.Riddle"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconRiddleIdle.name
        active : RSX.iconRiddleActive.name
      )
      contextObject = PlayerModifierCannotReplace.createContextObject()
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeOnBoard = contextObject.activeInSignatureCards = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObject([contextObject],true, false, true, false, false, false, "While you have the Riddle, you cannot replace")
      ])

    return card

module.exports = CardFactory_Monthly_M11_PennyArcade
