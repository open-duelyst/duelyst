class Achievement

  @id: null # lookup id for achievement
  @title: null # player visible title of achievement
  @description: null # player visible description of achievement
  @progressRequired: null # integer of how many sub completions are required to finish achievement
  # NOTE: rewards can only be of one type (cards, gold, spirit, booster,etc) for now due to UI
  @rewards: undefined # object representing rewards
  # example rewards:
#    gauntletTicket: 1
#    gold: 100
#    spirit: 100
#    spiritOrb: 1
  @enabled: true


  constructor: () ->
    # No need initialize this object

  # returns the amount of progress made by completing a given quest ID
  @progressForCompletingQuestId: (questId) ->
    # Extend in subclass

  # returns how much progress is made for completing the passed in game data
  @progressForGameDataForPlayerId: (gameData,playerId,isUnscored,isDraw) ->
    # Extend in subclass

  # returns how much progress is made by crafting the passed in cardId
  @progressForCrafting: (cardId) ->
    # extend in subclass

  # returns how much progress is made by disenchanting the passed in cardId
  @progressForDisenchanting: (cardId) ->
    # extend in subclass

  # returns how much progress is made by owning the passed in card collection
  @progressForCardCollection: (cardCollection, allCards) ->
    # extend in subclass

  # returns progress made by achieving the passed in rank
  @progressForAchievingRank: (rank) ->
    # extend in subclass

  # returns progress made by performing armory transaction
  @progressForArmoryTransaction: (armoryTransactionSku) ->
    # extend in subclass

  # returns progress made by a referral program event
  @progressForReferralEvent: (referralEventType)->
    # extend in subclass

  # returns progress made by reaching a state of faction progression
  @progressForFactionProgression: (factionProgressionData) ->
    # extend in subclass

  # returns progress made by receiving a loot crate
  @progressForReceivingCosmeticChest: (cosmeticChestType) ->
    # extend in subclass

  # returns progress made by logging in at a time
  @progressForLoggingIn: (currentLoginMoment) ->
    # extend in subclass

  # returns when a login achievement begins as a moment
  @getLoginAchievementStartsMoment: () ->
    # extend in subclass
    return null

  # returns a user facing string for how to unlock rewards
  @rewardUnlockMessage: (progressMade) ->
    # extend in subclass
    return ""

  # returns progress made by opening spirit orb
  @progressForOpeningSpiritOrb: (orbSet) ->
    # extend in subclass


  @getId:()->
    return @id

  @getTitle:()->
    return @title

  @getDescription:()->
    return @description

  @getRewards:()->
    return @rewards



module.exports = Achievement
