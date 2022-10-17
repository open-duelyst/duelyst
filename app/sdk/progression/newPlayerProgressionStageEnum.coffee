Enum = require 'enum'

stages = new Enum([

  # # per concept progression
  # 'Inactive',
  # 'Unread',
  # 'Read',

  # core progression
  'Tutorial',
  'TutorialDone', # FirstPracticeDuel
  'FirstPracticeDuelDone', # ExtendedPractice
  'ExtendedPracticeDone', # SoloChallenges
  'FirstGameDone', # FirstFactionLeveling
#  'SoloChallengesDone', # ... intermediate state
#  'FirstCodexUnlockDone', # ... # TODO: this doesnt seem like a core module stage
  'FirstFactionLevelingDone', # CustomDeck
#   'CustomDeckWinDone', # FirstRanked
#   'FirstRankedDone', # GauntletGames
#  'GauntletGamesDone', # ...

  # skipped everything is always last
  'Skipped',

])

module.exports = stages
