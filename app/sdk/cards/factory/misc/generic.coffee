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

Spell = require 'app/sdk/spells/spell'
SpellFilterType = require 'app/sdk/spells/spellFilterType'
SpellDamage = require 'app/sdk/spells/spellDamage'
SpellApplyModifiers = require 'app/sdk/spells/spellApplyModifiers'
SpellKillTarget = require 'app/sdk/spells/spellKillTarget'
SpellFollowupTeleport = require 'app/sdk/spells/spellFollowupTeleport'
SpellFollowupTeleportToMe = require 'app/sdk/spells/spellFollowupTeleportToMe'
SpellFollowupTeleportMyGeneral = require 'app/sdk/spells/spellFollowupTeleportMyGeneral'
SpellSilence = require 'app/sdk/spells/spellSilence'
SpellSpawnEntity = require 'app/sdk/spells/spellSpawnEntity'
SpellCloneTargetEntity = require 'app/sdk/spells/spellCloneTargetEntity'
SpellCloneSourceEntity = require 'app/sdk/spells/spellCloneSourceEntity'
SpellKillTargetWithModifierRanged = require 'app/sdk/spells/spellKillTargetWithModifierRanged'
SpellDunecasterFollowup = require 'app/sdk/spells/spellDunecasterFollowup'
SpellFollowupSwapPositions = require 'app/sdk/spells/spellFollowupSwapPositions'
SpellFollowupDamage = require 'app/sdk/spells/spellFollowupDamage'
SpellFollowupHeal = require 'app/sdk/spells/spellFollowupHeal'
SpellMindControlByAttackValue = require 'app/sdk/spells/spellMindControlByAttackValue'
SpellFollowupRandomTeleport = require 'app/sdk/spells/spellFollowupRandomTeleport'
SpellFollowupKeeper = require 'app/sdk/spells/spellFollowupKeeper'
SpellFollowupHollowGroveKeeper = require 'app/sdk/spells/spellFollowupHollowGroveKeeper'
SpellFollowupKillTargetByAttack = require 'app/sdk/spells/spellFollowupKillTargetByAttack'
SpellCloneSourceEntityNearbyGeneral = require 'app/sdk/spells/spellCloneSourceEntityNearbyGeneral'
SpellDoubleAttackAndHealth = require 'app/sdk/spells/spellDoubleAttackAndHealth'
SpellHatchAnEgg = require 'app/sdk/spells/spellHatchAnEgg'
SpellFollowupActivateBattlePet = require 'app/sdk/spells/spellFollowupActivateBattlePet'
SpellSpawnEntityAndApplyPlayerModifiers = require 'app/sdk/spells/spellSpawnEntityAndApplyPlayerModifiers'
SpellFollowupTeleportMyGeneralBehindEnemy = require 'app/sdk/spells/spellFollowupTeleportMyGeneralBehindEnemy'
SpellFollowupTeleportInFrontOfAnyGeneral = require 'app/sdk/spells/spellFollowupTeleportInFrontOfAnyGeneral'
SpellSpawnNeutralEntity = require 'app/sdk/spells/spellSpawnNeutralEntity'
SpellFollowupFight = require 'app/sdk/spells/spellFollowupFight'
SpellOverwatch = require 'app/sdk/spells/spellOverwatch'
SpellBounceToActionBarSpawnEntity = require 'app/sdk/spells/spellBounceToActionBarSpawnEntity'
SpellFollowupTeleportToFriendlyCreep = require 'app/sdk/spells/spellFollowupTeleportToFriendlyCreep'
SpellFollowupTeleportNearMyGeneral = require 'app/sdk/spells/spellFollowupTeleportNearMyGeneral'
SpellBounceToActionbar = require 'app/sdk/spells/spellBounceToActionbar'
SpellDuplicator = require 'app/sdk/spells/spellDuplicator'
SpellApplyPlayerModifiers = require 'app/sdk/spells/spellApplyPlayerModifiers'
SpellFollowupSpawnEntityFromDeck = require 'app/sdk/spells/spellFollowupSpawnEntityFromDeck'
SpellDamageOrHeal = require 'app/sdk/spells/spellDamageOrHeal'

PlayerModifierMechazorBuildProgress = require 'app/sdk/playerModifiers/playerModifierMechazorBuildProgress'
PlayerModifierMechazorSummoned = require 'app/sdk/playerModifiers/playerModifierMechazorSummoned'

GameSessionModifierFestiveSpirit = require 'app/sdk/gameSessionModifiers/gameSessionModifierFestiveSpirit'

