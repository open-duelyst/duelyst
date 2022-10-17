Achievement = require 'app/sdk/achievements/achievement'
CardSet = require 'app/sdk/cards/cardSetLookup'
i18next = require('i18next')

class MythronOrb7Achievement extends Achievement
  @id: "mythron7"
  @title: "Seventh Trial"
  @description: "You've opened 61 Mythron Orbs, here's a brand new Mythron card."
  @progressRequired: 61
  @rewards:
    mythronCard: 1

  @progressForOpeningSpiritOrb: (orbSet) ->
    if (orbSet == CardSet.Coreshatter)
      return 1
    else
      return 0

module.exports = MythronOrb7Achievement
