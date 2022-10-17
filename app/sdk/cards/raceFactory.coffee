
Races = require './racesLookup'
i18next = require 'i18next'

class RaceFactory

  @raceForIdentifier: (identifier) ->
    race = null

    if identifier == Races.Neutral
      race =
        name: ""

    if identifier == Races.Golem
      race =
        name: i18next.t("races.golem")

    if identifier == Races.Arcanyst
      race =
        name: i18next.t("races.arcanyst")

    if identifier == Races.Dervish
      race =
        name: i18next.t("races.dervish")

    if identifier == Races.Mech
      race =
        name: i18next.t("races.mech")

    if identifier == Races.Vespyr
      race =
        name: i18next.t("races.vespyr")

    if identifier == Races.Structure
      race =
        name: i18next.t("races.structure")

    if identifier == Races.BattlePet
      race =
        name: i18next.t("races.battle_pet")

    # no faction found
    if race
      return race
    else
      console.error "RaceFactory.raceForIdentifier - Unknown race identifier: #{identifier}".red

module.exports = RaceFactory
