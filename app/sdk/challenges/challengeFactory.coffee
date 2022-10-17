_ = require 'underscore'
Cards = require 'app/sdk/cards/cardsLookupComplete'

ChallengeCategory = require './challengeCategory'

Sandbox = require './sandbox'
SandboxDeveloper = require './sandboxDeveloper'
Lesson1 = require './tutorial/lesson1'
Lesson2 = require './tutorial/lesson2'
Lesson4 = require './tutorial/lesson4'
BeginnerLyonarChallenge1 = require './lyonar/BeginnerLyonarChallenge1'
BeginnerLyonarChallenge2 = require './lyonar/BeginnerLyonarChallenge2'
BeginnerRangedChallenge1 = require './tutorial/BeginnerRangedChallenge1'
BeginnerFlyingChallenge1 = require './tutorial/BeginnerFlyingChallenge1'
BeginnerVanarChallenge1 = require './vanar/BeginnerVanarChallenge1'
BeginnerAbyssianChallenge1 = require './abyssian/BeginnerAbyssianChallenge1'
BeginnerMagmarChallenge1 = require './magmar/BeginnerMagmarChallenge1'
BeginnerVetruvianChallenge1 = require './vetruvian/BeginnerVetruvianChallenge1'
BeginnerMagmarChallenge2 = require './magmar/BeginnerMagmarChallenge2'
BeginnerAbyssianChallenge2 = require './abyssian/BeginnerAbyssianChallenge2'
BeginnerSonghaiChallenge1 = require './songhai/BeginnerSonghaiChallenge1'
MediumMagmarChallenge1 = require './magmar/MediumMagmarChallenge1'
MediumAbyssianChallenge1 = require './abyssian/MediumAbyssianChallenge1'
BeginnerSonghaiChallenge2 = require './songhai/BeginnerSonghaiChallenge2'
BeginnerVanarChallenge2 = require './vanar/BeginnerVanarChallenge2'
BeginnerAbyssianChallenge3 = require './abyssian/BeginnerAbyssianChallenge3'
BeginnerVetruvianChallenge2 = require './vetruvian/BeginnerVetruvianChallenge2'
BeginnerVanarChallenge3 = require './vanar/BeginnerVanarChallenge3'
BeginnerSonghaiChallenge3 = require './songhai/BeginnerSonghaiChallenge3'
BeginnerLyonarChallenge3 = require './lyonar/BeginnerLyonarChallenge3'
MediumSonghaiChallenge1 = require './songhai/MediumSonghaiChallenge1'
MediumVetruvianChallenge1 = require './vetruvian/MediumVetruvianChallenge1'
BeginnerSonghaiChallenge4 = require './songhai/BeginnerSonghaiChallenge4'
BeginnerVetruvianChallenge3 = require './vetruvian/BeginnerVetruvianChallenge3'
BeginnerAbyssianChallenge4 = require './abyssian/BeginnerAbyssianChallenge4'
BeginnerMagmarChallenge3 = require './magmar/BeginnerMagmarChallenge3'
BeginnerVanarChallenge4 = require './vanar/BeginnerVanarChallenge4'
AdvancedLyonarChallenge1 = require './lyonar/AdvancedLyonarChallenge1'
AdvancedSonghaiChallenge1 = require './songhai/AdvancedSonghaiChallenge1'
AdvancedVetruvianChallenge1 = require './vetruvian/AdvancedVetruvianChallenge1'
AdvancedAbyssianChallenge1 = require './abyssian/AdvancedAbyssianChallenge1'
AdvancedMagmarChallenge1 = require './magmar/AdvancedMagmarChallenge1'
AdvancedVanarChallenge1 = require './vanar/AdvancedVanarChallenge1'
BeginnerAbyssianChallenge5 = require './abyssian/BeginnerAbyssianChallenge5'
BeginnerVetruvianChallenge4 = require './vetruvian/BeginnerVetruvianChallenge4'
BeginnerMagmarChallenge4 = require './magmar/BeginnerMagmarChallenge4'
AdvancedVanarChallenge2 = require './vanar/AdvancedVanarChallenge2'
MediumVetruvianChallenge2 = require './vetruvian/MediumVetruvianChallenge2'
MediumSonghaiChallenge2 = require './songhai/MediumSonghaiChallenge2'
AdvancedVetruvianChallenge2 = require './vetruvian/AdvancedVetruvianChallenge2'
AdvancedLyonarChallenge2 = require './lyonar/AdvancedLyonarChallenge2'
BeginnerSonghaiChallenge5 = require './songhai/BeginnerSonghaiChallenge5'
BeginnerVetruvianChallenge5 = require './vetruvian/BeginnerVetruvianChallenge5'
BeginnerAbyssianChallenge6 = require './abyssian/BeginnerAbyssianChallenge6'
BeginnerVanarChallenge5 = require './vanar/BeginnerVanarChallenge5'
BeginnerLyonarChallenge4 = require './lyonar/BeginnerLyonarChallenge4'

