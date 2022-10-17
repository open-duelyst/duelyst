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
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierInfiltrate = require 'app/sdk/modifiers/modifierInfiltrate'
ModifierHealWatchPutCardInHand = require 'app/sdk/modifiers/modifierHealWatchPutCardInHand'
ModifierEnemyTakeDamageWatchHealMyGeneral = require 'app/sdk/modifiers/modifierEnemyTakeDamageWatchHealMyGeneral'
ModifierTakeDamageWatchDamageNearbyEnemiesForSame = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageNearbyEnemiesForSame'
ModifierOpeningGambitDrawFactionCards = require 'app/sdk/modifiers/modifierOpeningGambitDrawFactionCards'

PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
PlayerModifierSpellDamageModifier = require 'app/sdk/playerModifiers/playerModifierSpellDamageModifier'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_Monthly_Sisters

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction1.SunSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction1
      card.name = i18next.t("cards.faction_1_unit_sun_sister_name")
      card.setDescription(i18next.t("cards.faction_1_unit_sun_sister_desc"))
      card.setFXResource(["FX.Cards.Faction1.SunSister"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(90)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_1_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SisterBreathing.name
        idle : RSX.f1SisterIdle.name
        walk : RSX.f1SisterRun.name
        attack : RSX.f1SisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f1SisterHit.name
        death : RSX.f1SisterDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierHealWatchPutCardInHand.createContextObject({id: Cards.Spell.TrueStrike}, "a True Strike")])

    if (identifier == Cards.Faction2.LightningSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction2
      card.name = i18next.t("cards.faction_2_unit_lightning_sister_name")
      card.setDescription(i18next.t("cards.faction_2_unit_lightning_sister_desc"))
      card.setFXResource(["FX.Cards.Faction2.LightningSister"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(90)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_2_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_neutral_sai_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f2SisterBreathing.name
        idle : RSX.f2SisterIdle.name
        walk : RSX.f2SisterRun.name
        attack : RSX.f2SisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f2SisterHit.name
        death : RSX.f2SisterDeath.name
      )
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      contextObject = PlayerModifierSpellDamageModifier.createContextObject()
      contextObject.spellDamageChange = 1
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "Spells you cast that deal damage deal +1 damage")
      ])

    if (identifier == Cards.Faction3.SandSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction3
      card.name = i18next.t("cards.faction_3_unit_sand_sister_name")
      card.setDescription(i18next.t("cards.faction_3_unit_sand_sister_desc"))
      card.setFXResource(["FX.Cards.Faction3.SandSister"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(90)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_3_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_neutral_stormatha_attack_swing.audio
        receiveDamage :  RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_neutral_stormatha_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f3SisterBreathing.name
        idle : RSX.f3SisterIdle.name
        walk : RSX.f3SisterRun.name
        attack : RSX.f3SisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f3SisterHit.name
        death : RSX.f3SisterDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      contextObject = Modifier.createContextObjectWithAttributeBuffs(1)
      contextObject.appliedName = i18next.t("modifiers.neutral_sand_sister_modifier")
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "Your General has +1 Attack")
      ])

    if (identifier == Cards.Faction4.ShadowSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction4
      card.name = i18next.t("cards.faction_4_unit_shadow_sister_name")
      card.setDescription(i18next.t("cards.faction_4_unit_shadow_sister_desc"))
      card.setFXResource(["FX.Cards.Faction4.ShadowSister"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(105)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_4_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f4SisterBreathing.name
        idle : RSX.f4SisterIdle.name
        walk : RSX.f4SisterRun.name
        attack : RSX.f4SisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f4SisterHit.name
        death : RSX.f4SisterDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierEnemyTakeDamageWatchHealMyGeneral.createContextObject(1)])

    if (identifier == Cards.Faction5.EarthSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction5
      card.name = i18next.t("cards.faction_5_unit_earth_sister_name")
      card.setDescription(i18next.t("cards.faction_5_unit_earth_sister_desc"))
      card.setFXResource(["FX.Cards.Faction5.EarthSister"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_5_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f5SisterBreathing.name
        idle : RSX.f5SisterIdle.name
        walk : RSX.f5SisterRun.name
        attack : RSX.f5SisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f5SisterHit.name
        death : RSX.f5SisterDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierTakeDamageWatchDamageNearbyEnemiesForSame.createContextObject()])

    if (identifier == Cards.Faction6.WindSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_wind_sister_name")
      card.setDescription(i18next.t("cards.faction_6_unit_wind_sister_desc"))
      card.setFXResource(["FX.Cards.Faction6.WindSister"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_6_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6SisterBreathing.name
        idle : RSX.f6SisterIdle.name
        walk : RSX.f6SisterRun.name
        attack : RSX.f6SisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6SisterHit.name
        death : RSX.f6SisterDeath.name
      )
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      modContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      modContextObject.appliedName = i18next.t("modifiers.neutral_wind_sister_modifier")
      card.addKeywordClassToInclude(ModifierInfiltrate)
      card.setInherentModifiersContextObjects([Modifier.createContextObjectWithAuraForAllAllies([modContextObject], null, null, [ModifierInfiltrate.type])])

    if (identifier == Cards.Neutral.SwornSister)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sworn_sister_name")
      card.setDescription(i18next.t("cards.neutral_sworn_sister_desc"))
      card.setFXResource(["FX.Cards.Neutral.SwornSister"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setIsUnlockableWithAchievement(true)
      card.setUnlockDescription(i18next.t("collection.seven_sisters_unlock_message"), { faction_name: i18next.t("factions.faction_neutral_name")})
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_ladylocke_attack_impact.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSisterBreathing.name
        idle : RSX.neutralSisterIdle.name
        walk : RSX.neutralSisterRun.name
        attack : RSX.neutralSisterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSisterHit.name
        death : RSX.neutralSisterDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDrawFactionCards.createContextObject()])

    return card

module.exports = CardFactory_Monthly_Sisters
