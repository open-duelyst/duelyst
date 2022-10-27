
# lookups
NewPlayerProgressionStageEnum = require './newPlayerProgressionStageEnum'
NewPlayerFeatureLookup = require './newPlayerProgressionFeatureLookup'

# quests
QuestBeginnerWinPracticeGames = require 'app/sdk/quests/questBeginnerWinPracticeGames'
QuestBeginnerPlayPracticeGames = require 'app/sdk/quests/questBeginnerPlayPracticeGames'
QuestBeginnerCompleteSoloChallenges = require 'app/sdk/quests/questBeginnerCompleteSoloChallenges'
QuestBeginnerPlayOneQuickMatch = require 'app/sdk/quests/questBeginnerPlayOneQuickMatch'
QuestBeginnerFactionLevel = require 'app/sdk/quests/questBeginnerFactionLevel'
QuestBeginnerWinFourPracticeGames = require 'app/sdk/quests/questBeginnerWinFourPracticeGames'
QuestBeginnerWinThreeQuickMatches = require 'app/sdk/quests/questBeginnerWinThreeQuickMatches'
QuestBeginnerWinThreeRankedMatches = require 'app/sdk/quests/questBeginnerWinThreeRankedMatches'
QuestBeginnerWinTwoPracticeGames = require 'app/sdk/quests/questBeginnerWinTwoPracticeGames'
QuestBeginnerWinOneSeasonGame = require 'app/sdk/quests/questBeginnerWinOneSeasonGame'

class NewPlayerProgression

  @featureToCoreStageMapping:{}

  @FinalStage: NewPlayerProgressionStageEnum.FirstFactionLevelingDone
  @DailyQuestsStartToGenerateStage: NewPlayerProgressionStageEnum.FirstGameDone
  @FirstWinOfTheDayAvailableStage: NewPlayerProgressionStageEnum.FirstGameDone

  ###*
  # Check if a feature is available at a certain stage in new player guided progression.
  # @param  feature    Number(NewPlayerFeatureLookup)      Which feature.
  # @param  stage    Enum(NewPlayerProgressionStageEnum)    Which stage.
  # @returns         Boolean    Is it available.
  ###
  @isFeatureAvailableAtStage: (feature,stage)->
    # make sure to cast any stringts to enum
    stage = NewPlayerProgressionStageEnum[stage]
    stageWhenFeatureIsAvailable = NewPlayerProgression.featureToCoreStageMapping[feature]

    if !stageWhenFeatureIsAvailable?
      return true

    # return if the current stage is greater or equal to the stage when this feature becomes available
    return stage.value >= stageWhenFeatureIsAvailable.value

  ###*
  # Get quests for the current stage in new user guided progression.
  # @returns     Array    array of quest object instances.
  ###
  @questsForStage: (stage)->
    stage = NewPlayerProgressionStageEnum[stage]
    switch stage
      when NewPlayerProgressionStageEnum.TutorialDone
        return [ new QuestBeginnerWinPracticeGames() ]
      when NewPlayerProgressionStageEnum.FirstPracticeDuelDone
        return [ new QuestBeginnerWinTwoPracticeGames() ]
      when NewPlayerProgressionStageEnum.ExtendedPracticeDone
        return [ new QuestBeginnerWinOneSeasonGame() ]
      when NewPlayerProgressionStageEnum.FirstGameDone
        return [ new QuestBeginnerCompleteSoloChallenges(), new QuestBeginnerFactionLevel() ]

# feature to stage mapping
fMap = NewPlayerProgression.featureToCoreStageMapping
# main menu
fMap[NewPlayerFeatureLookup.MainMenuCollection] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.MainMenuWatch] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.MainMenuCodex] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.MainMenuCrates] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.MainMenuSpiritOrbs] = NewPlayerProgressionStageEnum.TutorialDone
# utility menu
fMap[NewPlayerFeatureLookup.UtilityMenuFriends] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuQuests] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuShop] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuDailyChallenge] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuFreeCardOfTheDay] = NewPlayerProgressionStageEnum.TutorialDone
# play modes
fMap[NewPlayerFeatureLookup.PlayModeFriendly] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModePractice] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModeSoloChallenges] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModeBossBattle] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModeCasual] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModeRanked] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModeGauntlet] = NewPlayerProgressionStageEnum.TutorialDone
# misc
fMap[NewPlayerFeatureLookup.FirstWinOfTheDay] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.Announcements] = NewPlayerProgressionStageEnum.TutorialDone

module.exports = NewPlayerProgression