class ChallengeFactory

  @challengeForType: (type) ->
    if type == Sandbox.type
      return new Sandbox()

    if type == SandboxDeveloper.type
      return new SandboxDeveloper()

    # Find any matching tutorial lesson
    matchingTutorialChallenge = _.find(@getAllChallenges(),(challenge) ->
      return challenge.type == type
    )
    if matchingTutorialChallenge?
      return matchingTutorialChallenge

    # no challenge found
    console.error "ChallengeFactory.challengeForType - Unknown type: #{type}".red

  @getAllChallenges: () ->
    return [
      new Lesson1(), #Knowledge is Power
      new Lesson2(), #Ready Player Two
      new Lesson4(), #The Artifact Itself

      #keywords Elemental Secrets
      new BeginnerFlyingChallenge1(), #Earn Your Wings
      new BeginnerSonghaiChallenge4(), # Leaf on the Wind
      new BeginnerVetruvianChallenge3(), #Call to Action
      new BeginnerAbyssianChallenge4(), #Creeping Darkness
      new BeginnerMagmarChallenge3(), #Crushing Reach

      #beginner2 Form of Focus
      new BeginnerAbyssianChallenge1(), #Shadow Ritual
      new BeginnerSonghaiChallenge5(), #Eye of the Tiger
      new BeginnerMagmarChallenge1(), #Beast of War
      new BeginnerVetruvianChallenge1(), #Ready for a Blast
      new BeginnerLyonarChallenge2(), #Divine Zeal

      #starter Path of Champions
      new BeginnerVetruvianChallenge5(), #Ties that Bind
      new BeginnerAbyssianChallenge6(), #Alluring Demise
      new BeginnerVanarChallenge5(), #Behind Enemy Lines
      new BeginnerLyonarChallenge4(), #Honor the Fallen
      new BeginnerSonghaiChallenge2(), #Path of the Mistwalkers

      #beginner The Realm of Dreams
      new BeginnerLyonarChallenge1(), #Swiftness of Movement
      new BeginnerAbyssianChallenge5(), #Gifts Unforgiven
      new BeginnerMagmarChallenge4(), #Shattered Memories
      new BeginnerVetruvianChallenge4(), #Bad to the Bone
      new BeginnerVanarChallenge4(), #Approaching Cold

      #advanced The Vault of Generations
      new BeginnerVanarChallenge2(), #Frozen Shadows
      new MediumVetruvianChallenge2(), #Winds of Change
      new BeginnerRangedChallenge1(), #Dead Center
      new BeginnerAbyssianChallenge3(), #Power Overwhelming
      new BeginnerSonghaiChallenge1(), #Evolution to Ash

      #expert Trials of the Seven Stars
      new BeginnerAbyssianChallenge2(), #Engulf the Flame
      new BeginnerMagmarChallenge2(), #Breaking the Bad
      new BeginnerVanarChallenge3(), #Final Whispers
      new BeginnerVetruvianChallenge2(), #Relics Reclaimed
      new AdvancedLyonarChallenge2(), #Inspiring Presence

      ##vault1 Adeptus Gate
      new MediumSonghaiChallenge1(), #Songhai Shuffle
      new BeginnerVanarChallenge1(), #Freezing Sand
      new MediumMagmarChallenge1(), #In a Frenzy
      new MediumAbyssianChallenge1(), #Shadows of Light
      new AdvancedVetruvianChallenge2(), #Wishful Thinking

      ##vault2 Sacred Path of Aperion
      new MediumVetruvianChallenge1(), #Knowledge of the Scions
      new BeginnerSonghaiChallenge3(), #Chaos Control
      new BeginnerLyonarChallenge3(), #Power of Wisdom
      new AdvancedVanarChallenge2(), #Ice Box
      new MediumSonghaiChallenge2(), #Jack of Blades

      #contest1 Tacticians Contest
      new AdvancedLyonarChallenge1(), #Desperation
      new AdvancedSonghaiChallenge1(), #The Stronger Scythe
      new AdvancedVetruvianChallenge1(), #Patience

      #contest2 Contest of Grandmasters
      new AdvancedAbyssianChallenge1(), #Malediction
      new AdvancedMagmarChallenge1(), #Mind Game
      new AdvancedVanarChallenge1() #The Locked Library

      # sandbox
      new Sandbox()
      new SandboxDeveloper()
    ]

  @getAllChallengeCategories: () ->
    # TODO: kv search over cats
    # return [ChallengeCategory.tutorial, ChallengeCategory.keywords, ChallengeCategory.beginner2, ChallengeCategory.starter, ChallengeCategory.beginner, ChallengeCategory.advanced, ChallengeCategory.expert, ChallengeCategory.vault1, ChallengeCategory.vault2, ChallengeCategory.contest1, ChallengeCategory.contest2]
    return [ChallengeCategory.tutorial, ChallengeCategory.keywords, ChallengeCategory.beginner2, ChallengeCategory.starter, ChallengeCategory.beginner, ChallengeCategory.advanced, ChallengeCategory.expert]

  @getCategoryForType: (categoryType) ->
    return _.find(@getAllChallengeCategories(), (category) ->
      return category.type == categoryType
    )

  @getChallengesForCategoryType: (challengeCategoryType) ->
    allChallenges = @getAllChallenges()
    return _.filter(allChallenges, (challenge) ->
      return challenge.categoryType == challengeCategoryType
    )

  @getChallengeForType: (challengeType) ->
    return _.find(@getAllChallenges(), (challenge) ->
      return challenge.type == challengeType
    )

  @_challengeCardRewards: null # {Array} card ids to give user 3 copies of
  @_challengeGoldRewards: null # {integer} quantity of gold to give user
  @_challengeSpiritRewards: null # {integer} quantity of spirit to give user
  # {array} contains a quantity of booster packs to give the user, each element is the additional properties the booster should have, for a basic pack use {}
  @_challengeBoosterPackRewards: null

  @_buildChallengeRewards: () ->
    if @_challengeCardRewards && @_challengeGoldRewards
      return

    @_challengeCardRewards = {}
    @_challengeGoldRewards = {}
    @_challengeSpiritRewards = {}
    @_challengeBoosterPackRewards = {}

    ###
    # EXAMPLE rewards for a lesson
    # This will make MadeUpLesson give 3 True strikes, 3 dragon larks, 1000 gold, 1000 spirit and 2 normal booster packs
    @_challengeCardRewards[MadeUpLesson.type] = [Cards.Spell.TrueStrike, Cards.Neutral.SpottedDragonlark]
    @_challengeGoldRewards[MadeUpLesson.type] = 1000
    @_challengeSpiritRewards[MadeUpLesson.type] = 1000
    @_challengeBoosterPackRewards[MadeUpLesson.type] = [{},{}]
    ###

