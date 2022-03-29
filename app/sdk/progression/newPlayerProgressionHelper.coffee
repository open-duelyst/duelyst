
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
	# @param	feature		Number(NewPlayerFeatureLookup)			Which feature.
	# @param	stage		Enum(NewPlayerProgressionStageEnum)		Which stage.
	# @returns 				Boolean		Is it available.
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
	# @returns 		Array		array of quest object instances.
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
fMap[NewPlayerFeatureLookup.MainMenuWatch] = NewPlayerProgressionStageEnum.FirstGameDone
fMap[NewPlayerFeatureLookup.MainMenuCodex] = NewPlayerProgressionStageEnum.FirstGameDone
fMap[NewPlayerFeatureLookup.MainMenuCrates] = NewPlayerProgressionStageEnum.FirstGameDone
fMap[NewPlayerFeatureLookup.MainMenuSpiritOrbs] = NewPlayerProgressionStageEnum.TutorialDone
# utility menu
fMap[NewPlayerFeatureLookup.UtilityMenuFriends] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuQuests] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuShop] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.UtilityMenuDailyChallenge] = NewPlayerProgressionStageEnum.ExtendedPracticeDone
fMap[NewPlayerFeatureLookup.UtilityMenuFreeCardOfTheDay] = NewPlayerProgressionStageEnum.ExtendedPracticeDone
# play modes
fMap[NewPlayerFeatureLookup.PlayModeFriendly] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModePractice] = NewPlayerProgressionStageEnum.TutorialDone
fMap[NewPlayerFeatureLookup.PlayModeSoloChallenges] = NewPlayerProgressionStageEnum.FirstGameDone
fMap[NewPlayerFeatureLookup.PlayModeBossBattle] = NewPlayerProgressionStageEnum.FirstGameDone
fMap[NewPlayerFeatureLookup.PlayModeCasual] = NewPlayerProgressionStageEnum.ExtendedPracticeDone
fMap[NewPlayerFeatureLookup.PlayModeRanked] = NewPlayerProgressionStageEnum.ExtendedPracticeDone
fMap[NewPlayerFeatureLookup.PlayModeGauntlet] = NewPlayerProgressionStageEnum.FirstFactionLevelingDone
# misc
fMap[NewPlayerFeatureLookup.FirstWinOfTheDay] = NewPlayerProgressionStageEnum.FirstGameDone
fMap[NewPlayerFeatureLookup.Announcements] = NewPlayerProgressionStageEnum.FirstGameDone

module.exports = NewPlayerProgression
