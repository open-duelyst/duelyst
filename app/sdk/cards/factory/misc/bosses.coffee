# do not add this file to a package
# it is specifically parsed by the package generation script

_ = require 'underscore'
moment = require 'moment'
i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

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
Artifact = require 'app/sdk/artifacts/artifact'

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellEquipBossArtifacts = require 'app/sdk/spells/spellEquipBossArtifacts'
SpellLaceratingFrost = require 'app/sdk/spells/spellLaceratingFrost'
SpellEntanglingShadows = require 'app/sdk/spells/spellEntanglingShadows'
SpellMoldingEarth = require 'app/sdk/spells/spellMoldingEarth'
SpellDamageAndSpawnEntitiesNearbyGeneral = require 'app/sdk/spells/spellDamageAndSpawnEntitiesNearbyGeneral'
SpellSilenceAndSpawnEntityNearby = require 'app/sdk/spells/spellSilenceAndSpawnEntityNearby'
SpellRestoringLight = require 'app/sdk/spells/spellRestoringLight'

Modifier = require 'app/sdk/modifiers/modifier'
PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierEndTurnWatchDamageNearbyEnemy = require 'app/sdk/modifiers/modifierEndTurnWatchDamageNearbyEnemy'
ModifierFrenzy = require 'app/sdk/modifiers/modifierFrenzy'
ModifierFlying = require 'app/sdk/modifiers/modifierFlying'
ModifierTranscendance = require 'app/sdk/modifiers/modifierTranscendance'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierRanged = require 'app/sdk/modifiers/modifierRanged'
ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierRebirth = require 'app/sdk/modifiers/modifierRebirth'
ModifierBlastAttack = require 'app/sdk/modifiers/modifierBlastAttack'
ModifierForcefield = require 'app/sdk/modifiers/modifierForcefield'
ModifierStartTurnWatchEquipArtifact = require 'app/sdk/modifiers/modifierStartTurnWatchEquipArtifact'
ModifierTakeDamageWatchSpawnRandomToken = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnRandomToken'
ModifierDealDamageWatchKillTarget = require 'app/sdk/modifiers/modifierDealDamageWatchKillTarget'
ModifierStartTurnWatchPlaySpell = require 'app/sdk/modifiers/modifierStartTurnWatchPlaySpell'
ModifierDealDamageWatchModifyTarget = require 'app/sdk/modifiers/modifierDealDamageWatchModifyTarget'
ModifierStunned = require 'app/sdk/modifiers/modifierStunned'
ModifierStunnedVanar = require 'app/sdk/modifiers/modifierStunnedVanar'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierImmuneToDamage = require 'app/sdk/modifiers/modifierImmuneToDamage'
ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard = require 'app/sdk/modifiers/modifierStartTurnWatchDispelAllEnemyMinionsDrawCard'
ModifierImmuneToSpellsByEnemy = require 'app/sdk/modifiers/modifierImmuneToSpellsByEnemy'
ModifierAbsorbDamageGolems = require 'app/sdk/modifiers/modifierAbsorbDamageGolems'
ModifierExpireApplyModifiers = require 'app/sdk/modifiers/modifierExpireApplyModifiers'
ModifierSecondWind = require 'app/sdk/modifiers/modifierSecondWind'
ModifierKillWatchRespawnEntity = require 'app/sdk/modifiers/modifierKillWatchRespawnEntity'
ModifierOpponentSummonWatchSpawn1HealthClone = require 'app/sdk/modifiers/modifierOpponentSummonWatchSpawn1HealthClone'
ModifierDealOrTakeDamageWatchRandomTeleportOther = require 'app/sdk/modifiers/modifierDealOrTakeDamageWatchRandomTeleportOther'
ModifierMyAttackOrAttackedWatchSpawnMinionNearby = require 'app/sdk/modifiers/modifierMyAttackOrAttackedWatchSpawnMinionNearby'
ModifierEndTurnWatchTeleportCorner = require 'app/sdk/modifiers/modifierEndTurnWatchTeleportCorner'
ModifierBackstab = require 'app/sdk/modifiers/modifierBackstab'
ModifierDieSpawnNewGeneral = require 'app/sdk/modifiers/modifierDieSpawnNewGeneral'
ModifierKillWatchRefreshExhaustion = require 'app/sdk/modifiers/modifierKillWatchRefreshExhaustion'
ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies = require 'app/sdk/modifiers/modifierEndTurnWatchDealDamageToSelfAndNearbyEnemies'
ModifierDispelAreaAttack = require 'app/sdk/modifiers/modifierDispelAreaAttack'
ModifierSelfDamageAreaAttack = require 'app/sdk/modifiers/modifierSelfDamageAreaAttack'
ModifierMyMinionOrGeneralDamagedWatchBuffSelf = require 'app/sdk/modifiers/modifierMyMinionOrGeneralDamagedWatchBuffSelf'
ModifierSummonWatchNearbyAnyPlayerApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchNearbyAnyPlayerApplyModifiers'
ModifierOpponentSummonWatchOpponentDrawCard = require 'app/sdk/modifiers/modifierOpponentSummonWatchOpponentDrawCard'
ModifierOpponentDrawCardWatchOverdrawSummonEntity = require 'app/sdk/modifiers/modifierOpponentDrawCardWatchOverdrawSummonEntity'
ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana = require 'app/sdk/modifiers/modifierEndTurnWatchDamagePlayerBasedOnRemainingMana'
ModifierHPThresholdGainModifiers = require 'app/sdk/modifiers/modifierHPThresholdGainModifiers'
ModifierHealSelfWhenDealingDamage = require 'app/sdk/modifiers/modifierHealSelfWhenDealingDamage'
ModifierExtraDamageOnCounterattack = require 'app/sdk/modifiers/modifierExtraDamageOnCounterattack'
ModifierOnOpponentDeathWatchSpawnEntityOnSpace = require 'app/sdk/modifiers/modifierOnOpponentDeathWatchSpawnEntityOnSpace'
ModifierDyingWishSpawnEgg = require 'app/sdk/modifiers/modifierDyingWishSpawnEgg'
ModifierSummonWatchFromActionBarApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarApplyModifiers'
ModifierGrowPermanent = require 'app/sdk/modifiers/modifierGrowPermanent'
ModifierTakeDamageWatchSpawnWraithlings = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnWraithlings'
ModifierTakeDamageWatchDamageAttacker = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageAttacker'
ModifierAbsorbDamage = require 'app/sdk/modifiers/modifierAbsorbDamage'
ModifierDyingWishDamageNearbyEnemies = require 'app/sdk/modifiers/modifierDyingWishDamageNearbyEnemies'
ModifierStartTurnWatchTeleportRandomSpace = require 'app/sdk/modifiers/modifierStartTurnWatchTeleportRandomSpace'
ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarAnyPlayerApplyModifiers'
ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned = require 'app/sdk/modifiers/modifierStartTurnWatchDamageGeneralEqualToMinionsOwned'
ModifierDeathWatchDamageEnemyGeneralHealMyGeneral = require 'app/sdk/modifiers/modifierDeathWatchDamageEnemyGeneralHealMyGeneral'
ModifierRangedProvoke = require 'app/sdk/modifiers/modifierRangedProvoke'
ModifierHPChangeSummonEntity = require 'app/sdk/modifiers/modifierHPChangeSummonEntity'
ModifierStartTurnWatchDamageAndBuffSelf = require 'app/sdk/modifiers/modifierStartTurnWatchDamageAndBuffSelf'
ModifierEnemyTeamMoveWatchSummonEntityBehind = require 'app/sdk/modifiers/modifierEnemyTeamMoveWatchSummonEntityBehind'
ModifierMyTeamMoveWatchBuffTarget = require 'app/sdk/modifiers/modifierMyTeamMoveWatchAnyReasonBuffTarget'
ModifierDyingWishLoseGame = require 'app/sdk/modifiers/modifierDyingWishLoseGame'
ModifierAttacksDamageAllEnemyMinions = require 'app/sdk/modifiers/modifierAttacksDamageAllEnemyMinions'
ModifierSummonWatchAnyPlayerApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchAnyPlayerApplyModifiers'
ModifierDoubleDamageToGenerals = require 'app/sdk/modifiers/modifierDoubleDamageToGenerals'
ModifierATKThresholdDie = require 'app/sdk/modifiers/modifierATKThresholdDie'
ModifierDeathWatchDamageRandomMinionHealMyGeneral = require 'app/sdk/modifiers/modifierDeathWatchDamageRandomMinionHealMyGeneral'
ModifierStartTurnWatchSpawnTile = require 'app/sdk/modifiers/modifierStartTurnWatchSpawnTile'
ModifierStartTurnWatchSpawnEntity = require 'app/sdk/modifiers/modifierStartTurnWatchSpawnEntity'
ModifierEndTurnWatchGainTempBuff = require 'app/sdk/modifiers/modifierEndTurnWatchGainTempBuff'
ModifierSentinel = require 'app/sdk/modifiers/modifierSentinel'
ModifierSentinelSetup = require 'app/sdk/modifiers/modifierSentinelSetup'
ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard = require 'app/sdk/modifiers/modifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard'
ModifierSentinelOpponentSummonBuffItDrawCard = require 'app/sdk/modifiers/modifierSentinelOpponentSummonBuffItDrawCard'
ModifierSentinelOpponentSpellCastRefundManaDrawCard = require 'app/sdk/modifiers/modifierSentinelOpponentSpellCastRefundManaDrawCard'
ModifierTakeDamageWatchSpawnRandomHaunt = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnRandomHaunt'
ModifierDyingWishDrawCard = require "app/sdk/modifiers/modifierDyingWishDrawCard"
ModifierCannotAttackGeneral = require 'app/sdk/modifiers/modifierCannotAttackGeneral'
ModifierCannotCastBBS = require 'app/sdk/modifiers/modifierCannotCastBBS'
ModifierStartTurnWatchPutCardInOpponentsHand = require 'app/sdk/modifiers/modifierStartTurnWatchPutCardInOpponentsHand'
ModifierEndTurnWatchHealSelf = require 'app/sdk/modifiers/modifierEndTurnWatchHealSelf'
ModifierBackupGeneral = require 'app/sdk/modifiers/modifierBackupGeneral'
ModifierStartTurnWatchRespawnClones = require 'app/sdk/modifiers/modifierStartTurnWatchRespawnClones'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierSwitchAllegiancesGainAttack = require 'app/sdk/modifiers/modifierSwitchAllegiancesGainAttack'
ModifierOpponentSummonWatchRandomTransform = require 'app/sdk/modifiers/modifierOpponentSummonWatchRandomTransform'
ModifierOnSpawnKillMyGeneral = require 'app/sdk/modifiers/modifierOnSpawnKillMyGeneral'
ModifierDeathWatchGainAttackEqualToEnemyAttack = require 'app/sdk/modifiers/modifierDeathWatchGainAttackEqualToEnemyAttack'
ModifierDyingWishBuffEnemyGeneral = require 'app/sdk/modifiers/modifierDyingWishBuffEnemyGeneral'
ModifierStartTurnWatchDamageRandom = require 'app/sdk/modifiers/modifierStartTurnWatchDamageRandom'
ModifierOpponentSummonWatchSwapGeneral = require 'app/sdk/modifiers/modifierOpponentSummonWatchSwapGeneral'
ModifierDyingWishPutCardInOpponentHand = require 'app/sdk/modifiers/modifierDyingWishPutCardInOpponentHand'
ModifierEnemySpellWatchGainRandomKeyword = require 'app/sdk/modifiers/modifierEnemySpellWatchGainRandomKeyword'
ModifierAnySummonWatchGainGeneralKeywords = require 'app/sdk/modifiers/modifierAnySummonWatchGainGeneralKeywords'

PlayerModifierSummonWatchApplyModifiers = require 'app/sdk/playerModifiers/playerModifierSummonWatchApplyModifiers'
PlayerModifierOpponentSummonWatchSwapGeneral = require 'app/sdk/playerModifiers/playerModifierOpponentSummonWatchSwapGeneral'

