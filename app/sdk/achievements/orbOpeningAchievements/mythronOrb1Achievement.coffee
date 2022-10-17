Achievement = require 'app/sdk/achievements/achievement'
CardSet = require 'app/sdk/cards/cardSetLookup'
i18next = require('i18next')

class MythronOrb1Achievement extends Achievement
  @id: "mythron1"
  @title: "First Trial"
  @description: "You've opened 1 Mythron Orb, here's a brand new Mythron card. You'll get another after opening 10 more orbs."
  @progressRequired: 1
  @rewards:
    mythronCard: 1

  @progressForOpeningSpiritOrb: (orbSet) ->
    if (orbSet == CardSet.Coreshatter)
      return 1
    else
      return 0

module.exports = MythronOrb1Achievement
