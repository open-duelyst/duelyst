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
SpellFollowupRandomTeleport = require 'app/sdk/spells/spellFollowupRandomTeleport'
SpellForgeArtifact = require 'app/sdk/spells/spellForgeArtifact'

ModifierFirstBlood = require 'app/sdk/modifiers/modifierFirstBlood'
ModifierCardControlledPlayerModifiers = require 'app/sdk/modifiers/modifierCardControlledPlayerModifiers'
ModifierSynergizeDrawBloodboundSpell = require 'app/sdk/modifiers/modifierSynergizeDrawBloodboundSpell'
ModifierOpeningGambit =     require 'app/sdk/modifiers/modifierOpeningGambit'
ModifierOpeningGambitDrawCopyFromDeck = require 'app/sdk/modifiers/modifierOpeningGambitDrawCopyFromDeck'
ModifierSummonWatchAnywhereByRaceBuffSelf = require 'app/sdk/modifiers/modifierSummonWatchAnywhereByRaceBuffSelf'
ModifierKillWatchDeceptibot = require 'app/sdk/modifiers/modifierKillWatchDeceptibot'
Modifier = require 'app/sdk/modifiers/modifier'
ModifierOpeningGambitApplyMechazorPlayerModifiers = require 'app/sdk/modifiers/modifierOpeningGambitApplyMechazorPlayerModifiers'
ModifierSynergizeBuffSelf = require 'app/sdk/modifiers/modifierSynergizeBuffSelf'
ModifierOpeningGambitRemoveCardsFromDecksByCost = require 'app/sdk/modifiers/modifierOpeningGambitRemoveCardsFromDecksByCost'
ModifierEnemyAttackWatchGainAttack = require 'app/sdk/modifiers/modifierEnemyAttackWatchGainAttack'
ModifierProvoke = require 'app/sdk/modifiers/modifierProvoke'
ModifierDeathWatchFriendlyMinionSwapAllegiance = require 'app/sdk/modifiers/modifierDeathWatchFriendlyMinionSwapAllegiance'
ModifierBuild = require 'app/sdk/modifiers/modifierBuild'
ModifierBuilding = require 'app/sdk/modifiers/modifierBuilding'
ModifierBuildCompleteHealGeneral = require 'app/sdk/modifiers/modifierBuildCompleteHealGeneral'
ModifierMyBuildWatchDrawCards = require 'app/sdk/modifiers/modifierMyBuildWatchDrawCards'
ModifierOpeningGambitProgressBuild = require 'app/sdk/modifiers/modifierOpeningGambitProgressBuild'
ModifierSummonWatchMechsShareKeywords = require 'app/sdk/modifiers/modifierSummonWatchMechsShareKeywords'
ModifierSituationalBuffSelfIfHaveMech = require 'app/sdk/modifiers/modifierSituationalBuffSelfIfHaveMech'
ModifierPortal = require 'app/sdk/modifiers/modifierPortal'
ModifierToken = require 'app/sdk/modifiers/modifierToken'
ModifierTokenCreator = require 'app/sdk/modifiers/modifierTokenCreator'

PlayerModifierManaModifierOncePerTurn = require 'app/sdk/playerModifiers/playerModifierManaModifierOncePerTurn'
PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'

i18next = require 'i18next'
if i18next.t() is undefined
  i18next.t = (text) ->
    return text

