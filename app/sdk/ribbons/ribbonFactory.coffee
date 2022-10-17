_ = require 'underscore'
RSX = require('app/data/resources')
Ribbons = require './ribbonLookup'

class RibbonFactory

  @ribbons: {}

  @ribbonForIdentifier: (identifier) ->
    ribbon = @ribbons[identifier]
    if ribbon
      return ribbon
    else
      # no emote found
      console.error "RibbonFactory.ribbonForIdentifier - Unknown ribbon identifier: #{identifier}".red
      return undefined

# setup ribbon data
RibbonFactory.ribbons[Ribbons.LyonarChampion] = {
  id: Ribbons.LyonarChampion
  enabled: true
  rsx: RSX.ribbon_f1_champion
  title: "Lyonar Champion"
  description: "100 Lyonar wins."
}
RibbonFactory.ribbons[Ribbons.SonghaiChampion] = {
  id: Ribbons.SonghaiChampion
  enabled: true
  rsx: RSX.ribbon_f2_champion
  title: "Songhai Champion"
  description: "100 Songhai wins."
}
RibbonFactory.ribbons[Ribbons.VetruvianChampion] = {
  id: Ribbons.VetruvianChampion
  enabled: true
  rsx: RSX.ribbon_f3_champion
  title: "Vetruvian Champion"
  description: "100 Vetruvian wins."
}
RibbonFactory.ribbons[Ribbons.AbyssianChampion] = {
  id: Ribbons.AbyssianChampion
  enabled: true
  rsx: RSX.ribbon_f4_champion
  title: "Abyssian Champion"
  description: "100 Abyssian wins."
}
RibbonFactory.ribbons[Ribbons.MagmarChampion] = {
  id: Ribbons.MagmarChampion
  enabled: true
  rsx: RSX.ribbon_f5_champion
  title: "Magmar Champion"
  description: "100 Magmar wins."
}
RibbonFactory.ribbons[Ribbons.VanarChampion] = {
  id: Ribbons.VanarChampion
  enabled: true
  rsx: RSX.ribbon_f6_champion
  title: "Vanar Champion"
  description: "100 Vanar wins."
}
RibbonFactory.ribbons[Ribbons.TournamentWinner] = {
  id: Ribbons.TournamentWinner
  enabled: true
  rsx: RSX.ribbon_tournament_winner
  title: "Tournament Winner"
  description: "Sanctioned Tournament Winner."
}

module.exports = RibbonFactory