class CardFactory_Bosses

  ###*
  * Returns a card that matches the identifier.
  * @param {Number|String} identifier
  * @param {GameSession} gameSession
  * @returns {Card}
  ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Boss.Boss1)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_1_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_1_bio"))
      card.setDescription(i18next.t("boss_battles.boss_1_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_boreal_juggernaut)
      card.setPortraitResource(RSX.speech_portrait_boreal_juggernaut)
      card.setPortraitHexResource(RSX.boss_boreal_juggernaut_hex_portrait)
      card.setConceptResource(RSX.boss_boreal_juggernaut_versus_portrait)
      card.setBoundingBoxWidth(120)
      card.setBoundingBoxHeight(95)
      card.setFXResource(["FX.Cards.Faction5.Dreadnaught"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_silitharveteran_death.audio
        attack : RSX.sfx_neutral_rook_attack_impact.audio
        receiveDamage : RSX.sfx_neutral_makantorwarbeast_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_makantorwarbeast_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossBorealJuggernautBreathing.name
        idle : RSX.bossBorealJuggernautIdle.name
        walk : RSX.bossBorealJuggernautRun.name
        attack : RSX.bossBorealJuggernautAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossBorealJuggernautHit.name
        death : RSX.bossBorealJuggernautDeath.name
      )
      card.atk = 5
      card.speed = 1
      card.maxHP = 40
      frenzyContextObject = ModifierFrenzy.createContextObject()
      frenzyContextObject.isRemovable = false
      card.addKeywordClassToInclude(ModifierStunned)
      stunContextObject = ModifierDealDamageWatchModifyTarget.createContextObject([ModifierStunnedVanar.createContextObject()], "it is STUNNED",{
        name: "Winterblade"
        description: "Enemy minions damaged by your General are Stunned"
      })
      stunContextObject.isRemovable = false
      #startTurnCastFrostburnObject = ModifierStartTurnWatchPlaySpell.createContextObject({id: Cards.Spell.Frostburn, manaCost: 0}, "Frostburn")
      #startTurnCastFrostburnObject.isRemovable = false
      card.setInherentModifiersContextObjects([frenzyContextObject, stunContextObject])
      card.signatureCardData = {id: Cards.BossSpell.LaceratingFrost}

    if (identifier == Cards.Boss.Boss2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_2_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_2_bio"))
      card.setDescription(i18next.t("boss_battles.boss_2_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_umbra)
      card.setPortraitResource(RSX.speech_portrait_umbra)
      card.setPortraitHexResource(RSX.boss_umbra_hex_portrait)
      #card.setConceptResource(RSX.boss_boreal_juggernaut_versus_portrait)
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(75)
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
        breathing : RSX.bossUmbraBreathing.name
        idle : RSX.bossUmbraIdle.name
        walk : RSX.bossUmbraRun.name
        attack : RSX.bossUmbraAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.25
        damage : RSX.bossUmbraHit.name
        death : RSX.bossUmbraDeath.name
      )
      card.atk = 2
      card.maxHP = 30
      modifierSpawnClone = ModifierOpponentSummonWatchSpawn1HealthClone.createContextObject("a 1 health clone")
      modifierSpawnClone.isRemovable = false
      card.setInherentModifiersContextObjects([modifierSpawnClone])
      card.signatureCardData = {id: Cards.BossSpell.MoldingEarth}

    if (identifier == Cards.Boss.Boss3)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_3_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_3_bio"))
      card.setDescription(i18next.t("boss_battles.boss_3_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_calibero)
      card.setPortraitResource(RSX.speech_portrait_calibero)
      card.setPortraitHexResource(RSX.boss_calibero_hex_portrait)
      card.setConceptResource(RSX.boss_calibero_versus_portrait)
      card.setFXResource(["FX.Cards.Faction1.CaliberO"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_neutral_chaoselemental_attack_impact.audio
        death : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1CaliberOBreathing.name
        idle : RSX.f1CaliberOIdle.name
        walk : RSX.f1CaliberORun.name
        attack : RSX.f1CaliberOAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.4
        damage : RSX.f1CaliberODamage.name
        death : RSX.f1CaliberODeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 2
      card.maxHP = 30
      forceFieldObject = ModifierForcefield.createContextObject()
      forceFieldObject.isRemovable = false
      excludedArtifacts = [
        Cards.Artifact.Spinecleaver,
        Cards.Artifact.IndomitableWill
      ]
      equipArtifactObject = ModifierStartTurnWatchEquipArtifact.createContextObject(1, excludedArtifacts)
      equipArtifactObject.isRemovable = false
      card.setInherentModifiersContextObjects([
        forceFieldObject,
        equipArtifactObject
      ])
      card.signatureCardData = {id: Cards.BossSpell.RestoringLight}

    if (identifier == Cards.Boss.QABoss3)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = "QA-IBERO"
      card.manaCost = 0
      card.setBossBattleDescription("A Dev Boss for quickly testing flow.")
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_calibero)
      card.setPortraitResource(RSX.speech_portrait_calibero)
      card.setPortraitHexResource(RSX.boss_calibero_hex_portrait)
      card.setConceptResource(RSX.boss_calibero_versus_portrait)
      card.setFXResource(["FX.Cards.Faction1.CaliberO"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_neutral_chaoselemental_attack_impact.audio
        death : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1CaliberOBreathing.name
        idle : RSX.f1CaliberOIdle.name
        walk : RSX.f1CaliberORun.name
        attack : RSX.f1CaliberOAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.4
        damage : RSX.f1CaliberODamage.name
        death : RSX.f1CaliberODeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 2
      card.maxHP = 1
      forceFieldObject = ModifierForcefield.createContextObject()
      forceFieldObject.isRemovable = false
      excludedArtifacts = [
        Cards.Artifact.Spinecleaver,
        Cards.Artifact.IndomitableWill
      ]
      equipArtifactObject = ModifierStartTurnWatchEquipArtifact.createContextObject(1, excludedArtifacts)
      equipArtifactObject.isRemovable = false
      card.setInherentModifiersContextObjects([
        equipArtifactObject
      ])

    if (identifier == Cards.Boss.Boss4)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_4_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_4_bio"))
      card.setDescription(i18next.t("boss_battles.boss_4_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_chaos_knight)
      card.setPortraitResource(RSX.speech_portrait_chaos_knight)
      card.setPortraitHexResource(RSX.boss_chaos_knight_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.Ironclad"])
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
        breathing : RSX.bossChaosKnightBreathing.name
        idle : RSX.bossChaosKnightIdle.name
        walk : RSX.bossChaosKnightRun.name
        attack : RSX.bossChaosKnightAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.bossChaosKnightHit.name
        death : RSX.bossChaosKnightDeath.name
      )
      card.atk = 3
      card.maxHP = 35
      frenzyContextObject = ModifierFrenzy.createContextObject()
      frenzyContextObject.isRemovable = false
      dealOrTakeDamageRandomTeleportObject = ModifierDealOrTakeDamageWatchRandomTeleportOther.createContextObject()
      dealOrTakeDamageRandomTeleportObject.isRemovable = false
      card.setInherentModifiersContextObjects([frenzyContextObject, dealOrTakeDamageRandomTeleportObject])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss5)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_5_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_5_bio"))
      card.setDescription(i18next.t("boss_battles.boss_5_desc"))
      card.setBossBattleBattleMapIndex(4)
      card.setSpeechResource(RSX.speech_portrait_shinkage_zendo)
      card.setPortraitResource(RSX.speech_portrait_shinkage_zendo)
      card.setPortraitHexResource(RSX.boss_shinkage_zendo_hex_portrait)
      card.setConceptResource(RSX.boss_shinkage_zendo_versus_portrait)
      card.setFXResource(["FX.Cards.Faction2.GrandmasterZendo"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_3.audio
        attack : RSX.sfx_spell_darkseed.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_neutral_daggerkiri_attack_swing.audio
        death : RSX.sfx_neutral_prophetofthewhite_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossShinkageZendoBreathing.name
        idle : RSX.bossShinkageZendoIdle.name
        walk : RSX.bossShinkageZendoRun.name
        attack : RSX.bossShinkageZendoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.4
        damage : RSX.bossShinkageZendoHit.name
        death : RSX.bossShinkageZendoDeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 6
      card.maxHP = 20
      card.speed = 0
      immunityContextObject = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([ModifierImmuneToDamage.createContextObject()], i18next.t("modifiers.boss_5_applied_desc"))
      immunityContextObject.appliedName = i18next.t("modifiers.boss_5_applied_name")
      applyGeneralImmunityContextObject = Modifier.createContextObjectWithAuraForAllAllies([immunityContextObject], null, null, null, "Cannot be damaged while friendly minions live")
      applyGeneralImmunityContextObject.isRemovable = false
      applyGeneralImmunityContextObject.isHiddenToUI = true
      zendoBattlePetContextObject = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([ModifierBattlePet.createContextObject()], "The enemy General moves and attacks as if they are a Battle Pet")
      #zendoBattlePetContextObject = Modifier.createContextObjectWithOnBoardAuraForAllEnemies([ModifierBattlePet.createContextObject()], "All enemies move and attack as if they are Battle Pets")
      zendoBattlePetContextObject.isRemovable = false
      card.setInherentModifiersContextObjects([applyGeneralImmunityContextObject, zendoBattlePetContextObject])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss6)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_6_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_6_bio"))
      card.setDescription(i18next.t("boss_battles.boss_6_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_decepticle)
      card.setPortraitResource(RSX.speech_portrait_decepticle)
      card.setPortraitHexResource(RSX.boss_decepticle_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.Mechaz0rHelm"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_wingsmechaz0r_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_wingsmechaz0r_hit.audio
        attackDamage : RSX.sfx_neutral_wingsmechaz0r_impact.audio
        death : RSX.sfx_neutral_wingsmechaz0r_hit.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossDecepticleBreathing.name
        idle : RSX.bossDecepticleIdle.name
        walk : RSX.bossDecepticleRun.name
        attack : RSX.bossDecepticleAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossDecepticleHit.name
        death : RSX.bossDecepticleDeath.name
      )
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(50)
      card.atk = 2
      card.maxHP = 1
      immunityContextObject = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([ModifierImmuneToDamage.createContextObject()], "Decepticle cannot be damaged while this minion lives.")
      immunityContextObject.appliedName = i18next.t("modifiers.boss_6_applied_name")
      mechs = [
        Cards.Boss.Boss6Wings,
        Cards.Boss.Boss6Chassis,
        Cards.Boss.Boss6Sword,
        Cards.Boss.Boss6Helm
      ]
      applyGeneralImmunityContextObject = Modifier.createContextObjectWithAuraForAllAllies([immunityContextObject], null, mechs, null, "Cannot be damaged while other D3cepticle parts live")
      applyGeneralImmunityContextObject.isRemovable = false
      applyGeneralImmunityContextObject.isHiddenToUI = false
      provokeObject = ModifierProvoke.createContextObject()
      provokeObject.isRemovable = false
      spawnPrimeBoss = ModifierDieSpawnNewGeneral.createContextObject({id: Cards.Boss.Boss6Prime})
      spawnPrimeBoss.isRemovable = false
      spawnPrimeBoss.isHiddenToUI = true
      card.setInherentModifiersContextObjects([applyGeneralImmunityContextObject, provokeObject, spawnPrimeBoss])
      #card.setInherentModifiersContextObjects([provokeObject, spawnPrimeBoss])
      card.signatureCardData = {id: Cards.BossSpell.AncientKnowledge}

    if (identifier == Cards.Boss.Boss6Wings)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_6_part1_name")
      card.setDescription(i18next.t("boss_battles.boss_6_part1_desc"))
      card.manaCost = 0
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
        breathing : RSX.bossDecepticleWingsBreathing.name
        idle : RSX.bossDecepticleWingsIdle.name
        walk : RSX.bossDecepticleWingsRun.name
        attack : RSX.bossDecepticleWingsAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.bossDecepticleWingsHit.name
        death : RSX.bossDecepticleWingsDeath.name
      )
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(50)
      card.atk = 2
      card.maxHP = 3
      flyingObject = ModifierFlying.createContextObject()
      flyingObject.isRemovable = false
      card.setInherentModifiersContextObjects([flyingObject])

    if (identifier == Cards.Boss.Boss6Chassis)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_6_part2_name")
      card.setDescription(i18next.t("boss_battles.boss_6_part2_desc"))
      card.manaCost = 0
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
        breathing : RSX.bossDecepticleChassisBreathing.name
        idle : RSX.bossDecepticleChassisIdle.name
        walk : RSX.bossDecepticleChassisRun.name
        attack : RSX.bossDecepticleChassisAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.5
        damage : RSX.bossDecepticleChassisHit.name
        death : RSX.bossDecepticleChassisDeath.name
      )
      card.atk = 5
      card.maxHP = 4
      forceFieldObject = ModifierForcefield.createContextObject()
      forceFieldObject.isRemovable = false
      card.setInherentModifiersContextObjects([forceFieldObject])

    if (identifier == Cards.Boss.Boss6Sword)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_6_part3_name")
      card.setDescription(i18next.t("boss_battles.boss_6_part3_desc"))
      card.manaCost = 0
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
        breathing : RSX.bossDecepticleSwordBreathing.name
        idle : RSX.bossDecepticleSwordIdle.name
        walk : RSX.bossDecepticleSwordRun.name
        attack : RSX.bossDecepticleSwordAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.bossDecepticleSwordHit.name
        death : RSX.bossDecepticleSwordDeath.name
      )
      card.atk = 4
      card.maxHP = 2
      backstabObject = ModifierBackstab.createContextObject(2)
      backstabObject.isRemovable = false
      card.setInherentModifiersContextObjects([backstabObject])

    if (identifier == Cards.Boss.Boss6Helm)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_6_part4_name")
      card.setDescription(i18next.t("boss_battles.boss_6_part4_desc"))
      card.manaCost = 0
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
        breathing : RSX.bossDecepticleHelmBreathing.name
        idle : RSX.bossDecepticleHelmIdle.name
        walk : RSX.bossDecepticleHelmRun.name
        attack : RSX.bossDecepticleHelmAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.bossDecepticleHelmHit.name
        death : RSX.bossDecepticleHelmDeath.name
      )
      card.atk = 3
      card.maxHP = 3
      celerityObject = ModifierTranscendance.createContextObject()
      celerityObject.isRemovable = false
      card.setInherentModifiersContextObjects([celerityObject])

    if (identifier == Cards.Boss.Boss6Prime)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      #card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_6_prime_name")
      card.setDescription(i18next.t("boss_battles.boss_6_prime_desc"))
      card.manaCost = 0
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
        breathing : RSX.bossDecepticlePrimeBreathing.name
        idle : RSX.bossDecepticlePrimeIdle.name
        walk : RSX.bossDecepticlePrimeRun.name
        attack : RSX.bossDecepticlePrimeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossDecepticlePrimeHit.name
        death : RSX.bossDecepticlePrimeDeath.name
      )
      card.atk = 4
      card.maxHP = 16
      celerityObject = ModifierTranscendance.createContextObject()
      celerityObject.isRemovable = false
      backstabObject = ModifierBackstab.createContextObject(2)
      backstabObject.isRemovable = false
      forceFieldObject = ModifierForcefield.createContextObject()
      forceFieldObject.isRemovable = false
      flyingObject = ModifierFlying.createContextObject()
      flyingObject.isRemovable = false
      provokeObject = ModifierProvoke.createContextObject()
      provokeObject.isRemovable = false
      card.setInherentModifiersContextObjects([celerityObject, backstabObject, forceFieldObject, flyingObject, provokeObject])

    if (identifier == Cards.Boss.Boss7)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_7_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_7_bio"))
      card.setDescription(i18next.t("boss_battles.boss_7_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_calibero)
      card.setPortraitResource(RSX.speech_portrait_calibero)
      card.setPortraitHexResource(RSX.boss_calibero_hex_portrait)
      card.setConceptResource(RSX.boss_calibero_versus_portrait)
      card.setFXResource(["FX.Cards.Faction1.CaliberO"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_neutral_chaoselemental_attack_impact.audio
        death : RSX.sfx_spell_darkfiresacrifice.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f1CaliberOBreathing.name
        idle : RSX.f1CaliberOIdle.name
        walk : RSX.f1CaliberORun.name
        attack : RSX.f1CaliberOAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.4
        damage : RSX.f1CaliberODamage.name
        death : RSX.f1CaliberODeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 2
      card.maxHP = 20
      includedArtifacts = [
        {id: Cards.Artifact.SunstoneBracers},
        {id: Cards.Artifact.ArclyteRegalia},
        {id: Cards.Artifact.StaffOfYKir}
      ]
      equipArtifactObject = ModifierStartTurnWatchEquipArtifact.createContextObject(1, includedArtifacts)
      equipArtifactObject.isRemovable = false
      equipArtifactFirstTurn = ModifierExpireApplyModifiers.createContextObject([equipArtifactObject], 0, 1, true, true, false, 0, true, "At the start of your second turn and every turn thereafter, equip a random artifact")
      equipArtifactFirstTurn.isRemovable = false
      card.setInherentModifiersContextObjects([
        equipArtifactFirstTurn
      ])
      card.signatureCardData = {id: Cards.BossSpell.RestoringLight}

    if (identifier == Cards.BossArtifact.CycloneGenerator)
      card = new Artifact(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossArtifact.DanceOfSteel
      card.name = i18next.t("boss_battles.boss_7_artifact_name")
      card.setDescription(i18next.t("boss_battles.boss_7_artifact_desc"))
      card.addKeywordClassToInclude(ModifierTranscendance)
      card.manaCost = 0
      card.setBossBattleDescription("__Boss Battle Description")
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierTranscendance.createContextObject({
          type: "ModifierTranscendance"
          name: "Cyclone Generator"
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.IndomitableWill"])
      card.setBaseAnimResource(
        idle: RSX.iconSkywindGlaivesIdle.name
        active: RSX.iconSkywindGlaivesActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Boss.Boss8)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_8_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_8_bio"))
      card.setDescription(i18next.t("boss_battles.boss_8_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_portal_guardian)
      card.setPortraitResource(RSX.speech_portrait_portal_guardian)
      card.setPortraitHexResource(RSX.boss_portal_guardian_hex_portrait)
      card.setConceptResource(RSX.boss_portal_guardian_versus_portrait)
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMysteryBreathing.name
        idle : RSX.neutralMysteryIdle.name
        walk : RSX.neutralMysteryRun.name
        attack : RSX.neutralMysteryAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralMysteryHit.name
        death : RSX.neutralMysteryDeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 2
      card.maxHP = 15
      respawnKilledEnemy = ModifierKillWatchRespawnEntity.createContextObject()
      respawnKilledEnemy.isRemovable = false
      secondWind = ModifierSecondWind.createContextObject(2, 5, false, "Awakened", "Failure prevented. Strength renewed. Systems adapted.")
      secondWind.isRemovable = false
      secondWind.isHiddenToUI = true
      card.setInherentModifiersContextObjects([respawnKilledEnemy, secondWind])
      card.signatureCardData = {id: Cards.BossSpell.EtherealWind}

    if (identifier == Cards.Boss.Boss9)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_9_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_9_bio"))
      card.setDescription(i18next.t("boss_battles.boss_9_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_wujin)
      card.setPortraitResource(RSX.speech_portrait_wujin)
      card.setPortraitHexResource(RSX.boss_wujin_hex_portrait)
      #card.setConceptResource(RSX.boss_boreal_juggernaut_versus_portrait)
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_f1_oserix_death.audio
        attack : RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_death.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossWujinBreathing.name
        idle : RSX.bossWujinIdle.name
        walk : RSX.bossWujinRun.name
        attack : RSX.bossWujinAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossWujinHit.name
        death : RSX.bossWujinDeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 3
      card.maxHP = 30
      spawnCloneObject = ModifierMyAttackOrAttackedWatchSpawnMinionNearby.createContextObject({id: Cards.Boss.Boss9Clone}, "a decoy")
      spawnCloneObject.isRemovable = false
      flyingObject = ModifierFlying.createContextObject()
      flyingObject.isRemovable = false
      teleportCornerObject = ModifierEndTurnWatchTeleportCorner.createContextObject()
      teleportCornerObject.isRemovable = false
      card.setInherentModifiersContextObjects([flyingObject, spawnCloneObject, teleportCornerObject])
      card.signatureCardData = {id: Cards.BossSpell.LivingFlame}

    if (identifier == Cards.Boss.Boss9Clone)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_9_clone_name")
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_f1_oserix_death.audio
        attack : RSX.sfx_neutral_firestarter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_prophetofthewhite_death.audio
        death : RSX.sfx_neutral_daggerkiri_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossWujinBreathing.name
        idle : RSX.bossWujinIdle.name
        walk : RSX.bossWujinRun.name
        attack : RSX.bossWujinAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossWujinHit.name
        death : RSX.bossWujinDeath.name
      )
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(120)
      card.atk = 1
      card.maxHP = 5
      provokeObject = ModifierProvoke.createContextObject()
      #provokeObject.isRemovable = false
      card.setInherentModifiersContextObjects([provokeObject])

    if (identifier == Cards.Boss.Boss10)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_10_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_10_bio"))
      card.setDescription(i18next.t("boss_battles.boss_10_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_solfist)
      card.setPortraitResource(RSX.speech_portrait_solfist)
      card.setPortraitHexResource(RSX.boss_solfist_hex_portrait)
      #card.setConceptResource(RSX.boss_boreal_juggernaut_versus_portrait)
      card.setFXResource(["FX.Cards.Neutral.WarTalon"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossSolfistBreathing.name
        idle : RSX.bossSolfistIdle.name
        walk : RSX.bossSolfistRun.name
        attack : RSX.bossSolfistAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossSolfistHit.name
        death : RSX.bossSolfistDeath.name
      )
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(95)
      card.atk = 3
      card.maxHP = 35
      killWatchRefreshObject = ModifierKillWatchRefreshExhaustion.createContextObject(true, false)
      killWatchRefreshObject.isRemovable = false
      #killWatchRefreshObject.description = "Whenever Solfist destroys a minion, reactivate it."
      modifierDamageSelfAndNearby = ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies.createContextObject()
      modifierDamageSelfAndNearby.isRemovable = false
      #modifierDamageSelfAndNearby.description = "At the end of Solfist's turn, deal 1 damage to self and all nearby enemies."
      card.setInherentModifiersContextObjects([killWatchRefreshObject, modifierDamageSelfAndNearby])
      card.signatureCardData = {id: Cards.BossSpell.LivingFlame}

    if (identifier == Cards.Boss.Boss11)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.raceId = Races.Golem
      card.name = i18next.t("boss_battles.boss_11_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_11_bio"))
      card.setDescription(i18next.t("boss_battles.boss_11_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_nullifier)
      card.setPortraitResource(RSX.speech_portrait_nullifier)
      card.setPortraitHexResource(RSX.boss_nullifier_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.EMP"])
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
        breathing : RSX.bossEMPBreathing.name
        idle : RSX.bossEMPIdle.name
        walk : RSX.bossEMPRun.name
        attack : RSX.bossEMPAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.7
        damage : RSX.bossEMPHit.name
        death : RSX.bossEMPDeath.name
      )
      card.atk = 3
      card.maxHP = 60
      modifierSelfDamageAreaAttack = ModifierSelfDamageAreaAttack.createContextObject()
      modifierSelfDamageAreaAttack.isRemovable = false
      rangedModifier = ModifierRanged.createContextObject()
      rangedModifier.isRemovable = false
      card.setInherentModifiersContextObjects([rangedModifier, modifierSelfDamageAreaAttack])
      card.signatureCardData = {id: Cards.BossSpell.RestoringLight}

    if (identifier == Cards.Boss.Boss12)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_12_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_12_bio"))
      card.setDescription(i18next.t("boss_battles.boss_12_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_orias)
      card.setPortraitResource(RSX.speech_portrait_orias)
      card.setPortraitHexResource(RSX.boss_orias_hex_portrait)
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
        breathing : RSX.bossOriasBreathing.name
        idle : RSX.bossOriasIdle.name
        walk : RSX.bossOriasRun.name
        attack : RSX.bossOriasAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossOriasHit.name
        death : RSX.bossOriasDeath.name
      )
      card.atk = 0
      card.maxHP = 35
      modifierDamageWatchBuffSelf = ModifierMyMinionOrGeneralDamagedWatchBuffSelf.createContextObject(1, 0)
      modifierDamageWatchBuffSelf.isRemovable = false
      card.setInherentModifiersContextObjects([modifierDamageWatchBuffSelf])
      card.signatureCardData = {id: Cards.BossSpell.MoldingEarth}

    if (identifier == Cards.Boss.Boss12Idol)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_12_idol_name")
      card.setDescription(i18next.t("boss_battles.boss_12_idol_desc"))
      card.manaCost = 0
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
        breathing : RSX.bossOriasIdolBreathing.name
        idle : RSX.bossOriasIdolIdle.name
        walk : RSX.bossOriasIdolIdle.name
        attack : RSX.bossOriasIdolAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossOriasIdolHit.name
        death : RSX.bossOriasIdolDeath.name
      )
      card.atk = 0
      card.maxHP = 6
      card.speed = 0
      rushContextObject = ModifierFirstBlood.createContextObject()
      modifierSummonNearbyRush = ModifierSummonWatchNearbyAnyPlayerApplyModifiers.createContextObject([rushContextObject], "gains Rush")
      card.setInherentModifiersContextObjects([modifierSummonNearbyRush])

    if (identifier == Cards.Boss.Boss13)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_13_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_13_bio"))
      card.setDescription(i18next.t("boss_battles.boss_13_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_malyk)
      card.setPortraitResource(RSX.speech_portrait_malyk)
      card.setPortraitHexResource(RSX.boss_malyk_hex_portrait)
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
        breathing : RSX.bossMalykBreathing.name
        idle : RSX.bossMalykIdle.name
        walk : RSX.bossMalykRun.name
        attack : RSX.bossMalykAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.95
        damage : RSX.bossMalykHit.name
        death : RSX.bossMalykDeath.name
      )
      card.atk = 2
      card.maxHP = 30
      rangedModifier = ModifierRanged.createContextObject()
      rangedModifier.isRemovable = false
      opponentDrawCardOnSummon = ModifierOpponentSummonWatchOpponentDrawCard.createContextObject()
      opponentDrawCardOnSummon.isRemovable = false
      summonEntityOnOverdraw = ModifierOpponentDrawCardWatchOverdrawSummonEntity.createContextObject({id: Cards.Faction4.Ooz}, "a 3/3 Ooz")
      summonEntityOnOverdraw.isRemovable = false
      card.setInherentModifiersContextObjects([rangedModifier, opponentDrawCardOnSummon, summonEntityOnOverdraw])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss14)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_14_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_14_bio"))
      card.setDescription(i18next.t("boss_battles.boss_14_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_archonis)
      card.setPortraitResource(RSX.speech_portrait_archonis)
      card.setPortraitHexResource(RSX.boss_archonis_hex_portrait)
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction4.BlackSolus"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_blacksolus_attack_swing.audio
        receiveDamage : RSX.sfx_f4_blacksolus_hit.audio
        attackDamage : RSX.sfx_f4_blacksolus_attack_impact.audio
        death : RSX.sfx_f4_blacksolus_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossManaManBreathing.name
        idle : RSX.bossManaManIdle.name
        walk : RSX.bossManaManRun.name
        attack : RSX.bossManaManAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.bossManaManDamage.name
        death : RSX.bossManaManDeath.name
      )
      card.atk = 6
      card.maxHP = 60
      damageBasedOnRemainingMana = ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana.createContextObject()
      damageBasedOnRemainingMana.isRemovable = false
      card.setInherentModifiersContextObjects([damageBasedOnRemainingMana])
      card.signatureCardData = {id: Cards.BossSpell.LaceratingFrost}

    if (identifier == Cards.Boss.Boss15)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_15_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_15_bio"))
      card.setDescription(i18next.t("boss_battles.boss_15_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_paragon)
      card.setPortraitResource(RSX.speech_portrait_paragon)
      card.setPortraitHexResource(RSX.boss_paragon_hex_portrait)
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_hailstonehowler_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_hailstonehowler_hit.audio
        attackDamage : RSX.sfx_neutral_hailstonehowler_attack_impact.audio
        death : RSX.sfx_neutral_hailstonehowler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossParagonBreathing.name
        idle : RSX.bossParagonIdle.name
        walk : RSX.bossParagonRun.name
        attack : RSX.bossParagonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossParagonHit.name
        death : RSX.bossParagonDeath.name
      )
      card.atk = 3
      card.maxHP = 30
      card.setDamage(10)
      gainModifiersOnHPChange = ModifierHPThresholdGainModifiers.createContextObject()
      gainModifiersOnHPChange.isRemovable = false
      card.setInherentModifiersContextObjects([gainModifiersOnHPChange])
      card.signatureCardData = {id: Cards.BossSpell.RestoringLight}

    if (identifier == Cards.Boss.Boss16)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_16_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_16_desc"))
      card.setBossBattleDescription(i18next.t("boss_battles.boss_16_bio"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_vampire)
      card.setPortraitResource(RSX.speech_portrait_vampire)
      card.setPortraitHexResource(RSX.boss_vampire_hex_portrait)
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
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
        breathing : RSX.bossVampireBreathing.name
        idle : RSX.bossVampireIdle.name
        walk : RSX.bossVampireRun.name
        attack : RSX.bossVampireAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.5
        damage : RSX.bossVampireHit.name
        death : RSX.bossVampireDeath.name
      )
      card.atk = 2
      card.maxHP = 30
      lifestealModifier = ModifierHealSelfWhenDealingDamage.createContextObject()
      lifestealModifier.isRemovable = false
      flyingObject = ModifierFlying.createContextObject()
      flyingObject.isRemovable = false
      extraDamageCounterAttack = ModifierExtraDamageOnCounterattack.createContextObject(2)
      extraDamageCounterAttack.isRemovable = false
      card.setInherentModifiersContextObjects([lifestealModifier, extraDamageCounterAttack, flyingObject])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss17)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_17_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_17_bio"))
      card.setDescription(i18next.t("boss_battles.boss_17_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_kron)
      card.setPortraitResource(RSX.speech_portrait_kron)
      card.setPortraitHexResource(RSX.boss_kron_hex_portrait)
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Neutral.WhiteWidow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_windstopper_attack_impact.audio
        attack : RSX.sfx_neutral_crossbones_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_mirkblooddevourer_hit.audio
        attackDamage : RSX.sfx_neutral_mirkblooddevourer_attack_impact.audio
        death : RSX.sfx_neutral_mirkblooddevourer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossKronBreathing.name
        idle : RSX.bossKronIdle.name
        walk : RSX.bossKronRun.name
        attack : RSX.bossKronAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossKronHit.name
        death : RSX.bossKronDeath.name
      )
      card.atk = 2
      card.maxHP = 30
      spawnPrisoners = ModifierOnOpponentDeathWatchSpawnEntityOnSpace.createContextObject()
      spawnPrisoners.isRemovable = false
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(-2, CardType.Spell)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      contextObject.isRemovable = false
      card.setInherentModifiersContextObjects([spawnPrisoners, contextObject])
      card.signatureCardData = {id: Cards.BossSpell.RestoringLight}

    if (identifier == Cards.Boss.Boss18)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_18_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_18_bio"))
      card.setDescription(i18next.t("boss_battles.boss_18_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_serpenti)
      card.setPortraitResource(RSX.speech_portrait_serpenti)
      card.setPortraitHexResource(RSX.boss_serpenti_hex_portrait)
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
        breathing : RSX.bossSerpentiBreathing.name
        idle : RSX.bossSerpentiIdle.name
        walk : RSX.bossSerpentiRun.name
        attack : RSX.bossSerpentiAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.bossSerpentiHit.name
        death : RSX.bossSerpentiDeath.name
      )
      card.atk = 4
      card.maxHP = 40
      spawnSerpentiEgg = ModifierDyingWishSpawnEgg.createContextObject({id: Cards.Neutral.Serpenti}, "7/4 Serpenti")
      spawnSerpentiEgg.isRemovable = false
      applyModifierToSummonedMinions = ModifierSummonWatchFromActionBarApplyModifiers.createContextObject([spawnSerpentiEgg], "Rebirth: Serpenti")
      applyModifierToSummonedMinions.isRemovable = false
      card.setInherentModifiersContextObjects([applyModifierToSummonedMinions])
      card.signatureCardData = {id: Cards.BossSpell.AncientKnowledge}

    if (identifier == Cards.Boss.Boss19)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_19_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_19_bio"))
      card.setDescription(i18next.t("boss_battles.boss_19_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_wraith)
      card.setPortraitResource(RSX.speech_portrait_wraith)
      card.setPortraitHexResource(RSX.boss_wraith_hex_portrait)
      card.setFXResource(["FX.Cards.Faction4.ArcaneDevourer"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f6_waterelemental_death.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossWraithBreathing.name
        idle : RSX.bossWraithIdle.name
        walk : RSX.bossWraithRun.name
        attack : RSX.bossWraithAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossWraithHit.name
        death : RSX.bossWraithDeath.name
      )
      card.atk = 1
      card.maxHP = 40
      growAura = Modifier.createContextObjectWithAuraForAllAllies([ModifierGrowPermanent.createContextObject(1)], null, null, null, "Your minions have \"Grow: +1/+1.\"")
      growAura.isRemovable = false
      takeDamageSpawnWraithlings = ModifierTakeDamageWatchSpawnWraithlings.createContextObject()
      takeDamageSpawnWraithlings.isRemovable = false
      card.setInherentModifiersContextObjects([growAura, takeDamageSpawnWraithlings])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss20)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_20_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_20_bio"))
      card.setDescription(i18next.t("boss_battles.boss_20_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_skyfall_tyrant)
      card.setPortraitResource(RSX.speech_portrait_skyfall_tyrant)
      card.setPortraitHexResource(RSX.boss_skyfall_tyrant_hex_portrait)
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
        breathing : RSX.bossSkyfallTyrantBreathing.name
        idle : RSX.bossSkyfallTyrantIdle.name
        walk : RSX.bossSkyfallTyrantRun.name
        attack : RSX.bossSkyfallTyrantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.bossSkyfallTyrantHit.name
        death : RSX.bossSkyfallTyrantDeath.name
      )
      card.atk = 2
      card.maxHP = 35
      card.speed = 0
      includedArtifacts = [
        {id: Cards.BossArtifact.FrostArmor}
      ]
      equipArtifactObject = ModifierStartTurnWatchEquipArtifact.createContextObject(1, includedArtifacts)
      equipArtifactObject.isRemovable = false
      rangedModifier = ModifierRanged.createContextObject()
      rangedModifier.isRemovable = false
      card.setInherentModifiersContextObjects([equipArtifactObject, rangedModifier])
      card.signatureCardData = {id: Cards.BossSpell.LaceratingFrost}

    if (identifier == Cards.BossArtifact.FrostArmor)
      card = new Artifact(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossArtifact.FrostArmor
      card.name = i18next.t("boss_battles.boss_20_artifact_name")
      card.setDescription(i18next.t("boss_battles.boss_20_artifact_desc"))
      #card.addKeywordClassToInclude(ModifierTranscendance)
      card.manaCost = 0
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierAbsorbDamage.createContextObject(1, {
          name: "Frost Armor"
          description: "The first time your General takes damage each turn, prevent 1 of it."
        }),
        ModifierTakeDamageWatchDamageAttacker.createContextObject(1, {
          name: "Frost Armor"
          description: "Whenever your General takes damage, deal 1 damage to the attacker."
        }),
      ])
      card.setFXResource(["FX.Cards.Artifact.ArclyteRegalia"])
      card.setBaseAnimResource(
        idle: RSX.iconFrostArmorIdle.name
        active: RSX.iconFrostArmorActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Boss.Boss21)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_21_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_21_bio"))
      card.setDescription(i18next.t("boss_battles.boss_21_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_cindera)
      card.setPortraitResource(RSX.speech_portrait_cindera)
      card.setPortraitHexResource(RSX.boss_cindera_hex_portrait)
      card.setFXResource(["FX.Cards.Faction4.AbyssalCrawler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f3_aymarahealer_attack_swing.audio
        receiveDamage : RSX.sfx_f3_aymarahealer_hit.audio
        attackDamage : RSX.sfx_f3_aymarahealer_impact.audio
        death : RSX.sfx_f3_aymarahealer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossCinderaBreathing.name
        idle : RSX.bossCinderaIdle.name
        walk : RSX.bossCinderaRun.name
        attack : RSX.bossCinderaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.bossCinderaHit.name
        death : RSX.bossCinderaDeath.name
      )
      card.atk = 2
      card.maxHP = 35
      explodeAura = Modifier.createContextObjectWithAuraForAllAllies([ModifierDyingWishDamageNearbyEnemies.createContextObject(2)], null, null, null, "Your minions have \"Dying Wish: Deal 2 damage to all nearby enemies\"")
      explodeAura.isRemovable = false
      startTurnTeleport = ModifierStartTurnWatchTeleportRandomSpace.createContextObject()
      startTurnTeleport.isRemovable = false
      frenzyContextObject = ModifierFrenzy.createContextObject()
      frenzyContextObject.isRemovable = false
      card.setInherentModifiersContextObjects([explodeAura, startTurnTeleport, frenzyContextObject])
      card.signatureCardData = {id: Cards.BossSpell.LivingFlame}

    if (identifier == Cards.Boss.Boss22)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_22_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_22_bio"))
      card.setDescription(i18next.t("boss_battles.boss_22_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_crystal)
      card.setPortraitResource(RSX.speech_portrait_crystal)
      card.setPortraitHexResource(RSX.boss_crystal_hex_portrait)
      card.setFXResource(["FX.Cards.Faction1.ArclyteSentinel"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f2stormkage_attack_swing.audio
        receiveDamage :  RSX.sfx_f2stormkage_hit.audio
        attackDamage : RSX.sfx_f2stormkage_attack_impact.audio
        death : RSX.sfx_f2stormkage_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossCrystalBreathing.name
        idle : RSX.bossCrystalIdle.name
        walk : RSX.bossCrystalRun.name
        attack : RSX.bossCrystalAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.bossCrystalDamage.name
        death : RSX.bossCrystalDeath.name
      )
      card.atk = 3
      card.maxHP = 30
      forceFieldObject = ModifierForcefield.createContextObject()
      forceFieldObject.isRemovable = false
      attackBuff = 2
      maxHPNerf = -2
      followupModifierContextObject = Modifier.createContextObjectWithAttributeBuffs(attackBuff,maxHPNerf)
      followupModifierContextObject.appliedName = i18next.t("modifiers.boss_22_applied_name")
      statModifierAura = ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers.createContextObject([followupModifierContextObject], "gain +2 Attack, but -2 Health")
      statModifierAura.isRemovable = false
      card.setInherentModifiersContextObjects([forceFieldObject, statModifierAura])
      card.signatureCardData = {id: Cards.BossSpell.RestoringLight}

    if (identifier == Cards.Boss.Boss23)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_23_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_23_bio"))
      card.setDescription(i18next.t("boss_battles.boss_23_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_antiswarm)
      card.setPortraitResource(RSX.speech_portrait_antiswarm)
      card.setPortraitHexResource(RSX.boss_antiswarm_hex_portrait)
      card.setFXResource(["FX.Cards.Faction5.PrimordialGazer"])
      card.setBoundingBoxWidth(90)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_primordialgazer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_primordialgazer_hit.audio
        attackDamage : RSX.sfx_neutral_primordialgazer_attack_impact.audio
        death : RSX.sfx_neutral_primordialgazer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossAntiswarmBreathing.name
        idle : RSX.bossAntiswarmIdle.name
        walk : RSX.bossAntiswarmRun.name
        attack : RSX.bossAntiswarmAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossAntiswarmHit.name
        death : RSX.bossAntiswarmDeath.name
      )
      card.atk = 1
      card.maxHP = 30
      card.speed = 0
      damageGeneralEqualToMinions = ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned.createContextObject()
      damageGeneralEqualToMinions.isRemovable = false
      shadowDancerAbility = ModifierDeathWatchDamageEnemyGeneralHealMyGeneral.createContextObject(1,1)
      shadowDancerAbility.isRemovable = false
      card.setInherentModifiersContextObjects([damageGeneralEqualToMinions, shadowDancerAbility])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss24)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_24_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_24_bio"))
      card.setDescription(i18next.t("boss_battles.boss_24_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_skurge)
      card.setPortraitResource(RSX.speech_portrait_skurge)
      card.setPortraitHexResource(RSX.boss_skurge_hex_portrait)
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
        breathing : RSX.bossSkurgeBreathing.name
        idle : RSX.bossSkurgeIdle.name
        walk : RSX.bossSkurgeRun.name
        attack : RSX.bossSkurgeAttack.name
        attackReleaseDelay: 0.2
        attackDelay: 0.4
        damage : RSX.bossSkurgeHit.name
        death : RSX.bossSkurgeDeath.name
      )
      card.atk = 1
      card.maxHP = 25
      rangedModifier = ModifierRanged.createContextObject()
      rangedModifier.isRemovable = false
      attackBuffContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      attackBuffContextObject.appliedName = i18next.t("modifiers.boss_24_applied_name_1")
      #rangedAura = Modifier.createContextObjectWithAuraForAllAllies([attackBuffContextObject], null, null, [ModifierRanged.type], "Your minions with Ranged gain +1/+1")
      #rangedAura.isRemovable = false
      immunityContextObject = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([ModifierImmuneToDamage.createContextObject()], "Skurge cannot be damaged while Valiant lives")
      immunityContextObject.appliedName = i18next.t("modifiers.boss_24_applied_name_2")
      valiantProtector = [
        Cards.Boss.Boss24Valiant
      ]
      applyGeneralImmunityContextObject = Modifier.createContextObjectWithAuraForAllAllies([immunityContextObject], null, valiantProtector, null, "Cannot be damaged while Valiant lives")
      applyGeneralImmunityContextObject.isRemovable = false
      applyGeneralImmunityContextObject.isHiddenToUI = true
      summonValiant = ModifierHPChangeSummonEntity.createContextObject({id: Cards.Boss.Boss24Valiant},15,"Valiant")
      summonValiant.isRemovable = false
      summonValiant.isHiddenToUI = true
      damageAndBuffSelf = ModifierStartTurnWatchDamageAndBuffSelf.createContextObject(1,0,3)
      damageAndBuffSelf.isRemovable = false
      card.setInherentModifiersContextObjects([rangedModifier, applyGeneralImmunityContextObject, damageAndBuffSelf, summonValiant])
      card.signatureCardData = {id: Cards.BossSpell.EtherealWind}

    if (identifier == Cards.Boss.Boss24Valiant)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_24_valiant_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_24_valiant_desc"))
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
        breathing : RSX.bossValiantBreathing.name
        idle : RSX.bossValiantIdle.name
        walk : RSX.bossValiantRun.name
        attack : RSX.bossValiantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.25
        damage : RSX.bossValiantHit.name
        death : RSX.bossValiantDeath.name
      )
      card.atk = 4
      card.maxHP = 15
      card.speed = 4
      provokeObject = ModifierProvoke.createContextObject()
      provokeObject.isRemovable = false
      rangedProvoke = ModifierRangedProvoke.createContextObject()
      rangedProvoke.isRemovable = false
      card.setInherentModifiersContextObjects([provokeObject, rangedProvoke])

    if (identifier == Cards.Boss.Boss25)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_25_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_25_bio"))
      card.setDescription(i18next.t("boss_battles.boss_25_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_shadow_lord)
      card.setPortraitResource(RSX.speech_portrait_shadow_lord)
      card.setPortraitHexResource(RSX.boss_shadow_lord_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.QuartermasterGauj"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_unit_run_magical_4.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_neutral_monsterdreamoracle_attack_impact.audio
        death : RSX.sfx_neutral_monsterdreamoracle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossShadowLordBreathing.name
        idle : RSX.bossShadowLordIdle.name
        walk : RSX.bossShadowLordRun.name
        attack : RSX.bossShadowLordAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.bossShadowLordHit.name
        death : RSX.bossShadowLordDeath.name
      )
      card.atk = 3
      card.maxHP = 30
      summonAssassinOnMove = ModifierEnemyTeamMoveWatchSummonEntityBehind.createContextObject({id: Cards.Faction2.KaidoAssassin},"Kaido Assassin")
      summonAssassinOnMove.isRemovable = false
      modContextObject = Modifier.createContextObjectWithAttributeBuffs(1,1)
      modContextObject.appliedName = i18next.t("modifiers.boss_25_applied_name")
      allyMinionMoveBuff = ModifierMyTeamMoveWatchBuffTarget.createContextObject([modContextObject], "give it +1/+1")
      allyMinionMoveBuff.isRemovable = false
      card.setInherentModifiersContextObjects([summonAssassinOnMove, allyMinionMoveBuff])
      card.signatureCardData = {id: Cards.BossSpell.LivingFlame}

    if (identifier == Cards.Boss.Boss26)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_26_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_26_bio"))
      card.setDescription(i18next.t("boss_battles.boss_26_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_gol)
      card.setPortraitResource(RSX.speech_portrait_gol)
      card.setPortraitHexResource(RSX.boss_gol_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.BloodTaura"])
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_neutral_rook_hit.audio
        attack : RSX.sfx_neutral_khymera_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_khymera_hit.audio
        attackDamage : RSX.sfx_neutral_khymera_impact.audio
        death : RSX.sfx_neutral_khymera_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossGolBreathing.name
        idle : RSX.bossGolIdle.name
        walk : RSX.bossGolRun.name
        attack : RSX.bossGolAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossGolHit.name
        death : RSX.bossGolDeath.name
      )
      card.atk = 2
      card.maxHP = 40
      card.speed = 0
      attacksDamageAllMinions = ModifierAttacksDamageAllEnemyMinions.createContextObject()
      attacksDamageAllMinions.isRemovable = false
      card.setInherentModifiersContextObjects([attacksDamageAllMinions])
      card.signatureCardData = {id: Cards.BossSpell.LivingFlame}

    if (identifier == Cards.Boss.Boss26Companion)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_26_zane_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_26_zane_desc"))
      card.setFXResource(["FX.Cards.Faction1.RadiantDragoon"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_neutral_arcanelimiter_attack_impact.audio
        attack : RSX.sfx_neutral_rook_attack_swing.audio
        receiveDamage : RSX.sfx_f2_kaidoassassin_hit.audio
        attackDamage : RSX.sfx_neutral_rook_attack_impact.audio
        death : RSX.sfx_neutral_windstopper_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossKaneBreathing.name
        idle : RSX.bossKaneIdle.name
        walk : RSX.bossKaneRun.name
        attack : RSX.bossKaneAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossKaneHit.name
        death : RSX.bossKaneDeath.name
      )
      card.atk = 3
      card.maxHP = 20
      card.speed = 3
      dyingWishKillGeneral = ModifierDyingWishLoseGame.createContextObject()
      dyingWishKillGeneral.isRemovable = false
      atkLimiter = ModifierATKThresholdDie.createContextObject(6)
      atkLimiter.isRemovable = false
      doubleDamageGenerals = ModifierDoubleDamageToGenerals.createContextObject()
      doubleDamageGenerals.isRemovable = false
      card.setInherentModifiersContextObjects([ModifierBattlePet.createContextObject(), doubleDamageGenerals, atkLimiter, dyingWishKillGeneral])

    if (identifier == Cards.Boss.Boss27)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_27_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_27_bio"))
      card.setDescription(i18next.t("boss_battles.boss_27_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_taskmaster)
      card.setPortraitResource(RSX.speech_portrait_taskmaster)
      card.setPortraitHexResource(RSX.boss_taskmaster_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.Tethermancer"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_ubo_attack_swing.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossTaskmasterBreathing.name
        idle : RSX.bossTaskmasterIdle.name
        walk : RSX.bossTaskmasterRun.name
        attack : RSX.bossTaskmasterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossTaskmasterHit.name
        death : RSX.bossTaskmasterDeath.name
      )
      card.atk = 3
      card.maxHP = 35
      card.speed = 0
      battlePetModifier = ModifierBattlePet.createContextObject()
      battlePetModifier.isRemovable = false
      summonWatchApplyBattlepet = ModifierSummonWatchAnyPlayerApplyModifiers.createContextObject([battlePetModifier], "act like Battle Pets")
      summonWatchApplyBattlepet.isRemovable = false
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 0}
      speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
      speedBuffContextObject.attributeBuffsFixed = ["speed"]
      speedBuffContextObject.appliedName = i18next.t("modifiers.faction_3_spell_sand_trap_1")
      speedBuffContextObject.isRemovable = false
      speed0Modifier = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([speedBuffContextObject], "The enemy General cannot move")
      speed0Modifier.isRemovable = false
      immuneToSpellTargeting = ModifierImmuneToSpellsByEnemy.createContextObject()
      immuneToSpellTargeting.isRemovable = false
      card.setInherentModifiersContextObjects([summonWatchApplyBattlepet, speed0Modifier, immuneToSpellTargeting])
      card.signatureCardData = {id: Cards.BossSpell.AncientKnowledge}

    if (identifier == Cards.Boss.Boss28)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_28_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_28_bio"))
      card.setDescription(i18next.t("boss_battles.boss_28_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_grym)
      card.setPortraitResource(RSX.speech_portrait_grym)
      card.setPortraitHexResource(RSX.boss_grym_hex_portrait)
      card.setFXResource(["FX.Cards.Faction5.EarthWalker"])
      card.setBoundingBoxWidth(70)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_screenshake.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_earthwalker_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_earthwalker_hit.audio
        attackDamage : RSX.sfx_neutral_earthwalker_attack_impact.audio
        death : RSX.sfx_neutral_earthwalker_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossGrymBreathing.name
        idle : RSX.bossGrymIdle.name
        walk : RSX.bossGrymRun.name
        attack : RSX.bossGrymAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.bossGrymHit.name
        death : RSX.bossGrymDeath.name
      )
      card.atk = 3
      card.maxHP = 30
      deathWatchDamageRandomMinionHealGeneral = ModifierDeathWatchDamageRandomMinionHealMyGeneral.createContextObject()
      deathWatchDamageRandomMinionHealGeneral.isRemovable = false
      card.setInherentModifiersContextObjects([deathWatchDamageRandomMinionHealGeneral])
      card.signatureCardData = {id: Cards.BossSpell.MoldingEarth}

    if (identifier == Cards.Boss.Boss29)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_29_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_29_bio"))
      card.setDescription(i18next.t("boss_battles.boss_29_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_sandpanther)
      card.setPortraitResource(RSX.speech_portrait_sandpanther)
      card.setPortraitHexResource(RSX.boss_sandpanther_hex_portrait)
      card.setFXResource(["FX.Cards.Faction3.Pantheran"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_neutral_silitharveteran_death.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossSandPantherBreathing.name
        idle : RSX.bossSandPantherIdle.name
        walk : RSX.bossSandPantherRun.name
        attack : RSX.bossSandPantherAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.bossSandPantherDamage.name
        death : RSX.bossSandPantherDeath.name
      )
      card.atk = 2
      card.maxHP = 40
      spawnSandTile = ModifierStartTurnWatchSpawnTile.createContextObject({id: Cards.Tile.SandPortal}, "Exhuming Sands", 1, CONFIG.PATTERN_WHOLE_BOARD)
      spawnSandTile.isRemovable = false
      card.setInherentModifiersContextObjects([spawnSandTile])
      card.signatureCardData = {id: Cards.BossSpell.EtherealWind}

    if (identifier == Cards.Boss.Boss30)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_30_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_30_bio"))
      card.setDescription(i18next.t("boss_battles.boss_30_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_wolfpunch)
      card.setPortraitResource(RSX.speech_portrait_wolfpunch)
      card.setPortraitHexResource(RSX.boss_wolfpunch_hex_portrait)
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setFXResource(["FX.Cards.Faction1.LysianBrawler"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1lysianbrawler_attack_swing.audio
        receiveDamage : RSX.sfx_f1lysianbrawler_hit.audio
        attackDamage : RSX.sfx_f1lysianbrawler_attack_impact.audio
        death : RSX.sfx_f1lysianbrawler_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossWolfpunchBreathing.name
        idle : RSX.bossWolfpunchIdle.name
        walk : RSX.bossWolfpunchRun.name
        attack : RSX.bossWolfpunchAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.bossWolfpunchDamage.name
        death : RSX.bossWolfpunchDeath.name
      )
      card.atk = 2
      card.maxHP = 40
      gainATKOpponentTurn = ModifierEndTurnWatchGainTempBuff.createContextObject(4,0,i18next.t("modifiers.boss_30_applied_name"))
      gainATKOpponentTurn.isRemovable = false
      celerityObject = ModifierTranscendance.createContextObject()
      celerityObject.isRemovable = false
      startTurnSpawnWolf = ModifierStartTurnWatchSpawnEntity.createContextObject({id: Cards.Faction6.WolfAspect})
      startTurnSpawnWolf.isRemovable = false
      card.setInherentModifiersContextObjects([gainATKOpponentTurn, celerityObject, startTurnSpawnWolf])
      card.signatureCardData = {id: Cards.BossSpell.LaceratingFrost}

    if (identifier == Cards.Boss.Boss31)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_31_bio"))
      card.setDescription(i18next.t("boss_battles.boss_31_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_unhallowed)
      card.setPortraitResource(RSX.speech_portrait_unhallowed)
      card.setPortraitHexResource(RSX.boss_unhallowed_hex_portrait)
      card.setFXResource(["FX.Cards.Faction4.DeathKnell"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f4_blacksolus_attack_swing.audio
        walk : RSX.sfx_spell_icepillar_melt.audio
        attack : RSX.sfx_f6_waterelemental_death.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossUnhallowedBreathing.name
        idle : RSX.bossUnhallowedIdle.name
        walk : RSX.bossUnhallowedRun.name
        attack : RSX.bossUnhallowedAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.bossUnhallowedHit.name
        death : RSX.bossUnhallowedDeath.name
      )
      card.atk = 2
      card.maxHP = 50
      takeDamageSpawnHaunt = ModifierTakeDamageWatchSpawnRandomHaunt.createContextObject()
      takeDamageSpawnHaunt.isRemovable = false
      card.setInherentModifiersContextObjects([takeDamageSpawnHaunt])
      card.signatureCardData = {id: Cards.BossSpell.EntanglingShadow}

    if (identifier == Cards.Boss.Boss31Treat1)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_treat_name")
      card.setDescription(i18next.t("boss_battles.boss_31_treat_1_desc"))
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(45)
      card.setFXResource(["FX.Cards.Faction2.OnyxBear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_neutral_luxignis_hit.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossCandyPandaBreathing.name
        idle : RSX.bossCandyPandaIdle.name
        walk : RSX.bossCandyPandaRun.name
        attack : RSX.bossCandyPandaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.bossCandyPandaDamage.name
        death : RSX.bossCandyPandaDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      cannotAttackGenerals = ModifierCannotAttackGeneral.createContextObject()
      cannotAttackGenerals.isRemovable = false
      sentinelData = {id: Cards.Faction2.SonghaiSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard.createContextObject("transform.", {id: Cards.Boss.Boss31Treat1}))
      card.setInherentModifiersContextObjects([ModifierSentinelSetup.createContextObject(sentinelData), cannotAttackGenerals])
      card.addKeywordClassToInclude(ModifierSentinel)

    if (identifier == Cards.Boss.Boss31Treat2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_treat_name")
      card.setDescription(i18next.t("boss_battles.boss_31_treat_2_desc"))
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(45)
      card.setFXResource(["FX.Cards.Faction2.OnyxBear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_neutral_luxignis_hit.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossCandyPandaBreathing.name
        idle : RSX.bossCandyPandaIdle.name
        walk : RSX.bossCandyPandaRun.name
        attack : RSX.bossCandyPandaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.bossCandyPandaDamage.name
        death : RSX.bossCandyPandaDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      cannotAttackGenerals = ModifierCannotAttackGeneral.createContextObject()
      cannotAttackGenerals.isRemovable = false
      sentinelData = {id: Cards.Faction4.AbyssSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSummonBuffItDrawCard.createContextObject("transform.", {id: Cards.Boss.Boss31Treat2}))
      card.setInherentModifiersContextObjects([ModifierSentinelSetup.createContextObject(sentinelData), cannotAttackGenerals])
      card.addKeywordClassToInclude(ModifierSentinel)

    if (identifier == Cards.Boss.Boss31Treat3)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_treat_name")
      card.setDescription(i18next.t("boss_battles.boss_31_treat_3_desc"))
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(45)
      card.setFXResource(["FX.Cards.Faction2.OnyxBear"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_neutral_luxignis_hit.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spelljammer_hit.audio
        attackDamage : RSX.sfx_neutral_spelljammer_attack_impact.audio
        death : RSX.sfx_neutral_spelljammer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossCandyPandaBreathing.name
        idle : RSX.bossCandyPandaIdle.name
        walk : RSX.bossCandyPandaRun.name
        attack : RSX.bossCandyPandaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.bossCandyPandaDamage.name
        death : RSX.bossCandyPandaDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      cannotAttackGenerals = ModifierCannotAttackGeneral.createContextObject()
      cannotAttackGenerals.isRemovable = false
      sentinelData = {id: Cards.Faction6.VanarSentinel}
      sentinelData.additionalModifiersContextObjects ?= []
      sentinelData.additionalModifiersContextObjects.push(ModifierSentinelOpponentSpellCastRefundManaDrawCard.createContextObject("transform.", {id: Cards.Boss.Boss31Treat3}))
      card.setInherentModifiersContextObjects([ModifierSentinelSetup.createContextObject(sentinelData), cannotAttackGenerals])
      card.addKeywordClassToInclude(ModifierSentinel)

    if (identifier == Cards.Boss.Boss31Haunt1)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_haunt_1_name")
      card.setDescription(i18next.t("boss_battles.boss_31_haunt_1_desc"))
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage :  RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossTreatDemonBreathing.name
        idle : RSX.bossTreatDemonIdle.name
        walk : RSX.bossTreatDemonRun.name
        attack : RSX.bossTreatDemonAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossTreatDemonHit.name
        death : RSX.bossTreatDemonDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      dyingWishDrawCards = ModifierDyingWishDrawCard.createContextObject(2)
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(1, CardType.Unit)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      increasedManaCost = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([contextObject], "Your opponent's minions cost 1 more to play")
      card.setInherentModifiersContextObjects([dyingWishDrawCards, increasedManaCost])

    if (identifier == Cards.Boss.Boss31Haunt2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_haunt_2_name")
      card.setDescription(i18next.t("boss_battles.boss_31_haunt_2_desc"))
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage :  RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossTreatOniBreathing.name
        idle : RSX.bossTreatOniIdle.name
        walk : RSX.bossTreatOniRun.name
        attack : RSX.bossTreatOniAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossTreatOniHit.name
        death : RSX.bossTreatOniDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      dyingWishDrawCards = ModifierDyingWishDrawCard.createContextObject(2)
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(1, CardType.Spell)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      increasedManaCost = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([contextObject], "Your opponent's non-Bloodbound spells cost 1 more to cast")
      card.setInherentModifiersContextObjects([dyingWishDrawCards, increasedManaCost])

    if (identifier == Cards.Boss.Boss31Haunt3)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_31_haunt_3_name")
      card.setDescription(i18next.t("boss_battles.boss_31_haunt_3_desc"))
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage :  RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossTreatDrakeBreathing.name
        idle : RSX.bossTreatDrakeIdle.name
        walk : RSX.bossTreatDrakeRun.name
        attack : RSX.bossTreatDrakeAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossTreatDrakeHit.name
        death : RSX.bossTreatDrakeDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 3
      card.rarityId = Rarity.Rare
      dyingWishDrawCards = ModifierDyingWishDrawCard.createContextObject(2)
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(1, CardType.Artifact)
      contextObject.activeInHand = contextObject.activeInDeck = false
      contextObject.activeOnBoard = true
      increasedManaCost = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetEnemyPlayer([contextObject], "Your opponent's artifacts cost 1 more to cast")
      card.setInherentModifiersContextObjects([dyingWishDrawCards, increasedManaCost])

    if (identifier == Cards.Boss.Boss32)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_32_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_32_bio"))
      card.setDescription(i18next.t("boss_battles.boss_32_desc"))
      card.setBossBattleBattleMapIndex(10)
      card.setSpeechResource(RSX.speech_portrait_christmas)
      card.setPortraitResource(RSX.speech_portrait_christmas)
      card.setPortraitHexResource(RSX.boss_christmas_hex_portrait)
      card.setBoundingBoxWidth(120)
      card.setBoundingBoxHeight(95)
      card.setFXResource(["FX.Cards.Faction6.PrismaticGiant"])
      card.setBaseSoundResource(
        apply : RSX.sfx_ui_booster_packexplode.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f6_draugarlord_attack_swing.audio
        receiveDamage : RSX.sfx_f6_draugarlord_hit.audio
        attackDamage : RSX.sfx_f6_draugarlord_attack_impact.audio
        death : RSX.sfx_f6_draugarlord_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossChristmasBreathing.name
        idle : RSX.bossChristmasIdle.name
        walk : RSX.bossChristmasRun.name
        attack : RSX.bossChristmasAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.bossChristmasDamage.name
        death : RSX.bossChristmasDeath.name
      )
      card.atk = 4
      card.maxHP = 50
      #giftPlayer = ModifierStartTurnWatchPutCardInOpponentsHand.createContextObject({id: Cards.BossSpell.HolidayGift})
      #giftPlayer.isRemovable = false
      startTurnSpawnElf = ModifierStartTurnWatchSpawnEntity.createContextObject({id: Cards.Boss.Boss32_2})
      startTurnSpawnElf.isRemovable = false
      card.setInherentModifiersContextObjects([startTurnSpawnElf])
      card.signatureCardData = {id: Cards.BossSpell.LaceratingFrost}

    if (identifier == Cards.Boss.Boss32_2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_32_elf_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_32_elf_desc"))
      card.setFXResource(["FX.Cards.Neutral.Zyx"])
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
        breathing : RSX.neutralZyxFestiveBreathing.name
        idle : RSX.neutralZyxFestiveIdle.name
        walk : RSX.neutralZyxFestiveRun.name
        attack : RSX.neutralZyxFestiveAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralZyxFestiveHit.name
        death : RSX.neutralZyxFestiveDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      celerityObject = ModifierTranscendance.createContextObject()
      rushContextObject = ModifierFirstBlood.createContextObject()
      dyingWishPresent = ModifierDyingWishPutCardInOpponentHand.createContextObject({id: Cards.BossSpell.HolidayGift})
      card.setInherentModifiersContextObjects([celerityObject, dyingWishPresent])

    if (identifier == Cards.BossArtifact.FlyingBells)
      card = new Artifact(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossArtifact.FlyingBells
      card.name = i18next.t("boss_battles.boss_32_gift_1_name")
      card.setDescription(i18next.t("boss_battles.boss_32_gift_1_desc"))
      card.addKeywordClassToInclude(ModifierFlying)
      card.manaCost = 0
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierFlying.createContextObject({
          type: "ModifierFlying"
          name: i18next.t("boss_battles.boss_32_gift_1_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.MaskOfShadows"])
      card.setBaseAnimResource(
        idle: RSX.bossChristmasJinglebellsIdle.name
        active: RSX.bossChristmasJinglebellsActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.BossArtifact.Coal)
      card = new Artifact(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossArtifact.Coal
      card.name = i18next.t("boss_battles.boss_32_gift_2_name")
      card.setDescription(i18next.t("boss_battles.boss_32_gift_2_desc"))
      card.manaCost = 0
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierCannotCastBBS.createContextObject({
          type: "ModifierCannotCastBBS"
          name: i18next.t("boss_battles.boss_32_gift_2_name")
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.PristineScale"])
      card.setBaseAnimResource(
        idle: RSX.bossChristmasCoalIdle.name
        active: RSX.bossChristmasCoalActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_artifact_equip.audio
      )

    if (identifier == Cards.BossArtifact.CostReducer)
      card = new Artifact(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossArtifact.CostReducer
      card.name = i18next.t("boss_battles.boss_32_gift_3_name")
      card.setDescription(i18next.t("boss_battles.boss_32_gift_3_desc"))
      card.manaCost = 0
      card.rarityId = Rarity.Epic
      card.durability = 3
      artifactContextObject = PlayerModifierManaModifier.createCostChangeContextObject(-1, CardType.Artifact)
      artifactContextObject.activeInHand = artifactContextObject.activeInDeck = false
      artifactContextObject.activeOnBoard = true
      spellContextObject = PlayerModifierManaModifier.createCostChangeContextObject(-1, CardType.Spell)
      spellContextObject.activeInHand = spellContextObject.activeInDeck = spellContextObject.activeInSignatureCards = false
      spellContextObject.activeOnBoard = true
      minionContextObject = PlayerModifierManaModifier.createCostChangeContextObject(-1, CardType.Unit)
      minionContextObject.activeInHand = minionContextObject.activeInDeck = false
      minionContextObject.activeOnBoard = true
      card.setTargetModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([artifactContextObject,spellContextObject,minionContextObject], "Cards in your hand cost 1 less to play.")
      ])
      card.setFXResource(["FX.Cards.Artifact.SoulGrimwar"])
      card.setBaseAnimResource(
        idle: RSX.bossChristmasMistletoeIdle.name
        active: RSX.bossChristmasMistletoeActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.BossSpell.HolidayGift)
      card = new SpellEquipBossArtifacts(gameSession)
      card.setIsHiddenInCollection(true)
      card.factionId = Factions.Boss
      card.id = Cards.Spell.HolidayGift
      card.name = i18next.t("boss_battles.boss_32_gift_spell_name")
      card.setDescription(i18next.t("boss_battles.boss_32_gift_spell_desc"))
      card.manaCost = 1
      card.rarityId = Rarity.Legendary
      card.setFXResource(["FX.Cards.Spell.AutarchsGifts"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.bossChristmasPresentIdle.name
        active : RSX.bossChristmasPresentActive.name
      )

    if (identifier == Cards.BossArtifact.Snowball)
      card = new Artifact(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossArtifact.Snowball
      card.name = i18next.t("boss_battles.boss_32_gift_4_name")
      card.setDescription(i18next.t("boss_battles.boss_32_gift_4_desc"))
      card.addKeywordClassToInclude(ModifierRanged)
      card.manaCost = 0
      card.rarityId = Rarity.Epic
      card.durability = 3
      card.setTargetModifiersContextObjects([
        ModifierRanged.createContextObject({
          type: "ModifierRanged"
          name: i18next.t("boss_battles.boss_32_gift_4_name")
        }),
        Modifier.createContextObjectWithAttributeBuffs(-1,undefined, {
          name: "Snowball"
          description: "-1 Attack."
        })
      ])
      card.setFXResource(["FX.Cards.Artifact.EternalHeart"])
      card.setBaseAnimResource(
        idle: RSX.bossChristmasSnowballIdle.name
        active: RSX.bossChristmasSnowballActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_artifact_equip.audio
      )

    if (identifier == Cards.Boss.Boss33)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_33_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_33_bio"))
      card.setDescription(i18next.t("boss_battles.boss_33_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_legion)
      card.setPortraitResource(RSX.speech_portrait_legion)
      card.setPortraitHexResource(RSX.boss_legion_hex_portrait)
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(105)
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossLegionBreathing.name
        idle : RSX.bossLegionIdle.name
        walk : RSX.bossLegionRun.name
        attack : RSX.bossLegionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossLegionHit.name
        death : RSX.bossLegionDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.speed = 1
      healObject = ModifierEndTurnWatchHealSelf.createContextObject(3)
      healObject.isRemovable = false
      legion = [
        Cards.Boss.Boss33_1,
        Cards.Boss.Boss33_2,
        Cards.Boss.Boss33_3,
        Cards.Boss.Boss33_4,
        Cards.Boss.Boss33
      ]
      healAura = Modifier.createContextObjectWithOnBoardAuraForAllAlliesAndSelfAndGeneral([healObject], null, legion, null, "Heals for 3 at end of turn")
      healAura.isRemovable = false
      backupGeneral = ModifierBackupGeneral.createContextObject()
      backupGeneral.activeInHand = backupGeneral.activeInDeck = backupGeneral.activeInSignatureCards = false
      backupGeneral.activeOnBoard = true
      backupGeneral.isRemovable = false
      respawnClones = ModifierStartTurnWatchRespawnClones.createContextObject()
      respawnClones.isRemovable = false
      card.setInherentModifiersContextObjects([healAura, backupGeneral, respawnClones])
      card.signatureCardData = {id: Cards.BossSpell.EtherealWind}

    if (identifier == Cards.Boss.Boss33_1)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_33_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_33_desc"))
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(105)
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossLegionBreathing.name
        idle : RSX.bossLegionIdle.name
        walk : RSX.bossLegionRun.name
        attack : RSX.bossLegionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossLegionHit.name
        death : RSX.bossLegionDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.speed = 1
      healObject = ModifierEndTurnWatchHealSelf.createContextObject(3)
      healObject.isRemovable = false
      legion = [
        Cards.Boss.Boss33_1,
        Cards.Boss.Boss33_2,
        Cards.Boss.Boss33_3,
        Cards.Boss.Boss33_4,
        Cards.Boss.Boss33
      ]
      healAura = Modifier.createContextObjectWithOnBoardAuraForAllAlliesAndSelfAndGeneral([healObject], null, legion, null, "Heals for 3 at end of turn")
      healAura.isRemovable = false
      backupGeneral = ModifierBackupGeneral.createContextObject()
      backupGeneral.activeInHand = backupGeneral.activeInDeck = backupGeneral.activeInSignatureCards = false
      backupGeneral.activeOnBoard = true
      backupGeneral.isRemovable = false
      respawnClones = ModifierStartTurnWatchRespawnClones.createContextObject()
      respawnClones.isRemovable = false
      card.setInherentModifiersContextObjects([healAura, backupGeneral, respawnClones])

    if (identifier == Cards.Boss.Boss33_2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_33_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_33_2_desc"))
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(105)
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossLegionBreathing.name
        idle : RSX.bossLegionIdle.name
        walk : RSX.bossLegionRun.name
        attack : RSX.bossLegionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossLegionHit.name
        death : RSX.bossLegionDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.speed = 1
      attackObject = Modifier.createContextObjectWithAttributeBuffs(2,undefined, {
        name: "Legion's Strength"
        description: "+2 Attack."
      })
      attackObject.isRemovable = false
      legion = [
        Cards.Boss.Boss33_1,
        Cards.Boss.Boss33_2,
        Cards.Boss.Boss33_3,
        Cards.Boss.Boss33_4,
        Cards.Boss.Boss33
      ]
      attackAura = Modifier.createContextObjectWithOnBoardAuraForAllAlliesAndSelfAndGeneral([attackObject], null, legion, null, "Gains +2 Attack")
      attackAura.isRemovable = false
      attackAura.appliedName = i18next.t("modifiers.boss_33_applied_name_2")
      backupGeneral = ModifierBackupGeneral.createContextObject()
      backupGeneral.activeInHand = backupGeneral.activeInDeck = backupGeneral.activeInSignatureCards = false
      backupGeneral.activeOnBoard = true
      backupGeneral.isRemovable = false
      respawnClones = ModifierStartTurnWatchRespawnClones.createContextObject()
      respawnClones.isRemovable = false
      card.setInherentModifiersContextObjects([attackAura, backupGeneral, respawnClones])

    if (identifier == Cards.Boss.Boss33_3)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_33_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_33_3_desc"))
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(105)
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossLegionBreathing.name
        idle : RSX.bossLegionIdle.name
        walk : RSX.bossLegionRun.name
        attack : RSX.bossLegionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossLegionHit.name
        death : RSX.bossLegionDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.speed = 1
      speedBuffContextObject = Modifier.createContextObjectOnBoard()
      speedBuffContextObject.attributeBuffs = {"speed": 3}
      speedBuffContextObject.attributeBuffsAbsolute = ["speed"]
      speedBuffContextObject.attributeBuffsFixed = ["speed"]
      speedBuffContextObject.appliedName = i18next.t("modifiers.boss_33_applied_name")
      speedBuffContextObject.isRemovable = false
      legion = [
        Cards.Boss.Boss33_1,
        Cards.Boss.Boss33_2,
        Cards.Boss.Boss33_3,
        Cards.Boss.Boss33_4,
        Cards.Boss.Boss33
      ]
      speedAura = Modifier.createContextObjectWithOnBoardAuraForAllAlliesAndSelfAndGeneral([speedBuffContextObject], null, legion, null, "Can move 2 extra spaces")
      speedAura.isRemovable = false
      speedAura.appliedName = i18next.t("modifiers.boss_33_applied_name")
      backupGeneral = ModifierBackupGeneral.createContextObject()
      backupGeneral.activeInHand = backupGeneral.activeInDeck = backupGeneral.activeInSignatureCards = false
      backupGeneral.activeOnBoard = true
      backupGeneral.isRemovable = false
      respawnClones = ModifierStartTurnWatchRespawnClones.createContextObject()
      respawnClones.isRemovable = false
      card.setInherentModifiersContextObjects([speedAura, backupGeneral, respawnClones])

    if (identifier == Cards.Boss.Boss33_4)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_33_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_33_4_desc"))
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(105)
      card.setFXResource(["FX.Cards.Neutral.NightWatcher"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f4_engulfingshadow_attack_swing.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossLegionBreathing.name
        idle : RSX.bossLegionIdle.name
        walk : RSX.bossLegionRun.name
        attack : RSX.bossLegionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossLegionHit.name
        death : RSX.bossLegionDeath.name
      )
      card.atk = 2
      card.maxHP = 8
      card.speed = 1
      immuneToSpellTargeting = ModifierImmuneToSpellsByEnemy.createContextObject()
      immuneToSpellTargeting.isRemovable = false
      legion = [
        Cards.Boss.Boss33_1,
        Cards.Boss.Boss33_2,
        Cards.Boss.Boss33_3,
        Cards.Boss.Boss33_4,
        Cards.Boss.Boss33
      ]
      spellImmuneAura = Modifier.createContextObjectWithOnBoardAuraForAllAlliesAndSelfAndGeneral([immuneToSpellTargeting], null, legion, null, "Cannot be targeted by enemy spells")
      spellImmuneAura.isRemovable = false
      backupGeneral = ModifierBackupGeneral.createContextObject()
      backupGeneral.activeInHand = backupGeneral.activeInDeck = backupGeneral.activeInSignatureCards = false
      backupGeneral.activeOnBoard = true
      backupGeneral.isRemovable = false
      respawnClones = ModifierStartTurnWatchRespawnClones.createContextObject()
      respawnClones.isRemovable = false
      card.setInherentModifiersContextObjects([spellImmuneAura, backupGeneral, respawnClones])

    if (identifier == Cards.Boss.Boss34)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_34_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_34_bio"))
      card.setDescription(i18next.t("boss_battles.boss_34_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_harmony)
      card.setPortraitResource(RSX.speech_portrait_harmony)
      card.setPortraitHexResource(RSX.boss_harmony_hex_portrait)
      card.setFXResource(["FX.Cards.Faction2.JadeOgre"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2_jadeogre_attack_impact.audio
        death : RSX.sfx_f2_jadeogre_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossHarmonyBreathing.name
        idle : RSX.bossHarmonyIdle.name
        walk : RSX.bossHarmonyRun.name
        attack : RSX.bossHarmonyAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.bossHarmonyHit.name
        death : RSX.bossHarmonyRun.name
      )
      card.atk = 3
      card.maxHP = 25
      contextObject = PlayerModifierManaModifier.createCostChangeContextObject(-25, CardType.Unit)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      reducedManaCost = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetBothPlayers([contextObject], "Minions cost 0 mana")
      reducedManaCost.isRemovable = false
      spawnDissonance = ModifierDieSpawnNewGeneral.createContextObject({id: Cards.Boss.Boss34_2})
      spawnDissonance.isRemovable = false
      spawnDissonance.isHiddenToUI = true
      #customContextObject = PlayerModifierManaModifier.createCostChangeContextObject(0, CardType.Unit)
      #customContextObject.modifiersContextObjects[0].attributeBuffsAbsolute = ["manaCost"]
      #customContextObject.modifiersContextObjects[0].attributeBuffsFixed = ["manaCost"]
      #manaReduction = ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetBothPlayers([customContextObject], "All minions cost 0 mana.")
      #manaReduction.isRemovable = false
      card.setInherentModifiersContextObjects([reducedManaCost, spawnDissonance])
      card.signatureCardData = {id: Cards.BossSpell.AncientKnowledge}

    if (identifier == Cards.Boss.Boss34_2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_34_2_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_34_2_desc"))
      card.setFXResource(["FX.Cards.Faction2.JadeOgre"])
      card.setBoundingBoxWidth(65)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_unit_physical_4.audio
        attack : RSX.sfx_f2_jadeogre_attack_swing.audio
        receiveDamage : RSX.sfx_f2_jadeogre_hit.audio
        attackDamage : RSX.sfx_f2_jadeogre_attack_impact.audio
        death : RSX.sfx_f2_jadeogre_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossDissonanceBreathing.name
        idle : RSX.bossDissonanceIdle.name
        walk : RSX.bossDissonanceRun.name
        attack : RSX.bossDissonanceAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.8
        damage : RSX.bossDissonanceHit.name
        death : RSX.bossDissonanceRun.name
      )
      card.atk = 3
      card.maxHP = 25
      swapAllegiancesGainAttack = ModifierSwitchAllegiancesGainAttack.createContextObject()
      swapAllegiancesGainAttack.isRemovable = false
      frenzyContextObject = ModifierFrenzy.createContextObject()
      frenzyContextObject.isRemovable = false
      card.setInherentModifiersContextObjects([swapAllegiancesGainAttack, frenzyContextObject])

    if (identifier == Cards.Boss.Boss35)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_35_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_35_bio"))
      card.setDescription(i18next.t("boss_battles.boss_35_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_andromeda)
      card.setPortraitResource(RSX.speech_portrait_andromeda)
      card.setPortraitHexResource(RSX.boss_andromeda_hex_portrait)
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
        breathing : RSX.bossAndromedaBreathing.name
        idle : RSX.bossAndromedaIdle.name
        walk : RSX.bossAndromedaRun.name
        attack : RSX.bossAndromedaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.bossAndromedaHit.name
        death : RSX.bossAndromedaDeath.name
      )
      card.atk = 3
      card.maxHP = 42
      randomTransformMinions = ModifierOpponentSummonWatchRandomTransform.createContextObject()
      randomTransformMinions.isRemovable = false
      flyingObject = ModifierFlying.createContextObject()
      flyingObject.isRemovable = false
      card.setInherentModifiersContextObjects([randomTransformMinions, flyingObject])
      card.signatureCardData = {id: Cards.BossSpell.MoldingEarth}

    if (identifier == Cards.Boss.Boss36)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_36_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_36_bio"))
      card.setDescription(i18next.t("boss_battles.boss_36_desc"))
      card.setBossBattleBattleMapIndex(7)
      card.setSpeechResource(RSX.speech_portrait_kaiju)
      card.setPortraitResource(RSX.speech_portrait_kaiju)
      card.setPortraitHexResource(RSX.boss_kaiju_hex_portrait)
      card.setFXResource(["FX.Cards.Faction3.GrandmasterNoshRak"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_ghostlightning.audio
        walk : RSX.sfx_neutral_silitharveteran_death.audio
        attack : RSX.sfx_neutral_makantorwarbeast_attack_swing.audio
        receiveDamage : RSX.sfx_f6_boreanbear_hit.audio
        attackDamage : RSX.sfx_f6_boreanbear_attack_impact.audio
        death : RSX.sfx_f6_boreanbear_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossInvaderBreathing.name
        idle : RSX.bossInvaderIdle.name
        walk : RSX.bossInvaderRun.name
        attack : RSX.bossInvaderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.bossInvaderHit.name
        death : RSX.bossInvaderDeath.name
      )
      card.atk = 3
      card.maxHP = 80
      damageRandom = ModifierStartTurnWatchDamageRandom.createContextObject(6)
      damageRandom.isRemovable = false
      card.setInherentModifiersContextObjects([damageRandom])
      card.signatureCardData = {id: Cards.BossSpell.MoldingEarth}

    if (identifier == Cards.Boss.Boss36_2)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_36_2_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_36_2_desc"))
      card.setBoundingBoxWidth(85)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction1.IroncliffeGuardian"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossProtectorBreathing.name
        idle : RSX.bossProtectorIdle.name
        walk : RSX.bossProtectorRun.name
        attack : RSX.bossProtectorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.7
        damage : RSX.bossProtectorDamage.name
        death : RSX.bossProtectorDeath.name
      )
      card.atk = 1
      card.maxHP = 50
      replaceGeneral = ModifierOnSpawnKillMyGeneral.createContextObject()
      replaceGeneral.isRemovable = false
      gainAttackOnKill = ModifierDeathWatchGainAttackEqualToEnemyAttack.createContextObject()
      gainAttackOnKill.isRemovable = false
      card.setInherentModifiersContextObjects([replaceGeneral, gainAttackOnKill])

    if (identifier == Cards.Boss.Boss36_3)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_36_3_name")
      card.manaCost = 0
      card.setDescription(i18next.t("boss_battles.boss_36_3_desc"))
      card.raceId = Races.Structure
      card.setFXResource(["FX.Cards.Faction3.BrazierDuskWind"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_divinebond.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_monsterdreamoracle_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_monsterdreamoracle_hit.audio
        attackDamage : RSX.sfx_f1_general_attack_impact.audio
        death : RSX.sfx_neutral_golembloodshard_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossCityBreathing.name
        idle : RSX.bossCityIdle.name
        walk : RSX.bossCityIdle.name
        attack : RSX.bossCityAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.bossCityDamage.name
        death : RSX.bossCityDeath.name
      )
      card.atk = 0
      card.maxHP = 3
      buffEnemyGeneralOnDeath = ModifierDyingWishBuffEnemyGeneral.createContextObject(2,6)
      buffEnemyGeneralOnDeath.isRemovable = false
      card.setInherentModifiersContextObjects([buffEnemyGeneralOnDeath])

    if (identifier == Cards.Boss.Boss37)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_37_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_37_bio"))
      card.setDescription(i18next.t("boss_battles.boss_37_desc"))
      card.setBossBattleBattleMapIndex(8)
      card.setSpeechResource(RSX.speech_portrait_soulstealer)
      card.setPortraitResource(RSX.speech_portrait_soulstealer)
      card.setPortraitHexResource(RSX.boss_soulstealer_hex_portrait)
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(90)
      card.setFXResource(["FX.Cards.Faction2.CelestialPhantom"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_deathstrikeseal.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2_celestialphantom_attack_swing.audio
        receiveDamage :  RSX.sfx_f2_celestialphantom_hit.audio
        attackDamage : RSX.sfx_f2_celestialphantom_attack_impact.audio
        death : RSX.sfx_f2_celestialphantom_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossSoulstealerBreathing.name
        idle : RSX.bossSoulstealerIdle.name
        walk : RSX.bossSoulstealerRun.name
        attack : RSX.bossSoulstealerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.bossSoulstealerDamage.name
        death : RSX.bossSoulstealerDeath.name
      )
      card.atk = 3
      card.maxHP = 30
      enemyMinionGeneralSwap = PlayerModifierOpponentSummonWatchSwapGeneral.createContextObject()
      enemyMinionGeneralSwap.isRemovable = false
      backupGeneral = ModifierBackupGeneral.createContextObject()
      backupGeneral.activeInHand = backupGeneral.activeInDeck = backupGeneral.activeInSignatureCards = false
      backupGeneral.activeOnBoard = true
      backupGeneral.isRemovable = false
      backupGeneral.appliedName = i18next.t("modifiers.boss_37_applied_name")
      backupGeneral.appliedDescription = i18next.t("modifiers.boss_37_applied_desc")
      applyModifierToSummonedMinions = PlayerModifierSummonWatchApplyModifiers.createContextObject([backupGeneral], i18next.t("modifiers.boss_37_applied_name"))
      applyModifierToSummonedMinions.isRemovable = false
      #applyBackUpGeneralApplyingModifierToSummonedMinions = ModifierSummonWatchFromActionBarApplyModifiers.createContextObject([applyModifierToSummonedMinions], "Soul Vessel")
      #applyBackUpGeneralApplyingModifierToSummonedMinions.isRemovable = false
      card.setInherentModifiersContextObjects([enemyMinionGeneralSwap, applyModifierToSummonedMinions])
      card.signatureCardData = {id: Cards.BossSpell.AncientKnowledge}

    if (identifier == Cards.Boss.Boss38)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(true)
      card.factionId = Factions.Boss
      card.name = i18next.t("boss_battles.boss_38_name")
      card.manaCost = 0
      card.setBossBattleDescription(i18next.t("boss_battles.boss_38_bio"))
      card.setDescription(i18next.t("boss_battles.boss_38_desc"))
      card.setBossBattleBattleMapIndex(9)
      card.setSpeechResource(RSX.speech_portrait_spelleater)
      card.setPortraitResource(RSX.speech_portrait_spelleater)
      card.setPortraitHexResource(RSX.boss_spelleater_hex_portrait)
      card.setFXResource(["FX.Cards.Neutral.Grailmaster"])
      card.setBoundingBoxWidth(100)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_sai_attack_impact.audio
        attack : RSX.sfx_neutral_spiritscribe_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_spiritscribe_hit.audio
        attackDamage : RSX.sfx_neutral_spiritscribe_impact.audio
        death : RSX.sfx_neutral_spiritscribe_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.bossSpelleaterBreathing.name
        idle : RSX.bossSpelleaterIdle.name
        walk : RSX.bossSpelleaterRun.name
        attack : RSX.bossSpelleaterAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.bossSpelleaterHit.name
        death : RSX.bossSpelleaterDeath.name
      )
      card.atk = 3
      card.maxHP = 35
      spellWatchGainKeyword = ModifierEnemySpellWatchGainRandomKeyword.createContextObject()
      spellWatchGainKeyword.isRemovable = false
      summonsGainKeywords = ModifierAnySummonWatchGainGeneralKeywords.createContextObject()
      summonsGainKeywords.isRemovable = false
      card.setInherentModifiersContextObjects([spellWatchGainKeyword, summonsGainKeywords])
      card.signatureCardData = {id: Cards.BossSpell.EtherealWind}

    if (identifier == Cards.Boss.FrostfireImp)
      card = new Unit(gameSession)
      card.setIsHiddenInCollection(true)
      card.setIsGeneral(false)
      card.factionId = Factions.Boss
      card.name = i18next.t("cards.frostfire_imp_name")
      card.manaCost = 0
      card.setDescription(i18next.t("cards.faction_1_unit_lysian_brawler_desc"))
      card.setFXResource(["FX.Cards.Neutral.Zyx"])
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
        breathing : RSX.neutralZyxFestiveBreathing.name
        idle : RSX.neutralZyxFestiveIdle.name
        walk : RSX.neutralZyxFestiveRun.name
        attack : RSX.neutralZyxFestiveAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.6
        damage : RSX.neutralZyxFestiveHit.name
        death : RSX.neutralZyxFestiveDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.setInherentModifiersContextObjects([ModifierTranscendance.createContextObject()])

    if (identifier == Cards.Boss.FrostfireTiger)
      card = new Unit(gameSession)
      card.factionId = Factions.Boss
      card.name = i18next.t("cards.frostfire_tiger_name")
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
        breathing : RSX.neutralFrostfireTigerBreathing.name
        idle : RSX.neutralFrostfireTigerIdle.name
        walk : RSX.neutralFrostfireTigerRun.name
        attack : RSX.neutralFrostfireTigerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.4
        damage : RSX.neutralFrostfireTigerHit.name
        death : RSX.neutralFrostfireTigerDeath.name
      )
      card.atk = 3
      card.maxHP = 2
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierFirstBlood.createContextObject()])

    if (identifier == Cards.Boss.FrostfireSnowchaser)
      card = new Unit(gameSession)
      card.factionId = Factions.Boss
      card.name = i18next.t("cards.frostfire_snowchser_name")
      card.setDescription(i18next.t("cards.neutral_vale_hunter_desc"))
      card.raceId = Races.Vespyr
      card.setFXResource(["FX.Cards.Faction6.SnowElemental"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_amplification.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_artifacthunter_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_artifacthunter_hit.audio
        attackDamage : RSX.sfx_neutral_artifacthunter_attack_impact.audio
        death : RSX.sfx_neutral_artifacthunter_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.f6FestiveSnowchaserBreathing.name
        idle : RSX.f6FestiveSnowchaserIdle.name
        walk : RSX.f6FestiveSnowchaserRun.name
        attack : RSX.f6FestiveSnowchaserAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.f6FestiveSnowchaserDamage.name
        death : RSX.f6FestiveSnowchaserDeath.name
      )
      card.atk = 2
      card.maxHP = 1
      card.manaCost = 1
      card.setInherentModifiersContextObjects([ModifierRanged.createContextObject()])

    if (identifier == Cards.BossSpell.LaceratingFrost)
      card = new SpellLaceratingFrost(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.LaceratingFrost
      card.name = "Lacerating Frost"
      card.setDescription("Deal 2 damage to the enemy General and stun all nearby enemy minions.")
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.damageAmount = 2
      card.setFXResource(["FX.Cards.Spell.LaceratingFrost"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_icebeetle_death.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLaceratingFrostIdle.name
        active : RSX.iconLaceratingFrostActive.name
      )

    if (identifier == Cards.BossSpell.EntanglingShadow)
      card = new SpellEntanglingShadows(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.EntanglingShadow
      card.name = "Entangling Shadow"
      card.setDescription("Summon Wraithlings and Shadow Creep in a 2x2 area.")
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.setAffectPattern(CONFIG.PATTERN_2X2)
      card.cardDataOrIndexToSpawn = {id: Cards.Faction4.Wraithling}
      card.setFXResource(["FX.Cards.Spell.EntanglingShadow"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_shadowreflection.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconCultivatingDarkIdle.name
        active : RSX.iconCultivatingDarkActive.name
      )

    if (identifier == Cards.BossSpell.LivingFlame)
      card = new SpellDamageAndSpawnEntitiesNearbyGeneral(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.LivingFlame
      card.name = "Living Flame"
      card.setDescription("Deal 2 damage to an enemy and summon two Spellsparks nearby your General.")
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.manaCost = 1
      card.damageAmount = 2
      card.canTargetGeneral = true
      card.cardDataOrIndexToSpawn = {id: Cards.Neutral.Spellspark}
      card.setFXResource(["FX.Cards.Spell.LivingFlame"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_phoenixfire.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconLivingFlameIdle.name
        active : RSX.iconLivingFlameActive.name
      )

    if (identifier == Cards.BossSpell.MoldingEarth)
      card = new SpellMoldingEarth(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.MoldingEarth
      card.name = "Molding Earth"
      card.setDescription("Summon 3 Magmas with random keywords nearby your General.")
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.cardDataOrIndexToSpawn = {id: Cards.Faction5.MiniMagmar}
      card.setFXResource(["FX.Cards.Spell.MoldingEarth"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_disintegrate.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconModlingEarthIdle.name
        active : RSX.iconModlingEarthActive.name
      )

    if (identifier == Cards.BossSpell.EtherealWind)
      card = new SpellSilenceAndSpawnEntityNearby(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.EtherealWind
      card.name = "Ethereal Wind"
      card.setDescription("Dispel an enemy and summon a Wind Dervish nearby.")
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.manaCost = 1
      card.canTargetGeneral = true
      card.cardDataOrIndexToSpawn = {id: Cards.Faction3.Dervish}
      card.setFXResource(["FX.Cards.Spell.EtherealWind"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_entropicdecay.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEtherealWindIdle.name
        active : RSX.iconEtherealWindActive.name
      )

    if (identifier == Cards.BossSpell.RestoringLight)
      card = new SpellRestoringLight(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.RestoringLight
      card.name = "Restoring Light"
      card.setDescription("Restore 3 Health to your General. Give your friendly minions +1 Health.")
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(0,1)
      buffContextObject.appliedName = "Restored Light"
      card.setTargetModifiersContextObjects([
        buffContextObject
      ])
      card.setFXResource(["FX.Cards.Spell.RestoringLight"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_sunbloom.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconRestoringLightIdle.name
        active : RSX.iconRestoringLightActive.name
      )

    if (identifier == Cards.BossSpell.AncientKnowledge)
      card = new Spell(gameSession)
      card.factionId = Factions.Boss
      card.setIsHiddenInCollection(true)
      card.id = Cards.BossSpell.AncientKnowledge
      card.name = "Ancient Knowledge"
      card.setDescription("Draw 2 cards.")
      card.spellFilterType = SpellFilterType.None
      card.manaCost = 1
      card.drawCardsPostPlay = 2
      card.setFXResource(["FX.Cards.Spell.AncientKnowledge"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_scionsfirstwish.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAncientKnowledgeIdle.name
        active : RSX.iconAncientKnowledgeActive.name
      )

    return card

module.exports = CardFactory_Bosses
