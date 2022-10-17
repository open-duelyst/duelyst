Modifier =           require './modifier'
ModifierDestructible = require './modifierDestructible'
ModifierRanged = require './modifierRanged'
ModifierSilence =       require './modifierSilence'
ModifierBanded =     require './modifierBanded'
ModifierBandedHeal =     require './modifierBandedHeal'
ModifierBandedRanged =     require './modifierBandedRanged'
ModifierObstructing = require './modifierObstructing'
ModifierUntargetable = require './modifierUntargetable'
ModifierStackingShadows = require './modifierStackingShadows'
ModifierProvoked = require './modifierProvoked'
ModifierAttackEqualsHealth = require './modifierAttackEqualsHealth'
ModifierManaCostChange = require './modifierManaCostChange'
ModifierPortal = require './modifierPortal'
ModifierImmune = require './modifierImmune'
ModifierImmuneToAttacks = require './modifierImmuneToAttacks'
ModifierImmuneToAttacksByGeneral = require './modifierImmuneToAttacksByGeneral'
ModifierImmuneToAttacksByRanged = require './modifierImmuneToAttacksByRanged'
ModifierImmuneToDamage =   require './modifierImmuneToDamage'
ModifierImmuneToDamageByGeneral =   require './modifierImmuneToDamageByGeneral'
ModifierImmuneToDamageByRanged =   require './modifierImmuneToDamageByRanged'
ModifierImmuneToDamageBySpells = require './modifierImmuneToDamageBySpells'
ModifierImmuneToSpellsByEnemy = require './modifierImmuneToSpellsByEnemy'
ModifierImmuneToSpells = require './modifierImmuneToSpells'
ModifierFirstBlood =     require './modifierFirstBlood'
ModifierProvoke =       require './modifierProvoke'
ModifierSituationalBuffSelf =     require './modifierSituationalBuffSelf'
ModifierBanding =   require './modifierBanding'
ModifierBandingAttack =   require './modifierBandingAttack'
ModifierBandingAttackAndHealth = require './modifierBandingAttackAndHealth'
ModifierBandingHeal =     require './modifierBandingHeal'
ModifierBandingRanged =     require './modifierBandingRanged'
ModifierAirdrop =       require './modifierAirdrop'
ModifierStrikeback =     require './modifierStrikeback'
ModifierFrenzy =     require './modifierFrenzy'
ModifierOpeningGambit =     require './modifierOpeningGambit'
ModifierOpeningGambitDispel = require './modifierOpeningGambitDispel'
ModifierOpeningGambitDamageMyGeneral = require './modifierOpeningGambitDamageMyGeneral'
ModifierOpeningGambitDamageBothGenerals = require './modifierOpeningGambitDamageBothGenerals'
ModifierOpeningGambitDamageNearby = require './modifierOpeningGambitDamageNearby'
ModifierDeathWatch = require './modifierDeathWatch'
ModifierDeathWatchBuffSelf = require './modifierDeathWatchBuffSelf'
ModifierDeathWatchDamageEnemyGeneralHealMyGeneral = require './modifierDeathWatchDamageEnemyGeneralHealMyGeneral'
ModifierFlying = require './modifierFlying'
ModifierOpeningGambitSpawnEntity = require './modifierOpeningGambitSpawnEntity'
ModifierDeathWatchSpawnEntity = require './modifierDeathWatchSpawnEntity'
ModifierOpeningGambitSacrificeNearbyBuffSelf = require './modifierOpeningGambitSacrificeNearbyBuffSelf'
ModifierKillWatchSpawnEntity = require './modifierKillWatchSpawnEntity'
ModifierDyingWishBonusMana = require './modifierDyingWishBonusMana'
ModifierDyingWishDrawCard = require './modifierDyingWishDrawCard'
ModifierDyingWishSpawnEntity = require './modifierDyingWishSpawnEntity'
ModifierCollectableBonusMana = require './modifierCollectableBonusMana'
ModifierSpellWatchSpawnEntity = require './modifierSpellWatchSpawnEntity'
ModifierSpellWatch = require './modifierSpellWatch'
ModifierSpellWatchDamageGeneral = require './modifierSpellWatchDamageGeneral'
ModifierOpeningGambitRetrieveMostRecentSpell = require './modifierOpeningGambitRetrieveMostRecentSpell'
ModifierOpeningGambitRetrieveRandomSpell = require './modifierOpeningGambitRetrieveRandomSpell'
ModifierDispelOnAttack = require './modifierDispelOnAttack'
ModifierSummonWatchHealSelf = require './modifierSummonWatchHealSelf'
ModifierDamageGeneralOnAttack = require './modifierDamageGeneralOnAttack'
ModifierStartTurnWatchSpawnEntity = require './modifierStartTurnWatchSpawnEntity'
ModifierStartTurnWatchDamageMyGeneral = require './modifierStartTurnWatchDamageMyGeneral'
ModifierBlastAttack = require './modifierBlastAttack'
ModifierBlastAttackStrong = require './modifierBlastAttackStrong'
ModifierBackstab = require './modifierBackstab'
ModifierTranscendance = require './modifierTranscendance'
ModifierMyAttackWatch = require './modifierMyAttackWatch'
ModifierMyAttackWatchBuffSelf = require './modifierMyAttackWatchBuffSelf'
ModifierDyingWishDamageGeneral = require './modifierDyingWishDamageGeneral'
ModifierDyingWishDamageEnemyGeneralHealGeneral = require './modifierDyingWishDamageEnemyGeneralHealGeneral'
ModifierOpeningGambitRefreshArtifacts = require './modifierOpeningGambitRefreshArtifacts'
ModifierDealDamageWatchKillTargetAndSelf = require './modifierDealDamageWatchKillTargetAndSelf'
ModifierDealDamageWatchKillTarget = require './modifierDealDamageWatchKillTarget'
ModifierSpellWatchBloodLeech = require './modifierSpellWatchBloodLeech'
ModifierSummonWatchPutCardInHand = require './modifierSummonWatchPutCardInHand'
ModifierSpellWatchBuffAlliesByRace = require './modifierSpellWatchBuffAlliesByRace'
ModifierCardControlledPlayerModifiers = require './modifierCardControlledPlayerModifiers'
ModifierOpeningGambitApplyModifiers = require './modifierOpeningGambitApplyModifiers'
ModifierOpeningGambitApplyModifiersToDeck = require './modifierOpeningGambitApplyModifiersToDeck'
ModifierOpeningGambitApplyPlayerModifier = require './modifierOpeningGambitApplyPlayerModifiers'
ModifierOpeningGambitApplyMechazorPlayerModifiers = require './modifierOpeningGambitApplyMechazorPlayerModifiers'
ModifierRangedProvoked = require './modifierRangedProvoked'
ModifierRangedProvoke = require './modifierRangedProvoke'
ModifierDealDamageWatchModifyTarget = require './modifierDealDamageWatchModifyTarget'
ModifierDyingWishSpawnEntityAnywhere = require './modifierDyingWishSpawnEntityAnywhere'
ModifierStartTurnWatchDamageEnemyGeneralBuffSelf = require './modifierStartTurnWatchDamageEnemyGeneralBuffSelf'
ModifierStunned = require './modifierStunned'
ModifierGrow = require './modifierGrow'
ModifierRebirth = require './modifierRebirth'
ModifierEgg = require './modifierEgg'
ModifierEndTurnWatchSpawnEgg = require './modifierEndTurnWatchSpawnEgg'
ModifierEndTurnWatchSpawnEntity = require './modifierEndTurnWatchSpawnEntity'
ModifierEndTurnWatchDamageAllMinions = require './modifierEndTurnWatchDamageAllMinions'
ModifierForcefield = require './modifierForcefield'
ModifierAntiMagicField = require './modifierAntiMagicField'
ModifierDyingWishApplyModifiers = require './modifierDyingWishApplyModifiers'
ModifierOpeningGambitDamageInFront = require './modifierOpeningGambitDamageInFront'
ModifierMyGeneralDamagedWatch = require './modifierMyGeneralDamagedWatch'
ModifierMyGeneralDamagedWatchBuffSelf = require './modifierMyGeneralDamagedWatchBuffSelf'
ModifierMyGeneralDamagedWatchHealSelf = require './modifierMyGeneralDamagedWatchHealSelf'
ModifierMyGeneralDamagedWatchDamageNearby = require './modifierMyGeneralDamagedWatchDamageNearby'
ModifierSummonWatchByEntityBuffSelf = require './modifierSummonWatchByEntityBuffSelf'
ModifierStartTurnWatchSummonDervish = require './modifierStartTurnWatchSummonDervish'
ModifierEphemeral = require './modifierEphemeral'
ModifierInfiltrate = require './modifierInfiltrate'
ModifierCannot = require './modifierCannot'
ModifierCannotAttackGeneral = require './modifierCannotAttackGeneral'
ModifierCannotStrikeback = require './modifierCannotStrikeback'
ModifierSummonWatchByRaceBuffSelf = require './modifierSummonWatchByRaceBuffSelf'
ModifierSummonWatchSpawnEntity = require './modifierSummonWatchSpawnEntity'
ModifierTakeDamageWatch = require './modifierTakeDamageWatch'
ModifierTakeDamageWatchHealMyGeneral = require './modifierTakeDamageWatchHealMyGeneral'
ModifierStartTurnWatchDamageRandom = require './modifierStartTurnWatchDamageRandom'
ModifierSummonWatchByRaceDamageEnemyMinion = require './modifierSummonWatchByRaceDamageEnemyMinion'
ModifierEndTurnWatch = require './modifierEndTurnWatch'
ModifierEndTurnWatchDamageNearbyEnemy = require './modifierEndTurnWatchDamageNearbyEnemy'
ModifierBandingDoubleAttack = require './modifierBandingDoubleAttack'
ModifierBandedDoubleAttack = require './modifierBandedDoubleAttack'
ModifierOpeningGambitHealMyGeneral = require './modifierOpeningGambitHealMyGeneral'
ModifierDoubleDamageToMinions = require './modifierDoubleDamageToMinions'
ModifierOpeningGambitBuffSelfByShadowTileCount = require './modifierOpeningGambitBuffSelfByShadowTileCount'
ModifierDealDamageWatchHealMyGeneral = require './modifierDealDamageWatchHealMyGeneral'
ModifierOpponentSummonWatch = require './modifierOpponentSummonWatch'
ModifierOpponentSummonWatchBuffSelf = require './modifierOpponentSummonWatchBuffSelf'
ModifierStartTurnWatchBounceToActionBar = require './modifierStartTurnWatchBounceToActionBar'
ModifierTakeDamageWatchDamageEnemy = require './modifierTakeDamageWatchDamageEnemy'
ModifierOpeningGambitDamageNearbyMinions = require './modifierOpeningGambitDamageNearbyMinions'
ModifierDestroyAtEndOfTurn = require './modifierDestroyAtEndOfTurn'
ModifierMyMinionOrGeneralDamagedWatch = require './modifierMyMinionOrGeneralDamagedWatch'
ModifierMyMinionOrGeneralDamagedWatchBuffSelf = require './modifierMyMinionOrGeneralDamagedWatchBuffSelf'
ModifierAbsorbDamage = require './modifierAbsorbDamage'
ModifierDyingWishSpawnUnitFromOpponentsDeck = require './modifierDyingWishSpawnUnitFromOpponentsDeck'
ModifierTransformed = require './modifierTransformed'
ModifierStunWhenAttacked = require './modifierStunWhenAttacked'
ModifierWall = require './modifierWall'
ModifierOpeningGambitSpawnCopiesOfEntityAnywhere = require './modifierOpeningGambitSpawnCopiesOfEntityAnywhere'
ModifierSummonWatchBuffSelf = require './modifierSummonWatchBuffSelf'
ModifierOpponentSummonWatchDamageEnemyGeneral = require './modifierOpponentSummonWatchDamageEnemyGeneral'
ModifierDyingWishEquipArtifactFromDeck = require './modifierDyingWishEquipArtifactFromDeck'
ModifierOpeningGambitDrawArtifactFromDeck = require './modifierOpeningGambitDrawArtifactFromDeck'
ModifierSummonWatchApplyModifiers = require './modifierSummonWatchApplyModifiers'
ModifierSummonWatchNearbyApplyModifiers = require './modifierSummonWatchNearbyApplyModifiers'
ModifierTakeDamageWatchRandomTeleport = require './modifierTakeDamageWatchRandomTeleport'
ModifierOpeningGambitSpawnEntityInEachCorner = require './modifierOpeningGambitSpawnEntityInEachCorner'
ModifierDyingWishBonusManaCrystal = require './modifierDyingWishBonusManaCrystal'
ModifierOpeningGambitMindwarp = require './modifierOpeningGambitMindwarp'
ModifierReduceCostOfMinionsAndDamageThem = require './modifierReduceCostOfMinionsAndDamageThem'
ModifierStunnedVanar = require './modifierStunnedVanar'
ModifierEndTurnWatchSpawnRandomEntity = require './modifierEndTurnWatchSpawnRandomEntity'
ModifierDealDamageWatchSpawnEntity = require './modifierDealDamageWatchSpawnEntity'
ModifierSpellDamageWatch = require './modifierSpellDamageWatch'
ModifierSpellDamageWatchPutCardInHand = require './modifierSpellDamageWatchPutCardInHand'
ModifierOpeningGambitRemoveRandomArtifact = require './modifierOpeningGambitRemoveRandomArtifact'
ModifierEndTurnWatchHealNearby = require './modifierEndTurnWatchHealNearby'
ModifierDealDamageWatchTeleportToMe = require './modifierDealDamageWatchTeleportToMe'
ModifierWraithlingFury = require './modifierWraithlingFury'
ModifierOpeningGambitRazorback = require './modifierOpeningGambitRazorback'
ModifierDyingWishSpawnEntityNearbyGeneral = require './modifierDyingWishSpawnEntityNearbyGeneral'
ModifierSummonWatchFromActionBarSpawnEntity = require './modifierSummonWatchFromActionBarSpawnEntity'
ModifierOpeningGambitBuffSelfByOpponentHandCount = require './modifierOpeningGambitBuffSelfByOpponentHandCount'
ModifierTakeDamageWatchDamageEnemyGeneralForSame = require './modifierTakeDamageWatchDamageEnemyGeneralForSame'
ModifierDealDamageWatchBuffSelf = require './modifierDealDamageWatchBuffSelf'
ModifierDyingWishDamageNearbyAllies = require './modifierDyingWishDamageNearbyAllies'
ModifierKillWatchHealSelf = require './modifierKillWatchHealSelf'
ModifierBandingDealDamageWatchDrawCard = require './modifierBandingDealDamageWatchDrawCard'
ModifierDealDamageWatchDrawCard = require './modifierDealDamageWatchDrawCard'
ModifierStartTurnWatchSwapStats = require './modifierStartTurnWatchSwapStats'
ModifierHealSelfWhenDealingDamage = require './modifierHealSelfWhenDealingDamage'
ModifierDealDamageWatchHealorDamageGeneral = require './modifierDealDamageWatchHealorDamageGeneral'
ModifierDyingWishPutCardInHand = require './modifierDyingWishPutCardInHand'
ModifierDyingWishPutCardInHandClean = require './modifierDyingWishPutCardInHandClean'
ModifierOpeningGambitLifeGive = require './modifierOpeningGambitLifeGive'
ModifierOpeningGambitTeleportAllNearby = require './modifierOpeningGambitTeleportAllNearby'
ModifierRook = require './modifierRook'
ModifierEndTurnWatchHealSelfAndGeneral = require './modifierEndTurnWatchHealSelfAndGeneral'
ModifierEndTurnWatchHealSelf = require './modifierEndTurnWatchHealSelf'
ModifierBandingHealSelfAndGeneral = require './modifierBandingHealSelfAndGeneral'
ModifierDeathWatchDrawToXCards = require './modifierDeathWatchDrawToXCards'
ModifierDyingWishSpawnTile = require './modifierDyingWishSpawnTile'
ModifierDyingWishReSpawnEntityAnywhere = require './modifierDyingWishReSpawnEntityAnywhere'
ModifierSummonWatchNearbyApplyModifiersOncePerTurn = require './modifierSummonWatchNearbyApplyModifiersOncePerTurn'
ModifierHealWatch = require './modifierHealWatch'
ModifierHealWatchBuffSelf = require './modifierHealWatchBuffSelf'
ModifierHealWatchDamageNearbyEnemies = require './modifierHealWatchDamageNearbyEnemies'
ModifierRemoveAndReplaceEntity = require './modifierRemoveAndReplaceEntity'
ModifierMyMoveWatch = require './modifierMyMoveWatch'
ModifierMyMoveWatchSpawnEntity = require './modifierMyMoveWatchSpawnEntity'
ModifierMyMoveWatchApplyModifiers = require './modifierMyMoveWatchApplyModifiers'
ModifierMyMoveWatchDrawCard = require './modifierMyMoveWatchDrawCard'
ModifierDyingWishSpawnEntityInCorner = require './modifierDyingWishSpawnEntityInCorner'
ModifierSpiritScribe = require './modifierSpiritScribe'
ModifierTakeDamageWatchSpawnRandomToken = require './modifierTakeDamageWatchSpawnRandomToken'
ModifierBackupGeneral = require './modifierBackupGeneral'
ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf = require './modifierSummonWatchFromActionBarByOpeningGambitBuffSelf'
ModifierOpeningGambitApplyModifiersRandomly = require './modifierOpeningGambitApplyModifiersRandomly'
ModifierImmuneToSpellDamage = require 'app/sdk/modifiers/modifierImmuneToSpellDamage'
ModifierReplaceWatchDamageEnemy = require './../../sdk/modifiers/modifierReplaceWatchDamageEnemy'
ModifierReplaceWatchBuffSelf = require './../../sdk/modifiers/modifierReplaceWatchBuffSelf'
ModifierBuffSelfOnReplace = require './../../sdk/modifiers/modifierBuffSelfOnReplace'
ModifierSummonSelfOnReplace = require './../../sdk/modifiers/modifierSummonSelfOnReplace'
ModifierTakeDamageWatchDispel = require './../../sdk/modifiers/modifierTakeDamageWatchDispel'
ModifierTakeDamageWatchPutCardInHand = require './../../sdk/modifiers/modifierTakeDamageWatchPutCardInHand'
ModifierOpeningGambitDrawCardBothPlayers = require './../../sdk/modifiers/modifierOpeningGambitDrawCardBothPlayers'
ModifierSurviveDamageWatchReturnToHand = require './../../sdk/modifiers/modifierSurviveDamageWatchReturnToHand'
ModifierOpeningGambitDamageNearbyForAttack = require './../../sdk/modifiers/modifierOpeningGambitDamageNearbyForAttack'
ModifierMyAttackOrAttackedWatchDrawCard = require './../../sdk/modifiers/modifierMyAttackOrAttackedWatchDrawCard'
ModifierForcefieldAbsorb = require './../../sdk/modifiers/modifierForcefieldAbsorb'
ModifierUnseven = require './modifierUnseven'
ModifierDoubleDamageToGenerals = require './../../sdk/modifiers/modifierDoubleDamageToGenerals'
ModifierShadowScar = require 'app/sdk/modifiers/modifierShadowScar'
ModifierStackingShadowsDebuff = require 'app/sdk/modifiers/modifierStackingShadowsDebuff'
ModifierEndTurnWatchApplyModifiers = require 'app/sdk/modifiers/modifierEndTurnWatchApplyModifiers'
ModifierOpeningGambitApplyModifiersToDeckAndHand = require './modifierOpeningGambitApplyModifiersToDeckAndHand'
ModifierOpeningGambitApplyModifiersToHand = require './modifierOpeningGambitApplyModifiersToHand'
ModifierMechazorWatchPutMechazorInHand = require './modifierMechazorWatchPutMechazorInHand.coffee'
ModifierHealWatchPutCardInHand = require './modifierHealWatchPutCardInHand'
ModifierEnemyCannotHeal = require './modifierEnemyCannotHeal'
ModifierEnemyTakeDamageWatchHealMyGeneral = require './modifierEnemyTakeDamageWatchHealMyGeneral'
ModifierTakeDamageWatchDamageNearbyForSame = require './modifierTakeDamageWatchDamageNearbyEnemiesForSame'
ModifierImmuneToDamageFromEnemyMinions = require './modifierImmuneToDamageFromEnemyMinions'
ModifierDoubleDamageToEnemyMinions = require './modifierDoubleDamageToEnemyMinions'
ModifierOpeningGambitDrawFactionCards = require './modifierOpeningGambitDrawFactionCards'
ModifierOpeningGambitHealBothGenerals = require './modifierOpeningGambitHealBothGenerals'
ModifierOpponentDrawCardWatchBuffSelf = require './modifierOpponentDrawCardWatchBuffSelf'
ModifierEnvyBaer = require './modifierEnvyBaer'
ModifierOpeningGambitGrincher = require './modifierOpeningGambitGrincher'
ModifierSpellWatchScientist = require './modifierSpellWatchScientist'
ModifierOpeningGambitDamageEverything = require './modifierOpeningGambitDamageEverything'
ModifierCostChangeIfMyGeneralDamagedLastTurn = require './modifierCostChangeIfMyGeneralDamagedLastTurn'
ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard = require './modifierMyGeneralDamagedWatchBuffSelfAndDrawACard'
ModifierDynamicCountModifySelf = require './modifierDynamicCountModifySelf'
ModifierCostEqualGeneralHealth = require './modifierCostEqualGeneralHealth'
ModifierStackingShadowsBonusDamage = require './modifierStackingShadowsBonusDamage'
ModifierDynamicCountModifySelfByShadowTilesOnBoard = require './modifierDynamicCountModifySelfByShadowTilesOnBoard'
ModifierBattlePet = require 'app/sdk/modifiers/modifierBattlePet'
ModifierCannotMove = require 'app/sdk/modifiers/modifierCannotMove'
ModifierOpeningGambitDrawRandomBattlePet = require 'app/sdk/modifiers/modifierOpeningGambitDrawRandomBattlePet'
ModifierDyingWishDamageNearbyEnemies = require 'app/sdk/modifiers/modifierDyingWishDamageNearbyEnemies'
ModifierDealDamageWatchKillNeutralTarget = require 'app/sdk/modifiers/modifierDealDamageWatchKillNeutralTarget'
ModifierTakeDamageWatchSpawnRandomBattlePet = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnRandomBattlePet'
ModifierDyingWishDrawMechazorCard = require 'app/sdk/modifiers/modifierDyingWishDrawMechazorCard'
ModifierOpeningGambitApplyModifiersByRaceId = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersByRaceId'
ModifierOpeningGambitApplyModifiersToGeneral = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersToGeneral'
ModifierOpeningGambitDrawCard = require 'app/sdk/modifiers/modifierOpeningGambitDrawCard'
ModifierEndTurnWatchApplyModifiersRandomly = require 'app/sdk/modifiers/modifierEndTurnWatchApplyModifiersRandomly'
ModifierBandingChangeCardDraw = require 'app/sdk/modifiers/modifierBandingChangeCardDraw'
ModifierTakeDamageWatchDamageAllEnemies = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageAllEnemies'
ModifierDyingWishXho = require 'app/sdk/modifiers/modifierDyingWishXho'
ModifierDyingWishDrawRandomBattlePet = require 'app/sdk/modifiers/modifierDyingWishDrawRandomBattlePet'
ModifierAnyDrawCardWatchBuffSelf = require 'app/sdk/modifiers/modifierAnyDrawCardWatchBuffSelf'
ModifierTakeDamageWatchDestroy = require 'app/sdk/modifiers/modifierTakeDamageWatchDestroy'
ModifierDyingWishSpawnRandomEntity = require 'app/sdk/modifiers/modifierDyingWishSpawnRandomEntity'
ModifierTakeDamageWatchSpawnEntity = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnEntity'
ModifierPantheran = require 'app/sdk/modifiers/modifierPantheran'
ModifierEndTurnWatchSwapAllegiance = require 'app/sdk/modifiers/modifierEndTurnWatchSwapAllegiance'
ModifierDyingWishCorpseCombustion = require 'app/sdk/modifiers/modifierDyingWishCorpseCombustion'
ModifierOpeningGambitApplyModifiersToWraithlings = require 'app/sdk/modifiers/modifierOpeningGambitApplyModifiersToWraithlings'
ModifierInkhornGaze = require 'app/sdk/modifiers/modifierInkhornGaze'
ModifierDeathWatchBuffRandomMinionInHand = require 'app/sdk/modifiers/modifierDeathWatchBuffRandomMinionInHand'
ModifierOpeningGambitHatchFriendlyEggs = require 'app/sdk/modifiers/modifierOpeningGambitHatchFriendlyEggs'
ModifierGrowOnBothTurns = require 'app/sdk/modifiers/modifierGrowOnBothTurns'
ModifierSummonWatchFromEggApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchFromEggApplyModifiers'
ModifierAnySummonWatchFromActionBarApplyModifiersToSelf = require 'app/sdk/modifiers/modifierAnySummonWatchFromActionBarApplyModifiersToSelf'
ModifierSnowRippler = require 'app/sdk/modifiers/modifierSnowRippler'
ModifierSurviveDamageWatchBur = require 'app/sdk/modifiers/modifierSurviveDamageWatchBur'
ModifierSummonWatchByRaceHealToFull = require 'app/sdk/modifiers/modifierSummonWatchByRaceHealToFull'
ModifierSummonWatchByCardBuffTarget = require 'app/sdk/modifiers/modifierSummonWatchByCardBuffTarget'
ModifierOpeningGambitDamageEnemiesNearShadowCreep = require 'app/sdk/modifiers/modifierOpeningGambitDamageEnemiesNearShadowCreep'
ModifierMyAttackOrAttackedWatchSpawnMinionNearby = require 'app/sdk/modifiers/modifierMyAttackOrAttackedWatchSpawnMinionNearby'
ModifierSummonWatchDreadnaught = require 'app/sdk/modifiers/modifierSummonWatchDreadnaught'
ModifierReplaceWatchSpawnEntity = require 'app/sdk/modifiers/modifierReplaceWatchSpawnEntity'
ModifierDynamicCountModifySelfCostByBattlePetsOnBoard = require 'app/sdk/modifiers/modifierDynamicCountModifySelfCostByBattlePetsOnBoard'
ModifierApplyMinionToBoardWatchApplyModifiersToTarget = require 'app/sdk/modifiers/modifierApplyMinionToBoardWatchApplyModifiersToTarget'
ModifierKillWatchSpawnEnemyEntity = require 'app/sdk/modifiers/modifierKillWatchSpawnEnemyEntity'
ModifierEndEveryTurnWatchDamageOwner = require 'app/sdk/modifiers/modifierEndEveryTurnWatchDamageOwner'
ModifierMyTeamMoveWatchAnyReason = require 'app/sdk/modifiers/modifierMyTeamMoveWatchAnyReason'
ModifierMyTeamMoveWatchAnyReasonBuffTarget = require 'app/sdk/modifiers/modifierMyTeamMoveWatchAnyReasonBuffTarget'
ModifierEndTurnWatchRefreshArtifacts = require 'app/sdk/modifiers/modifierEndTurnWatchRefreshArtifacts'
ModifierGainAttackWatchBuffSelfBySameThisTurn = require 'app/sdk/modifiers/modifierGainAttackWatchBuffSelfBySameThisTurn'
ModifierInquisitorKron = require 'app/sdk/modifiers/modifierInquisitorKron'
ModifierTakeDamageWatchSpawnShadowCreep = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnShadowCreep'
ModifierDyingWishApplyModifiersRandomly = require 'app/sdk/modifiers/modifierDyingWishApplyModifiersRandomly'
ModifierOpeningGambitBuffSelfByBattlePetsHandStats = require 'app/sdk/modifiers/modifierOpeningGambitBuffSelfByBattlePetsHandStats'
ModifierHealWatchBuffGeneral = require 'app/sdk/modifiers/modifierHealWatchBuffGeneral'
ModifierDealDamageWatchHatchEggs = require 'app/sdk/modifiers/modifierDealDamageWatchHatchEggs'
ModifierDyingWishDispelNearestEnemy = require 'app/sdk/modifiers/modifierDyingWishDispelNearestEnemy'
ModifierSpawnedFromEgg = require 'app/sdk/modifiers/modifierSpawnedFromEgg'
ModifierTamedBattlePet = require 'app/sdk/modifiers/modifierTamedBattlePet'
ModifierFriendlyDeathWatchForBattlePetDrawCard = require 'app/sdk/modifiers/modifierFriendlyDeathWatchForBattlePetDrawCard'
ModifierDyingWishSpawnTileAnywhere = require 'app/sdk/modifiers/modifierDyingWishSpawnTileAnywhere'
ModifierElkowl = require './modifierElkowl'
ModifierOpeningGambitPutCardInOpponentHand = require './modifierOpeningGambitPutCardInOpponentHand'
ModifierEndTurnWatchSpawnTile = require './modifierEndTurnWatchSpawnTile'
ModifierMyMinionAttackWatchHealGeneral = require './modifierMyMinionAttackWatchHealGeneral'
ModifierImmuneToDamageFromMinionsAndGenerals = require './modifierImmuneToDamageFromMinionsAndGenerals'
ModifierOpeningGambitDamageInFrontRow = require './modifierOpeningGambitDamageInFrontRow'
ModifierInvalidateRush = require './modifierInvalidateRush'
ModifierStartTurnWatchEquipArtifact = require './modifierStartTurnWatchEquipArtifact'
ModifierStartTurnWatchPlaySpell = require './modifierStartTurnWatchPlaySpell'
ModifierOpeningGambitSpawnCopiesOfEntityNearby = require './modifierOpeningGambitSpawnCopiesOfEntityNearby'
ModifierDyingWishDispelAllEnemyMinions = require './modifierDyingWishDispelAllEnemyMinions'
ModifierOpponentDrawCardWatchDamageEnemyGeneral = require './modifierOpponentDrawCardWatchDamageEnemyGeneral'
ModifierAttacksDealNoDamage = require './modifierAttacksDealNoDamage'
ModifierOpeningGambitRefreshSignatureCard = require './modifierOpeningGambitRefreshSignatureCard'
ModifierSynergizeSpawnVanarToken = require './modifierSynergizeSpawnVanarToken'
ModifierOpeningGambitChangeSignatureCard = require './modifierOpeningGambitChangeSignatureCard'
ModifierDoubleAttackStat = require './modifierDoubleAttackStat'
ModifierSynergizeApplyModifiers = require './modifierSynergizeApplyModifiers'
ModifierMyGeneralDamagedWatchBuffSelfAttackForSame = require './modifierMyGeneralDamagedWatchBuffSelfAttackForSame'
ModifierKillWatchRefreshExhaustion = require './modifierKillWatchRefreshExhaustion'
ModifierHasBackstab = require './modifierHasBackstab'
ModifierDealDamageWatchRefreshSignatureCard = require './modifierDealDamageWatchRefreshSignatureCard'
ModifierOpeningGambitGrandmasterVariax = require './modifierOpeningGambitGrandmasterVariax'
ModifierSynergizeRefreshSpell = require './modifierSynergizeRefreshSpell'
ModifierImmuneToDamageOnEnemyTurn = require './modifierImmuneToDamageOnEnemyTurn'
ModifierOpeningGambitDestroyNearbyMinions = require './modifierOpeningGambitDestroyNearbyMinions'
ModifierSynergizeHealMyGeneral = require './modifierSynergizeHealMyGeneral'
ModifierSynergizeDamageEnemyGeneral = require './modifierSynergizeDamageEnemyGeneral'
ModifierSynergizeApplyModifiersToGeneral = require './modifierSynergizeApplyModifiersToGeneral'
ModifierSynergizeDamageEnemy = require './modifierSynergizeDamageEnemy'
ModifierSynergizeApplyModifiersToWraithlings = require './modifierSynergizeApplyModifiersToWraithlings'
ModifierOpeningGambitSpawnVanarTokensAroundGeneral = require './modifierOpeningGambitSpawnVanarTokensAroundGeneral'
ModifierDyingWishTransformRandomMinion = require './modifierDyingWishTransformRandomMinion'
ModifierOnSpawnCopyMyGeneral = require './modifierOnSpawnCopyMyGeneral'
ModifierTakesDoubleDamage = require './modifierTakesDoubleDamage'
ModifierMyHealWatchAnywhereBuffSelf = require './modifierMyHealWatchAnywhereBuffSelf'
ModifierToggleStructure = require './modifierToggleStructure'
ModifierSynergizeTeleportRandomEnemy = require './modifierSynergizeTeleportRandomEnemy'
ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard = require './modifierStartTurnWatchDispelAllEnemyMinionsDrawCard'
ModifierAbsorbDamageGolems = require './modifierAbsorbDamageGolems'
ModifierExpireApplyModifiers = require './modifierExpireApplyModifiers'
ModifierSecondWind = require './modifierSecondWind'
ModifierKillWatchRespawnEntity = require './modifierKillWatchRespawnEntity'
ModifierOpponentSummonWatchSpawn1HealthClone = require './modifierOpponentSummonWatchSpawn1HealthClone'
ModifierDealOrTakeDamageWatch = require './modifierDealOrTakeDamageWatch'
ModifierDealOrTakeDamageWatchRandomTeleportOther = require './modifierDealOrTakeDamageWatchRandomTeleportOther'
ModifierEndTurnWatchTeleportCorner = require './modifierEndTurnWatchTeleportCorner'
ModifierDieSpawnNewGeneral = require './modifierDieSpawnNewGeneral'
ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies = require './modifierEndTurnWatchDealDamageToSelfAndNearbyEnemies'
ModifierBond = require './modifierBond'
ModifierBondApplyModifiers = require './modifierBondApplyModifiers'
ModifierDoubleHealthStat = require './modifierDoubleHealthStat'
ModifierBandingApplyModifiers = require './modifierBandingApplyModifiers'
ModifierBondApplyModifiersByRaceId = require './modifierBondApplyModifiersByRaceId'
ModifierBelongsToAllRaces = require './modifierBelongsToAllRaces'
ModifierOpeningGambitGoleminate = require './modifierOpeningGambitGoleminate'
ModifierSpellWatchDrawRandomArcanyst = require './modifierSpellWatchDrawRandomArcanyst'
ModifierOpeningGambitSpawnTribal = require './modifierOpeningGambitSpawnTribal'
ModifierDyingWishSpawnTribal = require './modifierDyingWishSpawnTribal'
ModifierDrawCardWatchCopySpell = require './modifierDrawCardWatchCopySpell'
ModifierBondPutCardsInHand = require './modifierBondPutCardsInHand'
ModifierSpellWatchBuffAllies = require './modifierSpellWatchBuffAllies'
ModifierBondDrawCards = require './modifierBondDrawCards'
ModifierMyAttackWatchGetSonghaiSpells = require 'app/sdk/modifiers/modifierMyAttackWatchGetSonghaiSpells'
ModifierBondSpawnEntity = require 'app/sdk/modifiers/modifierBondSpawnEntity'
ModifierHealWatchDamageRandomEnemy = require 'app/sdk/modifiers/modifierHealWatchDamageRandomEnemy'
ModifierOpeningGambitSirocco = require 'app/sdk/modifiers/modifierOpeningGambitSirocco'
ModifierBondNightshroud = require 'app/sdk/modifiers/modifierBondNightshroud'
ModifierSpellWatchPutCardInHand = require 'app/sdk/modifiers/modifierSpellWatchPutCardInHand'
ModifierNocturne = require 'app/sdk/modifiers/modifierNocturne'
ModifierOpeningGambitDeathKnell = require 'app/sdk/modifiers/modifierOpeningGambitDeathKnell'
ModifierBondHealMyGeneral = require 'app/sdk/modifiers/modifierBondHealMyGeneral'
ModifierTakeDamageWatchJuggernaut = require 'app/sdk/modifiers/modifierTakeDamageWatchJuggernaut'
ModifierKillWatchSpawnCopyNearby = require 'app/sdk/modifiers/modifierKillWatchSpawnCopyNearby'
ModifierOnRemoveSpawnRandomDeadEntity = require 'app/sdk/modifiers/modifierOnRemoveSpawnRandomDeadEntity'
ModifierGrowPermanent = require 'app/sdk/modifiers/modifierGrowPermanent'
ModifierShatteringHeart = require 'app/sdk/modifiers/modifierShatteringHeart'
ModifierOpeningGambitEquipArtifact = require 'app/sdk/modifiers/modifierOpeningGambitEquipArtifact'
ModifierFeralu = require 'app/sdk/modifiers/modifierFeralu'
ModifierKillWatchSpawnCopyNearby = require 'app/sdk/modifiers/modifierKillWatchSpawnCopyNearby'
ModifierDispelAreaAttack = require 'app/sdk/modifiers/modifierDispelAreaAttack'
ModifierSelfDamageAreaAttack = require 'app/sdk/modifiers/modifierSelfDamageAreaAttack'
ModifierSummonWatchAnyPlayer = require 'app/sdk/modifiers/modifierSummonWatchAnyPlayer'
ModifierSummonWatchAnyPlayerApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchAnyPlayerApplyModifiers'
ModifierSummonWatchNearbyAnyPlayerApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchNearbyAnyPlayerApplyModifiers'
ModifierOpponentSummonWatchOpponentDrawCard = require 'app/sdk/modifiers/modifierOpponentSummonWatchOpponentDrawCard'
ModifierOpponentDrawCardWatchOverdrawSummonEntity = require 'app/sdk/modifiers/modifierOpponentDrawCardWatchOverdrawSummonEntity'
ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana = require 'app/sdk/modifiers/modifierEndTurnWatchDamagePlayerBasedOnRemainingMana'
ModifierHPChange = require 'app/sdk/modifiers/modifierHPChange'
ModifierHPThresholdGainModifiers = require 'app/sdk/modifiers/modifierHPThresholdGainModifiers'
ModifierExtraDamageOnCounterattack = require 'app/sdk/modifiers/modifierExtraDamageOnCounterattack'
ModifierOnOpponentDeathWatch = require 'app/sdk/modifiers/modifierOnOpponentDeathWatch'
ModifierOnOpponentDeathWatchSpawnEntityOnSpace = require 'app/sdk/modifiers/modifierOnOpponentDeathWatchSpawnEntityOnSpace'
ModifierDyingWishSpawnEgg = require 'app/sdk/modifiers/modifierDyingWishSpawnEgg'
ModifierSummonWatchFromActionBarApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarApplyModifiers'
ModifierTakeDamageWatchSpawnWraithlings = require 'app/sdk/modifiers/modifierTakeDamageWatchSpawnWraithlings'
ModifierTakeDamageWatchDamageAttacker = require 'app/sdk/modifiers/modifierTakeDamageWatchDamageAttacker'
ModifierStartTurnWatchTeleportRandomSpace = require 'app/sdk/modifiers/modifierStartTurnWatchTeleportRandomSpace'
ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarAnyPlayerApplyModifiers'
ModifierSummonWatchFromActionBarAnyPlayer = require 'app/sdk/modifiers/modifierSummonWatchFromActionBarAnyPlayer'
ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned = require 'app/sdk/modifiers/modifierStartTurnWatchDamageGeneralEqualToMinionsOwned'
ModifierHPChangeSummonEntity = require 'app/sdk/modifiers/modifierHPChangeSummonEntity'
ModifierStartTurnWatchDamageAndBuffSelf = require 'app/sdk/modifiers/modifierStartTurnWatchDamageAndBuffSelf'
ModifierEnemyTeamMoveWatch = require 'app/sdk/modifiers/modifierEnemyTeamMoveWatch'
ModifierEnemyTeamMoveWatchSummonEntityBehind = require 'app/sdk/modifiers/modifierEnemyTeamMoveWatchSummonEntityBehind'
ModifierDyingWishLoseGame = require 'app/sdk/modifiers/modifierDyingWishLoseGame'
ModifierAttacksDamageAllEnemyMinions = require 'app/sdk/modifiers/modifierAttacksDamageAllEnemyMinions'
ModifierATKThresholdDie = require 'app/sdk/modifiers/modifierATKThresholdDie'
ModifierOverwatchHidden = require './modifierOverwatchHidden'
ModifierOverwatchAttackedBuffSelf = require './modifierOverwatchAttackedBuffSelf'
ModifierOverwatchMovedNearbyAttack = require './modifierOverwatchMovedNearbyAttack'
ModifierOverwatchMovedNearbyMoveBothToCorners = require './modifierOverwatchMovedNearbyMoveBothToCorners'
ModifierOverwatchMovedNearbyDispelAndProvoke = require './modifierOverwatchMovedNearbyDispelAndProvoke'
ModifierOverwatchDestroyedResummonAndDestroyOther = require './modifierOverwatchDestroyedResummonAndDestroyOther'
ModifierOverwatchMovedNearbyMiniImmolation = require './modifierOverwatchMovedNearbyMiniImmolation'
ModifierOverwatchDestroyedPutCardInHand = require './modifierOverwatchDestroyedPutCardInHand'
ModifierOverwatchAttackedDamageEnemyGeneralForSame = require './modifierOverwatchAttackedDamageEnemyGeneralForSame'
ModifierOverwatchDestroyedPutMagmarCardsInHand = require './modifierOverwatchDestroyedPutMagmarCardsInHand'
ModifierEnemyMinionAttackWatchGainKeyword = require './modifierEnemyMinionAttackWatchGainKeyword'
ModifierOpeningGambitSpawnEnemyMinionNearOpponent = require './modifierOpeningGambitSpawnEnemyMinionNearOpponent'
ModifierEnemyDealDamageWatch = require './modifierEnemyDealDamageWatch'
ModifierEnemySpellWatch = require './modifierEnemySpellWatch'
ModifierEnemySpellWatchBuffSelf = require './modifierEnemySpellWatchBuffSelf'
ModifierOpponentDrawCardWatchGainKeyword = require './modifierOpponentDrawCardWatchGainKeyword'
ModifierOpponentSummonWatchSummonEgg = require './modifierOpponentSummonWatchSummonEgg'
ModifierOpponentSummonWatchBuffMinionInHand = require './modifierOpponentSummonWatchBuffMinionInHand'
ModifierSummonWatchAnyPlayer = require './modifierSummonWatchAnyPlayer'
ModifierEndTurnWatchTransformNearbyEnemies = require './modifierEndTurnWatchTransformNearbyEnemies'
ModifierBackstabWatch = require './modifierBackstabWatch'
ModifierBackstabWatchStealSpellFromDeck = require './modifierBackstabWatchStealSpellFromDeck'
ModifierDyingWishDrawMinionsWithDyingWish = require './modifierDyingWishDrawMinionsWithDyingWish'
ModifierOverwatchSpellTarget = require './modifierOverwatchSpellTarget'
ModifierOverwatchEndTurn = require './modifierOverwatchEndTurn'
ModifierOverwatchSpellTargetDamageEnemies = require './modifierOverwatchSpellTargetDamageEnemies'
ModifierOverwatchEndTurnPutCardInHand = require './modifierOverwatchEndTurnPutCardInHand'
ModifierDealDamageWatchControlEnemyMinionUntilEOT = require './modifierDealDamageWatchControlEnemyMinionUntilEOT'
ModifierStartTurnWatchDamageEnemiesInRow = require './modifierStartTurnWatchDamageEnemiesInRow'
ModifierStartTurnWatchDestroySelfAndEnemies = require './modifierStartTurnWatchDestroySelfAndEnemies'
ModifierSentinelHidden = require './modifierSentinelHidden'
ModifierSentinelSetup = require './modifierSentinelSetup'
ModifierSentinelOpponentSummonDamageIt = require './modifierSentinelOpponentSummonDamageIt'
ModifierSentinelOpponentGeneralAttack = require './modifierSentinelOpponentGeneralAttack'
ModifierSummonWatchIfLowAttackSummonedBuffSelf = require './modifierSummonWatchIfLowAttackSummonedBuffSelf'
ModifierMyAttackWatchBonusManaCrystal = require './modifierMyAttackWatchBonusManaCrystal'
ModifierEnemySpellWatchCopySpell = require './modifierEnemySpellWatchCopySpell'
ModifierOpeningGambitPutCardInHand = require './modifierOpeningGambitPutCardInHand'
ModifierSentinelOpponentSpellCast = require './modifierSentinelOpponentSpellCast'
ModifierStartTurnWatchPutCardInHand = require './modifierStartTurnWatchPutCardInHand'
ModifierHallowedGround = require './modifierHallowedGround'
ModifierHallowedGroundBuff = require './modifierHallowedGroundBuff'
ModifierSandPortal = require './modifierSandPortal'
ModifierDoomed = require './modifierDoomed'
ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction = require './modifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction'
ModifierSentinelOpponentSummonCopyIt = require './modifierSentinelOpponentSummonCopyIt'
ModifierDealDamageWatchTeleportEnemyToYourSide = require './modifierDealDamageWatchTeleportEnemyToYourSide'
ModifierEnemySpellWatchPutCardInHand = require './modifierEnemySpellWatchPutCardInHand'
ModifierSpellWatchDamageAllMinions = require './modifierSpellWatchDamageAllMinions'
ModifierSentinelOpponentSummonSwapPlaces = require './modifierSentinelOpponentSummonSwapPlaces'
ModifierMyAttackWatchSpawnMinionNearby = require './modifierMyAttackWatchSpawnMinionNearby'
ModifierDyingWishDrawWishCard = require './modifierDyingWishDrawWishCard'
ModifierEnemyAttackWatch = require './modifierEnemyAttackWatch'
ModifierWildTahr = require './modifierWildTahr'
ModifierEndTurnWatchGainTempBuff = require './modifierEndTurnWatchGainTempBuff'
ModifierImmuneToAttacksByMinions = require './modifierImmuneToAttacksByMinions'
ModifierOpeningGambitAlabasterTitan = require './modifierOpeningGambitAlabasterTitan'
ModifierPrimalTile = require './modifierPrimalTile'
ModifierPrimalProtection = require './modifierPrimalProtection'
ModifierSummonWatchFromActionBar = require './modifierSummonWatchFromActionBar'
ModifierMyMoveWatchAnyReason = require './modifierMyMoveWatchAnyReason'
ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions = require './modifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions'
ModifierCannotCastSpellsByCost = require './modifierCannotCastSpellsByCost'
ModifierKillWatchBounceEnemyToActionBar = require './modifierKillWatchBounceEnemyToActionBar'
ModifierMyGeneralAttackWatch = require './modifierMyGeneralAttackWatch'
ModifierMyGeneralAttackWatchSpawnEntity = require './modifierMyGeneralAttackWatchSpawnEntity'
ModifierOpeningGambitReplaceHand = require './modifierOpeningGambitReplaceHand'
ModifierDealDamageWatchDamageJoinedEnemies = require './modifierDealDamageWatchDamageJoinedEnemies'
ModifierEternalHeart = require './modifierEternalHeart'
ModifierOpeningGambitSpawnPartyAnimals = require './modifierOpeningGambitSpawnPartyAnimals'
ModifierSprigginDiesBuffSelf = require './modifierSprigginDiesBuffSelf'
ModifierSituationalBuffSelfIfSpriggin = require './modifierSituationalBuffSelfIfSpriggin'
ModifierMirage = require './modifierMirage'
ModifierCustomSpawn = require './modifierCustomSpawn'
ModifierCustomSpawnOnOtherUnit = require './modifierCustomSpawnOnOtherUnit'
ModifierOpeningGambitDagona = require './modifierOpeningGambitDagona'
ModifierDyingWishDagona = require './modifierDyingWishDagona'
ModifierMyAttackWatchGamble = require './modifierMyAttackWatchGamble'
ModifierOpeningGambitStealEnemyGeneralHealth = require './modifierOpeningGambitStealEnemyGeneralHealth'
ModifierDoomed2 = require './modifierDoomed2'
ModifierDoomed3 = require './modifierDoomed3'
ModifierDeathWatchDamageRandomMinionHealMyGeneral = require './modifierDeathWatchDamageRandomMinionHealMyGeneral'
ModifierStartTurnWatchSpawnTile = require './modifierStartTurnWatchSpawnTile'
ModifierDealDamageWatchIfMinionHealMyGeneral = require './modifierDealDamageWatchIfMinionHealMyGeneral'
ModifierSynergizeSummonMinionNearGeneral = require './modifierSynergizeSummonMinionNearGeneral'
ModifierSpellWatchApplyModifiers = require './modifierSpellWatchApplyModifiers'
ModifierOpeningGambitProgenitor = require './modifierOpeningGambitProgenitor'
ModifierSpellWatchDrawCard = require './modifierSpellWatchDrawCard'
ModifierSynergizeDrawBloodboundSpell = require './modifierSynergizeDrawBloodboundSpell'
ModifierOpeningGambitDrawCopyFromDeck = require './modifierOpeningGambitDrawCopyFromDeck'
ModifierBandedProvoke = require './modifierBandedProvoke'
ModifierBandingProvoke = require './modifierBandingProvoke'
ModifierKillWatchDeceptibot = require './modifierKillWatchDeceptibot'
ModifierDeathWatchBuffMinionsInHand = require './modifierDeathWatchBuffMinionsInHand'
ModifierDyingWishDestroyRandomEnemyNearby = require './modifierDyingWishDestroyRandomEnemyNearby'
ModifierSynergizeSummonMinionNearby = require './modifierSynergizeSummonMinionNearby'
ModifierBuilding = require './modifierBuilding'
ModifierBuild = require './modifierBuild'
ModifierBeforeMyAttackWatch = require './modifierBeforeMyAttackWatch'
ModifierMyAttackWatchApplyModifiersToAllies = require './modifierMyAttackWatchApplyModifiersToAllies'
ModifierSummonWatchFromActionBarByRaceBothPlayersDraw = require './modifierSummonWatchFromActionBarByRaceBothPlayersDraw'
ModifierSummonWatchApplyModifiersToBoth = require './modifierSummonWatchApplyModifiersToBoth'
ModifierSummonWatchNearbyApplyModifiersToBoth = require './modifierSummonWatchNearbyApplyModifiersToBoth'
ModifierSummonWatchTransform = require './modifierSummonWatchTransform'
ModifierSummonWatchNearbyTransform = require './modifierSummonWatchNearbyTransform'
ModifierSynergizePutCardInHand = require './modifierSynergizePutCardInHand'
ModifierSynergizeBuffSelf = require './modifierSynergizeBuffSelf'
ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard = require './modifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard'
ModifierSentinelOpponentSummonBuffItDrawCard = require './modifierSentinelOpponentSummonBuffItDrawCard'
ModifierSentinelOpponentSpellCastRefundManaDrawCard = require './modifierSentinelOpponentSpellCastRefundManaDrawCard'
ModifierTakeDamageWatchSpawnRandomHaunt = require './modifierTakeDamageWatchSpawnRandomHaunt'
ModifierCannotCastBBS = require './modifierCannotCastBBS'
ModifierStartTurnWatchPutCardInOpponentsHand = require './modifierStartTurnWatchPutCardInOpponentsHand'
ModifierOpeningGambitRemoveCardsFromDecksByCost = require './modifierOpeningGambitRemoveCardsFromDecksByCost'
ModifierDyingWishAddCardToDeck = require './modifierDyingWishAddCardToDeck'
ModifierOnDyingInfest = require './modifierOnDyingInfest'
ModifierDyingWishDrawEnemyLegendaryArtifact = require './modifierDyingWishDrawEnemyLegendaryArtifact'
ModifierSynergizeDamageClosestEnemy = require './modifierSynergizeDamageClosestEnemy'
ModifierSynergizeRazorArchitect = require './modifierSynergizeRazorArchitect'
ModifierDeathWatchSpawnRandomDemon = require './modifierDeathWatchSpawnRandomDemon'
ModifierWhenAttackedDestroyThis = require './modifierWhenAttackedDestroyThis'
ModifierSituationalBuffSelfIfFullHealth = require './modifierSituationalBuffSelfIfFullHealth'
ModifierEnemyAttackWatchGainAttack = require './modifierEnemyAttackWatchGainAttack'
ModifierDeathWatchFriendlyMinionSwapAllegiance = require './modifierDeathWatchFriendlyMinionSwapAllegiance'
ModifierOpeningGambitSniperZen = require './modifierOpeningGambitSniperZen'
ModifierDoubleDamageToStunnedEnemies = require './modifierDoubleDamageToStunnedEnemies'
ModifierStartTurnWatchRespawnClones = require './modifierStartTurnWatchRespawnClones'
ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions = require './modifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions'
ModifierMyAttackOrCounterattackWatchDamageRandomEnemy = require './modifierMyAttackOrCounterattackWatchDamageRandomEnemy'
ModifierMyAttackWatchSummonDeadMinions = require './modifierMyAttackWatchSummonDeadMinions'
ModifierMyAttackMinionWatchStealGeneralHealth = require './modifierMyAttackMinionWatchStealGeneralHealth'
ModifierDyingWishRespawnEntity = require './modifierDyingWishRespawnEntity'
ModifierBuildWatch = require './modifierBuildWatch'
ModifierBuildCompleteApplyModifiersToNearbyAllies = require './modifierBuildCompleteApplyModifiersToNearbyAllies'
ModifierBuildCompleteGainTempMana = require './modifierBuildCompleteGainTempMana'
ModifierBuildCompleteHealGeneral = require './modifierBuildCompleteHealGeneral'
ModifierMyBuildWatchDrawCards = require './modifierMyBuildWatchDrawCards'
ModifierMyBuildWatch = require './modifierMyBuildWatch'
ModifierBuildingSlowEnemies = require './modifierBuildingSlowEnemies'
ModifierMyAttackOrCounterattackWatch = require './modifierMyAttackOrCounterattackWatch'
ModifierMyAttackOrCounterattackWatchTransformIntoEgg = require './modifierMyAttackOrCounterattackWatchTransformIntoEgg'
ModifierCannotDamageGenerals = require './modifierCannotDamageGenerals'
ModifierBackstabWatchAddCardToHand = require './modifierBackstabWatchAddCardToHand'
ModifierBuildCompleteReplicateAndSummonDervish = require './modifierBuildCompleteReplicateAndSummonDervish'
ModifierBackstabWatchTransformToBuilding = require './modifierBackstabWatchTransformToBuilding'
ModifierOpeningGambitProgressBuild = require './modifierOpeningGambitProgressBuild'
ModifierAlwaysInfiltrated = require './modifierAlwaysInfiltrated'
ModifierSummonWatchMechsShareKeywords = require './modifierSummonWatchMechsShareKeywords'
ModifierSituationalBuffSelfIfHaveMech = require './modifierSituationalBuffSelfIfHaveMech'
ModifierStartTurnWatchApplyTempArtifactModifier = require './modifierStartTurnWatchApplyTempArtifactModifier'
ModifierSummonWatchByRaceSummonCopy = require './modifierSummonWatchByRaceSummonCopy'
ModifierAuraAboveAndBelow = require './modifierAuraAboveAndBelow'
ModifierDealDamageWatchApplyModifiersToAllies = require './modifierDealDamageWatchApplyModifiersToAllies'
ModifierKillWatchSpawnEgg = require './modifierKillWatchSpawnEgg'
ModifierCannotBeReplaced = require './modifierCannotBeReplaced'
ModifierMyAttackMinionWatch = require './modifierMyAttackMinionWatch'
ModifierProvidesAlwaysInfiltrated = require './modifierProvidesAlwaysInfiltrated'
ModifierInvulnerable = require './modifierInvulnerable'
ModifierForgedArtifactDescription = require './modifierForgedArtifactDescription'
ModifierOnDying = require './modifierOnDying'
ModifierOnDyingSpawnEntity = require './modifierOnDyingSpawnEntity'
ModifierCounter = require './modifierCounter'
ModifierCounterBuildProgress = require './modifierCounterBuildProgress'
ModifierCounterMechazorBuildProgress = require './modifierCounterMechazorBuildProgress'
ModifierCounterShadowCreep = require './modifierCounterShadowCreep'
ModifierSummonWatchAnywhereByRaceBuffSelf = require './modifierSummonWatchAnywhereByRaceBuffSelf'
ModifierSwitchAllegiancesGainAttack = require './modifierSwitchAllegiancesGainAttack'
ModifierOpponentSummonWatchRandomTransform = require './modifierOpponentSummonWatchRandomTransform'
ModifierOnSpawnKillMyGeneral = require './modifierOnSpawnKillMyGeneral'
ModifierDeathWatchGainAttackEqualToEnemyAttack = require './modifierDeathWatchGainAttackEqualToEnemyAttack'
ModifierDyingWishBuffEnemyGeneral = require './modifierDyingWishBuffEnemyGeneral'
ModifierBandedProvoke = require './modifierBandedProvoke'
ModifierBandingProvoke = require './modifierBandingProvoke'
ModifierCannotBeReplaced = require './modifierCannotBeReplaced'
ModifierOpponentSummonWatchSwapGeneral = require './modifierOpponentSummonWatchSwapGeneral'
ModifierDyingWishPutCardInOpponentHand = require './modifierDyingWishPutCardInOpponentHand'
ModifierEnemySpellWatchGainRandomKeyword = require './modifierEnemySpellWatchGainRandomKeyword'
ModifierAnySummonWatchGainGeneralKeywords = require './modifierAnySummonWatchGainGeneralKeywords'
ModifierMyMoveWatchAnyReasonDrawCard = require './modifierMyMoveWatchAnyReasonDrawCard'
ModifierCounterBuildProgressDescription = require './modifierCounterBuildProgressDescription'
ModifierCounterMechazorBuildProgressDescription = require './modifierCounterMechazorBuildProgressDescription'
ModifierCounterShadowCreepDescription = require './modifierCounterShadowCreepDescription'
ModifierOpeningGambitDestroyManaCrystal = require './modifierOpeningGambitDestroyManaCrystal'
ModifierDyingWishDestroyManaCrystal = require './modifierDyingWishDestroyManaCrystal'
ModifierIntensify = require './modifierIntensify'
ModifierIntensifyOneManArmy = require './modifierIntensifyOneManArmy'
ModifierCollectableCard = require './modifierCollectableCard'
ModifierDyingWishReduceManaCostOfDyingWish = require './modifierDyingWishReduceManaCostOfDyingWish'
ModifierIntensifyBuffSelf = require './modifierIntensifyBuffSelf'
ModifierBandingFlying = require './modifierBandingFlying'
ModifierBandedFlying = require './modifierBandedFlying'
ModifierDyingWishApplyModifiersToGenerals = require './modifierDyingWishApplyModifiersToGenerals'
ModifierEnemySpellWatchHealMyGeneral = require './modifierEnemySpellWatchHealMyGeneral'
ModifierMyAttackWatchAreaAttack = require './modifierMyAttackWatchAreaAttack'
ModifierReplaceWatchApplyModifiersToReplaced = require './modifierReplaceWatchApplyModifiersToReplaced'
ModifierImmuneToDamageByWeakerEnemies = require './modifierImmuneToDamageByWeakerEnemies'
ModifierMyOtherMinionsDamagedWatch = require './modifierMyOtherMinionsDamagedWatch'
ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows = require './modifierMyOtherMinionsDamagedWatchDamagedMinionGrows'
ModifierBackstabWatchSummonBackstabMinion = require './modifierBackstabWatchSummonBackstabMinion'
ModifierStartOpponentsTurnWatch = require './modifierStartOpponentsTurnWatch'
ModifierStartOpponentsTurnWatchRemoveEntity = require './modifierStartOpponentsTurnWatchRemoveEntity'
ModifierMyAttackWatchApplyModifiers = require './modifierMyAttackWatchApplyModifiers'
ModifierAlwaysBackstabbed = require './modifierAlwaysBackstabbed'
ModifierFriendsguard = require './modifierFriendsguard'
ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck = require './modifierMyGeneralAttackWatchSpawnRandomEntityFromDeck'
ModifierStackingShadowsBonusDamageUnique = require './modifierStackingShadowsBonusDamageUnique'
ModifierEnemyCannotCastBBS = require './modifierEnemyCannotCastBBS'
ModifierEntersBattlefieldWatch = require './modifierEntersBattlefieldWatch'
ModifierEntersBattlefieldWatchApplyModifiers = require './modifierEntersBattlefieldWatchApplyModifiers'
ModifierSummonWatchApplyModifiersToRanged = require './modifierSummonWatchApplyModifiersToRanged'
ModifierStartsInHand = require './modifierStartsInHand'
ModifierStartTurnWatchRestoreChargeToArtifacts = require './modifierStartTurnWatchRestoreChargeToArtifacts'
ModifierIntensifyDamageEnemyGeneral = require './modifierIntensifyDamageEnemyGeneral'
ModifierOpeningGambitMoveEnemyGeneralForward = require './modifierOpeningGambitMoveEnemyGeneralForward'
ModifierBackstabWatchApplyPlayerModifiers = require './modifierBackstabWatchApplyPlayerModifiers'
ModifierOpeningGambitBonusManaCrystal = require './modifierOpeningGambitBonusManaCrystal'
ModifierSynergizeSpawnEntityFromDeck = require './modifierSynergizeSpawnEntityFromDeck'
ModifierSpellWatchAnywhereApplyModifiers = require './modifierSpellWatchAnywhereApplyModifiers'
ModifierDamageBothGeneralsOnReplace = require './modifierDamageBothGeneralsOnReplace'
ModifierStackingShadowsBonusDamageEqualNumberTiles = require './modifierStackingShadowsBonusDamageEqualNumberTiles'
ModifierPseudoRush = require './modifierPseudoRush'
ModifierIntensifyDamageNearby = require './modifierIntensifyDamageNearby'
ModifierStartTurnWatchRemoveEntity = require './modifierStartTurnWatchRemoveEntity'
ModifierOnSummonFromHand = require './modifierOnSummonFromHand'
ModifierReplaceWatchShuffleCardIntoDeck = require './modifierReplaceWatchShuffleCardIntoDeck'
ModifierEnemyStunWatch = require './modifierEnemyStunWatch'
ModifierEnemyStunWatchTransformThis = require './modifierEnemyStunWatchTransformThis'
ModifierEnemyStunWatchDamageNearbyEnemies = require './modifierEnemyStunWatchDamageNearbyEnemies'
ModifierIntensifySpawnEntitiesNearby = require './modifierIntensifySpawnEntitiesNearby'
ModifierStartTurnWatchImmolateDamagedMinions = require './modifierStartTurnWatchImmolateDamagedMinions'
ModifierTakeDamageWatchOpponentDrawCard = require './modifierTakeDamageWatchOpponentDrawCard'
ModifierMyAttackWatchScarabBlast = require './modifierMyAttackWatchScarabBlast'
ModifierEquipFriendlyArtifactWatch = require './modifierEquipFriendlyArtifactWatch'
ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost = require './modifierEquipFriendlyArtifactWatchGainAttackEqualToCost'
ModifierOpponentSummonWatchSummonMinionInFront = require './modifierOpponentSummonWatchSummonMinionInFront'
ModifierIntensifyTempBuffNearbyMinion = require './modifierIntensifyTempBuffNearbyMinion'
ModifierEndTurnWatchGainLastSpellPlayedThisTurn = require './modifierEndTurnWatchGainLastSpellPlayedThisTurn'
ModifierKillWatchRefreshExhaustionIfTargetStunned = require './modifierKillWatchRefreshExhaustionIfTargetStunned'
ModifierEnemyGeneralAttackedWatch = require './modifierEnemyGeneralAttackedWatch'
ModifierOnSummonFromHandApplyEmblems = require './modifierOnSummonFromHandApplyEmblems'
ModifierOnDyingResummonAnywhere = require './modifierOnDyingResummonAnywhere'
ModifierSummonWatchBurnOpponentCards = require './modifierSummonWatchBurnOpponentCards'
ModifierEnemyStunWatchFullyHeal = require './modifierEnemyStunWatchFullyHeal'
ModifierOpeningGambitChangeSignatureCardForThisTurn = require './modifierOpeningGambitChangeSignatureCardForThisTurn'
ModifierDyingWishGoldenGuide = require './modifierDyingWishGoldenGuide'
ModifierKillWatchAndSurvive = require './modifierKillWatchAndSurvive'
ModifierKillWatchAndSurviveScarzig = require './modifierKillWatchAndSurviveScarzig'
ModifierMyGeneralDamagedWatchMiniMinion = require './modifierMyGeneralDamagedWatchMiniMinion'
ModifierEndTurnWatchAnyPlayer = require './modifierEndTurnWatchAnyPlayer'
ModifierEndTurnWatchAnyPlayerPullRandomUnits = require './modifierEndTurnWatchAnyPlayerPullRandomUnits'
ModifierFate = require './modifierFate'
ModifierFateSingleton = require './modifierFateSingleton'
ModifierToken = require './modifierToken'
ModifierTokenCreator = require './modifierTokenCreator'
ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace = require './modifierMyAttackMinionWatchKillTargetSummonThisOnSpace'
ModifierFateAbyssianDyingQuest = require './modifierFateAbyssianDyingQuest'
ModifierFateSonghaiMinionQuest = require './modifierFateSonghaiMinionQuest'
ModifierFateMagmarBuffQuest = require './modifierFateMagmarBuffQuest'
ModifierFateLyonarSmallMinionQuest = require './modifierFateLyonarSmallMinionQuest'
ModifierOpeningGambitTransformHandIntoLegendaries = require './modifierOpeningGambitTransformHandIntoLegendaries'
ModifierFateVanarTokenQuest = require './modifierFateVanarTokenQuest'
ModifierFateVetruvianMovementQuest = require './modifierFateVetruvianMovementQuest'
ModifierEndTurnWatchAnyPlayerHsuku = require './modifierEndTurnWatchAnyPlayerHsuku'
ModifierCounterIntensify = require './modifierCounterIntensify'
ModifierCounterIntensifyDescription = require './modifierCounterIntensifyDescription'
ModifierCannotBeRemovedFromHand = require './modifierCannotBeRemovedFromHand'
ModifierQuestBuffAbyssian = require './modifierQuestBuffAbyssian'
ModifierQuestBuffNeutral = require './modifierQuestBuffNeutral'
ModifierQuestBuffVanar = require './modifierQuestBuffVanar'
ModifierQuestStatusLyonar = require './modifierQuestStatusLyonar'
ModifierQuestStatusSonghai = require './modifierQuestStatusSonghai'
ModifierQuestStatusAbyssian = require './modifierQuestStatusAbyssian'
ModifierQuestStatusVetruvian = require './modifierQuestStatusVetruvian'
ModifierQuestStatusMagmar = require './modifierQuestStatusMagmar'
ModifierQuestStatusVanar = require './modifierQuestStatusVanar'
ModifierQuestStatusNeutral = require './modifierQuestStatusNeutral'

