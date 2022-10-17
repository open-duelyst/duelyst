
RankDivisionLookup = require './rankDivisionLookup'
_ = require 'underscore'
i18next = require 'i18next'

class RankFactory

  ###*
  # Determines the RankDivisionLookup key for a given rank
  # @public
  # @param  {Integer}  rankValue  The rank value for which return the name.
  # @return  {String}        RankDivisionLookup Key
  ###
  @rankedDivisionKeyForRank: (rank) ->
    lowestRankKey = null
    lowestRankValue = null

    for rankKey,rankValue of RankDivisionLookup
      if rank <= rankValue
        if !lowestRankValue? or rankValue < lowestRankValue
          lowestRankKey = rankKey
          lowestRankValue = rankValue

    if !lowestRankKey?
      console.error "RankedDivisionFactory.rankedDivisionKeyForRank - Failed to find division for rank: #{rank}".red
    else
      return lowestRankKey

  ###*
  # Division name for the provided rank key. (Provides buffer between rank keys and visible names)
  # @private
  # @param  {String}  rankKey  a RankDivisionLookup key
  # @return  {String}        Division Name
  ###
  @_rankedDivisionNameForRankKey: (rankKey) ->
    return i18next.t("rank.#{rankKey.toLowerCase()}_division_name")

    # if rankKey == "Bronze"
    #   return "Bronze"
    # else if rankKey == "Silver"
    #   return "Silver"
    # else if rankKey == "Gold"
    #   return "Gold"
    # else if rankKey == "Diamond"
    #   return "Diamond"
    # else if rankKey == "Elite"
    #   return "S-Rank"
    # else
    #   console.error "RankedDivisionFactory.rankedDivisionNameForRankKey - Unidentified rankKey provided: #{rankKey}".red

  ###*
  # Division name for the current rank value.
  # @public
  # @param  {Integer}  rankValue  The rank value for which return the name.
  # @return  {String}        Division Name
  ###
  @rankedDivisionNameForRank: (rank) ->
    divisionKey = @rankedDivisionKeyForRank(rank)

    if !divisionKey?
      console.error "RankedDivisionFactory.rankedDivisionForRank - Failed to find division for rank: #{rank}".red
    else
      return @_rankedDivisionNameForRankKey(divisionKey)

  ###*
  # Division asset name for the provided rank key, used in retrieving assets, css class names, etc
  # @private
  # @param  {String}  rankKey  The rank value for which return the name.
  # @return  {String}        Division's asset name
  ###
  @_rankedDivisionAssetNameForRankKey: (rankKey) ->
    if rankKey == "Bronze"
      return "bronze"
    else if rankKey == "Silver"
      return "silver"
    else if rankKey == "Gold"
      return "gold"
    else if rankKey == "Diamond"
      return "diamond"
    else if rankKey == "Elite"
      return "elite"
    else
      console.error "RankedDivisionFactory._rankedDivisionAssetNameForRankKey - Unidentified rankKey provided: #{rankKey}".red

  ###*
  # Division asset name for the provided rank value
  # @public
  # @param  {String}  rankKey  a RankDivisionLookup key
  # @return  {String}        Division Name
  ###
  @rankedDivisionAssetNameForRank: (rank) ->
    divisionKey = @rankedDivisionKeyForRank(rank)

    if !divisionKey?
      console.error "RankedDivisionFactory.rankedDivisionAssetNameForRank - Failed to find division for rank: #{rank}".red
    else
      return @_rankedDivisionAssetNameForRankKey(divisionKey)

  ###*
  # Can the current rank lose stars? Ranks 30-21 can NOT lose stars, and you can not drop out of your division.
  # @public
  # @param  {Integer}  rankValue  The rank for which to return the number of needed stars.
  # @param  {Integer}  stars    How many stars does the user have.
  # @return  {Boolean}        Can the user lose stars?
  ###
  @canLoseStars: (rank,stars=0) ->

    if (rank > RankDivisionLookup.Silver)
      return false
    else if stars == 0
      name = @.rankedDivisionKeyForRank(rank)
      nameIfStarsLost = @.rankedDivisionKeyForRank(rank+1)
      if name != nameIfStarsLost
        return false
      else
        return true
    else
      return true

  ###*
  # Are win streaks enabled for a specific rank?
  # @public
  # @param  {Integer}  rankValue  The rank.
  # @return  {Boolean}
  ###
  @areWinStreaksEnabled: (rank) ->

    if (rank <= 30 and rank >= 26)
      return false
    else if (rank <= 5 and rank >= 0)
      return false
    else
      return true

  ###*
  # Calculate and return the number of stars needed to advance a rank.
  # @public
  # @param  {Integer}  rankValue  The rank for which to return the number of needed stars.
  # @return  {Integer}        The number of stars needed.
  ###
  @starsNeededToAdvanceRank: (rankValue) ->

    if rankValue > 25
      return 1
    else if rankValue > 20
      return 2
    else if rankValue > 15
      return 3
    else if rankValue > 10
      return 4
    else if rankValue > 5
      return 5
    else if rankValue > 0
      return 5
    else
      return undefined

  ###*
  # Calculate and return the total number of stars needed to advance to a rank.
  # @public
  # @param  {Integer}  rankValue  The rank for which to return the number of needed stars.
  # @return  {Integer}        The number of stars needed.
  ###
  @totalStarsRequiredForRank: (rank)->
    if rank > 30
      throw new Error("Minimum rank is 30")

    totalStars = 0

    for i in [30...rank]
      stars = RankFactory.starsNeededToAdvanceRank(i)
      if stars?
        totalStars += stars

    return totalStars



  ###*
  # Calculate the new ranking based on last season's ranking
  # @public
  # @param  {Integer}  rankValue  The previous season's ranking.
  # @return  {Object}        Object with two properties rank and stars.
  ###
  @rankForNewSeason: (rank) ->

    newRank = 30
    newStars = 0

    awardedStars = RankFactory.chevronsRewardedForReachingRank(rank)

    # Give user chevrons/ranks

    if awardedStars
      currentRank = 30
      remainingRewardedStars = awardedStars

      # Loop over the rewarded stars until player no longer has enough to rank up
      while remainingRewardedStars >= RankFactory.starsNeededToAdvanceRank(currentRank)
        remainingRewardedStars -= RankFactory.starsNeededToAdvanceRank(currentRank)
        currentRank--

      # rename for readability
      newRank = currentRank
      newStars = remainingRewardedStars

    return {
      rank:newRank
      stars:newStars
    }




  ###*
  # Update raw rank data based on a game outcome.
  # @public
  # @param  {Object}  rankData  The rank for which to return updated rank data. This value will not be modified.
  # @param  {Boolean}  isWinner  Are we updating for a win?
  # @param  {Boolean}  isDraw    Are we updating for a draw?
  # @return  {Object}        The updated rank data.
  ###
  @updateRankDataWithGameOutcome: (rankDataIn,isWinner,isDraw) ->

    rankData = _.clone(rankDataIn)

    if (rankData)

      rankData.top_rank ?= 30

      rankData.delta =
        stars:0
        rank:0

      if isDraw

        # do nothing

      else if isWinner

        # rank 0 is kumite and does not need any cycling
        if rankData.rank > 0
          rankData.is_unread = true

          starsWon = 1

          # win streaks begin at rank 20
          if RankFactory.areWinStreaksEnabled(rankData.rank)
            unless rankData.win_streak
              rankData.win_streak = 0
            rankData.win_streak = parseInt(rankData.win_streak) + 1
            if (rankData.win_streak >= 3)
              starsWon += 1

          rankData.delta.stars = starsWon
          rankData.stars += starsWon

          # determine stars needed to advance
          starsNeededToAdvance = RankFactory.starsNeededToAdvanceRank(rankData.rank)

          if (rankData.stars >= starsNeededToAdvance)
            rankData.rank = parseInt(rankData.rank)-1
            rankData.delta.rank = -1
            rankData.stars = rankData.stars - starsNeededToAdvance
            rankData.stars_required = RankFactory.starsNeededToAdvanceRank(rankData.rank) || 0

            if rankData.rank < rankData.top_rank
              rankData.top_rank = rankData.rank

        else

          # we've got a KUMITE rank player... no change in rank

      else

        # reset any win streak after a loss
        if rankData.win_streak > 0
          rankData.win_streak = 0
          rankData.is_unread = true

        # if greater than 20 rank, you can start LOSING stars
        if RankFactory.canLoseStars(rankData.rank,rankData.stars)

          # deduct stars if you have any to lose
          if rankData.stars > 0
            rankData.delta.stars = -1
            rankData.stars -= 1
          else if rankData.rank < 30 # otherwise drop a rank and set stars to full for the lower rank
            rankData.delta.rank = 1
            rankData.rank = parseInt(rankData.rank)+1
            starsNeededToAdvancePreviousRank = RankFactory.starsNeededToAdvanceRank(rankData.rank)
            rankData.stars = starsNeededToAdvancePreviousRank
            rankData.stars_required = starsNeededToAdvancePreviousRank

    # update ranking
    return rankData

  ###*
  # Returns the number of chevrons gained at the end of season for reaching the passed in top rank
  # @param  {Integer}  rank    The top rank achieved
  # @return  {Integer}          The number of chevrons to reward the player
  #
  ###
  @chevronsRewardedForReachingRank: (rank) ->
    # Bonus chevrons
    # If user was rank 5 or lower, they get enough chevrons to be rank 11
    if rank <= 5
      return RankFactory.totalStarsRequiredForRank(11)

    # Otherwise it is linear based on rank
    chevrons = Math.max(28-rank,0)
    if rank == 28
      chevrons = 1
    return chevrons

  ###*
  # Returns whether or not a player will get rewards for reaching the top rank provided
  # @param  {Integer}  topRank      The top rank achieved
  # @param  {Integer}  seasonKey    The season rank was achieved in (irrelevant for now)
  # @return  {boolean}              Whether or not the player will receive rewards
  #
  ###
  @willGetRewardsForReachingRank: (topRank, seasonKey) ->
    # Right now season key is irrelevant
    return topRank <= 20

  ###*
  # Simple exctract rank / primary metric out of matchmaking metric for a ranked queue.
  # @public
  # @param  {Integer}  metric    The matchmaking metric.
  # @return  {Integer}        The rank / primary metric value.
  ###
  @primaryValueForMatchmakingMetric: (metric)->

    metricInt = parseInt(metric)

    if not metricInt
      throw new Error("Invalid metric input value")

    secondMetric = RankFactory.secondaryValueForMatchmakingMetric(metric)
    firstMetric = (metricInt + secondMetric) / 10

    return firstMetric

  ###*
  # Simple exctract secondary metric out of matchmaking metric for a ranked queue.
  # @public
  # @param  {Integer}  metric    The matchmaking metric.
  # @return  {Integer}        The secondary metric value.
  ###
  @secondaryValueForMatchmakingMetric: (metric)->

    metricInt = parseInt(metric)

    if not metricInt
      throw new Error("Invalid metric input value")

    secondMetric = 10-metricInt%10

    return secondMetric

module.exports = RankFactory
