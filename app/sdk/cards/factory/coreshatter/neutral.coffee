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
CardSet = require 'app/sdk/cards/cardSetLookup'
Artifact = require 'app/sdk/artifacts/artifact'

SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellHealYourGeneral = require 'app/sdk/spells/spellHealYourGeneral'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierEnemySpellWatchHealMyGeneral = require 'app/sdk/modifiers/modifierEnemySpellWatchHealMyGeneral'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierReplaceWatchApplyModifiersToReplaced = require 'app/sdk/modifiers/modifierReplaceWatchApplyModifiersToReplaced'
ModifierManaCostChange = require 'app/sdk/modifiers/modifierManaCostChange'
ModifierDyingWishDamageGeneral = require 'app/sdk/modifiers/modifierDyingWishDamageGeneral'
ModifierStartsInHand = require 'app/sdk/modifiers/modifierStartsInHand'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
ModifierIntensifyDamageNearby = require 'app/sdk/modifiers/modifierIntensifyDamageNearby'
ModifierReplaceWatchShuffleCardIntoDeck = require 'app/sdk/modifiers/modifierReplaceWatchShuffleCardIntoDeck'
ModifierEndTurnWatchAnyPlayerPullRandomUnits = require 'app/sdk/modifiers/modifierEndTurnWatchAnyPlayerPullRandomUnits'
ModifierOpponentSummonWatchSummonMinionInFront = require 'app/sdk/modifiers/modifierOpponentSummonWatchSummonMinionInFront'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierEndTurnWatchGainLastSpellPlayedThisTurn = require 'app/sdk/modifiers/modifierEndTurnWatchGainLastSpellPlayedThisTurn'
ModifierOnSummonFromHandApplyEmblems = require 'app/sdk/modifiers/modifierOnSummonFromHandApplyEmblems'
ModifierSummonWatchBurnOpponentCards = require 'app/sdk/modifiers/modifierSummonWatchBurnOpponentCards'
ModifierKillWatchAndSurviveScarzig = require 'app/sdk/modifiers/modifierKillWatchAndSurviveScarzig'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierFateSingleton = require 'app/sdk/modifiers/modifierFateSingleton'
ModifierCannotBeReplaced = require 'app/sdk/modifiers/modifierCannotBeReplaced'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierMyAttackWatchApplyModifiersToAllies = require 'app/sdk/modifiers/modifierMyAttackWatchApplyModifiersToAllies'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierOpeningGambitTransformHandIntoLegendaries = require 'app/sdk/modifiers/modifierOpeningGambitTransformHandIntoLegendaries'
ModifierEndTurnWatchAnyPlayerHsuku = require 'app/sdk/modifiers/modifierEndTurnWatchAnyPlayerHsuku'
ModifierIntensify = require 'app/sdk/modifiers/modifierIntensify'
ModifierCounterIntensify = require 'app/sdk/modifiers/modifierCounterIntensify'
ModifierCannotBeRemovedFromHand = require 'app/sdk/modifiers/modifierCannotBeRemovedFromHand'
ModifierQuestBuffNeutral = require 'app/sdk/modifiers/modifierQuestBuffNeutral'