PlayerModifier = require 'app/sdk/playerModifiers/playerModifier'
PlayerModifierManaModifier = require 'app/sdk/playerModifiers/playerModifierManaModifier'
PlayerModifierManaModifierSingleUse = require 'app/sdk/playerModifiers/playerModifierManaModifierSingleUse'
PlayerModifierAncestralPact = require 'app/sdk/playerModifiers/playerModifierAncestralPact'
PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'
PlayerModifierMechazorSummoned = require 'app/sdk/playerModifiers/playerModifierMechazorSummoned'
PlayerModifierSpellDamageModifier = require 'app/sdk/playerModifiers/playerModifierSpellDamageModifier'
PlayerModifierDamageNextUnitPlayedFromHand = require 'app/sdk/playerModifiers/playerModifierDamageNextUnitPlayedFromHand'
PlayerModifierCardDrawModifier = require 'app/sdk/playerModifiers/playerModifierCardDrawModifier'
PlayerModiferCanSummonAnywhere = require 'app/sdk/playerModifiers/playerModiferCanSummonAnywhere'
PlayerModifierSummonWatchApplyModifiers = require 'app/sdk/playerModifiers/playerModifierSummonWatchApplyModifiers'
PlayerModifierReplaceCardModifier = require 'app/sdk/playerModifiers/playerModifierReplaceCardModifier'
PlayerModifierEndTurnRespawnEntityWithBuff = require 'app/sdk/playerModifiers/playerModifierEndTurnRespawnEntityWithBuff'
PlayerModifierPreventSpellDamage = require 'app/sdk/playerModifiers/playerModifierPreventSpellDamage'
PlayerModifierManaModifierOncePerTurn = require 'app/sdk/playerModifiers/playerModifierManaModifierOncePerTurn'
PlayerModifierMyDeathwatchDrawCard = require 'app/sdk/playerModifiers/playerModifierMyDeathwatchDrawCard'
PlayerModifierBattlePetManager = require 'app/sdk/playerModifiers/playerModifierBattlePetManager.coffee'
PlayerModifierCannotReplace = require 'app/sdk/playerModifiers/playerModifierCannotReplace'
PlayerModifierChangeSignatureCard = require 'app/sdk/playerModifiers/playerModifierChangeSignatureCard'
PlayerModifierSignatureCardAlwaysReady = require 'app/sdk/playerModifiers/playerModifierSignatureCardAlwaysReady'
PlayerModifierManaModifierNextCard = require 'app/sdk/playerModifiers/playerModifierManaModifierNextCard'
PlayerModifierFlashReincarnation = require 'app/sdk/playerModifiers/playerModifierFlashReincarnation'
PlayerModifierFriendlyAttackWatch = require 'app/sdk/playerModifiers/playerModifierFriendlyAttackWatch'
PlayerModifierSummonWatch = require 'app/sdk/playerModifiers/playerModifierSummonWatch'
PlayerModifierSummonWatchIfFlyingDrawFlyingMinion = require 'app/sdk/playerModifiers/playerModifierSummonWatchIfFlyingDrawFlyingMinion'
PlayerModifierOpponentSummonWatch = require 'app/sdk/playerModifiers/playerModifierOpponentSummonWatch'
PlayerModifierOpponentSummonWatchSwapGeneral = require 'app/sdk/playerModifiers/playerModifierOpponentSummonWatchSwapGeneral'
PlayerModifierSummonWatchFromActionBar = require 'app/sdk/playerModifiers/playerModifierSummonWatchFromActionBar'
PlayerModifierEndTurnRespawnEntityAnywhere = require 'app/sdk/playerModifiers/playerModifierEndTurnRespawnEntityAnywhere'
PlayerModifierTeamAlwaysBackstabbed = require 'app/sdk/playerModifiers/playerModifierTeamAlwaysBackstabbed'
PlayerModifierEmblem = require 'app/sdk/playerModifiers/playerModifierEmblem'
PlayerModifierEmblemSummonWatch = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatch'
PlayerModifierEmblemSummonWatchSingletonQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchSingletonQuest'
PlayerModifierEmblemEndTurnWatch = require 'app/sdk/playerModifiers/playerModifierEmblemEndTurnWatch'
PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest = require 'app/sdk/playerModifiers/playerModifierEmblemEndTurnWatchLyonarSmallMinionQuest'
PlayerModifierSpellWatch = require 'app/sdk/playerModifiers/playerModifierSpellWatch'
PlayerModifierSpellWatchHollowVortex = require 'app/sdk/playerModifiers/playerModifierSpellWatchHollowVortex'
PlayerModifierEmblemSummonWatchVanarTokenQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchVanarTokenQuest'
PlayerModifierEmblemSituationalVetQuestFrenzy = require 'app/sdk/playerModifiers/playerModifierEmblemSituationalVetQuestFrenzy'
PlayerModifierEmblemSituationalVetQuestFlying = require 'app/sdk/playerModifiers/playerModifierEmblemSituationalVetQuestFlying'
PlayerModifierEmblemSituationalVetQuestCelerity = require 'app/sdk/playerModifiers/playerModifierEmblemSituationalVetQuestCelerity'
PlayerModifierEndTurnWatchRevertBBS = require 'app/sdk/playerModifiers/playerModifierEndTurnWatchRevertBBS'
PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchFromHandMagmarBuffQuest'
PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchSonghaiMeltdownQuest'
PlayerModifierEmblemSummonWatchAbyssUndyingQuest = require 'app/sdk/playerModifiers/playerModifierEmblemSummonWatchAbyssUndyingQuest'
PlayerModifierEmblemGainMinionOrLoseControlWatch = require 'app/sdk/playerModifiers/playerModifierEmblemGainMinionOrLoseControlWatch'

