# Enum for the different types of Analytics Event Priority
# Lower numbers are lower priority, actual interger values are arbitrary


class AnalyticsEventPriority

  @Critical: 5
  @High: 4
  @Medium: 3
  @Low: 2
  @Optional: 1


module.exports = AnalyticsEventPriority
