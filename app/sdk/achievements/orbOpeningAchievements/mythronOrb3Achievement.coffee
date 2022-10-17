Achievement = require 'app/sdk/achievements/achievement'
CardSet = require 'app/sdk/cards/cardSetLookup'
i18next = require('i18next')

class MythronOrb3Achievement extends Achievement
  @id: "mythron3"
  @title: "Third Trial"
  @description: "You've opened 21 Mythron Orbs, here's a brand new Mythron card. You'll get another after opening 10 more orbs."
  @progressRequired: 21
  @rewards:
    mythronCard: 1

  @progressForOpeningSpiritOrb: (orbSet) ->
    if (orbSet == CardSet.Coreshatter)
      return 1
    else
      return 0

module.exports = MythronOrb3Achievement
