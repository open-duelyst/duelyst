class FXType

  ###
    Units
  ###
  # one time fx when unit spawns
  @UnitSpawnFX: "UnitSpawnFX"
  # one time fx when unit dies
  @UnitDiedFX: "UnitDiedFX"
  # one time fx on a unit's explicit attack only (ex: blast should only show a single fire beam, but will not show for strikeback)
  @UnitPrimaryAttackedFX: "UnitPrimaryAttackedFX"
  # fx shown each time a unit makes an attack
  @UnitAttackedFX: "UnitAttackedFX"
  # one time fx when unit is damaged
  @UnitDamagedFX: "UnitDamagedFX"
  # one time fx when unit is healed
  @UnitHealedFX: "UnitHealedFX"

  ###
    Spells
  ###
  # one time fx where spell is cast
  @SpellCastFX: "SpellCastFX"
  # pre-cast fx at each position spell does ANYTHING
  @SpellAutoFX: "SpellAutoFX"
  # one time fx at each position spell does ANYTHING
  @SpellAppliedFX: "SpellAppliedFX"
  # one time fx at each position spell does ANYTHING to friendly units
  # TODO: disabled temporarily
  #@SpellAppliedFriendFX: "SpellAppliedFriendFX"
  # one time fx at each position spell does ANYTHING to enemy units
  # TODO: disabled temporarily
  #@SpellAppliedEnemyFX: "SpellAppliedEnemyFX"
  # one time fx at each position spell damages or kills
  # TODO: disabled temporarily
  #@SpellDamagedFX: "SpellDamagedFX"
  # one time fx at each position spell heals
  # TODO: disabled temporarily
  #@SpellHealedFX: "SpellHealedFX"

  ###
    Artifacts
  ###
  # one time fx where artifact is applied
  @ArtifactAppliedFX: "ArtifactAppliedFX"
  # continuous fx on entity artifact applied to
  @ArtifactFX: "ArtifactFX"

  ###
    Modifiers
  ###
  # persistent fx to altered unit
  @ModifierFX: "ModifierFX"
  # one time fx to altered unit when modifier applied
  @ModifierAppliedFX: "ModifierAppliedFX"
  # one time fx when modifier triggers
  @ModifierTriggeredFX: "ModifierTriggeredFX"
  # one time fx to source of a modifier when it triggers
  @ModifierTriggeredSourceFX: "ModifierTriggeredSourceFX"
  # one time fx to target of a modifier when it triggers
  @ModifierTriggeredTargetFX: "ModifierTriggeredTargetFX"
  # one time fx to removed unit when modifier removed
  @ModifierRemovedFX: "ModifierRemovedFX"

  ###
    Actions (not usually used)
  ###
  # one time fx for any action at the source position to target position
  @GameFX: "GameFX"
  # one time fx for any action at the source position
  @SourceFX: "SourceFX"
  # one time fx for any action at the target position
  @TargetFX: "TargetFX"
  # teleport type actions show at source of movement before moving
  @MoveSourceFX: "MoveSourceFX"
  # teleport type actions show at target of movement after moving
  @MoveTargetFX: "MoveTargetFX"
  # teleport type actions show moving from source to target
  @MoveFX: "MoveFX"

module.exports = FXType