#    @_challengeGoldRewards[Lesson1.type] = 25
#
#    @_challengeGoldRewards[Lesson2.type] = 25
#
#    @_challengeGoldRewards[Lesson3.type] = 25
#
#    @_challengeGoldRewards[Lesson4.type] = 25

    @_challengeGoldRewards[BeginnerFlyingChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerSonghaiChallenge4.type] = 5
    @_challengeGoldRewards[BeginnerVetruvianChallenge3.type] = 10
    @_challengeGoldRewards[BeginnerAbyssianChallenge4.type] = 10
    @_challengeGoldRewards[BeginnerMagmarChallenge3.type] = 10

    @_challengeGoldRewards[BeginnerAbyssianChallenge1.type] = 10
    @_challengeGoldRewards[BeginnerSonghaiChallenge5.type] = 5
    @_challengeGoldRewards[BeginnerMagmarChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerVetruvianChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerLyonarChallenge2.type] = 10

    @_challengeGoldRewards[BeginnerVetruvianChallenge5.type] = 5
    @_challengeGoldRewards[BeginnerAbyssianChallenge6.type] = 5
    @_challengeGoldRewards[BeginnerVanarChallenge5.type] = 10
    @_challengeGoldRewards[BeginnerLyonarChallenge4.type] = 5
    @_challengeGoldRewards[BeginnerSonghaiChallenge2.type] = 10

    @_challengeGoldRewards[BeginnerLyonarChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerAbyssianChallenge5.type] = 10
    @_challengeGoldRewards[BeginnerMagmarChallenge4.type] = 5
    @_challengeGoldRewards[BeginnerVetruvianChallenge4.type] = 5
    @_challengeGoldRewards[BeginnerVanarChallenge4.type] = 10

    @_challengeGoldRewards[BeginnerVanarChallenge2.type] = 5
    @_challengeGoldRewards[MediumVetruvianChallenge2.type] = 5
    @_challengeGoldRewards[BeginnerRangedChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerAbyssianChallenge3.type] = 5
    @_challengeGoldRewards[BeginnerSonghaiChallenge1.type] = 5

    @_challengeGoldRewards[BeginnerAbyssianChallenge2.type] = 5
    @_challengeGoldRewards[BeginnerMagmarChallenge2.type] = 5
    @_challengeGoldRewards[BeginnerVanarChallenge3.type] = 5
    @_challengeGoldRewards[BeginnerVetruvianChallenge2.type] = 5
    @_challengeGoldRewards[AdvancedLyonarChallenge2.type] = 5

    @_challengeGoldRewards[MediumSonghaiChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerVanarChallenge1.type] = 5
    @_challengeGoldRewards[MediumMagmarChallenge1.type] = 5
    @_challengeGoldRewards[MediumAbyssianChallenge1.type] = 5
    @_challengeGoldRewards[AdvancedVetruvianChallenge2.type] = 5

    @_challengeGoldRewards[MediumVetruvianChallenge1.type] = 5
    @_challengeGoldRewards[BeginnerSonghaiChallenge3.type] = 5
    @_challengeGoldRewards[BeginnerLyonarChallenge3.type] = 5
    @_challengeGoldRewards[AdvancedVanarChallenge2.type] = 5
    @_challengeGoldRewards[MediumSonghaiChallenge2.type] = 5

    @_challengeGoldRewards[AdvancedLyonarChallenge1.type] = 5
    @_challengeGoldRewards[AdvancedSonghaiChallenge1.type] = 5
    @_challengeGoldRewards[AdvancedVetruvianChallenge1.type] = 5

    @_challengeGoldRewards[AdvancedAbyssianChallenge1.type] = 5
    @_challengeGoldRewards[AdvancedMagmarChallenge1.type] = 5
    @_challengeGoldRewards[AdvancedVanarChallenge1.type] = 5


  @getCardIdsRewardedForChallengeType: (type) ->
    @_buildChallengeRewards()
    return _.clone(@_challengeCardRewards[type])

  @getGoldRewardedForChallengeType: (type) ->
    @_buildChallengeRewards()
    return @_challengeGoldRewards[type]

  @getSpiritRewardedForChallengeType: (type) ->
    @_buildChallengeRewards()
    return @_challengeSpiritRewards[type]

  @getBoosterPacksRewardedForChallengeType: (type) ->
    @_buildChallengeRewards()
    return _.clone(@_challengeBoosterPackRewards[type])

  @getFactionUnlockedRewardedForChallengeType: (type)->
    # end of tutorial unlocks Lyonar faction
    if type == Lesson4.type
      return 1

  @getRewardsObjectForChallengeType: (type) ->
    return {
      goldReward: @getGoldRewardedForChallengeType(type)
      cardRewards: @getCardIdsRewardedForChallengeType(type)
      spiritReward: @getSpiritRewardedForChallengeType(type)
      boosterPackRewards: @getBoosterPacksRewardedForChallengeType(type)
      factionsUnlockedRewards: @getFactionUnlockedRewardedForChallengeType(type)
    }


module.exports = ChallengeFactory