class CardFactory_Generic

  ###*
   * Returns a card that matches the identifier.
   * @param {Number|String} identifier
   * @param {GameSession} gameSession
   * @returns {Card}
   ###
  @cardForIdentifier: (identifier,gameSession) ->
    card = null

    if (identifier == Cards.Spell.MindControlByAttackValue)
      card = new SpellMindControlByAttackValue(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Enslave
      card.name = "Mind Control"
      card.setDescription("Take control of an enemy minion")
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Spell.MindControlByAttackValue"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse.audio
      )

    if (identifier == Cards.Spell.Repulsion)
      card = new Spell(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Repulsion
      card.name = "Repulsion"
      card.setDescription("Move a nearby enemy minion to any other space on the battlefield.")
      card.manaCost = 0
      card.targetType = CardType.Unit
      card.setFollowups([{
        id: Cards.Spell.FollowupTeleport
      }])
      card.setFXResource(["FX.Cards.Spell.Repulsion"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidpulse.audio
      )

    if (identifier == Cards.Spell.FollowupTeleport)
      card = new SpellFollowupTeleport(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleport
      card.name = "Teleport"
      card.setDescription("Move target to any unoccupied space on the battlefield.")
      card.setFollowupConditions([SpellFollowupTeleport.followupConditionTargetToTeleport])
      card.setFXResource(["FX.Cards.Spell.FollowupTeleport"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.FollowupTeleportEnemyToMe)
      card = new SpellFollowupTeleportToMe(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleportEnemyToMe
      card.name = "Teleport Enemy To Me"
      card.setDescription("Move an enemy unit in front of the caster.")
      card.setFollowupConditions([SpellFollowupTeleportToMe.followupConditionCanTeleportToMe])
      card.spellFilterType = SpellFilterType.EnemyDirect
      card.setFXResource(["FX.Cards.Spell.FollowupTeleportEnemyToMe"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_martyrdom.audio
      )

    if (identifier == Cards.Spell.FollowupTeleportMyGeneral)
      card = new SpellFollowupTeleportMyGeneral(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleportMyGeneral
      card.name = "Teleport General"
      card.setDescription("Move your General.")
      card.setFXResource(["FX.Cards.Spell.FollowupTeleportMyGeneral"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_martyrdom.audio
      )

    if (identifier == Cards.Spell.KillTarget)
      card = new SpellKillTarget(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.KillTarget
      card.name = "Kill Target"
      card.setDescription("Kill target unit")
      card.setFXResource(["FX.Cards.Spell.KillTarget"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_daemoniclure.audio
      )

    if (identifier == Cards.Spell.KillTargetWithRanged)
      card = new SpellKillTargetWithModifierRanged(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.KillTarget
      card.name = "Kill Target"
      card.setDescription("Kill target unit with Ranged")
      card.setFXResource(["FX.Cards.Spell.KillTargetWithRanged"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.SpawnEntity)
      card = new SpellSpawnEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpawnEntity
      card.name = "Spawn Entity"
      card.setDescription("Spawn an entity.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.SpawnEntity"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ancientgrove_attack_impact.audio
      )

    if (identifier == Cards.Spell.SpawnNeutralEntity)
      card = new SpellSpawnNeutralEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpawnNeutralEntity
      card.name = "Spawn Neutral Entity"
      card.setDescription("Spawn an entity.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.SpawnNeutralEntity"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f6_ancientgrove_attack_impact.audio
      )

    if (identifier == Cards.Spell.DeployMechaz0r)
      card = new SpellSpawnEntityAndApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.DeployMechaz0r
      card.name = "Deploy MECHAZ0R"
      card.setDescription("AWWWW YISSS!")
      card.applyToOwnGeneral = true
      card.targetModifiersContextObjects = [PlayerModifierMechazorSummoned.createContextObject()]
      card.manaCost = 0
      card.cardDataOrIndexToSpawn = {id: Cards.Neutral.Mechaz0r}
      card.setFollowupConditions([PlayerModifierMechazorBuildProgress.followupConditionIsMechazorComplete])
      card.setFXResource(["FX.Factions.Neutral.SpawnSpecialFX","FX.Cards.Spell.DeployMechaz0r"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_jaxtruesight_attack_swing.audio
      )

    if (identifier == Cards.Spell.CloneTargetEntity)
      card = new SpellCloneTargetEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneTargetEntity
      card.name = "Clone Entity"
      card.setDescription("Clone another entity and replace self.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneTargetEntity"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.CloneSourceEntity)
      card = new SpellCloneSourceEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneSourceEntity
      card.name = "Clone Self"
      card.setDescription("Clone self into a nearby space.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneSourceEntity"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.CloneSourceEntity2X)
      card = new SpellCloneSourceEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneSourceEntity2X
      card.name = "Clone Self"
      card.setDescription("Clone self into a nearby space.")
      card.manaCost = 0
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity
      }])
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneSourceEntity2X"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.CloneSourceEntity3X)
      card = new SpellCloneSourceEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneSourceEntity3X
      card.name = "Clone Self"
      card.setDescription("Clone self into a nearby space.")
      card.manaCost = 0
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity2X
      }])
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneSourceEntity3X"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.CloneSourceEntity4X)
      card = new SpellCloneSourceEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneSourceEntity4X
      card.name = "Clone Self"
      card.setDescription("Clone self into a nearby space.")
      card.manaCost = 0
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntity3X
      }])
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneSourceEntity3X"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.CloneSourceEntityNearbyGeneral)
      card = new SpellCloneSourceEntityNearbyGeneral(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneSourceEntityNearbyGeneral
      card.name = "Clone Self"
      card.setDescription("Clone self nearby general.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneSourceEntity"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.CloneSourceEntityNearbyGeneral2X)
      card = new SpellCloneSourceEntityNearbyGeneral(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.CloneSourceEntityNearbyGeneral2X
      card.name = "Clone Self"
      card.setDescription("Clone self nearby general.")
      card.manaCost = 0
      card.setFollowups([{
        id: Cards.Spell.CloneSourceEntityNearbyGeneral
      }])
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.CloneSourceEntity2X"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.SpellDamage)
      card = new SpellDamage(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellDamage
      card.name = "Spell Damge"
      card.setDescription("Deal Damage")
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.SpellDamage"])
      card.setBaseSoundResource(
        apply : RSX.sfx_f5_general_attack_swing.audio
      )

    if (identifier == Cards.Spell.FollowupDamage)
      card = new SpellFollowupDamage(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupDamage
      card.name = "Deal Damage"
      card.setDescription("Deal Damage")
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.FollowupDamage"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_immolation_a.audio
      )

    if (identifier == Cards.Spell.FollowupHeal)
      card = new SpellFollowupHeal(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupHeal
      card.name = "Heal Damge"
      card.setDescription("Heal Damage")
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.FollowupHeal"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.ApplyModifiers)
      card = new SpellApplyModifiers(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.ApplyModifiers
      card.name = "Apply Modifiers"
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.DunecasterFollowup)
      card = new SpellDunecasterFollowup(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.DunecasterFollowup
      card.name = "Dunecaster Followup"
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.Dispel)
      card = new SpellSilence(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Dispel
      card.name = "Dispel"
      card.setDescription("Dispel target area")
      card.manaCost = 0
      card.spellFilterType = SpellFilterType.None
      card.setFXResource(["FX.Cards.Spell.Dispel"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )

    if (identifier == Cards.Spell.FollowupSwapPositions)
      card = new SpellFollowupSwapPositions(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.Juxtaposition
      card.name = "Juxtaposition"
      card.setDescription("Switch positions between ANY two minions.")
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Spell.Juxtaposition"])
      card.setBaseSoundResource(
        apply : RSX.sfx_neutral_crossbones_attack_swing.audio
      )

    if (identifier == Cards.Spell.FollowupRandomTeleport)
      card = new SpellFollowupRandomTeleport(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupRandomTeleport
      card.name = "Random Teleport"
      card.setDescription("Move target to a random space on the battlefield.")
      card.setFXResource(["FX.Cards.Spell.FollowupRandomTeleport"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.FollowupKeeper)
      card = new SpellFollowupKeeper(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollwupKeeper
      card.name = "Revive Dead minion"
      card.setDescription("Revive a dead minion in a nearby space.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.FollowupKeeper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.FollowupHollowGroveKeeper)
      card = new SpellFollowupHollowGroveKeeper(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.KillTarget
      card.name = "Kill Target"
      card.setDescription("Kill target unit with Provoke or Frenzy")
      card.setFXResource(["FX.Cards.Spell.FollowupHollowGroveKeeper"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.FollowupKillTargetByAttack)
      card = new SpellFollowupKillTargetByAttack(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupKillTargetByAttack
      card.name = "Assassinate"
      card.setDescription("Kill target minion.")
      card.manaCost = 0
      card.setFXResource(["FX.Factions.Neutral.UnitSpawnFX","FX.Cards.Spell.FollowupKillTargetByAttack"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_voidwalk.audio
      )

    if (identifier == Cards.Spell.DoubleAttackAndHealth)
      card = new SpellDoubleAttackAndHealth(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.DoubleAttackAndHealth
      card.name = "Double Attack And Health"
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.HatchAnEgg)
      card = new SpellHatchAnEgg(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.HatchAnEgg
      card.name = "Hatch an egg"
      card.setDescription("Hatch an Egg.")
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Spell.HatchAnEgg"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_boneswarm.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconEggMorphIdle.name
        active : RSX.iconEggMorphActive.name
      )

    if (identifier == Cards.Spell.FollowupActivateBattlepet)
      card = new SpellFollowupActivateBattlePet(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupActivateBattlepet
      card.name = "Activate Battlepet"
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.FollowupTeleportMyGeneralBehindEnemy)
      card = new SpellFollowupTeleportMyGeneralBehindEnemy(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleportMyGeneralBehindEnemy
      card.name = "Teleport"
      card.setDescription("Move target to any unoccupied space behind an enemy.")
      card.setFXResource(["FX.Cards.Spell.FollowupTeleportMyGeneralBehindEnemy"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.FollowupTeleportInFrontOfAnyGeneral)
      card = new SpellFollowupTeleportInFrontOfAnyGeneral(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleportInFrontOfAnyGeneral
      card.name = "Teleport"
      card.setDescription("Move target to any unoccupied space in front of a General.")
      card.setFXResource(["FX.Cards.Spell.FollowupTeleportInFrontOfAnyGeneral"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.FollowupFight)
      card = new SpellFollowupFight(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupFight
      card.name = "Fight!"
      card.setDescription("Choose a minion to fight.")
      card.setFXResource(["FX.Cards.Spell.FollowupFight"])
      card.setBaseSoundResource(
        apply : RSX.sfx_singe2.audio
      )

    ###
    if (identifier == Cards.Spell.Overwatch)
      card = new SpellOverwatch(gameSession)
      card.setIsHiddenInCollection(true)
      card.setFXResource(["FX.Cards.Spell.Overwatch"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_forcebarrier.audio
      )
      card.setBaseAnimResource(
        idle : RSX.iconAurynNexusIdle.name
        active : RSX.iconAurynNexusActive.name
      )
    ###

    if (identifier == Cards.Spell.BounceMinionSpawnEntity)
      card = new SpellBounceToActionBarSpawnEntity(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.BounceMinionSpawnEntity
      card.name = "Bounce Minion Spawn Entity"
      card.setDescription("Return a minion its action bar. Summon an entity on that space.")
      card.manaCost = 0
      card.spellFilterType = SpellFilterType.NeutralDirect
      card.setFXResource(["FX.Cards.Spell.BounceMinionSpawnEntity"])
      card.setBaseAnimResource(
        idle: RSX.iconHailstonePrisonIdle.name
        active: RSX.iconHailstonePrisonActive.name
      )
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_icepillar.audio
      )

    if (identifier == Cards.Spell.FollowupTeleportToFriendlyCreep)
      card = new SpellFollowupTeleportToFriendlyCreep(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleportToFriendlyShadowCreep
      card.name = "Teleport To Shadow Creep"
      card.setDescription("Move target to any unoccupied friendly Shadow Creep.")
      card.setFollowupConditions([SpellFollowupTeleport.followupConditionTargetToTeleport])
      card.setFXResource(["FX.Cards.Spell.FollowupTeleport"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.FollowupTeleportNearMyGeneral)
      card = new SpellFollowupTeleportNearMyGeneral(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupTeleportNearMyGeneral
      card.name = "Teleport Near Your General"
      card.setDescription("Move target to any unoccupied space near your General.")
      card.setFollowupConditions([SpellFollowupTeleport.followupConditionTargetToTeleport])
      card.setFXResource(["FX.Cards.Spell.FollowupTeleport"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.SpellDuplicator)
      card = new SpellDuplicator(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellDuplicator
      card.name = "Shuffle 3 copies of a minion into your deck"
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.FestiveSpirit)
      card = new SpellApplyPlayerModifiers(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FestiveSpirit
      card.name = "Festive Spirit"
      card.setDescription("Snowchasers are on their way with Frostfire gifts!")
      card.applyToOwnGeneral = true
      card.setTargetModifiersContextObjects([GameSessionModifierFestiveSpirit.createContextObject()])
      card.setFXResource(["FX.Cards.Spell.FestiveSpirit"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_naturalselection.audio
      )

    if (identifier == Cards.Spell.FollowupSpawnEntityFromDeck)
      card = new SpellFollowupSpawnEntityFromDeck(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.FollowupSpawnEntityFromDeck
      card.spellFilterType = SpellFilterType.SpawnSource
      card.name = "Spawn a minion from your deck"
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    if (identifier == Cards.Spell.SpellDamageOrHeal)
      card = new SpellDamageOrHeal(gameSession)
      card.factionId = Factions.Neutral
      card.setIsHiddenInCollection(true)
      card.id = Cards.Spell.SpellDamageOrHeal
      card.name = "Deal 2 damage to an enemy or heal 2 to an ally"
      card.manaCost = 0
      card.setFXResource(["FX.Cards.Spell.ApplyModifiers"])
      card.setBaseSoundResource(
        apply : RSX.sfx_spell_tranquility.audio
      )

    return card

module.exports = CardFactory_Generic