class CardFactory_WartechSet_Neutral

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Neutral.Metaltooth)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_metaltooth_name")
      card.setDescription(i18next.t("cards.neutral_metaltooth_desc"))
      card.raceId = Races.Mech
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      rushModifier = ModifierFirstBlood.createContextObject()
      card.setInherentModifiersContextObjects([ModifierSituationalBuffSelfIfHaveMech.createContextObject([rushModifier])])
      card.addKeywordClassToInclude(ModifierFirstBlood)
      card.setFXResource(["FX.Cards.Neutral.GhostLynx"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_neutral_grimrock_hit.audio
        attack : RSX.sfx_neutral_xho_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_xho_hit.audio
        attackDamage : RSX.sfx_neutral_xho_attack_impact.audio
        death : RSX.sfx_neutral_xho_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralMetaltoothBreathing.name
        idle : RSX.neutralMetaltoothIdle.name
        walk : RSX.neutralMetaltoothRun.name
        attack : RSX.neutralMetaltoothAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralMetaltoothHit.name
        death : RSX.neutralMetaltoothDeath.name
      )

    if (identifier == Cards.Neutral.Artificer)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_lost_artificer_name")
      card.setDescription(i18next.t("cards.neutral_lost_artificer_desc"))
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Rare
      contextObject = PlayerModifierManaModifierOncePerTurn.createCostChangeContextObject(-1, CardType.Artifact)
      contextObject.activeInHand = contextObject.activeInDeck = contextObject.activeInSignatureCards = false
      contextObject.activeOnBoard = true
      card.setInherentModifiersContextObjects([
        ModifierCardControlledPlayerModifiers.createContextObjectOnBoardToTargetOwnPlayer([contextObject], "The first artifact you play each turn costs 1 less")
      ])
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
        breathing : RSX.neutralArtificerBreathing.name
        idle : RSX.neutralArtificerIdle.name
        walk : RSX.neutralArtificerRun.name
        attack : RSX.neutralArtificerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralArtificerHit.name
        death : RSX.neutralArtificerDeath.name
      )

    if (identifier == Cards.Neutral.FidgetSpinner)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_bloodbound_mentor_name")
      card.setDescription(i18next.t("cards.neutral_bloodbound_mentor_desc"))
      card.atk = 3
      card.maxHP = 4
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierSynergizeDrawBloodboundSpell.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.Moebius"])
      card.setBoundingBoxWidth(95)
      card.setBoundingBoxHeight(75)
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_arcanelimiter_attack_impact.audio
        receiveDamage : RSX.sfx_f4_engulfingshadow_attack_impact.audio
        attackDamage : RSX.sfx_f4_engulfingshadow_hit.audio
        death : RSX.sfx_f4_engulfingshadow_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralOwlScholarBreathing.name
        idle : RSX.neutralOwlScholarIdle.name
        walk : RSX.neutralOwlScholarRun.name
        attack : RSX.neutralOwlScholarAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralOwlScholarHit.name
        death : RSX.neutralOwlScholarDeath.name
      )

    if (identifier == Cards.Neutral.Replicant)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_replicant_name")
      card.setDescription(i18next.t("cards.neutral_replicant_desc"))
      card.raceId = Races.Mech
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitDrawCopyFromDeck.createContextObject()
      ])
      card.setFXResource(["FX.Cards.Neutral.PandoraMinionZap"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_diretidefrenzy.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_neutral_swordmechaz0r_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_silitharveteran_hit.audio
        attackDamage : RSX.sfx_neutral_silitharveteran_attack_impact.audio
        death : RSX.sfx_neutral_silitharveteran_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralReplicantBreathing.name
        idle : RSX.neutralReplicantIdle.name
        walk : RSX.neutralReplicantRun.name
        attack : RSX.neutralReplicantAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralReplicantHit.name
        death : RSX.neutralReplicantDeath.name
      )

    if (identifier == Cards.Neutral.ProjectOmega)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_project_omega_name")
      card.setDescription(i18next.t("cards.neutral_project_omega_desc"))
      card.raceId = Races.Mech
      card.atk = 1
      card.maxHP = 1
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierSummonWatchAnywhereByRaceBuffSelf.createContextObject(2,2,Races.Mech,i18next.t("modifiers.neutral_project_omega_1"))
      ])
      card.setFXResource(["FX.Cards.Faction5.Kin"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy_1.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f4_juggernaut_attack_swing.audio
        receiveDamage : RSX.sfx_f4_juggernaut_hit.audio
        attackDamage : RSX.sfx_f4_juggernaut_attack_impact.audio
        death : RSX.sfx_f4_juggernaut_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralProjectOmegaBreathing.name
        idle : RSX.neutralProjectOmegaIdle.name
        walk : RSX.neutralProjectOmegaRun.name
        attack : RSX.neutralProjectOmegaAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralProjectOmegaHit.name
        death : RSX.neutralProjectOmegaDeath.name
      )

    if (identifier == Cards.Neutral.Deceptibot)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_deceptibot_name")
      card.setDescription(i18next.t("cards.neutral_deceptibot_desc"))
      card.raceId = Races.Mech
      card.atk = 5
      card.maxHP = 5
      card.manaCost = 5
      card.rarityId = Rarity.Epic
      card.setInherentModifiersContextObjects([
        ModifierKillWatchDeceptibot.createContextObject(false, true)
      ])
      card.setFXResource(["FX.Cards.Neutral.EXun"])
      card.setBaseSoundResource(
        apply : RSX.sfx_unit_deploy.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_neutral_sunseer_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunseer_hit.audio
        attackDamage : RSX.sfx_neutral_sunseer_attack_impact.audio
        death : RSX.sfx_neutral_sunseer_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralDeceptib0tBreathing.name
        idle : RSX.neutralDeceptib0tIdle.name
        walk : RSX.neutralDeceptib0tRun.name
        attack : RSX.neutralDeceptib0tAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralDeceptib0tHit.name
        death : RSX.neutralDeceptib0tDeath.name
      )

    if (identifier == Cards.Neutral.RescueRXBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.building_name")
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
        breathing : RSX.neutralBuildMinionBreathing.name
        idle : RSX.neutralBuildMinionIdle.name
        walk : RSX.neutralBuildMinionIdle.name
        attack : RSX.neutralBuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBuildMinionHit.name
        death : RSX.neutralBuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 2
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.ArchitectBuilding)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.name = i18next.t("cards.building_name")
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
        breathing : RSX.neutralBuildMinionBreathing.name
        idle : RSX.neutralBuildMinionIdle.name
        walk : RSX.neutralBuildMinionIdle.name
        attack : RSX.neutralBuildMinionAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralBuildMinionHit.name
        death : RSX.neutralBuildMinionDeath.name
      )
      card.atk = 0
      card.maxHP = 10
      card.manaCost = 3
      card.rarityId = Rarity.TokenUnit
      card.setInherentModifiersContextObjects([ModifierPortal.createContextObject()])
      card.addKeywordClassToInclude(ModifierToken)

    if (identifier == Cards.Neutral.RedsteelMinos)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_redsteel_minos_name")
      card.setDescription(i18next.t("cards.neutral_redsteel_minos_desc"))
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 3
      card.rarityId = Rarity.Common
      buffContextObject = Modifier.createContextObjectWithAttributeBuffs(2,2)
      buffContextObject.appliedName = i18next.t("modifiers.neutral_redsteel_minos_1")
      card.setInherentModifiersContextObjects([
        ModifierSynergizeBuffSelf.createContextObject([buffContextObject])
      ])
      card.setFXResource(["FX.Cards.Neutral.ChaosElemental"])
      card.setBoundingBoxWidth(80)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f1windbladecommander_attack_swing.audio
        receiveDamage : RSX.sfx_f1windbladecommander_hit.audio
        attackDamage : RSX.sfx_f1windbladecommanderattack_impact.audio
        death : RSX.sfx_f1windbladecommander_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralRedsteelMinosBreathing.name
        idle : RSX.neutralRedsteelMinosIdle.name
        walk : RSX.neutralRedsteelMinosRun.name
        attack : RSX.neutralRedsteelMinosAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.1
        damage : RSX.neutralRedsteelMinosHit.name
        death : RSX.neutralRedsteelMinosDeath.name
      )

    if (identifier == Cards.Neutral.Qorrhlmaa)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_qorrhlmaa_name")
      card.setDescription(i18next.t("cards.neutral_qorrhlmaa_desc"))
      card.atk = 6
      card.maxHP = 6
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([
        ModifierOpeningGambitRemoveCardsFromDecksByCost.createContextObject(2, true, true)
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
        breathing : RSX.neutralGearGrinderBreathing.name
        idle : RSX.neutralGearGrinderIdle.name
        walk : RSX.neutralGearGrinderRun.name
        attack : RSX.neutralGearGrinderAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralGearGrinderHit.name
        death : RSX.neutralGearGrinderDeath.name
      )

    if (identifier == Cards.Neutral.ImperviousGiago)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_impervious_giago_name")
      card.setDescription(i18next.t("cards.neutral_impervious_giago_desc"))
      card.atk = 1
      card.maxHP = 10
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([ModifierProvoke.createContextObject(),
        ModifierEnemyAttackWatchGainAttack.createContextObject(2, i18next.t("modifiers.neutral_impervious_giago_1"))
      ])
      card.setFXResource(["FX.Cards.Neutral.Bonereaper"])
      card.setBoundingBoxWidth(75)
      card.setBoundingBoxHeight(110)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_b.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_f1ironcliffeguardian_attack_swing.audio
        receiveDamage : RSX.sfx_f1ironcliffeguardian_hit.audio
        attackDamage : RSX.sfx_f1ironcliffeguardian_attack_impact.audio
        death : RSX.sfx_f1ironcliffeguardian_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGiagoBreathing.name
        idle : RSX.neutralGiagoIdle.name
        walk : RSX.neutralGiagoRun.name
        attack : RSX.neutralGiagoAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralGiagoHit.name
        death : RSX.neutralGiagoDeath.name
      )

    if (identifier == Cards.Neutral.CapriciousMarauder)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_capricious_marauder_name")
      card.setDescription(i18next.t("cards.neutral_capricious_marauder_desc"))
      card.atk = 9
      card.maxHP = 9
      card.manaCost = 5
      card.rarityId = Rarity.Rare
      card.setInherentModifiersContextObjects([
        ModifierDeathWatchFriendlyMinionSwapAllegiance.createContextObject()
      ])
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
        breathing : RSX.neutralCapriciousWarriorBreathing.name
        idle : RSX.neutralCapriciousWarriorIdle.name
        walk : RSX.neutralCapriciousWarriorRun.name
        attack : RSX.neutralCapriciousWarriorAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralCapriciousWarriorHit.name
        death : RSX.neutralCapriciousWarriorDeath.name
      )

    if (identifier == Cards.Neutral.Recombobulus)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_recombobulus_name")
      card.setDescription(i18next.t("cards.neutral_recombobulus_desc"))
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
        breathing : RSX.neutralHatredBreathing.name
        idle : RSX.neutralHatredIdle.name
        walk : RSX.neutralHatredRun.name
        attack : RSX.neutralHatredAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralHatredHit.name
        death : RSX.neutralHatredDeath.name
      )
      card.atk = 2
      card.maxHP = 3
      card.manaCost = 2
      card.rarityId = Rarity.Common
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.FollowupRandomTeleport
          spellFilterType: SpellFilterType.NeutralDirect
          teleportPattern: CONFIG.PATTERN_1SPACE
          canTargetGeneral: false
          patternSourceIsTarget: true
        }
      ])

    if (identifier == Cards.Neutral.Reliquarian)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_reliquarian_name")
      card.setDescription(i18next.t("cards.neutral_reliquarian_desc"))
      card.atk = 3
      card.maxHP = 3
      card.manaCost = 7
      card.rarityId = Rarity.Legendary
      card.addKeywordClassToInclude(ModifierOpeningGambit)
      card.setFollowups([
        {
          id: Cards.Spell.ForgeArtifact
          spellFilterType: SpellFilterType.AllyDirect
          canTargetGeneral: false
        }
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Faction2.StormKage"])
      card.setBoundingBoxWidth(60)
      card.setBoundingBoxHeight(105)
      card.setBaseSoundResource(
        apply : RSX.sfx_summonlegendary.audio
        walk : RSX.sfx_singe2.audio
        attack : RSX.sfx_f2stormkage_attack_swing.audio
        receiveDamage :  RSX.sfx_f2stormkage_hit.audio
        attackDamage : RSX.sfx_f2stormkage_attack_impact.audio
        death : RSX.sfx_f2stormkage_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralGoldenHammerBreathing.name
        idle : RSX.neutralGoldenHammerIdle.name
        walk : RSX.neutralGoldenHammerRun.name
        attack : RSX.neutralGoldenHammerAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.9
        damage : RSX.neutralGoldenHammerHit.name
        death : RSX.neutralGoldenHammerDeath.name
      )

    if (identifier == Cards.Spell.ForgeArtifact)
      card = new SpellForgeArtifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.id = Cards.Spell.ForgeArtifact
      card.name = i18next.t("cards.neutral_forge_artifact_name")
      card.setDescription(i18next.t("cards.neutral_forge_artifact_desc"))
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.manaCost = 0
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.magmarModifierAppliedName = i18next.t("modifiers.neutral_forge_artifact_1")

    if (identifier == Cards.Artifact.NeutralRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.id = Cards.Artifact.NeutralRelic
      card.name = i18next.t("cards.neutral_empty_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.setFXResource(["FX.Cards.Artifact.NeutralRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconneutralGoldenHammerIdle.name
        active: RSX.iconneutralGoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.LyonarRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction1
      card.id = Cards.Artifact.LyonarRelic
      card.name = i18next.t("cards.neutral_shining_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.setFXResource(["FX.Cards.Artifact.LyonarRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconf1GoldenHammerIdle.name
        active: RSX.iconf1GoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.SonghaiRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction2
      card.id = Cards.Artifact.SonghaiRelic
      card.name = i18next.t("cards.neutral_blazing_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.setFXResource(["FX.Cards.Artifact.SonghaiRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconf2GoldenHammerIdle.name
        active: RSX.iconf2GoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.VetruvianRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction3
      card.id = Cards.Artifact.VetruvianRelic
      card.name = i18next.t("cards.neutral_barren_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.setFXResource(["FX.Cards.Artifact.VetruvianRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconf3GoldenHammerIdle.name
        active: RSX.iconf3GoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.AbyssianRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction4
      card.id = Cards.Artifact.AbyssianRelic
      card.name = i18next.t("cards.neutral_void_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.setFXResource(["FX.Cards.Artifact.AbyssianRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconf4GoldenHammerIdle.name
        active: RSX.iconf4GoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.MagmarRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction5
      card.id = Cards.Artifact.MagmarRelic
      card.name = i18next.t("cards.neutral_primal_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.setFXResource(["FX.Cards.Artifact.MagmarRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconf5GoldenHammerIdle.name
        active: RSX.iconf5GoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Artifact.VanarRelic)
      card = new Artifact(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Faction6
      card.id = Cards.Artifact.VanarRelic
      card.name = i18next.t("cards.neutral_howling_relic_name")
      card.manaCost = 0
      card.rarityId = Rarity.TokenUnit
      card.setIsHiddenInCollection(true)
      card.durability = 3
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Artifact.VanarRelic"])
      card.setBaseAnimResource(
        idle: RSX.iconf6GoldenHammerIdle.name
        active: RSX.iconf6GoldenHammerActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_victory_crest.audio
      )

    if (identifier == Cards.Neutral.RescueRX)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_rescuerx_name")
      card.setDescription(i18next.t("cards.neutral_rescuerx_desc"))
      card.atk = 2
      card.maxHP = 4
      card.manaCost = 2
      card.rarityId = Rarity.Common
      buildData = {id: Cards.Neutral.RescueRXBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuildCompleteHealGeneral.createContextObject(5, "Builds into Rescue-RX after 2 turns (this cannot be dispelled).", {id: Cards.Neutral.RescueRX}, 2))
      card.setInherentModifiersContextObjects([ModifierBuild.createContextObject(buildData)])
      card.addKeywordClassToInclude(ModifierTokenCreator)
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
        breathing : RSX.neutralRoboRXBreathing.name
        idle : RSX.neutralRoboRXIdle.name
        walk : RSX.neutralRoboRXRun.name
        attack : RSX.neutralRoboRXAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 0.3
        damage : RSX.neutralRoboRXHit.name
        death : RSX.neutralRoboRXDeath.name
      )

    if (identifier == Cards.Neutral.ArchitectT2K5)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_architectt2k5_name")
      card.setDescription(i18next.t("cards.neutral_architectt2k5_desc"))
      card.atk = 1
      card.maxHP = 5
      card.manaCost = 3
      card.rarityId = Rarity.Epic
      buildData = {id: Cards.Neutral.ArchitectBuilding}
      buildData.additionalInherentModifiersContextObjects ?= []
      buildData.additionalInherentModifiersContextObjects.push(ModifierBuilding.createContextObject("Builds into Architect-T2K5 after 1 turn (this cannot be dispelled).", {id: Cards.Neutral.ArchitectT2K5}, 1))
      card.setInherentModifiersContextObjects([
        ModifierBuild.createContextObject(buildData),
        ModifierMyBuildWatchDrawCards.createContextObject(1)
      ])
      card.addKeywordClassToInclude(ModifierTokenCreator)
      card.setFXResource(["FX.Cards.Neutral.SunElemental"])
      card.setBoundingBoxWidth(50)
      card.setBoundingBoxHeight(90)
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_blindscorch.audio
        walk : RSX.sfx_neutral_sunelemental_impact.audio
        attack : RSX.sfx_neutral_sunelemental_attack_swing.audio
        receiveDamage : RSX.sfx_neutral_sunelemental_hit.audio
        attackDamage : RSX.sfx_neutral_sunelemental_impact.audio
        death : RSX.sfx_neutral_sunelemental_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralArchitectT2K5Breathing.name
        idle : RSX.neutralArchitectT2K5Idle.name
        walk : RSX.neutralArchitectT2K5Run.name
        attack : RSX.neutralArchitectT2K5Attack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.0
        damage : RSX.neutralArchitectT2K5Hit.name
        death : RSX.neutralArchitectT2K5Death.name
      )

    if (identifier == Cards.Neutral.Timekeeper)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_timekeeper_name")
      card.setDescription(i18next.t("cards.neutral_timekeeper_desc"))
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
        breathing : RSX.neutralTimekeeperBreathing.name
        idle : RSX.neutralTimekeeperIdle.name
        walk : RSX.neutralTimekeeperRun.name
        attack : RSX.neutralTimekeeperAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralTimekeeperHit.name
        death : RSX.neutralTimekeeperDeath.name
      )
      card.atk = 2
      card.maxHP = 2
      card.manaCost = 4
      card.setInherentModifiersContextObjects([ModifierOpeningGambitProgressBuild.createContextObject()])
      card.rarityId = Rarity.Common

    if (identifier == Cards.Neutral.Silver)
      card = new Unit(gameSession)
      card.setCardSetId(CardSet.Wartech)
      card.factionId = Factions.Neutral
      card.name = i18next.t("cards.neutral_silver_name")
      card.setDescription(i18next.t("cards.neutral_silver_desc"))
      card.raceId = Races.Mech
      card.atk = 7
      card.maxHP = 5
      card.manaCost = 6
      card.rarityId = Rarity.Legendary
      card.setInherentModifiersContextObjects([ModifierSummonWatchMechsShareKeywords.createContextObject()])
      card.setFXResource(["FX.Cards.Neutral.RubyRifter"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_fractalreplication.audio
        walk : RSX.sfx_unit_run_charge_4.audio
        attack : RSX.sfx_spell_entropicdecay.audio
        receiveDamage : RSX.sfx_f1elyxstormblade_hit.audio
        attackDamage : RSX.sfx_f1elyxstormblade_attack_impact.audio
        death : RSX.sfx_f1elyxstormblade_death.audio
      )
      card.setBaseAnimResource(
        breathing : RSX.neutralSilverMechBreathing.name
        idle : RSX.neutralSilverMechIdle.name
        walk : RSX.neutralSilverMechRun.name
        attack : RSX.neutralSilverMechAttack.name
        attackReleaseDelay: 0.0
        attackDelay: 1.2
        damage : RSX.neutralSilverMechHit.name
        death : RSX.neutralSilverMechDeath.name
      )

    return card

module.exports = CardFactory_WartechSet_Neutral
