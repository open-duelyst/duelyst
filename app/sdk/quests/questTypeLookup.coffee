class QuestType

  ###*
  # Use this flag to exclude a quest from getting generated.
  # @public
  ###
  @Promotional: -5
  @Seasonal: -4
  @CatchUp: -3
  @Beginner: -2
  @ExcludeFromSystem: -1

  @Participation: 0
  @Win:           1
  @Social:         2
  @Challenge:     3

  @ShortQuest:     101
  @LongQuest:     102

module.exports = QuestType
