class GameFormat

  @Standard: 0
  @Legacy: 1

  @isLegacyFormat: (type) ->
    return type == GameFormat.Legacy

module.exports = GameFormat
