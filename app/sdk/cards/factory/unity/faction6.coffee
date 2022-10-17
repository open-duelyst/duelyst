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
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellDamageAndApplyModifiers = require 'app/sdk/spells/spellDamageAndApplyModifiers'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierBond = require 'app/sdk/modifiers/modifierBond'
ModifierBondSpawnEntity = require 'app/sdk/modifiers/modifierBondSpawnEntity'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierSpellWatchPutCardInHand = require 'app/sdk/modifiers/modifierSpellWatchPutCardInHand'
ModifierDyingWishBonusManaCrystal = require 'app/sdk/modifiers/modifierDyingWishBonusManaCrystal'
ModifierShatteringHeart = require 'app/sdk/modifiers/modifierShatteringHeart'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierManaModifierOncePerTurn = require 'app/sdk/playerModifiers/playerModifierManaModifierOncePerTurn'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_UnitySet_Faction6

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Faction6.KindredHunter)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_kindred_hunter_name")
      card.setDescription(i18next.t("cards.faction_6_unit_kindred_hunter_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Neutral.VoidHunter"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse.audio
        walk : RSX.sfx_neutral_chaoselemental_hit.audio
        attack : RSX.sfx_neutral_voidhunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_voidhunter_hit.audio
        attackDamage : RSX.sfx_neutral_voidhunter_attack_impact.audio
        death : RSX.sfx_neutral_voidhunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6KindredHunterBreathing.name
        idle : RSX.f6KindredHunterIdle.name
        walk : RSX.f6KindredHunterRun.name
        attack : RSX.f6KindredHunterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6KindredHunterHit.name
        death : RSX.f6KindredHunterDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierBondSpawnEntity.createContextObject({id: Cards.Faction6.ShadowVespyr}, "3/3 Night Howler", 1, CONFIG.PATTERN_3x3)])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.Circulus)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_circulus_name")
      card.setDescription(i18next.t("cards.faction_6_unit_circulus_desc"))
      card.raceId = Races.Arcanyst
      card.setFXResource(["FX.Cards.Neutral.KomodoCharger"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(40)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_komodocharger_hit.audio
        attackDamage : RSX.sfx_neutral_komodocharger_attack_impact.audio
        death : RSX.sfx_neutral_komodocharger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6CirculusBreathing.name
        idle : RSX.f6CirculusIdle.name
        walk : RSX.f6CirculusRun.name
        attack : RSX.f6CirculusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.45
        damage : RSX.f6CirculusHit.name
        death : RSX.f6CirculusDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierSpellWatchPutCardInHand.createContextObject({id: Cards.Neutral.ArcaneIllusion})])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Faction6.GhostSeraphim)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.name = i18next.t("cards.faction_6_unit_ghost_seraphim_name")
      card.setDescription(i18next.t("cards.faction_6_unit_ghost_seraphim_desc"))
      card.raceId = Races.Arcanyst
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
        breathing : RSX.f6GhostSeraphimBreathing.name
        idle : RSX.f6GhostSeraphimIdle.name
        walk : RSX.f6GhostSeraphimRun.name
        attack : RSX.f6GhostSeraphimAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.f6GhostSeraphimHit.name
        death : RSX.f6GhostSeraphimDeath.name
      )
      card.atk = 8
      card.maxHP = 9
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      customContextObject = PlayerModifierManaModifierOncePerTurn.createCostChangeContextObject(-5, CardType.Spell)
      customContextObject.activeInHand = customContextObject.activeInDeck = customContextObject.activeInSignatureCards = false
      customContextObject.activeOnBoard = true
      customContextObject.auraIncludeSignatureCards = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([customContextObject], "The first spell you cast each turn costs 5 less.")
      ])

    if (identifier == Cards.Spell.ManaDeathgrip)
      card = new SpellDamageAndApplyModifiers(gameSession)
      card.factionId = Factions.Faction6
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.id = Cards.Spell.ManaDeathgrip
      card.name = i18next.t("cards.faction_6_spell_mana_deathgrip_name")
      card.setDescription(i18next.t("cards.faction_6_spell_mana_deathgrip_desc"))
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.damageAmount = 1
      card.applyToEnemy = true
      dyingWishContextObject = ModifierDyingWishBonusManaCrystal.createContextObject(false)
      dyingWishContextObject.durationEndTurn = 1
      dyingWishContextObject.isRemovable = false
      dyingWishContextObject.appliedName = i18next.t("modifiers.faction_6_spell_mana_deathgrip_1")
      card.setTargetModifiersContextObjects([dyingWishContextObject])
      card.setFXResource(["FX.Cards.Spell.ManaDeathgrip"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_manaburn.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconManaDeathgripIdle.name
        active : RSX.iconManaDeathgripActive.name
      )

    if (identifier == Cards.Artifact.ShatteringHeart)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.CombinedUnlockables)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.ShatteringHeart
      card.name = i18next.t("cards.faction_6_artifact_iceshatter_gauntlet_name")
      card.setDescription(i18next.t("cards.faction_6_artifact_iceshatter_gauntlet_description"))
      card.manaCost = 1
      card.rarityId = Rarity.Rare
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierShatteringHeart.createContextObject({
          type: "ModifierShatteringHeart"
          name: i18next.t("cards.faction_6_artifact_iceshatter_gauntlet_name")
          description: i18next.t("cards.faction_6_artifact_iceshatter_gauntlet_description")
        })
      ])
      card.addKeywordClassToInclude(ModifierStunned)
      card.setFXResource(["FX.Cards.Artifact.Frostbiter"])
      card.setBaseAnimResource(
        idle: RSX.iconIceshatterGauntletIdle.name
        active: RSX.iconIceshatterGauntletActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    return card

module.exports = CardFactory_UnitySet_Faction6
