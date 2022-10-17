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

ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierReplaceWatchDamageEnemy = require 'app/sdk/modifiers/modifierReplaceWatchDamageEnemy'
ModifierReplaceWatchBuffSelf = require 'app/sdk/modifiers/modifierReplaceWatchBuffSelf'
ModifierBuffSelfOnReplace = require 'app/sdk/modifiers/modifierBuffSelfOnReplace'
ModifierSummonSelfOnReplace = require 'app/sdk/modifiers/modifierSummonSelfOnReplace'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_M4_Replace

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.WhiteWidow)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1454284800000)
      card.name = i18next.t("cards.neutral_white_widow_name")
      card.setDescription(i18next.t("cards.neutral_white_widow_desc"))
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_neutral_whitewidow_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsofparadise_hit.audio
        attackDamage : RSX.sfx_neutral_whitewidow_attack_impact.audio
        death : RSX.sfx_neutral_whitewidow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralWhiteWidowBreathing.name
        idle : RSX.neutralWhiteWidowIdle.name
        walk : RSX.neutralWhiteWidowRun.name
        attack : RSX.neutralWhiteWidowAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralWhiteWidowHit.name
        death : RSX.neutralWhiteWidowDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierReplaceWatchDamageEnemy.createContextObject(2)])
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.WingsOfParadise)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1454284800000)
      card.name = i18next.t("cards.neutral_wings_of_paradise_name")
      card.setDescription(i18next.t("cards.neutral_wings_of_paradise_desc"))
      card.setFXResource(["FX.Cards.Neutral.WingsOfParadise"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_ubo_attack_swing.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_wingsofparadise_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsofparadise_hit.audio
        attackDamage : RSX.sfx_neutral_wingsofparadise_attack_impact.audio
        death : RSX.sfx_neutral_wingsofparadise_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralWingsOfParadiseBreathing.name
        idle : RSX.neutralWingsOfParadiseIdle.name
        walk : RSX.neutralWingsOfParadiseRun.name
        attack : RSX.neutralWingsOfParadiseAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralWingsOfParadiseHit.name
        death : RSX.neutralWingsOfParadiseDeath.name
      )
      replaceWatchContextObject = ModifierReplaceWatchBuffSelf.createContextObject(2,0, "+2 Attack this turn")
      replaceWatchContextObject.modifiersContextObjects[0].appliedName = i18next.t("modifiers.neutral_wings_of_paradise_modifier")
      replaceWatchContextObject.modifiersContextObjects[0].durationEndTurn = 1
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject(), replaceWatchContextObject])
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.AstralCrusader)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1454284800000)
      card.name = i18next.t("cards.neutral_astral_crusader_name")
      card.setDescription(i18next.t("cards.neutral_astral_crusader_desc"))
      card.setFXResource(["FX.Cards.Neutral.AstralCrusader"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gro_hit.audio
        attackDamage : RSX.sfx_neutral_sai_attack_impact.audio
        death : RSX.sfx_neutral_yun_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAstralCrusaderBreathing.name
        idle : RSX.neutralAstralCrusaderIdle.name
        walk : RSX.neutralAstralCrusaderRun.name
        attack : RSX.neutralAstralCrusaderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralAstralCrusaderHit.name
        death : RSX.neutralAstralCrusaderDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierBuffSelfOnReplace.createContextObject(3,3,-3,"it costs 3 less and gains +3/+3")])
      card.atk = 7
      card.maxHP = 6
      card.manaCost = 7
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.Dreamgazer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setAvailableAt(1454284800000)
      card.name = i18next.t("cards.neutral_dreamgazer_name")
      card.setDescription(i18next.t("cards.neutral_dreamgazer_desc"))
      card.setFXResource(["FX.Cards.Neutral.Dreamgazer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_neutral_monsterdreamoracle_attack_impact.audio
        death : RSX.sfx_neutral_monsterdreamoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDreamgazerBreathing.name
        idle : RSX.neutralDreamgazerIdle.name
        walk : RSX.neutralDreamgazerRun.name
        attack : RSX.neutralDreamgazerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralDreamgazerHit.name
        death : RSX.neutralDreamgazerDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierSummonSelfOnReplace.createContextObject()])
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Epic

    return card

module.exports = CardFactory_Monthly_M4_Replace