PlayerModifierEmblemSummonWatchSingletonQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchSingletonQuest'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreshatterSet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Singleton)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setCardSetId(CardSet.Coreshatter)
      card.name = "Mythron Wanderer"
      card.setDescription("Trial: Have no duplicate cards in your deck.\nDestiny: Your minions have +1/+1.")
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Mythron
      buffContextObject = ModifierQuestBuffNeutral.createContextObjectWithAttributeBuffs(1,1)
      buffContextObject.appliedName = "Those Who Wander"
      emblemModifier = PlayerModifierEmblemSummonWatchSingletonQuest.createContextObject([buffContextObject])
      emblemModifier.appliedName = "Roads of Mythron"
      emblemModifier.appliedDescription = "Your minions have +1/+1."
      card.setInherentModifiersContextObjects([
        ModifierStartsInHand.createContextObject(),
        ModifierCannotBeReplaced.createContextObject(),
        ModifierOnSummonFromHandApplyEmblems.createContextObject([emblemModifier], true, false),
        ModifierFateSingleton.createContextObject(),
        ModifierCannotBeRemovedFromHand.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.Purgatos"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(115)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_dancingblades_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dancingblades_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSingletonBreathing.name
        idle : RSX.neutralSingletonIdle.name
        walk : RSX.neutralSingletonRun.name
        attack : RSX.neutralSingletonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSingletonHit.name
        death : RSX.neutralSingletonDeath.name
      )

    if (identifier == Cards.Neutral.DuplicatorShuffler)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Mirrorrim"
      card.setDescription("Opening Gambit: Shuffle three copies of a friendly minion into your deck.")
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setFollowups([
        {
          id: Cards.Spell.SpellDuplicator
          spellFilterType: SpellFilterType.AllyDirect
          canTargetGeneral: false
          _private: {
            followupSourcePattern: CONFIG.PATTERN_WHOLE_BOARD
          }
        }
      ])
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFXResource(["FX.Cards.Neutral.ProphetWhitePalm"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(115)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_ubo_attack_swing.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_prophetofthewhite_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_impact.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMirrormancerBreathing.name
        idle : RSX.neutralMirrormancerIdle.name
        walk : RSX.neutralMirrormancerRun.name
        attack : RSX.neutralMirrormancerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.neutralMirrormancerHit.name
        death : RSX.neutralMirrormancerDeath.name
      )

    if (identifier == Cards.Neutral.AerOwlblade)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Aer Pridebeak"
      card.setDescription("Whenever your opponent casts a spell, restore 1 Health to your General.")
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierEnemySpellWatchHealMyGeneral.createContextObject(1)
      ])
      card.setFXResource(["FX.Cards.Neutral.WindStopper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_shieldoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_shieldoracle_hit.audio
        attackDamage : RSX.sfx_neutral_shieldoracle_attack_impact.audio
        death : RSX.sfx_neutral_shieldoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAerBreathing.name
        idle : RSX.neutralAerIdle.name
        walk : RSX.neutralAerRun.name
        attack : RSX.neutralAerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralAerHit.name
        death : RSX.neutralAerDeath.name
      )

    if (identifier == Cards.Neutral.BigRush)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Saberspine Alpha"
      card.setDescription("Rush")
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 7
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierFirstBlood.createContextObject()])
      card.setFXResource(["FX.Cards.Neutral.FirstSwordofAkrane"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_f1_sunriser_hit_noimpact.audio
        attackDamage : RSX.sfx_f1_sunriser_attack_impact.audio
        death : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralElderSaberspineBreathing.name
        idle : RSX.neutralElderSaberspineIdle.name
        walk : RSX.neutralElderSaberspineRun.name
        attack : RSX.neutralElderSaberspineAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralElderSaberspineHit.name
        death : RSX.neutralElderSaberspineDeath.name
      )

    if (identifier == Cards.Neutral.MoonlightSorcerer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Alcuin Fugitive"
      card.setDescription("At the end of any turn you cast a spell, put a copy of the most recently cast spell into your action bar.")
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Legendary
      card.raceId = Races.Arcanyst
      card.setInherentModifiersContextObjects([
        ModifierEndTurnWatchGainLastSpellPlayedThisTurn.createContextObject()
      ])
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
        breathing : RSX.neutralMoonlitSorcBreathing.name
        idle : RSX.neutralMoonlitSorcIdle.name
        walk : RSX.neutralMoonlitSorcRun.name
        attack : RSX.neutralMoonlitSorcAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralMoonlitSorcHit.name
        death : RSX.neutralMoonlitSorcDeath.name
      )

    if (identifier == Cards.Neutral.ValueMcDownside)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Sellsoul"
      card.setDescription("Dying Wish: Deal 4 damage to YOUR General.")
      card.atk = 4
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      damageGeneral = ModifierDyingWishDamageGeneral.createContextObject()
      damageGeneral.damageAmount = 4
      card.setInherentModifiersContextObjects([
        damageGeneral
      ])
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
        breathing : RSX.neutralOverpowererBreathing.name
        idle : RSX.neutralOverpowererIdle.name
        walk : RSX.neutralOverpowererRun.name
        attack : RSX.neutralOverpowererAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralOverpowererHit.name
        death : RSX.neutralOverpowererDeath.name
      )

    if (identifier == Cards.Neutral.BiggestGiantGolem)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Worldcore Golem"
      card.atk = 25
      card.maxHP = 25
      card.manaCost = 9
      card.rarityId = Rarity.Common
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.WhistlingBlade"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMoltenGolemBreathing.name
        idle : RSX.neutralMoltenGolemIdle.name
        walk : RSX.neutralMoltenGolemRun.name
        attack : RSX.neutralMoltenGolemAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralMoltenGolemHit.name
        death : RSX.neutralMoltenGolemDeath.name
      )

    if (identifier == Cards.Neutral.BlueblackProngbok)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Prongbok"
      card.setDescription("May move an additional space.")
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Common
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 3}
      speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
      card.setInherentModifiersContextObjects([
        speedBuffContextObject
      ])
      card.setFXResource(["FX.Cards.Neutral.Feralu"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_golemdragonbone_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralProngbokBreathing.name
        idle : RSX.neutralProngbokIdle.name
        walk : RSX.neutralProngbokRun.name
        attack : RSX.neutralProngbokAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralProngbokHit.name
        death : RSX.neutralProngbokDeath.name
      )

    if (identifier == Cards.Neutral.VoidExploder)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Riftwalker"
      card.setDescription("Airdrop\nIntensify: Deal 1 damage to everything around it.")
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierAirdrop.createContextObject(),
        ModifierIntensifyDamageNearby.createContextObject(1),
        ModifierCounterIntensify.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.Chakkram"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_prophetofthewhite_hit.audio
        walk : RSX.sfx_neutral_firestarter_impact.audio
        attack :  RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firestarter_hit.audio
        attackDamage : RSX.sfx_neutral_firestarter_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralVoidExploderBreathing.name
        idle : RSX.neutralVoidExploderIdle.name
        walk : RSX.neutralVoidExploderRun.name
        attack : RSX.neutralVoidExploderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.5
        damage : RSX.neutralVoidExploderHit.name
        death : RSX.neutralVoidExploderDeath.name
      )

    if (identifier == Cards.Neutral.FrizzlingMystic)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Fizzling Mystic"
      card.setDescription("Opening Gambit: Deal 2 damage to an enemy OR restore 2 Health to a friendly minion or General.")
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setFollowups([
        {
          id: Cards.Spell.SpellDamageOrHeal
          damageOrHealAmount: 2
          spellFilterType: SpellFilterType.NeutralDirect
          canTargetGeneral: true
        }
      ])
      card.addKeywordClassToInclude(ModifierOpeningGambit)
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
        breathing : RSX.neutralFrizzingMysticBreathing.name
        idle : RSX.neutralFrizzingMysticIdle.name
        walk : RSX.neutralFrizzingMysticRun.name
        attack : RSX.neutralFrizzingMysticAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralFrizzingMysticHit.name
        death : RSX.neutralFrizzingMysticDeath.name
      )

    if (identifier == Cards.Neutral.ArarasShuffler)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Araras Prophet"
      card.setDescription("Whenever you replace a card, shuffle a Brilliant Plume into your deck.")
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.raceId = Races.Arcanyst
      card.setInherentModifiersContextObjects([
        ModifierReplaceWatchShuffleCardIntoDeck.createContextObject({id: Cards.Spell.BrilliantPlume}, 1)
      ])
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
        breathing : RSX.neutralArarasBreathing.name
        idle : RSX.neutralArarasIdle.name
        walk : RSX.neutralArarasRun.name
        attack : RSX.neutralArarasAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralArarasHit.name
        death : RSX.neutralArarasDeath.name
      )

    if (identifier == Cards.Spell.BrilliantPlume)
      card = new SpellHealYourGeneral(gameSession)
      card.factionId = Factions.Neutral
      card.id = Cards.Spell.BrilliantPlume
      card.setCardSetId(CardSet.Coreshatter)
      card.setIsHiddenInCollection(true)
      card.name = "Brilliant Plume"
      card.setDescription("Restore 1 Health to your General.\nDraw a card.")
      card.spellFilterType = SpellFilterType.AllyIndirect
      card.radius = CONFIG.WHOLE_BOARD_RADIUS
      card.canTargetGeneral = true
      card.healModifier = 1
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.drawCardsPostPlay = 1
      card.setFXResource(["FX.Cards.Spell.BrilliantPlume"])
      card.setBaseAnimResource(
        idle : RSX.iconBrilliantPlumeIdle.name
        active : RSX.iconBrilliantPlumeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )

    if (identifier == Cards.Neutral.Graboctopus)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Lodestar"
      card.setDescription("Airdrop, Forcefield\nAt the end of BOTH players' turns, pull some things to this minion.")
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierForcefield.createContextObject(),
        ModifierAirdrop.createContextObject(),
        ModifierEndTurnWatchAnyPlayerPullRandomUnits.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.Paddo"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_earthwalker_death.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_f5_unstableleviathan_hit.audio
        attackDamage : RSX.sfx_f5_unstableleviathan_attack_impact.audio
        death : RSX.sfx_f5_unstableleviathan_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBlackHoleBreathing.name
        idle : RSX.neutralBlackHoleIdle.name
        walk : RSX.neutralBlackHoleRun.name
        attack : RSX.neutralBlackHoleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.6
        damage : RSX.neutralBlackHoleHit.name
        death : RSX.neutralBlackHoleDeath.name
      )

    if (identifier == Cards.Neutral.SuperDoxx)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Chirpuka"
      card.setDescription("Whenever your opponent summons a minion, summon a 2/1 Puka with Provoke in front of it.")
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierOpponentSummonWatchSummonMinionInFront.createContextObject({id: Cards.Neutral.Doxx})
      ])
      card.addKeywordClassToInclude(ModifierProvoke)
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_neutral_beastsaberspinetiger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_beastsaberspinetiger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSuperDoxxBreathing.name
        idle : RSX.neutralSuperDoxxIdle.name
        walk : RSX.neutralSuperDoxxRun.name
        attack : RSX.neutralSuperDoxxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSuperDoxxHit.name
        death : RSX.neutralSuperDoxxDeath.name
      )

    if (identifier == Cards.Neutral.Doxx)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Puka"
      card.setDescription("Provoke")
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.Spelljammer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_f6_waterelemental_hit.audio
        attackDamage : RSX.sfx_neutral_fog_attack_impact.audio
        death : RSX.sfx_neutral_fog_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDoxxBreathing.name
        idle : RSX.neutralDoxxIdle.name
        walk : RSX.neutralDoxxRun.name
        attack : RSX.neutralDoxxAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralDoxxHit.name
        death : RSX.neutralDoxxDeath.name
      )

    if (identifier == Cards.Neutral.IncindyDindy)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Mnemovore"
      card.setDescription("Whenever you summon a minion, burn three cards from your opponent's deck.")
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchBurnOpponentCards.createContextObject(3)
      ])
      card.setFXResource(["FX.Cards.Neutral.TheScientist"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_neutral_prophetofthewhite_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_alcuinloremaster_hit.audio
        attackDamage : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        death : RSX.sfx_neutral_alcuinloremaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralIncindyBreathing.name
        idle : RSX.neutralIncindyIdle.name
        walk : RSX.neutralIncindyRun.name
        attack : RSX.neutralIncindyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralIncindyHit.name
        death : RSX.neutralIncindyDeath.name
      )

    if (identifier == Cards.Neutral.Scarzig)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Scarzig"
      card.setDescription("If this minion destroys an enemy and survives, friendly Scarzig ANYWHERE transform into Feather Knights.")
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierKillWatchAndSurviveScarzig.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.PlanarScout"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(40)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_beastphasehound_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastphasehound_hit.audio
        attackDamage : RSX.sfx_neutral_beastphasehound_attack_impact.audio
        death : RSX.sfx_neutral_beastphasehound_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralScarzigBreathing.name
        idle : RSX.neutralScarzigIdle.name
        walk : RSX.neutralScarzigRun.name
        attack : RSX.neutralScarzigAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralScarzigHit.name
        death : RSX.neutralScarzigDeath.name
      )

    if (identifier == Cards.Neutral.BigScarzig)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Scarzig, Feather Knight"
      card.setDescription("Celerity\nWhenever this minion attacks, give other friendly minions +1/+1.")
      card.atk = 4
      card.maxHP = 8
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      buffContextObject.appliedName = "Scarzig's Command"
      card.setInherentModifiersContextObjects([
        ModifierTranscendance.createContextObject(),
        ModifierMyAttackWatchApplyModifiersToAllies.createContextObject([buffContextObject], false)
      ])
      card.addKeywordClassToInclude(ModifierToken)
      card.setFXResource(["FX.Cards.Neutral.WhistlingBlade"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(100)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golemdragonbone_hit.audio
        attackDamage : RSX.sfx_neutral_golemdragonbone_impact.audio
        death : RSX.sfx_neutral_golemdragonbone_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSuperScarzigBreathing.name
        idle : RSX.neutralSuperScarzigIdle.name
        walk : RSX.neutralSuperScarzigRun.name
        attack : RSX.neutralSuperScarzigAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralSuperScarzigHit.name
        death : RSX.neutralSuperScarzigDeath.name
      )

    if (identifier == Cards.Neutral.PennyPacker)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Orbo the Ostentatious"
      card.setDescription("Opening Gambit: Transform the cards in your action bar into random prismatic legendary cards.")
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitTransformHandIntoLegendaries.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.GolemVanquisher"])
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_oserix_attack_swing.audio
        receiveDamage : RSX.sfx_f1_oserix_hit.audio
        attackDamage : RSX.sfx_f1_oserix_attack_impact.audio
        death : RSX.sfx_f1_oserix_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGoldloverBreathing.name
        idle : RSX.neutralGoldloverIdle.name
        walk : RSX.neutralGoldloverRun.name
        attack : RSX.neutralGoldloverAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGoldloverHit.name
        death : RSX.neutralGoldloverDeath.name
      )

    if (identifier == Cards.Neutral.Hsuku)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Coreshatter)
      card.factionId = Factions.Neutral
      card.name = "Hsuku"
      card.setDescription("At the end of any player's turn, give one of their minions a random buff and keyword (excluding Hsuku).")
      card.atk = 2
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      hsukuModifier = ModifierEndTurnWatchAnyPlayerHsuku.createContextObject("Hsuku Buff")
      card.setInherentModifiersContextObjects([
        hsukuModifier
      ])
      card.setFXResource(["FX.Cards.Neutral.ArchonSpellbinder"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_archonspellbinder_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_archonspellbinder_hit.audio
        attackDamage : RSX.sfx_neutral_archonspellbinder_attack_impact.audio
        death : RSX.sfx_neutral_archonspellbinder_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralHsukuBreathing.name
        idle : RSX.neutralHsukuIdle.name
        walk : RSX.neutralHsukuRun.name
        attack : RSX.neutralHsukuAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralHsukuHit.name
        death : RSX.neutralHsukuDeath.name
      )

    return card

module.exports = CardFactory_CoreshatterSet_Neutral