GameSessionModifier = require 'app/sdk/gameSessionModifiers/gameSessionModifier'
GameSessionModifierFestiveSpirit = require 'app/sdk/gameSessionModifiers/gameSessionModifierFestiveSpirit'

_ = require 'underscore'

class ModifierFactory

  @modifierForType: (modifierType,gameSession) ->
    modifierClass = ModifierFactory.modifierClassForType(modifierType)
    if modifierClass
      return new modifierClass(gameSession)
    else
      throw new Error("Tried to create an unknown modifier from type: " + modifierType)

  @modifierClassForType: (modifierType) ->
    if (modifierType == Modifier.type)
      return Modifier
    if (modifierType == ModifierOpeningGambit.type)
      return ModifierOpeningGambit
    if (modifierType == ModifierFirstBlood.type)
      return ModifierFirstBlood
    if (modifierType == ModifierProvoke.type)
      return ModifierProvoke
    if (modifierType == ModifierDestructible.type)
      return ModifierDestructible
    if (modifierType == ModifierSituationalBuffSelf.type)
      return ModifierSituationalBuffSelf
    if (modifierType == ModifierBanding.type)
      return ModifierBanding
    if (modifierType == ModifierBandingAttack.type)
      return ModifierBandingAttack
    if (modifierType == ModifierBandingAttackAndHealth.type)
      return ModifierBandingAttackAndHealth
    if (modifierType == ModifierBandingHeal.type)
      return ModifierBandingHeal
    if (modifierType == ModifierAirdrop.type)
      return ModifierAirdrop
    if (modifierType == ModifierBandingRanged.type)
      return ModifierBandingRanged
    if (modifierType == ModifierStrikeback.type)
      return ModifierStrikeback
    if (modifierType == ModifierFrenzy.type)
      return ModifierFrenzy
    if (modifierType == ModifierOpeningGambitDispel.type)
      return ModifierOpeningGambitDispel
    if (modifierType == ModifierDeathWatch.type)
      return ModifierDeathWatch
    if (modifierType == ModifierDeathWatchBuffSelf.type)
      return ModifierDeathWatchBuffSelf
    if (modifierType == ModifierDeathWatchDamageEnemyGeneralHealMyGeneral.type)
      return ModifierDeathWatchDamageEnemyGeneralHealMyGeneral
    if (modifierType == ModifierFlying.type)
      return ModifierFlying
    if (modifierType == ModifierOpeningGambitSpawnEntity.type)
      return ModifierOpeningGambitSpawnEntity
    if (modifierType == ModifierDeathWatchSpawnEntity.type)
      return ModifierDeathWatchSpawnEntity
    if (modifierType == ModifierOpeningGambitSacrificeNearbyBuffSelf.type)
      return ModifierOpeningGambitSacrificeNearbyBuffSelf
    if (modifierType == ModifierOpeningGambitDamageMyGeneral.type)
      return ModifierOpeningGambitDamageMyGeneral
    if (modifierType == ModifierOpeningGambitDamageBothGenerals.type)
      return ModifierOpeningGambitDamageBothGenerals
    if (modifierType == ModifierKillWatchSpawnEntity.type)
      return ModifierKillWatchSpawnEntity
    if (modifierType == ModifierDyingWishBonusMana.type)
      return ModifierDyingWishBonusMana
    if (modifierType == ModifierDyingWishDrawCard.type)
      return ModifierDyingWishDrawCard
    if (modifierType == ModifierCollectableBonusMana.type)
      return ModifierCollectableBonusMana
    if (modifierType == ModifierImmune.type)
      return ModifierImmune
    if (modifierType == ModifierImmuneToAttacks.type)
      return ModifierImmuneToAttacks
    if (modifierType == ModifierImmuneToDamage.type)
      return ModifierImmuneToDamage
    if (modifierType == ModifierImmuneToDamageByRanged.type)
      return ModifierImmuneToDamageByRanged
    if (modifierType == ModifierImmuneToDamageByGeneral.type)
      return ModifierImmuneToDamageByGeneral
    if (modifierType == ModifierImmuneToSpellsByEnemy.type)
      return ModifierImmuneToSpellsByEnemy
    if (modifierType == ModifierImmuneToAttacksByGeneral.type)
      return ModifierImmuneToAttacksByGeneral
    if (modifierType == ModifierImmuneToAttacksByRanged.type)
      return ModifierImmuneToAttacksByRanged
    if (modifierType == ModifierImmuneToSpells.type)
      return ModifierImmuneToSpells
    if (modifierType == ModifierImmuneToDamageBySpells.type)
      return ModifierImmuneToDamageBySpells
    if (modifierType == ModifierSpellWatchSpawnEntity.type)
      return ModifierSpellWatchSpawnEntity
    if (modifierType == ModifierSpellWatch.type)
      return ModifierSpellWatch
    if (modifierType == ModifierSpellWatchDamageGeneral.type)
      return ModifierSpellWatchDamageGeneral
    if (modifierType == ModifierOpeningGambitRetrieveMostRecentSpell.type)
      return ModifierOpeningGambitRetrieveMostRecentSpell
    if (modifierType == ModifierOpeningGambitRetrieveRandomSpell.type)
      return ModifierOpeningGambitRetrieveRandomSpell
    if (modifierType == ModifierDispelOnAttack.type)
      return ModifierDispelOnAttack
    if (modifierType == ModifierSummonWatchHealSelf.type)
      return ModifierSummonWatchHealSelf
    if (modifierType == ModifierDamageGeneralOnAttack.type)
      return ModifierDamageGeneralOnAttack
    if (modifierType == ModifierDyingWishSpawnEntity.type)
      return ModifierDyingWishSpawnEntity
    if (modifierType == ModifierStartTurnWatchSpawnEntity.type)
      return ModifierStartTurnWatchSpawnEntity
    if (modifierType == ModifierStartTurnWatchDamageMyGeneral.type)
      return ModifierStartTurnWatchDamageMyGeneral
    if (modifierType == ModifierBlastAttack.type)
      return ModifierBlastAttack
    if (modifierType == ModifierBlastAttackStrong.type)
      return ModifierBlastAttackStrong
    if (modifierType == ModifierBackstab.type)
      return ModifierBackstab
    if (modifierType == ModifierTranscendance.type)
      return ModifierTranscendance
    if (modifierType == ModifierMyAttackWatch.type)
      return ModifierMyAttackWatch
    if (modifierType == ModifierMyAttackWatchBuffSelf.type)
      return ModifierMyAttackWatchBuffSelf
    if (modifierType == ModifierDyingWishDamageGeneral.type)
      return ModifierDyingWishDamageGeneral
    if (modifierType == ModifierDyingWishDamageEnemyGeneralHealGeneral.type)
      return ModifierDyingWishDamageEnemyGeneralHealGeneral
    if (modifierType == Modifier.type)
      return Modifier
    if (modifierType == ModifierRanged.type)
      return ModifierRanged
    if (modifierType == ModifierSilence.type)
      return ModifierSilence
    if (modifierType == ModifierBanded.type)
      return ModifierBanded
    if (modifierType == ModifierBandedHeal.type)
      return ModifierBandedHeal
    if (modifierType == ModifierBandedRanged.type)
      return ModifierBandedRanged
    if (modifierType == ModifierObstructing.type)
      return ModifierObstructing
    if (modifierType == ModifierUntargetable.type)
      return ModifierUntargetable
    if (modifierType == ModifierStackingShadows.type)
      return ModifierStackingShadows
    if (modifierType == ModifierProvoked.type)
      return ModifierProvoked
    if (modifierType == ModifierAttackEqualsHealth.type)
      return ModifierAttackEqualsHealth
    if (modifierType == ModifierManaCostChange.type)
      return ModifierManaCostChange
    if (modifierType == ModifierPortal.type)
      return ModifierPortal
    if (modifierType == ModifierOpeningGambitRefreshArtifacts.type)
      return ModifierOpeningGambitRefreshArtifacts
    if (modifierType == ModifierDealDamageWatchKillTargetAndSelf.type)
      return ModifierDealDamageWatchKillTargetAndSelf
    if (modifierType == ModifierDealDamageWatchModifyTarget.type)
      return ModifierDealDamageWatchModifyTarget
    if (modifierType == ModifierSpellWatchBloodLeech.type)
      return ModifierSpellWatchBloodLeech
    if (modifierType == ModifierSummonWatchPutCardInHand.type)
      return ModifierSummonWatchPutCardInHand
    if (modifierType == ModifierSpellWatchBuffAlliesByRace.type)
      return ModifierSpellWatchBuffAlliesByRace
    if (modifierType == ModifierCardControlledPlayerModifiers.type)
      return ModifierCardControlledPlayerModifiers
    if (modifierType == ModifierOpeningGambitApplyModifiers.type)
      return ModifierOpeningGambitApplyModifiers
    if (modifierType == ModifierOpeningGambitApplyModifiersToDeck.type)
      return ModifierOpeningGambitApplyModifiersToDeck
    if (modifierType == ModifierOpeningGambitApplyPlayerModifier.type)
      return ModifierOpeningGambitApplyPlayerModifier
    if (modifierType == ModifierOpeningGambitApplyMechazorPlayerModifiers.type)
      return ModifierOpeningGambitApplyMechazorPlayerModifiers
    if (modifierType == ModifierRangedProvoke.type)
      return ModifierRangedProvoke
    if (modifierType == ModifierRangedProvoked.type)
      return ModifierRangedProvoked
    if (modifierType == ModifierOpeningGambitDamageNearby.type)
      return ModifierOpeningGambitDamageNearby
    if (modifierType == ModifierDyingWishSpawnEntityAnywhere.type)
      return ModifierDyingWishSpawnEntityAnywhere
    if (modifierType == ModifierStartTurnWatchDamageEnemyGeneralBuffSelf.type)
      return ModifierStartTurnWatchDamageEnemyGeneralBuffSelf
    if (modifierType == ModifierStunned.type)
      return ModifierStunned
    if (modifierType == ModifierGrow.type)
      return ModifierGrow
    if (modifierType == ModifierRebirth.type)
      return ModifierRebirth
    if (modifierType == ModifierEgg.type)
      return ModifierEgg
    if (modifierType == ModifierEndTurnWatchSpawnEgg.type)
      return ModifierEndTurnWatchSpawnEgg
    if (modifierType == ModifierEndTurnWatchSpawnEntity.type)
      return ModifierEndTurnWatchSpawnEntity
    if (modifierType == ModifierEndTurnWatchDamageAllMinions.type)
      return ModifierEndTurnWatchDamageAllMinions
    if (modifierType == ModifierForcefield.type)
      return ModifierForcefield
    if (modifierType == ModifierAntiMagicField.type)
      return ModifierAntiMagicField
    if (modifierType == ModifierDyingWishApplyModifiers.type)
      return ModifierDyingWishApplyModifiers
    if (modifierType == ModifierOpeningGambitDamageInFront.type)
      return ModifierOpeningGambitDamageInFront
    if (modifierType == ModifierMyGeneralDamagedWatch.type)
      return ModifierMyGeneralDamagedWatch
    if (modifierType == ModifierMyGeneralDamagedWatchBuffSelf.type)
      return ModifierMyGeneralDamagedWatchBuffSelf
    if (modifierType == ModifierMyGeneralDamagedWatchHealSelf.type)
      return ModifierMyGeneralDamagedWatchHealSelf
    if (modifierType == ModifierMyGeneralDamagedWatchDamageNearby.type)
      return ModifierMyGeneralDamagedWatchDamageNearby
    if (modifierType == ModifierSummonWatchByEntityBuffSelf.type)
      return ModifierSummonWatchByEntityBuffSelf
    if (modifierType == ModifierStartTurnWatchSummonDervish.type)
      return ModifierStartTurnWatchSummonDervish
    if (modifierType == ModifierEphemeral.type)
      return ModifierEphemeral
    if (modifierType == ModifierInfiltrate.type)
      return ModifierInfiltrate
    if (modifierType == ModifierCannot.type)
      return ModifierCannot
    if (modifierType == ModifierCannotAttackGeneral.type)
      return ModifierCannotAttackGeneral
    if (modifierType == ModifierCannotStrikeback.type)
      return ModifierCannotStrikeback
    if (modifierType == ModifierSummonWatchByRaceBuffSelf.type)
      return ModifierSummonWatchByRaceBuffSelf
    if (modifierType == ModifierSummonWatchSpawnEntity.type)
      return ModifierSummonWatchSpawnEntity
    if (modifierType == ModifierTakeDamageWatch.type)
      return ModifierTakeDamageWatch
    if (modifierType == ModifierTakeDamageWatchHealMyGeneral.type)
      return ModifierTakeDamageWatchHealMyGeneral
    if (modifierType == ModifierStartTurnWatchDamageRandom.type)
      return ModifierStartTurnWatchDamageRandom
    if (modifierType == ModifierSummonWatchByRaceDamageEnemyMinion.type)
      return ModifierSummonWatchByRaceDamageEnemyMinion
    if (modifierType == ModifierEndTurnWatch.type)
      return ModifierEndTurnWatch
    if (modifierType == ModifierEndTurnWatchDamageNearbyEnemy.type)
      return ModifierEndTurnWatchDamageNearbyEnemy
    if (modifierType == ModifierBandingDoubleAttack.type)
      return ModifierBandingDoubleAttack
    if (modifierType == ModifierBandedDoubleAttack.type)
      return ModifierBandedDoubleAttack
    if (modifierType == ModifierOpeningGambitHealMyGeneral.type)
      return ModifierOpeningGambitHealMyGeneral
    if (modifierType == ModifierDoubleDamageToMinions.type)
      return ModifierDoubleDamageToMinions
    if (modifierType == ModifierOpeningGambitBuffSelfByShadowTileCount.type)
      return ModifierOpeningGambitBuffSelfByShadowTileCount
    if (modifierType == ModifierDealDamageWatchHealMyGeneral.type)
      return ModifierDealDamageWatchHealMyGeneral
    if (modifierType == ModifierDealDamageWatchKillTarget.type)
      return ModifierDealDamageWatchKillTarget
    if (modifierType == ModifierOpponentSummonWatch.type)
      return ModifierOpponentSummonWatch
    if (modifierType == ModifierOpponentSummonWatchBuffSelf.type)
      return ModifierOpponentSummonWatchBuffSelf
    if (modifierType == ModifierStartTurnWatchBounceToActionBar.type)
      return ModifierStartTurnWatchBounceToActionBar
    if (modifierType == ModifierTakeDamageWatchDamageEnemy.type)
      return ModifierTakeDamageWatchDamageEnemy
    if (modifierType == ModifierOpeningGambitDamageNearbyMinions.type)
      return ModifierOpeningGambitDamageNearbyMinions
    if (modifierType == ModifierDestroyAtEndOfTurn.type)
      return ModifierDestroyAtEndOfTurn
    if (modifierType == ModifierMyMinionOrGeneralDamagedWatch.type)
      return ModifierMyMinionOrGeneralDamagedWatch
    if (modifierType == ModifierMyMinionOrGeneralDamagedWatchBuffSelf.type)
      return ModifierMyMinionOrGeneralDamagedWatchBuffSelf
    if (modifierType == ModifierAbsorbDamage.type)
      return ModifierAbsorbDamage
    if (modifierType == ModifierDyingWishSpawnUnitFromOpponentsDeck.type)
      return ModifierDyingWishSpawnUnitFromOpponentsDeck
    if (modifierType == ModifierTransformed.type)
      return ModifierTransformed
    if (modifierType == ModifierStunWhenAttacked.type)
      return ModifierStunWhenAttacked
    if (modifierType == ModifierWall.type)
      return ModifierWall
    if (modifierType == ModifierOpeningGambitSpawnCopiesOfEntityAnywhere.type)
      return ModifierOpeningGambitSpawnCopiesOfEntityAnywhere
    if (modifierType == ModifierSummonWatchBuffSelf.type)
      return ModifierSummonWatchBuffSelf
    if (modifierType == ModifierOpponentSummonWatchDamageEnemyGeneral.type)
      return ModifierOpponentSummonWatchDamageEnemyGeneral
    if (modifierType == ModifierDyingWishEquipArtifactFromDeck.type)
      return ModifierDyingWishEquipArtifactFromDeck
    if (modifierType == ModifierOpeningGambitDrawArtifactFromDeck.type)
      return ModifierOpeningGambitDrawArtifactFromDeck
    if (modifierType == ModifierSummonWatchApplyModifiers.type)
      return ModifierSummonWatchApplyModifiers
    if (modifierType == ModifierSummonWatchNearbyApplyModifiers.type)
      return ModifierSummonWatchNearbyApplyModifiers
    if (modifierType == ModifierTakeDamageWatchRandomTeleport.type)
      return ModifierTakeDamageWatchRandomTeleport
    if (modifierType == ModifierOpeningGambitSpawnEntityInEachCorner.type)
      return ModifierOpeningGambitSpawnEntityInEachCorner
    if (modifierType == ModifierDyingWishBonusManaCrystal.type)
      return ModifierDyingWishBonusManaCrystal
    if (modifierType == ModifierOpeningGambitMindwarp.type)
      return ModifierOpeningGambitMindwarp
    if (modifierType == ModifierReduceCostOfMinionsAndDamageThem.type)
      return ModifierReduceCostOfMinionsAndDamageThem
    if (modifierType == ModifierStunnedVanar.type)
      return ModifierStunnedVanar
    if (modifierType == ModifierEndTurnWatchSpawnRandomEntity.type)
      return ModifierEndTurnWatchSpawnRandomEntity
    if (modifierType == ModifierDealDamageWatchSpawnEntity.type)
      return ModifierDealDamageWatchSpawnEntity
    if (modifierType == ModifierSpellDamageWatch.type)
      return ModifierSpellDamageWatch
    if (modifierType == ModifierSpellDamageWatchPutCardInHand.type)
      return ModifierSpellDamageWatchPutCardInHand
    if (modifierType == ModifierOpeningGambitRemoveRandomArtifact.type)
      return ModifierOpeningGambitRemoveRandomArtifact
    if (modifierType == ModifierEndTurnWatchHealNearby.type)
      return ModifierEndTurnWatchHealNearby
    if (modifierType == ModifierDealDamageWatchTeleportToMe.type)
      return ModifierDealDamageWatchTeleportToMe
    if (modifierType == ModifierWraithlingFury.type)
      return ModifierWraithlingFury
    if (modifierType == ModifierOpeningGambitRazorback.type)
      return ModifierOpeningGambitRazorback
    if (modifierType == ModifierDyingWishSpawnEntityNearbyGeneral.type)
      return ModifierDyingWishSpawnEntityNearbyGeneral
    if (modifierType == ModifierSummonWatchFromActionBarSpawnEntity.type)
      return ModifierSummonWatchFromActionBarSpawnEntity
    if (modifierType == ModifierOpeningGambitBuffSelfByOpponentHandCount.type)
      return ModifierOpeningGambitBuffSelfByOpponentHandCount
    if (modifierType == ModifierTakeDamageWatchDamageEnemyGeneralForSame.type)
      return ModifierTakeDamageWatchDamageEnemyGeneralForSame
    if (modifierType == ModifierDealDamageWatchBuffSelf.type)
      return ModifierDealDamageWatchBuffSelf
    if (modifierType == ModifierDyingWishDamageNearbyAllies.type)
      return ModifierDyingWishDamageNearbyAllies
    if (modifierType == ModifierKillWatchHealSelf.type)
      return ModifierKillWatchHealSelf
    if (modifierType == ModifierBandingDealDamageWatchDrawCard.type)
      return ModifierBandingDealDamageWatchDrawCard
    if (modifierType == ModifierDealDamageWatchDrawCard.type)
      return ModifierDealDamageWatchDrawCard
    if (modifierType == ModifierStartTurnWatchSwapStats.type)
      return ModifierStartTurnWatchSwapStats
    if (modifierType == ModifierHealSelfWhenDealingDamage.type)
      return ModifierHealSelfWhenDealingDamage
    if (modifierType == ModifierDealDamageWatchHealorDamageGeneral.type)
      return ModifierDealDamageWatchHealorDamageGeneral
    if (modifierType == ModifierDyingWishPutCardInHand.type)
      return ModifierDyingWishPutCardInHand
    if (modifierType == ModifierDyingWishPutCardInHandClean.type)
      return ModifierDyingWishPutCardInHandClean
    if (modifierType == ModifierOpeningGambitLifeGive.type)
      return ModifierOpeningGambitLifeGive
    if (modifierType == ModifierOpeningGambitTeleportAllNearby.type)
      return ModifierOpeningGambitTeleportAllNearby
    if (modifierType == ModifierRook.type)
      return ModifierRook
    if (modifierType == ModifierEndTurnWatchHealSelfAndGeneral.type)
      return ModifierEndTurnWatchHealSelfAndGeneral
    if (modifierType == ModifierEndTurnWatchHealSelf.type)
      return ModifierEndTurnWatchHealSelf
    if (modifierType == ModifierBandingHealSelfAndGeneral.type)
      return ModifierBandingHealSelfAndGeneral
    if (modifierType == ModifierDeathWatchDrawToXCards.type)
      return ModifierDeathWatchDrawToXCards
    if (modifierType == ModifierDyingWishSpawnTile.type)
      return ModifierDyingWishSpawnTile
    if (modifierType == ModifierDyingWishReSpawnEntityAnywhere.type)
      return ModifierDyingWishReSpawnEntityAnywhere
    if (modifierType == ModifierSummonWatchNearbyApplyModifiersOncePerTurn.type)
      return ModifierSummonWatchNearbyApplyModifiersOncePerTurn
    if (modifierType == ModifierHealWatch.type)
      return ModifierHealWatch
    if (modifierType == ModifierHealWatchBuffSelf.type)
      return ModifierHealWatchBuffSelf
    if (modifierType == ModifierHealWatchDamageNearbyEnemies.type)
      return ModifierHealWatchDamageNearbyEnemies
    if (modifierType == ModifierRemoveAndReplaceEntity.type)
      return   ModifierRemoveAndReplaceEntity
    if (modifierType == ModifierMyMoveWatch.type)
      return   ModifierMyMoveWatch
    if (modifierType == ModifierMyMoveWatchSpawnEntity.type)
      return   ModifierMyMoveWatchSpawnEntity
    if (modifierType == ModifierMyMoveWatchApplyModifiers.type)
      return   ModifierMyMoveWatchApplyModifiers
    if (modifierType == ModifierMyMoveWatchDrawCard.type)
      return ModifierMyMoveWatchDrawCard
    if (modifierType == ModifierDyingWishSpawnEntityInCorner.type)
      return   ModifierDyingWishSpawnEntityInCorner
    if (modifierType == ModifierSpiritScribe.type)
      return   ModifierSpiritScribe
    if (modifierType == ModifierTakeDamageWatchSpawnRandomToken.type)
      return   ModifierTakeDamageWatchSpawnRandomToken
    if (modifierType == ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf.type)
      return   ModifierSummonWatchFromActionBarByOpeningGambitBuffSelf
    if (modifierType == ModifierOpeningGambitApplyModifiersRandomly.type)
      return   ModifierOpeningGambitApplyModifiersRandomly
    if (modifierType == ModifierImmuneToSpellDamage.type)
      return ModifierImmuneToSpellDamage
    if (modifierType == ModifierReplaceWatchDamageEnemy.type)
      return ModifierReplaceWatchDamageEnemy
    if (modifierType == ModifierReplaceWatchBuffSelf.type)
      return ModifierReplaceWatchBuffSelf
    if (modifierType == ModifierBuffSelfOnReplace.type)
      return ModifierBuffSelfOnReplace
    if (modifierType == ModifierSummonSelfOnReplace.type)
      return ModifierSummonSelfOnReplace
    if (modifierType == ModifierTakeDamageWatchDispel.type)
      return ModifierTakeDamageWatchDispel
    if (modifierType == ModifierTakeDamageWatchPutCardInHand.type)
      return ModifierTakeDamageWatchPutCardInHand
    if (modifierType == ModifierOpeningGambitDrawCardBothPlayers.type)
      return ModifierOpeningGambitDrawCardBothPlayers
    if (modifierType == ModifierSurviveDamageWatchReturnToHand.type)
      return ModifierSurviveDamageWatchReturnToHand
    if (modifierType == ModifierOpeningGambitDamageNearbyForAttack.type)
      return ModifierOpeningGambitDamageNearbyForAttack
    if (modifierType == ModifierMyAttackOrAttackedWatchDrawCard.type)
      return ModifierMyAttackOrAttackedWatchDrawCard
    if (modifierType == ModifierForcefieldAbsorb.type)
      return ModifierForcefieldAbsorb
    if (modifierType == ModifierUnseven.type)
      return ModifierUnseven
    if (modifierType == ModifierDoubleDamageToGenerals.type)
      return ModifierDoubleDamageToGenerals
    if (modifierType == ModifierShadowScar.type)
      return ModifierShadowScar
    if (modifierType == ModifierStackingShadowsDebuff.type)
      return ModifierStackingShadowsDebuff
    if (modifierType == ModifierEndTurnWatchApplyModifiers.type)
      return ModifierEndTurnWatchApplyModifiers
    if (modifierType == ModifierOpeningGambitApplyModifiersToDeckAndHand.type)
      return ModifierOpeningGambitApplyModifiersToDeckAndHand
    if (modifierType == ModifierOpeningGambitApplyModifiersToHand.type)
      return ModifierOpeningGambitApplyModifiersToHand
    if (modifierType == ModifierMechazorWatchPutMechazorInHand.type)
      return ModifierMechazorWatchPutMechazorInHand
    if (modifierType == ModifierHealWatchPutCardInHand.type)
      return ModifierHealWatchPutCardInHand
    if (modifierType == ModifierEnemyCannotHeal.type)
      return ModifierEnemyCannotHeal
    if (modifierType == ModifierEnemyTakeDamageWatchHealMyGeneral.type)
      return ModifierEnemyTakeDamageWatchHealMyGeneral
    if (modifierType == ModifierTakeDamageWatchDamageNearbyForSame.type)
      return ModifierTakeDamageWatchDamageNearbyForSame
    if (modifierType == ModifierImmuneToDamageFromEnemyMinions.type)
      return ModifierImmuneToDamageFromEnemyMinions
    if (modifierType == ModifierDoubleDamageToEnemyMinions.type)
      return ModifierDoubleDamageToEnemyMinions
    if (modifierType == ModifierOpeningGambitDrawFactionCards.type)
      return ModifierOpeningGambitDrawFactionCards
    if (modifierType == ModifierOpeningGambitHealBothGenerals.type)
      return ModifierOpeningGambitHealBothGenerals
    if (modifierType == ModifierOpponentDrawCardWatchBuffSelf.type)
      return ModifierOpponentDrawCardWatchBuffSelf
    if (modifierType == ModifierEnvyBaer.type)
      return ModifierEnvyBaer
    if (modifierType == ModifierOpeningGambitGrincher.type)
      return ModifierOpeningGambitGrincher
    if (modifierType == ModifierSpellWatchScientist.type)
      return ModifierSpellWatchScientist
    if (modifierType == ModifierOpeningGambitDamageEverything.type)
      return ModifierOpeningGambitDamageEverything
    if (modifierType == ModifierCostChangeIfMyGeneralDamagedLastTurn.type)
      return ModifierCostChangeIfMyGeneralDamagedLastTurn
    if (modifierType == ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard.type)
      return ModifierMyGeneralDamagedWatchBuffSelfAndDrawACard
    if (modifierType == ModifierDynamicCountModifySelf.type)
      return ModifierDynamicCountModifySelf
    if (modifierType == ModifierCostEqualGeneralHealth.type)
      return ModifierCostEqualGeneralHealth
    if (modifierType == ModifierStackingShadowsBonusDamage.type)
      return ModifierStackingShadowsBonusDamage
    if (modifierType == ModifierDynamicCountModifySelfByShadowTilesOnBoard.type)
      return ModifierDynamicCountModifySelfByShadowTilesOnBoard
    if (modifierType == ModifierBattlePet.type)
      return ModifierBattlePet
    if (modifierType == ModifierCannotMove.type)
      return ModifierCannotMove
    if (modifierType == ModifierOpeningGambitDrawRandomBattlePet.type)
      return ModifierOpeningGambitDrawRandomBattlePet
    if (modifierType == ModifierDyingWishDamageNearbyEnemies.type)
      return ModifierDyingWishDamageNearbyEnemies
    if (modifierType == ModifierDealDamageWatchKillNeutralTarget.type)
      return ModifierDealDamageWatchKillNeutralTarget
    if (modifierType == ModifierTakeDamageWatchSpawnRandomBattlePet.type)
      return ModifierTakeDamageWatchSpawnRandomBattlePet
    if (modifierType == ModifierDyingWishDrawMechazorCard.type)
      return ModifierDyingWishDrawMechazorCard
    if (modifierType == ModifierOpeningGambitApplyModifiersByRaceId.type)
      return ModifierOpeningGambitApplyModifiersByRaceId
    if (modifierType == ModifierOpeningGambitApplyModifiersToGeneral.type)
      return ModifierOpeningGambitApplyModifiersToGeneral
    if (modifierType == ModifierOpeningGambitDrawCard.type)
      return ModifierOpeningGambitDrawCard
    if (modifierType == ModifierEndTurnWatchApplyModifiersRandomly.type)
      return ModifierEndTurnWatchApplyModifiersRandomly
    if (modifierType == ModifierBandingChangeCardDraw.type)
      return ModifierBandingChangeCardDraw
    if (modifierType == ModifierTakeDamageWatchDamageAllEnemies.type)
      return ModifierTakeDamageWatchDamageAllEnemies
    if (modifierType == ModifierDyingWishXho.type)
      return ModifierDyingWishXho
    if (modifierType == ModifierDyingWishDrawRandomBattlePet.type)
      return ModifierDyingWishDrawRandomBattlePet
    if (modifierType == ModifierAnyDrawCardWatchBuffSelf.type)
      return ModifierAnyDrawCardWatchBuffSelf
    if (modifierType == ModifierTakeDamageWatchDestroy.type)
      return ModifierTakeDamageWatchDestroy
    if (modifierType == ModifierDyingWishSpawnRandomEntity.type)
      return ModifierDyingWishSpawnRandomEntity
    if (modifierType == ModifierTakeDamageWatchSpawnEntity.type)
      return ModifierTakeDamageWatchSpawnEntity
    if (modifierType == ModifierPantheran.type)
      return ModifierPantheran
    if (modifierType == ModifierEndTurnWatchSwapAllegiance.type)
      return ModifierEndTurnWatchSwapAllegiance
    if (modifierType == ModifierDyingWishCorpseCombustion.type)
      return ModifierDyingWishCorpseCombustion
    if (modifierType == ModifierOpeningGambitApplyModifiersToWraithlings.type)
      return ModifierOpeningGambitApplyModifiersToWraithlings
    if (modifierType == ModifierInkhornGaze.type)
      return ModifierInkhornGaze
    if (modifierType == ModifierDeathWatchBuffRandomMinionInHand.type)
      return ModifierDeathWatchBuffRandomMinionInHand
    if (modifierType == ModifierOpeningGambitHatchFriendlyEggs.type)
      return ModifierOpeningGambitHatchFriendlyEggs
    if (modifierType == ModifierGrowOnBothTurns.type)
      return   ModifierGrowOnBothTurns
    if (modifierType == ModifierSummonWatchFromEggApplyModifiers.type)
      return   ModifierSummonWatchFromEggApplyModifiers
    if (modifierType == ModifierAnySummonWatchFromActionBarApplyModifiersToSelf.type)
      return ModifierAnySummonWatchFromActionBarApplyModifiersToSelf
    if (modifierType == ModifierSnowRippler.type)
      return ModifierSnowRippler
    if (modifierType == ModifierSurviveDamageWatchBur.type)
      return ModifierSurviveDamageWatchBur
    if (modifierType == ModifierSummonWatchByRaceHealToFull.type)
      return ModifierSummonWatchByRaceHealToFull
    if (modifierType == ModifierSummonWatchByCardBuffTarget.type)
      return ModifierSummonWatchByCardBuffTarget
    if (modifierType == ModifierOpeningGambitDamageEnemiesNearShadowCreep.type)
      return ModifierOpeningGambitDamageEnemiesNearShadowCreep
    if (modifierType == ModifierMyAttackOrAttackedWatchSpawnMinionNearby.type)
      return ModifierMyAttackOrAttackedWatchSpawnMinionNearby
    if (modifierType == ModifierSummonWatchDreadnaught.type)
      return ModifierSummonWatchDreadnaught
    if (modifierType == ModifierReplaceWatchSpawnEntity.type)
      return ModifierReplaceWatchSpawnEntity
    if (modifierType == ModifierDynamicCountModifySelfCostByBattlePetsOnBoard.type)
      return ModifierDynamicCountModifySelfCostByBattlePetsOnBoard
    if (modifierType == ModifierApplyMinionToBoardWatchApplyModifiersToTarget.type)
      return ModifierApplyMinionToBoardWatchApplyModifiersToTarget
    if (modifierType == ModifierKillWatchSpawnEnemyEntity.type)
      return ModifierKillWatchSpawnEnemyEntity
    if (modifierType == ModifierEndEveryTurnWatchDamageOwner.type)
      return ModifierEndEveryTurnWatchDamageOwner
    if (modifierType == ModifierMyTeamMoveWatchAnyReason.type)
      return ModifierMyTeamMoveWatchAnyReason
    if (modifierType == ModifierMyTeamMoveWatchAnyReasonBuffTarget.type)
      return ModifierMyTeamMoveWatchAnyReasonBuffTarget
    if (modifierType == ModifierEndTurnWatchRefreshArtifacts.type)
      return ModifierEndTurnWatchRefreshArtifacts
    if (modifierType == ModifierGainAttackWatchBuffSelfBySameThisTurn.type)
      return ModifierGainAttackWatchBuffSelfBySameThisTurn
    if (modifierType == ModifierInquisitorKron.type)
      return ModifierInquisitorKron
    if (modifierType == ModifierTakeDamageWatchSpawnShadowCreep.type)
      return ModifierTakeDamageWatchSpawnShadowCreep
    if (modifierType == ModifierDyingWishApplyModifiersRandomly.type)
      return ModifierDyingWishApplyModifiersRandomly
    if (modifierType == ModifierOpeningGambitBuffSelfByBattlePetsHandStats.type)
      return ModifierOpeningGambitBuffSelfByBattlePetsHandStats
    if (modifierType == ModifierHealWatchBuffGeneral.type)
      return ModifierHealWatchBuffGeneral
    if (modifierType == ModifierDealDamageWatchHatchEggs.type)
      return ModifierDealDamageWatchHatchEggs
    if (modifierType == ModifierDyingWishDispelNearestEnemy.type)
      return ModifierDyingWishDispelNearestEnemy
    if (modifierType == ModifierSpawnedFromEgg.type)
      return ModifierSpawnedFromEgg
    if (modifierType == ModifierTamedBattlePet.type)
      return ModifierTamedBattlePet
    if (modifierType == ModifierFriendlyDeathWatchForBattlePetDrawCard.type)
      return ModifierFriendlyDeathWatchForBattlePetDrawCard
    if (modifierType == ModifierDyingWishSpawnTileAnywhere.type)
      return ModifierDyingWishSpawnTileAnywhere
    if (modifierType == ModifierElkowl.type)
      return ModifierElkowl
    if (modifierType == ModifierOpeningGambitPutCardInOpponentHand.type)
      return ModifierOpeningGambitPutCardInOpponentHand
    if (modifierType == ModifierEndTurnWatchSpawnTile.type)
      return ModifierEndTurnWatchSpawnTile
    if (modifierType == ModifierMyMinionAttackWatchHealGeneral.type)
      return ModifierMyMinionAttackWatchHealGeneral
    if (modifierType == ModifierImmuneToDamageFromMinionsAndGenerals.type)
      return ModifierImmuneToDamageFromMinionsAndGenerals
    if (modifierType == ModifierOpeningGambitDamageInFrontRow.type)
      return ModifierOpeningGambitDamageInFrontRow
    if (modifierType == ModifierInvalidateRush.type)
      return ModifierInvalidateRush
    if (modifierType == ModifierStartTurnWatchEquipArtifact.type)
      return ModifierStartTurnWatchEquipArtifact
    if (modifierType == ModifierStartTurnWatchPlaySpell.type)
      return ModifierStartTurnWatchPlaySpell
    if (modifierType == ModifierOpeningGambitSpawnCopiesOfEntityNearby.type)
      return ModifierOpeningGambitSpawnCopiesOfEntityNearby
    if (modifierType == ModifierDyingWishDispelAllEnemyMinions.type)
      return ModifierDyingWishDispelAllEnemyMinions
    if (modifierType == ModifierOpponentDrawCardWatchDamageEnemyGeneral.type)
      return ModifierOpponentDrawCardWatchDamageEnemyGeneral
    if (modifierType == ModifierAttacksDealNoDamage.type)
      return ModifierAttacksDealNoDamage
    if (modifierType == ModifierOpeningGambitRefreshSignatureCard.type)
      return ModifierOpeningGambitRefreshSignatureCard
    if (modifierType == ModifierSynergizeSpawnVanarToken.type)
      return ModifierSynergizeSpawnVanarToken
    if (modifierType == ModifierOpeningGambitChangeSignatureCard.type)
      return ModifierOpeningGambitChangeSignatureCard
    if (modifierType == ModifierDoubleAttackStat.type)
      return ModifierDoubleAttackStat
    if (modifierType == ModifierSynergizeApplyModifiers.type)
      return ModifierSynergizeApplyModifiers
    if (modifierType == ModifierMyGeneralDamagedWatchBuffSelfAttackForSame.type)
      return ModifierMyGeneralDamagedWatchBuffSelfAttackForSame
    if (modifierType == ModifierKillWatchRefreshExhaustion.type)
      return ModifierKillWatchRefreshExhaustion
    if (modifierType == ModifierHasBackstab.type)
      return ModifierHasBackstab
    if (modifierType == ModifierDealDamageWatchRefreshSignatureCard.type)
      return ModifierDealDamageWatchRefreshSignatureCard
    if (modifierType == ModifierOpeningGambitGrandmasterVariax.type)
      return ModifierOpeningGambitGrandmasterVariax
    if (modifierType == ModifierSynergizeRefreshSpell.type)
      return ModifierSynergizeRefreshSpell
    if (modifierType == ModifierImmuneToDamageOnEnemyTurn.type)
      return ModifierImmuneToDamageOnEnemyTurn
    if (modifierType == ModifierOpeningGambitDestroyNearbyMinions.type)
      return ModifierOpeningGambitDestroyNearbyMinions
    if (modifierType == ModifierSynergizeHealMyGeneral.type)
      return ModifierSynergizeHealMyGeneral
    if (modifierType == ModifierSynergizeDamageEnemyGeneral.type)
      return ModifierSynergizeDamageEnemyGeneral
    if (modifierType == ModifierSynergizeApplyModifiersToGeneral.type)
      return ModifierSynergizeApplyModifiersToGeneral
    if (modifierType == ModifierSynergizeDamageEnemy.type)
      return ModifierSynergizeDamageEnemy
    if (modifierType == ModifierSynergizeApplyModifiersToWraithlings.type)
      return ModifierSynergizeApplyModifiersToWraithlings
    if (modifierType == ModifierOpeningGambitSpawnVanarTokensAroundGeneral.type)
      return ModifierOpeningGambitSpawnVanarTokensAroundGeneral
    if (modifierType == ModifierDyingWishTransformRandomMinion.type)
      return ModifierDyingWishTransformRandomMinion
    if (modifierType == ModifierOnSpawnCopyMyGeneral.type)
      return ModifierOnSpawnCopyMyGeneral
    if (modifierType == ModifierTakesDoubleDamage.type)
      return ModifierTakesDoubleDamage
    if (modifierType == ModifierMyHealWatchAnywhereBuffSelf.type)
      return ModifierMyHealWatchAnywhereBuffSelf
    if (modifierType == ModifierToggleStructure.type)
      return ModifierToggleStructure
    if (modifierType == ModifierSynergizeTeleportRandomEnemy.type)
      return ModifierSynergizeTeleportRandomEnemy
    if (modifierType == ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard.type)
      return ModifierStartTurnWatchDispelAllEnemyMinionsDrawCard
    if (modifierType == ModifierAbsorbDamageGolems.type)
      return ModifierAbsorbDamageGolems
    if (modifierType == ModifierExpireApplyModifiers.type)
      return ModifierExpireApplyModifiers
    if (modifierType == ModifierSecondWind.type)
      return ModifierSecondWind
    if (modifierType == ModifierKillWatchRespawnEntity.type)
      return ModifierKillWatchRespawnEntity
    if (modifierType == ModifierOpponentSummonWatchSpawn1HealthClone.type)
      return ModifierOpponentSummonWatchSpawn1HealthClone
    if (modifierType == ModifierDealOrTakeDamageWatch.type)
      return ModifierDealOrTakeDamageWatch
    if (modifierType == ModifierDealOrTakeDamageWatchRandomTeleportOther.type)
      return ModifierDealOrTakeDamageWatchRandomTeleportOther
    if (modifierType == ModifierEndTurnWatchTeleportCorner.type)
      return ModifierEndTurnWatchTeleportCorner
    if (modifierType == ModifierDieSpawnNewGeneral.type)
      return ModifierDieSpawnNewGeneral
    if (modifierType == ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies.type)
      return ModifierEndTurnWatchDealDamageToSelfAndNearbyEnemies
    if (modifierType == ModifierBond.type)
      return ModifierBond
    if (modifierType == ModifierBondApplyModifiers.type)
      return ModifierBondApplyModifiers
    if (modifierType == ModifierDoubleHealthStat.type)
      return ModifierDoubleHealthStat
    if (modifierType == ModifierBandingApplyModifiers.type)
      return ModifierBandingApplyModifiers
    if (modifierType == ModifierBondApplyModifiersByRaceId.type)
      return ModifierBondApplyModifiersByRaceId
    if (modifierType == ModifierBelongsToAllRaces.type)
      return ModifierBelongsToAllRaces
    if (modifierType == ModifierOpeningGambitGoleminate.type)
      return ModifierOpeningGambitGoleminate
    if (modifierType == ModifierSpellWatchDrawRandomArcanyst.type)
      return ModifierSpellWatchDrawRandomArcanyst
    if (modifierType == ModifierOpeningGambitSpawnTribal.type)
      return ModifierOpeningGambitSpawnTribal
    if (modifierType == ModifierDyingWishSpawnTribal.type)
      return ModifierDyingWishSpawnTribal
    if (modifierType == ModifierDrawCardWatchCopySpell.type)
      return ModifierDrawCardWatchCopySpell
    if (modifierType == ModifierBondPutCardsInHand.type)
      return ModifierBondPutCardsInHand
    if (modifierType == ModifierBondDrawCards.type)
      return ModifierBondDrawCards
    if (modifierType == ModifierSpellWatchBuffAllies.type)
      return ModifierSpellWatchBuffAllies
    if (modifierType == ModifierMyAttackWatchGetSonghaiSpells.type)
      return ModifierMyAttackWatchGetSonghaiSpells
    if (modifierType == ModifierBondSpawnEntity.type)
      return ModifierBondSpawnEntity
    if (modifierType == ModifierHealWatchDamageRandomEnemy.type)
      return ModifierHealWatchDamageRandomEnemy
    if (modifierType == ModifierOpeningGambitSirocco.type)
      return ModifierOpeningGambitSirocco
    if (modifierType == ModifierBondNightshroud.type)
      return ModifierBondNightshroud
    if (modifierType == ModifierSpellWatchPutCardInHand.type)
      return ModifierSpellWatchPutCardInHand
    if (modifierType == ModifierNocturne.type)
      return ModifierNocturne
    if (modifierType == ModifierOpeningGambitDeathKnell.type)
      return ModifierOpeningGambitDeathKnell
    if (modifierType == ModifierBondHealMyGeneral.type)
      return ModifierBondHealMyGeneral
    if (modifierType == ModifierTakeDamageWatchJuggernaut.type)
      return ModifierTakeDamageWatchJuggernaut
    if (modifierType == ModifierKillWatchSpawnCopyNearby.type)
      return ModifierKillWatchSpawnCopyNearby
    if (modifierType == ModifierOnRemoveSpawnRandomDeadEntity.type)
      return ModifierOnRemoveSpawnRandomDeadEntity
    if (modifierType == ModifierGrowPermanent.type)
      return ModifierGrowPermanent
    if (modifierType == ModifierShatteringHeart.type)
      return ModifierShatteringHeart
    if (modifierType == ModifierOpeningGambitEquipArtifact.type)
      return ModifierOpeningGambitEquipArtifact
    if (modifierType == ModifierFeralu.type)
      return ModifierFeralu
    if (modifierType == ModifierDispelAreaAttack.type)
      return ModifierDispelAreaAttack
    if (modifierType == ModifierSummonWatchAnyPlayer.type)
      return ModifierSummonWatchAnyPlayer
    if (modifierType == ModifierSummonWatchAnyPlayerApplyModifiers.type)
      return ModifierSummonWatchAnyPlayerApplyModifiers
    if (modifierType == ModifierSummonWatchNearbyAnyPlayerApplyModifiers.type)
      return ModifierSummonWatchNearbyAnyPlayerApplyModifiers
    if (modifierType == ModifierSelfDamageAreaAttack.type)
      return ModifierSelfDamageAreaAttack
    if (modifierType == ModifierOpponentSummonWatchOpponentDrawCard.type)
      return ModifierOpponentSummonWatchOpponentDrawCard
    if (modifierType == ModifierOpponentDrawCardWatchOverdrawSummonEntity.type)
      return ModifierOpponentDrawCardWatchOverdrawSummonEntity
    if (modifierType == ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana.type)
      return ModifierEndTurnWatchDamagePlayerBasedOnRemainingMana
    if (modifierType == ModifierHPChange.type)
      return ModifierHPChange
    if (modifierType == ModifierHPThresholdGainModifiers.type)
      return ModifierHPThresholdGainModifiers
    if (modifierType == ModifierExtraDamageOnCounterattack.type)
      return ModifierExtraDamageOnCounterattack
    if (modifierType == ModifierOnOpponentDeathWatch.type)
      return ModifierOnOpponentDeathWatch
    if (modifierType == ModifierOnOpponentDeathWatchSpawnEntityOnSpace.type)
      return ModifierOnOpponentDeathWatchSpawnEntityOnSpace
    if (modifierType == ModifierDyingWishSpawnEgg.type)
      return ModifierDyingWishSpawnEgg
    if (modifierType == ModifierSummonWatchFromActionBarApplyModifiers.type)
      return ModifierSummonWatchFromActionBarApplyModifiers
    if (modifierType == ModifierTakeDamageWatchSpawnWraithlings.type)
      return ModifierTakeDamageWatchSpawnWraithlings
    if (modifierType == ModifierTakeDamageWatchDamageAttacker.type)
      return ModifierTakeDamageWatchDamageAttacker
    if (modifierType == ModifierStartTurnWatchTeleportRandomSpace.type)
      return ModifierStartTurnWatchTeleportRandomSpace
    if (modifierType == ModifierSummonWatchFromActionBarAnyPlayer.type)
      return ModifierSummonWatchFromActionBarAnyPlayer
    if (modifierType == ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers.type)
      return ModifierSummonWatchFromActionBarAnyPlayerApplyModifiers
    if (modifierType == ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned.type)
      return ModifierStartTurnWatchDamageGeneralEqualToMinionsOwned
    if (modifierType == ModifierCannotBeReplaced.type)
      return ModifierCannotBeReplaced
    if (modifierType == ModifierHPChangeSummonEntity.type)
      return ModifierHPChangeSummonEntity
    if (modifierType == ModifierStartTurnWatchDamageAndBuffSelf.type)
      return ModifierStartTurnWatchDamageAndBuffSelf
    if (modifierType == ModifierEnemyTeamMoveWatch.type)
      return ModifierEnemyTeamMoveWatch
    if (modifierType == ModifierEnemyTeamMoveWatchSummonEntityBehind.type)
      return ModifierEnemyTeamMoveWatchSummonEntityBehind
    if (modifierType == ModifierDyingWishLoseGame.type)
      return ModifierDyingWishLoseGame
    if (modifierType == ModifierAttacksDamageAllEnemyMinions.type)
      return ModifierAttacksDamageAllEnemyMinions
    if (modifierType == ModifierATKThresholdDie.type)
      return ModifierATKThresholdDie
    if (modifierType == ModifierOpeningGambitRemoveCardsFromDecksByCost.type)
      return ModifierOpeningGambitRemoveCardsFromDecksByCost
    if (modifierType == ModifierDyingWishAddCardToDeck.type)
      return ModifierDyingWishAddCardToDeck
    if (modifierType == ModifierOnDyingInfest.type)
      return ModifierOnDyingInfest
    if (modifierType == ModifierDyingWishDrawEnemyLegendaryArtifact.type)
      return ModifierDyingWishDrawEnemyLegendaryArtifact
    if (modifierType == ModifierSynergizeDamageClosestEnemy.type)
      return ModifierSynergizeDamageClosestEnemy
    if (modifierType == ModifierOverwatchHidden.type)
      return ModifierOverwatchHidden
    if (modifierType == ModifierOverwatchAttackedBuffSelf.type)
      return ModifierOverwatchAttackedBuffSelf
    if (modifierType == ModifierOverwatchMovedNearbyAttack.type)
      return ModifierOverwatchMovedNearbyAttack
    if (modifierType == ModifierOverwatchMovedNearbyMoveBothToCorners.type)
      return ModifierOverwatchMovedNearbyMoveBothToCorners
    if (modifierType == ModifierOverwatchMovedNearbyDispelAndProvoke.type)
      return ModifierOverwatchMovedNearbyDispelAndProvoke
    if (modifierType == ModifierOverwatchDestroyedResummonAndDestroyOther.type)
      return ModifierOverwatchDestroyedResummonAndDestroyOther
    if (modifierType == ModifierOverwatchMovedNearbyMiniImmolation.type)
      return ModifierOverwatchMovedNearbyMiniImmolation
    if (modifierType == ModifierOverwatchDestroyedPutCardInHand.type)
      return ModifierOverwatchDestroyedPutCardInHand
    if (modifierType == ModifierOverwatchAttackedDamageEnemyGeneralForSame.type)
      return ModifierOverwatchAttackedDamageEnemyGeneralForSame
    if (modifierType == ModifierOverwatchDestroyedPutMagmarCardsInHand.type)
      return ModifierOverwatchDestroyedPutMagmarCardsInHand
    if (modifierType == ModifierEnemyMinionAttackWatchGainKeyword.type)
      return ModifierEnemyMinionAttackWatchGainKeyword
    if (modifierType == ModifierOpeningGambitSpawnEnemyMinionNearOpponent.type)
      return ModifierOpeningGambitSpawnEnemyMinionNearOpponent
    if (modifierType == ModifierEnemyDealDamageWatch.type)
      return ModifierEnemyDealDamageWatch
    if (modifierType == ModifierEnemySpellWatch.type)
      return ModifierEnemySpellWatch
    if (modifierType == ModifierEnemySpellWatchBuffSelf.type)
      return ModifierEnemySpellWatchBuffSelf
    if (modifierType == ModifierOpponentDrawCardWatchGainKeyword.type)
      return ModifierOpponentDrawCardWatchGainKeyword
    if (modifierType == ModifierOpponentSummonWatchSummonEgg.type)
      return ModifierOpponentSummonWatchSummonEgg
    if (modifierType == ModifierOpponentSummonWatchBuffMinionInHand.type)
      return ModifierOpponentSummonWatchBuffMinionInHand
    if (modifierType == ModifierSummonWatchAnyPlayer.type)
      return ModifierSummonWatchAnyPlayer
    if (modifierType == ModifierEndTurnWatchTransformNearbyEnemies.type)
      return ModifierEndTurnWatchTransformNearbyEnemies
    if (modifierType == ModifierBackstabWatch.type)
      return ModifierBackstabWatch
    if (modifierType == ModifierBackstabWatchStealSpellFromDeck.type)
      return ModifierBackstabWatchStealSpellFromDeck
    if (modifierType == ModifierDyingWishDrawMinionsWithDyingWish.type)
      return  ModifierDyingWishDrawMinionsWithDyingWish
    if (modifierType == ModifierOverwatchSpellTarget.type)
      return ModifierOverwatchSpellTarget
    if (modifierType == ModifierOverwatchEndTurn.type)
      return ModifierOverwatchEndTurn
    if (modifierType == ModifierOverwatchSpellTargetDamageEnemies.type)
      return ModifierOverwatchSpellTargetDamageEnemies
    if (modifierType == ModifierOverwatchEndTurnPutCardInHand.type)
      return ModifierOverwatchEndTurnPutCardInHand
    if (modifierType == ModifierDealDamageWatchControlEnemyMinionUntilEOT.type)
      return ModifierDealDamageWatchControlEnemyMinionUntilEOT
    if (modifierType == ModifierStartTurnWatchDamageEnemiesInRow.type)
      return ModifierStartTurnWatchDamageEnemiesInRow
    if (modifierType == ModifierStartTurnWatchDestroySelfAndEnemies.type)
      return ModifierStartTurnWatchDestroySelfAndEnemies
    if (modifierType == ModifierSentinelHidden.type)
      return ModifierSentinelHidden
    if (modifierType == ModifierSentinelSetup.type)
      return ModifierSentinelSetup
    if (modifierType == ModifierSentinelOpponentSummonDamageIt.type)
      return ModifierSentinelOpponentSummonDamageIt
    if (modifierType == ModifierSentinelOpponentGeneralAttack.type)
      return ModifierSentinelOpponentGeneralAttack
    if (modifierType == ModifierSummonWatchIfLowAttackSummonedBuffSelf.type)
      return ModifierSummonWatchIfLowAttackSummonedBuffSelf
    if (modifierType == ModifierMyAttackWatchBonusManaCrystal.type)
      return ModifierMyAttackWatchBonusManaCrystal
    if (modifierType == ModifierEnemySpellWatchCopySpell.type)
      return ModifierEnemySpellWatchCopySpell
    if (modifierType == ModifierOpeningGambitPutCardInHand.type)
      return ModifierOpeningGambitPutCardInHand
    if (modifierType == ModifierSentinelOpponentSpellCast.type)
      return ModifierSentinelOpponentSpellCast
    if (modifierType == ModifierStartTurnWatchPutCardInHand.type)
      return ModifierStartTurnWatchPutCardInHand
    if (modifierType == ModifierHallowedGround.type)
      return ModifierHallowedGround
    if (modifierType == ModifierHallowedGroundBuff.type)
      return ModifierHallowedGroundBuff
    if (modifierType == ModifierSandPortal.type)
      return ModifierSandPortal
    if (modifierType == ModifierDoomed.type)
      return ModifierDoomed
    if (modifierType == ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction.type)
      return ModifierOpeningGambitRemoveArtifactToDrawArtifactFromFaction
    if (modifierType == ModifierEnemySpellWatchPutCardInHand.type)
      return ModifierEnemySpellWatchPutCardInHand
    if (modifierType == ModifierSentinelOpponentSummonCopyIt.type)
      return ModifierSentinelOpponentSummonCopyIt
    if (modifierType == ModifierDealDamageWatchTeleportEnemyToYourSide.type)
      return ModifierDealDamageWatchTeleportEnemyToYourSide
    if (modifierType == ModifierSpellWatchDamageAllMinions.type)
      return ModifierSpellWatchDamageAllMinions
    if (modifierType == ModifierSentinelOpponentSummonSwapPlaces.type)
      return ModifierSentinelOpponentSummonSwapPlaces
    if (modifierType == ModifierMyAttackWatchSpawnMinionNearby.type)
      return ModifierMyAttackWatchSpawnMinionNearby
    if (modifierType == ModifierDyingWishDrawWishCard.type)
      return ModifierDyingWishDrawWishCard
    if (modifierType == ModifierEnemyAttackWatch.type)
      return ModifierEnemyAttackWatch
    if (modifierType == ModifierWildTahr.type)
      return ModifierWildTahr
    if (modifierType == ModifierEndTurnWatchGainTempBuff.type)
      return ModifierEndTurnWatchGainTempBuff
    if (modifierType == ModifierImmuneToAttacksByMinions.type)
      return ModifierImmuneToAttacksByMinions
    if (modifierType == ModifierOpeningGambitAlabasterTitan.type)
      return ModifierOpeningGambitAlabasterTitan
    if (modifierType == ModifierPrimalProtection.type)
      return ModifierPrimalProtection
    if (modifierType == ModifierPrimalTile.type)
      return ModifierPrimalTile
    if (modifierType == ModifierSummonWatchFromActionBar.type)
      return ModifierSummonWatchFromActionBar
    if (modifierType == ModifierMyMoveWatchAnyReason.type)
      return ModifierMyMoveWatchAnyReason
    if (modifierType == ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions.type)
      return ModifierMyMoveWatchAnyReasonDamageNearbyEnemyMinions
    if (modifierType == ModifierCannotCastSpellsByCost.type)
      return ModifierCannotCastSpellsByCost
    if (modifierType == ModifierKillWatchBounceEnemyToActionBar.type)
      return ModifierKillWatchBounceEnemyToActionBar
    if (modifierType == ModifierMyGeneralAttackWatch.type)
      return ModifierMyGeneralAttackWatch
    if (modifierType == ModifierMyGeneralAttackWatchSpawnEntity.type)
      return ModifierMyGeneralAttackWatchSpawnEntity
    if (modifierType == ModifierOpeningGambitReplaceHand.type)
      return ModifierOpeningGambitReplaceHand
    if (modifierType == ModifierDealDamageWatchDamageJoinedEnemies.type)
      return ModifierDealDamageWatchDamageJoinedEnemies
    if (modifierType == ModifierEternalHeart.type)
      return ModifierEternalHeart
    if (modifierType == ModifierOpeningGambitSpawnPartyAnimals.type)
      return ModifierOpeningGambitSpawnPartyAnimals
    if (modifierType == ModifierSprigginDiesBuffSelf.type)
      return ModifierSprigginDiesBuffSelf
    if (modifierType == ModifierSituationalBuffSelfIfSpriggin.type)
      return ModifierSituationalBuffSelfIfSpriggin
    if (modifierType == ModifierMirage.type)
      return ModifierMirage
    if (modifierType == ModifierCustomSpawn.type)
      return ModifierCustomSpawn
    if (modifierType == ModifierCustomSpawnOnOtherUnit.type)
      return ModifierCustomSpawnOnOtherUnit
    if (modifierType == ModifierOpeningGambitDagona.type)
      return ModifierOpeningGambitDagona
    if (modifierType == ModifierDyingWishDagona.type)
      return ModifierDyingWishDagona
    if (modifierType == ModifierMyAttackWatchGamble.type)
      return ModifierMyAttackWatchGamble
    if (modifierType == ModifierOpeningGambitStealEnemyGeneralHealth.type)
      return ModifierOpeningGambitStealEnemyGeneralHealth
    if (modifierType == ModifierDoomed2.type)
      return ModifierDoomed2
    if (modifierType == ModifierDoomed3.type)
      return ModifierDoomed3
    if (modifierType == ModifierDeathWatchDamageRandomMinionHealMyGeneral.type)
      return ModifierDeathWatchDamageRandomMinionHealMyGeneral
    if (modifierType == ModifierStartTurnWatchSpawnTile.type)
      return ModifierStartTurnWatchSpawnTile
    if (modifierType == ModifierDealDamageWatchIfMinionHealMyGeneral.type)
      return ModifierDealDamageWatchIfMinionHealMyGeneral
    if (modifierType == ModifierSynergizeSummonMinionNearGeneral.type)
      return ModifierSynergizeSummonMinionNearGeneral
    if (modifierType == ModifierSpellWatchApplyModifiers.type)
      return ModifierSpellWatchApplyModifiers
    if (modifierType == ModifierOpeningGambitProgenitor.type)
      return ModifierOpeningGambitProgenitor
    if (modifierType == ModifierSpellWatchDrawCard.type)
      return ModifierSpellWatchDrawCard
    if (modifierType == ModifierSynergizeDrawBloodboundSpell.type)
      return ModifierSynergizeDrawBloodboundSpell
    if (modifierType == ModifierOpeningGambitDrawCopyFromDeck.type)
      return ModifierOpeningGambitDrawCopyFromDeck
    if (modifierType == ModifierBandedProvoke.type)
      return ModifierBandedProvoke
    if (modifierType == ModifierBandingProvoke.type)
      return ModifierBandingProvoke
    if (modifierType == ModifierKillWatchDeceptibot.type)
      return ModifierKillWatchDeceptibot
    if (modifierType == ModifierDeathWatchBuffMinionsInHand.type)
      return ModifierDeathWatchBuffMinionsInHand
    if (modifierType == ModifierDyingWishDestroyRandomEnemyNearby.type)
      return ModifierDyingWishDestroyRandomEnemyNearby
    if (modifierType == ModifierSynergizeSummonMinionNearby.type)
      return ModifierSynergizeSummonMinionNearby
    if (modifierType == ModifierBuilding.type)
      return ModifierBuilding
    if (modifierType == ModifierBuild.type)
      return ModifierBuild
    if (modifierType == ModifierBeforeMyAttackWatch.type)
      return ModifierBeforeMyAttackWatch
    if (modifierType == ModifierMyAttackWatchApplyModifiersToAllies.type)
      return ModifierMyAttackWatchApplyModifiersToAllies
    if (modifierType == ModifierSummonWatchFromActionBarByRaceBothPlayersDraw.type)
      return ModifierSummonWatchFromActionBarByRaceBothPlayersDraw
    if (modifierType == ModifierSummonWatchApplyModifiersToBoth.type)
      return ModifierSummonWatchApplyModifiersToBoth
    if (modifierType == ModifierSummonWatchNearbyApplyModifiersToBoth.type)
      return ModifierSummonWatchNearbyApplyModifiersToBoth
    if (modifierType == ModifierSummonWatchTransform.type)
      return ModifierSummonWatchTransform
    if (modifierType == ModifierSummonWatchNearbyTransform.type)
      return ModifierSummonWatchNearbyTransform
    if (modifierType == ModifierSynergizePutCardInHand.type)
      return ModifierSynergizePutCardInHand
    if (modifierType == ModifierSynergizeBuffSelf.type)
      return ModifierSynergizeBuffSelf
    if (modifierType == ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard.type)
      return ModifierSentinelOpponentGeneralAttackHealEnemyGeneralDrawCard
    if (modifierType == ModifierSentinelOpponentSummonBuffItDrawCard.type)
      return ModifierSentinelOpponentSummonBuffItDrawCard
    if (modifierType == ModifierSentinelOpponentSpellCastRefundManaDrawCard.type)
      return ModifierSentinelOpponentSpellCastRefundManaDrawCard
    if (modifierType == ModifierTakeDamageWatchSpawnRandomHaunt.type)
      return ModifierTakeDamageWatchSpawnRandomHaunt
    if (modifierType == ModifierCannotCastBBS.type)
      return ModifierCannotCastBBS
    if (modifierType == ModifierStartTurnWatchPutCardInOpponentsHand.type)
      return ModifierStartTurnWatchPutCardInOpponentsHand
    if (modifierType == ModifierSynergizeRazorArchitect.type)
      return ModifierSynergizeRazorArchitect
    if (modifierType == ModifierDeathWatchSpawnRandomDemon.type)
      return ModifierDeathWatchSpawnRandomDemon
    if (modifierType == ModifierWhenAttackedDestroyThis.type)
      return ModifierWhenAttackedDestroyThis
    if (modifierType == ModifierSituationalBuffSelfIfFullHealth.type)
      return ModifierSituationalBuffSelfIfFullHealth
    if (modifierType == ModifierEnemyAttackWatchGainAttack.type)
      return ModifierEnemyAttackWatchGainAttack
    if (modifierType == ModifierDeathWatchFriendlyMinionSwapAllegiance.type)
      return ModifierDeathWatchFriendlyMinionSwapAllegiance
    if (modifierType == ModifierOpeningGambitSniperZen.type)
      return ModifierOpeningGambitSniperZen
    if (modifierType == ModifierDoubleDamageToStunnedEnemies.type)
      return ModifierDoubleDamageToStunnedEnemies
    if (modifierType == ModifierStartTurnWatchRespawnClones.type)
      return ModifierStartTurnWatchRespawnClones
    if (modifierType == ModifierSwitchAllegiancesGainAttack.type)
      return ModifierSwitchAllegiancesGainAttack
    if (modifierType == ModifierOpponentSummonWatchRandomTransform.type)
      return ModifierOpponentSummonWatchRandomTransform
    if (modifierType == ModifierOnSpawnKillMyGeneral.type)
      return ModifierOnSpawnKillMyGeneral
    if (modifierType == ModifierDeathWatchGainAttackEqualToEnemyAttack.type)
      return ModifierDeathWatchGainAttackEqualToEnemyAttack
    if (modifierType == ModifierDyingWishBuffEnemyGeneral.type)
      return ModifierDyingWishBuffEnemyGeneral
    if (modifierType == ModifierBandedProvoke.type)
      return ModifierBandedProvoke
    if (modifierType == ModifierBandingProvoke.type)
      return ModifierBandingProvoke
    if (modifierType == ModifierOpponentSummonWatchSwapGeneral.type)
      return ModifierOpponentSummonWatchSwapGeneral
    if (modifierType == ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions.type)
      return ModifierMyAttackOrCounterattackWatchApplyModifiersToFriendlyMinions
    if (modifierType == ModifierMyAttackOrCounterattackWatchDamageRandomEnemy.type)
      return ModifierMyAttackOrCounterattackWatchDamageRandomEnemy
    if (modifierType == ModifierMyAttackWatchSummonDeadMinions.type)
      return ModifierMyAttackWatchSummonDeadMinions
    if (modifierType == ModifierMyAttackMinionWatchStealGeneralHealth.type)
      return ModifierMyAttackMinionWatchStealGeneralHealth
    if (modifierType == ModifierDyingWishRespawnEntity.type)
      return ModifierDyingWishRespawnEntity
    if (modifierType == ModifierBuildWatch.type)
      return ModifierBuildWatch
    if (modifierType == ModifierBuildCompleteApplyModifiersToNearbyAllies.type)
      return ModifierBuildCompleteApplyModifiersToNearbyAllies
    if (modifierType == ModifierBuildCompleteGainTempMana.type)
      return ModifierBuildCompleteGainTempMana
    if (modifierType == ModifierBuildCompleteHealGeneral.type)
      return ModifierBuildCompleteHealGeneral
    if (modifierType == ModifierMyBuildWatchDrawCards.type)
      return ModifierMyBuildWatchDrawCards
    if (modifierType == ModifierMyBuildWatch.type)
      return ModifierMyBuildWatch
    if (modifierType == ModifierBuildingSlowEnemies.type)
      return ModifierBuildingSlowEnemies
    if (modifierType == ModifierMyAttackOrCounterattackWatch.type)
      return ModifierMyAttackOrCounterattackWatch
    if (modifierType == ModifierMyAttackOrCounterattackWatchTransformIntoEgg.type)
      return ModifierMyAttackOrCounterattackWatchTransformIntoEgg
    if (modifierType == ModifierCannotDamageGenerals.type)
      return ModifierCannotDamageGenerals
    if (modifierType == ModifierBackstabWatchAddCardToHand.type)
      return ModifierBackstabWatchAddCardToHand
    if (modifierType == ModifierBuildCompleteReplicateAndSummonDervish.type)
      return ModifierBuildCompleteReplicateAndSummonDervish
    if (modifierType == ModifierBackstabWatchTransformToBuilding.type)
      return ModifierBackstabWatchTransformToBuilding
    if (modifierType == ModifierOpeningGambitProgressBuild.type)
      return ModifierOpeningGambitProgressBuild
    if (modifierType == ModifierAlwaysInfiltrated.type)
      return ModifierAlwaysInfiltrated
    if (modifierType == ModifierSummonWatchMechsShareKeywords.type)
      return ModifierSummonWatchMechsShareKeywords
    if (modifierType == ModifierSituationalBuffSelfIfHaveMech.type)
      return ModifierSituationalBuffSelfIfHaveMech
    if (modifierType == ModifierStartTurnWatchApplyTempArtifactModifier.type)
      return ModifierStartTurnWatchApplyTempArtifactModifier
    if (modifierType == ModifierSummonWatchByRaceSummonCopy.type)
      return ModifierSummonWatchByRaceSummonCopy
    if (modifierType == ModifierAuraAboveAndBelow.type)
      return ModifierAuraAboveAndBelow
    if (modifierType == ModifierDealDamageWatchApplyModifiersToAllies.type)
      return ModifierDealDamageWatchApplyModifiersToAllies
    if (modifierType == ModifierKillWatchSpawnEgg.type)
      return ModifierKillWatchSpawnEgg
    if (modifierType == ModifierMyAttackMinionWatch.type)
      return ModifierMyAttackMinionWatch
    if (modifierType == ModifierProvidesAlwaysInfiltrated.type)
      return ModifierProvidesAlwaysInfiltrated
    if (modifierType == ModifierInvulnerable.type)
      return ModifierInvulnerable
    if (modifierType == ModifierForgedArtifactDescription.type)
      return ModifierForgedArtifactDescription
    if (modifierType == ModifierOnDying.type)
      return ModifierOnDying
    if (modifierType == ModifierOnDyingSpawnEntity.type)
      return ModifierOnDyingSpawnEntity
    if (modifierType == ModifierCounter.type)
      return ModifierCounter
    if (modifierType == ModifierCounterBuildProgress.type)
      return ModifierCounterBuildProgress
    if (modifierType == ModifierCounterMechazorBuildProgress.type)
      return ModifierCounterMechazorBuildProgress
    if (modifierType == ModifierCounterShadowCreep.type)
      return ModifierCounterShadowCreep
    if (modifierType == ModifierSummonWatchAnywhereByRaceBuffSelf.type)
      return ModifierSummonWatchAnywhereByRaceBuffSelf
    if (modifierType == ModifierDyingWishPutCardInOpponentHand.type)
      return ModifierDyingWishPutCardInOpponentHand
    if (modifierType == ModifierEnemySpellWatchGainRandomKeyword.type)
      return ModifierEnemySpellWatchGainRandomKeyword
    if (modifierType == ModifierAnySummonWatchGainGeneralKeywords.type)
      return ModifierAnySummonWatchGainGeneralKeywords
    if (modifierType == ModifierMyMoveWatchAnyReasonDrawCard.type)
      return ModifierMyMoveWatchAnyReasonDrawCard
    if (modifierType == ModifierCounterBuildProgressDescription.type)
      return ModifierCounterBuildProgressDescription
    if (modifierType == ModifierCounterMechazorBuildProgressDescription.type)
      return ModifierCounterMechazorBuildProgressDescription
    if (modifierType == ModifierCounterShadowCreepDescription.type)
      return ModifierCounterShadowCreepDescription
    if (modifierType == ModifierOpeningGambitDestroyManaCrystal.type)
      return ModifierOpeningGambitDestroyManaCrystal
    if (modifierType == ModifierDyingWishDestroyManaCrystal.type)
      return ModifierDyingWishDestroyManaCrystal
    if (modifierType == ModifierOpeningGambitBonusManaCrystal.type)
      return ModifierOpeningGambitBonusManaCrystal
    if (modifierType == ModifierIntensify.type)
      return ModifierIntensify
    if (modifierType == ModifierIntensifyOneManArmy.type)
      return ModifierIntensifyOneManArmy
    if (modifierType == ModifierCollectableCard.type)
      return ModifierCollectableCard
    if (modifierType == ModifierDyingWishReduceManaCostOfDyingWish.type)
      return ModifierDyingWishReduceManaCostOfDyingWish
    if (modifierType == ModifierIntensifyBuffSelf.type)
      return ModifierIntensifyBuffSelf
    if (modifierType == ModifierBandingFlying.type)
      return ModifierBandingFlying
    if (modifierType == ModifierBandedFlying.type)
      return ModifierBandedFlying
    if (modifierType == ModifierDyingWishApplyModifiersToGenerals.type)
      return ModifierDyingWishApplyModifiersToGenerals
    if (modifierType == ModifierEnemySpellWatchHealMyGeneral.type)
      return ModifierEnemySpellWatchHealMyGeneral
    if (modifierType == ModifierMyAttackWatchAreaAttack.type)
      return ModifierMyAttackWatchAreaAttack
    if (modifierType == ModifierReplaceWatchApplyModifiersToReplaced.type)
      return ModifierReplaceWatchApplyModifiersToReplaced
    if (modifierType == ModifierImmuneToDamageByWeakerEnemies.type)
      return ModifierImmuneToDamageByWeakerEnemies
    if (modifierType == ModifierMyOtherMinionsDamagedWatch.type)
      return ModifierMyOtherMinionsDamagedWatch
    if (modifierType == ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows.type)
      return ModifierMyOtherMinionsDamagedWatchDamagedMinionGrows
    if (modifierType == ModifierBackstabWatchSummonBackstabMinion.type)
      return ModifierBackstabWatchSummonBackstabMinion
    if (modifierType == ModifierStartOpponentsTurnWatch.type)
      return ModifierStartOpponentsTurnWatch
    if (modifierType == ModifierStartOpponentsTurnWatchRemoveEntity.type)
      return ModifierStartOpponentsTurnWatchRemoveEntity
    if (modifierType == ModifierMyAttackWatchApplyModifiers.type)
      return ModifierMyAttackWatchApplyModifiers
    if (modifierType == ModifierAlwaysBackstabbed.type)
      return ModifierAlwaysBackstabbed
    if (modifierType == ModifierFriendsguard.type)
      return ModifierFriendsguard
    if (modifierType == ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck.type)
      return ModifierMyGeneralAttackWatchSpawnRandomEntityFromDeck
    if (modifierType == ModifierStackingShadowsBonusDamageUnique.type)
      return ModifierStackingShadowsBonusDamageUnique
    if (modifierType == ModifierEnemyCannotCastBBS.type)
      return ModifierEnemyCannotCastBBS
    if (modifierType == ModifierEntersBattlefieldWatch.type)
      return ModifierEntersBattlefieldWatch
    if (modifierType == ModifierEntersBattlefieldWatchApplyModifiers.type)
      return ModifierEntersBattlefieldWatchApplyModifiers
    if (modifierType == ModifierSummonWatchApplyModifiersToRanged.type)
      return ModifierSummonWatchApplyModifiersToRanged
    if (modifierType == ModifierStartsInHand.type)
      return ModifierStartsInHand
    if (modifierType == ModifierStartTurnWatchRestoreChargeToArtifacts.type)
      return ModifierStartTurnWatchRestoreChargeToArtifacts
    if (modifierType == ModifierIntensifyDamageEnemyGeneral.type)
      return ModifierIntensifyDamageEnemyGeneral
    if (modifierType == ModifierOpeningGambitMoveEnemyGeneralForward.type)
      return ModifierOpeningGambitMoveEnemyGeneralForward
    if (modifierType == ModifierBackstabWatchApplyPlayerModifiers.type)
      return ModifierBackstabWatchApplyPlayerModifiers
    if (modifierType == ModifierSynergizeSpawnEntityFromDeck.type)
      return ModifierSynergizeSpawnEntityFromDeck
    if (modifierType == ModifierSpellWatchAnywhereApplyModifiers.type)
      return ModifierSpellWatchAnywhereApplyModifiers
    if (modifierType == ModifierDamageBothGeneralsOnReplace.type)
      return ModifierDamageBothGeneralsOnReplace
    if (modifierType == ModifierStackingShadowsBonusDamageEqualNumberTiles.type)
      return ModifierStackingShadowsBonusDamageEqualNumberTiles
    if (modifierType == ModifierPseudoRush.type)
      return ModifierPseudoRush
    if (modifierType == ModifierIntensifyDamageNearby.type)
      return ModifierIntensifyDamageNearby
    if (modifierType == ModifierStartTurnWatchRemoveEntity.type)
      return ModifierStartTurnWatchRemoveEntity
    if (modifierType == ModifierOnSummonFromHand.type)
      return ModifierOnSummonFromHand
    if (modifierType == ModifierReplaceWatchShuffleCardIntoDeck.type)
      return ModifierReplaceWatchShuffleCardIntoDeck
    if (modifierType == ModifierEnemyStunWatch.type)
      return ModifierEnemyStunWatch
    if (modifierType == ModifierEnemyStunWatchTransformThis.type)
      return ModifierEnemyStunWatchTransformThis
    if (modifierType == ModifierEnemyStunWatchDamageNearbyEnemies.type)
      return ModifierEnemyStunWatchDamageNearbyEnemies
    if (modifierType == ModifierIntensifySpawnEntitiesNearby.type)
      return ModifierIntensifySpawnEntitiesNearby
    if (modifierType == ModifierStartTurnWatchImmolateDamagedMinions.type)
      return ModifierStartTurnWatchImmolateDamagedMinions
    if (modifierType == ModifierTakeDamageWatchOpponentDrawCard.type)
      return ModifierTakeDamageWatchOpponentDrawCard
    if (modifierType == ModifierMyAttackWatchScarabBlast.type)
      return ModifierMyAttackWatchScarabBlast
    if (modifierType == ModifierEquipFriendlyArtifactWatch.type)
      return ModifierEquipFriendlyArtifactWatch
    if (modifierType == ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost.type)
      return ModifierEquipFriendlyArtifactWatchGainAttackEqualToCost
    if (modifierType == ModifierOpponentSummonWatchSummonMinionInFront.type)
      return ModifierOpponentSummonWatchSummonMinionInFront
    if (modifierType == ModifierIntensifyTempBuffNearbyMinion.type)
      return ModifierIntensifyTempBuffNearbyMinion
    if (modifierType == ModifierEndTurnWatchGainLastSpellPlayedThisTurn.type)
      return ModifierEndTurnWatchGainLastSpellPlayedThisTurn
    if (modifierType == ModifierKillWatchRefreshExhaustionIfTargetStunned.type)
      return ModifierKillWatchRefreshExhaustionIfTargetStunned
    if (modifierType == ModifierEnemyGeneralAttackedWatch.type)
      return ModifierEnemyGeneralAttackedWatch
    if (modifierType == ModifierOnSummonFromHandApplyEmblems.type)
      return ModifierOnSummonFromHandApplyEmblems
    if (modifierType == ModifierOnDyingResummonAnywhere.type)
      return ModifierOnDyingResummonAnywhere
    if (modifierType == ModifierSummonWatchBurnOpponentCards.type)
      return ModifierSummonWatchBurnOpponentCards
    if (modifierType == ModifierEnemyStunWatchFullyHeal.type)
      return ModifierEnemyStunWatchFullyHeal
    if (modifierType == ModifierOpeningGambitChangeSignatureCardForThisTurn.type)
      return ModifierOpeningGambitChangeSignatureCardForThisTurn
    if (modifierType == ModifierDyingWishGoldenGuide.type)
      return ModifierDyingWishGoldenGuide
    if (modifierType == ModifierKillWatchAndSurvive.type)
      return ModifierKillWatchAndSurvive
    if (modifierType == ModifierKillWatchAndSurviveScarzig.type)
      return ModifierKillWatchAndSurviveScarzig
    if (modifierType == ModifierMyGeneralDamagedWatchMiniMinion.type)
      return ModifierMyGeneralDamagedWatchMiniMinion
    if (modifierType == ModifierEndTurnWatchAnyPlayer.type)
      return ModifierEndTurnWatchAnyPlayer
    if (modifierType == ModifierEndTurnWatchAnyPlayerPullRandomUnits.type)
      return ModifierEndTurnWatchAnyPlayerPullRandomUnits
    if (modifierType == ModifierFate.type)
      return ModifierFate
    if (modifierType == ModifierFateSingleton.type)
      return ModifierFateSingleton
    if (modifierType == ModifierToken.type)
      return ModifierToken
    if (modifierType == ModifierTokenCreator.type)
      return ModifierTokenCreator
    if (modifierType == ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace.type)
      return ModifierMyAttackMinionWatchKillTargetSummonThisOnSpace
    if (modifierType == ModifierFateAbyssianDyingQuest.type)
      return ModifierFateAbyssianDyingQuest
    if (modifierType == ModifierFateSonghaiMinionQuest.type)
      return ModifierFateSonghaiMinionQuest
    if (modifierType == ModifierFateMagmarBuffQuest.type)
      return ModifierFateMagmarBuffQuest
    if (modifierType == ModifierFateLyonarSmallMinionQuest.type)
      return ModifierFateLyonarSmallMinionQuest
    if (modifierType == ModifierOpeningGambitTransformHandIntoLegendaries.type)
      return ModifierOpeningGambitTransformHandIntoLegendaries
    if (modifierType == ModifierFateVanarTokenQuest.type)
      return ModifierFateVanarTokenQuest
    if (modifierType == ModifierFateVetruvianMovementQuest.type)
      return ModifierFateVetruvianMovementQuest
    if (modifierType == ModifierEndTurnWatchAnyPlayerHsuku.type)
      return ModifierEndTurnWatchAnyPlayerHsuku
    if (modifierType == ModifierCounterIntensify.type)
      return ModifierCounterIntensify
    if (modifierType == ModifierCounterIntensifyDescription.type)
      return ModifierCounterIntensifyDescription
    if (modifierType == ModifierCannotBeRemovedFromHand.type)
      return ModifierCannotBeRemovedFromHand
    if (modifierType == ModifierQuestBuffAbyssian.type)
      return ModifierQuestBuffAbyssian
    if (modifierType == ModifierQuestBuffNeutral.type)
      return ModifierQuestBuffNeutral
    if (modifierType == ModifierQuestBuffVanar.type)
      return ModifierQuestBuffVanar
    if (modifierType == ModifierQuestStatusLyonar.type)
      return ModifierQuestStatusLyonar
    if (modifierType == ModifierQuestStatusSonghai.type)
      return ModifierQuestStatusSonghai
    if (modifierType == ModifierQuestStatusAbyssian.type)
      return ModifierQuestStatusAbyssian
    if (modifierType == ModifierQuestStatusVetruvian.type)
      return ModifierQuestStatusVetruvian
    if (modifierType == ModifierQuestStatusMagmar.type)
      return ModifierQuestStatusMagmar
    if (modifierType == ModifierQuestStatusVanar.type)
      return ModifierQuestStatusVanar
    if (modifierType == ModifierQuestStatusNeutral.type)
      return ModifierQuestStatusNeutral

    if (modifierType == PlayerModifier.type)
      return PlayerModifier
    if (modifierType == PlayerModifierManaModifier.type)
      return PlayerModifierManaModifier
    if (modifierType == PlayerModifierManaModifierSingleUse.type)
      return PlayerModifierManaModifierSingleUse
    if (modifierType == PlayerModifierAncestralPact.type)
      return PlayerModifierAncestralPact
    if (modifierType == PlayerModifierMechazorBuildProgress.type)
      return PlayerModifierMechazorBuildProgress
    if (modifierType == PlayerModifierMechazorSummoned.type)
      return PlayerModifierMechazorSummoned
    if (modifierType == ModifierBackupGeneral.type)
      return ModifierBackupGeneral
    if (modifierType == PlayerModifierSpellDamageModifier.type)
      return PlayerModifierSpellDamageModifier
    if (modifierType == PlayerModifierDamageNextUnitPlayedFromHand.type)
      return PlayerModifierDamageNextUnitPlayedFromHand
    if (modifierType == PlayerModifierCardDrawModifier.type)
      return PlayerModifierCardDrawModifier
    if (modifierType == PlayerModiferCanSummonAnywhere.type)
      return PlayerModiferCanSummonAnywhere
    if (modifierType == PlayerModifierSummonWatchApplyModifiers.type)
      return PlayerModifierSummonWatchApplyModifiers
    if (modifierType == PlayerModifierReplaceCardModifier.type)
      return PlayerModifierReplaceCardModifier
    if (modifierType == PlayerModifierEndTurnRespawnEntityWithBuff.type)
      return PlayerModifierEndTurnRespawnEntityWithBuff
    if (modifierType == PlayerModifierPreventSpellDamage.type)
      return PlayerModifierPreventSpellDamage
    if (modifierType == PlayerModifierManaModifierOncePerTurn.type)
      return PlayerModifierManaModifierOncePerTurn
    if (modifierType == PlayerModifierMyDeathwatchDrawCard.type)
      return PlayerModifierMyDeathwatchDrawCard
    if (modifierType == PlayerModifierBattlePetManager.type)
      return PlayerModifierBattlePetManager
    if (modifierType == PlayerModifierCannotReplace.type)
      return PlayerModifierCannotReplace
    if (modifierType == PlayerModifierChangeSignatureCard.type)
      return PlayerModifierChangeSignatureCard
    if (modifierType == PlayerModifierSignatureCardAlwaysReady.type)
      return PlayerModifierSignatureCardAlwaysReady
    if (modifierType == PlayerModifierManaModifierNextCard.type)
      return PlayerModifierManaModifierNextCard
    if (modifierType == PlayerModifierFlashReincarnation.type)
      return PlayerModifierFlashReincarnation
    if (modifierType == PlayerModifierFriendlyAttackWatch.type)
      return PlayerModifierFriendlyAttackWatch
    if (modifierType == PlayerModifierSummonWatch.type)
      return PlayerModifierSummonWatch
    if (modifierType == PlayerModifierSummonWatchIfFlyingDrawFlyingMinion.type)
      return PlayerModifierSummonWatchIfFlyingDrawFlyingMinion
    if (modifierType == PlayerModifierOpponentSummonWatch.type)
      return PlayerModifierOpponentSummonWatch
    if (modifierType == PlayerModifierOpponentSummonWatchSwapGeneral.type)
      return PlayerModifierOpponentSummonWatchSwapGeneral
    if (modifierType == PlayerModifierSummonWatchFromActionBar.type)
      return PlayerModifierSummonWatchFromActionBar
    if (modifierType == PlayerModifierEndTurnRespawnEntityAnywhere.type)
      return PlayerModifierEndTurnRespawnEntityAnywhere
    if (modifierType == PlayerModifierTeamAlwaysBackstabbed.type)
      return PlayerModifierTeamAlwaysBackstabbed
    if (modifierType == PlayerModifierEmblem.type)
      return PlayerModifierEmblem
    if (modifierType == PlayerModifierEmblemSummonWatch.type)
      return PlayerModifierEmblemSummonWatch
    if (modifierType == PlayerModifierEmblemSummonWatchSingletonQuest.type)
      return PlayerModifierEmblemSummonWatchSingletonQuest
    if (modifierType == PlayerModifierEmblemEndTurnWatch.type)
      return PlayerModifierEmblemEndTurnWatch
    if (modifierType == PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest.type)
      return PlayerModifierEmblemEndTurnWatchLyonarSmallMinionQuest
    if (modifierType == PlayerModifierSpellWatch.type)
      return PlayerModifierSpellWatch
    if (modifierType == PlayerModifierSpellWatchHollowVortex.type)
      return PlayerModifierSpellWatchHollowVortex
    if (modifierType == PlayerModifierEmblemSummonWatchVanarTokenQuest.type)
      return PlayerModifierEmblemSummonWatchVanarTokenQuest
    if (modifierType == PlayerModifierEmblemSituationalVetQuestFrenzy.type)
      return PlayerModifierEmblemSituationalVetQuestFrenzy
    if (modifierType == PlayerModifierEmblemSituationalVetQuestFlying.type)
      return PlayerModifierEmblemSituationalVetQuestFlying
    if (modifierType == PlayerModifierEmblemSituationalVetQuestCelerity.type)
      return PlayerModifierEmblemSituationalVetQuestCelerity
    if (modifierType == PlayerModifierEndTurnWatchRevertBBS.type)
      return PlayerModifierEndTurnWatchRevertBBS
    if (modifierType == PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest.type)
      return PlayerModifierEmblemSummonWatchSonghaiMeltdownQuest
    if (modifierType == PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest.type)
      return PlayerModifierEmblemSummonWatchFromHandMagmarBuffQuest
    if (modifierType == PlayerModifierEmblemSummonWatchAbyssUndyingQuest.type)
      return PlayerModifierEmblemSummonWatchAbyssUndyingQuest
    if (modifierType == PlayerModifierEmblemGainMinionOrLoseControlWatch.type)
      return PlayerModifierEmblemGainMinionOrLoseControlWatch

    if (modifierType == GameSessionModifier.type)
      return GameSessionModifier
    if (modifierType == GameSessionModifierFestiveSpirit.type)
      return GameSessionModifierFestiveSpirit

    console.error "ModifierFactory:modifierForType - Unknown Modifier Type: #{modifierType}".red

module.exports = ModifierFactory
