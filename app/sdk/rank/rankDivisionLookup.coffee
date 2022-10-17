class RankDivisionLookup

  # Do not change key names!
  # Any changes to user facing names should be done in rank factory
  # From here on these should remain untouched:
  # any reference to a division for an internal asset name should use RankFactory.rankedDivisionAssetNameForRank
  # any user facing reference to a division should use RankFactory.rankedDivisionNameForRank
  @Bronze: 30
  @Silver: 20
  @Gold: 10
  @Diamond: 5
  @Elite: 0

module.exports = RankDivisionLookup
