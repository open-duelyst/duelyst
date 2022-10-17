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

SpellFilterType = require 'app/sdk/spells/spellFilterType'

Modifier = require 'app/sdk/modifiers/modifier'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierImmuneToDamageByGeneral = require 'app/sdk/modifiers/modifierImmuneToDamageByGeneral'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierAirdrop = require 'app/sdk/modifiers/modifierAirdrop'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierOpeningGambit = require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierOpeningGambitDispel = require 'app/sdk/modifiers/modifierOpeningGambitDispel'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierDyingWishDrawCard = require 'app/sdk/modifiers/modifierDyingWishDrawCard'
ModifierSpellWatchSpawnEntity = require 'app/sdk/modifiers/modifierSpellWatchSpawnEntity'
ModifierOpeningGambitRetrieveMostRecentSpell = require 'app/sdk/modifiers/modifierOpeningGambitRetrieveMostRecentSpell'
ModifierOpeningGambitRetrieveRandomSpell = require 'app/sdk/modifiers/modifierOpeningGambitRetrieveRandomSpell'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierSpellWatchBuffAlliesByRace = require 'app/sdk/modifiers/modifierSpellWatchBuffAlliesByRace'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierRangedProvoke = require 'app/sdk/modifiers/modifierRangedProvoke'
ModifierOpeningGambitDamageNearby = require 'app/sdk/modifiers/modifierOpeningGambitDamageNearby'
ModifierStartTurnWatchDamageEnemyGeneralBuffSelf = require 'app/sdk/modifiers/modifierStartTurnWatchDamageEnemyGeneralBuffSelf'
ModifierDyingWishApplyModifiers = require 'app/sdk/modifiers/modifierDyingWishApplyModifiers'
ModifierOpeningGambitDamageBothGenerals = require 'app/sdk/modifiers/modifierOpeningGambitDamageBothGenerals'
ModifierOpeningGambitDamageInFront = require 'app/sdk/modifiers/modifierOpeningGambitDamageInFront'
ModifierOpeningGambitApplyPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyPlayerModifiers'
ModifierOpeningGambitApplyMechazorPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyMechazorPlayerModifiers'
ModifierMyGeneralDamagedWatchBuffSelf = require 'app/sdk/modifiers/modifierMyGeneralDamagedWatchBuffSelf'
ModifierMyGeneralDamagedWatchHealSelf = require 'app/sdk/modifiers/modifierMyGeneralDamagedWatchHealSelf'
ModifierMyGeneralDamagedWatchDamageNearby = require 'app/sdk/modifiers/modifierMyGeneralDamagedWatchDamageNearby'
ModifierDoubleDamageToMinions = require 'app/sdk/modifiers/modifierDoubleDamageToMinions'
ModifierDealDamageWatchHealMyGeneral = require 'app/sdk/modifiers/modifierDealDamageWatchHealMyGeneral'
ModifierOpponentSummonWatchBuffSelf = require 'app/sdk/modifiers/modifierOpponentSummonWatchBuffSelf'
ModifierOpeningGambitDamageNearbyMinions = require 'app/sdk/modifiers/modifierOpeningGambitDamageNearbyMinions'
ModifierOpeningGambitSpawnCopiesOfEntityAnywhere = require 'app/sdk/modifiers/modifierOpeningGambitSpawnCopiesOfEntityAnywhere'
ModifierOpponentSummonWatchDamageEnemyGeneral = require 'app/sdk/modifiers/modifierOpponentSummonWatchDamageEnemyGeneral'
ModifierOpeningGambitDrawArtifactFromDeck = require 'app/sdk/modifiers/modifierOpeningGambitDrawArtifactFromDeck'
ModifierSummonWatchNearbyApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchNearbyApplyModifiers'
ModifierTakeDamageWatchRandomTeleport = require 'app/sdk/modifiers/modifierTakeDamageWatchRandomTeleport'
ModifierOpeningGambitSpawnEntityInEachCorner = require 'app/sdk/modifiers/modifierOpeningGambitSpawnEntityInEachCorner'
ModifierOpeningGambitMindwarp = require 'app/sdk/modifiers/modifierOpeningGambitMindwarp'
ModifierEndTurnWatchSpawnRandomEntity = require 'app/sdk/modifiers/modifierEndTurnWatchSpawnRandomEntity'
ModifierOpeningGambitRemoveRandomArtifact = require 'app/sdk/modifiers/modifierOpeningGambitRemoveRandomArtifact'
ModifierEndTurnWatchHealNearby = require 'app/sdk/modifiers/modifierEndTurnWatchHealNearby'
ModifierDealDamageWatchTeleportToMe = require 'app/sdk/modifiers/modifierDealDamageWatchTeleportToMe'
ModifierDyingWishSpawnEntityNearbyGeneral = require 'app/sdk/modifiers/modifierDyingWishSpawnEntityNearbyGeneral'
ModifierOpeningGambitBuffSelfByOpponentHandCount = require 'app/sdk/modifiers/modifierOpeningGambitBuffSelfByOpponentHandCount'
ModifierTakeDamageWatchDamageEnemyGeneralForSame = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageEnemyGeneralForSame'
ModifierDealDamageWatchDrawCard = require 'app/sdk/modifiers/modifierDealDamageWatchDrawCard'
ModifierStartTurnWatchSwapStats = require 'app/sdk/modifiers/modifierStartTurnWatchSwapStats'
ModifierHealSelfWhenDealingDamage = require 'app/sdk/modifiers/modifierHealSelfWhenDealingDamage'
ModifierDealDamageWatchHealorDamageGeneral = require 'app/sdk/modifiers/modifierDealDamageWatchHealorDamageGeneral'
ModifierOpeningGambitLifeGive = require 'app/sdk/modifiers/modifierOpeningGambitLifeGive'
ModifierOpeningGambitTeleportAllNearby = require 'app/sdk/modifiers/modifierOpeningGambitTeleportAllNearby'
ModifierRook = require 'app/sdk/modifiers/modifierRook'
ModifierDyingWishReSpawnEntityAnywhere = require 'app/sdk/modifiers/modifierDyingWishReSpawnEntityAnywhere'
ModifierOpeningGambitApplyModifiersRandomly = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersRandomly'
ModifierImmuneToSpellDamage = require 'app/sdk/modifiers/modifierImmuneToSpellDamage'
ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarByOpeningGambitBuffSelf'
ModifierOpeningGambitDrawCardBothPlayers = require 'app/sdk/modifiers/modifierOpeningGambitDrawCardBothPlayers'
ModifierSurviveDamageWatchReturnToHand = require 'app/sdk/modifiers/modifierSurviveDamageWatchReturnToHand'
ModifierDoubleDamageToGenerals = require 'app/sdk/modifiers/modifierDoubleDamageToGenerals'
ModifierOpeningGambitHealBothGenerals = require 'app/sdk/modifiers/modifierOpeningGambitHealBothGenerals'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'
PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'
PlayerModifierSummonWatchApplyModifiers = require 'app/sdk/playerModifiers/playerModifierSummonWatchApplyModifiers'
PlayerModifierReplaceCardModifier = require 'app/sdk/playerModifiers/playerModifierReplaceCardModifier'
PlayerModifierManaModifierOncePerTurn = require 'app/sdk/playerModifiers/playerModifierManaModifierOncePerTurn'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_CoreSet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.FireSpitter)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_fire_spitter_name")
      card.setDescription(i18next.t("cards.neutral_fire_spitter_desc"))
      card.setFXResource(["FX.Cards.Neutral.FireSpitter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_firespitter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firespitter_hit.audio
        attackDamage : RSX.sfx_neutral_firespitter_attack_impact.audio
        death : RSX.sfx_neutral_firespitter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMercGrenadierBreathing.name
        idle : RSX.neutralMercGrenadierIdle.name
        walk : RSX.neutralMercGrenadierRun.name
        attack : RSX.neutralMercGrenadierAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralMercGrenadierHit.name
        death : RSX.neutralMercGrenadierDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 4
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])

    if (identifier == Cards.Neutral.KomodoCharger)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_komodo_charger_name")
      card.setBoundingBoxHeight(40)
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
        breathing : RSX.neutralBeastCavernBreathing.name
        idle : RSX.neutralBeastCavernIdle.name
        walk : RSX.neutralBeastCavernRun.name
        attack : RSX.neutralBeastCavernAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.45
        damage : RSX.neutralBeastCavernHit.name
        death : RSX.neutralBeastCavernDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.PlanarScout)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_planar_scout_name")
      card.setDescription(i18next.t("cards.neutral_planar_scout_desc"))
      card.setBoundingBoxHeight(40)
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
        breathing : RSX.neutralPhaseHoundBreathing.name
        idle : RSX.neutralPhaseHoundIdle.name
        walk : RSX.neutralPhaseHoundRun.name
        attack : RSX.neutralPhaseHoundAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralPhaseHoundHit.name
        death : RSX.neutralPhaseHoundDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierAirdrop.createContextObject()])

    if (identifier == Cards.Neutral.EphemeralShroud)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_ephemeral_shroud_name")
      card.setDescription(i18next.t("cards.neutral_ephemeral_shroud_desc"))
      card.setFXResource(["FX.Cards.Neutral.EphemeralShroud"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_neutral_monsterdreamoracle_attack_impact.audio
        death : RSX.sfx_neutral_monsterdreamoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDreamOracleBreathing.name
        idle : RSX.neutralDreamOracleIdle.name
        walk : RSX.neutralDreamOracleRun.name
        attack : RSX.neutralDreamOracleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralDreamOracleHit.name
        death : RSX.neutralDreamOracleDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setFollowups([
        {
          id: Cards.Spell.Dispel
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])
      card.addKeywordClassToInclude(ModifierOpeningGambit)

    if (identifier == Cards.Neutral.ValeHunter)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_vale_hunter_name")
      card.setDescription(i18next.t("cards.neutral_vale_hunter_desc"))
      card.setFXResource(["FX.Cards.Neutral.ValeHunter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_valehunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_valehunter_hit.audio
        attackDamage : RSX.sfx_neutral_valehunter_attack_impact.audio
        death : RSX.sfx_neutral_valehunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralTribalRanged1Breathing.name
        idle : RSX.neutralTribalRanged1Idle.name
        walk : RSX.neutralTribalRanged1Run.name
        attack : RSX.neutralTribalRanged1Attack.name
        attackReleaseDelay: 0.2
        attackDelay: 0.2
        damage : RSX.neutralTribalRanged1Hit.name
        death : RSX.neutralTribalRanged1Death.name
      )
      card.atk = 1
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])

    if (identifier == Cards.Neutral.SunSeer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_sun_seer_name")
      card.setDescription(i18next.t("cards.neutral_sun_seer_desc"))
      card.setFXResource(["FX.Cards.Neutral.SunSeer"])
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
        breathing : RSX.neutralSunseerBreathing.name
        idle : RSX.neutralSunseerIdle.name
        walk : RSX.neutralSunseerRun.name
        attack : RSX.neutralSunseerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralSunseerHit.name
        death : RSX.neutralSunseerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ ModifierDealDamageWatchHealMyGeneral.createContextObject(2) ])

    if (identifier == Cards.Neutral.Manaforger)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_manaforger_name")
      card.setDescription(i18next.t("cards.neutral_manaforger_desc"))
      card.setFXResource(["FX.Cards.Neutral.Manaforger"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_artifacthunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_artifacthunter_hit.audio
        attackDamage : RSX.sfx_neutral_artifacthunter_attack_impact.audio
        death : RSX.sfx_neutral_artifacthunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralArtifactHunterBreathing.name
        idle : RSX.neutralArtifactHunterIdle.name
        walk : RSX.neutralArtifactHunterRun.name
        attack : RSX.neutralArtifactHunterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.7
        damage : RSX.neutralArtifactHunterHit.name
        death : RSX.neutralArtifactHunterDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      contextObject = PlayerModifierManaModifierOncePerTurn.createCostChangeContextObject(-1, CardType.Spell)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "The first non-Bloodbound spell you cast each turn costs 1 less")
      ])

    if (identifier == Cards.Neutral.PrismaticIllusionist)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_prismatic_illusionist_name")
      card.setDescription(i18next.t("cards.neutral_prismatic_illusionist_desc"))
      card.setFXResource(["FX.Cards.Neutral.PrismaticIllusionist"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_f3_dunecaster_attack_swing.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_f3_dunecaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPrismaticiIlusionistBreathing.name
        idle : RSX.neutralPrismaticiIlusionistIdle.name
        walk : RSX.neutralPrismaticiIlusionistRun.name
        attack : RSX.neutralPrismaticiIlusionistAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralPrismaticiIlusionistHit.name
        death : RSX.neutralPrismaticiIlusionistDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierSpellWatchSpawnEntity.createContextObject({id: Cards.Neutral.ArcaneIllusion}, "2/1 Illusion")
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.ArcaneIllusion)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_illusion_name")
      card.setFXResource(["FX.Cards.Neutral.ArcaneIllusion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f3_dunecaster_attack_swing.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_f3_dunecaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralIllusionBreathing.name
        idle : RSX.neutralIllusionIdle.name
        walk : RSX.neutralIllusionRun.name
        attack : RSX.neutralIllusionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralIllusionHit.name
        death : RSX.neutralIllusionDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.AlcuinLoremaster)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_alucin_loremaster_name")
      card.setDescription(i18next.t("cards.neutral_alcuin_loremaster_desc"))
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
        breathing : RSX.neutralSightlessFarseerBreathing.name
        idle : RSX.neutralSightlessFarseerIdle.name
        walk : RSX.neutralSightlessFarseerRun.name
        attack : RSX.neutralSightlessFarseerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralSightlessFarseerHit.name
        death : RSX.neutralSightlessFarseerDeath.name
      )
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 3
      card.setInherentModifiersContextObjects([ModifierOpeningGambitRetrieveMostRecentSpell.createContextObject()])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Neutral.OwlbeastSage)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_owlbeast_sage_name")
      card.setDescription(i18next.t("cards.neutral_owlbeast_sage_desc"))
      card.setFXResource(["FX.Cards.Neutral.OwlbeastSage"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_arcanelimiter_attack_impact.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralOwlbeastMageBreathing.name
        idle : RSX.neutralOwlbeastMageIdle.name
        walk : RSX.neutralOwlbeastMageRun.name
        attack : RSX.neutralOwlbeastMageAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralOwlbeastMageHit.name
        death : RSX.neutralOwlbeastMageDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierSpellWatchBuffAlliesByRace.createContextObject(0,2,Races.Arcanyst,{appliedName:i18next.t("modifiers.neutral_owlbeast_sage_modifier")})])
      card.rarityId = Rarity.Rare
    #      card.setDescription("Whenever you cast a spell, all your [ARCANYST] minions gain +2 Health.")

    if (identifier == Cards.Neutral.Lightbender)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_lightbender_name")
      card.setDescription(i18next.t("cards.neutral_lightbender_desc"))
      card.setFXResource(["FX.Cards.Neutral.Lightbender"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_arcanelimiter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_arcanelimiter_hit.audio
        attackDamage : RSX.sfx_neutral_arcanelimiter_attack_impact.audio
        death : RSX.sfx_neutral_arcanelimiter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralArcaneLimiterBreathing.name
        idle : RSX.neutralArcaneLimiterIdle.name
        walk : RSX.neutralArcaneLimiterRun.name
        attack : RSX.neutralArcaneLimiterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralArcaneLimiterHit.name
        death : RSX.neutralArcaneLimiterDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDispel.createContextObject()])
      card.rarityId = Rarity.Rare
    #      card.setDescription("Opening Gambit: Dispel ALL nearby tiles (including those with friendly units).")

    if (identifier == Cards.Neutral.RogueWarden)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_rogue_warden_name")
      card.setDescription(i18next.t("cards.neutral_rogue_warden_desc"))
      card.setFXResource(["FX.Cards.Neutral.RogueWarden"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1_sunriser_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gambitgirl_hit.audio
        attackDamage : RSX.sfx_neutral_swornavenger_attack_impact.audio
        death : RSX.sfx_f6_icedryad_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1RangedBreathing.name
        idle : RSX.f1RangedIdle.name
        walk : RSX.f1RangedRun.name
        attack : RSX.f1RangedAttack.name
        attackReleaseDelay: 0.9
        attackDelay: 0.9
        damage : RSX.f1RangedDamage.name
        death : RSX.f1RangedDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])

    if (identifier == Cards.Neutral.VineEntangler)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_swamp_entangler_name")
      card.setDescription(i18next.t("cards.neutral_swamp_entangler_desc"))
      card.setFXResource(["FX.Cards.Neutral.VineEntangler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_komodocharger_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ancientgrove_hit.audio
        attackDamage : RSX.sfx_f6_ancientgrove_attack_impact.audio
        death : RSX.sfx_f6_ancientgrove_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastSwampBreathing.name
        idle : RSX.neutralBeastSwampIdle.name
        walk : RSX.neutralBeastSwampRun.name
        attack : RSX.neutralBeastSwampAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralBeastSwampHit.name
        death : RSX.neutralBeastSwampDeath.name
      )
      card.atk = 0
      card.maxHP = 3
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])

    if (identifier == Cards.Neutral.RockPulverizer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_rock_pulverizer_name")
      card.setDescription(i18next.t("cards.neutral_rock_pulverizer_desc"))
      card.setFXResource(["FX.Cards.Neutral.RockPulverizer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_rockpulverizer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_rockpulverizer_hit.audio
        attackDamage : RSX.sfx_neutral_rockpulverizer_attack_impact.audio
        death : RSX.sfx_neutral_rockpulverizer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralExplodingDemonBreathing.name
        idle : RSX.neutralExplodingDemonIdle.name
        walk : RSX.neutralExplodingDemonRun.name
        attack : RSX.neutralExplodingDemonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.2
        damage : RSX.neutralExplodingDemonHit.name
        death : RSX.neutralExplodingDemonDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])

    if (identifier == Cards.Neutral.WindStopper)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_wind_stopper_name")
      card.setDescription(i18next.t("cards.neutral_wind_stopper_desc"))
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
        breathing : RSX.neutralShieldOracleBreathing.name
        idle : RSX.neutralShieldOracleIdle.name
        walk : RSX.neutralShieldOracleRun.name
        attack : RSX.neutralShieldOracleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralShieldOracleHit.name
        death : RSX.neutralShieldOracleDeath.name
      )
      card.atk = 1
      card.maxHP = 7
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierRangedProvoke.createContextObject()])

    if (identifier == Cards.Neutral.PrimusShieldmaster)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_primus_shieldmaster_name")
      card.setDescription(i18next.t("cards.neutral_primus_shieldmaster_desc"))
      card.setFXResource(["FX.Cards.Neutral.PrimusShieldmaster"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPrimusShieldmasterBreathing.name
        idle : RSX.neutralPrimusShieldmasterIdle.name
        walk : RSX.neutralPrimusShieldmasterRun.name
        attack : RSX.neutralPrimusShieldmasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralPrimusShieldmasterHit.name
        death : RSX.neutralPrimusShieldmasterDeath.name
      )
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])

    if (identifier == Cards.Neutral.HailstoneHowler)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_fireblazer_name")
      card.setDescription(i18next.t("cards.neutral_fireblazer_desc"))
      card.setFXResource(["FX.Cards.Neutral.Fireblazer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDarkHarbingerBreathing.name
        idle : RSX.neutralDarkHarbingerIdle.name
        walk : RSX.neutralDarkHarbingerRun.name
        attack : RSX.neutralDarkHarbingerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralDarkHarbingerHit.name
        death : RSX.neutralDarkHarbingerDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])

    if (identifier == Cards.Neutral.WhistlingBlade)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_whistling_blade_name")
      card.setDescription(i18next.t("cards.neutral_whistling_blade_desc"))
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
        breathing : RSX.neutralWhistlingBladeBreathing.name
        idle : RSX.neutralWhistlingBladeIdle.name
        walk : RSX.neutralWhistlingBladeRun.name
        attack : RSX.neutralWhistlingBladeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralWhistlingBladeHit.name
        death : RSX.neutralWhistlingBladeDeath.name
      )
      card.atk = 2
      card.maxHP = 15
      card.manaCost = 7
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])

    if (identifier == Cards.Neutral.BluetipScorpion)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_bluetip_scorpion_name")
      card.setDescription(i18next.t("cards.neutral_bluetip_scorpion_desc"))
      card.setFXResource(["FX.Cards.Neutral.BluetipScorpion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBluetipScorpionBreathing.name
        idle : RSX.neutralBluetipScorpionIdle.name
        walk : RSX.neutralBluetipScorpionRun.name
        attack : RSX.neutralBluetipScorpionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralBluetipScorpionHit.name
        death : RSX.neutralBluetipScorpionDeath.name
      )
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierDoubleDamageToMinions.createContextObject()])

    if (identifier == Cards.Neutral.CrimsonOculus)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_crimson_oculus_name")
      card.setDescription(i18next.t("cards.neutral_crimson_oculus_desc"))
      card.setFXResource(["FX.Cards.Neutral.CrimsonOculus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_waterelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_komodocharger_hit.audio
        attackDamage : RSX.sfx_neutral_komodocharger_attack_impact.audio
        death : RSX.sfx_neutral_komodocharger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralOculusBreathing.name
        idle : RSX.neutralOculusIdle.name
        walk : RSX.neutralOculusRun.name
        attack : RSX.neutralOculusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralOculusHit.name
        death : RSX.neutralOculusDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierOpponentSummonWatchBuffSelf.createContextObject(1,1)
      ])

    if (identifier == Cards.Neutral.ThornNeedler)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_thorn_needler_name")
      card.setFXResource(["FX.Cards.Neutral.ThornNeedler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralNeedlerBreathing.name
        idle : RSX.neutralNeedlerIdle.name
        walk : RSX.neutralNeedlerRun.name
        attack : RSX.neutralNeedlerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralNeedlerHit.name
        death : RSX.neutralNeedlerDeath.name
      )
      card.atk = 6
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.Serpenti)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_serpenti_name")
      card.setDescription(i18next.t("cards.neutral_serpenti_desc"))
      card.setFXResource(["FX.Cards.Neutral.Serpenti"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_serpenti_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_serpenti_hit.audio
        attackDamage : RSX.sfx_neutral_serpenti_attack_impact.audio
        death : RSX.sfx_neutral_serpenti_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSerpentiBreathing.name
        idle : RSX.neutralSerpentiIdle.name
        walk : RSX.neutralSerpentiRun.name
        attack : RSX.neutralSerpentiAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralSerpentiHit.name
        death : RSX.neutralSerpentiDeath.name
      )
      card.atk = 7
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierFrenzy.createContextObject()])

    if (identifier == Cards.Neutral.VenomToth)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_venom_toth_name")
      card.setDescription(i18next.t("cards.neutral_venom_toth_desc"))
      card.setFXResource(["FX.Cards.Neutral.VenomToth"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_neutral_monsterdreamoracle_attack_impact.audio
        death : RSX.sfx_neutral_monsterdreamoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralTwinbladeWarmongerBreathing.name
        idle : RSX.neutralTwinbladeWarmongerIdle.name
        walk : RSX.neutralTwinbladeWarmongerRun.name
        attack : RSX.neutralTwinbladeWarmongerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralTwinbladeWarmongerHit.name
        death : RSX.neutralTwinbladeWarmongerDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierOpponentSummonWatchDamageEnemyGeneral.createContextObject(1)])

    if (identifier == Cards.Neutral.SkyrockGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_skyrock_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.SkyrockGolem"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemRunesandBreathing.name
        idle : RSX.neutralGolemRunesandIdle.name
        walk : RSX.neutralGolemRunesandRun.name
        attack : RSX.neutralGolemRunesandAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralGolemRunesandHit.name
        death : RSX.neutralGolemRunesandDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.BloodshardGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_bloodshard_golem_name")
      card.setFXResource(["FX.Cards.Neutral.BloodshardGolem"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemBloodshardBreathing.name
        idle : RSX.neutralGolemBloodshardIdle.name
        walk : RSX.neutralGolemBloodshardRun.name
        attack : RSX.neutralGolemBloodshardAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralGolemBloodshardHit.name
        death : RSX.neutralGolemBloodshardDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.DragoneboneGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_dragonbone_golem_name")
      card.setFXResource(["FX.Cards.Neutral.DragoneboneGolem"])
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
        breathing : RSX.neutralGolemDragonboneBreathing.name
        idle : RSX.neutralGolemDragonboneIdle.name
        walk : RSX.neutralGolemDragonboneRun.name
        attack : RSX.neutralGolemDragonboneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGolemDragonboneHit.name
        death : RSX.neutralGolemDragonboneDeath.name
      )
      card.atk = 10
      card.maxHP = 10
      card.manaCost = 7
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.StormmetalGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_stormmetal_golem_name")
      card.setFXResource(["FX.Cards.Neutral.StormmetalGolem"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(70)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormmetalgolem_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_stormmetalgolem_hit.audio
        attackDamage : RSX.sfx_neutral_stormmetalgolem_attack_impact.audio
        death : RSX.sfx_neutral_stormmetalgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemStormmetalBreathing.name
        idle : RSX.neutralGolemStormmetalIdle.name
        walk : RSX.neutralGolemStormmetalRun.name
        attack : RSX.neutralGolemStormmetalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGolemStormmetalHit.name
        death : RSX.neutralGolemStormmetalDeath.name
      )
      card.atk = 8
      card.maxHP = 8
      card.manaCost = 6
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.BrightmossGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_brightmoss_golem_name")
      card.setFXResource(["FX.Cards.Neutral.BrightmossGolem"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f4_blacksolus_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_brightmossgolem_hit.audio
        attackDamage : RSX.sfx_neutral_brightmossgolem_attack_impact.audio
        death : RSX.sfx_neutral_brightmossgolem_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemNatureBreathing.name
        idle : RSX.neutralGolemNatureIdle.name
        walk : RSX.neutralGolemNatureRun.name
        attack : RSX.neutralGolemNatureAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralGolemNatureHit.name
        death : RSX.neutralGolemNatureDeath.name
      )
      card.atk = 4
      card.maxHP = 9
      card.manaCost = 5
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.Mechaz0rHelm)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Mech
      card.name = i18next.t("cards.neutral_helm_of_mechaz0r_name")
      card.setDescription(i18next.t("cards.neutral_helm_of_mechaz0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rHelm"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMechaz0rHelmBreathing.name
        idle : RSX.neutralMechaz0rHelmIdle.name
        walk : RSX.neutralMechaz0rHelmRun.name
        attack : RSX.neutralMechaz0rHelmAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralMechaz0rHelmHit.name
        death : RSX.neutralMechaz0rHelmDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 1
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject()
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])

    if (identifier == Cards.Neutral.Mechaz0rWings)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Mech
      card.name = i18next.t("cards.neutral_wings_of_mechaz0r_name")
      card.setDescription(i18next.t("cards.neutral_wings_of_mechaz0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rWings"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_wingsmechaz0r_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsmechaz0r_hit.audio
        attackDamage : RSX.sfx_neutral_wingsmechaz0r_impact.audio
        death : RSX.sfx_neutral_wingsmechaz0r_hit.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMechaz0rWingsBreathing.name
        idle : RSX.neutralMechaz0rWingsIdle.name
        walk : RSX.neutralMechaz0rWingsRun.name
        attack : RSX.neutralMechaz0rWingsAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralMechaz0rWingsHit.name
        death : RSX.neutralMechaz0rWingsDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierAirdrop.createContextObject(),
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject()
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])
    #      card.setDescription("MECHAZ0R progress +20%.")

    if (identifier == Cards.Neutral.Mechaz0rCannon)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Mech
      card.name = i18next.t("cards.neutral_cannon_of_mechaz0r_name")
      card.setDescription(i18next.t("cards.neutral_cannon_of_mechaz0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rCannon"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_cannonmechaz0r_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_cannonmechaz0r_impact.audio
        attackDamage : RSX.sfx_neutral_cannonmechaz0r_hit.audio
        death : RSX.sfx_neutral_cannonmechaz0r_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMechaz0rCannonBreathing.name
        idle : RSX.neutralMechaz0rCannonIdle.name
        walk : RSX.neutralMechaz0rCannonRun.name
        attack : RSX.neutralMechaz0rCannonAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 0.4
        damage : RSX.neutralMechaz0rCannonHit.name
        death : RSX.neutralMechaz0rCannonDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierRanged.createContextObject(),
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject()
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])
    #      card.setDescription("MECHAZ0R progress +20%.")

    if (identifier == Cards.Neutral.Mechaz0rSword)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Mech
      card.name = i18next.t("cards.neutral_sword_of_mechaz0r_name")
      card.setDescription(i18next.t("cards.neutral_sword_of_mechaz0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rSword"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_swordmechaz0r_attack_swing.audio
        receiveDamage :  RSX.sfx_neutral_swordmechaz0r_hit.audio
        attackDamage : RSX.sfx_neutral_swordmechaz0r_attack_impact.audio
        death : RSX.sfx_neutral_swordmechaz0r_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMechaz0rSwordBreathing.name
        idle : RSX.neutralMechaz0rSwordIdle.name
        walk : RSX.neutralMechaz0rSwordRun.name
        attack : RSX.neutralMechaz0rSwordAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.neutralMechaz0rSwordHit.name
        death : RSX.neutralMechaz0rSwordDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierFrenzy.createContextObject(),
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject()
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])
    #      card.setDescription("MECHAZ0R progress +20%.")

    if (identifier == Cards.Neutral.Mechaz0rChassis)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Mech
      card.name = i18next.t("cards.neutral_chassis_of_mechaz0r_name")
      card.setDescription(i18next.t("cards.neutral_chassis_of_mechaz0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rChassis"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMechaz0rChassisBreathing.name
        idle : RSX.neutralMechaz0rChassisIdle.name
        walk : RSX.neutralMechaz0rChassisRun.name
        attack : RSX.neutralMechaz0rChassisAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralMechaz0rChassisHit.name
        death : RSX.neutralMechaz0rChassisDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierForcefield.createContextObject(),
        ModifierOpeningGambitApplyMechazorPlayerModifiers.createContextObject()
      ])
      card.addKeywordClassToInclude(PlayerModifierMechazorBuildProgress)
      card.setFollowups([{
        id: Cards.Spell.DeployMechaz0r
      }])
    #      card.setDescription("MECHAZ0R progress +20%.")

    if (identifier == Cards.Neutral.Mechaz0r)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Mech
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_mechaz0r_name")
      card.setDescription(i18next.t("cards.neutral_mechaz0r_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mechaz0r"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f4_juggernaut_attack_swing.audio
        receiveDamage : RSX.sfx_f4_juggernaut_hit.audio
        attackDamage : RSX.sfx_f4_juggernaut_attack_impact.audio
        death : RSX.sfx_f4_juggernaut_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMechaz0rSuperBreathing.name
        idle : RSX.neutralMechaz0rSuperIdle.name
        walk : RSX.neutralMechaz0rSuperRun.name
        attack : RSX.neutralMechaz0rSuperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralMechaz0rSuperHit.name
        death : RSX.neutralMechaz0rSuperDeath.name
      )
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([
        ModifierFrenzy.createContextObject(),
        ModifierRanged.createContextObject(),
        ModifierAirdrop.createContextObject(),
        ModifierForcefield.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.SpottedDragonlark)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_dragonlark_name")
      card.setDescription(i18next.t("cards.neutral_dragonlark_desc"))
      card.setFXResource(["FX.Cards.Neutral.SpottedDragonlark"])
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
        breathing : RSX.neutralDragonhawkBreathing.name
        idle : RSX.neutralDragonhawkIdle.name
        walk : RSX.neutralDragonhawkRun.name
        attack : RSX.neutralDragonhawkAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralDragonhawkHit.name
        death : RSX.neutralDragonhawkDeath.name
      )
      card.maxHP = 1
      card.atk = 2
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])

    if (identifier == Cards.Neutral.PutridMindflayer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_putrid_dreadflayer_name")
      card.setDescription(i18next.t("cards.neutral_putrid_dreadflayer_desc"))
      card.setFXResource(["FX.Cards.Neutral.PutridMindflayer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_daemondeep_attack_swing.audio
        receiveDamage : RSX.sfx_f4_daemondeep_hit.audio
        attackDamage : RSX.sfx_f4_daemondeep_attack_impact.audio
        death : RSX.sfx_f4_daemondeep_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPutridDreadflayerBreathing.name
        idle : RSX.neutralPutridDreadflayerIdle.name
        walk : RSX.neutralPutridDreadflayerRun.name
        attack : RSX.neutralPutridDreadflayerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralPutridDreadflayerHit.name
        death : RSX.neutralPutridDreadflayerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])

    if (identifier == Cards.Neutral.FlameWing)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_young_flamewing_name")
      card.setDescription(i18next.t("cards.neutral_young_flamewing_desc"))
      card.setFXResource(["FX.Cards.Neutral.FlameWing"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_spell_blindscorch.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralFlamewingBreathing.name
        idle : RSX.neutralFlamewingIdle.name
        walk : RSX.neutralFlamewingRun.name
        attack : RSX.neutralFlamewingAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralFlamewingHit.name
        death : RSX.neutralFlamewingDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])

    if (identifier == Cards.Neutral.LightningBeetle)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_storm_aratha_name")
      card.setDescription(i18next.t("cards.neutral_storm_aratha_desc"))
      card.setFXResource(["FX.Cards.Neutral.LightningBeetle"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(65)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_stormatha_attack_swing.audio
        receiveDamage :  RSX.sfx_neutral_stormatha_hit.audio
        attackDamage : RSX.sfx_neutral_stormatha_attack_impact.audio
        death : RSX.sfx_neutral_stormatha_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralLightningBeetleBreathing.name
        idle : RSX.neutralLightningBeetleIdle.name
        walk : RSX.neutralLightningBeetleRun.name
        attack : RSX.neutralLightningBeetleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralMercPirateBeastHit.name
        death : RSX.neutralMercPirateBeastDeath.name
      )
      card.atk = 6
      card.maxHP = 5
      card.manaCost = 6
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])

    if (identifier == Cards.Neutral.PhaseHound)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_blaze_hound_name")
      card.setDescription(i18next.t("cards.neutral_blaze_hound_desc"))
      card.setFXResource(["FX.Cards.Neutral.PhaseHound"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_frostwyvern_attack_swing.audio
        receiveDamage : RSX.sfx_f6_frostwyvern_hit.audio
        attackDamage : RSX.sfx_f6_frostwyvern_attack_impact.audio
        death : RSX.sfx_f6_frostwyvern_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastDarkHarbingerBreathing.name
        idle : RSX.neutralBeastDarkHarbingerIdle.name
        walk : RSX.neutralBeastDarkHarbingerRun.name
        attack : RSX.neutralBeastDarkHarbingerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralBeastDarkHarbingerHit.name
        death : RSX.neutralBeastDarkHarbingerDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDrawCardBothPlayers.createContextObject()])

    if (identifier == Cards.Neutral.BlackSandBurrower)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sand_burrower_name")
      card.setDescription(i18next.t("cards.neutral_sand_burrower_desc"))
      card.setFXResource(["FX.Cards.Neutral.BlackSandBurrower"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_frostwyvern_death.audio
        receiveDamage : RSX.sfx_f4_daemondeep_hit.audio
        attackDamage : RSX.sfx_f4_daemondeep_attack_impact.audio
        death : RSX.sfx_f4_daemondeep_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBlackSandBurrowerBreathing.name
        idle : RSX.neutralBlackSandBurrowerIdle.name
        walk : RSX.neutralBlackSandBurrowerRun.name
        attack : RSX.neutralBlackSandBurrowerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralBlackSandBurrowerHit.name
        death : RSX.neutralBlackSandBurrowerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierSurviveDamageWatchReturnToHand.createContextObject()])

    if (identifier == Cards.Neutral.MiniJax)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_minijax_name")
      card.setDescription(i18next.t("cards.neutral_minijax_desc"))
      card.setFXResource(["FX.Cards.Neutral.MiniJax"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(45)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_jaxtruesight_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_firespitter_hit.audio
        attackDamage : RSX.sfx_neutral_jaxtruesight_attack_impact.audio
        death : RSX.sfx_neutral_jaxtruesight_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMiniJaxBreathing.name
        idle : RSX.neutralMiniJaxIdle.name
        walk : RSX.neutralMiniJaxRun.name
        attack : RSX.neutralMiniJaxAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 1.2
        damage : RSX.neutralMiniJaxHit.name
        death : RSX.neutralMiniJaxDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([
        ModifierRanged.createContextObject()
      ])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.JaxTruesight)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_jax_truesight_name")
      card.setDescription(i18next.t("cards.neutral_jax_truesight_desc"))
      card.setFXResource(["FX.Cards.Neutral.JaxTruesight"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_jaxtruesight_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_jaxtruesight_hit.audio
        attackDamage : RSX.sfx_neutral_jaxtruesight_attack_impact.audio
        death : RSX.sfx_neutral_jaxtruesight_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralJaxTruesightBreathing.name
        idle : RSX.neutralJaxTruesightIdle.name
        walk : RSX.neutralJaxTruesightRun.name
        attack : RSX.neutralJaxTruesightAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 1.2
        damage : RSX.neutralJaxTruesightHit.name
        death : RSX.neutralJaxTruesightDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierRanged.createContextObject(),
        ModifierOpeningGambitSpawnEntityInEachCorner.createContextObject({id: Cards.Neutral.MiniJax}, "a 1/1 Ranged Mini-Jax")
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.RepulsionBeast)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_repulsor_beast_name")
      card.setDescription(i18next.t("cards.neutral_repulsor_beast_desc"))
      card.setFXResource(["FX.Cards.Neutral.RepulsionBeast"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_repulsionbeast_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_repulsionbeast_hit.audio
        attackDamage : RSX.sfx_neutral_repulsionbeast_attack_impact.audio
        death : RSX.sfx_neutral_repulsionbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastRepulsionBreathing.name
        idle : RSX.neutralBeastRepulsionIdle.name
        walk : RSX.neutralBeastRepulsionRun.name
        attack : RSX.neutralBeastRepulsionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralBeastRepulsionHit.name
        death : RSX.neutralBeastRepulsionDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Fixed
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.Repulsion
          spellFilterType: SpellFilterType.EnemyDirect
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Neutral.SilvertongueCorsair)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_silvertongue_corsair_name")
      card.setDescription(i18next.t("cards.neutral_silvertongue_corsair_desc"))
      card.setFXResource(["FX.Cards.Neutral.SilvertongueCorsair"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_kaidoassassin_attack_swing.audio
        receiveDamage : RSX.sfx_f1elyxstormblade_hit.audio
        attackDamage : RSX.sfx_f1elyxstormblade_attack_impact.audio
        death : RSX.sfx_f6_icedryad_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMercPirateBreathing.name
        idle : RSX.neutralMercPirateIdle.name
        walk : RSX.neutralMercPirateRun.name
        attack : RSX.neutralMercPirateAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralMercPirateHit.name
        death : RSX.neutralMercPirateDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierImmuneToDamageByGeneral.createContextObject()])

    if (identifier == Cards.Neutral.SaberspineTiger)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_saberspine_tiger_name")
      card.setDescription(i18next.t("cards.neutral_saberspine_tiger_desc"))
      card.setFXResource(["FX.Cards.Neutral.SaberspineTiger"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_boreanbear_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastsaberspinetiger_hit.audio
        attackDamage : RSX.sfx_neutral_beastsaberspinetiger_attack_impact.audio
        death : RSX.sfx_neutral_beastsaberspinetiger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBeastSaberspineTigerBreathing.name
        idle : RSX.neutralBeastSaberspineTigerIdle.name
        walk : RSX.neutralBeastSaberspineTigerRun.name
        attack : RSX.neutralBeastSaberspineTigerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralBeastSaberspineTigerHit.name
        death : RSX.neutralBeastSaberspineTigerDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 4
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierFirstBlood.createContextObject()])

    if (identifier == Cards.Neutral.PiercingMantis)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_piercing_mantis_name")
      card.setDescription(i18next.t("cards.neutral_piercing_mantis_desc"))
      card.setFXResource(["FX.Cards.Neutral.PiercingMantis"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_redsynja_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPiercingMantisBreathing.name
        idle : RSX.neutralPiercingMantisIdle.name
        walk : RSX.neutralPiercingMantisRun.name
        attack : RSX.neutralPiercingMantisAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralPiercingMantisHit.name
        death : RSX.neutralPiercingMantisDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierFrenzy.createContextObject()])

    if (identifier == Cards.Neutral.TwilightMage)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_twilight_sorcerer_name")
      card.setDescription(i18next.t("cards.neutral_twilight_sorcerer_desc"))
      card.setFXResource(["FX.Cards.Neutral.TwilightMage"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_f3_dunecaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralTwilightMageBreathing.name
        idle : RSX.neutralTwilightMageIdle.name
        walk : RSX.neutralTwilightMageRun.name
        attack : RSX.neutralTwilightMageAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralTwilightMageHit.name
        death : RSX.neutralTwilightMageDeath.name
      )
      card.atk = 3
      card.maxHP = 6
      card.manaCost = 5
      card.setInherentModifiersContextObjects([ModifierOpeningGambitRetrieveRandomSpell.createContextObject()])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Neutral.PrimusFist)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_primus_fist_name")
      card.setDescription(i18next.t("cards.neutral_primus_fist_desc"))
      card.setFXResource([ "FX.Cards.Neutral.PrimusFist"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f5_vindicator_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGauntletMasterBreathing.name
        idle : RSX.neutralGauntletMasterIdle.name
        walk : RSX.neutralGauntletMasterRun.name
        attack : RSX.neutralGauntletMasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGauntletMasterHit.name
        death : RSX.neutralGauntletMasterDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(2,0)
      statContextObject.appliedName = i18next.t("modifiers.neutral_primus_fist_modifier_2")
      statContextObject.durationEndTurn = 1
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          spellFilterType: SpellFilterType.AllyDirect
          targetModifiersContextObjects: [
            statContextObject
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Neutral.GolemMetallurgist)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_golem_metallurgist_name")
      card.setDescription(i18next.t("cards.neutral_golem_metallurgist_desc"))
      card.setFXResource(["FX.Cards.Neutral.GolemMetallurgist"])
      card.setBoundingBoxWidth(45)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemSteelBreathing.name
        idle : RSX.neutralGolemSteelIdle.name
        walk : RSX.neutralGolemSteelRun.name
        attack : RSX.neutralGolemSteelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGolemSteelDamage.name
        death : RSX.neutralGolemSteelDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      contextObject = PlayerModifierManaModifierOncePerTurn.createCostChangeContextObject(-1, CardType.Unit, [Races.Golem])
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "The first Golem you summon each turn costs 1 less")
      ])

    if (identifier == Cards.Neutral.GolemVanquisher)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Golem
      card.name = i18next.t("cards.neutral_golem_vanquisher_name")
      card.setDescription(i18next.t("cards.neutral_golem_vanquisher_desc"))
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
        breathing : RSX.neutralGolemStoneBreathing.name
        idle : RSX.neutralGolemStoneIdle.name
        walk : RSX.neutralGolemStoneRun.name
        attack : RSX.neutralGolemStoneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralGolemStoneDamage.name
        death : RSX.neutralGolemStoneDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierProvoke.createContextObject(),
        Modifier.createContextObjectWithAuraForAllAllies([ModifierProvoke.createContextObject()], [Races.Golem], null, null, "Your other Golem minions have Provoke")
      ])

    if (identifier == Cards.Neutral.FrostboneNaga)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_frostbone_naga_name")
      card.setDescription(i18next.t("cards.neutral_frostbone_naga_desc"))
      card.setFXResource(["FX.Cards.Neutral.FrostboneNaga"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_2.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_siren_attack_swing.audio
        receiveDamage : RSX.sfx_f4_siren_hit.audio
        attackDamage : RSX.sfx_f6_ancientgrove_attack_impact.audio
        death : RSX.sfx_f4_siren_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralFrostboneNagaBreathing.name
        idle : RSX.neutralFrostboneNagaIdle.name
        walk : RSX.neutralFrostboneNagaRun.name
        attack : RSX.neutralFrostboneNagaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralFrostboneNagaHit.name
        death : RSX.neutralFrostboneNagaDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageNearby.createContextObject(2)])

    if (identifier == Cards.Neutral.ArchonSpellbinder)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_archon_spellbinder_name")
      card.setDescription(i18next.t("cards.neutral_archon_spellbinder_desc"))
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
        breathing : RSX.neutralArchonSpellbinderBreathing.name
        idle : RSX.neutralArchonSpellbinderIdle.name
        walk : RSX.neutralArchonSpellbinderRun.name
        attack : RSX.neutralArchonSpellbinderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralArchonSpellbinderHit.name
        death : RSX.neutralArchonSpellbinderDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(1, CardType.Spell)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([contextObject], "Your opponent's non-Bloodbound spells cost 1 more to cast")
      ])

    if (identifier == Cards.Neutral.SilhoutteTracer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_silhouette_tracer_name")
      card.setDescription(i18next.t("cards.neutral_silhouette_tracer_desc"))
      card.setFXResource(["FX.Cards.Neutral.SilhoutteTracer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f3_dunecaster_attack_swing.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_f3_dunecaster_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSilhouetteTracerBreathing.name
        idle : RSX.neutralSilhouetteTracerIdle.name
        walk : RSX.neutralSilhouetteTracerRun.name
        attack : RSX.neutralSilhouetteTracerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralSilhouetteTracerHit.name
        death : RSX.neutralSilhouetteTracerDeath.name
      )
      card.atk = 2
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.FollowupTeleportMyGeneral
          pattern: CONFIG.PATTERN_3SPACES_WITHOUT_CENTER
        }
      ])

    if (identifier == Cards.Neutral.SarlacTheEternal)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sarlac_the_eternal_name")
      card.setDescription(i18next.t("cards.neutral_sarlac_the_eternal_desc"))
      card.setFXResource(["FX.Cards.Neutral.SarlacTheEternal"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        receiveDamage : RSX.sfx_f4_daemondeep_hit.audio
        attackDamage : RSX.sfx_f4_daemondeep_attack_impact.audio
        death : RSX.sfx_spell_fountainofyouth.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1SunstoneMaidenBreathing.name
        idle : RSX.f1SunstoneMaidenIdle.name
        walk : RSX.f1SunstoneMaidenRun.name
        attack : RSX.f1SunstoneMaidenAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.f1SunstoneMaidenDamage.name
        death : RSX.f1SunstoneMaidenDeath.name
      )
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierDyingWishReSpawnEntityAnywhere.createContextObject()])

    if (identifier == Cards.Neutral.DarkNemesis)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_dark_nemesis_name")
      card.setDescription(i18next.t("cards.neutral_dark_nemesis_desc"))
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
        breathing : RSX.neutralDarkNemesisBreathing.name
        idle : RSX.neutralDarkNemesisIdle.name
        walk : RSX.neutralDarkNemesisRun.name
        attack : RSX.neutralDarkNemesisttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralDarkNemesisHit.name
        death : RSX.neutralDarkNemesisDeath.name
      )
      card.atk = 4
      card.maxHP = 10
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierStartTurnWatchDamageEnemyGeneralBuffSelf.createContextObject(4,0,4,{appliedName:i18next.t("modifiers.neutral_dark_nemesis_modifier")})])

    if (identifier == Cards.Neutral.MirkbloodDevourer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_mirkblood_devourer_name")
      card.setDescription(i18next.t("cards.neutral_mirkblood_devourer_desc"))
      card.setFXResource(["FX.Cards.Neutral.MirkbloodDevourer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_mirkblooddevourer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_mirkblooddevourer_hit.audio
        attackDamage : RSX.sfx_neutral_mirkblooddevourer_attack_impact.audio
        death : RSX.sfx_neutral_mirkblooddevourer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMirkbloodDevourerBreathing.name
        idle : RSX.neutralMirkbloodDevourerIdle.name
        walk : RSX.neutralMirkbloodDevourerRun.name
        attack : RSX.neutralMirkbloodDevourerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.25
        damage : RSX.neutralMirkbloodDevourerHit.name
        death : RSX.neutralMirkbloodDevourerDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Legendary
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statContextObject.appliedName = i18next.t("modifiers.neutral_mirkblood_devourer_modifier")
      card.setInherentModifiersContextObjects([ModifierSummonWatchNearbyApplyModifiers.createContextObject([statContextObject], "gain +1/+1"),])

    if (identifier == Cards.Neutral.Sojourner)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sojourner_name")
      card.setDescription(i18next.t("cards.neutral_sojourner_desc"))
      card.setFXResource(["FX.Cards.Neutral.Sojourner"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_gambitgirl_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_gambitgirl_hit.audio
        attackDamage : RSX.sfx_neutral_gambitgirl_attack_impact.audio
        death : RSX.sfx_neutral_gambitgirl_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGambitGirlBreathing.name
        idle : RSX.neutralGambitGirlIdle.name
        walk : RSX.neutralGambitGirlRun.name
        attack : RSX.neutralGambitGirlAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralGambitGirlHit.name
        death : RSX.neutralGambitGirlDeath.name
      )
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 3
      card.setInherentModifiersContextObjects([ModifierDealDamageWatchDrawCard.createContextObject()])
      card.rarityId = Rarity.Rare

    if (identifier == Cards.Neutral.AzureHornShaman)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_azure_horn_shaman_name")
      card.setDescription(i18next.t("cards.neutral_azure_horn_shaman_desc"))
      card.setFXResource(["FX.Cards.Neutral.AzureHornShaman"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAzurehornShamanBreathing.name
        idle : RSX.neutralAzurehornShamanIdle.name
        walk : RSX.neutralAzurehornShamanRun.name
        attack : RSX.neutralAzurehornShamanAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralAzurehornShamanHit.name
        death : RSX.neutralAzurehornShamanDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      statContextObject = Modifier.createContextObjectWithAttributeBuffs(0,4)
      statContextObject.appliedName = i18next.t("modifiers.neutral_azure_horn_shaman_modifier")
      card.setInherentModifiersContextObjects([
        ModifierDyingWishApplyModifiers.createContextObject([statContextObject], false, true, false, 1, false, "Give +4 Health to friendly minions around it")
      ])

    if (identifier == Cards.Neutral.FlamebloodWarlock)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_flameblood_warlock_name")
      card.setDescription(i18next.t("cards.neutral_flameblood_warlock_desc"))
      card.setFXResource(["FX.Cards.Neutral.FlamebloodWarlock"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralFlamebloodWarlockBreathing.name
        idle : RSX.neutralFlamebloodWarlockIdle.name
        walk : RSX.neutralFlamebloodWarlockRun.name
        attack : RSX.neutralFlamebloodWarlockAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralFlamebloodWarlockHit.name
        death : RSX.neutralFlamebloodWarlockDeath.name
      )
      card.atk = 3
      card.maxHP = 1
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageBothGenerals.createContextObject(3)])

    if (identifier == Cards.Neutral.BloodtearAlchemist)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_bloodtear_alchemist_name")
      card.setDescription(i18next.t("cards.neutral_bloodtear_alchemist_desc"))
      card.setFXResource(["FX.Cards.Neutral.BloodtearAlchemist"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bloodtearalchemist_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bloodtearalchemist_hit.audio
        attackDamage : RSX.sfx_neutral_bloodtearalchemist_attack_impact.audio
        death : RSX.sfx_neutral_bloodtearalchemist_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralBloodstoneAlchemistBreathing.name
        idle : RSX.neutralBloodstoneAlchemistIdle.name
        walk : RSX.neutralBloodstoneAlchemistRun.name
        attack : RSX.neutralBloodstoneAlchemistAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralBloodstoneAlchemistHit.name
        death : RSX.neutralBloodstoneAlchemistDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.rarityId = Rarity.Fixed
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.FollowupDamage
          spellFilterType: SpellFilterType.EnemyDirect
          canTargetGeneral: true
          damageAmount: 1
        }
      ])

    if (identifier == Cards.Neutral.DancingBlades)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_dancing_blades_name")
      card.setDescription(i18next.t("cards.neutral_dancing_blades_desc"))
      card.setFXResource(["FX.Cards.Neutral.DancingBlades"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_dancingblades_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_dancingblades_hit.audio
        attackDamage : RSX.sfx_neutral_dancingblades_attack_impact.audio
        death : RSX.sfx_neutral_dancingblades_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDancingBladesBreathing.name
        idle : RSX.neutralDancingBladesIdle.name
        walk : RSX.neutralDancingBladesRun.name
        attack : RSX.neutralDancingBladesAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralDancingBladesHit.name
        death : RSX.neutralDancingBladesDeath.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitDamageInFront.createContextObject(3)
      ])

    if (identifier == Cards.Neutral.Crossbones)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_crossbones_name")
      card.setDescription(i18next.t("cards.neutral_crossbones_desc"))
      card.setFXResource(["FX.Cards.Neutral.Crossbones"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_crossbones_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_crossbones_attack_impact.audio
        attackDamage : RSX.sfx_neutral_crossbones_hit.audio
        death : RSX.sfx_neutral_crossbones_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCrossbonesBreathing.name
        idle : RSX.neutralCrossbonesIdle.name
        walk : RSX.neutralCrossbonesRun.name
        attack : RSX.neutralCrossbonesAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralCrossbonesHit.name
        death : RSX.neutralCrossbonesDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.KillTargetWithRanged
          spellFilterType: SpellFilterType.EnemyDirect
        }
      ])

    if (identifier == Cards.Neutral.SwornAvenger)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sworn_avenger_name")
      card.setDescription(i18next.t("cards.neutral_sworn_avenger_desc"))
      card.setFXResource(["FX.Cards.Neutral.SwornAvenger"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_swornavenger_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_swornavenger_hit.audio
        attackDamage : RSX.sfx_neutral_swornavenger_attack_impact.audio
        death : RSX.sfx_neutral_swornavenger_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSwornAvengerBreathing.name
        idle : RSX.neutralSwornAvengerIdle.name
        walk : RSX.neutralSwornAvengerRun.name
        attack : RSX.neutralSwornAvengerAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 0.4
        damage : RSX.neutralSwornAvengerHit.name
        death : RSX.neutralSwornAvengerDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      customModifierContextObject = ModifierMyGeneralDamagedWatchBuffSelf.createContextObject(1,0)
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), customModifierContextObject])

    if (identifier == Cards.Neutral.SwornDefender)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_sworn_defender_name")
      card.setDescription(i18next.t("cards.neutral_sworn_defender_desc"))
      card.setFXResource(["FX.Cards.Neutral.SwornDefender"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(85)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSwornDefenderBreathing.name
        idle : RSX.neutralSwornDefenderIdle.name
        walk : RSX.neutralSwornDefenderRun.name
        attack : RSX.neutralSwornDefenderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.neutralSwornDefenderHit.name
        death : RSX.neutralSwornDefenderDeath.name
      )
      card.atk = 4
      card.maxHP = 7
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierMyGeneralDamagedWatchHealSelf.createContextObject()])

    if (identifier == Cards.Neutral.RedSynja)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_red_synja_name")
      card.setDescription(i18next.t("cards.neutral_red_synja_desc"))
      card.setFXResource(["FX.Cards.Neutral.RedSynja"])
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_redsynja_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_redsynja_hit.audio
        attackDamage : RSX.sfx_neutral_redsynja_attack_impact.audio
        death : RSX.sfx_neutral_redsynja_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRedSynjaBreathing.name
        idle : RSX.neutralRedSynjaIdle.name
        walk : RSX.neutralRedSynjaRun.name
        attack : RSX.neutralRedSynjaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralRedSynjaHit.name
        death : RSX.neutralRedSynjaDeath.name
      )
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 7
      card.setInherentModifiersContextObjects([ModifierMyGeneralDamagedWatchDamageNearby.createContextObject(7)])
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.CoiledCrawler)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_rust_crawler_name")
      card.setDescription(i18next.t("cards.neutral_rust_crawler_desc"))
      card.setFXResource(["FX.Cards.Neutral.CoiledCrawler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_coiledcrawler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_coiledcrawler_hit.audio
        attackDamage : RSX.sfx_neutral_coiledcrawler_attack_impact.audio
        death : RSX.sfx_neutral_coiledcrawler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCoiledCrawlerBreathing.name
        idle : RSX.neutralCoiledCrawlerIdle.name
        walk : RSX.neutralCoiledCrawlerRun.name
        attack : RSX.neutralCoiledCrawlerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralCoiledCrawlerHit.name
        death : RSX.neutralCoiledCrawlerDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitRemoveRandomArtifact.createContextObject()])

    if (identifier == Cards.Neutral.DaggerKiri)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_dagger_kiri_name")
      card.setDescription(i18next.t("cards.neutral_dagger_kiri_desc"))
      card.setFXResource(["FX.Cards.Neutral.DaggerKiri"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_daggerkiri_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_daggerkiri_attack_impact.audio
        attackDamage : RSX.sfx_neutral_daggerkiri_hit.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDaggerKiriBreathing.name
        idle : RSX.neutralDaggerKiriIdle.name
        walk : RSX.neutralDaggerKiriRun.name
        attack : RSX.neutralDaggerKiriAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralDaggerKiriHit.name
        death : RSX.neutralDaggerKiriDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.manaCost = 5
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierTranscendance.createContextObject()])

    if (identifier == Cards.Neutral.ArtifactHunter)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_artifact_hunter_name")
      card.setDescription(i18next.t("cards.neutral_artifact_hunter_desc"))
      card.setFXResource(["FX.Cards.Neutral.ArtifactHunter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_windstopper_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_windstopper_hit.audio
        attackDamage : RSX.sfx_neutral_windstopper_attack_impact.audio
        death : RSX.sfx_neutral_windstopper_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralWindstopperBreathing.name
        idle : RSX.neutralWindstopperIdle.name
        walk : RSX.neutralWindstopperRun.name
        attack : RSX.neutralWindstopperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.neutralWindstopperHit.name
        death : RSX.neutralWindstopperDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ ModifierOpeningGambitDrawArtifactFromDeck.createContextObject() ])

    if (identifier == Cards.Neutral.ChaosElemental)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_chaos_elemental_name")
      card.setDescription(i18next.t("cards.neutral_chaos_elemental_desc"))
      card.setFXResource(["FX.Cards.Neutral.ChaosElemental"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_chaoselemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_chaoselemental_hit.audio
        attackDamage : RSX.sfx_neutral_chaoselemental_attack_impact.audio
        death : RSX.sfx_neutral_chaoselemental_hit.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralChaosElementalBreathing.name
        idle : RSX.neutralChaosElementalIdle.name
        walk : RSX.neutralChaosElementalRun.name
        attack : RSX.neutralChaosElementalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralChaosElementalHit.name
        death : RSX.neutralChaosElementalDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierTakeDamageWatchRandomTeleport.createContextObject()
      ])

    if (identifier == Cards.Neutral.Mindwarper)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_mindwarper_name")
      card.setDescription(i18next.t("cards.neutral_mindwarper_desc"))
      card.setFXResource(["FX.Cards.Neutral.Mindwarper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMindwarperBreathing.name
        idle : RSX.neutralMindwarperIdle.name
        walk : RSX.neutralMindwarperRun.name
        attack : RSX.neutralMindwarperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralMindwarperHit.name
        death : RSX.neutralMindwarperDeath.name
      )
      card.atk = 4
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierOpeningGambitMindwarp.createContextObject()])

    if (identifier == Cards.Neutral.Pandora)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_pandora_name")
      card.setDescription(i18next.t("cards.neutral_pandora_desc"))
      card.setFXResource(["FX.Cards.Neutral.Pandora"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(95)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_pandora_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_pandora_hit.audio
        attackDamage : RSX.sfx_neutral_pandora_attack_impact.audio
        death : RSX.sfx_neutral_pandora_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPandoraBreathing.name
        idle : RSX.neutralPandoraIdle.name
        walk : RSX.neutralPandoraRun.name
        attack : RSX.neutralPandoraAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.neutralPandoraHit.name
        death : RSX.neutralPandoraDeath.name
      )
      card.atk = 3
      card.maxHP = 10
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      cardDataToSpawn = [
        {id: Cards.Neutral.PandoraMinion1}
        {id: Cards.Neutral.PandoraMinion2}
        {id: Cards.Neutral.PandoraMinion3}
        {id: Cards.Neutral.PandoraMinion4}
        {id: Cards.Neutral.PandoraMinion5}
      ]
      card.setInherentModifiersContextObjects([ModifierEndTurnWatchSpawnRandomEntity.createContextObject(cardDataToSpawn, "3/3 Spirit Wolf with a random ability", 1, CONFIG.PATTERN_3x3, true)])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.PandoraMinion1)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_pandora_flying_name")
      card.setDescription(i18next.t("cards.neutral_pandora_flying_desc"))
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionCloud"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_ghostwolf_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_f6_ghostwolf_attack_impact.audio
        death : RSX.sfx_f6_ghostwolf_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPandoraMinionFlyBreathing.name
        idle : RSX.neutralPandoraMinionFlyIdle.name
        walk : RSX.neutralPandoraMinionFlyRun.name
        attack : RSX.neutralPandoraMinionFlyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralPandoraMinionFlyHit.name
        death : RSX.neutralPandoraMinionFlyDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierFlying.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.PandoraMinion2)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_pandora_frenzy_name")
      card.setDescription(i18next.t("cards.neutral_pandora_frenzy_desc"))
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionBlaze"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2lanternfox_attack_swing.audio
        receiveDamage : RSX.sfx_f2lanternfox_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPandoraMinionRushBreathing.name
        idle : RSX.neutralPandoraMinionRushIdle.name
        walk : RSX.neutralPandoraMinionRushRun.name
        attack : RSX.neutralPandoraMinionRushAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralPandoraMinionRushHit.name
        death : RSX.neutralPandoraMinionRushDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierFrenzy.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.PandoraMinion3)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_pandora_celerity_name")
      card.setDescription(i18next.t("cards.neutral_pandora_celerity_desc"))
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionFlash"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2lanternfox_attack_swing.audio
        receiveDamage : RSX.sfx_f2lanternfox_hit.audio
        attackDamage : RSX.sfx_f2lanternfox_attack_impact.audio
        death : RSX.sfx_f2lanternfox_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPandoraMinionFrenzyBreathing.name
        idle : RSX.neutralPandoraMinionFrenzyIdle.name
        walk : RSX.neutralPandoraMinionFrenzyRun.name
        attack : RSX.neutralPandoraMinionFrenzyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralPandoraMinionFrenzyHit.name
        death : RSX.neutralPandoraMinionFrenzyDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierTranscendance.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.PandoraMinion4)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_pandora_ranged_name")
      card.setDescription(i18next.t("cards.neutral_pandora_ranged_desc"))
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionZap"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_silitharveteran_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPandoraMinionCelerityBreathing.name
        idle : RSX.neutralPandoraMinionCelerityIdle.name
        walk : RSX.neutralPandoraMinionCelerityRun.name
        attack : RSX.neutralPandoraMinionCelerityAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralPandoraMinionCelerityHit.name
        death : RSX.neutralPandoraMinionCelerityDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.PandoraMinion5)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_pandora_provoke_name")
      card.setDescription(i18next.t("cards.neutral_pandora_provoke_desc"))
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionSinker"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_ghostwolf_attack_swing.audio
        receiveDamage : RSX.sfx_f6_ghostwolf_hit.audio
        attackDamage : RSX.sfx_f6_ghostwolf_attack_impact.audio
        death : RSX.sfx_f6_ghostwolf_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralPandoraMinionProvokeBreathing.name
        idle : RSX.neutralPandoraMinionProvokeIdle.name
        walk : RSX.neutralPandoraMinionProvokeRun.name
        attack : RSX.neutralPandoraMinionProvokeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralPandoraMinionProvokeHit.name
        death : RSX.neutralPandoraMinionProvokeDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.LuxIgnis)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_lux_ignis_name")
      card.setDescription(i18next.t("cards.neutral_lux_ignis_desc"))
      card.setFXResource(["FX.Cards.Neutral.LuxIgnis"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_luxignis_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_luxignis_hit.audio
        attackDamage : RSX.sfx_neutral_luxignis_attack_impact.audio
        death : RSX.sfx_neutral_luxignis_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralLuxIgnisBreathing.name
        idle : RSX.neutralLuxIgnisIdle.name
        walk : RSX.neutralLuxIgnisRun.name
        attack : RSX.neutralLuxIgnisAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralLuxIgnisHit.name
        death : RSX.neutralLuxIgnisDeath.name
      )
      card.atk = 2
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), ModifierEndTurnWatchHealNearby.createContextObject(2)])

    if (identifier == Cards.Neutral.SyvrelTheExile)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_syvrel_the_exile_name")
      card.setDescription(i18next.t("cards.neutral_syvrel_the_exile_desc"))
      card.setFXResource(["FX.Cards.Neutral.SyvrelTheExile"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_syvrel_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_syvrel_hit.audio
        attackDamage : RSX.sfx_neutral_syvrel_attack_impact.audio
        death : RSX.sfx_neutral_syvrel_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSyvrelBreathing.name
        idle : RSX.neutralSyvrelIdle.name
        walk : RSX.neutralSyvrelRun.name
        attack : RSX.neutralSyvrelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.6
        damage : RSX.neutralSyvrelHit.name
        death : RSX.neutralSyvrelDeath.name
      )
      card.atk = 1
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), ModifierDealDamageWatchTeleportToMe.createContextObject()])

    if (identifier == Cards.Neutral.Spelljammer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_spelljammer_name")
      card.setDescription(i18next.t("cards.neutral_spelljammer_desc"))
      card.setFXResource(["FX.Cards.Neutral.Spelljammer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_spelljammer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSpelljammerBreathing.name
        idle : RSX.neutralSpelljammerIdle.name
        walk : RSX.neutralSpelljammerRun.name
        attack : RSX.neutralSpelljammerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralSpelljammerHit.name
        death : RSX.neutralSpelljammerDeath.name
      )
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 4
      card.rarityId = Rarity.Legendary
      contextObject = PlayerModifierCardDrawModifier.createContextObject(1)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetBothPlayers([contextObject], "Each player draws an additional card at the end of their turns")
      ])

    if (identifier == Cards.Neutral.Dilotas)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_dioltas_name")
      card.setDescription(i18next.t("cards.neutral_dioltas_desc"))
      card.setFXResource(["FX.Cards.Neutral.Dilotas"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDilotasBreathing.name
        idle : RSX.neutralDilotasIdle.name
        walk : RSX.neutralDilotasRun.name
        attack : RSX.neutralDilotasAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralDilotasHit.name
        death : RSX.neutralDilotasDeath.name
      )
      card.atk = 5
      card.maxHP = 3
      card.manaCost = 4
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([ModifierDyingWishSpawnEntityNearbyGeneral.createContextObject({id: Cards.Neutral.DilotasTombstone}, "a 0/8 Tombstone minion with Provoke")])
      card.addKeywordClassToInclude(ModifierTokenCreator)

    if (identifier == Cards.Neutral.DilotasTombstone)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.neutral_dioltas_tombstone_name")
      card.setDescription(i18next.t("cards.neutral_dioltas_tombstone_desc"))
      card.setFXResource(["FX.Cards.Neutral.DilotasTombstone"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_golembloodshard_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_golembloodshard_hit.audio
        attackDamage : RSX.sfx_neutral_golembloodshard_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDilotasTombstoneBreathing.name
        idle : RSX.neutralDilotasTombstoneIdle.name
        walk : RSX.neutralDilotasTombstoneRun.name
        attack : RSX.neutralDilotasTombstoneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralDilotasTombstoneHit.name
        death : RSX.neutralDilotasTombstoneDeath.name
      )
      card.atk = 0
      card.maxHP = 8
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.HailstoneGolem)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_hailstone_golem_name")
      card.raceId = Races.Golem
      card.setFXResource(["FX.Cards.Neutral.HailstoneGolem"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_boreanbear_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGolemIceBreathing.name
        idle : RSX.neutralGolemIceIdle.name
        walk : RSX.neutralGolemIceRun.name
        attack : RSX.neutralGolemIceAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralGolemIceDamage.name
        death : RSX.neutralGolemIceDeath.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 4
      card.rarityId = Rarity.Fixed

    if (identifier == Cards.Neutral.Maw)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_maw_name")
      card.setDescription(i18next.t("cards.neutral_maw_desc"))
      card.setFXResource(["FX.Cards.Neutral.Maw"])
      card.setBoundingBoxWidth(55)
      card.setBoundingBoxHeight(30)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_luxignis_death.audio
        walk : RSX.sfx_neutral_arakiheadhunter_hit.audio
        attack : RSX.sfx_f6_frostwyvern_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_beastphasehound_hit.audio
        attackDamage : RSX.sfx_neutral_beastphasehound_attack_impact.audio
        death : RSX.sfx_f6_frostwyvern_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMawBreathing.name
        idle : RSX.neutralMawIdle.name
        walk : RSX.neutralMawRun.name
        attack : RSX.neutralMawAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.35
        damage : RSX.neutralMawHit.name
        death : RSX.neutralMawDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.FollowupDamage
          spellFilterType: SpellFilterType.EnemyDirect
          damageAmount: 2
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
            fxResource: ["FX.Cards.Spell.FollowupDamageDevour"]
          }
        }
      ])

    if (identifier == Cards.Neutral.DeathBlighter)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_deathblighter_name")
      card.setDescription(i18next.t("cards.neutral_deathblighter_desc"))
      card.setFXResource(["FX.Cards.Neutral.DeathBlighter"])
      card.setBoundingBoxWidth(105)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_chaoselemental_hit.audio
        walk : RSX.sfx_neutral_chaoselemental_death.audio
        attack : RSX.sfx_f4_blacksolus_attack_swing.audio
        receiveDamage : RSX.sfx_f4_blacksolus_hit.audio
        attackDamage : RSX.sfx_f4_blacksolus_attack_impact.audio
        death : RSX.sfx_f4_blacksolus_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDeathblighterBreathing.name
        idle : RSX.neutralDeathblighterIdle.name
        walk : RSX.neutralDeathblighterRun.name
        attack : RSX.neutralDeathblighterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralDeathblighterHit.name
        death : RSX.neutralDeathblighterDeath.name
      )
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([ModifierOpeningGambitDamageNearbyMinions.createContextObject(3, false)])

    if (identifier == Cards.Neutral.HealingMystic)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_healing_mystic_name")
      card.setDescription(i18next.t("cards.neutral_healing_mystic_desc"))
      card.setFXResource(["FX.Cards.Neutral.HealingMystic"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_voiceofthewind_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralHealingMysticBreathing.name
        idle : RSX.neutralHealingMysticIdle.name
        walk : RSX.neutralHealingMysticRun.name
        attack : RSX.neutralHealingMysticAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralHealingMysticHit.name
        death : RSX.neutralHealingMysticDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Fixed
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.FollowupHeal
          canTargetGeneral: true
          healAmount: 2
        }
      ])

    if (identifier == Cards.Neutral.VoidHunter)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_void_hunter_name")
      card.setDescription(i18next.t("cards.neutral_void_hunter_desc"))
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
        breathing : RSX.neutralVoidHunterBreathing.name
        idle : RSX.neutralVoidHunterIdle.name
        walk : RSX.neutralVoidHunterRun.name
        attack : RSX.neutralVoidHunterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralVoidHunterHit.name
        death : RSX.neutralVoidHunterDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierDyingWishDrawCard.createContextObject()])
      card.atk = 4
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.AshMephyt)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_ash_mephytt_name")
      card.setDescription(i18next.t("cards.neutral_ash_mephytt_desc"))
      card.setFXResource(["FX.Cards.Neutral.AshMephyt"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_3.audio
        walk : RSX.sfx_f5_unstableleviathan_hit.audio
        attack : RSX.sfx_neutral_ashmephyt_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_ashmephyt_hit.audio
        attackDamage : RSX.sfx_neutral_ashmephyt_attack_impact.audio
        death : RSX.sfx_neutral_ashmephyt_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAshMephytBreathing.name
        idle : RSX.neutralAshMephytIdle.name
        walk : RSX.neutralAshMephytRun.name
        attack : RSX.neutralAshMephytAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.3
        damage : RSX.neutralAshMephytHit.name
        death : RSX.neutralAshMephytDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierOpeningGambitSpawnCopiesOfEntityAnywhere.createContextObject("two copies of this minion", 2)])
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.FirstSwordofAkrane)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_first_sword_of_akrane_name")
      card.setDescription(i18next.t("cards.neutral_first_sword_of_akrane_desc"))
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
        breathing : RSX.neutralFirstSwordAkraneBreathing.name
        idle : RSX.neutralFirstSwordAkraneIdle.name
        walk : RSX.neutralFirstSwordAkraneRun.name
        attack : RSX.neutralFirstSwordAkraneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralFirstSwordAkraneHit.name
        death : RSX.neutralFirstSwordAkraneDeath.name
      )
      customContextObject = Modifier.createContextObjectWithAttributeBuffs(1)
      customContextObject.appliedName = i18next.t("modifiers.neutral_first_sword_of_akrane_modifier")
      card.setInherentModifiersContextObjects([Modifier.createContextObjectWithAuraForAllAllies([customContextObject], null, null, null, "Your other minions have +1 Attack")])
      card.atk = 7
      card.maxHP = 7
      card.manaCost = 6
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.TheHighHand)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_the_high_hand_name")
      card.setDescription(i18next.t("cards.neutral_the_high_hand_desc"))
      card.setFXResource(["FX.Cards.Neutral.TheHighHand"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_grimrock_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_grimrock_hit.audio
        attackDamage : RSX.sfx_neutral_grimrock_attack_impact.audio
        death : RSX.sfx_neutral_grimrock_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralHighHandBreathing.name
        idle : RSX.neutralHighHandIdle.name
        walk : RSX.neutralHighHandRun.name
        attack : RSX.neutralHighHandAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.95
        damage : RSX.neutralHighHandHit.name
        death : RSX.neutralHighHandDeath.name
      )
      attackBuff = ModifierOpeningGambitBuffSelfByOpponentHandCount.createContextObject(1,1)
      card.setInherentModifiersContextObjects([ attackBuff  ])
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 5
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.Eclipse)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_eclipse_name")
      card.setDescription(i18next.t("cards.neutral_eclipse_desc"))
      card.setFXResource(["FX.Cards.Neutral.Eclipse"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f6_icebeetle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralEclipseBreathing.name
        idle : RSX.neutralEclipseIdle.name
        walk : RSX.neutralEclipseRun.name
        attack : RSX.neutralEclipseAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralEclipseHit.name
        death : RSX.neutralEclipseDeath.name
      )
      card.setInherentModifiersContextObjects([ModifierTakeDamageWatchDamageEnemyGeneralForSame.createContextObject()])
      card.atk = 3
      card.maxHP = 7
      card.manaCost = 6
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.LadyLocke)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_lady_locke_name")
      card.setDescription(i18next.t("cards.neutral_lady_locke_desc"))
      card.setFXResource(["FX.Cards.Neutral.LadyLocke"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_ladylocke_attack_swing.audio
        receiveDamage : RSX.sfx_f6_icedryad_attack_impact.audio
        attackDamage : RSX.sfx_neutral_ladylocke_attack_impact.audio
        death : RSX.sfx_f6_icedryad_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralLadyLockeBreathing.name
        idle : RSX.neutralLadyLockeIdle.name
        walk : RSX.neutralLadyLockeRun.name
        attack : RSX.neutralLadyLockeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralLadyLockeHit.name
        death : RSX.neutralLadyLockeDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      statBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statBuffContextObject.appliedName = i18next.t("modifiers.neutral_lady_locke_modifier")
      customContextObject = PlayerModifierSummonWatchApplyModifiers.createContextObject([ModifierProvoke.createContextObject(), statBuffContextObject], "gain +1/+1 and Provoke")
      customContextObject.durationEndTurn = 1
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitApplyPlayerModifiers.createContextObjectToTargetOwnPlayer([customContextObject], false, "Other minions you summon this turn gain +1/+1 and Provoke"),
        ModifierProvoke.createContextObject()
      ])
      card.rarityId = Rarity.Legendary

    if (identifier == Cards.Neutral.Moebius)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_moebius_name")
      card.setDescription(i18next.t("cards.neutral_moebius_desc"))
      card.setFXResource(["FX.Cards.Neutral.Moebius"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_spell_entropicdecay.audio
        receiveDamage : RSX.sfx_f3_dunecaster_hit.audio
        attackDamage : RSX.sfx_f3_dunecaster_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMoebiusBreathing.name
        idle : RSX.neutralMoebiusIdle.name
        walk : RSX.neutralMoebiusRun.name
        attack : RSX.neutralMoebiusAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralMoebiusHit.name
        death : RSX.neutralMoebiusDeath.name
      )
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierStartTurnWatchSwapStats.createContextObject()])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Neutral.HankHart)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_captain_hank_hart_name")
      card.setDescription(i18next.t("cards.neutral_captain_hank_hart_desc"))
      card.setFXResource(["FX.Cards.Neutral.HankHart"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_valehunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_alcuinloremaster_hit.audio
        attackDamage : RSX.sfx_neutral_alcuinloremaster_attack_impact.audio
        death : RSX.sfx_neutral_arcanelimiter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralCaptainHartBreathing.name
        idle : RSX.neutralCaptainHartIdle.name
        walk : RSX.neutralCaptainHartRun.name
        attack : RSX.neutralCaptainHartAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.neutralCaptainHartHit.name
        death : RSX.neutralCaptainHartDeath.name
      )
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject(), ModifierHealSelfWhenDealingDamage.createContextObject()])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Neutral.Rook)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_rook_name")
      card.setDescription(i18next.t("cards.neutral_rook_desc"))
      card.setBoundingBoxWidth(120)
      card.setBoundingBoxHeight(120)
      card.setFXResource(["FX.Cards.Neutral.Rook"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_rook_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_rook_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRookBreathing.name
        idle : RSX.neutralRookIdle.name
        walk : RSX.neutralRookRun.name
        attack : RSX.neutralRookAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralRookHit.name
        death : RSX.neutralRookDeath.name
      )
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierRook.createContextObject()])

    if (identifier == Cards.Neutral.Purgatos)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_purgatos_name")
      card.setDescription(i18next.t("cards.neutral_purgatos_desc"))
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
        breathing : RSX.neutralPurgatosBreathing.name
        idle : RSX.neutralPurgatosIdle.name
        walk : RSX.neutralPurgatosRun.name
        attack : RSX.neutralPurgatosAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralPurgatosHit.name
        death : RSX.neutralPurgatosDeath.name
      )
      card.atk = 3
      card.maxHP = 5
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierDealDamageWatchHealorDamageGeneral.createContextObject(3)])
      card.rarityId = Rarity.Epic

    if (identifier == Cards.Neutral.Songweaver)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_songweaver_name")
      card.setDescription(i18next.t("cards.neutral_songweaver_desc"))
      card.setFXResource(["FX.Cards.Neutral.Songweaver"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_songweaver_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_pandora_hit.audio
        attackDamage : RSX.sfx_neutral_songweaver_attack_impact.audio
        death : RSX.sfx_neutral_songweaver_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSongweaverBreathing.name
        idle : RSX.neutralSongweaverIdle.name
        walk : RSX.neutralSongweaverRun.name
        attack : RSX.neutralSongweaverAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralSongweaverHit.name
        death : RSX.neutralSongweaverDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      statBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      statBuffContextObject.appliedName = i18next.t("modifiers.neutral_songweaver_modifier_2")
      card.setFollowups([
        {
          id: Cards.Spell.ApplyModifiers
          spellFilterType: SpellFilterType.AllyDirect
          targetModifiersContextObjects: [
            statBuffContextObject
          ]
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Neutral.Aethermaster)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.raceId = Races.Arcanyst
      card.name = i18next.t("cards.neutral_aethermaster_name")
      card.setDescription(i18next.t("cards.neutral_aethermaster_desc"))
      card.setFXResource(["FX.Cards.Neutral.Aethermaster"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(110)
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_neutral_spelljammer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_spell_lionheartblessing.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralAethermasterBreathing.name
        idle : RSX.neutralAethermasterIdle.name
        walk : RSX.neutralAethermasterRun.name
        attack : RSX.neutralAethermasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralAethermasterHit.name
        death : RSX.neutralAethermasterDeath.name
      )
      card.atk = 1
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Epic
      contextObject = PlayerModifierReplaceCardModifier.createContextObject(1)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "You may replace an additional card each turn")
      ])

    if (identifier == Cards.Neutral.ZenRui)
      card = new Unit(gameSession)
      card.setIsLegacy(true)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_zenrui_name")
      card.setDescription(i18next.t("cards.neutral_zenrui_desc"))
      card.setFXResource(["FX.Cards.Neutral.ZenRui"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bloodtearalchemist_death.audio
        receiveDamage : RSX.sfx_neutral_archonspellbinder_hit.audio
        attackDamage : RSX.sfx_neutral_archonspellbinder_attack_impact.audio
        death : RSX.sfx_neutral_archonspellbinder_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralZenRuiBreathing.name
        idle : RSX.neutralZenRuiIdle.name
        walk : RSX.neutralZenRuiRun.name
        attack : RSX.neutralZenRuiAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralZenRuiHit.name
        death : RSX.neutralZenRuiDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.MindControlByAttackValue
          maxAttack: 2
          _private: {
            followupSourcePattern: CONFIG.PATTERN_3x3
          }
        }
      ])

    if (identifier == Cards.Neutral.EmeraldRejuvenator)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_emerald_rejuvinator_name")
      card.setDescription(i18next.t("cards.neutral_emerald_rejuvinator_desc"))
      card.setFXResource(["FX.Cards.Neutral.EmeraldRejuvenator"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(80)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_emeraldrejuvenator_attack_swing.audio
        receiveDamage : RSX.sfx_f1lysianbrawler_hit.audio
        attackDamage : RSX.sfx_f1lysianbrawler_attack_impact.audio
        death : RSX.sfx_neutral_emeraldrejuvenator_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralEmeraldRejuvenatorBreathing.name
        idle : RSX.neutralEmeraldRejuvenatorIdle.name
        walk : RSX.neutralEmeraldRejuvenatorRun.name
        attack : RSX.neutralEmeraldRejuvenatorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralEmeraldRejuvenatorHit.name
        death : RSX.neutralEmeraldRejuvenatorDeath.name
      )
      card.atk = 4
      card.maxHP = 4
      card.manaCost = 4
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierOpeningGambitHealBothGenerals.createContextObject(4)])

    if (identifier == Cards.Neutral.ZuraelTheLifegiver)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_zurael_the_lifegiver_name")
      card.setDescription(i18next.t("cards.neutral_zurael_the_lifegiver_desc"))
      card.setFXResource(["FX.Cards.Neutral.ZuraelTheLifegiver"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_zurael_death.audio
        attack : RSX.sfx_neutral_zurael_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_zurael_hit.audio
        attackDamage : RSX.sfx_neutral_zurael_attack_impact.audio
        death : RSX.sfx_neutral_zurael_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralZuraelBreathing.name
        idle : RSX.neutralZuraelIdle.name
        walk : RSX.neutralZuraelRun.name
        attack : RSX.neutralZuraelAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralZuraelHit.name
        death : RSX.neutralZuraelDeath.name
      )
      card.atk = 4
      card.maxHP = 7
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierOpeningGambitLifeGive.createContextObject()])

    if (identifier == Cards.Neutral.Paddo)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_paddo_name")
      card.setDescription(i18next.t("cards.neutral_paddo_desc"))
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
        breathing : RSX.neutralPaddoBreathing.name
        idle : RSX.neutralPaddoIdle.name
        walk : RSX.neutralPaddoRun.name
        attack : RSX.neutralPaddoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.6
        damage : RSX.neutralPaddoHit.name
        death : RSX.neutralPaddoDeath.name
      )
      card.atk = 12
      card.maxHP = 6
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierAirdrop.createContextObject(), ModifierOpeningGambitTeleportAllNearby.createContextObject()])

    if (identifier == Cards.Neutral.Necroseer)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_necroseer_name")
      card.setDescription(i18next.t("cards.neutral_necroseer_desc"))
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
        breathing : RSX.neutralTribalCasterBreathing.name
        idle : RSX.neutralTribalCasterIdle.name
        walk : RSX.neutralTribalCasterRun.name
        attack : RSX.neutralTribalCasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralTribalCasterHit.name
        death : RSX.neutralTribalCasterDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      card.manaCost = 5
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierDyingWishDrawCard.createContextObject()])

    if (identifier == Cards.Neutral.Bloodletter)
      card = new Unit(gameSession)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_bloodletter_name")
      card.setDescription(i18next.t("cards.neutral_bloodletter_desc"))
      card.setFXResource(["FX.Cards.Neutral.Bloodletter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_bluetipscorpion_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_bluetipscorpion_hit.audio
        attackDamage : RSX.sfx_neutral_bluetipscorpion_attack_impact.audio
        death : RSX.sfx_neutral_bluetipscorpion_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMercMelee03Breathing.name
        idle : RSX.neutralMercMelee03Idle.name
        walk : RSX.neutralMercMelee03Run.name
        attack : RSX.neutralMercMelee03Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralMercMelee03Damage.name
        death : RSX.neutralMercMelee03Death.name
      )
      card.atk = 4
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Fixed
      card.setInherentModifiersContextObjects([ModifierDoubleDamageToGenerals.createContextObject()])

    return card

module.exports = CardFactory_CoreSet_Neutral
