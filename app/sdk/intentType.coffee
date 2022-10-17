class IntentType

  @NeutralIntent:1 # use when nothing else fits or intent should not be entirely clear
  @DamageIntent:2
  @HealIntent:3
  @BuffIntent:4
  @NerfIntent:5
  @MoveIntent:6
  @DeckIntent:7
  @GameIntent:8 # game action such as ending turn
  @InspectIntent:9

  @getIsAggroIntentType: (intentType) ->
    # general check for aggresive intent types
    return intentType == IntentType.DamageIntent or intentType == IntentType.NerfIntent

  @getIsAssistIntentType: (intentType) ->
    # general check for helpful intent types
    return intentType == IntentType.HealIntent or intentType == IntentType.BuffIntent

module.exports = IntentType
